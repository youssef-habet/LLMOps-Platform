import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { datasetsApi, type Dataset } from '../api/datasetsApi';
import { evaluationsApi, type Evaluation } from '../api/evaluationsApi';
import { experimentsApi, type Experiment } from '../api/experimentsApi';
import { metricsApi, type Metric } from '../api/metricsApi';
import { modelsApi, type AIModel } from '../api/modelsApi';
import { useAuth } from '../auth/useAuth';

type DashboardData = {
  models: AIModel[];
  datasets: Dataset[];
  metrics: Metric[];
  evaluations: Evaluation[];
  experiments: Experiment[];
};

const emptyData: DashboardData = {
  models: [],
  datasets: [],
  metrics: [],
  evaluations: [],
  experiments: [],
};

const statusStyles = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  running: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  pending: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [models, datasets, metrics, evaluations, experiments] = await Promise.all([
          modelsApi.getAll(),
          datasetsApi.getAll(),
          metricsApi.getAll(),
          evaluationsApi.getAll(),
          experimentsApi.getAll(),
        ]);
        setData({ models, datasets, metrics, evaluations, experiments });
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const completedRuns =
    data.evaluations.filter((item) => item.status === 'completed').length +
    data.experiments.filter((item) => item.status === 'completed').length;

  const runningRuns =
    data.evaluations.filter((item) => item.status === 'running').length +
    data.experiments.filter((item) => item.status === 'running').length;

  const latestActivity = useMemo(
    () =>
      [
        ...data.evaluations.map((item) => ({
          id: item.id,
          name: item.name,
          type: 'Evaluation',
          status: item.status,
          created_at: item.created_at,
          path: '/evaluations',
        })),
        ...data.experiments.map((item) => ({
          id: item.id,
          name: item.name,
          type: 'Experiment',
          status: item.status,
          created_at: item.created_at,
          path: item.status === 'completed' ? `/experiments/${item.id}` : '/experiments',
        })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6),
    [data.evaluations, data.experiments]
  );

  const bestExperiment = data.experiments
    .filter((item) => item.status === 'completed')
    .sort((a, b) => b.overall_score - a.overall_score)[0];

  const cards = [
    { label: 'Models', value: data.models.length, detail: 'configured LLMs', path: '/models', color: 'bg-blue-500' },
    { label: 'Datasets', value: data.datasets.length, detail: 'test sources', path: '/datasets', color: 'bg-purple-500' },
    { label: 'Metrics', value: data.metrics.length, detail: 'judge rubrics', path: '/metrics', color: 'bg-orange-500' },
    { label: 'Running', value: runningRuns, detail: 'active jobs', path: '/experiments', color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      <section className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {user?.full_name || user?.email || 'Your workspace'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">Review your LLMOps assets, recent runs, and next actions.</p>
        </div>
        <Link
          to="/experiments"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-200"
        >
          New experiment
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.path} className="rounded-xl border border-white/10 bg-[#171717] p-5 transition-colors hover:border-white/20">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-400">{card.label}</p>
              <span className={`h-2 w-2 rounded-full ${card.color}`} />
            </div>
            <p className="text-3xl font-semibold text-white">{isLoading ? '-' : card.value}</p>
            <p className="mt-2 text-xs text-gray-500">{card.detail}</p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
          <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Last activities</h2>
              <p className="mt-1 text-xs text-gray-500">{latestActivity.length} recent evaluations and experiments</p>
            </div>
            <Link to="/evaluations" className="text-xs font-medium text-gray-400 hover:text-white">
              Open runs
            </Link>
          </div>

          {latestActivity.length === 0 ? (
            <div className="rounded-lg border border-white/5 bg-black/20 p-8 text-center text-sm text-gray-500">
              No activity yet. Create an evaluation or experiment to start tracking results.
            </div>
          ) : (
            <div className="space-y-3">
              {latestActivity.map((activity) => (
                <Link key={`${activity.type}-${activity.id}`} to={activity.path} className="block rounded-lg border border-white/5 bg-black/20 p-4 transition-colors hover:bg-white/[0.04]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{activity.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{activity.type} · {formatDate(activity.created_at)}</p>
                    </div>
                    <span className={`shrink-0 rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${statusStyles[activity.status]}`}>
                      {activity.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
            <p className="text-sm text-gray-400">Best experiment</p>
            <p className="mt-2 truncate text-lg font-semibold text-white">{bestExperiment?.name || 'No completed experiment'}</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-4xl font-semibold text-white">{Math.round(bestExperiment?.overall_score || 0)}</p>
                <p className="text-xs text-gray-500">overall score</p>
              </div>
              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {completedRuns} completed
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#171717] p-5">
            <h2 className="text-lg font-semibold text-white">Next actions</h2>
            <div className="mt-4 space-y-2">
              {[
                ['Register model', '/models'],
                ['Upload dataset', '/datasets'],
                ['Define metrics', '/metrics'],
                ['Launch comparison', '/experiments'],
              ].map(([label, path]) => (
                <Link key={label} to={path} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white">
                  {label}
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
