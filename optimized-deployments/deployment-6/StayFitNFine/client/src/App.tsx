import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import Services from "@/pages/services";
import About from "@/pages/about";
import Testimonials from "@/pages/testimonials";
import Blog from "@/pages/blog";
import Contact from "@/pages/contact";
import HealthAssessment from "@/pages/health-assessment";
import BMICalculator from "@/pages/bmi-calculator";
import CalorieCalculator from "@/pages/calorie-calculator";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, requireAdmin = false }: { component: any, requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Dashboard />;
  }
  
  return <Component />;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {children}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <PublicLayout><Home /></PublicLayout>}
      </Route>
      <Route path="/services">
        {() => <PublicLayout><Services /></PublicLayout>}
      </Route>
      <Route path="/about">
        {() => <PublicLayout><About /></PublicLayout>}
      </Route>
      <Route path="/testimonials">
        {() => <PublicLayout><Testimonials /></PublicLayout>}
      </Route>
      <Route path="/blog">
        {() => <PublicLayout><Blog /></PublicLayout>}
      </Route>
      <Route path="/contact">
        {() => <PublicLayout><Contact /></PublicLayout>}
      </Route>
      <Route path="/health-assessment">
        {() => <PublicLayout><HealthAssessment /></PublicLayout>}
      </Route>
      <Route path="/bmi-calculator" component={BMICalculator} />
      <Route path="/calorie-calculator" component={CalorieCalculator} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminDashboard} requireAdmin={true} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
