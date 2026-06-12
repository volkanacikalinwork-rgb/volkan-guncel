import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { MessageCircle } from 'lucide-react';

export default function ClientTestimonials() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-testimonials'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'testimonials' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-testimonials'] })
  });
  return (
    <div>
      <PageHeader title="Müşteri Yorumları" subtitle="/client-testimonials sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={MessageCircle} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}