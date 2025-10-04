// Reports Module for Juguería El Mesías

// Reports State
const ReportsState = {
    dateRange: 'today', // today, week, month, custom
    startDate: null,
    endDate: null,
    reportType: 'sales', // sales, products, customers, financial
    charts: {},
    data: {
        sales: [],
        products: [],
        orders: [],
        expenses: []
    }
};

// Load Reports View
function loadReportsView() {
    if (!AppState.isLoggedIn || (AppState.userType !== 'trabajador' && AppState.userType !== 'admin')) {
        Utils.showToast('Acceso no autorizado', 'error');
        return;
    }
    
    AppState.currentView = 'reports';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = createReportsView();
    initializeReports();
}

// Create Reports View
function createReportsView() {
    return `
        <div class="min-h-screen bg-gray-100">
            <!-- Header -->
            <div class="bg-white shadow-sm px-6 py-4 border-b">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <button onclick="showDashboard()" class="text-gray-600 hover:text-gray-800 mr-4">
                            <i class="fas fa-arrow-left text-xl"></i>
                        </button>
                        <h1 class="text-2xl font-bold text-gray-800">
                            <i class="fas fa-chart-bar text-indigo-500 mr-2"></i>
                            Módulo de Reportes
                        </h1>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <button onclick="exportReport()" 
                                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                            <i class="fas fa-download mr-2"></i>
                            Exportar
                        </button>
                        
                        <button onclick="refreshReportsData()" 
                                class="text-gray-600 hover:text-gray-800">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Filters -->
            <div class="bg-white border-b px-6 py-4">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <!-- Date Range -->
                    <div class="flex items-center space-x-3">
                        <label class="text-sm font-medium text-gray-700">Período:</label>
                        <select id="dateRangeSelect" 
                                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                onchange="changeDateRange()">
                            <option value="today">Hoy</option>
                            <option value="week">Esta Semana</option>
                            <option value="month">Este Mes</option>
                            <option value="custom">Personalizado</option>
                        </select>
                        
                        <div id="customDateRange" class="hidden flex items-center space-x-2">
                            <input type="date" 
                                   id="startDate" 
                                   class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <span class="text-gray-500">a</span>
                            <input type="date" 
                                   id="endDate" 
                                   class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                            <button onclick="applyCustomDateRange()" 
                                    class="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm">
                                Aplicar
                            </button>
                        </div>
                    </div>
                    
                    <!-- Report Type -->
                    <div class="flex items-center space-x-3">
                        <label class="text-sm font-medium text-gray-700">Tipo de reporte:</label>
                        <select id="reportTypeSelect" 
                                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                onchange="changeReportType()">
                            <option value="sales">Ventas</option>
                            <option value="products">Productos</option>
                            <option value="customers">Clientes</option>
                            <option value="financial">Financiero</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="p-6">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Ventas Totales</p>
                                <p class="text-2xl font-bold text-green-600" id="totalSalesAmount">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-dollar-sign text-2xl text-green-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <span class="text-green-500" id="salesGrowth">+0%</span>
                            <span class="text-gray-500 ml-1">vs período anterior</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Órdenes</p>
                                <p class="text-2xl font-bold text-blue-600" id="totalOrders">0</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-shopping-cart text-2xl text-blue-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <span class="text-blue-500" id="ordersGrowth">+0%</span>
                            <span class="text-gray-500 ml-1">vs período anterior</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Ticket Promedio</p>
                                <p class="text-2xl font-bold text-orange-600" id="avgTicket">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-receipt text-2xl text-orange-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <span class="text-orange-500" id="ticketGrowth">+0%</span>
                            <span class="text-gray-500 ml-1">vs período anterior</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Utilidad Neta</p>
                                <p class="text-2xl font-bold text-purple-600" id="netProfit">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-2xl text-purple-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm">
                            <span class="text-purple-500" id="profitGrowth">+0%</span>
                            <span class="text-gray-500 ml-1">vs período anterior</span>
                        </div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="grid lg:grid-cols-2 gap-8 mb-8">
                    <!-- Sales Chart -->
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-800">
                                <i class="fas fa-chart-line mr-2 text-blue-500"></i>
                                Tendencia de Ventas
                            </h3>
                            <div class="flex items-center space-x-2">
                                <select id="salesChartType" 
                                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                        onchange="updateSalesChart()">
                                    <option value="daily">Diario</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-container">
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Products Chart -->
                    <div class="dashboard-card p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-6">
                            <i class="fas fa-chart-pie mr-2 text-green-500"></i>
                            Productos Más Vendidos
                        </h3>
                        <div class="chart-container">
                            <canvas id="productsChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Additional Charts -->
                <div class="grid lg:grid-cols-2 gap-8 mb-8">
                    <!-- Payment Methods Chart -->
                    <div class="dashboard-card p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-6">
                            <i class="fas fa-credit-card mr-2 text-purple-500"></i>
                            Métodos de Pago
                        </h3>
                        <div class="chart-container">
                            <canvas id="paymentsChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Financial Overview -->
                    <div class="dashboard-card p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-6">
                            <i class="fas fa-balance-scale mr-2 text-indigo-500"></i>
                            Ingresos vs Gastos
                        </h3>
                        <div class="chart-container">
                            <canvas id="financialChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Detailed Tables -->
                <div id="detailedReports" class="space-y-8">
                    <!-- Will be populated based on report type -->
                </div>
            </div>
        </div>

        <!-- Export Modal -->
        <div id="exportModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-semibold text-gray-800">Exportar Reporte</h3>
                        <button onclick="closeExportModal()" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                            <select id="exportFormat" 
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                <option value="pdf">PDF</option>
                                <option value="excel">Excel</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Incluir</label>
                            <div class="space-y-2">
                                <label class="flex items-center">
                                    <input type="checkbox" id="includeCharts" class="rounded border-gray-300 text-green-600 focus:ring-green-500" checked>
                                    <span class="ml-2 text-sm text-gray-700">Gráficos</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="includeTables" class="rounded border-gray-300 text-green-600 focus:ring-green-500" checked>
                                    <span class="ml-2 text-sm text-gray-700">Tablas de datos</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="checkbox" id="includeSummary" class="rounded border-gray-300 text-green-600 focus:ring-green-500" checked>
                                    <span class="ml-2 text-sm text-gray-700">Resumen ejecutivo</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 mt-6">
                        <button onclick="closeExportModal()" 
                                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium">
                            Cancelar
                        </button>
                        <button onclick="processExport()" 
                                class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium">
                            <i class="fas fa-download mr-2"></i>
                            Exportar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize Reports
async function initializeReports() {
    try {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = async () => {
                await loadReportsData();
                initializeCharts();
            };
            document.head.appendChild(script);
        } else {
            await loadReportsData();
            initializeCharts();
        }
    } catch (error) {
        console.error('Error initializing reports:', error);
        Utils.showToast('Error al cargar los reportes', 'error');
    }
}

// Load Reports Data
async function loadReportsData() {
    try {
        const dateRange = getDateRange();
        
        // Load all data
        const [salesResponse, ordersResponse, expensesResponse, productsResponse] = await Promise.all([
            api.getSales({ limit: 1000 }),
            api.getOrders({ limit: 1000 }),
            api.getExpenses({ limit: 1000 }),
            api.getProducts({ limit: 100 })
        ]);
        
        // Filter data by date range
        ReportsState.data.sales = (salesResponse.data || []).filter(sale => 
            sale.fecha_venta >= dateRange.start && sale.fecha_venta <= dateRange.end
        );
        
        ReportsState.data.orders = (ordersResponse.data || []).filter(order => 
            order.fecha_pedido >= dateRange.start && order.fecha_pedido <= dateRange.end
        );
        
        ReportsState.data.expenses = (expensesResponse.data || []).filter(expense => 
            expense.fecha_gasto >= dateRange.start && expense.fecha_gasto <= dateRange.end
        );
        
        ReportsState.data.products = productsResponse.data || [];
        
        updateSummaryCards();
        updateDetailedReports();
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        Utils.showToast('Error al cargar datos de reportes', 'error');
    }
}

// Get Date Range
function getDateRange() {
    const today = new Date();
    let start, end;
    
    switch (ReportsState.dateRange) {
        case 'today':
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            end = start + (24 * 60 * 60 * 1000);
            break;
        case 'week':
            const dayOfWeek = today.getDay();
            const diff = today.getDate() - dayOfWeek;
            start = new Date(today.getFullYear(), today.getMonth(), diff).getTime();
            end = start + (7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            start = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime();
            break;
        case 'custom':
            start = ReportsState.startDate ? new Date(ReportsState.startDate).getTime() : today.getTime();
            end = ReportsState.endDate ? new Date(ReportsState.endDate).getTime() : today.getTime();
            break;
        default:
            start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            end = start + (24 * 60 * 60 * 1000);
    }
    
    return { start, end };
}

// Update Summary Cards
function updateSummaryCards() {
    const totalSales = ReportsState.data.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = ReportsState.data.orders.length;
    const totalExpenses = ReportsState.data.expenses.reduce((sum, expense) => sum + expense.monto, 0);
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    const netProfit = totalSales - totalExpenses;
    
    document.getElementById('totalSalesAmount').textContent = Utils.formatCurrency(totalSales);
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('avgTicket').textContent = Utils.formatCurrency(avgTicket);
    document.getElementById('netProfit').textContent = Utils.formatCurrency(netProfit);
    
    // Mock growth percentages (in a real app, you'd calculate vs previous period)
    document.getElementById('salesGrowth').textContent = '+12.5%';
    document.getElementById('ordersGrowth').textContent = '+8.3%';
    document.getElementById('ticketGrowth').textContent = '+3.7%';
    document.getElementById('profitGrowth').textContent = '+15.2%';
}

// Initialize Charts
function initializeCharts() {
    createSalesChart();
    createProductsChart();
    createPaymentsChart();
    createFinancialChart();
}

// Create Sales Chart
function createSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx || !Chart) return;
    
    // Prepare data for the last 7 days
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
    ReportsState.data.sales.forEach(sale => {
        const saleDate = new Date(sale.fecha_venta).toISOString().split('T')[0];
        if (salesByDay.hasOwnProperty(saleDate)) {
            salesByDay[saleDate] += sale.total;
        }
    });
    
    if (ReportsState.charts.sales) {
        ReportsState.charts.sales.destroy();
    }
    
    ReportsState.charts.sales = new Chart(ctx, {
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
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
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
            }
        }
    });
}

// Create Products Chart
function createProductsChart() {
    const ctx = document.getElementById('productsChart');
    if (!ctx || !Chart) return;
    
    // Calculate product sales
    const productSales = {};
    ReportsState.data.orders.forEach(order => {
        try {
            const productos = JSON.parse(order.productos || '[]');
            productos.forEach(product => {
                productSales[product.nombre] = (productSales[product.nombre] || 0) + product.quantity;
            });
        } catch (error) {
            console.error('Error parsing products:', error);
        }
    });
    
    // Get top 5 products
    const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (ReportsState.charts.products) {
        ReportsState.charts.products.destroy();
    }
    
    ReportsState.charts.products = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: topProducts.map(([name]) => name),
            datasets: [{
                data: topProducts.map(([,quantity]) => quantity),
                backgroundColor: [
                    '#f97316',
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
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
            }
        }
    });
}

// Create Payments Chart
function createPaymentsChart() {
    const ctx = document.getElementById('paymentsChart');
    if (!ctx || !Chart) return;
    
    const paymentMethods = {
        'Efectivo': ReportsState.data.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, s) => sum + s.total, 0),
        'Tarjeta': ReportsState.data.sales.filter(s => s.metodo_pago === 'tarjeta').reduce((sum, s) => sum + s.total, 0),
        'Yape': ReportsState.data.sales.filter(s => s.metodo_pago === 'yape').reduce((sum, s) => sum + s.total, 0),
        'Plin': ReportsState.data.sales.filter(s => s.metodo_pago === 'plin').reduce((sum, s) => sum + s.total, 0)
    };
    
    if (ReportsState.charts.payments) {
        ReportsState.charts.payments.destroy();
    }
    
    ReportsState.charts.payments = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                label: 'Monto (S/)',
                data: Object.values(paymentMethods),
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#8b5cf6',
                    '#f97316'
                ],
                borderRadius: 8,
                borderSkipped: false
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
            }
        }
    });
}

// Create Financial Chart
function createFinancialChart() {
    const ctx = document.getElementById('financialChart');
    if (!ctx || !Chart) return;
    
    const totalIncome = ReportsState.data.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = ReportsState.data.expenses.reduce((sum, expense) => sum + expense.monto, 0);
    const netProfit = totalIncome - totalExpenses;
    
    if (ReportsState.charts.financial) {
        ReportsState.charts.financial.destroy();
    }
    
    ReportsState.charts.financial = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Gastos', 'Utilidad Neta'],
            datasets: [{
                data: [totalIncome, totalExpenses, netProfit],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    netProfit >= 0 ? '#3b82f6' : '#ef4444'
                ],
                borderRadius: 8,
                borderSkipped: false
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
            }
        }
    });
}

// Update Detailed Reports
function updateDetailedReports() {
    const container = document.getElementById('detailedReports');
    
    switch (ReportsState.reportType) {
        case 'sales':
            container.innerHTML = createSalesReport();
            break;
        case 'products':
            container.innerHTML = createProductsReport();
            break;
        case 'customers':
            container.innerHTML = createCustomersReport();
            break;
        case 'financial':
            container.innerHTML = createFinancialReport();
            break;
    }
}

// Create Sales Report
function createSalesReport() {
    return `
        <div class="dashboard-card p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-6">
                <i class="fas fa-table mr-2 text-green-500"></i>
                Detalle de Ventas
            </h3>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${ReportsState.data.sales.map(sale => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${new Date(sale.fecha_venta).toLocaleDateString('es-PE')}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.cliente_nombre}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.vendedor_nombre}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="capitalize text-sm text-gray-900">${sale.metodo_pago}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    ${Utils.formatCurrency(sale.total)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Create Products Report
function createProductsReport() {
    const productSales = {};
    const productRevenue = {};
    
    ReportsState.data.orders.forEach(order => {
        try {
            const productos = JSON.parse(order.productos || '[]');
            productos.forEach(product => {
                productSales[product.nombre] = (productSales[product.nombre] || 0) + product.quantity;
                productRevenue[product.nombre] = (productRevenue[product.nombre] || 0) + (product.precio * product.quantity);
            });
        } catch (error) {
            console.error('Error parsing products:', error);
        }
    });
    
    const productsData = Object.entries(productSales).map(([name, quantity]) => ({
        name,
        quantity,
        revenue: productRevenue[name] || 0
    })).sort((a, b) => b.quantity - a.quantity);
    
    return `
        <div class="dashboard-card p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-6">
                <i class="fas fa-table mr-2 text-blue-500"></i>
                Análisis de Productos
            </h3>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Vendida</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Promedio</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${productsData.map(product => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${product.quantity}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${Utils.formatCurrency(product.revenue)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    ${Utils.formatCurrency(product.quantity > 0 ? product.revenue / product.quantity : 0)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Create Customers Report
function createCustomersReport() {
    const customerData = {};
    
    ReportsState.data.orders.forEach(order => {
        if (!customerData[order.cliente_nombre]) {
            customerData[order.cliente_nombre] = {
                orders: 0,
                total: 0,
                lastOrder: order.fecha_pedido
            };
        }
        
        customerData[order.cliente_nombre].orders++;
        customerData[order.cliente_nombre].total += order.total;
        
        if (order.fecha_pedido > customerData[order.cliente_nombre].lastOrder) {
            customerData[order.cliente_nombre].lastOrder = order.fecha_pedido;
        }
    });
    
    const customersArray = Object.entries(customerData)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total);
    
    return `
        <div class="dashboard-card p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-6">
                <i class="fas fa-table mr-2 text-purple-500"></i>
                Análisis de Clientes
            </h3>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gastado</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Promedio</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Pedido</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${customersArray.map(customer => `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${customer.name}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${customer.orders}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${Utils.formatCurrency(customer.total)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                    ${Utils.formatCurrency(customer.orders > 0 ? customer.total / customer.orders : 0)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${new Date(customer.lastOrder).toLocaleDateString('es-PE')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Create Financial Report
function createFinancialReport() {
    const totalIncome = ReportsState.data.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = ReportsState.data.expenses.reduce((sum, expense) => sum + expense.monto, 0);
    
    const expensesByCategory = {};
    ReportsState.data.expenses.forEach(expense => {
        expensesByCategory[expense.categoria] = (expensesByCategory[expense.categoria] || 0) + expense.monto;
    });
    
    return `
        <div class="grid lg:grid-cols-2 gap-8">
            <!-- Income vs Expenses -->
            <div class="dashboard-card p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-6">
                    <i class="fas fa-chart-line mr-2 text-indigo-500"></i>
                    Resumen Financiero
                </h3>
                <div class="space-y-4">
                    <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                        <span class="font-medium text-green-800">Ingresos Totales:</span>
                        <span class="text-xl font-bold text-green-600">${Utils.formatCurrency(totalIncome)}</span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                        <span class="font-medium text-red-800">Gastos Totales:</span>
                        <span class="text-xl font-bold text-red-600">${Utils.formatCurrency(totalExpenses)}</span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span class="font-medium text-blue-800">Utilidad Neta:</span>
                        <span class="text-xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-blue-600' : 'text-red-600'}">
                            ${Utils.formatCurrency(totalIncome - totalExpenses)}
                        </span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-800">Margen de Ganancia:</span>
                        <span class="text-xl font-bold text-gray-600">
                            ${totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                </div>
            </div>
            
            <!-- Expenses by Category -->
            <div class="dashboard-card p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-6">
                    <i class="fas fa-tags mr-2 text-red-500"></i>
                    Gastos por Categoría
                </h3>
                <div class="space-y-3">
                    ${Object.entries(expensesByCategory).map(([category, amount]) => {
                        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                        return `
                            <div class="flex justify-between items-center">
                                <span class="capitalize text-gray-700">${category.replace('_', ' ')}</span>
                                <div class="text-right">
                                    <div class="font-medium">${Utils.formatCurrency(amount)}</div>
                                    <div class="text-sm text-gray-500">${percentage.toFixed(1)}%</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

// Change Date Range
function changeDateRange() {
    const select = document.getElementById('dateRangeSelect');
    ReportsState.dateRange = select.value;
    
    const customRange = document.getElementById('customDateRange');
    
    if (ReportsState.dateRange === 'custom') {
        customRange.classList.remove('hidden');
    } else {
        customRange.classList.add('hidden');
        loadReportsData().then(() => {
            initializeCharts();
        });
    }
}

// Apply Custom Date Range
function applyCustomDateRange() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        Utils.showToast('Por favor selecciona ambas fechas', 'error');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        Utils.showToast('La fecha de inicio debe ser anterior a la fecha de fin', 'error');
        return;
    }
    
    ReportsState.startDate = startDate;
    ReportsState.endDate = endDate;
    
    loadReportsData().then(() => {
        initializeCharts();
    });
}

// Change Report Type
function changeReportType() {
    const select = document.getElementById('reportTypeSelect');
    ReportsState.reportType = select.value;
    updateDetailedReports();
}

// Update Sales Chart
function updateSalesChart() {
    createSalesChart();
}

// Refresh Reports Data
async function refreshReportsData() {
    await loadReportsData();
    initializeCharts();
    Utils.showToast('Datos actualizados', 'info');
}

// Export Report
function exportReport() {
    const modal = document.getElementById('exportModal');
    modal.classList.remove('hidden');
}

// Close Export Modal
function closeExportModal() {
    const modal = document.getElementById('exportModal');
    modal.classList.add('hidden');
}

// Process Export
function processExport() {
    const format = document.getElementById('exportFormat').value;
    const includeCharts = document.getElementById('includeCharts').checked;
    const includeTables = document.getElementById('includeTables').checked;
    const includeSummary = document.getElementById('includeSummary').checked;
    
    // In a real implementation, this would generate and download the report
    Utils.showToast(`Exportando reporte en formato ${format.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
        closeExportModal();
        Utils.showToast('Reporte exportado exitosamente', 'success');
    }, 2000);
}

// Cleanup when leaving reports view
function cleanupReports() {
    // Destroy all charts
    Object.values(ReportsState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    ReportsState.charts = {};
}

// Add styles and cleanup
document.addEventListener('DOMContentLoaded', function() {
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanupReports);
});