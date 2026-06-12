import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Home } from 'lucide-react';

export default function SellProperty() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-sell-property'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'sell-property' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-sell-property'] })
  });
  return (
    <div>
      <PageHeader title="Mülkünüzü Satın" subtitle="/sell-your-property-in-turkey sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Home} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}