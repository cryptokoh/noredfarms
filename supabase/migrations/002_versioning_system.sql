-- ============================================
-- Kanban Versioning System Migration
-- Task version history, Git branch linking, review flow
-- Run in Supabase SQL Editor
-- ============================================

-- 1. Task Version History (automatic snapshots via trigger)
CREATE TABLE IF NOT EXISTS kanban_task_versions (
  id bigserial PRIMARY KEY,
  task_id uuid NOT NULL,
  board_id uuid NOT NULL,
  version integer NOT NULL,
  operation varchar(8) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  changed_by text,
  source text DEFAULT 'human',
  git_branch text,
  git_commit text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for version queries
CREATE INDEX idx_task_versions_task_version
  ON kanban_task_versions (task_id, version DESC);
CREATE INDEX idx_task_versions_board_created
  ON kanban_task_versions (board_id, created_at DESC);
CREATE INDEX idx_task_versions_created_at
  ON kanban_task_versions USING BRIN (created_at);
CREATE INDEX idx_task_versions_git_branch
  ON kanban_task_versions (git_branch) WHERE git_branch IS NOT NULL;

-- 2. Git Branch <-> Task Mapping
CREATE TABLE IF NOT EXISTS kanban_task_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  board_id uuid NOT NULL REFERENCES kanban_boards(id) ON DELETE CASCADE,
  branch_name text NOT NULL,
  base_branch text DEFAULT 'master',
  worktree_path text,
  head_commit text,
  base_commit text,
  merge_commit text,
  commit_count integer DEFAULT 0,
  pr_number integer,
  pr_url text,
  pr_status text DEFAULT 'none' CHECK (pr_status IN ('none', 'open', 'review', 'approved', 'merged', 'closed')),
  status text DEFAULT 'created' CHECK (status IN ('created', 'active', 'paused', 'review', 'merged', 'abandoned')),
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  merged_at timestamptz,
  UNIQUE(task_id, branch_name)
);

CREATE INDEX idx_task_branches_task ON kanban_task_branches (task_id);
CREATE INDEX idx_task_branches_status ON kanban_task_branches (status) WHERE status NOT IN ('merged', 'abandoned');

