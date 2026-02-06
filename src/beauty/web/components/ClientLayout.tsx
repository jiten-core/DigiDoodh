'use client';

import { useEffect } from 'react';
import { validateFirebaseConfig } from '@/lib/firebase';
import { notifications } from '@/lib/notifications';
import { offlineSync } from '@/lib/offline-sync';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // Validate Firebase configuration
      validateFirebaseConfig();
      
      // Initialize notifications if permission is granted
      if (notifications.isEnabled()) {
        notifications.setupForegroundMessages();
      }
      
      // Initialize offline sync (only in browser)
      if (typeof window !== 'undefined') {
        console.log('Offline sync initialized');
        
        // Set up network status monitoring
        const handleOnline = () => {
          console.log('Network connection restored');
          offlineSync.forceSync();
        };
        
        const handleOffline = () => {
          console.log('Network connection lost - working offline');
        };
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Cleanup
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    } catch (error) {
      console.warn('ClientLayout initialization failed:', error);
    }
  }, []);

  return <>{children}</>;
}