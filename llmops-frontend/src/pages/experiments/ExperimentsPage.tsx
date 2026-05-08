import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { experimentsApi, type Experiment } from '../../api/experimentsApi';
import { modelsApi, type AIModel } from '../../api/modelsApi';
import { datasetsApi, type Dataset } from '../../api/datasetsApi';
import { metricsApi, type Metric } from '../../api/metricsApi';
import CreateExperimentModal from '../../components/experiments/CreateExperimentModal';
import ExperimentDetailsModal from '../../components/experiments/ExperimentDetailsModal';

export default function ExperimentsPage() {
  const navigate = useNavigate();
  
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expDetailsToView, setExpDetailsToView] = useState<Experiment | null>(null);

  const fetchData = async () => {
    try {
      const [expData, modelsData, datasetsData, metricsData] = await Promise.all([
        experimentsApi.getAll(),
        modelsApi.getAll(),
        datasetsApi.getAll(),
        metricsApi.getAll()
      ]);
      setExperiments(expData);
      setModels(modelsData);
      setDatasets(datasetsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll the backend every 5 seconds to update the "running" status animations
    const interval = setInterval(async () => {
      const expData = await experimentsApi.getAll();
      setExperiments(expData);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerRun = async (id: string) => {
    try {
      // Optimistically set to running in the UI so the animation starts immediately
      setExperiments(prev => prev.map(e => e.id === id ? { ...e, status: 'running' } : e));
      await experimentsApi.triggerRun(id);
    } catch (err) {
      alert("Failed to trigger run.");
      fetchData(); 
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this experiment forever?")) {
      await experimentsApi.delete(id);
      setExperiments(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Experiment Tracking</h1>
          <p className="text-sm text-gray-400">Compare multiple models side-by-side and track parameter changes.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm"
        >
          New Experiment
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading experiments...</div>
      ) : experiments.length === 0 ? (
         <div className="text-center py-12 text-gray-500 border border-white/5 rounded-2xl bg-[#171717]">
          No experiments found. Create a draft to start racing models!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {experiments.map(exp => {
            // Formatted Date (e.g., "Apr 28, 04:30 PM")
            const formattedDate = new Date(exp.created_at).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            return (
             <div key={exp.id} className="bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden group hover:border-white/20 transition-colors">
                
                {/* Running Animation Bar */}
                {exp.status === 'running' && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/20 overflow-hidden">
                    <div className="h-full bg-purple-500 w-1/3 blur-[2px]" style={{ animation: 'slide 1.5s infinite linear' }}/>
                  </div>
                )}

                {/* Title & Status Bar */}
                <div className="flex justify-between items-start mb-6">
                  <div className="pr-4">
                    <h3 className="text-lg font-bold text-white truncate">{exp.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formattedDate}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 ${
                    exp.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    exp.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                    exp.status === 'pending' ? 'bg-gray-500/10 text-gray-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {exp.status}
                  </span>
                </div>

                {/* Competitor Count Badge */}
                <div className="space-y-2 mb-6">
                  <div className="text-xs text-gray-400 flex items-center gap-2 bg-black/30 p-2.5 rounded-lg border border-white/5 w-max">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span className="font-semibold text-white">{exp.model_ids.length}</span> Models Competing
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  
                  {/* Left Side: Delete & Config Info */}
                  <div className="flex gap-1.5">
                    <button onClick={() => handleDelete(exp.id)} title="Delete Experiment" className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <button onClick={() => setExpDetailsToView(exp)} title="View Configuration Details" className="text-gray-500 hover:text-white transition-colors p-1.5 rounded hover:bg-white/10">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </div>
                  
                  {/* Right Side: Run & Dashboard Route */}
                  <div className="flex items-center gap-2">
                    {(exp.status === 'pending' || exp.status === 'failed' || exp.status === 'completed') && (
                      <button onClick={() => handleTriggerRun(exp.id)} className="px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        {exp.status === 'pending' ? 'Run Race' : 'Rerun'}
                      </button>
                    )}

                    <button 
                      onClick={() => navigate(`/experiments/${exp.id}`)} 
                      disabled={exp.status !== 'completed'} 
                      className="px-4 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      View Dashboard
                    </button>
                  </div>
                </div>

             </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      <CreateExperimentModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchData} />
      
      <ExperimentDetailsModal 
        experiment={expDetailsToView} 
        isOpen={expDetailsToView !== null} 
        onClose={() => setExpDetailsToView(null)} 
        models={models}
        datasets={datasets}
        metrics={metrics}
      />
      
      {/* GLOBAL STYLES FOR RUNNING ANIMATION */}
      <style dangerouslySetInnerHTML={{__html: `@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}} />
    </div>
  );
}