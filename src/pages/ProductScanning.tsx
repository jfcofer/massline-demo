import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Search, ChevronDown, Plus, Minus, Edit, Trash2, MoreVertical } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import MockQRScanner from '../components/scanner/MockQRScanner';
import Button from '../components/ui/Button';
import { mockProducts } from '../data/mockData';

interface ScannedProduct {
  id: string;
  sku: string;
  name: string;
  image: string;
  quantity: number;
  lot?: string;
  expirationDate?: string;
  inExpectedList: boolean;
}

const ProductScanning: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [showExpectedList, setShowExpectedList] = useState(true);
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);

  // Mock expected products (from PO)
  const expectedProducts = [
    { id: '1', sku: 'REP-12345', name: 'Filtro de Aceite XYZ', quantity: 50, scanned: false },
    { id: '2', sku: 'REP-98765', name: 'Bujía NGK', quantity: 100, scanned: false },
    { id: '4', sku: 'REP-11111', name: 'Amortiguador Delantero', quantity: 20, scanned: false },
  ];

  const handleScan = (qrCode: string) => {
    setShowScanner(false);

    // Parse QR code (format: SS:P:{SKU})
    const parts = qrCode.split(':');
    if (parts[0] !== 'SS' || parts[1] !== 'P') {
      alert('Código QR inválido');
      return;
    }

    const sku = parts[2];
    const product = mockProducts.find(p => p.sku === sku);

    if (product) {
      const isExpected = expectedProducts.some(ep => ep.sku === sku);
      const alreadyScanned = scannedProducts.find(sp => sp.sku === sku);

      if (alreadyScanned) {
        alert('Este producto ya fue escaneado');
        return;
      }

      setScannedProducts([
        ...scannedProducts,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          image: product.thumbnailImage,
          quantity: 1,
          lot: `LOT-2025-A${scannedProducts.length + 1}`,
          inExpectedList: isExpected,
        },
      ]);

      if (!isExpected) {
        // Show warning for unexpected product
        setTimeout(() => {
          alert('⚠️ Este producto no está en la orden original');
        }, 100);
      }
    } else {
      alert('Producto no encontrado en el catálogo');
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...scannedProducts];
    const newQuantity = updated[index].quantity + delta;
    if (newQuantity > 0) {
      updated[index].quantity = newQuantity;
      setScannedProducts(updated);
    }
  };

  const removeProduct = (index: number) => {
    setScannedProducts(scannedProducts.filter((_, i) => i !== index));
  };

  const totalProducts = scannedProducts.length;
  const totalUnits = scannedProducts.reduce((sum, p) => sum + p.quantity, 0);

  const canContinue = scannedProducts.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Recepción - Orden #12345</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <MoreVertical className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Stepper */}
      <Stepper
        steps={[
          { label: 'Inicio' },
          { label: 'Escaneo' },
          { label: 'Ubicación' },
          { label: 'Confirmar' },
        ]}
        currentStep={1}
      />

      {/* Content */}
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        {/* Expected Products (Collapsible) */}
        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          <button
            onClick={() => setShowExpectedList(!showExpectedList)}
            className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-50"
          >
            <span className="text-sm font-semibold text-gray-700">
              Productos Esperados ({expectedProducts.length})
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showExpectedList ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showExpectedList && (
            <div className="border-t border-gray-200">
              {expectedProducts.map((product) => {
                const isScanned = scannedProducts.some(sp => sp.sku === product.sku);
                return (
                  <div
                    key={product.id}
                    className={`px-4 py-3 flex items-center justify-between border-b border-gray-100 last:border-none ${
                      isScanned ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isScanned
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isScanned && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold text-gray-700">
                        {product.quantity} unidades
                      </p>
                      <p className={`text-xs ${isScanned ? 'text-green-600' : 'text-gray-500'}`}>
                        {isScanned ? 'Escaneado' : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Scan Zone */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 mb-4 border-2 border-dashed border-blue-300">
          <button
            onClick={() => setShowScanner(true)}
            className="w-full flex flex-col items-center active:scale-95 transition-transform"
          >
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-3">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-bold text-blue-900 mb-1">ESCANEAR QR</p>
            <p className="text-sm text-blue-700">Enfoque el código QR o código de barras</p>
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-blue-300" />
            <span className="text-xs text-blue-600 font-medium">o</span>
            <div className="flex-1 h-px bg-blue-300" />
          </div>

          <button className="w-full py-2 text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            <span>Buscar manualmente</span>
          </button>
        </div>

        {/* Scanned Products */}
        {scannedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Escaneados ({scannedProducts.length})
              </span>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {scannedProducts.map((product, index) => (
              <div key={index} className="border-b border-gray-100 last:border-none">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mb-1">{product.sku}</p>
                      {product.inExpectedList ? (
                        <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          ✓ Coincide
                        </span>
                      ) : (
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          ⚠️ No en orden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gray-500 font-medium">Cant:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-12 text-center font-bold text-gray-900">
                        {product.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="flex-1" />

                    <button className="w-8 h-8 flex items-center justify-center text-gray-400">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeProduct(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lot Info */}
                  <div className="text-xs text-gray-500">
                    <span>Lote: {product.lot}</span>
                    {product.expirationDate && (
                      <span className="ml-3">Vto: {product.expirationDate}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-gray-600">
            {totalProducts} productos | {totalUnits} unidades
          </span>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Agregar más</span>
          </button>
          <Button
            onClick={() => navigate('/reception/location-assignment')}
            disabled={!canContinue}
            fullWidth
            className="flex-1"
          >
            CONTINUAR →
          </Button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <MockQRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          expectedType="product"
        />
      )}
    </div>
  );
};

export default ProductScanning;
