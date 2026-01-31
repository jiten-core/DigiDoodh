'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function PricingPage() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';
    const router = useRouter();
    const { user } = useAuth();

    const plans = [
        {
            id: 'free',
            name: 'शुरुआत',
            nameEn: 'Starter',
            price: '₹0',
            duration: '/month',
            description: 'छोटी डेयरी के लिए',
            descriptionEn: 'For small dairies',
            features: ['Add milk (today only)', 'Up to 10 farmers', 'Basic reports', 'Mobile app'],
            popular: false
        },
        {
            id: 'premium',
            name: 'व्यापार',
            nameEn: 'Business',
            price: '₹199',
            duration: '/month',
            description: 'बढ़ती डेयरी के लिए',
            descriptionEn: 'For growing dairies',
            features: ['1-month history', 'Up to 500 farmers', 'WhatsApp alerts', 'PDF Reports', 'Priority support'],
            popular: true
        },
        {
            id: 'ultimate',
            name: 'उद्योग',
            nameEn: 'Enterprise',
            price: '₹499',
            duration: '/month',
            description: 'बड़ी डेयरी के लिए',
            descriptionEn: 'For large dairies',
            features: ['1-year history', 'Unlimited farmers', 'Offline mode', 'AI Assistant', 'Custom branding'],
            popular: false
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-page-enter">
            <PageHeader title={isHindi ? 'योजनाएं और कीमत' : 'Plans & Pricing'} showBack backUrl="/" />

            <div className="grid md:grid-cols-3 gap-8 mt-8">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-3xl p-8 ${plan.popular
                            ? 'bg-dairy-premium text-white shadow-xl scale-105'
                            : 'card-premium'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-saffron-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                    {isHindi ? 'लोकप्रिय' : 'POPULAR'}
                                </span>
                            </div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{isHindi ? plan.name : plan.nameEn}</h3>
                        <div className="text-4xl font-bold mb-4">
                            {plan.price}
                            <span className="text-lg font-normal opacity-75">{plan.duration}</span>
                        </div>
                        <p className={`mb-6 ${plan.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {isHindi ? plan.description : plan.descriptionEn}
                        </p>

                        <ul className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-white' : 'text-dairy-600'}`} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => router.push(user ? `/subscription?plan=${plan.id}` : `/auth?redirect=/subscription&plan=${plan.id}`)}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular
                                    ? 'bg-white text-dairy-700 hover:bg-cream-100'
                                    : 'btn-dairy'
                                }`}
                        >
                            {isHindi ? 'चुनें' : 'Choose Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
