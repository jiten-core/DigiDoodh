export const offlineSync = {
    forceSync: async () => {
        console.log('Force sync triggered (mock)');
        return true;
    },
    hasPendingChanges: () => {
        return false;
    }
};
