// Authentication System for Juguería El Mesías

// Login Handler
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        Utils.showToast('Por favor ingresa email y contraseña', 'error');
        return;
    }
    
    if (!Utils.isValidEmail(email)) {
        Utils.showToast('Por favor ingresa un email válido', 'error');
        return;
    }
    
    try {
        // Check for demo users first
        const demoUsers = {
            'admin@elmesias.com': {
                id: 'admin_demo',
                nombre: 'Admin Principal',
                email: 'admin@elmesias.com',
                telefono: '987654321',
                tipo: 'admin',
                direccion: 'Nueva Cajamarca, Perú',
                activo: true,
                fecha_registro: Date.now()
            },
            'vendedor@elmesias.com': {
                id: 'vendedor_demo',
                nombre: 'Vendedor Demo',
                email: 'vendedor@elmesias.com',
                telefono: '987654322',
                tipo: 'trabajador',
                direccion: 'Nueva Cajamarca, Perú',
                activo: true,
                fecha_registro: Date.now()
            },
            'cliente@demo.com': {
                id: 'cliente_demo',
                nombre: 'Cliente Demo',
                email: 'cliente@demo.com',
                telefono: '987654324',
                tipo: 'cliente',
                direccion: 'Nueva Cajamarca, Perú',
                activo: true,
                fecha_registro: Date.now()
            }
        };
        
        // Check demo users first
        if (demoUsers[email] && password === 'password123') {
            loginUserDirect(demoUsers[email]);
            return;
        }
        
        // Then check database users
        const users = await api.getUsers();
        const user = users.data?.find(u => u.email === email && u.activo);
        
        if (user) {
            // For demo, accept 'password123' or email as password
            if (password === 'password123' || password === user.email) {
                loginUserDirect(user);
            } else {
                Utils.showToast('Credenciales incorrectas', 'error');
            }
        } else {
            Utils.showToast('Usuario no encontrado. Usa las credenciales de demo o regístrate como cliente.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // If API fails, still allow demo users
        const demoUsers = {
            'admin@elmesias.com': {
                id: 'admin_demo',
                nombre: 'Admin Principal',
                email: 'admin@elmesias.com',
                tipo: 'admin',
                direccion: 'Nueva Cajamarca, Perú',
                activo: true
            },
            'vendedor@elmesias.com': {
                id: 'vendedor_demo',
                nombre: 'Vendedor Demo',
                email: 'vendedor@elmesias.com',
                tipo: 'trabajador',
                direccion: 'Nueva Cajamarca, Perú',
                activo: true
            },
            'cliente@demo.com': {
                id: 'cliente_demo',
                nombre: 'Cliente Demo',
                email: 'cliente@demo.com',
                tipo: 'cliente',
                direccion: 'Nueva Cajamarca, Perú',
                activo: true
            }
        };
        
        if (demoUsers[email] && password === 'password123') {
            loginUserDirect(demoUsers[email]);
        } else {
            Utils.showToast('Error de conexión. Intenta con usuarios demo.', 'error');
        }
    }
}

// Login User
async function loginUser(user) {
    AppState.currentUser = user;
    AppState.isLoggedIn = true;
    AppState.userType = user.tipo;
    
    // Save to localStorage
    localStorage.setItem('elMesiasUser', JSON.stringify(user));
    
    // Close login modal
    closeLogin();
    
    // Redirect based on user type
    if (user.tipo === 'cliente') {
        if (typeof showPublicCatalog === 'function') {
            showPublicCatalog();
        } else {
            console.error('showPublicCatalog function not found');
            goHome();
        }
        Utils.showToast(`Bienvenido ${user.nombre}`, 'success');
    } else if (user.tipo === 'trabajador' || user.tipo === 'admin') {
        if (typeof showDashboard === 'function') {
            showDashboard();
        } else {
            console.error('showDashboard function not found, redirecting to home');
            goHome();
        }
        Utils.showToast(`Bienvenido al sistema ${user.nombre}`, 'success');
    }
    
    updateNavigationForUser();
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

// Initialize Demo Users
async function initializeDemoUsers() {
    try {
        const users = await api.getUsers();
        
        if (users.data?.length === 0) {
            // Create demo users
            const demoUsers = [
                {
                    nombre: 'Admin Principal',
                    email: 'admin@elmesias.com',
                    telefono: '987654321',
                    tipo: 'admin',
                    direccion: 'Nueva Cajamarca, Perú',
                    activo: true,
                    fecha_registro: Date.now()
                },
                {
                    nombre: 'Vendedor 1',
                    email: 'vendedor@elmesias.com',
                    telefono: '987654322',
                    tipo: 'trabajador',
                    direccion: 'Nueva Cajamarca, Perú',
                    activo: true,
                    fecha_registro: Date.now()
                },
                {
                    nombre: 'Cocinero Principal',
                    email: 'cocina@elmesias.com',
                    telefono: '987654323',
                    tipo: 'trabajador',
                    direccion: 'Nueva Cajamarca, Perú',
                    activo: true,
                    fecha_registro: Date.now()
                },
                {
                    nombre: 'Cliente Demo',
                    email: 'cliente@demo.com',
                    telefono: '987654324',
                    tipo: 'cliente',
                    direccion: 'Nueva Cajamarca, Perú',
                    activo: true,
                    fecha_registro: Date.now()
                }
            ];
            
            for (const user of demoUsers) {
                await api.createUser(user);
            }
            
            console.log('Demo users created successfully');
        }
    } catch (error) {
        console.error('Error initializing demo users:', error);
    }
}

// User Registration (for customers)
async function registerCustomer(userData) {
    try {
        const newUser = {
            nombre: userData.nombre,
            email: userData.email,
            telefono: userData.telefono,
            tipo: 'cliente',
            direccion: userData.direccion,
            activo: true,
            fecha_registro: Date.now()
        };
        
        const createdUser = await api.createUser(newUser);
        
        Utils.showToast('Registro exitoso', 'success');
        return createdUser;
    } catch (error) {
        console.error('Registration error:', error);
        Utils.showToast('Error en el registro', 'error');
        throw error;
    }
}

// Show User Profile
function showUserProfile() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    
    AppState.currentView = 'profile';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="min-h-screen bg-gray-50 py-8">
            <div class="max-w-4xl mx-auto px-4">
                <div class="bg-white rounded-2xl shadow-lg p-8">
                    <div class="flex items-center mb-8">
                        <div class="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                            ${AppState.currentUser.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">${AppState.currentUser.nombre}</h1>
                            <p class="text-gray-600">${AppState.currentUser.email}</p>
                            <span class="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mt-2">
                                ${AppState.currentUser.tipo.charAt(0).toUpperCase() + AppState.currentUser.tipo.slice(1)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <p class="text-gray-900">${AppState.currentUser.telefono}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <p class="text-gray-900">${AppState.currentUser.direccion}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                                    <p class="text-gray-900">${Utils.formatDate(AppState.currentUser.fecha_registro)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 class="text-xl font-semibold text-gray-800 mb-4">Acciones</h2>
                            <div class="space-y-4">
                                ${AppState.userType === 'cliente' ? `
                                    <button onclick="showOrderHistory()" class="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                        <i class="fas fa-history text-gray-500 mr-3"></i>
                                        <span class="font-medium">Historial de Pedidos</span>
                                    </button>
                                ` : `
                                    <button onclick="showDashboard()" class="w-full text-left p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                                        <i class="fas fa-tachometer-alt text-orange-500 mr-3"></i>
                                        <span class="font-medium">Ir al Dashboard</span>
                                    </button>
                                `}
                                
                                <button onclick="logout()" class="w-full text-left p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-700">
                                    <i class="fas fa-sign-out-alt text-red-500 mr-3"></i>
                                    <span class="font-medium">Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show Order History (for customers)
async function showOrderHistory() {
    if (!AppState.currentUser || AppState.currentUser.tipo !== 'cliente') {
        Utils.showToast('Acceso no autorizado', 'error');
        return;
    }
    
    try {
        const ordersResponse = await api.getOrders({ 
            search: AppState.currentUser.nombre,
            limit: 50,
            sort: 'fecha_pedido'
        });
        
        const userOrders = ordersResponse.data?.filter(order => 
            order.cliente_nombre === AppState.currentUser.nombre
        ) || [];
        
        AppState.currentView = 'order-history';
        const mainContent = document.getElementById('mainContent');
        
        mainContent.innerHTML = `
            <div class="min-h-screen bg-gray-50 py-8">
                <div class="max-w-6xl mx-auto px-4">
                    <div class="mb-8">
                        <button onclick="showUserProfile()" class="text-orange-500 hover:text-orange-600 mb-4">
                            <i class="fas fa-arrow-left mr-2"></i>Volver al Perfil
                        </button>
                        <h1 class="text-3xl font-bold text-gray-800">Historial de Pedidos</h1>
                        <p class="text-gray-600 mt-2">Revisa todos tus pedidos anteriores</p>
                    </div>
                    
                    <div class="space-y-6">
                        ${userOrders.length === 0 ? `
                            <div class="text-center py-16">
                                <i class="fas fa-shopping-bag text-6xl text-gray-400 mb-4"></i>
                                <h3 class="text-xl font-semibold text-gray-600 mb-2">No hay pedidos aún</h3>
                                <p class="text-gray-500 mb-6">¡Haz tu primer pedido explorando nuestro catálogo!</p>
                                <button onclick="showPublicCatalog()" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                                    Ver Catálogo
                                </button>
                            </div>
                        ` : userOrders.map(order => `
                            <div class="bg-white rounded-lg shadow-md p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-800">Pedido #${order.id.slice(-8)}</h3>
                                        <p class="text-gray-600">${Utils.formatDate(order.fecha_pedido)}</p>
                                        <p class="text-sm text-gray-500">${order.tipo_pedido === 'online' ? 'Pedido Online' : 'Pedido en Local'}</p>
                                    </div>
                                    <span class="px-3 py-1 rounded-full text-sm font-medium status-${order.estado}">
                                        ${order.estado.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                
                                <div class="border-t pt-4">
                                    <h4 class="font-medium text-gray-800 mb-3">Productos:</h4>
                                    <div class="space-y-2">
                                        ${JSON.parse(order.productos || '[]').map(item => `
                                            <div class="flex justify-between items-center text-sm">
                                                <span>${item.nombre} x${item.quantity}</span>
                                                <span class="font-medium">${Utils.formatCurrency(item.precio * item.quantity)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <div class="border-t mt-4 pt-4 flex justify-between items-center">
                                        <span class="font-semibold text-gray-800">Total:</span>
                                        <span class="font-bold text-lg text-orange-600">${Utils.formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading order history:', error);
        Utils.showToast('Error al cargar el historial', 'error');
    }
}



// Initialize demo users when app loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoUsers();
});