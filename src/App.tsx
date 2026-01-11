import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InductorPage from "./pages/Inductor";
import CapacitorPage from "./pages/Capacitor";
import NotFound from "./pages/NotFound";
import Diode from "./pages/Diode";
import ResistorPage from "./pages/Resistor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resistor" element={<ResistorPage />} />
          <Route path="/inductor" element={<InductorPage />} />
          <Route path="/capacitor" element={<CapacitorPage />} />
          <Route path="/diode" element={<Diode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
