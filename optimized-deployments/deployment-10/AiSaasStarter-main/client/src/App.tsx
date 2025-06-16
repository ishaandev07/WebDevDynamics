import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/app-layout";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import CRM from "@/pages/crm";
import Quotes from "@/pages/quotes";
import Products from "@/pages/products";
import Marketplace from "@/pages/marketplace";

import DatasetUpload from "@/pages/dataset-upload";
import Settings from "@/pages/settings";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chat" component={Chat} />
      <Route path="/crm" component={CRM} />
      <Route path="/quotes" component={Quotes} />
      <Route path="/products" component={Products} />
      <Route path="/marketplace" component={Marketplace} />

      <Route path="/dataset-upload" component={DatasetUpload} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
