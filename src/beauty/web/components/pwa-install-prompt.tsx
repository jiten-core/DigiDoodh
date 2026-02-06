'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Wifi
} from 'lucide-react';

interface PWAInstallPromptProps {
  className?: string;
}

export default function PWAInstallPrompt({ className }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installCount, setInstallCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay or after user interaction
      const timer = setTimeout(() => {
        if (!dismissed && !isInstalled) {
          setShowPrompt(true);
        }
      }, 5000);

      return () => clearTimeout(timer);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      
      // Track installation
      setInstallCount(prev => prev + 1);
      localStorage.setItem('pwa-install-count', String(installCount + 1));
    };

    // Check if user has dismissed the prompt recently
    const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (lastDismissed) {
      const timeDiff = Date.now() - parseInt(lastDismissed);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      if (timeDiff < oneWeek) {
        setDismissed(true);
      }
    }

    // Check install count
    const savedCount = localStorage.getItem('pwa-install-count');
    if (savedCount) {
      setInstallCount(parseInt(savedCount));
    }

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [dismissed, isInstalled, installCount]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', String(Date.now()));
  };

  const handleInstallClick = () => {
    // Show installation instructions based on device
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      // Show iOS installation instructions
      alert('To install DigiDoodh:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install');
    } else if (isAndroid) {
      // Try to install via prompt
      handleInstall();
    } else {
      // Desktop installation
      handleInstall();
    }
  };

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed || !showPrompt) {
    return null;
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 ${className}`}>
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">DD</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">Install DigiDoodh</h3>
                <Badge variant="secondary" className="text-xs">
                  {isMobile ? 'Mobile' : 'Desktop'}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                Get the full experience with offline access, push notifications, and more!
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Offline Mode</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Zap className="h-3 w-3 text-yellow-600" />
                  <span>Fast Loading</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Wifi className="h-3 w-3 text-blue-600" />
                  <span>Push Notifications</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star className="h-3 w-3 text-purple-600" />
                  <span>AI Assistant</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Installation instructions component
export function InstallationInstructions() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }
  }, []);

  const instructions = {
    ios: [
      'Tap the Share button in Safari',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" to install the app',
      'The app will appear on your home screen'
    ],
    android: [
      'Tap the install button above',
      'Tap "Install" in the dialog',
      'The app will be installed on your device',
      'Access it from your app drawer'
    ],
    desktop: [
      'Click the install button above',
      'Click "Install" in the dialog',
      'The app will be installed on your computer',
      'Access it from your applications'
    ]
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {platform === 'ios' && <Smartphone className="h-5 w-5 text-blue-600" />}
          {platform === 'android' && <Smartphone className="h-5 w-5 text-green-600" />}
          {platform === 'desktop' && <Monitor className="h-5 w-5 text-purple-600" />}
          <h3 className="font-semibold">Installation Instructions</h3>
        </div>
        
        <ol className="space-y-2">
          {instructions[platform].map((step, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-sm text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Once installed, you'll have full offline access and push notifications!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}