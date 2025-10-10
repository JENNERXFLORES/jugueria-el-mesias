<?php
/**
 * Controlador de Ventas - Juguería El Mesías
 */

require_once 'BaseController.php';

class VentasController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
        $this->table = 'ventas';
    }
    
    protected function validateData($data, $operation) {
        $errors = [];
        
        if ($operation === 'create' || $operation === 'update') {
            
            // Pedido ID es requerido para crear
            if ($operation === 'create' && empty($data['pedido_id'])) {
                $errors[] = 'El ID del pedido es requerido';
            }
            
            // Vendedor nombre es requerido
            if (empty($data['vendedor_nombre'])) {
                $errors[] = 'El nombre del vendedor es requerido';
            }
            
            // Cliente nombre es requerido
            if (empty($data['cliente_nombre'])) {
                $errors[] = 'El nombre del cliente es requerido';
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
            
            // Turno debe ser válido
            $turnos_validos = ['mañana', 'tarde', 'noche'];
            if (isset($data['turno']) && !in_array($data['turno'], $turnos_validos)) {
                $errors[] = 'Turno inválido. Debe ser: ' . implode(', ', $turnos_validos);
            }
        }
        
        if (!empty($errors)) {
            throw new Exception('Errores de validación: ' . implode(', ', $errors));
        }
    }
    
    protected function beforeCreate($data) {
        $data = parent::beforeCreate($data);
        
        // Establecer valores por defecto
        $data['descuento'] = $data['descuento'] ?? 0.00;
        
        // Determinar turno automáticamente si no está presente
        if (!isset($data['turno'])) {
            $hora = date('H');
            if ($hora >= 6 && $hora < 12) {
                $data['turno'] = 'mañana';
            } elseif ($hora >= 12 && $hora < 18) {
                $data['turno'] = 'tarde';
            } else {
                $data['turno'] = 'noche';
            }
        }
        
        // Calcular total si no está presente
        if (!isset($data['total']) && isset($data['subtotal'])) {
            $data['total'] = floatval($data['subtotal']) - floatval($data['descuento']);
        }
        
        return $data;
    }
    
    protected function getSearchableFields() {
        return ['vendedor_nombre', 'cliente_nombre'];
    }
    
    protected function getCustomWhereConditions($params) {
        $conditions = [];
        
        // Filtrar por método de pago
        if (isset($params['metodo_pago']) && !empty($params['metodo_pago'])) {
            $conditions[] = 'metodo_pago = :metodo_pago';
        }
        
        // Filtrar por turno
        if (isset($params['turno']) && !empty($params['turno'])) {
            $conditions[] = 'turno = :turno';
        }
        
        // Filtrar por vendedor
        if (isset($params['vendedor_id']) && !empty($params['vendedor_id'])) {
            $conditions[] = 'vendedor_id = :vendedor_id';
        }
        
        // Filtrar por fecha
        if (isset($params['fecha_desde'])) {
            $conditions[] = 'DATE(fecha_venta) >= :fecha_desde';
        }
        
        if (isset($params['fecha_hasta'])) {
            $conditions[] = 'DATE(fecha_venta) <= :fecha_hasta';
        }
        
        // Filtrar por rango de totales
        if (isset($params['total_min'])) {
            $conditions[] = 'total >= :total_min';
        }
        
        if (isset($params['total_max'])) {
            $conditions[] = 'total <= :total_max';
        }
        
        return $conditions;
    }
    
    protected function getCustomWhereParams($params) {
        $whereParams = [];
        
        if (isset($params['metodo_pago']) && !empty($params['metodo_pago'])) {
            $whereParams['metodo_pago'] = $params['metodo_pago'];
        }
        
        if (isset($params['turno']) && !empty($params['turno'])) {
            $whereParams['turno'] = $params['turno'];
        }
        
        if (isset($params['vendedor_id']) && !empty($params['vendedor_id'])) {
            $whereParams['vendedor_id'] = $params['vendedor_id'];
        }
        
        if (isset($params['fecha_desde'])) {
            $whereParams['fecha_desde'] = $params['fecha_desde'];
        }
        
        if (isset($params['fecha_hasta'])) {
            $whereParams['fecha_hasta'] = $params['fecha_hasta'];
        }
        
        if (isset($params['total_min']) && is_numeric($params['total_min'])) {
            $whereParams['total_min'] = floatval($params['total_min']);
        }
        
        if (isset($params['total_max']) && is_numeric($params['total_max'])) {
            $whereParams['total_max'] = floatval($params['total_max']);
        }
        
        return $whereParams;
    }
    
    protected function afterGet($data) {
        // Convertir valores numéricos para el frontend
        foreach ($data as &$venta) {
            $venta['subtotal'] = floatval($venta['subtotal']);
            $venta['descuento'] = floatval($venta['descuento']);
            $venta['total'] = floatval($venta['total']);
        }
        
        return $data;
    }
    
    /**
     * Crear venta desde un pedido
     */
    public function createFromPedido($pedidoId, $vendedorData = []) {
        try {
            // Obtener datos del pedido
            $query = "SELECT * FROM pedidos WHERE id = :pedido_id AND estado = 'entregado'";
            $pedidos = $this->db->select($query, ['pedido_id' => $pedidoId]);
            
            if (empty($pedidos)) {
                throw new Exception("Pedido no encontrado o no está entregado");
            }
            
            $pedido = $pedidos[0];
            
            // Verificar si ya existe una venta para este pedido
            $existingVenta = $this->db->select("SELECT id FROM ventas WHERE pedido_id = :pedido_id", ['pedido_id' => $pedidoId]);
            if (!empty($existingVenta)) {
                throw new Exception("Ya existe una venta registrada para este pedido");
            }
            
            // Preparar datos de la venta
            $ventaData = [
                'pedido_id' => $pedidoId,
                'vendedor_id' => $vendedorData['vendedor_id'] ?? null,
                'vendedor_nombre' => $vendedorData['vendedor_nombre'] ?? 'Sistema',
                'cliente_nombre' => $pedido['cliente_nombre'],
                'subtotal' => $pedido['subtotal'],
                'descuento' => $pedido['descuento'],
                'total' => $pedido['total'],
                'metodo_pago' => $pedido['metodo_pago']
            ];
            
            // Crear la venta
            return $this->create($ventaData);
            
        } catch (Exception $e) {
            throw new Exception("Error al crear venta desde pedido: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener estadísticas de ventas por período
     */
    public function getStatsByPeriod($fechaDesde, $fechaHasta) {
        try {
            $query = "SELECT 
                        COUNT(*) as total_ventas,
                        SUM(total) as ingresos_totales,
                        AVG(total) as ticket_promedio,
                        COUNT(DISTINCT cliente_nombre) as clientes_unicos,
                        metodo_pago,
                        COUNT(*) as ventas_por_metodo,
                        SUM(total) as ingresos_por_metodo
                     FROM {$this->table} 
                     WHERE DATE(fecha_venta) BETWEEN :fecha_desde AND :fecha_hasta
                     GROUP BY metodo_pago";
            
            $metodosPago = $this->db->select($query, [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta
            ]);
            
            // Obtener totales generales
            $queryTotal = "SELECT 
                            COUNT(*) as total_ventas,
                            SUM(total) as ingresos_totales,
                            AVG(total) as ticket_promedio,
                            COUNT(DISTINCT cliente_nombre) as clientes_unicos
                         FROM {$this->table} 
                         WHERE DATE(fecha_venta) BETWEEN :fecha_desde AND :fecha_hasta";
            
            $totales = $this->db->select($queryTotal, [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta
            ]);
            
            $result = [
                'periodo' => [
                    'desde' => $fechaDesde,
                    'hasta' => $fechaHasta
                ],
                'totales' => [
                    'ventas' => intval($totales[0]['total_ventas']),
                    'ingresos' => floatval($totales[0]['ingresos_totales']),
                    'ticket_promedio' => floatval($totales[0]['ticket_promedio']),
                    'clientes_unicos' => intval($totales[0]['clientes_unicos'])
                ],
                'metodos_pago' => []
            ];
            
            foreach ($metodosPago as $metodo) {
                $result['metodos_pago'][$metodo['metodo_pago']] = [
                    'ventas' => intval($metodo['ventas_por_metodo']),
                    'ingresos' => floatval($metodo['ingresos_por_metodo'])
                ];
            }
            
            return $result;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener estadísticas por período: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener resumen diario de ventas
     */
    public function getDailyReport($fecha = null) {
        try {
            $fecha = $fecha ?: date('Y-m-d');
            
            $query = "SELECT 
                        turno,
                        COUNT(*) as total_ventas,
                        SUM(total) as ingresos,
                        AVG(total) as ticket_promedio,
                        metodo_pago,
                        COUNT(*) as ventas_por_metodo,
                        SUM(total) as ingresos_por_metodo
                     FROM {$this->table} 
                     WHERE DATE(fecha_venta) = :fecha
                     GROUP BY turno, metodo_pago
                     ORDER BY turno, metodo_pago";
            
            $data = $this->db->select($query, ['fecha' => $fecha]);
            
            // Organizar datos por turno
            $reporte = [
                'fecha' => $fecha,
                'turnos' => [
                    'mañana' => ['ventas' => 0, 'ingresos' => 0, 'metodos_pago' => []],
                    'tarde' => ['ventas' => 0, 'ingresos' => 0, 'metodos_pago' => []],
                    'noche' => ['ventas' => 0, 'ingresos' => 0, 'metodos_pago' => []]
                ],
                'totales' => ['ventas' => 0, 'ingresos' => 0]
            ];
            
            foreach ($data as $row) {
                $turno = $row['turno'];
                $metodo = $row['metodo_pago'];
                
                $reporte['turnos'][$turno]['ventas'] += intval($row['ventas_por_metodo']);
                $reporte['turnos'][$turno]['ingresos'] += floatval($row['ingresos_por_metodo']);
                $reporte['turnos'][$turno]['metodos_pago'][$metodo] = [
                    'ventas' => intval($row['ventas_por_metodo']),
                    'ingresos' => floatval($row['ingresos_por_metodo'])
                ];
                
                $reporte['totales']['ventas'] += intval($row['ventas_por_metodo']);
                $reporte['totales']['ingresos'] += floatval($row['ingresos_por_metodo']);
            }
            
            return $reporte;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener reporte diario: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener ventas top por productos
     */
    public function getTopProducts($fechaDesde = null, $fechaHasta = null, $limit = 10) {
        try {
            $whereClause = '';
            $params = ['limit' => intval($limit)];
            
            if ($fechaDesde && $fechaHasta) {
                $whereClause = 'AND DATE(v.fecha_venta) BETWEEN :fecha_desde AND :fecha_hasta';
                $params['fecha_desde'] = $fechaDesde;
                $params['fecha_hasta'] = $fechaHasta;
            }
            
            $query = "SELECT 
                        pp.producto_nombre,
                        pp.producto_categoria,
                        SUM(pp.cantidad) as total_vendido,
                        SUM(pp.subtotal) as ingresos_generados,
                        COUNT(DISTINCT v.id) as ventas_incluido,
                        AVG(pp.precio_unitario) as precio_promedio
                     FROM {$this->table} v
                     JOIN pedidos p ON v.pedido_id = p.id
                     JOIN pedido_productos pp ON p.id = pp.pedido_id
                     WHERE 1=1 {$whereClause}
                     GROUP BY pp.producto_nombre, pp.producto_categoria
                     ORDER BY total_vendido DESC
                     LIMIT :limit";
            
            $data = $this->db->select($query, $params);
            
            foreach ($data as &$producto) {
                $producto['total_vendido'] = intval($producto['total_vendido']);
                $producto['ingresos_generados'] = floatval($producto['ingresos_generados']);
                $producto['ventas_incluido'] = intval($producto['ventas_incluido']);
                $producto['precio_promedio'] = floatval($producto['precio_promedio']);
            }
            
            return $data;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener productos top: " . $e->getMessage());
        }
    }
}
?>