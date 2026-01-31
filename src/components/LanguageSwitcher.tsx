'use client';

import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const langCode = e.target.value;
        i18n.changeLanguage(langCode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('i18nextLng', langCode);
            document.documentElement.lang = langCode;
        }
    };

    const currentCode = SUPPORTED_LANGUAGES.find(
        (lang) => i18n.language?.startsWith(lang.code)
    )?.code || 'en';

    return (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                <Globe className="w-4 h-4" />
            </div>
            <select
                value={currentCode}
                onChange={handleLanguageChange}
                className="w-full appearance-none bg-card border border-border text-foreground rounded-xl py-2.5 pl-10 pr-8 font-medium focus:outline-none focus:ring-2 focus:ring-dairy-500 hover:bg-muted transition-colors cursor-pointer"
                aria-label="Select Language"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    );
}

export function LanguageSwitcherCompact() {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const langCode = e.target.value;
        i18n.changeLanguage(langCode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('i18nextLng', langCode);
            document.documentElement.lang = langCode;
        }
    };

    const currentCode = SUPPORTED_LANGUAGES.find(
        (lang) => i18n.language?.startsWith(lang.code)
    )?.code || 'en';

    return (
        <div className="relative inline-block w-10 h-10">
            <select
                value={currentCode}
                onChange={handleLanguageChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                title="Select Language"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                    </option>
                ))}
            </select>
            <div className="flex items-center justify-center w-full h-full bg-card hover:bg-muted border border-border rounded-xl transition-colors cursor-pointer shadow-sm">
                <Globe className="w-5 h-5 text-foreground" />
            </div>
        </div>
    );
}
