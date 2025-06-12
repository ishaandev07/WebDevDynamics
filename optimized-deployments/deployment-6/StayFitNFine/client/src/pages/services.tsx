import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import Footer from "@/components/footer";
import type { ConsultationType } from "@shared/schema";

export default function Services() {
  const { data: consultationTypes, isLoading } = useQuery<ConsultationType[]>({
    queryKey: ["/api/consultation-types"],
  });

  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-neutral-50 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
              Our Consultation Services
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of nutrition consultation services 
              tailored to your specific needs and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultationTypes?.map((service) => (
              <Card key={service.id} className={`relative ${service.isPopular ? 'border-primary border-2' : ''}`}>
                {service.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
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
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
