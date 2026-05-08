import apiClient from './axiosClient';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  system_prompt?: string;
  endpoint_url?: string; 
  api_key_ref?: string; 
  created_at: string;
}

export const modelsApi = {
  getAll: async (): Promise<AIModel[]> => {
    const response = await apiClient.get('/models');
    return response.data;
  },

  getAvailable: async (): Promise<Record<string, string[]>> => {
    const response = await apiClient.get('/models/available');
    return response.data;
  },

  create: async (modelData: Omit<AIModel, 'id' | 'created_at'>): Promise<AIModel> => {
    const response = await apiClient.post('/models', modelData);
    return response.data;
  },

  update: async (id: string, modelData: Partial<AIModel>): Promise<AIModel> => {
    const response = await apiClient.put(`/models/${id}`, modelData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/models/${id}`);
  }
};
