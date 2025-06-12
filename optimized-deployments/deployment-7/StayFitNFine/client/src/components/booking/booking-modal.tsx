import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingModal } from '@/hooks/use-booking';
import { CONSULTATION_TYPES, CONSULTATION_PRICES } from '@/lib/constants';
import { CheckCircle, Clock, Mail, Phone, CreditCard, Calendar } from 'lucide-react';

const bookingFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  healthGoals: z.string().optional(),
  paymentMethod: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

const consultationPlans = [
  {
    id: CONSULTATION_TYPES.BASIC,
    name: 'Basic Consultation',
    price: CONSULTATION_PRICES.basic,
    duration: '60 minutes',
    features: [
      '60-minute consultation',
      'Basic meal plan',
      'Email support (7 days)',
      'Dietary assessment',
    ],
    description: 'Perfect for getting started with professional nutrition guidance',
  },
  {
    id: CONSULTATION_TYPES.PREMIUM,
    name: 'Premium Consultation',
    price: CONSULTATION_PRICES.premium,
    duration: '90 minutes',
    features: [
      '90-minute consultation',
      'Detailed meal plan',
      '3 follow-up sessions',
      'WhatsApp support',
      'Progress tracking',
    ],
    description: 'Comprehensive support for lasting lifestyle changes',
    popular: true,
  },
  {
    id: CONSULTATION_TYPES.VIP,
    name: 'VIP Package',
    price: CONSULTATION_PRICES.vip,
    duration: '6 months',
    features: [
      'Multiple consultations',
      'Custom meal planning',
      '6 months support',
      '24/7 support access',
      'Recipe suggestions',
      'Grocery shopping guide',
    ],
    description: 'Complete lifestyle transformation with ongoing support',
  },
];

export function BookingModal() {
  const {
    isOpen,
    selectedPlan,
    currentStep,
    isSubmitting,
    closeModal,
    selectPlan,
    goToStep,
    submitBooking,
  } = useBookingModal();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      healthGoals: '',
      paymentMethod: 'online',
      terms: false,
    },
  });

  const onSubmit = (data: BookingFormData) => {
    submitBooking({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || undefined,
      consultationType: selectedPlan!,
      healthGoals: data.healthGoals || undefined,
      paymentMethod: data.paymentMethod || undefined,
    });
  };

  const selectedPlanData = consultationPlans.find(plan => plan.id === selectedPlan);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Your Consultation</DialogTitle>
        </DialogHeader>

        {/* Step 1: Plan Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Your Consultation Type</h3>
              <p className="text-muted-foreground">Select the plan that best fits your health goals</p>
            </div>

            <div className="grid gap-4">
              {consultationPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPlan === plan.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => selectPlan(plan.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xl font-semibold">{plan.name}</h4>
                          {plan.popular && (
                            <Badge className="bg-primary text-white">Most Popular</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {plan.duration}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">₹{plan.price}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => goToStep(2)}
                disabled={!selectedPlan}
                className="btn-primary"
              >
                Continue to Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 2 && selectedPlanData && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Details</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Selected plan:</span>
                <Badge variant="outline">{selectedPlanData.name} - ₹{selectedPlanData.price}</Badge>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="your@email.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="+91 XXXXX XXXXX" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="healthGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Health Goals & Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your health goals, dietary restrictions, medical conditions, etc."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="online" id="online" />
                              <label htmlFor="online" className="text-sm cursor-pointer">
                                Online Payment (UPI, Cards, Net Banking)
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="consultation" id="consultation" />
                              <label htmlFor="consultation" className="text-sm cursor-pointer">
                                Pay during consultation
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Payment Gateway Placeholder */}
                  <div className="p-4 border-2 border-dashed border-muted rounded-lg bg-muted/10">
                    <div className="text-center space-y-2">
                      <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Payment Gateway Integration
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Razorpay, Stripe, or PayU integration will be added here
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the{' '}
                          <a href="#" className="text-primary hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => goToStep(1)}
                    className="flex-1"
                  >
                    Back to Plans
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 btn-primary"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Proceed to Calendly
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
