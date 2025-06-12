export const SITE_CONFIG = {
  name: "StayFitNFine",
  description: "Professional nutrition consulting with Ishita Singh",
  url: "https://stayfitnfine.com",
  ogImage: "/og-image.png",
  
  // Contact Information
  contact: {
    phone: "+91 98765 43210",
    email: "ishita@stayfitnfine.com",
    address: "Mumbai, Maharashtra, India",
    whatsapp: "+91 98765 43210",
  },
  
  // Business Hours
  businessHours: {
    weekdays: "9:00 AM - 7:00 PM",
    saturday: "9:00 AM - 5:00 PM",
    sunday: "Closed",
  },
  
  // Social Media Links
  social: {
    facebook: "https://facebook.com/stayfitnfine",
    instagram: "https://instagram.com/stayfitnfine",
    linkedin: "https://linkedin.com/company/stayfitnfine",
    youtube: "https://youtube.com/@stayfitnfine",
  },
  
  // Calendly Configuration
  calendly: {
    baseUrl: process.env.CALENDLY_URL || "https://calendly.com/ishita-singh/consultation",
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.VITE_GA_TRACKING_ID,
  },
};

export const CONSULTATION_TYPES = [
  {
    id: "general",
    name: "General Consultation",
    description: "Overall health and wellness guidance",
    icon: "user-md",
  },
  {
    id: "weight-management",
    name: "Weight Management",
    description: "Personalized weight loss or gain programs",
    icon: "utensils",
  },
  {
    id: "diabetes",
    name: "Diabetes Care",
    description: "Blood sugar management through diet",
    icon: "heartbeat",
  },
  {
    id: "sports",
    name: "Sports Nutrition",
    description: "Performance optimization for athletes",
    icon: "dumbbell",
  },
  {
    id: "clinical",
    name: "Clinical Nutrition",
    description: "Medical condition-specific dietary therapy",
    icon: "stethoscope",
  },
  {
    id: "maternal",
    name: "Maternal Nutrition",
    description: "Nutrition support during pregnancy and lactation",
    icon: "baby",
  },
  {
    id: "plant-based",
    name: "Plant-Based Nutrition",
    description: "Vegetarian and vegan dietary guidance",
    icon: "seedling",
  },
  {
    id: "corporate",
    name: "Corporate Wellness",
    description: "Workplace nutrition programs",
    icon: "users",
  },
];

export const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic Consultation",
    price: 1500,
    currency: "₹",
    period: "One-time session",
    description: "Initial assessment and basic nutrition guidance",
    features: [
      "60-minute consultation",
      "Dietary assessment",
      "Basic meal plan",
      "Email support (7 days)",
    ],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium Package",
    price: 4500,
    currency: "₹",
    period: "3-month program",
    description: "Comprehensive nutrition plan with ongoing support",
    features: [
      "4 detailed consultations",
      "Personalized meal plans",
      "Weekly progress tracking",
      "24/7 WhatsApp support",
      "Recipe suggestions",
    ],
    popular: true,
  },
  {
    id: "vip",
    name: "VIP Program",
    price: 8000,
    currency: "₹",
    period: "6-month program",
    description: "Complete lifestyle transformation with personalized coaching",
    features: [
      "8 comprehensive sessions",
      "Complete lifestyle makeover",
      "Bi-weekly check-ins",
      "Priority support",
      "Grocery shopping guide",
    ],
    popular: false,
  },
];

export const PAYMENT_GATEWAYS = {
  razorpay: {
    name: "Razorpay",
    keyId: process.env.VITE_RAZORPAY_KEY_ID,
    enabled: !!process.env.VITE_RAZORPAY_KEY_ID,
  },
  stripe: {
    name: "Stripe",
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    enabled: !!process.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  payu: {
    name: "PayU",
    merchantKey: process.env.VITE_PAYU_MERCHANT_KEY,
    enabled: !!process.env.VITE_PAYU_MERCHANT_KEY,
  },
};
