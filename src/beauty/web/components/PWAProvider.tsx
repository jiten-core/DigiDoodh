// Enhanced PWA Provider with Install Prompt and Update Detection
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Download,
  RefreshCw,
  X,
  Smartphone,
  Monitor,
  CheckCircle
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    // Listen for install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)

      // Show install banner after a delay
      setTimeout(() => {
        setShowInstallBanner(true)
      }, 3000)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallBanner(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Service worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdateBanner(true)
            }
          })
        })
      })

      // Check for updates every 5 minutes
      setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update()
        })
      }, 5 * 60 * 1000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setShowInstallBanner(false)
    setInstallPrompt(null)
  }

  const handleUpdate = () => {
    window.location.reload()
  }

  const dismissInstallBanner = () => {
    setShowInstallBanner(false)
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show install banner if already installed or dismissed recently
  const shouldShowInstallBanner = showInstallBanner && !isStandalone && !isInstalled

  return (
    <>
      {children}

      <AnimatePresence>
        {/* Install Banner */}
        {shouldShowInstallBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <Card className="shadow-2xl border-2 border-green-200 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    {isIOS ? (
                      <Smartphone className="w-6 h-6 text-white" />
                    ) : (
                      <Download className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Install DigiDhoodh App
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {isIOS
                        ? 'Tap Share → Add to Home Screen for the best experience'
                        : 'Install for faster access and offline support!'
                      }
                    </p>
                    <div className="flex gap-2 mt-3">
                      {!isIOS && (
                        <Button size="sm" onClick={handleInstall}>
                          <Download className="w-4 h-4 mr-2" />
                          Install
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={dismissInstallBanner}>
                        Maybe Later
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={dismissInstallBanner}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Update Banner */}
        {showUpdateBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <Card className="shadow-2xl border-2 border-blue-200 bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Update Available
                    </h3>
                    <p className="text-sm text-gray-500">
                      A new version is ready
                    </p>
                  </div>
                  <Button size="sm" onClick={handleUpdate}>
                    Update Now
                  </Button>
                  <button
                    onClick={() => setShowUpdateBanner(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Install Success Toast */}
        {isInstalled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="bg-green-500 text-white shadow-lg">
              <CardContent className="p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">App installed successfully!</span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}