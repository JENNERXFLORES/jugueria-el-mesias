// Main Application JavaScript for Juguería El Mesías

// Global State Management
const AppState = {
    currentUser: null,
    currentView: 'welcome',
    cart: JSON.parse(localStorage.getItem('elMesiasCart')) || [],
    orders: [],
    products: [],
    isLoggedIn: false,
    userType: null // 'cliente', 'trabajador', 'admin'
};

// API Base URL (usando configuración del entorno con detección automática de ruta)
const API_BASE = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'backend/api/';

// Función helper para URLs de API
function buildApiUrl(endpoint) {
    return window.getApiUrl ? window.getApiUrl(endpoint) : API_BASE + endpoint;
}

// Utility Functions
const Utils = {
    // Generate UUID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(amount);
    },

    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Format date for input
    formatDateForInput(date) {
        return new Date(date).toISOString().slice(0, 16);
    },

    // Show loading spinner
    showLoading(element) {
        element.innerHTML = '<div class="flex justify-center p-8"><div class="loading-spinner"></div></div>';
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full ${
            type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    },

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Debounce function
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
    }
};

// API Service Class
class APIService {
    // Helper para logging de debug
    _debugLog(method, url, data = null, response = null) {
        if (window.isDebugMode && window.isDebugMode()) {
            console.group(`🌐 API ${method} Request`);
            console.log('URL:', url);
            if (data) console.log('Data:', data);
            if (response) console.log('Response:', response);
            console.groupEnd();
        }
    }

