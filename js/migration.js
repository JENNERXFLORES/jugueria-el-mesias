/**
 * Script de Migración - Juguería El Mesías
 * Ayuda a migrar datos del localStorage al servidor MySQL
 */

class DataMigration {
    constructor() {
        this.localStorageKeys = [
            'elMesiasUsers',
            'elMesiasProducts', 
            'elMesiasOrders',
            'elMesiasSales',
            'elMesiasExpenses',
            'elMesiasPromotions',
            'elMesiasCart'
        ];
    }

    /**
     * Verificar si hay datos en localStorage
     */
    hasLocalData() {
        return this.localStorageKeys.some(key => {
            const data = localStorage.getItem(key);
            return data && JSON.parse(data).length > 0;
        });
    }

    /**
     * Obtener todos los datos del localStorage
     */
    getLocalData() {
        const data = {};
        
        this.localStorageKeys.forEach(key => {
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    data[key] = JSON.parse(stored);
                } catch (e) {
                    console.warn(`Error parsing ${key}:`, e);
                    data[key] = [];
                }
            } else {
                data[key] = [];
            }
        });

        return data;
    }

    /**
     * Mapear datos del localStorage al formato de la base de datos
     */
    mapLocalDataToDBFormat(localData) {
        const mapped = {
            usuarios: [],
            productos: [],
            pedidos: [],
            ventas: [],
            gastos: [],
            promociones: []
        };

        // Mapear usuarios
        if (localData.elMesiasUsers) {
            mapped.usuarios = localData.elMesiasUsers.map(user => ({
                id: user.id,
                nombre: user.name || user.nombre,
                email: user.email,
                telefono: user.phone || user.telefono,
                tipo: user.type || user.tipo || 'cliente',
                direccion: user.address || user.direccion,
                activo: true,
                password: 'password123' // Contraseña temporal
            }));
        }

        // Mapear productos
        if (localData.elMesiasProducts) {
            mapped.productos = localData.elMesiasProducts.map(product => ({
                id: product.id,
                nombre: product.name || product.nombre,
                categoria: product.category || product.categoria,
                precio: parseFloat(product.price || product.precio),
                descripcion: product.description || product.descripcion,
                imagen_url: product.image || product.imagen_url,
                disponible: product.available !== false,
                promocion: product.promotion || false,
                precio_promocion: product.promotionPrice || null,
                ingredientes: product.ingredients || product.ingredientes
            }));
        }

        // Mapear pedidos
        if (localData.elMesiasOrders) {
            mapped.pedidos = localData.elMesiasOrders.map(order => ({
                id: order.id,
                cliente_id: null, // No hay relación directa
                cliente_nombre: order.customerName || order.cliente_nombre || 'Cliente Migrado',
                tipo_pedido: order.type === 'local' ? 'local' : 'online',
                estado: order.status || order.estado || 'pendiente',
                subtotal: parseFloat(order.subtotal || 0),
                descuento: parseFloat(order.discount || order.descuento || 0),
                total: parseFloat(order.total || order.subtotal || 0),
                metodo_pago: order.paymentMethod || order.metodo_pago || 'efectivo',
                pagado: order.paid || false,
                fecha_pedido: order.date || order.fecha_pedido || new Date().toISOString(),
                observaciones: order.notes || order.observaciones
            }));
        }

        // Mapear ventas
        if (localData.elMesiasSales) {
            mapped.ventas = localData.elMesiasSales.map(sale => ({
                id: sale.id,
                pedido_id: sale.orderId || sale.pedido_id,
                vendedor_id: null,
                vendedor_nombre: sale.sellerName || sale.vendedor_nombre || 'Vendedor Migrado',
                cliente_nombre: sale.customerName || sale.cliente_nombre || 'Cliente Migrado',
                subtotal: parseFloat(sale.subtotal || 0),
                descuento: parseFloat(sale.discount || sale.descuento || 0),
                total: parseFloat(sale.total || 0),
                metodo_pago: sale.paymentMethod || sale.metodo_pago || 'efectivo',
                turno: sale.shift || sale.turno || 'mañana',
                fecha_venta: sale.date || sale.fecha_venta || new Date().toISOString()
            }));
        }

        // Mapear gastos
        if (localData.elMesiasExpenses) {
            mapped.gastos = localData.elMesiasExpenses.map(expense => ({
                id: expense.id,
                concepto: expense.concept || expense.concepto || 'Gasto migrado',
                categoria: expense.category || expense.categoria || 'otros',
                monto: parseFloat(expense.amount || expense.monto || 0),
                fecha_gasto: expense.date || expense.fecha_gasto || new Date().toISOString().split('T')[0],
                responsable: expense.responsible || expense.responsable || 'Migración',
                comprobante: expense.receipt || expense.comprobante,
                observaciones: expense.notes || expense.observaciones
            }));
        }

        return mapped;
    }

    /**
     * Migrar datos al servidor MySQL
     */
    async migrateToMySQL(onProgress = null) {
        try {
            const localData = this.getLocalData();
            const dbData = this.mapLocalDataToDBFormat(localData);
            
            const results = {
                success: 0,
                errors: 0,
                details: []
            };

            const tables = Object.keys(dbData);
            let completed = 0;

            for (const table of tables) {
                const items = dbData[table];
                
                if (items.length === 0) {
                    if (onProgress) onProgress(++completed / tables.length * 100, `Saltando ${table} (sin datos)`);
                    continue;
                }

                if (onProgress) onProgress(completed / tables.length * 100, `Migrando ${table} (${items.length} registros)`);

                try {
                    // Migrar cada elemento individualmente para mejor control de errores
                    for (const item of items) {
                        try {
                            await api.post(`tables/${table}`, item);
                            results.success++;
                        } catch (error) {
                            console.warn(`Error migrando ${table} item:`, error, item);
                            results.errors++;
                            results.details.push({
                                table,
                                item: item.id || 'unknown',
                                error: error.message
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Error migrando tabla ${table}:`, error);
                    results.errors += items.length;
                    results.details.push({
                        table,
                        error: error.message
                    });
                }

                if (onProgress) onProgress(++completed / tables.length * 100, `Completado ${table}`);
            }

            return results;

        } catch (error) {
            console.error('Error en migración:', error);
            throw error;
        }
    }

    /**
     * Crear backup del localStorage antes de limpiar
     */
    createLocalStorageBackup() {
        const backup = this.getLocalData();
        const backupString = JSON.stringify(backup, null, 2);
        
        // Crear archivo de descarga
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `elmesias_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        return backup;
    }

    /**
     * Limpiar localStorage después de migración exitosa
     */
    clearLocalStorage() {
        this.localStorageKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('LocalStorage limpiado después de migración exitosa');
    }

    /**
     * Mostrar modal de migración
     */
    showMigrationModal() {
        if (!this.hasLocalData()) {
            return false;
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 class="text-lg font-bold mb-4">🔄 Migración de Datos</h3>
                <p class="mb-4">Se han detectado datos guardados localmente. ¿Deseas migrarlos al nuevo sistema MySQL?</p>
                
                <div class="mb-4">
                    <h4 class="font-semibold">Datos encontrados:</h4>
                    <ul class="text-sm text-gray-600 ml-4">
                        ${this._getLocalDataSummary()}
                    </ul>
                </div>

                <div id="migrationProgress" class="hidden mb-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div id="progressBar" class="bg-blue-600 h-2 rounded-full transition-all" style="width: 0%"></div>
                    </div>
                    <p id="progressText" class="text-sm text-gray-600 mt-1">Iniciando migración...</p>
                </div>

                <div class="flex space-x-3">
                    <button id="startMigration" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Migrar Datos
                    </button>
                    <button id="skipMigration" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                        Saltar
                    </button>
                    <button id="downloadBackup" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Descargar Backup
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#startMigration').addEventListener('click', () => this._handleMigration(modal));
        modal.querySelector('#skipMigration').addEventListener('click', () => modal.remove());
        modal.querySelector('#downloadBackup').addEventListener('click', () => this.createLocalStorageBackup());

        return true;
    }

    /**
     * Obtener resumen de datos locales
     */
    _getLocalDataSummary() {
        const data = this.getLocalData();
        const summary = [];

        Object.keys(data).forEach(key => {
            if (data[key].length > 0) {
                const tableName = key.replace('elMesias', '').toLowerCase();
                summary.push(`<li>${tableName}: ${data[key].length} registros</li>`);
            }
        });

        return summary.join('');
    }

    /**
     * Manejar el proceso de migración
     */
    async _handleMigration(modal) {
        const progressDiv = modal.querySelector('#migrationProgress');
        const progressBar = modal.querySelector('#progressBar');
        const progressText = modal.querySelector('#progressText');
        const buttons = modal.querySelectorAll('button');

        // Deshabilitar botones y mostrar progreso
        buttons.forEach(btn => btn.disabled = true);
        progressDiv.classList.remove('hidden');

        try {
            const results = await this.migrateToMySQL((progress, text) => {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = text;
            });

            progressText.textContent = `Migración completada: ${results.success} exitosos, ${results.errors} errores`;
            
            if (results.success > 0 && results.errors === 0) {
                // Migración exitosa, ofrecer limpiar localStorage
                if (confirm('Migración exitosa. ¿Deseas limpiar los datos locales?')) {
                    this.clearLocalStorage();
                }
                
                Utils.showToast('Migración completada exitosamente', 'success');
                modal.remove();
                
                // Recargar página para usar datos de MySQL
                if (confirm('¿Recargar página para ver los datos migrados?')) {
                    window.location.reload();
                }
            } else {
                progressText.innerHTML = `Migración con errores. <a href="#" onclick="console.log(${JSON.stringify(results.details)})" class="text-blue-500">Ver detalles</a>`;
                buttons[1].disabled = false; // Habilitar botón Saltar
            }

        } catch (error) {
            progressText.textContent = `Error en migración: ${error.message}`;
            buttons.forEach(btn => btn.disabled = false);
            console.error('Migration error:', error);
        }
    }
}

// Crear instancia global
window.DataMigration = DataMigration;

// Auto-mostrar modal de migración cuando se use MySQL
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que se cargue la configuración
    setTimeout(() => {
        if (window.isUsingMySQL && window.isUsingMySQL()) {
            const migration = new DataMigration();
            migration.showMigrationModal();
        }
    }, 1000);
});