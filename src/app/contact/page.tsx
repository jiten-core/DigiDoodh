'use client';

import { PageHeader } from '@/components/PageHeader';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-page-enter">
            <PageHeader title={isHindi ? 'संपर्क करें' : 'Contact Us'} showBack backUrl="/" />

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <p className="text-lg text-muted-foreground">
                        {isHindi
                            ? 'हमारी टीम आपकी मदद के लिए हमेशा तैयार है। किसी भी सवाल के लिए हमसे संपर्क करें।'
                            : 'Our team is always ready to help you. Contact us for any questions.'}
                    </p>

                    <div className="space-y-4">
                        <Card className="card-premium">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-600">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{isHindi ? 'फोन' : 'Phone'}</p>
                                    <p className="font-bold text-lg">+91 98765 43210</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-premium">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-dairy-100 flex items-center justify-center text-dairy-600">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{isHindi ? 'ईमेल' : 'Email'}</p>
                                    <p className="font-bold text-lg">support@digidhoodh.com</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-premium">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-earth-100 flex items-center justify-center text-earth-600">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{isHindi ? 'पता' : 'Address'}</p>
                                    <p className="font-bold text-lg">Anand, Gujarat, India</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border">
                    <h3 className="text-xl font-bold mb-4">{isHindi ? 'संदेश भेजें' : 'Send Message'}</h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{isHindi ? 'नाम' : 'Name'}</label>
                            <input type="text" className="input-dairy" placeholder={isHindi ? "आपका नाम" : "Your Name"} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{isHindi ? 'फोन' : 'Phone'}</label>
                            <input type="tel" className="input-dairy" placeholder="+91..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{isHindi ? 'संदेश' : 'Message'}</label>
                            <textarea className="input-dairy min-h-[120px]" placeholder="..." />
                        </div>
                        <button type="button" className="btn-dairy w-full">
                            {isHindi ? 'भेजें' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
