import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckIcon, ArrowRightIcon, CalendarIcon } from "lucide-react";
import { insertClientInquirySchema } from "@shared/schema";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPlan?: string | null;
}

const consultationPlans = [
  {
    id: "basic",
    name: "Basic Consultation",
    price: "999",
    description: "60-minute session with basic meal plan",
    features: ["60-minute consultation", "Basic meal plan", "Email support (7 days)"],
  },
  {
    id: "premium",
    name: "Premium Consultation",
    price: "2499",
    description: "90-minute session with detailed plan & follow-ups",
    features: ["90-minute consultation", "Detailed meal plan", "3 follow-up sessions", "WhatsApp support"],
    isPopular: true,
  },
  {
    id: "vip",
    name: "VIP Package",
    price: "4999",
    description: "Complete lifestyle transformation with 6 months support",
    features: ["Multiple consultations", "Custom meal planning", "6 months support", "24/7 support access"],
  },
];

const bookingFormSchema = insertClientInquirySchema.extend({
  selectedPlan: z.string().min(1, "Please select a consultation plan"),
  consultationType: z.string().min(1, "Please select a consultation type"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookingModal({ isOpen, onClose, preSelectedPlan }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>(preSelectedPlan || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consultationType: "general",
      healthGoals: "",
      selectedPlan: preSelectedPlan || "",
      paymentMethod: "online",
      status: "pending",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: (response) => {
      const booking = response.json();
      toast({
        title: "Booking submitted successfully!",
        description: "Redirecting to Calendly for appointment scheduling...",
      });
      
      // Reset form and modal
      form.reset();
      setCurrentStep(1);
      setSelectedPlan("");
      onClose();
      
      // Redirect to Calendly with booking info
      const calendlyUrl = process.env.VITE_CALENDLY_URL || "https://calendly.com/your-username/consultation";
      const bookingInfo = `?name=${encodeURIComponent(form.getValues("firstName") + " " + form.getValues("lastName"))}&email=${encodeURIComponent(form.getValues("email"))}&a1=${encodeURIComponent(selectedPlan)}`;
      
      // In production, this would redirect to the actual Calendly URL
      window.open(calendlyUrl + bookingInfo, "_blank");
      
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error submitting booking",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Booking error:", error);
    },
  });

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    form.setValue("selectedPlan", planId);
  };

  const proceedToBooking = () => {
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "Choose a consultation plan to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const onSubmit = (data: BookingFormData) => {
    bookingMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setCurrentStep(1);
    setSelectedPlan("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Book Your Consultation</DialogTitle>
        </DialogHeader>

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Step 1: Choose Your Consultation Plan</h3>
            
            <div className="grid gap-4">
              {consultationPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    selectedPlan === plan.id 
                      ? "border-primary bg-primary/5" 
                      : "border-neutral-200 hover:border-primary"
                  } ${plan.isPopular ? "ring-2 ring-primary/20" : ""}`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{plan.name}</h4>
                          {plan.isPopular && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-600 text-sm mb-4">{plan.description}</p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-neutral-600">
                              <CheckIcon className="h-4 w-4 text-primary mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">₹{plan.price}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={proceedToBooking}
                disabled={!selectedPlan}
                className="flex items-center"
              >
                Proceed to Booking <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Step 2: Your Details</h3>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email address" {...field} />
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
                          <Input type="tel" placeholder="Enter your phone number" {...field} />
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
                          rows={4} 
                          placeholder="Tell us about your health goals, dietary restrictions, medical conditions, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment Gateway Placeholder */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Payment Method</h4>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                      <CalendarIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-500 mb-2">
                        <strong>Payment Gateway Integration</strong>
                      </p>
                      <p className="text-sm text-neutral-400">
                        Razorpay, Stripe, or PayU integration will be added here
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? "Processing..." : "Book Appointment on Calendly"}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
