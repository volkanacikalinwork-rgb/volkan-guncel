import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { FileSearch } from 'lucide-react';

export default function PropertyDetailPages() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-property-detail-pages'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'property-detail' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-property-detail-pages'] })
  });
  return (
    <div>
      <PageHeader title="İlan Detay Sayfaları" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={FileSearch} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}