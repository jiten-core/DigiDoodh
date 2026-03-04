# 🥛 DigiDhoodh Ultimate

![DigiDhoodh](https://img.shields.io/badge/DigiDhoodh-v2.0.0-green)
![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange)
![License](https://img.shields.io/badge/License-Private-red)

**Complete Dairy Management SaaS for Indian Dairy Businesses**

DigiDhoodh is a comprehensive, offline-first dairy management system designed specifically for the Indian dairy industry. Built with modern technologies and optimized for rural connectivity challenges.

---

## 🌟 Features

### Core Features (TIER-0)
- ✅ **Milk Collection** - Daily milk entry with FAT/SNF/CLR tracking
- ✅ **Farmer Management** - Complete farmer profiles with QR codes
- ✅ **Rate Chart Engine** - Dynamic pricing based on quality parameters
- ✅ **10-Day Billing** - Automatic bill generation with deductions
- ✅ **WhatsApp Integration** - Send bills directly via WhatsApp

### Business Features (TIER-1)
- ✅ **Buyer Management** - B2B customer management with invoicing
- ✅ **Product Inventory** - Track feed, medicines, equipment
- ✅ **Loans & Advances** - Manage farmer loans with EMI deductions
- ✅ **Multi-Language** - 10 Indian languages supported

### Advanced Features (TIER-2)
- ✅ **QR Scanner** - Quick farmer identification
- ✅ **Bluetooth Printer** - Receipt printing via thermal printers
- ✅ **Referral System** - Dairy owner referral rewards
- ✅ **PWA Support** - Installable on mobile devices
- ✅ **Desktop App** - Electron-based Windows/Mac/Linux app
- ✅ **Offline Mode** - Full functionality without internet

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **UI Components** | Radix UI (shadcn/ui) |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma |
| **Auth** | Supabase Auth (OTP + Email) |
| **Offline** | IndexedDB + Custom Sync Engine |
| **PWA** | next-pwa |
| **Desktop** | Electron |
| **Payments** | Razorpay |
| **Messaging** | WhatsApp Business API |

---

## 📁 Project Structure

```
DigiDoodh-Ultimate/
├── prisma/
│   └── schema.prisma          # Database schema (755+ lines)
├── electron-app/
│   ├── main.js                # Electron main process
│   └── preload.js             # Preload script
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── farmers/
│   │   │   ├── milk/
│   │   │   ├── buyers/
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # 370+ lines premium CSS
│   ├── components/
│   │   ├── milk/
│   │   │   └── MilkCollection.tsx     # 581 lines
│   │   ├── buyers/
│   │   │   └── BuyerManagement.tsx    # 992 lines
│   │   ├── billing/
│   │   │   └── BillingReports.tsx     # 925 lines
│   │   ├── farmers/
│   │   ├── products/
│   │   ├── QRScanner.tsx
│   │   ├── bluetooth-printer.tsx
│   │   ├── pwa-install-prompt.tsx
│   │   └── ui/                # 48 shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── i18n/
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── gu.json
│   │   ├── mr.json
│   │   ├── pa.json            # Punjabi (NEW)
│   │   ├── bn.json
│   │   ├── ta.json
│   │   ├── te.json
│   │   ├── kn.json
│   │   └── or.json
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── offline-engine.ts  # IndexedDB + sync
│   │   └── utils.ts           # Helper functions
│   └── types/
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)

### Installation

```bash
# Clone or navigate to the project
cd DigiDoodh-Ultimate

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Running Desktop App

```bash
# Development mode
npm run electron:dev

# Build for production
npm run electron:build
```

---

## 🌐 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Complete |
| Hindi (हिंदी) | hi | ✅ Complete |
| Gujarati (ગુજરાતી) | gu | ✅ Complete |
| Marathi (मराठी) | mr | ✅ Complete |
| Punjabi (ਪੰਜਾਬੀ) | pa | ✅ Complete |
| Bengali (বাংলা) | bn | ✅ Complete |
| Tamil (தமிழ்) | ta | ✅ Complete |
| Telugu (తెలుగు) | te | ✅ Complete |
| Kannada (ಕನ್ನಡ) | kn | ✅ Complete |
| Odia (ଓଡ଼ିଆ) | or | ✅ Complete |

---

## 🏆 Why DigiDhoodh? (vs Competitors)

| Feature | DigiDhoodh | Liter | Hamari Dairy | DairyKhata |
|---------|------------|-------|--------------|------------|
| **Feature Parity** | 98% | 100% | 70% | 90% |
| **UI/UX Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Languages** | **10** | 8 | 10+ | 8 |
| **PWA (No App Store)** | ✅ | ❌ | ❌ | ❌ |
| **Farmer Self-Login** | ✅ | ❌ | ❌ | ❌ |
| **Billing Cycles** | **6** | 6 | 3 | 3 |
| **RLS Security** | ✅ | ❌ | ❌ | ❌ |
| **Audit Logging** | ✅ | ❌ | ❌ | ❌ |
| **Offline Mode** | ✅ | ✅ | ✅ | ❌ |
| **Bulk Upload** | ✅ | ✅ | ❌ | ❌ |
| **Temperature Track** | ✅ | ✅ | ❌ | ❌ |

### Our Advantages
1. 🎨 **Bharat-First Design** - Saffron + Green (not generic blue)
2. 📱 **PWA** - Install without app store
3. 🔐 **Enterprise Security** - Row Level Security + Audit Logs
4. 💰 **6x Better Value** - 300 farmers vs 50 (Hamari Silver)
5. 🌐 **10 Languages** - Most in market

## 💳 Subscription Plans

| Plan | Price | Farmers | Features |
|------|-------|---------|----------|
| **Basic** | ₹199/month | 300 | Core features |
| **Premium** | ₹299/month | 600 | + Reports, Buyers |
| **Premium+** | ₹599/month | Unlimited | + Desktop, Priority support |

---

## 📱 User Roles

| Role | Access Level |
|------|--------------|
| `PLATFORM_SUPER_ADMIN` | God mode - full platform access |
| `INTERNAL_SUPER_ADMIN` | Support & audit access |
| `DAIRY_OWNER` | Full dairy management |
| `STAFF` | Limited operations access |
| `FARMER` | View-only mobile app |
| `BUYER` | Purchase & invoice access |

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) via Supabase
- ✅ OTP-based phone authentication
- ✅ HTTPS enforced
- ✅ XSS protection headers
- ✅ CSRF protection
- ✅ Rate limiting on APIs
- ✅ Audit logging

---

## 📊 Database Schema

32 models including:
- User, Dairy, SuperAdmin
- Farmer, Staff, Buyer
- MilkCollection, RateChart
- Bill, Loan, Advance
- Product, Inventory
- Notification, Subscription
- Referral, AuditLog

---

## 🤝 Contributing

This is a private project. For any inquiries, contact the development team.

---

## 📄 License

Private - All rights reserved.

---

## 🆘 Support

- Email: support@digidhoodh.com
- WhatsApp: +91-XXXXXXXXXX
- Documentation: https://docs.digidhoodh.com

---

**Made with ❤️ in India 🇮🇳**
