// Basic mock for Firebase App
export const app = {
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false
};

export function validateFirebaseConfig() {
    return true;
}

export const firebaseConfig = {
    apiKey: "demo",
    authDomain: "demo",
    projectId: "demo",
    storageBucket: "demo",
    messagingSenderId: "demo",
    appId: "demo"
};

export default app;
