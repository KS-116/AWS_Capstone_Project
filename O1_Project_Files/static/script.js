/**
 * Virtual Career Counselor - Vanilla JavaScript
 * Handles chat interactions, toast notifications, and UI interactions
 */

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

/**
 * Display a toast notification to the user
 * @param {string} message - The message to display
 * @param {string} type - Type of toast: 'success', 'error', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    
    if (!container) {
        console.error('[v0] Toast container not found');
        return;
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '•'}</span>
        <span class="toast-message">${message}</span>
    `;

    // Add to container
    container.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'fade-out 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);

    console.log(`[v0] Toast ${type}:`, message);
}

// ============================================================================
// CHAT FUNCTIONALITY
// ============================================================================

/**
 * Send a chat message to the AI counselor
 */
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

    // Add user message to chat
    addChatMessage(message, 'user');

    // Clear input
    input.value = '';
    input.focus();

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addChatMessage(aiResponse, 'ai');
    }, 800);
}

/**
 * Handle Enter key press in chat input
 * @param {Event} event - Keyboard event
 */
function handleChatKeypress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

/**
 * Add a message to the chat display
 * @param {string} text - Message text
 * @param {string} sender - 'user' or 'ai'
 */
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

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    console.log(`[v0] ${sender.toUpperCase()} message added: ${text.substring(0, 50)}...`);
}

/**
 * Generate a mock AI response based on user input
 * @param {string} userMessage - User's message
 * @returns {string} - AI response
 */
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Simple keyword-based responses
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

    // Find matching response
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }

    // Default response
    return 'That\'s a great question! Based on your career goals, I recommend focusing on developing skills in high-demand areas. Would you like me to create a personalized learning roadmap for you?';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// SKILL PROGRESS BAR ANIMATIONS
// ============================================================================

/**
 * Animate skill progress bars on page load
 */
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');

    skillBars.forEach((bar) => {
        const targetWidth = bar.getAttribute('data-width') || '60';
        let currentWidth = 0;
        const increment = parseInt(targetWidth) / 30; // Animate over 30 frames

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

// ============================================================================
// MODAL MANAGEMENT
// ============================================================================

/**
 * Toggle modal visibility
 * @param {string} modalId - ID of the modal element
 */
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

/**
 * Close modal on background click
 * @param {Event} event - Click event
 * @param {string} modalId - ID of the modal
 */
function closeModalOnBackdropClick(event, modalId) {
    const modal = document.getElementById(modalId);

    if (event.target === modal) {
        modal.classList.add('hidden');
        console.log(`[v0] Modal "${modalId}" closed via backdrop`);
    }
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with strength level
 */
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

    // Determine strength
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
        result.strength = 'strong';
    } else if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        result.strength = 'medium';
    }

    console.log('[v0] Password validation:', result.strength);
    return result;
}

// ============================================================================
// DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Add a new learning goal
 * @param {string} goal - The learning goal
 */
function addLearningGoal(goal) {
    if (!goal.trim()) {
        showToast('Please enter a goal', 'error');
        return;
    }

    console.log('[v0] New learning goal added:', goal);
    showToast(`Goal "${goal}" added to your learning path!`, 'success');

    // In production, send to Flask backend
    // fetch('/api/goals', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ goal })
    // })
}

/**
 * Navigate to a specific section
 * @param {string} sectionId - ID of the section to navigate to
 */
function navigateTo(sectionId) {
    const element = document.getElementById(sectionId);

    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        console.log(`[v0] Navigated to section: ${sectionId}`);
    } else {
        console.error(`[v0] Section with ID "${sectionId}" not found`);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application on page load
 */
function initializeApp() {
    console.log('[v0] Initializing Virtual Career Counselor...');

    // Animate skill bars if they exist
    setTimeout(animateSkillBars, 300);

    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Press 'Escape' to close modals
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

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
