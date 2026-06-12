import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StaticPageList from '@/components/corporate/StaticPageList';
import { KeyRound } from 'lucide-react';

export default function RentalManagement() {
  const queryClient = useQueryClient();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['page-rental-management'],
    queryFn: () => base44.entities.BlogPost.filter({ category: 'rental-management' }, '-created_date', 100)
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['page-rental-management'] })
  });
  return (
    <div>
      <PageHeader title="Kiralama Yönetimi" subtitle="" action="Yeni İçerik" onAction={() => window.location.href = '/blog/new'} />
      <StaticPageList posts={posts} isLoading={isLoading} emptyIcon={KeyRound} onDelete={(id) => deleteMutation.mutate(id)} />
    </div>
  );
}