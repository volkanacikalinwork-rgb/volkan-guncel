import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Handshake } from 'lucide-react';

export default function PartnersAndDevelopers() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-partners'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'partners' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-partners'] })
  });
  return (
    <div>
      <PageHeader title="Ortaklar & Geliştiriciler" subtitle="/partners-and-developers sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Handshake} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}