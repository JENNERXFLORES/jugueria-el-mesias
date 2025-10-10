// POS (Point of Sale) System for Juguería El Mesías

// POS State
const POSState = {
    currentOrder: {
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        customer: '',
        paymentMethod: 'efectivo'
    },
    products: [],
    categories: ['todos', 'jugos', 'desayunos', 'bebidas'],
    selectedCategory: 'todos'
};

// Load POS View
function loadPOSView() {
    if (!AppState.isLoggedIn || (AppState.userType !== 'trabajador' && AppState.userType !== 'admin')) {
        Utils.showToast('Acceso no autorizado', 'error');
        return;
    }
    
    AppState.currentView = 'pos';
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = createPOSView();
    initializePOS();
}

// Create POS View
function createPOSView() {
    return `
        <div class="h-screen bg-gray-100 flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b">
                <div class="flex items-center">
                    <button onclick="showDashboard()" class="text-gray-600 hover:text-gray-800 mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-cash-register text-orange-500 mr-2"></i>
                        Punto de Venta
                    </h1>
                </div>
                
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600">Vendedor: ${AppState.currentUser.nombre}</span>
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Sistema activo"></div>
                </div>
            </div>

            <!-- Main POS Interface -->
            <div class="flex-1 flex overflow-hidden">
                <!-- Products Panel -->
                <div class="flex-1 flex flex-col bg-white">
                    <!-- Category Filters -->
                    <div class="p-4 border-b bg-gray-50">
                        <div class="flex space-x-2 overflow-x-auto">
                            <button onclick="filterPOSProducts('todos')" 
                                    class="pos-category-btn active whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all" 
                                    data-category="todos">
                                <i class="fas fa-th-large mr-2"></i>Todos
                            </button>
                            <button onclick="filterPOSProducts('jugos')" 
                                    class="pos-category-btn whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all" 
                                    data-category="jugos">
                                <i class="fas fa-glass-whiskey mr-2"></i>Jugos
                            </button>
                            <button onclick="filterPOSProducts('desayunos')" 
                                    class="pos-category-btn whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all" 
                                    data-category="desayunos">
                                <i class="fas fa-utensils mr-2"></i>Desayunos
                            </button>
                            <button onclick="filterPOSProducts('bebidas')" 
                                    class="pos-category-btn whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all" 
                                    data-category="bebidas">
                                <i class="fas fa-coffee mr-2"></i>Bebidas
                            </button>
                        </div>
                        
                        <!-- Search -->
                        <div class="mt-3">
                            <div class="relative">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input type="text" 
                                       id="posProductSearch" 
                                       placeholder="Buscar productos..." 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                       oninput="searchPOSProducts()">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Products Grid -->
                    <div class="flex-1 p-4 overflow-y-auto">
                        <div id="posProductsGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <div class="flex justify-center items-center col-span-full py-16">
                                <div class="loading-spinner mr-3"></div>
                                <span class="text-gray-600">Cargando productos...</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Panel -->
                <div class="w-96 bg-white border-l border-gray-200 flex flex-col">
                    <!-- Order Header -->
                    <div class="p-4 border-b bg-gray-50">
                        <div class="flex items-center justify-between">
                            <h2 class="text-lg font-semibold text-gray-800">
                                <i class="fas fa-shopping-cart text-orange-500 mr-2"></i>
                                Orden Actual
                            </h2>
                            <button onclick="clearPOSOrder()" 
                                    class="text-red-500 hover:text-red-700 text-sm">
                                <i class="fas fa-trash mr-1"></i>Limpiar
                            </button>
                        </div>
                        
                        <!-- Customer Info -->
                        <div class="mt-3">
                            <input type="text" 
                                   id="posCustomerName" 
                                   placeholder="Nombre del cliente (opcional)" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                   onchange="updatePOSCustomer()">
                        </div>
                    </div>
                    
                    <!-- Order Items -->
                    <div class="flex-1 overflow-y-auto">
                        <div id="posOrderItems" class="p-4">
                            <div class="text-center py-16 text-gray-500">
                                <i class="fas fa-shopping-cart text-4xl mb-2 opacity-50"></i>
                                <p>No hay productos en la orden</p>
                                <p class="text-sm">Selecciona productos para agregar</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Order Summary -->
                    <div class="border-t p-4 bg-gray-50">
                        <div class="space-y-2 mb-4">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Subtotal:</span>
                                <span class="font-medium" id="posSubtotal">S/ 0.00</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">Descuento:</span>
                                <span class="font-medium text-green-600" id="posDiscount">S/ 0.00</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span class="text-orange-600" id="posTotal">S/ 0.00</span>
                            </div>
                        </div>
                        
                        <!-- Payment Method -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                            <div class="grid grid-cols-2 gap-2">
                                <label class="flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                                    <input type="radio" name="posPaymentMethod" value="efectivo" class="sr-only" checked onchange="updatePOSPaymentMethod()">
                                    <div class="text-center">
                                        <i class="fas fa-money-bill-wave text-green-500 text-xl mb-1"></i>
                                        <div class="text-xs font-medium">Efectivo</div>
                                    </div>
                                </label>
                                
                                <label class="flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                                    <input type="radio" name="posPaymentMethod" value="tarjeta" class="sr-only" onchange="updatePOSPaymentMethod()">
                                    <div class="text-center">
                                        <i class="fas fa-credit-card text-blue-500 text-xl mb-1"></i>
                                        <div class="text-xs font-medium">Tarjeta</div>
                                    </div>
                                </label>
                                
                                <label class="flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                                    <input type="radio" name="posPaymentMethod" value="yape" class="sr-only" onchange="updatePOSPaymentMethod()">
                                    <div class="text-center">
                                        <i class="fas fa-mobile-alt text-purple-500 text-xl mb-1"></i>
                                        <div class="text-xs font-medium">Yape</div>
                                    </div>
                                </label>
                                
                                <label class="flex items-center justify-center p-2 border rounded-lg cursor-pointer hover:bg-orange-50">
                                    <input type="radio" name="posPaymentMethod" value="plin" class="sr-only" onchange="updatePOSPaymentMethod()">
                                    <div class="text-center">
                                        <i class="fas fa-mobile-alt text-orange-500 text-xl mb-1"></i>
                                        <div class="text-xs font-medium">Plin</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="space-y-2">
                            <button onclick="processPOSPayment()" 
                                    id="posPaymentBtn"
                                    class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fas fa-credit-card mr-2"></i>
                                Procesar Pago
                            </button>
                            
                            <button onclick="savePOSOrder()" 
                                    class="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all">
                                <i class="fas fa-save mr-2"></i>
                                Guardar Orden
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Receipt Modal -->
        <div id="posReceiptModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-lg shadow-2xl max-w-md w-full">
                <div id="posReceiptContent">
                    <!-- Receipt content will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Initialize POS
async function initializePOS() {
    try {
        await loadPOSProducts();
        updatePOSOrderDisplay();
        setupPOSEventListeners();
    } catch (error) {
        console.error('Error initializing POS:', error);
        Utils.showToast('Error al cargar el POS', 'error');
    }
}

// Load POS Products
async function loadPOSProducts() {
    try {
        const response = await api.getProducts({ limit: 100 });
        POSState.products = response.data?.filter(product => product.disponible) || [];
        renderPOSProducts(POSState.products);
    } catch (error) {
        console.error('Error loading POS products:', error);
        Utils.showToast('Error al cargar productos', 'error');
    }
}

// Render POS Products
function renderPOSProducts(products) {
    const grid = document.getElementById('posProductsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16 text-gray-500">
                <i class="fas fa-box-open text-6xl mb-4 opacity-50"></i>
                <h3 class="text-lg font-semibold mb-2">No hay productos disponibles</h3>
                <p>Agrega productos desde el módulo de gestión</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => createPOSProductCard(product)).join('');
}

// Create POS Product Card
function createPOSProductCard(product) {
    const price = product.promocion && product.precio_promocion ? product.precio_promocion : product.precio;
    
    return `
        <div class="pos-product-card bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer" 
             onclick="addToPOSOrder('${product.id}')">
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                    <i class="fas ${getCategoryIcon(product.categoria)} text-2xl text-orange-600"></i>
                </div>
                
                <h3 class="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">${product.nombre}</h3>
                
                <div class="flex flex-col items-center">
                    <span class="text-lg font-bold text-orange-600">${Utils.formatCurrency(price)}</span>
                    ${product.promocion && product.precio_promocion ? `
                        <span class="text-xs text-gray-500 line-through">${Utils.formatCurrency(product.precio)}</span>
                    ` : ''}
                </div>
                
                ${product.promocion ? `
                    <div class="mt-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                        OFERTA
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Get Category Icon
function getCategoryIcon(category) {
    const icons = {
        jugos: 'fa-glass-whiskey',
        desayunos: 'fa-utensils',
        bebidas: 'fa-coffee'
    };
    return icons[category] || 'fa-box';
}

// Filter POS Products
function filterPOSProducts(category) {
    POSState.selectedCategory = category;
    
    // Update active button
    document.querySelectorAll('.pos-category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Filter products
    let filteredProducts = POSState.products;
    if (category !== 'todos') {
        filteredProducts = POSState.products.filter(product => product.categoria === category);
    }
    
    // Apply search if any
    const searchTerm = document.getElementById('posProductSearch').value.toLowerCase().trim();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.nombre.toLowerCase().includes(searchTerm) ||
            product.descripcion?.toLowerCase().includes(searchTerm)
        );
    }
    
    renderPOSProducts(filteredProducts);
}

// Search POS Products
function searchPOSProducts() {
    const searchTerm = document.getElementById('posProductSearch').value.toLowerCase().trim();
    
    let filteredProducts = POSState.products;
    
    // Apply category filter
    if (POSState.selectedCategory !== 'todos') {
        filteredProducts = filteredProducts.filter(product => product.categoria === POSState.selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.nombre.toLowerCase().includes(searchTerm) ||
            product.descripcion?.toLowerCase().includes(searchTerm)
        );
    }
    
    renderPOSProducts(filteredProducts);
}

// Add to POS Order
function addToPOSOrder(productId) {
    const product = POSState.products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = POSState.currentOrder.items.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const price = product.promocion && product.precio_promocion ? product.precio_promocion : product.precio;
        POSState.currentOrder.items.push({
            id: product.id,
            nombre: product.nombre,
            categoria: product.categoria,
            precio: price,
            quantity: 1,
            subtotal: price
        });
    }
    
    updatePOSOrderTotals();
    updatePOSOrderDisplay();
    
    // Visual feedback
    Utils.showToast(`${product.nombre} agregado`, 'success');
}

// Remove from POS Order
function removeFromPOSOrder(productId) {
    POSState.currentOrder.items = POSState.currentOrder.items.filter(item => item.id !== productId);
    updatePOSOrderTotals();
    updatePOSOrderDisplay();
}

// Update POS Order Quantity
function updatePOSOrderQuantity(productId, quantity) {
    const item = POSState.currentOrder.items.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromPOSOrder(productId);
        } else {
            item.quantity = quantity;
            item.subtotal = item.precio * quantity;
            updatePOSOrderTotals();
            updatePOSOrderDisplay();
        }
    }
}

// Update POS Order Totals
function updatePOSOrderTotals() {
    POSState.currentOrder.subtotal = POSState.currentOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
    POSState.currentOrder.total = POSState.currentOrder.subtotal - POSState.currentOrder.discount;
    
    // Update UI
    document.getElementById('posSubtotal').textContent = Utils.formatCurrency(POSState.currentOrder.subtotal);
    document.getElementById('posDiscount').textContent = Utils.formatCurrency(POSState.currentOrder.discount);
    document.getElementById('posTotal').textContent = Utils.formatCurrency(POSState.currentOrder.total);
    
    // Update button state
    const paymentBtn = document.getElementById('posPaymentBtn');
    paymentBtn.disabled = POSState.currentOrder.items.length === 0;
}

// Update POS Order Display
function updatePOSOrderDisplay() {
    const container = document.getElementById('posOrderItems');
    
    if (POSState.currentOrder.items.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-gray-500">
                <i class="fas fa-shopping-cart text-4xl mb-2 opacity-50"></i>
                <p>No hay productos en la orden</p>
                <p class="text-sm">Selecciona productos para agregar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = POSState.currentOrder.items.map(item => `
        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-3 last:mb-0">
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-800 text-sm truncate">${item.nombre}</h4>
                <p class="text-xs text-gray-600">${item.categoria}</p>
                <p class="text-sm font-medium text-orange-600">${Utils.formatCurrency(item.precio)}</p>
            </div>
            
            <div class="flex items-center space-x-2">
                <button onclick="updatePOSOrderQuantity('${item.id}', ${item.quantity - 1})" 
                        class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">
                    <i class="fas fa-minus text-xs"></i>
                </button>
                
                <span class="w-8 text-center font-semibold">${item.quantity}</span>
                
                <button onclick="updatePOSOrderQuantity('${item.id}', ${item.quantity + 1})" 
                        class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600">
                    <i class="fas fa-plus text-xs"></i>
                </button>
                
                <button onclick="removeFromPOSOrder('${item.id})" 
                        class="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-full text-red-600 ml-2">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update POS Customer
function updatePOSCustomer() {
    const customerName = document.getElementById('posCustomerName').value.trim();
    POSState.currentOrder.customer = customerName;
}

// Update POS Payment Method
function updatePOSPaymentMethod() {
    const selectedMethod = document.querySelector('input[name="posPaymentMethod"]:checked');
    if (selectedMethod) {
        POSState.currentOrder.paymentMethod = selectedMethod.value;
        
        // Update radio button appearance
        document.querySelectorAll('input[name="posPaymentMethod"]').forEach(radio => {
            const label = radio.closest('label');
            if (radio.checked) {
                label.classList.add('ring-2', 'ring-orange-500', 'border-orange-500');
            } else {
                label.classList.remove('ring-2', 'ring-orange-500', 'border-orange-500');
            }
        });
    }
}

// Clear POS Order
function clearPOSOrder() {
    if (POSState.currentOrder.items.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres limpiar la orden actual?')) {
        POSState.currentOrder = {
            items: [],
            subtotal: 0,
            discount: 0,
            total: 0,
            customer: '',
            paymentMethod: 'efectivo'
        };
        
        document.getElementById('posCustomerName').value = '';
        updatePOSOrderTotals();
        updatePOSOrderDisplay();
        
        Utils.showToast('Orden limpiada', 'info');
    }
}

// Process POS Payment
async function processPOSPayment() {
    if (POSState.currentOrder.items.length === 0) {
        Utils.showToast('No hay productos en la orden', 'error');
        return;
    }
    
    try {
        const paymentBtn = document.getElementById('posPaymentBtn');
        const originalText = paymentBtn.innerHTML;
        paymentBtn.disabled = true;
        paymentBtn.innerHTML = '<div class="loading-spinner mr-2"></div>Procesando...';
        
        // Create order
        const orderData = {
            cliente_id: null,
            cliente_nombre: POSState.currentOrder.customer || 'Cliente en tienda',
            tipo_pedido: 'local',
            estado: 'entregado', // POS orders are immediately delivered
            productos: JSON.stringify(POSState.currentOrder.items),
            subtotal: POSState.currentOrder.subtotal,
            descuento: POSState.currentOrder.discount,
            total: POSState.currentOrder.total,
            metodo_pago: POSState.currentOrder.paymentMethod,
            pagado: true,
            fecha_pedido: Date.now(),
            observaciones: 'Venta directa en POS'
        };
        
        const order = await api.createOrder(orderData);
        
        // Create sale record
        const saleData = {
            pedido_id: order.id,
            vendedor_id: AppState.currentUser.id,
            vendedor_nombre: AppState.currentUser.nombre,
            cliente_nombre: POSState.currentOrder.customer || 'Cliente en tienda',
            productos: JSON.stringify(POSState.currentOrder.items),
            subtotal: POSState.currentOrder.subtotal,
            descuento: POSState.currentOrder.discount,
            total: POSState.currentOrder.total,
            metodo_pago: POSState.currentOrder.paymentMethod,
            fecha_venta: Date.now(),
            turno: getTurno()
        };
        
        const sale = await api.createSale(saleData);
        
        // Show receipt
        showPOSReceipt(order, sale);
        
        // Clear order
        clearPOSOrder();
        
        Utils.showToast('Venta procesada exitosamente', 'success');
        
    } catch (error) {
        console.error('Error processing payment:', error);
        Utils.showToast('Error al procesar el pago', 'error');
        
        // Restore button
        const paymentBtn = document.getElementById('posPaymentBtn');
        paymentBtn.disabled = false;
        paymentBtn.innerHTML = originalText;
    }
}

// Get Current Shift
function getTurno() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'mañana';
    if (hour >= 14 && hour < 22) return 'tarde';
    return 'noche';
}

// Show POS Receipt
function showPOSReceipt(order, sale) {
    const modal = document.getElementById('posReceiptModal');
    const content = document.getElementById('posReceiptContent');
    
    content.innerHTML = `
        <div class="p-6">
            <div class="text-center border-b pb-4 mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Juguería El Mesías</h2>
                <p class="text-sm text-gray-600">Nueva Cajamarca, Perú</p>
                <p class="text-sm text-gray-600">RUC: 12345678901</p>
            </div>
            
            <div class="text-center mb-4">
                <h3 class="text-lg font-semibold">BOLETA DE VENTA</h3>
                <p class="text-sm text-gray-600">N° ${sale.id.slice(-8).toUpperCase()}</p>
            </div>
            
            <div class="space-y-2 mb-4 text-sm">
                <div class="flex justify-between">
                    <span>Fecha:</span>
                    <span>${Utils.formatDate(sale.fecha_venta)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Cliente:</span>
                    <span>${sale.cliente_nombre}</span>
                </div>
                <div class="flex justify-between">
                    <span>Vendedor:</span>
                    <span>${sale.vendedor_nombre}</span>
                </div>
                <div class="flex justify-between">
                    <span>Método de Pago:</span>
                    <span class="capitalize">${sale.metodo_pago}</span>
                </div>
            </div>
            
            <div class="border-t border-b py-4 mb-4">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b">
                            <th class="text-left">Producto</th>
                            <th class="text-center">Cant.</th>
                            <th class="text-right">Precio</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${JSON.parse(sale.productos).map(item => `
                            <tr class="border-b">
                                <td class="py-1">${item.nombre}</td>
                                <td class="text-center py-1">${item.quantity}</td>
                                <td class="text-right py-1">${Utils.formatCurrency(item.precio)}</td>
                                <td class="text-right py-1">${Utils.formatCurrency(item.precio * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="space-y-2 text-sm mb-6">
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${Utils.formatCurrency(sale.subtotal)}</span>
                </div>
                ${sale.descuento > 0 ? `
                    <div class="flex justify-between text-green-600">
                        <span>Descuento:</span>
                        <span>-${Utils.formatCurrency(sale.descuento)}</span>
                    </div>
                ` : ''}
                <div class="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${Utils.formatCurrency(sale.total)}</span>
                </div>
            </div>
            
            <div class="text-center text-sm text-gray-600 mb-6">
                <p>¡Gracias por tu preferencia!</p>
                <p>Vuelve pronto</p>
            </div>
            
            <div class="flex gap-3">
                <button onclick="printReceipt()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                    <i class="fas fa-print mr-2"></i>Imprimir
                </button>
                <button onclick="closePOSReceipt()" 
                        class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg">
                    <i class="fas fa-check mr-2"></i>Cerrar
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close POS Receipt
function closePOSReceipt() {
    const modal = document.getElementById('posReceiptModal');
    modal.classList.add('hidden');
}

// Print Receipt
function printReceipt() {
    window.print();
}

// Save POS Order (for later processing)
function savePOSOrder() {
    Utils.showToast('Funcionalidad próximamente disponible', 'info');
}

// Setup POS Event Listeners
function setupPOSEventListeners() {
    // Search debounce
    const searchInput = document.getElementById('posProductSearch');
    if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(searchPOSProducts, 300));
    }
    
    // Payment method change
    updatePOSPaymentMethod();
}

// Add custom styles for POS
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .pos-category-btn {
            background-color: #f3f4f6;
            color: #6b7280;
            border: 2px solid transparent;
        }
        
        .pos-category-btn:hover {
            background-color: #e5e7eb;
            color: #4b5563;
        }
        
        .pos-category-btn.active {
            background-color: #f97316;
            color: white;
            border-color: #ea580c;
        }
        
        .pos-product-card:hover {
            transform: translateY(-2px);
        }
        
        .pos-product-card:active {
            transform: translateY(0);
        }
        
        @media print {
            body * {
                visibility: hidden;
            }
            
            #posReceiptContent, #posReceiptContent * {
                visibility: visible;
            }
            
            #posReceiptContent {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
});