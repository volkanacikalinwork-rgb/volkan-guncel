import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Projects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] })
  });

  const filtered = projects.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Projeler" subtitle={`${projects.length} proje`} action="Yeni Proje" onAction={() => window.location.href = '/projects/new'} />

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Proje ara..." className="pl-9" />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz proje yok</p>
            <Link to="/projects/new"><Button size="sm" className="mt-3 gradient-primary text-white border-0">İlk Projeyi Ekle</Button></Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Proje</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Şehir</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Geliştirici</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Fiyat Aralığı</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Bitiş</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Durum</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.main_image ? (
                          <img src={p.main_image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <p className="font-medium text-foreground">{p.title}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground capitalize">{p.city}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">{p.developer || '-'}</td>
                    <td className="px-3 py-3.5 font-medium text-foreground text-xs">
                      {p.min_price ? `${p.currency || 'USD'} ${p.min_price.toLocaleString()} – ${p.max_price?.toLocaleString() || '...'}` : '-'}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground text-xs">
                      {p.completion_date ? format(new Date(p.completion_date), 'MMM yyyy') : '-'}
                    </td>
                    <td className="px-3 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/projects/${p.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                        </Link>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm('Projeyi silmek istediğinizden emin misiniz?')) deleteMutation.mutate(p.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
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