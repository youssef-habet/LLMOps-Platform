import React, { useState, useEffect } from 'react';
import { evaluationsApi, type Evaluation } from '../../api/evaluationsApi';
import { modelsApi, type AIModel } from '../../api/modelsApi';
import { datasetsApi, type Dataset } from '../../api/datasetsApi';
import { metricsApi, type Metric } from '../../api/metricsApi';

interface RunEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEval: Evaluation) => void;
}

export default function RunEvaluationModal({ isOpen, onClose, onSuccess }: RunEvaluationModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [modelId, setModelId] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // Data Options State
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load options when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingData(true);
      Promise.all([modelsApi.getAll(), datasetsApi.getAll(), metricsApi.getAll()])
        .then(([modelsData, datasetsData, metricsData]) => {
          setModels(modelsData);
          setDatasets(datasetsData);
          setMetrics(metricsData);
          
          // Auto-select first options if available
          if (modelsData.length > 0) setModelId(modelsData[0].id);
          if (datasetsData.length > 0) setDatasetId(datasetsData[0].id);
          
          // Reset form
          setName('');
          setSelectedMetrics([]);
          setError(null);
        })
        .catch(() => setError("Failed to load workspace data."))
        .finally(() => setIsLoadingData(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMetrics.length === 0) {
      setError("Please select at least one metric to evaluate.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const newEval = await evaluationsApi.create({
        name,
        model_id: modelId,
        dataset_id: datasetId,
        metrics: selectedMetrics
      });
      onSuccess(newEval);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to start evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
          <h2 className="text-lg font-semibold text-white">Run New Evaluation</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-white transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {isLoadingData ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading workspace data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

            {/* Eval Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Evaluation Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GPT-4 vs Toxicity Dataset" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30" />
            </div>

            {/* Select Model & Dataset */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Target Model</label>
                <select value={modelId} onChange={(e) => setModelId(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white appearance-none cursor-pointer">
                  {models.map(m => <option key={m.id} value={m.id} className="bg-[#171717]">{m.name} ({m.provider})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Test Dataset</label>
                <select value={datasetId} onChange={(e) => setDatasetId(e.target.value)} required className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white appearance-none cursor-pointer">
                  {datasets.map(d => <option key={d.id} value={d.id} className="bg-[#171717]">{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Metrics Checklist */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Metrics (Choose 1 or more)</label>
              <div className="space-y-2 border border-white/10 p-3 rounded-lg bg-black/20 max-h-48 overflow-y-auto">
                {metrics.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No metrics defined in workspace.</p>
                ) : (
                  metrics.map(metric => (
                    <label key={metric.id} className="flex items-start gap-3 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors group">
                      <div className="relative flex items-center pt-0.5">
                        <input 
                          type="checkbox" 
                          checked={selectedMetrics.includes(metric.id)}
                          onChange={() => handleMetricToggle(metric.id)}
                          className="peer appearance-none w-4 h-4 border border-gray-500 rounded bg-transparent checked:bg-white checked:border-white transition-all cursor-pointer"
                        />
                        <svg className="absolute w-4 h-4 text-black pointer-events-none opacity-0 peer-checked:opacity-100 p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{metric.name}</span>
                        <span className="text-xs text-gray-500 line-clamp-1" title={metric.description}>{metric.description}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || models.length === 0 || datasets.length === 0} className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Starting...' : 'Run Test'}
                {!isSubmitting && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}