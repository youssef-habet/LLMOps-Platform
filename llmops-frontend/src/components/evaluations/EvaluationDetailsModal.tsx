import React from 'react';
import { type Evaluation } from '../../api/evaluationsApi';
import { type AIModel } from '../../api/modelsApi';
import { type Dataset } from '../../api/datasetsApi';

interface EvaluationDetailsModalProps {
  evaluation: Evaluation | null;
  models: AIModel[];
  datasets: Dataset[];
  isOpen: boolean;
  onClose: () => void;
}

export default function EvaluationDetailsModal({ evaluation, models, datasets, isOpen, onClose }: EvaluationDetailsModalProps) {
  if (!isOpen || !evaluation) return null;

  const model = models.find(m => m.id === evaluation.model_id);
  const dataset = datasets.find(d => d.id === evaluation.dataset_id);
  const timestamp = new Date(evaluation.created_at).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Evaluation Report: {evaluation.name}</h2>
            <div className="text-sm text-gray-500 mt-1 font-mono">Run at: {timestamp}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-lg">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-black/40 p-6 relative space-y-6">
          
          {/* METADATA DASHBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Context Info */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-[#171717] border border-white/5 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Model Name</p>
                <p className="text-sm text-white font-medium">{model?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-1">{model?.provider} / {model?.version}</p>
              </div>
              <div className="bg-[#171717] border border-white/5 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Target Dataset</p>
                <p className="text-sm text-white font-medium">{dataset?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-1">{evaluation.metrics?.length || 0} Metrics Used</p>
              </div>
            </div>

            {/* Hyperparameters */}
            <div className="col-span-1 lg:col-span-2 bg-[#171717] border border-white/5 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">Model Parameters</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Temperature</p>
                  <p className="text-sm text-white font-mono">{model?.temperature?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Top P</p>
                  <p className="text-sm text-white font-mono">{model?.top_p?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Max Tokens</p>
                  <p className="text-sm text-white font-mono">{model?.max_tokens || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[10px] text-gray-400 mb-1">System Prompt</p>
                <p className="text-xs text-gray-500 font-mono italic line-clamp-2">"{model?.system_prompt || 'Default (You are a helpful assistant)'}"</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="h-px bg-white/10 flex-1"></div>
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Row-by-Row Outputs & Scores</span>
             <div className="h-px bg-white/10 flex-1"></div>
          </div>

          {/* TABLE RESULTS */}
          {!evaluation.results || evaluation.results.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No detailed results found.</div>
          ) : (
            <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[#171717]">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4 w-1/4">Input Prompt</th>
                    <th className="p-4 w-1/5">Expected Output</th>
                    <th className="p-4 w-1/3">Actual AI Output</th>
                    <th className="p-4 w-32 text-center">Scores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {evaluation.results.map((row: any, idx: number) => {
                    const scores = Object.values(row.scores) as number[];
                    const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
                    const isPass = avgScore > 0.5;

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] group">
                        <td className="p-4 text-xs text-gray-500 text-center font-mono align-top">{row.row}</td>
                        <td className="p-4 text-sm text-gray-300 align-top break-words">{row.input}</td>
                        <td className="p-4 text-sm text-blue-400 align-top break-words font-medium">{row.expected}</td>
                        <td className="p-4 text-sm text-gray-300 align-top break-words">
                          <div className={`p-3 rounded-lg border ${isPass ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100' : 'border-red-500/20 bg-red-500/5 text-red-100'}`}>
                            {row.output}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="space-y-2">
                            {Object.entries(row.scores).map(([metric, val]: [string, any]) => (
                              <div key={metric} className="flex justify-between items-center text-[10px]">
                                <span className="text-gray-500 capitalize">{metric}</span>
                                <span className={`font-mono font-bold ${val > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {Number(val).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}