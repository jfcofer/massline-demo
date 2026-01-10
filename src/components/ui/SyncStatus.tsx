import React from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface SyncStatusProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSyncClick?: () => void;
  variant?: 'badge' | 'bar';
}

/**
 * Componente que muestra el estado de conexión y sincronización
 *
 * Variantes:
 * - badge: Pequeño indicador para esquinas (default)
 * - bar: Barra completa para mostrar en headers
 */
export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  onSyncClick,
  variant = 'badge',
}) => {
  if (variant === 'bar') {
    // Barra completa - solo mostrar si hay algo relevante
    if (isOnline && pendingCount === 0 && !isSyncing) {
      return null;
    }

    return (
      <div
        className={`px-4 py-2 flex items-center justify-between text-sm ${
          isOnline
            ? 'bg-primary/10 text-primary'
            : 'bg-warning-bg text-warning-dark'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>
            {!isOnline
              ? 'Sin conexión - Los cambios se guardarán localmente'
              : isSyncing
              ? 'Sincronizando...'
              : pendingCount > 0
              ? `${pendingCount} cambio${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}`
              : 'Conectado'}
          </span>
        </div>

        {isOnline && pendingCount > 0 && !isSyncing && onSyncClick && (
          <button
            onClick={onSyncClick}
            className="flex items-center gap-1 text-primary font-medium hover:underline"
          >
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </button>
        )}

        {isSyncing && (
          <RefreshCw className="w-4 h-4 animate-spin" />
        )}
      </div>
    );
  }

  // Badge pequeño
  return (
    <button
      onClick={onSyncClick}
      disabled={!isOnline || isSyncing}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        !isOnline
          ? 'bg-warning-bg text-warning-dark'
          : pendingCount > 0
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'bg-success-bg text-success'
      }`}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Sincronizando</span>
        </>
      ) : !isOnline ? (
        <>
          <CloudOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <Cloud className="w-3 h-3" />
          <span>{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</span>
        </>
      ) : (
        <>
          <Cloud className="w-3 h-3" />
          <span>Sincronizado</span>
        </>
      )}
    </button>
  );
};

export default SyncStatus;