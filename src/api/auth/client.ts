import { apiClient } from "@/lib/api-client";
import {
  AuthApiResponse,
  LoginRequest,
  MeApiResponse,
  RegisterRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ApiResponse,
} from "@/types";
import axios from "axios";
import Cookies from "js-cookie";

export const authClient = {
  // Proxied through Next.js BFF to avoid CORS and manage cookies
  login: async (data: LoginRequest) => {
    const response = await axios.post<AuthApiResponse>("/api/auth/login", data);
    return response.data;
  },

  // Uses apiClient so the interceptor sends the Authorization header to the BFF,
  // which then forwards it to the backend to actually invalidate the token
  logout: async () => {
    const response = await apiClient.post<AuthApiResponse>("/api/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<MeApiResponse>("/api/v1/auth/me");
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse>("/api/v1/auth/register", data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest) => {
    const response = await apiClient.post<ApiResponse>("/api/v1/auth/verify-email", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await apiClient.post<ApiResponse>("/api/v1/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await apiClient.post<ApiResponse>("/api/v1/auth/reset-password", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await apiClient.post<ApiResponse>("/api/v1/auth/change-password", data);
    return response.data;
  },
};


