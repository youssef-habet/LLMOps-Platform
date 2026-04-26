import  { useState, useEffect } from 'react';
import { datasetsApi, type Dataset } from '../../api/datasetsApi';

interface VisualizeDatasetModalProps {
  dataset: Dataset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VisualizeDatasetModal({ dataset, isOpen, onClose }: VisualizeDatasetModalProps) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && dataset) {
      setIsLoading(true);
      setError(null);
      datasetsApi.getPreview(dataset.id)
        .then(data => setPreviewData(data))
        .catch(() => setError("Failed to load dataset preview."))
        .finally(() => setIsLoading(false));
    } else {
      setPreviewData(null);
    }
  }, [isOpen, dataset]);

  if (!isOpen || !dataset) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Data Preview 
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-gray-300 uppercase">.{dataset.file_ext || 'csv'}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">Viewing "{dataset.name}" (First 50 records)</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-black/40 p-6 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">Parsing dataset...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400 text-sm">{error}</div>
          ) : previewData ? (
            
            previewData.type === 'json' ? (
              /* --- JSON RENDERER --- */
              <pre className="text-xs font-mono text-gray-300 bg-[#111] p-4 rounded-xl border border-white/5 overflow-auto shadow-inner">
                <code>{JSON.stringify(previewData.data, null, 2)}</code>
              </pre>
            ) : (
              /* --- CSV RENDERER --- */
              <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[#171717]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {previewData.columns?.map((col: string, idx: number) => (
                          <th key={idx} className="p-3 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewData.rows?.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-white/[0.02]">
                          {previewData.columns?.map((col: string, cIdx: number) => (
                            <td key={cIdx} className="p-3 text-sm text-gray-300 whitespace-nowrap truncate max-w-xs" title={row[col]}>
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )

          ) : null}
        </div>
      </div>
    </div>
  );
}