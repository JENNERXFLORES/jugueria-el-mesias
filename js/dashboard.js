// Administrative Dashboard for Juguería El Mesías

// Show Dashboard
function showDashboard() {
    if (!AppState.isLoggedIn || (AppState.userType !== 'trabajador' && AppState.userType !== 'admin')) {
        Utils.showToast('Acceso no autorizado', 'error');
        showLogin();
        return;
    }
    
    AppState.currentView = 'dashboard';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = createDashboardView();
    initializeDashboard();
}

// Create Dashboard View
function createDashboardView() {
    return `
        <div class="min-h-screen bg-gray-100 py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Header -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <button onclick="goHome()" class="text-gray-500 hover:text-gray-600 mr-4">
                                <i class="fas fa-home text-xl"></i>
                            </button>
                            <div>
                                <h1 class="text-3xl font-bold text-gray-800">Dashboard - El Mesías</h1>
                                <p class="text-gray-600 mt-1">Bienvenido, ${AppState.currentUser.nombre}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm text-gray-500">Fecha actual</p>
                            <p class="text-lg font-semibold">${new Date().toLocaleDateString('es-PE')}</p>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Ventas Hoy</p>
                                <p class="text-2xl font-bold text-green-600" id="todaySales">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-dollar-sign text-2xl text-green-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <i class="fas fa-arrow-up text-green-500 mr-1"></i>
                            <span class="text-green-500 font-medium">+12% vs ayer</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Pedidos Activos</p>
                                <p class="text-2xl font-bold text-orange-600" id="activePedidos">0</p>
                            </div>
                            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart text-2xl text-orange-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <i class="fas fa-clock text-orange-500 mr-1"></i>
                            <span class="text-orange-500 font-medium">En preparación</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Productos</p>
                                <p class="text-2xl font-bold text-blue-600" id="totalProducts">0</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-box text-2xl text-blue-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <i class="fas fa-check-circle text-green-500 mr-1"></i>
                            <span class="text-green-500 font-medium">Disponibles</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Clientes Hoy</p>
                                <p class="text-2xl font-bold text-purple-600" id="todayCustomers">0</p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-users text-2xl text-purple-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <i class="fas fa-user-plus text-purple-500 mr-1"></i>
                            <span class="text-purple-500 font-medium">Nuevos clientes</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-card p-6 mb-8">
                    <h2 class="text-xl font-semibold text-gray-800 mb-6">Acciones Rápidas</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <button onclick="showPOS()" class="pos-button bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
                            <i class="fas fa-cash-register text-2xl mb-2"></i>
                            <span>POS Ventas</span>
                        </button>
                        
                        <button onclick="showProductManagement()" class="pos-button bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                            <i class="fas fa-box-open text-2xl mb-2"></i>
                            <span>Productos</span>
                        </button>
                        
                        <button onclick="showKitchen()" class="pos-button bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700">
                            <i class="fas fa-utensils text-2xl mb-2"></i>
                            <span>Cocina</span>
                        </button>
                        
                        <button onclick="showCashRegister()" class="pos-button bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700">
                            <i class="fas fa-calculator text-2xl mb-2"></i>
                            <span>Caja</span>
                        </button>
                        
                        <button onclick="showExpensesManagement()" class="pos-button bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700">
                            <i class="fas fa-receipt text-2xl mb-2"></i>
                            <span>Gastos</span>
                        </button>
                        
                        <button onclick="showReports()" class="pos-button bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700">
                            <i class="fas fa-chart-bar text-2xl mb-2"></i>
                            <span>Reportes</span>
                        </button>
                    </div>
                </div>

                <!-- Recent Orders and Activity -->
                <div class="grid lg:grid-cols-2 gap-8">
                    <!-- Recent Orders -->
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-800">
                                <i class="fas fa-clock mr-2 text-orange-500"></i>
                                Pedidos Recientes
                            </h3>
                            <button onclick="showKitchen()" class="text-orange-500 hover:text-orange-600 text-sm font-medium">
                                Ver todos
                            </button>
                        </div>
                        <div id="recentOrders">
                            <div class="flex justify-center py-8">
                                <div class="loading-spinner"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Today's Summary -->
                    <div class="dashboard-card p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-6">
                            <i class="fas fa-chart-line mr-2 text-green-500"></i>
                            Resumen del Día
                        </h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center py-3 border-b">
                                <span class="text-gray-600">Ventas del día</span>
                                <span class="font-semibold text-green-600" id="summaryTodaySales">S/ 0.00</span>
                            </div>
                            <div class="flex justify-between items-center py-3 border-b">
                                <span class="text-gray-600">Pedidos completados</span>
                                <span class="font-semibold" id="summaryCompletedOrders">0</span>
                            </div>
                            <div class="flex justify-between items-center py-3 border-b">
                                <span class="text-gray-600">Producto más vendido</span>
                                <span class="font-semibold" id="summaryTopProduct">-</span>
                            </div>
                            <div class="flex justify-between items-center py-3">
                                <span class="text-gray-600">Promedio por pedido</span>
                                <span class="font-semibold text-blue-600" id="summaryAverageOrder">S/ 0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Chart Section -->
                <div class="dashboard-card p-6 mt-8">
                    <h3 class="text-lg font-semibold text-gray-800 mb-6">
                        <i class="fas fa-chart-area mr-2 text-blue-500"></i>
                        Ventas de los Últimos 7 Días
                    </h3>
                    <div class="chart-container">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize Dashboard
async function initializeDashboard() {
    try {
        await loadDashboardData();
        await loadRecentOrders();
        initializeSalesChart();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        Utils.showToast('Error al cargar el dashboard', 'error');
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
        
        // Load sales data
        const salesResponse = await api.getSales({ limit: 100 });
        const sales = salesResponse.data || [];
        
        // Load orders data
        const ordersResponse = await api.getOrders({ limit: 100 });
        const orders = ordersResponse.data || [];
        
        // Load products data
        const productsResponse = await api.getProducts({ limit: 100 });
        const products = productsResponse.data || [];
        
        // Calculate today's sales
        const todaysSales = sales
            .filter(sale => sale.fecha_venta >= startOfDay && sale.fecha_venta < endOfDay)
            .reduce((sum, sale) => sum + sale.total, 0);
        
        // Calculate active orders
        const activeOrders = orders.filter(order => 
            order.estado === 'pendiente' || order.estado === 'en_preparacion'
        ).length;
        
        // Calculate today's customers
        const todaysCustomers = new Set(
            orders
                .filter(order => order.fecha_pedido >= startOfDay && order.fecha_pedido < endOfDay)
                .map(order => order.cliente_nombre)
        ).size;
        
        // Update UI
        document.getElementById('todaySales').textContent = Utils.formatCurrency(todaysSales);
        document.getElementById('activePedidos').textContent = activeOrders;
        document.getElementById('totalProducts').textContent = products.filter(p => p.disponible).length;
        document.getElementById('todayCustomers').textContent = todaysCustomers;
        
        // Update summary
        document.getElementById('summaryTodaySales').textContent = Utils.formatCurrency(todaysSales);
        const completedOrders = orders.filter(order => 
            order.estado === 'entregado' && 
            order.fecha_pedido >= startOfDay && 
            order.fecha_pedido < endOfDay
        ).length;
        document.getElementById('summaryCompletedOrders').textContent = completedOrders;
        
        // Calculate average order
        const averageOrder = completedOrders > 0 ? todaysSales / completedOrders : 0;
        document.getElementById('summaryAverageOrder').textContent = Utils.formatCurrency(averageOrder);
        
        // Calculate top product
        const productSales = {};
        orders
            .filter(order => order.fecha_pedido >= startOfDay && order.fecha_pedido < endOfDay)
            .forEach(order => {
                try {
                    const productos = JSON.parse(order.productos || '[]');
                    productos.forEach(product => {
                        productSales[product.nombre] = (productSales[product.nombre] || 0) + product.quantity;
                    });
                } catch (error) {
                    console.error('Error parsing products:', error);
                }
            });
        
        const topProduct = Object.keys(productSales).reduce((a, b) => 
            productSales[a] > productSales[b] ? a : b, '-'
        );
        
        document.getElementById('summaryTopProduct').textContent = topProduct;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load Recent Orders
async function loadRecentOrders() {
    try {
        const ordersResponse = await api.getOrders({ 
            limit: 5,
            sort: 'fecha_pedido'
        });
        
        const orders = ordersResponse.data || [];
        const container = document.getElementById('recentOrders');
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-clipboard-list text-4xl mb-2 opacity-50"></i>
                    <p>No hay pedidos recientes</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-3 last:mb-0 hover:bg-gray-50 transition-colors">
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <p class="font-semibold text-gray-800">${order.cliente_nombre}</p>
                        <span class="px-2 py-1 rounded-full text-xs font-medium status-${order.estado}">
                            ${order.estado.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">
                        ${Utils.formatDate(order.fecha_pedido)} • ${Utils.formatCurrency(order.total)}
                    </p>
                </div>
                <button onclick="viewOrderDetails('${order.id}')" 
                        class="ml-4 text-orange-500 hover:text-orange-600">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        document.getElementById('recentOrders').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>Error al cargar pedidos</p>
            </div>
        `;
    }
}

