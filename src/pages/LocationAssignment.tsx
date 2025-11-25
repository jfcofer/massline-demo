import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Stepper from '../components/navigation/Stepper';
import { LocationSuggestion } from '../components/location/LocationSuggestion';
import MockQRScanner from '../components/scanner/MockQRScanner';
import Button from '../components/ui/Button';
import { mockLocations } from '../data/mockData';

interface ProductToLocate {
  id: string;
  sku: string;
  name: string;
  image: string;
  quantity: number;
  confirmed: boolean;
  assignedLocation?: string;
}

const LocationAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showScanner, setShowScanner] = useState(false);

  // Mock products to locate (from previous screen)
  const [products, setProducts] = useState<ProductToLocate[]>([
    {
      id: '1',
      sku: 'REP-12345',
      name: 'Filtro de Aceite XYZ Premium',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100',
      quantity: 50,
      confirmed: false,
    },
    {
      id: '2',
      sku: 'REP-98765',
      name: 'Pastilla de Freno Delantera',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      quantity: 4,
      confirmed: false,
    },
    {
      id: '4',
      sku: 'REP-11111',
      name: 'Amortiguador Delantero',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      quantity: 2,
      confirmed: false,
    },
  ]);

  const currentProduct = products[currentProductIndex];

  // Simulated putaway algorithm - suggests optimal location
  const suggestedLocation = mockLocations.find(l => l.code === 'A-03-E2-N1')!;
  const alternativeLocations = mockLocations
    .filter(l => l.code !== 'A-03-E2-N1' && l.type === 'storage')
    .slice(0, 2);

  const handleScan = (qrCode: string) => {
    setShowScanner(false);

    // Parse location QR (format: SS:L:{LOCATION_CODE})
    const parts = qrCode.split(':');
    if (parts[0] !== 'SS' || parts[1] !== 'L') {
      alert('Código QR inválido');
      return;
    }

    const scannedCode = parts[2];

    if (scannedCode === suggestedLocation.code) {
      // Correct location scanned
      const updatedProducts = [...products];
      updatedProducts[currentProductIndex].confirmed = true;
      updatedProducts[currentProductIndex].assignedLocation = scannedCode;
      setProducts(updatedProducts);

      // Move to next product after a brief delay
      setTimeout(() => {
        if (currentProductIndex < products.length - 1) {
          setCurrentProductIndex(currentProductIndex + 1);
        } else {
          // All products located, navigate to confirmation
          navigate('/reception/confirmation');
        }
      }, 1500);
    } else {
      // Wrong location
      alert(`Ubicación incorrecta. Diríjase a ${suggestedLocation.code}`);
    }
  };

  const handlePrevious = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentProduct.confirmed && currentProductIndex < products.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
    } else if (currentProduct.confirmed && currentProductIndex === products.length - 1) {
      navigate('/reception/confirmation');
    }
  };

  const completedCount = products.filter(p => p.confirmed).length;

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
        <h1 className="text-lg font-bold text-gray-900">Ubicación de Productos</h1>
        <div className="w-10" />
      </div>

      {/* Stepper */}
      <Stepper
        steps={[
          { label: 'Inicio' },
          { label: 'Escaneo' },
          { label: 'Ubicación' },
          { label: 'Confirmar' },
        ]}
        currentStep={2}
      />

      {/* Content */}
      <div className="flex-1 p-4 pb-28 overflow-y-auto">
        {/* Product Counter */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            PRODUCTO {currentProductIndex + 1} de {products.length}
          </p>
        </div>

        {/* Current Product Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3">
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className="w-16 h-16 rounded-lg bg-gray-100 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-0.5">
                {currentProduct.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono mb-2">{currentProduct.sku}</p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Cantidad:</span> {currentProduct.quantity}{' '}
                unidades
              </p>
            </div>
          </div>
        </div>

        {/* Location Suggestion */}
        <div className="mb-4">
          <LocationSuggestion
            locationCode={suggestedLocation.code}
            zone={suggestedLocation.zone}
            aisle={suggestedLocation.aisle}
            rack={suggestedLocation.rack}
            level={suggestedLocation.level}
            reason="Zona de alta rotación con espacio disponible"
            utilization={suggestedLocation.currentUtilization * 100}
            isConfirmed={currentProduct.confirmed}
            onScanPress={() => setShowScanner(true)}
            onMapPress={() => alert('Vista de mapa (próximamente)')}
          />
        </div>

        {/* Alternative Locations */}
        {!currentProduct.confirmed && (
          <>
            <p className="text-sm text-gray-500 mb-2">Alternativas (tap para expandir):</p>
            <div className="space-y-1 mb-4">
              {alternativeLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white rounded-lg px-4 py-2 text-sm text-gray-600"
                >
                  • {loc.code} ({Math.round((1 - loc.currentUtilization) * 100)}% disponible)
                </div>
              ))}
            </div>

            <button className="w-full py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Search className="w-5 h-5" />
              <span>Buscar otra ubicación</span>
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-gray-600">
            {completedCount}/{products.length} productos ubicados
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentProductIndex === 0}
            variant="secondary"
            className="flex-1"
          >
            ← Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentProduct.confirmed}
            className="flex-1"
          >
            {currentProductIndex === products.length - 1 ? 'FINALIZAR' : 'SIGUIENTE →'}
          </Button>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <MockQRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          expectedType="location"
        />
      )}
    </div>
  );
};

export default LocationAssignment;
