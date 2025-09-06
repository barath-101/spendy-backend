// Authentication JavaScript

// Initialize auth animations
function initializeAuthAnimations() {
    // Add stagger animation delays to elements
    const animatedElements = document.querySelectorAll('.animate-slide-up');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
}

// Initialize login form
function initializeLoginForm() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('login-btn');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Clear previous errors
        clearFormErrors();

        // Validate inputs
        let isValid = true;

        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showFieldError('password', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        setLoadingState(submitBtn, true);

        try {
            // Simulate API call for now
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo purposes, always succeed
            showToast('success', 'Login Successful', 'Welcome back! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            showToast('error', 'Login Failed', 'Invalid email or password. Please try again.');
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            this.classList.add('error');
        } else {
            clearFieldError('email');
            this.classList.remove('error');
            if (email) this.classList.add('success');
        }
    });

    passwordInput.addEventListener('input', function() {
        if (this.value.trim()) {
            clearFieldError('password');
            this.classList.remove('error');
        }
    });
}

// Initialize registration form
function initializeRegisterForm() {
    const form = document.getElementById('register-form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms-agree');
    const submitBtn = document.getElementById('register-btn');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const agreeToTerms = termsCheckbox.checked;

        // Clear previous errors
        clearFormErrors();

        // Validate inputs
        let isValid = true;

        if (!username) {
            showFieldError('username', 'Username is required');
            isValid = false;
        } else if (username.length < 3) {
            showFieldError('username', 'Username must be at least 3 characters long');
            isValid = false;
        } else if (username.length > 50) {
            showFieldError('username', 'Username must be less than 50 characters');
            isValid = false;
        }

        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showFieldError('password', 'Password is required');
            isValid = false;
        } else if (password.length < 8) {
            showFieldError('password', 'Password must be at least 8 characters long');
            isValid = false;
        }

        if (!confirmPassword) {
            showFieldError('confirm-password', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showFieldError('confirm-password', 'Passwords do not match');
            isValid = false;
        }

        if (!agreeToTerms) {
            showToast('error', 'Terms Required', 'Please agree to the Terms of Service and Privacy Policy');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        setLoadingState(submitBtn, true);

        try {
            // Create user object
            const userData = {
                username: username,
                email: email,
                password: password,
                createdAt: new Date().toISOString()
            };

            // Call the API
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const user = await response.json();
                showToast('success', 'Account Created', 'Welcome to Spendy! Redirecting to dashboard...');
                
                // Store user info (in a real app, use proper token management)
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.message.includes('username')) {
                errorMessage = 'Username is already taken. Please choose another.';
                showFieldError('username', 'Username is already taken');
            } else if (error.message.includes('email')) {
                errorMessage = 'Email is already registered. Please use another email or try logging in.';
                showFieldError('email', 'Email is already registered');
            }
            
            showToast('error', 'Registration Failed', errorMessage);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    // Real-time validation
    usernameInput.addEventListener('blur', function() {
        const username = this.value.trim();
        if (username) {
            if (username.length < 3) {
                showFieldError('username', 'Username must be at least 3 characters long');
                this.classList.add('error');
            } else if (username.length > 50) {
                showFieldError('username', 'Username must be less than 50 characters');
                this.classList.add('error');
            } else {
                clearFieldError('username');
                this.classList.remove('error');
                this.classList.add('success');
            }
        }
    });

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            this.classList.add('error');
        } else {
            clearFieldError('email');
            this.classList.remove('error');
            if (email) this.classList.add('success');
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value.trim();
        const confirmPassword = this.value.trim();
        
        if (confirmPassword && password !== confirmPassword) {
            showFieldError('confirm-password', 'Passwords do not match');
            this.classList.add('error');
        } else {
            clearFieldError('confirm-password');
            this.classList.remove('error');
            if (confirmPassword && password === confirmPassword) {
                this.classList.add('success');
            }
        }
    });
}

// Initialize password toggle
function initializePasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input[type="password"], input[type="text"]');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Initialize password strength indicator
function initializePasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    if (!passwordInput || !strengthFill || !strengthText) return;

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Remove all strength classes
        strengthFill.classList.remove('weak', 'fair', 'good', 'strong');
        
        // Add appropriate class and text
        switch (strength.level) {
            case 1:
                strengthFill.classList.add('weak');
                strengthText.textContent = 'Weak password';
                strengthText.style.color = 'var(--error-color)';
                break;
            case 2:
                strengthFill.classList.add('fair');
                strengthText.textContent = 'Fair password';
                strengthText.style.color = 'var(--warning-color)';
                break;
            case 3:
                strengthFill.classList.add('good');
                strengthText.textContent = 'Good password';
                strengthText.style.color = 'var(--accent-color)';
                break;
            case 4:
                strengthFill.classList.add('strong');
                strengthText.textContent = 'Strong password';
                strengthText.style.color = 'var(--success-color)';
                break;
            default:
                strengthText.textContent = 'Password strength';
                strengthText.style.color = 'var(--text-secondary)';
        }
    });
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password)
    };

    // Calculate score
    Object.values(checks).forEach(check => {
        if (check) score++;
    });

    // Bonus for length
    if (password.length >= 12) score++;

    return {
        score: score,
        level: Math.min(4, Math.max(1, score - 1)),
        checks: checks
    };
}

function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
        inputElement.classList.remove('success');
    }
}

function clearFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input');
    
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    inputElements.forEach(element => {
        element.classList.remove('error', 'success');
    });
}

function setLoadingState(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (loading) {
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        button.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        button.disabled = false;
    }
}

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconMap[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            removeToast(toast);
        }
    }, 5000);
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentElement) {
            toast.parentElement.removeChild(toast);
        }
    }, 300);
}

// Add slide out animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for global use
window.AuthUtils = {
    showToast,
    setLoadingState,
    isValidEmail,
    calculatePasswordStrength,
    showFieldError,
    clearFieldError,
    clearFormErrors
};