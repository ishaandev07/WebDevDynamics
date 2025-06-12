import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCapIcon, IdCard, AwardIcon, HeartIcon } from "lucide-react";
import { useState } from "react";
import BookingModal from "./booking-modal";

export default function AboutSection() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800" 
                alt="Ishita Singh - Certified Dietician" 
                className="rounded-2xl shadow-lg w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-neutral-800 mb-6">Meet Ishita Singh</h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Certified dietician with over 5 years of experience helping clients achieve 
                their health goals through personalized nutrition strategies. Specializing in 
                weight management, diabetes care, and lifestyle optimization.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <GraduationCapIcon className="text-primary mr-4 h-6 w-6" />
                  <span className="text-neutral-700">M.Sc. in Clinical Nutrition</span>
                </div>
                <div className="flex items-center">
                  <IdCard className="text-primary mr-4 h-6 w-6" />
                  <span className="text-neutral-700">Certified Diabetes Educator</span>
                </div>
                <div className="flex items-center">
                  <AwardIcon className="text-primary mr-4 h-6 w-6" />
                  <span className="text-neutral-700">IDA Registered Dietician</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="text-primary mr-4 h-6 w-6" />
                  <span className="text-neutral-700">500+ Success Stories</span>
                </div>
              </div>
              
              <Button onClick={() => setIsBookingModalOpen(true)}>
                Schedule Consultation
              </Button>
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
