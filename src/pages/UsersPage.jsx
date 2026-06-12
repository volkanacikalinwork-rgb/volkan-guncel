import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import { Users, Shield, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

const roleConfig = {
  admin: { icon: Shield, color: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Admin' },
  editor: { icon: UserCheck, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'Editör' },
  agent: { icon: Briefcase, color: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Agent' },
  user: { icon: Users, color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Kullanıcı' },
};

export default function UsersPage() {
  const { user } = useAuth();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  if (user?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div>
      <PageHeader title="Kullanıcılar" subtitle={`${users.length} kullanıcı`} />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Kullanıcı</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Rol</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => {
                  const role = roleConfig[u.role] || roleConfig.user;
                  const RoleIcon = role.icon;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {u.full_name?.charAt(0) || u.email?.charAt(0) || '?'}
                          </div>
                          <p className="font-medium text-foreground">{u.full_name || '-'}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">{u.email}</td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${role.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {role.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground text-xs">
                        {u.created_date ? new Date(u.created_date).toLocaleDateString('tr-TR') : '-'}
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
  );
}