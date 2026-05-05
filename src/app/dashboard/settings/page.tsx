'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/PageHeader'
import {
    User, Building2, Bell, Globe, Palette, Shield,
    Save, Moon, Sun, Star, Smartphone, Check
} from 'lucide-react'
import { SUPPORTED_LANGUAGES } from '@/i18n'

export default function SettingsPage() {
    const { profile } = useAuth()
    const { t, i18n } = useTranslation()
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const isHindi = i18n.language === 'hi'

    // Profile settings
    const [name, setName] = useState(profile?.name || '')
    const [email, setEmail] = useState(profile?.email || '')
    const [phone, setPhone] = useState(profile?.phone || '')

    // Dairy settings
    const [dairyName, setDairyName] = useState(profile?.dairy?.name || '')
    const [address, setAddress] = useState('')

    // App settings
    const [language, setLanguage] = useState(i18n.language)
    const [isDirty, setIsDirty] = useState(false)

    // Track changes
    const handleChange = (setter: (value: string) => void) => (value: string) => {
        setter(value)
        setIsDirty(true)
    }

    const handleSave = async () => {
        if (!isDirty) return
        setSaving(true)
        try {
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (language !== i18n.language) {
                i18n.changeLanguage(language)
                localStorage.setItem('i18nextLng', language)
            }
            toast.success(isHindi ? 'सेटिंग्स सेव हो गई' : 'Settings saved successfully!')
        } catch (error) {
            toast.error(isHindi ? 'सेटिंग्स सेव नहीं हुई' : 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="animate-page-enter space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                        {isHindi ? 'सेटिंग्स' : 'Settings'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isHindi ? 'अपना खाता और डेयरी manage करें' : 'Manage your account and preferences'}
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || !isDirty} className="btn-dairy h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed">
                    {saving ? (
                        <>{isHindi ? 'सेव हो रहा है...' : 'Saving...'}</>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            {isHindi ? 'सेव करें' : 'Save Changes'}
                        </>
                    )}
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-transparent p-0 h-auto grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {[
                        { id: 'profile', icon: User, label: isHindi ? 'प्रोफाइल' : 'Profile' },
                        { id: 'dairy', icon: Building2, label: isHindi ? 'डेयरी' : 'Dairy' },
                        { id: 'app', icon: Smartphone, label: isHindi ? 'ऐप सेटिंग' : 'App Settings' },
                        { id: 'language', icon: Globe, label: isHindi ? 'भाषा' : 'Language' },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className={`flex-1 sm:flex-none items-center gap-2 px-4 py-3 rounded-xl border transition-all data-[state=active]:bg-dairy-500 data-[state=active]:text-white data-[state=active]:border-dairy-600 border-border bg-card hover:bg-muted font-medium text-sm`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">{isHindi ? 'व्यक्तिगत जानकारी' : 'Personal Information'}</CardTitle>
                            <CardDescription>{isHindi ? 'अपनी जानकारी अपडेट करें' : 'Update your personal details'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{isHindi ? 'नाम' : 'Full Name'}</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>{isHindi ? 'फोन' : 'Phone Number'}</Label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label>{isHindi ? 'ईमेल' : 'Email Address'}</Label>
                                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Dairy Tab */}
                <TabsContent value="dairy" className="space-y-4">
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">{isHindi ? 'डेयरी की जानकारी' : 'Dairy Information'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{isHindi ? 'डेयरी का नाम' : 'Dairy Name'}</Label>
                                <Input value={dairyName} onChange={(e) => setDairyName(e.target.value)} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label>{isHindi ? 'पता' : 'Address'}</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-12 rounded-xl" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* App Settings Tab */}
                <TabsContent value="app" className="space-y-4">
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">{isHindi ? 'ऐप सेटिंग्स' : 'Application Settings'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{isHindi ? 'डार्क मोड' : 'Dark Mode'}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {isHindi ? 'रात में काम करने के लिए आसान' : 'Easier on the eyes at night'}
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">{isHindi ? 'व्हाट्सएप अलर्ट' : 'WhatsApp Alerts'}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {isHindi ? 'किसानों को मैसेज भेजें' : 'Send message updates to farmers'}
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Language Tab */}
                <TabsContent value="language" className="space-y-4">
                    <Card className="card-premium">
                        <CardHeader>
                            <CardTitle className="font-display text-xl">{isHindi ? 'भाषा चुनें' : 'Select Language'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <div
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all ${language === lang.code
                                            ? 'border-dairy-500 bg-dairy-50 dark:bg-dairy-900/20'
                                            : 'border-border hover:border-dairy-200'
                                            }`}
                                    >
                                        <span className="text-2xl">{lang.nativeName.charAt(0)}</span>
                                        <div className="text-center">
                                            <p className="font-bold text-foreground">{lang.nativeName}</p>
                                            <p className="text-sm text-muted-foreground">{lang.name}</p>
                                        </div>
                                        {language === lang.code && <Check className="w-5 h-5 text-dairy-600" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
