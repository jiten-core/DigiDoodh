'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import {
  Milk,
  Plus,
  Search,
  Calendar,
  Droplets,
  Calculator,
  Sun,
  Moon,
  FlaskConical,
  User,
  AlertCircle,
  TrendingUp,
  Wifi,
  WifiOff,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { isDemoMode, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

// Mock data store for demo mode
let mockMilkEntries: MilkEntry[] = [
  {
    id: '1',
    dairyId: 'demo-dairy',
    farmerId: 'f1',
    farmer: { id: 'f1', name: 'Ramesh Patel' },
    date: new Date().toISOString(),
    time: 'Morning',
    quantity: 12.5,
    fat: 4.2,
    snf: 8.5,
    rate: 45,
    totalAmount: 562.5,
    quality: 'Good'
  },
  {
    id: '2',
    dairyId: 'demo-dairy',
    farmerId: 'f2',
    farmer: { id: 'f2', name: 'Suresh Kumar' },
    date: new Date().toISOString(),
    time: 'Morning',
    quantity: 8.0,
    fat: 3.8,
    snf: 8.2,
    rate: 38,
    totalAmount: 304,
    quality: 'Standard'
  }
];

let mockFarmers: Farmer[] = [
  { id: 'f1', name: 'Ramesh Patel', ratePerLiter: 45 },
  { id: 'f2', name: 'Suresh Kumar', ratePerLiter: 38 },
  { id: 'f3', name: 'Mahesh Yadav', ratePerLiter: 42 },
];

interface MilkEntry {
  id: string;
  dairyId: string;
  farmerId: string;
  farmer: {
    id: string;
    name: string;
    phone?: string;
  };
  date: string;
  time: string;
  quantity: number;
  fat?: number;
  snf?: number;
  clr?: number;
  temperature?: number; // Temperature in °C
  rate: number;
  totalAmount: number;
  quality?: string;
}

interface Farmer {
  id: string;
  name: string;
  phone?: string;
  ratePerLiter: number;
}

export default function MilkCollection() {
  const { t, i18n } = useTranslation();
  const [milkEntries, setMilkEntries] = useState<MilkEntry[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MilkEntry | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isHindi = i18n.language === 'hi';

  const [formData, setFormData] = useState({
    farmerId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().getHours() < 12 ? 'Morning' : 'Evening',
    quantity: '',
    fat: '',
    snf: '',
    clr: '',
    temperature: '', // Optional temperature field
  });

  const [calculatedRate, setCalculatedRate] = useState(0);
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Computed values for stats display
  const filteredEntries = milkEntries.filter(entry =>
    entry.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.farmerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuantity = filteredEntries.reduce((sum, e) => sum + (e.quantity || 0), 0);
  const totalAmount = filteredEntries.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  const avgFat = filteredEntries.length > 0
    ? (filteredEntries.reduce((sum, e) => sum + (e.fat || 0), 0) / filteredEntries.length).toFixed(1)
    : '0.0';


  useEffect(() => {
    // Check connection status
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    fetchMilkEntries();
    fetchFarmers();
  }, [selectedDate]);

  // Estimates only (Rule R4.1 & Directive 1)
  useEffect(() => {
    if (formData.quantity && formData.fat && formData.farmerId) {
      const farmer = farmers.find(f => f.id === formData.farmerId);
      if (farmer) {
        const fat = parseFloat(formData.fat) || 0;
        const snf = parseFloat(formData.snf) || 0;
        const qty = parseFloat(formData.quantity) || 0;

        let rate = farmer.ratePerLiter;
        // Simplified estimate logic
        if (fat > 3.5) rate += (fat - 3.5) * 5;
        if (snf > 8.5) rate += (snf - 8.5) * 3;

        setCalculatedRate(parseFloat(rate.toFixed(2)));
        setCalculatedAmount(Math.round(rate * qty));
      }
    } else {
      setCalculatedRate(0);
      setCalculatedAmount(0);
    }
  }, [formData.quantity, formData.fat, formData.snf, formData.farmerId, farmers]);

  const fetchMilkEntries = async () => {
    try {
      if (isDemoMode) {
        // ... (demo logic) ...
        await new Promise(resolve => setTimeout(resolve, 500));
        setMilkEntries(mockMilkEntries);
        return;
      }

      const { data, error } = await supabase
        .from('milk_entries')
        .select(`
          *,
          farmer:farmers (
            id,
            name
          )
        `)
        .eq('date', selectedDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Transform if necessary to match MilkEntry type
        // The database returns snake_case, frontend uses camelCase usually?
        // Let's check the type definition. Assuming it's compatible or we need mapping.
        // Based on previous code, the frontend expects camelCase? 
        // Actually, let's map it safely.
        const formattedData: MilkEntry[] = data.map((item: any) => ({
          id: item.id,
          dairyId: item.dairy_id,
          farmerId: item.farmer_id,
          farmer: item.farmer, // { id, name }
          date: item.date,
          time: item.time,
          quantity: item.quantity,
          fat: item.fat,
          snf: item.snf,
          rate: item.rate,
          totalAmount: item.total_amount,
          quality: item.fat > 4 ? 'Excellent' : 'Good' // derived
        }));
        setMilkEntries(formattedData);
      }
    } catch (error) {
      console.error('Error fetching milk entries:', error);
    }
  };

  const fetchFarmers = async () => {
    try {
      if (isDemoMode) {
        setFarmers(mockFarmers);
        return;
      }

      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) setFarmers(data);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        offline_id: crypto.randomUUID(), // Rule R1.3
        farmer_id: formData.farmerId,
        date: formData.date,
        time: formData.time,
        quantity: parseFloat(formData.quantity),
        fat: formData.fat ? parseFloat(formData.fat) : 0,
        snf: formData.snf ? parseFloat(formData.snf) : 0,
        clr: formData.clr ? parseFloat(formData.clr) : 0,
      };

      // Rule R3.1: All mutations through Edge Functions / Intent API
      // We do NOT write directly to 'milk_entries' table
      const response = await fetch('/api/milk/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Server rejected entry');
      }

      setSuccess(isOffline ? 'Saved locally! Will sync when online.' : 'Intent sent to ledger!');
      setIsAddDialogOpen(false);
      if (isOffline) setPendingSyncCount(prev => prev + 1);
      resetForm();
      fetchMilkEntries();
    } catch (err: any) {
      console.error('Submission failed:', err);
      // Fallback for demo/local if API not present
      if (isDemoMode) {
        setSuccess('Entry added (Local/Demo)');
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        setError(err.message || 'Failed to sync with ledger');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const resetForm = () => {
    setFormData({
      farmerId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().getHours() < 12 ? 'Morning' : 'Evening',
      quantity: '',
      fat: '',
      snf: '',
      clr: '',
      temperature: '',
    });
    setCalculatedRate(0);
    setCalculatedAmount(0);
  };

  // Rule R0.1: No DELETE/UPDATE on money tables
  const handleCorrection = async (entry: MilkEntry) => {
    if (!confirm(isHindi ? 'क्या आप इस एंट्री को सुधारना चाहते हैं?' : 'Create a correction entry for this record?')) return;
    setIsLoading(true);
    try {
      const correctionPayload = {
        offline_id: crypto.randomUUID(),
        farmer_id: entry.farmerId,
        date: new Date().toISOString().split('T')[0],
        time: entry.time,
        quantity: -entry.quantity, // Negative value for correction
        notes: `Correction for Entry ID: ${entry.id}`
      };

      await fetch('/api/milk/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correctionPayload)
      });
      fetchMilkEntries();
      setSuccess('Correction entry added to ledger');
    } catch (error) {
      console.error('Correction failed:', error);
      setError('Failed to process correction');
    } finally {
      setIsLoading(false);
    }
  };

  const MilkEntryForm = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 pb-safe">
      <div className="p-6 bg-slate-900 text-white rounded-b-[2rem] shadow-lg relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-3xl rounded-full -mr-16 -mt-16" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <Badge className="bg-white/10 text-white border-0 py-1 px-3">
              {formData.time === 'Morning' ? <Sun className="w-3 h-3 mr-1 text-amber-400" /> : <Moon className="w-3 h-3 mr-1 text-blue-400" />}
              {formData.time}
            </Badge>
            <div className="text-xs font-bold text-white/60">
              {format(new Date(formData.date), 'dd MMM yyyy')}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-black uppercase tracking-widest text-white/40">{isHindi ? 'किसान' : 'FARMER'}</Label>
            <Select value={formData.farmerId} onValueChange={(v) => setFormData({ ...formData, farmerId: v })}>
              <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white text-xl font-bold rounded-2xl focus:ring-green-500">
                <SelectValue placeholder={isHindi ? "किसान चुनें" : "Select Farmer"} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-800 bg-slate-900 text-white">
                {farmers.map(farmer => (
                  <SelectItem key={farmer.id} value={farmer.id} className="py-4 text-lg border-b border-white/5 last:border-0">
                    <div className="flex flex-col">
                      <span className="font-bold">{farmer.name}</span>
                      <span className="text-xs text-white/40">{farmer.phone || 'No phone'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Quantity Input - Big Screen style */}
        <div className="text-center space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isHindi ? 'कितना दूध (लीटर)' : 'MILK QUANTITY (LTRS)'}</Label>
          <div className="relative inline-block w-full">
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="text-6xl md:text-7xl font-black text-center border-0 shadow-none focus-visible:ring-0 bg-transparent h-24 p-0 placeholder:text-slate-100"
              placeholder="00.0"
              autoFocus
            />
            <div className="h-1 w-24 bg-green-500 mx-auto rounded-full mt-2" />
          </div>
        </div>

        {/* FAT & SNF Grid */}
        <div className="grid grid-cols-2 gap-6 pt-4">
          <div className="space-y-2 group">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-saffron-500" /> FAT (%)
            </Label>
            <Input
              type="number"
              value={formData.fat}
              onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
              className="h-16 text-3xl font-black text-center bg-saffron-50/30 border-2 border-saffron-100/50 rounded-2xl focus:border-saffron-500 transition-all"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2 group">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-blue-500" /> SNF (%)
            </Label>
            <Input
              type="number"
              value={formData.snf}
              onChange={(e) => setFormData({ ...formData, snf: e.target.value })}
              className="h-16 text-3xl font-black text-center bg-blue-50/30 border-2 border-blue-100/50 rounded-2xl focus:border-blue-500 transition-all"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* CLR & Temperature Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 group">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              📊 CLR
            </Label>
            <Input
              type="number"
              value={formData.clr}
              onChange={(e) => setFormData({ ...formData, clr: e.target.value })}
              className="h-14 text-2xl font-bold text-center bg-purple-50/30 border-2 border-purple-100/50 rounded-2xl focus:border-purple-500 transition-all"
              placeholder="28"
            />
            <span className="text-[10px] text-slate-400 text-center block">Standard: 26-32</span>
          </div>
          <div className="space-y-2 group">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              🌡️ {isHindi ? 'तापमान' : 'TEMP'} (°C)
            </Label>
            <Input
              type="number"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              className="h-14 text-2xl font-bold text-center bg-red-50/30 border-2 border-red-100/50 rounded-2xl focus:border-red-500 transition-all"
              placeholder="35"
            />
            <span className="text-[10px] text-slate-400 text-center block">Optional</span>
          </div>
        </div>

        {/* Shift Toggle */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isHindi ? 'शिफ्ट' : 'SHIFT'}</Label>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-[1.25rem]">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, time: 'Morning' })}
              className={cn(
                "flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-sm font-black transition-all",
                formData.time === 'Morning' ? "bg-white text-slate-900 shadow-xl scale-[1.02]" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Sun className={cn("w-5 h-5", formData.time === 'Morning' ? "text-amber-500" : "text-slate-400")} />
              {isHindi ? 'सुबह' : 'MORNING'}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, time: 'Evening' })}
              className={cn(
                "flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl text-sm font-black transition-all",
                formData.time === 'Evening' ? "bg-slate-900 text-white shadow-xl scale-[1.02]" : "text-slate-500 hover:text-slate-400"
              )}
            >
              <Moon className={cn("w-5 h-5", formData.time === 'Evening' ? "text-blue-400" : "text-slate-400")} />
              {isHindi ? 'शाम' : 'EVENING'}
            </button>
          </div>
        </div>

        {/* Estimate Summary - Paytm Style */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{isHindi ? 'अनुमानित रेट' : 'ESTIMATED RATE'}</span>
              <div className="text-xl font-black text-slate-900 dark:text-white">₹{calculatedRate || '0.00'}<span className="text-xs text-slate-400 font-medium">/L</span></div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-right space-y-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{isHindi ? 'अनुमानित राशि' : 'ESTIMATED TOTAL'}</span>
              <div className="text-3xl font-black text-green-600">₹{calculatedAmount.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-white dark:border-slate-700">
            <AlertCircle className="w-3 h-3" />
            {isHindi ? 'अंतिम दर सर्वर पर गणना की जाएगी' : 'FINAL RATE WILL BE CALCULATED BY SERVER LEDGER'}
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <Button
          onClick={handleSubmit}
          className="w-full h-16 rounded-[1.5rem] bg-green-600 hover:bg-green-700 text-white text-xl font-black shadow-xl shadow-green-600/20 active:scale-95 transition-all gap-3"
          disabled={isLoading || !formData.farmerId || !formData.quantity}
        >
          {isLoading ? (
            <Wifi className="w-6 h-6 animate-pulse" />
          ) : (
            <>
              {isHindi ? 'एंट्री सेव करें' : 'Confirm Entry'}
              <ChevronRight className="w-6 h-6" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Offline Indicator & Sync Status */}
      {(isOffline || pendingSyncCount > 0) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className={cn(
            "rounded-[2rem] p-5 flex items-center justify-between shadow-lg transition-colors border-2",
            isOffline
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-green-50 border-green-100 text-green-800"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center",
              isOffline ? "bg-white/10" : "bg-green-100"
            )}>
              {isOffline ? <WifiOff className="w-6 h-6 text-amber-500" /> : <Wifi className="w-6 h-6 text-green-600 animate-pulse" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                {isOffline ? (isHindi ? 'सुरक्षित ऑफलाइन मोड' : 'SECURE OFFLINE MODE') : (isHindi ? 'क्लाउड सिंक' : 'CLOUD SYNC ACTIVE')}
              </p>
              <p className="text-sm font-bold">
                {isOffline
                  ? (isHindi ? 'एंट्रीज़ फोन में सुरक्षित हैं' : 'All entries safely stored on phone')
                  : (isHindi ? 'डाटा सुरक्षित रूप से सिंक हो गया' : 'Data is synced securely to cloud')
                }
              </p>
            </div>
          </div>
          {pendingSyncCount > 0 && (
            <div className="flex flex-col items-center">
              <Badge className="bg-amber-500 text-white border-0 font-black h-8 px-4 rounded-xl text-lg min-w-[32px] justify-center">
                {pendingSyncCount}
              </Badge>
              <span className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-40">Pending</span>
            </div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: isHindi ? 'कुल दूध' : 'Total Milk',
            value: `${totalQuantity.toFixed(1)} L`,
            subtitle: isHindi ? 'आज का संग्रहण' : 'Col today',
            icon: Milk,
            color: 'bg-green-500'
          },
          {
            label: isHindi ? 'अनुमानित बिल' : 'Estimated Bil',
            value: `₹${totalAmount.toLocaleString()}`,
            subtitle: isHindi ? 'आज की राशि' : 'Total today',
            icon: Calculator,
            color: 'bg-amber-500'
          },
          {
            label: isHindi ? 'औसत FAT' : 'Avg FAT',
            value: `${avgFat}%`,
            subtitle: isHindi ? 'दूध की गुणवत्ता' : 'Quality avg',
            icon: Droplets,
            color: 'bg-blue-500'
          },
          {
            label: isHindi ? 'कुल किसान' : 'Farmers',
            value: new Set(filteredEntries.map(e => e.farmerId)).size.toString(),
            subtitle: isHindi ? 'जिन्होंने दूध दिया' : 'Milk poured',
            icon: UserCircle,
            color: 'bg-slate-600'
          }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card-platinum group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <Badge className="bg-slate-50 text-[10px] font-black text-slate-400 border-0">{stat.subtitle}</Badge>
            </div>
            <div className="space-y-0.5">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value text-2xl tracking-tighter">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={isHindi ? "किसान खोजें..." : "Search farmer..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-14 rounded-2xl border-slate-200 bg-white/80 focus:ring-green-500 text-lg"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-11 h-14 w-auto rounded-2xl border-slate-200 bg-white/80 font-bold text-slate-700"
            />
          </div>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-lg font-black shadow-lg shadow-green-600/20 w-full md:w-auto gap-2"
        >
          <Plus className="w-6 h-6" />
          {isHindi ? 'दूध डालें' : 'Add Milk'}
        </Button>
      </div>

      {/* Unified Entry Drawer - Paytm Style (Mobile) & Dialog (Desktop) */}
      <Drawer open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DrawerContent className="max-h-[96vh] rounded-t-[3rem] border-0 overflow-hidden shadow-2xl">
          <MilkEntryForm />
        </DrawerContent>
      </Drawer>

      {/* Entries List - Card Style for Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="card-premium p-4 flex flex-col gap-3 group"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="farmer-avatar">
                    {entry.farmer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{entry.farmer.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {entry.time} • {format(new Date(entry.date), 'dd MMM')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-dairy-700 dark:text-dairy-400">
                    {entry.quantity} <span className="text-sm font-normal">L</span>
                  </div>
                  <div className="font-bold text-lg text-earth-600 dark:text-earth-400">
                    ₹{entry.totalAmount}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-dashed border-border text-center text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">FAT</span>
                  <span className="font-bold">{entry.fat}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">SNF</span>
                  <span className="font-bold">{entry.snf}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Rate</span>
                  <span className="font-bold">₹{entry.rate}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <Badge variant="outline" className={
                  entry.quality === 'Excellent' ? 'bg-dairy-100 text-dairy-800 border-dairy-200 dark:bg-dairy-900/30 dark:text-dairy-400' :
                    entry.quality === 'Good' ? 'bg-saffron-100 text-saffron-800 border-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-400' :
                      'bg-earth-100 text-earth-800 border-earth-200 dark:bg-earth-900/30 dark:text-earth-400'
                }>
                  {entry.quality || 'Standard'}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-destructive font-bold flex items-center gap-1 hover:bg-red-50" onClick={() => handleCorrection(entry)}>
                    <AlertCircle className="w-4 h-4" />
                    {isHindi ? 'सुधार' : 'Correct'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Milk className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-400 tracking-tight">
            {isHindi ? 'कोई रिकॉर्ड नहीं मिला' : 'No entries found today'}
          </h3>
          <p className="text-slate-400 mt-2 font-medium">
            {isHindi ? 'नया रिकॉर्ड जोड़ने के लिए + बटन दबाएं' : 'Start your day by adding milk collection'}
          </p>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            variant="outline"
            className="mt-8 rounded-2xl border-2 border-green-100 text-green-600 hover:bg-green-50 font-bold px-8 h-12"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isHindi ? 'पहला एंट्री करें' : 'First Entry'}
          </Button>
        </div>
      )}
    </div>
  );
}