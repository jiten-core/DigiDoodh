// src/app/farmers/qr/page.tsx - Farmer QR Card Generator
'use client';

import { Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode, ArrowLeft, Download, Share2, Printer } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { useFarmers, useInitializeDB, useLedgerEntries, useMilkEntries } from '@/db/hooks';
import { useToast } from '@/hooks/use-toast';

export default function FarmerQRPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <QrCode className="h-12 w-12 text-green-500 animate-pulse" />
            </div>
        }>
            <FarmerQRContent />
        </Suspense>
    );
}

function FarmerQRContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { isInitialized } = useInitializeDB();
    const cardRef = useRef<HTMLDivElement>(null);

    const farmerId = searchParams.get('id');
    const dairyId = 'dairy-1';

    const allFarmers = useFarmers(dairyId);
    const allMilk = useMilkEntries(dairyId);
    const allLedger = useLedgerEntries(dairyId);

    const farmer = allFarmers.find(f => f.id === farmerId);

    // Farmer quick stats (last 30 days)
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const recentMilk = allMilk.filter(e =>
        e.farmer_id === farmerId && new Date(e.entry_date) >= last30
    );
    const totalLiters = recentMilk.reduce((s, e) => s + e.quantity, 0);
    const totalAmount = recentMilk.reduce((s, e) => s + e.amount, 0);

    const ledger = allLedger.filter(e => e.farmer_id === farmerId);
    const credits = ledger.filter(e => e.type === 'credit').reduce((s, e) => s + e.amount, 0);
    const debits = ledger.filter(e => e.type === 'debit').reduce((s, e) => s + e.amount, 0);
    const balance = credits - debits;

    // QR data — link to farmer's ledger view (or the app URL)
    const dairyName = (typeof window !== 'undefined' && localStorage.getItem('dd_dairy_name')) || 'My Dairy';
    const qrValue = `${typeof window !== 'undefined' ? window.location.origin : ''}/farmers/ledger?id=${farmerId}&dairy=${encodeURIComponent(dairyName)}`;

    const handlePrint = () => window.print();

    const handleShare = useCallback(() => {
        if (!farmer) return;
        const text = [
            `🐄 *DigiDhoodh — Farmer Card*`,
            ``,
            `👤 ${farmer.name}`,
            `🆔 Code: ${farmer.farmer_code}`,
            farmer.village ? `🏘️ Village: ${farmer.village}` : '',
            ``,
            `📊 *Last 30 Days:*`,
            `🥛 Milk: ${totalLiters.toFixed(1)} L`,
            `💰 Amount: ₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            ``,
            `💳 *Balance: ₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}*`,
            ``,
            `— ${dairyName} via DigiDhoodh`,
        ].filter(Boolean).join('\n');

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }, [farmer, totalLiters, totalAmount, balance, dairyName]);

    const handleDownloadPDF = useCallback(async () => {
        if (!farmer || !cardRef.current) return;

        try {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [86, 54] }); // business card size
            const W = doc.internal.pageSize.getWidth();
            const H = doc.internal.pageSize.getHeight();

            // Background
            doc.setFillColor(34, 197, 94); // green
            doc.rect(0, 0, W, 14, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('DigiDhoodh', 4, 7);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.text('Farmer Card', 4, 11);

            // Farmer name
            doc.setTextColor(20, 20, 20);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(farmer.name, 4, 21);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(80, 80, 80);
            doc.text(`Code: ${farmer.farmer_code}`, 4, 27);
            if (farmer.village) doc.text(`Village: ${farmer.village}`, 4, 31);
            if (farmer.phone) doc.text(`Ph: ${farmer.phone}`, 4, 35);

            // Stats
            doc.setFontSize(6.5);
            doc.text(`30-Day Milk: ${totalLiters.toFixed(1)} L`, 4, 41);
            doc.text(`Amount: ₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 4, 45);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 197, 94);
            doc.text(`Balance: ₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 4, 49);

            doc.save(`FarmerCard_${farmer.name.replace(/\s+/g, '_')}.pdf`);
            toast({ title: 'Card Downloaded', description: 'Farmer card saved as PDF' });
        } catch (e) {
            toast({ title: 'Error', description: 'Could not generate PDF', variant: 'destructive' });
        }
    }, [farmer, totalLiters, totalAmount, balance, toast]);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <QrCode className="h-12 w-12 text-green-500 animate-pulse" />
            </div>
        );
    }

    if (!farmer) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <div className="text-xl font-semibold text-gray-600 mb-2">Farmer not found</div>
                    <Button onClick={() => router.push('/dashboard/farmers')}>Go to Farmers</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header - hidden on print */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 print:hidden">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <QrCode className="h-7 w-7 text-green-500" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Farmer QR Card</h1>
                            <div className="text-xs text-gray-500">{farmer.name}</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleShare} className="border-green-500 text-green-600 hover:bg-green-50">
                            <Share2 className="h-4 w-4 mr-1" /> WhatsApp
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="border-blue-500 text-blue-600 hover:bg-blue-50">
                            <Download className="h-4 w-4 mr-1" /> PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint} className="border-gray-400 text-gray-600 hover:bg-gray-50">
                            <Printer className="h-4 w-4 mr-1" /> Print
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                {/* Farmer ID Card */}
                <div
                    ref={cardRef}
                    className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-green-200 dark:border-green-800 overflow-hidden shadow-xl shadow-green-100 dark:shadow-green-900/20"
                >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
                        <div>
                            <div className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">DigiDhoodh Farmer Card</div>
                            <div className="text-white text-2xl font-bold">{farmer.name}</div>
                            <div className="text-white/80 text-sm mt-1">Code: <span className="font-bold">{farmer.farmer_code}</span></div>
                        </div>
                        <div className="text-right text-white/80 text-sm space-y-1">
                            {farmer.village && <div>🏘️ {farmer.village}</div>}
                            {farmer.phone && <div>📞 {farmer.phone}</div>}
                            <div className="text-white/50 text-xs capitalize">{farmer.is_active ? 'Active Farmer' : 'Inactive'}</div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-6 flex gap-6 items-start">
                        {/* QR Code */}
                        <div className="flex-shrink-0 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <QRCode
                                value={qrValue}
                                size={120}
                                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                viewBox="0 0 256 256"
                            />
                            <div className="text-center text-xs text-gray-400 mt-2">Scan to view ledger</div>
                        </div>

                        {/* Stats */}
                        <div className="flex-1 space-y-4">
                            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last 30 Days</div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {totalLiters.toFixed(1)}
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Liters</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </div>
                                    <div className="text-xs text-green-600 dark:text-green-400 font-semibold">Earned</div>
                                </div>
                            </div>

                            {/* Balance */}
                            <div className={`rounded-xl p-4 border-2 ${balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Balance</div>
                                <div className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                    ₹{Math.abs(balance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {balance >= 0 ? '✅ Dairy owes farmer' : '⚠️ Farmer owes dairy'}
                                </div>
                            </div>

                            <div className="text-xs text-gray-400 italic">
                                Powered by DigiDhoodh • {dairyName}
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Instructions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">📲 How to Use This QR Code</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">1.</span>
                            Print this card or save the PDF and give it to the farmer
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">2.</span>
                            Farmer scans the QR code with any phone camera
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">3.</span>
                            They see their milk records and balance in real-time
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">4.</span>
                            Zero disputes — transparent, immutable records
                        </li>
                    </ul>
                </div>

                {/* Action Pills */}
                <div className="flex gap-3 flex-wrap">
                    <Button
                        onClick={handleShare}
                        className="bg-green-500 hover:bg-green-600 text-white flex-1"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share via WhatsApp
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/ledger?farmer=${farmerId}`)}
                        variant="outline"
                        className="flex-1 border-gray-300"
                    >
                        View Full Ledger
                    </Button>
                </div>
            </main>
        </div>
    );
}
