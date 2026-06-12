import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-privacy'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'privacy-policy' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-privacy'] })
  });
  return (
    <div>
      <PageHeader title="Gizlilik Politikası" subtitle="/privacy-policy sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Shield} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}