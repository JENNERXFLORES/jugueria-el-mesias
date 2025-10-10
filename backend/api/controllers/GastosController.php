<?php
/**
 * Controlador de Gastos - Juguería El Mesías
 */

require_once 'BaseController.php';

class GastosController extends BaseController {
    
    public function __construct($database) {
        parent::__construct($database);
        $this->table = 'gastos';
    }
    
    protected function validateData($data, $operation) {
        $errors = [];
        
        if ($operation === 'create' || $operation === 'update') {
            
            // Concepto es requerido
            if (empty($data['concepto'])) {
                $errors[] = 'El concepto del gasto es requerido';
            } elseif (strlen($data['concepto']) > 255) {
                $errors[] = 'El concepto no puede exceder 255 caracteres';
            }
            
            // Categoría debe ser válida
            $categorias_validas = ['materia_prima', 'servicios', 'equipos', 'marketing', 'otros'];
            if (empty($data['categoria'])) {
                $errors[] = 'La categoría es requerida';
            } elseif (!in_array($data['categoria'], $categorias_validas)) {
                $errors[] = 'Categoría inválida. Debe ser: ' . implode(', ', $categorias_validas);
            }
            
            // Monto debe ser un número positivo
            if (!isset($data['monto'])) {
                $errors[] = 'El monto es requerido';
            } elseif (!is_numeric($data['monto']) || floatval($data['monto']) <= 0) {
                $errors[] = 'El monto debe ser un número positivo';
            } elseif (floatval($data['monto']) > 999999.99) {
                $errors[] = 'El monto no puede exceder 999,999.99';
            }
            
            // Fecha del gasto es requerida
            if (empty($data['fecha_gasto'])) {
                $errors[] = 'La fecha del gasto es requerida';
            } else {
                // Validar formato de fecha
                $fecha = DateTime::createFromFormat('Y-m-d', $data['fecha_gasto']);
                if (!$fecha || $fecha->format('Y-m-d') !== $data['fecha_gasto']) {
                    $errors[] = 'La fecha del gasto debe tener formato YYYY-MM-DD';
                }
            }
            
            // Responsable es requerido
            if (empty($data['responsable'])) {
                $errors[] = 'El responsable es requerido';
            } elseif (strlen($data['responsable']) > 255) {
                $errors[] = 'El responsable no puede exceder 255 caracteres';
            }
            
            // Validar comprobante si está presente
            if (isset($data['comprobante']) && !empty($data['comprobante'])) {
                if (strlen($data['comprobante']) > 100) {
                    $errors[] = 'El número de comprobante no puede exceder 100 caracteres';
                }
            }
        }
        
        if (!empty($errors)) {
            throw new Exception('Errores de validación: ' . implode(', ', $errors));
        }
    }
    
    protected function beforeCreate($data) {
        $data = parent::beforeCreate($data);
        
        // Establecer fecha del gasto como hoy si no está presente
        if (empty($data['fecha_gasto'])) {
            $data['fecha_gasto'] = date('Y-m-d');
        }
        
        return $data;
    }
    
    protected function getSearchableFields() {
        return ['concepto', 'responsable', 'comprobante', 'observaciones'];
    }
    
    protected function getCustomWhereConditions($params) {
        $conditions = [];
        
        // Filtrar por categoría
        if (isset($params['categoria']) && !empty($params['categoria'])) {
            $conditions[] = 'categoria = :categoria';
        }
        
        // Filtrar por responsable
        if (isset($params['responsable']) && !empty($params['responsable'])) {
            $conditions[] = 'responsable LIKE :responsable';
        }
        
        // Filtrar por fecha
        if (isset($params['fecha_desde'])) {
            $conditions[] = 'fecha_gasto >= :fecha_desde';
        }
        
        if (isset($params['fecha_hasta'])) {
            $conditions[] = 'fecha_gasto <= :fecha_hasta';
        }
        
        // Filtrar por rango de montos
        if (isset($params['monto_min'])) {
            $conditions[] = 'monto >= :monto_min';
        }
        
        if (isset($params['monto_max'])) {
            $conditions[] = 'monto <= :monto_max';
        }
        
        // Filtrar por mes y año
        if (isset($params['mes']) && isset($params['año'])) {
            $conditions[] = 'YEAR(fecha_gasto) = :año AND MONTH(fecha_gasto) = :mes';
        } elseif (isset($params['año'])) {
            $conditions[] = 'YEAR(fecha_gasto) = :año';
        }
        
        return $conditions;
    }
    
