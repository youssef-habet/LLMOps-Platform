import apiClient from './axiosClient';

export interface Evaluation {
  id: string;
  name: string;
  model_id: string; // <-- Back to single string
  dataset_id: string;
  metrics: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  overall_score: number;
  results?: unknown[]; // <-- Back to flat array
  created_at: string;
}

export const evaluationsApi = {
  getAll: async (): Promise<Evaluation[]> => {
    const response = await apiClient.get('/evaluations');
    return response.data;
  },
  
  create: async (data: { name: string; dataset_id: string; model_id: string; metrics: string[] }): Promise<Evaluation> => {
    const response = await apiClient.post('/evaluations', data);
    return response.data;
  },

  triggerRun: async (id: string): Promise<void> => {
    await apiClient.post(`/evaluations/${id}/run`);
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/evaluations/${id}`);
  }
};
