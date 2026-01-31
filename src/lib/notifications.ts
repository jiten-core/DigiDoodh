export const notifications = {
    isEnabled: () => {
        if (typeof window === 'undefined') return false;
        return 'Notification' in window && Notification.permission === 'granted';
    },
    getPermissionStatus: (): NotificationPermission => {
        if (typeof window === 'undefined') return 'default';
        return Notification.permission;
    },
    setupForegroundMessages: async () => {
        console.log('Foreground messages setup (mock)');
        return true;
    },
    requestPermission: async () => {
        if (typeof window === 'undefined') return false;
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    },
    subscribeToPush: async () => {
        console.log('Subscribing to push notifications (mock)');
        return 'demo-token-' + Math.random().toString(36).substring(7);
    },
    unsubscribe: async () => {
        console.log('Unsubscribing from push notifications (mock)');
        return true;
    },
    sendWelcomeNotification: async (name: string) => {
        if (Notification.permission === 'granted') {
            new Notification('Welcome to DigiDhoodh!', {
                body: `Hello ${name}, you will now receive important updates here.`,
                icon: '/logo.png'
            });
        }
    },
    sendPaymentReminder: async (name: string, amount: number, days: number) => {
        if (Notification.permission === 'granted') {
            new Notification('Payment Reminder', {
                body: `Payment of ₹${amount} for ${name} is pending for ${days} days.`,
            });
        }
    },
    sendCollectionSummary: async (entries: number, amount: number) => {
        if (Notification.permission === 'granted') {
            new Notification('Collection Summary', {
                body: `Today's total: ${entries} entries, ₹${amount} total value.`,
            });
        }
    },
    sendInventoryAlert: async (name: string, stock: number, unit: string) => {
        if (Notification.permission === 'granted') {
            new Notification('Low Stock Alert', {
                body: `${name} is low on stock (${stock} ${unit} remaining).`,
            });
        }
    },
    sendRateUpdate: async (type: string, newRate: number, oldRate: number) => {
        if (Notification.permission === 'granted') {
            const direction = newRate > oldRate ? 'increased' : 'decreased';
            new Notification('Rate Update', {
                body: `${type} rate ${direction} to ₹${newRate}/liter.`,
            });
        }
    }
};
