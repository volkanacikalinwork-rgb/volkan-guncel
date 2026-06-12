import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Check, X, Globe, Building2, Map, MapPin, ChevronRight, Zap, ChevronDown } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

// URL dostu metin çevirici
const slugify = (text) => {
  return text.toString().toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
};

export default function Locations() {
  const queryClient = useQueryClient();
  
  // Sütunlar arası seçim takibi
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Akordeon Gruplar (İstanbul Yakaları için)
  const [expandedGroups, setExpandedGroups] = useState({ 'Avrupa Yakası': true, 'Anadolu Yakası': true });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Manuel Ekleme Form State'leri
  const [newCountry, setNewCountry] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newNeighborhood, setNewNeighborhood] = useState('');

  // Düzenleme (Edit) State'leri
  const [editingItem, setEditingItem] = useState(null); // { level, id, oldName, newName }
  const [isUpdating, setIsUpdating] = useState(false);

  // Tüm konumları çek
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.filter({}),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Location.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Başarıyla eklendi!');
    }
  });

  // --- DÜZENLEME (EDİT) İŞLEMİ MANTIĞI ---
  const startEdit = (level, item) => {
    setEditingItem({ level, id: item.id, oldName: item.name, newName: item.name });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editingItem.newName.trim() || editingItem.newName === editingItem.oldName) {
      setEditingItem(null);
      return;
    }
    
    const newName = editingItem.newName.trim();
    setIsUpdating(true);
    
    try {
      let toUpdate = [];
      // Hiyerarşideki ismi değişen tüm satırları bul ve topluca güncelle
      if (editingItem.level === 'country') {
        toUpdate = locations.filter(l => getCountryName(l) === editingItem.oldName);
        for (const r of toUpdate) await base44.entities.Location.update(r.id, { country: newName });
        if (selectedCountry === editingItem.oldName) setSelectedCountry(newName);
      } 
      else if (editingItem.level === 'city') {
        toUpdate = locations.filter(l => (l.city_label || l.city) === editingItem.oldName && getCountryName(l) === selectedCountry);
        for (const r of toUpdate) await base44.entities.Location.update(r.id, { city_label: newName, city: slugify(newName) });
        if (selectedCity === editingItem.oldName) setSelectedCity(newName);
      } 
      else if (editingItem.level === 'district') {
        toUpdate = locations.filter(l => l.district === editingItem.oldName && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry);
        for (const r of toUpdate) await base44.entities.Location.update(r.id, { district: newName });
        if (selectedDistrict === editingItem.oldName) setSelectedDistrict(newName);
      } 
      else if (editingItem.level === 'neighborhood') {
        await base44.entities.Location.update(editingItem.id, { neighborhood: newName });
      }

      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("İsim başarıyla güncellendi!");
    } catch (error) {
      toast.error("Güncelleme sırasında hata oluştu.");
    } finally {
      setIsUpdating(false);
      setEditingItem(null);
    }
  };


  // --- TEK TIKLA KURULUM (SEEDER) ---
  const handleAutoSeed = async () => {
    try {
      toast.info("Otomatik kurulum başladı, lütfen bekleyin...");
      
      const oldIstanbuls = locations.filter(l => l.city?.includes('istanbul') || l.city_label?.includes('İstanbul'));
      for (const old of oldIstanbuls) {
        await base44.entities.Location.delete(old.id);
      }

      const istanbulAvrupa = ['Beşiktaş', 'Sarıyer', 'Bakırköy', 'Beylikdüzü', 'Başakşehir', 'Fatih', 'Şişli', 'Beyoğlu'];
      for (const dist of istanbulAvrupa) {
        await base44.entities.Location.create({ country: 'Türkiye', city: 'istanbul', city_label: 'İstanbul', district: dist, region: 'Avrupa Yakası' });
      }

      const istanbulAnadolu = ['Kadıköy', 'Üsküdar', 'Maltepe', 'Ataşehir', 'Pendik', 'Kartal', 'Ümraniye'];
      for (const dist of istanbulAnadolu) {
        await base44.entities.Location.create({ country: 'Türkiye', city: 'istanbul', city_label: 'İstanbul', district: dist, region: 'Anadolu Yakası' });
      }

      const alanyaNeighborhoods = [
        'Bektaş', 'Payallar', 'Mahmutlar', 'Demirtaş', 'Tosmur', 'İncekum', 
        'Okurcalar', 'Konaklı', 'Avsallar', 'Çıplaklı', 'Tepe', 'Hasbahçe', 
        'Alanya Center', 'Yeşilöz', 'Oba', 'Cikcilli', 'Kestel', 'Mahmutseydi', 
        'Saray', 'Gazipaşa', 'Kargıcak', 'Türkler'
      ];

      for (const n of alanyaNeighborhoods) {
        const exists = locations.find(l => l.district === 'Alanya' && l.neighborhood === n);
        if (!exists) {
          await base44.entities.Location.create({ country: 'Türkiye', city: 'antalya', city_label: 'Antalya', district: 'Alanya', neighborhood: n });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("İstanbul Yakaları ve Alanya Mahalleleri mükemmel hiyerarşiyle kuruldu!");
    } catch (error) {
      console.error(error);
      toast.error("Kurulum sırasında hata oluştu.");
    }
  };

  // --- ÜLKE İSİMLERİNİ BİRLEŞTİR ---
  const getCountryName = (loc) => {
    const c = loc.country?.trim() || 'Türkiye';
    return c.toLowerCase() === 'turkey' ? 'Türkiye' : c;
  };

  // 1. ÜLKELER
  const countries = Object.values(locations.reduce((acc, l) => {
    const cName = getCountryName(l);
    if (cName && !acc[cName]) {
      acc[cName] = { id: cName, name: cName, type: 'country', originalRecord: l };
    }
    return acc;
  }, {}));
  
  // 2. İLLER
  const cities = selectedCountry 
    ? Object.values(locations.filter(l => getCountryName(l) === selectedCountry).reduce((acc, l) => {
        const cName = l.city_label || l.city;
        if (cName && !acc[cName]) {
          acc[cName] = { id: cName, name: cName, type: 'city', originalRecord: l };
        }
        return acc;
      }, {}))
    : [];
  
  // 3. İLÇELER 
  const districts = selectedCity 
    ? Object.values(locations.filter(l => (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry).reduce((acc, l) => {
        if (l.district && !acc[l.district]) {
          acc[l.district] = { id: l.district, name: l.district, type: 'district', group: l.region || 'Diğerleri', originalRecord: l };
        }
        return acc;
      }, {}))
    : [];
  
  // 4. MAHALLELER
  const neighborhoods = selectedDistrict 
    ? locations.filter(l => l.district === selectedDistrict && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry && l.neighborhood)
      .map(l => ({ id: l.id, name: l.neighborhood, type: 'neighborhood', originalRecord: l })) 
    : [];

  // --- MANUEL EKLEME İŞLEMLERİ (Sorunları Çözülmüş Hali) ---
  const handleAddCountry = (e) => {
    e.preventDefault();
    if (!newCountry.trim()) return;
    createMutation.mutate({ country: newCountry.trim(), city: 'merkez', city_label: 'Merkez', district: 'Merkez' });
    setNewCountry('');
  };

  const handleAddCity = (e) => {
    e.preventDefault();
    if (!newCity.trim() || !selectedCountry) return;
    createMutation.mutate({ country: selectedCountry, city: slugify(newCity), city_label: newCity.trim(), district: 'Merkez' });
    setNewCity('');
  };

  const handleAddDistrict = (e) => {
    e.preventDefault();
    if (!newDistrict.trim() || !selectedCity) return;
    createMutation.mutate({ 
      country: selectedCountry, 
      city: slugify(selectedCity), 
      city_label: selectedCity, 
      district: newDistrict.trim(),
      region: selectedCity === 'İstanbul' ? 'Diğerleri' : null 
    });
    setNewDistrict('');
  };

  const handleAddNeighborhood = (e) => {
    e.preventDefault();
    if (!newNeighborhood.trim() || !selectedDistrict) return;

    // Eklenecek mahallenin ait olduğu ilçenin "Bölge" (Region) bilgisini bulup koruyoruz ki ekleyince listede kaybolmasın!
    const distRecords = locations.filter(l => l.district === selectedDistrict && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry);
    const regionToUse = distRecords.find(l => l.region)?.region || null;

    createMutation.mutate({ 
      country: selectedCountry, 
      city: slugify(selectedCity), 
      city_label: selectedCity, 
      district: selectedDistrict, 
      region: regionToUse, // Bölge bilgisini aktarıyoruz
      neighborhood: newNeighborhood.trim() 
    });
    setNewNeighborhood('');
  };


  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  // --- ORTAK SÜTUNLU LİSTE BİLEŞENİ ---
  const LocationList = ({ level, items, icon: Icon, title, selectedItem, onSelect, addForm, placeholder, value, setValue, useGroups = false }) => {
    
    // İstanbul için gruplama mantığı
    const groupedItems = useGroups ? items.reduce((acc, item) => {
      const g = item.group && item.group !== 'Diğerleri' ? item.group : 'Diğerleri';
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    }, {}) : {};

    // Satır Render Fonksiyonu (Normal görünüm veya Edit görünümü)
    const renderItem = (item, isNested = false) => {
      const isSelected = selectedItem === item.name;
      const isEditing = editingItem?.level === level && editingItem?.id === item.id;

      if (isEditing) {
        return (
          <div key={`edit-${item.id}`} className={`flex items-center justify-between p-2 rounded-xl bg-teal-50 border border-teal-200 shadow-sm ${isNested ? 'ml-3' : ''}`}>
             <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="flex w-full gap-2">
                <input
                   autoFocus
                   value={editingItem.newName}
                   onChange={e => setEditingItem({ ...editingItem, newName: e.target.value })}
                   className="flex-1 text-sm font-semibold px-2 py-1 rounded bg-white border border-teal-200 outline-none focus:border-teal-500"
                />
                <div className="flex gap-1 shrink-0">
                   <button type="submit" disabled={isUpdating} className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors disabled:opacity-50" title="Kaydet">
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                   </button>
                   <button type="button" onClick={() => setEditingItem(null)} disabled={isUpdating} className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50" title="İptal">
                      <X className="w-3.5 h-3.5" />
                   </button>
                </div>
             </form>
          </div>
        )
      }

      return (
        <div 
          key={item.id} 
          onClick={() => onSelect && onSelect(item)}
          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-teal-50 border-teal-200 border text-teal-800 shadow-sm' : 'hover:bg-gray-50 border border-transparent text-gray-600'} ${isNested ? 'ml-3 bg-gray-50/50' : ''}`}
        >
          <span className="text-sm font-semibold truncate pr-2 flex items-center gap-1">
            {item.name}
          </span>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); startEdit(level, item); }}
              className="p-1.5 text-gray-400 hover:text-teal-600 rounded-md transition-colors"
              title="Düzenle"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            {onSelect && <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-teal-600 rotate-90' : 'text-gray-300'}`} />}
          </div>
        </div>
      );
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Icon className="w-4 h-4 text-teal-600" /> {title}
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Kayıt bulunamadı.</p>
          ) : (
            useGroups && Object.keys(groupedItems).length > 0 ? (
              Object.entries(groupedItems).map(([groupName, groupArr]) => (
                <div key={groupName} className="space-y-1 mb-2">
                  <div 
                    onClick={() => toggleGroup(groupName)}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-slate-100 bg-slate-50 transition-all border border-slate-100 shadow-sm"
                  >
                    <span className="font-bold text-slate-700 text-sm">{groupName}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedGroups[groupName] ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedGroups[groupName] && groupArr.map(item => renderItem(item, true))}
                </div>
              ))
            ) : (
              items.map(item => renderItem(item, false))
            )
          )}
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <form onSubmit={addForm} className="flex gap-2">
            <input 
              type="text" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              placeholder={placeholder} 
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500"
            />
            <button type="submit" disabled={createMutation.isPending || !value.trim()} className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors" title="Ekle">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="🗺️ Konum Hiyerarşisi Yönetimi" 
          subtitle="Ülke, İl, İlçe ve Mahalle bağlarını kurun ve isimlerini düzenleyin." 
        />
        
        <button 
          onClick={handleAutoSeed} 
          disabled={createMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Zap className="w-4 h-4" /> Talep Edilen Konumları Otomatik Kur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* ÜLKELER */}
        <LocationList 
          level="country" title="Ülkeler" icon={Globe} items={countries} selectedItem={selectedCountry}
          onSelect={(item) => { 
            if (selectedCountry === item.name) {
              setSelectedCountry(null); setSelectedCity(null); setSelectedDistrict(null);
            } else {
              setSelectedCountry(item.name); setSelectedCity(null); setSelectedDistrict(null); 
            }
          }}
          addForm={handleAddCountry} placeholder="Yeni Ülke..." value={newCountry} setValue={setNewCountry}
        />

        {/* İLLER */}
        <div className={!selectedCountry ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'transition-all duration-300'}>
          <LocationList 
            level="city" title="İller" icon={Building2} items={cities} selectedItem={selectedCity}
            onSelect={(item) => { 
              if (selectedCity === item.name) {
                setSelectedCity(null); setSelectedDistrict(null);
              } else {
                setSelectedCity(item.name); setSelectedDistrict(null); 
              }
            }}
            addForm={handleAddCity} placeholder="Yeni İl..." value={newCity} setValue={setNewCity}
          />
        </div>

        {/* İLÇELER */}
        <div className={!selectedCity ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'transition-all duration-300'}>
          <LocationList 
            level="district" title="İlçeler" icon={Map} items={districts} selectedItem={selectedDistrict}
            useGroups={selectedCity === 'İstanbul'} 
            onSelect={(item) => {
              if (selectedDistrict === item.name) {
                setSelectedDistrict(null);
              } else {
                setSelectedDistrict(item.name);
              }
            }}
            addForm={handleAddDistrict} placeholder="Yeni İlçe..." value={newDistrict} setValue={setNewDistrict}
          />
        </div>

        {/* MAHALLELER */}
        <div className={!selectedDistrict ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'transition-all duration-300'}>
          <LocationList 
            level="neighborhood" title="Mahalleler" icon={MapPin} items={neighborhoods}
            onSelect={null}
            addForm={handleAddNeighborhood} placeholder="Yeni Mahalle..." value={newNeighborhood} setValue={setNewNeighborhood}
          />
        </div>

      </div>
    </div>
  );
}