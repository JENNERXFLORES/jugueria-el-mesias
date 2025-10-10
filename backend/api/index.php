<?php
/**
 * API Router Principal - Juguería El Mesías
 * Compatible con el frontend existente
 * Maneja todas las rutas /tables/{tabla}
 */

// Headers para CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Manejar preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir configuración de base de datos
require_once __DIR__ . '/../config/database.php'; //

// Incluir controladores
require_once __DIR__ . '/controllers/UsuariosController.php'; //
require_once __DIR__ . '/controllers/ProductosController.php'; //
require_once __DIR__ . '/controllers/PedidosController.php'; //
require_once __DIR__ . '/controllers/VentasController.php'; //
require_once __DIR__ . '/controllers/GastosController.php'; //
require_once __DIR__ . '/controllers/PromocionesController.php'; //

// Función para manejar errores
function handleError($message, $code = 500, $details = null) {
    http_response_code($code);
    echo json_encode([
        'error' => true,
        'message' => $message,
        'details' => $details,
        'timestamp' => date('c')
    ]);
    exit;
}

// Función para enviar respuesta exitosa
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

try {
    // Obtener la URL y método
    $request_uri = $_SERVER['REQUEST_URI'];
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Remover parámetros GET de la URL
    $path = parse_url($request_uri, PHP_URL_PATH);
    
    // --- INICIO: Bloque de Normalización de Ruta Corregido ---
    
    // Obtener el path completo del script (ej: /jugueria-el-mesias/backend/api/index.php)
    $script_path = $_SERVER['SCRIPT_NAME']; 
    // Obtener el directorio del script (ej: /jugueria-el-mesias/backend/api)
    $script_dir = dirname($script_path); 

    // Remover la ruta de la carpeta de la API de la URL
    // Esto asegura que solo quede el endpoint (ej: /tables/productos)
    if (strpos($path, $script_dir) === 0) {
        $path = substr($path, strlen($script_dir));
    }
    
    // Limpiar cualquier slash inicial o final remanente
    $path = trim($path, '/');
    
    // --- FIN: Bloque de Normalización de Ruta Corregido ---
    
    // Debug: Log de la ruta procesada (solo en desarrollo)
    if (isset($_GET['debug'])) {
        error_log("DEBUG Router - Original URI: $request_uri");
        error_log("DEBUG Router - Script Dir: $script_dir");
        error_log("DEBUG Router - Processed Path: $path");
    }
    
    // Parsear la ruta
    $segments = explode('/', $path);
    $segments = array_filter($segments); // Remover elementos vacíos
    $segments = array_values($segments); // Re-indexar el array
    
    // Debug: Mostrar información de debug si se solicita
    if (isset($_GET['debug']) || isset($_GET['info'])) {
        sendResponse([
            'debug_info' => [
                'original_uri' => $request_uri,
                'script_name' => $_SERVER['SCRIPT_NAME'],
                'script_dir' => $script_dir,
                'processed_path' => $path,
                'segments' => $segments,
                'method' => $method,
                'timestamp' => date('c')
            ]
        ]);
    }
    
    // Verificar que sea una ruta de tabla válida
    if (count($segments) < 2 || $segments[0] !== 'tables') {
        handleError('Ruta no válida. Use /tables/{tabla}. Segments: ' . implode(', ', $segments), 404);
    }
    
    $table = $segments[1];
    $recordId = isset($segments[2]) ? $segments[2] : null;
    
    // Obtener parámetros
    $params = $_GET;
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    
    // Verificar conexión a base de datos
    $db = Database::getInstance();
    
    // Enrutador por tabla
    switch ($table) {
        case 'usuarios':
            $controller = new UsuariosController($db);
            break;
            
        case 'productos':
            $controller = new ProductosController($db);
            break;
            
        case 'pedidos':
            $controller = new PedidosController($db);
            break;
            
        case 'ventas':
            $controller = new VentasController($db);
            break;
            
        case 'gastos':
            $controller = new GastosController($db);
            break;
            
        case 'promociones':
            $controller = new PromocionesController($db);
            break;
            
        default:
            handleError("Tabla '$table' no encontrada", 404);
    }
    
    // Enrutador por método HTTP
    switch ($method) {
        case 'GET':
            if ($recordId) {
                // GET /tables/{tabla}/{id}
                $result = $controller->getById($recordId);
            } else {
                // GET /tables/{tabla}
                $result = $controller->getAll($params);
            }
            break;
            
        case 'POST':
            // POST /tables/{tabla}
            $result = $controller->create($body);
            break;
            
        case 'PUT':
            // PUT /tables/{tabla}/{id}
            if (!$recordId) {
                handleError('ID requerido para operación PUT', 400);
            }
            $result = $controller->update($recordId, $body);
            break;
            
        case 'PATCH':
            // PATCH /tables/{tabla}/{id}
            if (!$recordId) {
                handleError('ID requerido para operación PATCH', 400);
            }
            $result = $controller->patch($recordId, $body);
            break;
            
        case 'DELETE':
            // DELETE /tables/{tabla}/{id}
            if (!$recordId) {
                handleError('ID requerido para operación DELETE', 400);
            }
            $result = $controller->delete($recordId);
            break;
            
        default:
            handleError("Método HTTP '$method' no soportado", 405);
    }
    
    // Enviar respuesta
    sendResponse($result);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    handleError('Error de base de datos', 500, $e->getMessage());
    
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    handleError('Error interno del servidor', 500, $e->getMessage());
}
?>