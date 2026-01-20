/**
 * Display Screen - Independent Entry Point
 * Runs on the large TV/Projector display
 * Shows circuit visualizations with landing page
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DisplayScreenNew from '@/screens/DisplayScreenNew';
import '@/index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DisplayScreenNew />
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
