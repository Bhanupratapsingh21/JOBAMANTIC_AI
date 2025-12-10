import { create } from "zustand";
import { account } from "@/lib/appwrite";

export type User = {
    id: string;
    email?: string | null;
    name?: string | null;
    imageUrl?: string | null;
};

type UserState = {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    fetchUser: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: false,

    setUser: (user) => set({ user }),

    fetchUser: async () => {
        set({ loading: true });
        try {
            const appwriteUser = await account.get();

            console.log("✅ Fetched user:", appwriteUser);

            set({
                user: {
                    id: appwriteUser.$id,
                    email: appwriteUser.email,
                    name: appwriteUser.name,
                    imageUrl: appwriteUser.prefs?.avatarUrl || null,
                },
                loading: false,
            });
        } catch (err) {
            console.warn("❌ No active session:", err);
            set({ user: null, loading: false });
        }
    },

    logout: async () => {
        try {
            await account.deleteSession("current");
            set({ user: null });
        } catch (err) {
            console.error("Logout failed:", err);
            set({ user: null });
        }
    },
}));
