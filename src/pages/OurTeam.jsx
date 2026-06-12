import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Users } from 'lucide-react';

export default function OurTeam() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-our-team'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'our-team' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-our-team'] })
  });
  return (
    <div>
      <PageHeader title="Ekibimiz" subtitle="/our-team sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Users} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}