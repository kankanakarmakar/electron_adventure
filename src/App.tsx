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
<<<<<<< HEAD
import DisplayScreen from "./screens/DisplayScreen";
import HardwareControlScreen from "./screens/HardwareControlScreen";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [screenMode, setScreenMode] = useState<'default' | 'display' | 'control'>('default');

  // Detect screen mode from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') as 'display' | 'control' | null;
    
    if (mode) {
      setScreenMode(mode);
      localStorage.setItem('screenMode', mode);
    } else {
      const saved = localStorage.getItem('screenMode');
      if (saved === 'display' || saved === 'control') {
        setScreenMode(saved);
      }
    }
  }, []);

  // Render Display Screen
  if (screenMode === 'display') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DisplayScreen />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Render Hardware Control Screen
  if (screenMode === 'control') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HardwareControlScreen />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Default: Main application with navigation
  return (
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
};
=======
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
>>>>>>> 6227f02fab69f00512fe8f19d6abfc2c92e2b545

export default App;
