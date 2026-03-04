'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useInventory } from '@/hooks/useInventory';
import { Product, ProductRequest } from '@/shared/types';
import {
    Package,
    ShoppingCart,
    History,
    CheckCircle,
    Clock,
    XCircle,
    Info,
    Plus,
    Minus,
    ArrowRight
} from 'lucide-react';
import { PLAN_TIER } from '@/lib/subscription';


export default function FarmerProductRequest() {
    const { profile, checkAccess } = useAuth();
    const { t, i18n } = useTranslation();

    // New Modular Hook
    const { products, requests: myRequests, fetchProducts, fetchRequests, createRequest, loading } = useInventory(profile?.dairy?.id);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isHindi = i18n.language === 'hi';
    const isPremiumPlus = checkAccess('product_requests');

    useEffect(() => {
        if (profile?.dairy?.id) {
            fetchProducts();
            if (profile?.role === 'FARMER' || (profile?.role as any) === 'farmer') {
                fetchRequests(profile.id);
            } else {
                fetchRequests();
            }
        }
    }, [profile?.dairy?.id, fetchProducts, fetchRequests]);

    const handleRequest = async () => {
        if (!selectedProduct || !profile?.id) return;

        setIsSubmitting(true);
        try {
            await createRequest({
                farmer_id: profile.id,
                product_id: selectedProduct.id,
                quantity: quantity
            });
            setSelectedProduct(null);
            setQuantity(1);
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</div>;

    if (!isPremiumPlus && (profile?.role === 'FARMER' || (profile?.role as any) === 'farmer')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="w-20 h-20 bg-saffron-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-saffron-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                    {isHindi ? 'प्रीमियम सुविधा' : 'Premium Feature'}
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                    {isHindi
                        ? 'उत्पाद अनुरोध सुविधा केवल उन डेयरियों के लिए उपलब्ध है जिनके पास Premium+ योजना है।'
                        : 'Product request feature is only available for dairies with a Premium+ plan.'}
                </p>
                <div className="p-4 bg-muted rounded-xl flex items-start gap-3 text-left max-w-sm">
                    <Info className="w-5 h-5 text-dairy-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                        {isHindi
                            ? 'कृपया अपनी डेयरी के मालिक से संपर्क करें और उन्हें Premium+ पर अपग्रेड करने के लिए कहें।'
                            : 'Please contact your dairy owner and ask them to upgrade to Premium+.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-dairy-600" />
                        {isHindi ? 'सामान मंगाएं' : 'Order Products'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isHindi ? 'डेयरी से पशु आहार या अन्य सामान का ऑर्डर दें' : 'Order cattle feed or other items from dairy'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">{isHindi ? 'उपलब्ध उत्पाद' : 'Available Products'}</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedProduct(product)}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedProduct?.id === product.id
                                    ? 'border-dairy-500 bg-dairy-50 shadow-md transform translate-y-[-2px]'
                                    : 'border-border bg-card'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-3xl">
                                        {product.category === 'CATTLE_FEED' ? '🌾' : product.category === 'GHEE' ? '🧈' : '💊'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground">{product.description}</p>
                                        <p className="text-dairy-600 font-bold mt-1">₹{product.price} / {product.unit}</p>
                                    </div>
                                </div>
                                <ArrowRight className={`w-6 h-6 ${selectedProduct?.id === product.id ? 'text-dairy-600' : 'text-muted-foreground'}`} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Request Form (Visible when product selected) */}
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key="request-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <Card className="border-2 border-dairy-500 shadow-xl overflow-hidden">
                                    <div className="bg-dairy-500 p-4 text-white">
                                        <CardTitle className="text-xl">{isHindi ? 'ऑर्डर विवरण' : 'Order Details'}</CardTitle>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground">{isHindi ? 'चुना हुआ उत्पाद' : 'Selected Product'}</p>
                                                <p className="text-xl font-bold">{selectedProduct.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">{isHindi ? 'कीमत' : 'Price'}</p>
                                                <p className="text-xl font-bold">₹{selectedProduct.price}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold block">{isHindi ? 'मात्रा' : 'Quantity'}</label>
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-14 w-14 rounded-xl border-2"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                >
                                                    <Minus className="w-6 h-6" />
                                                </Button>
                                                <div className="flex-1 text-center text-3xl font-bold">
                                                    {quantity} <span className="text-sm font-normal text-muted-foreground">{selectedProduct.unit}</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-14 w-14 rounded-xl border-2"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                >
                                                    <Plus className="w-6 h-6" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted rounded-2xl flex justify-between items-center">
                                            <span className="font-bold text-lg">{isHindi ? 'कुल राशि' : 'Total Amount'}</span>
                                            <span className="text-2xl font-bold text-dairy-700">₹{(selectedProduct.price * quantity).toLocaleString('en-IN')}</span>
                                        </div>

                                        <Button
                                            className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg shadow-dairy-200"
                                            disabled={isSubmitting}
                                            onClick={handleRequest}
                                        >
                                            {isSubmitting
                                                ? (isHindi ? 'भेज रहे हैं...' : 'Sending...')
                                                : (isHindi ? 'अनुरोध भेजें' : 'Send Request')}
                                        </Button>

                                        <p className="text-center text-xs text-muted-foreground">
                                            {isHindi
                                                ? '* अनुरोध मंजूर होने के बाद राशि आपके खाते से काट ली जाएगी'
                                                : '* Amount will be deducted from your ledger after approval'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="no-selection"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[300px] border-2 border-dashed border-muted-foreground/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {isHindi ? 'उत्पाद चुनें' : 'Select a Product'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {isHindi ? 'ऑर्डर शुरू करने के लिए बाईं ओर से किसी उत्पाद पर क्लिक करें' : 'Click on a product from the left to start ordering'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Request History */}
            <div className="pt-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-muted-foreground" />
                    {isHindi ? 'मेरे पिछले अनुरोध' : 'My Past Requests'}
                </h2>
                <div className="space-y-3">
                    {myRequests.map((req: any) => (
                        <div key={req.id} className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${req.status === 'approved' ? 'bg-green-100/50' : req.status === 'rejected' ? 'bg-red-100/50' : 'bg-orange-100/50'
                                    }`}>
                                    {req.status === 'approved' ? <CheckCircle className="w-6 h-6 text-green-600" /> : req.status === 'rejected' ? <XCircle className="w-6 h-6 text-red-600" /> : <Clock className="w-6 h-6 text-orange-600" />}
                                </div>
                                <div>
                                    <h4 className="font-bold">{req.product?.name || 'Product'}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {req.quantity} units • ₹{req.quantity * (req.product?.price || 0)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(req.created_at).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <Badge className={`rounded-xl px-3 py-1 ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                {isHindi
                                    ? (req.status === 'approved' ? 'मंजूर' : req.status === 'rejected' ? 'खारिज' : 'लंबित')
                                    : req.status
                                }
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
