import { type Evaluation } from '../../api/evaluationsApi';

interface EvaluationComparisonModalProps {
  evaluation: Evaluation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EvaluationComparisonModal({ evaluation, isOpen, onClose }: EvaluationComparisonModalProps) {
  if (!isOpen || !evaluation || !evaluation.results) return null;

  // Convert the dictionary of results into an array so we can map over it and sort it
  const modelRuns = Object.entries(evaluation.results).map(([modelId, data]: [string, any]) => ({
    modelId,
    ...data
  })).sort((a, b) => b.overall_score - a.overall_score); // Sort by highest score!

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col min-h-[50vh] my-8">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-start bg-black/40">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{evaluation.name}</h2>
            <div className="flex gap-4 text-sm font-mono">
              <span className="text-gray-400">Total Models: <span className="text-white">{modelRuns.length}</span></span>
              <span className="text-gray-400">Average Aggregate: <span className="text-emerald-400">{(evaluation.overall_score * 100).toFixed(1)}%</span></span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-lg transition-colors">✕</button>
        </div>

        {/* Model Leaderboard & Metadata */}
        <div className="p-8 space-y-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Model Performance & Parameters</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {modelRuns.map((run, index) => {
              const params = run.metadata.parameters;
              const timestamp = new Date(run.metadata.timestamp).toLocaleString();

              return (
                <div key={run.modelId} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden relative">
                  
                  {/* Rank Badge */}
                  <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${index === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-500'}`}>
                    {index === 0 ? '🏆 Winner' : `#${index + 1}`}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{run.model_name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono">Run at: {timestamp}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-white">{(run.overall_score * 100).toFixed(1)}<span className="text-lg text-gray-500">%</span></span>
                      </div>
                    </div>

                    {/* Metadata Parameters Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Temperature</div>
                        <div className="text-sm text-white font-mono">{params.temperature.toFixed(2)}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Top P</div>
                        <div className="text-sm text-white font-mono">{params.top_p.toFixed(2)}</div>
                      </div>
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Max Tokens</div>
                        <div className="text-sm text-white font-mono">{params.max_tokens}</div>
                      </div>
                    </div>

                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-gray-500 uppercase mb-1">System Prompt Used</div>
                        <div className="text-xs text-gray-400 font-mono italic line-clamp-2">"{params.system_prompt}"</div>
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}