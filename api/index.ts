import Auth from "@/util/Auth";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export class ApiService {
  private api: AxiosInstance;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL: baseURL,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = Auth.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const isSigninRequest = error.config.url.endsWith("/signin");
          const isSignupRequest = error.config.url.endsWith("/signup");
          if (
            !isSigninRequest &&
            !isSignupRequest &&
            typeof window !== "undefined"
          ) {
            Auth.removeToken();
            window.location.href = "/signin";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }

  getFetcher<T>() {
    return {
      get: (url: string, config?: AxiosRequestConfig): any =>
        this.get<T>(url, config),
      post: (url: string, data?: any, config?: AxiosRequestConfig): any =>
        this.post<T>(url, data, config),
      put: (url: string, data?: any, config?: AxiosRequestConfig): any =>
        this.put<T>(url, data, config),
      patch: (url: string, data?: any, config?: AxiosRequestConfig): any =>
        this.patch<T>(url, data, config),
      delete: (url: string, config?: AxiosRequestConfig): any =>
        this.delete<T>(url, config),
    };
  }
}

export const apiService = new ApiService("http://localhost:3000/api/");

export const fetcher = apiService.getFetcher();
