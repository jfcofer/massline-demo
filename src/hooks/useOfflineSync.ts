import { useState, useEffect, useCallback } from 'react';
import { offlineDB, type PendingOperation } from '../services/db';

interface UseOfflineSyncReturn {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncError: string | null;
  queueOperation: (type: PendingOperation['type'], data: Record<string, unknown>) => Promise<number>;
  syncNow: () => Promise<void>;
}

/**
 * Hook para manejar operaciones offline y sincronización automática
 *
 * Uso:
 * ```tsx
 * const { isOnline, pendingCount, queueOperation } = useOfflineSync();
 *
 * const handleSaveReception = async (data) => {
 *   await queueOperation('reception', data);
 *   // Si hay internet, se sincroniza automáticamente
 *   // Si no hay, se guarda localmente y se sincroniza cuando vuelva
 * };
 * ```
 */
export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Actualizar contador de operaciones pendientes
  const updatePendingCount = useCallback(async () => {
    const count = await offlineDB.countPending();
    setPendingCount(count);
  }, []);

  // Función para sincronizar una operación con el servidor
  const syncOperation = async (operation: PendingOperation): Promise<boolean> => {
    // TODO: Reemplazar con llamadas reales a la API cuando exista el backend
    // Por ahora simula el envío

    try {
      // Simular llamada a API
      console.log(`[Sync] Enviando operación ${operation.type}:`, operation.data);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simular éxito (en producción, aquí iría el fetch real)
      // const response = await fetch(`/api/${operation.type}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(operation.data),
      // });
      // if (!response.ok) throw new Error('Error del servidor');

      console.log(`[Sync] Operación ${operation.id} sincronizada exitosamente`);
      return true;
    } catch (error) {
      console.error(`[Sync] Error sincronizando operación ${operation.id}:`, error);
      return false;
    }
  };

  // Sincronizar todas las operaciones pendientes
  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    setLastSyncError(null);

    try {
      const pendingOps = await offlineDB.getPendingOperations();

      for (const op of pendingOps) {
        if (!op.id) continue;

        const success = await syncOperation(op);

        if (success) {
          await offlineDB.markAsSynced(op.id);
        } else {
          await offlineDB.markAsFailed(op.id, 'Error de sincronización');
        }
      }

      await updatePendingCount();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setLastSyncError(errorMsg);
      console.error('[Sync] Error general:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updatePendingCount]);

  // Agregar operación a la cola
  const queueOperation = useCallback(async (
    type: PendingOperation['type'],
    data: Record<string, unknown>
  ): Promise<number> => {
    const id = await offlineDB.addPendingOperation(type, data);
    await updatePendingCount();

    // Si hay internet, intentar sincronizar inmediatamente
    if (navigator.onLine) {
      // Pequeño delay para que la UI se actualice primero
      setTimeout(() => syncNow(), 100);
    }

    return id;
  }, [updatePendingCount, syncNow]);

  // Listeners para cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Conexión restaurada');
      setIsOnline(true);
      // Sincronizar automáticamente al volver online
      syncNow();
    };

    const handleOffline = () => {
      console.log('[Network] Sin conexión');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar contador inicial
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow, updatePendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncError,
    queueOperation,
    syncNow,
  };
}
