import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Check, X, Star } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'indoor',   label: 'İç Mekan' },
  { value: 'outdoor',  label: 'Dış Mekan' },
  { value: 'services', label: 'Hizmetler' },
  { value: 'leisure',  label: 'Eğlence & Spor' },
  { value: 'legal',    label: 'Hukuki / Yatırım' },
  { value: 'location', label: 'Konum' },
  { value: 'other',    label: 'Diğer' },
];

const SEED_FEATURES = [
  { name: 'Pool', category: 'outdoor', order: 1 },
  { name: 'Seafront', category: 'location', order: 2 },
  { name: 'Security', category: 'services', order: 3 },
  { name: 'Elevator', category: 'indoor', order: 4 },
  { name: 'Outdoor Parking', category: 'outdoor', order: 5 },
  { name: 'Indoor Parking', category: 'indoor', order: 6 },
  { name: 'Indoor Pool', category: 'indoor', order: 7 },
  { name: 'Private Pool', category: 'outdoor', order: 8 },
  { name: 'Private Garden', category: 'outdoor', order: 9 },
  { name: 'Garden', category: 'outdoor', order: 10 },
  { name: 'Gym', category: 'leisure', order: 11 },
  { name: 'Playground', category: 'leisure', order: 12 },
  { name: 'Spa', category: 'leisure', order: 13 },
  { name: 'Citizenship', category: 'legal', order: 14 },
  { name: 'City View', category: 'location', order: 15 },
  { name: 'Air Conditioning', category: 'indoor', order: 16 },
  { name: 'Nature View', category: 'location', order: 17 },
  { name: 'Caretaker', category: 'services', order: 18 },
  { name: 'Camera', category: 'services', order: 19 },
  { name: 'Floor Heating', category: 'indoor', order: 20 },
  { name: 'Mosque', category: 'location', order: 21 },
  { name: 'Cable TV / Satellite', category: 'indoor', order: 22 },
  { name: 'Turkish Bath', category: 'leisure', order: 23 },
  { name: 'Beach Transfer Service', category: 'services', order: 24 },
  { name: 'Game Room', category: 'leisure', order: 25 },
  { name: 'Furniture', category: 'indoor', order: 26 },
  { name: 'Natural Gas Infrastructure', category: 'indoor', order: 27 },
  { name: 'Residence Permit', category: 'legal', order: 28 },
  { name: 'White Goods', category: 'indoor', order: 29 },
  { name: 'Rental Guarantee', category: 'legal', order: 30 },
  { name: 'Basketball', category: 'leisure', order: 31 },
  { name: 'Football', category: 'leisure', order: 32 },
  { name: 'Tennis', category: 'leisure', order: 33 },
  { name: 'Concierge Service', category: 'services', order: 34 },
  { name: 'Alarm', category: 'services', order: 35 },
  { name: 'Jacuzzi', category: 'leisure', order: 36 },
  { name: 'Sea View', category: 'location', order: 37 },
  { name: 'Private Parking', category: 'outdoor', order: 38 },
  { name: 'City Center', category: 'location', order: 39 },
  { name: 'Steam Room', category: 'leisure', order: 40 },
  { name: 'Barbecue', category: 'outdoor', order: 41 },
  { name: "Children's Pool", category: 'leisure', order: 42 },
  { name: 'Generator', category: 'services', order: 43 },
  { name: 'Infinity Pool', category: 'outdoor', order: 44 },
  { name: 'Salt Room', category: 'leisure', order: 45 },
  { name: 'Volleyball', category: 'leisure', order: 46 },
  { name: 'Waterslide', category: 'leisure', order: 47 },
  { name: 'Table Tennis', category: 'leisure', order: 48 },
  { name: 'En-suite Bathroom', category: 'indoor', order: 49 },
  { name: 'Outdoor Cinema', category: 'leisure', order: 50 },
  { name: 'Fire Alarm', category: 'services', order: 51 },
  { name: 'Sauna', category: 'leisure', order: 52 },
  { name: 'Cinema', category: 'leisure', order: 53 },
  { name: 'Social Facilities', category: 'leisure', order: 54 },
  { name: 'Urinal', category: 'indoor', order: 55 },
  { name: 'Near the Sea', category: 'location', order: 56 },
  { name: 'Winter Garden', category: 'outdoor', order: 57 },
  { name: 'Near to Metro', category: 'location', order: 58 },
  { name: 'Short Term Rent (Airbnb)', category: 'legal', order: 59 },
  { name: 'Wheelchair Access Ramp', category: 'services', order: 60 },
  { name: 'Kids Play Area', category: 'leisure', order: 61 },
  { name: 'Bathroom Window', category: 'indoor', order: 62 },
  { name: 'Invest in Turkey', category: 'legal', order: 63 },
  { name: 'Laundry Room', category: 'indoor', order: 64 },
  { name: 'Ready in Alanya', category: 'other', order: 65 },
  { name: 'Golf', category: 'leisure', order: 66 },
  { name: 'Billiards', category: 'leisure', order: 67 },
  { name: 'Lobby', category: 'indoor', order: 68 },
  { name: 'Cafe', category: 'services', order: 69 },
  { name: 'Water Fountain', category: 'outdoor', order: 70 },
  { name: 'Dance Studio', category: 'leisure', order: 71 },
  { name: 'Vehicle Charging Station', category: 'services', order: 72 },
  { name: 'Library', category: 'indoor', order: 73 },
  { name: 'Residence in Complex', category: 'legal', order: 74 },
  { name: 'Terrace', category: 'outdoor', order: 75 },
  { name: 'Temperature Controlled Pool', category: 'outdoor', order: 76 },
  { name: 'Lazy River', category: 'leisure', order: 77 },
  { name: 'Petting Farm', category: 'leisure', order: 78 },
  { name: 'Paintball', category: 'leisure', order: 79 },
  { name: 'Motor Town', category: 'leisure', order: 80 },
  { name: 'Malibu Beach', category: 'leisure', order: 81 },
  { name: 'Bike Track', category: 'leisure', order: 82 },
  { name: 'Horse Riding', category: 'leisure', order: 83 },
  { name: 'Fishing Lake', category: 'leisure', order: 84 },
  { name: 'Market', category: 'services', order: 85 },
  { name: 'Bathtub', category: 'indoor', order: 86 },
  { name: 'Go-Kart', category: 'leisure', order: 87 },
  { name: 'Cricket', category: 'leisure', order: 88 },
  { name: 'Surf', category: 'leisure', order: 89 },
  { name: 'Skate Park', category: 'leisure', order: 90 },
  { name: 'Restaurant', category: 'services', order: 91 },
  { name: 'Near Bus Stop', category: 'location', order: 92 },
  { name: 'Jogging and Walking Track', category: 'outdoor', order: 93 },
  { name: 'Beach', category: 'location', order: 94 },
  { name: 'Disabled Friendly', category: 'services', order: 95 },
  { name: 'Bowling', category: 'leisure', order: 96 },
  { name: 'Relax Room', category: 'leisure', order: 97 },
  { name: 'Snow Room', category: 'leisure', order: 98 },
  { name: 'Sports Town', category: 'leisure', order: 99 },
  { name: 'Pergolas', category: 'outdoor', order: 100 },
  { name: 'International School', category: 'location', order: 101 },
  { name: 'Dressing Room', category: 'indoor', order: 102 },
  { name: 'Poolside Bar', category: 'services', order: 103 },
  { name: 'Conference Room', category: 'indoor', order: 104 },
  { name: 'Water Town', category: 'leisure', order: 105 },
  { name: 'Shops', category: 'services', order: 106 },
  { name: 'Penthouse', category: 'indoor', order: 107 },
  { name: 'Events', category: 'services', order: 108 },
  { name: 'Natural Gas Basement', category: 'indoor', order: 109 },
  { name: 'Massage Room', category: 'leisure', order: 110 },
  { name: 'Smart Home', category: 'indoor', order: 111 },
  { name: 'Butterfly Garden', category: 'outdoor', order: 112 },
  { name: 'Yoga', category: 'leisure', order: 113 },
  { name: 'Wellness Club', category: 'leisure', order: 114 },
].map(f => ({ ...f, slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), is_active: true }));

