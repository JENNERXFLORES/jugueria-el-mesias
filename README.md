# 🥤 Sistema Web Juguería El Mesías

**Un sistema integral de gestión para juguería con módulos de administración y venta online**

---

## 📋 Descripción del Proyecto

Sistema web completo desarrollado para la **Juguería El Mesías** de Nueva Cajamarca, Perú. Incluye tanto una **intranet administrativa** para trabajadores como una **interfaz pública** para clientes, permitiendo gestión completa del negocio y ventas online.

### 🎯 Objetivos Principales

- **Gestión integral** de productos, ventas y pedidos
- **Interfaz pública atractiva** para clientes
- **Sistema POS** completo para ventas en local
- **Módulo de cocina** con seguimiento de pedidos en tiempo real
- **Reportes y analytics** con gráficos visuales
- **Diseño responsive** y experiencia de usuario optimizada

---

## 🚀 Funcionalidades Implementadas

### 🔑 Módulos Internos (Trabajadores)

#### ✅ 1. Dashboard Administrativo
- **Vista general** con métricas en tiempo real
- **Accesos rápidos** a todos los módulos
- **Gráficos de rendimiento** de ventas de últimos 7 días
- **Resumen del día** con estadísticas clave

#### ✅ 2. Gestión de Productos
- **CRUD completo** para productos (jugos, desayunos, bebidas)
- **Gestión de precios** y promociones
- **Control de disponibilidad** en tiempo real
- **Imágenes y descripciones** detalladas

#### ✅ 3. Sistema POS (Punto de Venta)
- **Interfaz intuitiva** estilo punto de venta
- **Cálculos automáticos** de totales
- **Múltiples métodos de pago**: efectivo, tarjeta, Yape, Plin
- **Generación de tickets** de venta
- **Botones grandes** y diseño optimizado para uso táctil

#### ✅ 4. Módulo de Cocina
- **Vista de pedidos en tiempo real** (local + online)
- **Estados de pedido**: pendiente → en preparación → listo → entregado
- **Notificaciones sonoras** para nuevos pedidos
- **Priorización de órdenes** urgentes
- **Interfaz optimizada** para pantallas de cocina

#### ✅ 5. Módulo de Caja
- **Registro de pagos** y cierre de pedidos
- **Arqueo de caja** con diferencias automáticas
- **Reportes de ventas** por turno
- **Desglose por métodos** de pago
- **Control de turnos** de trabajo

#### ✅ 6. Módulo de Gastos
- **Registro de compras** y gastos operativos
- **Categorización automática** (materia prima, servicios, equipos, etc.)
- **Comprobantes y facturas**
- **Reportes mensuales** de egresos

#### ✅ 7. Módulo de Reportes
- **Gráficos visuales** con Chart.js
- **Análisis de ventas** diarias, semanales, mensuales
- **Productos más vendidos**
- **Análisis financiero**: ingresos vs egresos
- **Métricas de clientes** y comportamiento
- **Exportación** en PDF, Excel, CSV

### 🌐 Módulos Externos (Clientes)

#### ✅ 1. Catálogo de Productos
- **Interfaz moderna** y atractiva
- **Filtros por categoría** y búsqueda
- **Promociones destacadas**
- **Integración automática** con inventario interno
- **Fotos de alta calidad** de productos

#### ✅ 2. Carrito de Compras
- **Agregar/quitar productos** con cantidades
- **Cálculo automático** de totales
- **Información del cliente** y observaciones
- **Selección de método** de pago y entrega

#### ✅ 3. Sistema de Pedidos Online
- **Proceso de checkout** optimizado
- **Confirmación inmediata** con número de pedido
- **Integración en tiempo real** con módulo de cocina
- **Notificaciones** de estado del pedido

#### ✅ 4. Registro y Perfil de Clientes
- **Registro simple** de usuarios
- **Perfil personalizado** con historial
- **Direcciones frecuentes** guardadas
- **Historial completo** de pedidos

#### ✅ 5. Sistema de Promociones
- **Banners promocionales** dinámicos
- **Descuentos automáticos** aplicables
- **Ofertas especiales** y combos
- **Gestión desde panel** administrativo

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con Flexbox y Grid
- **JavaScript ES6+** - Lógica de aplicación
- **Tailwind CSS** - Framework CSS utilitario
- **Chart.js** - Gráficos y visualización de datos
- **Font Awesome** - Iconografía profesional

