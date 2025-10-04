// Kitchen Module for Juguería El Mesías

// Kitchen State
const KitchenState = {
    orders: [],
    filter: 'all', // all, pendiente, en_preparacion, listo
    refreshInterval: null,
    sounds: {
        newOrder: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgYIDuV3PCReAQCLITJ8tGGNQQOccDu45hPEAhRqdxNEAhQqdx...'),
        orderReady: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgYIDuV3PCReAQCLITJ8tGGNQQOccDu45hPEAhRqdx...')
    }
};

// Load Kitchen View
function loadKitchenView() {
    if (!AppState.isLoggedIn || (AppState.userType !== 'trabajador' && AppState.userType !== 'admin')) {
        Utils.showToast('Acceso no autorizado', 'error');
        return;
    }
    
    AppState.currentView = 'kitchen';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = createKitchenView();
    initializeKitchen();
}

// Create Kitchen View
function createKitchenView() {
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
                            <i class="fas fa-utensils text-orange-500 mr-2"></i>
                            Módulo de Cocina
                        </h1>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-sm text-gray-600">Tiempo real</span>
                        </div>
                        
                        <button onclick="refreshKitchenOrders()" 
                                class="text-gray-600 hover:text-gray-800">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        
                        <div class="text-right">
                            <p class="text-sm text-gray-500">Cocinero</p>
                            <p class="font-semibold">${AppState.currentUser.nombre}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Bar -->
            <div class="bg-white border-b px-6 py-4">
                <div class="grid grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-yellow-600" id="pendingCount">0</div>
                        <div class="text-sm text-gray-600">Pendientes</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600" id="preparingCount">0</div>
                        <div class="text-sm text-gray-600">En Preparación</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600" id="readyCount">0</div>
                        <div class="text-sm text-gray-600">Listos</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600" id="avgTime">0 min</div>
                        <div class="text-sm text-gray-600">Tiempo Promedio</div>
                    </div>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="bg-white border-b px-6 py-3">
                <div class="flex space-x-1">
                    <button onclick="filterKitchenOrders('all')" 
                            class="kitchen-filter-btn active px-4 py-2 rounded-lg text-sm font-medium transition-all" 
                            data-filter="all">
                        <i class="fas fa-list mr-2"></i>Todos
                    </button>
                    <button onclick="filterKitchenOrders('pendiente')" 
                            class="kitchen-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all" 
                            data-filter="pendiente">
                        <i class="fas fa-clock mr-2"></i>Pendientes
                    </button>
                    <button onclick="filterKitchenOrders('en_preparacion')" 
                            class="kitchen-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all" 
                            data-filter="en_preparacion">
                        <i class="fas fa-fire mr-2"></i>En Preparación
                    </button>
                    <button onclick="filterKitchenOrders('listo')" 
                            class="kitchen-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all" 
                            data-filter="listo">
                        <i class="fas fa-check-circle mr-2"></i>Listos
                    </button>
                </div>
            </div>

            <!-- Orders Grid -->
            <div class="p-6">
                <!-- Loading State -->
                <div id="kitchenLoading" class="flex justify-center items-center py-16">
                    <div class="loading-spinner mr-3"></div>
                    <span class="text-gray-600">Cargando pedidos...</span>
                </div>

                <!-- Orders Container -->
                <div id="kitchenOrdersContainer" class="hidden">
                    <div id="kitchenOrdersGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <!-- Order cards will be loaded here -->
                    </div>
                </div>

                <!-- Empty State -->
                <div id="kitchenEmptyState" class="text-center py-16 hidden">
                    <i class="fas fa-clipboard-list text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No hay pedidos</h3>
                    <p class="text-gray-500">Los nuevos pedidos aparecerán aquí en tiempo real</p>
                </div>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div id="orderDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div id="orderDetailsContent">
                    <!-- Order details will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Initialize Kitchen
async function initializeKitchen() {
    try {
        await loadKitchenOrders();
        startKitchenRefresh();
        setupKitchenSounds();
    } catch (error) {
        console.error('Error initializing kitchen:', error);
        Utils.showToast('Error al cargar la cocina', 'error');
    }
}

// Load Kitchen Orders
async function loadKitchenOrders() {
    try {
        document.getElementById('kitchenLoading').classList.remove('hidden');
        document.getElementById('kitchenOrdersContainer').classList.add('hidden');
        document.getElementById('kitchenEmptyState').classList.add('hidden');
        
        const response = await api.getOrders({ 
            limit: 100,
            sort: 'fecha_pedido'
        });
        
        // Filter to active orders (not delivered or cancelled)
        KitchenState.orders = (response.data || []).filter(order => 
            order.estado !== 'entregado' && order.estado !== 'cancelado'
        );
        
        updateKitchenStats();
        renderKitchenOrders();
        
    } catch (error) {
        console.error('Error loading kitchen orders:', error);
        Utils.showToast('Error al cargar pedidos', 'error');
    } finally {
        document.getElementById('kitchenLoading').classList.add('hidden');
    }
}

// Update Kitchen Stats
function updateKitchenStats() {
    const pending = KitchenState.orders.filter(o => o.estado === 'pendiente').length;
    const preparing = KitchenState.orders.filter(o => o.estado === 'en_preparacion').length;
    const ready = KitchenState.orders.filter(o => o.estado === 'listo').length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('preparingCount').textContent = preparing;
    document.getElementById('readyCount').textContent = ready;
    
    // Calculate average preparation time
    const completedOrders = KitchenState.orders.filter(o => o.estado === 'listo');
    const avgTime = completedOrders.length > 0 ? 18 : 0; // Placeholder calculation
    document.getElementById('avgTime').textContent = avgTime + ' min';
}

// Render Kitchen Orders
function renderKitchenOrders() {
    const container = document.getElementById('kitchenOrdersGrid');
    const emptyState = document.getElementById('kitchenEmptyState');
    const ordersContainer = document.getElementById('kitchenOrdersContainer');
    
    let filteredOrders = KitchenState.orders;
    
    // Apply filter
    if (KitchenState.filter !== 'all') {
        filteredOrders = KitchenState.orders.filter(order => order.estado === KitchenState.filter);
    }
    
    if (filteredOrders.length === 0) {
        ordersContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    ordersContainer.classList.remove('hidden');
    
    // Sort by priority and time
    filteredOrders.sort((a, b) => {
        const priorityOrder = { 'pendiente': 1, 'en_preparacion': 2, 'listo': 3 };
        if (priorityOrder[a.estado] !== priorityOrder[b.estado]) {
            return priorityOrder[a.estado] - priorityOrder[b.estado];
        }
        return a.fecha_pedido - b.fecha_pedido;
    });
    
    container.innerHTML = filteredOrders.map(order => createKitchenOrderCard(order)).join('');
}

// Create Kitchen Order Card
function createKitchenOrderCard(order) {
    const timeElapsed = Math.floor((Date.now() - order.fecha_pedido) / (1000 * 60));
    const isUrgent = timeElapsed > 20;
    const productos = JSON.parse(order.productos || '[]');
    
    return `
        <div class="order-card ${isUrgent ? 'priority-high' : ''} p-6 animate-fadeIn">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-800">
                        #${order.id.slice(-6).toUpperCase()}
                    </h3>
                    <p class="text-sm text-gray-600">${order.cliente_nombre}</p>
                    <p class="text-xs text-gray-500">${order.tipo_pedido === 'online' ? 'Online' : 'En tienda'}</p>
                </div>
                
                <div class="text-right">
                    <span class="px-3 py-1 rounded-full text-sm font-medium status-${order.estado}">
                        ${order.estado.replace('_', ' ').toUpperCase()}
                    </span>
                    <p class="text-xs text-gray-500 mt-1">
                        ${timeElapsed} min
                        ${isUrgent ? '<i class="fas fa-exclamation-triangle text-red-500 ml-1"></i>' : ''}
                    </p>
                </div>
            </div>
            
            <!-- Products List -->
            <div class="space-y-2 mb-6">
                ${productos.map(producto => `
                    <div class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <div class="flex-1">
                            <span class="font-medium text-gray-800">${producto.nombre}</span>
                            <div class="flex items-center mt-1">
                                <span class="text-sm text-gray-600">${producto.categoria}</span>
                                <span class="mx-2 text-gray-400">•</span>
                                <span class="text-sm font-medium text-orange-600">x${producto.quantity}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Order Info -->
            <div class="space-y-2 mb-6 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-semibold text-gray-800">${Utils.formatCurrency(order.total)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Método de pago:</span>
                    <span class="capitalize">${order.metodo_pago}</span>
                </div>
                ${order.observaciones ? `
                    <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-sm text-yellow-800">
                            <i class="fas fa-sticky-note mr-2"></i>
                            ${order.observaciones}
                        </p>
                    </div>
                ` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div class="space-y-2">
                ${order.estado === 'pendiente' ? `
                    <button onclick="updateOrderStatus('${order.id}', 'en_preparacion')" 
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                        <i class="fas fa-fire mr-2"></i>
                        Iniciar Preparación
                    </button>
                ` : order.estado === 'en_preparacion' ? `
                    <button onclick="updateOrderStatus('${order.id}', 'listo')" 
                            class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                        <i class="fas fa-check-circle mr-2"></i>
                        Marcar como Listo
                    </button>
                ` : `
                    <button onclick="updateOrderStatus('${order.id}', 'entregado')" 
                            class="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                        <i class="fas fa-hand-holding mr-2"></i>
                        Entregar Pedido
                    </button>
                `}
                
                <div class="flex gap-2">
                    <button onclick="showOrderDetails('${order.id}')" 
                            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all">
                        <i class="fas fa-eye mr-2"></i>
                        Detalles
                    </button>
                    
                    ${order.estado !== 'listo' ? `
                        <button onclick="prioritizeOrder('${order.id}')" 
                                class="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-4 rounded-lg transition-all">
                            <i class="fas fa-arrow-up mr-2"></i>
                            Priorizar
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Filter Kitchen Orders
function filterKitchenOrders(filter) {
    KitchenState.filter = filter;
    
    // Update active filter button
    document.querySelectorAll('.kitchen-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderKitchenOrders();
}

// Update Order Status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const order = KitchenState.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Update order status
        await api.updateOrder(orderId, { estado: newStatus });
        
        // Update local state
        order.estado = newStatus;
        
        // Play sound notification
        if (newStatus === 'listo') {
            playKitchenSound('orderReady');
        }
        
        // Show notification
        const statusMessages = {
            'en_preparacion': 'Pedido en preparación',
            'listo': 'Pedido listo para entrega',
            'entregado': 'Pedido entregado'
        };
        
        Utils.showToast(statusMessages[newStatus], 'success');
        
        // Refresh display
        updateKitchenStats();
        renderKitchenOrders();
        
        // If order is delivered, remove from kitchen view after delay
        if (newStatus === 'entregado') {
            setTimeout(() => {
                KitchenState.orders = KitchenState.orders.filter(o => o.id !== orderId);
                updateKitchenStats();
                renderKitchenOrders();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error updating order status:', error);
        Utils.showToast('Error al actualizar el pedido', 'error');
    }
}

// Show Order Details
function showOrderDetails(orderId) {
    const order = KitchenState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    
    const productos = JSON.parse(order.productos || '[]');
    const timeElapsed = Math.floor((Date.now() - order.fecha_pedido) / (1000 * 60));
    
    content.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-800">
                    Pedido #${order.id.slice(-6).toUpperCase()}
                </h2>
                <button onclick="closeOrderDetails()" 
                        class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <!-- Order Info -->
            <div class="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Información del Cliente</h3>
                    <div class="space-y-3">
                        <div>
                            <span class="text-sm text-gray-600">Nombre:</span>
                            <p class="font-medium">${order.cliente_nombre}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Tipo de pedido:</span>
                            <p class="font-medium capitalize">${order.tipo_pedido === 'online' ? 'Pedido Online' : 'En tienda'}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Método de pago:</span>
                            <p class="font-medium capitalize">${order.metodo_pago}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Estado de pago:</span>
                            <p class="font-medium ${order.pagado ? 'text-green-600' : 'text-red-600'}">
                                ${order.pagado ? 'Pagado' : 'Pendiente'}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Detalles del Pedido</h3>
                    <div class="space-y-3">
                        <div>
                            <span class="text-sm text-gray-600">Fecha y hora:</span>
                            <p class="font-medium">${Utils.formatDate(order.fecha_pedido)}</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Tiempo transcurrido:</span>
                            <p class="font-medium ${timeElapsed > 20 ? 'text-red-600' : 'text-gray-800'}">${timeElapsed} minutos</p>
                        </div>
                        <div>
                            <span class="text-sm text-gray-600">Estado actual:</span>
                            <span class="px-3 py-1 rounded-full text-sm font-medium status-${order.estado}">
                                ${order.estado.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Products List -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Productos del Pedido</h3>
                <div class="space-y-3">
                    ${productos.map(producto => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800">${producto.nombre}</h4>
                                <div class="flex items-center mt-1 text-sm text-gray-600">
                                    <span class="capitalize">${producto.categoria}</span>
                                    <span class="mx-2">•</span>
                                    <span class="font-medium">${Utils.formatCurrency(producto.precio)}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-semibold text-orange-600">x${producto.quantity}</div>
                                <div class="text-sm text-gray-600">${Utils.formatCurrency(producto.precio * producto.quantity)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Order Total -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Subtotal:</span>
                        <span class="font-medium">${Utils.formatCurrency(order.subtotal)}</span>
                    </div>
                    ${order.descuento > 0 ? `
                        <div class="flex justify-between text-green-600">
                            <span>Descuento:</span>
                            <span>-${Utils.formatCurrency(order.descuento)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span class="text-orange-600">${Utils.formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Observaciones -->
            ${order.observaciones ? `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">Observaciones Especiales</h3>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p class="text-yellow-800">${order.observaciones}</p>
                    </div>
                </div>
            ` : ''}
            
            <!-- Actions -->
            <div class="flex gap-3">
                <button onclick="closeOrderDetails()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium">
                    Cerrar
                </button>
                
                ${order.estado === 'pendiente' ? `
                    <button onclick="updateOrderStatus('${order.id}', 'en_preparacion'); closeOrderDetails();" 
                            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold">
                        <i class="fas fa-fire mr-2"></i>
                        Iniciar Preparación
                    </button>
                ` : order.estado === 'en_preparacion' ? `
                    <button onclick="updateOrderStatus('${order.id}', 'listo'); closeOrderDetails();" 
                            class="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold">
                        <i class="fas fa-check-circle mr-2"></i>
                        Marcar como Listo
                    </button>
                ` : `
                    <button onclick="updateOrderStatus('${order.id}', 'entregado'); closeOrderDetails();" 
                            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold">
                        <i class="fas fa-hand-holding mr-2"></i>
                        Entregar Pedido
                    </button>
                `}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close Order Details
function closeOrderDetails() {
    const modal = document.getElementById('orderDetailsModal');
    modal.classList.add('hidden');
}

// Prioritize Order
function prioritizeOrder(orderId) {
    // Move order to the top of the list
    const orderIndex = KitchenState.orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        const order = KitchenState.orders.splice(orderIndex, 1)[0];
        KitchenState.orders.unshift(order);
        renderKitchenOrders();
        Utils.showToast('Pedido priorizado', 'success');
    }
}

// Refresh Kitchen Orders
async function refreshKitchenOrders() {
    await loadKitchenOrders();
    Utils.showToast('Pedidos actualizados', 'info');
}

// Start Kitchen Refresh
function startKitchenRefresh() {
    // Refresh every 30 seconds
    KitchenState.refreshInterval = setInterval(() => {
        loadKitchenOrders();
    }, 30000);
}

// Stop Kitchen Refresh
function stopKitchenRefresh() {
    if (KitchenState.refreshInterval) {
        clearInterval(KitchenState.refreshInterval);
        KitchenState.refreshInterval = null;
    }
}

// Setup Kitchen Sounds
function setupKitchenSounds() {
    // Setup audio for notifications
    KitchenState.sounds.newOrder.volume = 0.3;
    KitchenState.sounds.orderReady.volume = 0.3;
}

// Play Kitchen Sound
function playKitchenSound(soundType) {
    try {
        if (KitchenState.sounds[soundType]) {
            KitchenState.sounds[soundType].play().catch(err => {
                console.log('Could not play sound:', err);
            });
        }
    } catch (error) {
        console.log('Sound playback error:', error);
    }
}

// Cleanup when leaving kitchen view
function cleanupKitchen() {
    stopKitchenRefresh();
}

// Add custom styles for kitchen
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .kitchen-filter-btn {
            background-color: #f3f4f6;
            color: #6b7280;
            border: 2px solid transparent;
        }
        
        .kitchen-filter-btn:hover {
            background-color: #e5e7eb;
            color: #4b5563;
        }
        
        .kitchen-filter-btn.active {
            background-color: #f97316;
            color: white;
            border-color: #ea580c;
        }
        
        .order-card {
            transition: all 0.3s ease;
        }
        
        .order-card:hover {
            transform: translateY(-2px);
        }
        
        .priority-high {
            border-left-width: 6px;
            border-left-color: #ef4444;
            background: #fef2f2;
            animation: pulse-border 2s infinite;
        }
        
        @keyframes pulse-border {
            0%, 100% {
                border-left-color: #ef4444;
            }
            50% {
                border-left-color: #dc2626;
            }
        }
        
        .max-h-90vh {
            max-height: 90vh;
        }
    `;
    document.head.appendChild(style);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanupKitchen);
});