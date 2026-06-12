import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StatCard from '@/components/ui/StatCard';
import { Building2, FolderOpen, Package, FileText, MessageSquare, TrendingUp, Star, Users, Tags } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import StatusBadge from '@/components/ui/StatusBadge';

const COLORS = ['#635bff', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export default function Dashboard() {
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => base44.entities.Property.list() });
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });
  const { data: packages = [] } = useQuery({ queryKey: ['packages'], queryFn: () => base44.entities.Package.list() });
  const { data: posts = [] } = useQuery({ queryKey: ['posts'], queryFn: () => base44.entities.BlogPost.list() });
  const { data: leads = [] } = useQuery({ queryKey: ['leads'], queryFn: () => base44.entities.Lead.list() });
  const { data: propertyTypes = [] } = useQuery({ queryKey: ['property-types'], queryFn: () => base44.entities.PropertyType.list() });

  const activeProperties = properties.filter(p => p.status === 'active').length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const publishedPosts = posts.filter(p => p.status === 'published').length;

  const cityData = Object.entries(
    properties.reduce((acc, p) => { acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value })).slice(0, 6);

  const leadStatusData = [
    { name: 'Yeni', value: leads.filter(l => l.status === 'new').length },
    { name: 'İletişimde', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Nitelikli', value: leads.filter(l => l.status === 'qualified').length },
    { name: 'Kapandı', value: leads.filter(l => l.status === 'closed').length },
  ].filter(d => d.value > 0);

  const recentLeads = [...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-jakarta text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">propertiesforsaleturkey.com içerik yönetimi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Toplam İlan" value={properties.length} icon={Building2} color="violet" />
        <StatCard title="Aktif İlan" value={activeProperties} icon={Star} color="emerald" />
        <StatCard title="Yeni Lead" value={newLeads} icon={MessageSquare} color="rose" />
        <StatCard title="Blog & Haber" value={publishedPosts} icon={FileText} color="cyan" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Projeler" value={projects.length} icon={FolderOpen} color="purple" />
        <StatCard title="Paketler" value={packages.length} icon={Package} color="amber" />
        <StatCard title="Toplam Lead" value={leads.length} icon={Users} color="violet" />
        <StatCard title="İçerik" value={posts.length} icon={TrendingUp} color="emerald" />
        <StatCard title="Mülk Tipleri" value={propertyTypes.length} icon={Tags} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold font-jakarta mb-4 text-foreground">İlan Dağılımı (Şehre Göre)</h2>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#635bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Henüz ilan yok</div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold font-jakarta mb-4 text-foreground">Lead Durumu</h2>
          {leadStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={leadStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                    {leadStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {leadStatusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Henüz lead yok</div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold font-jakarta text-foreground">Son Leads</h2>
          <Link to="/leads" className="text-xs text-primary hover:underline">Tümünü gör →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Henüz lead yok</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Ad Soyad</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Kaynak</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-foreground">{lead.full_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{lead.email}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{lead.source}</td>
                    <td className="py-3"><StatusBadge status={lead.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}