import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { HeartHandshake } from 'lucide-react';

export default function AfterSalesServices() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-after-sales'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'after-sales-services' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-after-sales'] })
  });
  return (
    <div>
      <PageHeader title="Satış Sonrası Hizmetler" subtitle="" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={HeartHandshake} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}