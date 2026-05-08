import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experimentsApi, type Experiment } from '../../api/experimentsApi';
import { datasetsApi, type Dataset } from '../../api/datasetsApi';
import { metricsApi, type Metric } from '../../api/metricsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';

export default function ExperimentDashboardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        experimentsApi.getById(id),
        datasetsApi.getAll(),
        metricsApi.getAll()
      ]).then(([expData, dsData, metricsData]) => {
        setExperiment(expData);
        setDatasets(dsData);
        setMetrics(metricsData);
        setIsLoading(false);
      }).catch(err => {
        console.error("Failed to load dashboard data", err);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading || !experiment || !experiment.results) {
    return <div className="p-20 text-center text-gray-500">Loading comprehensive analytics...</div>;
  }

  // 1. Prepare Data
  const modelRuns = Object.entries(experiment.results)
    .map(([modelId, data]: [string, any]) => ({ modelId, ...data }))
    .sort((a, b) => b.overall_score - a.overall_score);

  const datasetName = datasets.find(d => d.id === experiment.dataset_id)?.name || experiment.dataset_id;
  const formattedTimestamp = new Date(experiment.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  
  const evaluatedMetricNames = modelRuns.length > 0 && modelRuns[0].rows.length > 0
    ? Object.keys(modelRuns[0].rows[0].scores)
    : experiment.metrics.map(mId => metrics.find(m => m.id === mId)?.name || mId);

  // 2. Chart Data
  const barChartData = modelRuns.map(run => ({
    name: run.model_name,
    score: parseFloat((run.overall_score * 100).toFixed(1)),
  }));

  const radarData = evaluatedMetricNames.map(metricName => {
    const entry: any = { subject: metricName };
    modelRuns.forEach(run => {
      const avg = run.rows.reduce((acc: number, row: any) => acc + (row.scores[metricName] || 0), 0) / run.rows.length;
      entry[run.model_name] = parseFloat((avg * 100).toFixed(1));
    });
    return entry;
  });

  // 3. Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Build Headers
    const headers = ["Test Row", "Input Prompt", "Expected Ground Truth"];
    modelRuns.forEach(run => {
      headers.push(`${run.model_name} Output`);
      evaluatedMetricNames.forEach(metric => headers.push(`${run.model_name} [${metric}]`));
    });
    csvContent += headers.join(",") + "\n";

    // Build Rows
    modelRuns[0].rows.forEach((_, rowIndex) => {
      const rowData = [
        rowIndex + 1,
        `"${modelRuns[0].rows[rowIndex].input.replace(/"/g, '""')}"`,
        `"${modelRuns[0].rows[rowIndex].expected.replace(/"/g, '""')}"`
      ];
      
      modelRuns.forEach(run => {
        const output = `"${run.rows[rowIndex].output.replace(/"/g, '""')}"`;
        rowData.push(output);
        evaluatedMetricNames.forEach(metric => {
          const score = run.rows[rowIndex].scores[metric] || 0;
          rowData.push(parseFloat(score).toFixed(2));
        });
      });
      csvContent += rowData.join(",") + "\n";
    });

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Experiment_${experiment.name.replace(/\s+/g, '_')}_Audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b border-white/10 pb-8">
        <div className="space-y-3">
          <button onClick={() => navigate('/experiments')} className="text-sm text-gray-500 hover:text-white flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Experiments
          </button>
          <h1 className="text-4xl font-bold text-white tracking-tight">{experiment.name}</h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
            <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Executed: {formattedTimestamp}</span>
            <span>|</span>
            <span>ID: {experiment.id}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Grand Success Rate</div>
              <div className="text-5xl font-black text-emerald-400">{(experiment.overall_score * 100).toFixed(1)}%</div>
            </div>
            <button 
              onClick={handleExportCSV}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export Full Audit (CSV)
            </button>
        </div>
      </div>

      {/* METADATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Dataset Used</span>
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  </div>
                  <div className="truncate">
                      <div className="text-white font-medium truncate">{datasetName}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">{experiment.dataset_id}</div>
                  </div>
              </div>
            </div>
            <button className="mt-4 text-xs text-blue-400 hover:text-blue-300 text-left font-medium">View Dataset Source →</button>
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-6">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Metrics Active</span>
            <div className="flex flex-wrap gap-2">
                {evaluatedMetricNames.map(mName => (
                    <span key={mName} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-md uppercase">
                      {mName}
                    </span>
                ))}
            </div>
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-6 flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-4">Competitor Breakdown</span>
            <div className="space-y-2 overflow-y-auto pr-2 max-h-24 custom-scrollbar">
                {modelRuns.map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-white/5">
                        <span className="text-white text-xs font-bold">{r.model_name}</span>
                        <span className="text-[9px] text-gray-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">{r.metadata.parameters.provider} | {r.metadata.parameters.version}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* DIAGRAMS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#171717] border border-white/10 rounded-2xl p-8 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Performance Leaderboard (%)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} fillOpacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#171717] border border-white/10 rounded-2xl p-8 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
            Metric Strengths Breakdown
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" stroke="#aaa" fontSize={11} fontWeight="bold" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#444" tick={{ fill: '#666', fontSize: 10 }} />
                {modelRuns.slice(0, 3).map((run, i) => (
                  <Radar key={run.modelId} name={run.model_name} dataKey={run.model_name} stroke={i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#a855f7'} fill={i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#a855f7'} fillOpacity={0.4} strokeWidth={2} />
                ))}
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EXTENDED HYPERPARAMETER SNAPSHOTS */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">Comprehensive Hyperparameter Snapshots</h3>
        <div className="grid grid-cols-1 gap-6">
            {modelRuns.map((run, index) => (
                <div key={run.modelId} className="bg-[#171717] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${index === 0 ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-gray-400'}`}>
                        {index === 0 ? '🏆 Winner' : `Rank #${index + 1}`}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-white pr-20">{run.model_name}</h4>
                      <div className="text-sm text-gray-500 font-mono mt-1">Total Score: {(run.overall_score * 100).toFixed(2)}%</div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-black/40 p-5 rounded-xl border border-white/5">
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Provider API</span>
                            <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{run.metadata.parameters.provider}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Model Version</span>
                            <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">{run.metadata.parameters.version}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Temperature</span>
                            <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">{run.metadata.parameters.temperature?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Max Tokens</span>
                            <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">{run.metadata.parameters.max_tokens || 'Default'}</span>
                        </div>
                        
                        <div className="col-span-2 md:col-span-4 mt-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-2 flex items-center gap-2">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              System Prompt Injected at Runtime
                            </span>
                            <div className="text-xs text-gray-400 font-mono p-4 bg-[#0a0a0a] rounded-lg border border-white/10 shadow-inner">
                                {run.metadata.parameters.system_prompt || <span className="italic opacity-50">No custom system prompt injected...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* DETAILED RESULTS TABLE */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Row-by-Row Deep Dive</h3>
        <div className="bg-[#171717] border border-white/10 rounded-2xl overflow-hidden overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-black/40 text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10">
                        <th className="px-6 py-4 w-16">Row</th>
                        <th className="px-6 py-4 w-[25%]">Inputs & Ground Truth</th>
                        {modelRuns.map(r => (
                            <th key={r.modelId} className="px-6 py-4 border-l border-white/5 min-w-[250px]">
                                <span className="text-white font-bold text-xs">{r.model_name}</span> Response
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {modelRuns[0].rows.map((_: any, rowIndex: number) => (
                        <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-6 align-top font-mono text-gray-500 text-xs">#{rowIndex + 1}</td>
                            <td className="px-6 py-6 align-top">
                                <div className="space-y-5">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-600 block uppercase mb-1">Input Prompt</span>
                                        <p className="text-gray-300 text-xs leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">{modelRuns[0].rows[rowIndex].input}</p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-emerald-600/50 block uppercase mb-1">Expected Output</span>
                                        <p className="text-emerald-500/80 text-xs bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">{modelRuns[0].rows[rowIndex].expected}</p>
                                    </div>
                                </div>
                            </td>
                            {modelRuns.map(run => (
                                <td key={run.modelId} className="px-6 py-6 align-top border-l border-white/5">
                                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-gray-300 font-mono mb-4 leading-relaxed whitespace-pre-wrap">
                                        {run.rows[rowIndex].output}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(run.rows[rowIndex].scores).map(([mName, score]: [string, any]) => {
                                            const numScore = parseFloat(score);
                                            const isGood = numScore >= 0.8;
                                            const isBad = numScore <= 0.4;
                                            return (
                                                <span key={mName} className="text-[9px] px-2 py-1 rounded bg-[#0a0a0a] text-gray-400 border border-white/10 font-mono flex items-center gap-1.5 shadow-sm">
                                                    {mName}: 
                                                    <span className={`font-bold ${isGood ? 'text-emerald-400' : isBad ? 'text-red-400' : 'text-amber-400'}`}>
                                                        {numScore.toFixed(2)}
                                                    </span>
                                                </span>
                                            )
                                        })}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}