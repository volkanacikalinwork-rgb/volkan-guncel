import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { LayoutGrid } from 'lucide-react';

export default function PropertyCategories() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-property-categories'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'property-categories' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-property-categories'] })
  });
  return (
    <div>
      <PageHeader title="Gayrimenkul Kategorileri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={LayoutGrid} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}