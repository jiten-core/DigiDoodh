'use client';

import { useState, useEffect } from 'react';
import { LazyAIAssistant, LazyWrapper, preloadCriticalCSS } from './lazy-loading';

interface OptimizedLayoutProps {
  children: React.ReactNode;
  showAIAssistant?: boolean;
}

export default function OptimizedLayout({ 
  children, 
  showAIAssistant = true 
}: OptimizedLayoutProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Preload critical CSS
    preloadCriticalCSS();
    
    // Preload critical components
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading DigiDoodh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Lazy loaded AI Assistant */}
      {showAIAssistant && isAppReady && (
        <LazyWrapper>
          <LazyAIAssistant />
        </LazyWrapper>
      )}
    </div>
  );
}