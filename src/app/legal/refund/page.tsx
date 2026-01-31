'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';

export default function RefundPolicy() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-page-enter">
            <PageHeader title={isHindi ? 'धनवापसी नीति' : 'Refund Policy'} showBack backUrl="/" />

            <div className="prose dark:prose-invert max-w-none space-y-6">
                <p>
                    {isHindi
                        ? 'हम अपनी सेवाओं से आपकी संतुष्टि सुनिश्चित करना चाहते हैं।'
                        : 'We want to ensure your satisfaction with our services.'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'रिफंड प्रक्रिया' : 'Refund Process'}</h3>
                <p>
                    {isHindi
                        ? 'यदि आप हमारी प्रीमियम सदस्यता से संतुष्ट नहीं हैं, तो आप पहले 7 दिनों के भीतर रिफंड का अनुरोध कर सकते हैं। support@digidhoodh.com पर ईमेल करें।'
                        : 'If you are not satisfied with our premium subscription, you can request a refund within the first 7 days. Email us at support@digidhoodh.com.'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'रद्दीकरण' : 'Cancellation'}</h3>
                <p>
                    {isHindi
                        ? 'आप किसी भी समय अपनी सदस्यता रद्द कर सकते हैं। रद्दीकरण अगली बिलिंग अवधि से प्रभावी होगा।'
                        : 'You can cancel your subscription at any time. Cancellation will be effective from the next billing period.'}
                </p>
            </div>
        </div>
    );
}
