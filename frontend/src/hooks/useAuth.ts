import { useAuthStore } from "@/zustand/stores/auth";

export const useAuth = () => {
  const store = useAuthStore();

  return {
    user: store.data,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    userRole: store.data?.role,
    signup: store.signup,
    login: store.login,
    logout: store.logout,
    getProfile: store.getProfile,
    clearError: store.clearError,
  };
};
