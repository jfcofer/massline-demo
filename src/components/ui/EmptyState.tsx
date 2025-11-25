import React from 'react';
import { Clipboard, Search, Package, CloudOff, type LucideIcon } from 'lucide-react';
import Button from './Button';

type EmptyStateType = 'no_orders' | 'no_results' | 'no_stock' | 'offline';

interface EmptyStateConfig {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
}

const configs: Record<EmptyStateType, EmptyStateConfig> = {
  no_orders: {
    Icon: Clipboard,
    title: '¡Todo al día!',
    description: 'No hay órdenes pendientes',
    actionLabel: 'Actualizar',
  },
  no_results: {
    Icon: Search,
    title: 'Sin resultados',
    description: 'No se encontraron productos para tu búsqueda',
    actionLabel: 'Limpiar búsqueda',
  },
  no_stock: {
    Icon: Package,
    title: 'Sin stock',
    description: 'Este producto no está disponible actualmente',
    actionLabel: 'Notificarme',
  },
  offline: {
    Icon: CloudOff,
    title: 'Sin conexión',
    description:
      'Trabajando en modo offline. Los cambios se sincronizarán al reconectar.',
    actionLabel: 'Reintentar',
  },
};

interface EmptyStateProps {
  type: EmptyStateType;
  customTitle?: string;
  customDescription?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  customTitle,
  customDescription,
  onAction,
}) => {
  const config = configs[type];
  const Icon = config.Icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        <Icon className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
      </div>

      <h2 className="text-xl font-bold text-gray-700 mb-2">
        {customTitle || config.title}
      </h2>

      <p className="text-sm text-gray-500 max-w-md leading-5 mb-6">
        {customDescription || config.description}
      </p>

      {config.actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
