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
import { format, isSameDay } from 'date-fns';
import { supabase, isDemoMode } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useCollection } from '@/hooks/useCollection';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { MilkEntry, Farmer } from '@/shared/types';

// Mock data store for demo mode

export default function MilkCollection() {
  const { profile } = useAuth();
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { hasFeature } = usePlanLimits();
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  // Using the new Modular Hook
  const {
    loading: isLoading,
    farmers,
    entries: milkEntries,
    fetchFarmers,
    fetchEntries: fetchMilkEntries,
    saveEntry
  } = useCollection(profile?.dairy?.id);

  const isHindi = i18n.language === 'hi';
  const canAddMilk = profile?.role === 'owner' || profile?.role === 'staff' || profile?.permissions?.includes('milk_entry');

  const [formData, setFormData] = useState({
    farmer_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    session: (new Date().getHours() < 12 ? 'morning' : 'evening') as any,
    liters: '',
    fat: '',
    snf: '',
    clr: '',
  });

  const [calculatedRate, setCalculatedRate] = useState(0);
  const [calculatedAmount, setCalculatedAmount] = useState(0);

  useEffect(() => {
    fetchMilkEntries(selectedDate);
    fetchFarmers();
  }, [selectedDate, profile?.dairy?.id, fetchMilkEntries, fetchFarmers]);

  // Auto-calculate rate and amount
  useEffect(() => {
    if (formData.clr && !formData.snf) {
      const clr = parseFloat(formData.clr) || 0;
      const fat = parseFloat(formData.fat) || 0;
      if (clr > 0 && fat > 0) {
        const snf = (clr / 4) + (fat * 0.2) + 0.7;
        setFormData(prev => ({ ...prev, snf: snf.toFixed(2) }));
      }
    }
  }, [formData.clr, formData.fat]);

  useEffect(() => {
    if (formData.liters && formData.fat && formData.farmer_id) {
      const farmer = farmers.find(f => f.id === formData.farmer_id);
      if (farmer) {
        const fat = parseFloat(formData.fat) || 0;
        const snf = parseFloat(formData.snf) || 0;
        const qty = parseFloat(formData.liters) || 0;

        // Base rate logic (to be replaced by RateChart service later)
        let rate = 40;
        if (fat > 0 && snf > 0) {
          rate = 40 + (fat - 3.5) * 5 + (snf - 8.5) * 3;
        }

        const total = Math.round(rate * qty);
        setCalculatedRate(parseFloat(rate.toFixed(2)));
        setCalculatedAmount(total);
      }
    }
  }, [formData.liters, formData.fat, formData.snf, formData.farmer_id, farmers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        liters: parseFloat(formData.liters),
        fat: formData.fat ? parseFloat(formData.fat) : undefined,
        snf: formData.snf ? parseFloat(formData.snf) : undefined,
        clr: formData.clr ? parseFloat(formData.clr) : undefined,
        rate: calculatedRate,
        amount: calculatedAmount,
        collected_by: profile?.id
      };

      await saveEntry(payload);

      setSuccess('Milk added successfully!');
      setIsAddDialogOpen(false);
      resetForm();
      fetchMilkEntries(selectedDate);
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    }
  };

  const resetForm = () => {
    setFormData({
      farmer_id: '',
      entry_date: new Date().toISOString().split('T')[0],
      session: new Date().getHours() < 12 ? 'morning' : 'evening',
      liters: '',
      fat: '',
      snf: '',
      clr: '',
    });
    setCalculatedRate(0);
    setCalculatedAmount(0);
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    toast.info('Direct deletion is restricted. Please create a correction entry instead.');
  };

  const filteredEntries = milkEntries.filter((entry: any) =>
    entry.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalQuantity = filteredEntries.reduce((sum: number, entry: any) => sum + (entry.liters || 0), 0);
  const totalAmount = filteredEntries.reduce((sum: number, entry: any) => sum + (entry.amount || 0), 0);
  const avgFat = filteredEntries.length > 0
    ? (filteredEntries.reduce((sum: number, entry: any) => sum + (entry.fat || 0), 0) / filteredEntries.length).toFixed(1)
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
                ? (isHindi ? 'एेंट्री बदलें' : 'Edit Entry')
                : (isHindi ? 'नया दूध डालें' : 'New Milk Entry')
              }
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              {format(new Date(formData.entry_date), 'dd MMMM yyyy')} • {formData.session === 'morning' ? 'Morning' : 'Evening'}
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            {/* Farmer Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-muted-foreground">{isHindi ? 'किसान चुनें' : 'Select Farmer'}</Label>
                  <Select value={formData.farmer_id} onValueChange={(v) => setFormData({ ...formData, farmer_id: v })}>
                    <SelectTrigger className="h-14 rounded-xl text-lg border-2">
                      <SelectValue placeholder={isHindi ? "किसान चुनें" : "Select Farmer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((farmer: any) => (
                        <SelectItem key={farmer.id} value={farmer.id} className="text-lg py-3">
                          {farmer.name} ({farmer.code})
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
                  onClick={() => setFormData({ ...formData, session: 'morning' })}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${formData.session === 'morning'
                    ? 'bg-white text-saffron-600 shadow-sm'
                    : 'text-muted-foreground hover:bg-white/50'
                    }`}
                >
                  <Sun className="w-5 h-5" />
                  {isHindi ? 'सुबह' : 'Morning'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, session: 'evening' })}
                  className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${formData.session === 'evening'
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
                    value={formData.liters}
                    onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
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

              {/* Subscription Feature Gate - WhatsApp */}
              <FeatureGate feature="whatsapp_bills" fallback="disabled">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{isHindi ? 'व्हाट्सएप नोटिफिकेशन' : 'WhatsApp Notification'}</span>
                  </div>
                  <Switch
                    checked={notifyWhatsApp}
                    onCheckedChange={setNotifyWhatsApp}
                  />
                </div>
              </FeatureGate>

              <Button
                onClick={handleSubmit}
                className="btn-dairy w-full h-14 text-lg"
                disabled={isLoading || !canAddMilk}
              >
                {!canAddMilk ? (isHindi ? 'अनुमति नहीं है' : 'No Permission') : (isLoading ? 'Saving...' : (isHindi ? 'सेव करें' : 'Save Entry'))}
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
                    {entry.farmer?.name.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{entry.farmer?.name || 'Unknown'}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {entry.session} • {format(new Date(entry.entry_date), 'dd MMM')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-dairy-700 dark:text-dairy-400">
                    {entry.liters} <span className="text-sm font-normal">L</span>
                  </div>
                  <div className="font-bold text-lg text-earth-600 dark:text-earth-400">
                    ₹{entry.amount}
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
                  (entry.fat || 0) > 4 ? 'bg-dairy-100 text-dairy-800 border-dairy-200 dark:bg-dairy-900/30 dark:text-dairy-400' :
                    (entry.fat || 0) > 3 ? 'bg-saffron-100 text-saffron-800 border-saffron-200 dark:bg-saffron-900/30 dark:text-saffron-400' :
                      'bg-earth-100 text-earth-800 border-earth-200 dark:bg-earth-900/30 dark:text-earth-400'
                }>
                  {(entry.fat || 0) > 4 ? (isHindi ? 'उत्कृष्ट' : 'Excellent') : (isHindi ? 'अच्छा' : 'Good')}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingEntry(entry);
                    setFormData({
                      farmer_id: entry.farmer_id,
                      entry_date: entry.entry_date,
                      session: entry.session,
                      liters: entry.liters.toString(),
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

      {
        filteredEntries.length === 0 && (
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
        )
      }
    </div >
  );
}