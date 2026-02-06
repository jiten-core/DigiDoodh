'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';
import FarmerBilling from '@/components/billing/FarmerBilling';

export default function BillingPage() {
    const { i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="animate-page-enter">
            <PageHeader
                title={isHindi ? 'बिलिंग और भुगतान' : 'Billing & Payments'}
                subtitle={isHindi ? 'किसानों के बिल मैनेज करें' : 'Manage farmer bills and payments'}
            />

            <FarmerBilling />
        </div>
    );
}
