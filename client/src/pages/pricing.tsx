import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Users, Shield } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  buttonVariant = "default",
  onSelect,
  popular = false,
  disabled = false
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
  onSelect: () => void;
  popular?: boolean;
  disabled?: boolean;
}) => (
  <Card className={`relative ${popular ? 'border-blue-500 scale-105' : ''}`}>
    {popular && (
      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500">
        <Star className="w-3 h-3 mr-1" />
        Most Popular
      </Badge>
    )}
    <CardHeader className="text-center">
      <CardTitle className="text-2xl">{title}</CardTitle>
      <div className="text-3xl font-bold">{price}</div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        variant={buttonVariant}
        onClick={onSelect}
        disabled={disabled}
      >
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: async (data: { type: string; amount: string }) => {
      return await apiRequest('POST', '/api/payments/create-intent', data);
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const upgradeToProMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/payments/subscribe', { plan: 'pro' });
    },
    onSuccess: () => {
      toast({
        title: "Subscription Updated",
        description: "Welcome to Pro! You now have unlimited deployments.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Subscription Error",
        description: "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePayAsYouGo = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    createPaymentMutation.mutate({ type: 'deployment', amount: '5.00' });
  };

  const handleProUpgrade = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    upgradeToProMutation.mutate();
  };

  const handleEscalation = () => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }
    createPaymentMutation.mutate({ type: 'escalation', amount: '100.00' });
  };

  const isCurrentlyPro = user?.subscriptionTier === 'pro';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Deploy with confidence using our AI-powered platform. From free analysis to guaranteed deployments.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <PricingTier
          title="Freemium"
          price="Free"
          description="Perfect for analysis and learning"
          features={[
            "Complete code analysis",
            "AI chatbot assistance",
            "Framework detection",
            "Deployment guidance",
            "No actual deployment"
          ]}
          buttonText={isAuthenticated ? "Current Plan" : "Get Started Free"}
          buttonVariant="outline"
          onSelect={() => !isAuthenticated && (window.location.href = '/api/login')}
          disabled={isAuthenticated}
        />

        <PricingTier
          title="Pay-as-you-deploy"
          price="$5"
          description="per successful deployment"
          features={[
            "Everything in Freemium",
            "Real deployments",
            "Production optimization",
            "1 escalation credit included",
            "Docker & nginx configs",
            "24/7 deployment status"
          ]}
          buttonText="Deploy Now"
          onSelect={handlePayAsYouGo}
          popular={true}
        />

        <PricingTier
          title="Pro"
          price="$15/mo"
          description="For serious developers"
          features={[
            "Unlimited deployments",
            "Priority AI assistance",
            "Faster human escalation",
            "Advanced monitoring",
            "Custom domain support",
            "Priority support"
          ]}
          buttonText={isCurrentlyPro ? "Current Plan" : "Upgrade to Pro"}
          onSelect={handleProUpgrade}
          disabled={isCurrentlyPro}
        />
      </div>

      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 p-8 rounded-lg max-w-4xl mx-auto">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-4">Deployment Guarantee</h2>
          <p className="text-lg mb-6">
            Need expert help? Our human deployment specialists guarantee your project gets deployed or you get a full refund.
          </p>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg inline-block">
            <div className="text-3xl font-bold text-red-600 mb-2">$100</div>
            <div className="text-sm text-muted-foreground mb-4">One-time expert escalation</div>
            <Button 
              onClick={handleEscalation}
              className="bg-red-600 hover:bg-red-700"
              disabled={createPaymentMutation.isPending}
            >
              <Users className="w-4 h-4 mr-2" />
              Get Expert Help
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Why Choose Our Platform?</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h4 className="font-semibold">AI-Powered Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Advanced code analysis with production optimization
            </p>
          </div>
          <div className="text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h4 className="font-semibold">Guaranteed Deployments</h4>
            <p className="text-sm text-muted-foreground">
              Expert escalation ensures your project gets deployed
            </p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h4 className="font-semibold">24/7 Support</h4>
            <p className="text-sm text-muted-foreground">
              Round-the-clock monitoring and assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}