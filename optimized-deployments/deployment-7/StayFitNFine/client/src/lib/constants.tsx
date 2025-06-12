import { Utensils, Heart, Dumbbell, User } from "lucide-react";

export const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic Consultation",
    description: "Initial assessment and basic nutrition guidance for healthy lifestyle.",
    price: 999,
    duration: "One-time session",
    popular: false,
    features: [
      "60-minute consultation",
      "Basic meal plan",
      "Email support (7 days)",
      "Dietary assessment",
      "General nutrition advice"
    ]
  },
  {
    id: "premium",
    name: "Premium Consultation", 
    description: "Comprehensive nutrition plan with ongoing support and monitoring.",
    price: 2499,
    duration: "3-month program",
    popular: true,
    features: [
      "90-minute consultation",
      "Detailed meal plan",
      "3 follow-up sessions",
      "WhatsApp support",
      "Progress tracking",
      "Recipe suggestions"
    ]
  },
  {
    id: "vip",
    name: "VIP Package",
    description: "Complete lifestyle transformation with personalized coaching.",
    price: 4999,
    duration: "6-month program", 
    popular: false,
    features: [
      "Multiple consultations",
      "Custom meal planning",
      "6 months support",
      "24/7 support access",
      "Grocery shopping guide",
      "Lifestyle coaching"
    ]
  }
];

export const CONSULTATION_TYPES = [
  {
    id: "weight-management",
    name: "Weight Management",
    description: "Personalized meal plans for healthy weight loss or gain",
    icon: <Utensils className="w-6 h-6" />
  },
  {
    id: "clinical-nutrition",
    name: "Clinical Nutrition", 
    description: "Specialized dietary therapy for medical conditions",
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: "sports-nutrition",
    name: "Sports Nutrition",
    description: "Performance-optimized nutrition for athletes",
    icon: <Dumbbell className="w-6 h-6" />
  },
  {
    id: "general-consultation",
    name: "General Consultation",
    description: "Comprehensive nutritional assessment and guidance", 
    icon: <User className="w-6 h-6" />
  }
];
