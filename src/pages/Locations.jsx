import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Check, X, Globe, Building2, Map, MapPin, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

// URL dostu metin çevirici (Türkçe karakter sorunlarını çözer)
const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/i̇/g, 'i')
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
};

// --- ORTAK SÜTUNLU LİSTE BİLEŞENİ ---
const LocationList = ({ 
  level, items, icon: Icon, title, selectedItem, onSelect, 
  addForm, placeholder, value, setValue, 
  useGroups = false, showGroupInput = false, groupValue, setGroupValue,
  expandedGroups, toggleGroup,
  editingItem, setEditingItem, isUpdating, handleSaveEdit, handleDelete,
  createMutationPending, bulkDeletePending 
}) => {
  
  const groupedItems = {};
  const ungroupedItems = [];

  if (useGroups) {
    items.forEach((item) => {
      if (item.group) {
        if (!groupedItems[item.group]) groupedItems[item.group] = [];
        groupedItems[item.group].push(item);
      } else {
        ungroupedItems.push(item);
      }
    });
  }

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
        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-teal-50 border-teal-200 border text-teal-800 shadow-sm' : 'hover:bg-gray-50 border border-transparent text-gray-600'} ${isNested ? 'ml-3 bg-gray-50/50 border-l border-l-teal-200' : ''}`}
      >
        <span className="text-sm font-semibold truncate pr-2 flex items-center gap-1">
          {item.name}
        </span>
        
        {/* Tıklanabilirliği ve görünürlüğü artırılmış Düzenle/Sil Butonları */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingItem({ level, id: item.id, oldName: item.name, newName: item.name }); }}
              className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              title="Düzenle"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-200"></div>
            <button 
              type="button"
              disabled={bulkDeletePending}
              onClick={(e) => { e.stopPropagation(); handleDelete(level, item); }}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
              title="Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          {onSelect && <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${isSelected ? 'text-teal-600 rotate-90' : 'text-gray-300'}`} />}
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
          useGroups ? (
            <>
              {Object.entries(groupedItems).map(([groupName, groupArr]) => (
                <div key={groupName} className="space-y-1 mb-2">
                  <div 
                    onClick={() => toggleGroup && toggleGroup(groupName)}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-slate-100 bg-slate-50 transition-all border border-slate-100 shadow-sm"
                  >
                    <span className="font-bold text-slate-700 text-sm">{groupName}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedGroups?.[groupName] ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedGroups?.[groupName] && groupArr.map(item => renderItem(item, true))}
                </div>
              ))}
              {ungroupedItems.map(item => renderItem(item, false))}
            </>
          ) : (
            items.map(item => renderItem(item, false))
          )
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <form onSubmit={addForm} className="flex flex-col gap-2">
          {showGroupInput && (
            <input 
              type="text" 
              value={groupValue} 
              onChange={(e) => setGroupValue(e.target.value)} 
              placeholder="Grup Adı (İsteğe Bağlı)" 
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500 bg-white"
            />
          )}
          <div className="flex gap-2">
            <input 
              type="text" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              placeholder={placeholder} 
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500"
            />
            <button type="submit" disabled={createMutationPending || !value.trim()} className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors" title="Ekle">
              {createMutationPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Locations() {
  const queryClient = useQueryClient();
  
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [expandedGroups, setExpandedGroups] = useState({ 'Alanya Merkez': true, 'Avrupa Yakası': true, 'Asya Yakası': true });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const [newCountry, setNewCountry] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newDistrictGroup, setNewDistrictGroup] = useState(''); 
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newNeighborhoodGroup, setNewNeighborhoodGroup] = useState('');

  const [editingItem, setEditingItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.filter({}),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Location.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Başarıyla eklendi!');
    }
  });

  // 🎯 GÜÇLENDİRİLMİŞ ZİNCİRLEME (CASCADE) SİLME MUTASYONU
  const bulkDeleteMutation = useMutation({
    mutationFn: async (idsToDelete) => {
      for (const targetId of idsToDelete) {
        await base44.entities.Location.delete(targetId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Seçili konum ve altındaki tüm kayıtlar veritabanından KALICI olarak silindi!');
    }
  });

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

  const handleDelete = (level, item) => {
    // 🎯 SIKI GÜVENLİK: Eğer bu konuma ait bir portföy varsa SİLİNMESİN!
    const isUsedInProperties = properties.some(p => {
      if (level === 'country') {
        const citiesInThisCountry = locations.filter(l => getCountryName(l) === item.name).map(l => l.city_label || l.city);
        return citiesInThisCountry.some(cName => p.city?.toLowerCase() === cName?.toLowerCase() || p.city_label?.toLowerCase() === cName?.toLowerCase());
      }
      if (level === 'city') {
        return p.city?.toLowerCase() === slugify(item.name) || p.city_label?.toLowerCase() === item.name.toLowerCase() || p.city?.toLowerCase() === item.name.toLowerCase();
      }
      if (level === 'district') {
        return p.district?.toLowerCase() === item.name.toLowerCase() && (p.city_label || p.city)?.toLowerCase() === selectedCity?.toLowerCase();
      }
      if (level === 'neighborhood') {
        return p.neighborhood?.toLowerCase() === item.name.toLowerCase() && p.district?.toLowerCase() === selectedDistrict?.toLowerCase();
      }
      return false;
    });

    if (isUsedInProperties) {
      toast.error(`SİLİNEMEZ! "${item.name}" konumuna bağlı en az bir adet aktif portföy bulunuyor.`);
      return;
    }

    if (window.confirm(`DİKKAT: "${item.name}" ve ona bağlı olan TÜM alt konumlar veritabanından kalıcı olarak silinecek. Emin misiniz?`)) {
      
      let idsToDelete = [];
      
      // Gerçek ID'leri toplama
      if (level === 'country') {
        idsToDelete = locations.filter(l => getCountryName(l) === item.name).map(l => l.id);
      } else if (level === 'city') {
        idsToDelete = locations.filter(l => (l.city_label || l.city) === item.name && getCountryName(l) === selectedCountry).map(l => l.id);
      } else if (level === 'district') {
        idsToDelete = locations.filter(l => l.district === item.name && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry).map(l => l.id);
      } else if (level === 'neighborhood') {
        idsToDelete = locations.filter(l => l.neighborhood === item.name && l.district === selectedDistrict && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry).map(l => l.id);
        if (idsToDelete.length === 0 && item.id) idsToDelete = [item.id];
      }

      if (idsToDelete.length === 0 && item.id) {
         idsToDelete = [item.id];
      }

      if (idsToDelete.length > 0) {
        // Silme emrini gönder
        bulkDeleteMutation.mutate(idsToDelete);
        
        // Seçili olan görünümü temizle
        if (level === 'country' && selectedCountry === item.name) {
          setSelectedCountry(null); setSelectedCity(null); setSelectedDistrict(null);
        } else if (level === 'city' && selectedCity === item.name) {
          setSelectedCity(null); setSelectedDistrict(null);
        } else if (level === 'district' && selectedDistrict === item.name) {
          setSelectedDistrict(null);
        }
      }
    }
  };

  const handleSeedAllLocations = async () => {
    toast.info('Yeni konum hiyerarşisi kuruluyor, lütfen bekleyin...');
    try {
      const istanbulDistricts = [
        "Arnavutköy", "Avcılar", "Bağcılar", "Bahçelievler", "Bayrampaşa", "Büyükçekmece", 
        "Çatalca", "Esenler", "Esenyurt", "Eyüpsultan", "Gaziosmanpaşa", "Güngören", 
        "Kâğıthane", "Küçükçekmece", "Silivri", "Sultangazi", "Zeytinburnu",
        "Adalar", "Beykoz", "Çekmeköy", "Sancaktepe", "Sultanbeyli", "Şile", "Tuzla"
      ];

      const alanyaNeighborhoods = [
        "Cumhuriyet", "Çarşı", "Dinek", "Fığla", "Güller Pınarı", "Hacet", "Hisariçi", 
        "Kadıpaşa", "Kızlar Pınarı", "Saray", "Küçük Hasbahçe", "Büyük Hasbahçe", 
        "Payallar", "Mahmutlar", "Demirtaş", "İncekum", "Okurcalar", "Konaklı", 
        "Avsallar", "Çıplaklı", "Yeşilöz", "Oba", "Cikcilli", "Kestel", 
        "Mahmutseydi", "Gazipaşa", "Kargıcak", "Türkler", "Tosmur", "Bektaş", "Tepe"
      ];

      for (const dist of istanbulDistricts) {
        const exists = locations.find(l => slugify(l.city) === 'istanbul' && l.district === dist);
        if (!exists) {
          await base44.entities.Location.create({ country: 'Türkiye', city: 'istanbul', city_label: 'İstanbul', district: dist });
        }
      }

      for (const mahalle of alanyaNeighborhoods) {
        const exists = locations.find(l => slugify(l.city) === 'antalya' && l.district === 'Alanya' && l.neighborhood === mahalle);
        if (!exists) {
          await base44.entities.Location.create({ country: 'Türkiye', city: 'antalya', city_label: 'Antalya', district: 'Alanya', neighborhood: mahalle });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('İstanbul ve Alanya konumları başarıyla veritabanına işlendi!');
    } catch (err) {
      toast.error('Kurulum sırasında bir hata oluştu.');
    }
  };

  const getCountryName = (loc) => {
    const c = loc.country?.trim() || 'Türkiye';
    return c.toLowerCase() === 'turkey' ? 'Türkiye' : c;
  };

  const countries = Object.values(locations.reduce((acc, l) => {
    const cName = getCountryName(l);
    if (cName && !acc[cName]) {
      acc[cName] = { id: cName, name: cName, type: 'country', originalRecord: l };
    }
    return acc;
  }, {}));
  
  const cities = selectedCountry 
    ? Object.values(locations.filter(l => getCountryName(l) === selectedCountry).reduce((acc, l) => {
        const cName = l.city_label || l.city;
        if (cName && !acc[cName]) {
          acc[cName] = { id: cName, name: cName, type: 'city', originalRecord: l };
        }
        return acc;
      }, {}))
    : [];
  
  const districts = selectedCity 
    ? Object.values(locations.filter(l => (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry).reduce((acc, l) => {
        if (l.district && !acc[l.district]) {
          acc[l.district] = { id: l.district, name: l.district, type: 'district', group: l.region || null, originalRecord: l };
        }
        return acc;
      }, {}))
    : [];
  
  const neighborhoods = selectedDistrict 
    ? locations.filter(l => l.district === selectedDistrict && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry && l.neighborhood)
      .map(l => ({ id: l.id, name: l.neighborhood, type: 'neighborhood', group: l.region || null, originalRecord: l })) 
    : [];

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
    
    const regionToUse = newDistrictGroup.trim() || null;

    createMutation.mutate({ 
      country: selectedCountry, 
      city: slugify(selectedCity), 
      city_label: selectedCity, 
      district: newDistrict.trim(),
      region: regionToUse 
    });
    setNewDistrict('');
  };

  const handleAddNeighborhood = (e) => {
    e.preventDefault();
    if (!newNeighborhood.trim() || !selectedDistrict) return;

    const distRecords = locations.filter(l => l.district === selectedDistrict && (l.city_label || l.city) === selectedCity && getCountryName(l) === selectedCountry);
    const existingDistrictRegion = distRecords.find(l => l.region)?.region || null;
    const regionToUse = newNeighborhoodGroup.trim() || existingDistrictRegion;

    createMutation.mutate({ 
      country: selectedCountry, 
      city: slugify(selectedCity), 
      city_label: selectedCity, 
      district: selectedDistrict, 
      region: regionToUse,
      neighborhood: newNeighborhood.trim() 
    });
    
    setNewNeighborhood('');
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="🗺️ Konum Hiyerarşisi Yönetimi" 
          subtitle="Ülke, İl, İlçe ve Mahalle bağlarını kurun, gruplayın ve isimlerini düzenleyin." 
        />
        {/* <button 
          onClick={handleSeedAllLocations} 
          disabled={createMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Zap className="w-4 h-4" /> Yeni Konumları Otomatik Kur
        </button> */}
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
          editingItem={editingItem} setEditingItem={setEditingItem} isUpdating={isUpdating} handleSaveEdit={handleSaveEdit} handleDelete={handleDelete} createMutationPending={createMutation.isPending} bulkDeletePending={bulkDeleteMutation.isPending}
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
            editingItem={editingItem} setEditingItem={setEditingItem} isUpdating={isUpdating} handleSaveEdit={handleSaveEdit} handleDelete={handleDelete} createMutationPending={createMutation.isPending} bulkDeletePending={bulkDeleteMutation.isPending}
          />
        </div>

        {/* İLÇELER */}
        <div className={!selectedCity ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'transition-all duration-300'}>
          <LocationList 
            level="district" title="İlçeler" icon={Map} items={districts} selectedItem={selectedDistrict}
            onSelect={(item) => {
              if (selectedDistrict === item.name) {
                setSelectedDistrict(null);
              } else {
                setSelectedDistrict(item.name);
              }
            }}
            useGroups={true} 
            showGroupInput={true} 
            groupValue={newDistrictGroup}
            setGroupValue={setNewDistrictGroup}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            addForm={handleAddDistrict} placeholder="Yeni İlçe..." value={newDistrict} setValue={setNewDistrict}
            editingItem={editingItem} setEditingItem={setEditingItem} isUpdating={isUpdating} handleSaveEdit={handleSaveEdit} handleDelete={handleDelete} createMutationPending={createMutation.isPending} bulkDeletePending={bulkDeleteMutation.isPending}
          />
        </div>

        {/* MAHALLELER */}
        <div className={!selectedDistrict ? 'opacity-50 pointer-events-none grayscale-[50%]' : 'transition-all duration-300'}>
          <LocationList 
            level="neighborhood" title="Mahalleler" icon={MapPin} items={neighborhoods}
            onSelect={null}
            useGroups={true}
            showGroupInput={true}
            groupValue={newNeighborhoodGroup}
            setGroupValue={setNewNeighborhoodGroup}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            addForm={handleAddNeighborhood} placeholder="Yeni Mahalle..." value={newNeighborhood} setValue={setNewNeighborhood}
            editingItem={editingItem} setEditingItem={setEditingItem} isUpdating={isUpdating} handleSaveEdit={handleSaveEdit} handleDelete={handleDelete} createMutationPending={createMutation.isPending} bulkDeletePending={bulkDeleteMutation.isPending}
          />
        </div>

      </div>
    </div>
  );
}