import { Button } from '@/components/ui/button';
import { useBookingModal } from '@/hooks/use-booking';
import { STATS } from '@/lib/constants';
import { ArrowRight, Users, Award, TrendingUp } from 'lucide-react';

export function HeroSection() {
  const { openModal } = useBookingModal();

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-muted/50 to-primary/10 section-padding">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Transform Your Health with{' '}
                <span className="text-primary">Expert Nutrition</span> Guidance
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get personalized nutrition plans and expert guidance from certified dietician Ishita Singh. 
                Start your journey to better health today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => openModal()}
                size="lg"
                className="btn-primary text-lg px-8 py-4 h-auto"
              >
                Book Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={scrollToServices}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 h-auto border-primary text-primary hover:bg-primary hover:text-white"
              >
                View Services
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-primary mr-2" />
                  <div className="text-2xl font-bold text-primary">{STATS.clients}</div>
                </div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-6 w-6 text-primary mr-2" />
                  <div className="text-2xl font-bold text-primary">{STATS.experience}</div>
                </div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-primary mr-2" />
                  <div className="text-2xl font-bold text-primary">{STATS.successRate}</div>
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Professional dietician consultation with healthy food"
              className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto lg:mx-0"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="text-sm text-muted-foreground">Certified Dietician</div>
              <div className="font-semibold text-foreground">Ishita Singh, RD</div>
              <div className="flex text-yellow-500 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
