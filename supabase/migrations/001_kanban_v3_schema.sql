-- ============================================
-- Kanban v3 Schema Migration
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to kanban_tasks
ALTER TABLE kanban_tasks
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'human',
  ADD COLUMN IF NOT EXISTS blocked_by uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS estimated_hours numeric,
  ADD COLUMN IF NOT EXISTS actual_hours numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. API Keys table (SHA-256 hashed keys)
CREATE TABLE IF NOT EXISTS kanban_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text NOT NULL UNIQUE,
  agent_name text NOT NULL,
  permissions text[] NOT NULL DEFAULT '{read}',
  rate_limit integer DEFAULT 60,
  created_by text,
  active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. Webhooks table
CREATE TABLE IF NOT EXISTS kanban_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid REFERENCES kanban_boards(id) ON DELETE CASCADE,
  event_types text[] NOT NULL DEFAULT '{task.created,task.updated,task.moved,task.deleted}',
  url text NOT NULL,
  secret text,
  active boolean DEFAULT true,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_tags ON kanban_tasks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_search ON kanban_tasks USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_blocked_by ON kanban_tasks USING GIN (blocked_by);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_source ON kanban_tasks (source);
CREATE INDEX IF NOT EXISTS idx_kanban_api_keys_hash ON kanban_api_keys (key_hash);

-- 5. Webhook notification trigger function
CREATE OR REPLACE FUNCTION notify_kanban_webhook()
RETURNS trigger AS $$
DECLARE
  webhook_row RECORD;
  event_type text;
  payload jsonb;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'task.created';
    payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.column_name IS DISTINCT FROM NEW.column_name THEN
      event_type := 'task.moved';
    ELSE
      event_type := 'task.updated';
    END IF;
    payload := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    event_type := 'task.deleted';
    payload := to_jsonb(OLD);
  END IF;

  -- Queue webhook calls (uses pg_notify for simplicity)
  PERFORM pg_notify('kanban_webhooks', json_build_object(
    'event', event_type,
    'board_id', COALESCE(NEW.board_id, OLD.board_id),
    'task_id', COALESCE(NEW.id, OLD.id),
    'payload', payload,
    'timestamp', now()
  )::text);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. Attach trigger to kanban_tasks
DROP TRIGGER IF EXISTS kanban_tasks_webhook_trigger ON kanban_tasks;
CREATE TRIGGER kanban_tasks_webhook_trigger
  AFTER INSERT OR UPDATE OR DELETE ON kanban_tasks
  FOR EACH ROW EXECUTE FUNCTION notify_kanban_webhook();

-- 7. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_activity;

-- 8. RLS policies for new tables
ALTER TABLE kanban_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_webhooks ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated/anon (Edge Function uses service role anyway)
CREATE POLICY "Allow read api_keys" ON kanban_api_keys FOR SELECT USING (true);
CREATE POLICY "Allow read webhooks" ON kanban_webhooks FOR SELECT USING (true);
CREATE POLICY "Allow insert webhooks" ON kanban_webhooks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update webhooks" ON kanban_webhooks FOR UPDATE USING (true);
