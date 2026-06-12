import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Globe } from 'lucide-react';

export default function Sitemap() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-sitemap'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'sitemap' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-sitemap'] })
  });
  return (
    <div>
      <PageHeader title="Site Haritası" subtitle="/sitemap sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Globe} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}