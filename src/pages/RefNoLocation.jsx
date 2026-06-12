import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Loader2, Hash, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function RefNoLocation() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState({ cityName: '', prefix: '', nextNumber: '1' });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 1. Veritabanından referans numarası kurallarını çekme
  const { data: configs = [], isLoading: isConfigsLoading } = useQuery({
    queryKey: ['ref-no-configs'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'ref_no_config' }),
  });

  // 2. Veritabanından TÜM KONUMLARI çekme (Akıllı arama kutusu için)
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.filter({}),
  });

  // --- AKILLI ARAMA İÇİN KONUMLARI DÜZENLEME ---
  // Ülke, İl ve İlçeleri tek bir listede benzersiz (unique) olarak topluyoruz
  const locationOptions = [];
  const addedNames = new Set();

  locations.forEach(l => {
    const country = l.country?.trim();
    if (country && !addedNames.has(country.toLowerCase())) {
      addedNames.add(country.toLowerCase());
      locationOptions.push({ name: country, type: 'Ülke' });
    }
    const city = l.city_label || l.city;
    if (city && !addedNames.has(city.toLowerCase())) {
      addedNames.add(city.toLowerCase());
      locationOptions.push({ name: city, type: 'İl' });
    }
    const district = l.district;
    if (district && district !== 'Merkez' && !addedNames.has(district.toLowerCase())) {
      addedNames.add(district.toLowerCase());
      locationOptions.push({ name: district, type: 'İlçe' });
    }
  });

  // Kullanıcının yazdığı metne göre filtreleme (En fazla 10 sonuç)
  const filteredLocations = locationOptions.filter(opt => 
    opt.name.toLowerCase().includes(newRule.cityName.toLowerCase())
  ).slice(0, 10);

  // Yeni kural oluşturma mutasyonu
  const createMutation = useMutation({
    mutationFn: () => base44.entities.SiteSettings.create({
      key: 'ref_no_config',
      label: newRule.cityName.trim(), 
      value: newRule.prefix.trim().toUpperCase(), 
      next_number: parseInt(newRule.nextNumber, 10) || 1, 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ref-no-configs'] });
      setNewRule({ cityName: '', prefix: '', nextNumber: '1' });
      setAdding(false);
      toast.success('Konum referans kuralı başarıyla eklendi!');
    }
  });

  // Kural silme mutasyonu
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SiteSettings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ref-no-configs'] });
      toast.success('Konum kuralı silindi.');
    }
  });

  const formatPreview = (prefix, num) => {
    const formattedNum = String(num).padStart(2, '0');
    return `${prefix || 'PRE'}-${formattedNum}`;
  };

  return (
    <div>
      <PageHeader
        title="🆔 Ref No - Konum Kuralları"
        subtitle="Şehirlere özel referans kısaltmaları ve otomatik artan sayaç yönetim paneli."
        action="Yeni Kural Ekle"
        onAction={() => setAdding(true)}
      />

      {adding && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-sm">Yeni Konum Kuralı Tanımla</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            
            {/* AKILLI KONUM ARAMA KUTUSU */}
            <div className="relative">
              <Label className="text-xs">Şehir / Konum Adı *</Label>
              <Input
                value={newRule.cityName}
                onChange={e => {
                  setNewRule(n => ({ ...n, cityName: e.target.value }));
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Örn: Alanya, İstanbul..."
                className="mt-1.5"
                autoComplete="off"
              />
              {/* ÖNERİLER DROPDOWN */}
              {showSuggestions && newRule.cityName && filteredLocations.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 p-1">
                  {filteredLocations.map((loc, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      onMouseDown={(e) => {
                        e.preventDefault(); // Input'un blur olmasını engeller
                        setNewRule(n => ({ ...n, cityName: loc.name }));
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors flex items-center justify-between rounded-lg"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 opacity-70" />
                        {loc.name}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded">
                        {loc.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Kısaltma Öneki (Prefix) *</Label>
              <Input
                value={newRule.prefix}
                onChange={e => setNewRule(n => ({ ...n, prefix: e.target.value }))}
                placeholder="Örn: ALN, IST"
                className="mt-1.5 font-mono uppercase"
                maxLength={5}
              />
            </div>
            <div>
              <Label className="text-xs">Başlangıç Numarası *</Label>
              <Input
                type="number"
                min="1"
                value={newRule.nextNumber}
                onChange={e => setNewRule(n => ({ ...n, nextNumber: e.target.value }))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="bg-muted/40 p-3 rounded-lg text-xs font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            İlk Üretilecek Kod Örnek Önizlemesi: <span className="font-mono text-primary font-bold text-sm bg-white border px-2 py-0.5 rounded">{formatPreview(newRule.prefix.toUpperCase(), newRule.nextNumber)}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newRule.cityName || !newRule.prefix || createMutation.isPending}
              className="gradient-primary text-white border-0"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kuralı Kaydet
            </Button>
            <Button
              variant="outline"
              onClick={() => { setAdding(false); setNewRule({ cityName: '', prefix: '', nextNumber: '1' }); setShowSuggestions(false); }}
            >
              İptal
            </Button>
          </div>
        </div>
      )}

      {isConfigsLoading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">Yükleniyor...</div>
      ) : configs.length === 0 ? (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <Hash className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground font-medium">Henüz bir kural tanımlanmadı</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Otomatik referans kodu üretmek için bir şehir kuralı ekleyin.</p>
          <Button size="sm" className="gradient-primary text-white border-0" onClick={() => setAdding(true)}>İlk Kuralı Oluştur</Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Şehir / Konum</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Kısaltma (Prefix)</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Sıradaki Sayaç No</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-3">Sıradaki Otomatik Ref No</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {configs.map(config => (
                  <tr key={config.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-foreground capitalize">{config.label}</td>
                    <td className="px-3 py-3.5 font-mono text-xs text-muted-foreground"><span className="bg-muted border px-2 py-0.5 rounded font-bold text-foreground">{config.value}</span></td>
                    <td className="px-3 py-3.5 font-medium text-muted-foreground">{config.next_number || 1}</td>
                    <td className="px-3 py-3.5 font-mono font-bold text-primary text-sm">
                      {formatPreview(config.value, config.next_number || 1)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive animate-fade-in"
                        onClick={() => { if (confirm('Bu kuralı silmek istediğinize emin misiniz?')) deleteMutation.mutate(config.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}