-- 3. Review Approvals
CREATE TABLE IF NOT EXISTS kanban_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES kanban_task_branches(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES kanban_tasks(id) ON DELETE CASCADE,
  reviewer text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested', 'commented')),
  comment text,
  diff_summary text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_branch ON kanban_reviews (branch_id);
CREATE INDEX idx_reviews_task ON kanban_reviews (task_id);

-- 4. Version capture trigger function
CREATE OR REPLACE FUNCTION capture_task_version()
RETURNS trigger AS $$
DECLARE
  v_version integer;
  v_task_id uuid;
  v_board_id uuid;
  v_changed text[];
  v_old_data jsonb;
  v_new_data jsonb;
  v_source text;
  v_git_branch text;
  k text;
BEGIN
  -- Determine task_id and board_id
  v_task_id := COALESCE(NEW.id, OLD.id);
  v_board_id := COALESCE(NEW.board_id, OLD.board_id);

  -- Get next version number for this task
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM kanban_task_versions
  WHERE task_id = v_task_id;

  -- Build JSONB snapshots
  IF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_source := OLD.source;
  ELSIF TG_OP = 'INSERT' THEN
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    v_source := NEW.source;
  ELSE
    -- UPDATE: detect changed fields via JSONB diff
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_source := NEW.source;
    v_changed := ARRAY[]::text[];

    FOR k IN SELECT jsonb_object_keys(v_new_data)
    LOOP
      -- Skip system fields that always change
      IF k IN ('updated_at') THEN
        CONTINUE;
      END IF;
      IF (v_old_data->k)::text IS DISTINCT FROM (v_new_data->k)::text THEN
        v_changed := array_append(v_changed, k);
      END IF;
    END LOOP;

    -- Skip if nothing meaningful changed (only updated_at)
    IF array_length(v_changed, 1) IS NULL OR array_length(v_changed, 1) = 0 THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
  END IF;

  -- Extract git branch from metadata if present
  IF TG_OP != 'DELETE' AND NEW.metadata IS NOT NULL THEN
    v_git_branch := NEW.metadata->'git'->>'branch';
  END IF;

  -- Insert version record
  INSERT INTO kanban_task_versions (
    task_id, board_id, version, operation,
    old_data, new_data, changed_fields,
    changed_by, source, git_branch
  ) VALUES (
    v_task_id, v_board_id, v_version, TG_OP,
    v_old_data, v_new_data, v_changed,
    COALESCE(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.created_by ELSE NEW.created_by END,
      'system'
    ),
    v_source, v_git_branch
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. Attach version capture trigger
DROP TRIGGER IF EXISTS kanban_tasks_version_trigger ON kanban_tasks;
CREATE TRIGGER kanban_tasks_version_trigger
  AFTER INSERT OR UPDATE OR DELETE ON kanban_tasks
  FOR EACH ROW EXECUTE FUNCTION capture_task_version();

-- 6. Rollback function: restore task to a previous version
CREATE OR REPLACE FUNCTION rollback_task_to_version(p_task_id uuid, p_version integer)
RETURNS jsonb AS $$
DECLARE
  v_snapshot jsonb;
  v_restore jsonb;
  v_result jsonb;
BEGIN
  -- Get the snapshot data from the target version
  SELECT new_data INTO v_snapshot
  FROM kanban_task_versions
  WHERE task_id = p_task_id AND version = p_version;

  IF v_snapshot IS NULL THEN
    RAISE EXCEPTION 'Version % not found for task %', p_version, p_task_id;
  END IF;

  -- Strip system fields that shouldn't be overwritten
  v_restore := v_snapshot - 'id' - 'created_at' - 'updated_at';

  -- Apply the snapshot back to the task row
  UPDATE kanban_tasks SET
    title = COALESCE(v_restore->>'title', title),
    description = v_restore->>'description',
    column_name = COALESCE(v_restore->>'column_name', column_name),
    position = COALESCE((v_restore->>'position')::integer, position),
    priority = COALESCE(v_restore->>'priority', priority),
    assigned_to = v_restore->>'assigned_to',
    due_date = (v_restore->>'due_date')::date,
    labels = COALESCE(
      (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(v_restore->'labels') AS elem),
      '{}'::text[]
    ),
    subtasks = COALESCE(v_restore->'subtasks', '[]'::jsonb),
    tags = COALESCE(
      (SELECT array_agg(elem::text) FROM jsonb_array_elements_text(v_restore->'tags') AS elem),
      '{}'::text[]
    ),
    metadata = COALESCE(v_restore->'metadata', '{}'::jsonb),
    source = COALESCE(v_restore->>'source', source),
    blocked_by = COALESCE(
      (SELECT array_agg(elem::uuid) FROM jsonb_array_elements_text(v_restore->'blocked_by') AS elem),
      '{}'::uuid[]
    ),
    estimated_hours = (v_restore->>'estimated_hours')::numeric,
    actual_hours = COALESCE((v_restore->>'actual_hours')::numeric, actual_hours)
  WHERE id = p_task_id
  RETURNING to_jsonb(kanban_tasks.*) INTO v_result;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Task % not found', p_task_id;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- 7. Auto-update updated_at on branches
CREATE OR REPLACE FUNCTION update_branch_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS kanban_branches_updated_at ON kanban_task_branches;
CREATE TRIGGER kanban_branches_updated_at
  BEFORE UPDATE ON kanban_task_branches
  FOR EACH ROW EXECUTE FUNCTION update_branch_timestamp();

-- 8. Enable realtime for versions
ALTER PUBLICATION supabase_realtime ADD TABLE kanban_task_versions;

-- 9. RLS policies
ALTER TABLE kanban_task_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_task_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read task_versions" ON kanban_task_versions FOR SELECT USING (true);
CREATE POLICY "Allow insert task_versions" ON kanban_task_versions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all task_branches" ON kanban_task_branches FOR ALL USING (true);
CREATE POLICY "Allow all reviews" ON kanban_reviews FOR ALL USING (true);
