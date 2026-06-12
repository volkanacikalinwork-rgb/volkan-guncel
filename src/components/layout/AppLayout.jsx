import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const { data: settings = [] } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => base44.entities.SiteSettings.list(),
    staleTime: 60000,
  });

  const bgImage = settings.find(s => s.key === 'background_image')?.value;

  return (
    <div className="min-h-screen flex relative">
      {/* Background - only shown if bgImage is set */}
      {bgImage && (
        <>
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          />
          <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />
        </>
      )}

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <TopBar />
        <main className="flex-1 p-6 overflow-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}