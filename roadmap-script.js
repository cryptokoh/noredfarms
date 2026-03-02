/* ============================================
   Project Details - JavaScript
   ============================================ */

// Task Management System
class TaskManager {
    constructor() {
        this.storageKey = 'noredfarms-tasks';
        this.tasks = this.loadTasks();
        this.currentStatus = 'backlog';
        this.draggedCard = null;

        this.init();
    }

    init() {
        this.renderAllTasks();
        this.updateCounts();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateStats();
    }

    // Local Storage Operations
    loadTasks() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        // Default tasks if none exist
        return this.getDefaultTasks();
    }

    saveTasks() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    getDefaultTasks() {
        return [
            // ===== GARDEN & GROWING ZONE FEATURES =====
            {
                id: this.generateId(),
                title: 'Interactive Growing Zone Map',
                description: 'US map with USDA hardiness zones - click your zone to see what plants thrive there. Native vs non-native recommendations for outdoor growing.',
                priority: 'high',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Zone-Based Plant Database',
                description: 'Database of plants categorized by growing zone, with native/non-native tags, care requirements, and growing tips.',
                priority: 'high',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Greenhouse & Garden Design Library',
                description: 'Free design templates for greenhouses and gardens organized by zone and scale (small/medium/large). Include materials lists and basic layouts.',
                priority: 'high',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },

            // ===== EDUCATION & PAID COURSES =====
            {
                id: this.generateId(),
                title: 'Course Platform Infrastructure',
                description: 'Build course/class system with free tier (basic info) and paid tier (advanced). User accounts, progress tracking, video hosting.',
                priority: 'high',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Advanced Greenhouse Design Course',
                description: 'PAID: Professional greenhouse design for various climates. Climate control, ventilation, automation, and structural engineering.',
                priority: 'medium',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Irrigation System Design Course',
                description: 'PAID: Drip systems, automated watering, water management for different scales. From backyard to commercial.',
                priority: 'medium',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Advanced Nutrient Delivery Course',
                description: 'PAID: Commercial/large-scale nutrient analysis and delivery systems. Fertigation, soil testing, optimization for different crops.',
                priority: 'medium',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Free Basic Growing Guides',
                description: 'FREE content tier: Home-scale growing guides, basic nutrient info, starter greenhouse plans, beginner irrigation.',
                priority: 'medium',
                category: 'docs',
                status: 'backlog',
                createdAt: Date.now()
            },

            // ===== E-COMMERCE CORE =====
            {
                id: this.generateId(),
                title: 'Payment Integration',
                description: 'Stripe payment processing for products AND course purchases. Handle subscriptions for course access.',
                priority: 'high',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'User Authentication',
                description: 'User accounts for purchases, course access, saved growing zone preferences, and order history.',
                priority: 'high',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },

            // ===== SITE ENHANCEMENTS =====
            {
                id: this.generateId(),
                title: 'Search Functionality',
                description: 'Search across products, plants, courses, and growing guides with filters.',
                priority: 'medium',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Email Notifications',
                description: 'Order confirmations, course access, newsletter with seasonal growing tips.',
                priority: 'medium',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            },
            {
                id: this.generateId(),
                title: 'Analytics Integration',
                description: 'Google Analytics 4 and conversion tracking setup',
                priority: 'low',
                category: 'feature',
                status: 'backlog',
                createdAt: Date.now()
            }
        ];
    }

    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // CRUD Operations
    addTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            category: taskData.category || 'feature',
            status: taskData.status || 'backlog',
            createdAt: Date.now()
        };
        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
        this.updateCounts();
        this.updateStats();
        return task;
    }

    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.updateCounts();
            this.updateStats();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        const cardEl = document.querySelector(`[data-task-id="${taskId}"]`);
        if (cardEl) {
            cardEl.remove();
        }
        this.updateCounts();
        this.updateStats();
    }

    moveTask(taskId, newStatus) {
        this.updateTask(taskId, { status: newStatus });
        const cardEl = document.querySelector(`[data-task-id="${taskId}"]`);
        const targetColumn = document.querySelector(`[data-status="${newStatus}"] .kanban-cards`);
        if (cardEl && targetColumn) {
            targetColumn.appendChild(cardEl);
        }
    }

    // Rendering
    renderAllTasks() {
        // Clear all columns
        document.querySelectorAll('.kanban-cards').forEach(col => col.innerHTML = '');

        // Render each task
        this.tasks.forEach(task => this.renderTask(task));

        // Add empty states where needed
        this.updateEmptyStates();
    }

    renderTask(task) {
        const statusMap = {
            'backlog': 'backlogCards',
            'in-progress': 'inProgressCards',
            'review': 'reviewCards',
            'done': 'doneCards'
        };

        const containerId = statusMap[task.status];
        const container = document.getElementById(containerId);
        if (!container) return;

        const cardHtml = `
            <div class="kanban-card" data-task-id="${task.id}" draggable="true">
                <div class="card-header">
                    <span class="card-title">${this.escapeHtml(task.title)}</span>
                    <span class="card-priority ${task.priority}" title="${task.priority} priority"></span>
                </div>
                ${task.description ? `<p class="card-desc">${this.escapeHtml(task.description)}</p>` : ''}
                <div class="card-footer">
                    <span class="card-category ${task.category}">${task.category}</span>
                    <div class="card-actions">
                        <button class="card-action-btn move-btn" title="Move to next status" data-task-id="${task.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                        <button class="card-action-btn delete-btn" title="Delete task" data-task-id="${task.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHtml);

        // Add event listeners to the new card
        const card = container.lastElementChild;
        this.setupCardEvents(card);
    }

    setupCardEvents(card) {
        const taskId = card.dataset.taskId;

        // Move button
        const moveBtn = card.querySelector('.move-btn');
        if (moveBtn) {
            moveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.moveToNextStatus(taskId);
            });
        }

        // Delete button
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this task?')) {
                    this.deleteTask(taskId);
                    this.updateEmptyStates();
                }
            });
        }

        // Drag events
        card.addEventListener('dragstart', (e) => this.handleDragStart(e));
        card.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }

    moveToNextStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const statusOrder = ['backlog', 'in-progress', 'review', 'done'];
        const currentIndex = statusOrder.indexOf(task.status);
        if (currentIndex < statusOrder.length - 1) {
            const newStatus = statusOrder[currentIndex + 1];
            this.moveTask(taskId, newStatus);
            this.updateEmptyStates();
        }
    }

    updateCounts() {
        const counts = {
            backlog: 0,
            'in-progress': 0,
            review: 0,
            done: 0
        };

        this.tasks.forEach(task => {
            if (counts.hasOwnProperty(task.status)) {
                counts[task.status]++;
            }
        });

        document.getElementById('backlogCount').textContent = counts.backlog;
        document.getElementById('inProgressCount').textContent = counts['in-progress'];
        document.getElementById('reviewCount').textContent = counts.review;
        document.getElementById('doneCount').textContent = counts.done;
    }

    updateStats() {
        const inProgressCount = this.tasks.filter(t => t.status === 'in-progress').length;
        const todoCountEl = document.getElementById('todoCount');
        if (todoCountEl) {
            todoCountEl.textContent = inProgressCount;
        }
    }

    updateEmptyStates() {
        const columns = ['backlog', 'in-progress', 'review', 'done'];
        const containerIds = ['backlogCards', 'inProgressCards', 'reviewCards', 'doneCards'];

        columns.forEach((status, index) => {
            const container = document.getElementById(containerIds[index]);
            const count = this.tasks.filter(t => t.status === status).length;

            // Remove existing empty state
            const existingEmpty = container.querySelector('.empty-state');
            if (existingEmpty) existingEmpty.remove();

            if (count === 0) {
                const emptyHtml = `
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                        </svg>
                        <p>No tasks here</p>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', emptyHtml);
            }
        });
    }

    // Drag and Drop
    setupDragAndDrop() {
        const columns = document.querySelectorAll('.kanban-cards');

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => this.handleDragOver(e));
            column.addEventListener('drop', (e) => this.handleDrop(e));
            column.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    handleDragStart(e) {
        this.draggedCard = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedCard = null;
        document.querySelectorAll('.kanban-cards').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const taskId = e.dataTransfer.getData('text/plain');
        const targetColumn = e.currentTarget.closest('.kanban-column');
        const newStatus = targetColumn.dataset.status;

        if (this.draggedCard && newStatus) {
            this.moveTask(taskId, newStatus);
            this.updateEmptyStates();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Add task buttons
        document.querySelectorAll('.add-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentStatus = btn.dataset.status;
                this.openModal();
            });
        });

        // Modal
        const modal = document.getElementById('addTaskModal');
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelTask');
        const form = document.getElementById('addTaskForm');

        modalClose?.addEventListener('click', () => this.closeModal());
        cancelBtn?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Navigation toggle (from main site)
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }
    }

    openModal() {
        const modal = document.getElementById('addTaskModal');
        modal?.classList.add('active');
        document.getElementById('taskTitle')?.focus();
    }

    closeModal() {
        const modal = document.getElementById('addTaskModal');
        modal?.classList.remove('active');
        document.getElementById('addTaskForm')?.reset();
    }

    handleFormSubmit(e) {
        const formData = new FormData(e.target);
        const task = {
            title: formData.get('taskTitle'),
            description: formData.get('taskDescription'),
            priority: formData.get('taskPriority'),
            category: formData.get('taskCategory'),
            status: this.currentStatus
        };

        if (task.title.trim()) {
            this.addTask(task);
            this.closeModal();
            this.updateEmptyStates();
        }
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// Add drag-over styles
const style = document.createElement('style');
style.textContent = `
    .kanban-cards.drag-over {
        background: var(--color-primary-subtle);
        border-radius: var(--radius-lg);
    }
`;
document.head.appendChild(style);
