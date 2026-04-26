import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export interface Config {
  id: string;
  name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  system_prompt: string;
  created_at: string;
}

export const configsApi = {
  getAll: async (): Promise<Config[]> => {
    const response = await apiClient.get('/configs');
    return response.data;
  },

  create: async (configData: Omit<Config, 'id' | 'created_at'>): Promise<Config> => {
    const response = await apiClient.post('/configs', configData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/configs/${id}`);
  }
};