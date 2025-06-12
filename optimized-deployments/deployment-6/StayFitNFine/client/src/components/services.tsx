import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Star, User } from "lucide-react";
import { PRICING_PLANS } from "@/lib/constants";

interface ServicesProps {
  onPlanSelect: (plan: string) => void;
}

export default function Services({ onPlanSelect }: ServicesProps) {
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "basic":
        return <User className="w-6 h-6" />;
      case "premium":
        return <Star className="w-6 h-6" />;
      case "vip":
        return <Crown className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "text-neutral-600";
      case "premium":
        return "text-primary";
      case "vip":
        return "text-accent";
      default:
        return "text-neutral-600";
    }
  };

  const getButtonStyle = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-200";
      case "premium":
        return "bg-primary text-white hover:bg-green-600";
      case "vip":
        return "bg-accent text-white hover:bg-yellow-600";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-200";
    }
  };

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neutral-800 mb-4">Our Consultation Services</h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Choose from our comprehensive range of nutrition consultation services tailored to your specific needs and goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative hover:shadow-xl transition-all p-8 ${
                plan.popular ? "border-2 border-primary shadow-lg" : "border border-neutral-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardContent className="p-0">
                <div className={`w-16 h-16 ${plan.popular ? 'bg-primary/10' : 'bg-neutral-100'} rounded-xl flex items-center justify-center mb-6`}>
                  <div className={getPlanColor(plan.id)}>
                    {getPlanIcon(plan.id)}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-neutral-800 mb-4">{plan.name}</h3>
                <p className="text-neutral-600 mb-6">{plan.description}</p>
                <div className={`text-3xl font-bold mb-6 ${getPlanColor(plan.id)}`}>
                  ₹{plan.price.toLocaleString()}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-neutral-600">
                      <div className={`mr-3 ${getPlanColor(plan.id)}`}>✓</div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onPlanSelect(plan.id)}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${getButtonStyle(plan.id)}`}
                >
                  Select Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
