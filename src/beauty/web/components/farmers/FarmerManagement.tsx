'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isDemoMode } from '@/lib/supabase';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useCollection } from '@/hooks/useCollection';
import { useFinance } from '@/hooks/useFinance';
// Components will be resolved via tsconfig paths (mapped to beauty/web/components)
import { FeatureGate } from '@/components/subscription/FeatureGate';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  MapPin,
  Wallet,
  IndianRupee,
  MessageCircle,
  TrendingUp,
  CreditCard,
  UserPlus,
  ChevronRight,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface Farmer {
  id: string;
  name: string;
  phone?: string;
  village?: string;
  status: 'active' | 'inactive';
  walletBalance: number;
  totalMilk?: number;
  code?: string;
}

export default function FarmerManagement() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const { checkLimit, getRemainingFarmers, currentPlan } = usePlanLimits();
  const isHindi = i18n.language === 'hi';

  // New Modular Hooks
  const { farmers, fetchFarmers, saveFarmer, loading: collectionLoading } = useCollection(profile?.dairy?.id);
  const { balances, fetchBalances, loading: financeLoading } = useFinance(profile?.dairy?.id);

  const canManageFarmers = profile?.role === 'owner' || profile?.role === 'staff' || profile?.permissions?.includes('manage_farmers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    code: '',
  });

  useEffect(() => {
    if (profile?.dairy?.id) {
      fetchFarmers();
      fetchBalances();
    }
  }, [profile?.dairy?.id, fetchFarmers, fetchBalances]);

  const handleAddFarmer = async () => {
    if (!profile?.dairy?.id) return;

    if (!canManageFarmers) {
      toast.error(isHindi ? 'आपके पास किसान जोड़ने की अनुमति नहीं है' : 'You do not have permission to add farmers');
      return;
    }

    if (!checkLimit('farmers', farmers.length)) {
      toast.error(isHindi
        ? `सीमा समाप्त! आपके वर्तमान प्लान में केवल ${currentPlan.limits.farmers} किसान ही जुड़ सकते हैं।`
        : `Limit reached! Your current plan supports only ${currentPlan.limits.farmers} farmers.`);
      return;
    }

    try {
      await saveFarmer({
        name: formData.name,
        phone: formData.phone,
        village: formData.village,
        code: formData.code || `F-${Math.floor(1000 + Math.random() * 9000)}`,
        active: true
      });

      setIsAddDialogOpen(false);
      setFormData({ name: '', phone: '', village: '', code: '' });
      // hook already calls fetchFarmers
    } catch (err: any) {
      // toast handled in hook
    }
  };

  // Merge farmers with their balances
  const farmersWithBalances = farmers.map(f => {
    const balanceInfo = balances.find(b => b.farmer_id === f.id);
    return {
      ...f,
      walletBalance: balanceInfo?.net_balance || 0,
      status: f.active ? 'active' : 'inactive'
    };
  });

  const filteredFarmers = farmersWithBalances.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone?.includes(searchTerm) ||
    farmer.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {isHindi ? 'किसान' : 'Farmers'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="bg-dairy-100 text-dairy-800 border-dairy-200">
              {farmers.length} {isHindi ? 'किसान' : 'Total Farmers'}
            </Badge>
            {currentPlan.limits.farmers !== 'unlimited' && (
              <Badge variant="outline" className="text-muted-foreground">
                {getRemainingFarmers(farmers.length)} {isHindi ? 'बाकी हैं' : 'Slots Remaining'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isHindi ? "खोजें (नाम, फोन, कोड)..." : "Search (name, phone, code)..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-12 rounded-xl border-border focus:border-dairy-500"
            />
          </div>
          <FeatureGate feature="milk_collection" fallback="disabled">
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="btn-dairy h-12"
              disabled={!canManageFarmers}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {!canManageFarmers ? (isHindi ? 'अनुमति नहीं है' : 'No Permission') : (isHindi ? 'नया किसान' : 'New Farmer')}
            </Button>
          </FeatureGate>
        </div>
      </div>

      {/* Farmers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredFarmers.map((farmer, index) => (
            <motion.div
              key={farmer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="card-premium cursor-pointer group hover:border-dairy-300 dark:hover:border-dairy-700"
                onClick={() => setSelectedFarmer(farmer)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-dairy-100 to-dairy-200 dark:from-dairy-900 dark:to-dairy-800 flex items-center justify-center text-xl font-bold text-dairy-700 dark:text-dairy-300 shadow-inner">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-dairy-600 transition-colors">
                          {farmer.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-md px-1 py-0 text-xs font-normal">
                            {farmer.code}
                          </Badge>
                          <span>• {farmer.village}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${farmer.status === 'active' ? 'bg-dairy-500' : 'bg-gray-300'}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-border">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                        {isHindi ? 'वॉलेट' : 'Wallet'}
                      </span>
                      <span className="text-xl font-bold text-earth-700 dark:text-earth-400">
                        ₹{farmer.walletBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider block">
                        {isHindi ? 'कुल दूध' : 'Total Milk'}
                      </span>
                      <span className="text-xl font-bold text-dairy-600 dark:text-dairy-400">
                        {farmer.totalMilk} L
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" className="flex-1 h-10 rounded-xl text-sm border-dairy-200 hover:bg-dairy-50 hover:text-dairy-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" className="flex-1 h-10 rounded-xl text-sm border-dairy-200 hover:bg-dairy-50 hover:text-dairy-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-muted">
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Farmer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-0 gap-0 overflow-hidden">
          <div className="p-6 bg-dairy-premium text-white">
            <DialogTitle className="text-2xl font-display font-bold">
              {isHindi ? 'नया किसान जोड़ें' : 'Add New Farmer'}
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              {isHindi ? 'किसान की जानकारी दर्ज करें' : 'Enter farmer details below'}
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>{isHindi ? 'पूरा नाम' : 'Full Name'}</Label>
              <Input
                placeholder={isHindi ? "राम पटेल" : "Ram Patel"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isHindi ? 'फोन नंबर' : 'Phone Number'}</Label>
                <Input
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>{isHindi ? 'गांव' : 'Village'}</Label>
                <Input
                  placeholder="Anand"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <Button onClick={handleAddFarmer} className="btn-dairy w-full mt-4 h-12">
              {isHindi ? 'जोड़ें' : 'Add Farmer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};