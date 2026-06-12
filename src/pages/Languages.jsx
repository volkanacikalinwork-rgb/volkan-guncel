import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Star, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_LANGUAGES } from '@/lib/constants';

export default function Languages() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newLang, setNewLang] = useState({ name: '', code: '', native_name: '', flag_emoji: '', rtl: false, order: 99 });

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => base44.entities.Language.list('order'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Language.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['languages'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Language.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['languages'] }); toast.success('Dil silindi'); },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Language.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['languages'] }); setShowAdd(false); setNewLang({ name: '', code: '', native_name: '', flag_emoji: '', rtl: false, order: 99 }); toast.success('Dil eklendi'); },
  });

  const seedMutation = useMutation({
    mutationFn: () => base44.entities.Language.bulkCreate(DEFAULT_LANGUAGES),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['languages'] }); toast.success('Tüm diller eklendi!'); },
  });

  const setDefault = (lang) => {
    // Clear all defaults then set this one
    languages.forEach(l => {
      if (l.is_default) updateMutation.mutate({ id: l.id, data: { is_default: false } });
    });
    updateMutation.mutate({ id: lang.id, data: { is_default: true } });
    toast.success(`${lang.name} varsayılan dil yapıldı`);
  };

  const active = languages.filter(l => l.is_active);
  const inactive = languages.filter(l => !l.is_active);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-jakarta">Dil Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length} aktif · {inactive.length} pasif · toplam {languages.length} dil
          </p>
        </div>
        <div className="flex gap-2">
          {languages.length === 0 && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <Globe className="w-4 h-4 mr-2" />
              Tüm Dilleri Yükle
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />Dil Ekle
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Yeni Dil</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <Input placeholder="Ad (English)" value={newLang.name} onChange={e => setNewLang(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Kod (en)" value={newLang.code} onChange={e => setNewLang(p => ({ ...p, code: e.target.value.toLowerCase().slice(0,5) }))} />
            <Input placeholder="Yerel ad (English)" value={newLang.native_name} onChange={e => setNewLang(p => ({ ...p, native_name: e.target.value }))} />
            <Input placeholder="Bayrak emoji 🇬🇧" value={newLang.flag_emoji} onChange={e => setNewLang(p => ({ ...p, flag_emoji: e.target.value }))} />
            <Input placeholder="Sıra" type="number" value={newLang.order} onChange={e => setNewLang(p => ({ ...p, order: Number(e.target.value) }))} />
          </div>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={newLang.rtl} onCheckedChange={v => setNewLang(p => ({ ...p, rtl: v }))} />
              RTL (Sağdan sola)
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate({ ...newLang, is_active: true })} disabled={!newLang.name || !newLang.code}>Kaydet</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>İptal</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
      ) : languages.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="font-medium mb-1">Henüz dil eklenmemiş</p>
          <p className="text-sm text-muted-foreground mb-4">Tüm dilleri otomatik yüklemek için butona tıklayın</p>
          <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            <Globe className="w-4 h-4 mr-2" />Tüm Dilleri Yükle
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dil</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kod</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Yerel Ad</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">RTL</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aktif</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Varsayılan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang, i) => (
                <tr key={lang.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag_emoji}</span>
                      <span className="font-medium text-sm">{lang.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-mono text-xs">{lang.code}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{lang.native_name}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {lang.rtl && <Badge variant="secondary" className="text-xs">RTL</Badge>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={!!lang.is_active}
                      onCheckedChange={v => updateMutation.mutate({ id: lang.id, data: { is_active: v } })}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lang.is_default ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                    ) : (
                      <button onClick={() => setDefault(lang)} className="text-muted-foreground hover:text-amber-500 transition-colors mx-auto block">
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => { if (confirm('Silmek istiyor musunuz?')) deleteMutation.mutate(lang.id); }}
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
  );
}