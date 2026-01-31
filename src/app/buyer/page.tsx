'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, ShoppingCart } from 'lucide-react';

export default function BuyerDashboard() {
    const { user, profile, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-dairy-600" /></div>;

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-saffron-100 rounded-full flex items-center justify-center mb-6 text-saffron-600">
                <ShoppingCart className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-dairy-900 mb-2">Buyer Dashboard</h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-sm">
                Welcome, {profile?.name}. Your purchase history and wallet will appear here.
            </p>
            <p className="text-sm bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 mb-8">
                🚧 Buyer Module Coming Soon
            </p>
            <Button onClick={logout} variant="outline" className="w-full max-w-xs h-12 text-lg">
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
            </Button>
        </div>
    );
}
