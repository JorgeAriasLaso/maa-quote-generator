import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainNav } from "@/components/main-nav";
import Home from "@/pages/home";
import Clients from "@/pages/clients";
import Quotes from "@/pages/quotes";
import QuoteDetail from "@/pages/quote-detail";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-slate-50">
      <MainNav />
      <main className="min-h-[calc(100vh-80px)]">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/clients" component={Clients} />
          <Route path="/quotes" component={Quotes} />
          <Route path="/quotes/:id" component={QuoteDetail} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
