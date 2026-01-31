'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function HelpCenter() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    const faqs = [
        {
            q: isHindi ? 'दूध कैसे जोड़ें?' : 'How to add milk?',
            a: isHindi ? 'डैशबोर्ड पर "Add Milk" बटन पर क्लिक करें। मात्रा और फैट चुनें।' : 'Click "Add Milk" button on dashboard. Enter quantity and fat.'
        },
        {
            q: isHindi ? 'किसान को कैसे रजिस्टर करें?' : 'How to register a farmer?',
            a: isHindi ? 'किसान टैब में "किसान जोड़ें" पर क्लिक करें और विवरण भरें।' : 'Go to Farmers tab, click "Add Farmer" and fill details.'
        },
        {
            q: isHindi ? 'क्या इंटरनेट के बिना ऐप चलता है?' : 'Does app work without internet?',
            a: isHindi ? 'हाँ, ऐप ऑफलाइन मोड में काम करता है। इंटरनेट आने पर डेटा सिंक हो जाएगा।' : 'Yes, app works in offline mode. Data syncs when online.'
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-page-enter">
            <PageHeader title={isHindi ? 'सहायता केंद्र' : 'Help Center'} showBack backUrl="/" />

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    placeholder={isHindi ? "कुछ भी खोजें..." : "Search for help..."}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card focus:ring-2 focus:ring-dairy-500 outline-none text-lg"
                />
            </div>

            <div className="grid gap-6">
                {faqs.map((faq, i) => (
                    <Card key={i} className="card-premium">
                        <CardHeader>
                            <CardTitle className="text-lg">{faq.q}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{faq.a}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
