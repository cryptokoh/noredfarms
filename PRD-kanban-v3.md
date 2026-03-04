# Nored Farms Kanban v3 - PRD
**High-Level Product Requirements Document**

## Current State

- Vanilla JS + Supabase + SortableJS
- 8 boards (Web Dev, E-commerce, Content, Social, SEO, Marketing, Ops, Compliance)
- 4 columns: Backlog / To Do / In Progress / Done
- Features: drag-drop, filters, subtasks, labels, activity feed, dark mode, WIP limits
- Auth: simple name+password (steph, koh, c)
- Schema: boards, tasks, activity tables in Supabase

## Vision

A kanban system that is both beautiful for humans and programmable for AI agents. The board becomes the single source of truth for what needs to happen across the business, and agents can read/write/act on it.

---

## Part 1: Make It Amazing

### 1.1 Real-Time Collaboration
- **Supabase Realtime subscriptions** on tasks + activity tables
- Live card movement (see others drag cards)
- Presence indicators (who's viewing which board)
- Typing indicators in comment box

### 1.2 Views Beyond Columns
- **Timeline/Gantt view**: tasks on a horizontal timeline by due date
- **Calendar view**: tasks laid out on a monthly calendar
- **List view**: dense table view with sortable columns
- **My Tasks view**: filtered view of everything assigned to you across all boards
- View switcher in toolbar (icons: columns, list, calendar, timeline)

### 1.3 Card Enhancements
- **Rich descriptions**: Markdown support with preview
- **File attachments**: upload to Supabase Storage, display inline
- **@mentions** in comments and descriptions
- **Card cover images**: optional colored banner or image at top of card
- **Checklists** (multiple named checklists per card, not just one subtask list)
- **Time tracking**: start/stop timer per card, total time logged
- **Card dependencies**: "blocked by" relationships shown visually
- **Recurring tasks**: auto-recreate when completed (daily/weekly/monthly)

### 1.4 Board Enhancements
- **Custom columns**: add/rename/reorder/delete columns per board
- **Swimlanes**: group cards by assignee, priority, or label within columns
- **Board templates**: create boards from templates (Sprint, Marketing Campaign, etc.)
- **Board archiving**: archive completed boards, restore later
- **Bulk actions**: multi-select cards, move/assign/label in batch

### 1.5 Analytics & Insights
- **Burndown chart**: tasks remaining over time per board
- **Cycle time tracking**: how long cards spend in each column
- **Throughput chart**: tasks completed per week
- **Team workload**: distribution of tasks across assignees
- **Overdue dashboard**: all overdue tasks across all boards

### 1.6 Automation Rules
- Simple "when/then" rules per board:
  - When card moves to Done -> assign next card from Backlog
  - When card is overdue -> move priority to Urgent
  - When card assigned -> send notification
  - When all subtasks done -> move card to Done
- Rules stored as JSON in `kanban_boards.automations` column

### 1.7 UX Polish
- **Keyboard navigation**: arrow keys to move between cards, Enter to open
- **Command palette** (Cmd+K): search tasks, switch boards, create task, run actions
- **Drag to select** multiple cards
- **Undo/redo** for recent actions (toast with "Undo" button)
- **Offline support**: queue changes when offline, sync when back
- **Notification system**: in-app + optional email/push for mentions, assignments, due dates

---

## Part 2: Agent-Ready Architecture

### 2.1 Supabase Edge Functions API

Create a REST API layer via Supabase Edge Functions that agents can call directly.

**Endpoints:**

```
POST   /functions/v1/kanban-api
```

Single endpoint, action-based routing via JSON body:

```json
{
  "action": "create_task",
  "api_key": "agent-key-xxx",
  "data": {
    "board": "web-dev",
    "title": "Fix mobile nav z-index",
    "description": "Nav overlaps kanban header on iOS Safari",
    "column": "todo",
    "priority": "high",
    "assigned_to": "koh",
    "labels": ["blue"],
    "due_date": "2026-03-05"
  }
}
```

**Actions:**

| Action | Description |
|--------|-------------|
| `list_boards` | Get all boards with task counts |
| `get_board` | Get board by slug with all tasks |
| `create_task` | Create task on a board |
| `update_task` | Update task fields |
| `move_task` | Move task to column + position |
| `delete_task` | Delete a task |
| `search_tasks` | Full-text search across boards |
| `get_task` | Get single task with activity |
| `add_comment` | Add comment to a task |
| `bulk_create` | Create multiple tasks at once |
| `bulk_update` | Update multiple tasks at once |
| `get_my_tasks` | All tasks for an assignee across boards |
| `get_overdue` | All overdue tasks |
| `get_stats` | Board/project analytics |
| `run_automation` | Trigger an automation rule |

### 2.2 Agent Authentication

```sql
create table kanban_api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  agent_name text not null,         -- 'claude', 'cron-bot', 'github-bot'
  permissions text[] default '{}',  -- ['read', 'write', 'admin']
  created_by text not null,
  active boolean default true,
  last_used_at timestamptz,
  created_at timestamptz default now()
);
```

- API keys per agent with scoped permissions
- Activity log shows which agent performed actions
- Rate limiting per key (prevent runaway agents)

### 2.3 MCP Server Integration

Build an MCP (Model Context Protocol) server so Claude Code can interact with the kanban directly:

**Tools exposed via MCP:**

```
kanban_list_boards()
kanban_get_board(slug)
kanban_create_task(board_slug, title, priority, ...)
kanban_update_task(task_id, fields)
kanban_move_task(task_id, column)
kanban_search(query)
kanban_add_comment(task_id, text)
kanban_get_my_tasks(assignee)
kanban_get_stats(board_slug?)
```

This lets Claude Code directly:
- Check what needs to be done before starting work
- Create tasks when discovering issues
- Move tasks to "In Progress" when starting
- Add comments with progress updates
- Move to "Done" when finished
- Log blockers and dependencies

### 2.4 Webhook System

```sql
create table kanban_webhooks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references kanban_boards(id),
  event_types text[] not null,  -- ['task.created', 'task.moved', 'task.completed']
  url text not null,
  secret text not null,
  active boolean default true,
  created_at timestamptz default now()
);
```

**Events:**
- `task.created`, `task.updated`, `task.moved`, `task.completed`, `task.deleted`
- `comment.added`
- `board.updated`

Payload includes full task data + diff of what changed.

Use cases:
- GitHub bot: auto-create PR when task moves to In Progress
- Slack bot: post to channel when tasks complete
- AI agent: trigger analysis when new tasks appear

### 2.5 Structured Task Metadata

Extend task schema for agent consumption:

```sql
alter table kanban_tasks add column if not exists metadata jsonb default '{}';
alter table kanban_tasks add column if not exists source text default 'human';
alter table kanban_tasks add column if not exists blocked_by uuid[];
alter table kanban_tasks add column if not exists estimated_hours numeric;
alter table kanban_tasks add column if not exists actual_hours numeric;
alter table kanban_tasks add column if not exists tags text[] default '{}';
```

Metadata field for agent-specific context:
```json
{
  "agent_context": "Found during mobile audit - iOS Safari specific",
  "file_references": ["kanban-styles.css:1411", "kanban.html:111"],
  "related_pr": "https://github.com/...",
  "acceptance_criteria": ["Nav doesn't overlap on iPhone 14", "Works in landscape"],
  "ai_summary": "CSS z-index conflict between nav and kanban header"
}
```

### 2.6 Natural Language Interface

A lightweight NL parser (can be an Edge Function calling Claude API) that converts plain English to kanban actions:

```
"add a high priority task to web-dev: fix the mobile nav"
-> create_task(board="web-dev", title="Fix the mobile nav", priority="high")

"what's overdue?"
-> get_overdue()

"move the favicon task to in progress and assign to koh"
-> update_task(title_match="favicon", column="in-progress", assigned_to="koh")

"show me koh's tasks across all boards"
-> get_my_tasks(assignee="koh")
```

Exposed as a chat widget on the kanban page and via MCP.

---

## Part 3: Implementation Phases

### Phase 1: Foundation (Agent API + Real-Time)
1. Supabase Edge Function API (all CRUD actions)
2. API key auth system
3. Supabase Realtime subscriptions on frontend
4. Schema additions (metadata, source, blocked_by, tags)
5. Webhook table + trigger system

### Phase 2: MCP Server + Enhanced Cards
1. MCP server (Node.js) wrapping the Edge Function API
2. Markdown descriptions with preview
3. File attachments (Supabase Storage)
4. Card dependencies (blocked_by visualization)
5. Time tracking (start/stop/log)

### Phase 3: Views + Automation
1. List view
2. Calendar view
3. My Tasks view
4. Automation rules engine
5. Command palette (Cmd+K)

### Phase 4: Analytics + NL Interface
1. Burndown + cycle time charts
2. Team workload dashboard
3. Natural language chat widget
4. Recurring tasks
5. Bulk operations

### Phase 5: Polish + Scale
1. Offline support (service worker + sync queue)
2. Custom columns per board
3. Board templates
4. Keyboard navigation overhaul
5. Notification system

---

## Tech Stack Decisions

| Component | Choice | Rationale |
|-----------|--------|-----------|
| API | Supabase Edge Functions (Deno) | Zero infra, same platform as DB |
| MCP Server | Node.js standalone | Runs locally with Claude Code |
| Real-time | Supabase Realtime | Already using Supabase |
| File storage | Supabase Storage | Same platform |
| Charts | Chart.js or Recharts | Lightweight, no React needed |
| Markdown | marked.js | Small, fast, well-supported |
| NL Parser | Claude API (Haiku) | Fast, cheap, accurate |
| Offline | Service Worker + IndexedDB | Standard progressive web app |

## Success Metrics

- **Agent adoption**: agents create/update 50%+ of tasks within 30 days
- **Real-time**: <500ms latency for cross-user updates
- **Mobile usability**: 95%+ Lighthouse accessibility score
- **Cycle time visibility**: team can see avg days per column
- **API reliability**: 99.9% uptime, <200ms p95 response time
