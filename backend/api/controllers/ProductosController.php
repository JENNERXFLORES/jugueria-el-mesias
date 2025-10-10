<?php
/**
 * Controlador de Productos - Juguería El Mesías
 */

require_once 'BaseController.php';

class ProductosController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
        $this->table = 'productos';
    }
    
    protected function validateData($data, $operation) {
        $errors = [];
        
        // Validaciones para crear y actualizar
        if ($operation === 'create' || $operation === 'update') {
            
            // Nombre es requerido
            if (empty($data['nombre'])) {
                $errors[] = 'El nombre del producto es requerido';
            } elseif (strlen($data['nombre']) > 255) {
                $errors[] = 'El nombre del producto no puede exceder 255 caracteres';
            }
            
            // Categoría es requerida y debe ser válida
            $categorias_validas = ['jugos', 'desayunos', 'bebidas'];
            if (empty($data['categoria'])) {
                $errors[] = 'La categoría es requerida';
            } elseif (!in_array($data['categoria'], $categorias_validas)) {
                $errors[] = 'Categoría inválida. Debe ser: ' . implode(', ', $categorias_validas);
            }
            
            // Precio es requerido y debe ser positivo
            if (!isset($data['precio'])) {
                $errors[] = 'El precio es requerido';
            } elseif (!is_numeric($data['precio']) || floatval($data['precio']) <= 0) {
                $errors[] = 'El precio debe ser un número positivo';
            } elseif (floatval($data['precio']) > 9999.99) {
                $errors[] = 'El precio no puede exceder 9999.99';
            }
            
            // Validar precio de promoción si está presente
            if (isset($data['precio_promocion'])) {
                if (!is_numeric($data['precio_promocion']) || floatval($data['precio_promocion']) < 0) {
                    $errors[] = 'El precio de promoción debe ser un número positivo o cero';
                } elseif (floatval($data['precio_promocion']) > 9999.99) {
                    $errors[] = 'El precio de promoción no puede exceder 9999.99';
                }
                
                // Si hay precio de promoción, debe ser menor al precio normal
                if (isset($data['precio']) && floatval($data['precio_promocion']) >= floatval($data['precio'])) {
                    $errors[] = 'El precio de promoción debe ser menor al precio normal';
                }
            }
            
            // Validar URL de imagen si está presente
            if (isset($data['imagen_url']) && !empty($data['imagen_url'])) {
                if (!filter_var($data['imagen_url'], FILTER_VALIDATE_URL)) {
                    $errors[] = 'La URL de la imagen no es válida';
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
        $data['disponible'] = isset($data['disponible']) ? (bool)$data['disponible'] : true;
        $data['promocion'] = isset($data['promocion']) ? (bool)$data['promocion'] : false;
        
        // Si no hay promoción, limpiar precio de promoción
        if (!$data['promocion']) {
            $data['precio_promocion'] = null;
        }
        
        return $data;
    }
    
    protected function beforeUpdate($data, $existing) {
        $data = parent::beforeUpdate($data, $existing);
        
        // Si se establece promocion=false, limpiar precio de promoción
        if (isset($data['promocion']) && !$data['promocion']) {
            $data['precio_promocion'] = null;
        }
        
        return $data;
    }
    
    protected function getSearchableFields() {
        return ['nombre', 'descripcion', 'ingredientes'];
    }
    
    protected function getCustomWhereConditions($params) {
        $conditions = [];
        
        // Filtrar por categoría
        if (isset($params['categoria']) && !empty($params['categoria'])) {
            $conditions[] = 'categoria = :categoria';
        }
        
        // Filtrar por disponibilidad
        if (isset($params['disponible'])) {
            $conditions[] = 'disponible = :disponible';
        }
        
        // Filtrar por promoción
        if (isset($params['promocion'])) {
            $conditions[] = 'promocion = :promocion';
        }
        
        // Filtrar por rango de precios
        if (isset($params['precio_min'])) {
            $conditions[] = 'precio >= :precio_min';
        }
        
        if (isset($params['precio_max'])) {
            $conditions[] = 'precio <= :precio_max';
        }
        
        return $conditions;
    }
    
    protected function getCustomWhereParams($params) {
        $whereParams = [];
        
        if (isset($params['categoria']) && !empty($params['categoria'])) {
            $whereParams['categoria'] = $params['categoria'];
        }
        
        if (isset($params['disponible'])) {
            $whereParams['disponible'] = filter_var($params['disponible'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }
        
        if (isset($params['promocion'])) {
            $whereParams['promocion'] = filter_var($params['promocion'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }
        
        if (isset($params['precio_min']) && is_numeric($params['precio_min'])) {
            $whereParams['precio_min'] = floatval($params['precio_min']);
        }
        
        if (isset($params['precio_max']) && is_numeric($params['precio_max'])) {
            $whereParams['precio_max'] = floatval($params['precio_max']);
        }
        
        return $whereParams;
    }
    
    protected function afterGet($data) {
        // Convertir valores booleanos para el frontend
        foreach ($data as &$product) {
            $product['disponible'] = (bool)$product['disponible'];
            $product['promocion'] = (bool)$product['promocion'];
            $product['precio'] = floatval($product['precio']);
            
            if ($product['precio_promocion'] !== null) {
                $product['precio_promocion'] = floatval($product['precio_promocion']);
            }
        }
        
        return $data;
    }
    
    /**
     * Obtener productos por categoría (endpoint específico)
     */
    public function getByCategory($categoria) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE categoria = :categoria AND disponible = 1 ORDER BY promocion DESC, nombre ASC";
            $data = $this->db->select($query, ['categoria' => $categoria]);
            
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener productos por categoría: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener productos en promoción
     */
    public function getPromotions() {
        try {
            $query = "SELECT * FROM {$this->table} WHERE promocion = 1 AND disponible = 1 ORDER BY precio_promocion ASC";
            $data = $this->db->select($query);
            
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener productos en promoción: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar disponibilidad de un producto
     */
    public function updateAvailability($id, $disponible) {
        try {
            $query = "UPDATE {$this->table} SET disponible = :disponible, updated_at = NOW() WHERE id = :id";
            $affected = $this->db->update($query, [
                'id' => $id,
                'disponible' => $disponible ? 1 : 0
            ]);
            
            if ($affected === 0) {
                throw new Exception("Producto no encontrado");
            }
            
            return $this->getById($id);
            
        } catch (Exception $e) {
            throw new Exception("Error al actualizar disponibilidad: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar promoción de un producto
     */
    public function updatePromotion($id, $promocion, $precio_promocion = null) {
        try {
            // Si se desactiva la promoción, limpiar precio de promoción
            if (!$promocion) {
                $precio_promocion = null;
            }
            
            $query = "UPDATE {$this->table} SET promocion = :promocion, precio_promocion = :precio_promocion, updated_at = NOW() WHERE id = :id";
            $affected = $this->db->update($query, [
                'id' => $id,
                'promocion' => $promocion ? 1 : 0,
                'precio_promocion' => $precio_promocion
            ]);
            
            if ($affected === 0) {
                throw new Exception("Producto no encontrado");
            }
            
            return $this->getById($id);
            
        } catch (Exception $e) {
            throw new Exception("Error al actualizar promoción: " . $e->getMessage());
        }
    }
}
?>