-- Base de Datos para Juguería El Mesías
-- Compatible con MySQL 5.7+ y MariaDB

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS jugeria_el_mesias 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE jugeria_el_mesias;

-- ============================================================================
-- TABLA: usuarios
-- ============================================================================
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    tipo ENUM('cliente', 'trabajador', 'admin') NOT NULL DEFAULT 'cliente',
    direccion TEXT,
    password_hash VARCHAR(255), -- Para almacenar contraseñas hasheadas
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_tipo (tipo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: categorias
-- ============================================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: productos
-- ============================================================================
CREATE TABLE productos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nombre VARCHAR(255) NOT NULL,
    categoria ENUM('jugos', 'desayunos', 'bebidas') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT TRUE,
    promocion BOOLEAN DEFAULT FALSE,
    precio_promocion DECIMAL(10,2) NULL,
    ingredientes TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categoria (categoria),
    INDEX idx_disponible (disponible),
    INDEX idx_promocion (promocion),
    INDEX idx_precio (precio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: pedidos
-- ============================================================================
CREATE TABLE pedidos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cliente_id VARCHAR(36),
    cliente_nombre VARCHAR(255) NOT NULL,
    tipo_pedido ENUM('local', 'online') NOT NULL DEFAULT 'online',
    estado ENUM('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'yape', 'plin') NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NULL,
    observaciones TEXT,
    
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_estado (estado),
    INDEX idx_tipo_pedido (tipo_pedido),
    INDEX idx_fecha_pedido (fecha_pedido),
    INDEX idx_cliente_id (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: pedido_productos (Detalle de productos en cada pedido)
-- ============================================================================
CREATE TABLE pedido_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL,
    producto_id VARCHAR(36) NOT NULL,
    producto_nombre VARCHAR(255) NOT NULL, -- Desnormalizado para histórico
    producto_categoria VARCHAR(50) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    INDEX idx_pedido_id (pedido_id),
    INDEX idx_producto_id (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: ventas
-- ============================================================================
CREATE TABLE ventas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pedido_id VARCHAR(36) NOT NULL,
    vendedor_id VARCHAR(36),
    vendedor_nombre VARCHAR(255) NOT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('efectivo', 'tarjeta', 'yape', 'plin') NOT NULL,
    turno ENUM('mañana', 'tarde', 'noche') NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE RESTRICT,
    FOREIGN KEY (vendedor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_fecha_venta (fecha_venta),
    INDEX idx_vendedor_id (vendedor_id),
    INDEX idx_metodo_pago (metodo_pago),
    INDEX idx_turno (turno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: gastos
-- ============================================================================
CREATE TABLE gastos (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    concepto VARCHAR(255) NOT NULL,
    categoria ENUM('materia_prima', 'servicios', 'equipos', 'marketing', 'otros') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_gasto DATE NOT NULL,
    responsable VARCHAR(255) NOT NULL,
    comprobante VARCHAR(100),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_gasto (fecha_gasto),
    INDEX idx_responsable (responsable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: promociones
-- ============================================================================
CREATE TABLE promociones (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('descuento_porcentaje', 'descuento_fijo', 'combo', '2x1') NOT NULL,
    valor_descuento DECIMAL(10,2) DEFAULT 0.00,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    imagen_url TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_activa (activa),
    INDEX idx_fechas (fecha_inicio, fecha_fin),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: promocion_productos (Productos aplicables a cada promoción)
-- ============================================================================
CREATE TABLE promocion_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    promocion_id VARCHAR(36) NOT NULL,
    producto_id VARCHAR(36) NOT NULL,
    
    FOREIGN KEY (promocion_id) REFERENCES promociones(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_promocion_producto (promocion_id, producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: sesiones (Para manejo de sesiones de usuario)
-- ============================================================================
CREATE TABLE sesiones (
    id VARCHAR(128) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    datos TEXT,
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_expiracion (fecha_expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLA: configuracion (Para configuraciones del sistema)
-- ============================================================================
CREATE TABLE configuracion (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT,
    descripcion TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERTAR DATOS INICIALES
-- ============================================================================

-- Categorías base
INSERT INTO categorias (nombre, descripcion) VALUES
('jugos', 'Jugos naturales y smoothies'),
('desayunos', 'Desayunos completos y nutritivos'),
('bebidas', 'Bebidas calientes y frías');

-- Usuarios de demo
INSERT INTO usuarios (id, nombre, email, telefono, tipo, direccion, password_hash, activo) VALUES
('admin-demo-001', 'Administrador Principal', 'admin@elmesias.com', '987654321', 'admin', 'Nueva Cajamarca, Perú', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('vendedor-demo-001', 'Vendedor Demo', 'vendedor@elmesias.com', '987654322', 'trabajador', 'Nueva Cajamarca, Perú', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('cliente-demo-001', 'Cliente Demo', 'cliente@demo.com', '987654324', 'cliente', 'Nueva Cajamarca, Perú', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE);

-- Productos de demo
INSERT INTO productos (id, nombre, categoria, precio, descripcion, imagen_url, disponible, promocion, precio_promocion, ingredientes) VALUES
('prod-001', 'Jugo de Naranja Natural', 'jugos', 8.50, 'Jugo de naranja recién exprimido, 100% natural sin azúcar añadida. Rico en vitamina C.', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', TRUE, FALSE, NULL, 'Naranjas frescas seleccionadas'),

('prod-002', 'Jugo de Fresa con Leche', 'jugos', 12.00, 'Cremoso jugo de fresa con leche fresca, endulzado naturalmente. Una combinación perfecta y refrescante.', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop', TRUE, TRUE, 10.00, 'Fresas frescas, leche entera, azúcar natural'),

('prod-003', 'Desayuno Continental', 'desayunos', 18.00, 'Desayuno completo con pan tostado, huevos revueltos, jamón, queso fresco, mermelada casera y café americano.', 'https://images.unsplash.com/photo-1551997070-8b7c0d637ee8?w=400&h=300&fit=crop', TRUE, FALSE, NULL, 'Pan artesanal, huevos frescos, jamón del país, queso fresco, mermelada casera'),

('prod-004', 'Café Americano', 'bebidas', 6.00, 'Café negro de grano seleccionado, preparado al momento. Ideal para acompañar cualquier comida.', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', TRUE, FALSE, NULL, 'Café de grano 100% arábica, agua filtrada'),

('prod-005', 'Smoothie Tropical', 'jugos', 14.50, 'Refrescante mezcla de mango, piña y maracuyá con yogurt natural. ¡Un sabor tropical en cada sorbo!', 'https://images.unsplash.com/photo-1570838685461-59ffd37e8c35?w=400&h=300&fit=crop', TRUE, FALSE, NULL, 'Mango maduro, piña fresca, pulpa de maracuyá, yogurt natural'),

('prod-006', 'Tostadas Francesas', 'desayunos', 15.00, 'Deliciosas tostadas francesas con miel de abeja, canela y frutas frescas de estación. Un clásico irresistible.', 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop', TRUE, TRUE, 12.50, 'Pan brioche, huevos frescos, leche, miel de abeja, canela, frutas de estación');

-- Promociones activas
INSERT INTO promociones (id, titulo, descripcion, tipo, valor_descuento, fecha_inicio, fecha_fin, activa, imagen_url) VALUES
('promo-001', '¡Promoción 2x1 en Jugos Naturales!', 'Lleva dos jugos naturales y paga solo uno. Válido de lunes a viernes de 8:00 AM a 12:00 PM. No acumulable con otras promociones.', '2x1', 50.00, '2024-12-26 08:00:00', '2025-01-25 20:00:00', TRUE, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&h=400&fit=crop'),

('promo-002', '20% OFF en Desayunos Completos', 'Descuento especial del 20% en todos nuestros desayunos durante todo el mes. ¡Empieza tu día con energía y ahorrando!', 'descuento_porcentaje', 20.00, '2024-12-26 00:00:00', '2025-01-10 23:59:59', TRUE, 'https://images.unsplash.com/photo-1551997070-8b7c0d637ee8?w=800&h=400&fit=crop');

-- Configuraciones del sistema
INSERT INTO configuracion (clave, valor, descripcion, tipo) VALUES
('nombre_empresa', 'Juguería El Mesías', 'Nombre de la empresa', 'string'),
('direccion_empresa', 'Nueva Cajamarca, Perú', 'Dirección principal', 'string'),
('telefono_empresa', '987-654-321', 'Teléfono de contacto', 'string'),
('email_empresa', 'contacto@elmesias.com', 'Email de contacto', 'string'),
('moneda', 'PEN', 'Moneda del sistema', 'string'),
('timezone', 'America/Lima', 'Zona horaria', 'string'),
('iva_porcentaje', '18', 'Porcentaje de IGV/IVA', 'number'),
('tiempo_preparacion_minutos', '20', 'Tiempo estimado de preparación', 'number');

-- ============================================================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================================================

-- Vista: Ventas con detalles completos
CREATE VIEW vista_ventas_completas AS
SELECT 
    v.id,
    v.fecha_venta,
    v.vendedor_nombre,
    v.cliente_nombre,
    v.total,
    v.metodo_pago,
    v.turno,
    p.tipo_pedido,
    p.estado as estado_pedido,
    COUNT(pp.id) as total_productos,
    GROUP_CONCAT(CONCAT(pp.producto_nombre, ' (', pp.cantidad, ')') SEPARATOR ', ') as productos
FROM ventas v
JOIN pedidos p ON v.pedido_id = p.id
LEFT JOIN pedido_productos pp ON p.id = pp.pedido_id
GROUP BY v.id, v.fecha_venta, v.vendedor_nombre, v.cliente_nombre, v.total, v.metodo_pago, v.turno, p.tipo_pedido, p.estado;

-- Vista: Productos más vendidos
CREATE VIEW vista_productos_mas_vendidos AS
SELECT 
    p.id,
    p.nombre,
    p.categoria,
    p.precio,
    COALESCE(SUM(pp.cantidad), 0) as total_vendido,
    COALESCE(SUM(pp.subtotal), 0) as ingresos_generados,
    COUNT(DISTINCT pp.pedido_id) as pedidos_incluido
FROM productos p
LEFT JOIN pedido_productos pp ON p.id = pp.producto_id
LEFT JOIN pedidos pd ON pp.pedido_id = pd.id
WHERE pd.estado IN ('entregado') OR pd.estado IS NULL
GROUP BY p.id, p.nombre, p.categoria, p.precio
ORDER BY total_vendido DESC;

-- Vista: Resumen diario de ventas
CREATE VIEW vista_resumen_diario AS
SELECT 
    DATE(fecha_venta) as fecha,
    COUNT(*) as total_ventas,
    SUM(total) as ingresos_totales,
    AVG(total) as ticket_promedio,
    SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END) as efectivo,
    SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END) as tarjeta,
    SUM(CASE WHEN metodo_pago = 'yape' THEN total ELSE 0 END) as yape,
    SUM(CASE WHEN metodo_pago = 'plin' THEN total ELSE 0 END) as plin
FROM ventas
GROUP BY DATE(fecha_venta)
ORDER BY fecha DESC;

-- ============================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================================================

-- Índices para optimizar consultas de reportes
CREATE INDEX idx_ventas_fecha_metodo ON ventas(fecha_venta, metodo_pago);
CREATE INDEX idx_pedidos_fecha_estado ON pedidos(fecha_pedido, estado);
CREATE INDEX idx_productos_categoria_disponible ON productos(categoria, disponible);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_pedido_productos_reporte ON pedido_productos(pedido_id, producto_id, cantidad);

-- ============================================================================
-- TRIGGERS PARA AUDITORÍA Y AUTOMATIZACIÓN
-- ============================================================================

-- Trigger para actualizar fecha de entrega automáticamente
DELIMITER $$
CREATE TRIGGER tr_pedidos_fecha_entrega 
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
BEGIN
    IF NEW.estado = 'entregado' AND OLD.estado != 'entregado' THEN
        SET NEW.fecha_entrega = CURRENT_TIMESTAMP;
    END IF;
END$$
DELIMITER ;

-- Trigger para calcular subtotal automáticamente en pedido_productos
DELIMITER $$
CREATE TRIGGER tr_pedido_productos_subtotal 
    BEFORE INSERT ON pedido_productos
    FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.precio_unitario * NEW.cantidad;
END$$

CREATE TRIGGER tr_pedido_productos_subtotal_update 
    BEFORE UPDATE ON pedido_productos
    FOR EACH ROW
BEGIN
    SET NEW.subtotal = NEW.precio_unitario * NEW.cantidad;
END$$
DELIMITER ;

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================================

-- SP: Obtener estadísticas de ventas por período
DELIMITER $$
CREATE PROCEDURE sp_estadisticas_ventas(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        COUNT(*) as total_ventas,
        SUM(total) as ingresos_totales,
        AVG(total) as ticket_promedio,
        COUNT(DISTINCT cliente_nombre) as clientes_unicos,
        metodo_pago,
        COUNT(*) as ventas_por_metodo
    FROM ventas 
    WHERE DATE(fecha_venta) BETWEEN fecha_inicio AND fecha_fin
    GROUP BY metodo_pago
    WITH ROLLUP;
END$$
DELIMITER ;

-- SP: Obtener productos por categoría con stock
DELIMITER $$
CREATE PROCEDURE sp_productos_por_categoria(
    IN categoria_filtro VARCHAR(50)
)
BEGIN
    SELECT 
        id,
        nombre,
        categoria,
        precio,
        precio_promocion,
        promocion,
        disponible,
        ingredientes,
        descripcion
    FROM productos 
    WHERE categoria = categoria_filtro AND disponible = TRUE
    ORDER BY promocion DESC, nombre ASC;
END$$
DELIMITER ;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

/*
NOTAS DE LA BASE DE DATOS:

1. CHARSET y COLLATION:
   - Usa utf8mb4 para soporte completo de Unicode (emojis, caracteres especiales)
   - Collation unicode_ci para comparaciones case-insensitive

2. CLAVES PRIMARIAS:
   - UUIDs para tablas principales (mejor para sistemas distribuidos)
   - AUTO_INCREMENT para tablas de relación (mejor performance)

3. ÍNDICES:
   - Todos los campos de búsqueda frecuente están indexados
   - Índices compuestos para consultas complejas
   - Foreign keys automáticamente indexadas

4. TRIGGERS:
   - Automatización de fechas de entrega
   - Cálculo automático de subtotales
   - Auditoría básica implementada

5. VISTAS:
   - Simplificación de consultas complejas
   - Pre-cálculo de estadísticas frecuentes
   - Abstracción de la estructura de datos

6. SEGURIDAD:
   - Passwords hasheados (bcrypt compatible)
   - Constraints de integridad referencial
   - Validación de tipos de datos

7. ESCALABILIDAD:
   - Estructura normalizada pero con desnormalización estratégica
   - Preparada para particionamiento futuro
   - Índices optimizados para queries frecuentes
*/

-- ============================================================================
-- FIN DEL SCRIPT DE BASE DE DATOS
-- ============================================================================