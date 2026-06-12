import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MapPin, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CITY_OPTIONS = [
  { value: 'istanbul', label: 'Istanbul' },
];

const ISTANBUL_REGIONS = ['European Side', 'Asian Side'];

// SADECE İSTANBUL - Tek tıkla yerel hafızaya yüklenecek popüler emlak konum listesi
const DEFAULT_LOCATIONS = [
  // Avrupa Yakası
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'European Side', district: 'Beşiktaş', property_count: 0, order: 1, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'European Side', district: 'Sarıyer', property_count: 0, order: 2, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'European Side', district: 'Bakırköy', property_count: 0, order: 3, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'European Side', district: 'Beylikdüzü', property_count: 0, order: 4, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'European Side', district: 'Başakşehir', property_count: 0, order: 5, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'European Side', district: 'Fatih', property_count: 0, order: 6, is_active: true },
  
  // Anadolu Yakası
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'Asian Side', district: 'Kadıköy', property_count: 0, order: 10, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'Asian Side', district: 'Üsküdar', property_count: 0, order: 11, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'Asian Side', district: 'Maltepe', property_count: 0, order: 12, is_active: true },
  { country: 'Turkey', city: 'istanbul', city_label: 'Istanbul', region: 'Asian Side', district: 'Ataşehir', property_count: 0, order: 13, is_active: true }
];

const EMPTY_FORM = {
  country: 'Turkey',
  city: 'istanbul',
  city_label: 'Istanbul',
  region: 'European Side',
  district: '',
  neighborhood: '',
  property_count: 0,
  order: 99,
  is_active: true,
};

export default function Locations() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const [filterCountry, setFilterCountry] = useState('Turkey');
  const [filterCity, setFilterCity] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [search, setSearch] = useState('');

  const [expandedCities, setExpandedCities] = useState({ istanbul: true });
  const [expandedRegions, setExpandedRegions] = useState({ istanbul_European_Side: true, istanbul_Asian_Side: true });
  const [expandedDistricts, setExpandedDistricts] = useState({});

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list('order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Location.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      toast.success('Yeni İstanbul ilçesi eklendi');
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => base44.entities.Location.bulkCreate(DEFAULT_LOCATIONS),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('İstanbul ve popüler ilçeleri yerel hafızaya yüklendi!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Location.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Location.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Konum silindi');
    },
  });

  const filtered = locations.filter(l => {
    if ((l.country || 'Turkey') !== filterCountry) return false;
    if (filterCity !== 'all' && l.city !== filterCity) return false;
    if (filterRegion !== 'all' && l.region !== filterRegion) return false;
    if (filterDistrict !== 'all' && l.district !== filterDistrict) return false;
    if (search && !l.district?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, loc) => {
    const city = loc.city;
    const region = loc.region || 'European Side';
    const district = loc.district;
    if (!acc[city]) acc[city] = { label: loc.city_label || 'Istanbul', regions: {} };
    if (!acc[city].regions[region]) acc[city].regions[region] = {};
    if (!acc[city].regions[region][district]) acc[city].regions[region][district] = [];
    acc[city].regions[region][district].push(loc);
    return acc;
  }, {});

  const toggleCity = (k) => setExpandedCities(p => ({ ...p, [k]: !p[k] }));
  const toggleRegion = (k) => setExpandedRegions(p => ({ ...p, [k]: !p[k] }));

  return (
    <div>
      {/* Header Bölümü */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-jakarta">İstanbul Konum Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Toplam {locations.length} İstanbul bölgesi listeleniyor
          </p>
        </div>
        <div className="flex gap-2">
          {locations.length === 0 && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="gap-2">
              {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              İstanbul Konumlarını Yükle
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />Yeni İlçe Ekle
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Yeni İstanbul Konumu</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Şehir</label>
              <Input value="Istanbul" disabled />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Yaka / Bölge *</label>
              <Select value={form.region} onValueChange={v => setForm(p => ({ ...p, region: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ISTANBUL_REGIONS.map(r => <SelectItem key={r} value={r}>{r === 'European Side' ? 'Avrupa Yakası' : 'Anadolu Yakası'}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">İlçe Adı *</label>
              <Input placeholder="Örn: Şişli, Kadıköy..." value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.district || createMutation.isPending}>Kaydet</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}>İptal</Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
      ) : locations.length === 0 ? (
        <div className="text-center py-10 bg-card border border-border rounded-xl text-muted-foreground">
          <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
          Henüz konum yok. Yukarıdaki **"İstanbul Konumlarını Yükle"** butonuyla tüm listeyi anında oluşturabilirsiniz.
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([cityKey, cityData]) => (
            <div key={cityKey} className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => toggleCity(cityKey)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold font-jakarta">İstanbul</span>
                  <Badge variant="secondary" className="text-xs">{locations.length} Bölge</Badge>
                </div>
                {expandedCities[cityKey] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedCities[cityKey] && (
                <div className="border-t border-border">
                  {Object.entries(cityData.regions).map(([region, districts]) => {
                    const regionKey = `${cityKey}_${region.replace(/ /g, '_')}`;
                    return (
                      <div key={region} className="border-b border-border last:border-0">
                        <button onClick={() => toggleRegion(regionKey)} className="w-full flex items-center justify-between px-5 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors border-b border-border">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {region === 'European Side' ? 'AVRUPA YAKASI' : 'ANADOLU YAKASI'}
                          </span>
                          {expandedRegions[regionKey] !== false ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                        </button>

                        {expandedRegions[regionKey] !== false && (
                          <div className="divide-y divide-border">
                            {Object.entries(districts).map(([districtName, locs]) => {
                              const mainLoc = locs[0];
                              return (
                                <div key={districtName} className="flex items-center justify-between px-5 py-2.5 pl-8 hover:bg-muted/10">
                                  <span className="text-sm font-medium">{districtName}</span>
                                  <div className="flex items-center gap-3">
                                    <Switch checked={!!mainLoc?.is_active} onCheckedChange={v => updateMutation.mutate({ id: mainLoc.id, data: { is_active: v } })} />
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => { if (confirm(`"${districtName}" silinsin mi?`)) deleteMutation.mutate(mainLoc.id); }}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}