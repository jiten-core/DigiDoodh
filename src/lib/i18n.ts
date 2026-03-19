// DigiDhoodh Localization System
// Multi-language support for Hindi, Gujarati, English

export type SupportedLanguage = 'en' | 'hi' | 'gu';

// Complete translations for all UI elements
export const translations = {
    // === COMMON ===
    common: {
        en: {
            welcome: 'Welcome',
            back: 'Back',
            cancel: 'Cancel',
            confirm: 'Confirm',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            view: 'View',
            search: 'Search',
            loading: 'Loading...',
            success: 'Success!',
            error: 'Error',
            retry: 'Retry',
            today: 'Today',
            yesterday: 'Yesterday',
            thisWeek: 'This Week',
            thisMonth: 'This Month',
            all: 'All',
            yes: 'Yes',
            no: 'No',
            ok: 'OK',
            close: 'Close',
            logout: 'Logout',
            settings: 'Settings',
            help: 'Help',
            support: 'Support',
        },
        hi: {
            welcome: 'स्वागत है',
            back: 'वापस',
            cancel: 'रद्द करें',
            confirm: 'पक्का करें',
            save: 'सहेजें',
            delete: 'हटाएं',
            edit: 'बदलें',
            add: 'जोड़ें',
            view: 'देखें',
            search: 'खोजें',
            loading: 'लोड हो रहा है...',
            success: 'सफल!',
            error: 'त्रुटि',
            retry: 'फिर से',
            today: 'आज',
            yesterday: 'कल',
            thisWeek: 'इस सप्ताह',
            thisMonth: 'इस महीने',
            all: 'सभी',
            yes: 'हाँ',
            no: 'नहीं',
            ok: 'ठीक है',
            close: 'बंद करें',
            logout: 'लॉग आउट',
            settings: 'सेटिंग्स',
            help: 'मदद',
            support: 'सहायता',
        },
        gu: {
            welcome: 'સ્વાગત છે',
            back: 'પાછા',
            cancel: 'રદ કરો',
            confirm: 'પક્કો કરો',
            save: 'સાચવો',
            delete: 'કાઢી નાખો',
            edit: 'બદલો',
            add: 'ઉમેરો',
            view: 'જુઓ',
            search: 'શોધો',
            loading: 'લોડ થઈ રહ્યું છે...',
            success: 'સફળ!',
            error: 'ભૂલ',
            retry: 'ફરીથી',
            today: 'આજે',
            yesterday: 'ગઈકાલે',
            thisWeek: 'આ અઠવાડિયે',
            thisMonth: 'આ મહિને',
            all: 'બધા',
            yes: 'હા',
            no: 'ના',
            ok: 'ઠીક છે',
            close: 'બંધ કરો',
            logout: 'લૉગ આઉટ',
            settings: 'સેટિંગ્સ',
            help: 'મદદ',
            support: 'સહાય',
        }
    },

    // === FARMER APP ===
    farmer: {
        en: {
            dashboard: 'Milk Passbook',
            milkGiven: 'Milk Given',
            amountEarned: 'Amount Earned',
            amountDue: 'Amount Due',
            todaysCollection: "Today's Collection",
            avgFat: 'Average FAT',
            totalLiters: 'Total Liters',
            viewHistory: 'View History',
            noEntries: 'No milk entries yet',
            noEntriesDesc: 'Your milk entries will appear here',
            quality: 'Quality',
            morning: 'Morning',
            evening: 'Evening',
            rate: 'Rate',
            amount: 'Amount',
            calculatedAsPerRate: 'Amount calculated as per dairy rate',
            advanceDeduction: 'Advance Deduction',
            productDeduction: 'Product Amount',
            finalPayable: 'Final Payable',
        },
        hi: {
            dashboard: 'दूध पासबुक',
            milkGiven: 'दूध दिया',
            amountEarned: 'कमाई',
            amountDue: 'बकाया राशि',
            todaysCollection: 'आज का संग्रह',
            avgFat: 'औसत फैट',
            totalLiters: 'कुल लीटर',
            viewHistory: 'इतिहास देखें',
            noEntries: 'अभी दूध की एंट्री नहीं',
            noEntriesDesc: 'आपकी दूध की एंट्री यहां दिखेंगी',
            quality: 'गुणवत्ता',
            morning: 'सुबह',
            evening: 'शाम',
            rate: 'दर',
            amount: 'राशि',
            calculatedAsPerRate: 'राशि डेयरी दर के अनुसार है',
            advanceDeduction: 'अग्रिम कटौती',
            productDeduction: 'उत्पाद राशि',
            finalPayable: 'देय राशि',
        },
        gu: {
            dashboard: 'દૂધ પાસબુક',
            milkGiven: 'દૂધ આપ્યું',
            amountEarned: 'કમાણી',
            amountDue: 'બાકી રકમ',
            todaysCollection: 'આજનો સંગ્રહ',
            avgFat: 'સરેરાશ ફેટ',
            totalLiters: 'કુલ લિટર',
            viewHistory: 'ઇતિહાસ જુઓ',
            noEntries: 'હજુ દૂધની એન્ટ્રી નથી',
            noEntriesDesc: 'તમારી દૂધની એન્ટ્રી અહીં દેખાશે',
            quality: 'ગુણવત્તા',
            morning: 'સવાર',
            evening: 'સાંજ',
            rate: 'દર',
            amount: 'રકમ',
            calculatedAsPerRate: 'રકમ ડેરીના દર મુજબ છે',
            advanceDeduction: 'અડવાન્સ કપાત',
            productDeduction: 'ઉત્પાદન રકમ',
            finalPayable: 'ચૂકવવાની રકમ',
        }
    },

    // === BUYER APP ===
    buyer: {
        en: {
            dashboard: 'Purchase History',
            milkTaken: 'Milk Taken',
            amountPayable: 'Amount Payable',
            amountPaid: 'Amount Paid',
            todaysPurchase: "Today's Purchase",
            avgRate: 'Average Rate',
            totalLiters: 'Total Liters',
            viewInvoices: 'View Invoices',
            noPurchases: 'No purchases yet',
            noPurchasesDesc: 'Your milk purchases will appear here',
        },
        hi: {
            dashboard: 'खरीद इतिहास',
            milkTaken: 'दूध लिया',
            amountPayable: 'देय राशि',
            amountPaid: 'भुगतान किया',
            todaysPurchase: 'आज की खरीद',
            avgRate: 'औसत दर',
            totalLiters: 'कुल लीटर',
            viewInvoices: 'बिल देखें',
            noPurchases: 'अभी खरीद नहीं',
            noPurchasesDesc: 'आपकी दूध खरीद यहां दिखेगी',
        },
        gu: {
            dashboard: 'ખરીદી ઇતિહાસ',
            milkTaken: 'દૂધ લીધું',
            amountPayable: 'ચૂકવવાની રકમ',
            amountPaid: 'ચૂકવણી થઈ',
            todaysPurchase: 'આજની ખરીદી',
            avgRate: 'સરેરાશ દર',
            totalLiters: 'કુલ લિટર',
            viewInvoices: 'બિલ જુઓ',
            noPurchases: 'હજુ ખરીદી નથી',
            noPurchasesDesc: 'તમારી દૂધ ખરીદી અહીં દેખાશે',
        }
    },

    // === DAIRY OWNER APP ===
    dairy: {
        en: {
            dashboard: 'Dairy Dashboard',
            todaysSummary: "Today's Summary",
            totalCollection: 'Total Collection',
            totalSales: 'Total Sales',
            netDifference: 'Net Difference',
            manageFarmers: 'Manage Farmers',
            manageBuyers: 'Manage Buyers',
            rateCharts: 'Rate Charts',
            billing: 'Billing',
            reports: 'Reports',
            staff: 'Staff',
            inventory: 'Inventory',
            settings: 'Settings',
            farmerRateChart: 'Farmer Rate Chart',
            customerRateChart: 'Customer Rate Chart',
            ratesApplyFuture: 'Rates apply only to future milk entries',
            pastRecordsLocked: 'Past milk records cannot be changed to avoid disputes',
            independentRates: 'Customer rates are independent from farmer rates',
        },
        hi: {
            dashboard: 'डेयरी डैशबोर्ड',
            todaysSummary: 'आज का सारांश',
            totalCollection: 'कुल संग्रह',
            totalSales: 'कुल बिक्री',
            netDifference: 'कुल अंतर',
            manageFarmers: 'किसान प्रबंधन',
            manageBuyers: 'ग्राहक प्रबंधन',
            rateCharts: 'रेट चार्ट',
            billing: 'बिलिंग',
            reports: 'रिपोर्ट',
            staff: 'स्टाफ',
            inventory: 'इन्वेंट्री',
            settings: 'सेटिंग्स',
            farmerRateChart: 'किसान रेट चार्ट',
            customerRateChart: 'ग्राहक रेट चार्ट',
            ratesApplyFuture: 'दरें केवल भविष्य की प्रविष्टियों पर लागू होती हैं',
            pastRecordsLocked: 'विवादों से बचने के लिए पुराने रिकॉर्ड बदले नहीं जा सकते',
            independentRates: 'ग्राहक दरें किसान दरों से स्वतंत्र हैं',
        },
        gu: {
            dashboard: 'ડેરી ડેશબોર્ડ',
            todaysSummary: 'આજનો સારાંશ',
            totalCollection: 'કુલ સંગ્રહ',
            totalSales: 'કુલ વેચાણ',
            netDifference: 'કુલ તફાવત',
            manageFarmers: 'ખેડૂત વ્યવસ્થાપન',
            manageBuyers: 'ગ્રાહક વ્યવસ્થાપન',
            rateCharts: 'રેટ ચાર્ટ',
            billing: 'બિલિંગ',
            reports: 'રિપોર્ટ',
            staff: 'સ્ટાફ',
            inventory: 'ઇન્વેન્ટરી',
            settings: 'સેટિંગ્સ',
            farmerRateChart: 'ખેડૂત રેટ ચાર્ટ',
            customerRateChart: 'ગ્રાહક રેટ ચાર્ટ',
            ratesApplyFuture: 'દરો ફક્ત ભવિષ્યની એન્ટ્રી પર લાગુ થાય છે',
            pastRecordsLocked: 'વિવાદો ટાળવા જૂના રેકોર્ડ બદલી શકાતા નથી',
            independentRates: 'ગ્રાહક દરો ખેડૂત દરોથી સ્વતંત્ર છે',
        }
    },

    // === VOICE INPUT ===
    voice: {
        en: {
            speakNow: 'Speak now...',
            listening: 'Listening...',
            tapToSpeak: 'Tap to speak',
            speakPrompt: 'Say: "5 liter, fat 4.5"',
            noSpeech: 'No speech detected',
            micPermission: 'Please allow microphone access',
            tryAgain: 'Something went wrong, try again',
            orType: 'or type instead',
        },
        hi: {
            speakNow: 'अब बोलें...',
            listening: 'सुन रहा हूँ...',
            tapToSpeak: 'बोलने के लिए टैप करें',
            speakPrompt: 'बोलिए: "5 लीटर, फैट 4.5"',
            noSpeech: 'कोई आवाज़ नहीं सुनाई दी',
            micPermission: 'माइक्रोफ़ोन की अनुमति दें',
            tryAgain: 'कुछ गड़बड़ हुई, फिर से बोलें',
            orType: 'या टाइप करें',
        },
        gu: {
            speakNow: 'હવે બોલો...',
            listening: 'સાંભળી રહ્યો છું...',
            tapToSpeak: 'બોલવા માટે ટેપ કરો',
            speakPrompt: 'બોલો: "5 લિટર, ફેટ 4.5"',
            noSpeech: 'કોઈ અવાજ સંભળાયો નથી',
            micPermission: 'માઇક્રોફોનની પરવાનગી આપો',
            tryAgain: 'કંઈક ખોટું થયું, ફરીથી બોલો',
            orType: 'અથવા ટાઇપ કરો',
        }
    },

    // === BILLING ===
    billing: {
        en: {
            milkStatement: 'Milk Statement',
            cycleStatement: 'Cycle Statement',
            totalMilk: 'Total Milk',
            avgQuality: 'Avg Quality',
            milkAmount: 'Milk Amount',
            deductions: 'Deductions',
            advance: 'Advance',
            products: 'Products',
            finalPayable: 'Final Payable',
            systemGenerated: 'This bill is system-generated',
            approvedRates: 'Amount calculated as per approved dairy rates',
            downloadPdf: 'Download PDF',
            shareWhatsApp: 'Share on WhatsApp',
        },
        hi: {
            milkStatement: 'दूध विवरण',
            cycleStatement: 'चक्र विवरण',
            totalMilk: 'कुल दूध',
            avgQuality: 'औसत गुणवत्ता',
            milkAmount: 'दूध राशि',
            deductions: 'कटौती',
            advance: 'अग्रिम',
            products: 'उत्पाद',
            finalPayable: 'देय राशि',
            systemGenerated: 'यह बिल सिस्टम द्वारा बनाया गया है',
            approvedRates: 'राशि स्वीकृत डेयरी दरों के अनुसार है',
            downloadPdf: 'PDF डाउनलोड करें',
            shareWhatsApp: 'WhatsApp पर भेजें',
        },
        gu: {
            milkStatement: 'દૂધ વિગત',
            cycleStatement: 'ચક્ર વિગત',
            totalMilk: 'કુલ દૂધ',
            avgQuality: 'સરેરાશ ગુણવત્તા',
            milkAmount: 'દૂધ રકમ',
            deductions: 'કપાત',
            advance: 'અડવાન્સ',
            products: 'ઉત્પાદનો',
            finalPayable: 'ચૂકવવાની રકમ',
            systemGenerated: 'આ બિલ સિસ્ટમ દ્વારા બનાવવામાં આવ્યું છે',
            approvedRates: 'રકમ મંજૂર ડેરી દરો મુજબ છે',
            downloadPdf: 'PDF ડાઉનલોડ કરો',
            shareWhatsApp: 'WhatsApp પર મોકલો',
        }
    },

    // === ONBOARDING ===
    onboarding: {
        en: {
            welcome: 'Welcome to DigiDhoodh',
            tagline: 'No more milk arguments',
            feature1: 'Works offline',
            feature2: 'Prevents disputes',
            feature3: 'Locks past data',
            setupDairy: 'Set up your dairy',
            enterDairyName: 'Enter dairy name',
            selectCycle: 'Select billing cycle',
            tenDay: '10-Day',
            monthly: 'Monthly',
            cycleNote: 'Once a cycle closes, history is locked for safety',
            addFirstFarmer: 'Add your first farmer',
            startCollecting: "You're ready to collect milk",
            letsGo: "Let's go!",
        },
        hi: {
            welcome: 'DigiDhoodh में आपका स्वागत है',
            tagline: 'दूध के झगड़े अब नहीं',
            feature1: 'ऑफलाइन काम करता है',
            feature2: 'विवाद रोकता है',
            feature3: 'पुराना डेटा लॉक करता है',
            setupDairy: 'अपनी डेयरी सेट करें',
            enterDairyName: 'डेयरी का नाम लिखें',
            selectCycle: 'बिलिंग चक्र चुनें',
            tenDay: '10-दिन',
            monthly: 'मासिक',
            cycleNote: 'चक्र बंद होने पर इतिहास सुरक्षा के लिए लॉक हो जाता है',
            addFirstFarmer: 'अपना पहला किसान जोड़ें',
            startCollecting: 'आप दूध इकट्ठा करने के लिए तैयार हैं',
            letsGo: 'चलो शुरू करें!',
        },
        gu: {
            welcome: 'DigiDhoodhમાં સ્વાગત છે',
            tagline: 'દૂધના ઝઘડા હવે નહીં',
            feature1: 'ઑફલાઇન કામ કરે છે',
            feature2: 'વિવાદ અટકાવે છે',
            feature3: 'જૂનો ડેટા લૉક કરે છે',
            setupDairy: 'તમારી ડેરી સેટ કરો',
            enterDairyName: 'ડેરીનું નામ લખો',
            selectCycle: 'બિલિંગ ચક્ર પસંદ કરો',
            tenDay: '10-દિવસ',
            monthly: 'માસિક',
            cycleNote: 'ચક્ર બંધ થાય ત્યારે ઇતિહાસ સુરક્ષા માટે લૉક થાય છે',
            addFirstFarmer: 'તમારા પ્રથમ ખેડૂતને ઉમેરો',
            startCollecting: 'તમે દૂધ એકત્રિત કરવા તૈયાર છો',
            letsGo: 'ચાલો શરૂ કરીએ!',
        }
    },

    // === UPGRADE NUDGES ===
    upgrade: {
        en: {
            growingDairies: 'Growing dairies usually choose',
            premium: 'PREMIUM',
            premiumPlus: 'PREMIUM+',
            moreFarmers: 'You\'ve added {count} farmers. Growing dairies usually move to PREMIUM for better control.',
            multipleRates: 'Different farmers need different rates. PREMIUM lets you manage this without mistakes.',
            whatsappLimit: 'You\'ve sent today\'s free WhatsApp slips. PREMIUM sends all bills automatically.',
            productRequests: 'Farmers are asking for feed & items. PREMIUM+ keeps stock & bills automatically.',
            ledgerGrowth: 'Your accounts are growing. PREMIUM+ gives long-term edit history & GST bills.',
            upgradeToPremium: 'Upgrade to PREMIUM',
            upgradeToPremiumPlus: 'Upgrade to PREMIUM+',
        },
        hi: {
            growingDairies: 'बढ़ती हुई डेयरियाँ आमतौर पर चुनती हैं',
            premium: 'प्रीमियम',
            premiumPlus: 'प्रीमियम+',
            moreFarmers: 'आपने {count} किसान जोड़े हैं। बढ़ती डेयरियाँ बेहतर नियंत्रण के लिए PREMIUM चुनती हैं।',
            multipleRates: 'अलग-अलग किसानों को अलग-अलग दर चाहिए। PREMIUM से बिना गलती प्रबंधन।',
            whatsappLimit: 'आज की मुफ्त WhatsApp स्लिप भेज दी। PREMIUM से सभी बिल अपने आप।',
            productRequests: 'किसान चारा और सामान माँग रहे हैं। PREMIUM+ से स्टॉक और बिल अपने आप।',
            ledgerGrowth: 'आपके खाते बढ़ रहे हैं। PREMIUM+ में लंबी एडिट हिस्ट्री और GST बिल।',
            upgradeToPremium: 'PREMIUM लें',
            upgradeToPremiumPlus: 'PREMIUM+ लें',
        },
        gu: {
            growingDairies: 'વધતી ડેરીઓ સામાન્ય રીતે પસંદ કરે છે',
            premium: 'પ્રીમિયમ',
            premiumPlus: 'પ્રીમિયમ+',
            moreFarmers: 'તમે {count} ખેડૂત ઉમેર્યા છે। વધતી ડેરીઓ વધુ સારા નિયંત્રણ માટે PREMIUM પસંદ કરે છે।',
            multipleRates: 'જુદા જુદા ખેડૂતોને જુદા જુદા દર જોઈએ છે। PREMIUM થી ભૂલ વગર વ્યવસ્થાપન।',
            whatsappLimit: 'આજની મફત WhatsApp સ્લિપ મોકલી દીધી। PREMIUM થી બધા બિલ આપમેળે।',
            productRequests: 'ખેડૂતો ચારો અને સામાન માંગી રહ્યા છે। PREMIUM+ થી સ્ટોક અને બિલ આપમેળે।',
            ledgerGrowth: 'તમારા ખાતાઓ વધી રહ્યા છે। PREMIUM+ માં લાંબો એડિટ ઇતિહાસ અને GST બિલ।',
            upgradeToPremium: 'PREMIUM લો',
            upgradeToPremiumPlus: 'PREMIUM+ લો',
        }
    }
};

