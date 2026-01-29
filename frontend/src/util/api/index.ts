import axios from "axios";
import Cookies from "js-cookie";

export const baseUrl: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  validateStatus: (status) => status < 400,
});

let isRedirecting = false;

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.response?.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;

      Cookies.remove("token");

      if (typeof window !== "undefined") {
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }

    throw error;
  },
);

export default api;
