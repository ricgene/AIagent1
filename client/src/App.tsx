import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import BusinessProfile from "@/pages/business/profile";
import Messages from "@/pages/messages";
import Search from "@/pages/search";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={Home} />
        <Route path="/business/profile" component={BusinessProfile} />
        <Route path="/messages" component={Messages} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;