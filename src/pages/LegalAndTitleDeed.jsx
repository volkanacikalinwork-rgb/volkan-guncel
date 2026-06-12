import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Scale } from 'lucide-react';

export default function LegalAndTitleDeed() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-legal-title-deed'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'legal-title-deed' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-legal-title-deed'] })
  });
  return (
    <div>
      <PageHeader title="Hukuki & Tapu Yardımı" subtitle="" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Scale} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}