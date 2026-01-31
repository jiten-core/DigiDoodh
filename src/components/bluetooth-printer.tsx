'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  Bluetooth,
  BluetoothOff,
  CheckCircle,
  XCircle,
  Settings,
  TestTube,
  Receipt,
  CreditCard,
  Package
} from 'lucide-react';
import { bluetoothPrinter, PrintContent } from '@/lib/bluetooth-printer';

interface BluetoothPrinterProps {
  onPrintComplete?: () => void;
}

export default function BluetoothPrinterComponent({ onPrintComplete }: BluetoothPrinterProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(false);

  useEffect(() => {
    checkBluetoothAvailability();
  }, []);

  const checkBluetoothAvailability = () => {
    const available = bluetoothPrinter.isBluetoothAvailable();
    setIsBluetoothAvailable(available);
  };

  const connectPrinter = async () => {
    setIsConnecting(true);

    try {
      const device = await bluetoothPrinter.requestDevice();

      if (device) {
        const connected = await bluetoothPrinter.connect(device);

        if (connected) {
          setIsConnected(true);
          setSelectedDevice(device);
        } else {
          alert('Failed to connect to printer');
        }
      }
    } catch (error) {
      console.error('Error connecting to printer:', error);
      alert('Error connecting to printer. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPrinter = async () => {
    try {
      await bluetoothPrinter.disconnect();
      setIsConnected(false);
      setSelectedDevice(null);
    } catch (error) {
      console.error('Error disconnecting printer:', error);
    }
  };

  const testPrinter = async () => {
    if (!isConnected) return;

    setIsPrinting(true);

    try {
      const success = await bluetoothPrinter.testConnection();

      if (success) {
        alert('Test print successful!');
      } else {
        alert('Test print failed. Please check the printer.');
      }
    } catch (error) {
      console.error('Error testing printer:', error);
      alert('Error testing printer');
    } finally {
      setIsPrinting(false);
    }
  };

  const printMilkCollectionReceipt = async () => {
    if (!isConnected) return;

    setIsPrinting(true);

    try {
      await bluetoothPrinter.printMilkCollectionReceipt({
        farmerName: 'Ramesh Kumar',
        date: new Date().toLocaleDateString('en-IN'),
        shift: 'Morning',
        milkType: 'Buffalo',
        liters: 15.5,
        rate: 48,
        amount: 744,
        fat: 7.2,
        snf: 8.5
      });

      alert('Milk collection receipt printed successfully!');
      onPrintComplete?.();
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Error printing receipt');
    } finally {
      setIsPrinting(false);
    }
  };

  const printPaymentReceipt = async () => {
    if (!isConnected) return;

    setIsPrinting(true);

    try {
      await bluetoothPrinter.printPaymentReceipt({
        farmerName: 'Sita Devi',
        date: new Date().toLocaleDateString('en-IN'),
        amount: 5200,
        paymentMethod: 'Cash',
        period: '1-15 June 2024',
        previousDue: 1200,
        totalDue: 6400
      });

      alert('Payment receipt printed successfully!');
      onPrintComplete?.();
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Error printing receipt');
    } finally {
      setIsPrinting(false);
    }
  };

  const printInventoryReport = async () => {
    if (!isConnected) return;

    setIsPrinting(true);

    try {
      await bluetoothPrinter.printInventoryReport({
        date: new Date().toLocaleDateString('en-IN'),
        items: [
          { name: 'Cattle Feed', currentStock: 85, unit: 'kg', lastUpdated: '2024-06-15' },
          { name: 'Mineral Mix', currentStock: 12, unit: 'kg', lastUpdated: '2024-06-14' },
          { name: 'Medicine', currentStock: 25, unit: 'bottles', lastUpdated: '2024-06-10' },
        ]
      });

      alert('Inventory report printed successfully!');
      onPrintComplete?.();
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Error printing report');
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isBluetoothAvailable) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <BluetoothOff className="h-5 w-5" />
            Bluetooth Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Bluetooth is not available in your browser or device. Please use a supported browser to access Bluetooth printing features.
          </p>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Supported Browsers:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✅ Chrome (Desktop & Android)</li>
              <li>✅ Edge (Desktop)</li>
              <li>✅ Opera (Desktop & Android)</li>
              <li>❌ Safari (Not supported)</li>
              <li>❌ Firefox (Limited support)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Bluetooth Printer
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {isConnected ? 'Connected' : 'Not Connected'}
              </p>
              <p className="text-sm text-gray-600">
                {selectedDevice ? selectedDevice.name : 'No printer selected'}
              </p>
            </div>
          </div>

          <Button
            onClick={isConnected ? disconnectPrinter : connectPrinter}
            disabled={isConnecting}
            variant={isConnected ? "destructive" : "default"}
          >
            {isConnecting ? (
              'Connecting...'
            ) : isConnected ? (
              <>
                <BluetoothOff className="h-4 w-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>

        {/* Printer Actions */}
        {isConnected && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Printer Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Test Printer */}
              <Button
                variant="outline"
                onClick={testPrinter}
                disabled={isPrinting}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Test Printer
              </Button>

              {/* Print Milk Collection Receipt */}
              <Button
                variant="outline"
                onClick={printMilkCollectionReceipt}
                disabled={isPrinting}
                className="flex items-center gap-2"
              >
                <Receipt className="h-4 w-4" />
                Milk Receipt
              </Button>

              {/* Print Payment Receipt */}
              <Button
                variant="outline"
                onClick={printPaymentReceipt}
                disabled={isPrinting}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Payment Receipt
              </Button>

              {/* Print Inventory Report */}
              <Button
                variant="outline"
                onClick={printInventoryReport}
                disabled={isPrinting}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Inventory Report
              </Button>
            </div>
          </div>
        )}

        {/* Printer Status */}
        {isPrinting && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-800">Printing...</span>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to Connect:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Make sure your Bluetooth printer is turned on and in pairing mode</li>
            <li>Click the "Connect" button above</li>
            <li>Select your printer from the list of available devices</li>
            <li>Wait for the connection to be established</li>
            <li>Test the connection using the "Test Printer" button</li>
          </ol>
        </div>

        {/* Compatible Printers */}
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Compatible Printers:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• ESC/POS compatible thermal printers</li>
            <li>• Bluetooth receipt printers</li>
            <li>• Most mobile thermal printers</li>
            <li>• Bluetooth label printers (limited support)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}