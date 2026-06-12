import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Search, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const typeLabels = { blog: '✍️ Blog', news: '📰 Haber', guide: '🗺️ Rehber' };
const typeBadge = { blog: 'bg-violet-50 text-violet-700', news: 'bg-cyan-50 text-cyan-700', guide: 'bg-amber-50 text-amber-700' };

export default function Blog() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || p.type === filterType;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Blog & Haberler" subtitle={`${posts.length} içerik`} action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Başlık ara..." className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Tip" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Tipler</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="news">Haber</SelectItem>
            <SelectItem value="guide">Rehber</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Durum" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durum</SelectItem>
            <SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="archived">Arşiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz içerik yok</p>
            <Link to="/blog/new"><Button size="sm" className="mt-3 gradient-primary text-white border-0">İlk İçeriği Ekle</Button></Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(post => (
              <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                {post.main_image ? (
                  <img src={post.main_image} alt={post.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge[post.type]}`}>
                      {typeLabels[post.type]}
                    </span>
                    <StatusBadge status={post.status} />
                    {post.featured && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">⭐ Öne Çıkan</span>}
                  </div>
                  <p className="font-medium text-foreground line-clamp-1">{post.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    {post.author && <span>{post.author}</span>}
                    {post.published_date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(post.published_date), 'dd MMM yyyy')}
                      </span>
                    )}
                    {post.reading_time_min && <span>{post.reading_time_min} dk okuma</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link to={`/blog/${post.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                  </Link>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => { if (confirm('İçeriği silmek istiyor musunuz?')) deleteMutation.mutate(post.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}