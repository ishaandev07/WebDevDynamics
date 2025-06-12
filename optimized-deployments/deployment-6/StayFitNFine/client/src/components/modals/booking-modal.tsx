import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertConsultationBookingSchema } from "@shared/schema";
import { ArrowLeft, Check, User, Star, Crown, ExternalLink } from "lucide-react";

const formSchema = insertConsultationBookingSchema.extend({
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});

type FormData = z.infer<typeof formSchema>;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string | null;
}

export default function BookingModal({ isOpen, onClose, initialPlan }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consultationType: "general",
      plan: selectedPlan,
      healthGoals: "",
      paymentMethod: "online",
      terms: false,
    },
  });

  const plans = [
    {
      id: "basic",
      name: "Basic Consultation",
      price: "₹999",
      period: "One-time session",
      icon: User,
      features: ["60-minute consultation", "Basic meal plan", "Email support"],
      color: "neutral"
    },
    {
      id: "premium",
      name: "Premium Consultation",
      price: "₹2499",
      period: "3 month program",
      icon: Star,
      features: ["90-minute consultation", "Detailed meal plan", "3 follow-ups", "WhatsApp support"],
      color: "primary",
      popular: true
    },
    {
      id: "vip",
      name: "VIP Package", 
      price: "₹4999",
      period: "6 month program",
      icon: Crown,
      features: ["Multiple consultations", "Custom meal planning", "6 months support", "24/7 access"],
      color: "accent"
    }
  ];

  const consultationTypes = [
    { id: "general", name: "General Consultation", description: "Overall health and wellness guidance" },
    { id: "weight-management", name: "Weight Management", description: "Weight loss or gain programs" },
    { id: "diabetes", name: "Diabetes Care", description: "Blood sugar management through diet" },
    { id: "sports", name: "Sports Nutrition", description: "Performance optimization for athletes" },
    { id: "clinical", name: "Clinical Nutrition", description: "Medical condition-specific diets" }
  ];

  const createBookingMutation = useMutation({
    mutationFn: async (data: Omit<FormData, 'terms'>) => {
      const response = await apiRequest("POST", "/api/consultation-bookings", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Successful!",
        description: "Redirecting to Calendly for appointment scheduling...",
      });
      
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ["/api/consultation-bookings"] });
      
      // Redirect to Calendly
      if (data.booking?.calendlyUrl) {
        window.open(data.booking.calendlyUrl, '_blank');
      }
      
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setSelectedPlan("");
    form.reset();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    form.setValue("plan", planId);
  };

  const handleNext = () => {
    if (step === 1 && selectedPlan) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    const { terms, ...bookingData } = data;
    createBookingMutation.mutate(bookingData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Your Consultation</DialogTitle>
        </DialogHeader>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Step 1: Choose Your Plan</h3>
              <p className="text-neutral-600">Select the consultation plan that best fits your needs</p>
            </div>

            <div className="grid gap-4">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-neutral-200 hover:border-primary/50'
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            plan.color === 'primary' ? 'bg-primary/10' :
                            plan.color === 'accent' ? 'bg-accent/10' : 'bg-neutral-100'
                          }`}>
                            <IconComponent className={`h-6 w-6 ${
                              plan.color === 'primary' ? 'text-primary' :
                              plan.color === 'accent' ? 'text-accent' : 'text-neutral-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">{plan.name}</h4>
                              {plan.popular && <Badge>Popular</Badge>}
                            </div>
                            <p className="text-neutral-600 text-sm">{plan.period}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {plan.features.slice(0, 2).map((feature, idx) => (
                                <span key={idx} className="text-xs text-neutral-500">• {feature}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${
                          plan.color === 'primary' ? 'text-primary' :
                          plan.color === 'accent' ? 'text-accent' : 'text-neutral-800'
                        }`}>
                          {plan.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleNext}
                disabled={!selectedPlan}
                className="bg-primary hover:bg-green-600"
              >
                Next: Consultation Type
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Consultation Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold">Step 2: Select Consultation Type</h3>
                <p className="text-neutral-600">Choose the type of consultation you need</p>
              </div>
            </div>

            <Form {...form}>
              <FormField
                control={form.control}
                name="consultationType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-3"
                      >
                        {consultationTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={type.id} id={type.id} />
                            <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                              <div className="p-3 border rounded-lg hover:bg-neutral-50">
                                <div className="font-medium">{type.name}</div>
                                <div className="text-sm text-neutral-600">{type.description}</div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} className="bg-primary hover:bg-green-600">
                Next: Your Details
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Details & Form */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold">Step 3: Your Details</h3>
                <p className="text-neutral-600">Provide your information to complete the booking</p>
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
                          <Input type="email" placeholder="Enter your email" {...field} />
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
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
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
                          className="resize-none"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online">Pay Online (UPI, Cards, Net Banking)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="consultation" id="consultation" />
                            <Label htmlFor="consultation">Pay during consultation</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Gateway Placeholder */}
                <Card className="border-dashed border-2 border-neutral-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-neutral-500">
                      <div className="text-2xl mb-2">💳</div>
                      <p className="font-medium">Payment Gateway Integration</p>
                      <p className="text-sm">Razorpay, Stripe, or PayU integration will be added here</p>
                    </div>
                  </CardContent>
                </Card>

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
                        <FormLabel>
                          I agree to the{" "}
                          <a href="#" className="text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createBookingMutation.isPending}
                    className="bg-primary hover:bg-green-600"
                  >
                    {createBookingMutation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        Book Appointment
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
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
