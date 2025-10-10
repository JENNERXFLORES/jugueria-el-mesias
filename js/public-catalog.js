// Public Catalog for Customers - Juguería El Mesías

// Create Catalog View
function createCatalogView() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
            <div class="max-w-7xl mx-auto px-4">
                <!-- Header -->
                <div class="text-center mb-12">
                    <h1 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-poppins">
                        Nuestro <span class="text-gradient">Menú</span>
                    </h1>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                        Descubre nuestros deliciosos jugos naturales, desayunos nutritivos y bebidas refrescantes
                    </p>
                </div>

                <!-- Search and Filter Bar -->
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex-1">
                            <div class="relative">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input type="text" 
                                       id="searchProducts" 
                                       placeholder="Buscar productos..." 
                                       class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                       oninput="filterProducts()">
                            </div>
                        </div>
                        <div class="grid grid-cols-4 gap-2 md:flex md:gap-4">
                            <button onclick="filterByCategory('all')" 
                                    class="category-filter active px-4 py-3 rounded-lg font-medium transition-all" 
                                    data-category="all">
                                <i class="fas fa-th-large mr-2"></i>Todo
                            </button>
                            <button onclick="filterByCategory('jugos')" 
                                    class="category-filter px-4 py-3 rounded-lg font-medium transition-all" 
                                    data-category="jugos">
                                <i class="fas fa-glass-whiskey mr-2"></i>Jugos
                            </button>
                            <button onclick="filterByCategory('desayunos')" 
                                    class="category-filter px-4 py-3 rounded-lg font-medium transition-all" 
                                    data-category="desayunos">
                                <i class="fas fa-utensils mr-2"></i>Desayunos
                            </button>
                            <button onclick="filterByCategory('bebidas')" 
                                    class="category-filter px-4 py-3 rounded-lg font-medium transition-all" 
                                    data-category="bebidas">
                                <i class="fas fa-coffee mr-2"></i>Bebidas
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Promotions Banner -->
                <div id="promotionsBanner" class="mb-8"></div>

                <!-- Loading State -->
                <div id="catalogLoading" class="flex justify-center items-center py-16">
                    <div class="loading-spinner mr-3"></div>
                    <span class="text-gray-600">Cargando productos...</span>
                </div>

                <!-- Products Grid -->
                <div id="productsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 hidden">
                    <!-- Products will be loaded here -->
                </div>

                <!-- Empty State -->
                <div id="emptyState" class="text-center py-16 hidden">
                    <i class="fas fa-search text-6xl text-gray-400 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
                    <p class="text-gray-500">Intenta con una búsqueda diferente o explora todas las categorías</p>
                </div>

                <!-- Floating Cart Button (Mobile) -->
                <div class="fixed bottom-6 right-6 md:hidden z-40">
                    <button onclick="showCart()" 
                            class="bg-orange-500 hover:bg-orange-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                        <i class="fas fa-shopping-cart text-xl"></i>
                        <span id="floatingCartCount" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"></span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Product Modal -->
        <div id="productModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div id="productModalContent">
                    <!-- Product details will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Initialize Catalog
async function initializeCatalog() {
    try {
        // Load products
        await loadCatalogProducts();
        
        // Load promotions
        await loadPromotionsBanner();
        
        // Update floating cart count
        updateFloatingCartCount();
        
        // Initialize search debounce
        const searchInput = document.getElementById('searchProducts');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(filterProducts, 300));
        }
        
    } catch (error) {
        console.error('Error initializing catalog:', error);
        Utils.showToast('Error al cargar el catálogo', 'error');
    }
}

