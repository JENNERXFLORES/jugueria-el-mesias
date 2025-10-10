<?php
/**
 * Script de Instalación - Juguería El Mesías
 * Este archivo instala automáticamente la base de datos y verifica la configuración
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers para evitar caché
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalación - Juguería El Mesías</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
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
        .header p {
            color: #666;
            font-size: 18px;
        }
        .step {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            background: #f8f9fa;
        }
        .step h3 {
            margin-top: 0;
            color: #333;
        }
        .status {
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        .button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
        }
        .button:hover {
            background: #5a6fd8;
        }
        .button.secondary {
            background: #6c757d;
        }
        .button.secondary:hover {
            background: #5a6268;
        }
        .code {
            background: #f1f3f4;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
            overflow-x: auto;
        }
        .progress {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🥤 Juguería El Mesías</h1>
            <p>Instalación del Sistema</p>
        </div>

        <?php
        $step = isset($_GET['step']) ? $_GET['step'] : 'check';
        $progress = 0;
        
        switch($step) {
            case 'check':
                $progress = 25;
                break;
            case 'install':
                $progress = 50;
                break;
            case 'verify':
                $progress = 75;
                break;
            case 'complete':
                $progress = 100;
                break;
        }
        ?>
        
        <div class="progress">
            <div class="progress-bar" style="width: <?php echo $progress; ?>%"></div>
        </div>

        <?php
        function checkRequirements() {
            $requirements = [
                'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0', '>='),
                'PDO Extension' => extension_loaded('pdo'),
                'PDO MySQL Extension' => extension_loaded('pdo_mysql'),
                'JSON Extension' => extension_loaded('json'),
                'OpenSSL Extension' => extension_loaded('openssl'),
                'Directory backend/ writable' => is_writable(__DIR__ . '/../backend/'),
                'Directory database/ readable' => is_readable(__DIR__ . '/../database/')
            ];
            
            return $requirements;
        }
        
        function testDatabaseConnection() {
            try {
                $host = 'localhost';
                $username = 'root';
                $password = '';
                
                $dsn = "mysql:host={$host};charset=utf8mb4";
                $pdo = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
                
                return ['success' => true, 'message' => 'Conexión exitosa'];
            } catch (PDOException $e) {
                return ['success' => false, 'message' => $e->getMessage()];
            }
        }
        
        function installDatabase() {
            try {
                // Leer el archivo SQL
                $sqlFile = __DIR__ . '/../database/jugeria_el_mesias.sql';
                if (!file_exists($sqlFile)) {
                    throw new Exception('Archivo SQL no encontrado: ' . $sqlFile);
                }
                
                $sql = file_get_contents($sqlFile);
                
                // Conectar a MySQL
                $host = 'localhost';
                $username = 'root';
                $password = '';
                
                $dsn = "mysql:host={$host};charset=utf8mb4";
                $pdo = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);
                
                // Ejecutar el script SQL
                $pdo->exec($sql);
                
                return ['success' => true, 'message' => 'Base de datos instalada correctamente'];
                
            } catch (Exception $e) {
                return ['success' => false, 'message' => $e->getMessage()];
            }
        }
        
        function verifyInstallation() {
            try {
                require_once __DIR__ . '/../backend/config/database.php';
                
                $db = Database::getInstance();
                $result = $db->checkDatabaseStructure();
                
                if ($result['all_tables_exist']) {
                    return ['success' => true, 'message' => 'Todas las tablas están presentes', 'details' => $result];
                } else {
                    return ['success' => false, 'message' => 'Faltan tablas: ' . implode(', ', $result['missing_tables']), 'details' => $result];
                }
                
            } catch (Exception $e) {
                return ['success' => false, 'message' => $e->getMessage()];
            }
        }
        
        // Procesar el paso actual
        switch($step) {
            case 'check':
                echo '<div class="step">';
                echo '<h3>Paso 1: Verificación de Requisitos</h3>';
                
                $requirements = checkRequirements();
                $allOk = true;
                
                foreach ($requirements as $req => $status) {
                    $class = $status ? 'success' : 'error';
                    $icon = $status ? '✅' : '❌';
                    echo "<div class='status {$class}'>{$icon} {$req}</div>";
                    
                    if (!$status) {
                        $allOk = false;
                    }
                }
                
                echo '<h4>Conexión a Base de Datos</h4>';
                $dbTest = testDatabaseConnection();
                $dbClass = $dbTest['success'] ? 'success' : 'error';
                $dbIcon = $dbTest['success'] ? '✅' : '❌';
                echo "<div class='status {$dbClass}'>{$dbIcon} {$dbTest['message']}</div>";
                
                if (!$dbTest['success']) {
                    $allOk = false;
                }
                
                if ($allOk) {
                    echo '<p><strong>✅ Todos los requisitos están cumplidos.</strong></p>';
                    echo '<a href="?step=install" class="button">Continuar Instalación</a>';
                } else {
                    echo '<p><strong>❌ Algunos requisitos no están cumplidos. Por favor, corrígelos antes de continuar.</strong></p>';
                    echo '<a href="?step=check" class="button secondary">Verificar Nuevamente</a>';
                }
                
                echo '</div>';
                break;
                
            case 'install':
                echo '<div class="step">';
                echo '<h3>Paso 2: Instalación de Base de Datos</h3>';
                
                $installation = installDatabase();
                $class = $installation['success'] ? 'success' : 'error';
                $icon = $installation['success'] ? '✅' : '❌';
                
                echo "<div class='status {$class}'>{$icon} {$installation['message']}</div>";
                
                if ($installation['success']) {
                    echo '<p>La base de datos ha sido instalada correctamente con:</p>';
                    echo '<ul>';
                    echo '<li>8 tablas principales (usuarios, productos, pedidos, ventas, etc.)</li>';
                    echo '<li>Datos de prueba incluidos</li>';
                    echo '<li>Vistas, triggers y procedimientos almacenados</li>';
                    echo '<li>Usuarios demo con contraseñas: <code>password</code></li>';
                    echo '</ul>';
                    
                    echo '<a href="?step=verify" class="button">Verificar Instalación</a>';
                } else {
                    echo '<a href="?step=install" class="button secondary">Intentar Nuevamente</a>';
                    echo '<a href="?step=check" class="button secondary">Volver a Verificación</a>';
                }
                
                echo '</div>';
                break;
                
            case 'verify':
                echo '<div class="step">';
                echo '<h3>Paso 3: Verificación de Instalación</h3>';
                
                $verification = verifyInstallation();
                $class = $verification['success'] ? 'success' : 'error';
                $icon = $verification['success'] ? '✅' : '❌';
                
                echo "<div class='status {$class}'>{$icon} {$verification['message']}</div>";
                
                if (isset($verification['details'])) {
                    echo '<h4>Detalles de las Tablas:</h4>';
                    echo '<p><strong>Tablas encontradas:</strong> ' . implode(', ', $verification['details']['existing_tables']) . '</p>';
                    
                    if (!empty($verification['details']['missing_tables'])) {
                        echo '<p><strong>Tablas faltantes:</strong> ' . implode(', ', $verification['details']['missing_tables']) . '</p>';
                    }
                }
                
                if ($verification['success']) {
                    echo '<a href="?step=complete" class="button">Completar Instalación</a>';
                } else {
                    echo '<a href="?step=install" class="button secondary">Reinstalar Base de Datos</a>';
                }
                
                echo '</div>';
                break;
                
            case 'complete':
                echo '<div class="step">';
                echo '<h3>🎉 Instalación Completada</h3>';
                
                echo '<div class="status success">✅ ¡El sistema ha sido instalado exitosamente!</div>';
                
                echo '<h4>Información Importante:</h4>';
                echo '<ul>';
                echo '<li><strong>Base de Datos:</strong> jugeria_el_mesias</li>';
                echo '<li><strong>Usuarios Demo:</strong></li>';
                echo '<ul>';
                echo '<li>Admin: admin@elmesias.com / password</li>';
                echo '<li>Trabajador: vendedor@elmesias.com / password</li>';
                echo '<li>Cliente: cliente@demo.com / password</li>';
                echo '</ul>';
                echo '<li><strong>API Base:</strong> /backend/api/</li>';
                echo '<li><strong>Documentación:</strong> Ver README.md</li>';
                echo '</ul>';
                
                echo '<h4>Próximos Pasos:</h4>';
                echo '<ol>';
                echo '<li>Eliminar este archivo de instalación por seguridad</li>';
                echo '<li>Cambiar las contraseñas por defecto</li>';
                echo '<li>Configurar el entorno de producción</li>';
                echo '<li>Realizar backup inicial de la base de datos</li>';
                echo '</ol>';
                
                echo '<div class="code">';
                echo 'rm ' . __FILE__ . '<br>';
                echo 'mysqldump -u root jugeria_el_mesias > backup_inicial.sql';
                echo '</div>';
                
                echo '<a href="../index.html" class="button">Ir al Sistema</a>';
                echo '<a href="test_api.php" class="button secondary">Probar API</a>';
                
                echo '</div>';
                break;
        }
        ?>
        
        <div class="step">
            <h3>ℹ️ Información del Sistema</h3>
            <p><strong>Versión PHP:</strong> <?php echo PHP_VERSION; ?></p>
            <p><strong>Servidor Web:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Desconocido'; ?></p>
            <p><strong>Ruta del Proyecto:</strong> <?php echo realpath(__DIR__ . '/..'); ?></p>
            <p><strong>Fecha de Instalación:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
        </div>
    </div>
</body>
</html>