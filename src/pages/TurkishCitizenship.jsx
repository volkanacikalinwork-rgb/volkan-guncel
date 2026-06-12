import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Flag } from 'lucide-react';

export default function TurkishCitizenship() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-turkish-citizenship'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'citizenship' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-turkish-citizenship'] })
  });
  return (
    <div>
      <PageHeader title="Türk Vatandaşlığı" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Flag} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}