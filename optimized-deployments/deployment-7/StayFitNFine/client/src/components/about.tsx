import { Button } from "@/components/ui/button";
import { Award, GraduationCap, Heart, IdCard } from "lucide-react";

interface AboutProps {
  onBookingClick: () => void;
}

export default function About({ onBookingClick }: AboutProps) {
  const credentials = [
    {
      icon: <GraduationCap className="w-5 h-5" />,
      text: "M.Sc. in Clinical Nutrition"
    },
    {
      icon: <IdCard className="w-5 h-5" />,
      text: "Certified Diabetes Educator"
    },
    {
      icon: <Award className="w-5 h-5" />,
      text: "IDA Registered Dietician"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: "500+ Success Stories"
    }
  ];

  return (
    <section id="about" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
              alt="Ishita Singh - Certified Dietician and Nutrition Expert"
              className="rounded-2xl shadow-lg w-full max-w-md mx-auto"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-neutral-800 mb-6">Meet Ishita Singh</h2>
            <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
              Certified dietician with over 5 years of experience helping clients achieve their health goals through personalized nutrition strategies. Specializing in weight management, diabetes care, and lifestyle optimization.
            </p>
            
            <div className="space-y-4 mb-8">
              {credentials.map((credential, index) => (
                <div key={index} className="flex items-center">
                  <div className="text-primary mr-4">
                    {credential.icon}
                  </div>
                  <span className="text-neutral-700">{credential.text}</span>
                </div>
              ))}
            </div>
            
            <Button
              onClick={onBookingClick}
              className="bg-primary text-white px-8 py-3 hover:bg-green-600 transition-colors"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
