<?php
/**
 * Controlador de Usuarios - Juguería El Mesías
 */

require_once 'BaseController.php';

class UsuariosController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
        $this->table = 'usuarios';
    }
    
    protected function validateData($data, $operation) {
        $errors = [];
        
        if ($operation === 'create' || $operation === 'update') {
            
            // Nombre es requerido
            if (empty($data['nombre'])) {
                $errors[] = 'El nombre es requerido';
            } elseif (strlen($data['nombre']) > 255) {
                $errors[] = 'El nombre no puede exceder 255 caracteres';
            }
            
            // Email es requerido y debe ser válido
            if (empty($data['email'])) {
                $errors[] = 'El email es requerido';
            } elseif (!$this->db->isValidEmail($data['email'])) {
                $errors[] = 'El formato del email no es válido';
            } elseif (strlen($data['email']) > 255) {
                $errors[] = 'El email no puede exceder 255 caracteres';
            }
            
            // Verificar email único (solo en creación o si el email cambió)
            if ($operation === 'create' || (isset($data['email']))) {
                $existingUser = $this->getUserByEmail($data['email']);
                if ($existingUser && ($operation === 'create' || $existingUser['id'] !== $data['id'])) {
                    $errors[] = 'Ya existe un usuario con este email';
                }
            }
            
            // Tipo debe ser válido
            $tipos_validos = ['cliente', 'trabajador', 'admin'];
            if (isset($data['tipo']) && !in_array($data['tipo'], $tipos_validos)) {
                $errors[] = 'Tipo de usuario inválido. Debe ser: ' . implode(', ', $tipos_validos);
            }
            
            // Validar teléfono si está presente
            if (isset($data['telefono']) && !empty($data['telefono'])) {
                if (strlen($data['telefono']) > 20) {
                    $errors[] = 'El teléfono no puede exceder 20 caracteres';
                }
            }
            
            // Validar contraseña en creación
            if ($operation === 'create' && isset($data['password'])) {
                if (strlen($data['password']) < 6) {
                    $errors[] = 'La contraseña debe tener al menos 6 caracteres';
                } elseif (strlen($data['password']) > 255) {
                    $errors[] = 'La contraseña es demasiado larga';
                }
            }
        }
        
        if (!empty($errors)) {
            throw new Exception('Errores de validación: ' . implode(', ', $errors));
        }
    }
    
    protected function beforeCreate($data) {
        $data = parent::beforeCreate($data);
        
        // Establecer valores por defecto
        $data['tipo'] = $data['tipo'] ?? 'cliente';
        $data['activo'] = isset($data['activo']) ? (bool)$data['activo'] : true;
        
        // Hashear contraseña si está presente
        if (isset($data['password'])) {
            $data['password_hash'] = $this->db->hashPassword($data['password']);
            unset($data['password']); // No almacenar la contraseña en texto plano
        }
        
        return $data;
    }
    
    protected function beforeUpdate($data, $existing) {
        $data = parent::beforeUpdate($data, $existing);
        
        // Hashear contraseña si está presente
        if (isset($data['password'])) {
            $data['password_hash'] = $this->db->hashPassword($data['password']);
            unset($data['password']);
        }
        
        return $data;
    }
    
    protected function getSearchableFields() {
        return ['nombre', 'email', 'telefono'];
    }
    
    protected function getCustomWhereConditions($params) {
        $conditions = [];
        
        // Filtrar por tipo
        if (isset($params['tipo']) && !empty($params['tipo'])) {
            $conditions[] = 'tipo = :tipo';
        }
        
        // Filtrar por estado activo
        if (isset($params['activo'])) {
            $conditions[] = 'activo = :activo';
        }
        
        // Filtrar por fecha de registro
        if (isset($params['fecha_desde'])) {
            $conditions[] = 'DATE(fecha_registro) >= :fecha_desde';
        }
        
        if (isset($params['fecha_hasta'])) {
            $conditions[] = 'DATE(fecha_registro) <= :fecha_hasta';
        }
        
        return $conditions;
    }
    
    protected function getCustomWhereParams($params) {
        $whereParams = [];
        
        if (isset($params['tipo']) && !empty($params['tipo'])) {
            $whereParams['tipo'] = $params['tipo'];
        }
        
        if (isset($params['activo'])) {
            $whereParams['activo'] = filter_var($params['activo'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }
        
        if (isset($params['fecha_desde'])) {
            $whereParams['fecha_desde'] = $params['fecha_desde'];
        }
        
        if (isset($params['fecha_hasta'])) {
            $whereParams['fecha_hasta'] = $params['fecha_hasta'];
        }
        
        return $whereParams;
    }
    
    protected function afterGet($data) {
        // Remover campos sensibles y convertir valores
        foreach ($data as &$user) {
            unset($user['password_hash']); // Nunca enviar el hash de contraseña
            $user['activo'] = (bool)$user['activo'];
        }
        
        return $data;
    }
    
    /**
     * Obtener usuario por email
     */
    public function getUserByEmail($email) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE email = :email";
            $result = $this->db->select($query, ['email' => $email]);
            
            if (empty($result)) {
                return null;
            }
            
            return $result[0];
            
        } catch (Exception $e) {
            throw new Exception("Error al buscar usuario por email: " . $e->getMessage());
        }
    }
    
    /**
     * Autenticar usuario
     */
    public function authenticate($email, $password) {
        try {
            $user = $this->getUserByEmail($email);
            
            if (!$user) {
                throw new Exception("Usuario no encontrado");
            }
            
            if (!$user['activo']) {
                throw new Exception("Usuario inactivo");
            }
            
            if (!$this->db->verifyPassword($password, $user['password_hash'])) {
                throw new Exception("Contraseña incorrecta");
            }
            
            // Remover información sensible
            unset($user['password_hash']);
            
            // Actualizar última actividad (opcional)
            $this->updateLastActivity($user['id']);
            
            return $user;
            
        } catch (Exception $e) {
            throw new Exception("Error de autenticación: " . $e->getMessage());
        }
    }
    
    /**
     * Cambiar contraseña
     */
    public function changePassword($id, $currentPassword, $newPassword) {
        try {
            $user = $this->getById($id);
            
            // Obtener el hash actual (necesitamos hacer una consulta especial)
            $query = "SELECT password_hash FROM {$this->table} WHERE id = :id";
            $result = $this->db->select($query, ['id' => $id]);
            
            if (empty($result)) {
                throw new Exception("Usuario no encontrado");
            }
            
            $currentHash = $result[0]['password_hash'];
            
            // Verificar contraseña actual
            if (!$this->db->verifyPassword($currentPassword, $currentHash)) {
                throw new Exception("Contraseña actual incorrecta");
            }
            
            // Validar nueva contraseña
            if (strlen($newPassword) < 6) {
                throw new Exception("La nueva contraseña debe tener al menos 6 caracteres");
            }
            
            // Actualizar contraseña
            $newHash = $this->db->hashPassword($newPassword);
            $query = "UPDATE {$this->table} SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id";
            
            $this->db->update($query, [
                'id' => $id,
                'password_hash' => $newHash
            ]);
            
            return [
                'message' => 'Contraseña actualizada exitosamente',
                'user_id' => $id
            ];
            
        } catch (Exception $e) {
            throw new Exception("Error al cambiar contraseña: " . $e->getMessage());
        }
    }
    
    /**
     * Restablecer contraseña (generar nueva)
     */
    public function resetPassword($email) {
        try {
            $user = $this->getUserByEmail($email);
            
            if (!$user) {
                throw new Exception("Usuario no encontrado");
            }
            
            // Generar nueva contraseña temporal
            $newPassword = $this->generateRandomPassword();
            $newHash = $this->db->hashPassword($newPassword);
            
            // Actualizar contraseña
            $query = "UPDATE {$this->table} SET password_hash = :password_hash, updated_at = NOW() WHERE id = :id";
            
            $this->db->update($query, [
                'id' => $user['id'],
                'password_hash' => $newHash
            ]);
            
            return [
                'message' => 'Contraseña restablecida exitosamente',
                'new_password' => $newPassword, // En producción, esto se enviaría por email
                'user_id' => $user['id'],
                'email' => $user['email']
            ];
            
        } catch (Exception $e) {
            throw new Exception("Error al restablecer contraseña: " . $e->getMessage());
        }
    }
    
    /**
     * Activar/desactivar usuario
     */
    public function toggleActive($id) {
        try {
            $user = $this->getById($id);
            $newStatus = !$user['activo'];
            
            $query = "UPDATE {$this->table} SET activo = :activo, updated_at = NOW() WHERE id = :id";
            
            $this->db->update($query, [
                'id' => $id,
                'activo' => $newStatus ? 1 : 0
            ]);
            
            return $this->getById($id);
            
        } catch (Exception $e) {
            throw new Exception("Error al cambiar estado del usuario: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener usuarios por tipo
     */
    public function getByType($tipo) {
        try {
            $tipos_validos = ['cliente', 'trabajador', 'admin'];
            
            if (!in_array($tipo, $tipos_validos)) {
                throw new Exception('Tipo de usuario inválido');
            }
            
            $query = "SELECT * FROM {$this->table} WHERE tipo = :tipo AND activo = 1 ORDER BY nombre ASC";
            $data = $this->db->select($query, ['tipo' => $tipo]);
            
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener usuarios por tipo: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener estadísticas de usuarios
     */
    public function getStats() {
        try {
            $query = "SELECT 
                        COUNT(*) as total_usuarios,
                        COUNT(CASE WHEN tipo = 'cliente' THEN 1 END) as clientes,
                        COUNT(CASE WHEN tipo = 'trabajador' THEN 1 END) as trabajadores,
                        COUNT(CASE WHEN tipo = 'admin' THEN 1 END) as administradores,
                        COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
                        COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
                     FROM {$this->table}";
            
            $result = $this->db->select($query);
            
            return [
                'total' => intval($result[0]['total_usuarios']),
                'por_tipo' => [
                    'clientes' => intval($result[0]['clientes']),
                    'trabajadores' => intval($result[0]['trabajadores']),
                    'administradores' => intval($result[0]['administradores'])
                ],
                'por_estado' => [
                    'activos' => intval($result[0]['activos']),
                    'inactivos' => intval($result[0]['inactivos'])
                ]
            ];
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener estadísticas: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar última actividad del usuario
     */
    private function updateLastActivity($id) {
        try {
            $query = "UPDATE {$this->table} SET updated_at = NOW() WHERE id = :id";
            $this->db->update($query, ['id' => $id]);
        } catch (Exception $e) {
            // Log del error pero no fallar la autenticación por esto
            error_log("Error updating last activity: " . $e->getMessage());
        }
    }
    
    /**
     * Generar contraseña aleatoria
     */
    private function generateRandomPassword($length = 8) {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, strlen($characters) - 1)];
        }
        
        return $password;
    }
}
?>