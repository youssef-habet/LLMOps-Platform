import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export interface Evaluation {
  id: string;
  name: string;
  model_id: string;
  dataset_id: string;
  metrics: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: any[];
  overall_score: number;
  created_at: string;
}

export const evaluationsApi = {
  getAll: async (): Promise<Evaluation[]> => {
    const response = await apiClient.get('/evaluations');
    return response.data;
  },

  create: async (data: Omit<Evaluation, 'id' | 'status' | 'results' | 'overall_score' | 'created_at'>): Promise<Evaluation> => {
    const response = await apiClient.post('/evaluations', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/evaluations/${id}`);
  }
};