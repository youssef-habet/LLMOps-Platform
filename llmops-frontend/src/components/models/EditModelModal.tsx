import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { updateModel } from '../../store/slices/modelSlice';
import { modelsApi, type AIModel } from '../../api/modelsApi';

interface EditModelModalProps {
  model: AIModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditModelModal({ model, isOpen, onClose }: EditModelModalProps) {
  const dispatch = useAppDispatch();
  
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(''); // <-- NEW STATE
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1.0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (model && isOpen) {
      setName(model.name);
      setSystemPrompt(model.system_prompt || ''); // <-- LOAD EXISTING PROMPT
      setTemperature(model.temperature ?? 0.7);
      setMaxTokens(model.max_tokens ?? 1000);
      setTopP(model.top_p ?? 1.0);
      setError(null);
    }
  }, [model, isOpen]);

  if (!isOpen || !model) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedModel = await modelsApi.update(model.id, { 
        name, 
        provider: model.provider, 
        version: model.version, 
        temperature, 
        max_tokens: maxTokens, 
        top_p: topP,
        system_prompt: systemPrompt // <-- SEND UPDATED PROMPT
      });
      dispatch(updateModel(updatedModel));
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update model");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-semibold text-white">Edit Configuration</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Custom Display Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Provider</label>
                <input type="text" value={model.provider} disabled className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Version</label>
                <input type="text" value={model.version} disabled className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-gray-500 font-mono text-sm cursor-not-allowed" />
              </div>
            </div>

            {/* NEW: System Prompt Text Area */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">System Prompt</label>
              <textarea 
                value={systemPrompt} 
                onChange={(e) => setSystemPrompt(e.target.value)} 
                disabled={isSubmitting} 
                rows={4}
                placeholder="Leave blank for default behavior..." 
                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 resize-none font-mono" 
              />
            </div>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">Temperature</label>
                <span className="text-sm text-gray-400 font-mono">{temperature.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="2" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-white h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-300">Top P</label>
                <span className="text-sm text-gray-400 font-mono">{topP.toFixed(2)}</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full accent-white h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Max Tokens</label>
              <input type="number" min="1" max="128000" required value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}