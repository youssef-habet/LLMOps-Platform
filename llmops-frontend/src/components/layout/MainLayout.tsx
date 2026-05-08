import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 bg-[#171717] border border-white/10  transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
