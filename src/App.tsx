import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import { EventProvider } from './contexts/EventContext';
import Report from "@/pages/Report";
import AdminSettings from './pages/AdminSettings';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <EventProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<Report />} />
              <Route path="/admin" element={<AdminSettings />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </EventProvider>
  </AuthProvider>
);

export default App;