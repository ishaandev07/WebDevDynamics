export interface ConsultationType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  category: string;
  featuredImage: string;
  published: boolean;
  createdAt: Date;
}

export interface Testimonial {
  id: number;
  clientName: string;
  clientRole: string;
  clientImage: string;
  testimonialText: string;
  rating: number;
}

export interface BookingFormData {
  consultationType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age?: number;
  healthGoals: string;
  consent: boolean;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
