import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCapIcon, IdCard, AwardIcon, HeartIcon } from "lucide-react";
import Footer from "@/components/footer";

export default function About() {
  return (
    <div className="pt-16">
      <div className="bg-gradient-to-br from-neutral-50 to-primary/5 py-20">
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
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
                Meet Ishita Singh
              </h1>
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
              
              <Button size="lg">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Approach Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              My Approach
            </h2>
            <p className="text-xl text-neutral-600">
              Evidence-based nutrition strategies tailored to your lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <HeartIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Personalized Care</h3>
                <p className="text-neutral-600">
                  Every nutrition plan is customized to your unique needs, preferences, and health goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <GraduationCapIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Evidence-Based</h3>
                <p className="text-neutral-600">
                  All recommendations are backed by the latest nutritional science and research.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <AwardIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Sustainable Results</h3>
                <p className="text-neutral-600">
                  Focus on long-term lifestyle changes that you can maintain for lasting health benefits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
