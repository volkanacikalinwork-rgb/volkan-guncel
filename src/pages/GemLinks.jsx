import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ExternalLink, Gem, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function GemLinks() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '', instructions: '' });

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['gem-links'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'gem_link' }),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.SiteSettings.create({
      key: 'gem_link',
      value: newLink.url,
      label: newLink.name,
      description: newLink.description,
      instructions: newLink.instructions,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gem-links'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings-gem'] });
      setNewLink({ name: '', url: '', description: '', instructions: '' });
      setAdding(false);
      toast.success('Gem linki eklendi!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SiteSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gem-links'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings-gem'] });
      toast.success('Link silindi.');
    }
  });

  return (
    <div>
      <PageHeader
        title="💎 Gem Linkleri"
        subtitle="Gemini agent linklerini buradan yönetin. Mülk girişinde görüntülenir."
        action="Yeni Link"
        onAction={() => setAdding(true)}
      />

      {adding && (
        <div className="bg-[#f0f4f9] rounded-2xl p-6 mb-6 border border-[#e0e4ea]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e8eaf0] flex items-center justify-center">
              <Gem className="w-6 h-6 text-[#5f6368]" />
            </div>
            <span className="text-lg font-semibold text-[#1f2328]">Yeni Gem</span>
          </div>

          {/* Ad */}
          <div className="mb-5">
            <Label className="text-sm font-bold text-[#1f2328] mb-2 block">Ad</Label>
            <Input
              value={newLink.name}
              onChange={e => setNewLink(n => ({ ...n, name: e.target.value }))}
              placeholder="Gem'inize bir ad verin"
              className="bg-white border-[#1a73e8] focus:border-[#1a73e8] rounded-lg text-sm h-11"
              autoFocus
            />
          </div>

          {/* Gem URL */}
          <div className="mb-5">
            <Label className="text-sm font-bold text-[#1f2328] mb-2 block">Gem URL</Label>
            <Input
              value={newLink.url}
              onChange={e => setNewLink(n => ({ ...n, url: e.target.value }))}
              placeholder="https://gemini.google.com/gem/..."
              className="bg-white border-border rounded-lg text-sm h-11"
            />
          </div>

          {/* Açıklama */}
          <div className="mb-5">
            <Label className="text-sm font-bold text-[#1f2328] mb-2 block">Açıklama</Label>
            <Textarea
              value={newLink.description}
              onChange={e => setNewLink(n => ({ ...n, description: e.target.value }))}
              placeholder="Gem'inizi tanımlayın ve ne yaptığını açıklayın"
              className="bg-white border-border rounded-lg text-sm resize-none min-h-[80px]"
            />
          </div>

          {/* Talimatlar */}
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Label className="text-sm font-bold text-[#1f2328]">Talimatlar</Label>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <Textarea
              value={newLink.instructions}
              onChange={e => setNewLink(n => ({ ...n, instructions: e.target.value }))}
              placeholder="Örnek: Doğal çim ve bölgeye özgü bitkileri iyi bilen bir bahçe ve uzmanısın..."
              className="bg-white border-border rounded-lg text-sm resize-none min-h-[100px]"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-[#e0e4ea] my-5" />

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newLink.name || !newLink.url || createMutation.isPending}
              className="gap-2 gradient-primary text-white border-0 rounded-full px-6"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </Button>
            <Button
              variant="ghost"
              className="rounded-full px-6 text-[#444746]"
              onClick={() => { setAdding(false); setNewLink({ name: '', url: '', description: '', instructions: '' }); }}
            >
              İptal
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">Yükleniyor...</div>
      ) : links.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Gem className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <p className="text-muted-foreground">Henüz gem linki yok</p>
          <Button size="sm" className="mt-3 gradient-primary text-white border-0" onClick={() => setAdding(true)}>İlk Linki Ekle</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {links.map(link => (
            <div key={link.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Gem className="w-5 h-5 text-violet-600" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">{link.label}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> Aç
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => { if (confirm('Sil?')) deleteMutation.mutate(link.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Link Adı</p>
                  <div className="border border-border rounded-lg px-3 py-2 bg-background text-sm font-medium text-foreground">
                    {link.label}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Gem URL</p>
                  <div className="border border-border rounded-lg px-3 py-2 bg-background text-xs text-muted-foreground truncate font-mono">
                    {link.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}