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
import { useTranslation } from 'react-i18next';
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
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const isHindi = i18n.language === 'hi';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    code: '',
  });

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockFarmers: Farmer[] = [
        { id: '1', name: 'Ramesh Patel', phone: '9876543210', village: 'Anand', status: 'active', walletBalance: 5200, totalMilk: 1450, code: 'F001' },
        { id: '2', name: 'Suresh Kumar', phone: '9876543211', village: 'Baroda', status: 'active', walletBalance: 3100, totalMilk: 890, code: 'F002' },
        { id: '3', name: 'Mahesh Yadav', phone: '9876543212', village: 'Surat', status: 'inactive', walletBalance: 0, totalMilk: 120, code: 'F003' },
        { id: '4', name: 'Gita Ben', phone: '9876543213', village: 'Amul', status: 'active', walletBalance: 8400, totalMilk: 2100, code: 'F004' },
      ];
      setFarmers(mockFarmers);
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFarmer = async () => {
    // Add farmer logic here
    setIsAddDialogOpen(false);
    fetchFarmers();
  };

  const filteredFarmers = farmers.filter(farmer =>
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.phone?.includes(searchTerm) ||
    farmer.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {isHindi ? 'किसान प्रबंधन' : 'Farmer Management'}
          </h2>
          <p className="text-muted-foreground">
            {isHindi ? 'कुल किसान:' : 'Total Farmers:'} {farmers.length}
          </p>
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
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="btn-dairy h-12"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {isHindi ? 'नया किसान' : 'New Farmer'}
          </Button>
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