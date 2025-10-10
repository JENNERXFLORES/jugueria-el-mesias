<?php
/**
 * Controlador de Pedidos - Juguería El Mesías
 */

require_once 'BaseController.php';

class PedidosController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
        $this->table = 'pedidos';
    }
    
    protected function validateData($data, $operation) {
        $errors = [];
        
        if ($operation === 'create' || $operation === 'update') {
            
            // Nombre del cliente es requerido
            if (empty($data['cliente_nombre'])) {
                $errors[] = 'El nombre del cliente es requerido';
            } elseif (strlen($data['cliente_nombre']) > 255) {
                $errors[] = 'El nombre del cliente no puede exceder 255 caracteres';
            }
            
            // Tipo de pedido debe ser válido
            $tipos_validos = ['local', 'online'];
            if (isset($data['tipo_pedido']) && !in_array($data['tipo_pedido'], $tipos_validos)) {
                $errors[] = 'Tipo de pedido inválido. Debe ser: ' . implode(', ', $tipos_validos);
            }
            
            // Estado debe ser válido
            $estados_validos = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
            if (isset($data['estado']) && !in_array($data['estado'], $estados_validos)) {
                $errors[] = 'Estado inválido. Debe ser: ' . implode(', ', $estados_validos);
            }
            
            // Subtotal debe ser un número positivo
            if (isset($data['subtotal'])) {
                if (!is_numeric($data['subtotal']) || floatval($data['subtotal']) < 0) {
                    $errors[] = 'El subtotal debe ser un número positivo';
                }
            }
            
            // Total debe ser un número positivo
            if (isset($data['total'])) {
                if (!is_numeric($data['total']) || floatval($data['total']) <= 0) {
                    $errors[] = 'El total debe ser un número positivo';
                }
            }
            
            // Descuento debe ser un número no negativo
            if (isset($data['descuento'])) {
                if (!is_numeric($data['descuento']) || floatval($data['descuento']) < 0) {
                    $errors[] = 'El descuento debe ser un número positivo o cero';
                }
            }
            
            // Método de pago debe ser válido
            $metodos_pago_validos = ['efectivo', 'tarjeta', 'yape', 'plin'];
            if (isset($data['metodo_pago']) && !in_array($data['metodo_pago'], $metodos_pago_validos)) {
                $errors[] = 'Método de pago inválido. Debe ser: ' . implode(', ', $metodos_pago_validos);
            }
        }
        
        if (!empty($errors)) {
            throw new Exception('Errores de validación: ' . implode(', ', $errors));
        }
    }
    
    protected function beforeCreate($data) {
        $data = parent::beforeCreate($data);
        
        // Establecer valores por defecto
        $data['tipo_pedido'] = $data['tipo_pedido'] ?? 'online';
        $data['estado'] = $data['estado'] ?? 'pendiente';
        $data['descuento'] = $data['descuento'] ?? 0.00;
        $data['pagado'] = isset($data['pagado']) ? (bool)$data['pagado'] : false;
        
        // Calcular total si no está presente
        if (!isset($data['total']) && isset($data['subtotal'])) {
            $data['total'] = floatval($data['subtotal']) - floatval($data['descuento']);
        }
        
        return $data;
    }
    
    protected function beforeUpdate($data, $existing) {
        $data = parent::beforeUpdate($data, $existing);
        
        // Recalcular total si se cambia subtotal o descuento
        if (isset($data['subtotal']) || isset($data['descuento'])) {
            $subtotal = isset($data['subtotal']) ? floatval($data['subtotal']) : floatval($existing['subtotal']);
            $descuento = isset($data['descuento']) ? floatval($data['descuento']) : floatval($existing['descuento']);
            $data['total'] = $subtotal - $descuento;
        }
        
        return $data;
    }
    
    protected function getSearchableFields() {
        return ['cliente_nombre', 'observaciones'];
    }
    
    protected function getCustomWhereConditions($params) {
        $conditions = [];
        
        // Filtrar por estado
        if (isset($params['estado']) && !empty($params['estado'])) {
            $conditions[] = 'estado = :estado';
        }
        
        // Filtrar por tipo de pedido
        if (isset($params['tipo_pedido']) && !empty($params['tipo_pedido'])) {
            $conditions[] = 'tipo_pedido = :tipo_pedido';
        }
        
        // Filtrar por método de pago
        if (isset($params['metodo_pago']) && !empty($params['metodo_pago'])) {
            $conditions[] = 'metodo_pago = :metodo_pago';
        }
        
        // Filtrar por cliente
        if (isset($params['cliente_id']) && !empty($params['cliente_id'])) {
            $conditions[] = 'cliente_id = :cliente_id';
        }
        
        // Filtrar por estado de pago
        if (isset($params['pagado'])) {
            $conditions[] = 'pagado = :pagado';
        }
        
        // Filtrar por fecha
        if (isset($params['fecha_desde'])) {
            $conditions[] = 'DATE(fecha_pedido) >= :fecha_desde';
        }
        
        if (isset($params['fecha_hasta'])) {
            $conditions[] = 'DATE(fecha_pedido) <= :fecha_hasta';
        }
        
        return $conditions;
    }
    
    protected function getCustomWhereParams($params) {
        $whereParams = [];
        
        if (isset($params['estado']) && !empty($params['estado'])) {
            $whereParams['estado'] = $params['estado'];
        }
        
        if (isset($params['tipo_pedido']) && !empty($params['tipo_pedido'])) {
            $whereParams['tipo_pedido'] = $params['tipo_pedido'];
        }
        
        if (isset($params['metodo_pago']) && !empty($params['metodo_pago'])) {
            $whereParams['metodo_pago'] = $params['metodo_pago'];
        }
        
        if (isset($params['cliente_id']) && !empty($params['cliente_id'])) {
            $whereParams['cliente_id'] = $params['cliente_id'];
        }
        
        if (isset($params['pagado'])) {
            $whereParams['pagado'] = filter_var($params['pagado'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
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
        foreach ($data as &$pedido) {
            $pedido['pagado'] = (bool)$pedido['pagado'];
            $pedido['subtotal'] = floatval($pedido['subtotal']);
            $pedido['descuento'] = floatval($pedido['descuento']);
            $pedido['total'] = floatval($pedido['total']);
        }
        
        return $data;
    }
    
    /**
     * Crear pedido completo con productos
     */
    public function createWithProducts($pedidoData, $productos) {
        try {
            $this->db->beginTransaction();
            
            // Crear el pedido
            $pedido = $this->create($pedidoData);
            $pedidoId = $pedido['id'];
            
            // Agregar productos al pedido
            $subtotal = 0;
            foreach ($productos as $producto) {
                $this->addProductToPedido($pedidoId, $producto);
                $subtotal += floatval($producto['precio_unitario']) * intval($producto['cantidad']);
            }
            
            // Actualizar el subtotal y total del pedido
            $descuento = floatval($pedidoData['descuento'] ?? 0);
            $total = $subtotal - $descuento;
            
            $this->patch($pedidoId, [
                'subtotal' => $subtotal,
                'total' => $total
            ]);
            
            $this->db->commit();
            
            // Obtener el pedido completo con productos
            return $this->getPedidoWithProducts($pedidoId);
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw new Exception("Error al crear pedido con productos: " . $e->getMessage());
        }
    }
    
    /**
     * Agregar producto a un pedido
     */
    private function addProductToPedido($pedidoId, $producto) {
        $query = "INSERT INTO pedido_productos (pedido_id, producto_id, producto_nombre, producto_categoria, precio_unitario, cantidad, subtotal) 
                 VALUES (:pedido_id, :producto_id, :producto_nombre, :producto_categoria, :precio_unitario, :cantidad, :subtotal)";
        
        $subtotal = floatval($producto['precio_unitario']) * intval($producto['cantidad']);
        
        $this->db->insert($query, [
            'pedido_id' => $pedidoId,
            'producto_id' => $producto['producto_id'],
            'producto_nombre' => $producto['producto_nombre'],
            'producto_categoria' => $producto['producto_categoria'],
            'precio_unitario' => floatval($producto['precio_unitario']),
            'cantidad' => intval($producto['cantidad']),
            'subtotal' => $subtotal
        ]);
    }
    
    /**
     * Obtener pedido con sus productos
     */
    public function getPedidoWithProducts($id) {
        try {
            $pedido = $this->getById($id);
            
            // Obtener productos del pedido
            $query = "SELECT * FROM pedido_productos WHERE pedido_id = :pedido_id ORDER BY id ASC";
            $productos = $this->db->select($query, ['pedido_id' => $id]);
            
            // Convertir valores numéricos
            foreach ($productos as &$producto) {
                $producto['precio_unitario'] = floatval($producto['precio_unitario']);
                $producto['cantidad'] = intval($producto['cantidad']);
                $producto['subtotal'] = floatval($producto['subtotal']);
            }
            
            $pedido['productos'] = $productos;
            
            return $pedido;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener pedido con productos: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar estado del pedido
     */
    public function updateStatus($id, $estado) {
        try {
            $estados_validos = ['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
            
            if (!in_array($estado, $estados_validos)) {
                throw new Exception('Estado inválido');
            }
            
            $updateData = ['estado' => $estado];
            
            // Si se marca como entregado, actualizar fecha de entrega
            if ($estado === 'entregado') {
                $updateData['fecha_entrega'] = date('Y-m-d H:i:s');
            }
            
            return $this->patch($id, $updateData);
            
        } catch (Exception $e) {
            throw new Exception("Error al actualizar estado: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener estadísticas de pedidos
     */
    public function getStats($fechaDesde = null, $fechaHasta = null) {
        try {
            $whereClause = '';
            $params = [];
            
            if ($fechaDesde && $fechaHasta) {
                $whereClause = 'WHERE DATE(fecha_pedido) BETWEEN :fecha_desde AND :fecha_hasta';
                $params = ['fecha_desde' => $fechaDesde, 'fecha_hasta' => $fechaHasta];
            }
            
            $query = "SELECT 
                        COUNT(*) as total_pedidos,
                        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
                        COUNT(CASE WHEN estado = 'en_preparacion' THEN 1 END) as en_preparacion,
                        COUNT(CASE WHEN estado = 'listo' THEN 1 END) as listos,
                        COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as entregados,
                        COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelados,
                        SUM(total) as ingresos_totales,
                        AVG(total) as ticket_promedio
                     FROM {$this->table} {$whereClause}";
            
            $result = $this->db->select($query, $params);
            
            if (empty($result)) {
                return [
                    'total_pedidos' => 0,
                    'pendientes' => 0,
                    'en_preparacion' => 0,
                    'listos' => 0,
                    'entregados' => 0,
                    'cancelados' => 0,
                    'ingresos_totales' => 0,
                    'ticket_promedio' => 0
                ];
            }
            
            $stats = $result[0];
            $stats['ingresos_totales'] = floatval($stats['ingresos_totales']);
            $stats['ticket_promedio'] = floatval($stats['ticket_promedio']);
            
            return $stats;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener estadísticas: " . $e->getMessage());
        }
    }
}
?>