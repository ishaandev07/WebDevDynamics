import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import BookingModal from "./booking-modal";
import type { ConsultationType } from "@shared/schema";

export default function ServicesSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: consultationTypes, isLoading } = useQuery<ConsultationType[]>({
    queryKey: ["/api/consultation-types"],
  });

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading services...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">Our Consultation Services</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of nutrition consultation services tailored to your specific needs and goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultationTypes?.map((service) => (
              <Card key={service.id} className={`relative ${service.isPopular ? 'border-primary border-2' : ''}`}>
                {service.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <CheckIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{service.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">₹{service.price}</div>
                  <p className="text-neutral-600">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-primary mr-3" />
                        <span className="text-neutral-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={service.isPopular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(service.name)}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!consultationTypes || consultationTypes.length === 0) && (
            <div className="text-center py-12">
              <p className="text-neutral-600">Services will be available soon.</p>
            </div>
          )}
        </div>
      </section>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)}
        preSelectedPlan={selectedPlan}
      />
    </>
  );
}