// Initialize Sales Chart
async function initializeSalesChart() {
    try {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => createSalesChart();
            document.head.appendChild(script);
        } else {
            createSalesChart();
        }
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// Create Sales Chart
async function createSalesChart() {
    try {
        const salesResponse = await api.getSales({ limit: 100 });
        const sales = salesResponse.data || [];
        
        // Generate last 7 days data
        const last7Days = [];
        const salesByDay = {};
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(dateStr);
            salesByDay[dateStr] = 0;
        }
        
        // Calculate sales by day
        sales.forEach(sale => {
            const saleDate = new Date(sale.fecha_venta).toISOString().split('T')[0];
            if (salesByDay.hasOwnProperty(saleDate)) {
                salesByDay[saleDate] += sale.total;
            }
        });
        
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(date => 
                    new Date(date).toLocaleDateString('es-PE', { 
                        weekday: 'short',
                        day: 'numeric'
                    })
                ),
                datasets: [{
                    label: 'Ventas (S/)',
                    data: last7Days.map(date => salesByDay[date]),
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f97316',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
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
                                return 'S/ ' + value.toFixed(0);
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error creating sales chart:', error);
    }
}

// View Order Details
function viewOrderDetails(orderId) {
    // TODO: Implement order details modal
    Utils.showToast('Funcionalidad próximamente disponible', 'info');
}

// Navigation Functions for Dashboard Modules
function showPOS() {
    AppState.currentView = 'pos';
    loadPOSView();
}

function showProductManagement() {
    AppState.currentView = 'products';
    loadProductManagementView();
}

function showKitchen() {
    AppState.currentView = 'kitchen';
    loadKitchenView();
}

function showCashRegister() {
    AppState.currentView = 'cash';
    loadCashRegisterView();
}

function showExpensesManagement() {
    AppState.currentView = 'expenses';
    loadExpensesView();
}

function showReports() {
    AppState.currentView = 'reports';
    loadReportsView();
}

// Placeholder functions for module loading
function loadPOSView() {
    Utils.showToast('Cargando módulo POS...', 'info');
    // POS implementation will be in pos.js
}

function loadProductManagementView() {
    Utils.showToast('Cargando gestión de productos...', 'info');
    // Product management implementation will be in products.js
}

function loadKitchenView() {
    Utils.showToast('Cargando módulo de cocina...', 'info');
    // Kitchen implementation will be in kitchen.js
}

function loadCashRegisterView() {
    Utils.showToast('Cargando módulo de caja...', 'info');
    // Cash register implementation will be in cash.js
}

function loadExpensesView() {
    Utils.showToast('Cargando módulo de gastos...', 'info');
    // Expenses implementation will be in expenses.js
}

function loadReportsView() {
    Utils.showToast('Cargando módulo de reportes...', 'info');
    // Reports implementation will be in reports.js
}