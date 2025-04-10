document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const particlesContainer = document.getElementById('particles-container');
    const floatingElements = document.querySelectorAll('.floating-element');
    const ergoIcons = document.querySelectorAll('.ergo-icon');
    const glowElements = document.querySelectorAll('.glow-element');
    
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
    
    // Get current time for message timestamps
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Add a message to the chat
    function addMessage(text, isUser = false, imageUrl = null, imageCaption = null) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = isUser ? 'fas fa-user' : 'fas fa-robot';
        messageContent.appendChild(icon);
        
        // Create message text container
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        // Add message text with proper formatting
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageText.appendChild(paragraph);
        
        // Add image if provided
        if (imageUrl) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'message-image-container';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = imageCaption || 'Ergonomic guide';
            img.className = 'message-image';
            
            // Add loading animation
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
            
            // Add error handling
            img.addEventListener('error', () => {
                imageContainer.innerHTML = '<div class="image-error">Image could not be loaded</div>';
            });
            
            imageContainer.appendChild(img);
            
            // Add caption if provided
            if (imageCaption) {
                const caption = document.createElement('div');
                caption.className = 'image-caption';
                caption.textContent = imageCaption;
                imageContainer.appendChild(caption);
            }
            
            messageText.appendChild(imageContainer);
        }
        
        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'message-time';
        timestamp.textContent = getCurrentTime();
        messageText.appendChild(timestamp);
        
        // Assemble message
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        
        // Add to chat
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the new message with smooth animation
        setTimeout(() => {
            messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
        
        // Adjust message size based on content
        adjustMessageSize(messageDiv);
    }
    
    // Adjust message size based on content
    function adjustMessageSize(messageElement) {
        const messageText = messageElement.querySelector('.message-text p');
        if (!messageText) return;
        
        // Get the text content
        const text = messageText.textContent;
        
        // Calculate approximate lines based on text length and container width
        const containerWidth = messageElement.offsetWidth;
        const avgCharWidth = 8; // Approximate width of a character in pixels
        const charsPerLine = Math.floor(containerWidth / avgCharWidth);
        const lines = Math.ceil(text.length / charsPerLine);
        
        // Add a class based on message length
        if (lines > 10) {
            messageElement.classList.add('long-message');
        } else if (lines > 5) {
            messageElement.classList.add('medium-message');
        } else {
            messageElement.classList.add('short-message');
        }
        
        // Ensure the chat container is properly sized
        adjustChatContainer();
    }
    
    // Adjust chat container size based on content
    function adjustChatContainer() {
        // Calculate total height of all messages
        const messages = chatMessages.querySelectorAll('.message');
        let totalHeight = 0;
        
        messages.forEach(message => {
            totalHeight += message.offsetHeight;
        });
        
        // Add padding and gaps
        totalHeight += 40; // Padding and gaps
        
        // Set minimum height
        const minHeight = 200;
        
        // Set the height of the chat messages container
        chatMessages.style.height = Math.max(totalHeight, minHeight) + 'px';
        
        // Ensure the container doesn't exceed the viewport
        const maxHeight = window.innerHeight - 180; // Account for header and input
        chatMessages.style.maxHeight = maxHeight + 'px';
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        // Create typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.id = 'typing-indicator';
        
        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = 'fas fa-robot';
        messageContent.appendChild(icon);
        
        // Create typing animation
        const typingText = document.createElement('div');
        typingText.className = 'typing-indicator';
        
        // Add dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingText.appendChild(dot);
        }
        
        messageContent.appendChild(typingText);
        typingDiv.appendChild(messageContent);
        
        // Add to chat
        chatMessages.appendChild(typingDiv);
        
        // Scroll to the typing indicator
        setTimeout(() => {
            typingDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Get user input
        const question = userInput.value.trim();
        if (!question) return;
        
        // Add user message
        addMessage(question, true);
        
        // Clear input
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Send request to backend
            const response = await fetch('/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });
            
            // Remove typing indicator
            removeTypingIndicator();
            
            // Parse response
            const data = await response.json();
            
            // Add bot response with image if available
            if (data.response) {
                addMessage(data.response, false, data.image_url, data.image_caption);
                
                // Trigger background animation if image is shown
                if (data.image_url) {
                    triggerBackgroundAnimation("image shown");
                }
            } else {
                addMessage("I'm sorry, I couldn't process that request.");
            }
        } catch (error) {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage("I'm sorry, there was an error processing your request.");
        }
    }
    
    // Function to trigger background animations based on message content
    function triggerBackgroundAnimation(message) {
        try {
            // Create particles
            if (particlesContainer) {
                for (let i = 0; i < 5; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'particle';
                    particle.style.left = Math.random() * 100 + '%';
                    particle.style.top = Math.random() * 100 + '%';
                    particlesContainer.appendChild(particle);
                    
                    setTimeout(() => {
                        particle.remove();
                    }, 2000);
                }
            }

            // Animate floating elements
            if (floatingElements) {
                floatingElements.forEach(element => {
                    element.classList.add('active');
                    setTimeout(() => {
                        element.classList.remove('active');
                    }, 1000);
                });
            }

            // Show/hide ergonomic icons based on message content
            if (ergoIcons) {
                const ergoKeywords = ['posture', 'desk', 'chair', 'exercise', 'stretch'];
                const hasErgoKeyword = ergoKeywords.some(keyword => 
                    message.toLowerCase().includes(keyword)
                );
                
                ergoIcons.forEach(icon => {
                    if (hasErgoKeyword) {
                        icon.style.opacity = '1';
                        icon.classList.add('active');
                        setTimeout(() => {
                            icon.classList.remove('active');
                        }, 1000);
                    } else {
                        icon.style.opacity = '0.3';
                    }
                });
            }

            // Enhance glow effects
            if (glowElements) {
                glowElements.forEach(element => {
                    element.classList.add('active');
                    setTimeout(() => {
                        element.classList.remove('active');
                    }, 1000);
                });
            }
        } catch (error) {
            console.error('Error in background animation:', error);
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
    
    // Allow sending with Enter key
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit(e);
            }
        });
    }
    
    // Add click event to suggestion chips
    if (suggestionChips) {
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                userInput.value = chip.textContent;
                userInput.focus();
            });
        });
    }
    
    // Focus input on load
    if (userInput) {
        userInput.focus();
    }
    
    // Add fade-in animation for chat container
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        chatContainer.style.opacity = '0';
        setTimeout(() => {
            chatContainer.style.transition = 'opacity 0.5s ease';
            chatContainer.style.opacity = '1';
        }, 100);
    }
    
    // Adjust initial message sizes
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
        adjustMessageSize(message);
    });
    
    // Initial chat container adjustment
    adjustChatContainer();
    
    // Add window resize listener to adjust container on window size change
    window.addEventListener('resize', adjustChatContainer);
}); 