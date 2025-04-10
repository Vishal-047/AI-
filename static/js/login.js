// Create particles
function createParticles() {
    const particles = document.createElement('div');
    particles.className = 'particles';
    document.body.appendChild(particles);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'shape';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 20 + 10 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particles.appendChild(particle);
    }
}

// Initialize particles and form effects on page load
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    // Add input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.querySelector('i').style.color = '#10b981';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.querySelector('i').style.color = '#818cf8';
        });
    });
    
    // Add form validation
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const username = document.querySelector('input[name="username"]').value.trim();
            const password = document.querySelector('input[name="password"]').value.trim();
            
            if (!username || !password) {
                e.preventDefault();
                
                // Create error message if it doesn't exist
                let errorMsg = document.querySelector('.error');
                if (!errorMsg) {
                    errorMsg = document.createElement('p');
                    errorMsg.className = 'error';
                    errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all fields';
                    loginForm.insertBefore(errorMsg, loginForm.firstChild);
                } else {
                    errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in all fields';
                }
                
                // Add shake animation
                errorMsg.style.animation = 'none';
                errorMsg.offsetHeight; // Trigger reflow
                errorMsg.style.animation = 'shake 0.5s ease-in-out';
            }
        });
    }
    
    // Add remember me checkbox effect
    const rememberCheckbox = document.querySelector('input[type="checkbox"]');
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked) {
                this.parentElement.style.color = '#10b981';
            } else {
                this.parentElement.style.color = 'var(--light-color)';
            }
        });
    }
}); 