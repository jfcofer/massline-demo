import Dexie, { type Table } from 'dexie';

// Tipos para operaciones pendientes de sincronización
export interface PendingOperation {
  id?: number;
  type: 'reception' | 'dispatch' | 'inventory_adjustment';
  data: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'failed';
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

// Tipos para datos cacheados localmente
export interface CachedProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  location: string;
  price: number;
  lastUpdated: Date;
}

export interface CachedOrder {
  id: string;
  orderNumber: string;
  type: 'purchase' | 'sale' | 'transfer';
  status: string;
  supplier?: string;
  products: Array<{
    productId: string;
    quantity: number;
    received?: number;
  }>;
  createdAt: Date;
  lastUpdated: Date;
}

// Clase de la base de datos
class SmartStockDB extends Dexie {
  pendingOperations!: Table<PendingOperation>;
  cachedProducts!: Table<CachedProduct>;
  cachedOrders!: Table<CachedOrder>;

  constructor() {
    super('SmartStockDB');

    // Definir esquema de la base de datos
    this.version(1).stores({
      pendingOperations: '++id, type, status, createdAt',
      cachedProducts: 'id, sku, category, location',
      cachedOrders: 'id, orderNumber, type, status',
    });
  }
}

// Instancia única de la base de datos
export const db = new SmartStockDB();

// Funciones helper para operaciones comunes
export const offlineDB = {
  // === OPERACIONES PENDIENTES ===

  /**
   * Agregar una operación a la cola de sincronización
   */
  async addPendingOperation(
    type: PendingOperation['type'],
    data: Record<string, unknown>
  ): Promise<number> {
    const id = await db.pendingOperations.add({
      type,
      data,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
    });
    return id as number;
  },

  /**
   * Obtener todas las operaciones pendientes
   */
  async getPendingOperations(): Promise<PendingOperation[]> {
    return db.pendingOperations
      .where('status')
      .anyOf(['pending', 'failed'])
      .toArray();
  },

  /**
   * Marcar operación como sincronizada (y eliminarla)
   */
  async markAsSynced(id: number): Promise<void> {
    await db.pendingOperations.delete(id);
  },

  /**
   * Marcar operación como fallida
   */
  async markAsFailed(id: number, error: string): Promise<void> {
    const op = await db.pendingOperations.get(id);
    if (op) {
      await db.pendingOperations.update(id, {
        status: 'failed',
        retryCount: op.retryCount + 1,
        lastError: error,
      });
    }
  },

  /**
   * Contar operaciones pendientes
   */
  async countPending(): Promise<number> {
    return db.pendingOperations
      .where('status')
      .anyOf(['pending', 'failed'])
      .count();
  },

  // === CACHE DE PRODUCTOS ===

  /**
   * Guardar productos en cache local
   */
  async cacheProducts(products: CachedProduct[]): Promise<void> {
    const withTimestamp = products.map(p => ({
      ...p,
      lastUpdated: new Date(),
    }));
    await db.cachedProducts.bulkPut(withTimestamp);
  },

  /**
   * Obtener producto del cache por SKU
   */
  async getProductBySku(sku: string): Promise<CachedProduct | undefined> {
    return db.cachedProducts.where('sku').equals(sku).first();
  },

  /**
   * Buscar productos en cache
   */
  async searchProducts(query: string): Promise<CachedProduct[]> {
    const lowerQuery = query.toLowerCase();
    return db.cachedProducts
      .filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.sku.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  },

  // === CACHE DE ÓRDENES ===

  /**
   * Guardar orden en cache local
   */
  async cacheOrder(order: CachedOrder): Promise<void> {
    await db.cachedOrders.put({
      ...order,
      lastUpdated: new Date(),
    });
  },

  /**
   * Obtener orden del cache por número
   */
  async getOrderByNumber(orderNumber: string): Promise<CachedOrder | undefined> {
    return db.cachedOrders.where('orderNumber').equals(orderNumber).first();
  },

  // === UTILIDADES ===

  /**
   * Limpiar cache antiguo (más de 7 días)
   */
  async cleanOldCache(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    await db.cachedProducts
      .where('lastUpdated')
      .below(sevenDaysAgo)
      .delete();

    await db.cachedOrders
      .where('lastUpdated')
      .below(sevenDaysAgo)
      .delete();
  },

  /**
   * Limpiar toda la base de datos (para logout)
   */
  async clearAll(): Promise<void> {
    await db.pendingOperations.clear();
    await db.cachedProducts.clear();
    await db.cachedOrders.clear();
  },
};