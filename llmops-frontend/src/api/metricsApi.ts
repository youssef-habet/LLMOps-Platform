import apiClient from './axiosClient';

export interface Metric {
  id: string;
  name: string;
  category: 'nlp' | 'reliability' | 'custom';
  method_name: string;
  description?: string;
  custom_prompt?: string;
  created_at?: string;
}

export const metricsApi = {
  getAll: async (): Promise<Metric[]> => {
    const response = await apiClient.get('/metrics');
    return response.data;
  },

  createCustom: async (data: { name: string; description: string; custom_prompt: string }): Promise<Metric> => {
    const response = await apiClient.post('/metrics', data);
    return response.data;
  },

  update: async (id: string, data: { name: string; description: string; custom_prompt: string }): Promise<Metric> => {
    const response = await apiClient.put(`/metrics/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/metrics/${id}`);
  }
};
