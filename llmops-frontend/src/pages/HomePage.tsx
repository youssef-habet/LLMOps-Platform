import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Get Started Banner */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Get started</h1>
        
        <div className="relative overflow-hidden rounded-2xl bg-gray-900 dark:bg-[#212121] border border-gray-200 dark:border-white/10">
          {/* Subtle gradient background effect to match OpenAI */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-yellow-500/10 pointer-events-none"></div>
          
          <div className="relative p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-6">
              <div className="flex items-center text-gray-200">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
                <span className="font-medium text-sm">Create API keys</span>
              </div>
              <div className="flex items-center text-gray-200">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="font-medium text-sm">Add credits</span>
              </div>
              <div className="flex items-center text-gray-200">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <span className="font-medium text-sm">Build your prompt</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm transition-colors border border-white/10">
                Developer quickstart ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Home Metrics Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Home</h2>
          <button className="text-sm border border-gray-300 dark:border-white/20 dark:text-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Create API keys
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#212121]">
          {/* Card 1 */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col justify-between min-h-[140px]">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total tokens &gt;</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-white">0</div>
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 mt-4 rounded-full overflow-hidden">
              <div className="w-0 h-full bg-pink-500"></div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col justify-between min-h-[140px]">
            <div className="text-sm text-gray-500 dark:text-gray-400">Responses and Chat... &gt;</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-white">0</div>
            <div className="w-full border-t border-dashed border-gray-300 dark:border-gray-600 mt-4"></div>
          </div>

          {/* Card 3 */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col justify-between min-h-[140px]">
            <div className="text-sm text-gray-500 dark:text-gray-400">April spend</div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-white">$0.00</div>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 underline mt-4 hover:text-gray-300">Manage spend alerts</a>
          </div>

          {/* Card 4 (Highlighted) */}
          <div className="p-6 bg-yellow-50 dark:bg-[#3d3314] flex flex-col justify-between min-h-[140px]">
            <div className="text-sm text-yellow-800 dark:text-yellow-500 flex items-center">
              Credit remaining
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-3xl font-semibold text-gray-900 dark:text-white">$0.00</div>
            <button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium py-1.5 px-4 rounded transition-colors w-fit">
              Add credits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}