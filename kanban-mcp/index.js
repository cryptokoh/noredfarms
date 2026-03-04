#!/usr/bin/env node

/**
 * Kanban MCP Server - Nored Farms
 * Exposes 9 tools for managing kanban tasks via the Edge Function API.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.KANBAN_API_URL || "https://uqyfsqenjakqyzixfcta.supabase.co/functions/v1/kanban-api";
const API_KEY = process.env.KANBAN_API_KEY || "";

if (!API_KEY) {
  console.error("KANBAN_API_KEY environment variable is required");
  process.exit(1);
}

async function callApi(action, params = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, api_key: API_KEY, ...params }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }
  return data;
}

const server = new McpServer({
  name: "kanban",
  version: "1.0.0",
});

// 1. List boards
server.tool(
  "kanban_list_boards",
  "List all kanban boards",
  {},
  async () => {
    const result = await callApi("list_boards");
    return { content: [{ type: "text", text: JSON.stringify(result.boards, null, 2) }] };
  }
);

// 2. Get board with tasks
server.tool(
  "kanban_get_board",
  "Get a board and all its tasks",
  { board_id: z.string().describe("Board UUID") },
  async ({ board_id }) => {
    const result = await callApi("get_board", { board_id });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// 3. Create task
server.tool(
  "kanban_create_task",
  "Create a new task on a board",
  {
    board_id: z.string().describe("Board UUID"),
    title: z.string().describe("Task title"),
    description: z.string().optional().describe("Task description (supports markdown)"),
    column_name: z.enum(["backlog", "todo", "in-progress", "done"]).optional().default("todo").describe("Column"),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium").describe("Priority"),
    assigned_to: z.string().optional().describe("Assignee username"),
    due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
    tags: z.array(z.string()).optional().describe("Tags array"),
    estimated_hours: z.number().optional().describe("Estimated hours"),
    blocked_by: z.array(z.string()).optional().describe("Array of task UUIDs that block this task"),
  },
  async (params) => {
    const result = await callApi("create_task", params);
    return { content: [{ type: "text", text: JSON.stringify(result.task, null, 2) }] };
  }
);

// 4. Update task
server.tool(
  "kanban_update_task",
  "Update an existing task",
  {
    task_id: z.string().describe("Task UUID"),
    title: z.string().optional().describe("New title"),
    description: z.string().optional().describe("New description"),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("New priority"),
    assigned_to: z.string().optional().describe("New assignee"),
    due_date: z.string().optional().describe("New due date (YYYY-MM-DD)"),
    tags: z.array(z.string()).optional().describe("New tags"),
    estimated_hours: z.number().optional().describe("Estimated hours"),
    actual_hours: z.number().optional().describe("Actual hours"),
    blocked_by: z.array(z.string()).optional().describe("Blocker task UUIDs"),
  },
  async (params) => {
    const result = await callApi("update_task", params);
    return { content: [{ type: "text", text: JSON.stringify(result.task, null, 2) }] };
  }
);

// 5. Move task
server.tool(
  "kanban_move_task",
  "Move a task to a different column",
  {
    task_id: z.string().describe("Task UUID"),
    column_name: z.enum(["backlog", "todo", "in-progress", "done"]).describe("Target column"),
  },
  async (params) => {
    const result = await callApi("move_task", params);
    return { content: [{ type: "text", text: `Moved task to ${params.column_name}: ${JSON.stringify(result.task, null, 2)}` }] };
  }
);

// 6. Search tasks
server.tool(
  "kanban_search",
  "Search tasks by title or description",
  {
    query: z.string().describe("Search query"),
    board_id: z.string().optional().describe("Optional board UUID to filter"),
  },
  async (params) => {
    const result = await callApi("search_tasks", params);
    return { content: [{ type: "text", text: JSON.stringify(result.tasks, null, 2) }] };
  }
);

// 7. Add comment
server.tool(
  "kanban_add_comment",
  "Add a comment to a task",
  {
    task_id: z.string().describe("Task UUID"),
    content: z.string().describe("Comment text"),
  },
  async (params) => {
    const result = await callApi("add_comment", params);
    return { content: [{ type: "text", text: JSON.stringify(result.comment, null, 2) }] };
  }
);

// 8. Get my tasks
server.tool(
  "kanban_get_my_tasks",
  "Get all non-done tasks for a specific assignee",
  {
    assignee: z.string().describe("Username to filter by"),
  },
  async (params) => {
    const result = await callApi("get_my_tasks", params);
    return { content: [{ type: "text", text: JSON.stringify(result.tasks, null, 2) }] };
  }
);

// 9. Get stats
server.tool(
  "kanban_get_stats",
  "Get board statistics (task counts by column, priority, overdue count, hours)",
  {
    board_id: z.string().optional().describe("Optional board UUID (all boards if omitted)"),
  },
  async (params) => {
    const result = await callApi("get_stats", params);
    return { content: [{ type: "text", text: JSON.stringify(result.stats, null, 2) }] };
  }
);

// 10. Get version history
server.tool(
  "kanban_get_versions",
  "Get version history for a task (all changes with diffs)",
  {
    task_id: z.string().describe("Task UUID"),
    limit: z.number().optional().default(50).describe("Max versions to return"),
  },
  async ({ task_id, limit }) => {
    const result = await callApi("get_task_versions", { task_id, limit });
    return { content: [{ type: "text", text: JSON.stringify(result.versions, null, 2) }] };
  }
);

// 11. Rollback task to previous version
server.tool(
  "kanban_rollback",
  "Rollback a task to a previous version (restores full state from snapshot)",
  {
    task_id: z.string().describe("Task UUID"),
    version: z.number().describe("Version number to restore"),
  },
  async ({ task_id, version }) => {
    const result = await callApi("rollback_task", { task_id, version });
    return { content: [{ type: "text", text: `Rolled back to version ${version}: ${JSON.stringify(result.task, null, 2)}` }] };
  }
);

// 12. Create branch linked to task
server.tool(
  "kanban_create_branch",
  "Link a new Git branch to a task (auto-generates branch name from task title)",
  {
    task_id: z.string().describe("Task UUID"),
    base_branch: z.string().optional().default("master").describe("Base branch to branch from"),
  },
  async ({ task_id, base_branch }) => {
    const result = await callApi("create_branch", { task_id, base_branch });
    return { content: [{ type: "text", text: JSON.stringify(result.branch, null, 2) }] };
  }
);

// 13. Get branch status for task
server.tool(
  "kanban_branch_status",
  "Check the Git branch status for a task (branch info, commit count, reviews)",
  {
    task_id: z.string().describe("Task UUID"),
  },
  async ({ task_id }) => {
    const result = await callApi("get_branch_status", { task_id });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

// 14. Update branch info
server.tool(
  "kanban_update_branch",
  "Update branch details (commit SHA, PR info, status)",
  {
    task_id: z.string().describe("Task UUID"),
    head_commit: z.string().optional().describe("Current HEAD commit SHA"),
    status: z.enum(["created", "active", "paused", "review", "merged", "abandoned"]).optional().describe("Branch status"),
    pr_number: z.number().optional().describe("Pull request number"),
    pr_url: z.string().optional().describe("Pull request URL"),
    pr_status: z.enum(["none", "open", "review", "approved", "merged", "closed"]).optional().describe("PR status"),
    commit_count: z.number().optional().describe("Number of commits"),
    merge_commit: z.string().optional().describe("Merge commit SHA"),
  },
  async (params) => {
    const result = await callApi("update_branch", params);
    return { content: [{ type: "text", text: JSON.stringify(result.branch, null, 2) }] };
  }
);

// 15. Submit review
server.tool(
  "kanban_submit_review",
  "Submit a review for a branch (approve, request changes, or comment)",
  {
    branch_id: z.string().describe("Branch UUID"),
    status: z.enum(["approved", "changes_requested", "commented"]).describe("Review status"),
    comment: z.string().optional().describe("Review comment"),
  },
  async ({ branch_id, status, comment }) => {
    const result = await callApi("submit_review", { branch_id, status, comment });
    return { content: [{ type: "text", text: JSON.stringify(result.review, null, 2) }] };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
