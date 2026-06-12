import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TurkeyGuide() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['guides'],
    queryFn: () => base44.entities.BlogPost.filter({ type: 'guide' }, '-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guides'] })
  });

  return (
    <div>
      <PageHeader
        title="Turkey Guide"
        subtitle="Şehir & bölge rehberleri"
        action="Yeni Rehber"
        onAction={() => window.location.href = '/blog/new'}
      />

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Map className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Henüz rehber yok</p>
          <Link to="/blog/new"><Button size="sm" className="mt-3 gradient-primary text-white border-0">İlk Rehberi Ekle</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map(post => (
            <div key={post.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
              {post.main_image ? (
                <img src={post.main_image} alt={post.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Map className="w-12 h-12 text-amber-400" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={post.status} />
                  {post.category && <span className="text-xs text-muted-foreground">{post.category}</span>}
                </div>
                <h3 className="font-semibold font-jakarta text-foreground line-clamp-2">{post.title}</h3>
                {post.excerpt && <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{post.excerpt}</p>}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Link to={`/blog/${post.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Pencil className="w-3.5 h-3.5" /> Düzenle
                    </Button>
                  </Link>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => { if (confirm('Rehberi silmek istiyor musunuz?')) deleteMutation.mutate(post.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}