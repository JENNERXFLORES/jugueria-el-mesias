// Cash Register Module for Juguería El Mesías

// Cash State
const CashState = {
    currentShift: null,
    sales: [],
    expenses: [],
    cashFlow: [],
    isShiftOpen: false
};

// Load Cash Register View
function loadCashRegisterView() {
    if (!AppState.isLoggedIn || (AppState.userType !== 'trabajador' && AppState.userType !== 'admin')) {
        Utils.showToast('Acceso no autorizado', 'error');
        return;
    }
    
    AppState.currentView = 'cash';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = createCashRegisterView();
    initializeCashRegister();
}

// Create Cash Register View
function createCashRegisterView() {
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
                            <i class="fas fa-calculator text-green-500 mr-2"></i>
                            Módulo de Caja
                        </h1>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm text-gray-500">Cajero</p>
                            <p class="font-semibold">${AppState.currentUser.nombre}</p>
                        </div>
                        
                        <div id="shiftStatus" class="flex items-center space-x-2">
                            <!-- Shift status will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Shift Controls -->
            <div class="bg-white border-b px-6 py-4">
                <div id="shiftControls" class="flex items-center justify-between">
                    <!-- Shift controls will be loaded here -->
                </div>
            </div>

            <div class="p-6">
                <!-- Cash Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Ventas del Turno</p>
                                <p class="text-2xl font-bold text-green-600" id="shiftSales">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-cash-register text-2xl text-green-600"></i>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm text-gray-600">
                            <span id="shiftOrdersCount">0 órdenes</span>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Efectivo</p>
                                <p class="text-2xl font-bold text-blue-600" id="cashAmount">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-money-bill-wave text-2xl text-blue-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Tarjeta/Digital</p>
                                <p class="text-2xl font-bold text-purple-600" id="digitalAmount">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-credit-card text-2xl text-purple-600"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Gastos</p>
                                <p class="text-2xl font-bold text-red-600" id="expensesAmount">S/ 0.00</p>
                            </div>
                            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-receipt text-2xl text-red-600"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Sales List -->
                    <div class="lg:col-span-2">
                        <div class="dashboard-card p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-xl font-semibold text-gray-800">
                                    <i class="fas fa-list mr-2 text-green-500"></i>
                                    Ventas del Turno
                                </h2>
                                <div class="flex items-center space-x-3">
                                    <select id="salesFilter" 
                                            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            onchange="filterCashSales()">
                                        <option value="all">Todos los métodos</option>
                                        <option value="efectivo">Efectivo</option>
                                        <option value="tarjeta">Tarjeta</option>
                                        <option value="yape">Yape</option>
                                        <option value="plin">Plin</option>
                                    </select>
                                    <button onclick="refreshCashData()" 
                                            class="text-gray-600 hover:text-gray-800">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div id="salesList" class="space-y-3 max-h-96 overflow-y-auto">
                                <div class="flex justify-center py-8">
                                    <div class="loading-spinner mr-3"></div>
                                    <span class="text-gray-600">Cargando ventas...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="space-y-6">
                        <!-- Payment Methods Breakdown -->
                        <div class="dashboard-card p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-chart-pie mr-2 text-blue-500"></i>
                                Métodos de Pago
                            </h3>
                            <div id="paymentBreakdown" class="space-y-3">
                                <!-- Payment breakdown will be loaded here -->
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="dashboard-card p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                                <i class="fas fa-bolt mr-2 text-orange-500"></i>
                                Acciones Rápidas
                            </h3>
                            <div class="space-y-3">
                                <button onclick="showExpenseModal()" 
                                        class="w-full bg-red-100 hover:bg-red-200 text-red-700 py-3 px-4 rounded-lg text-left transition-colors">
                                    <i class="fas fa-minus-circle mr-3"></i>
                                    Registrar Gasto
                                </button>
                                
                                <button onclick="showCashCountModal()" 
                                        class="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg text-left transition-colors">
                                    <i class="fas fa-calculator mr-3"></i>
                                    Arqueo de Caja
                                </button>
                                
                                <button onclick="generateShiftReport()" 
                                        class="w-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg text-left transition-colors">
                                    <i class="fas fa-file-alt mr-3"></i>
                                    Reporte de Turno
                                </button>
                                
                                <button onclick="showPOS()" 
                                        class="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 px-4 rounded-lg text-left transition-colors">
                                    <i class="fas fa-cash-register mr-3"></i>
                                    Ir al POS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Expense Modal -->
        <div id="expenseModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-semibold text-gray-800">Registrar Gasto</h3>
                        <button onclick="closeExpenseModal()" 
                                class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="expenseForm" onsubmit="submitExpense(event)">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Concepto *</label>
                                <input type="text" 
                                       id="expenseConcept" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                       placeholder="Descripción del gasto"
                                       required>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                                <select id="expenseCategory" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required>
                                    <option value="">Seleccionar categoría</option>
                                    <option value="materia_prima">Materia Prima</option>
                                    <option value="servicios">Servicios</option>
                                    <option value="equipos">Equipos</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
                                <div class="relative">
                                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                                    <input type="number" 
                                           id="expenseAmount" 
                                           step="0.01" 
                                           min="0"
                                           class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                           placeholder="0.00"
                                           required>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Comprobante</label>
                                <input type="text" 
                                       id="expenseReceipt" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                       placeholder="Número de factura o boleta">
                            </div>
                        </div>
                        
                        <div class="flex gap-3 mt-6">
                            <button type="button" 
                                    onclick="closeExpenseModal()" 
                                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium">
                                Cancelar
                            </button>
                            <button type="submit" 
                                    class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium">
                                Registrar Gasto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Cash Count Modal -->
        <div id="cashCountModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                <div id="cashCountContent">
                    <!-- Cash count content will be loaded here -->
                </div>
            </div>
        </div>

        <!-- Shift Report Modal -->
        <div id="shiftReportModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div id="shiftReportContent">
                    <!-- Shift report content will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Initialize Cash Register
async function initializeCashRegister() {
    try {
        await loadCashData();
        updateShiftStatus();
    } catch (error) {
        console.error('Error initializing cash register:', error);
        Utils.showToast('Error al cargar el módulo de caja', 'error');
    }
}

// Load Cash Data
async function loadCashData() {
    try {
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        
        // Load sales data
        const salesResponse = await api.getSales({ limit: 100 });
        CashState.sales = (salesResponse.data || []).filter(sale => 
            sale.fecha_venta >= startOfDay
        );
        
        // Load expenses data
        const expensesResponse = await api.getExpenses({ limit: 100 });
        CashState.expenses = (expensesResponse.data || []).filter(expense => 
            expense.fecha_gasto >= startOfDay
        );
        
        updateCashSummary();
        renderSalesList();
        renderPaymentBreakdown();
        
    } catch (error) {
        console.error('Error loading cash data:', error);
        Utils.showToast('Error al cargar datos de caja', 'error');
    }
}

// Update Cash Summary
function updateCashSummary() {
    const totalSales = CashState.sales.reduce((sum, sale) => sum + sale.total, 0);
    const cashSales = CashState.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, sale) => sum + sale.total, 0);
    const digitalSales = CashState.sales.filter(s => ['tarjeta', 'yape', 'plin'].includes(s.metodo_pago)).reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = CashState.expenses.reduce((sum, expense) => sum + expense.monto, 0);
    
    document.getElementById('shiftSales').textContent = Utils.formatCurrency(totalSales);
    document.getElementById('shiftOrdersCount').textContent = `${CashState.sales.length} órdenes`;
    document.getElementById('cashAmount').textContent = Utils.formatCurrency(cashSales);
    document.getElementById('digitalAmount').textContent = Utils.formatCurrency(digitalSales);
    document.getElementById('expensesAmount').textContent = Utils.formatCurrency(totalExpenses);
}

