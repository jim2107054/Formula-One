import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

import {
  AsyncState,
  LoginCredentials,
  SignupCredentials,
  User,
} from "../types/auth";
import { authActions } from "../actions/auth";

interface AuthState extends AsyncState<User> {
  token: string | null;
  isAuthenticated: boolean;
  signup: (credentials: SignupCredentials) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      data: null,
      loading: false,
      error: null,
      token: null,
      isAuthenticated: false,
      signup: async (credentials) => {
        set({ loading: true, error: null });

        try {
          const result = await authActions.signup(credentials);

          Cookies.set("token", result.token, { expires: 7, path: "/" });

          const user: User = {
            _id: result.user._id,
            username: result.user.username,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            imageUrl: result.user.imageUrl,
          };

          set({
            data: user,
            isAuthenticated: true,
            loading: false,
          });
          toast.success("Signup successful!");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Signup failed!";
          set({
            loading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
        }
      },
      login: async (credentials) => {
        set({ loading: true, error: null });

        try {
          const result = await authActions.login(credentials);

          Cookies.set("token", result.token, { expires: 7, path: "/" });

          const user: User = {
            _id: result.user._id,
            username: result.user.username,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            imageUrl: result.user.imageUrl,
          };

          set({
            data: user,
            isAuthenticated: true,
            loading: false,
          });
          toast.success("Login successful!");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed!";
          set({
            loading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
        }
      },
      logout: async () => {
        try {
          await authActions.logout();
        } catch {
          // Ignore errors
        }

        Cookies.remove("token", { path: "/" });
        set({
          data: null,
          isAuthenticated: false,
          error: null,
        });

        toast.success("Logout successful!", { duration: 1000 });

        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }, 1000);
      },
      getProfile: async () => {
        const token = Cookies.get("token");
        if (!token) return;

        set({ loading: true, error: null });

        try {
          const user = await authActions.getProfile();
          set({
            data: user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch profile!";
          set({
            loading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        data: state.data,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = Cookies.get("token");
          if (!token && state.isAuthenticated) {
            state.data = null;
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
