'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-page-enter">
            <PageHeader title={isHindi ? 'सेवा की शर्तें' : 'Terms of Service'} showBack backUrl="/" />

            <div className="prose dark:prose-invert max-w-none space-y-6">
                <p>
                    {isHindi
                        ? 'DigiDhoodh का उपयोग करके, आप निम्नलिखित शर्तों से सहमत हैं।'
                        : 'By using DigiDhoodh, you agree to the following terms and conditions.'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'खाता ज़िम्मेदारी' : 'Account Responsibility'}</h3>
                <p>
                    {isHindi
                        ? 'आप अपने खाते की सुरक्षा और पासवर्ड के लिए जिम्मेदार हैं। किसी भी अनधिकृत उपयोग की सूचना तुरंत दें।'
                        : 'You are responsible for the security of your account and password. Report any unauthorized use immediately.'}
                </p>

                <h3 className="text-xl font-bold mt-6">{isHindi ? 'सेवा का उपयोग' : 'Use of Service'}</h3>
                <p>
                    {isHindi
                        ? 'हमारी सेवा का उपयोग केवल वैध डेरी प्रबंधन उद्देश्यों के लिए किया जाना चाहिए। दुरुपयोग के कारण खाता निलंबित किया जा सकता है।'
                        : 'Our service must be used only for lawful dairy management purposes. Misuse may result in account suspension.'}
                </p>
            </div>
        </div>
    );
}
