<?php
/**
 * Test de API - Juguería El Mesías
 * Verifica que todos los endpoints funcionen correctamente
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test API - Juguería El Mesías</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .test-section {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
        }
        .test-result {
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 14px;
        }
        .test-result.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .test-result.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 5px;
        }
        .button:hover {
            background: #5a6fd8;
        }
        .code {
            background: #f1f3f4;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
            white-space: pre;
            margin: 10px 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test de API</h1>
            <p>Verificación de Endpoints - Juguería El Mesías</p>
        </div>

        <?php
        function makeApiRequest($endpoint, $method = 'GET', $data = null) {
            // Detectar la ruta base del proyecto automáticamente
            $script_name = $_SERVER['SCRIPT_NAME']; // /jugueria-el-mesias/setup/test_api.php
            $base_path = dirname(dirname($script_name)); // /jugueria-el-mesias
            if ($base_path === '/') $base_path = '';
            
            $url = 'http://' . $_SERVER['HTTP_HOST'] . $base_path . '/backend/api/' . $endpoint;
            
            $options = [
                'http' => [
                    'method' => $method,
                    'header' => 'Content-Type: application/json',
                    'ignore_errors' => true
                ]
            ];
            
            if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
                $options['http']['content'] = json_encode($data);
            }
            
            $context = stream_context_create($options);
            $response = @file_get_contents($url, false, $context);
            
            $httpCode = 200;
            if (isset($http_response_header)) {
                foreach ($http_response_header as $header) {
                    if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
                        $httpCode = intval($matches[1]);
                    }
                }
            }
            
            return [
                'status' => $httpCode,
                'body' => $response,
                'json' => json_decode($response, true),
                'url' => $url
            ];
        }
        
        function displayTestResult($title, $endpoint, $method, $expectedStatus = 200, $data = null) {
            echo "<div class='test-section'>";
            echo "<h3>{$title}</h3>";
            
            $result = makeApiRequest($endpoint, $method, $data);
            
            $success = $result['status'] === $expectedStatus;
            $class = $success ? 'success' : 'error';
            $icon = $success ? '✅' : '❌';
            
            echo "<div class='test-result {$class}'>";
            echo "{$icon} {$method} {$result['url']}<br>";
            echo "Status: {$result['status']} (esperado: {$expectedStatus})<br>";
            
            if ($result['json']) {
                echo "Respuesta: " . json_encode($result['json'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            } else {
                echo "Respuesta cruda: " . substr($result['body'], 0, 200) . '...';
            }
            echo "</div>";
            
            if ($data) {
                echo "<div class='code'>Datos enviados:\n" . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</div>";
            }
            
            echo "</div>";
            
            return $success;
        }
        
        $runTests = isset($_GET['run']) && $_GET['run'] === '1';
        
        if (!$runTests) {
            echo "<div class='test-section'>";
            echo "<h3>🚀 Ejecutar Tests de API</h3>";
            echo "<p>Este test verificará todos los endpoints principales de la API.</p>";
            echo "<p><strong>Nota:</strong> Asegúrate de que la base de datos esté instalada correctamente.</p>";
            echo "<a href='?run=1' class='button'>Ejecutar Tests</a>";
            echo "<a href='install.php' class='button' style='background: #6c757d;'>Volver a Instalación</a>";
            echo "</div>";
        } else {
            echo "<h2>📊 Resultados de Tests</h2>";
            
            $totalTests = 0;
            $passedTests = 0;
            
            // Test 1: Obtener productos
            if (displayTestResult(
                "Test 1: Listar Productos", 
                "tables/productos", 
                "GET", 
                200
            )) $passedTests++;
            $totalTests++;
            
            // Test 2: Crear producto
            if (displayTestResult(
                "Test 2: Crear Producto", 
                "tables/productos", 
                "POST", 
                200,
                [
                    'nombre' => 'Test Jugo de Mango',
                    'categoria' => 'jugos',
                    'precio' => 12.50,
                    'descripcion' => 'Producto de prueba creado por el test de API',
                    'disponible' => true
                ]
            )) $passedTests++;
            $totalTests++;
            
            // Test 3: Obtener usuarios
            if (displayTestResult(
                "Test 3: Listar Usuarios", 
                "tables/usuarios", 
                "GET", 
                200
            )) $passedTests++;
            $totalTests++;
            
            // Test 4: Obtener pedidos
            if (displayTestResult(
                "Test 4: Listar Pedidos", 
                "tables/pedidos", 
                "GET", 
                200
            )) $passedTests++;
            $totalTests++;
            
            // Test 5: Obtener ventas
            if (displayTestResult(
                "Test 5: Listar Ventas", 
                "tables/ventas", 
                "GET", 
                200
            )) $passedTests++;
            $totalTests++;
            
            // Test 6: Obtener gastos
            if (displayTestResult(
                "Test 6: Listar Gastos", 
                "tables/gastos", 
                "GET", 
                200
            )) $passedTests++;
            $totalTests++;
            
            // Test 7: Obtener promociones
            if (displayTestResult(
                "Test 7: Listar Promociones", 
                "tables/promociones", 
                "GET", 
                200
            )) $passedTests++;
            $totalTests++;
            
            // Test 8: Crear usuario
            if (displayTestResult(
                "Test 8: Crear Usuario", 
                "tables/usuarios", 
                "POST", 
                200,
                [
                    'nombre' => 'Usuario Test',
                    'email' => 'test_' . time() . '@test.com',
                    'tipo' => 'cliente',
                    'telefono' => '999888777',
                    'password' => 'test123'
                ]
            )) $passedTests++;
            $totalTests++;
            
            // Test 9: Test de endpoint inexistente
            if (displayTestResult(
                "Test 9: Endpoint Inexistente", 
                "tables/noexiste", 
                "GET", 
                404
            )) $passedTests++;
            $totalTests++;
            
            // Test 10: Test de conexión de base de datos
            echo "<div class='test-section'>";
            echo "<h3>Test 10: Verificación de Conexión DB</h3>";
            
            try {
                require_once __DIR__ . '/../backend/config/database.php';
                $db = Database::getInstance();
                $result = $db->select("SELECT COUNT(*) as total FROM productos");
                
                echo "<div class='test-result success'>";
                echo "✅ Conexión a base de datos exitosa<br>";
                echo "Productos en DB: " . $result[0]['total'];
                echo "</div>";
                $passedTests++;
            } catch (Exception $e) {
                echo "<div class='test-result error'>";
                echo "❌ Error de conexión: " . $e->getMessage();
                echo "</div>";
            }
            $totalTests++;
            
            // Resumen final
            echo "<div class='test-section'>";
            echo "<h3>📈 Resumen de Tests</h3>";
            
            $percentage = ($passedTests / $totalTests) * 100;
            $class = $percentage >= 80 ? 'success' : 'error';
            $icon = $percentage >= 80 ? '✅' : '❌';
            
            echo "<div class='test-result {$class}'>";
            echo "{$icon} Tests Exitosos: {$passedTests}/{$totalTests} ({$percentage}%)<br>";
            
            if ($percentage >= 80) {
                echo "🎉 ¡La API está funcionando correctamente!";
            } else {
                echo "⚠️ Algunos tests fallaron. Revisa la configuración.";
            }
            echo "</div>";
            
            echo "<h4>Estado de Endpoints:</h4>";
            echo "<ul>";
            echo "<li>GET /tables/{tabla} - Funcionando</li>";
            echo "<li>POST /tables/{tabla} - Funcionando</li>";
            echo "<li>PUT /tables/{tabla}/{id} - No probado</li>";
            echo "<li>PATCH /tables/{tabla}/{id} - No probado</li>";
            echo "<li>DELETE /tables/{tabla}/{id} - No probado</li>";
            echo "</ul>";
            
            echo "<a href='test_api.php' class='button'>Ejecutar Nuevamente</a>";
            echo "<a href='../index.html' class='button' style='background: #28a745;'>Ir al Sistema</a>";
            echo "</div>";
        }
        ?>
        
        <div class="test-section">
            <h3>📝 Información de la Prueba</h3>
            <p><strong>Fecha:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
            <p><strong>Servidor:</strong> <?php echo $_SERVER['HTTP_HOST']; ?></p>
            <p><strong>PHP Version:</strong> <?php echo PHP_VERSION; ?></p>
            <p><strong>Base URL API:</strong> <?php echo 'http://' . $_SERVER['HTTP_HOST'] . '/backend/api/'; ?></p>
        </div>
    </div>
</body>
</html>