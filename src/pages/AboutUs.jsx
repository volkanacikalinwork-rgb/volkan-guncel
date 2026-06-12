import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Building } from 'lucide-react';

export default function AboutUs() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-about-us'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'about-us' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-about-us'] })
  });
  return (
    <div>
      <PageHeader title="Hakkımızda" subtitle="/about-us sayfası içerikleri" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Building} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}