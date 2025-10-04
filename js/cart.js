// Shopping Cart System for Juguería El Mesías

// Create Cart View
function createCartView() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
            <div class="max-w-6xl mx-auto px-4">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center">
                        <button onclick="goHome()" class="text-gray-500 hover:text-gray-600 mr-4">
                            <i class="fas fa-home text-xl"></i>
                        </button>
                        <button onclick="showPublicCatalog()" class="text-orange-500 hover:text-orange-600 mr-4">
                            <i class="fas fa-arrow-left text-2xl"></i>
                        </button>
                        <div>
                            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 font-poppins">
                                Mi Carrito
                            </h1>
                            <p class="text-gray-600 mt-1">Revisa y confirma tu pedido</p>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Total de artículos</p>
                        <p class="text-2xl font-bold text-orange-600" id="totalItems">0</p>
                    </div>
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <!-- Cart Items -->
                    <div class="lg:col-span-2">
                        <div class="bg-white rounded-2xl shadow-lg p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-xl font-semibold text-gray-800">
                                    <i class="fas fa-shopping-cart mr-2 text-orange-500"></i>
                                    Productos en tu carrito
                                </h2>
                                <button onclick="clearCart()" 
                                        id="clearCartBtn"
                                        class="text-red-500 hover:text-red-600 text-sm font-medium">
                                    <i class="fas fa-trash mr-1"></i>Vaciar carrito
                                </button>
                            </div>
                            
                            <!-- Cart Items Container -->
                            <div id="cartItemsContainer">
                                <!-- Cart items will be loaded here -->
                            </div>
                        </div>
                        
                        <!-- Continue Shopping -->
                        <div class="mt-6">
                            <button onclick="showPublicCatalog()" 
                                    class="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Continuar comprando
                            </button>
                        </div>
                    </div>

                    <!-- Order Summary -->
                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                            <h3 class="text-lg font-semibold text-gray-800 mb-6">
                                <i class="fas fa-receipt mr-2 text-orange-500"></i>
                                Resumen del pedido
                            </h3>
                            
                            <div id="orderSummary" class="space-y-4">
                                <!-- Order summary will be loaded here -->
                            </div>
                            
                            <!-- Delivery Options -->
                            <div class="mt-6 pt-6 border-t">
                                <h4 class="font-medium text-gray-800 mb-4">Tipo de pedido</h4>
                                <div class="space-y-3">
                                    <label class="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                                        <input type="radio" 
                                               name="orderType" 
                                               value="local" 
                                               class="text-orange-500 focus:ring-orange-500" 
                                               checked>
                                        <div class="ml-3">
                                            <div class="font-medium text-gray-800">Recoger en tienda</div>
                                            <div class="text-sm text-gray-600">Listo en 15-20 minutos</div>
                                        </div>
                                    </label>
                                    
                                    <label class="flex items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                                        <input type="radio" 
                                               name="orderType" 
                                               value="delivery" 
                                               class="text-orange-500 focus:ring-orange-500">
                                        <div class="ml-3">
                                            <div class="font-medium text-gray-800">Delivery</div>
                                            <div class="text-sm text-gray-600">Próximamente disponible</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Customer Information -->
                            <div class="mt-6 pt-6 border-t">
                                <h4 class="font-medium text-gray-800 mb-4">Información del cliente</h4>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                                        <input type="text" 
                                               id="customerName" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                               placeholder="Tu nombre completo"
                                               value="${AppState.currentUser ? AppState.currentUser.nombre : ''}">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                                        <input type="tel" 
                                               id="customerPhone" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                               placeholder="999 999 999"
                                               value="${AppState.currentUser ? AppState.currentUser.telefono : ''}">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                        <textarea id="orderNotes" 
                                                  rows="3" 
                                                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                  placeholder="Instrucciones especiales para tu pedido..."></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Payment Method -->
                            <div class="mt-6 pt-6 border-t">
                                <h4 class="font-medium text-gray-800 mb-4">Método de pago</h4>
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="flex flex-col items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                                        <input type="radio" 
                                               name="paymentMethod" 
                                               value="efectivo" 
                                               class="text-orange-500 focus:ring-orange-500 mb-2" 
                                               checked>
                                        <i class="fas fa-money-bill-wave text-2xl text-green-500 mb-1"></i>
                                        <span class="text-sm font-medium">Efectivo</span>
                                    </label>
                                    
                                    <label class="flex flex-col items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                                        <input type="radio" 
                                               name="paymentMethod" 
                                               value="tarjeta" 
                                               class="text-orange-500 focus:ring-orange-500 mb-2">
                                        <i class="fas fa-credit-card text-2xl text-blue-500 mb-1"></i>
                                        <span class="text-sm font-medium">Tarjeta</span>
                                    </label>
                                    
                                    <label class="flex flex-col items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                                        <input type="radio" 
                                               name="paymentMethod" 
                                               value="yape" 
                                               class="text-orange-500 focus:ring-orange-500 mb-2">
                                        <i class="fas fa-mobile-alt text-2xl text-purple-500 mb-1"></i>
                                        <span class="text-sm font-medium">Yape</span>
                                    </label>
                                    
                                    <label class="flex flex-col items-center p-3 border rounded-lg hover:bg-orange-50 cursor-pointer">
                                        <input type="radio" 
                                               name="paymentMethod" 
                                               value="plin" 
                                               class="text-orange-500 focus:ring-orange-500 mb-2">
                                        <i class="fas fa-mobile-alt text-2xl text-orange-500 mb-1"></i>
                                        <span class="text-sm font-medium">Plin</span>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Place Order Button -->
                            <button onclick="placeOrder()" 
                                    id="placeOrderBtn"
                                    class="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none">
                                <i class="fas fa-check-circle mr-2"></i>
                                Confirmar Pedido
                            </button>
                            
                            <p class="text-xs text-gray-500 text-center mt-3">
                                Al confirmar tu pedido aceptas nuestros términos y condiciones
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Order Confirmation Modal -->
        <div id="orderConfirmationModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                <div id="orderConfirmationContent">
                    <!-- Order confirmation content will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Initialize Cart
