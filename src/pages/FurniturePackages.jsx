import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { Sofa } from 'lucide-react';

export default function FurniturePackages() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-furniture-packages'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'furniture-packages' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-furniture-packages'] })
  });
  return (
    <div>
      <PageHeader title="Mobilya Paketleri" subtitle="" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={Sofa} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}