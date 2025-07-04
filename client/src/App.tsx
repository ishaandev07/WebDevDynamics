import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import ProjectDetails from "@/pages/project-details";
import Deployments from "@/pages/deployments";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";
import Navigation from "@/components/layout/navigation";
import Sidebar from "@/components/layout/sidebar";
import ChatSidebar from "@/components/layout/chat-sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Upload} />
      <Route path="/upload" component={Upload} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects/:id" component={ProjectDetails} />
      <Route path="/deployments" component={Deployments} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
