'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Milk, Calendar, Droplets, IndianRupee, History, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MilkEntry {
    id: string;
    date: string;
    time: string;
    quantity: number;
    fat: number;
    snf: number;
    rate: number;
    amount: number;
}

export default function FarmerMilkHistory() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';
    const [entries, setEntries] = useState<MilkEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data
        const mockEntries: MilkEntry[] = [
            { id: '1', date: '2024-01-22', time: 'Morning', quantity: 12.5, fat: 4.2, snf: 8.5, rate: 45, amount: 562.5 },
            { id: '2', date: '2024-01-21', time: 'Evening', quantity: 6.0, fat: 4.0, snf: 8.2, rate: 43, amount: 258 },
            { id: '3', date: '2024-01-21', time: 'Morning', quantity: 13.2, fat: 4.3, snf: 8.6, rate: 46, amount: 607.2 },
            { id: '4', date: '2024-01-20', time: 'Evening', quantity: 5.8, fat: 3.9, snf: 8.1, rate: 42, amount: 243.6 },
        ];
        setEntries(mockEntries);
        setLoading(false);
    }, []);

    const filteredEntries = entries.filter(e =>
        e.date.includes(searchTerm) || e.time.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalQty = entries.reduce((sum, e) => sum + e.quantity, 0);
    const totalAmt = entries.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <History className="w-8 h-8 text-earth-600" />
                        {isHindi ? 'दूध का हिसाब' : 'Milk History'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isHindi ? 'अपनी पूरी कमाई और दूध का रिकॉर्ड देखें' : 'View your complete milk and earnings record'}
                    </p>
                </div>
                <Button className="bg-earth-600 hover:bg-earth-700 h-12 rounded-xl">
                    <Download className="w-5 h-5 mr-2" />
                    {isHindi ? 'रिपोर्ट डाउनलोड करें' : 'Download PDF'}
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-dairy-600 text-white rounded-3xl overflow-hidden border-0 shadow-lg">
                    <CardContent className="p-6">
                        <p className="text-dairy-100 text-sm uppercase tracking-wider font-bold mb-1">
                            {isHindi ? 'कुल दूध' : 'Total Milk'}
                        </p>
                        <p className="text-3xl font-bold">{totalQty.toFixed(1)} <span className="text-lg font-normal opacity-80">L</span></p>
                    </CardContent>
                </Card>
                <Card className="bg-earth-600 text-white rounded-3xl overflow-hidden border-0 shadow-lg">
                    <CardContent className="p-6">
                        <p className="text-earth-100 text-sm uppercase tracking-wider font-bold mb-1">
                            {isHindi ? 'कुल कमाई' : 'Total Earnings'}
                        </p>
                        <p className="text-3xl font-bold">₹{totalAmt.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search/Filter */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                    placeholder={isHindi ? "तारीख या शिफ्ट से खोजें..." : "Search by date or shift..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 rounded-2xl border-2 focus:border-earth-500 text-lg"
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredEntries.map((entry) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border-2 border-border rounded-3xl p-5 hover:border-earth-300 transition-all shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.time === 'Morning' ? 'bg-saffron-100 text-saffron-700' : 'bg-dairy-100 text-dairy-700'}`}>
                                    {entry.time === 'Morning' ? '☀️' : '🌙'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">
                                        {new Date(entry.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {isHindi ? (entry.time === 'Morning' ? 'सुबह की शिफ्ट' : 'शाम की शिफ्ट') : `${entry.time} Shift`}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 rounded-lg px-3 py-1 font-bold">
                                {isHindi ? 'जमा' : 'Collected'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 py-4 border-y border-dashed border-border">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">FAT</p>
                                <p className="text-lg font-bold">{entry.fat}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">SNF</p>
                                <p className="text-lg font-bold">{entry.snf}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">RATE</p>
                                <p className="text-lg font-bold text-earth-600">₹{entry.rate}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center gap-2">
                                <Milk className="w-5 h-5 text-dairy-600" />
                                <span className="text-xl font-bold">{entry.quantity} L</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-earth-600" />
                                <span className="text-2xl font-black text-earth-700">₹{entry.amount}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredEntries.length === 0 && (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                    <Milk className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-bold">
                        {isHindi ? 'कोई दूध रिकॉर्ड नहीं मिला' : 'No milk records found'}
                    </p>
                </div>
            )}
        </div>
    );
}
