import React, { useState } from 'react';
import { metricsApi, type Metric } from '../../api/metricsApi';

interface AddMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMetric: Metric) => void;
}

// 1. The Pre-defined Metric Catalog
const METRIC_CATALOG = [
  { 
    id: 'exact_match', 
    name: 'Exact Match', 
    type: 'exact_match', 
    description: 'Checks if the AI output perfectly matches the expected target string.' 
  },
  { 
    id: 'contains', 
    name: 'Contains Keyword', 
    type: 'contains', 
    description: 'Checks if the expected target string exists anywhere inside the AI output.' 
  },
  { 
    id: 'rouge_l', 
    name: 'ROUGE-L (Overlap)', 
    type: 'rouge', 
    description: 'Measures the longest common subsequence (LCS) between the output and the reference answer.' 
  },
  { 
    id: 'judge_accuracy', 
    name: 'Factual Accuracy (LLM Judge)', 
    type: 'llm_judge', 
    description: 'Uses an advanced LLM to grade if the answer is factually correct based solely on the provided context.',
    prompt: 'Evaluate the factual accuracy of the provided answer based on the context. Return a score from 0.0 to 1.0.'
  },
  { 
    id: 'judge_toxicity', 
    name: 'Toxicity Score (LLM Judge)', 
    type: 'llm_judge', 
    description: 'Uses an LLM to scan the output for harmful, biased, or toxic language.',
    prompt: 'Analyze the text and return a toxicity score from 0.0 (completely safe) to 1.0 (highly toxic/abusive).'
  },
  { 
    id: 'judge_conciseness', 
    name: 'Conciseness (LLM Judge)', 
    type: 'llm_judge', 
    description: 'Uses an LLM to evaluate if the answer is direct and free of unnecessary fluff.',
    prompt: 'Score the conciseness of this text from 0.0 (rambling/verbose) to 1.0 (highly concise and direct).'
  }
];

export default function AddMetricModal({ isOpen, onClose, onSuccess }: AddMetricModalProps) {
  // State only needs to track which ID from the catalog they chose
  const [selectedId, setSelectedId] = useState<string>(METRIC_CATALOG[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find the full metric details based on the selected ID
  const activeMetric = METRIC_CATALOG.find(m => m.id === selectedId)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Auto-build the JSON config if it's an LLM Judge
    const config = activeMetric.type === 'llm_judge' ? { prompt: activeMetric.prompt } : {};

    try {
      const newMetric = await metricsApi.create({
        name: activeMetric.name,
        metric_type: activeMetric.type,
        description: activeMetric.description,
        config
      });

      onSuccess(newMetric);
      
      // Reset and close
      setSelectedId(METRIC_CATALOG[0].id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create metric.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Add Metric to Workspace</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

          {/* Catalog Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Select from Library</label>
            <select 
              value={selectedId} 
              onChange={(e) => setSelectedId(e.target.value)} 
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer font-medium"
            >
              {METRIC_CATALOG.map(metric => (
                <option key={metric.id} value={metric.id} className="bg-[#171717]">
                  {metric.name}
                </option>
              ))}
            </select>
          </div>

          {/* Read-Only Preview Card */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                {activeMetric.description}
              </p>
            </div>

            {/* Display the prompt if it is an LLM Judge */}
            {activeMetric.type === 'llm_judge' && activeMetric.prompt && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Evaluation Prompt (Read-Only)</span>
                <p className="text-sm font-mono text-gray-400 mt-1 bg-black/30 p-2 rounded border border-white/5">
                  "{activeMetric.prompt}"
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              {isSubmitting ? 'Adding...' : 'Add to Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}