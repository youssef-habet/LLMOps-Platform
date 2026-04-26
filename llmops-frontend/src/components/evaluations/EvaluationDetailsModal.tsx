import { type Evaluation } from '../../api/evaluationsApi';

interface EvaluationDetailsModalProps {
  evaluation: Evaluation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EvaluationDetailsModal({ evaluation, isOpen, onClose }: EvaluationDetailsModalProps) {
  if (!isOpen || !evaluation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="animate-slide-up bg-[#171717] border border-white/10 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Evaluation Report: {evaluation.name}</h2>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-400">Aggregate Score: <span className="text-white font-bold">{(evaluation.overall_score * 100).toFixed(1)}%</span></span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-auto bg-black/40 p-6 relative">
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
                    // Calculate if this specific row passed (average score > 0.5)
                    const scores = Object.values(row.scores) as number[];
                    const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
                    const isPass = avgScore > 0.5;

                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] group">
                        <td className="p-4 text-xs text-gray-500 text-center font-mono align-top">{row.row}</td>
                        <td className="p-4 text-sm text-gray-300 align-top break-words">{row.input}</td>
                        <td className="p-4 text-sm text-blue-400 align-top break-words font-medium">{row.expected}</td>
                        <td className="p-4 text-sm text-gray-300 align-top break-words">
                          <div className={`p-2 rounded border ${isPass ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100' : 'border-red-500/20 bg-red-500/5 text-red-100'}`}>
                            {row.output}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <div className="space-y-1.5">
                            {Object.entries(row.scores).map(([metric, val]: [string, any]) => (
                              <div key={metric} className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 capitalize">{metric.replace('_', ' ')}</span>
                                <span className={`font-mono font-bold ${val > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {val}
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