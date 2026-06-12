import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StaticPageList({ posts, isLoading, onDelete, emptyIcon: Icon = FileText }) {
  if (isLoading) return (
    <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">Yükleniyor...</div>
  );

  if (posts.length === 0) return (
    <div className="bg-card rounded-xl border border-border p-12 text-center">
      <Icon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-muted-foreground">Henüz içerik yok</p>
      <Link to="/blog/new">
        <Button size="sm" className="mt-3 gradient-primary text-white border-0">İçerik Ekle</Button>
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {posts.map(post => (
        <div key={post.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
          {post.main_image ? (
            <img src={post.main_image} alt={post.title} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Icon className="w-12 h-12 text-violet-400" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={post.status} />
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
                onClick={() => { if (confirm('İçeriği silmek istiyor musunuz?')) onDelete(post.id); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}