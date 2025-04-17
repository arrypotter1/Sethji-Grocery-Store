// DOM Elements
const customerChatInput = document.getElementById('customerChatInput');
const customerSendBtn = document.getElementById('customerSendBtn');
const customerChatContainer = document.getElementById('customerChatContainer');

const supplierChatInput = document.getElementById('supplierChatInput');
const supplierSendBtn = document.getElementById('supplierSendBtn');
const supplierChatContainer = document.getElementById('supplierChatContainer');

const callButton = document.getElementById('callButton');
const metricsContainer = document.getElementById('metrics');

// Event Listeners
if (customerSendBtn) {
    customerSendBtn.addEventListener('click', () => sendCustomerMessage());
}

if (customerChatInput) {
    customerChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendCustomerMessage();
        }
    });
}

if (supplierSendBtn) {
    supplierSendBtn.addEventListener('click', () => sendSupplierMessage());
}

if (supplierChatInput) {
    supplierChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendSupplierMessage();
        }
    });
}

if (callButton) {
    callButton.addEventListener('click', () => {
        // Only activate the avatar animation, don't send messages to chat panels
        activateAvatar();
        
        // Instead of showing messages, just log to console
        console.log("Voice activation: Sethji assistant activated");
        
        // Show a visual confirmation that the call is active
        callButton.classList.add('active');
        
        // Remove the active class after the animation ends (20 seconds)
        setTimeout(() => {
            callButton.classList.remove('active');
        }, 20000);
    });
}

// Chat Functions
function sendCustomerMessage() {
    const message = customerChatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(customerChatContainer, message, false);
    customerChatInput.value = '';
    
    // Show loading indicator
    const loadingId = showLoadingIndicator(customerChatContainer);
    
    // Process message with backend
    fetch('/api/customer/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading indicator
        removeLoadingIndicator(loadingId);
        
        if (data.status === 'success') {
            // Add response to chat
            addChatMessage(customerChatContainer, data.response, true);
            
            // Activate avatar animation
            activateAvatar();
            
            // Update metrics if available
            updateInventoryMetrics();
        } else {
            addChatMessage(customerChatContainer, "Sorry, there was an error processing your request.", true);
        }
    })
    .catch(error => {
        // Remove loading indicator
        removeLoadingIndicator(loadingId);
        console.error('Error:', error);
        addChatMessage(customerChatContainer, "Sorry, there was an error processing your request.", true);
    });
}

function sendSupplierMessage() {
    const message = supplierChatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(supplierChatContainer, message, false);
    supplierChatInput.value = '';
    
    // Show loading indicator
    const loadingId = showLoadingIndicator(supplierChatContainer);
    
    // Process message with backend
    fetch('/api/supplier/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading indicator
        removeLoadingIndicator(loadingId);
        
        if (data.status === 'success') {
            // Add response to chat
            addChatMessage(supplierChatContainer, data.response, true);
            
            // Activate avatar animation
            activateAvatar();
            
            // Update metrics if available
            updateInventoryMetrics();
        } else {
            addChatMessage(supplierChatContainer, "Sorry, there was an error processing your request.", true);
        }
    })
    .catch(error => {
        // Remove loading indicator
        removeLoadingIndicator(loadingId);
        console.error('Error:', error);
        addChatMessage(supplierChatContainer, "Sorry, there was an error processing your request.", true);
    });
}

