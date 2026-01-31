'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    ShoppingCart,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Archive,
    BarChart3,
    DollarSign,
    Loader2,
    Eye,
    MoreHorizontal,
    Download,
    Upload,
    RefreshCw,
    Tag,
    Boxes,
    ClipboardList
} from 'lucide-react';

// Product interface matching Prisma schema
interface Product {
    id: string;
    name: string;
    description?: string;
    category: ProductCategory;
    unit: string;
    price: number;
    minStock?: number;
    maxStock?: number;
    isActive: boolean;
    currentStock: number;
    createdAt: string;
    updatedAt: string;
}

type ProductCategory =
    | 'MILK'
    | 'GHEE'
    | 'BUTTER'
    | 'CHEESE'
    | 'YOGURT'
    | 'CATTLE_FEED'
    | 'MEDICINE'
    | 'EQUIPMENT'
    | 'OTHER';

interface InventoryTransaction {
    id: string;
    productId: string;
    productName: string;
    type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'LOSS' | 'RETURN';
    quantity: number;
    unitPrice?: number;
    totalValue?: number;
    reason?: string;
    createdAt: string;
}

interface ProductRequest {
    id: string;
    farmerId: string;
    farmerName: string;
    productId: string;
    productName: string;
    requestedQty: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

const CATEGORY_OPTIONS: { value: ProductCategory; label: string; icon: string }[] = [
    { value: 'MILK', label: 'Milk Products', icon: '🥛' },
    { value: 'GHEE', label: 'Ghee', icon: '🧈' },
    { value: 'BUTTER', label: 'Butter', icon: '🧈' },
    { value: 'CHEESE', label: 'Cheese', icon: '🧀' },
    { value: 'YOGURT', label: 'Yogurt/Curd', icon: '🥣' },
    { value: 'CATTLE_FEED', label: 'Cattle Feed', icon: '🌾' },
    { value: 'MEDICINE', label: 'Medicine', icon: '💊' },
    { value: 'EQUIPMENT', label: 'Equipment', icon: '🔧' },
    { value: 'OTHER', label: 'Other', icon: '📦' },
];

const UNIT_OPTIONS = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'L', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'bag', label: 'Bag' },
    { value: 'box', label: 'Box' },
    { value: 'bottle', label: 'Bottle' },
];

