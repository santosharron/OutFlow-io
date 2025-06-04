import axios, { AxiosResponse } from 'axios';
import {
  Campaign,
  CreateCampaignData,
  UpdateCampaignData,
  LinkedInProfile,
  GeneratedMessage,
  MessageVariations,
  ScrapedProfile,
  ScrapeRequest,
  ApiResponse,
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
      code: error.code,
      stack: error.stack
    });
    
    if (error.response?.status === 404) {
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.code === 'NETWORK_ERROR') {
      console.error('Network error');
    }
    
    return Promise.reject(error);
  }
);

// Campaign API functions
export const campaignApi = {
  // Get all campaigns
  getAll: async (): Promise<ApiResponse<Campaign[]>> => {
    const response: AxiosResponse<ApiResponse<Campaign[]>> = await api.get('/campaigns');
    return response.data;
  },

  // Get single campaign
  getById: async (id: string): Promise<ApiResponse<Campaign>> => {
    const response: AxiosResponse<ApiResponse<Campaign>> = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  // Create campaign
  create: async (data: CreateCampaignData): Promise<ApiResponse<Campaign>> => {
    const response: AxiosResponse<ApiResponse<Campaign>> = await api.post('/campaigns', data);
    return response.data;
  },

  // Update campaign
  update: async (id: string, data: UpdateCampaignData): Promise<ApiResponse<Campaign>> => {
    const response: AxiosResponse<ApiResponse<Campaign>> = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  // Delete campaign (soft delete)
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
};

// Message API functions
export const messageApi = {
  // Generate personalized message
  generate: async (profileData: LinkedInProfile): Promise<ApiResponse<GeneratedMessage>> => {
    const response: AxiosResponse<ApiResponse<GeneratedMessage>> = await api.post('/personalized-message', profileData);
    return response.data;
  },

  // Generate message variations
  generateVariations: async (profileData: LinkedInProfile, count: number = 3): Promise<ApiResponse<MessageVariations>> => {
    const response: AxiosResponse<ApiResponse<MessageVariations>> = await api.post(`/personalized-message/variations?count=${count}`, profileData);
    return response.data;
  },
};

// Profile API functions (Bonus feature)
export const profileApi = {
  // Get all profiles
  getAll: async (params?: { page?: number; limit?: number; company?: string; location?: string }): Promise<ApiResponse<ScrapedProfile[]>> => {
    const response: AxiosResponse<ApiResponse<ScrapedProfile[]>> = await api.get('/profiles', { params });
    return response.data;
  },

  // Get single profile
  getById: async (id: string): Promise<ApiResponse<ScrapedProfile>> => {
    const response: AxiosResponse<ApiResponse<ScrapedProfile>> = await api.get(`/profiles/${id}`);
    return response.data;
  },

  // Search profiles
  search: async (url: string): Promise<ApiResponse<ScrapedProfile[]>> => {
    const response: AxiosResponse<ApiResponse<ScrapedProfile[]>> = await api.get('/profiles/search', { params: { url } });
    return response.data;
  },

  // Scrape profiles
  scrape: async (data: ScrapeRequest): Promise<ApiResponse<ScrapedProfile[]>> => {
    console.log('🚀 Sending scrape request with data:', data);
    const response: AxiosResponse<ApiResponse<ScrapedProfile[]>> = await api.post('/profiles/scrape', data, {
      timeout: 300000 // 5 minutes timeout for scraping
    });
    console.log('📦 Scrape response received:', response.data);
    return response.data;
  },

  // Delete profile
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await api.delete(`/profiles/${id}`);
    return response.data;
  },

  // Get profile statistics
  getStats: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/profiles/stats');
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<any> => {
  const response = await api.get('/health');
  return response.data;
};

// Export default api instance for custom requests
export default api; 