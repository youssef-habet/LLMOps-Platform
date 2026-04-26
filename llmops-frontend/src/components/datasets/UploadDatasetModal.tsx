import React, { useState, useRef } from 'react';
import { datasetsApi, type Dataset } from '../../api/datasetsApi';

interface UploadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDataset: Dataset) => void;
}

export default function UploadDatasetModal({ isOpen, onClose, onUploadSuccess }: UploadDatasetModalProps) {
  const [name, setName] = useState('');
  const [taskType, setTaskType] = useState('QA');
  const [file, setFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // Package the text data and the physical file together
    const formData = new FormData();
    formData.append('name', name);
    formData.append('task_type', taskType);
    formData.append('file', file);

    try {
      const newDataset = await datasetsApi.upload(formData);
      onUploadSuccess(newDataset); // Send the new dataset back to the main page
      
      // Reset form
      setName('');
      setTaskType('QA');
      setFile(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload dataset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Upload Dataset</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-white transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Dataset Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} disabled={isSubmitting} placeholder="e.g. Finance Q&A V1" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 disabled:opacity-50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Task Type</label>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} disabled={isSubmitting} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-white/30 disabled:opacity-50 appearance-none cursor-pointer">
              <option value="QA" className="bg-[#171717]">Question Answering (QA)</option>
              <option value="Summarization" className="bg-[#171717]">Summarization</option>
              <option value="Classification" className="bg-[#171717]">Classification</option>
              <option value="RAG" className="bg-[#171717]">RAG Evaluation</option>
            </select>
          </div>

          {/* Custom File Upload UI */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Upload File (CSV or JSON)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/10 hover:border-white/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-black/20"
            >
              <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-300">
                {file ? file.name : "Click to select a file"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Max file size: 50MB"}
              </span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              accept=".csv,.json"
              className="hidden" 
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium min-w-[120px] flex justify-center disabled:opacity-70">
              {isSubmitting ? 'Uploading...' : 'Upload Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}