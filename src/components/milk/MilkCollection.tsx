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
  Edit,
  Trash2,
  Search,
  Calendar,
  Droplets,
  Calculator,
  Sun,
  Moon,
  Save,
  CheckCircle,
  FlaskConical,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { isDemoMode } from '@/lib/supabase';

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
  });

  const [calculatedRate, setCalculatedRate] = useState(0);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    fetchMilkEntries();
    fetchFarmers();
  }, [selectedDate]);

  // Auto-calculate rate and amount
  useEffect(() => {
    if (formData.quantity && formData.fat && formData.farmerId) {
      const farmer = farmers.find(f => f.id === formData.farmerId);
      if (farmer) {
        // Simple calculation logic - replace with complex rate chart logic later
        // Base rate + (FAT * 0.6) + (SNF * 0.4)
        const fat = parseFloat(formData.fat) || 0;
        const snf = parseFloat(formData.snf) || 0;
        const qty = parseFloat(formData.quantity) || 0;

        let rate = farmer.ratePerLiter;
        if (fat > 0 && snf > 0) {
          // Premium for good quality
          rate = farmer.ratePerLiter + (fat - 3.5) * 5 + (snf - 8.5) * 3;
        }

        const total = Math.round(rate * qty);

        setCalculatedRate(parseFloat(rate.toFixed(2)));
        setCalculatedAmount(total);
      }
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
        ...formData,
        quantity: parseFloat(formData.quantity),
        fat: formData.fat ? parseFloat(formData.fat) : undefined,
        snf: formData.snf ? parseFloat(formData.snf) : undefined,
        clr: formData.clr ? parseFloat(formData.clr) : undefined,
        rate: calculatedRate,
        totalAmount: calculatedAmount
      };

      if (isDemoMode) {
        // ... (demo logic remains same) ...
        // Keeping demo logic for fallback testing
        await new Promise(resolve => setTimeout(resolve, 800));
        // ... (Simulated save logic) ...
        const newEntry: MilkEntry = {
          id: Math.random().toString(36).substr(2, 9),
          dairyId: 'demo',
          farmerId: payload.farmerId,
          farmer: {
            id: payload.farmerId,
            name: farmers.find(f => f.id === payload.farmerId)?.name || 'Unknown'
          },
          date: payload.date,
          time: payload.time,
          quantity: payload.quantity,
          fat: payload.fat,
          snf: payload.snf,
          rate: payload.rate,
          totalAmount: payload.totalAmount,
          quality: payload.fat && payload.fat > 4 ? 'Excellent' : 'Good'
        };

        if (editingEntry) {
          mockMilkEntries = mockMilkEntries.map(e => e.id === editingEntry.id ? newEntry : e);
        } else {
          mockMilkEntries = [newEntry, ...mockMilkEntries];
        }

        setSuccess(editingEntry ? 'Entry updated!' : 'Milk added successfully!');
        setIsAddDialogOpen(false);
        setEditingEntry(null);
        resetForm();
        fetchMilkEntries();
        setIsLoading(false);
        return;
      }

      // REAL SUPABASE LOGIC
      const dbPayload = {
        farmer_id: payload.farmerId,
        date: payload.date,
        time: payload.time,
        quantity: payload.quantity,
        fat: payload.fat,
        snf: payload.snf,
        clr: payload.clr,
        rate: payload.rate,
        total_amount: payload.totalAmount,
        dairy_id: (await supabase.auth.getUser()).data.user?.id
      };

      let error;
      if (editingEntry) {
        const { error: updateError } = await supabase
          .from('milk_entries')
          .update(dbPayload)
          .eq('id', editingEntry.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('milk_entries')
          .insert([dbPayload]);
        error = insertError;
      }

      if (error) throw error;

      setSuccess(editingEntry ? 'Entry updated!' : 'Milk added successfully!');
      setIsAddDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      fetchMilkEntries(); // Refresh list
    } catch (err: any) {
      console.error('Error saving milk entry:', err);
      setError(err.message || 'Failed to saving entry');
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
    });
    setCalculatedRate(0);
    setCalculatedAmount(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isHindi ? 'क्या आप इस एंट्री को हटाना चाहते हैं?' : 'Are you sure you want to delete this entry?')) return;
    try {
      await fetch(`/api/milk/${id}`, { method: 'DELETE' });
      fetchMilkEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const filteredEntries = milkEntries.filter(entry =>
    entry.farmer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuantity = filteredEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  const avgFat = filteredEntries.length > 0
    ? (filteredEntries.reduce((sum, entry) => sum + (entry.fat || 0), 0) / filteredEntries.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-muted-foreground text-sm mb-1">{isHindi ? 'कुल दूध' : 'Total Milk'}</span>
            <span className="text-2xl font-bold text-dairy-600 dark:text-dairy-400">{totalQuantity.toFixed(1)} L</span>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-muted-foreground text-sm mb-1">{isHindi ? 'कुल राशि' : 'Total Amount'}</span>
            <span className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">₹{totalAmount.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-muted-foreground text-sm mb-1">{isHindi ? 'औसत FAT' : 'Avg FAT'}</span>
            <span className="text-2xl font-bold text-foreground">{avgFat}%</span>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-muted-foreground text-sm mb-1">{isHindi ? 'किसान' : 'Farmers'}</span>
            <span className="text-2xl font-bold text-earth-600 dark:text-earth-400">{new Set(filteredEntries.map(e => e.farmerId)).size}</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-4 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isHindi ? "किसान का नाम खोजें..." : "Search farmer name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-12 rounded-xl border-border focus:border-dairy-500"
            />
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto h-12 rounded-xl border-border focus:border-dairy-500"
          />
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="btn-dairy h-12 w-full md:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          {isHindi ? 'दूध डालें' : 'Add Milk'}
        </Button>
      </div>

      {/* Add Entry Dialog - Premium Mobile Friendly */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh] p-0 gap-0 border-0 rounded-2xl">
          <div className="p-6 bg-dairy-premium text-white">
            <DialogTitle className="text-2xl font-display font-bold">
              {editingEntry
                ? (isHindi ? 'एंट्री बदलें' : 'Edit Entry')
                : (isHindi ? 'नया दूध डालें' : 'New Milk Entry')
              }
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              {format(new Date(formData.date), 'dd MMMM yyyy')} • {formData.time}
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            {/* Farmer Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">{isHindi ? 'किसान चुनें' : 'Select Farmer'}</Label>
                  <Select value={formData.farmerId} onValueChange={(v) => setFormData({ ...formData, farmerId: v })}>
                    <SelectTrigger className="h-14 rounded-xl text-lg border-2">
                      <SelectValue placeholder={isHindi ? "किसान चुनें" : "Select Farmer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map(farmer => (
                        <SelectItem key={farmer.id} value={farmer.id} className="text-lg py-3">
                          {farmer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Morning/Evening Toggle */}
              <div className="flex bg-muted p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, time: 'Morning' })}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${formData.time === 'Morning'
                    ? 'bg-white text-saffron-600 shadow-sm'
                    : 'text-muted-foreground hover:bg-white/50'
                    }`}
                >
                  <Sun className="w-5 h-5" />
                  {isHindi ? 'सुबह' : 'Morning'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, time: 'Evening' })}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${formData.time === 'Evening'
                    ? 'bg-dairy-800 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-white/50'
                    }`}
                >
                  <Moon className="w-5 h-5" />
                  {isHindi ? 'शाम' : 'Evening'}
                </button>
              </div>

              {/* Big Inputs Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Milk className="w-4 h-4" /> {isHindi ? 'मात्रा (L)' : 'Quantity (L)'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="00.0"
                    className="input-number-big bg-dairy-50/50 dark:bg-dairy-900/20 text-dairy-700 dark:text-dairy-300 border-dairy-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4" /> FAT %
                  </Label>
                  <Input
                    type="number"
                    value={formData.fat}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                    placeholder="0.0"
                    className="input-number-big bg-saffron-50/50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-300 border-saffron-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" /> SNF %
                  </Label>
                  <Input
                    type="number"
                    value={formData.snf}
                    onChange={(e) => setFormData({ ...formData, snf: e.target.value })}
                    placeholder="0.0"
                    className="input-number-big"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> {isHindi ? 'रेट/L' : 'Rate/L'}
                  </Label>
                  <div className="h-[80px] flex items-center justify-center rounded-2xl bg-earth-50 dark:bg-earth-900/20 border border-earth-100 dark:border-earth-800 font-bold text-2xl text-earth-700 dark:text-earth-300">
                    ₹{calculatedRate}
                  </div>
                </div>
              </div>

              {/* Total Amount Display */}
              <div className="bg-earth-50 dark:bg-earth-900/20 p-4 rounded-xl flex justify-between items-center border border-earth-100 dark:border-earth-800">
                <span className="text-earth-700 dark:text-earth-300 font-medium">
                  {isHindi ? 'कुल राशि' : 'Total Amount'}
                </span>
                <span className="text-3xl font-bold text-earth-800 dark:text-earth-200">
                  ₹{calculatedAmount}
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                className="btn-dairy w-full h-14 text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (isHindi ? 'सेव करें' : 'Save Entry')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingEntry(entry);
                    setFormData({
                      farmerId: entry.farmerId,
                      date: entry.date,
                      time: entry.time,
                      quantity: entry.quantity.toString(),
                      fat: entry.fat?.toString() || '',
                      snf: entry.snf?.toString() || '',
                      clr: entry.clr?.toString() || '',
                    });
                    setIsAddDialogOpen(true);
                  }}>
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-4 h-4 text-terra-500" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Milk className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground">
            {isHindi ? 'कोई रिकॉर्ड नहीं मिला' : 'No entries found'}
          </h3>
          <p className="text-muted-foreground mt-2">
            {isHindi ? 'नया रिकॉर्ड जोड़ने के लिए + बटन दबाएं' : 'Click + to add a new entry'}
          </p>
        </div>
      )}
    </div>
  );
}