import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { addModel } from '../../store/slices/modelSlice';
import { modelsApi } from '../../api/modelsApi';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddModelModal({ isOpen, onClose }: AddModelModalProps) {
  const dispatch = useAppDispatch();
  
  const [mode, setMode] = useState<'standard' | 'custom'>('standard');
  const [supportedProviders, setSupportedProviders] = useState<Record<string, string[]>>({});
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [provider, setProvider] = useState(''); 
  const [version, setVersion] = useState(''); 
  
  // Custom API State
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Params State
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [topP, setTopP] = useState(1.0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingProviders(true);
      modelsApi.getAvailable()
        .then((data) => {
          setSupportedProviders(data);
          const firstProvider = Object.keys(data)[0];
          if (firstProvider && mode === 'standard') {
            setProvider(firstProvider);
            setVersion(data[firstProvider][0]);
          }
        })
        .catch(() => setError("Failed to load available models."))
        .finally(() => setIsLoadingProviders(false));

      // Reset
      setName('');
      setMode('standard');
      setBaseUrl('');
      setApiKey('');
      setTemperature(0.7);
      setMaxTokens(1000);
      setTopP(1.0);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'standard' && Object.keys(supportedProviders).length > 0) {
      const firstProvider = Object.keys(supportedProviders)[0];
      setProvider(firstProvider);
      setVersion(supportedProviders[firstProvider][0]);
    } else if (mode === 'custom') {
      // Force the provider to "Custom" so the backend knows to use the Universal Router
      setProvider('Custom');
      setVersion('');
    }
  }, [mode, supportedProviders]);

  const handleProviderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    setVersion(supportedProviders[newProvider][0]); 
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newModel = await modelsApi.create({
        name, 
        provider, 
        version, 
        temperature, 
        max_tokens: maxTokens, 
        top_p: topP,
        endpoint_url: mode === 'custom' ? baseUrl : undefined, // SEND TO DB
        api_key_ref: mode === 'custom' ? apiKey : undefined    // SEND TO DB
      });
      dispatch(addModel(newModel));
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save model.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-semibold text-white">Add Model to Workspace</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {isLoadingProviders ? (
          <div className="p-12 text-center text-gray-500 text-sm">Fetching available models...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

            {/* Creation Mode Toggle */}
            <div className="flex p-1 bg-black/40 rounded-lg border border-white/5">
              <button type="button" onClick={() => setMode('standard')} className={`flex-1 text-sm py-1.5 rounded-md transition-all font-medium ${mode === 'standard' ? 'bg-[#2a2a2a] text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                Standard
              </button>
              <button type="button" onClick={() => setMode('custom')} className={`flex-1 text-sm py-1.5 rounded-md transition-all font-medium ${mode === 'custom' ? 'bg-[#2a2a2a] text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
                Custom Setup
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Display Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} placeholder="e.g. My Local Llama 3" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30" />
              </div>

              {/* Standard Mode Inputs */}
              {mode === 'standard' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Provider</label>
                    <select value={provider} onChange={handleProviderSelect} disabled={isSubmitting} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white appearance-none cursor-pointer">
                      {Object.keys(supportedProviders).map(prov => <option key={prov} value={prov} className="bg-[#171717]">{prov}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Version</label>
                    <select value={version} onChange={(e) => setVersion(e.target.value)} disabled={isSubmitting} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-sm appearance-none cursor-pointer">
                      {provider && supportedProviders[provider]?.map(ver => <option key={ver} value={ver} className="bg-[#171717]">{ver}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                /* Custom Mode Inputs */
                <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Base URL</label>
                    <input type="url" required value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} disabled={isSubmitting} placeholder="http://localhost:11434/v1" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Model ID (Exact String)</label>
                    <input type="text" required value={version} onChange={(e) => setVersion(e.target.value)} disabled={isSubmitting} placeholder="llama3-8b" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">API Key <span className="text-gray-500 font-normal">(Optional for Local)</span></label>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={isSubmitting} placeholder="Leave blank if local" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 font-mono" />
                  </div>
                </div>
              )}
            </div>

            <hr className="border-white/10" />

            {/* Runtime Parameters */}
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
              <button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium min-w-[120px] flex justify-center">
                {isSubmitting ? 'Saving...' : 'Add Model'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}