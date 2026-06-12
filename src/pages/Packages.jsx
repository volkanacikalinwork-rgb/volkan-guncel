import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const typeColors = {
  citizenship: 'bg-violet-50 text-violet-700',
  residency: 'bg-cyan-50 text-cyan-700',
  investment: 'bg-amber-50 text-amber-700',
};

export default function Packages() {
  const queryClient = useQueryClient();
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Package.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] })
  });

  return (
    <div>
      <PageHeader title="Paketler" subtitle={`${packages.length} paket`} action="Yeni Paket" onAction={() => window.location.href = '/packages/new'} />

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">Yükleniyor...</div>
      ) : packages.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Henüz paket yok</p>
          <Link to="/packages/new"><Button size="sm" className="mt-3 gradient-primary text-white border-0">İlk Paketi Ekle</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              {pkg.main_image && (
                <img src={pkg.main_image} alt={pkg.title} className="w-full h-36 object-cover rounded-lg mb-4" />
              )}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColors[pkg.type] || 'bg-muted text-muted-foreground'}`}>
                      {pkg.type}
                    </span>
                    <StatusBadge status={pkg.status} />
                    {pkg.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  </div>
                  <h3 className="font-semibold font-jakarta text-foreground line-clamp-2">{pkg.title}</h3>
                </div>
              </div>
              <p className="text-xl font-bold text-foreground mt-2">
                {pkg.currency || 'USD'} {pkg.total_price?.toLocaleString()}
              </p>
              {pkg.number_of_properties && (
                <p className="text-xs text-muted-foreground mt-1">{pkg.number_of_properties} mülk içeriyor</p>
              )}
              {pkg.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{pkg.description}</p>
              )}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <Link to={`/packages/${pkg.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Pencil className="w-3.5 h-3.5" /> Düzenle
                  </Button>
                </Link>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => { if (confirm('Paketi silmek istediğinizden emin misiniz?')) deleteMutation.mutate(pkg.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}