### Backend/Datos
- **MySQL** - Base de datos relacional persistente
- **PHP 7.4+** - Backend con PDO para conexiones seguras
- **RESTful API** - Endpoints completos para CRUD operations
- **LocalStorage** - Persistencia local del carrito (compatible)

### Librerías y Herramientas
- **Google Fonts** - Tipografía (Inter, Poppins)
- **Unsplash API** - Imágenes de ejemplo de productos
- **Responsive Design** - Compatible con dispositivos móviles
- **Progressive Web App** ready

---

## 📊 Estructura de Datos

### Tablas Principales

#### `productos`
```javascript
{
  id: string,
  nombre: string,
  categoria: "jugos" | "desayunos" | "bebidas",
  precio: number,
  descripcion: string,
  imagen_url: string,
  disponible: boolean,
  promocion: boolean,
  precio_promocion: number,
  ingredientes: string
}
```

#### `pedidos`
```javascript
{
  id: string,
  cliente_id: string,
  cliente_nombre: string,
  tipo_pedido: "local" | "online",
  estado: "pendiente" | "en_preparacion" | "listo" | "entregado" | "cancelado",
  productos: Array<ProductoPedido>,
  subtotal: number,
  total: number,
  metodo_pago: "efectivo" | "tarjeta" | "yape" | "plin",
  fecha_pedido: timestamp,
  observaciones: string
}
```

#### `ventas`
```javascript
{
  id: string,
  pedido_id: string,
  vendedor_id: string,
  vendedor_nombre: string,
  cliente_nombre: string,
  productos: Array<ProductoVenta>,
  total: number,
  metodo_pago: string,
  fecha_venta: timestamp,
  turno: "mañana" | "tarde" | "noche"
}
```

#### `usuarios`
```javascript
{
  id: string,
  nombre: string,
  email: string,
  telefono: string,
  tipo: "cliente" | "trabajador" | "admin",
  direccion: string,
  activo: boolean,
  fecha_registro: timestamp
}
```

#### `gastos`
```javascript
{
  id: string,
  concepto: string,
  categoria: "materia_prima" | "servicios" | "equipos" | "marketing" | "otros",
  monto: number,
  fecha_gasto: timestamp,
  responsable: string,
  comprobante: string
}
```

#### `promociones`
```javascript
{
  id: string,
  titulo: string,
  descripcion: string,
  tipo: "descuento_porcentaje" | "descuento_fijo" | "combo" | "2x1",
  valor_descuento: number,
  fecha_inicio: timestamp,
  fecha_fin: timestamp,
  activa: boolean
}
```

---

## 🗺️ Estructura de Archivos

```
jugueria-el-mesias/
├── index.html                    # Página principal
├── README.md                     # Documentación principal
├── MIGRATION_GUIDE.md           # Guía de migración a MySQL
├── css/
│   └── style.css               # Estilos personalizados
├── js/
│   ├── config.js              # Configuración de entornos
│   ├── migration.js           # Migración automática de datos
│   ├── app.js                 # Aplicación principal
│   ├── auth.js                # Sistema de autenticación
│   ├── public-catalog.js      # Catálogo público
│   ├── cart.js                # Carrito de compras
│   ├── dashboard.js           # Dashboard administrativo
│   ├── pos.js                 # Sistema POS
│   ├── kitchen.js             # Módulo de cocina
│   ├── cash.js                # Módulo de caja
│   └── reports.js             # Sistema de reportes
├── backend/
│   ├── api/
│   │   ├── index.php          # Router principal de API
│   │   ├── .htaccess          # Configuración Apache
│   │   └── controllers/       # Controladores REST
│   │       ├── BaseController.php
│   │       ├── ProductosController.php
│   │       ├── PedidosController.php
│   │       ├── VentasController.php
│   │       ├── GastosController.php
│   │       ├── UsuariosController.php
│   │       └── PromocionesController.php
│   └── config/
│       └── database.php       # Configuración MySQL
├── database/
│   └── jugeria_el_mesias.sql  # Script de instalación DB
└── setup/
    ├── install.php            # Instalador automático
    └── test_api.php           # Test de endpoints API
```

---

## 🔐 Usuarios de Demo

Para probar el sistema, utiliza estas credenciales:

