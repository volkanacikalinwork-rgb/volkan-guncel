import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Search, Building2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Properties() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Yerel veritabanından ilanları çekme
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date', 100)
  });

  // İlan silme fonksiyonu
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Property.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] })
  });

  const filtered = properties.filter(p => 
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.property_ref?.includes(search)
  );

  return (
    <div>
      <PageHeader 
        title="İlanlar" 
        subtitle={`${properties.length} ilan listeleniyor`} 
        action="Yeni İlan" 
        onAction={() => window.location.href = '/properties/new'} 
      />

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="İlan adı veya Ref No ara..." 
            className="pl-9" 
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">Henüz ilan eklenmemiş.</p>
            <Link to="/properties/new">
              <Button size="sm" className="mt-3 gradient-primary text-white border-0">İlk İlanı Ekle</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">İlan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Ref No</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Şehir / İlçe</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Fiyat</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Özellikler</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Durum</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.main_image ? (
                          <img src={p.main_image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{p.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground font-mono text-xs">{p.property_ref || '-'}</td>
                    <td className="px-3 py-3.5 text-muted-foreground text-xs">
                      {p.city ? p.city.charAt(0).toUpperCase() + p.city.slice(1) : ''} {p.district ? `/ ${p.district}` : ''}
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-foreground text-xs">
                      {p.price ? `${p.currency || 'USD'} ${p.price.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-3 py-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {p.bedrooms && <span>{p.bedrooms} Yatak</span>}
                        {p.size_sqm && <span>• {p.size_sqm} m²</span>}
                        {p.featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500 ml-1" />}
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><StatusBadge status={p.status || 'draft'} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/properties/${p.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5" /></Button>
                        </Link>
                        <Button
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => { if (confirm('İlanı silmek istediğinizden emin misiniz?')) deleteMutation.mutate(p.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}