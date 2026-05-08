import React, { useState, useEffect } from 'react';
import { type Experiment } from '../../api/experimentsApi';

interface ExperimentDashboardModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperimentDashboardModal({ experiment, isOpen, onClose }: ExperimentDashboardModalProps) {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  // Reset views when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedModelId(null);
      setShowSetup(false);
    }
  }, [isOpen]);

  if (!isOpen || !experiment || !experiment.results) return null;

  // Convert the dictionary into a sorted array for the leaderboard
  const modelRuns = Object.entries(experiment.results)
    .map(([modelId, data]: [string, any]) => ({ modelId, ...data }))
    .sort((a, b) => b.overall_score - a.overall_score);

  const selectedRun = selectedModelId ? modelRuns.find(r => r.modelId === selectedModelId) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-hidden">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col h-[85vh] my-8">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-start bg-black/40 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{experiment.name}</h2>
            <div className="flex gap-4 text-sm font-mono">
              <span className="text-gray-400">Models Tracked: <span className="text-white">{modelRuns.length}</span></span>
              <span className="text-gray-400">Grand Average: <span className="text-emerald-400">{(experiment.overall_score * 100).toFixed(1)}%</span></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSetup(!showSetup)} 
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors border ${showSetup ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'}`}
            >
              {showSetup ? 'Hide Setup Details' : 'View Setup Details'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-lg transition-colors">✕</button>
          </div>
        </div>

        {/* SETUP DETAILS DROPDOWN */}
        {showSetup && (
          <div className="px-8 py-5 bg-black/60 border-b border-white/10 grid grid-cols-3 gap-6 shrink-0 animate-fade-in">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase tracking-widest mb-1">Target Dataset ID</span>
              <span className="text-gray-300 font-mono text-sm">{experiment.dataset_id}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase tracking-widest mb-1">Models Compared</span>
              <span className="text-gray-300 font-mono text-sm">{experiment.model_ids.length} Models Linked</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase tracking-widest mb-1">Evaluation Metrics</span>
              <span className="text-gray-300 font-mono text-sm">{experiment.metrics.length} Metrics Active</span>
            </div>
          </div>
        )}

        {/* SCROLLABLE BODY */}
        <div className="p-8 overflow-y-auto flex-1">
          
          {!selectedRun ? (
            /* --- LEADERBOARD VIEW --- */
            <>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Model Leaderboard (Click a model for details)</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {modelRuns.map((run, index) => {
                  const params = run.metadata.parameters;
                  const timestamp = new Date(run.metadata.timestamp).toLocaleString();

                  return (
                    <div 
                      key={run.modelId} 
                      onClick={() => setSelectedModelId(run.modelId)}
                      className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden relative group hover:border-purple-500/40 cursor-pointer transition-all shadow-lg"
                    >
                      <div className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold rounded-bl-lg z-10 ${index === 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/10 text-gray-400'}`}>
                        {index === 0 ? '🏆 1st Place' : `#${index + 1}`}
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-end mb-6">
                          <div>
                            <h4 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{run.model_name}</h4>
                            <p className="text-[10px] text-gray-500 font-mono">Execution Timestamp: {timestamp}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-4xl font-black tracking-tighter ${index === 0 ? 'text-amber-400' : 'text-white'}`}>
                              {(run.overall_score * 100).toFixed(1)}<span className="text-xl text-gray-500">%</span>
                            </span>
                          </div>
                        </div>

                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Hyperparameters</p>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <div className="text-[10px] text-gray-500 mb-1">Temperature</div>
                              <div className="text-sm text-white font-mono">{params.temperature.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 mb-1">Provider</div>
                              <div className="text-sm text-white font-mono">{params.provider}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 mb-1">Max Tokens</div>
                              <div className="text-sm text-white font-mono">{params.max_tokens}</div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-purple-400 group-hover:text-purple-300 font-medium flex justify-center items-center gap-1">
                          View Row-by-Row Evaluation <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* --- ROW-BY-ROW DETAILS VIEW --- */
            <div className="animate-fade-in space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <button 
                    onClick={() => setSelectedModelId(null)} 
                    className="text-sm font-medium text-gray-400 hover:text-white flex items-center gap-2 mb-2 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Leaderboard
                  </button>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    {selectedRun.model_name} <span className="text-gray-500 font-normal text-base">| Evaluation Breakdown</span>
                  </h3>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Model Aggregate</div>
                   <span className="text-3xl font-black text-white">{(selectedRun.overall_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-4">
                {selectedRun.rows.map((row: any, i: number) => (
                  <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 shadow-sm">
                    
                    {/* Row Header & Metric Scores */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-md border border-white/5">Test Row {row.row}</span>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {Object.entries(row.scores).map(([metric, score]: [string, any]) => {
                          const numScore = parseFloat(score);
                          const isGood = numScore >= 0.8;
                          const isBad = numScore <= 0.4;
                          return (
                            <span key={metric} className="text-[10px] font-mono px-2 py-1 rounded bg-black/40 border border-white/5 text-gray-300 flex items-center gap-1.5">
                              {metric}: 
                              <span className={`font-bold ${isGood ? 'text-emerald-400' : isBad ? 'text-red-400' : 'text-amber-400'}`}>
                                {numScore.toFixed(2)}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Data Comparison Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Input / User Prompt</span>
                        <div className="text-gray-300 font-mono text-xs p-3 bg-black/40 rounded-lg border border-white/5 whitespace-pre-wrap max-h-40 overflow-y-auto">{row.input}</div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Expected Output</span>
                        <div className="text-gray-300 font-mono text-xs p-3 bg-black/40 rounded-lg border border-white/5 whitespace-pre-wrap max-h-40 overflow-y-auto">{row.expected}</div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold flex items-center gap-1">
                           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg>
                           Actual Output
                        </span>
                        <div className="text-white font-mono text-xs p-3 bg-[#111] rounded-lg border border-purple-500/30 whitespace-pre-wrap max-h-40 overflow-y-auto shadow-inner">{row.output}</div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}