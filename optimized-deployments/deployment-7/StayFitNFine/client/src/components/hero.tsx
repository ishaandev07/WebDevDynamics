import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Award } from "lucide-react";

export default function Hero() {
  const stats = [
    { icon: <Users className="w-5 h-5" />, value: "500+", label: "Happy Clients" },
    { icon: <Award className="w-5 h-5" />, value: "5+", label: "Years Experience" },
    { icon: <Calendar className="w-5 h-5" />, value: "98%", label: "Success Rate" },
  ];

  return (
    <section className="pt-16 hero-section">
      <div className="max-w-7xl mx-auto container-padding section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral-800 leading-tight">
                Transform Your Health with{" "}
                <span className="text-gradient">Expert Nutrition</span>{" "}
                Guidance
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Get personalized nutrition plans and expert guidance from certified dietician 
                Ishita Singh. Start your journey to better health today with evidence-based 
                nutrition strategies tailored just for you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="btn-primary text-lg px-8 py-4"
                data-event="click:openBookingModal"
              >
                Book Free Consultation
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="btn-secondary text-lg px-8 py-4"
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
              >
                View Services
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-neutral-600 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:text-right relative">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Professional dietician consultation with healthy food" 
              className="rounded-2xl shadow-healthcare w-full max-w-lg mx-auto lg:mx-0" 
            />
            
            {/* Floating testimonial card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden lg:block">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
                  alt="Client testimonial"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-semibold text-neutral-800 text-sm">Priya S.</div>
                  <div className="text-xs text-neutral-500">Verified Client</div>
                </div>
              </div>
              <p className="text-sm text-neutral-600 italic">
                "Lost 15kg in 6 months. Best decision ever!"
              </p>
              <div className="flex text-amber-400 mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xs">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
