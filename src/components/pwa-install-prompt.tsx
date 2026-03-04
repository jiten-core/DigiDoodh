// src/components/pwa-install-prompt.tsx - PWA Installation Prompt
'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if we should show iOS install prompt
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      const hasSeenPrompt = localStorage.getItem('ios-install-prompt-seen');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS - show instructions
      if (isIOS) {
        setShowIOSInstructions(true);
        localStorage.setItem('ios-install-prompt-seen', 'true');
      }
      return;
    }

    // Android - trigger install prompt
    deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('✅ User accepted PWA install');
      setIsInstalled(true);
    } else {
      console.log('❌ User dismissed PWA install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');

    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const handleDismissIOS = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('ios-install-prompt-seen', 'true');
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // Don't show if dismissed
  if (localStorage.getItem('pwa-install-dismissed')) return null;

  // iOS Instructions Modal
  if (showIOSInstructions && isIOS) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden shadow-2xl">
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-saffron-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Install DigiDhoodh
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add to Home Screen
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismissIOS}
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* iOS Instructions */}
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                To install DigiDhoodh on your iPhone/iPad:
              </p>

              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-saffron-600">1.</span>
                  <span>
                    Tap the <strong>Share</strong> button{' '}
                    <svg className="inline h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z" />
                    </svg>{' '}
                    (at the bottom of Safari)
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-saffron-600">2.</span>
                  <span>
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex-shrink-0 font-bold text-saffron-600">3.</span>
                  <span>
                    Tap <strong>"Add"</strong> in the top right
                  </span>
                </li>
              </ol>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="text-blue-900 dark:text-blue-100 font-medium">
                  ⭐ Works 100% offline after installation!
                </p>
              </div>
            </div>

            <Button
              onClick={handleDismissIOS}
              className="w-full bg-saffron-500 hover:bg-saffron-600"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Android Install Prompt
  if (showPrompt && !isIOS && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:w-96 z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-saffron-500 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center flex-shrink-0">
                <Download className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Install DigiDhoodh
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Get the app for faster access and offline functionality
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Now
              </Button>

              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS Prompt (if not dismissed)
  if (showPrompt && isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:w-96 z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-saffron-500 overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Install DigiDhoodh
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add to Home Screen for offline access
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowIOSInstructions(true)}
                className="flex-1 bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Show Me How
              </Button>

              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}