export default function ProductManager() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'OTHER' as ProductCategory,
        unit: 'kg',
        price: '',
        minStock: '',
        maxStock: '',
    });

    // Stock adjustment form
    const [stockForm, setStockForm] = useState({
        type: 'PURCHASE' as InventoryTransaction['type'],
        quantity: '',
        unitPrice: '',
        reason: '',
    });

    useEffect(() => {
        fetchProducts();
        fetchTransactions();
        fetchRequests();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            } else {
                // Use demo data if API fails
                setProducts(getDemoProducts());
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts(getDemoProducts());
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetch('/api/products?transactions=true');
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            } else {
                setTransactions(getDemoTransactions());
            }
        } catch (error) {
            setTransactions(getDemoTransactions());
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/products?requests=true');
            if (response.ok) {
                const data = await response.json();
                setRequests(data.requests || []);
            } else {
                setRequests(getDemoRequests());
            }
        } catch (error) {
            setRequests(getDemoRequests());
        }
    };

    const getDemoProducts = (): Product[] => [
        {
            id: '1',
            name: 'Fresh Cow Milk',
            description: 'Pure fresh cow milk',
            category: 'MILK',
            unit: 'L',
            price: 60,
            minStock: 50,
            maxStock: 500,
            isActive: true,
            currentStock: 150,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'Pure Desi Ghee',
            description: 'Traditional pure ghee',
            category: 'GHEE',
            unit: 'kg',
            price: 600,
            minStock: 10,
            maxStock: 100,
            isActive: true,
            currentStock: 25,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            name: 'Cattle Feed Premium',
            description: 'High protein cattle feed',
            category: 'CATTLE_FEED',
            unit: 'bag',
            price: 1200,
            minStock: 20,
            maxStock: 200,
            isActive: true,
            currentStock: 8, // Low stock
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '4',
            name: 'Cow Medicine - Vitamin',
            description: 'Vitamin supplement for cows',
            category: 'MEDICINE',
            unit: 'bottle',
            price: 450,
            minStock: 5,
            maxStock: 50,
            isActive: true,
            currentStock: 12,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '5',
            name: 'Fresh Butter',
            description: 'Homemade fresh butter',
            category: 'BUTTER',
            unit: 'kg',
            price: 500,
            minStock: 5,
            maxStock: 30,
            isActive: true,
            currentStock: 15,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    const getDemoTransactions = (): InventoryTransaction[] => [
        {
            id: '1',
            productId: '1',
            productName: 'Fresh Cow Milk',
            type: 'SALE',
            quantity: 20,
            unitPrice: 60,
            totalValue: 1200,
            createdAt: new Date().toISOString(),
        },
        {
            id: '2',
            productId: '3',
            productName: 'Cattle Feed Premium',
            type: 'PURCHASE',
            quantity: 50,
            unitPrice: 1100,
            totalValue: 55000,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: '3',
            productId: '2',
            productName: 'Pure Desi Ghee',
            type: 'SALE',
            quantity: 5,
            unitPrice: 600,
            totalValue: 3000,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
    ];

    const getDemoRequests = (): ProductRequest[] => [
        {
            id: '1',
            farmerId: 'f1',
            farmerName: 'Ramesh Kumar',
            productId: '3',
            productName: 'Cattle Feed Premium',
            requestedQty: 2,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        },
        {
            id: '2',
            farmerId: 'f2',
            farmerName: 'Suresh Patel',
            productId: '4',
            productName: 'Cow Medicine - Vitamin',
            requestedQty: 1,
            status: 'PENDING',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                minStock: formData.minStock ? parseFloat(formData.minStock) : undefined,
                maxStock: formData.maxStock ? parseFloat(formData.maxStock) : undefined,
            };

            const url = editingProduct
                ? `/api/products/${editingProduct.id}`
                : '/api/products';

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(editingProduct ? 'Product updated!' : 'Product added!');
                fetchProducts();
                resetForm();
                setShowAddModal(false);
            } else {
                toast.error('Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Failed to save product');
        }
    };

    const handleStockAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct || !stockForm.quantity) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const response = await fetch(`/api/products/${selectedProduct.id}/stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: stockForm.type,
                    quantity: parseFloat(stockForm.quantity),
                    unitPrice: stockForm.unitPrice ? parseFloat(stockForm.unitPrice) : undefined,
                    reason: stockForm.reason,
                }),
            });

            if (response.ok) {
                toast.success('Stock updated successfully!');
                fetchProducts();
                fetchTransactions();
                setShowStockModal(false);
                setStockForm({ type: 'PURCHASE', quantity: '', unitPrice: '', reason: '' });
            } else {
                toast.error('Failed to update stock');
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
        try {
            const response = await fetch(`/api/products/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}!`);
                fetchRequests();
                if (action === 'approve') {
                    fetchProducts(); // Update stock
                    fetchTransactions();
                }
            } else {
                toast.error(`Failed to ${action} request`);
            }
        } catch (error) {
            console.error('Error handling request:', error);
            toast.error(`Failed to ${action} request`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });

            if (response.ok) {
                toast.success('Product deleted!');
                fetchProducts();
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'OTHER',
            unit: 'kg',
            price: '',
            minStock: '',
            maxStock: '',
        });
        setEditingProduct(null);
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            description: product.description || '',
            category: product.category,
            unit: product.unit,
            price: product.price.toString(),
            minStock: product.minStock?.toString() || '',
            maxStock: product.maxStock?.toString() || '',
        });
        setEditingProduct(product);
        setShowAddModal(true);
    };

    const openStockModal = (product: Product) => {
        setSelectedProduct(product);
        setShowStockModal(true);
    };

    // Filtered products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Stats
    const stats = {
        totalProducts: products.length,
        lowStock: products.filter(p => p.minStock && p.currentStock < p.minStock).length,
        totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.price), 0),
        pendingRequests: requests.filter(r => r.status === 'PENDING').length,
    };

    const getStockStatus = (product: Product) => {
        if (product.minStock && product.currentStock < product.minStock) {
            return { label: 'Low Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
        }
        if (product.maxStock && product.currentStock > product.maxStock * 0.8) {
            return { label: 'High Stock', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
        }
        return { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
    };

    const getCategoryIcon = (category: ProductCategory) => {
        return CATEGORY_OPTIONS.find(c => c.value === category)?.icon || '📦';
    };

    const getTransactionTypeStyle = (type: InventoryTransaction['type']) => {
        switch (type) {
            case 'PURCHASE':
                return { icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' };
            case 'SALE':
                return { icon: TrendingDown, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' };
            case 'ADJUSTMENT':
                return { icon: RefreshCw, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' };
            case 'LOSS':
                return { icon: AlertTriangle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' };
            case 'RETURN':
                return { icon: Archive, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' };
            default:
                return { icon: Package, color: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Package className="w-8 h-8 text-green-600" />
                        {t('nav.products', 'Product & Inventory')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your products, stock, and farmer requests
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Products</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProducts}</p>
                                </div>
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Boxes className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className={`${stats.lowStock > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800' : 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${stats.lowStock > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>Low Stock Items</p>
                                    <p className={`text-3xl font-bold ${stats.lowStock > 0 ? 'text-red-900 dark:text-red-100' : 'text-green-900 dark:text-green-100'}`}>{stats.lowStock}</p>
                                </div>
                                <div className={`w-14 h-14 ${stats.lowStock > 0 ? 'bg-red-500/20' : 'bg-green-500/20'} rounded-2xl flex items-center justify-center`}>
                                    <AlertTriangle className={`w-7 h-7 ${stats.lowStock > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Value</p>
                                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">₹{stats.totalValue.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                                    <DollarSign className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className={`${stats.pendingRequests > 0 ? 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 animate-pulse' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200 dark:border-gray-800'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${stats.pendingRequests > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>Pending Requests</p>
                                    <p className={`text-3xl font-bold ${stats.pendingRequests > 0 ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-gray-100'}`}>{stats.pendingRequests}</p>
                                </div>
                                <div className={`w-14 h-14 ${stats.pendingRequests > 0 ? 'bg-orange-500/20' : 'bg-gray-500/20'} rounded-2xl flex items-center justify-center`}>
                                    <ClipboardList className={`w-7 h-7 ${stats.pendingRequests > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all">
                        <Package className="w-4 h-4 mr-2" />
                        Products
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Transactions
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all relative">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Requests
                        {stats.pendingRequests > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {stats.pendingRequests}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products" className="mt-6">
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12 text-lg rounded-xl border-gray-200 dark:border-gray-700"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[200px]"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORY_OPTIONS.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProducts.map((product, index) => {
                                const stockStatus = getStockStatus(product);
                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-3xl">{getCategoryIcon(product.category)}</span>
                                                        <div>
                                                            <CardTitle className="text-lg">{product.name}</CardTitle>
                                                            <CardDescription>{product.description}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}/{product.unit}</p>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Stock</p>
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{product.currentStock} {product.unit}</p>
                                                    </div>
                                                </div>

                                                {/* Stock Progress Bar */}
                                                {product.maxStock && (
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs text-gray-500">
                                                            <span>Stock Level</span>
                                                            <span>{Math.round((product.currentStock / product.maxStock) * 100)}%</span>
                                                        </div>
                                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${product.minStock && product.currentStock < product.minStock
                                                                        ? 'bg-red-500'
                                                                        : product.currentStock / product.maxStock > 0.8
                                                                            ? 'bg-blue-500'
                                                                            : 'bg-green-500'
                                                                    }`}
                                                                style={{ width: `${Math.min((product.currentStock / product.maxStock) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openStockModal(product)}
                                                        className="flex-1"
                                                    >
                                                        <RefreshCw className="w-4 h-4 mr-1" />
                                                        Adjust Stock
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchTerm || categoryFilter !== 'all'
                                    ? 'Try adjusting your search or filter'
                                    : 'Get started by adding your first product'}
                            </p>
                            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Track all inventory movements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transactions.map((tx, index) => {
                                    const style = getTransactionTypeStyle(tx.type);
                                    const Icon = style.icon;
                                    return (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.color}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{tx.productName}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {tx.type === 'PURCHASE' ? '+' : '-'}{tx.quantity} units
                                                    {tx.reason && ` • ${tx.reason}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-bold ${tx.type === 'PURCHASE' || tx.type === 'RETURN' ? 'text-green-600' : 'text-blue-600'}`}>
                                                    {tx.totalValue ? `₹${tx.totalValue.toLocaleString('en-IN')}` : '-'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {transactions.length === 0 && (
                                    <div className="text-center py-12">
                                        <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Requests Tab */}
                <TabsContent value="requests" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Requests from Farmers</CardTitle>
                            <CardDescription>Review and manage farmer product requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {requests.map((request, index) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-xl border-2 ${request.status === 'PENDING'
                                                ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                                                : request.status === 'APPROVED'
                                                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${request.status === 'PENDING'
                                                        ? 'bg-orange-200 dark:bg-orange-800'
                                                        : request.status === 'APPROVED'
                                                            ? 'bg-green-200 dark:bg-green-800'
                                                            : 'bg-red-200 dark:bg-red-800'
                                                    }`}>
                                                    <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{request.farmerName}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Requesting: <strong>{request.requestedQty}x {request.productName}</strong>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(request.createdAt).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>

                                            {request.status === 'PENDING' ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleRequestAction(request.id, 'approve')}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRequestAction(request.id, 'reject')}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Badge className={
                                                    request.status === 'APPROVED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }>
                                                    {request.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {requests.length === 0 && (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No product requests yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-base">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter product name"
                                        className="h-12 text-lg mt-1"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-base">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Product description"
                                        className="h-12 text-lg mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category" className="text-base">Category *</Label>
                                        <select
                                            id="category"
                                            value={formData.category}
                                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as ProductCategory }))}
                                            className="w-full h-12 px-3 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        >
                                            {CATEGORY_OPTIONS.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="unit" className="text-base">Unit *</Label>
                                        <select
                                            id="unit"
                                            value={formData.unit}
                                            onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                            className="w-full h-12 px-3 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        >
                                            {UNIT_OPTIONS.map(unit => (
                                                <option key={unit.value} value={unit.value}>{unit.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="price" className="text-base">Price (₹) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="h-12 text-lg mt-1"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="minStock" className="text-base">Min Stock Alert</Label>
                                        <Input
                                            id="minStock"
                                            type="number"
                                            value={formData.minStock}
                                            onChange={e => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                                            placeholder="10"
                                            className="h-12 text-lg mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="maxStock" className="text-base">Max Stock Capacity</Label>
                                        <Input
                                            id="maxStock"
                                            type="number"
                                            value={formData.maxStock}
                                            onChange={e => setFormData(prev => ({ ...prev, maxStock: e.target.value }))}
                                            placeholder="100"
                                            className="h-12 text-lg mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                    >
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stock Adjustment Modal */}
            <AnimatePresence>
                {showStockModal && selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowStockModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Adjust Stock</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {selectedProduct.name} - Current: {selectedProduct.currentStock} {selectedProduct.unit}
                                </p>
                            </div>
                            <form onSubmit={handleStockAdjustment} className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="stockType" className="text-base">Transaction Type *</Label>
                                    <select
                                        id="stockType"
                                        value={stockForm.type}
                                        onChange={e => setStockForm(prev => ({ ...prev, type: e.target.value as InventoryTransaction['type'] }))}
                                        className="w-full h-12 px-3 mt-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <option value="PURCHASE">📥 Purchase (Add Stock)</option>
                                        <option value="SALE">📤 Sale (Remove Stock)</option>
                                        <option value="ADJUSTMENT">🔄 Adjustment</option>
                                        <option value="LOSS">⚠️ Loss/Damage</option>
                                        <option value="RETURN">↩️ Return</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="stockQty" className="text-base">Quantity *</Label>
                                    <Input
                                        id="stockQty"
                                        type="number"
                                        step="0.01"
                                        value={stockForm.quantity}
                                        onChange={e => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                                        placeholder="0"
                                        className="h-12 text-lg mt-1"
                                        required
                                    />
                                </div>

                                {(stockForm.type === 'PURCHASE' || stockForm.type === 'SALE') && (
                                    <div>
                                        <Label htmlFor="unitPrice" className="text-base">Unit Price (₹)</Label>
                                        <Input
                                            id="unitPrice"
                                            type="number"
                                            step="0.01"
                                            value={stockForm.unitPrice}
                                            onChange={e => setStockForm(prev => ({ ...prev, unitPrice: e.target.value }))}
                                            placeholder="0.00"
                                            className="h-12 text-lg mt-1"
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="reason" className="text-base">Reason/Notes</Label>
                                    <Input
                                        id="reason"
                                        value={stockForm.reason}
                                        onChange={e => setStockForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Optional note..."
                                        className="h-12 text-lg mt-1"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowStockModal(false)}
                                        className="flex-1 h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                    >
                                        Update Stock
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