const CATEGORY_COLORS = {
  indoor:   'bg-blue-100 text-blue-700',
  outdoor:  'bg-green-100 text-green-700',
  services: 'bg-purple-100 text-purple-700',
  leisure:  'bg-orange-100 text-orange-700',
  legal:    'bg-red-100 text-red-700',
  location: 'bg-cyan-100 text-cyan-700',
  other:    'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = { name: '', category: 'other', order: 99 };

export default function Features() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const { data: features = [], isLoading } = useQuery({
    queryKey: ['features'],
    queryFn: () => base44.entities.Feature.list('order'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Feature.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      setShowAdd(false);
      setForm(EMPTY_FORM);
      toast.success('Özellik eklendi');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Feature.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Feature.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast.success('Özellik silindi');
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => base44.entities.Feature.bulkCreate(SEED_FEATURES),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      toast.success('Tüm özellikler yüklendi!');
    },
  });

  const startEdit = (f) => {
    setEditingId(f.id);
    setEditForm({ name: f.name, category: f.category, order: f.order });
  };

  const saveEdit = (id) => {
    updateMutation.mutate({ id, data: editForm });
  };

  const filtered = features.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || f.category === filterCat;
    return matchSearch && matchCat;
  });

  const activeCount = features.filter(f => f.is_active).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-jakarta">Özellik Yönetimi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} aktif · toplam {features.length} özellik
          </p>
        </div>
        <div className="flex gap-2">
          {features.length === 0 && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <Star className="w-4 h-4 mr-2" />
              Tüm Özellikleri Yükle
            </Button>
          )}
          <Button onClick={() => setShowAdd(true)} className="gradient-primary text-white border-0">
            <Plus className="w-4 h-4 mr-2" />Özellik Ekle
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Yeni Özellik</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Özellik Adı *</label>
              <Input placeholder="Pool, Gym, Terrace..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kategori</label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sıra</label>
              <Input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate({ ...form, slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), is_active: true })}
              disabled={!form.name || createMutation.isPending}
            >Kaydet</Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); }}>İptal</Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Özellik ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kategoriler</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="self-center text-sm text-muted-foreground">{filtered.length} sonuç</span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
      ) : features.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Star className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
          <p className="font-medium mb-1">Henüz özellik eklenmemiş</p>
          <p className="text-sm text-muted-foreground mb-4">Tüm özellikleri otomatik yükleyin</p>
          <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            <Star className="w-4 h-4 mr-2" />Tüm Özellikleri Yükle
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Özellik</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell w-20">Sıra</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aktif</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr key={f.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                  {editingId === f.id ? (
                    <>
                      <td className="px-4 py-2">
                        <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="h-8 text-sm" />
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <Select value={editForm.category} onValueChange={v => setEditForm(p => ({ ...p, category: v }))}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        <Input type="number" value={editForm.order} onChange={e => setEditForm(p => ({ ...p, order: Number(e.target.value) }))} className="h-8 text-sm w-16" />
                      </td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => saveEdit(f.id)}>
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingId(null)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium">{f.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[f.category] || CATEGORY_COLORS.other}`}>
                          {CATEGORIES.find(c => c.value === f.category)?.label || f.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{f.order}</td>
                      <td className="px-4 py-3 text-center">
                        <Switch
                          checked={!!f.is_active}
                          onCheckedChange={v => updateMutation.mutate({ id: f.id, data: { is_active: v } })}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => startEdit(f)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { if (confirm(`"${f.name}" silinsin mi?`)) deleteMutation.mutate(f.id); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}