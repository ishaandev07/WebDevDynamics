import { Button } from "@/components/ui/button";
import { useState } from "react";
import BookingModal from "./booking-modal";

export default function HeroSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="bg-gradient-to-br from-neutral-50 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral-800 leading-tight">
                Transform Your Health with 
                <span className="text-primary"> Expert Nutrition</span> Guidance
              </h1>
              <p className="text-xl text-neutral-600 mt-6 leading-relaxed">
                Get personalized nutrition plans and expert guidance from certified dietician Ishita Singh. 
                Start your journey to better health today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-green-600"
                  onClick={() => setIsBookingModalOpen(true)}
                >
                  Book Free Consultation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={scrollToServices}
                >
                  View Services
                </Button>
              </div>
              <div className="flex items-center mt-8 space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-neutral-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5+</div>
                  <div className="text-neutral-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-neutral-600">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="lg:text-right">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional dietician consultation with healthy food" 
                className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto lg:mx-0"
              />
            </div>
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </>
  );
}
