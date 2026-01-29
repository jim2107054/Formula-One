import api from "@/util/api";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  SignupCredentials,
} from "../types/auth";
import { AxiosError } from "axios";

export const authActions = {
  signup: async (credentials: SignupCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post("/signup", credentials);

      if (response.data?.success === false) {
        throw new Error(
          response.data.error || response.data.message || "Signup failed"
        );
      }

      if (!response.data?.token || !response.data?.user) {
        console.error("Malformed signup response:", response.data);
        throw new Error("Unexpected server response");
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const { error: errMessage, message } = error.response.data as {
          error?: string;
          message?: string;
        };
        throw new Error(errMessage || message || "Signup failed");
      }
      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post("/signin", credentials);

      if (response.data?.success === false) {
        throw new Error(
          response.data.error || response.data.message || "Login failed"
        );
      }

      if (!response.data?.token || !response.data?.user) {
        console.error("Malformed login response:", response.data);
        throw new Error("Unexpected server response");
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const { error: errMessage, message } = error.response.data as {
          error?: string;
          message?: string;
        };
        throw new Error(errMessage || message || "Login failed");
      }
      throw error;
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get(`/me`);

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const user = response.data;

      if (!user?.id || !user?.email) {
        throw new Error("Invalid user data from server");
      }

      return {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        role: user.role,
      };
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as {
          response?: { data?: { error?: string } };
        };
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch profile due to network error");
    }
  },

  logout: async (): Promise<void> => {
    await api.get("/signout");
  },
};
