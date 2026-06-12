import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, Check, X, Building2, Home, Briefcase, TreePine, Tags, ChevronRight, Loader2
} from 'lucide-react';

const TYPE_ICONS = {
  apartment: Building2,
  villa: Home,
  commercial: Briefcase,
  land: TreePine,
};

const DEFAULT_TYPES = [
  {
    name: 'Apartment', slug: 'apartment', icon: '🏢', is_active: true, order: 1,
    sub_types: ['Loft Apartment', 'Roof Duplex Apartment', 'Garden Duplex Apartment', 'Flat Apartment']
  },
  {
    name: 'Villa', slug: 'villa', icon: '🏡', is_active: true, order: 2,
    sub_types: ['Private Villa', 'Site İçerisinde Villa']
  },
  {
    name: 'Commercial', slug: 'commercial', icon: '🏪', is_active: true, order: 3,
    sub_types: ['Commercial Office', 'Commercial Shop']
  },
  {
    name: 'Land', slug: 'land', icon: '🌿', is_active: true, order: 4,
    sub_types: []
  },
];

function SubTypeItem({ value, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const handleSave = () => {
    if (val.trim()) { onSave(val.trim()); setEditing(false); }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} className="h-8 text-sm" autoFocus
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }} />
        <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors">
      <div className="flex items-center gap-2">
        <ChevronRight className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-sm">{value}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1 hover:text-primary transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function AddSubType({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState('');

  const handleAdd = () => {
    if (val.trim()) { onAdd(val.trim()); setVal(''); setAdding(false); }
  };

  if (!adding) {
    return (
      <button onClick={() => setAdding(true)}
        className="flex items-center gap-2 text-xs text-primary hover:underline mt-1 px-3">
        <Plus className="w-3.5 h-3.5" /> Alt tip ekle
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 mt-1">
      <Input value={val} onChange={e => setVal(e.target.value)} placeholder="Alt tip adı..." className="h-8 text-sm" autoFocus
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setVal(''); } }} />
      <button onClick={handleAdd} className="text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
      <button onClick={() => { setAdding(false); setVal(''); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
    </div>
  );
}

export default function PropertyTypes() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newType, setNewType] = useState({ name: '', slug: '', icon: '🏠' });

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['property-types'],
    queryFn: () => base44.entities.PropertyType.list('order'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PropertyType.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['property-types'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PropertyType.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-types'] });
      setSelectedId(null);
      toast.success('Tip silindi');
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PropertyType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-types'] });
      setAddingNew(false);
      setNewType({ name: '', slug: '', icon: '🏠' });
      toast.success('Yeni tip eklendi');
    }
  });

  const seedMutation = useMutation({
    mutationFn: () => base44.entities.PropertyType.bulkCreate(DEFAULT_TYPES),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-types'] });
      toast.success('Varsayılan tipler eklendi');
    }
  });

  const selected = types.find(t => t.id === selectedId);

  const updateSubTypes = (type, newSubTypes) => {
    updateMutation.mutate({ id: type.id, data: { ...type, sub_types: newSubTypes } });
  };

  const handleCreateNew = () => {
    if (!newType.name.trim()) return;
    const slug = newType.slug || newType.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    createMutation.mutate({ ...newType, slug, sub_types: [], is_active: true, order: types.length + 1 });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-jakarta text-foreground">Mülk Tipleri</h1>
          <p className="text-muted-foreground text-sm mt-1">İlan formunda görünen tip ve alt tipleri yönet</p>
        </div>
        <div className="flex gap-2">
          {types.length === 0 && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="gap-2">
              {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tags className="w-4 h-4" />}
              Varsayılanları Yükle
            </Button>
          )}
          <Button onClick={() => setAddingNew(true)} className="gap-2 gradient-primary text-white border-0 hover:opacity-90">
            <Plus className="w-4 h-4" /> Yeni Tip Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Type list */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : types.length === 0 ? (
            <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
              <Tags className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Henüz tip eklenmedi</p>
              <Button size="sm" variant="outline" onClick={() => seedMutation.mutate()}>
                Varsayılanları Yükle
              </Button>
            </div>
          ) : (
            types.map(type => {
              const IconComp = TYPE_ICONS[type.slug] || Building2;
              const isSelected = selectedId === type.id;
              return (
                <div key={type.id}
                  onClick={() => setSelectedId(isSelected ? null : type.id)}
                  className={`group bg-card rounded-xl border p-4 cursor-pointer transition-all ${isSelected
                    ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/40 hover:shadow-sm'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                      {type.icon || '🏠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{type.name}</p>
                      <p className="text-xs text-muted-foreground">{type.sub_types?.length || 0} alt tip</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!type.is_active}
                        onCheckedChange={v => { updateMutation.mutate({ id: type.id, data: { ...type, is_active: v } }); }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button
                        onClick={e => { e.stopPropagation(); deleteMutation.mutate(type.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add new type inline form */}
          {addingNew && (
            <div className="bg-card rounded-xl border-2 border-primary/40 p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Yeni Ana Tip</p>
              <div>
                <Label className="text-xs">İkon (emoji)</Label>
                <Input value={newType.icon} onChange={e => setNewType(p => ({ ...p, icon: e.target.value }))}
                  className="mt-1 h-8 w-16 text-center text-lg" maxLength={2} />
              </div>
              <div>
                <Label className="text-xs">Tip Adı *</Label>
                <Input value={newType.name} onChange={e => setNewType(p => ({ ...p, name: e.target.value }))}
                  placeholder="örn: Penthouse" className="mt-1 h-8 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleCreateNew()} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateNew} disabled={createMutation.isPending}
                  className="gap-1 gradient-primary text-white border-0">
                  {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Ekle
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setAddingNew(false); setNewType({ name: '', slug: '', icon: '🏠' }); }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sub types panel */}
        <div className="md:col-span-2">
          {!selected ? (
            <div className="bg-card rounded-xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <ChevronRight className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">Bir tip seçin</p>
              <p className="text-sm text-muted-foreground mt-1">Alt tiplerini görüntülemek ve düzenlemek için soldaki listeden bir tip seçin.</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  {selected.icon}
                </div>
                <div>
                  <h2 className="font-bold font-jakarta text-lg">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">/{selected.slug}</p>
                </div>
              </div>

              {(!selected.sub_types || selected.sub_types.length === 0) ? (
                <p className="text-sm text-muted-foreground px-3 mb-3">Henüz alt tip yok.</p>
              ) : (
                <div className="space-y-0.5 mb-3">
                  {selected.sub_types.map((st, idx) => (
                    <SubTypeItem
                      key={idx}
                      value={st}
                      onSave={(newVal) => {
                        const updated = [...selected.sub_types];
                        updated[idx] = newVal;
                        updateSubTypes(selected, updated);
                      }}
                      onDelete={() => {
                        const updated = selected.sub_types.filter((_, i) => i !== idx);
                        updateSubTypes(selected, updated);
                      }}
                    />
                  ))}
                </div>
              )}

              <AddSubType onAdd={(val) => {
                const updated = [...(selected.sub_types || []), val];
                updateSubTypes(selected, updated);
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}