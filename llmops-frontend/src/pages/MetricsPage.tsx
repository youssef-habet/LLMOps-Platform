import { useEffect, useState } from 'react';
import { metricsApi, type Metric } from '../api/metricsApi';
import AddMetricModal from '../components/metrics/AddMetricModal';
import DeleteMetricModal from '../components/metrics/DeleteMetricModal';
import EditMetricModal from '../components/metrics/EditMetricModal';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<Metric | null>(null);
  const [metricToEdit, setMetricToEdit] = useState<Metric | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await metricsApi.getAll();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuccess = (newMetric: Metric) => {
    setMetrics(prev => [newMetric, ...prev]);
  };
  const handleEditSuccess = (updatedMetric: Metric) => {
    setMetrics(prev => prev.map(m => m.id === updatedMetric.id ? updatedMetric : m));
  };
  const handleDeleteSuccess = (deletedId: string) => {
    setMetrics(prev => prev.filter(m => m.id !== deletedId));
  };

  // --- SPLIT THE DATA ---
  const defaultMetrics = metrics.filter(m => m.category !== 'custom');
  const customMetrics = metrics.filter(m => m.category === 'custom');

  return (
    <div className="max-w-6xl mx-auto space-y-10 relative pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Metric Management</h1>
          <p className="text-sm text-gray-400">Define grading rubrics and LLM-as-a-Judge configurations.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Custom Metric
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading metrics...</div>
      ) : (
        <>
          {/* SECTION 1: CUSTOM METRICS (Editable & Deletable) */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Custom Judge Metrics
            </h2>
            
            {customMetrics.length === 0 ? (
              <div className="bg-[#171717] border border-white/5 rounded-xl p-8 text-center text-gray-500 text-sm">
                You haven't created any custom grading rubrics yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customMetrics.map((metric) => (
                  <div key={metric.id} className="bg-[#171717] border border-purple-500/20 rounded-xl p-5 hover:border-purple-500/40 transition-all flex flex-col h-full shadow-sm relative group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-sm pr-4">{metric.name}</h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {metric.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-4 flex-1 leading-relaxed">{metric.description}</p>

                    <div className="mb-4 bg-black/40 p-3 rounded-lg border border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Grading Rubric</p>
                      <p className="text-xs text-gray-300 font-mono italic line-clamp-3">"{metric.custom_prompt}"</p>
                    </div>

                    {/* Action Bar (Only for Custom Metrics) */}
                    <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                      <button 
                        onClick={() => setMetricToEdit(metric)}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Edit Metric"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => setMetricToDelete(metric)} 
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete Metric"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: DEFAULT METRICS (System Locked) */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              System Default Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
              {defaultMetrics.map((metric) => (
                <div key={metric.id} className="bg-[#111] border border-white/5 rounded-xl p-5 flex flex-col h-full shadow-sm">
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white text-sm pr-4">{metric.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                      metric.category === 'nlp' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {metric.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 flex-1 leading-relaxed">{metric.description}</p>
                  
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       System-locked metric
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </>
      )}

      {/* MODALS */}
      <AddMetricModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleAddSuccess} 
      />

      <DeleteMetricModal 
        metric={metricToDelete}
        isOpen={metricToDelete !== null}
        onClose={() => setMetricToDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
      <EditMetricModal 
        metric={metricToEdit} 
        isOpen={metricToEdit !== null} 
        onClose={() => setMetricToEdit(null)} 
        onSuccess={handleEditSuccess} 
      />
      
    </div>
  );
}