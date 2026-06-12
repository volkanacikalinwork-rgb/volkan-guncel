import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-disclaimer'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'disclaimer' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-disclaimer'] })
  });
  return (
    <div>
      <PageHeader title="Sorumluluk Reddi" subtitle="/disclaimer sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={AlertCircle} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}