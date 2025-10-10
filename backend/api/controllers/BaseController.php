<?php
/**
 * Controlador Base - Juguería El Mesías
 * Proporciona funcionalidad común para todos los controladores
 */

abstract class BaseController {
    protected $db;
    protected $table;
    protected $primaryKey = 'id';
    protected $createdAtField = 'created_at';
    protected $updatedAtField = 'updated_at';
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * Obtener todos los registros con paginación y filtros
     */
    public function getAll($params = []) {
        try {
            // Parámetros de paginación
            $page = isset($params['page']) ? max(1, intval($params['page'])) : 1;
            $limit = isset($params['limit']) ? min(100, max(1, intval($params['limit']))) : 20;
            $offset = ($page - 1) * $limit;
            
            // Construir WHERE clause
            $whereClause = $this->buildWhereClause($params);
            $whereParams = $this->buildWhereParams($params);
            
            // Query para contar total de registros
            $countQuery = "SELECT COUNT(*) as total FROM {$this->table} {$whereClause}";
            $totalResult = $this->db->select($countQuery, $whereParams);
            $total = $totalResult[0]['total'];
            
            // Query principal con paginación
            $query = "SELECT * FROM {$this->table} {$whereClause}";
            
            // Ordenamiento
            if (isset($params['sort'])) {
                $sortField = $this->db->sanitizeInput($params['sort']);
                $sortDirection = isset($params['order']) && strtoupper($params['order']) === 'DESC' ? 'DESC' : 'ASC';
                $query .= " ORDER BY {$sortField} {$sortDirection}";
            } else {
                $query .= " ORDER BY {$this->primaryKey} DESC";
            }
            
            // Límite y offset
            $query .= " LIMIT {$limit} OFFSET {$offset}";
            
            $data = $this->db->select($query, $whereParams);
            
            // Procesar datos después de obtenerlos
            $data = $this->afterGet($data);
            
            return [
                'data' => $data,
                'total' => intval($total),
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit),
                'table' => $this->table,
                'schema' => $this->getTableSchema()
            ];
            
        } catch (Exception $e) {
            throw new Exception("Error al obtener registros: " . $e->getMessage());
        }
    }
    
    /**
     * Obtener un registro por ID
     */
    public function getById($id) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id";
            $result = $this->db->select($query, ['id' => $id]);
            
            if (empty($result)) {
                throw new Exception("Registro no encontrado", 404);
            }
            
            $record = $result[0];
            return $this->afterGet([$record])[0];
            
        } catch (Exception $e) {
            if ($e->getMessage() === "Registro no encontrado") {
                throw $e;
            }
            throw new Exception("Error al obtener registro: " . $e->getMessage());
        }
    }
    
    /**
     * Crear un nuevo registro
     */
    public function create($data) {
        try {
            // Validar datos
            $this->validateData($data, 'create');
            
            // Preparar datos para inserción
            $data = $this->beforeCreate($data);
            
            // Generar ID si no existe
            if (!isset($data[$this->primaryKey])) {
                $data[$this->primaryKey] = $this->db->generateUUID();
            }
            
            // Agregar timestamps
            $data = $this->db->prepareInsertData($data, true, $this->getTimestampFields());
            
            // Construir query de inserción
            $fields = array_keys($data);
            $placeholders = array_map(function($field) { return ":$field"; }, $fields);
            
            $query = "INSERT INTO {$this->table} (" . implode(', ', $fields) . ") 
                     VALUES (" . implode(', ', $placeholders) . ")";
            
            $this->db->insert($query, $data);
            
            // Obtener el registro creado
            $created = $this->getById($data[$this->primaryKey]);
            
            // Procesar después de crear
            return $this->afterCreate($created);
            
        } catch (Exception $e) {
            throw new Exception("Error al crear registro: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar un registro completamente (PUT)
     */
    public function update($id, $data) {
        try {
            // Verificar que el registro existe
            $existing = $this->getById($id);
            
            // Validar datos
            $this->validateData($data, 'update');
            
            // Preparar datos
            $data = $this->beforeUpdate($data, $existing);
            $data = $this->db->prepareUpdateData($data, $this->getTimestampFields());
            
            // Asegurar que el ID no se modifique
            unset($data[$this->primaryKey]);
            
            // Construir query de actualización
            $fields = array_keys($data);
            $setClause = implode(', ', array_map(function($field) { 
                return "$field = :$field"; 
            }, $fields));
            
            $query = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = :id";
            $data['id'] = $id;
            
            $this->db->update($query, $data);
            
            // Obtener el registro actualizado
            $updated = $this->getById($id);
            
            return $this->afterUpdate($updated, $existing);
            
        } catch (Exception $e) {
            throw new Exception("Error al actualizar registro: " . $e->getMessage());
        }
    }
    
    /**
     * Actualizar un registro parcialmente (PATCH)
     */
    public function patch($id, $data) {
        try {
            // Verificar que el registro existe
            $existing = $this->getById($id);
            
            // Filtrar solo campos que existen en la tabla
            $data = $this->filterValidFields($data);
            
            if (empty($data)) {
                throw new Exception("No hay campos válidos para actualizar");
            }
            
            // Preparar datos
            $data = $this->beforeUpdate($data, $existing);
            $data = $this->db->prepareUpdateData($data, $this->getTimestampFields());
            
            // Asegurar que el ID no se modifique
            unset($data[$this->primaryKey]);
            
            // Construir query de actualización
            $fields = array_keys($data);
            $setClause = implode(', ', array_map(function($field) { 
                return "$field = :$field"; 
            }, $fields));
            
            $query = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = :id";
            $data['id'] = $id;
            
            $this->db->update($query, $data);
            
            // Obtener el registro actualizado
            $updated = $this->getById($id);
            
            return $this->afterUpdate($updated, $existing);
            
        } catch (Exception $e) {
            throw new Exception("Error al actualizar registro: " . $e->getMessage());
        }
    }
    
    /**
     * Eliminar un registro (soft delete)
     */
    public function delete($id) {
        try {
            // Verificar que el registro existe
            $existing = $this->getById($id);
            
            // Preparar para eliminación
            $this->beforeDelete($existing);
            
            // Soft delete si la tabla tiene campo 'activo' o 'deleted'
            $tableSchema = $this->getTableSchema();
            $hasActiveField = in_array('activo', array_column($tableSchema, 'Field'));
            $hasDeletedField = in_array('deleted', array_column($tableSchema, 'Field'));
            
            if ($hasActiveField) {
                $query = "UPDATE {$this->table} SET activo = 0, updated_at = NOW() WHERE {$this->primaryKey} = :id";
                $this->db->update($query, ['id' => $id]);
            } elseif ($hasDeletedField) {
                $query = "UPDATE {$this->table} SET deleted = 1, deleted_at = NOW() WHERE {$this->primaryKey} = :id";
                $this->db->update($query, ['id' => $id]);
            } else {
                // Hard delete si no hay campos de soft delete
                $query = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id";
                $this->db->delete($query, ['id' => $id]);
            }
            
            $this->afterDelete($existing);
            
            return [
                'message' => 'Registro eliminado exitosamente',
                'deleted_record' => $existing
            ];
            
        } catch (Exception $e) {
            throw new Exception("Error al eliminar registro: " . $e->getMessage());
        }
    }
    
    // Métodos abstractos que deben ser implementados por cada controlador
    abstract protected function validateData($data, $operation);
    
    // Métodos que pueden ser sobrescritos por controladores específicos
    protected function buildWhereClause($params) {
        $conditions = [];
        
        // Búsqueda por texto
        if (isset($params['search']) && !empty($params['search'])) {
            $searchableFields = $this->getSearchableFields();
            if (!empty($searchableFields)) {
                $searchConditions = array_map(function($field) {
                    return "$field LIKE :search";
                }, $searchableFields);
                $conditions[] = '(' . implode(' OR ', $searchConditions) . ')';
            }
        }
        
        // Filtros específicos
        $customConditions = $this->getCustomWhereConditions($params);
        $conditions = array_merge($conditions, $customConditions);
        
        return empty($conditions) ? '' : 'WHERE ' . implode(' AND ', $conditions);
    }
    
    protected function buildWhereParams($params) {
        $whereParams = [];
        
        // Parámetro de búsqueda
        if (isset($params['search']) && !empty($params['search'])) {
            $whereParams['search'] = '%' . $params['search'] . '%';
        }
        
        // Parámetros personalizados
        $customParams = $this->getCustomWhereParams($params);
        $whereParams = array_merge($whereParams, $customParams);
        
        return $whereParams;
    }
    
    protected function getSearchableFields() {
        return ['nombre']; // Campo por defecto
    }
    
    protected function getCustomWhereConditions($params) {
        return [];
    }
    
    protected function getCustomWhereParams($params) {
        return [];
    }
    
    protected function filterValidFields($data) {
        // Por defecto, retorna todos los campos
        // Los controladores específicos pueden sobrescribir esto
        return $data;
    }
    
    protected function beforeCreate($data) {
        return $this->db->sanitizeInput($data);
    }
    
    protected function beforeUpdate($data, $existing) {
        return $this->db->sanitizeInput($data);
    }
    
    protected function beforeDelete($existing) {
        // Implementar validaciones antes de eliminar si es necesario
    }
    
    protected function afterGet($data) {
        return $data;
    }
    
    protected function afterCreate($record) {
        return $record;
    }
    
    protected function afterUpdate($record, $previous) {
        return $record;
    }
    
    protected function afterDelete($record) {
        // Implementar acciones después de eliminar si es necesario
    }
    
    protected function getTableSchema() {
        try {
            $query = "DESCRIBE {$this->table}";
            return $this->db->select($query);
        } catch (Exception $e) {
            return [];
        }
    }

    protected function getTimestampFields() {
        return [
            'created' => $this->createdAtField,
            'updated' => $this->updatedAtField
        ];
    }
}
?>
