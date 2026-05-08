import apiClient from './axiosClient';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  auth_provider: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { email, password, full_name: fullName });
    return response.data;
  },

  me: async (): Promise<AuthUser> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (fullName: string): Promise<AuthUser> => {
    const response = await apiClient.put('/auth/profile', { full_name: fullName });
    return response.data;
  },

  getGoogleLoginUrl: (next = '/dashboard') =>
    `http://localhost:8000/api/auth/google/login?next=${encodeURIComponent(next)}`,
};
