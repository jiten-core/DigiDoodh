export interface PrintContent {
    type: 'text' | 'image' | 'qr' | 'barcode' | 'table';
    value?: string;
    style?: {
        align?: 'left' | 'center' | 'right';
        bold?: boolean;
        size?: 'small' | 'normal' | 'large';
        underline?: boolean;
    };
    tableData?: string[][];
}

class BluetoothPrinterService {
    private device: any | null = null;
    private server: any | null = null;
    private characteristic: any | null = null;

    isBluetoothAvailable(): boolean {
        return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
    }

    async requestDevice(): Promise<any | null> {
        if (!this.isBluetoothAvailable()) return null;
        try {
            return await (navigator as any).bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
            });
        } catch (error) {
            console.error('Request device failed:', error);
            return null;
        }
    }

    async connect(device: any): Promise<boolean> {
        try {
            this.device = device;
            this.server = await this.device.gatt.connect();
            // Most thermal printers use this service/char
            const services = await this.server.getPrimaryServices();
            // Try to find a characteristic for writing
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.characteristic = char;
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error('Connect component failed:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
        }
        this.device = null;
        this.server = null;
        this.characteristic = null;
    }

    async testConnection(): Promise<boolean> {
        return this.print([
            { type: 'text', value: 'DigiDhoodh Printer Test', style: { align: 'center', bold: true } },
            { type: 'text', value: 'Connection OK!', style: { align: 'center' } },
            { type: 'text', value: new Date().toLocaleString() }
        ]);
    }

    async print(content: PrintContent[]): Promise<boolean> {
        if (!this.characteristic) return false;
        try {
            const encoder = new TextEncoder();
            for (const item of content) {
                let cmd = '';
                if (item.type === 'text' && item.value) {
                    cmd = item.value + '\n';
                }
                await this.characteristic.writeValue(encoder.encode(cmd));
            }
            return true;
        } catch (error) {
            console.error('Print failed:', error);
            return false;
        }
    }

    // Mock methods to satisfy component
    async printMilkCollectionReceipt(data: any) {
        return this.print([{ type: 'text', value: `Receipt for ${data.farmerName}` }]);
    }
    async printPaymentReceipt(data: any) {
        return this.print([{ type: 'text', value: `Payment to ${data.farmerName}` }]);
    }
    async printInventoryReport(data: any) {
        return this.print([{ type: 'text', value: `Inventory Report ${data.date}` }]);
    }
}

export const bluetoothPrinter = new BluetoothPrinterService();
