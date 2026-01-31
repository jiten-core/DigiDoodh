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
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Warehouse,
  Truck
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: 'milk' | 'ghee' | 'butter' | 'cheese' | 'yogurt' | 'paneer' | 'other';
  sku: string;
  description?: string;
  unit: 'liters' | 'kg' | 'pieces' | 'packets';
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  unitCost: number;
  supplier?: string;
  lastRestockDate?: string;
  status: 'active' | 'inactive' | 'discontinued';
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
}

interface StockTransaction {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  referenceNumber?: string;
  supplier?: string;
  customer?: string;
  unitCost?: number;
  totalCost?: number;
}

interface SalesData {
  productId: string;
  productName: string;
  period: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export default function ProductInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  const [formData, setFormData] = useState({
    name: '',
    category: 'milk' as any,
    sku: '',
    description: '',
    unit: 'liters' as any,
    currentStock: '0',
    minStockLevel: '10',
    maxStockLevel: '100',
    unitPrice: '50',
    unitCost: '35',
    supplier: '',
    batchNumber: '',
    expiryDate: '',
    storageLocation: '',
    status: 'active' as any
  });

  const [transactionFormData, setTransactionFormData] = useState({
    productId: '',
    type: 'in' as any,
    quantity: '1',
    reason: '',
    referenceNumber: '',
    supplier: '',
    unitCost: '0'
  });

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
    fetchSalesData();
  }, []);

  const fetchProducts = async () => {
    try {
      // Mock data for now
      setProducts([
        {
          id: '1',
          name: 'Fresh Milk',
          category: 'milk',
          sku: 'MILK-001',
          description: 'Pure fresh cow milk',
          unit: 'liters',
          currentStock: 150,
          minStockLevel: 50,
          maxStockLevel: 500,
          unitPrice: 42,
          unitCost: 35,
          supplier: 'Local Dairy Farm',
          lastRestockDate: '2024-01-15',
          status: 'active',
          batchNumber: 'BATCH-001',
          expiryDate: '2024-01-20',
          storageLocation: 'Cold Storage A'
        },
        {
          id: '2',
          name: 'Pure Ghee',
          category: 'ghee',
          sku: 'GHEE-001',
          description: 'Pure cow ghee',
          unit: 'kg',
          currentStock: 25,
          minStockLevel: 10,
          maxStockLevel: 100,
          unitPrice: 450,
          unitCost: 380,
          supplier: 'Local Dairy Farm',
          lastRestockDate: '2024-01-10',
          status: 'active',
          batchNumber: 'BATCH-002',
          expiryDate: '2024-12-31',
          storageLocation: 'Storage Room B'
        },
        {
          id: '3',
          name: 'Fresh Butter',
          category: 'butter',
          sku: 'BUT-001',
          description: 'Salted butter',
          unit: 'kg',
          currentStock: 8,
          minStockLevel: 15,
          maxStockLevel: 50,
          unitPrice: 320,
          unitCost: 280,
          supplier: 'Local Dairy Farm',
          lastRestockDate: '2024-01-12',
          status: 'active',
          batchNumber: 'BATCH-003',
          expiryDate: '2024-02-15',
          storageLocation: 'Cold Storage B'
        }
      ]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Mock data for now
      setTransactions([
        {
          id: '1',
          productId: '1',
          type: 'in',
          quantity: 100,
          reason: 'Regular restock',
          date: '2024-01-15',
          referenceNumber: 'PO-001',
          supplier: 'Local Dairy Farm',
          unitCost: 35,
          totalCost: 3500
        },
        {
          id: '2',
          productId: '1',
          type: 'out',
          quantity: 50,
          reason: 'Sale to customer',
          date: '2024-01-16',
          customer: 'Rajendra Store'
        }
      ]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      // Mock data for now
      setSalesData([
        {
          productId: '1',
          productName: 'Fresh Milk',
          period: 'Jan 2024',
          quantitySold: 1250,
          revenue: 52500,
          profit: 8750
        },
        {
          productId: '2',
          productName: 'Pure Ghee',
          period: 'Jan 2024',
          quantitySold: 45,
          revenue: 20250,
          profit: 3150
        }
      ]);
    } catch (error) {
      console.error('Error fetching sales data:', error);
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
        category: formData.category,
        sku: formData.sku,
        description: formData.description,
        unit: formData.unit,
        currentStock: parseFloat(formData.currentStock),
        minStockLevel: parseFloat(formData.minStockLevel),
        maxStockLevel: parseFloat(formData.maxStockLevel),
        unitPrice: parseFloat(formData.unitPrice),
        unitCost: parseFloat(formData.unitCost),
        supplier: formData.supplier,
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        storageLocation: formData.storageLocation,
        status: formData.status
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setIsAddDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        fetchProducts();
      } else {
        setError(data.error || 'Failed to save product');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const quantity = parseFloat(transactionFormData.quantity);
      const unitCost = parseFloat(transactionFormData.unitCost);

      const payload = {
        productId: transactionFormData.productId,
        type: transactionFormData.type,
        quantity,
        reason: transactionFormData.reason,
        referenceNumber: transactionFormData.referenceNumber,
        supplier: transactionFormData.supplier,
        unitCost,
        totalCost: quantity * unitCost
      };

      const response = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Transaction recorded successfully!');
        setIsTransactionDialogOpen(false);
        resetTransactionForm();
        fetchProducts();
        fetchTransactions();
      } else {
        setError(data.error || 'Failed to record transaction');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      description: product.description || '',
      unit: product.unit,
      currentStock: product.currentStock.toString(),
      minStockLevel: product.minStockLevel.toString(),
      maxStockLevel: product.maxStockLevel.toString(),
      unitPrice: product.unitPrice.toString(),
      unitCost: product.unitCost.toString(),
      supplier: product.supplier || '',
      batchNumber: product.batchNumber || '',
      expiryDate: product.expiryDate || '',
      storageLocation: product.storageLocation || '',
      status: product.status
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        setSuccess('Product deleted successfully!');
        fetchProducts();
      } else {
        setError(data.error || 'Failed to delete product');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'milk',
      sku: '',
      description: '',
      unit: 'liters',
      currentStock: '0',
      minStockLevel: '10',
      maxStockLevel: '100',
      unitPrice: '50',
      unitCost: '35',
      supplier: '',
      batchNumber: '',
      expiryDate: '',
      storageLocation: '',
      status: 'active'
    });
  };

  const resetTransactionForm = () => {
    setTransactionFormData({
      productId: '',
      type: 'in',
      quantity: '1',
      reason: '',
      referenceNumber: '',
      supplier: '',
      unitCost: '0'
    });
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return { status: 'out', color: 'red', icon: XCircle };
    if (product.currentStock <= product.minStockLevel) return { status: 'low', color: 'orange', icon: AlertTriangle };
    if (product.currentStock >= product.maxStockLevel) return { status: 'overstock', color: 'blue', icon: TrendingUp };
    return { status: 'normal', color: 'green', icon: CheckCircle };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel).length;
  const outOfStockProducts = products.filter(p => p.currentStock === 0).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0);

  const totalRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = salesData.reduce((sum, s) => sum + s.profit, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventory Value</p>
                <p className="text-2xl font-bold">₹{totalInventoryValue.toFixed(0)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profit</p>
                <p className="text-2xl font-bold">₹{totalProfit.toFixed(0)}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Inventory</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage products, stock, and sales</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="milk">Milk</SelectItem>
              <SelectItem value="ghee">Ghee</SelectItem>
              <SelectItem value="butter">Butter</SelectItem>
              <SelectItem value="cheese">Cheese</SelectItem>
              <SelectItem value="yogurt">Yogurt</SelectItem>
              <SelectItem value="paneer">Paneer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Truck className="w-4 h-4 mr-2" />
                Stock Movement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Stock Movement</DialogTitle>
                <DialogDescription>
                  Record stock in/out or adjustment
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

              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={transactionFormData.productId} onValueChange={(value) => setTransactionFormData({ ...transactionFormData, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.currentStock} {product.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Transaction Type</Label>
                    <Select value={transactionFormData.type} onValueChange={(value: any) => setTransactionFormData({ ...transactionFormData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Stock In</SelectItem>
                        <SelectItem value="out">Stock Out</SelectItem>
                        <SelectItem value="adjustment">Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.1"
                      placeholder="1"
                      value={transactionFormData.quantity}
                      onChange={(e) => setTransactionFormData({ ...transactionFormData, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Reason for stock movement..."
                    value={transactionFormData.reason}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, reason: e.target.value })}
                    required
                  />
                </div>

                {transactionFormData.type === 'in' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        placeholder="Supplier name"
                        value={transactionFormData.supplier}
                        onChange={(e) => setTransactionFormData({ ...transactionFormData, supplier: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unitCost">Unit Cost (₹)</Label>
                      <Input
                        id="unitCost"
                        type="number"
                        step="0.1"
                        placeholder="35.0"
                        value={transactionFormData.unitCost}
                        onChange={(e) => setTransactionFormData({ ...transactionFormData, unitCost: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    id="referenceNumber"
                    placeholder="PO-001 or REF-001"
                    value={transactionFormData.referenceNumber}
                    onChange={(e) => setTransactionFormData({ ...transactionFormData, referenceNumber: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Record Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogDescription>
                  Enter the product details below
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
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      placeholder="Product SKU"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milk">Milk</SelectItem>
                        <SelectItem value="ghee">Ghee</SelectItem>
                        <SelectItem value="butter">Butter</SelectItem>
                        <SelectItem value="cheese">Cheese</SelectItem>
                        <SelectItem value="yogurt">Yogurt</SelectItem>
                        <SelectItem value="paneer">Paneer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value: any) => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="packets">Packets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Product description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Min Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      step="0.1"
                      placeholder="10"
                      value={formData.minStockLevel}
                      onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      step="0.1"
                      placeholder="100"
                      value={formData.maxStockLevel}
                      onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.1"
                      placeholder="50.0"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unitCost">Unit Cost (₹)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.1"
                      placeholder="35.0"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      placeholder="Supplier name"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      placeholder="Batch number"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="storageLocation">Storage Location</Label>
                  <Input
                    id="storageLocation"
                    placeholder="Storage location"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const profitMargin = ((product.unitPrice - product.unitCost) / product.unitCost * 100).toFixed(1);
                      const StatusIcon = stockStatus.icon;

                      return (
                        <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                              {product.expiryDate && (
                                <div className="text-xs text-orange-600">
                                  Expires: {new Date(product.expiryDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{product.currentStock} {product.unit}</span>
                              <StatusIcon className={`w-4 h-4 text-${stockStatus.color}-600`} />
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: {product.minStockLevel} | Max: {product.maxStockLevel}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{product.unitPrice}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{product.unitCost}</div>
                          </TableCell>
                          <TableCell>
                            <div className={`font-medium ${parseFloat(profitMargin) > 20 ? 'text-green-600' : 'text-orange-600'}`}>
                              {profitMargin}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                              {product.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
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

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transactions</CardTitle>
              <CardDescription>View all stock movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {transaction.type === 'in' ? 'Stock In' :
                            transaction.type === 'out' ? 'Stock Out' : 'Adjustment'}
                        </div>
                        <div className="text-sm text-gray-500">{transaction.reason}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        {transaction.referenceNumber && (
                          <div className="text-sm text-gray-500">
                            Ref: {transaction.referenceNumber}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.type === 'in' ? '+' : '-'}{transaction.quantity}
                        </div>
                        {transaction.totalCost && (
                          <div className="text-sm text-gray-500">
                            ₹{transaction.totalCost.toFixed(0)}
                          </div>
                        )}
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
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Product performance and profitability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.map((sale) => (
                  <div key={`${sale.productId}-${sale.period}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{sale.productName}</div>
                        <div className="text-sm text-gray-500">{sale.period}</div>
                        <div className="text-sm text-gray-500">
                          Units sold: {sale.quantitySold}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{sale.revenue.toFixed(0)}</div>
                        <div className="text-sm text-green-600">
                          Profit: ₹{sale.profit.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Margin: {((sale.profit / sale.revenue) * 100).toFixed(1)}%
                        </div>
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