import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, MapPin, ChevronDown, Camera, Minus, Plus } from 'lucide-react';
import MockQRScanner from '../components/scanner/MockQRScanner';
import Button from '../components/ui/Button';
import { mockOrders, type PickingItem } from '../data/mockData';

type ScanStep = 'location' | 'product' | 'quantity' | null;

const PickingProcess: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Find the order
  const order = mockOrders.find(o => o.id === orderId);
  if (!order) {
    return <div>Order not found</div>;
  }

  const [items, setItems] = useState<PickingItem[]>(order.items);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>(null);
  const [quantity, setQuantity] = useState(0);

  const currentItem = items[currentItemIndex];
  const completedItems = items.filter(item => item.status === 'picked').length;
  const pendingItems = items.filter(item => item.status === 'pending').length;

  const handleStartScan = () => {
    setScanStep('location');
    setShowScanner(true);
  };

  const handleScan = (qrCode: string) => {
    const parts = qrCode.split(':');
    if (parts[0] !== 'SS') {
      alert('Código QR inválido');
      return;
    }

    if (scanStep === 'location') {
      // Validate location scan
      if (parts[1] !== 'L') {
        alert('Debe escanear un código QR de ubicación');
        return;
      }

      const locationCode = parts[2];
      if (locationCode !== currentItem.locationCode) {
        alert(`Ubicación incorrecta. Diríjase a ${currentItem.locationCode}`);
        return;
      }

      // Location correct, move to product scan
      setScanStep('product');
    } else if (scanStep === 'product') {
      // Validate product scan
      if (parts[1] !== 'P') {
        alert('Debe escanear un código QR de producto');
        return;
      }

      const productSku = parts[2];
      if (productSku !== currentItem.productSku) {
        alert(`Producto incorrecto. Busque ${currentItem.productSku}`);
        return;
      }

      // Product correct, move to quantity input
      setShowScanner(false);
      setScanStep('quantity');
      setQuantity(currentItem.requestedQuantity);
    }
  };

  const handleConfirmQuantity = () => {
    // Update item status
    const updatedItems = [...items];
    updatedItems[currentItemIndex] = {
      ...currentItem,
      status: 'picked',
      pickedQuantity: quantity,
    };
    setItems(updatedItems);

    // Reset scan state
    setScanStep(null);
    setQuantity(0);

    // Move to next item or finish
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      // All items picked, navigate to packing
      navigate(`/dispatch/packing/${orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-gray-900">#{order.orderNumber}</h1>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <div className="h-1.5 bg-gray-200 rounded-full w-20">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(completedItems / items.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {completedItems}/{items.length}
              </span>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center">
            <MoreVertical className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Order Info (Collapsible) */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <button className="w-full flex items-center justify-between text-sm active:bg-gray-50 py-1">
          <span className="text-gray-700">
            {order.destination.name} | {items.length} items
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-28 overflow-y-auto">
        {/* Current Item Card */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            PRODUCTO {currentItemIndex + 1} de {items.length}
          </p>

          <div className="bg-white rounded-xl shadow-md p-4">
            {/* Product Image */}
            <img
              src={currentItem.productImage}
              alt={currentItem.productName}
              className="w-full h-64 object-cover rounded-lg bg-gray-100 mb-4"
            />

            {/* Product Info */}
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {currentItem.productName}
            </h2>
            <p className="text-sm text-gray-500 font-mono mb-4">{currentItem.productSku}</p>

            {/* Quantity Box */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Cantidad:</p>
              <div className="bg-white rounded-lg px-4 py-3 inline-flex flex-col items-center min-w-[80px]">
                <span className="text-3xl font-bold text-gray-900">
                  {currentItem.requestedQuantity}
                </span>
                <span className="text-xs text-gray-500">unidades</span>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">📍 UBICACIÓN:</p>
              <div className="bg-white rounded-lg p-3 mb-2">
                <p className="text-xl font-bold font-mono text-blue-600 text-center mb-1">
                  {currentItem.locationCode}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  ZONA {currentItem.locationCode.split('-')[0]} - PASILLO{' '}
                  {currentItem.locationCode.split('-')[1]}
                </p>
              </div>

              {currentItem.distance && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{currentItem.distance} metros ({Math.round(currentItem.distance * 1.3)} pasos)</span>
                </div>
              )}

              <button className="w-full mt-3 py-2 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-lg transition-colors">
                Ver en mapa →
              </button>
            </div>

            {/* Stock Info */}
            <div className="mt-4 text-sm text-gray-600">
              <p>Stock disponible: 25 unidades</p>
            </div>

            {/* Scan Button */}
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold active:scale-95 transition-transform"
                onClick={() => alert('Ver mapa (próximamente)')}
              >
                🗺️ VER MAPA
              </button>
              <button
                onClick={handleStartScan}
                className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                ESCANEAR
              </button>
            </div>
          </div>
        </div>

        {/* Next Items Preview */}
        {currentItemIndex < items.length - 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Próximos:</p>
            <div className="space-y-2">
              {items.slice(currentItemIndex + 1, currentItemIndex + 3).map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-2 text-sm text-gray-600 flex items-center gap-2"
                >
                  <span className="font-semibold">{currentItemIndex + idx + 2}.</span>
                  <span className="flex-1 truncate">{item.productName}</span>
                  <span className="text-xs text-blue-600 font-mono">{item.locationCode}</span>
                  {item.distance && (
                    <span className="text-xs text-gray-500">→{item.distance}m</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">
            {completedItems}/{items.length} ✓ | {pendingItems} pendientes
          </span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold active:scale-95 transition-transform">
            Ver todos
          </button>
          <button className="flex-1 py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold active:scale-95 transition-transform">
            ⏸️ Pausar
          </button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && scanStep && (
        <MockQRScanner
          onScan={handleScan}
          onClose={() => {
            setShowScanner(false);
            setScanStep(null);
          }}
          expectedType={scanStep === 'location' ? 'location' : 'product'}
        />
      )}

      {/* Quantity Confirmation Modal */}
      {scanStep === 'quantity' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-sm font-semibold text-green-600">Ubicación confirmada</p>
              <p className="text-sm font-semibold text-green-600">Producto confirmado</p>
            </div>

            <p className="text-center text-gray-700 font-semibold mb-4">
              ¿Cuántas unidades recolectó?
            </p>

            {/* Quantity Adjuster */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <div className="bg-blue-50 rounded-xl px-6 py-4 min-w-[100px] text-center">
                <span className="text-4xl font-bold text-gray-900">{quantity}</span>
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <span>Sugerido: {currentItem.requestedQuantity}</span>
              <span>Disponible: 25</span>
            </div>

            {/* Report Discrepancy */}
            <label className="flex items-center gap-2 mb-6">
              <input type="checkbox" className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">Reportar discrepancia</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setScanStep(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmQuantity} className="flex-1">
                CONFIRMAR ✓
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickingProcess;
