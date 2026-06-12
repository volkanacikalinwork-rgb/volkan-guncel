import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, User, Trash2 } from 'lucide-react';

export default function Leads() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Veritabanından gelen müşteri taleplerini listeleme
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100),
  });

  // Talep silme işlemi
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Lead.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const filteredLeads = leads.filter(lead =>
    lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Leads & CRM" subtitle={`${leads.length} müşteri talebi listeleniyor`} />

      {/* Arama Çubuğu */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Müşteri adı veya e-posta ara..."
            className="pl-9"
          />
        </div>
      </div>

      {/* CRM Tablosu */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <User className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-40" />
            <p>Henüz bir müşteri talebi bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Müşteri</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">İletişim</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Kaynak</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Durum</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Mesaj</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">{lead.full_name}</td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-xs"><Mail className="w-3 h-3" /> {lead.email}</span>
                        {lead.phone && <span className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" /> {lead.phone}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground text-xs capitalize">
                      {lead.source || 'contact-form'}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={lead.status || 'new'} />
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground text-xs max-w-xs truncate">
                      {lead.message || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm('Bu müşteri talebini silmek istediğinize emin misiniz?')) {
                            deleteMutation.mutate(lead.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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