    protected function getCustomWhereParams($params) {
        $whereParams = [];
        
        if (isset($params['categoria']) && !empty($params['categoria'])) {
            $whereParams['categoria'] = $params['categoria'];
        }
        
        if (isset($params['responsable']) && !empty($params['responsable'])) {
            $whereParams['responsable'] = '%' . $params['responsable'] . '%';
        }
        
        if (isset($params['fecha_desde'])) {
            $whereParams['fecha_desde'] = $params['fecha_desde'];
        }
        
        if (isset($params['fecha_hasta'])) {
            $whereParams['fecha_hasta'] = $params['fecha_hasta'];
        }
        
        if (isset($params['monto_min']) && is_numeric($params['monto_min'])) {
            $whereParams['monto_min'] = floatval($params['monto_min']);
        }
        
        if (isset($params['monto_max']) && is_numeric($params['monto_max'])) {
            $whereParams['monto_max'] = floatval($params['monto_max']);
        }
        
        if (isset($params['mes']) && isset($params['año'])) {
            $whereParams['mes'] = intval($params['mes']);
            $whereParams['año'] = intval($params['año']);
        } elseif (isset($params['año'])) {
            $whereParams['año'] = intval($params['año']);
        }
        
        return $whereParams;
    }
    
    protected function afterGet($data) {
        // Convertir valores numéricos para el frontend
        foreach ($data as &$gasto) {
            $gasto['monto'] = floatval($gasto['monto']);
        }
        
        return $data;
    }
    
    /**
     * Obtener estadísticas de gastos por período
     */
    public function getStatsByPeriod($fechaDesde, $fechaHasta) {
        try {
            $query = "SELECT 
                        COUNT(*) as total_gastos,
                        SUM(monto) as total_gastado,
                        AVG(monto) as gasto_promedio,
                        categoria,
                        COUNT(*) as gastos_por_categoria,
                        SUM(monto) as total_por_categoria
                     FROM {$this->table} 
                     WHERE fecha_gasto BETWEEN :fecha_desde AND :fecha_hasta
                     GROUP BY categoria";
            
            $categorias = $this->db->select($query, [
                'fecha_desde' => $fechaDesde,
                'fecha_hasta' => $fechaHasta
            ]);
            
            // Obtener totales generales
            $queryTotal = "SELECT 
                            COUNT(*) as total_gastos,
                            SUM(monto) as total_gastado,
                            AVG(monto) as gasto_promedio,
                            COUNT(DISTINCT responsable) as responsables_unicos
                         FROM {$this->table} 
                         WHERE fecha_gasto BETWEEN :fecha_desde AND :fecha_hasta";
            
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
                    'gastos' => intval($totales[0]['total_gastos']),
                    'monto_total' => floatval($totales[0]['total_gastado']),
                    'gasto_promedio' => floatval($totales[0]['gasto_promedio']),
                    'responsables_unicos' => intval($totales[0]['responsables_unicos'])
                ],
                'categorias' => []
            ];
            
            foreach ($categorias as $categoria) {
                $result['categorias'][$categoria['categoria']] = [
                    'gastos' => intval($categoria['gastos_por_categoria']),
                    'total' => floatval($categoria['total_por_categoria']),
                    'promedio' => floatval($categoria['total_por_categoria']) / intval($categoria['gastos_por_categoria'])
                ];
            }
            
