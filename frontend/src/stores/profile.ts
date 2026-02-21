import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { User } from '../entities/users/schema';

interface ProfileState {
    profile: User | null;
    setProfile: (profile: User | null) => void;
    updateProfile: (updates: Partial<User>) => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
    profile: null,
    setProfile: (profile) => set({ profile }),
    updateProfile: (updates) =>
        set((state) => ({
            profile: state.profile
                ? { ...state.profile, ...updates }
                : null,
        })),
}));

/** Hook with shallow comparison for better performance */
export const useProfile = () => {
    return useProfileStore(
        useShallow((state) => ({
            profile: state.profile,
        }))
    );
};