function initializeCart() {
    renderCartItems();
    renderOrderSummary();
    updateCartState();
}

// Render Cart Items
function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    
    if (AppState.cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16">
                <i class="fas fa-shopping-cart text-6xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
                <p class="text-gray-500 mb-6">¡Agrega algunos productos deliciosos para comenzar!</p>
                <button onclick="showPublicCatalog()" 
                        class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                    <i class="fas fa-store mr-2"></i>Explorar Productos
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = AppState.cart.map(item => createCartItemHTML(item)).join('');
}

// Create Cart Item HTML
function createCartItemHTML(item) {
    const price = item.promocion && item.precio_promocion ? item.precio_promocion : item.precio;
    const originalPrice = item.promocion && item.precio_promocion ? item.precio : null;
    const subtotal = price * item.quantity;
    
    return `
        <div class="flex items-center p-4 border-b border-gray-200 last:border-b-0 animate-fadeIn">
            <div class="flex-shrink-0 w-16 h-16 mr-4">
                <img src="${item.imagen_url || getDefaultImage(item.categoria)}" 
                     alt="${item.nombre}" 
                     class="w-full h-full object-cover rounded-lg">
            </div>
            
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold text-gray-800 truncate">${item.nombre}</h4>
                        <p class="text-sm text-gray-600">${item.categoria}</p>
                        <div class="flex items-center mt-1">
                            <span class="font-medium text-orange-600">
                                ${Utils.formatCurrency(price)}
                            </span>
                            ${originalPrice ? `
                                <span class="text-sm text-gray-500 line-through ml-2">
                                    ${Utils.formatCurrency(originalPrice)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    
                    <button onclick="removeFromCart('${item.id}')" 
                            class="text-red-500 hover:text-red-700 ml-4">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center border border-gray-300 rounded-lg">
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" 
                                class="px-3 py-1 text-gray-600 hover:text-gray-800 ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="px-4 py-1 border-x border-gray-300 font-medium">${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" 
                                class="px-3 py-1 text-gray-600 hover:text-gray-800">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div class="font-bold text-gray-800">
                        ${Utils.formatCurrency(subtotal)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render Order Summary
function renderOrderSummary() {
    const container = document.getElementById('orderSummary');
    
    if (AppState.cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-receipt text-4xl mb-2 opacity-50"></i>
                <p>No hay productos en el carrito</p>
            </div>
        `;
        return;
    }
    
    const subtotal = getCartTotal();
    const discount = 0; // TODO: Implement discount logic
    const delivery = 0; // Free for pickup
    const total = subtotal - discount + delivery;
    
    container.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">${Utils.formatCurrency(subtotal)}</span>
            </div>
            
            ${discount > 0 ? `
                <div class="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-${Utils.formatCurrency(discount)}</span>
                </div>
            ` : ''}
            
            <div class="flex justify-between">
                <span class="text-gray-600">Delivery:</span>
                <span class="font-medium ${delivery === 0 ? 'text-green-600' : ''}">${delivery === 0 ? 'Gratis' : Utils.formatCurrency(delivery)}</span>
            </div>
            
            <div class="border-t pt-3">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-800">Total:</span>
                    <span class="text-2xl font-bold text-orange-600">${Utils.formatCurrency(total)}</span>
                </div>
            </div>
        </div>
        
        <div class="mt-6 p-4 bg-orange-50 rounded-lg">
            <div class="flex items-center text-orange-800">
                <i class="fas fa-info-circle mr-2"></i>
                <span class="text-sm font-medium">Tiempo estimado de preparación: 15-20 minutos</span>
            </div>
        </div>
    `;
}

// Update Cart State
function updateCartState() {
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalItemsElement = document.getElementById('totalItems');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (totalItemsElement) {
        totalItemsElement.textContent = totalItems;
    }
    
    if (clearCartBtn) {
        clearCartBtn.style.display = AppState.cart.length > 0 ? 'inline' : 'none';
    }
    
    if (placeOrderBtn) {
        placeOrderBtn.disabled = AppState.cart.length === 0;
    }
}

// Place Order
async function placeOrder() {
    try {
        // Validate form data
        const customerName = document.getElementById('customerName').value.trim();
        const customerPhone = document.getElementById('customerPhone').value.trim();
        const orderType = document.querySelector('input[name="orderType"]:checked').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const orderNotes = document.getElementById('orderNotes').value.trim();
        
        if (!customerName) {
            Utils.showToast('Por favor ingresa tu nombre', 'error');
            document.getElementById('customerName').focus();
            return;
        }
        
        if (!customerPhone) {
            Utils.showToast('Por favor ingresa tu teléfono', 'error');
            document.getElementById('customerPhone').focus();
            return;
        }
        
        if (AppState.cart.length === 0) {
            Utils.showToast('Tu carrito está vacío', 'error');
            return;
        }
        
        // Disable button and show loading
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        const originalText = placeOrderBtn.innerHTML;
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<div class="loading-spinner mr-2"></div>Procesando pedido...';
        
        // Calculate totals
        const subtotal = getCartTotal();
        const total = subtotal;
        
        // Create order object
        const orderData = {
            cliente_id: AppState.currentUser ? AppState.currentUser.id : null,
            cliente_nombre: customerName,
            tipo_pedido: 'online',
            estado: 'pendiente',
            productos: JSON.stringify(AppState.cart.map(item => ({
                id: item.id,
                nombre: item.nombre,
                categoria: item.categoria,
                precio: item.promocion && item.precio_promocion ? item.precio_promocion : item.precio,
                quantity: item.quantity
            }))),
            subtotal: subtotal,
            descuento: 0,
            total: total,
            metodo_pago: paymentMethod,
            pagado: paymentMethod !== 'efectivo', // Auto mark as paid if not cash
            fecha_pedido: Date.now(),
            observaciones: orderNotes
        };
        
        // Save order
        const newOrder = await api.createOrder(orderData);
        
        // Show success modal
        showOrderConfirmation(newOrder);
        
        // Clear cart
        AppState.cart = [];
        saveCartToLocalStorage();
        updateCartUI();
        
        // Save customer info if user is logged in
        if (AppState.currentUser && customerPhone !== AppState.currentUser.telefono) {
            try {
                await api.updateUser(AppState.currentUser.id, {
                    telefono: customerPhone
                });
            } catch (error) {
                console.error('Error updating user phone:', error);
            }
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        Utils.showToast('Error al procesar el pedido. Intenta nuevamente.', 'error');
        
        // Restore button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = originalText;
    }
}

// Show Order Confirmation
function showOrderConfirmation(order) {
    const modal = document.getElementById('orderConfirmationModal');
    const content = document.getElementById('orderConfirmationContent');
    
    content.innerHTML = `
        <div class="animate-fadeIn">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check-circle text-3xl text-green-500"></i>
            </div>
            
            <h3 class="text-2xl font-bold text-gray-800 mb-4">¡Pedido Confirmado!</h3>
            
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <p class="text-sm text-gray-600 mb-2">Número de pedido:</p>
                <p class="text-xl font-bold text-orange-600">#${order.id.slice(-8).toUpperCase()}</p>
            </div>
            
            <div class="text-left space-y-3 mb-6">
                <div class="flex justify-between">
                    <span class="text-gray-600">Cliente:</span>
                    <span class="font-medium">${order.cliente_nombre}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Total:</span>
                    <span class="font-bold text-green-600">${Utils.formatCurrency(order.total)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Estado:</span>
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pendiente</span>
                </div>
            </div>
            
            <div class="bg-orange-50 rounded-lg p-4 mb-6">
                <div class="flex items-center text-orange-800">
                    <i class="fas fa-clock mr-2"></i>
                    <span class="text-sm font-medium">Tiempo estimado: 15-20 minutos</span>
                </div>
            </div>
            
            <p class="text-gray-600 text-sm mb-6">
                Te notificaremos cuando tu pedido esté listo para recoger.
            </p>
            
            <div class="flex gap-3">
                <button onclick="closeOrderConfirmation(); showPublicCatalog();" 
                        class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium">
                    Seguir Comprando
                </button>
                <button onclick="closeOrderConfirmation(); trackOrder('${order.id}');" 
                        class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium">
                    Seguir Pedido
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Close Order Confirmation
function closeOrderConfirmation() {
    const modal = document.getElementById('orderConfirmationModal');
    modal.classList.add('hidden');
}

// Track Order
function trackOrder(orderId) {
    // TODO: Implement order tracking functionality
    Utils.showToast('Funcionalidad de seguimiento próximamente disponible', 'info');
}

// Get Default Image (reuse from catalog)
function getDefaultImage(category) {
    const defaultImages = {
        jugos: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
        desayunos: 'https://images.unsplash.com/photo-1551997070-8b7c0d637ee8?w=400&h=300&fit=crop',
        bebidas: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop'
    };
    
    return defaultImages[category] || defaultImages.jugos;
}

// Override cart functions to update cart view when cart changes
document.addEventListener('DOMContentLoaded', function() {
    // Override updateCartUI to also update cart view
    const originalUpdateCartUI = window.updateCartUI;
    window.updateCartUI = function() {
        if (originalUpdateCartUI) {
            originalUpdateCartUI();
        }
        
        // Update cart view if currently visible
        if (AppState.currentView === 'cart') {
            renderCartItems();
            renderOrderSummary();
            updateCartState();
        }
        
        // Update floating cart count
        const floatingCartCount = document.getElementById('floatingCartCount');
        if (floatingCartCount) {
            const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
            floatingCartCount.textContent = totalItems;
            floatingCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    };
    
    // Override removeFromCart to update view
    const originalRemoveFromCart = window.removeFromCart;
    window.removeFromCart = function(productId) {
        if (originalRemoveFromCart) {
            originalRemoveFromCart(productId);
        } else {
            AppState.cart = AppState.cart.filter(item => item.id !== productId);
            saveCartToLocalStorage();
            Utils.showToast('Producto eliminado del carrito', 'success');
        }
        
        updateCartUI();
    };
    
    // Override updateCartQuantity to update view
    const originalUpdateCartQuantity = window.updateCartQuantity;
    window.updateCartQuantity = function(productId, quantity) {
        if (originalUpdateCartQuantity) {
            originalUpdateCartQuantity(productId, quantity);
        } else {
            const item = AppState.cart.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    item.quantity = quantity;
                    saveCartToLocalStorage();
                }
            }
        }
        
        updateCartUI();
    };
    
    // Override clearCart to update view
    const originalClearCart = window.clearCart;
    window.clearCart = function() {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            if (originalClearCart) {
                originalClearCart();
            } else {
                AppState.cart = [];
                saveCartToLocalStorage();
                Utils.showToast('Carrito vaciado', 'info');
            }
            
            updateCartUI();
        }
    };
});