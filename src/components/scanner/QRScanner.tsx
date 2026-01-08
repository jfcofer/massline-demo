import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, FlashlightOff, Flashlight, SwitchCamera } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  title = 'Escanear Código QR',
  subtitle = 'Apunta la cámara al código QR',
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scannerId = 'qr-reader';

    // Create scanner instance
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            // Prevent multiple scans
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            // Vibrate for feedback (if supported)
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }

            // Stop scanner and return result
            scanner.stop().then(() => {
              onScan(decodedText);
            }).catch(console.error);
          },
          () => {
            // Ignore scan failures (no QR in frame)
          }
        );

        // Check if flash is available
        const capabilities = scanner.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          setHasFlash(true);
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError(
          'No se pudo acceder a la cámara. Verifica los permisos del navegador.'
        );
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [facingMode, onScan]);

  const toggleFlash = async () => {
    if (!scannerRef.current?.isScanning) return;

    try {
      await scannerRef.current.applyVideoConstraints({
        // @ts-expect-error - torch is not in standard types but is supported
        advanced: [{ torch: !isFlashOn }],
      });
      setIsFlashOn(!isFlashOn);
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  };

  const switchCamera = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    hasScannedRef.current = false;
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-black/80">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <X className="w-7 h-7" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Scanner Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-center p-6">
            <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-red-400 text-base mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* QR Reader Container */}
            <div
              id="qr-reader"
              className="w-full max-w-sm mx-4"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            />

            {/* Scanning Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/30 rounded-2xl relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-primary animate-pulse top-1/2" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div className="flex justify-center gap-8 pb-12 pt-4 bg-black/80">
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center active:scale-95 transition-transform"
            >
              {isFlashOn ? (
                <Flashlight className="w-6 h-6 text-yellow-400" />
              ) : (
                <FlashlightOff className="w-6 h-6 text-white" />
              )}
            </button>
          )}
          <button
            onClick={switchCamera}
            className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center active:scale-95 transition-transform"
          >
            <SwitchCamera className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;