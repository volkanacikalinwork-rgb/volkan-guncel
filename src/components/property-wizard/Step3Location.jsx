import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { DISTRICTS_BY_CITY } from '@/lib/constants';
import WizardInfoBox from './WizardInfoBox';
import { Plus, Trash2, Sparkles, Loader2, Search, Maximize2, X, Navigation } from 'lucide-react';

const CITIES = ['istanbul', 'antalya', 'alanya', 'fethiye', 'bodrum', 'ankara', 'izmir', 'side', 'kas', 'other'];

export default function Step3Location({ form, setForm }) {
  const [citySearch, setCitySearch] = useState(form.city || '');
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Tekli enlem/boylam girdisi için yerel state
  const [coordsInput, setCoordsInput] = useState(() => {
    return form.lat && form.lng ? `${form.lat}, ${form.lng}` : '';
  });
  const [coordError, setCoordError] = useState('');

  // 🎯 YENİ SİSTEM ÖZELLİKLERİ İÇİN STATE YAPILARI
  const [searchQuery, setSearchQuery] = useState(''); // Konum arama kutusu
  const [searchLoading, setSearchLoading] = useState(false);
  const [targetQuery, setTargetQuery] = useState(''); // Yol tarifi hedef kutusu
  const [targetCoords, setTargetCoords] = useState(null); // Yol tarifi koordinatları
  const [calculatedDistance, setCalculatedDistance] = useState(null); // Metre ölçümü
  const [routeMode, setRouteMode] = useState(false); // Yol tarifi açık/kapalı
  const [isModalOpen, setIsModalOpen] = useState(false); // Büyük harita modalı

  // Veritabanından veri yüklendiğinde veya sıfırlandığında senkronizasyonu sağla
  useEffect(() => {
    if (form.lat && form.lng) {
      setCoordsInput(`${form.lat}, ${form.lng}`);
      setCoordError('');
    } else if (!form.lat && !form.lng) {
      setCoordsInput('');
    }
  }, [form.lat, form.lng]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const distances = form.distances || [
    { label: 'Denize', meters: '' },
    { label: 'Merkeze', meters: '' },
    { label: 'Havalimanı', meters: '' },
    { label: 'AVM / Market', meters: '' },
  ];

  const setDistances = (d) => set('distances', d);
  const updateDist = (i, key, val) => setDistances(distances.map((d, idx) => idx === i ? { ...d, [key]: val } : d));
  const removeDist = (i) => setDistances(distances.filter((_, idx) => idx !== i));
  const addDist = () => setDistances([...distances, { label: '', meters: '' }]);

  const distIcons = { 'Denize': '🏖️', 'Merkeze': '🏢', 'Havalimanı': '✈️', 'AVM / Market': '🛍️' };

  const filteredCities = CITIES.filter(c => c.includes(citySearch.toLowerCase()));
  const districts = DISTRICTS_BY_CITY[form.city] || [];

  const selectCity = (c) => {
    set('city', c);
    set('district', '');
    setCitySearch(c.charAt(0).toUpperCase() + c.slice(1));
    setShowCityDrop(false);
  };

  const handleAiDistances = async () => {
    if (!form.title || !form.city) { toast.error('Önce proje adıและ şehir bilgisi girin'); return; }
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `For "${form.title}" in ${form.city}${form.district ? ', ' + form.district : ''}, Turkey, estimate distances in meters to: Beach, City center, Airport, Shopping Mall, Hospital.
Return JSON: {"distances": [{"label": "Beach", "meters": 500}, ...]}
Skip Beach if no coastline nearby. Use realistic estimates.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: { distances: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, meters: { type: 'number' } } } } }
      }
    });
    setAiLoading(false);
    if (result?.distances) {
      setDistances(result.distances.map(d => ({ label: d.label, meters: String(d.meters) })));
      toast.success('AI mesafeleri ekledi!');
    }
  };

  const handleCoordsChange = (e) => {
    const val = e.target.value;
    setCoordsInput(val);

    if (!val.trim()) {
      setForm(f => ({ ...f, lat: '', lng: '' }));
      setCoordError('');
      return;
    }

    const coordRegex = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/;

    if (!coordRegex.test(val)) {
      setCoordError('⚠️ Geçerli bir format değil! (Örn: 36.542495, 32.037370)');
      setForm(f => ({ ...f, lat: '', lng: '' }));
      return;
    }

    setCoordError('');
    const parts = val.split(',');
    setForm(f => ({
      ...f,
      lat: parts[0].trim(),
      lng: parts[1].trim()
    }));
  };

  // 🎯 1. YENİ ÖZELLİKK: Google Maps gibi metinsel konum araması fonksiyonu
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        setForm(f => ({ ...f, lat: first.lat, lng: window.parseFloat(first.lon) }));
        setCoordsInput(`${first.lat}, ${first.lon}`);
        setCoordError('');
        setRouteMode(false); // Yeni konum arandığında eski rotayı kapat
        toast.success('Konum başarıyla bulundu ve haritaya işlendi!');
      } else {
        toast.error('Konum bulunamadı, lütfen daha net yazın.');
      }
    } catch (err) {
      toast.error('Arama motoru şu an yanıt vermiyor.');
    } finally {
      setSearchLoading(false);
    }
  };

  // 🎯 2. YENİ ÖZELLİK: İki nokta arasındaki kuș uçuşu metreyi ölçen matematiksel Haversine motoru
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Dünya yarıçapı (metre cinsinden)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Metre döner
  };

  // 🎯 3. YENİ ÖZELLİK: Yol tarifi ve rota hesaplama fonksiyonu
  const handleCalculateRoute = async () => {
    if (!targetQuery.trim() || !form.lat || !form.lng) {
      toast.error('Önce mülk koordinatını ve gitmek istediğiniz hedefi girin.');
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const tLat = parseFloat(first.lat);
        const tLng = parseFloat(first.lon);
        setTargetCoords({ lat: tLat, lng: tLng });
        
        const meters = calculateHaversineDistance(parseFloat(form.lat), parseFloat(form.lng), tLat, tLng);
        setCalculatedDistance(meters);
        setRouteMode(true);
        toast.success('Yol tarifi rotası haritaya yüklendi!');
      } else {
        toast.error('Hedef konum bulunamadı.');
      }
    } catch (err) {
      toast.error('Rota hesaplanırken bir sorun oluştu.');
    }
  };

  // Dinamik olarak tekil marker haritası veya yol tarifi rotalı harita iframe URL'i üretir
  const generateMapUrl = () => {
    if (routeMode && targetCoords) {
      return `https://maps.google.com/maps?saddr=${form.lat},${form.lng}&daddr=${targetCoords.lat},${targetCoords.lng}&twv=1&hl=tr&output=embed`;
    }
    return `https://maps.google.com/maps?q=${form.lat},${form.lng}&z=15&hl=tr&output=embed`;
  };

  return (
    <div>
      <WizardInfoBox>Mülkün bulunduğu şehir, ilçe ve mahalleyi belirleyin. Önemli noktalara mesafeleri girerek alıcılara konum avantajını gösterin.</WizardInfoBox>

      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">03</span>
        <h2 className="text-sm font-bold text-gray-800">Konum Seçimi</h2>
      </div>

      {/* City / District / Neighborhood */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* City */}
        <div className="relative bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">📍 Şehir</label>
          <input
            type="text"
            value={citySearch}
            onChange={e => { setCitySearch(e.target.value); setShowCityDrop(true); }}
            onFocus={() => setShowCityDrop(true)}
            onBlur={() => setTimeout(() => setShowCityDrop(false), 150)}
            placeholder="Şehir seçin..."
            className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
          />
          {showCityDrop && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-44 overflow-y-auto z-50">
              {filteredCities.map(c => (
                <button key={c} type="button" onMouseDown={() => selectCity(c)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* District */}
        <div className={`bg-white border border-gray-200 rounded-xl p-3 transition-all focus-within:border-emerald-500 ${!form.city ? 'opacity-50' : ''}`}>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">🗺️ İlçe</label>
          {districts.length > 0 ? (
            <select
              value={form.district || ''}
              onChange={e => set('district', e.target.value)}
              disabled={!form.city}
              className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 focus:ring-0 outline-none disabled:cursor-not-allowed"
            >
              <option value="">İlçe seçin...</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={form.district || ''}
              onChange={e => set('district', e.target.value)}
              disabled={!form.city}
              placeholder="İlçe / bölge"
              className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none disabled:cursor-not-allowed"
            />
          )}
        </div>

        {/* Neighborhood */}
        <div className={`bg-white border border-gray-200 rounded-xl p-3 transition-all focus-within:border-emerald-500 ${!form.district ? 'opacity-50' : ''}`}>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">🏘️ Mahalle</label>
          <input
            type="text"
            value={form.neighborhood || ''}
            onChange={e => set('neighborhood', e.target.value)}
            disabled={!form.district}
            placeholder="Önce ilçe seçin..."
            className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Distances */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white mb-5">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            ↔️ Önemli Mesafeler <span className="text-rose-500">*</span>
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={handleAiDistances} disabled={aiLoading}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI ile Araştır
            </button>
            <button type="button" onClick={addDist}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
              <Plus className="w-3 h-3" /> Yeni Konum
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {distances.map((d, i) => (
            <div key={i} className="bg-gray-50/50 border border-gray-200/60 rounded-xl p-3 focus-within:bg-white focus-within:border-emerald-500 transition-all group relative">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {distIcons[d.label] || '📍'} {d.label || (
                  <input
                    type="text"
                    value={d.label}
                    onChange={e => updateDist(i, 'label', e.target.value)}
                    placeholder="Konum adı"
                    className="bg-transparent border-0 p-0 text-[10px] font-bold text-gray-400 uppercase tracking-wider focus:ring-0 outline-none w-full"
                  />
                )}
              </label>
              {d.label ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={d.meters}
                    onChange={e => updateDist(i, 'meters', e.target.value)}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-gray-800 focus:ring-0 outline-none"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-400 font-medium">m</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={d.label}
                    onChange={e => updateDist(i, 'label', e.target.value)}
                    placeholder="Konum"
                    className="flex-1 bg-transparent border-0 p-0 text-xs font-bold text-gray-700 focus:ring-0 outline-none"
                  />
                  <input
                    type="number"
                    value={d.meters}
                    onChange={e => updateDist(i, 'meters', e.target.value)}
                    placeholder="m"
                    className="w-12 bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none text-right"
                  />
                </div>
              )}
              {i >= 4 && (
                <button type="button" onClick={() => removeDist(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full items-center justify-center hidden group-hover:flex">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">🚇 Yakın Toplu Taşıma İmkanları</h4>
        <div className="flex flex-wrap gap-5 bg-gray-50/60 p-3 rounded-xl border border-gray-100 mb-3">
          {[
            { key: 'has_metro', label: 'Metro Var' },
            { key: 'has_metrobus', label: 'Metrobüs Var' },
            { key: 'has_bus', label: 'Otobüs Durağı Var' },
          ].map(({ key, label }) => (
            <label key={key} className="inline-flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" checked={!!form[key]} onChange={e => set(key, e.target.checked)} className="sr-only peer" />
                <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {(form.has_metro || form.has_metrobus || form.has_bus) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {form.has_metro && (
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">🚇 Metro Mesafesi</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={form.dist_metro || ''} onChange={e => set('dist_metro', e.target.value)}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-gray-800 focus:ring-0 outline-none" placeholder="0" />
                  <span className="text-xs text-gray-400">m</span>
                </div>
              </div>
            )}
            {form.has_metrobus && (
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">🚍 Metrobüs Mesafesi</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={form.dist_metrobus || ''} onChange={e => set('dist_metrobus', e.target.value)}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-gray-800 focus:ring-0 outline-none" placeholder="0" />
                  <span className="text-xs text-gray-400">m</span>
                </div>
              </div>
            )}
            {form.has_bus && (
              <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                <label className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">🚏 Durak Mesafesi</label>
                <div className="flex items-center gap-1">
                  <input type="number" value={form.dist_bus || ''} onChange={e => set('dist_bus', e.target.value)}
                    className="w-full bg-transparent border-0 p-0 text-sm font-bold text-gray-800 focus:ring-0 outline-none" placeholder="0" />
                  <span className="text-xs text-gray-400">m</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🎯 GÜNCELLEME: HARİTA ARAMALI, YOL TARİFLİ, METRE ÖLÇÜMLÜ VE DIKDÖRTGEN BÜYÜTMELİ ALAN */}
      <div className="border border-gray-200 rounded-xl p-4 bg-white mt-4 space-y-4">
        
        {/* Üst Sıra: Google Maps Tarzı Canlı Konum Arama Çubuğu */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">🔍 Google Haritalar Gibi Konum Ara</label>
          <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchLocation()}
              placeholder="Örn: Alanyum AVM veya Kadıpaşa Mahallesi, Alanya"
              className="w-full bg-transparent border-0 px-2 py-1 text-xs font-semibold text-gray-700 focus:ring-0 outline-none"
            />
            <button
              type="button"
              onClick={handleSearchLocation}
              disabled={searchLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              {searchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} Bul
            </button>
          </div>
        </div>

        {/* Orta Sıra: Manuel Koordinat Giriş Alanı */}
        <div className={`border rounded-xl p-3 transition-all ${coordError ? 'bg-rose-50/40 border-rose-300 focus-within:border-rose-300' : 'bg-gray-50 border-gray-200 focus-within:border-emerald-500 focus-within:bg-white'}`}>
          <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${coordError ? 'text-rose-500' : 'text-gray-400'}`}>
            📍 Sabit Koordinat Girişi (Enlem, Boylam)
          </label>
          <input
            type="text"
            value={coordsInput}
            onChange={handleCoordsChange}
            placeholder="Örn: 36.542495, 32.037370"
            className="w-full bg-transparent border-0 p-0 text-sm font-bold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
          />
        </div>

        {coordError && <p className="text-[11px] font-semibold text-rose-600 px-1 animate-in fade-in duration-150">{coordError}</p>}

        {/* Canlı Harita İstasyonu */}
        {form.lat && form.lng && !coordError && (
          <div className="space-y-3 animate-in zoom-in-95 duration-200">
            {/* Harita ve Sağ Üst Büyütme Butonu */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm h-56 w-full relative group">
              <iframe
                title="Mülk Konum Haritası"
                width="100%"
                height="100%"
                src={generateMapUrl()}
                frameBorder="0"
                className="border-0"
                allowFullScreen
              />
              {/* Dikdörtgen Büyütme Butonu */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute top-2 right-2 bg-white/95 hover:bg-white text-gray-700 p-2 rounded-lg shadow-md border border-gray-100 transition-all hover:scale-105"
                title="Haritayı Dikdörtgen Büyüt"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alt Kontrol: Canlı Rota ve Metre Ölçüm Konsolu */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-indigo-500" /> Yol Tarifi & Metre Ölçer
                </span>
                {routeMode && (
                  <button 
                    type="button" 
                    onClick={() => { setRouteMode(false); setTargetQuery(''); setCalculatedDistance(null); }}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Rotayı Temizle
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetQuery}
                  onChange={e => setTargetQuery(e.target.value)}
                  placeholder="Yol tarifi almak istediğiniz yer (Örn: Cleopatra Beach)"
                  className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-700 focus:border-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCalculateRoute}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Mesafeyi Ölç
                </button>
              </div>

              {/* Kuş Uçuşu Metre Sonuç Rozeti */}
              {routeMode && calculatedDistance !== null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between text-xs text-emerald-800 font-bold animate-in fade-in duration-200">
                  <span>📏 Kuş Uçuşu Ölçülen Mesafe:</span>
                  <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100 shadow-sm">
                    {calculatedDistance > 1000 
                      ? `${(calculatedDistance / 1000).toFixed(2)} km (${Math.round(calculatedDistance).toLocaleString()} metre)`
                      : `${Math.round(calculatedDistance)} metre`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🎯 4. YENİ ÖZELLİK: EKRANIN ORTASINDA AÇILAN DEV DIKDÖRTGEN HARİTA MODALI */}
      {isModalOpen && form.lat && form.lng && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Başlığı */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2,5 h-2,5 rounded-full bg-teal-500"></span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">🗺️ Gelişmiş Hassas Konum Detay Ekranı</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Devasa Dikdörtgen Harita Alanı */}
            <div className="flex-1 bg-gray-50 relative">
              <iframe
                title="Büyük Ekran Mülk Konumu"
                width="100%"
                height="100%"
                src={generateMapUrl()}
                frameBorder="0"
                className="border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}