### Administrador
- **Email**: `admin@elmesias.com`
- **Contraseña**: `password123`
- **Acceso**: Todos los módulos administrativos

### Trabajador/Vendedor
- **Email**: `vendedor@elmesias.com`
- **Contraseña**: `password123`
- **Acceso**: POS, Cocina, Caja

### Cliente
- **Email**: `cliente@demo.com`
- **Contraseña**: `password123`
- **Acceso**: Catálogo público, carrito, perfil

---

## 🎨 Características de Diseño

### Interfaz de Usuario
- **Diseño moderno** con gradientes y sombras
- **Animaciones fluidas** y transiciones suaves
- **Iconografía consistente** con Font Awesome
- **Paleta de colores** cálida (naranjas y amarillos)
- **Tipografía profesional** (Inter y Poppins)

### Experiencia de Usuario
- **Navegación intuitiva** entre módulos
- **Feedback visual** en todas las acciones
- **Loading states** para operaciones asíncronas
- **Mensajes de confirmación** y error
- **Responsive design** para todos los dispositivos

### Accesibilidad
- **Contraste adecuado** en todos los elementos
- **Navegación por teclado** implementada
- **Textos alternativos** en imágenes
- **Diseño inclusivo** siguiendo estándares WCAG

---

## 📱 Responsive Design

### Breakpoints Implementados
- **Mobile**: < 640px - Interfaz optimizada para móviles
- **Tablet**: 640px - 1024px - Diseño adaptado para tablets
- **Desktop**: > 1024px - Experiencia completa de escritorio

### Características Móviles
- **Menú hamburguesa** en navegación
- **Botones táctiles** grandes en POS
- **Carrito flotante** en catálogo móvil
- **Gestos touch** optimizados
- **Formularios adaptados** para pantallas pequeñas

---

## 🔧 Configuración e Instalación

### 📋 Requisitos Previos
- **XAMPP** (Apache + MySQL + PHP 7.4+)
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet para CDN de librerías

### 🚀 Instalación Rápida con XAMPP

1. **Instalar XAMPP** desde https://www.apachefriends.org/
2. **Iniciar** Apache y MySQL en XAMPP Control Panel
3. **Copiar archivos** del proyecto a `C:\xampp\htdocs\jugeria-el-mesias\`
4. **Ejecutar instalador**: `http://localhost/jugeria-el-mesias/setup/install.php`
5. **Seguir asistente** de instalación automática
6. **Acceder al sistema**: `http://localhost/jugeria-el-mesias/`

### 🔄 Migración desde LocalStorage

Si ya tienes datos locales, el sistema automáticamente:
- ✅ **Detecta datos existentes** en localStorage
- ✅ **Muestra modal de migración** con opciones
- ✅ **Crea backup automático** antes de migrar
- ✅ **Migra datos** al nuevo sistema MySQL
- ✅ **Verifica migración** exitosa

**Ver**: `MIGRATION_GUIDE.md` para detalles completos

### 🛠️ Configuración Manual

Para instalación personalizada:

```bash
# 1. Crear base de datos
mysql -u root < database/jugeria_el_mesias.sql

# 2. Configurar conexión (backend/config/database.php)
$host = 'localhost';
$database = 'jugeria_el_mesias';
$username = 'root';
$password = '';

# 3. Probar API
http://localhost/jugeria-el-mesias/setup/test_api.php
```

### 🔐 Usuarios Demo Incluidos

```javascript
// Administrador
email: 'admin@elmesias.com'
password: 'password'

// Trabajador
email: 'vendedor@elmesias.com' 
password: 'password'

// Cliente
email: 'cliente@demo.com'
password: 'password'
```

---

## 📈 Métricas y Análisis

### KPIs Implementados
- **Ventas diarias/mensuales** con comparativas
- **Productos más vendidos** con gráficos de barras
- **Métodos de pago preferidos** con charts circulares
- **Rendimiento por vendedor** con métricas individuales
- **Análisis de clientes** con patrones de compra

### Reportes Disponibles
- **Reporte de ventas** por período
- **Análisis de productos** con ranking
- **Flujo de efectivo** con ingresos vs gastos
- **Rendimiento de equipo** por turnos
- **Análisis de clientela** con segmentación

---

## 🔮 Funcionalidades Futuras

