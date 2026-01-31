// DigiDhoodh - UI State Store (Zustand)
// Global UI state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

interface UIState {
    // Sidebar state
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;

    // Theme state
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;

    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    loadingMessage: string;
    setLoadingMessage: (message: string) => void;

    // Modal states
    activeModal: string | null;
    setActiveModal: (modal: string | null) => void;
    modalData: any;
    setModalData: (data: any) => void;

    // Quick action
    showQuickAction: boolean;
    setShowQuickAction: (show: boolean) => void;

    // Sync status
    syncStatus: 'idle' | 'syncing' | 'success' | 'error';
    setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error') => void;
    lastSyncTime: string | null;
    setLastSyncTime: (time: string | null) => void;

    // Network status
    isOnline: boolean;
    setIsOnline: (online: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            // Sidebar
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            // Theme
            theme: 'system',
            setTheme: (theme) => set({ theme }),

            // Notifications
            notifications: [],
            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: crypto.randomUUID(),
                    read: false,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50),
                }));
            },
            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }));
            },
            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }));
            },
            clearNotifications: () => set({ notifications: [] }),

            // Loading
            isLoading: false,
            setIsLoading: (loading) => set({ isLoading: loading }),
            loadingMessage: '',
            setLoadingMessage: (message) => set({ loadingMessage: message }),

            // Modal
            activeModal: null,
            setActiveModal: (modal) => set({ activeModal: modal }),
            modalData: null,
            setModalData: (data) => set({ modalData: data }),

            // Quick action
            showQuickAction: false,
            setShowQuickAction: (show) => set({ showQuickAction: show }),

            // Sync
            syncStatus: 'idle',
            setSyncStatus: (status) => set({ syncStatus: status }),
            lastSyncTime: null,
            setLastSyncTime: (time) => set({ lastSyncTime: time }),

            // Network
            isOnline: true,
            setIsOnline: (online) => set({ isOnline: online }),
        }),
        {
            name: 'digidhoodh-ui-store',
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                theme: state.theme,
                notifications: state.notifications,
                lastSyncTime: state.lastSyncTime,
            }),
        }
    )
);

// Selector hooks for better performance
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useTheme = () => useUIStore((state) => state.theme);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useIsOnline = () => useUIStore((state) => state.isOnline);
export const useSyncStatus = () => useUIStore((state) => state.syncStatus);

export default useUIStore;
