// Dashboard JavaScript

let currentUser = null;
let expenses = [];
let categories = [];
let subcategories = [];

// Initialize dashboard
function initializeDashboard() {
    currentUser = API.Auth.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize UI components
    initializeNavigation();
    initializeUserMenu();
    initializeModal();
    initializeDateFilter();
    
    // Load initial data
    loadDashboardData();
    loadCategories();
    
    // Update user info
    updateUserInfo();
}

// Initialize navigation
function initializeNavigation() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');

    // Mobile sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Initialize user menu
function initializeUserMenu() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });

        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('add-expense-modal');
    const addExpenseBtns = document.querySelectorAll('#add-expense-btn, #add-expense-btn-2');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const addExpenseForm = document.getElementById('add-expense-form');

    // Open modal
    addExpenseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            openModal();
        });
    });

    // Close modal
    [modalClose, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                closeModal();
            });
        }
    });

    // Close modal on backdrop click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Handle form submission
    if (addExpenseForm) {
        addExpenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveExpense();
        });
    }

    // Category change handler
    const categorySelect = document.getElementById('expense-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            loadSubcategories(this.value);
        });
    }
}

// Initialize date filter
function initializeDateFilter() {
    const dateFilter = document.getElementById('date-range');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadDashboardData();
        });
    }
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Load section-specific data
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'expenses':
            loadExpensesTable();
            break;
        // Add more cases for other sections
    }
}

// Update user info
function updateUserInfo() {
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');

    if (currentUser) {
        if (userNameEl) userNameEl.textContent = currentUser.username || 'User';
        if (userEmailEl) userEmailEl.textContent = currentUser.email || 'user@example.com';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        if (!currentUser) return;

        // Show loading state
        showLoadingState();

        // Get date range
        const dateRange = document.getElementById('date-range')?.value || '30';
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(dateRange));

        // Load expenses for the user
        expenses = await ExpenseAPI.getByUser(currentUser.id);
        
        // Filter by date range
        const filteredExpenses = APIUtils.filterExpensesByDateRange(expenses, startDate, new Date());

        // Update stats
        updateStats(filteredExpenses);

        // Update charts
        updateCharts(filteredExpenses);

        // Update recent expenses
        updateRecentExpenses(filteredExpenses.slice(0, 5));

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('error', 'Error', 'Failed to load dashboard data');
    }
}

// Update stats
function updateStats(expenses) {
    const total = APIUtils.calculateTotal(expenses);
    const transactions = expenses.length;
    const dailyAvg = expenses.length > 0 ? total / expenses.length : 0;
    
    // Group by category to find top category
    const grouped = APIUtils.groupExpensesByCategory(expenses);
    const topCategory = Object.keys(grouped).reduce((a, b) => 
        APIUtils.calculateTotal(grouped[a]) > APIUtils.calculateTotal(grouped[b]) ? a : b, 
        Object.keys(grouped)[0] || 'None'
    );

    // Update UI
    document.getElementById('total-expenses').textContent = APIUtils.formatCurrency(total);
    document.getElementById('total-transactions').textContent = transactions.toLocaleString();
    document.getElementById('avg-daily').textContent = APIUtils.formatCurrency(dailyAvg);
    document.getElementById('top-category').textContent = topCategory;

    // Simulate change percentages (in a real app, compare with previous period)
    document.getElementById('expenses-change').textContent = '+12%';
    document.getElementById('transactions-change').textContent = '+8%';
    document.getElementById('daily-change').textContent = '+5%';
    document.getElementById('category-change').textContent = APIUtils.formatCurrency(APIUtils.calculateTotal(grouped[topCategory] || []));
}

// Update charts
function updateCharts(expenses) {
    updateCategoryChart(expenses);
    updateTrendChart(expenses);
}

