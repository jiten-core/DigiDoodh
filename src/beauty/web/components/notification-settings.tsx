'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Smartphone, 
  Volume2,
  CreditCard,
  Milk,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { notifications } from '@/lib/notifications';

interface NotificationSettings {
  enabled: boolean;
  paymentReminders: boolean;
  collectionUpdates: boolean;
  inventoryAlerts: boolean;
  rateUpdates: boolean;
  soundEnabled: boolean;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    paymentReminders: true,
    collectionUpdates: true,
    inventoryAlerts: true,
    rateUpdates: true,
    soundEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkNotificationStatus();
    loadSettings();
  }, []);

  const checkNotificationStatus = () => {
    const status = notifications.getPermissionStatus();
    setPermissionStatus(status);
    setSettings(prev => ({ ...prev, enabled: status === 'granted' }));
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('notification-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification-settings', JSON.stringify(newSettings));
  };

  const enableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const hasPermission = await notifications.requestPermission();
      
      if (hasPermission) {
        const token = await notifications.subscribeToPush();
        
        if (token) {
          await notifications.setupForegroundMessages();
          saveSettings({ ...settings, enabled: true });
          setPermissionStatus('granted');
          
          // Send welcome notification
          await notifications.sendWelcomeNotification('User');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disableNotifications = async () => {
    setIsLoading(true);
    
    try {
      await notifications.unsubscribe();
      saveSettings({ ...settings, enabled: false });
      setPermissionStatus('denied');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const testNotification = async (type: string) => {
    switch (type) {
      case 'payment':
        await notifications.sendPaymentReminder('Ramesh Kumar', 5200, 3);
        break;
      case 'collection':
        await notifications.sendCollectionSummary(243, 10935);
        break;
      case 'inventory':
        await notifications.sendInventoryAlert('Cattle Feed', 85, 'kg');
        break;
      case 'rate':
        await notifications.sendRateUpdate('Buffalo Milk', 48, 45);
        break;
    }
  };

  const getPermissionIcon = () => {
    switch (permissionStatus) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPermissionText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Notifications Enabled';
      case 'denied':
        return 'Notifications Blocked';
      default:
        return 'Notifications Not Set';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {getPermissionIcon()}
            <div>
              <p className="font-medium">{getPermissionText()}</p>
              <p className="text-sm text-gray-600">
                {permissionStatus === 'granted' 
                  ? 'You will receive notifications for important updates'
                  : 'Enable notifications to stay updated'
                }
              </p>
            </div>
          </div>
          
          <Button
            onClick={settings.enabled ? disableNotifications : enableNotifications}
            disabled={isLoading}
            variant={settings.enabled ? "destructive" : "default"}
          >
            {isLoading ? (
              'Loading...'
            ) : settings.enabled ? (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </>
            )}
          </Button>
        </div>

        {/* Notification Types */}
        {settings.enabled && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Notification Types
            </h3>
            
            <div className="space-y-3">
              {/* Payment Reminders */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-gray-600">Get notified about pending payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('payment')}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.paymentReminders}
                    onCheckedChange={(checked) => updateSetting('paymentReminders', checked)}
                  />
                </div>
              </div>

              {/* Collection Updates */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Milk className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">Collection Updates</p>
                    <p className="text-sm text-gray-600">Daily collection summaries</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('collection')}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.collectionUpdates}
                    onCheckedChange={(checked) => updateSetting('collectionUpdates', checked)}
                  />
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="font-medium">Inventory Alerts</p>
                    <p className="text-sm text-gray-600">Low stock warnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('inventory')}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.inventoryAlerts}
                    onCheckedChange={(checked) => updateSetting('inventoryAlerts', checked)}
                  />
                </div>
              </div>

              {/* Rate Updates */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium">Rate Updates</p>
                    <p className="text-sm text-gray-600">Milk price changes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification('rate')}
                  >
                    Test
                  </Button>
                  <Switch
                    checked={settings.rateUpdates}
                    onCheckedChange={(checked) => updateSetting('rateUpdates', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sound Settings */}
        {settings.enabled && (
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Sound Settings
            </h3>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Notification Sound</p>
                <p className="text-sm text-gray-600">Play sound for notifications</p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
              />
            </div>
          </div>
        )}

        {/* Browser Support Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Browser Support</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>✅ Chrome, Edge, Firefox (Desktop)</p>
            <p>✅ Chrome, Firefox (Android)</p>
            <p>❌ Safari (iOS - limited support)</p>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            For the best experience, use Chrome or Firefox on desktop or Android.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}