import { useEffect, useState } from 'react';
import { datasetsApi, type Dataset } from '../api/datasetsApi';
import UploadDatasetModal from '../components/datasets/UploadDatasetModal';
import VisualizeDatasetModal from '../components/datasets/VisualizeDatasetModal';
import DeleteDatasetModal from '../components/datasets/DeleteDatasetModal';

// Helper function to turn raw bytes into readable sizes
const formatBytes = (bytes?: number) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [datasetToView, setDatasetToView] = useState<Dataset | null>(null);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await datasetsApi.getAll();
        setDatasets(data);
      } catch (error) {
        console.error("Failed to fetch datasets", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const handleUploadSuccess = (newDataset: Dataset) => {
    setDatasets(prev => [newDataset, ...prev]);
  };

  const handleDownload = async (dataset: Dataset) => {
    try {
      const url = await datasetsApi.getDownloadUrl(dataset.id);
      window.open(url, '_blank');
    } catch (err) {
      alert("Failed to get download link.");
    }
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    setIsDeleting(true);
    try {
      await datasetsApi.delete(datasetToDelete.id);
      setDatasets(prev => prev.filter(d => d.id !== datasetToDelete.id));
      setDatasetToDelete(null); 
    } catch (err) {
      alert("Failed to delete dataset.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Datasets</h1>
          <p className="text-sm text-gray-400">Manage testing data for your LLM evaluations.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Dataset
        </button>
      </div>

      {/* Compact Grid Layout */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading datasets...</div>
      ) : datasets.length === 0 ? (
        <div className="text-center py-12 border border-white/5 bg-white/[0.02] rounded-2xl">
          <p className="text-gray-400 text-sm">No datasets found. Upload one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="bg-[#171717] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all flex flex-col h-full relative group shadow-sm">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="w-full">
                  <h3 className="font-semibold text-white text-sm truncate" title={dataset.name}>
                    {dataset.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate">
                      {dataset.task_type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body - File Metadata */}
              <div className="space-y-1.5 mb-3 flex-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500">Format</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${dataset.file_ext === 'json' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                    .{dataset.file_ext || 'csv'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">File Size</span>
                  <span className="text-gray-300 font-mono">{formatBytes(dataset.file_size_bytes)}</span>
                </div>
              </div>

              {/* Card Footer - Actions */}
              <div className="pt-3 border-t border-white/5 flex justify-end items-center gap-1 mt-auto">
                <button 
                  onClick={() => setDatasetToView(dataset)} 
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors" 
                  title="Visualize Data"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button 
                  onClick={() => handleDownload(dataset)} 
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors" 
                  title="Download File"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
                <button 
                  onClick={() => setDatasetToDelete(dataset)} 
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" 
                  title="Delete Dataset"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Render the Modals */}
      <UploadDatasetModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUploadSuccess={handleUploadSuccess} />
      <VisualizeDatasetModal dataset={datasetToView} isOpen={datasetToView !== null} onClose={() => setDatasetToView(null)} />
      <DeleteDatasetModal isOpen={datasetToDelete !== null} onClose={() => setDatasetToDelete(null)} onConfirm={confirmDelete} datasetName={datasetToDelete?.name || ''} isDeleting={isDeleting} />
      
    </div>
  );
}