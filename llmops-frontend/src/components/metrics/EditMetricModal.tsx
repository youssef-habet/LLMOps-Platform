import React, { useState, useEffect } from 'react';
import { metricsApi, type Metric } from '../../api/metricsApi';

interface EditMetricModalProps {
  metric: Metric | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedMetric: Metric) => void;
}

export default function EditMetricModal({ metric, isOpen, onClose, onSuccess }: EditMetricModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill the form when the modal opens with a metric
  useEffect(() => {
    if (isOpen && metric) {
      setName(metric.name);
      setDescription(metric.description || '');
      setCustomPrompt(metric.custom_prompt || '');
      setError(null);
    }
  }, [isOpen, metric]);

  if (!isOpen || !metric) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedMetric = await metricsApi.update(metric.id, { 
        name, 
        description, 
        custom_prompt: customPrompt 
      });
      onSuccess(updatedMetric);
      onClose();
    } catch (err: any) {
      setError("Failed to update custom metric.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-semibold text-white">Edit Custom Metric</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Metric Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                disabled={isSubmitting}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
              <input 
                type="text" 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                disabled={isSubmitting}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Grading Rubric (Prompt for Judge Model)</label>
              <textarea 
                required 
                value={customPrompt} 
                onChange={e => setCustomPrompt(e.target.value)} 
                disabled={isSubmitting}
                rows={5} 
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-white/30 resize-none" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 shrink-0 border-t border-white/10 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting} 
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium min-w-[120px] flex justify-center"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}