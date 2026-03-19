'use client';

import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function BillingPage() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="animate-page-enter">
            <PageHeader
                title={isHindi ? 'बिलिंग और भुगतान' : 'Billing & Payments'}
                subtitle={isHindi ? 'किसानों के बिल मैनेज करें' : 'Manage farmer bills and payments'}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Summary Cards */}
                <Card className="card-premium">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">{isHindi ? 'कुल बकाया' : 'Total Pending'}</p>
                        <p className="text-3xl font-bold text-terra-600">₹1,24,500</p>
                        <p className="text-xs text-muted-foreground mt-2">{isHindi ? '15 किसानों का बकाया' : '15 farmers pending'}</p>
                    </CardContent>
                </Card>
                <Card className="card-premium">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">{isHindi ? 'पिछला भुगतान' : 'Last Payout'}</p>
                        <p className="text-3xl font-bold text-dairy-600">₹45,200</p>
                        <p className="text-xs text-muted-foreground mt-2">Yesterday</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="card-premium">
                <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                        {isHindi ? 'बिलिंग मॉड्यूल जल्द आ रहा है' : 'Billing Module Coming Soon'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {isHindi
                            ? 'हम अभी इस फीचर पर काम कर रहे हैं। जल्द ही आप ऑटोमैटिक बिल बना पाएंगे।'
                            : 'We are working on this feature. Soon you will be able to generate automatic bills.'
                        }
                    </p>
                    <Button className="btn-dairy">
                        {isHindi ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
