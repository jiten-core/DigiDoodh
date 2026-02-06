'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Download,
    Share2,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    IndianRupee,
    ChevronRight,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isDemoMode } from '@/lib/supabase';
import { useBilling } from '@/hooks/useBilling';
import { useCollection } from '@/hooks/useCollection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { Bill, Farmer } from '@/shared/types';
import { Separator } from '@/components/ui/separator';

export default function FarmerBilling() {
    const { profile } = useAuth();
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    const { bills, fetchBills, generateNewBill, finalizeBill, markBillAsPaid, loading } = useBilling(profile?.dairy?.id);
    const { farmers, fetchFarmers } = useCollection(profile?.dairy?.id);

    const [searchTerm, setSearchTerm] = useState('');
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isBillViewOpen, setIsBillViewOpen] = useState(false);

    const [generateData, setGenerateData] = useState({
        farmerId: 'all',
        startDate: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
    });

    useEffect(() => {
        if (profile?.dairy?.id) {
            fetchBills();
            fetchFarmers();
        }
    }, [profile?.dairy?.id, fetchBills, fetchFarmers]);

    const handleGenerateBills = async () => {
        if (!profile?.dairy?.id) return;
        setIsGenerating(true);
        try {
            const period = {
                start_date: generateData.startDate,
                end_date: generateData.endDate
            };

            if (generateData.farmerId === 'all') {
                for (const farmer of farmers) {
                    await generateNewBill(farmer.id, period);
                }
            } else {
                await generateNewBill(generateData.farmerId, period);
            }
            setIsGenerateDialogOpen(false);
        } catch (error: any) {
        } finally {
            setIsGenerating(false);
        }
    };

    const handleMarkAsPaid = async (billId: string) => {
        try {
            await markBillAsPaid(billId);
            setIsBillViewOpen(false);
        } catch (error: any) {
        }
    };

    const filteredBills = bills.filter(bill =>
        bill.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 rounded-full">{isHindi ? 'भुगतान सफल' : 'Paid'}</Badge>;
            case 'FINALIZED':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 rounded-full">{isHindi ? 'फाइनल' : 'Finalized'}</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 rounded-full">{isHindi ? 'ड्राफ्ट' : 'Draft'}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-premium overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{isHindi ? 'कुल बकाया' : 'Total Pending'}</p>
                                <h3 className="text-3xl font-bold">₹{bills.filter(b => b.status !== 'paid').reduce((acc, b) => acc + (b.net_amount || 0), 0).toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-terra-50 dark:bg-terra-900/20 flex items-center justify-center text-terra-600">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-premium overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{isHindi ? 'पिछला भुगतान' : 'Last Payout'}</p>
                                <h3 className="text-3xl font-bold text-dairy-600">₹{bills.filter(b => b.status === 'paid')[0]?.net_amount.toLocaleString() || '0'}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-dairy-50 dark:bg-dairy-900/20 flex items-center justify-center text-dairy-600">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-premium overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{isHindi ? 'औसत डेली' : 'Avg Daily'}</p>
                                <h3 className="text-3xl font-bold text-amber-600">₹{(bills.reduce((acc, b) => acc + (b.net_amount || 0), 0) / (bills.length || 1)).toFixed(0).toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={isHindi ? "किसान या बिल नंबर खोजें..." : "Search farmer or bill #..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-12 rounded-xl border-border focus:border-dairy-500"
                        />
                    </div>
                </div>

                <Button
                    onClick={() => setIsGenerateDialogOpen(true)}
                    className="btn-dairy h-12 w-full md:w-auto shadow-lg shadow-dairy-200"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {isHindi ? 'बिल बनाएं' : 'Generate Bills'}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-dairy-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">{isHindi ? 'बिल लोड हो रहे हैं...' : 'Loading bills...'}</p>
                    </div>
                ) : filteredBills.length > 0 ? (
                    filteredBills.map((bill, index) => (
                        <motion.div
                            key={bill.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-card hover:bg-dairy-50/30 dark:hover:bg-dairy-900/10 border border-border rounded-2xl p-4 transition-all group cursor-pointer"
                            onClick={() => {
                                setSelectedBill(bill);
                                setIsBillViewOpen(true);
                            }}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-dairy-100 dark:bg-dairy-900 flex items-center justify-center text-dairy-700 font-bold text-lg">
                                        {bill.farmer?.name?.charAt(0) || 'F'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg">{bill.farmer?.name}</h4>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">{bill.farmer?.code}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(bill.period_start), 'dd MMM')} - {format(new Date(bill.period_end), 'dd MMM')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-muted-foreground">Net Payout</div>
                                        <div className="font-bold">₹{bill.net_amount.toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(bill.status)}
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-muted/20 border-2 border-dashed border-border rounded-3xl">
                        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-muted-foreground">{isHindi ? 'कोई बिल नहीं मिला' : 'No bills found'}</h3>
                    </div>
                )}
            </div>

            <Dialog open={isBillViewOpen} onOpenChange={setIsBillViewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{isHindi ? 'बिल विवरण' : 'Bill Details'}</DialogTitle>
                    </DialogHeader>

                    {selectedBill && (
                        <div className="space-y-6 pt-4">
                            <div className="flex justify-between items-start bg-muted/30 p-4 rounded-xl">
                                <div>
                                    <h3 className="text-xl font-bold">{selectedBill.farmer?.name}</h3>
                                    <p className="text-sm text-muted-foreground">Code: {selectedBill.farmer?.code}</p>
                                </div>
                                {getStatusBadge(selectedBill.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-muted rounded-xl">
                                    <p className="text-xs text-muted-foreground uppercase">Milk Quantity</p>
                                    <p className="text-lg font-bold">{selectedBill.total_quantity} L</p>
                                </div>
                                <div className="p-3 bg-muted rounded-xl">
                                    <p className="text-xs text-muted-foreground uppercase">Avg FAT</p>
                                    <p className="text-lg font-bold">{selectedBill.avg_fat}%</p>
                                </div>
                                <div className="p-3 bg-muted rounded-xl">
                                    <p className="text-xs text-muted-foreground uppercase">Net Payout</p>
                                    <p className="text-lg font-bold">₹{selectedBill.net_amount.toLocaleString()}</p>
                                </div>
                            </div>

                            <Separator />

                            {selectedBill.status !== 'paid' && (
                                <Button
                                    className="w-full h-12 bg-dairy-700 hover:bg-dairy-800 text-white font-bold"
                                    onClick={() => handleMarkAsPaid(selectedBill.id)}
                                >
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    {isHindi ? 'भुगतान सफल चिह्नित करें' : 'Mark as Paid'}
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">{isHindi ? 'बिल जनरेट करें' : 'Generate Bills'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{isHindi ? 'शुरुआत की तारीख' : 'Start Date'}</Label>
                                <Input
                                    type="date"
                                    value={generateData.startDate}
                                    onChange={(e) => setGenerateData({ ...generateData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{isHindi ? 'अंतिम तारीख' : 'End Date'}</Label>
                                <Input
                                    type="date"
                                    value={generateData.endDate}
                                    onChange={(e) => setGenerateData({ ...generateData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{isHindi ? 'किसान' : 'Farmer'}</Label>
                            <Select
                                value={generateData.farmerId}
                                onValueChange={(v) => setGenerateData({ ...generateData, farmerId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Farmer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{isHindi ? 'सभी किसान' : 'All Farmers'}</SelectItem>
                                    {farmers.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.name} ({f.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleGenerateBills}
                            disabled={isGenerating}
                            className="btn-dairy w-full"
                        >
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
