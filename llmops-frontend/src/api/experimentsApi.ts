import apiClient from './axiosClient';

export interface ModelRunResult {
  model_name: string;
  overall_score: number;
  metadata: {
    timestamp: string;
    parameters: {
      provider: string;
      version: string;
      temperature: number;
      max_tokens: number;
      system_prompt: string;
    }
  };
  rows: unknown[];
}

export interface Experiment {
  id: string;
  name: string;
  model_ids: string[]; // <-- Array of models!
  dataset_id: string;
  metrics: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  overall_score: number;
  results?: Record<string, ModelRunResult>; // <-- Dictionary mapped by Model ID
  created_at: string;
}

export const experimentsApi = {
  getAll: async (): Promise<Experiment[]> => {
    const response = await apiClient.get('/experiments');
    return response.data;
  },
  getById: async (id: string): Promise<Experiment> => {
    const response = await apiClient.get(`/experiments/${id}`);
    return response.data;
  },
  
  create: async (data: { name: string; dataset_id: string; model_ids: string[]; metrics: string[] }): Promise<Experiment> => {
    const response = await apiClient.post('/experiments', data);
    return response.data;
  },

  triggerRun: async (id: string): Promise<void> => {
    await apiClient.post(`/experiments/${id}/run`);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/experiments/${id}`);
  }
};
