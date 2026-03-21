/* ═══════════════════════════════════════════════════════════
   FencePro AI — High-Efficiency App Engine
   Branding Implementation: Superior Fence & Rail
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Luxide
    if (window.lucide) lucide.createIcons();

    // ── DOM References ──
    const menuButtons = document.querySelectorAll('.menu-item, .m-btn');
    const modules = document.querySelectorAll('.module');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatWindow = document.getElementById('chat-window');
    const documentsGrid = document.getElementById('documents-grid');
    const toolsGrid = document.getElementById('tools-grid');

    // ── State ──
    let chatHistory = [];

    initApp();

    async function initApp() {
        updateAppDynamics();
        checkApiStatus();
        loadDocuments();
        loadTools();
        
        // Real-time app updates
        setInterval(updateAppDynamics, 1000);
        setInterval(checkApiStatus, 30000);
    }

    // ── App Logic ──
    function updateAppDynamics() {
        const now = new Date();
        
        // Update Time
        const clockEl = document.getElementById('header-date');
        if (clockEl) {
            clockEl.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            }).toUpperCase();
        }

        // Update Greeting
        const hour = now.getHours();
        const greetingEl = document.getElementById('greeting-time');
        const typeEl = document.getElementById('greeting-type');
        if (greetingEl) {
            if (hour < 12) {
                greetingEl.textContent = 'MORNING';
                if (typeEl) typeEl.textContent = 'GOOD';
            } else if (hour < 17) {
                greetingEl.textContent = 'AFTERNOON';
                if (typeEl) typeEl.textContent = 'GOOD';
            } else {
                greetingEl.textContent = 'EVENING';
                if (typeEl) typeEl.textContent = 'GOOD';
            }
        }
    }

    async function checkApiStatus() {
        const statusPills = document.querySelectorAll('.status-pulse');
        const aiStatusText = document.getElementById('ai-status-text');
        const widgetStatus = document.getElementById('stat-bob-status');

        try {
            const response = await fetch('/api/status');
            const data = await response.json();

            statusPills.forEach(p => {
                p.style.backgroundColor = data.aiConfigured ? '#10b981' : '#f59e0b';
                p.style.boxShadow = data.aiConfigured ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none';
            });

            if (aiStatusText) {
                aiStatusText.textContent = data.aiConfigured ? 'FENCE-PRO ACTIVE' : 'API KEY MISSING';
                aiStatusText.style.color = data.aiConfigured ? '' : 'var(--superior-maroon)';
            }

            if (widgetStatus) {
                widgetStatus.textContent = data.aiConfigured ? 'READY' : 'OFFLINE';
                widgetStatus.style.color = data.aiConfigured ? 'var(--superior-green)' : 'var(--superior-maroon)';
            }
        } catch (err) {
            statusPills.forEach(p => p.style.backgroundColor = '#ef4444');
            if (aiStatusText) aiStatusText.textContent = 'COMMAND OFFLINE';
            if (widgetStatus) widgetStatus.textContent = 'ERROR';
        }
    }

    // ── Module Navigation ──
    function navigateTo(moduleId) {
        menuButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === moduleId);
        });

        modules.forEach(mod => {
            mod.classList.toggle('active', mod.id === `section-${moduleId}`);
        });

        // Focus assistant input if needed
        if (moduleId === 'assistant') {
            setTimeout(() => messageInput.focus(), 300);
        }

        if (window.lucide) lucide.createIcons();
    }

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.section));
    });

    document.querySelectorAll('[data-navigate]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.navigate));
    });

    // ── Big Bob Consultation ──
    async function sendMessage(text) {
        const message = (text || messageInput.value).trim();
        if (!message) return;

        addMessage(message, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';

        const typingEl = showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory.slice(-10)
                }),
            });

            const data = await response.json();
            removeTypingIndicator(typingEl);

            const reply = data.reply || data.error || 'System error. Recalibrate and try again.';
            addMessage(reply, 'assistant');
        } catch (error) {
            removeTypingIndicator(typingEl);
            addMessage('No handshake with Superior Core. Connection failed.', 'assistant');
        }
    }

    function addMessage(text, sender) {
        chatHistory.push({
            role: sender === 'user' ? 'user' : 'model',
            text: text
        });

        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'outgoing' : 'incoming');

        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.innerHTML = formatMessage(text);

        msgDiv.appendChild(bubble);
        chatMessages.appendChild(msgDiv);

        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/((?:^|\<br\>)[\s]*[-•]\s.+(?:\<br\>[\s]*[-•]\s.+)*)/g, (match) => {
                const items = match.split('<br>').filter(i => i.trim().match(/^[-•]\s/));
                if (items.length === 0) return match;
                return `<ul>${items.map(i => `<li>${i.trim().replace(/^[-•]\s/, '')}</li>`).join('')}</ul>`;
            });
    }

    function showTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message', 'incoming');
        wrapper.innerHTML = `<div class="bubble"><em>Analyzing shift data...</em></div>`;
        chatMessages.appendChild(wrapper);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return wrapper;
    }

    function removeTypingIndicator(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    // Controls
    if (sendButton) sendButton.addEventListener('click', () => sendMessage());
    if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    document.querySelectorAll('.p-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            messageInput.value = prompt;
            sendMessage(prompt);
        });
    });

    // ── Data Loading ──
    async function loadDocuments() {
        if (!documentsGrid) return;
        try {
            const response = await fetch('/api/documents');
            const data = await response.json();
            renderDocuments(data.categories);
        } catch (err) {
            documentsGrid.innerHTML = '<p>Documents Offline.</p>';
        }
    }

    function renderDocuments(categories) {
        documentsGrid.innerHTML = '';
        let totalDocs = 0;
        
        categories.forEach(cat => {
            totalDocs += cat.docs.length;
            cat.docs.forEach(doc => {
                const item = document.createElement('div');
                item.className = 'widget';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                    <div style="display:flex; gap:15px; align-items:center;">
                        <i data-lucide="file-text" style="color:var(--superior-maroon)"></i>
                        <div style="flex:1">
                            <strong style="text-transform:uppercase; font-family:var(--font-heading); font-size:0.9rem;">${doc.name}</strong>
                            <p style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">SOP REFERENCE • ${doc.status}</p>
                        </div>
                        <i data-lucide="chevron-right" style="color:#ccc"></i>
                    </div>
                `;
                item.addEventListener('click', () => window.open(doc.url, '_blank'));
                documentsGrid.appendChild(item);
            });
        });

        // Update Dashboard Stat
        const docsCountEl = document.getElementById('stat-docs-count');
        if (docsCountEl) docsCountEl.textContent = totalDocs;

        if (window.lucide) lucide.createIcons();
    }

    async function loadTools() {
        if (!toolsGrid) return;
        try {
            const response = await fetch('/api/tools');
            const data = await response.json();
            renderTools(data.tools);
        } catch (err) {
            toolsGrid.innerHTML = '<p>Tools Offline.</p>';
        }
    }

    function renderTools(tools) {
        toolsGrid.innerHTML = '';
        tools.forEach(tool => {
            const item = document.createElement('div');
            item.className = 'widget';
            item.innerHTML = `
                <div style="display:flex; gap:15px; align-items:center;">
                    <i data-lucide="${tool.icon}" style="color:var(--superior-green)"></i>
                    <div style="flex:1">
                        <strong style="text-transform:uppercase; font-family:var(--font-heading); font-size:0.9rem;">${tool.name}</strong>
                        <p style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">${tool.category}</p>
                    </div>
                </div>
            `;
            toolsGrid.appendChild(item);
        });
        if (window.lucide) lucide.createIcons();
    }
});