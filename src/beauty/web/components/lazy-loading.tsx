'use client';

import { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Loading component
const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
  <Card className="flex items-center justify-center p-8 min-h-[200px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </Card>
);

// Lazy loaded components
export const LazyAIAssistant = lazy(() =>
  import('./ai-assistant').then(module => ({
    default: module.default
  }))
);

export const LazyBluetoothPrinter = lazy(() =>
  import('./bluetooth-printer').then(module => ({
    default: module.default
  }))
);

export const LazyNotificationSettings = lazy(() =>
  import('./notification-settings').then(module => ({
    default: module.default
  }))
);

export const LazyDashboard = lazy(() =>
  import('../app/dashboard/page').then(module => ({
    default: module.default
  }))
);

export const LazyMilkCollection = lazy(() =>
  import('../app/dashboard/milk/page').then(module => ({
    default: module.default
  }))
);

export const LazyFarmers = lazy(() =>
  import('../app/dashboard/farmers/page').then(module => ({
    default: module.default
  }))
);

export const LazyBilling = lazy(() =>
  import('../app/dashboard/billing/page').then(module => ({
    default: module.default
  }))
);

export const LazyInventory = lazy(() =>
  import('../app/dashboard/products/page').then(module => ({
    default: module.default
  }))
);

export const LazyDemo = lazy(() =>
  import('../app/page').then(module => ({
    default: module.default
  }))
);

// Wrapper component for lazy loading
export const LazyWrapper = ({
  children,
  fallback,
  delay = 200
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Suspense fallback={showFallback ? (fallback || <LoadingSpinner />) : <div />}>
      {children}
    </Suspense>
  );
};

// Optimized image component with lazy loading
export const OptimizedImage = ({
  src,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

// Preload critical resources
export const preloadComponent = (componentPath: string) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = componentPath;
  document.head.appendChild(link);
};

// Preload critical images
export const preloadImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

// Code splitting utility
export const loadComponent = (componentPath: string) => {
  return lazy(() => import(componentPath));
};

// Bundle analyzer helper
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available in development mode');
    console.log('Run: npm run analyze to see bundle breakdown');
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Critical CSS preloader
export const preloadCriticalCSS = () => {
  const criticalCSS = `
    /* Critical CSS for above-the-fold content */
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};