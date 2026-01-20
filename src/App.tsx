import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InductorPage from "./pages/Inductor";
import InductorCircuit from "./pages/InductorCircuit";
import InductorControls from "./pages/InductorControls";
import CapacitorPage from "./pages/Capacitor";
import CapacitorCircuit from "./pages/CapacitorCircuit";
import CapacitorControls from "./pages/CapacitorControls";
import NotFound from "./pages/NotFound";
import Diode from "./pages/Diode";
import ResistorPage from "./pages/Resistor";
import ResistorCircuit from "./pages/ResistorCircuit";
import ResistorControls from "./pages/ResistorControls";

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
          <Route path="/resistor/circuit" element={<ResistorCircuit />} />
          <Route path="/resistor/controls" element={<ResistorControls />} />

          <Route path="/inductor" element={<InductorPage />} />
          <Route path="/inductor/circuit" element={<InductorCircuit />} />
          <Route path="/inductor/controls" element={<InductorControls />} />

          <Route path="/capacitor" element={<CapacitorPage />} />
          <Route path="/capacitor/circuit" element={<CapacitorCircuit />} />
          <Route path="/capacitor/controls" element={<CapacitorControls />} />

          <Route path="/diode" element={<Diode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
