import React, { useState, useEffect } from 'react';
import { experimentsApi } from '../../api/experimentsApi';
import { modelsApi, type AIModel } from '../../api/modelsApi';
import { datasetsApi, type Dataset } from '../../api/datasetsApi';
import { metricsApi, type Metric } from '../../api/metricsApi';

interface CreateExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateExperimentModal({ isOpen, onClose, onSuccess }: CreateExperimentModalProps) {
  const [name, setName] = useState('');
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<Metric[]>([]);

  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([modelsApi.getAll(), datasetsApi.getAll(), metricsApi.getAll()]).then(([modelsData, datasetsData, metricsData]) => {
        setModels(modelsData);
        setDatasets(datasetsData);
        setAvailableMetrics(metricsData);
        if (datasetsData.length > 0) setSelectedDataset(datasetsData[0].id);
      });
      setName('');
      setSelectedModels([]);
      setSelectedMetrics([]);
      setError(null);
    }
  }, [isOpen]);

  const toggleModel = (id: string) => setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  const toggleMetric = (id: string) => setSelectedMetrics(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModels.length < 2) return setError("Select at least TWO models to compare.");
    if (selectedMetrics.length === 0) return setError("Select at least one metric.");
    
    setIsSubmitting(true);
    try {
      await experimentsApi.create({
        name,
        dataset_id: selectedDataset,
        model_ids: selectedModels,
        metrics: selectedMetrics
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError("Failed to create experiment draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
          <h2 className="text-lg font-semibold text-white">Create Multi-Model Experiment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Experiment Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Gemini vs Llama 3" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Target Dataset</label>
              <select value={selectedDataset} onChange={e => setSelectedDataset(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
                {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Compare Models (Select 2+)</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {models.map(model => (
                  <label key={model.id} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                    <input type="checkbox" checked={selectedModels.includes(model.id)} onChange={() => toggleModel(model.id)} className="accent-white" />
                    <span className="text-sm text-white">{model.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Evaluation Metrics</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {availableMetrics.map(metric => (
                  <label key={metric.id} className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                    <input type="checkbox" checked={selectedMetrics.includes(metric.id)} onChange={() => toggleMetric(metric.id)} className="mt-1 accent-white" />
                    <div>
                      <span className="text-sm font-medium text-white block">{metric.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{metric.category}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium">Create Draft</button>
          </div>
        </form>
      </div>
    </div>
  );
}