'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-page-enter">
            <PageHeader title={isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'} showBack backUrl="/" />

            <div className="prose dark:prose-invert max-w-none space-y-6">
                <p>
                    {isHindi
                        ? 'DigiDhoodh में, हम आपकी गोपनीयता की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि हम आपकी जानकारी कैसे एकत्र करते हैं, उसका उपयोग करते हैं और उसे सुरक्षित रखते हैं।'
                        : 'At DigiDhoodh, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'जानकारी संग्रह' : 'Information Collection'}</h3>
                <p>
                    {isHindi
                        ? 'हम आपके द्वारा प्रदान की गई जानकारी (जैसे नाम, फोन नंबर, डेयरी विवरण) और ऐप के उपयोग से संबंधित डेटा (जैसे दूध संग्रह डेटा) एकत्र करते हैं।'
                        : 'We collect information you provide (such as name, phone number, dairy details) and data related to your use of the app (such as milk collection data).'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'डेटा का उपयोग' : 'Use of Data'}</h3>
                <p>
                    {isHindi
                        ? 'हम आपके डेटा का उपयोग आपकी सेवाओं को बेहतर बनाने, बिल जेनरेट करने और आपको महत्वपूर्ण अपडेट भेजने के लिए करते हैं।'
                        : 'We use your data to improve our services, generate bills, and send you important updates.'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'संपर्क करें' : 'Contact Us'}</h3>
                <p>
                    {isHindi
                        ? 'यदि आपके कोई प्रश्न हैं, तो कृपया support@digidhoodh.com पर संपर्क करें।'
                        : 'If you have any questions, please contact us at support@digidhoodh.com.'}
                </p>
            </div>
        </div>
    );
}