// Load Products
async function loadCatalogProducts() {
    const catalogLoading = document.getElementById('catalogLoading');
    const productsGrid = document.getElementById('productsGrid');
    
    try {
        catalogLoading.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        
        const response = await api.getProducts({ limit: 100 });
        const products = response.data || [];
        
        // Filter only available products
        const availableProducts = products.filter(product => product.disponible);
        AppState.products = availableProducts;
        
        if (availableProducts.length === 0) {
            await createDemoProducts();
            const newResponse = await api.getProducts({ limit: 100 });
            AppState.products = newResponse.data?.filter(product => product.disponible) || [];
        }
        
        renderProducts(AppState.products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        Utils.showToast('Error al cargar productos', 'error');
    } finally {
        catalogLoading.classList.add('hidden');
    }
}

// Render Products
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (products.length === 0) {
        productsGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    productsGrid.classList.remove('hidden');
    
    productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Create Product Card
function createProductCard(product) {
    const price = product.promocion && product.precio_promocion ? product.precio_promocion : product.precio;
    const originalPrice = product.promocion && product.precio_promocion ? product.precio : null;
    
    return `
        <div class="product-card animate-fadeInUp">
            <div class="relative overflow-hidden">
                <img src="${product.imagen_url || getDefaultImage(product.categoria)}" 
                     alt="${product.nombre}" 
                     class="product-image w-full h-48 object-cover">
                
                ${product.promocion ? `
                    <div class="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold animate-pulse-custom">
                        ¡OFERTA!
                    </div>
                ` : ''}
                
                <div class="absolute top-3 right-3 opacity-0 hover:opacity-100 transition-opacity">
                    <button onclick="showProductDetails('${product.id}')" 
                            class="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition-all">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-orange-600 uppercase tracking-wide">
                        ${product.categoria}
                    </span>
                    <div class="flex items-center text-yellow-500">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                </div>
                
                <h3 class="font-bold text-gray-800 mb-2 line-clamp-2">${product.nombre}</h3>
                
                <p class="text-gray-600 text-sm mb-3 line-clamp-3">
                    ${product.descripcion || 'Delicioso producto natural preparado con los mejores ingredientes.'}
                </p>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl font-bold text-orange-600">
                            ${Utils.formatCurrency(price)}
                        </span>
                        ${originalPrice ? `
                            <span class="text-sm text-gray-500 line-through">
                                ${Utils.formatCurrency(originalPrice)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')}, 1)" 
                            class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center">
                        <i class="fas fa-plus mr-2"></i>
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get Default Image based on category
function getDefaultImage(category) {
    const defaultImages = {
        jugos: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
        desayunos: 'https://images.unsplash.com/photo-1551997070-8b7c0d637ee8?w=400&h=300&fit=crop',
        bebidas: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop'
    };
    
    return defaultImages[category] || defaultImages.jugos;
}

// Filter Products by Category
function filterByCategory(category) {
    // Update active filter button
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Filter products
    let filteredProducts = AppState.products;
    
    if (category !== 'all') {
        filteredProducts = AppState.products.filter(product => product.categoria === category);
    }
    
    renderProducts(filteredProducts);
}

// Filter Products by Search
function filterProducts() {
    const searchTerm = document.getElementById('searchProducts').value.toLowerCase().trim();
    const activeCategory = document.querySelector('.category-filter.active').dataset.category;
    
    let filteredProducts = AppState.products;
    
    // Apply category filter
    if (activeCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.categoria === activeCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.nombre.toLowerCase().includes(searchTerm) ||
            product.descripcion?.toLowerCase().includes(searchTerm) ||
            product.ingredientes?.toLowerCase().includes(searchTerm)
        );
    }
    
    renderProducts(filteredProducts);
}

// Show Product Details Modal
function showProductDetails(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('productModalContent');
    
    const price = product.promocion && product.precio_promocion ? product.precio_promocion : product.precio;
    const originalPrice = product.promocion && product.precio_promocion ? product.precio : null;
    
    modalContent.innerHTML = `
        <div class="relative">
            <button onclick="closeProductModal()" 
                    class="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                <i class="fas fa-times"></i>
            </button>
            
            <img src="${product.imagen_url || getDefaultImage(product.categoria)}" 
                 alt="${product.nombre}" 
                 class="w-full h-64 md:h-80 object-cover">
            
            ${product.promocion ? `
                <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-full font-bold animate-pulse-custom">
                    ¡OFERTA ESPECIAL!
                </div>
            ` : ''}
        </div>
        
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <span class="text-sm font-medium text-orange-600 uppercase tracking-wide">
                    ${product.categoria}
                </span>
                <div class="flex items-center text-yellow-500">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
            </div>
            
            <h2 class="text-3xl font-bold text-gray-800 mb-4">${product.nombre}</h2>
            
            <div class="flex items-center space-x-4 mb-6">
                <span class="text-3xl font-bold text-orange-600">
                    ${Utils.formatCurrency(price)}
                </span>
                ${originalPrice ? `
                    <span class="text-xl text-gray-500 line-through">
                        ${Utils.formatCurrency(originalPrice)}
                    </span>
                    <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                        ${Math.round((1 - price/originalPrice) * 100)}% OFF
                    </span>
                ` : ''}
            </div>
            
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Descripción</h3>
                <p class="text-gray-600 leading-relaxed">
                    ${product.descripcion || 'Delicioso producto natural preparado con los mejores ingredientes frescos, ideal para cualquier momento del día.'}
                </p>
            </div>
            
            ${product.ingredientes ? `
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Ingredientes</h3>
                    <p class="text-gray-600">${product.ingredientes}</p>
                </div>
            ` : ''}
            
            <div class="flex items-center space-x-4">
                <div class="flex items-center border border-gray-300 rounded-lg">
                    <button onclick="decreaseQuantity('modalQuantity')" 
                            class="px-3 py-2 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" 
                           id="modalQuantity" 
                           value="1" 
                           min="1" 
                           max="10" 
                           class="w-16 text-center border-0 focus:ring-0">
                    <button onclick="increaseQuantity('modalQuantity')" 
                            class="px-3 py-2 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <button onclick="addToCartFromModal('${product.id}')" 
                        class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-all">
                    <i class="fas fa-shopping-cart mr-2"></i>
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

// Close Product Modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

// Quantity Controls
function decreaseQuantity(inputId) {
    const input = document.getElementById(inputId);
    const currentValue = parseInt(input.value) || 1;
    if (currentValue > 1) {
        input.value = currentValue - 1;
    }
}

function increaseQuantity(inputId) {
    const input = document.getElementById(inputId);
    const currentValue = parseInt(input.value) || 1;
    if (currentValue < 10) {
        input.value = currentValue + 1;
    }
}

// Add to Cart from Modal
function addToCartFromModal(productId) {
    const product = AppState.products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById('modalQuantity').value) || 1;
    
    if (product) {
        addToCart(product, quantity);
        closeProductModal();
    }
}

// Update Floating Cart Count
function updateFloatingCartCount() {
    const floatingCartCount = document.getElementById('floatingCartCount');
    if (floatingCartCount) {
        const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
        floatingCartCount.textContent = totalItems;
        floatingCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Load Promotions Banner
async function loadPromotionsBanner() {
    try {
        const response = await api.getPromotions({ limit: 10 });
        const promotions = response.data?.filter(promo => 
            promo.activa && 
            new Date(promo.fecha_inicio) <= new Date() && 
            new Date(promo.fecha_fin) >= new Date()
        ) || [];
        
        if (promotions.length === 0) {
            await createDemoPromotions();
            const newResponse = await api.getPromotions({ limit: 10 });
            const newPromotions = newResponse.data?.filter(promo => 
                promo.activa && 
                new Date(promo.fecha_inicio) <= new Date() && 
                new Date(promo.fecha_fin) >= new Date()
            ) || [];
            renderPromotionsBanner(newPromotions);
        } else {
            renderPromotionsBanner(promotions);
        }
        
    } catch (error) {
        console.error('Error loading promotions:', error);
    }
}

// Render Promotions Banner
function renderPromotionsBanner(promotions) {
    const banner = document.getElementById('promotionsBanner');
    
    if (promotions.length === 0) {
        banner.innerHTML = '';
        return;
    }
    
    banner.innerHTML = `
        <div class="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl p-6 mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold mb-2">
                        <i class="fas fa-fire mr-2"></i>
                        ${promotions[0].titulo}
                    </h3>
                    <p class="text-red-100 mb-4">${promotions[0].descripcion}</p>
                    <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
                        Válido hasta ${Utils.formatDate(promotions[0].fecha_fin)}
                    </span>
                </div>
                <div class="hidden md:block">
                    <i class="fas fa-percent text-6xl opacity-20"></i>
                </div>
            </div>
        </div>
    `;
}

// Create Demo Products
async function createDemoProducts() {
    const demoProducts = [
        {
            nombre: 'Jugo de Naranja Natural',
            categoria: 'jugos',
            precio: 8.50,
            descripcion: 'Jugo de naranja recién exprimido, 100% natural sin azúcar añadida. Rico en vitamina C.',
            imagen_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
            disponible: true,
            promocion: false,
            ingredientes: 'Naranjas frescas'
        },
        {
            nombre: 'Jugo de Fresa con Leche',
            categoria: 'jugos',
            precio: 12.00,
            precio_promocion: 10.00,
            descripcion: 'Cremoso jugo de fresa con leche fresca, endulzado naturalmente.',
            imagen_url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop',
            disponible: true,
            promocion: true,
            ingredientes: 'Fresas frescas, leche, azúcar'
        },
        {
            nombre: 'Desayuno Continental',
            categoria: 'desayunos',
            precio: 18.00,
            descripcion: 'Pan tostado, huevos revueltos, jamón, queso, mermelada y café.',
            imagen_url: 'https://images.unsplash.com/photo-1551997070-8b7c0d637ee8?w=400&h=300&fit=crop',
            disponible: true,
            promocion: false,
            ingredientes: 'Pan, huevos, jamón, queso, café'
        },
        {
            nombre: 'Café Americano',
            categoria: 'bebidas',
            precio: 6.00,
            descripcion: 'Café negro de grano seleccionado, preparado al momento.',
            imagen_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
            disponible: true,
            promocion: false,
            ingredientes: 'Café de grano, agua'
        },
        {
            nombre: 'Smoothie Tropical',
            categoria: 'jugos',
            precio: 14.50,
            descripcion: 'Mezcla de mango, piña y maracuyá con yogurt natural.',
            imagen_url: 'https://images.unsplash.com/photo-1570838685461-59ffd37e8c35?w=400&h=300&fit=crop',
            disponible: true,
            promocion: false,
            ingredientes: 'Mango, piña, maracuyá, yogurt'
        },
        {
            nombre: 'Tostadas Francesas',
            categoria: 'desayunos',
            precio: 15.00,
            precio_promocion: 12.00,
            descripcion: 'Tostadas francesas con miel, canela y frutas frescas.',
            imagen_url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
            disponible: true,
            promocion: true,
            ingredientes: 'Pan brioche, huevos, leche, miel, canela, frutas'
        }
    ];
    
    try {
        for (const product of demoProducts) {
            await api.createProduct(product);
        }
        console.log('Demo products created successfully');
    } catch (error) {
        console.error('Error creating demo products:', error);
    }
}

// Create Demo Promotions
async function createDemoPromotions() {
    const getPromotionPeriod = (durationInDays) => {
        const start = new Date();
        const end = new Date(start.getTime() + durationInDays * 24 * 60 * 60 * 1000);

        return {
            start: Utils.formatDateTimeForApi(start),
            end: Utils.formatDateTimeForApi(end)
        };
    };

    const firstPromotionPeriod = getPromotionPeriod(30);
    const secondPromotionPeriod = getPromotionPeriod(15);

    const demoPromotions = [
        {
            titulo: '¡2x1 en Jugos Naturales!',
            descripcion: 'Lleva dos jugos naturales y paga solo uno. Válido de lunes a viernes.',
            tipo: '2x1',
            valor_descuento: 0,
            productos_aplicables: [],
            fecha_inicio: firstPromotionPeriod.start,
            fecha_fin: firstPromotionPeriod.end,
            activa: true,
            imagen_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=400&fit=crop'
        },
        {
            titulo: '20% OFF en Desayunos',
            descripcion: 'Descuento especial en todos nuestros desayunos durante todo el mes.',
            tipo: 'descuento_porcentaje',
            valor_descuento: 20,
            productos_aplicables: [],
            fecha_inicio: secondPromotionPeriod.start,
            fecha_fin: secondPromotionPeriod.end,
            activa: true,
            imagen_url: 'https://images.unsplash.com/photo-1551997070-8b7c0d637ee8?w=800&h=400&fit=crop'
        }
    ];
    
    try {
        for (const promotion of demoPromotions) {
            await api.createPromotion(promotion);
        }
        console.log('Demo promotions created successfully');
    } catch (error) {
        console.error('Error creating demo promotions:', error);
    }
}

// Add custom styles for category filters
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .category-filter {
            background-color: #f3f4f6;
            color: #6b7280;
            border: 2px solid transparent;
        }
        
        .category-filter:hover {
            background-color: #e5e7eb;
            color: #4b5563;
        }
        
        .category-filter.active {
            background-color: #f97316;
            color: white;
            border-color: #ea580c;
        }
        
        .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .max-h-90vh {
            max-height: 90vh;
        }
    `;
    document.head.appendChild(style);
    
    // Override addToCart to update floating cart
    const originalAddToCart = window.addToCart;
    window.addToCart = function(product, quantity = 1) {
        if (originalAddToCart) {
            originalAddToCart(product, quantity);
        } else {
            // Fallback implementation
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
        updateFloatingCartCount();
    };
});