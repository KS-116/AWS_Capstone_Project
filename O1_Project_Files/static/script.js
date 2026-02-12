function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    if (!container) {
        console.error('[v0] Toast container not found');
        return;
    }

    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '•'}</span>
        <span class="toast-message">${message}</span>
    `;

    
    container.appendChild(toast);

    
    setTimeout(() => {
        toast.style.animation = 'fade-out 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);

    console.log(`[v0] Toast ${type}:`, message);
}


function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');

    if (!input || !messagesContainer) {
        console.error('[v0] Chat elements not found');
        return;
    }

    const message = input.value.trim();

    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }

    console.log('[v0] Sending message:', message);

    
    addChatMessage(message, 'user');

    
    input.value = '';
    input.focus();

    
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addChatMessage(aiResponse, 'ai');
    }, 800);
}


function handleChatKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}


function addChatMessage(text, sender = 'ai') {
    const messagesContainer = document.getElementById('chat-messages');

    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex gap-3 items-start animate-slide-in-${sender === 'user' ? 'right' : 'left'}`;

    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-bubble user ml-auto mr-0">
                <p class="text-sm">${escapeHtml(text)}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-sm font-bold">
                U
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0099cc] flex-shrink-0 flex items-center justify-center text-sm">AI</div>
            <div class="message-bubble ai">
                <p class="text-sm">${escapeHtml(text)}</p>
            </div>
        `;
    }

    messagesContainer.appendChild(messageDiv);

    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    console.log(`[v0] ${sender.toUpperCase()} message added: ${text.substring(0, 50)}...`);
}


function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    
    const responses = {
        'career change': 'Career changes are exciting! Let me help you identify transferable skills and create a transition plan. What industry are you currently in, and where would you like to move to?',
        'skills': 'To identify skill gaps, I can analyze your current profile against target roles. What position interests you most?',
        'salary': 'Salary varies by role, experience, and location. Would you like me to analyze compensation trends for your target position?',
        'promotion': 'Great goal! I can help you map out the skills and experience needed for your next promotion. What\'s your target role?',
        'certification': 'Certifications can boost your profile significantly. Which industry are you interested in? I can recommend relevant certifications.',
        'hello': 'Hi there! How can I help you with your career today?',
        'hi': 'Hi there! How can I help you with your career today?',
        'help': 'I can assist with career planning, skill gap analysis, resume building, and more. What would you like to work on?',
    };

    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }

    
    return 'That\'s a great question! Based on your career goals, I recommend focusing on developing skills in high-demand areas. Would you like me to create a personalized learning roadmap for you?';
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');

    skillBars.forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width') || '60';
        let currentWidth = 0;
        const increment = parseInt(targetWidth) / 30; 

        const animate = () => {
            currentWidth += increment;
            if (currentWidth < parseInt(targetWidth)) {
                bar.style.width = `${currentWidth}%`;
                requestAnimationFrame(animate);
            } else {
                bar.style.width = `${targetWidth}%`;
            }
        };

        animate();
    });

    console.log('[v0] Skill bars animation started');
}


function toggleModal(modalId) {
    const modal = document.getElementById(modalId);

    if (!modal) {
        console.error(`[v0] Modal with ID "${modalId}" not found`);
        return;
    }

    const isHidden = modal.classList.contains('hidden');

    if (isHidden) {
        modal.classList.remove('hidden');
        modal.classList.add('animate-fade-in');
        console.log(`[v0] Modal "${modalId}" opened`);
    } else {
        modal.classList.add('hidden');
        console.log(`[v0] Modal "${modalId}" closed`);
    }
}


function closeModalOnBackdropClick(event, modalId) {
    const modal = document.getElementById(modalId);

    if (event.target === modal) {
        modal.classList.add('hidden');
        console.log(`[v0] Modal "${modalId}" closed via backdrop`);
    }
}


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function validatePassword(password) {
    const result = {
        isValid: password.length >= 8,
        strength: 'weak',
        feedback: [],
    };

    if (password.length < 8) {
        result.feedback.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        result.feedback.push('Add uppercase letters for stronger security');
    }
    if (!/[0-9]/.test(password)) {
        result.feedback.push('Add numbers for stronger security');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        result.feedback.push('Add special characters for strongest security');
    }

    
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
        result.strength = 'strong';
    } else if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        result.strength = 'medium';
    }

    console.log('[v0] Password validation:', result.strength);
    return result;
}


function addLearningGoal(goal) {
    if (!goal.trim()) {
        showToast('Please enter a goal', 'error');
        return;
    }

    console.log('[v0] New learning goal added:', goal);
    showToast(`Goal "${goal}" added to your learning path!`, 'success');

    
}


function navigateTo(sectionId) {
    const element = document.getElementById(sectionId);

    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        console.log(`[v0] Navigated to section: ${sectionId}`);
    } else {
        console.error(`[v0] Section with ID "${sectionId}" not found`);
    }
}


function initializeApp() {
    console.log('[v0] Initializing Virtual Career Counselor...');

    
    setTimeout(animateSkillBars, 300);

    
    document.addEventListener('keydown', (event) => {
        
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('[id$="-modal"]');
            modals.forEach((modal) => {
                if (!modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                }
            });
        }
    });

    console.log('[v0] Application initialized successfully');
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
