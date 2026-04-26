import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export interface Metric {
  id: string;
  name: string;
  metric_type: string;
  description: string;
  config: Record<string, any>; // JSONB object
  created_at: string;
}

export const metricsApi = {
  getAll: async (): Promise<Metric[]> => {
    const response = await apiClient.get('/metrics');
    return response.data;
  },

  create: async (metricData: Omit<Metric, 'id' | 'created_at'>): Promise<Metric> => {
    const response = await apiClient.post('/metrics', metricData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/metrics/${id}`);
  }
};