// Update Shift Status
function updateShiftStatus() {
    const statusContainer = document.getElementById('shiftStatus');
    const controlsContainer = document.getElementById('shiftControls');
    
    // For this demo, we'll assume shift is always open
    CashState.isShiftOpen = true;
    
    if (CashState.isShiftOpen) {
        statusContainer.innerHTML = `
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-green-600 font-medium">Turno Abierto</span>
        `;
        
        controlsContainer.innerHTML = `
            <div class="flex items-center space-x-4">
                <div>
                    <span class="text-sm text-gray-600">Turno iniciado:</span>
                    <span class="font-medium">${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <button onclick="closeShift()" 
                        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                    <i class="fas fa-lock mr-2"></i>
                    Cerrar Turno
                </button>
            </div>
        `;
    } else {
        statusContainer.innerHTML = `
            <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span class="text-sm text-gray-600">Turno Cerrado</span>
        `;
        
        controlsContainer.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="text-gray-600">
                    <span class="text-sm">No hay turno activo</span>
                </div>
                <button onclick="openShift()" 
                        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
                    <i class="fas fa-unlock mr-2"></i>
                    Abrir Turno
                </button>
            </div>
        `;
    }
}

// Render Sales List
function renderSalesList() {
    const container = document.getElementById('salesList');
    
    if (CashState.sales.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-cash-register text-4xl mb-2 opacity-50"></i>
                <p>No hay ventas en el turno actual</p>
            </div>
        `;
        return;
    }
    
    // Sort sales by date (newest first)
    const sortedSales = [...CashState.sales].sort((a, b) => b.fecha_venta - a.fecha_venta);
    
    container.innerHTML = sortedSales.map(sale => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="flex-1">
                <div class="flex items-center justify-between">
                    <h4 class="font-semibold text-gray-800">${sale.cliente_nombre}</h4>
                    <span class="text-lg font-bold text-green-600">${Utils.formatCurrency(sale.total)}</span>
                </div>
                <div class="flex items-center mt-1 text-sm text-gray-600">
                    <span>${new Date(sale.fecha_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span class="mx-2">•</span>
                    <span class="capitalize flex items-center">
                        <i class="fas ${getPaymentIcon(sale.metodo_pago)} mr-1"></i>
                        ${sale.metodo_pago}
                    </span>
                    <span class="mx-2">•</span>
                    <span>${sale.vendedor_nombre}</span>
                </div>
            </div>
            
            <button onclick="viewSaleDetails('${sale.id}')" 
                    class="ml-4 text-blue-500 hover:text-blue-700">
                <i class="fas fa-eye"></i>
            </button>
        </div>
    `).join('');
}

// Get Payment Icon
function getPaymentIcon(method) {
    const icons = {
        efectivo: 'fa-money-bill-wave',
        tarjeta: 'fa-credit-card',
        yape: 'fa-mobile-alt',
        plin: 'fa-mobile-alt'
    };
    return icons[method] || 'fa-coins';
}

// Render Payment Breakdown
function renderPaymentBreakdown() {
    const container = document.getElementById('paymentBreakdown');
    
    const breakdown = {
        efectivo: CashState.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, s) => sum + s.total, 0),
        tarjeta: CashState.sales.filter(s => s.metodo_pago === 'tarjeta').reduce((sum, s) => sum + s.total, 0),
        yape: CashState.sales.filter(s => s.metodo_pago === 'yape').reduce((sum, s) => sum + s.total, 0),
        plin: CashState.sales.filter(s => s.metodo_pago === 'plin').reduce((sum, s) => sum + s.total, 0)
    };
    
    const total = Object.values(breakdown).reduce((sum, amount) => sum + amount, 0);
    
    container.innerHTML = Object.entries(breakdown).map(([method, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return `
            <div class="flex items-center justify-between py-2">
                <div class="flex items-center">
                    <i class="fas ${getPaymentIcon(method)} text-gray-500 mr-2"></i>
                    <span class="capitalize text-sm text-gray-700">${method}</span>
                </div>
                <div class="text-right">
                    <div class="text-sm font-medium">${Utils.formatCurrency(amount)}</div>
                    <div class="text-xs text-gray-500">${percentage.toFixed(1)}%</div>
                </div>
            </div>
        `;
    }).join('');
}

// Filter Cash Sales
function filterCashSales() {
    renderSalesList();
}

// Refresh Cash Data
async function refreshCashData() {
    await loadCashData();
    Utils.showToast('Datos actualizados', 'info');
}

// Show Expense Modal
function showExpenseModal() {
    const modal = document.getElementById('expenseModal');
    modal.classList.remove('hidden');
    document.getElementById('expenseConcept').focus();
}

// Close Expense Modal
function closeExpenseModal() {
    const modal = document.getElementById('expenseModal');
    modal.classList.add('hidden');
    document.getElementById('expenseForm').reset();
}

// Submit Expense
async function submitExpense(event) {
    event.preventDefault();
    
    try {
        const concept = document.getElementById('expenseConcept').value.trim();
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const receipt = document.getElementById('expenseReceipt').value.trim();
        
        if (!concept || !category || !amount) {
            Utils.showToast('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        const expenseData = {
            concepto: concept,
            categoria: category,
            monto: amount,
            fecha_gasto: Date.now(),
            responsable: AppState.currentUser.nombre,
            comprobante: receipt,
            observaciones: `Registrado por ${AppState.currentUser.nombre} desde caja`
        };
        
        await api.createExpense(expenseData);
        
        closeExpenseModal();
        await loadCashData();
        
        Utils.showToast('Gasto registrado correctamente', 'success');
        
    } catch (error) {
        console.error('Error submitting expense:', error);
        Utils.showToast('Error al registrar el gasto', 'error');
    }
}

// Show Cash Count Modal
function showCashCountModal() {
    const modal = document.getElementById('cashCountModal');
    const content = document.getElementById('cashCountContent');
    
    const cashSales = CashState.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, sale) => sum + sale.total, 0);
    
    content.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-800">Arqueo de Caja</h3>
                <button onclick="closeCashCountModal()" 
                        class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-6">
                <div class="bg-blue-50 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-800 mb-2">Efectivo Esperado</h4>
                    <p class="text-2xl font-bold text-blue-600">${Utils.formatCurrency(cashSales)}</p>
                    <p class="text-sm text-blue-600 mt-1">Según ventas registradas</p>
                </div>
                
                <form id="cashCountForm" onsubmit="submitCashCount(event)">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Efectivo Contado *</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/</span>
                                <input type="number" 
                                       id="countedCash" 
                                       step="0.01" 
                                       min="0"
                                       class="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                       placeholder="0.00"
                                       required>
                            </div>
                        </div>
                        
                        <div id="cashDifference" class="hidden p-3 rounded-lg">
                            <!-- Difference will be calculated here -->
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                            <textarea id="cashCountNotes" 
                                      rows="3" 
                                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Notas adicionales sobre el arqueo..."></textarea>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 mt-6">
                        <button type="button" 
                                onclick="closeCashCountModal()" 
                                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium">
                            Cancelar
                        </button>
                        <button type="submit" 
                                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium">
                            Confirmar Arqueo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    // Add event listener for cash difference calculation
    document.getElementById('countedCash').addEventListener('input', calculateCashDifference);
}

// Calculate Cash Difference
function calculateCashDifference() {
    const expectedCash = CashState.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, sale) => sum + sale.total, 0);
    const countedCash = parseFloat(document.getElementById('countedCash').value) || 0;
    const difference = countedCash - expectedCash;
    
    const diffElement = document.getElementById('cashDifference');
    
    if (countedCash > 0) {
        diffElement.classList.remove('hidden');
        
        if (Math.abs(difference) < 0.01) {
            diffElement.className = 'bg-green-50 border border-green-200 p-3 rounded-lg';
            diffElement.innerHTML = `
                <div class="flex items-center text-green-800">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span class="font-medium">Cuadre perfecto</span>
                </div>
            `;
        } else if (difference > 0) {
            diffElement.className = 'bg-yellow-50 border border-yellow-200 p-3 rounded-lg';
            diffElement.innerHTML = `
                <div class="flex items-center justify-between text-yellow-800">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <span class="font-medium">Sobrante</span>
                    </div>
                    <span class="font-bold">${Utils.formatCurrency(difference)}</span>
                </div>
            `;
        } else {
            diffElement.className = 'bg-red-50 border border-red-200 p-3 rounded-lg';
            diffElement.innerHTML = `
                <div class="flex items-center justify-between text-red-800">
                    <div class="flex items-center">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        <span class="font-medium">Faltante</span>
                    </div>
                    <span class="font-bold">${Utils.formatCurrency(Math.abs(difference))}</span>
                </div>
            `;
        }
    } else {
        diffElement.classList.add('hidden');
    }
}

// Close Cash Count Modal
function closeCashCountModal() {
    const modal = document.getElementById('cashCountModal');
    modal.classList.add('hidden');
}

// Submit Cash Count
async function submitCashCount(event) {
    event.preventDefault();
    
    try {
        const countedCash = parseFloat(document.getElementById('countedCash').value);
        const notes = document.getElementById('cashCountNotes').value.trim();
        const expectedCash = CashState.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, sale) => sum + sale.total, 0);
        
        // Here you could save the cash count to a dedicated table
        // For now, we'll just show a success message
        
        closeCashCountModal();
        Utils.showToast('Arqueo de caja registrado', 'success');
        
    } catch (error) {
        console.error('Error submitting cash count:', error);
        Utils.showToast('Error al registrar el arqueo', 'error');
    }
}

// Generate Shift Report
function generateShiftReport() {
    const modal = document.getElementById('shiftReportModal');
    const content = document.getElementById('shiftReportContent');
    
    const totalSales = CashState.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = CashState.expenses.reduce((sum, expense) => sum + expense.monto, 0);
    const netAmount = totalSales - totalExpenses;
    
    const salesByMethod = {
        efectivo: CashState.sales.filter(s => s.metodo_pago === 'efectivo').reduce((sum, s) => sum + s.total, 0),
        tarjeta: CashState.sales.filter(s => s.metodo_pago === 'tarjeta').reduce((sum, s) => sum + s.total, 0),
        yape: CashState.sales.filter(s => s.metodo_pago === 'yape').reduce((sum, s) => sum + s.total, 0),
        plin: CashState.sales.filter(s => s.metodo_pago === 'plin').reduce((sum, s) => sum + s.total, 0)
    };
    
    content.innerHTML = `
        <div class="p-6">
            <div class="text-center border-b pb-4 mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Reporte de Turno</h2>
                <p class="text-gray-600">${new Date().toLocaleDateString('es-PE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                <p class="text-sm text-gray-500">Cajero: ${AppState.currentUser.nombre}</p>
            </div>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-green-50 rounded-lg p-4 text-center">
                    <h3 class="text-sm font-medium text-green-600">Total Ventas</h3>
                    <p class="text-2xl font-bold text-green-800">${Utils.formatCurrency(totalSales)}</p>
                    <p class="text-sm text-green-600">${CashState.sales.length} transacciones</p>
                </div>
                
                <div class="bg-red-50 rounded-lg p-4 text-center">
                    <h3 class="text-sm font-medium text-red-600">Total Gastos</h3>
                    <p class="text-2xl font-bold text-red-800">${Utils.formatCurrency(totalExpenses)}</p>
                    <p class="text-sm text-red-600">${CashState.expenses.length} gastos</p>
                </div>
            </div>
            
            <!-- Payment Methods -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Ventas por Método de Pago</h3>
                <div class="space-y-2">
                    ${Object.entries(salesByMethod).map(([method, amount]) => `
                        <div class="flex justify-between items-center py-2 border-b">
                            <span class="capitalize flex items-center">
                                <i class="fas ${getPaymentIcon(method)} mr-2 text-gray-500"></i>
                                ${method}
                            </span>
                            <span class="font-medium">${Utils.formatCurrency(amount)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Net Amount -->
            <div class="bg-blue-50 rounded-lg p-4 mb-6">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-blue-800">Saldo Neto del Turno:</span>
                    <span class="text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${Utils.formatCurrency(netAmount)}
                    </span>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex gap-3">
                <button onclick="closeShiftReport()" 
                        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium">
                    Cerrar
                </button>
                <button onclick="printShiftReport()" 
                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium">
                    <i class="fas fa-print mr-2"></i>
                    Imprimir
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close Shift Report
function closeShiftReport() {
    const modal = document.getElementById('shiftReportModal');
    modal.classList.add('hidden');
}

// Print Shift Report
function printShiftReport() {
    window.print();
}

// View Sale Details
function viewSaleDetails(saleId) {
    Utils.showToast('Funcionalidad próximamente disponible', 'info');
}

// Open Shift
function openShift() {
    CashState.isShiftOpen = true;
    updateShiftStatus();
    Utils.showToast('Turno iniciado', 'success');
}

// Close Shift
function closeShift() {
    if (confirm('¿Estás seguro de que quieres cerrar el turno actual?')) {
        generateShiftReport();
    }
}

// Cleanup when leaving cash view
function cleanupCash() {
    // Cleanup code if needed
}

// Add styles for cash module
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .max-h-90vh {
            max-height: 90vh;
        }
        
        @media print {
            body * {
                visibility: hidden;
            }
            
            #shiftReportContent, #shiftReportContent * {
                visibility: visible;
            }
            
            #shiftReportContent {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
});