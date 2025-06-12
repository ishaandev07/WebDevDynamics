import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBookingModal } from '@/hooks/use-booking';
import { CONSULTATION_TYPES, CONSULTATION_PRICES } from '@/lib/constants';
import { 
  Clock, 
  CheckCircle, 
  Star, 
  Crown, 
  UserCheck,
  Mail,
  MessageCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';

const consultationPlans = [
  {
    id: CONSULTATION_TYPES.BASIC,
    name: 'Basic Consultation',
    price: CONSULTATION_PRICES.basic,
    duration: '60 minutes',
    description: 'Perfect for getting started with professional nutrition guidance',
    features: [
      '60-minute consultation',
      'Basic meal plan',
      'Email support (7 days)',
      'Dietary assessment',
    ],
    icon: UserCheck,
    buttonVariant: 'outline' as const,
  },
  {
    id: CONSULTATION_TYPES.PREMIUM,
    name: 'Premium Consultation',
    price: CONSULTATION_PRICES.premium,
    duration: '90 minutes',
    description: 'Comprehensive support for lasting lifestyle changes',
    features: [
      '90-minute consultation',
      'Detailed meal plan',
      '3 follow-up sessions',
      'WhatsApp support',
      'Progress tracking',
    ],
    icon: Star,
    popular: true,
    buttonVariant: 'default' as const,
  },
  {
    id: CONSULTATION_TYPES.VIP,
    name: 'VIP Package',
    price: CONSULTATION_PRICES.vip,
    duration: '6 months',
    description: 'Complete lifestyle transformation with ongoing support',
    features: [
      'Multiple consultations',
      'Custom meal planning',
      '6 months support',
      '24/7 support access',
      'Recipe suggestions',
      'Grocery shopping guide',
    ],
    icon: Crown,
    buttonVariant: 'secondary' as const,
  },
];

export function ServicesSection() {
  const { openModal } = useBookingModal();

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Our Consultation Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our comprehensive range of nutrition consultation services tailored to your specific needs and goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {consultationPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-6 py-2 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <IconComponent className={`h-8 w-8 ${
                      plan.popular ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mb-2">₹{plan.price}</div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {plan.duration}
                  </div>
                  
                  <CardDescription className="mt-3">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => openModal(plan.id)}
                    variant={plan.buttonVariant}
                    className="w-full h-12 text-base font-semibold"
                  >
                    Select Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-foreground">Not sure which plan is right for you?</h3>
            <p className="text-muted-foreground">Book a free 15-minute discovery call to discuss your needs</p>
            <Button onClick={() => openModal()} variant="outline" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Book Free Discovery Call
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
