/* ============================================
   Nored Farms - Floating Chat Widget
   ============================================ */

(function() {
    'use strict';

    // Create chat widget HTML
    const widgetHTML = `
        <button class="chat-widget-btn" id="chatWidgetBtn" aria-label="Ask a question">
            <svg class="chat-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <svg class="chat-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>

        <div class="chat-widget-panel" id="chatWidgetPanel">
            <div class="chat-panel-header">
                <h3>Ask Us Anything</h3>
                <p>Questions about plants, products, or services? We typically respond within a few hours.</p>
            </div>
            <div class="chat-panel-body">
                <form id="chatWidgetForm">
                    <div class="chat-form-group">
                        <label for="chatName">Your Name</label>
                        <input type="text" id="chatName" name="name" required placeholder="First name">
                    </div>
                    <div class="chat-form-group">
                        <label for="chatEmail">Email</label>
                        <input type="email" id="chatEmail" name="email" required placeholder="you@example.com">
                    </div>
                    <div class="chat-form-group">
                        <label for="chatTopic">Topic</label>
                        <select id="chatTopic" name="topic">
                            <option value="general">General Question</option>
                            <option value="products">Products &amp; Ordering</option>
                            <option value="growing">Growing &amp; Cultivation</option>
                            <option value="consulting">Consulting &amp; Design</option>
                            <option value="classes">Classes &amp; Education</option>
                            <option value="wholesale">Wholesale</option>
                        </select>
                    </div>
                    <div class="chat-form-group">
                        <label for="chatMessage">Your Question</label>
                        <textarea id="chatMessage" name="message" required placeholder="What would you like to know?"></textarea>
                    </div>
                    <button type="submit" class="chat-submit-btn" id="chatSubmitBtn">
                        <span>Send Message</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </form>
                <div class="chat-success" id="chatSuccess" style="display:none;">
                    <div class="chat-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <h4>Message Sent!</h4>
                    <p>Thanks for reaching out. We'll get back to you at the email you provided, usually within a few hours.</p>
                </div>
            </div>
        </div>
    `;

    // Inject widget into page
    const container = document.createElement('div');
    container.id = 'chatWidget';
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    // Widget behavior
    const btn = document.getElementById('chatWidgetBtn');
    const panel = document.getElementById('chatWidgetPanel');
    const form = document.getElementById('chatWidgetForm');
    const success = document.getElementById('chatSuccess');
    const submitBtn = document.getElementById('chatSubmitBtn');

    // Toggle panel
    btn.addEventListener('click', function() {
        const isOpen = panel.classList.contains('open');
        if (isOpen) {
            panel.classList.remove('open');
            btn.classList.remove('active');
        } else {
            panel.classList.add('open');
            btn.classList.add('active');
        }
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            panel.classList.remove('open');
            btn.classList.remove('active');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            panel.classList.remove('open');
            btn.classList.remove('active');
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('chatName').value.trim();
        const email = document.getElementById('chatEmail').value.trim();
        const topic = document.getElementById('chatTopic').value;
        const message = document.getElementById('chatMessage').value.trim();

        if (!name || !email || !message) return;

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Sending...';

        // Store message locally (for when backend is connected)
        const messages = JSON.parse(localStorage.getItem('nored_messages') || '[]');
        messages.push({
            name: name,
            email: email,
            topic: topic,
            message: message,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });
        localStorage.setItem('nored_messages', JSON.stringify(messages));

        // Simulate send delay then show success
        setTimeout(function() {
            form.style.display = 'none';
            success.style.display = 'block';

            // Reset form for next use
            setTimeout(function() {
                form.reset();
                form.style.display = 'block';
                success.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Send Message';
                panel.classList.remove('open');
                btn.classList.remove('active');
            }, 5000);
        }, 800);
    });
})();
