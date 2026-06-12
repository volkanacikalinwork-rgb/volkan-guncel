import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { FileText } from 'lucide-react';

export default function ProjectDetailPages() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-project-detail-pages'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'project-detail' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-project-detail-pages'] })
  });
  return (
    <div>
      <PageHeader title="Proje Detay Sayfaları" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={FileText} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}