            return $result;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener estadísticas por período: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener resumen mensual de gastos
     */
    public function getMonthlyReport($año = null, $mes = null) {
        try {
            $año = $año ?: date('Y');
            $mes = $mes ?: date('n');
            
            $query = "SELECT 
                        DAY(fecha_gasto) as dia,
                        COUNT(*) as total_gastos,
                        SUM(monto) as total_monto,
                        categoria,
                        SUM(monto) as monto_categoria
                     FROM {$this->table} 
                     WHERE YEAR(fecha_gasto) = :año AND MONTH(fecha_gasto) = :mes
                     GROUP BY DAY(fecha_gasto), categoria
                     ORDER BY DAY(fecha_gasto), categoria";
            
            $data = $this->db->select($query, ['año' => $año, 'mes' => $mes]);
            
            // Organizar datos por día
            $reporte = [
                'año' => intval($año),
                'mes' => intval($mes),
                'dias' => [],
                'totales' => ['gastos' => 0, 'monto' => 0],
                'categorias_totales' => []
            ];
            
            foreach ($data as $row) {
                $dia = intval($row['dia']);
                $categoria = $row['categoria'];
                
                if (!isset($reporte['dias'][$dia])) {
                    $reporte['dias'][$dia] = [
                        'gastos' => 0,
                        'monto' => 0,
                        'categorias' => []
                    ];
                }
                
                $reporte['dias'][$dia]['gastos'] += 1;
                $reporte['dias'][$dia]['monto'] += floatval($row['monto_categoria']);
                $reporte['dias'][$dia]['categorias'][$categoria] = floatval($row['monto_categoria']);
                
                $reporte['totales']['gastos'] += 1;
                $reporte['totales']['monto'] += floatval($row['monto_categoria']);
                
                if (!isset($reporte['categorias_totales'][$categoria])) {
                    $reporte['categorias_totales'][$categoria] = 0;
                }
                $reporte['categorias_totales'][$categoria] += floatval($row['monto_categoria']);
            }
            
            return $reporte;
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener reporte mensual: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener gastos por categoría
     */
    public function getByCategory($categoria, $fechaDesde = null, $fechaHasta = null) {
        try {
            $whereClause = 'WHERE categoria = :categoria';
            $params = ['categoria' => $categoria];
            
            if ($fechaDesde && $fechaHasta) {
                $whereClause .= ' AND fecha_gasto BETWEEN :fecha_desde AND :fecha_hasta';
                $params['fecha_desde'] = $fechaDesde;
                $params['fecha_hasta'] = $fechaHasta;
            }
            
            $query = "SELECT * FROM {$this->table} {$whereClause} ORDER BY fecha_gasto DESC, monto DESC";
            $data = $this->db->select($query, $params);
            
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener gastos por categoría: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener top gastos por monto
     */
    public function getTopByAmount($limit = 10, $fechaDesde = null, $fechaHasta = null) {
        try {
            $whereClause = '';
            $params = ['limit' => intval($limit)];
            
            if ($fechaDesde && $fechaHasta) {
                $whereClause = 'WHERE fecha_gasto BETWEEN :fecha_desde AND :fecha_hasta';
                $params['fecha_desde'] = $fechaDesde;
                $params['fecha_hasta'] = $fechaHasta;
            }
            
            $query = "SELECT * FROM {$this->table} {$whereClause} ORDER BY monto DESC LIMIT :limit";
            $data = $this->db->select($query, $params);
            
            return $this->afterGet($data);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener top gastos: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener comparativa de gastos por meses
     */
    public function getMonthComparison($meses = 6) {
        try {
            $query = "SELECT 
                        YEAR(fecha_gasto) as año,
                        MONTH(fecha_gasto) as mes,
                        COUNT(*) as total_gastos,
                        SUM(monto) as total_monto,
                        categoria,
                        SUM(monto) as monto_categoria
                     FROM {$this->table} 
                     WHERE fecha_gasto >= DATE_SUB(CURDATE(), INTERVAL :meses MONTH)
                     GROUP BY YEAR(fecha_gasto), MONTH(fecha_gasto), categoria
                     ORDER BY año DESC, mes DESC, categoria";
            
            $data = $this->db->select($query, ['meses' => intval($meses)]);
            
            // Organizar datos por mes
            $comparativa = [];
            
            foreach ($data as $row) {
                $clave = $row['año'] . '-' . sprintf('%02d', $row['mes']);
                
                if (!isset($comparativa[$clave])) {
                    $comparativa[$clave] = [
                        'año' => intval($row['año']),
                        'mes' => intval($row['mes']),
                        'total_gastos' => 0,
                        'total_monto' => 0,
                        'categorias' => []
                    ];
                }
                
                $comparativa[$clave]['total_gastos'] += 1;
                $comparativa[$clave]['total_monto'] += floatval($row['monto_categoria']);
                $comparativa[$clave]['categorias'][$row['categoria']] = floatval($row['monto_categoria']);
            }
            
            return array_values($comparativa);
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener comparativa mensual: " . $e->getMessage());
        }
    }
}
?>