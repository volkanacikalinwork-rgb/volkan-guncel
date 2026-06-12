import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { FileCheck } from 'lucide-react';

export default function TermsAndConditions() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-terms'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'terms-conditions' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-terms'] })
  });
  return (
    <div>
      <PageHeader title="Kullanım Koşulları" subtitle="/terms-and-conditions sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={FileCheck} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}