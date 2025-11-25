import React from 'react';
import { MapPin, Circle, ArrowRightCircle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { colors } from '../../constants/theme';

type ItemStatus = 'pending' | 'current' | 'picked' | 'partial' | 'not_found';

interface PickingItem {
  productName: string;
  productSku: string;
  productImage: string;
  requestedQuantity: number;
  pickedQuantity: number;
  locationCode: string;
  distance?: number;
  status: ItemStatus;
}

interface PickingListItemProps {
  item: PickingItem;
  index: number;
  onPress?: () => void;
}

const statusConfig: Record<
  ItemStatus,
  { color: string; Icon: typeof Circle; label: string }
> = {
  pending: { color: colors.gray300, Icon: Circle, label: 'Pendiente' },
  current: { color: colors.primary500, Icon: ArrowRightCircle, label: 'Actual' },
  picked: { color: colors.success, Icon: CheckCircle, label: 'Completado' },
  partial: { color: colors.warning, Icon: AlertCircle, label: 'Parcial' },
  not_found: { color: colors.error, Icon: XCircle, label: 'No encontrado' },
};

export const PickingListItem: React.FC<PickingListItemProps> = ({
  item,
  index,
  onPress,
}) => {
  const config = statusConfig[item.status];
  const Icon = config.Icon;

  return (
    <button
      onClick={onPress}
      className="flex items-center w-full bg-white rounded-xl p-3 mb-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left"
      style={{ borderLeftWidth: 4, borderLeftColor: config.color }}
    >
      {/* Index */}
      <div className="w-6 flex items-center justify-center">
        <span
          className="text-sm font-bold"
          style={{ color: config.color }}
        >
          {index + 1}
        </span>
      </div>

      {/* Product Image */}
      <img
        src={item.productImage}
        alt={item.productName}
        className="w-12 h-12 rounded-md bg-gray-100 object-cover ml-2 flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 ml-3 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate-2-lines">
          {item.productName}
        </h3>
        <p className="text-xs text-gray-500 font-mono mt-0.5">{item.productSku}</p>

        <div className="flex items-center mt-1">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-blue-600 ml-1 font-mono">
            {item.locationCode}
          </span>
          {item.distance && (
            <span className="text-xs text-gray-500 ml-1">({item.distance}m)</span>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="flex flex-col items-center bg-gray-100 px-3 py-1.5 rounded-lg mr-2">
        <span className="text-lg font-bold text-gray-900">
          {item.requestedQuantity}
        </span>
        <span className="text-[10px] text-gray-500">unid.</span>
      </div>

      {/* Status Icon */}
      <Icon className="w-6 h-6 flex-shrink-0" style={{ color: config.color }} />
    </button>
  );
};
