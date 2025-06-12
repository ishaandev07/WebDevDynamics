import { Button } from '@/components/ui/button';
import { useBookingModal } from '@/hooks/use-booking';
import { Calendar, ArrowRight } from 'lucide-react';

export function CTASection() {
  const { openModal } = useBookingModal();

  return (
    <section className="section-padding bg-primary text-white">
      <div className="container-max text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-green-100 leading-relaxed">
            Take the first step towards a healthier you. Book your consultation today and start your 
            personalized nutrition journey with expert guidance from Ishita Singh.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => openModal()}
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold"
            >
              <Calendar className="mr-2 h-6 w-6" />
              Book Free Consultation Now
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4 h-auto font-semibold"
              onClick={() => {
                const servicesSection = document.getElementById('services');
                if (servicesSection) {
                  servicesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View Services
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>

          <div className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-green-100">
              <div>
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div>Happy Clients Transformed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">98%</div>
                <div>Client Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">5+</div>
                <div>Years of Expert Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
