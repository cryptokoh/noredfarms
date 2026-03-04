// Kanban API Edge Function
// Single endpoint with action-based routing
// Deploy: supabase functions deploy kanban-api --project-ref uqyfsqenjakqyzixfcta

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ApiRequest {
  action: string;
  api_key: string;
  [key: string]: unknown;
}

async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: ApiRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { action, api_key } = body;
  if (!action) return json({ error: "Missing action" }, 400);
  if (!api_key) return json({ error: "Missing api_key" }, 401);

  // --- Auth ---
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const keyHash = await hashKey(api_key);

  const { data: keyRow, error: keyErr } = await sb
    .from("kanban_api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .eq("active", true)
    .single();

  if (keyErr || !keyRow) {
    return json({ error: "Invalid or inactive API key" }, 401);
  }

  // Update last_used_at
  await sb
    .from("kanban_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id);

  const perms: string[] = keyRow.permissions || [];
  const canRead = perms.includes("read");
  const canWrite = perms.includes("write");

  // --- Route actions ---
  try {
    switch (action) {
      // ---- READ actions ----
      case "list_boards": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const { data, error } = await sb
          .from("kanban_boards")
          .select("*")
          .order("position");
        if (error) throw error;
        return json({ boards: data });
      }

      case "get_board": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const boardId = body.board_id as string;
        if (!boardId) return json({ error: "Missing board_id" }, 400);

        const { data: board, error: bErr } = await sb
          .from("kanban_boards")
          .select("*")
          .eq("id", boardId)
          .single();
        if (bErr) throw bErr;

        const { data: tasks, error: tErr } = await sb
          .from("kanban_tasks")
          .select("*")
          .eq("board_id", boardId)
          .order("position");
        if (tErr) throw tErr;

        return json({ board, tasks });
      }

      case "get_task": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);

        const { data, error } = await sb
          .from("kanban_tasks")
          .select("*")
          .eq("id", taskId)
          .single();
        if (error) throw error;

        const { data: activity } = await sb
          .from("kanban_activity")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false })
          .limit(20);

        return json({ task: data, activity: activity || [] });
      }

      case "search_tasks": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const query = body.query as string;
        const boardId = body.board_id as string;
        if (!query) return json({ error: "Missing query" }, 400);

        let q = sb
          .from("kanban_tasks")
          .select("*")
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order("updated_at", { ascending: false })
          .limit(50);

        if (boardId) q = q.eq("board_id", boardId);

        const { data, error } = await q;
        if (error) throw error;
        return json({ tasks: data });
      }

      case "get_my_tasks": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const assignee = body.assignee as string;
        if (!assignee) return json({ error: "Missing assignee" }, 400);

        const { data, error } = await sb
          .from("kanban_tasks")
          .select("*")
          .eq("assigned_to", assignee)
          .neq("column_name", "done")
          .order("priority")
          .order("due_date");
        if (error) throw error;
        return json({ tasks: data });
      }

      case "get_overdue": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await sb
          .from("kanban_tasks")
          .select("*")
          .lt("due_date", today)
          .neq("column_name", "done")
          .order("due_date");
        if (error) throw error;
        return json({ tasks: data });
      }

      case "get_stats": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const boardId = body.board_id as string;

        let q = sb.from("kanban_tasks").select("id, column_name, priority, due_date, assigned_to, estimated_hours, actual_hours");
        if (boardId) q = q.eq("board_id", boardId);

        const { data, error } = await q;
        if (error) throw error;

        const tasks = data || [];
        const today = new Date().toISOString().split("T")[0];

        return json({
          stats: {
            total: tasks.length,
            by_column: {
              backlog: tasks.filter((t) => t.column_name === "backlog").length,
              todo: tasks.filter((t) => t.column_name === "todo").length,
              "in-progress": tasks.filter((t) => t.column_name === "in-progress").length,
              done: tasks.filter((t) => t.column_name === "done").length,
            },
            by_priority: {
              urgent: tasks.filter((t) => t.priority === "urgent").length,
              high: tasks.filter((t) => t.priority === "high").length,
              medium: tasks.filter((t) => t.priority === "medium").length,
              low: tasks.filter((t) => t.priority === "low").length,
            },
            overdue: tasks.filter((t) => t.due_date && t.due_date < today && t.column_name !== "done").length,
            total_estimated_hours: tasks.reduce((s, t) => s + (t.estimated_hours || 0), 0),
            total_actual_hours: tasks.reduce((s, t) => s + (t.actual_hours || 0), 0),
          },
        });
      }

      // ---- WRITE actions ----
      case "create_task": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const boardId = body.board_id as string;
        const title = body.title as string;
        if (!boardId || !title) return json({ error: "Missing board_id or title" }, 400);

        // Get next position
        const { data: existing } = await sb
          .from("kanban_tasks")
          .select("position")
          .eq("board_id", boardId)
          .eq("column_name", (body.column_name as string) || "todo")
          .order("position", { ascending: false })
          .limit(1);

        const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 0;

        const payload: Record<string, unknown> = {
          board_id: boardId,
          title,
          column_name: (body.column_name as string) || "todo",
          position: nextPos,
          priority: (body.priority as string) || "medium",
          description: body.description || null,
          assigned_to: body.assigned_to || null,
          due_date: body.due_date || null,
          labels: body.labels || [],
          subtasks: body.subtasks || [],
          tags: body.tags || [],
          metadata: body.metadata || {},
          source: keyRow.agent_name || "api",
          estimated_hours: body.estimated_hours || null,
          blocked_by: body.blocked_by || [],
          created_by: keyRow.agent_name || "api",
        };

        const { data, error } = await sb
          .from("kanban_tasks")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;

        // Log activity
        await sb.from("kanban_activity").insert({
          task_id: data.id,
          board_id: boardId,
          user_name: keyRow.agent_name || "api",
          action_type: "create",
          metadata: { title, source: "api" },
        });

        return json({ task: data });
      }

      case "update_task": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);

        const fields = [
          "title", "description", "priority", "assigned_to", "due_date",
          "labels", "subtasks", "tags", "metadata", "estimated_hours",
          "actual_hours", "blocked_by",
        ];
        const update: Record<string, unknown> = {};
        for (const f of fields) {
          if (body[f] !== undefined) update[f] = body[f];
        }

        if (Object.keys(update).length === 0) {
          return json({ error: "No fields to update" }, 400);
        }

        const { data, error } = await sb
          .from("kanban_tasks")
          .update(update)
          .eq("id", taskId)
          .select()
          .single();
        if (error) throw error;

        await sb.from("kanban_activity").insert({
          task_id: taskId,
          board_id: data.board_id,
          user_name: keyRow.agent_name || "api",
          action_type: "update",
          metadata: { fields: Object.keys(update), source: "api" },
        });

        return json({ task: data });
      }

      case "move_task": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        const column = body.column_name as string;
        if (!taskId || !column) return json({ error: "Missing task_id or column_name" }, 400);

        const validColumns = ["backlog", "todo", "in-progress", "done"];
        if (!validColumns.includes(column)) {
          return json({ error: "Invalid column_name" }, 400);
        }

        // Get current task
        const { data: current } = await sb
          .from("kanban_tasks")
          .select("column_name, board_id")
          .eq("id", taskId)
          .single();

        // Get next position in target column
        const { data: colTasks } = await sb
          .from("kanban_tasks")
          .select("position")
          .eq("board_id", current?.board_id)
          .eq("column_name", column)
          .order("position", { ascending: false })
          .limit(1);

        const nextPos = colTasks && colTasks.length > 0 ? colTasks[0].position + 1 : 0;

        const { data, error } = await sb
          .from("kanban_tasks")
          .update({ column_name: column, position: nextPos })
          .eq("id", taskId)
          .select()
          .single();
        if (error) throw error;

        await sb.from("kanban_activity").insert({
          task_id: taskId,
          board_id: data.board_id,
          user_name: keyRow.agent_name || "api",
          action_type: "move",
          metadata: { from: current?.column_name, to: column, source: "api" },
        });

        return json({ task: data });
      }

      case "delete_task": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);

        const { error } = await sb
          .from("kanban_tasks")
          .delete()
          .eq("id", taskId);
        if (error) throw error;

        return json({ deleted: true, task_id: taskId });
      }

      case "add_comment": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        const content = body.content as string;
        if (!taskId || !content) return json({ error: "Missing task_id or content" }, 400);

        // Get task's board_id
        const { data: task } = await sb
          .from("kanban_tasks")
          .select("board_id")
          .eq("id", taskId)
          .single();

        const { data, error } = await sb
          .from("kanban_activity")
          .insert({
            task_id: taskId,
            board_id: task?.board_id,
            user_name: keyRow.agent_name || "api",
            action_type: "comment",
            content,
            metadata: { source: "api" },
          })
          .select()
          .single();
        if (error) throw error;

        return json({ comment: data });
      }

      case "bulk_create": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const boardId = body.board_id as string;
        const taskList = body.tasks as Array<Record<string, unknown>>;
        if (!boardId || !taskList || !Array.isArray(taskList)) {
          return json({ error: "Missing board_id or tasks array" }, 400);
        }

        const results = [];
        for (let i = 0; i < taskList.length; i++) {
          const t = taskList[i];
          const { data, error } = await sb
            .from("kanban_tasks")
            .insert({
              board_id: boardId,
              title: t.title,
              column_name: (t.column_name as string) || "todo",
              position: i,
              priority: (t.priority as string) || "medium",
              description: t.description || null,
              assigned_to: t.assigned_to || null,
              due_date: t.due_date || null,
              labels: t.labels || [],
              tags: t.tags || [],
              metadata: t.metadata || {},
              source: keyRow.agent_name || "api",
              estimated_hours: t.estimated_hours || null,
              created_by: keyRow.agent_name || "api",
            })
            .select()
            .single();
          if (error) throw error;
          results.push(data);
        }

        return json({ tasks: results, count: results.length });
      }

      case "bulk_update": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const updates = body.updates as Array<{ task_id: string; [key: string]: unknown }>;
        if (!updates || !Array.isArray(updates)) {
          return json({ error: "Missing updates array" }, 400);
        }

        const results = [];
        for (const u of updates) {
          const { task_id, ...fields } = u;
          const { data, error } = await sb
            .from("kanban_tasks")
            .update(fields)
            .eq("id", task_id)
            .select()
            .single();
          if (error) throw error;
          results.push(data);
        }

        return json({ tasks: results, count: results.length });
      }

      // ---- VERSIONING: READ actions ----
      case "get_task_versions": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);
        const limit = (body.limit as number) || 50;

        const { data, error } = await sb
          .from("kanban_task_versions")
          .select("*")
          .eq("task_id", taskId)
          .order("version", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return json({ versions: data });
      }

      case "get_branch_status": {
        if (!canRead) return json({ error: "No read permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);

        const { data: branch, error: brErr } = await sb
          .from("kanban_task_branches")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (brErr) throw brErr;

        let reviews: unknown[] = [];
        if (branch) {
          const { data: revData } = await sb
            .from("kanban_reviews")
            .select("*")
            .eq("branch_id", branch.id)
            .order("created_at", { ascending: false });
          reviews = revData || [];
        }

        return json({ branch, reviews });
      }

      // ---- VERSIONING: WRITE actions ----
      case "rollback_task": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        const version = body.version as number;
        if (!taskId || version === undefined)
          return json({ error: "Missing task_id or version" }, 400);

        const { data, error } = await sb.rpc("rollback_task_to_version", {
          p_task_id: taskId,
          p_version: version,
        });
        if (error) throw error;

        // Log activity
        const taskData = typeof data === "string" ? JSON.parse(data) : data;
        await sb.from("kanban_activity").insert({
          task_id: taskId,
          board_id: taskData?.board_id,
          user_name: keyRow.agent_name || "api",
          action_type: "rollback",
          metadata: { to_version: version, source: "api" },
        });

        return json({ task: taskData, rolled_back_to: version });
      }

      case "create_branch": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);

        // Get task to build branch name
        const { data: task, error: tErr } = await sb
          .from("kanban_tasks")
          .select("id, title, board_id, metadata")
          .eq("id", taskId)
          .single();
        if (tErr) throw tErr;

        const baseBranch = (body.base_branch as string) || "master";
        const slug = task.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40);
        const branchName = `task/${taskId.slice(0, 8)}-${slug}`;

        const { data: branch, error: brErr } = await sb
          .from("kanban_task_branches")
          .insert({
            task_id: taskId,
            board_id: task.board_id,
            branch_name: branchName,
            base_branch: baseBranch,
            status: "created",
            created_by: keyRow.agent_name || "api",
          })
          .select()
          .single();
        if (brErr) throw brErr;

        // Update task metadata.git
        const meta = task.metadata || {};
        meta.git = {
          branch: branchName,
          branch_id: branch.id,
          status: "created",
        };
        await sb
          .from("kanban_tasks")
          .update({ metadata: meta })
          .eq("id", taskId);

        return json({ branch });
      }

      case "update_branch": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const taskId = body.task_id as string;
        if (!taskId) return json({ error: "Missing task_id" }, 400);

        // Find latest branch for this task
        const { data: existing, error: findErr } = await sb
          .from("kanban_task_branches")
          .select("id, task_id, status")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (findErr) throw findErr;

        const branchUpdate: Record<string, unknown> = {};
        const branchFields = [
          "head_commit", "status", "pr_number", "pr_url",
          "pr_status", "commit_count", "merge_commit", "merged_at",
        ];
        for (const f of branchFields) {
          if (body[f] !== undefined) branchUpdate[f] = body[f];
        }

        if (Object.keys(branchUpdate).length === 0) {
          return json({ error: "No fields to update" }, 400);
        }

        const { data: branch, error: upErr } = await sb
          .from("kanban_task_branches")
          .update(branchUpdate)
          .eq("id", existing.id)
          .select()
          .single();
        if (upErr) throw upErr;

        // Sync status back to task metadata.git
        if (branchUpdate.status || branchUpdate.pr_url) {
          const { data: task } = await sb
            .from("kanban_tasks")
            .select("metadata")
            .eq("id", taskId)
            .single();
          const meta = (task?.metadata as Record<string, unknown>) || {};
          const git = (meta.git as Record<string, unknown>) || {};
          if (branchUpdate.status) git.status = branchUpdate.status;
          if (branchUpdate.pr_url) git.pr_url = branchUpdate.pr_url;
          meta.git = git;
          await sb
            .from("kanban_tasks")
            .update({ metadata: meta })
            .eq("id", taskId);
        }

        return json({ branch });
      }

      case "submit_review": {
        if (!canWrite) return json({ error: "No write permission" }, 403);
        const branchId = body.branch_id as string;
        const reviewer = body.reviewer as string || keyRow.agent_name || "api";
        const status = body.status as string;
        if (!branchId || !status)
          return json({ error: "Missing branch_id or status" }, 400);

        const validStatuses = ["pending", "approved", "changes_requested", "commented"];
        if (!validStatuses.includes(status)) {
          return json({ error: "Invalid status" }, 400);
        }

        // Get task_id from branch
        const { data: branch, error: brErr } = await sb
          .from("kanban_task_branches")
          .select("task_id")
          .eq("id", branchId)
          .single();
        if (brErr) throw brErr;

        const { data: review, error: revErr } = await sb
          .from("kanban_reviews")
          .insert({
            branch_id: branchId,
            task_id: branch.task_id,
            reviewer,
            status,
            comment: (body.comment as string) || null,
            diff_summary: (body.diff_summary as string) || null,
          })
          .select()
          .single();
        if (revErr) throw revErr;

        // Update branch pr_status if approved
        if (status === "approved") {
          await sb
            .from("kanban_task_branches")
            .update({ pr_status: "approved" })
            .eq("id", branchId);
        }

        return json({ review });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Action ${action} failed:`, message);
    return json({ error: message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
