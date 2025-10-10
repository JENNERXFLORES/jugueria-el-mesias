/**
 * Configuración de Entorno - Juguería El Mesías
 * Este archivo permite cambiar fácilmente entre diferentes entornos
 */

// Detectar entorno automáticamente
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Detectar ruta base del proyecto automáticamente
function detectBasePath() {
    const currentPath = window.location.pathname;
    
    // Si estamos en una subcarpeta de XAMPP (ej: /jugueria-el-mesias/)
    if (currentPath.includes('/') && currentPath !== '/') {
        // Obtener la primera parte de la ruta como base
        const pathParts = currentPath.split('/').filter(part => part.length > 0);
        if (pathParts.length > 0) {
            // Si el primer segmento parece ser el nombre del proyecto
            const projectFolder = pathParts[0];
            if (projectFolder && !projectFolder.includes('.')) {
                return `/${projectFolder}/`;
            }
        }
    }
    
    return '/'; // Ruta raíz por defecto
}

const BASE_PATH = detectBasePath();

// Configuraciones por entorno
const CONFIG = {
    // Configuración para desarrollo local (XAMPP)
    development: {
        API_BASE_URL: `${BASE_PATH}backend/api/`.replace('//', '/'),
        DEBUG: true,
        USE_MYSQL: true,
        MOCK_API: false
    },
    
    // Configuración para producción
    production: {
        API_BASE_URL: `${BASE_PATH}backend/api/`.replace('//', '/'),
        DEBUG: false,
        USE_MYSQL: true,
        MOCK_API: false
    },
    
    // Configuración para pruebas (usar localStorage simulado)
    testing: {
        API_BASE_URL: '',
        DEBUG: true,
        USE_MYSQL: false,
        MOCK_API: true
    }
};

// Seleccionar configuración actual
const CURRENT_ENV = isLocalhost ? 'development' : 'production';
const APP_CONFIG = CONFIG[CURRENT_ENV];

// Función para cambiar configuración manualmente
function setEnvironment(env) {
    if (CONFIG[env]) {
        Object.assign(APP_CONFIG, CONFIG[env]);
        console.log(`Entorno cambiado a: ${env}`, APP_CONFIG);
        
        // Guardar en localStorage para persistir la selección
        localStorage.setItem('elMesias_environment', env);
        
        // Recargar la página para aplicar cambios
        if (confirm('¿Recargar la página para aplicar la nueva configuración?')) {
            window.location.reload();
        }
    }
}

// Restaurar entorno guardado
const savedEnvironment = localStorage.getItem('elMesias_environment');
if (savedEnvironment && CONFIG[savedEnvironment]) {
    Object.assign(APP_CONFIG, CONFIG[savedEnvironment]);
}

// Log de configuración actual (solo en desarrollo)
if (APP_CONFIG.DEBUG) {
    console.log('🔧 Configuración actual:', {
        entorno: CURRENT_ENV,
        ruta_detectada: BASE_PATH,
        config: APP_CONFIG,
        url_completa_api: window.location.origin + APP_CONFIG.API_BASE_URL,
        pathname_actual: window.location.pathname
    });
}

// Función helper para hacer requests con la configuración actual
function getApiUrl(endpoint) {
    // Asegurar que el endpoint no empiece con /
    endpoint = endpoint.replace(/^\/+/, '');
    
    // Construir URL completa
    let apiUrl = APP_CONFIG.API_BASE_URL + endpoint;
    
    // Limpiar dobles barras
    apiUrl = apiUrl.replace(/\/+/g, '/');
    
    // Si no es una URL absoluta, hacerla relativa al origin
    if (!apiUrl.startsWith('http')) {
        if (!apiUrl.startsWith('/')) {
            apiUrl = '/' + apiUrl;
        }
    }
    
    return apiUrl;
}

// Función para verificar si estamos usando MySQL
function isUsingMySQL() {
    return APP_CONFIG.USE_MYSQL;
}

// Función para verificar si estamos en modo debug
function isDebugMode() {
    return APP_CONFIG.DEBUG;
}

// Exportar configuración para uso global
window.APP_CONFIG = APP_CONFIG;
window.setEnvironment = setEnvironment;
window.getApiUrl = getApiUrl;
window.isUsingMySQL = isUsingMySQL;
window.isDebugMode = isDebugMode;