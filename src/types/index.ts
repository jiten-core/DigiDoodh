// DigiDhoodh Type Definitions
// Comprehensive types for the entire application

// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole =
    | 'PLATFORM_SUPER_ADMIN'
    | 'INTERNAL_SUPER_ADMIN'
    | 'DAIRY_OWNER'
    | 'STAFF'
    | 'FARMER'
    | 'BUYER'

export interface User {
    id: string
    email: string
    phone?: string
    name: string
    role: UserRole
    avatar?: string
    language: string
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
}

export interface UserProfile extends User {
    dairy?: Dairy
    farmer?: Farmer
    staff?: Staff
    buyer?: Buyer
}

// ============================================
// DAIRY TYPES
// ============================================

export type DairyStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED'

export interface Dairy {
    id: string
    name: string
    email: string
    phone: string
    address?: string
    village?: string
    district?: string
    state?: string
    pincode?: string
    gstNumber?: string
    panNumber?: string
    logo?: string
    status: DairyStatus
    planExpiresAt?: string
    whatsappCredits: number
    isKycVerified: boolean
    userId: string
    subscriptionId?: string
    createdAt: string
    updatedAt: string
}

// ============================================
// FARMER TYPES
// ============================================

export interface Farmer {
    id: string
    userId: string
    dairyId: string
    farmerCode: string
    aadharNumber?: string
    bankAccount?: string
    ifsc?: string
    upiId?: string
    address?: string
    village?: string
    qrCode?: string
    walletBalance: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    user?: User
    cattle?: Cattle[]
}

// ============================================
// STAFF TYPES
// ============================================

export interface Staff {
    id: string
    userId: string
    dairyId: string
    employeeId?: string
    designation?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    user?: User
}

export interface FarmerWithUser extends Farmer {
    user: User
}

// ============================================
// BUYER TYPES
// ============================================

export type BuyerBusinessType = 'RETAIL' | 'WHOLESALE' | 'RESTAURANT' | 'HOTEL' | 'INDIVIDUAL'
export type InvoiceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export interface Buyer {
    id: string
    userId: string
    dairyId: string
    buyerCode: string
    businessName?: string
    businessType: BuyerBusinessType
    gstNumber?: string
    licenseNumber?: string
    address?: string
    creditLimit: number
    outstandingBalance: number
    qrCode?: string
    invoiceFrequency: InvoiceFrequency
    paymentTerms: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    user?: User
}

// ============================================
// CATTLE TYPES
// ============================================

export type CattleType = 'COW' | 'BUFFALO' | 'GOAT' | 'MIXED'

