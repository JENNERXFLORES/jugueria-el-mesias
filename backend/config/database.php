<?php
/**
 * Configuración de Base de Datos - Juguería El Mesías
 * Compatible con XAMPP/WAMP/LAMP
 */

class Database {
    private static $instance = null;
    private $connection;
    
    // Configuración de conexión
    private $host = 'localhost';
    private $database = 'jugeria_el_mesias';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Singleton pattern para una sola conexión
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Establecer conexión con MySQL
     */
    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE {$this->charset}_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
            // Log de conexión exitosa
            error_log("Database connected successfully to {$this->database}");
            
        } catch (PDOException $e) {
            // Log del error
            error_log("Database connection failed: " . $e->getMessage());
            
            // Respuesta JSON para el frontend
            http_response_code(500);
            echo json_encode([
                'error' => true,
                'message' => 'Error de conexión a la base de datos',
                'details' => $e->getMessage()
            ]);
            exit;
        }
    }
    
    /**
     * Obtener la conexión PDO
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Ejecutar una consulta SELECT
     */
    public function select($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Select query failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Ejecutar una consulta INSERT
     */
    public function insert($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("Insert query failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Ejecutar una consulta UPDATE
     */
    public function update($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Update query failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Ejecutar una consulta DELETE
     */
    public function delete($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Delete query failed: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Iniciar transacción
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Confirmar transacción
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Revertir transacción
     */
    public function rollback() {
        return $this->connection->rollback();
    }
    
    /**
     * Verificar si la base de datos existe y tiene las tablas necesarias
     */
    public function checkDatabaseStructure() {
        try {
            $tables = [
                'usuarios', 'productos', 'pedidos', 'pedido_productos', 
                'ventas', 'gastos', 'promociones', 'promocion_productos'
            ];
            
            $existingTables = [];
            
            foreach ($tables as $table) {
                $query = "SHOW TABLES LIKE :table_name";
                $result = $this->select($query, ['table_name' => $table]);
                
                if (count($result) > 0) {
                    $existingTables[] = $table;
                }
            }
            
            return [
                'required_tables' => $tables,
                'existing_tables' => $existingTables,
                'missing_tables' => array_diff($tables, $existingTables),
                'all_tables_exist' => count($existingTables) === count($tables)
            ];
            
        } catch (Exception $e) {
            error_log("Database structure check failed: " . $e->getMessage());
            return [
                'error' => true,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Generar UUID compatible con MySQL
     */
    public function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
    
    /**
     * Preparar datos para inserción con timestamps
     */
    public function prepareInsertData($data, $includeTimestamps = true) {
        if ($includeTimestamps) {
            $data['created_at'] = date('Y-m-d H:i:s');
            $data['updated_at'] = date('Y-m-d H:i:s');
        }
        
        return $data;
    }
    
    /**
     * Preparar datos para actualización con timestamp
     */
    public function prepareUpdateData($data) {
        $data['updated_at'] = date('Y-m-d H:i:s');
        return $data;
    }
    
    /**
     * Limpiar datos de entrada
     */
    public function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([$this, 'sanitizeInput'], $input);
        }
        
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validar email
     */
    public function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Hashear contraseña
     */
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    /**
     * Verificar contraseña
     */
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Obtener configuración del sistema
     */
    public function getConfig($key = null) {
        try {
            if ($key) {
                $query = "SELECT valor FROM configuracion WHERE clave = :key";
                $result = $this->select($query, ['key' => $key]);
                return $result ? $result[0]['valor'] : null;
            } else {
                $query = "SELECT clave, valor FROM configuracion";
                $result = $this->select($query);
                $config = [];
                foreach ($result as $row) {
                    $config[$row['clave']] = $row['valor'];
                }
                return $config;
            }
        } catch (Exception $e) {
            error_log("Config retrieval failed: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Establecer configuración del sistema
     */
    public function setConfig($key, $value, $description = null) {
        try {
            $query = "INSERT INTO configuracion (clave, valor, descripcion) 
                     VALUES (:key, :value, :description) 
                     ON DUPLICATE KEY UPDATE valor = :value2, descripcion = :description2";
            
            $params = [
                'key' => $key,
                'value' => $value,
                'description' => $description,
                'value2' => $value,
                'description2' => $description
            ];
            
            return $this->update($query, $params);
        } catch (Exception $e) {
            error_log("Config update failed: " . $e->getMessage());
            throw $e;
        }
    }
}

/**
 * Función helper para obtener la instancia de base de datos
 */
function getDB() {
    return Database::getInstance();
}

/**
 * Función helper para manejar errores de base de datos
 */
function handleDatabaseError($e, $context = 'Database operation') {
    error_log("{$context} failed: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Error en la operación de base de datos',
        'context' => $context,
        'details' => $e->getMessage()
    ]);
    exit;
}

/**
 * Función para verificar la conexión de base de datos
 */
function checkDatabaseConnection() {
    try {
        $db = Database::getInstance();
        $result = $db->select("SELECT 1 as test");
        
        return [
            'success' => true,
            'message' => 'Conexión exitosa',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Error de conexión: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}
?>