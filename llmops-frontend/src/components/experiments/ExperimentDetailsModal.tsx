import React from 'react';
import { type Experiment } from '../../api/experimentsApi';
import { type AIModel } from '../../api/modelsApi';
import { type Dataset } from '../../api/datasetsApi';
import { type Metric } from '../../api/metricsApi';

interface ExperimentDetailsModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
  models: AIModel[];
  datasets: Dataset[];
  metrics: Metric[];
}

export default function ExperimentDetailsModal({ experiment, isOpen, onClose, models, datasets, metrics }: ExperimentDetailsModalProps) {
  if (!isOpen || !experiment) return null;

  const datasetName = datasets.find(d => d.id === experiment.dataset_id)?.name || 'Unknown Dataset';
  const selectedModels = experiment.model_ids.map(id => models.find(m => m.id === id)?.name || id);
  const selectedMetrics = experiment.metrics.map(id => metrics.find(m => m.id === id)?.name || id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Experiment Configuration
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Target Dataset</span>
            <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm text-gray-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              {datasetName}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Competing Models ({selectedModels.length})</span>
            <div className="flex flex-wrap gap-2">
              {selectedModels.map((mName, i) => (
                <span key={i} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-md font-medium">
                  {mName}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Evaluation Metrics ({selectedMetrics.length})</span>
            <div className="flex flex-wrap gap-2">
              {selectedMetrics.map((mName, i) => (
                <span key={i} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-2.5 py-1 rounded-md font-medium">
                  {mName}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}