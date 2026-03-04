'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  UserCheck,
  CreditCard,
  Package,
  Receipt,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isDemoMode } from '@/lib/supabase';
import { useTranslation } from 'react-i18next';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { toast } from 'sonner';

interface Buyer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  businessType: 'retail' | 'wholesale' | 'restaurant' | 'hotel' | 'individual';
  gstNumber?: string;
  licenseNumber?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  creditLimit: number;
  outstandingBalance: number;
  totalPurchases: number;
  lastPurchaseDate?: string;
  preferences?: {
    invoiceFrequency: 'daily' | 'weekly' | 'monthly';
    paymentTerms: string;
    deliveryAddress?: string;
  };
}

interface Invoice {
  id: string;
  buyerId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
}

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Sale {
  id: string;
  buyerId: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paymentMethod?: string;
  notes?: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function BuyerManagement() {
  const { profile } = useAuth();
  const { checkLimit, hasFeature } = usePlanLimits();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const canManageBuyers = profile?.role === 'DAIRY_OWNER' || profile?.role === 'INTERNAL_SUPER_ADMIN' || (profile as any)?.permissions?.includes('manage_buyers');
  const canGenerateInvoices = profile?.role === 'DAIRY_OWNER' || profile?.role === 'INTERNAL_SUPER_ADMIN' || (profile as any)?.permissions?.includes('generate_bills');
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    businessType: 'retail' as any,
    gstNumber: '',
    licenseNumber: '',
    creditLimit: '10000',
    invoiceFrequency: 'weekly' as any,
    paymentTerms: 'NET 30',
    deliveryAddress: ''
  });

  const [invoiceFormData, setInvoiceFormData] = useState({
    buyerId: '',
    items: [{ productId: '', productName: '', quantity: '1', unitPrice: '50' }],
    dueDate: ''
  });

  useEffect(() => {
    fetchBuyers();
    fetchInvoices();
    fetchSales();
  }, []);

  const fetchBuyers = async () => {
    if (!profile?.dairy?.id && !isDemoMode) return;
    try {
      if (isDemoMode) {
        setBuyers([
          {
            id: '1',
            name: 'Rajendra General Store',
            phone: '9876543210',
            email: 'rajendra@store.com',
            address: '123 Main Street, Market Area',
            businessType: 'retail',
            gstNumber: '27AAAPL1234C1ZV',
            joinDate: '2024-01-01',
            status: 'active',
            creditLimit: 25000,
            outstandingBalance: 8500,
            totalPurchases: 125000,
            lastPurchaseDate: '2024-01-15',
            preferences: {
              invoiceFrequency: 'weekly',
              paymentTerms: 'NET 30'
            }
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .eq('dairy_id', profile?.dairy?.id)
        .order('name');

      if (error) throw error;

      const formattedBuyers: Buyer[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        businessType: item.business_type as any,
        outstandingBalance: item.outstanding_balance,
        status: item.status === 'ACTIVE' ? 'active' : 'inactive',
        joinDate: item.created_at,
        creditLimit: 10000, // default
        totalPurchases: 0 // derived later
      }));

      setBuyers(formattedBuyers);
    } catch (error) {
      console.error('Error fetching buyers:', error);
    }
  };

  const fetchInvoices = async () => {
    if (!profile?.dairy?.id && !isDemoMode) return;
    try {
      if (isDemoMode) {
        setInvoices([
          {
            id: '1',
            buyerId: '1',
            invoiceNumber: 'INV-2024-001',
            date: '2024-01-15',
            dueDate: '2024-02-14',
            items: [],
            subtotal: 2100,
            tax: 378,
            total: 2478,
            status: 'pending'
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('dairy_id', profile?.dairy?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: Invoice[] = (data || []).map(item => ({
        id: item.id,
        buyerId: item.buyer_id,
        invoiceNumber: item.invoice_number,
        date: item.date,
        dueDate: item.date, // fallback
        items: [], // JSON mapping if available
        subtotal: item.subtotal,
        tax: item.tax,
        total: item.total_amount,
        status: item.status.toLowerCase() as any
      }));

      setInvoices(formatted);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchSales = async () => {
    if (!profile?.dairy?.id && !isDemoMode) return;
    try {
      if (isDemoMode) {
        setSales([
          {
            id: '1',
            buyerId: '1',
            date: '2024-01-15',
            items: [],
            totalAmount: 2478,
            paymentStatus: 'pending',
            paymentMethod: 'Credit'
          }
        ]);
        return;
      }
      // Placeholder: Sales might be a derived view or separate table
      // For now, let's keep it empty or same as invoices for this module
      setSales([]);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        businessType: formData.businessType,
        gstNumber: formData.gstNumber,
        licenseNumber: formData.licenseNumber,
        creditLimit: parseFloat(formData.creditLimit),
        preferences: {
          invoiceFrequency: formData.invoiceFrequency,
          paymentTerms: formData.paymentTerms,
          deliveryAddress: formData.deliveryAddress
        }
      };

      const url = editingBuyer ? `/api/buyers/${editingBuyer.id}` : '/api/buyers';
      const method = editingBuyer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingBuyer ? 'Buyer updated successfully!' : 'Buyer added successfully!');
        setIsAddDialogOpen(false);
        setEditingBuyer(null);
        resetForm();
        fetchBuyers();
      } else {
        setError(data.error || 'Failed to save buyer');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const items = invoiceFormData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        total: parseFloat(item.quantity) * parseFloat(item.unitPrice)
      }));

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + tax;

      const payload = {
        buyerId: invoiceFormData.buyerId,
        items,
        subtotal,
        tax,
        total,
        dueDate: invoiceFormData.dueDate
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Invoice generated successfully!');
        setIsInvoiceDialogOpen(false);
        resetInvoiceForm();
        fetchInvoices();
      } else {
        setError(data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      name: buyer.name,
      phone: buyer.phone || '',
      email: buyer.email || '',
      address: buyer.address || '',
      businessType: buyer.businessType,
      gstNumber: buyer.gstNumber || '',
      licenseNumber: buyer.licenseNumber || '',
      creditLimit: buyer.creditLimit.toString(),
      invoiceFrequency: buyer.preferences?.invoiceFrequency || 'weekly',
      paymentTerms: buyer.preferences?.paymentTerms || 'NET 30',
      deliveryAddress: buyer.preferences?.deliveryAddress || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;

    try {
      const response = await fetch(`/api/buyers/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setSuccess('Buyer deleted successfully!');
        fetchBuyers();
      } else {
        setError(data.error || 'Failed to delete buyer');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Invoice downloaded successfully!');
      }
    } catch (error) {
      setError('Failed to download invoice');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      businessType: 'retail',
      gstNumber: '',
      licenseNumber: '',
      creditLimit: '10000',
      invoiceFrequency: 'weekly',
      paymentTerms: 'NET 30',
      deliveryAddress: ''
    });
  };

  const resetInvoiceForm = () => {
    setInvoiceFormData({
      buyerId: '',
      items: [{ productId: '', productName: '', quantity: '1', unitPrice: '50' }],
      dueDate: ''
    });
  };

  const addInvoiceItem = () => {
    setInvoiceFormData({
      ...invoiceFormData,
      items: [...invoiceFormData.items, { productId: '', productName: '', quantity: '1', unitPrice: '50' }]
    });
  };

  const updateInvoiceItem = (index: number, field: string, value: string) => {
    const updatedItems = [...invoiceFormData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInvoiceFormData({ ...invoiceFormData, items: updatedItems });
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceFormData.items.filter((_, i) => i !== index);
    setInvoiceFormData({ ...invoiceFormData, items: updatedItems });
  };

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.phone?.includes(searchTerm) ||
    buyer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBuyers = buyers.length;
  const activeBuyers = buyers.filter(b => b.status === 'active').length;
  const totalOutstanding = buyers.reduce((sum, b) => sum + b.outstandingBalance, 0);
  const totalSales = buyers.reduce((sum, b) => sum + b.totalPurchases, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Buyers</p>
                <p className="text-2xl font-bold">{totalBuyers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Buyers</p>
                <p className="text-2xl font-bold">{activeBuyers}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                <p className="text-2xl font-bold">₹{totalOutstanding.toFixed(0)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold">₹{totalSales.toFixed(0)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buyer Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customers, sales, and invoices</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search buyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <FeatureGate feature="buyer_management" fallback="disabled">
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!canGenerateInvoices}>
                  <FileText className="w-4 h-4 mr-2" />
                  {!canGenerateInvoices ? (isHindi ? 'अनुमति नहीं' : 'No Permission') : (isHindi ? 'इनवॉइस बनाएं' : 'Generate Invoice')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isHindi ? 'इनवॉइस बनाएं' : 'Generate Invoice'}</DialogTitle>
                  <DialogDescription>
                    {isHindi ? 'खरीदार के लिए नया इनवॉइस बनाएं' : 'Create a new invoice for a buyer'}
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="buyer">Buyer</Label>
                    <Select value={invoiceFormData.buyerId} onValueChange={(value) => setInvoiceFormData({ ...invoiceFormData, buyerId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map((buyer) => (
                          <SelectItem key={buyer.id} value={buyer.id}>
                            {buyer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceFormData.dueDate}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Invoice Items</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {invoiceFormData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2">
                          <Input
                            placeholder="Product name"
                            value={item.productName}
                            onChange={(e) => updateInvoiceItem(index, 'productName', e.target.value)}
                            className="col-span-4"
                          />
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', e.target.value)}
                            className="col-span-2"
                          />
                          <Input
                            type="number"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, 'unitPrice', e.target.value)}
                            className="col-span-3"
                          />
                          <div className="col-span-2 flex items-center justify-center text-sm font-medium">
                            ₹{(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(0)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvoiceItem(index)}
                            className="col-span-1 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </FeatureGate>

          <FeatureGate feature="buyer_management" fallback="disabled">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={!canManageBuyers}>
                  <Plus className="w-4 h-4 mr-2" />
                  {!canManageBuyers ? (isHindi ? 'अनुमति नहीं' : 'No Permission') : (isHindi ? 'नया खरीदार' : 'New Buyer')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBuyer ? (isHindi ? 'खरीदार बदलें' : 'Edit Buyer') : (isHindi ? 'नया खरीदार' : 'Add New Buyer')}
                  </DialogTitle>
                  <DialogDescription>
                    {isHindi ? 'खरीदार का विवरण दर्ज करें' : 'Enter the buyer details below'}
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-green-50 border-green-200 text-green-800">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Business Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter business name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select value={formData.businessType} onValueChange={(value: any) => setFormData({ ...formData, businessType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail Store</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="buyer@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Business address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        placeholder="27AAAPL1234C1ZV"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="License number"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        placeholder="10000"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Preferences</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="invoiceFrequency">Invoice Frequency</Label>
                        <Select value={formData.invoiceFrequency} onValueChange={(value: any) => setFormData({ ...formData, invoiceFrequency: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NET 15">NET 15</SelectItem>
                            <SelectItem value="NET 30">NET 30</SelectItem>
                            <SelectItem value="NET 45">NET 45</SelectItem>
                            <SelectItem value="NET 60">NET 60</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="deliveryAddress">Delivery Address (if different)</Label>
                      <Input
                        id="deliveryAddress"
                        placeholder="Delivery address"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (editingBuyer ? 'Update Buyer' : 'Add Buyer')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </FeatureGate>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Buyers List</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Business Type</TableHead>
                      <TableHead>Credit Limit</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuyers.map((buyer) => (
                      <TableRow key={buyer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div>
                            <div className="font-medium">{buyer.name}</div>
                            <div className="text-sm text-gray-500">
                              Joined: {new Date(buyer.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {buyer.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="w-3 h-3 mr-1" />
                                {buyer.phone}
                              </div>
                            )}
                            {buyer.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1" />
                                {buyer.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {buyer.businessType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{buyer.creditLimit.toFixed(0)}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${buyer.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₹{buyer.outstandingBalance.toFixed(0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{buyer.totalPurchases.toFixed(0)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={buyer.status === 'active' ? 'default' : 'secondary'}>
                            {buyer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(buyer)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(buyer.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage and track all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          Date: {new Date(invoice.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{invoice.total.toFixed(0)}</div>
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' :
                            invoice.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {invoice.status}
                        </Badge>
                        <div className="mt-2 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadInvoice(invoice.id)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>View all sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Sale #{sale.id}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(sale.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Payment: {sale.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{sale.totalAmount.toFixed(0)}</div>
                        <Badge variant={
                          sale.paymentStatus === 'paid' ? 'default' :
                            sale.paymentStatus === 'partial' ? 'secondary' : 'destructive'
                        }>
                          {sale.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}