    // Generic GET request
    async get(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${buildApiUrl(endpoint)}${queryString ? '?' + queryString : ''}`;
            
            this._debugLog('GET', url, params);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            this._debugLog('GET', url, params, data);
            
            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            if (window.isUsingMySQL && window.isUsingMySQL()) {
                Utils.showToast('Error al cargar datos desde MySQL: ' + error.message, 'error');
            } else {
                Utils.showToast('Error al cargar datos: ' + error.message, 'error');
            }
            throw error;
        }
    }

    // Generic POST request
    async post(endpoint, data) {
        try {
            const url = buildApiUrl(endpoint);
            this._debugLog('POST', url, data);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            this._debugLog('POST', url, data, result);
            
            return result;
        } catch (error) {
            console.error('API POST Error:', error);
            Utils.showToast('Error al guardar: ' + error.message, 'error');
            throw error;
        }
    }

    // Generic PUT request
    async put(endpoint, data) {
        try {
            const url = buildApiUrl(endpoint);
            this._debugLog('PUT', url, data);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            this._debugLog('PUT', url, data, result);
            
            return result;
        } catch (error) {
            console.error('API PUT Error:', error);
            Utils.showToast('Error al actualizar: ' + error.message, 'error');
            throw error;
        }
    }

    // Generic PATCH request
    async patch(endpoint, data) {
        try {
            const url = buildApiUrl(endpoint);
            this._debugLog('PATCH', url, data);
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            this._debugLog('PATCH', url, data, result);
            
            return result;
        } catch (error) {
            console.error('API PATCH Error:', error);
            Utils.showToast('Error al actualizar: ' + error.message, 'error');
            throw error;
        }
    }

    // Generic DELETE request
    async delete(endpoint) {
        try {
            const url = buildApiUrl(endpoint);
            this._debugLog('DELETE', url);
            
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = response.status === 204 ? true : await response.json();
            this._debugLog('DELETE', url, null, result);
            
            return result;
        } catch (error) {
            console.error('API DELETE Error:', error);
            Utils.showToast('Error al eliminar: ' + error.message, 'error');
            throw error;
        }
    }

    // Products API
    async getProducts(params = {}) {
        return this.get('tables/productos', params);
    }

    async createProduct(product) {
        return this.post('tables/productos', product);
    }

    async updateProduct(id, product) {
        return this.put(`tables/productos/${id}`, product);
    }

    async deleteProduct(id) {
        return this.delete(`tables/productos/${id}`);
    }

    // Orders API
    async getOrders(params = {}) {
        return this.get('tables/pedidos', params);
    }

    async createOrder(order) {
        return this.post('tables/pedidos', order);
    }

    async updateOrder(id, order) {
        return this.patch(`tables/pedidos/${id}`, order);
    }

    // Sales API
    async getSales(params = {}) {
        return this.get('tables/ventas', params);
    }

    async createSale(sale) {
        return this.post('tables/ventas', sale);
    }

    // Expenses API
    async getExpenses(params = {}) {
        return this.get('tables/gastos', params);
    }

    async createExpense(expense) {
        return this.post('tables/gastos', expense);
    }

    // Users API
    async getUsers(params = {}) {
        return this.get('tables/usuarios', params);
    }

    async createUser(user) {
        return this.post('tables/usuarios', user);
    }

    // Promotions API
    async getPromotions(params = {}) {
        return this.get('tables/promociones', params);
    }

    async createPromotion(promotion) {
        return this.post('tables/promociones', promotion);
    }
}

// Initialize API service
const api = new APIService();
window.api = api; // Hacer disponible globalmente

// Navigation Functions
function showPublicCatalog() {
    AppState.currentView = 'catalog';
    if (typeof createCatalogView === 'function') {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = createCatalogView();
        initializeCatalog();
    } else {
        loadView('public-catalog.html');
    }
}

function showCart() {
    AppState.currentView = 'cart';
    if (typeof createCartView === 'function') {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = createCartView();
        initializeCart();
    } else {
        loadView('cart.html');
    }
}

function showDashboard() {
    if (!AppState.isLoggedIn || (AppState.userType !== 'trabajador' && AppState.userType !== 'admin')) {
        Utils.showToast('Acceso no autorizado', 'error');
        showLogin();
        return;
    }
    
    AppState.currentView = 'dashboard';
    if (typeof createDashboardView === 'function') {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = createDashboardView();
        initializeDashboard();
    } else {
        Utils.showToast('Error: Dashboard no disponible', 'error');
        goHome();
    }
}

function showPOS() {
    if (typeof loadPOSView === 'function') {
        loadPOSView();
    } else {
        Utils.showToast('Módulo POS no disponible', 'error');
    }
}

function showKitchen() {
    if (typeof loadKitchenView === 'function') {
        loadKitchenView();
    } else {
        Utils.showToast('Módulo de cocina no disponible', 'error');
    }
}

function showLogin() {
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLogin() {
    document.getElementById('loginModal').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

function showRegister() {
    closeLogin();
    document.getElementById('registerModal').classList.remove('hidden');
    document.getElementById('registerName').focus();
}

function closeRegister() {
    document.getElementById('registerModal').classList.add('hidden');
    document.getElementById('registerForm').reset();
}

function showLoginFromRegister() {
    closeRegister();
    showLogin();
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

// Go Back to Home
function goHome() {
    AppState.currentView = 'welcome';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <!-- Welcome Section -->
        <div id="welcomeSection" class="min-h-screen flex items-center justify-center px-4">
            <div class="max-w-4xl mx-auto text-center">
                <div class="animate-bounce mb-8">
                    <i class="fas fa-glass-whiskey text-8xl text-orange-500"></i>
                </div>
                <h2 class="text-5xl md:text-6xl font-bold text-gray-800 mb-6 font-poppins">
                    Bienvenido a <span class="text-orange-500">El Mesías</span>
                </h2>
                <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Los mejores jugos naturales, desayunos y bebidas de Nueva Cajamarca, Perú. 
                    Frescura y sabor en cada sorbo.
                </p>
                
                <div class="grid md:grid-cols-2 gap-6 mb-12">
                    <!-- Customer Access -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300 border-2 border-orange-100 hover:border-orange-300">
                        <i class="fas fa-users text-5xl text-orange-500 mb-4"></i>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4 font-poppins">Soy Cliente</h3>
                        <p class="text-gray-600 mb-6">Explora nuestro menú y realiza pedidos online</p>
                        <button onclick="showPublicCatalog()" class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                            Ver Catálogo
                        </button>
                    </div>

                    <!-- Staff Access -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300 border-2 border-blue-100 hover:border-blue-300">
                        <i class="fas fa-cogs text-5xl text-blue-500 mb-4"></i>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4 font-poppins">Soy Empleado</h3>
                        <p class="text-gray-600 mb-6">Accede al sistema interno de administración</p>
                        <button onclick="showLogin()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                            Iniciar Sesión
                        </button>
                    </div>
                </div>

                <!-- Features -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="p-4">
                        <i class="fas fa-leaf text-3xl text-green-500 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-700">100% Natural</p>
                    </div>
                    <div class="p-4">
                        <i class="fas fa-clock text-3xl text-blue-500 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-700">Preparación Rápida</p>
                    </div>
                    <div class="p-4">
                        <i class="fas fa-mobile-alt text-3xl text-purple-500 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-700">Pedidos Online</p>
                    </div>
                    <div class="p-4">
                        <i class="fas fa-heart text-3xl text-red-500 mb-2"></i>
                        <p class="text-sm font-semibold text-gray-700">Con Amor</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// View Loading System
async function loadView(viewFile) {
    const mainContent = document.getElementById('mainContent');
    
    try {
        const response = await fetch(viewFile);
        if (response.ok) {
            const html = await response.text();
            mainContent.innerHTML = html;
            
            // Initialize view-specific functionality
            initializeCurrentView();
        } else {
            // If file doesn't exist, create the view dynamically
            createViewDynamically(AppState.currentView);
        }
    } catch (error) {
        console.log('Loading view dynamically for:', AppState.currentView);
        createViewDynamically(AppState.currentView);
    }
}

function createViewDynamically(view) {
    const mainContent = document.getElementById('mainContent');
    
    switch(view) {
        case 'catalog':
            mainContent.innerHTML = createCatalogView();
            initializeCatalog();
            break;
        case 'cart':
            mainContent.innerHTML = createCartView();
            initializeCart();
            break;
        case 'dashboard':
            mainContent.innerHTML = createDashboardView();
            initializeDashboard();
            break;
        default:
            console.warn('Unknown view:', view);
    }
}

function initializeCurrentView() {
    switch(AppState.currentView) {
        case 'catalog':
            initializeCatalog();
            break;
        case 'cart':
            initializeCart();
            break;
        case 'dashboard':
            initializeDashboard();
            break;
    }
}

// Cart Management
function addToCart(product, quantity = 1) {
    const existingItem = AppState.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        AppState.cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartUI();
    saveCartToLocalStorage();
    Utils.showToast(`${product.nombre} agregado al carrito`, 'success');
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(item => item.id !== productId);
    updateCartUI();
    saveCartToLocalStorage();
    Utils.showToast('Producto eliminado del carrito', 'success');
}

function updateCartQuantity(productId, quantity) {
    const item = AppState.cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            updateCartUI();
            saveCartToLocalStorage();
        }
    }
}

function clearCart() {
    AppState.cart = [];
    updateCartUI();
    saveCartToLocalStorage();
    Utils.showToast('Carrito vaciado', 'info');
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart view if currently visible
    if (AppState.currentView === 'cart') {
        initializeCart();
    }
}

function saveCartToLocalStorage() {
    localStorage.setItem('elMesiasCart', JSON.stringify(AppState.cart));
}

function getCartTotal() {
    return AppState.cart.reduce((sum, item) => {
        const price = item.promocion && item.precio_promocion ? item.precio_promocion : item.precio;
        return sum + (price * item.quantity);
    }, 0);
}

// Handle Customer Registration
async function handleCustomerRegistration(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const address = document.getElementById('registerAddress').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Validations
    if (!name || !email || !phone || !password) {
        Utils.showToast('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    if (!Utils.isValidEmail(email)) {
        Utils.showToast('Por favor ingresa un email válido', 'error');
        return;
    }
    
    if (password.length < 6) {
        Utils.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        Utils.showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (!acceptTerms) {
        Utils.showToast('Debes aceptar los términos y condiciones', 'error');
        return;
    }
    
    try {
        // Check if email already exists
        const existingUsers = await api.getUsers();
        const emailExists = existingUsers.data?.some(user => user.email === email);
        
        if (emailExists) {
            Utils.showToast('Este email ya está registrado', 'error');
            return;
        }
        
        // Create new customer
        const newCustomer = {
            nombre: name,
            email: email,
            telefono: phone,
            tipo: 'cliente',
            direccion: address || 'Nueva Cajamarca, Perú',
            activo: true,
            fecha_registro: new Date().toISOString()
        };
        
        const createdUser = await api.createUser(newCustomer);
        
        Utils.showToast('¡Cuenta creada exitosamente!', 'success');
        
        // Auto login the new user
        loginUserDirect(createdUser);
        
        closeRegister();
        
    } catch (error) {
        console.error('Registration error:', error);
        Utils.showToast('Error al crear la cuenta. Intenta nuevamente.', 'error');
    }
}

// Direct login function (without additional redirects)
function loginUserDirect(user) {
    AppState.currentUser = user;
    AppState.isLoggedIn = true;
    AppState.userType = user.tipo;
    
    // Save to localStorage
    localStorage.setItem('elMesiasUser', JSON.stringify(user));
    
    updateNavigationForUser();
    
    Utils.showToast(`Bienvenido ${user.nombre}`, 'success');
    
    // Redirect to catalog for customers
    if (user.tipo === 'cliente') {
        showPublicCatalog();
    } else {
        goHome();
    }
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Juguería El Mesías - Sistema iniciado');
    
    // Initialize cart count
    updateCartUI();
    
    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (typeof handleLogin === 'function') {
                handleLogin(e);
            } else {
                console.error('handleLogin function not found');
            }
        });
    }
    
    // Initialize register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleCustomerRegistration);
    }
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Load initial data
    loadInitialData();
});

async function loadInitialData() {
    try {
        // Load products for public catalog
        const productsResponse = await api.getProducts({ limit: 100 });
        AppState.products = productsResponse.data || [];
        
        console.log('Datos iniciales cargados');
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Auth status check
function checkAuthStatus() {
    const savedUser = localStorage.getItem('elMesiasUser');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        AppState.isLoggedIn = true;
        AppState.userType = AppState.currentUser.tipo;
        
        // Update UI based on user type
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    updateNavigationForUser();
    console.log('User logged in:', AppState.currentUser);
}

// Logout User
function logout() {
    AppState.currentUser = null;
    AppState.isLoggedIn = false;
    AppState.userType = null;
    
    // Clear localStorage
    localStorage.removeItem('elMesiasUser');
    
    // Reset UI
    updateNavigationForGuest();
    
    // Redirect to home
    goHome();
    
    Utils.showToast('Sesión cerrada correctamente', 'info');
}

// Update Navigation for User
function updateNavigationForUser() {
    const nav = document.querySelector('nav .hidden.md\\:block');
    
    if (!nav) return;
    
    if (AppState.userType === 'cliente') {
        nav.innerHTML = `
            <div class="ml-10 flex items-baseline space-x-4">
                <a href="#" onclick="goHome()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-home mr-2"></i>Inicio
                </a>
                <a href="#" onclick="showPublicCatalog()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-store mr-2"></i>Catálogo
                </a>
                <a href="#" onclick="showCart()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-shopping-cart mr-2"></i>Carrito <span id="cartCount" class="bg-orange-500 text-white rounded-full px-2 py-1 text-xs ml-1">${AppState.cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </a>
                <a href="#" onclick="showUserProfile()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-user mr-2"></i>Mi Perfil
                </a>
                <a href="#" onclick="logout()" class="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Salir
                </a>
            </div>
        `;
    } else if (AppState.userType === 'trabajador' || AppState.userType === 'admin') {
        nav.innerHTML = `
            <div class="ml-10 flex items-baseline space-x-4">
                <a href="#" onclick="goHome()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-home mr-2"></i>Inicio
                </a>
                <a href="#" onclick="showDashboard()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <a href="#" onclick="showPOS()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-cash-register mr-2"></i>POS
                </a>
                <a href="#" onclick="showKitchen()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-utensils mr-2"></i>Cocina
                </a>
                <span class="text-sm text-gray-500">
                    <i class="fas fa-user mr-1"></i>${AppState.currentUser.nombre}
                </span>
                <a href="#" onclick="logout()" class="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Salir
                </a>
            </div>
        `;
    }
}

function updateNavigationForGuest() {
    const nav = document.querySelector('nav .hidden.md\\:block');
    if (!nav) return;
    
    nav.innerHTML = `
        <div class="ml-10 flex items-baseline space-x-4">
            <a href="#" onclick="showPublicCatalog()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-store mr-2"></i>Catálogo
            </a>
            <a href="#" onclick="showCart()" class="text-gray-600 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-shopping-cart mr-2"></i>Carrito <span id="cartCount" class="bg-orange-500 text-white rounded-full px-2 py-1 text-xs ml-1">0</span>
            </a>
            <a href="#" onclick="showLogin()" class="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <i class="fas fa-user mr-2"></i>Acceder
            </a>
        </div>
    `;
}

// Show User Profile (placeholder)
function showUserProfile() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    
    Utils.showToast('Perfil de usuario próximamente disponible', 'info');
}