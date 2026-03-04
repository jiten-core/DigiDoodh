// Redirect to new standalone reports page with real data
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardReportsRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/reports');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
    );
}
