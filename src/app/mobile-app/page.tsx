'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';
import { Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MobileAppPage() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-page-enter text-center">
            <PageHeader title={isHindi ? 'मोबाइल ऐप' : 'Mobile App'} showBack backUrl="/" />

            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-32 h-32 bg-dairy-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <Smartphone className="w-16 h-16 text-dairy-600" />
                </div>

                <h2 className="text-3xl font-bold mb-4">
                    {isHindi ? 'जल्द आ रहा है!' : 'Coming Soon!'}
                </h2>

                <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8">
                    {isHindi
                        ? 'हमारा Android ऐप विकास के अंतिम चरण में है। इसे जल्द ही Play Store पर उपलब्ध कराया जाएगा।'
                        : 'Our Android app is in the final stages of development. It will be available on the Play Store soon.'}
                </p>

                <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-auto">
                    <h3 className="font-bold mb-4">{isHindi ? 'नोटिफाई करें' : 'Get Notified'}</h3>
                    <div className="flex gap-2">
                        <input type="email" placeholder="Email" className="input-dairy flex-1" />
                        <Button className="btn-dairy">
                            {isHindi ? 'सबमिट' : 'Submit'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
