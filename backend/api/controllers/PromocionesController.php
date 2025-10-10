<?php
/**
 * Controlador de Promociones - Juguería El Mesías
 */

require_once 'BaseController.php';

class PromocionesController extends BaseController {
    /**
     * IDs de productos que deben asociarse a la promoción después
     * de crearla o actualizarla.
     *
     * @var array|null
     */
    private $pendingProductosAplicables = null;
    
    public function __construct($database) {
        parent::__construct($database);
        $this->table = 'promociones';
    }
    
    protected function validateData($data, $operation) {
        $errors = [];
        
        if ($operation === 'create' || $operation === 'update') {
            
            // Título es requerido
            if (empty($data['titulo'])) {
                $errors[] = 'El título de la promoción es requerido';
            } elseif (strlen($data['titulo']) > 255) {
                $errors[] = 'El título no puede exceder 255 caracteres';
            }
            
            // Tipo debe ser válido
            $tipos_validos = ['descuento_porcentaje', 'descuento_fijo', 'combo', '2x1'];
            if (empty($data['tipo'])) {
                $errors[] = 'El tipo de promoción es requerido';
            } elseif (!in_array($data['tipo'], $tipos_validos)) {
                $errors[] = 'Tipo de promoción inválido. Debe ser: ' . implode(', ', $tipos_validos);
            }
            
            // Valor de descuento debe ser válido según el tipo
            if (isset($data['valor_descuento'])) {
                if (!is_numeric($data['valor_descuento']) || floatval($data['valor_descuento']) < 0) {
                    $errors[] = 'El valor de descuento debe ser un número positivo o cero';
                }
                
                // Validaciones específicas por tipo
                if (isset($data['tipo'])) {
                    if ($data['tipo'] === 'descuento_porcentaje' && floatval($data['valor_descuento']) > 100) {
                        $errors[] = 'El descuento porcentual no puede ser mayor a 100%';
                    } elseif ($data['tipo'] === 'descuento_fijo' && floatval($data['valor_descuento']) > 9999.99) {
                        $errors[] = 'El descuento fijo no puede exceder 9999.99';
                    }
                }
            }
            
            // Fechas son requeridas
            if (empty($data['fecha_inicio'])) {
                $errors[] = 'La fecha de inicio es requerida';
            } else {
                // Validar formato de fecha
                $fechaInicio = DateTime::createFromFormat('Y-m-d H:i:s', $data['fecha_inicio']);
                if (!$fechaInicio) {
                    $errors[] = 'La fecha de inicio debe tener formato YYYY-MM-DD HH:MM:SS';
                }
            }
            
            if (empty($data['fecha_fin'])) {
                $errors[] = 'La fecha de fin es requerida';
            } else {
                $fechaFin = DateTime::createFromFormat('Y-m-d H:i:s', $data['fecha_fin']);
                if (!$fechaFin) {
                    $errors[] = 'La fecha de fin debe tener formato YYYY-MM-DD HH:MM:SS';
                }
                
                // Verificar que fecha fin sea mayor a fecha inicio
                if (isset($fechaInicio) && $fechaFin <= $fechaInicio) {
                    $errors[] = 'La fecha de fin debe ser posterior a la fecha de inicio';
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
        $this->extractProductosAplicables($data);
        $data = parent::beforeCreate($data);
        
        // Establecer valores por defecto
        $data['activa'] = isset($data['activa']) ? (bool)$data['activa'] : true;
        $data['valor_descuento'] = $data['valor_descuento'] ?? 0.00;
        
        return $data;
    }
    
    protected function beforeUpdate($data, $existing) {
        $this->extractProductosAplicables($data);
        $data = parent::beforeUpdate($data, $existing);
        
        // Si se actualiza el tipo, verificar valor de descuento
        if (isset($data['tipo']) && isset($data['valor_descuento'])) {
            if ($data['tipo'] === 'descuento_porcentaje' && floatval($data['valor_descuento']) > 100) {
                $data['valor_descuento'] = 100;
            }
        }
        
        return $data;
    }
    
    protected function getSearchableFields() {
        return ['titulo', 'descripcion'];
    }
    
    protected function getCustomWhereConditions($params) {
        $conditions = [];
        
        // Filtrar por tipo
        if (isset($params['tipo']) && !empty($params['tipo'])) {
            $conditions[] = 'tipo = :tipo';
        }
        
        // Filtrar por estado activo
        if (isset($params['activa'])) {
            $conditions[] = 'activa = :activa';
        }
        
        // Filtrar promociones vigentes (activas y dentro del período)
        if (isset($params['vigentes']) && $params['vigentes']) {
            $conditions[] = 'activa = 1 AND fecha_inicio <= NOW() AND fecha_fin >= NOW()';
        }
        
        // Filtrar por rango de fechas
        if (isset($params['fecha_desde'])) {
            $conditions[] = 'DATE(fecha_inicio) >= :fecha_desde';
        }
        
        if (isset($params['fecha_hasta'])) {
            $conditions[] = 'DATE(fecha_fin) <= :fecha_hasta';
        }
        
        return $conditions;
    }
    
    protected function getCustomWhereParams($params) {
        $whereParams = [];
        
        if (isset($params['tipo']) && !empty($params['tipo'])) {
            $whereParams['tipo'] = $params['tipo'];
        }
        
        if (isset($params['activa'])) {
            $whereParams['activa'] = filter_var($params['activa'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
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
        // Convertir valores para el frontend
        foreach ($data as &$promocion) {
            $promocion['activa'] = (bool)$promocion['activa'];
            $promocion['valor_descuento'] = floatval($promocion['valor_descuento']);
            
            // Determinar si está vigente
            $ahora = new DateTime();
            $fechaInicio = new DateTime($promocion['fecha_inicio']);
            $fechaFin = new DateTime($promocion['fecha_fin']);
            
            $promocion['vigente'] = $promocion['activa'] && $ahora >= $fechaInicio && $ahora <= $fechaFin;
            $promocion['proximamente'] = $promocion['activa'] && $ahora < $fechaInicio;
            $promocion['expirada'] = $ahora > $fechaFin;
        }

        return $data;
    }

    protected function afterCreate($record) {
        try {
            $record = parent::afterCreate($record);

            if (is_array($this->pendingProductosAplicables)) {
                $this->addProducts($record['id'], $this->pendingProductosAplicables);
                $record = $this->getPromocionWithProducts($record['id']);
            }

            return $record;
        } finally {
            $this->pendingProductosAplicables = null;
        }
    }

    protected function afterUpdate($record, $previous) {
        try {
            $record = parent::afterUpdate($record, $previous);

            if (is_array($this->pendingProductosAplicables)) {
                $this->addProducts($record['id'], $this->pendingProductosAplicables);
                $record = $this->getPromocionWithProducts($record['id']);
            }

            return $record;
        } finally {
            $this->pendingProductosAplicables = null;
        }
    }

    /**
     * Procesa el payload recibido para extraer el listado de productos
     * aplicables a la promoción.
     */
    private function extractProductosAplicables(&$data) {
        if (!array_key_exists('productos_aplicables', $data)) {
            $this->pendingProductosAplicables = null;
            return;
        }

        $productos = $data['productos_aplicables'];

        if (is_string($productos)) {
            $decoded = json_decode($productos, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $productos = $decoded;
            }
        }

        if ($productos === null || $productos === '') {
            $productos = [];
        }

        if (!is_array($productos)) {
            throw new Exception('El campo productos_aplicables debe ser un arreglo de IDs de productos');
        }

        $productosLimpios = [];
        foreach ($productos as $productoId) {
            if (is_string($productoId) || is_numeric($productoId)) {
                $productoId = trim((string)$productoId);
                if ($productoId !== '') {
                    $productosLimpios[] = $this->db->sanitizeInput($productoId);
                }
            }
        }

        $this->pendingProductosAplicables = array_values(array_unique($productosLimpios));

        unset($data['productos_aplicables']);
    }

    /**
     * Obtener promociones vigentes
     */
    public function getActive() {
        try {
            $query = "SELECT * FROM {$this->table} 
                     WHERE activa = 1 AND fecha_inicio <= NOW() AND fecha_fin >= NOW() 
                     ORDER BY fecha_fin ASC";
            
            $data = $this->db->select($query);
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener promociones vigentes: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener promociones por tipo
     */
    public function getByType($tipo) {
        try {
            $tipos_validos = ['descuento_porcentaje', 'descuento_fijo', 'combo', '2x1'];
            
            if (!in_array($tipo, $tipos_validos)) {
                throw new Exception('Tipo de promoción inválido');
            }
            
            $query = "SELECT * FROM {$this->table} 
                     WHERE tipo = :tipo AND activa = 1 
                     ORDER BY fecha_inicio DESC";
            
            $data = $this->db->select($query, ['tipo' => $tipo]);
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener promociones por tipo: " . $e->getMessage());
        }
    }
    
    /**
     * Activar/desactivar promoción
     */
    public function toggleActive($id) {
        try {
            $promocion = $this->getById($id);
            $newStatus = !$promocion['activa'];
            
            $query = "UPDATE {$this->table} SET activa = :activa, updated_at = NOW() WHERE id = :id";
            
            $this->db->update($query, [
                'id' => $id,
                'activa' => $newStatus ? 1 : 0
            ]);
            
            return $this->getById($id);
            
        } catch (Exception $e) {
            throw new Exception("Error al cambiar estado de la promoción: " . $e->getMessage());
        }
    }
    
    /**
     * Agregar productos a una promoción
     */
    public function addProducts($promocionId, $productIds) {
        try {
            // Verificar que la promoción existe
            $this->getById($promocionId);
            
            // Limpiar productos existentes
            $deleteQuery = "DELETE FROM promocion_productos WHERE promocion_id = :promocion_id";
            $this->db->delete($deleteQuery, ['promocion_id' => $promocionId]);
            
            // Agregar nuevos productos
            foreach ($productIds as $productId) {
                $insertQuery = "INSERT INTO promocion_productos (promocion_id, producto_id) VALUES (:promocion_id, :producto_id)";
                $this->db->insert($insertQuery, [
                    'promocion_id' => $promocionId,
                    'producto_id' => $productId
                ]);
            }
            
            return $this->getPromocionWithProducts($promocionId);
            
        } catch (Exception $e) {
            throw new Exception("Error al agregar productos a la promoción: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener promoción con sus productos
     */
    public function getPromocionWithProducts($id) {
        try {
            $promocion = $this->getById($id);
            
            // Obtener productos de la promoción
            $query = "SELECT p.* FROM productos p 
                     JOIN promocion_productos pp ON p.id = pp.producto_id 
                     WHERE pp.promocion_id = :promocion_id AND p.disponible = 1
                     ORDER BY p.nombre ASC";
            
            $productos = $this->db->select($query, ['promocion_id' => $id]);
            
            // Convertir valores de productos
            foreach ($productos as &$producto) {
                $producto['disponible'] = (bool)$producto['disponible'];
                $producto['promocion'] = (bool)$producto['promocion'];
                $producto['precio'] = floatval($producto['precio']);
                
                if ($producto['precio_promocion'] !== null) {
                    $producto['precio_promocion'] = floatval($producto['precio_promocion']);
                }
            }
            
            $promocion['productos'] = $productos;
            
            return $promocion;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener promoción con productos: " . $e->getMessage());
        }
    }
    
    /**
     * Calcular descuento de promoción
     */
    public function calculateDiscount($promocionId, $subtotal) {
        try {
            $promocion = $this->getById($promocionId);
            
            // Verificar que la promoción esté vigente
            if (!$promocion['vigente']) {
                throw new Exception("La promoción no está vigente");
            }
            
            $descuento = 0;
            
            switch ($promocion['tipo']) {
                case 'descuento_porcentaje':
                    $descuento = $subtotal * (floatval($promocion['valor_descuento']) / 100);
                    break;
                    
                case 'descuento_fijo':
                    $descuento = min(floatval($promocion['valor_descuento']), $subtotal);
                    break;
                    
                case '2x1':
                    // Para 2x1, el descuento es el 50% del subtotal
                    $descuento = $subtotal * 0.5;
                    break;
                    
                case 'combo':
                    // Para combos, usar el valor de descuento como fijo
                    $descuento = min(floatval($promocion['valor_descuento']), $subtotal);
                    break;
            }
            
            return [
                'promocion_id' => $promocionId,
                'promocion_titulo' => $promocion['titulo'],
                'tipo' => $promocion['tipo'],
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'total' => $subtotal - $descuento
            ];
            
        } catch (Exception $e) {
            throw new Exception("Error al calcular descuento: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener estadísticas de promociones
     */
    public function getStats() {
        try {
            $query = "SELECT 
                        COUNT(*) as total_promociones,
                        COUNT(CASE WHEN activa = 1 THEN 1 END) as activas,
                        COUNT(CASE WHEN activa = 1 AND fecha_inicio <= NOW() AND fecha_fin >= NOW() THEN 1 END) as vigentes,
                        COUNT(CASE WHEN fecha_fin < NOW() THEN 1 END) as expiradas,
                        tipo,
                        COUNT(*) as por_tipo
                     FROM {$this->table}
                     GROUP BY tipo WITH ROLLUP";
            
            $result = $this->db->select($query);
            
            $stats = [
                'total' => 0,
                'activas' => 0,
                'vigentes' => 0,
                'expiradas' => 0,
                'por_tipo' => []
            ];
            
            foreach ($result as $row) {
                if ($row['tipo'] === null) {
                    // Fila de totales
                    $stats['total'] = intval($row['total_promociones']);
                    $stats['activas'] = intval($row['activas']);
                    $stats['vigentes'] = intval($row['vigentes']);
                    $stats['expiradas'] = intval($row['expiradas']);
                } else {
                    // Fila por tipo
                    $stats['por_tipo'][$row['tipo']] = intval($row['por_tipo']);
                }
            }
            
            return $stats;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener estadísticas: " . $e->getMessage());
        }
    }
    
    /**
     * Extender promoción
     */
    public function extend($id, $nuevaFechaFin) {
        try {
            $promocion = $this->getById($id);
            
            // Validar nueva fecha
            $nuevaFecha = DateTime::createFromFormat('Y-m-d H:i:s', $nuevaFechaFin);
            if (!$nuevaFecha) {
                throw new Exception('Formato de fecha inválido');
            }
            
            $fechaActual = new DateTime($promocion['fecha_fin']);
            if ($nuevaFecha <= $fechaActual) {
                throw new Exception('La nueva fecha debe ser posterior a la fecha actual de fin');
            }
            
            return $this->patch($id, ['fecha_fin' => $nuevaFechaFin]);
            
        } catch (Exception $e) {
            throw new Exception("Error al extender promoción: " . $e->getMessage());
        }
    }
}
?>