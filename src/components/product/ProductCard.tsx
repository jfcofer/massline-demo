import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { colors } from '../../constants/theme';

interface Product {
  id: string;
  sku: string;
  name: string;
  thumbnailImage: string;
  totalStock: number;
  locationCount: number;
  status: 'ok' | 'low' | 'critical';
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  variant?: 'compact' | 'detailed';
}

const statusColors = {
  ok: colors.success,
  low: colors.warning,
  critical: colors.error,
};

const statusLabels = {
  ok: 'Disponible',
  low: 'Stock bajo',
  critical: 'Crítico',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
}) => {
  return (
    <button
      onClick={onPress}
      className="flex items-center w-full bg-white rounded-xl p-3 mb-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left"
    >
      <img
        src={product.thumbnailImage}
        alt={product.name}
        className="w-14 h-14 rounded-lg bg-gray-100 object-cover flex-shrink-0"
      />

      <div className="flex-1 ml-3 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate-2-lines">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 font-mono mt-0.5">{product.sku}</p>

        <div className="flex items-center mt-2">
          <div className="flex items-center gap-1 flex-1">
            <span className="text-sm text-gray-500">Stock:</span>
            <span className="text-sm font-semibold text-gray-700">
              {product.totalStock} unidades
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl ml-2"
            style={{
              backgroundColor: `${statusColors[product.status]}20`,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColors[product.status] }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: statusColors[product.status] }}
            >
              {statusLabels[product.status]}
            </span>
          </div>
        </div>

        <div className="flex items-center mt-1 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 mr-1" />
          <span>{product.locationCount} ubicaciones</span>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-300 ml-2 flex-shrink-0" />
    </button>
  );
};