export interface Cattle {
    id: string
    farmerId: string
    tagNumber: string
    type: CattleType
    breed?: string
    birthDate?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// ============================================
// MILK COLLECTION TYPES
// ============================================

export type MilkShift = 'MORNING' | 'EVENING'
export type MilkQuality = 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR'

export interface MilkCollection {
    id: string
    dairyId: string
    farmerId: string
    cattleId?: string
    staffId?: string
    collectionDate: string
    shift: MilkShift
    liters: number
    fat?: number
    snf?: number
    clr?: number
    temperature?: number
    ratePerLiter: number
    totalAmount: number
    quality: MilkQuality
    isSynced: boolean
    isPaid: boolean
    notes?: string
    createdAt: string
    updatedAt: string
    farmer?: FarmerWithUser
}

export interface MilkCollectionInput {
    farmerId: string
    cattleId?: string
    shift: MilkShift
    liters: number
    fat?: number
    snf?: number
    clr?: number
    temperature?: number
    notes?: string
}

export interface MilkCollectionSummary {
    totalLiters: number
    totalAmount: number
    avgFat: number
    avgSnf: number
    entries: number
    morningLiters: number
    eveningLiters: number
}

// ============================================
// RATE CHART TYPES
// ============================================

export interface RateChart {
    id: string
    dairyId: string
    name: string
    cattleType: CattleType
    isActive: boolean
    effectiveFrom: string
    effectiveTo?: string
    createdAt: string
    updatedAt: string
    entries?: RateChartEntry[]
}

export interface RateChartEntry {
    id: string
    rateChartId: string
    fatMin: number
    fatMax: number
    snfMin?: number
    snfMax?: number
    ratePerLiter: number
    createdAt: string
}

// ============================================
// BILLING TYPES
// ============================================

export type BillingPeriod = 'TEN_DAY' | 'MONTHLY' | 'WEEKLY' | 'CUSTOM'
export type BillStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED'
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'

export interface Bill {
    id: string
    dairyId: string
    farmerId: string
    billNumber: string
    billingPeriod: BillingPeriod
    startDate: string
    endDate: string
    totalLiters: number
    totalAmount: number
    advanceAmount: number
    loanDeduction: number
    otherDeductions: number
    taxAmount: number
    netAmount: number
    status: BillStatus
    pdfUrl?: string
    whatsappSent: boolean
    paidAt?: string
    paymentMethod?: PaymentMethod
    createdAt: string
    updatedAt: string
    farmer?: FarmerWithUser
}

export interface BillInput {
    farmerId: string
    billingPeriod: BillingPeriod
    startDate: string
    endDate: string
    otherDeductions?: number
}

// ============================================
// LOAN & ADVANCE TYPES
// ============================================

export type LoanStatus = 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED'
export type AdvanceStatus = 'PENDING' | 'REPAID' | 'CANCELLED'

export interface Loan {
    id: string
    farmerId: string
    amount: number
    interestRate: number
    emiAmount: number
    totalEmis: number
    paidEmis: number
    status: LoanStatus
    startDate: string
    nextDueDate: string
    createdAt: string
    updatedAt: string
    repayments?: LoanRepayment[]
}

export interface LoanRepayment {
    id: string
    loanId: string
    amount: number
    date: string
    method: PaymentMethod
    createdAt: string
}

export interface Advance {
    id: string
    farmerId: string
    amount: number
    reason?: string
    status: AdvanceStatus
    givenAt: string
    repaidAt?: string
    createdAt: string
    updatedAt: string
}

// ============================================
// PRODUCT & INVENTORY TYPES
// ============================================

export type ProductCategory = 'MILK' | 'GHEE' | 'BUTTER' | 'CHEESE' | 'YOGURT' | 'CATTLE_FEED' | 'MEDICINE' | 'EQUIPMENT' | 'OTHER'
export type TransactionType = 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'LOSS' | 'RETURN'
export type SaleStatus = 'PENDING' | 'PAID' | 'CANCELLED'

export interface Product {
    id: string
    dairyId: string
    name: string
    description?: string
    category: ProductCategory
    unit: string
    price: number
    minStock?: number
    maxStock?: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface Inventory {
    id: string
    dairyId: string
    productId: string
    currentStock: number
    minStock?: number
    lastUpdated: string
    product?: Product
}

export interface InventoryTransaction {
    id: string
    inventoryId: string
    type: TransactionType
    quantity: number
    unitPrice?: number
    totalValue?: number
    reason?: string
    createdAt: string
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionPlan = 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS'
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL'

export interface Subscription {
    id: string
    plan: SubscriptionPlan
    status: SubscriptionStatus
    startDate: string
    endDate: string
    amount: number
    currency: string
    paymentId?: string
    razorpayOrderId?: string
    razorpayPaymentId?: string
    autoRenew: boolean
    createdAt: string
    updatedAt: string
}

export interface PlanDetails {
    id: SubscriptionPlan
    name: string
    price: number
    yearlyPrice: number
    maxFarmers: number
    maxBuyers: number
    maxStaff: number
    features: string[]
    popular?: boolean
}

// ============================================
// REFERRAL TYPES
// ============================================

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'REWARDED' | 'CANCELLED'

export interface Referral {
    id: string
    referrerDairyId: string
    referredDairyId: string
    referralCode: string
    status: ReferralStatus
    rewardDays: number
    referredRewardDays: number
    rewardedAt?: string
    createdAt: string
    updatedAt: string
}

export interface ReferralStats {
    totalReferrals: number
    completedReferrals: number
    pendingReferrals: number
    totalRewardDays: number
    currentReferralCode: string
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'BILL_GENERATED' | 'PAYMENT_RECEIVED' | 'PAYMENT_REMINDER' | 'LOW_STOCK' | 'RATE_CHANGE' | 'SYSTEM_ALERT'

export interface Notification {
    id: string
    dairyId: string
    title: string
    message: string
    type: NotificationType
    recipient?: string
    isRead: boolean
    sentVia?: string
    createdAt: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T = any> {
    success: boolean
    data: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

// ============================================
// FORM & INPUT TYPES
// ============================================

export interface LoginInput {
    email?: string
    phone?: string
    password?: string
    otp?: string
}

export interface SignupInput {
    name: string
    email: string
    phone: string
    password: string
    dairyName: string
    referralCode?: string
}

export interface FarmerInput {
    name: string
    phone: string
    email?: string
    aadharNumber?: string
    bankAccount?: string
    ifsc?: string
    upiId?: string
    address?: string
    village?: string
}

export interface BuyerInput {
    name: string
    phone: string
    email?: string
    businessName?: string
    businessType: BuyerBusinessType
    gstNumber?: string
    licenseNumber?: string
    address?: string
    creditLimit?: number
    invoiceFrequency?: InvoiceFrequency
    paymentTerms?: string
}

// ============================================
// UTILITY TYPES
// ============================================

export type DateRange = {
    from: Date | string
    to: Date | string
}

export type SortOrder = 'asc' | 'desc'

export interface FilterOptions {
    search?: string
    status?: string
    dateRange?: DateRange
    shift?: MilkShift
    sort?: string
    order?: SortOrder
    page?: number
    limit?: number
}
