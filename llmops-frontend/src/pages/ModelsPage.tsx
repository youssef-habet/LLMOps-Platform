import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setModels, deleteModel } from '../store/slices/modelSlice';
import { modelsApi, type AIModel } from '../api/modelsApi';
import AddModelModal from '../components/models/AddModelModal';
import EditModelModal from '../components/models/EditModelModal';
import DeleteConfirmModal from '../components/models/DeleteConfirmModal'; 

export default function ModelsPage() {
  const dispatch = useAppDispatch();
  const models = useAppSelector((state) => state.models.models);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modelToEdit, setModelToEdit] = useState<AIModel | null>(null);
  
  // New state for the Delete Modal
  const [modelToDelete, setModelToDelete] = useState<AIModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await modelsApi.getAll();
        dispatch(setModels(data));
      } catch (error) {
        console.error("Failed to fetch models", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, [dispatch]);

  // The new confirmation handler that connects to your custom modal
  const confirmDelete = async () => {
    if (!modelToDelete) return;
    
    setIsDeleting(true);
    try {
      await modelsApi.delete(modelToDelete.id);
      dispatch(deleteModel(modelToDelete.id));
      setModelToDelete(null); // Close the modal on success
    } catch (error) {
      alert("Failed to delete model.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Model Registry</h1>
          <p className="text-sm text-gray-400">Manage LLM configurations and runtime parameters.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Add Model
        </button>
      </div>

      {/* Grid Layout */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading models...</div>
      ) : models.length === 0 ? (
        <div className="text-center py-12 border border-white/5 bg-white/[0.02] rounded-2xl">
          <p className="text-gray-400 text-sm">No models found in your workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((model) => (
            <div key={model.id} className="bg-[#171717] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all flex flex-col h-full relative group shadow-sm">
              
              <div className="flex justify-between items-start mb-3">
                <div className="w-full">
                  <h3 className="font-semibold text-white text-sm truncate" title={model.name}>
                    {model.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider truncate">
                      {model.provider}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 truncate">{model.version}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-3 flex-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Temp</span>
                  <span className="text-gray-300 font-mono">{model.temperature.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Top P</span>
                  <span className="text-gray-300 font-mono">{model.top_p.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Tokens</span>
                  <span className="text-gray-300 font-mono">{model.max_tokens}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end items-center gap-1 mt-auto">
                <button 
                  onClick={() => setModelToEdit(model)}
                  className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                  title="Edit Parameters"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                {/* Updated Delete Button triggers the modal instead of window.confirm */}
                <button 
                  onClick={() => setModelToDelete(model)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  title="Delete Model"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddModelModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditModelModal model={modelToEdit} isOpen={modelToEdit !== null} onClose={() => setModelToEdit(null)} />
      <DeleteConfirmModal 
        isOpen={modelToDelete !== null} 
        modelName={modelToDelete?.name || ''} 
        isDeleting={isDeleting} 
        onClose={() => setModelToDelete(null)} 
        onConfirm={confirmDelete} 
      />
      
    </div>
  );
}