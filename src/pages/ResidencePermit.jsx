import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { IdCard } from 'lucide-react';

export default function ResidencePermit() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-residence-permit'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'residency' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-residence-permit'] })
  });
  return (
    <div>
      <PageHeader title="Oturma İzni" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={IdCard} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}