// Update category chart
function updateCategoryChart(expenses) {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear existing chart
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }

    const grouped = APIUtils.groupExpensesByCategory(expenses);
    const labels = Object.keys(grouped);
    const data = labels.map(category => APIUtils.calculateTotal(grouped[category]));
    
    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
        '#f97316', '#06b6d4', '#84cc16', '#f43f5e', '#6366f1'
    ];

    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            }
        }
    });
}

// Update trend chart
function updateTrendChart(expenses) {
    const canvas = document.getElementById('trend-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear existing chart
    if (window.trendChart) {
        window.trendChart.destroy();
    }

    // Group expenses by date
    const dailyData = {};
    expenses.forEach(expense => {
        const date = new Date(expense.createdAt).toDateString();
        dailyData[date] = (dailyData[date] || 0) + parseFloat(expense.amount);
    });

    const labels = Object.keys(dailyData).slice(-7); // Last 7 days
    const data = labels.map(date => dailyData[date] || 0);

    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(date => new Date(date).toLocaleDateString()),
            datasets: [{
                label: 'Daily Spending',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutCubic'
            }
        }
    });
}

// Update recent expenses
function updateRecentExpenses(recentExpenses) {
    const container = document.getElementById('recent-expenses-list');
    if (!container) return;

    if (recentExpenses.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <span>No expenses found</span>
            </div>
        `;
        return;
    }

    const expenseIcons = {
        'Food': { icon: 'fas fa-utensils', color: '#ef4444' },
        'Transport': { icon: 'fas fa-car', color: '#f59e0b' },
        'Shopping': { icon: 'fas fa-shopping-bag', color: '#10b981' },
        'Entertainment': { icon: 'fas fa-film', color: '#3b82f6' },
        'Bills': { icon: 'fas fa-file-invoice-dollar', color: '#8b5cf6' },
        'Default': { icon: 'fas fa-receipt', color: '#6b7280' }
    };

    container.innerHTML = recentExpenses.map(expense => {
        const categoryName = expense.category?.name || 'Other';
        const iconData = expenseIcons[categoryName] || expenseIcons['Default'];
        
        return `
            <div class="expense-item">
                <div class="expense-icon" style="background: ${iconData.color}">
                    <i class="${iconData.icon}"></i>
                </div>
                <div class="expense-details">
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-category">${categoryName}</div>
                </div>
                <div class="expense-amount">${APIUtils.formatCurrency(expense.amount)}</div>
                <div class="expense-date">${APIUtils.formatDate(expense.createdAt)}</div>
            </div>
        `;
    }).join('');
}

// Load expenses table
async function loadExpensesTable() {
    try {
        const tbody = document.getElementById('expenses-table-body');
        if (!tbody) return;

        // Show loading
        tbody.innerHTML = '<tr><td colspan="5" class="loading-state">Loading expenses...</td></tr>';

        // Load expenses
        const userExpenses = await ExpenseAPI.getByUser(currentUser.id);

        if (userExpenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No expenses found</td></tr>';
            return;
        }

        // Render table rows
        tbody.innerHTML = userExpenses.map(expense => `
            <tr>
                <td>${APIUtils.formatDate(expense.createdAt)}</td>
                <td>${expense.description}</td>
                <td>
                    <span class="category-badge">${expense.category?.name || 'Other'}</span>
                </td>
                <td>${APIUtils.formatCurrency(expense.amount)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editExpense(${expense.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteExpense(${expense.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading expenses table:', error);
        showToast('error', 'Error', 'Failed to load expenses');
    }
}

// Load categories
async function loadCategories() {
    try {
        // For demo purposes, create some default categories if none exist
        const categorySelect = document.getElementById('expense-category');
        if (!categorySelect) return;

        // Default categories
        const defaultCategories = [
            { id: 1, name: 'Food' },
            { id: 2, name: 'Transport' },
            { id: 3, name: 'Shopping' },
            { id: 4, name: 'Entertainment' },
            { id: 5, name: 'Bills' },
            { id: 6, name: 'Health' },
            { id: 7, name: 'Education' },
            { id: 8, name: 'Other' }
        ];

        categorySelect.innerHTML = '<option value="">Select category...</option>' +
            defaultCategories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');

        categories = defaultCategories;

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load subcategories
function loadSubcategories(categoryId) {
    const subcategorySelect = document.getElementById('expense-subcategory');
    if (!subcategorySelect || !categoryId) return;

    // Default subcategories for demo
    const defaultSubcategories = {
        1: ['Restaurant', 'Groceries', 'Coffee'],
        2: ['Gas', 'Public Transport', 'Taxi'],
        3: ['Clothes', 'Electronics', 'Home'],
        4: ['Movies', 'Games', 'Sports'],
        5: ['Electricity', 'Water', 'Internet'],
        6: ['Doctor', 'Pharmacy', 'Insurance'],
        7: ['Books', 'Courses', 'Training'],
        8: ['Miscellaneous']
    };

    const subs = defaultSubcategories[categoryId] || [];
    subcategorySelect.innerHTML = '<option value="">Select subcategory...</option>' +
        subs.map((sub, index) => 
            `<option value="${categoryId}-${index}">${sub}</option>`
        ).join('');
}

// Modal functions
function openModal() {
    const modal = document.getElementById('add-expense-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset form
        document.getElementById('add-expense-form').reset();
        document.getElementById('expense-subcategory').innerHTML = '<option value="">Select subcategory...</option>';
    }
}

function closeModal() {
    const modal = document.getElementById('add-expense-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Save expense
async function saveExpense() {
    try {
        const form = document.getElementById('add-expense-form');
        const formData = new FormData(form);
        
        const expenseData = {
            amount: parseFloat(document.getElementById('expense-amount').value),
            description: document.getElementById('expense-description').value,
            user: { id: currentUser.id },
            category: { id: parseInt(document.getElementById('expense-category').value) },
            subCategory: document.getElementById('expense-subcategory').value ? 
                { id: parseInt(document.getElementById('expense-subcategory').value.split('-')[1]) } : null
        };

        // Show loading
        const saveBtn = document.getElementById('save-expense-btn');
        setLoadingState(saveBtn, true);

        // Save expense
        await ExpenseAPI.create(expenseData);
        
        showToast('success', 'Success', 'Expense added successfully!');
        closeModal();
        
        // Reload data
        loadDashboardData();
        if (document.getElementById('expenses-section').classList.contains('active')) {
            loadExpensesTable();
        }

    } catch (error) {
        console.error('Error saving expense:', error);
        showToast('error', 'Error', 'Failed to save expense');
    } finally {
        const saveBtn = document.getElementById('save-expense-btn');
        setLoadingState(saveBtn, false);
    }
}

// Edit expense
function editExpense(expenseId) {
    // For demo purposes, just show a message
    showToast('info', 'Feature Coming Soon', 'Edit expense functionality will be available soon!');
}

// Delete expense
async function deleteExpense(expenseId) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        await ExpenseAPI.delete(expenseId);
        showToast('success', 'Success', 'Expense deleted successfully!');
        
        // Reload data
        loadDashboardData();
        if (document.getElementById('expenses-section').classList.contains('active')) {
            loadExpensesTable();
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('error', 'Error', 'Failed to delete expense');
    }
}

// Logout
function logout() {
    API.Auth.clearCurrentUser();
    showToast('success', 'Logged Out', 'You have been logged out successfully');
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1000);
}

// Utility functions
function showLoadingState() {
    // Add loading states to various elements
    const elements = document.querySelectorAll('.stat-value');
    elements.forEach(el => {
        el.textContent = 'Loading...';
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
    // Use the toast function from auth.js if available
    if (window.AuthUtils && window.AuthUtils.showToast) {
        window.AuthUtils.showToast(type, title, message);
    } else {
        console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    }
}

// Make functions globally available
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
window.initializeDashboard = initializeDashboard;