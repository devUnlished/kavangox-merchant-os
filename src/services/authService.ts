import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import { UserRole } from '../types';

export interface RegisterMerchantPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  shop_name: string;
  phone: string;
  address: string;
  business_classification: 'Informal' | 'SME' | 'Corporate';
  technology_maturity: 'No System' | 'Spreadsheet' | 'POS' | 'ERP';
  category_id?: number | string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string | number;
    name: string;
    email: string;
    role: string;
    status: string;
    vendor?: any;
  };
  tenant?: any;
  workspace?: any;
  workflow?: any;
}

export const authService = {
  async register(payload: RegisterMerchantPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/onboard/register', payload);
    if (data.token) {
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_profile', JSON.stringify(data.user));
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (data.token) {
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_profile', JSON.stringify(data.user));
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network failure on logout
    } finally {
      await AsyncStorage.multiRemove(['auth_token', 'user_profile']);
    }
  },

  async getProfile() {
    const { data } = await apiClient.get('/profile');
    return data;
  },

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  },
};