function addChatMessage(container, message, isIncoming) {
    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        container.removeChild(emptyState);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    
    if (isIncoming) {
        messageElement.classList.add('message-incoming');
    } else {
        messageElement.classList.add('message-outgoing');
    }
    
    // Add message content with proper formatting
    messageElement.innerHTML = formatMessageText(message);
    
    // Add message to container
    container.appendChild(messageElement);
    
    // Add subtle animation for new messages
    setTimeout(() => {
        messageElement.classList.add('visible');
    }, 10);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Format message text to add links, emojis, and line breaks
function formatMessageText(text) {
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br>');
    
    // Make URLs clickable
    text = text.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    return text;
}

// Loading indicator functions
function showLoadingIndicator(container) {
    const loadingId = `loading-${Date.now()}`;
    const loadingElement = document.createElement('div');
    loadingElement.id = loadingId;
    loadingElement.classList.add('chat-message', 'message-incoming', 'loading');
    loadingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    
    container.appendChild(loadingElement);
    container.scrollTop = container.scrollHeight;
    
    return loadingId;
}

function removeLoadingIndicator(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Update inventory metrics with animation
function updateInventoryMetrics() {
    fetch('/api/metrics')
        .then(response => response.json())
        .then(data => {
            if (metricsContainer) {
                // Add update animation to metrics
                const metricCards = metricsContainer.querySelectorAll('.metric-card');
                metricCards.forEach(card => {
                    card.classList.add('updating');
                    setTimeout(() => {
                        card.classList.remove('updating');
                    }, 1000);
                });
            }
            console.log("Updated metrics:", data);
        })
        .catch(error => {
            console.error('Error fetching metrics:', error);
        });
}

// Initialize some example data
function initializeExampleData() {
    if (customerChatContainer && customerChatContainer.querySelector('.empty-state')) {
        addChatMessage(customerChatContainer, "Hello, I would like to order some Lotte Chocopie.", false);
        addChatMessage(customerChatContainer, "I have found Lotte Chocopie in stock. We have 24 packs available at ₹40 each. How many would you like to order?", true);
    }
    
    if (supplierChatContainer && supplierChatContainer.querySelector('.empty-state')) {
        addChatMessage(supplierChatContainer, "I have a new shipment of rice bags available. Do you need to restock?", false);
        addChatMessage(supplierChatContainer, "Yes, we're running low on rice. Please send your current price list and available quantities.", true);
    }
    
    // Initialize the animated metrics
    initializeAnimatedMetrics();
}

// Initialize animated metrics
function initializeAnimatedMetrics() {
    if (!metricsContainer) return;
    
    const metricCards = metricsContainer.querySelectorAll('.metric-card');
    
    metricCards.forEach((card, index) => {
        // Add a slight delay to each card for a staggered animation
        setTimeout(() => {
            card.classList.add('animate-in');
            
            // Remove the class after animation completes
            setTimeout(() => {
                card.classList.remove('animate-in');
            }, 1000);
        }, index * 150);
    });
}

// Add a dynamic updating effect to the CSS
function addDynamicStyleEffects() {
    const style = document.createElement('style');
    style.textContent = `
        /* Message animation */
        .chat-message {
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        
        .chat-message.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Metric card update animation */
        .metric-card.updating {
            animation: metricUpdate 1s ease-out;
        }
        
        @keyframes metricUpdate {
            0% {
                background-color: rgba(79, 70, 229, 0.02);
                box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
            }
            50% {
                background-color: rgba(79, 70, 229, 0.08);
                box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.5);
            }
            100% {
                background-color: transparent;
                box-shadow: var(--shadow-sm);
            }
        }
        
        /* Metric card entrance animation */
        .metric-card.animate-in {
            animation: metricAppear 0.6s ease-out forwards;
        }
        
        @keyframes metricAppear {
            0% {
                opacity: 0;
                transform: translateY(15px) scale(0.95);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        /* Call button active state */
        .action-btn.active {
            animation: buttonPulse 2s infinite;
            box-shadow: 0 0 0 rgba(79, 70, 229, 0.6);
        }
        
        @keyframes buttonPulse {
            0% {
                box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.6);
            }
            70% {
                box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add dynamic CSS effects
    addDynamicStyleEffects();
    
    // Setup tabs if they exist
    const tabEl = document.querySelector('#inventoryTabs');
    if (tabEl) {
        const tabs = new bootstrap.Tab(tabEl);
    }
    
    // Initialize example data for the demo
    setTimeout(initializeExampleData, 1000);
});
