import { useEffect, useState } from 'react';
import { evaluationsApi, type Evaluation } from '../api/evaluationsApi';
import { modelsApi, type AIModel } from '../api/modelsApi';
import { datasetsApi, type Dataset } from '../api/datasetsApi';
import RunEvaluationModal from '../components/evaluations/RunEvaluationModal';
import EvaluationDetailsModal from '../components/evaluations/EvaluationDetailsModal';

export default function EvaluationsPage() {
  // Data State
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [evalToView, setEvalToView] = useState<Evaluation | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
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
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Smart Polling: Refresh list every 3s if any evaluation is 'running' or 'pending'
  useEffect(() => {
    const hasRunning = evaluations.some(e => e.status === 'running' || e.status === 'pending');
    if (!hasRunning) return;

    const interval = setInterval(async () => {
      try {
        const freshEvals = await evaluationsApi.getAll();
        setEvaluations(freshEvals);
      } catch (e) {
        console.error("Failed to poll evaluations");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [evaluations]);

  // 3. Handlers
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete evaluation "${name}"?`)) {
      try {
        await evaluationsApi.delete(id);
        setEvaluations(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const handleRunSuccess = (newEval: Evaluation) => {
    // Add the new evaluation to the top of the list so the user sees it immediately
    setEvaluations(prev => [newEval, ...prev]);
  };

  // 4. UI Helpers
  const getModelName = (id: string) => models.find(m => m.id === id)?.name || 'Unknown Model';
  const getDatasetName = (id: string) => datasets.find(d => d.id === id)?.name || 'Unknown Dataset';

  const renderStatus = (status: string) => {
    switch(status) {
      case 'completed':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Completed</span>;
      case 'running':
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></div>
            Running
          </span>
        );
      case 'failed':
        return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Failed</span>;
      default:
        return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      {/* Header Section */}
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Evaluations</h1>
          <p className="text-sm text-gray-400">Run and monitor tests across your models and datasets.</p>
        </div>
        <button 
          onClick={() => setIsRunModalOpen(true)}
          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Run New Evaluation
        </button>
      </div>

      {/* Main Content Area: Grid Layout */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading evaluations...</div>
      ) : evaluations.length === 0 ? (
        <div className="text-center py-12 border border-white/5 bg-white/[0.02] rounded-2xl">
          <p className="text-gray-400 text-sm">No evaluations found. Click the button above to start your first test!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evaluations.map((evalItem) => (
            <div key={evalItem.id} className="bg-[#171717] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col h-full relative group shadow-lg">
              
              {/* Card Header: Name and Status */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-white truncate pr-4" title={evalItem.name}>
                  {evalItem.name}
                </h3>
                {renderStatus(evalItem.status)}
              </div>

              {/* Card Body: Model and Dataset Context */}
              <div className="space-y-3 mb-6 flex-1">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Model</p>
                  <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    {getModelName(evalItem.model_id)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Dataset</p>
                  <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    {getDatasetName(evalItem.dataset_id)}
                  </p>
                </div>
              </div>

              {/* Score Display (Visible only if completed) */}
              {evalItem.status === 'completed' && (
                <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-400">Aggregate Score</span>
                  <span className="text-2xl font-bold text-white">
                    {(evalItem.overall_score * 100).toFixed(1)}<span className="text-sm text-gray-500">%</span>
                  </span>
                </div>
              )}

              {/* Card Footer: Date and Actions */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                <span className="text-xs text-gray-600">
                  {new Date(evalItem.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDelete(evalItem.id, evalItem.name)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete Evaluation"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setEvalToView(evalItem)}
                    disabled={evalItem.status !== 'completed'} 
                    className="px-2.5 py-1 text-[10px] font-medium bg-white/10 hover:bg-white/20 text-white rounded transition-colors disabled:opacity-30 disabled:hover:bg-white/10"
                  >
                    View Details
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

     
      <RunEvaluationModal 
        isOpen={isRunModalOpen} 
        onClose={() => setIsRunModalOpen(false)} 
        onSuccess={handleRunSuccess} 
      />
      <EvaluationDetailsModal evaluation={evalToView} isOpen={evalToView !== null} onClose={() => setEvalToView(null)} />
      
    </div>
  );
}