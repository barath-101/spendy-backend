// API utilities for making HTTP requests

const API_BASE_URL = '/api';

// API client class
class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Get default headers
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(options.headers),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new APIError(data.message || 'Request failed', response.status, data);
            }

            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError('Network error occurred', 0, { originalError: error });
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Custom error class for API errors
class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Create global API client instance
const apiClient = new APIClient();

// User API functions
const UserAPI = {
    // Create a new user
    async create(userData) {
        return apiClient.post('/users', userData);
    },

    // Get all users
    async getAll() {
        return apiClient.get('/users');
    },

    // Get user by ID
    async getById(id) {
        return apiClient.get(`/users/${id}`);
    },

    // Update user
    async update(id, userData) {
        return apiClient.put(`/users/${id}`, userData);
    },

    // Delete user
    async delete(id) {
        return apiClient.delete(`/users/${id}`);
    },

    // Login user (mock endpoint)
    async login(credentials) {
        // For now, simulate login since we don't have authentication endpoint
        const users = await this.getAll();
        const user = users.find(u => u.email === credentials.email);
        
        if (user) {
            // In a real app, verify password and return JWT token
            return {
                user: user,
                token: 'mock-jwt-token-' + user.id
            };
        } else {
            throw new APIError('Invalid credentials', 401);
        }
    }
};

// Expense API functions
const ExpenseAPI = {
    // Create a new expense
    async create(expenseData) {
        return apiClient.post('/expenses', expenseData);
    },

    // Get expenses by user ID
    async getByUser(userId) {
        return apiClient.get(`/expenses/user/${userId}`);
    },

    // Update expense
    async update(id, expenseData) {
        return apiClient.put(`/expenses/${id}`, expenseData);
    },

    // Delete expense
    async delete(id) {
        return apiClient.delete(`/expenses/${id}`);
    }
};

// Category API functions (assuming endpoints exist)
const CategoryAPI = {
    // Get all categories
    async getAll() {
        return apiClient.get('/categories');
    },

    // Create category
    async create(categoryData) {
        return apiClient.post('/categories', categoryData);
    },

    // Update category
    async update(id, categoryData) {
        return apiClient.put(`/categories/${id}`, categoryData);
    },

    // Delete category
    async delete(id) {
        return apiClient.delete(`/categories/${id}`);
    }
};

// Subcategory API functions
const SubCategoryAPI = {
    // Get all subcategories
    async getAll() {
        return apiClient.get('/subcategories');
    },

    // Get subcategories by category
    async getByCategory(categoryId) {
        return apiClient.get(`/subcategories/category/${categoryId}`);
    },

    // Create subcategory
    async create(subcategoryData) {
        return apiClient.post('/subcategories', subcategoryData);
    },

    // Update subcategory
    async update(id, subcategoryData) {
        return apiClient.put(`/subcategories/${id}`, subcategoryData);
    },

    // Delete subcategory
    async delete(id) {
        return apiClient.delete(`/subcategories/${id}`);
    }
};

// Authentication utilities
const AuthUtils = {
    // Get current user from localStorage
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set current user in localStorage
    setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Clear current user from localStorage
    clearCurrentUser() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        apiClient.setToken(null);
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getCurrentUser();
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
};

// Request interceptors for common functionality
const RequestInterceptors = {
    // Add loading state to requests
    withLoading(element) {
        return async (requestFunction) => {
            if (element && element.classList) {
                element.classList.add('loading');
            }
            try {
                const result = await requestFunction();
                return result;
            } finally {
                if (element && element.classList) {
                    element.classList.remove('loading');
                }
            }
        };
    },

    // Add error handling to requests
    withErrorHandling(onError) {
        return async (requestFunction) => {
            try {
                const result = await requestFunction();
                return result;
            } catch (error) {
                if (onError) {
                    onError(error);
                } else {
                    console.error('API Error:', error);
                    // Show default error toast if available
                    if (window.AuthUtils && window.AuthUtils.showToast) {
                        window.AuthUtils.showToast('error', 'Error', error.message || 'An error occurred');
                    }
                }
                throw error;
            }
        };
    },

    // Retry failed requests
    withRetry(maxRetries = 3, delay = 1000) {
        return async (requestFunction) => {
            let lastError;
            
            for (let i = 0; i <= maxRetries; i++) {
                try {
                    const result = await requestFunction();
                    return result;
                } catch (error) {
                    lastError = error;
                    
                    // Don't retry client errors (4xx)
                    if (error.status >= 400 && error.status < 500) {
                        throw error;
                    }
                    
                    // Don't retry on last attempt
                    if (i === maxRetries) {
                        throw error;
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
            
            throw lastError;
        };
    }
};

// Utility functions for common patterns
const APIUtils = {
    // Format currency values
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format dates
    formatDate(dateString, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return new Date(dateString).toLocaleDateString('en-US', {
            ...defaultOptions,
            ...options
        });
    },

    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Group expenses by category
    groupExpensesByCategory(expenses) {
        return expenses.reduce((groups, expense) => {
            const category = expense.category?.name || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(expense);
            return groups;
        }, {});
    },

    // Calculate total expenses
    calculateTotal(expenses) {
        return expenses.reduce((total, expense) => {
            return total + (parseFloat(expense.amount) || 0);
        }, 0);
    },

    // Get expenses for date range
    filterExpensesByDateRange(expenses, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.createdAt);
            return expenseDate >= start && expenseDate <= end;
        });
    }
};

// Export everything for global use
window.API = {
    client: apiClient,
    User: UserAPI,
    Expense: ExpenseAPI,
    Category: CategoryAPI,
    SubCategory: SubCategoryAPI,
    Auth: AuthUtils,
    Utils: APIUtils,
    Interceptors: RequestInterceptors,
    Error: APIError
};

// Make individual APIs available globally
window.UserAPI = UserAPI;
window.ExpenseAPI = ExpenseAPI;
window.CategoryAPI = CategoryAPI;
window.SubCategoryAPI = SubCategoryAPI;
window.APIUtils = APIUtils;