/**
 * Nored Farms - Kanban Board App v3
 * Vanilla JS + Supabase + SortableJS + Realtime + Markdown + Attachments + Dependencies + Time Tracking
 */

(function () {
    'use strict';

    const SUPABASE_URL = 'https://uqyfsqenjakqyzixfcta.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeWZzcWVuamFrcXl6aXhmY3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTQzMjAsImV4cCI6MjA4NTEzMDMyMH0.SFFaYsDxdlHCFU30aV3Qzi6SI7759o2bePCaqKAHkTA';

    const COLUMNS = ['backlog', 'todo', 'in-progress', 'done'];
    const USERS = { steph: 'Steph', koh: 'Koh', c: 'C' };
    const USER_COLORS = { steph: '#7c3aed', koh: '#2563eb', c: '#d97706' };
    const PASSWORD = 'bud';

    const LABEL_COLORS = {
        red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e',
        blue: '#3b82f6', purple: '#8b5cf6', pink: '#ec4899', gray: '#6b7280'
    };

    const EMPTY_MESSAGES = {
        backlog: 'No items in backlog. Press <kbd>n</kbd> to add one.',
        todo: 'Nothing to do yet. Drag tasks here or press <kbd>n</kbd>.',
        'in-progress': 'Nothing in progress. Pick up a task!',
        done: 'No completed tasks yet. Keep going!'
    };

    let sb;
    let boards = [];
    let activeBoard = null;
    let tasks = [];
    let sortables = {};
    let currentUser = null;
    let modalSubtasks = [];
    let modalLabels = [];
    let modalBlockedBy = [];
    let modalAttachments = [];
    let filterDebounce = null;
    let realtimeChannel = null;

    // Timer state
    let timerInterval = null;
    let timerStartTime = null;
    let timerElapsed = 0; // seconds

    // ---- Init ----

    function init() {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        initLogin();
        initTheme();
        initFilters();
        initKeyboardShortcuts();
        initAttachmentUpload();
        initBlockedBySelect();
        restoreTimerState();

        // Close modal on overlay click
        document.getElementById('taskModal').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        document.getElementById('shortcutsModal').addEventListener('click', function (e) {
            if (e.target === this) this.classList.remove('open');
        });

        // Label picker toggle
        document.querySelectorAll('.label-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                chip.classList.toggle('active');
                var color = chip.dataset.color;
                if (chip.classList.contains('active')) {
                    if (modalLabels.indexOf(color) === -1) modalLabels.push(color);
                } else {
                    modalLabels = modalLabels.filter(function (l) { return l !== color; });
                }
            });
        });

        // Subtask input enter key
        document.getElementById('subtaskInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                window._kanban.addSubtask();
            }
        });

        // Comment input enter key
        document.getElementById('commentInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                window._kanban.addComment();
            }
        });

        // Escape key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeModal();
                closeAllQuickAdds();
                document.getElementById('shortcutsModal').classList.remove('open');
            }
        });

        // Live markdown preview update
        document.getElementById('taskDesc').addEventListener('input', function () {
            var preview = document.getElementById('mdPreview');
            if (preview.style.display !== 'none') {
                preview.innerHTML = renderMarkdown(this.value);
            }
        });
    }

    // ---- Markdown ----

    function renderMarkdown(text) {
        if (!text) return '';
        if (typeof marked !== 'undefined' && marked.parse) {
            return marked.parse(text, { breaks: true });
        }
        return escapeHtml(text);
    }

    // ---- Theme ----

    function initTheme() {
        var saved = localStorage.getItem('kanban_theme');
        if (saved === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            updateThemeIcons(true);
        }

        document.getElementById('themeToggle').addEventListener('click', function () {
            var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('kanban_theme', 'light');
                updateThemeIcons(false);
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('kanban_theme', 'dark');
                updateThemeIcons(true);
            }
        });
    }

    function updateThemeIcons(isDark) {
        var toggle = document.getElementById('themeToggle');
        toggle.querySelector('.icon-moon').style.display = isDark ? 'none' : '';
        toggle.querySelector('.icon-sun').style.display = isDark ? '' : 'none';
    }

    // ---- Filters ----

    function initFilters() {
        var searchInput = document.getElementById('filterSearch');
        searchInput.addEventListener('input', function () {
            clearTimeout(filterDebounce);
            filterDebounce = setTimeout(function () {
                applyFilters();
            }, 250);
        });

        ['filterAssignee', 'filterPriority', 'filterDue'].forEach(function (id) {
            document.getElementById(id).addEventListener('change', applyFilters);
        });

        document.getElementById('filterClear').addEventListener('click', clearFilters);
    }

    function getActiveFilters() {
        return {
            search: document.getElementById('filterSearch').value.trim().toLowerCase(),
            assignee: document.getElementById('filterAssignee').value,
            priority: document.getElementById('filterPriority').value,
            due: document.getElementById('filterDue').value
        };
    }

    function hasActiveFilters() {
        var f = getActiveFilters();
        return !!(f.search || f.assignee || f.priority || f.due);
    }

    function clearFilters() {
        document.getElementById('filterSearch').value = '';
        document.getElementById('filterAssignee').value = '';
        document.getElementById('filterPriority').value = '';
        document.getElementById('filterDue').value = '';
        applyFilters();
    }

    function applyFilters() {
        document.getElementById('filterClear').style.display = hasActiveFilters() ? '' : 'none';
        renderTasks();
    }

    function filterTasks(taskList) {
        var f = getActiveFilters();
        if (!f.search && !f.assignee && !f.priority && !f.due) return taskList;

        return taskList.filter(function (t) {
            if (f.search) {
                var haystack = (t.title + ' ' + (t.description || '')).toLowerCase();
                if (haystack.indexOf(f.search) === -1) return false;
            }
            if (f.assignee) {
                if (f.assignee === 'unassigned') {
                    if (t.assigned_to) return false;
                } else {
                    if (t.assigned_to !== f.assignee) return false;
                }
            }
            if (f.priority && t.priority !== f.priority) return false;
            if (f.due) {
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                if (f.due === 'none') {
                    if (t.due_date) return false;
                } else if (f.due === 'overdue') {
                    if (!t.due_date || new Date(t.due_date) >= today) return false;
                } else if (f.due === 'today') {
                    if (!t.due_date) return false;
                    var d = new Date(t.due_date);
                    d.setHours(0, 0, 0, 0);
                    if (d.getTime() !== today.getTime()) return false;
                } else if (f.due === 'week') {
                    if (!t.due_date) return false;
                    var end = new Date(today);
                    end.setDate(end.getDate() + 7);
                    var dd = new Date(t.due_date);
                    if (dd < today || dd > end) return false;
                }
            }
            return true;
        });
    }

    // ---- Keyboard Shortcuts ----

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function (e) {
            var tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 'n') {
                e.preventDefault();
                openNewTaskModal('todo');
            } else if (e.key === '/') {
                e.preventDefault();
                document.getElementById('filterSearch').focus();
            } else if (e.key === '?') {
                e.preventDefault();
                document.getElementById('shortcutsModal').classList.add('open');
            }
        });
    }

    // ---- Login Gate ----

    function initLogin() {
        var saved = localStorage.getItem('kanban_user');
        if (saved && USERS[saved]) {
            currentUser = saved;
            showApp();
            return;
        }
        showLogin();
    }

    function showLogin() {
        document.getElementById('loginGate').style.display = 'flex';
        document.getElementById('kanbanApp').style.display = 'none';

        var usernameInput = document.getElementById('loginUsername');
        var passwordInput = document.getElementById('loginPassword');
        var errorEl = document.getElementById('loginError');

        usernameInput.focus();

        function attemptLogin() {
            var name = usernameInput.value.trim().toLowerCase();
            if (!name || !passwordInput.value) return;
            if (USERS[name] && passwordInput.value === PASSWORD) {
                currentUser = name;
                localStorage.setItem('kanban_user', currentUser);
                showApp();
            } else {
                errorEl.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        }

        document.getElementById('loginSubmit').addEventListener('click', attemptLogin);
        passwordInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') attemptLogin();
        });
        usernameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') passwordInput.focus();
        });
    }

    function showApp() {
        document.getElementById('loginGate').style.display = 'none';
        document.getElementById('kanbanApp').style.display = '';

        var name = USERS[currentUser];
        var avatar = document.getElementById('userAvatar');
        avatar.textContent = name.charAt(0);
        avatar.setAttribute('title', name);
        avatar.style.background = USER_COLORS[currentUser] || 'var(--color-primary)';

        loadBoards();
    }

    function logout() {
        localStorage.removeItem('kanban_user');
        currentUser = null;
        window.location.reload();
    }

    // ---- Boards ----

    async function loadBoards() {
        var result = await sb.from('kanban_boards').select('*').order('position');

        if (result.error) {
            console.error('Failed to load boards:', result.error);
            showError('Failed to load boards');
            return;
        }

        boards = result.data || [];
        renderBoardTabs();

        var hash = window.location.hash.replace('#', '');
        var fromHash = boards.find(function (b) { return b.slug === hash; });
        selectBoard(fromHash || boards[0]);
    }

    function renderBoardTabs() {
        var container = document.getElementById('boardTabs');
        container.innerHTML = boards.map(function (b) {
            var isActive = activeBoard && activeBoard.id === b.id;
            return '<button class="board-tab' + (isActive ? ' active' : '') + '" data-board-id="' + b.id + '" onclick="window._kanban.selectBoard(\'' + b.id + '\')">' +
                b.icon + ' ' + b.name +
                '<span class="tab-count" data-board-count="' + b.id + '">0</span></button>';
        }).join('');
    }

    async function selectBoard(boardOrId) {
        var board = typeof boardOrId === 'string'
            ? boards.find(function (b) { return b.id === boardOrId; })
            : boardOrId;

        if (!board) return;
        activeBoard = board;
        window.location.hash = board.slug;

        document.querySelectorAll('.board-tab').forEach(function (t) {
            t.classList.toggle('active', t.dataset.boardId === board.id);
        });

        await loadTasks();
        setupRealtime(board.id);
    }

    // ---- Realtime Subscriptions ----

    function setupRealtime(boardId) {
        // Tear down previous channel
        if (realtimeChannel) {
            sb.removeChannel(realtimeChannel);
            realtimeChannel = null;
        }

        realtimeChannel = sb
            .channel('kanban-realtime-' + boardId)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'kanban_tasks', filter: 'board_id=eq.' + boardId },
                function (payload) {
                    var newTask = payload.new;
                    if (!tasks.find(function (t) { return t.id === newTask.id; })) {
                        tasks.push(newTask);
                        renderTasks();
                        updateCounts();
                        updateStats();
                        updateWipLimits();
                        initSortable();
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'kanban_tasks', filter: 'board_id=eq.' + boardId },
                function (payload) {
                    var updated = payload.new;
                    var idx = tasks.findIndex(function (t) { return t.id === updated.id; });
                    if (idx !== -1) {
                        tasks[idx] = updated;
                        renderTasks();
                        updateCounts();
                        updateStats();
                        updateWipLimits();
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'kanban_tasks', filter: 'board_id=eq.' + boardId },
                function (payload) {
                    var deletedId = payload.old.id;
                    tasks = tasks.filter(function (t) { return t.id !== deletedId; });
                    renderTasks();
                    updateCounts();
                    updateStats();
                    updateWipLimits();
                    initSortable();
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'kanban_activity', filter: 'board_id=eq.' + boardId },
                function (payload) {
                    // Refresh activity feed if modal is open for this task
                    var openTaskId = document.getElementById('taskId').value;
                    if (openTaskId && payload.new.task_id === openTaskId) {
                        loadActivity(openTaskId);
                    }
                }
            )
            .subscribe();
    }

    // ---- Tasks ----

    async function loadTasks() {
        if (!activeBoard) return;

        document.getElementById('kanbanLoading').style.display = 'flex';
        document.getElementById('kanbanColumns').style.display = 'none';

        var result = await sb.from('kanban_tasks').select('*').eq('board_id', activeBoard.id).order('position');

        if (result.error) {
            console.error('Failed to load tasks:', result.error);
            showError('Failed to load tasks');
            return;
        }

        tasks = result.data || [];
        renderTasks();
        updateCounts();
        updateStats();
        updateWipLimits();
        initSortable();

        document.getElementById('kanbanLoading').style.display = 'none';
        document.getElementById('kanbanColumns').style.display = 'grid';
    }

    function renderTasks() {
        var filtered = filterTasks(tasks);

        COLUMNS.forEach(function (col) {
            var list = document.getElementById('list-' + col);
            var colTasks = filtered.filter(function (t) { return t.column_name === col; });

            if (colTasks.length === 0) {
                list.innerHTML = '<div class="task-list-empty">' + EMPTY_MESSAGES[col] + '</div>';
            } else {
                list.innerHTML = colTasks.map(function (t) { return taskCardHTML(t); }).join('');
            }
        });

        updateCounts();
        updateStats();
    }

    function taskCardHTML(t) {
        var parts = [];

        // Labels
        var labels = t.labels || [];
        if (labels.length > 0) {
            parts.push('<div class="task-card-labels">' +
                labels.map(function (l) {
                    return '<span class="task-label" data-color="' + escapeHtml(l) + '"></span>';
                }).join('') + '</div>');
        }

        // Title
        parts.push('<p class="task-card-title">' + escapeHtml(t.title) + '</p>');

        // Description snippet (rendered as markdown, clamped)
        if (t.description) {
            var descHtml = renderMarkdown(t.description);
            parts.push('<div class="task-card-desc md-content">' + descHtml + '</div>');
        }

        // Branch badge (if task has linked git branch)
        var gitMeta = t.metadata && t.metadata.git;
        if (gitMeta && gitMeta.branch) {
            var brStatus = gitMeta.status || 'created';
            parts.push('<div class="branch-badge branch-' + brStatus + '" title="' + escapeHtml(gitMeta.branch) + '">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v12"/><path d="M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M18 9c0 6-6 9-12 9"/></svg>' +
                '<span>' + brStatus + '</span>' +
                (gitMeta.pr_url ? '<a class="branch-pr-link" href="' + escapeHtml(gitMeta.pr_url) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()">PR</a>' : '') +
                '</div>');
        }

        // Source badge (if not human)
        if (t.source && t.source !== 'human') {
            parts.push('<span class="source-badge">' + escapeHtml(t.source) + '</span>');
        }

        // Meta row
        var meta = [];
        meta.push('<span class="task-priority ' + t.priority + '">' + t.priority + '</span>');

        // Due date
        if (t.due_date) {
            var ds = dueDateStatus(t.due_date);
            meta.push('<span class="task-due ' + ds.cls + '">' + ds.label + '</span>');
        }

        // Blocked badge
        var blockers = getActiveBlockers(t);
        if (blockers.length > 0) {
            meta.push('<span class="task-blocked-badge">Blocked (' + blockers.length + ')</span>');
        }

        // Subtask progress
        var subtasks = t.subtasks || [];
        if (subtasks.length > 0) {
            var done = subtasks.filter(function (s) { return s.done; }).length;
            var pct = Math.round((done / subtasks.length) * 100);
            meta.push('<span class="task-subtasks"><span class="subtask-bar"><span class="subtask-bar-fill" style="width:' + pct + '%"></span></span>' + done + '/' + subtasks.length + '</span>');
        }

        // Attachment count
        var attachments = (t.metadata && t.metadata.attachments) || [];
        if (attachments.length > 0) {
            meta.push('<span class="task-attachment-count" title="' + attachments.length + ' attachment(s)">&#128206; ' + attachments.length + '</span>');
        }

        // Time tracking
        if (t.estimated_hours || t.actual_hours) {
            var actual = t.actual_hours || 0;
            var estimated = t.estimated_hours || 0;
            var timeClass = (estimated > 0 && actual > estimated) ? ' over-estimate' : '';
            var timeText = actual + 'h';
            if (estimated > 0) timeText += '/' + estimated + 'h';
            meta.push('<span class="task-time' + timeClass + '">' + timeText + '</span>');
        }

        // Card age
        if (t.column_entered_at && t.column_name !== 'done') {
            var age = columnAge(t.column_entered_at);
            if (age) {
                meta.push('<span class="task-age">' + age + '</span>');
            }
        }

        // Assignee
        if (t.assigned_to && USERS[t.assigned_to]) {
            meta.push('<span class="task-assignee" data-user="' + t.assigned_to + '" title="' + USERS[t.assigned_to] + '">' + USERS[t.assigned_to].charAt(0) + '</span>');
        }

        // Edit button
        meta.push('<div class="task-card-actions"><button class="task-action-btn" onclick="window._kanban.editTask(\'' + t.id + '\')" title="Edit">&#9998;</button></div>');

        parts.push('<div class="task-card-meta">' + meta.join('') + '</div>');

        // Blocked card styling
        var blockedClass = blockers.length > 0 ? ' task-card-blocked' : '';
        return '<div class="task-card' + blockedClass + '" data-task-id="' + t.id + '" ondblclick="window._kanban.editTask(\'' + t.id + '\')">' + parts.join('') + '</div>';
    }

    // ---- Dependencies ----

    function getActiveBlockers(task) {
        var blockedBy = task.blocked_by || [];
        if (blockedBy.length === 0) return [];
        return blockedBy.filter(function (blockerId) {
            var blocker = tasks.find(function (t) { return t.id === blockerId; });
            return blocker && blocker.column_name !== 'done';
        });
    }

    function initBlockedBySelect() {
        document.getElementById('blockedBySelect').addEventListener('change', function () {
            var taskId = this.value;
            if (!taskId) return;
            if (modalBlockedBy.indexOf(taskId) === -1) {
                modalBlockedBy.push(taskId);
                renderBlockedByList();
            }
            this.value = '';
        });
    }

    function populateBlockedBySelect(currentTaskId) {
        var select = document.getElementById('blockedBySelect');
        var options = '<option value="">Add a blocker...</option>';
        tasks.forEach(function (t) {
            if (t.id !== currentTaskId) {
                options += '<option value="' + t.id + '">' + escapeHtml(t.title) + ' (' + columnLabel(t.column_name) + ')</option>';
            }
        });
        select.innerHTML = options;
    }

    function renderBlockedByList() {
        var list = document.getElementById('blockedByList');
        if (modalBlockedBy.length === 0) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = modalBlockedBy.map(function (id) {
            var t = tasks.find(function (x) { return x.id === id; });
            var label = t ? escapeHtml(t.title) : id.slice(0, 8) + '...';
            return '<div class="blocked-by-item">' +
                '<span class="blocked-by-title">' + label + '</span>' +
                '<button type="button" class="blocked-by-remove" onclick="window._kanban.removeBlocker(\'' + id + '\')">&times;</button>' +
                '</div>';
        }).join('');
    }

    // ---- Attachments ----

    function initAttachmentUpload() {
        document.getElementById('attachmentInput').addEventListener('change', async function () {
            var file = this.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showToast('File too large (max 5MB)', 'error');
                this.value = '';
                return;
            }

            var taskId = document.getElementById('taskId').value;
            if (!taskId) {
                showToast('Save the task first before attaching files', 'error');
                this.value = '';
                return;
            }

            showToast('Uploading...', 'info');

            var fileId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            var filePath = taskId + '/' + fileId + '-' + file.name;

            var result = await sb.storage.from('kanban-attachments').upload(filePath, file);

            if (result.error) {
                console.error('Upload failed:', result.error);
                showToast('Upload failed: ' + result.error.message, 'error');
                this.value = '';
                return;
            }

            var publicUrl = sb.storage.from('kanban-attachments').getPublicUrl(filePath).data.publicUrl;

            var attachment = {
                id: fileId,
                name: file.name,
                path: filePath,
                url: publicUrl,
                type: file.type,
                size: file.size,
                uploaded_at: new Date().toISOString()
            };

            modalAttachments.push(attachment);

            // Save to task metadata
            var task = tasks.find(function (t) { return t.id === taskId; });
            var meta = (task && task.metadata) || {};
            meta.attachments = modalAttachments;
            await sb.from('kanban_tasks').update({ metadata: meta }).eq('id', taskId);
            if (task) task.metadata = meta;

            renderAttachmentList();
            renderTasks();
            showToast('File attached', 'success');
            logActivity(taskId, 'update', null, { attachment_added: file.name });

            this.value = '';
        });
    }

    function renderAttachmentList() {
        var list = document.getElementById('attachmentList');
        if (modalAttachments.length === 0) {
            list.innerHTML = '';
            return;
        }
        list.innerHTML = modalAttachments.map(function (a) {
            var isImage = a.type && a.type.startsWith('image/');
            var thumb = isImage ? '<img class="attachment-thumb" src="' + escapeHtml(a.url) + '" alt="' + escapeHtml(a.name) + '">' : '';
            return '<div class="attachment-item">' +
                thumb +
                '<a class="attachment-name" href="' + escapeHtml(a.url) + '" target="_blank" rel="noopener">' + escapeHtml(a.name) + '</a>' +
                '<span class="attachment-size">' + formatFileSize(a.size) + '</span>' +
                '<button type="button" class="attachment-remove" onclick="window._kanban.removeAttachment(\'' + a.id + '\')">&times;</button>' +
                '</div>';
        }).join('');
    }

    function formatFileSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ---- Time Tracking ----

    function restoreTimerState() {
        var saved = localStorage.getItem('kanban_timer');
        if (saved) {
            try {
                var state = JSON.parse(saved);
                if (state.taskId && state.startTime) {
                    timerStartTime = new Date(state.startTime);
                    timerElapsed = state.elapsed || 0;
                    // Timer will be resumed when the task modal opens
                }
            } catch (e) { /* ignore */ }
        }
    }

    function saveTimerState() {
        if (timerStartTime) {
            localStorage.setItem('kanban_timer', JSON.stringify({
                taskId: document.getElementById('taskId').value,
                startTime: timerStartTime.toISOString(),
                elapsed: timerElapsed
            }));
        } else {
            localStorage.removeItem('kanban_timer');
        }
    }

    function startTimer() {
        if (timerInterval) return;
        if (!timerStartTime) {
            timerStartTime = new Date();
        }
        timerInterval = setInterval(function () {
            var now = new Date();
            var totalSecs = timerElapsed + Math.floor((now - timerStartTime) / 1000);
            updateTimerDisplay(totalSecs);
        }, 1000);
        document.getElementById('timerStartBtn').textContent = 'Stop';
        document.getElementById('timerStartBtn').classList.add('timer-active');
        saveTimerState();
    }

    function stopTimer() {
        if (!timerInterval) return;
        clearInterval(timerInterval);
        timerInterval = null;

        if (timerStartTime) {
            var now = new Date();
            timerElapsed += Math.floor((now - timerStartTime) / 1000);
            timerStartTime = null;
        }

        document.getElementById('timerStartBtn').textContent = 'Start';
        document.getElementById('timerStartBtn').classList.remove('timer-active');

        // Calculate hours and add to actual_hours
        if (timerElapsed > 0) {
            var hours = timerElapsed / 3600;
            addActualHours(hours);
            timerElapsed = 0;
            updateTimerDisplay(0);
        }

        localStorage.removeItem('kanban_timer');
    }

    function updateTimerDisplay(totalSecs) {
        var h = Math.floor(totalSecs / 3600);
        var m = Math.floor((totalSecs % 3600) / 60);
        var s = totalSecs % 60;
        document.getElementById('timerDisplay').textContent =
            String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    async function addActualHours(hours) {
        var taskId = document.getElementById('taskId').value;
        if (!taskId || hours <= 0) return;

        var task = tasks.find(function (t) { return t.id === taskId; });
        var current = (task && task.actual_hours) || 0;
        var newTotal = Math.round((current + hours) * 100) / 100;

        await sb.from('kanban_tasks').update({ actual_hours: newTotal }).eq('id', taskId);
        if (task) task.actual_hours = newTotal;

        document.getElementById('timeActualDisplay').textContent = newTotal + 'h';
        logActivity(taskId, 'time_log', null, { hours_added: Math.round(hours * 100) / 100, new_total: newTotal });
        renderTasks();
    }

    // ---- Helper Functions ----

    function dueDateStatus(dateStr) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var due = new Date(dateStr + 'T00:00:00');

        var diff = Math.floor((due - today) / 86400000);

        if (diff < 0) return { cls: 'overdue', label: Math.abs(diff) + 'd overdue' };
        if (diff === 0) return { cls: 'today', label: 'Today' };
        if (diff <= 3) return { cls: 'soon', label: diff + 'd' };
        return { cls: 'future', label: formatShortDate(due) };
    }

    function formatShortDate(d) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[d.getMonth()] + ' ' + d.getDate();
    }

    function columnAge(enteredAt) {
        if (!enteredAt) return '';
        var now = new Date();
        var entered = new Date(enteredAt);
        var days = Math.floor((now - entered) / 86400000);
        if (days < 1) return '';
        if (days === 1) return '1d';
        return days + 'd';
    }

    function relativeTime(dateStr) {
        var now = new Date();
        var then = new Date(dateStr);
        var secs = Math.floor((now - then) / 1000);

        if (secs < 60) return 'just now';
        var mins = Math.floor(secs / 60);
        if (mins < 60) return mins + 'm ago';
        var hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        var days = Math.floor(hrs / 24);
        if (days < 30) return days + 'd ago';
        return formatShortDate(then);
    }

    function updateCounts() {
        COLUMNS.forEach(function (col) {
            var count = tasks.filter(function (t) { return t.column_name === col; }).length;
            var el = document.querySelector('[data-count="' + col + '"]');
            if (!el) return;

            var wipLimits = (activeBoard && activeBoard.wip_limits) || {};
            var limit = wipLimits[col];
            if (limit && count >= limit) {
                el.textContent = count + '/' + limit;
                el.classList.add('over-limit');
            } else if (limit) {
                el.textContent = count + '/' + limit;
                el.classList.remove('over-limit');
            } else {
                el.textContent = count;
                el.classList.remove('over-limit');
            }
        });

        if (activeBoard) {
            var totalEl = document.querySelector('[data-board-count="' + activeBoard.id + '"]');
            if (totalEl) totalEl.textContent = tasks.length;
        }
    }

    function updateStats() {
        var total = tasks.length;
        var doneCount = tasks.filter(function (t) { return t.column_name === 'done'; }).length;
        var pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

        document.getElementById('toolbarStats').innerHTML =
            '<span class="stat-item"><strong>' + total + '</strong> tasks</span>' +
            '<span class="stat-item"><strong>' + pct + '%</strong> done</span>';
    }

    function updateWipLimits() {
        var wipLimits = (activeBoard && activeBoard.wip_limits) || {};
        COLUMNS.forEach(function (col) {
            var colEl = document.querySelector('.kanban-column[data-column="' + col + '"]');
            if (!colEl) return;
            var limit = wipLimits[col];
            var count = tasks.filter(function (t) { return t.column_name === col; }).length;
            colEl.classList.toggle('wip-warning', !!(limit && count >= limit));
        });
    }

    // ---- Drag & Drop ----

    function initSortable() {
        COLUMNS.forEach(function (col) {
            var el = document.getElementById('list-' + col);
            if (sortables[col]) sortables[col].destroy();

            sortables[col] = new Sortable(el, {
                group: 'kanban',
                animation: 150,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',
                dragClass: 'sortable-drag',
                filter: '.task-list-empty',
                onEnd: handleDragEnd
            });
        });
    }

    async function handleDragEnd(evt) {
        var taskId = evt.item.dataset.taskId;
        var newColumn = evt.to.id.replace('list-', '');
        var oldColumn = evt.from.id.replace('list-', '');

        evt.to.querySelectorAll('.task-list-empty').forEach(function (el) { el.remove(); });
        if (evt.from.children.length === 0) {
            evt.from.innerHTML = '<div class="task-list-empty">' + EMPTY_MESSAGES[oldColumn] + '</div>';
        }

        if (newColumn === 'done' && oldColumn !== 'done') {
            evt.item.classList.add('complete-flash');
            setTimeout(function () { evt.item.classList.remove('complete-flash'); }, 800);
        }

        var task = tasks.find(function (t) { return t.id === taskId; });
        var prevColumn = task ? task.column_name : oldColumn;
        if (task) {
            task.column_name = newColumn;
            task.position = evt.newIndex;
        }

        var colCards = evt.to.querySelectorAll('.task-card');
        var updates = [];
        colCards.forEach(function (card, i) {
            var id = card.dataset.taskId;
            var t = tasks.find(function (x) { return x.id === id; });
            if (t) {
                t.position = i;
                t.column_name = newColumn;
                updates.push({ id: id, column_name: newColumn, position: i });
            }
        });

        if (evt.from !== evt.to) {
            var srcCards = evt.from.querySelectorAll('.task-card');
            srcCards.forEach(function (card, i) {
                var id = card.dataset.taskId;
                var t = tasks.find(function (x) { return x.id === id; });
                if (t) {
                    t.position = i;
                    updates.push({ id: id, column_name: oldColumn, position: i });
                }
            });
        }

        updateCounts();
        updateStats();
        updateWipLimits();

        for (var u of updates) {
            await sb.from('kanban_tasks').update({
                column_name: u.column_name,
                position: u.position
            }).eq('id', u.id);
        }

        if (prevColumn !== newColumn) {
            showToast('Moved to ' + columnLabel(newColumn), 'success');
            logActivity(taskId, 'move', null, { from: prevColumn, to: newColumn });
        }
    }

    function columnLabel(col) {
        var labels = { backlog: 'Backlog', todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
        return labels[col] || col;
    }

    // ---- Quick Add ----

    window.startQuickAdd = function (column) {
        closeAllQuickAdds();

        var colEl = document.querySelector('.kanban-column[data-column="' + column + '"]');
        var btn = colEl.querySelector('.add-task-btn');
        btn.style.display = 'none';

        var form = document.createElement('div');
        form.className = 'quick-add-form';
        form.innerHTML = '<input type="text" placeholder="Task title... (Enter to save, Esc to cancel)" autofocus>';

        btn.parentNode.insertBefore(form, btn.nextSibling);

        var input = form.querySelector('input');
        input.focus();

        input.addEventListener('keydown', async function (e) {
            if (e.key === 'Enter' && input.value.trim()) {
                var title = input.value.trim();
                input.disabled = true;

                var colTasks = tasks.filter(function (t) { return t.column_name === column; });
                var position = colTasks.length;

                var result = await sb.from('kanban_tasks').insert({
                    board_id: activeBoard.id,
                    title: title,
                    column_name: column,
                    position: position,
                    priority: 'medium',
                    created_by: currentUser,
                    source: 'human'
                }).select().single();

                if (result.error) {
                    console.error('Failed to add task:', result.error);
                    showToast('Failed to add task', 'error');
                    input.disabled = false;
                    return;
                }

                tasks.push(result.data);
                renderTasks();
                updateCounts();
                updateStats();
                initSortable();
                showToast('Task added', 'success');
                logActivity(result.data.id, 'create', null, { title: title });

                input.value = '';
                input.disabled = false;
                input.focus();
            }
            if (e.key === 'Escape') {
                closeAllQuickAdds();
            }
        });

        input.addEventListener('blur', function () {
            setTimeout(function () {
                if (!input.value.trim()) closeAllQuickAdds();
            }, 150);
        });
    };

    function closeAllQuickAdds() {
        document.querySelectorAll('.quick-add-form').forEach(function (f) { f.remove(); });
        document.querySelectorAll('.add-task-btn').forEach(function (b) { b.style.display = ''; });
    }

    // ---- Modal ----

    function openNewTaskModal(column) {
        closeModal();
        document.getElementById('modalTitle').textContent = 'New Task';
        document.getElementById('taskId').value = '';
        document.getElementById('taskTitleInput').value = '';
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskColumn').value = column || 'todo';
        document.getElementById('taskAssignee').value = '';
        document.getElementById('taskDue').value = '';
        document.getElementById('deleteTaskBtn').style.display = 'none';
        document.getElementById('activityPanel').style.display = 'none';
        document.getElementById('modalMetadata').style.display = 'none';
        document.getElementById('mdPreview').style.display = 'none';
        document.getElementById('taskEstimatedHours').value = '';
        document.getElementById('timeActualDisplay').textContent = '0h';
        updateTimerDisplay(0);

        modalLabels = [];
        modalSubtasks = [];
        modalBlockedBy = [];
        modalAttachments = [];
        renderLabelPicker();
        renderSubtasks();
        renderBlockedByList();
        renderAttachmentList();
        populateBlockedBySelect(null);

        openModal();
    }

    window._kanban = {
        selectBoard: function (id) { selectBoard(id); },
        logout: function () { logout(); },

        editTask: function (taskId) {
            var task = tasks.find(function (t) { return t.id === taskId; });
            if (!task) return;

            document.getElementById('modalTitle').textContent = 'Edit Task';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitleInput').value = task.title;
            document.getElementById('taskDesc').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskColumn').value = task.column_name;
            document.getElementById('taskAssignee').value = task.assigned_to || '';
            document.getElementById('taskDue').value = task.due_date || '';
            document.getElementById('deleteTaskBtn').style.display = 'block';
            document.getElementById('activityPanel').style.display = '';
            document.getElementById('mdPreview').style.display = 'none';

            // Labels
            modalLabels = (task.labels || []).slice();
            renderLabelPicker();

            // Subtasks
            modalSubtasks = (task.subtasks || []).map(function (s) {
                return { id: s.id, text: s.text, done: !!s.done };
            });
            renderSubtasks();

            // Dependencies
            modalBlockedBy = (task.blocked_by || []).slice();
            populateBlockedBySelect(task.id);
            renderBlockedByList();

            // Attachments
            modalAttachments = ((task.metadata && task.metadata.attachments) || []).slice();
            renderAttachmentList();

            // Time tracking
            document.getElementById('taskEstimatedHours').value = task.estimated_hours || '';
            document.getElementById('timeActualDisplay').textContent = (task.actual_hours || 0) + 'h';

            // Restore timer if running for this task
            var savedTimer = localStorage.getItem('kanban_timer');
            if (savedTimer) {
                try {
                    var ts = JSON.parse(savedTimer);
                    if (ts.taskId === task.id && ts.startTime) {
                        timerStartTime = new Date(ts.startTime);
                        timerElapsed = ts.elapsed || 0;
                        startTimer();
                    } else {
                        updateTimerDisplay(0);
                    }
                } catch (e) {
                    updateTimerDisplay(0);
                }
            } else {
                updateTimerDisplay(0);
            }

            // Metadata
            var metaEl = document.getElementById('modalMetadata');
            metaEl.style.display = '';
            document.getElementById('metaCreatedBy').textContent = task.created_by ? 'Created by ' + (USERS[task.created_by] || task.created_by) : '';
            document.getElementById('metaCreatedAt').textContent = task.created_at ? 'Created ' + relativeTime(task.created_at) : '';
            document.getElementById('metaUpdatedAt').textContent = task.updated_at ? 'Updated ' + relativeTime(task.updated_at) : '';

            // Source indicator
            if (task.source && task.source !== 'human') {
                document.getElementById('metaCreatedBy').textContent += ' (via ' + task.source + ')';
            }

            loadActivity(task.id);
            openModal();
        },

        addSubtask: function () {
            var input = document.getElementById('subtaskInput');
            var text = input.value.trim();
            if (!text) return;

            modalSubtasks.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                text: text,
                done: false
            });
            input.value = '';
            renderSubtasks();
            input.focus();
        },

        toggleSubtask: function (id) {
            var st = modalSubtasks.find(function (s) { return s.id === id; });
            if (st) st.done = !st.done;
            renderSubtasks();
        },

        removeSubtask: function (id) {
            modalSubtasks = modalSubtasks.filter(function (s) { return s.id !== id; });
            renderSubtasks();
        },

        addComment: async function () {
            var input = document.getElementById('commentInput');
            var text = input.value.trim();
            var taskId = document.getElementById('taskId').value;
            if (!text || !taskId) return;

            input.disabled = true;
            await logActivity(taskId, 'comment', text, null);
            input.value = '';
            input.disabled = false;
            input.focus();
            loadActivity(taskId);
        },

        toggleMarkdownPreview: function () {
            var preview = document.getElementById('mdPreview');
            var textarea = document.getElementById('taskDesc');
            var btn = document.getElementById('mdPreviewToggle');
            if (preview.style.display === 'none') {
                preview.innerHTML = renderMarkdown(textarea.value);
                preview.style.display = '';
                textarea.style.display = 'none';
                btn.textContent = 'Edit';
            } else {
                preview.style.display = 'none';
                textarea.style.display = '';
                btn.textContent = 'Preview';
            }
        },

        removeBlocker: function (id) {
            modalBlockedBy = modalBlockedBy.filter(function (b) { return b !== id; });
            renderBlockedByList();
        },

        removeAttachment: async function (attachmentId) {
            var taskId = document.getElementById('taskId').value;
            var att = modalAttachments.find(function (a) { return a.id === attachmentId; });

            if (att && att.path) {
                await sb.storage.from('kanban-attachments').remove([att.path]);
            }

            modalAttachments = modalAttachments.filter(function (a) { return a.id !== attachmentId; });

            if (taskId) {
                var task = tasks.find(function (t) { return t.id === taskId; });
                var meta = (task && task.metadata) || {};
                meta.attachments = modalAttachments;
                await sb.from('kanban_tasks').update({ metadata: meta }).eq('id', taskId);
                if (task) task.metadata = meta;
            }

            renderAttachmentList();
            renderTasks();
        },

        toggleTimer: function () {
            if (timerInterval) {
                stopTimer();
            } else {
                startTimer();
            }
        },

        logManualHours: function () {
            var input = document.getElementById('manualHoursInput');
            var hours = parseFloat(input.value);
            if (!hours || hours <= 0) return;
            addActualHours(hours);
            input.value = '';
            showToast(hours + 'h logged', 'success');
        },

        switchPanel: function (panel) {
            var tabs = document.querySelectorAll('.panel-tab');
            tabs.forEach(function (t) {
                t.classList.toggle('active', t.dataset.panel === panel);
            });
            document.getElementById('activityContent').style.display = panel === 'activity' ? '' : 'none';
            document.getElementById('versionsContent').style.display = panel === 'versions' ? '' : 'none';

            if (panel === 'versions') {
                var taskId = document.getElementById('taskId').value;
                if (taskId) {
                    loadVersionHistory(taskId);
                    loadBranchStatus(taskId);
                }
            }
        },

        rollbackToVersion: async function (taskId, version) {
            if (!confirm('Rollback this task to version ' + version + '? This will create a new version entry.')) return;

            try {
                var result = await sb.rpc('rollback_task_to_version', {
                    p_task_id: taskId,
                    p_version: version
                });

                if (result.error) {
                    showToast('Rollback failed: ' + result.error.message, 'error');
                    return;
                }

                // Refresh local task data
                var taskResult = await sb.from('kanban_tasks').select('*').eq('id', taskId).single();
                if (taskResult.data) {
                    var idx = tasks.findIndex(function (t) { return t.id === taskId; });
                    if (idx !== -1) tasks[idx] = taskResult.data;
                }

                logActivity(taskId, 'rollback', null, { to_version: version });
                showToast('Rolled back to version ' + version, 'success');
                renderTasks();
                loadVersionHistory(taskId);

                // Refresh modal fields
                window._kanban.editTask(taskId);
            } catch (err) {
                showToast('Rollback failed', 'error');
                console.error('Rollback error:', err);
            }
        }
    };

    // ---- Version History ----

    async function loadVersionHistory(taskId) {
        var timeline = document.getElementById('versionTimeline');
        timeline.innerHTML = '<div class="version-loading">Loading...</div>';

        var result = await sb.from('kanban_task_versions')
            .select('*')
            .eq('task_id', taskId)
            .order('version', { ascending: false })
            .limit(50);

        if (result.error) {
            timeline.innerHTML = '<div class="version-loading">Failed to load versions</div>';
            return;
        }

        var versions = result.data || [];
        if (versions.length === 0) {
            timeline.innerHTML = '<div class="version-loading">No version history yet</div>';
            return;
        }

        timeline.innerHTML = versions.map(function (v) {
            var opClass = v.operation.toLowerCase();
            var opLabel = v.operation === 'INSERT' ? 'Created' :
                          v.operation === 'DELETE' ? 'Deleted' : 'Updated';

            var changedHtml = '';
            if (v.changed_fields && v.changed_fields.length > 0) {
                changedHtml = '<div class="version-changed">' +
                    v.changed_fields.map(function (f) {
                        return '<span class="version-field">' + escapeHtml(f) + '</span>';
                    }).join('') + '</div>';
            }

            var sourceHtml = '';
            if (v.source && v.source !== 'human') {
                sourceHtml = '<span class="version-source">' + escapeHtml(v.source) + '</span>';
            }

            var gitHtml = '';
            if (v.git_branch) {
                gitHtml = '<span class="version-git">' + escapeHtml(v.git_branch.split('/').pop()) + '</span>';
            }

            var rollbackBtn = '';
            if (v.operation !== 'DELETE' && v.new_data) {
                rollbackBtn = '<button class="version-rollback" onclick="window._kanban.rollbackToVersion(\'' + taskId + '\', ' + v.version + ')" title="Rollback to this version">Restore</button>';
            }

            return '<div class="version-entry version-' + opClass + '">' +
                '<div class="version-dot"></div>' +
                '<div class="version-content">' +
                    '<div class="version-header">' +
                        '<span class="version-op">' + opLabel + '</span>' +
                        '<span class="version-num">v' + v.version + '</span>' +
                        sourceHtml + gitHtml + rollbackBtn +
                    '</div>' +
                    changedHtml +
                    '<div class="version-meta">' +
                        '<span>' + (v.changed_by || 'system') + '</span>' +
                        '<span>' + relativeTime(v.created_at) + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    async function loadBranchStatus(taskId) {
        var panel = document.getElementById('branchStatusPanel');
        panel.style.display = 'none';

        var task = tasks.find(function (t) { return t.id === taskId; });
        if (!task || !task.metadata || !task.metadata.git) return;

        var result = await sb.from('kanban_task_branches')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (result.error || !result.data) return;

        var branch = result.data;
        panel.style.display = '';

        document.getElementById('branchName').textContent = branch.branch_name;
        var badge = document.getElementById('branchStatusBadge');
        badge.textContent = branch.status;
        badge.className = 'branch-status-badge branch-' + branch.status;

        var metaParts = [];
        if (branch.commit_count > 0) {
            metaParts.push(branch.commit_count + ' commit' + (branch.commit_count !== 1 ? 's' : ''));
        }
        if (branch.pr_url) {
            metaParts.push('<a href="' + escapeHtml(branch.pr_url) + '" target="_blank" rel="noopener">PR #' + (branch.pr_number || '') + '</a>');
        }
        if (branch.base_branch) {
            metaParts.push('from ' + escapeHtml(branch.base_branch));
        }
        document.getElementById('branchStatusMeta').innerHTML = metaParts.join(' &middot; ');
    }

    function renderLabelPicker() {
        document.querySelectorAll('.label-chip').forEach(function (chip) {
            var color = chip.dataset.color;
            chip.classList.toggle('active', modalLabels.indexOf(color) !== -1);
        });
    }

    function renderSubtasks() {
        var list = document.getElementById('subtaskList');
        if (modalSubtasks.length === 0) {
            list.innerHTML = '';
            return;
        }

        list.innerHTML = modalSubtasks.map(function (s) {
            return '<div class="subtask-item">' +
                '<input type="checkbox" ' + (s.done ? 'checked' : '') + ' onchange="window._kanban.toggleSubtask(\'' + s.id + '\')">' +
                '<span class="subtask-text' + (s.done ? ' done' : '') + '">' + escapeHtml(s.text) + '</span>' +
                '<button type="button" class="subtask-remove" onclick="window._kanban.removeSubtask(\'' + s.id + '\')">&times;</button>' +
                '</div>';
        }).join('');
    }

    // ---- Activity ----

    async function loadActivity(taskId) {
        var feed = document.getElementById('activityFeed');
        feed.innerHTML = '<div class="activity-item" style="text-align:center;opacity:0.5">Loading...</div>';

        var result = await sb.from('kanban_activity')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (result.error) {
            feed.innerHTML = '';
            return;
        }

        var items = result.data || [];
        if (items.length === 0) {
            feed.innerHTML = '<div class="activity-item" style="text-align:center;opacity:0.5">No activity yet</div>';
            return;
        }

        feed.innerHTML = items.map(function (a) {
            var userName = USERS[a.user_name] || a.user_name;
            var initial = userName.charAt(0);
            var color = USER_COLORS[a.user_name] || '#6b7280';
            var avatar = '<span class="activity-avatar" style="background:' + color + '">' + initial + '</span>';

            if (a.action_type === 'comment') {
                return '<div class="activity-item comment">' +
                    '<div>' + avatar + '<span class="activity-user">' + escapeHtml(userName) + '</span> <span class="activity-time">' + relativeTime(a.created_at) + '</span></div>' +
                    '<div class="activity-content">' + escapeHtml(a.content) + '</div></div>';
            }

            var msg = formatActivityMessage(a);
            return '<div class="activity-item">' + avatar + '<span class="activity-user">' + escapeHtml(userName) + '</span> ' + msg + ' <span class="activity-time">' + relativeTime(a.created_at) + '</span></div>';
        }).join('');
    }

    function formatActivityMessage(a) {
        var meta = a.metadata || {};
        switch (a.action_type) {
            case 'create': return 'created this task';
            case 'move': return 'moved from ' + columnLabel(meta.from) + ' to ' + columnLabel(meta.to);
            case 'update': return 'updated this task';
            case 'assign': return 'assigned to ' + (USERS[meta.to] || meta.to || 'Unassigned');
            case 'delete': return 'deleted this task';
            case 'time_log': return 'logged ' + (meta.hours_added || 0) + 'h (total: ' + (meta.new_total || 0) + 'h)';
            case 'rollback': return 'rolled back to version ' + (meta.to_version || '?');
            default: return a.action_type;
        }
    }

    async function logActivity(taskId, actionType, content, metadata) {
        if (!activeBoard || !currentUser) return;

        await sb.from('kanban_activity').insert({
            task_id: taskId,
            board_id: activeBoard.id,
            user_name: currentUser,
            action_type: actionType,
            content: content || null,
            metadata: metadata || {}
        });
    }

    // ---- Save / Delete ----

    function openModal() {
        document.getElementById('taskModal').classList.add('open');
        setTimeout(function () { document.getElementById('taskTitleInput').focus(); }, 100);
    }

    window.closeModal = function () {
        document.getElementById('taskModal').classList.remove('open');
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('deleteTaskBtn').style.display = 'none';
        document.getElementById('modalTitle').textContent = 'New Task';
        document.getElementById('activityPanel').style.display = 'none';
        document.getElementById('modalMetadata').style.display = 'none';
        document.getElementById('mdPreview').style.display = 'none';
        document.getElementById('taskDesc').style.display = '';
        document.getElementById('mdPreviewToggle').textContent = 'Preview';
        modalLabels = [];
        modalSubtasks = [];
        modalBlockedBy = [];
        modalAttachments = [];

        // Reset version panel to activity tab
        document.getElementById('activityContent').style.display = '';
        document.getElementById('versionsContent').style.display = 'none';
        document.getElementById('branchStatusPanel').style.display = 'none';
        var tabs = document.querySelectorAll('.panel-tab');
        tabs.forEach(function (t) {
            t.classList.toggle('active', t.dataset.panel === 'activity');
        });

        // Stop timer display (timer keeps running in background)
        if (timerInterval) {
            // Don't stop the timer, just stop the UI interval
            clearInterval(timerInterval);
            timerInterval = null;
        }
    };

    window.saveTask = async function (e) {
        e.preventDefault();

        var id = document.getElementById('taskId').value;
        var title = document.getElementById('taskTitleInput').value.trim();
        var description = document.getElementById('taskDesc').value.trim() || null;
        var priority = document.getElementById('taskPriority').value;
        var column_name = document.getElementById('taskColumn').value;
        var assigned_to = document.getElementById('taskAssignee').value || null;
        var due_date = document.getElementById('taskDue').value || null;
        var estimated_hours = parseFloat(document.getElementById('taskEstimatedHours').value) || null;

        if (!title) return;

        var payload = {
            title: title,
            description: description,
            priority: priority,
            column_name: column_name,
            assigned_to: assigned_to,
            due_date: due_date,
            labels: modalLabels,
            subtasks: modalSubtasks,
            blocked_by: modalBlockedBy,
            estimated_hours: estimated_hours
        };

        if (id) {
            var existing = tasks.find(function (t) { return t.id === id; });
            var result = await sb.from('kanban_tasks').update(payload).eq('id', id);

            if (result.error) {
                console.error('Failed to update task:', result.error);
                showToast('Failed to update task', 'error');
                return;
            }

            if (existing) {
                if (existing.assigned_to !== assigned_to) {
                    logActivity(id, 'assign', null, { from: existing.assigned_to, to: assigned_to });
                }
                if (existing.column_name !== column_name) {
                    logActivity(id, 'move', null, { from: existing.column_name, to: column_name });
                }
            }
            logActivity(id, 'update', null, {});

            if (existing) {
                Object.assign(existing, payload);
            }
            showToast('Task updated', 'success');
        } else {
            payload.board_id = activeBoard.id;
            payload.created_by = currentUser;
            payload.source = 'human';
            var colTasks = tasks.filter(function (t) { return t.column_name === column_name; });
            payload.position = colTasks.length;

            var result = await sb.from('kanban_tasks').insert(payload).select().single();

            if (result.error) {
                console.error('Failed to create task:', result.error);
                showToast('Failed to create task', 'error');
                return;
            }

            tasks.push(result.data);
            showToast('Task created', 'success');
            logActivity(result.data.id, 'create', null, { title: title });
        }

        closeModal();
        renderTasks();
        updateCounts();
        updateStats();
        updateWipLimits();
        initSortable();
    };

    window.deleteTask = async function () {
        var id = document.getElementById('taskId').value;
        if (!id || !confirm('Delete this task?')) return;

        var result = await sb.from('kanban_tasks').delete().eq('id', id);
        if (result.error) {
            console.error('Failed to delete task:', result.error);
            showToast('Failed to delete task', 'error');
            return;
        }

        tasks = tasks.filter(function (t) { return t.id !== id; });
        closeModal();
        renderTasks();
        updateCounts();
        updateStats();
        updateWipLimits();
        initSortable();
        showToast('Task deleted', 'info');
    };

    // ---- Toast Notifications ----

    function showToast(message, type) {
        type = type || 'info';
        var container = document.getElementById('toastContainer');
        var icons = {
            success: '&#10003;',
            error: '&#10007;',
            info: '&#8505;'
        };

        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' + escapeHtml(message);
        container.appendChild(toast);

        setTimeout(function () {
            toast.classList.add('removing');
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    }

    // ---- Helpers ----

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showError(msg) {
        var loading = document.getElementById('kanbanLoading');
        loading.innerHTML = '<span style="color:var(--color-error)">' + msg + '. Check console for details.</span>';
        loading.style.display = 'flex';
    }

    // ---- Boot ----

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
