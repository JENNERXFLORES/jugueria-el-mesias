# 🔄 Guía de Migración a MySQL - Juguería El Mesías

## 📋 Resumen de la Migración

Esta guía te ayudará a migrar tu sistema de **Juguería El Mesías** desde el almacenamiento local simulado (localStorage) a una **base de datos MySQL real** usando XAMPP, **sin romper la estructura actual del proyecto**.

## ✨ Características de la Nueva Versión

- ✅ **Base de datos MySQL persistente** (no se pierde al cerrar el navegador)
- ✅ **API REST completa** con endpoints PHP
- ✅ **Compatibilidad total** con el frontend existente
- ✅ **Migración automática** de datos existentes
- ✅ **Sistema de usuarios mejorado** con autenticación real
- ✅ **Respaldo automático** antes de migrar
- ✅ **Instalación guiada** paso a paso

---

## 🚀 Instalación Paso a Paso

### Paso 1: Preparar XAMPP

1. **Descargar e instalar XAMPP** desde https://www.apachefriends.org/
2. **Iniciar servicios**:
   - Abrir XAMPP Control Panel
   - Iniciar **Apache**
   - Iniciar **MySQL**

### Paso 2: Instalar el Sistema

1. **Copiar archivos** del proyecto a la carpeta de XAMPP:
   ```
   C:\xampp\htdocs\jugeria-el-mesias\
   ```

2. **Abrir el instalador** en tu navegador:
   ```
   http://localhost/jugeria-el-mesias/setup/install.php
   ```

3. **Seguir el asistente de instalación**:
   - ✅ Verificación de requisitos
   - 🗄️ Instalación de base de datos
   - 🔍 Verificación del sistema
   - 🎉 Instalación completada

### Paso 3: Probar la API

1. **Ejecutar test de API**:
   ```
   http://localhost/jugeria-el-mesias/setup/test_api.php
   ```

2. **Verificar endpoints** principales:
   - GET `/backend/api/tables/productos`
   - GET `/backend/api/tables/usuarios`
   - GET `/backend/api/tables/pedidos`
   - GET `/backend/api/tables/ventas`
   - GET `/backend/api/tables/gastos`

### Paso 4: Acceder al Sistema

1. **Abrir aplicación**:
   ```
   http://localhost/jugeria-el-mesias/
   ```

2. **Usuarios demo** incluidos:
   - **Admin**: admin@elmesias.com / password
   - **Trabajador**: vendedor@elmesias.com / password
   - **Cliente**: cliente@demo.com / password

---

## 🔄 Migración de Datos Existentes

### Migración Automática

Si tienes datos en localStorage, el sistema los detectará automáticamente y mostrará un modal de migración:

1. **Detectar datos locales** al cargar la página
2. **Mostrar resumen** de datos encontrados
3. **Crear backup** antes de migrar (recomendado)
4. **Migrar automáticamente** a MySQL
5. **Verificar migración** exitosa
6. **Limpiar localStorage** (opcional)

### Migración Manual

Si necesitas migrar datos manualmente:

```javascript
// Abrir consola del navegador (F12)
const migration = new DataMigration();

// Verificar datos locales
console.log('Datos locales:', migration.getLocalData());

// Crear backup
migration.createLocalStorageBackup();

// Migrar a MySQL
migration.migrateToMySQL((progress, text) => {
    console.log(`${progress}%: ${text}`);
}).then(result => {
    console.log('Migración completada:', result);
});
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

1. **usuarios** - Sistema de usuarios con autenticación
2. **productos** - Catálogo de productos y precios
3. **pedidos** - Gestión completa de pedidos
4. **pedido_productos** - Detalle de productos por pedido
5. **ventas** - Registro de ventas realizadas
6. **gastos** - Control de gastos y expenses
7. **promociones** - Sistema de promociones y descuentos
8. **configuracion** - Configuraciones del sistema

### Características Avanzadas

- **UUIDs** como claves primarias
- **Timestamps** automáticos (created_at, updated_at)
- **Soft deletes** con campo `activo`
- **Índices optimizados** para consultas rápidas
- **Triggers automáticos** para fechas de entrega
- **Vistas predefinidas** para reportes
- **Procedimientos almacenados** para estadísticas

---

## 🔧 Configuración Avanzada

### Cambiar Entorno

```javascript
// Cambiar a modo de prueba (localStorage)
setEnvironment('testing');

// Cambiar a modo desarrollo (MySQL local)
setEnvironment('development');

