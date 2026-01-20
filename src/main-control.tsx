/**
 * Control Screen - Independent Entry Point
 * Runs on the smaller hardware control panel
 * Shows buttons and hardware controls only
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ControlScreenNew from '@/screens/ControlScreenNew';
import '@/index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ControlScreenNew />
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
