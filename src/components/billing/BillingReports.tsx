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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Eye,
  Mail,
  Printer,
  FileSpreadsheet,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Milk,
  ShoppingCart,
  Target,
  Activity
} from 'lucide-react';

interface Bill {
  id: string;
  billNumber: string;
  type: 'farmer' | 'buyer' | 'expense';
  recipientId: string;
  recipientName: string;
  period: string;
  startDate: string;
  endDate: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date?: string;
}

interface Report {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  period: string;
  generatedAt: string;
  data: ReportData;
}

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  milkCollection: {
    totalLiters: number;
    averageFat: number;
    averageSnf: number;
    totalAmount: number;
  };
  farmerPayments: {
    totalAmount: number;
    farmerCount: number;
  };
  buyerSales: {
    totalAmount: number;
    buyerCount: number;
  };
  expenses: {
    feed: number;
    labor: number;
    transport: number;
    utilities: number;
    other: number;
  };
}

export default function BillingReports() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('bills');
  const [advances, setAdvances] = useState<any[]>([]);
  const [isAdvanceDialogOpen, setIsAdvanceDialogOpen] = useState(false);
  const [advanceFormData, setAdvanceFormData] = useState({
    farmerId: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [generateFormData, setGenerateFormData] = useState({
    type: 'farmer' as const,
    period: '10-day' as '1-day' | '7-day' | '10-day' | '15-day' | 'monthly' | 'custom',
    startDate: '',
    endDate: '',
    recipientId: '',
    notes: ''
  });

  useEffect(() => {
    fetchBills();
    fetchReports();
  }, []);

  const fetchBills = async () => {
    try {
      // Mock data for now
      setBills([
        {
          id: '1',
          billNumber: 'FAR-2024-001',
          type: 'farmer',
          recipientId: '1',
          recipientName: 'Ramesh Kumar',
          period: 'Jan 1-10, 2024',
          startDate: '2024-01-01',
          endDate: '2024-01-10',
          items: [
            {
              id: '1',
              description: 'Milk Collection - Morning',
              quantity: 150,
              unitPrice: 42,
              total: 6300,
              date: '2024-01-01'
            },
            {
              id: '2',
              description: 'Milk Collection - Evening',
              quantity: 120,
              unitPrice: 42,
              total: 5040,
              date: '2024-01-01'
            }
          ],
          subtotal: 11340,
          tax: 0,
          total: 11340,
          status: 'paid',
          dueDate: '2024-01-20',
          paidDate: '2024-01-18',
          paymentMethod: 'Bank Transfer',
          createdAt: '2024-01-11'
        },
        {
          id: '2',
          billNumber: 'BUY-2024-001',
          type: 'buyer',
          recipientId: '1',
          recipientName: 'Rajendra General Store',
          period: 'Jan 1-15, 2024',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          items: [
            {
              id: '1',
              description: 'Fresh Milk - 50L',
              quantity: 50,
              unitPrice: 42,
              total: 2100
            }
          ],
          subtotal: 2100,
          tax: 378,
          total: 2478,
          status: 'sent',
          dueDate: '2024-02-14',
          createdAt: '2024-01-16'
        }
      ]);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchReports = async () => {
    try {
      // Mock data for now
      setReports([
        {
          id: '1',
          name: 'Monthly Report - January 2024',
          type: 'monthly',
          period: '2024-01',
          generatedAt: '2024-02-01',
          data: {
            totalRevenue: 125000,
            totalExpenses: 85000,
            netProfit: 40000,
            milkCollection: {
              totalLiters: 2850,
              averageFat: 4.2,
              averageSnf: 8.7,
              totalAmount: 119700
            },
            farmerPayments: {
              totalAmount: 95000,
              farmerCount: 25
            },
            buyerSales: {
              totalAmount: 125000,
              buyerCount: 12
            },
            expenses: {
              feed: 35000,
              labor: 25000,
              transport: 15000,
              utilities: 5000,
              other: 5000
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleGenerateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        type: generateFormData.type,
        period: generateFormData.period,
        startDate: generateFormData.startDate,
        endDate: generateFormData.endDate,
        recipientId: generateFormData.recipientId,
        notes: generateFormData.notes
      };

      const response = await fetch('/api/bills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Bill generated successfully!');
        setIsGenerateDialogOpen(false);
        resetGenerateForm();
        fetchBills();
      } else {
        setError(data.error || 'Failed to generate bill');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (type: string, period: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, period })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Report generated successfully!');
        fetchReports();
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBill = async (billId: string, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/bills/${billId}/download?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bill-${billId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess(`Bill downloaded as ${format.toUpperCase()} successfully!`);
      }
    } catch (error) {
      setError('Failed to download bill');
    }
  };

  const downloadReport = async (reportId: string, format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess(`Report downloaded as ${format.toUpperCase()} successfully!`);
      }
    } catch (error) {
      setError('Failed to download report');
    }
  };

  const sendBillEmail = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}/send-email`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Bill sent via email successfully!');
      }
    } catch (error) {
      setError('Failed to send bill via email');
    }
  };

  const resetGenerateForm = () => {
    setGenerateFormData({
      type: 'farmer',
      period: '10-day',
      startDate: '',
      endDate: '',
      recipientId: '',
      notes: ''
    });
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || bill.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.status === 'paid').length;
  const pendingBills = bills.filter(b => b.status === 'sent' || b.status === 'draft').length;
  const overdueBills = bills.filter(b => b.status === 'overdue').length;
  const totalRevenue = bills.filter(b => b.type === 'buyer').reduce((sum, b) => sum + b.total, 0);
  const totalExpenses = bills.filter(b => b.type === 'farmer').reduce((sum, b) => sum + b.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'sent': return Mail;
      case 'draft': return Clock;
      case 'overdue': return AlertCircle;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bills', value: totalBills, icon: FileText, color: 'blue' },
          { label: 'Pending Bills', value: pendingBills, icon: Clock, color: 'orange', valueColor: 'text-orange-600' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'emerald' },
          { label: 'Total Expenses', value: `₹${totalExpenses.toFixed(0)}`, icon: DollarSign, color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold tracking-tight ${stat.valueColor || 'text-slate-900 dark:text-white'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${stat.color === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                    stat.color === 'orange' ? 'bg-orange-500/10 text-orange-600' :
                      stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                        'bg-rose-500/10 text-rose-600'
                    }`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={`h-full ${stat.color === 'blue' ? 'bg-blue-500' :
                      stat.color === 'orange' ? 'bg-orange-500' :
                        stat.color === 'emerald' ? 'bg-emerald-500' :
                          'bg-rose-500'
                      }`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Reports</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage bills and generate business reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="buyer">Buyer</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <FileText className="w-4 h-4 mr-2" />
                Generate Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Bill</DialogTitle>
                <DialogDescription>
                  Create a new bill for farmer or buyer
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

              <form onSubmit={handleGenerateBill} className="space-y-4">
                <div>
                  <Label htmlFor="type">Bill Type</Label>
                  <Select value={generateFormData.type} onValueChange={(value: any) => setGenerateFormData({ ...generateFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer Payment</SelectItem>
                      <SelectItem value="buyer">Buyer Invoice</SelectItem>
                      <SelectItem value="expense">Expense Bill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Billing Period</Label>
                  <Select value={generateFormData.period} onValueChange={(value: any) => setGenerateFormData({ ...generateFormData, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-day">Daily (1-Day)</SelectItem>
                      <SelectItem value="7-day">Weekly (7-Day)</SelectItem>
                      <SelectItem value="10-day">10-Day</SelectItem>
                      <SelectItem value="15-day">15-Day</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {generateFormData.period === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={generateFormData.startDate}
                        onChange={(e) => setGenerateFormData({ ...generateFormData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={generateFormData.endDate}
                        onChange={(e) => setGenerateFormData({ ...generateFormData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes..."
                    value={generateFormData.notes}
                    onChange={(e) => setGenerateFormData({ ...generateFormData, notes: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Bill'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map((bill) => {
                      const StatusIcon = getStatusIcon(bill.status);
                      return (
                        <TableRow key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>
                            <div className="font-medium">{bill.billNumber}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(bill.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {bill.type === 'farmer' ? 'Farmer' :
                                bill.type === 'buyer' ? 'Buyer' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{bill.recipientName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{bill.period}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{bill.total.toFixed(0)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className="w-4 h-4" />
                              <Badge className={getStatusColor(bill.status)}>
                                {bill.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(bill.dueDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadBill(bill.id, 'pdf')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendBillEmail(bill.id)}
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadBill(bill.id, 'excel')}
                              >
                                <FileSpreadsheet className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Advance Payments</h3>
            <Dialog open={isAdvanceDialogOpen} onOpenChange={setIsAdvanceDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 h-10 px-6 rounded-xl shadow-lg">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Issue Advance
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] p-8 max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Issue Advance</DialogTitle>
                  <DialogDescription className="font-medium text-slate-400">Record a cash advance for a farmer.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Farmer</Label>
                    <Select onValueChange={(v) => setAdvanceFormData({ ...advanceFormData, farmerId: v })}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select Farmer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ramesh Kumar</SelectItem>
                        <SelectItem value="2">Sunita Devi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black tracking-widest uppercase text-slate-400">Amount (₹)</Label>
                    <Input type="number" className="h-12 rounded-xl text-xl font-black border-slate-200" placeholder="500" value={advanceFormData.amount} onChange={(e) => setAdvanceFormData({ ...advanceFormData, amount: e.target.value })} />
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 h-14 rounded-2xl text-lg font-black shadow-xl shadow-orange-600/20 active:scale-95 transition-all" onClick={() => {
                    setIsAdvanceDialogOpen(false);
                  }}>
                    Confirm & Issue
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-xl shadow-slate-200/50">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Farmer</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Reason</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { date: '2024-03-20', farmer: 'Ramesh Kumar', amount: 2000, reason: 'Marriage', status: 'Approved' },
                  { date: '2024-03-18', farmer: 'Sunita Devi', amount: 500, reason: 'Feed', status: 'Approved' },
                ].map((adv, i) => (
                  <TableRow key={i} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-900">{adv.date}</TableCell>
                    <TableCell className="font-medium text-slate-600">{adv.farmer}</TableCell>
                    <TableCell className="text-red-500 font-black">₹{adv.amount}</TableCell>
                    <TableCell className="text-slate-400 text-sm italic">{adv.reason}</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-700 border-0 font-black text-[10px] rounded-lg">Approved</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport('daily', 'today')}
            >
              <Calendar className="w-6 h-6" />
              <span>Daily Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport('weekly', 'this-week')}
            >
              <BarChart3 className="w-6 h-6" />
              <span>Weekly Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport('monthly', 'this-month')}
            >
              <PieChart className="w-6 h-6" />
              <span>Monthly Report</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-gray-500">
                          Generated: {new Date(report.generatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Period: {report.period}
                        </div>
                      </div>
                      <div className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report.id, 'pdf')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report.id, 'excel')}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-1" />
                          Excel
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Revenue</div>
                        <div className="font-medium text-green-600">₹{report.data.totalRevenue.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Expenses</div>
                        <div className="font-medium text-red-600">₹{report.data.totalExpenses.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Net Profit</div>
                        <div className="font-medium text-blue-600">₹{report.data.netProfit.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Milk Collection</div>
                        <div className="font-medium">{report.data.milkCollection.totalLiters}L</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Milk Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Milk className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">2,850L</div>
                    <div className="text-sm text-gray-500">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">25</div>
                    <div className="text-sm text-gray-500">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Buyer Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">₹125K</div>
                    <div className="text-sm text-gray-500">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Target className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">32%</div>
                    <div className="text-sm text-gray-500">This month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Revenue</span>
                    <span className="font-medium text-green-600">₹125,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Expenses</span>
                    <span className="font-medium text-red-600">₹85,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: '51%' }}></div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Net Profit</span>
                    <span className="font-bold text-blue-600">₹40,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Feed</span>
                    <span className="font-medium">₹35,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '41%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Labor</span>
                    <span className="font-medium">₹25,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '29%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Transport</span>
                    <span className="font-medium">₹15,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Utilities</span>
                    <span className="font-medium">₹5,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '6%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Other</span>
                    <span className="font-medium">₹5,000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '6%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}