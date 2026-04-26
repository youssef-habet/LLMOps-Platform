import { useEffect, useState } from 'react';
import { metricsApi, type Metric } from '../api/metricsApi';
import AddMetricModal from '../components/metrics/AddMetricModal';
import DeleteMetricModal from '../components/metrics/DeleteMetricModal';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [metricToDelete, setMetricToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
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
    fetchMetrics();
  }, []);

  const handleSuccess = (newMetric: Metric) => {
    setMetrics(prev => [...prev, newMetric]);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setMetricToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!metricToDelete) return;
    
    setIsDeleting(true);
    try {
      await metricsApi.delete(metricToDelete.id);
      setMetrics(prev => prev.filter(m => m.id !== metricToDelete.id));
      setMetricToDelete(null); 
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete metric. Is it currently being used in an evaluation?");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatType = (type: string) => {
    switch(type) {
      case 'exact_match': return 'Exact Match';
      case 'contains': return 'Contains Keyword';
      case 'rouge': return 'ROUGE-L';
      case 'llm_judge': return 'LLM-as-a-Judge';
      default: return type;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Metrics Management</h1>
          <p className="text-sm text-gray-400">Define evaluation metrics to assess model performance.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Add Metric
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="pb-3 px-4 w-1/4">Name</th>
              <th className="pb-3 px-4 w-1/6">Type</th>
              <th className="pb-3 px-4 w-1/3">Description</th>
              <th className="pb-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr><td colSpan={4} className="py-12 text-center text-sm text-gray-500">Loading metrics...</td></tr>
            ) : metrics.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-sm text-gray-500">No metrics found.</td></tr>
            ) : (
              metrics.map((metric) => (
                <tr key={metric.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="py-4 px-4 font-medium text-sm text-gray-300 group-hover:text-white">
                    {metric.name}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      metric.metric_type === 'llm_judge' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {formatType(metric.metric_type)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {metric.description}
                  </td>
                  {/* Updated Actions Column with Icon */}
                  <td className="py-4 px-4 flex justify-end">
                    <button 
                      onClick={() => handleDeleteClick(metric.id, metric.name)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Delete Metric"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddMetricModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleSuccess}
      />

      <DeleteMetricModal 
        isOpen={metricToDelete !== null}
        onClose={() => setMetricToDelete(null)}
        onConfirm={confirmDelete}
        metricName={metricToDelete?.name || ''}
        isDeleting={isDeleting}
      />
      
    </div>
  );
}