// Cambiar a modo producción (MySQL producción)
setEnvironment('production');
```

### Configurar Base de Datos

Editar `backend/config/database.php`:

```php
private $host = 'localhost';        // Servidor MySQL
private $database = 'jugeria_el_mesias';  // Nombre DB
private $username = 'root';         // Usuario MySQL
private $password = '';             // Contraseña MySQL
```

### Habilitar Debug

```javascript
// En la consola del navegador
window.APP_CONFIG.DEBUG = true;

// O cambiar a entorno de desarrollo
setEnvironment('development');
```

---

## 🛡️ Seguridad

### Contraseñas

- **Encriptación BCrypt** para passwords
- **Validación** en backend y frontend
- **Usuarios demo** con contraseña temporal: `password`

### API Security

- **Validación de datos** en todos los endpoints
- **Sanitización** de inputs SQL
- **Headers CORS** configurados
- **Manejo de errores** sin exposer información sensible

### Backup y Restauración

```bash
# Crear backup
mysqldump -u root jugeria_el_mesias > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root jugeria_el_mesias < backup_20241207.sql
```

---

## 📊 Endpoints de API

### Estructura General

```
GET    /backend/api/tables/{tabla}           # Listar registros
POST   /backend/api/tables/{tabla}           # Crear registro
GET    /backend/api/tables/{tabla}/{id}      # Obtener registro
PUT    /backend/api/tables/{tabla}/{id}      # Actualizar completo
PATCH  /backend/api/tables/{tabla}/{id}      # Actualizar parcial
DELETE /backend/api/tables/{tabla}/{id}      # Eliminar registro
```

### Parámetros de Consulta

```javascript
// Paginación
GET /tables/productos?page=1&limit=20

// Búsqueda
GET /tables/productos?search=jugo

// Filtros
GET /tables/productos?categoria=jugos&disponible=true

// Ordenamiento
GET /tables/productos?sort=precio&order=DESC
```

### Ejemplo de Respuesta

```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "pages": 8,
  "table": "productos",
  "schema": {...}
}
```

---

## 🚨 Resolución de Problemas

### Error: "Base de datos no encontrada"

```bash
# Reinstalar base de datos
http://localhost/jugeria-el-mesias/setup/install.php?step=install
```

### Error: "API no responde"

1. Verificar que **Apache** y **MySQL** estén activos en XAMPP
2. Verificar la URL: `http://localhost/jugeria-el-mesias/backend/api/tables/productos`
3. Revisar logs en consola del navegador (F12)

### Error: "Conexión rechazada"

```php
// Verificar configuración en backend/config/database.php
private $host = 'localhost';     // ¿Es correcto?
private $username = 'root';      // ¿Usuario existe?
private $password = '';          // ¿Contraseña correcta?
```

### Datos no aparecen después de migración

1. Abrir consola del navegador (F12)
2. Verificar que `isUsingMySQL()` retorne `true`
3. Probar endpoint directamente: `/backend/api/tables/productos`
4. Verificar en phpMyAdmin que los datos estén en la BD

### Resetear sistema completo

```bash
# Eliminar base de datos
mysql -u root -e "DROP DATABASE IF EXISTS jugeria_el_mesias;"

# Reinstalar
http://localhost/jugeria-el-mesias/setup/install.php
```

---

## 🔄 Rollback (Volver atrás)

Si necesitas volver al sistema anterior (localStorage):

```javascript
// Cambiar configuración
setEnvironment('testing');

// Restaurar datos desde backup
// (si guardaste el backup JSON antes de migrar)
```

---

## 📈 Próximos Pasos

### Después de la Migración

1. ✅ **Cambiar contraseñas** por defecto
2. ✅ **Eliminar archivos** de instalación por seguridad
3. ✅ **Crear backup** inicial de la base de datos
4. ✅ **Configurar entorno** de producción si necesario

### Recomendaciones de Producción

- 🔒 Usar **HTTPS** en producción
- 🛡️ **Firewall** y restricciones IP
- 📊 **Monitoreo** de performance
- 💾 **Backups automáticos** diarios
- 🔐 **Contraseñas seguras** para MySQL

---

## 📞 Soporte

Si tienes problemas con la migración:

1. **Revisar logs** en consola del navegador (F12)
2. **Probar API** con `/setup/test_api.php`
3. **Verificar configuración** de XAMPP
4. **Crear backup** antes de cualquier cambio importante

---

## ✅ Checklist de Migración Exitosa

- [ ] XAMPP instalado y funcionando
- [ ] Base de datos creada exitosamente
- [ ] API responde en `/backend/api/tables/productos`
- [ ] Frontend carga sin errores
- [ ] Login funciona con usuarios demo
- [ ] Datos migrados correctamente (si aplicable)
- [ ] Backup creado por seguridad
- [ ] Contraseñas cambiadas por defecto

¡Tu sistema **Juguería El Mesías** ahora usa una base de datos MySQL real! 🎉