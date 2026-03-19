'use client';

import { useState, useEffect } from 'react';
import { QrCode, Camera, X, Check } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isScanning) {
      startScanning();
    }
  }, [isScanning]);

  const startScanning = async () => {
    try {
      // Check if camera is available
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Simulate QR code scanning (in real app, you'd use a library like qr-scanner)
      setTimeout(() => {
        const mockQRData = `FARMER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        handleScanSuccess(mockQRData);
      }, 2000);
      
    } catch (err) {
      setError('Camera access denied or not available');
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (data: string) => {
    setScannedData(data);
    setSuccess(true);
    setIsScanning(false);
    onScan(data);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setSuccess(false);
      setScannedData('');
    }, 2000);
  };

  const handleManualInput = (data: string) => {
    if (data.trim()) {
      handleScanSuccess(data.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Scan QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-green-700 dark:text-green-300 font-medium">
              QR Code Scanned Successfully!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {scannedData}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera View */}
            {isScanning ? (
              <div className="relative bg-gray-900 rounded-lg h-64 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-green-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="inline-flex items-center space-x-2 bg-black/50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">Scanning...</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Click below to start scanning
                  </p>
                </div>
              </div>
            )}

            {/* Scan Button */}
            <button
              onClick={() => setIsScanning(true)}
              disabled={isScanning}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>{isScanning ? 'Scanning...' : 'Start Scanning'}</span>
            </button>

            {/* Manual Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter code manually:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter farmer code or ID"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualInput((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter farmer code or ID"]') as HTMLInputElement;
                    handleManualInput(input?.value || '');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};