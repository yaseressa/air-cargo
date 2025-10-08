import { QueryClient } from "react-query";
import axios, { AxiosError } from "axios";
import { logout } from "@/utils";
export const queryClient = new QueryClient();

export const axiosApiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL + "/api",
});
export const axiosAuthClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API_URL + "/auth",
});

axiosApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
axiosApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error as AxiosError).status === 401 ||
      (error as AxiosError).status === 403 ||
      ((error as AxiosError).response?.data as any).message
        ?.toLowerCase()
        .startsWith("jwt")
    ) {
      logout();
    }
    return Promise.reject(error);
  }
);
