import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { User } from '../entities/users/schema';

const STORAGE_KEY = 'fluento_profile';

interface ProfileState {
    profile: User | null;
    setProfile: (profile: User | null) => void;
    updateProfile: (updates: Partial<User>) => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            profile: null,
            setProfile: (profile) => set({ profile }),
            updateProfile: (updates) =>
                set((state) => ({
                    profile: state.profile
                        ? { ...state.profile, ...updates }
                        : null,
                })),
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => ({ profile: state.profile }),
        }
    )
);

/** Hook with shallow comparison for better performance */
export const useProfile = () => {
    return useProfileStore(
        useShallow((state) => ({
            profile: state.profile,
        }))
    );
};