### Próximas Implementaciones
- [ ] **Sistema de delivery** con seguimiento GPS
- [ ] **Programa de fidelidad** para clientes frecuentes
- [ ] **Integración con WhatsApp** para pedidos
- [ ] **Modo offline** con sincronización
- [ ] **App móvil nativa** para empleados
- [ ] **Integración con facturación** electrónica
- [ ] **Sistema de inventario** automático
- [ ] **Predicción de demanda** con IA

### Mejoras de UX
- [ ] **Modo oscuro** completo
- [ ] **Personalización** de temas
- [ ] **Notificaciones push** del navegador
- [ ] **Reconocimiento de voz** para pedidos
- [ ] **Cámara integrada** para fotos de productos

---

## 🤝 Soporte y Mantenimiento

### Contacto
- **Desarrollador**: Sistema creado con IA especializada
- **Soporte técnico**: Disponible para implementación
- **Actualizaciones**: Mejoras continuas disponibles

### Documentación Adicional
- **Manual de usuario** para empleados
- **Guía de administración** para gerentes
- **API documentation** para desarrolladores
- **Troubleshooting** común y soluciones

---

## 🔄 Estado Actual: Sistema Migrado a MySQL

### ✅ **MIGRACIÓN COMPLETADA** 

El sistema ha sido **exitosamente migrado** desde localStorage simulado a una **base de datos MySQL real** con XAMPP.

#### 📊 **Nuevas Características Post-Migración**

1. **🗄️ Base de Datos MySQL Persistente**
   - 8 tablas principales con relaciones optimizadas
   - Datos persistentes que no se pierden
   - Triggers automáticos y vistas predefinidas
   - Respaldo y restauración completa

2. **🔌 API REST Completa**
   - Endpoints PHP con validación robusta
   - CRUD operations para todas las entidades
   - Paginación, filtros y búsqueda avanzada
   - Manejo de errores profesional

3. **🚀 Instalación Automatizada**
   - Instalador guiado paso a paso
   - Verificación de requisitos automática
   - Test de API integrado
   - Migración automática de datos existentes

4. **🔐 Autenticación Real**
   - Contraseñas encriptadas con BCrypt
   - Sesiones seguras en MySQL
   - Sistema de roles mejorado

#### 📈 **Mejoras de Performance**

- ⚡ **Consultas optimizadas** con índices MySQL
- 📊 **Reportes en tiempo real** desde base de datos
- 🔄 **Sincronización automática** entre módulos
- 💾 **Backup automático** de datos críticos

#### 🛠️ **Para Desarrolladores**

```bash
# Endpoints principales disponibles
GET    /backend/api/tables/{tabla}           # Listar con paginación
POST   /backend/api/tables/{tabla}           # Crear registro  
PUT    /backend/api/tables/{tabla}/{id}      # Actualizar completo
PATCH  /backend/api/tables/{tabla}/{id}      # Actualizar parcial
DELETE /backend/api/tables/{tabla}/{id}      # Eliminar (soft delete)

# Ejemplos de uso
GET /backend/api/tables/productos?categoria=jugos&limit=20
POST /backend/api/tables/pedidos
PATCH /backend/api/tables/usuarios/123?campo=valor
```

---

## 📋 Próximos Pasos Recomendados

1. **✅ Cambiar contraseñas** por defecto después de instalación
2. **💾 Configurar backups** automáticos de MySQL
3. **🔒 Implementar HTTPS** en producción
4. **📊 Personalizar reportes** según necesidades específicas
5. **🔧 Optimizar configuración** de MySQL para mayor rendimiento

---

## 📞 Soporte Post-Migración

### 🆘 Resolución de Problemas Comunes

- **Base de datos no conecta**: Verificar XAMPP activo
- **API no responde**: Revisar `/setup/test_api.php`
- **Datos no aparecen**: Confirmar migración exitosa
- **Errores de permisos**: Verificar carpetas escribibles

### 📚 Documentación Adicional

- **`MIGRATION_GUIDE.md`** - Guía completa de migración
- **`/setup/install.php`** - Instalador automático con diagnósticos  
- **`/setup/test_api.php`** - Test completo de endpoints

---

## 📄 Licencia

Sistema desarrollado para uso comercial en Juguería El Mesías. 
Todos los derechos reservados.

---

**🎉 ¡Sistema MySQL completamente funcional y listo para producción!**

*Migración exitosa desde localStorage a MySQL con XAMPP - Todos los datos preservados y funcionalidades mejoradas.*