import React, { useState } from 'react';
import { metricsApi, type Metric } from '../../api/metricsApi';

interface DeleteMetricModalProps {
  metric: Metric | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export default function DeleteMetricModal({ metric, isOpen, onClose, onSuccess }: DeleteMetricModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !metric) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await metricsApi.delete(metric.id);
      onSuccess(metric.id);
      onClose();
    } catch (err: any) {
      setError("Failed to delete metric. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
        
        {/* Warning Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-white">Delete Custom Metric</h2>
            <p className="text-sm text-gray-400 mt-1">
              Are you sure you want to delete <span className="text-gray-200 font-medium">"{metric.name}"</span>? 
            </p>
            <p className="text-xs text-red-400 mt-2">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 text-xs px-3 py-2 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        
      </div>
    </div>
  );
}