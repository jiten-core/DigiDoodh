import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './en.json';
import hiTranslations from './hi.json';
import guTranslations from './gu.json';
import mrTranslations from './mr.json';
import bnTranslations from './bn.json';
import taTranslations from './ta.json';
import teTranslations from './te.json';
import paTranslations from './pa.json';
import knTranslations from './kn.json';
import orTranslations from './or.json';

// All 10 supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  gu: { translation: guTranslations },
  mr: { translation: mrTranslations },
  bn: { translation: bnTranslations },
  ta: { translation: taTranslations },
  te: { translation: teTranslations },
  pa: { translation: paTranslations },
  kn: { translation: knTranslations },
  or: { translation: orTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;