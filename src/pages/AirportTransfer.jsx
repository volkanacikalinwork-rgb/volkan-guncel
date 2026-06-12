import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Car } from 'lucide-react';

export default function AirportTransfer() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-airport-transfer'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'airport-transfer' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-airport-transfer'] })
  });
  return (
    <div>
      <PageHeader title="Havalimanı Transfer Hizmetleri" subtitle="" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Car} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}