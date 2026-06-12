import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { TrendingUp } from 'lucide-react';

export default function InvestmentConsulting() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-investment-consulting'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'investment-consulting' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-investment-consulting'] })
  });
  return (
    <div>
      <PageHeader title="Yatırım Danışmanlığı" subtitle="" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={TrendingUp} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}