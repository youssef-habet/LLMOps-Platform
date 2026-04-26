import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export interface Dataset {
  id: string;
  name: string;
  task_type: string;
  file_path: string;
  file_ext: string;
  file_size_bytes: number;
  version: number;
  is_valid: boolean;
  created_at: string;
}

export const datasetsApi = {
  getAll: async (): Promise<Dataset[]> => {
    const response = await apiClient.get('/datasets');
    return response.data;
  },

  upload: async (formData: FormData): Promise<Dataset> => {
    const response = await apiClient.post('/datasets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/datasets/${id}`);
  },

  getPreview: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/datasets/${id}/preview`);
    return response.data;
  },

  getDownloadUrl: async (id: string): Promise<string> => {
    const response = await apiClient.get(`/datasets/${id}/download`);
    return response.data.url;
  }
};