import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Star } from 'lucide-react';

export default function WhyChooseUs() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-why-choose-us'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'why-choose-us' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-why-choose-us'] })
  });
  return (
    <div>
      <PageHeader title="Neden Biz?" subtitle="/why-choose-us sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Star} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}