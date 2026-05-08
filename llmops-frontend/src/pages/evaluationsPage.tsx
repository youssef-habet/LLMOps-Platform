import { useEffect, useState } from 'react';
import { evaluationsApi, type Evaluation } from '../api/evaluationsApi';
import { modelsApi, type AIModel } from '../api/modelsApi';
import { datasetsApi, type Dataset } from '../api/datasetsApi';
import RunEvaluationModal from '../components/evaluations/RunEvaluationModal';
import EvaluationDetailsModal from '../components/evaluations/EvaluationDetailsModal';
import DeleteEvaluationModal from '../components/evaluations/DeleteEvaluationModal';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [evalToView, setEvalToView] = useState<Evaluation | null>(null);
  const [evalToDelete, setEvalToDelete] = useState<Evaluation | null>(null); 

  const fetchData = async () => {
    try {
      const [evalsData, modelsData, datasetsData] = await Promise.all([
        evaluationsApi.getAll(),
        modelsApi.getAll(),
        datasetsApi.getAll()
      ]);
      setEvaluations(evalsData);
      setModels(modelsData);
      setDatasets(datasetsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
      const evalsData = await evaluationsApi.getAll();
      setEvaluations(evalsData);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerRun = async (id: string) => {
    try {
      setEvaluations(prev => prev.map(e => e.id === id ? { ...e, status: 'running' } : e));
      await evaluationsApi.triggerRun(id);
    } catch (err) {
      alert("Failed to trigger run.");
      fetchData(); 
    }
  };

  // Called when the Delete modal successfully finishes
  const handleDeleteSuccess = (deletedId: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== deletedId));
  };

  const getModel = (id: string) => models.find(m => m.id === id);
  const getDataset = (id: string) => datasets.find(d => d.id === id);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Quick Evaluations</h1>
          <p className="text-sm text-gray-400">Run fast, single-model tests against your datasets.</p>
        </div>
        <button onClick={() => setIsRunModalOpen(true)} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm">
          New Evaluation Draft
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading evaluations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evaluations.map(evalItem => {
            const model = getModel(evalItem.model_id);
            const dataset = getDataset(evalItem.dataset_id);

            return (
              <div key={evalItem.id} className="bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all">
                
                {/* Running Animation Bar */}
                {evalItem.status === 'running' && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3 blur-[2px]" style={{ animation: 'slide 1.5s infinite linear' }}/>
                  </div>
                )}

                {/* Title & Status */}
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-white truncate pr-2">{evalItem.name}</h3>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 ${
                    evalItem.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    evalItem.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    evalItem.status === 'pending' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {evalItem.status}
                  </span>
                </div>

                {/* Info List */}
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">Model</span>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      {model?.name || 'Unknown Model'}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block mb-1">Dataset</span>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      {dataset?.name || 'Unknown Dataset'}
                    </div>
                  </div>
                </div>

                {/* Score Box */}
                <div className="mb-6 bg-[#0f0f0f] rounded-xl p-4 flex items-center justify-between border border-white/5">
                  <span className="text-sm font-medium text-gray-400">Aggregate Score</span>
                  <span className={`text-2xl font-bold font-mono ${evalItem.status === 'completed' ? 'text-white' : 'text-gray-600'}`}>
                    {evalItem.status === 'completed' ? `${(evalItem.overall_score * 100).toFixed(1)}%` : '--'}
                  </span>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  
                  {/* Delete Trash Icon -> OPENS MODAL NOW */}
                  <button onClick={() => setEvalToDelete(evalItem)} className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {/* RUN / RERUN BUTTON */}
                    {(evalItem.status === 'pending' || evalItem.status === 'failed' || evalItem.status === 'completed') && (
                      <button onClick={() => handleTriggerRun(evalItem.id)} className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        {evalItem.status === 'pending' ? 'Run Test' : 'Rerun'}
                      </button>
                    )}

                    <button onClick={() => setEvalToView(evalItem)} disabled={evalItem.status !== 'completed'} className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-30">
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RunEvaluationModal isOpen={isRunModalOpen} onClose={() => setIsRunModalOpen(false)} onSuccess={fetchData} />
      <EvaluationDetailsModal evaluation={evalToView} models={models} datasets={datasets} isOpen={evalToView !== null} onClose={() => setEvalToView(null)} />
      <DeleteEvaluationModal 
        evaluation={evalToDelete} 
        isOpen={evalToDelete !== null} 
        onClose={() => setEvalToDelete(null)} 
        onSuccess={handleDeleteSuccess} 
      />
      <style dangerouslySetInnerHTML={{__html: `@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}} />
    </div>
  );
}