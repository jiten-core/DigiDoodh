import { db } from './db';

export const authService = {
    async signInWithEmail(email: string, password: string) {
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    async signUp(email: string, password: string, metadata?: any) {
        const { data, error } = await db.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        })
        return { data, error }
    },

    async signOut() {
        const { error } = await db.auth.signOut()
        return { error }
    },

    async getCurrentUser() {
        const { data: { user }, error } = await db.auth.getUser()
        return { user, error }
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
        return db.auth.onAuthStateChange(callback)
    }
};