// Helper function to get translation
export function t(
    section: keyof typeof translations,
    key: string,
    language: SupportedLanguage = 'en',
    params?: Record<string, string | number>
): string {
    const sectionData = translations[section];
    if (!sectionData) return key;

    const langData = sectionData[language];
    if (!langData) return key;

    let text = (langData as Record<string, string>)[key] || key;

    // Replace params like {count}
    if (params) {
        Object.entries(params).forEach(([paramKey, value]) => {
            text = text.replace(`{${paramKey}}`, String(value));
        });
    }

    return text;
}

// Language names for display
export const LANGUAGE_NAMES: Record<SupportedLanguage, { native: string; english: string }> = {
    en: { native: 'English', english: 'English' },
    hi: { native: 'हिंदी', english: 'Hindi' },
    gu: { native: 'ગુજરાતી', english: 'Gujarati' }
};

// RTL support (none needed for these languages, but structure for future)
export const RTL_LANGUAGES: SupportedLanguage[] = [];

// Number formatting by language
export function formatNumber(num: number, language: SupportedLanguage): string {
    const locale = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
    return new Intl.NumberFormat(locale).format(num);
}

// Currency formatting by language
export function formatCurrency(amount: number, language: SupportedLanguage): string {
    const locale = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Date formatting by language
export function formatDate(date: Date, language: SupportedLanguage, format: 'short' | 'long' = 'short'): string {
    const locale = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: format === 'long' ? 'long' : 'short',
        year: format === 'long' ? 'numeric' : undefined
    }).format(date);
}
