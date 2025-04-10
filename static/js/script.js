document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const ergoPatterns = document.querySelectorAll('.ergo-pattern');
    const ergoIcons = document.querySelectorAll('.ergo-icon');
    const particlesContainer = document.getElementById('particles-container');
    
    // Create particles
    if (particlesContainer) {
        createParticles();
    }
    
    // Function to create interactive particles
    function createParticles() {
        const particleCount = 30;
        const colors = [
            'var(--accent-color-1)',
            'var(--accent-color-2)',
            'var(--accent-color-3)',
            'var(--accent-color-4)'
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            const posX = Math.random() * window.innerWidth;
            const posY = Math.random() * window.innerHeight;
            
            // Random size
            const size = Math.random() * 4 + 2;
            
            // Random color
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Random animation duration
            const duration = Math.random() * 10 + 10;
            
            // Apply styles
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.animation = `particleFloat ${duration}s ease-in-out infinite`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // Function to get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (!isUser) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-robot';
            messageContent.appendChild(icon);
        }
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        const text = document.createElement('p');
        text.textContent = content;
        messageText.appendChild(text);
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();
        messageText.appendChild(timeSpan);
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Trigger background animation
        triggerBackgroundAnimation();
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }
    
    // Function to handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        const question = userInput.value.trim();
        if (!question) return;
        
        // Add user message
        addMessage(question, true);
        
        // Clear input
        userInput.value = '';
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: question })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add bot response
            addMessage(data.response);
            
        } catch (error) {
            console.error('Error:', error);
            typingIndicator.remove();
            addMessage('Sorry, something went wrong. Please try again.');
        }
    }
    
    // Function to trigger background animation
    function triggerBackgroundAnimation() {
        try {
            // Get all animated elements
            const floatingElements = document.querySelectorAll('.floating-element');
            const ergoIcons = document.querySelectorAll('.ergo-icon');
            const particles = document.querySelectorAll('.particle');
            const glowElements = document.querySelectorAll('.neon-glow');
            
            // Animate floating elements
            if (floatingElements.length > 0) {
                const randomFloats = Array.from(floatingElements)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2);
                
                randomFloats.forEach(element => {
                    if (element && element.classList) {
                        element.classList.add('active');
                        setTimeout(() => {
                            element.classList.remove('active');
                        }, 2000);
                    }
                });
            }
            
            // Animate particles
            if (particles.length > 0) {
                const randomParticles = Array.from(particles)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 5);
                
                randomParticles.forEach(particle => {
                    if (particle && particle.classList) {
                        particle.classList.add('active');
                        setTimeout(() => {
                            particle.classList.remove('active');
                        }, 1500);
                    }
                });
            }
            
            // Animate glow elements
            if (glowElements.length > 0) {
                const randomGlow = glowElements[Math.floor(Math.random() * glowElements.length)];
                if (randomGlow && randomGlow.style) {
                    randomGlow.style.opacity = '0.6';
                    setTimeout(() => {
                        randomGlow.style.opacity = '';
                    }, 1000);
                }
            }
            
            // Update icons based on message content
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage && lastMessage.classList.contains('bot') && ergoIcons.length > 0) {
                const messageText = lastMessage.querySelector('p').textContent.toLowerCase();
                
                // Reset all icons
                ergoIcons.forEach(icon => {
                    if (icon && icon.classList) {
                        icon.classList.remove('active');
                    }
                });
                
                // Update icons based on message content
                if (messageText.includes('chair') || messageText.includes('sitting')) {
                    ergoIcons[0]?.classList?.add('active');
                } else if (messageText.includes('desk') || messageText.includes('table')) {
                    ergoIcons[1]?.classList?.add('active');
                } else if (messageText.includes('posture') || messageText.includes('back')) {
                    ergoIcons[2]?.classList?.add('active');
                } else if (messageText.includes('keyboard') || messageText.includes('typing')) {
                    ergoIcons[3]?.classList?.add('active');
                } else if (messageText.includes('exercise') || messageText.includes('stretch')) {
                    ergoIcons[4]?.classList?.add('active');
                } else if (messageText.includes('spine') || messageText.includes('neck')) {
                    ergoIcons[5]?.classList?.add('active');
                }
            }
        } catch (error) {
            console.error('Animation error:', error);
            // Continue execution even if animation fails
        }
    }
    
    // Mouse movement effect
    document.addEventListener('mousemove', (e) => {
        try {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Move floating elements based on mouse position
            const floatingElements = document.querySelectorAll('.floating-element');
            floatingElements.forEach(element => {
                if (element && element.style) {
                    const rect = element.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const distanceX = mouseX - centerX;
                    const distanceY = mouseY - centerY;
                    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                    
                    if (distance < 300) {
                        const moveX = (distanceX / distance) * 10;
                        const moveY = (distanceY / distance) * 10;
                        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    } else {
                        element.style.transform = '';
                    }
                }
            });
            
            // Move particles based on mouse position
            const particles = document.querySelectorAll('.particle');
            particles.forEach(particle => {
                if (particle && particle.style) {
                    const rect = particle.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const distanceX = mouseX - centerX;
                    const distanceY = mouseY - centerY;
                    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                    
                    if (distance < 200) {
                        const moveX = (distanceX / distance) * 15;
                        const moveY = (distanceY / distance) * 15;
                        particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    } else {
                        particle.style.transform = '';
                    }
                }
            });
        } catch (error) {
            console.error('Mouse movement error:', error);
            // Continue execution even if mouse movement fails
        }
    });
    
    // Event listeners
    if (chatForm) {
        chatForm.addEventListener('submit', handleSubmit);
    }
    
    // Allow sending message with Enter key
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Add click event to suggestion chips
    suggestionChips.forEach(chip => {
        if (chip) {
            chip.addEventListener('click', () => {
                userInput.value = chip.textContent;
                userInput.focus();
            });
        }
    });
    
    // Focus input on load
    if (userInput) {
        userInput.focus();
    }
    
    // Add subtle animation to the chat container
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.style.opacity = '0';
        chatContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            chatContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            chatContainer.style.opacity = '1';
            chatContainer.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Initialize background with a subtle animation
    triggerBackgroundAnimation();
}); 