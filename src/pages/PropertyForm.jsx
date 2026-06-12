import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, MapPin, Save, Navigation, Plus, Trash2, Search, Crosshair, Layers, Radar, Copy, ArrowRight } from 'lucide-react';

const BASE_CATEGORIES = ['Denize', 'Merkeze', 'Havalimanı', 'AVM / Market'];

const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const exact = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  return Math.round(exact / 10) * 10;
};

const defaultForm = {
  project_name: '',
  notes: '',
  lat: '', 
  lng: '',
  city: '', 
  city_visible: true,      
  district: '', 
  district_visible: true,  
  neighborhood: '', 
  neighborhood_visible: true, 
  distances: [], 
  status: 'draft',
  translations: {},
};

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const draftLoaded = useRef(false);

  const { data: propertyData, isLoading: loadingProperty } = useQuery({
    queryKey: ['property', id],
    queryFn: () => base44.entities.Property.filter({ id }),
    enabled: !isNew
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const currentId = !isNew ? id : null;
      return currentId ? await base44.entities.Property.update(currentId, data) : await base44.entities.Property.create(data);
    },
    onSuccess: (res) => {
      if (isNew) localStorage.removeItem('property_draft_new');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success("Tüm konum, entegrasyon ve mesafe verileri veritabanına mühürlendi!");
      const savedId = res?.id || res?.[0]?.id || res?.data?.id || id;
      if (isNew && savedId !== 'new') {
        navigate(`/properties/${savedId}`);
      } else {
        navigate('/properties'); 
      }
    }
  });

  const [form, setForm] = useState(defaultForm);
  const [coordsInput, setCoordsInput] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (isNew && !draftLoaded.current) {
      const savedDraft = localStorage.getItem('property_draft_new');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setForm(parsed);
          if (parsed.lat && parsed.lng) {
            setCoordsInput(`${parsed.lat}, ${parsed.lng}`);
          }
          toast.info("Yarım kalan ilan taslağınız hafızadan geri yüklendi! 🚀");
        } catch (e) {
          console.error("Taslak okuma hatası", e);
        }
      }
      draftLoaded.current = true;
    }
  }, [isNew]);

  useEffect(() => {
    if (isNew && draftLoaded.current) {
      localStorage.setItem('property_draft_new', JSON.stringify(form));
    }
  }, [form, isNew]);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState(''); 
  const [searchLoading, setSearchLoading] = useState(false);
  const [targetCoordsInput, setTargetCoordsInput] = useState(''); 
  const [measuredDistance, setMeasuredDistance] = useState(null); 
  const [isClickSelectActive, setIsClickSelectActive] = useState(false); 
  const [suggestions, setSuggestions] = useState([]); 
  const [mapType, setMapType] = useState('satellite'); 

  const [crowDistance, setCrowDistance] = useState(null); 
  const [roadDistance, setRoadDistance] = useState(null); 
  const [roadLoading, setRoadLoading] = useState(false);   
  const [selectedDistanceType, setSelectedDistanceType] = useState(null); 

  const [radarResults, setRadarResults] = useState([]);
  const [radarLoading, setRadarLoading] = useState(false);

  const [airportResults, setAirportResults] = useState([]);
  const [airportLoading, setAirportLoading] = useState(false);
  const [airportWalkDistances, setAirportWalkDistances] = useState({});
  const [seaDistance, setSeaDistance] = useState(null);
  const [seaLoading, setSeaLoading] = useState(false);
  const [marketResult, setMarketResult] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);

  const [hospitalResults, setHospitalResults] = useState([]);
  const [hospitalLoading, setHospitalLoading] = useState(false);
  const [transportResults, setTransportResults] = useState([]);
  const [transportLoading, setTransportLoading] = useState(false);
  const [uniResults, setUniResults] = useState([]);
  const [uniLoading, setUniLoading] = useState(false);
  const [cultureResults, setCultureResults] = useState([]);
  const [cultureLoading, setCultureLoading] = useState(false);

  const [compiledTextOutput, setCompiledTextOutput] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [addedLabels, setAddedLabels] = useState(new Set());

  const mapRef = useRef(null);
  const tileLayerRef = useRef(null); 
  const mainMarkerRef = useRef(null);
  const targetMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const isClickSelectActiveRef = useRef(isClickSelectActive);
  useEffect(() => { isClickSelectActiveRef.current = isClickSelectActive; }, [isClickSelectActive]);

  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const savedLabels = form.distances?.map(d => d.label) || [];
  const availableCategories = BASE_CATEGORIES.filter(cat => !savedLabels.includes(cat));
  const extraDistances = form.distances?.filter(d => !BASE_CATEGORIES.includes(d.label)) || [];

  useEffect(() => {
    let text = "";
    if (form.city) text += `📍 Konum Bilgisi: ${form.city.toUpperCase()}`;
    if (form.district) text += ` / ${form.district}`;
    if (form.neighborhood) text += ` / ${form.neighborhood}\n`;
    if (form.lat && form.lng) {
      text += `🌐 Coğrafi Koordinatlar -> enlem : ${form.lat} , boylam : ${form.lng}\n`;
    }
    text += `\n🚗 Ulaşım Noktaları ve Önemli Mesafeler:\n`;
    BASE_CATEGORIES.forEach(cat => {
      const meters = form.distances?.find(d => d.label === cat)?.meters;
      if (meters) {
        const formatted = isNaN(meters) ? meters : (Number(meters) >= 1000 ? `${(Number(meters)/1000).toFixed(2)} km` : `${meters} m`);
        text += `• ${cat}: ${formatted}\n`;
      }
    });
    form.distances?.forEach(d => {
      if (!BASE_CATEGORIES.includes(d.label)) {
        const formatted = isNaN(d.meters) ? d.meters : (Number(d.meters) >= 1000 ? `${(Number(d.meters)/1000).toFixed(2)} km` : `${d.meters} m`);
        text += `• ${d.label}: ${formatted}\n`;
      }
    });
    setCompiledTextOutput(text);
  }, [form.city, form.district, form.neighborhood, form.distances, form.lat, form.lng]);

  function getDistanceMeters(label) {
    const found = form.distances?.find(d => d.label === label);
    return found ? found.meters : '';
  }

  function getDistanceVisibility(label) {
    const found = form.distances?.find(d => d.label === label);
    return found ? (found.visible !== false) : true;
  }

  function handleInputChangeValue(label, value) {
    setForm(prev => {
      const currentDistances = prev.distances ? [...prev.distances] : [];
      const foundIdx = currentDistances.findIndex(d => d.label === label);
      if (foundIdx > -1) {
        if (value === '') {
          currentDistances.splice(foundIdx, 1);
        } else {
          currentDistances[foundIdx] = { ...currentDistances[foundIdx], meters: value };
        }
      } else if (value !== '') {
        currentDistances.push({ label, meters: value, visible: true });
      }
      return { ...prev, distances: currentDistances };
    });
  }

  function toggleDistanceVisibility(index) {
    setForm(prev => {
      const arr = prev.distances ? [...prev.distances] : [];
      if (arr[index]) {
        arr[index] = { ...arr[index], visible: !arr[index].visible };
      }
      return { ...prev, distances: arr };
    });
  }

  function handleToggleVisibilityByLabel(label) {
    setForm(prev => {
      const currentDistances = prev.distances ? [...prev.distances] : [];
      const foundIdx = currentDistances.findIndex(d => d.label === label);
      if (foundIdx > -1) {
        currentDistances[foundIdx] = { ...currentDistances[foundIdx], visible: !currentDistances[foundIdx].visible };
      } else {
        currentDistances.push({ label, meters: '', visible: false });
      }
      return { ...prev, distances: currentDistances };
    });
  }

  function handleCopyToClipboardStation() {
    if (!compiledTextOutput.trim()) {
      toast.error("Kopyalanacak metin bulunamadı.");
      return;
    }
    navigator.clipboard.writeText(compiledTextOutput);
    toast.success("Tüm konum, koordinat ve ulaşım mesafeleri başarıyla panoya kopyalandı!");
  }

  function cleanDistanceStringToMeters(str) {
    if (!str) return '';
    let val = str.toLowerCase().trim();
    if (val.includes('km')) {
      return String(Math.round(parseFloat(val.replace('km', '').trim()) * 1000));
    }
    if (val.includes('m')) {
      return String(Math.round(parseFloat(val.replace('m', '').trim())));
    }
    return val;
  }

  function handleProcessJsonPasteStation() {
    try {
      if (!jsonInput.trim()) {
        toast.error("Lütfen önce geçerli bir JSON metni yapıştırın.");
        return;
      }
      const payload = JSON.parse(jsonInput.trim());
      let incomingLat = form.lat;
      let incomingLng = form.lng;
      if (payload.sorgulanan_koordinat) {
        const coordParts = payload.sorgulanan_koordinat.split(',');
        if (coordParts.length === 2) {
          incomingLat = coordParts[0].trim();
          incomingLng = coordParts[1].trim();
        }
      }
      let incomingCity = form.city;
      let incomingDistrict = form.district;
      let incomingNeighborhood = form.neighborhood;
      if (payload.tahmini_bolge) {
        const regionParts = payload.tahmini_bolge.split(',');
        if (regionParts.length === 3) {
          incomingNeighborhood = regionParts[0].replace(/\s*(mahallesi|mah\.|mah)\s*/gi, "").trim();
          incomingDistrict = regionParts[1].trim();
          incomingCity = regionParts[2].toLowerCase().replace(' ili', '').replace('büyükşehir belediyesi', '').trim();
        }
      }
      const collectedDistances = [];
      if (Array.isArray(payload.tarihi_ve_kulturel_yerler)) {
        payload.tarihi_ve_kulturel_yerler.forEach(item => {
          if (item.isim) {
            collectedDistances.push({ label: `🏛️ Tarihi - ${item.isim}`, meters: cleanDistanceStringToMeters(item.mesafe), visible: true });
          }
        });
      }
      if (payload.ulasim?.otobus_duraklari && Array.isArray(payload.ulasim.otobus_duraklari)) {
        payload.ulasim.otobus_duraklari.forEach(item => {
          if (item.durak_adi) {
            collectedDistances.push({ label: `🚌 Otobüs - ${item.durak_adi}`, meters: cleanDistanceStringToMeters(item.mesafe), visible: true });
          }
        });
      }
      if (payload.ulasim?.rayli_sistemler && Array.isArray(payload.ulasim.rayli_sistemler)) {
        payload.ulasim.rayli_sistemler.forEach(item => {
          if (item.durak_adi || item.isim) {
            const transportType = item.tip ? item.tip : 'Raylı Sistem';
            const icon = transportType.toLowerCase().includes('tramvay') ? '🚋' : '🚇';
            const labelName = item.durak_adi || item.isim;
            collectedDistances.push({ 
              label: `${icon} ${transportType} - ${labelName}`, 
              meters: cleanDistanceStringToMeters(item.mesafe), 
              visible: true 
            });
          }
        });
      }
      if (Array.isArray(payload.onemli_yerler_ve_avmler)) {
        payload.onemli_yerler_ve_avmler.forEach(item => {
          if (item.isim) {
            const prefix = item.kategori?.toLowerCase().includes('hastane') ? '🏥 Hastane - ' : '';
            collectedDistances.push({ label: `${prefix}${item.isim}`, meters: cleanDistanceStringToMeters(item.mesafe), visible: true });
          }
        });
      }
      setForm(prev => {
        const currentDistances = prev.distances ? [...prev.distances] : [];
        collectedDistances.forEach(inc => {
          const existIdx = currentDistances.findIndex(d => d.label === inc.label);
          if (existIdx > -1) {
            currentDistances[existIdx] = { ...currentDistances[existIdx], meters: inc.meters };
          } else {
            currentDistances.push(inc);
          }
          const lowerLabel = inc.label.toLowerCase();
          if ((lowerLabel.includes('avm') || lowerLabel.includes('migros') || lowerLabel.includes('market') || lowerLabel.includes('a101')) && !currentDistances.find(d => d.label === 'AVM / Market')) {
            currentDistances.push({ label: 'AVM / Market', meters: inc.meters, visible: true });
          }
          if (lowerLabel.includes('merkez') && !currentDistances.find(d => d.label === 'Merkeze')) {
            currentDistances.push({ label: 'Merkeze', meters: inc.meters, visible: true });
          }
          if (lowerLabel.includes('havalimanı') && !currentDistances.find(d => d.label === 'Havalimanı')) {
            currentDistances.push({ label: 'Havalimanı', meters: inc.meters, visible: true });
          }
          if ((lowerLabel.includes('deniz') || lowerLabel.includes('sahil') || lowerLabel.includes('plaj')) && !currentDistances.find(d => d.label === 'Denize')) {
            currentDistances.push({ label: 'Denize', meters: inc.meters, visible: true });
          }
        });
        return {
          ...prev,
          lat: String(incomingLat),
          lng: String(incomingLng),
          city: incomingCity,
          district: incomingDistrict,
          neighborhood: incomingNeighborhood,
          distances: currentDistances
        };
      });
      setCoordsInput(`${incomingLat}, ${incomingLng}`);
      setJsonInput(''); 
      toast.success("Yapay zeka raporu akıllı etiketlerle başarıyla çözümlendi!");
    } catch (parseError) {
      console.error(parseError);
      toast.error("JSON biçimi hatalı! Lütfen formatı kontrol edin.");
    }
  }

  function handleSaveAndNext() {
    mutation.mutate(form);
  }

  useEffect(() => {
    if (!mapSearchQuery.trim()) { setSuggestions([]); return; }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=8&accept-language=tr`);
        const data = await res.json(); setSuggestions(data || []);
      } catch (err) { console.error("Arama önerileri yüklenemedi:", err); }
    }, 400); 
    return () => clearTimeout(delayDebounce);
  }, [mapSearchQuery]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script'); script.id = 'leaflet-js'; script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.onload = () => setLeafletLoaded(true); document.head.appendChild(script);
    } else { setLeafletLoaded(true); }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !window.L || !document.getElementById('interactive-map')) return;
    const L = window.L; const centerLat = parseFloat(form.lat) || 36.5429; const centerLng = parseFloat(form.lng) || 32.0375;
    if (!mapRef.current) {
      mapRef.current = L.map('interactive-map', { zoomControl: true }).setView([centerLat, centerLng], 14);
    }
    if (tileLayerRef.current) mapRef.current.removeLayer(tileLayerRef.current);
    if (mapType === 'satellite') {
      tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { attribution: '© Google (Görüntü) / OpenStreetMap' }).addTo(mapRef.current);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapRef.current);
    }
    const map = mapRef.current;
    if (!mainMarkerRef.current && form.lat && form.lng) {
      mainMarkerRef.current = L.marker([parseFloat(form.lat), parseFloat(form.lng)], { icon: L.divIcon({ html: `<div class="w-6 h-6 bg-teal-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">🏠</div>`, className: '', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map);
    }
    map.off('click');
    map.on('click', (e) => {
      if (!isClickSelectActiveRef.current) return;
      const clickedLat = e.latlng.lat; const clickedLng = e.latlng.lng; setTargetCoordsInput(`${clickedLat.toFixed(6)}, ${clickedLng.toFixed(6)}`);
      if (!targetMarkerRef.current) {
        targetMarkerRef.current = L.marker([clickedLat, clickedLng], { icon: L.divIcon({ html: `<div class="w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">🎯</div>`, className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(map);
      } else { targetMarkerRef.current.setLatLng([clickedLat, clickedLng]); }
      if (formRef.current.lat && formRef.current.lng) {
        const mLat = parseFloat(formRef.current.lat); const mLng = parseFloat(formRef.current.lng);
        if (!polylineRef.current) polylineRef.current = L.polyline([[mLat, mLng], [clickedLat, clickedLng]], { color: '#4f46e5', weight: 3, dashArray: '5, 5' }).addTo(map);
        else polylineRef.current.setLatLngs([[mLat, mLng], [clickedLat, clickedLng]]);
        const crowMeters = calculateHaversine(mLat, mLng, clickedLat, clickedLng); setCrowDistance(crowMeters); setSelectedDistanceType(null); setMeasuredDistance(null);
        setRoadLoading(true);
        fetch(`https://router.project-osrm.org/route/v1/driving/${mLng},${mLat};${clickedLng.toFixed(6)},${clickedLat.toFixed(6)}?overview=false`)
          .then(res => res.json()).then(osrmData => { if (osrmData?.routes?.[0]) setRoadDistance(Math.round(osrmData.routes[0].distance)); else setRoadDistance(null); })
          .catch(() => setRoadDistance(null)).finally(() => setRoadLoading(false));
      }
    });
  }, [leafletLoaded, mapType, form.lat, form.lng]);

  useEffect(() => {
    if (propertyData?.[0]) {
      const data = propertyData[0];
      setForm(f => ({ ...defaultForm, ...data }));
      if (data.lat && data.lng) {
        setCoordsInput(`${data.lat}, ${data.lng}`);
      }
    }
  }, [propertyData]);

  async function handleAutoScanNearbyRadar() {
    if (!form.lat || !form.lng) { toast.error("Radar taraması için önce mülk koordinatlarını kilitlemelisiniz!"); return; }
    setRadarLoading(true); setRadarResults([]); const lat = form.lat; const lng = form.lng;
    const query = `[out:json][timeout:60]; 
    ( 
      nwr["shop"="mall"](around:5000,${lat},${lng});
      nwr["shop"="supermarket"](around:2000,${lat},${lng}); 
      nwr["amenity"="hospital"](around:5000,${lat},${lng});
      nwr["railway"~"station|subway_entrance|tram_stop"](around:5000,${lat},${lng});
      nwr["highway"="bus_stop"](around:2000,${lat},${lng});
      nwr["amenity"="restaurant"](around:1500,${lat},${lng}); 
      nwr["amenity"="cafe"](around:1500,${lat},${lng}); 
      nwr["tourism"="museum"](around:10000,${lat},${lng});
      nwr["historic"~"castle|ruins|archaeological_site|monument"](around:10000,${lat},${lng});
      nwr["amenity"="university"](around:15000,${lat},${lng});
    ); out center;`;
    const endpoints = [ `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}` ];
    try {
      let rawData = null; for (const url of endpoints) { try { const response = await fetch(url); if (response.ok) { rawData = await response.json(); break; } } catch (e) { console.warn("Yedek hatta geçiliyor..."); } }
      if (!rawData) { toast.error("Radar yoğunluğu var, lütfen az sonra tekrar deneyin."); return; }
      if (rawData.elements && rawData.elements.length > 0) {
        const parsedItems = rawData.elements.map(el => {
          const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if (!elLat || !elLon) return null;
          const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon); 
          let typeLabel = "📍 Konum"; const tags = el.tags || {}; const nameUpper = (tags.name || tags.operator || tags.description || '').toUpperCase();
          if (tags.shop === 'mall') typeLabel = "🛍️ AVM";
          else if (tags.shop === 'supermarket' || tags.shop === 'convenience') typeLabel = "🛒 Market";
          else if (tags.amenity === 'hospital') typeLabel = "🏥 Hastane";
          else if (nameUpper.includes('METROBÜS') || nameUpper.includes('METROBUS') || tags.line === 'Metrobüs') typeLabel = "🚌 Metrobüs Durağı";
          else if (tags.railway === 'station' && (tags.station === 'subway' || tags.subway === 'yes' || nameUpper.includes('METRO'))) typeLabel = "🚇 Metro İstasyonu";
          else if (tags.railway === 'subway_entrance') typeLabel = "🚇 Metro Girişi";
          else if (tags.railway === 'tram_stop' || nameUpper.includes('TRAMVAY')) typeLabel = "🚋 Tramvay";
          else if (tags.highway === 'bus_stop' || tags.public_transport === 'platform') typeLabel = "🚌 Otobüs Durağı";
          else if (tags.amenity === 'restaurant') typeLabel = "🍔 Restoran";
          else if (tags.amenity === 'cafe') typeLabel = "☕ Kafe";
          else if (tags.tourism === 'museum') typeLabel = "🏛️ Müze";
          else if (tags.historic) typeLabel = "🏺 Tarihi Bölge";
          else if (tags.amenity === 'university') typeLabel = "🎓 Üniversite";
          return { id: el.id, name: tags.name || tags.operator || `${typeLabel} (İsimsiz)`, type: typeLabel, distance: distance };
        }).filter(Boolean);
        parsedItems.sort((a, b) => a.distance - b.distance); setRadarResults(parsedItems.slice(0, 20)); toast.success("Çevredeki tüm nizamî donatılar başarıyla radara bağlandı!");
      } else { toast.error("Yakın çevrede kayıtlı önemli bir konum bulunamadı."); }
    } catch (err) { console.error(err); toast.error("Radar verisi işlenirken teknik bir kesinti oluştu."); } finally { setRadarLoading(false); }
  }

  async function handleFindNearestAirports() {
    if (!form.lat || !form.lng) { toast.error("Önce koordinatları kilitleyin!"); return; }
    setAirportLoading(true); setAirportResults([]);
    const lat = form.lat; const lng = form.lng;
    const query = `[out:json][timeout:60]; ( nwr["aeroway"="aerodrome"]["iata"]["military"!="yes"](around:300000,${lat},${lng}); ); out center;`;
    const endpoints = [`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`];
    try {
      let rawData = null;
      for (const url of endpoints) { try { const r = await fetch(url); if (r.ok) { rawData = await r.json(); break; } } catch(e) {} }
      if (!rawData?.elements?.length) { toast.error("300 km içinde kayıtlı sivil havalimanı bulunamadı."); return; }
      const parsed = rawData.elements.map(el => {
        const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if (!elLat || !elLon) return null;
        const tags = el.tags || {};
        if (tags.military === 'yes' || tags['aerodrome:type'] === 'military' || (tags.name || '').toLowerCase().includes('askeri')) return null;
        const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon);
        return { id: el.id, name: tags.name || tags['name:tr'] || 'İsimsiz Havalimanı', iata: tags.iata || null, icao: tags.icao || '', distance, _lat: elLat, _lon: elLon };
      }).filter(Boolean);
      parsed.sort((a, b) => a.distance - b.distance);
      const top2 = parsed.slice(0, 2); setAirportResults(top2);
      if (top2.length === 0) { toast.error("Uygun sivil havalimanı bulunamadı."); }
      else { 
        toast.success(`${top2.length} sivil havalimanı bulundu! Yürüyüş mesafeleri hesaplanıyor...`);
        const walkMap = {};
        await Promise.all(top2.map(async (ap) => {
          try {
            const apLat = ap._lat; const apLon = ap._lon; if (!apLat || !apLon) return;
            const r = await fetch(`https://router.project-osrm.org/route/v1/foot/${lng},${lat};${apLon},${apLat}?overview=false`);
            const d = await r.json();
            if (d?.routes?.[0]) walkMap[ap.id] = Math.round(d.routes[0].distance / 10) * 10;
          } catch(e) {}
        }));
        setAirportWalkDistances(walkMap);
      }
    } catch(err) { console.error(err); toast.error("Havalimanı sorgusu başarısız."); } finally { setAirportLoading(false); }
  }

  async function handleFindSeaDistance() {
    if (!form.lat || !form.lng) { toast.error("Önce koordinatları kilitleyin!"); return; }
    setSeaLoading(true); setSeaDistance(null);
    const lat = parseFloat(form.lat); const lng = parseFloat(form.lng);
    const radiusSteps = [5000, 15000, 40000, 100000];
    let found = null;
    try {
      for (const radius of radiusSteps) {
        const query = `[out:json][timeout:45]; ( way["natural"="coastline"](around:${radius},${lat},${lng}); nwr["natural"="beach"](around:${radius},${lat},${lng}); ); out geom;`;
        const endpoints = [`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`];
        let rawData = null;
        for (const url of endpoints) { try { const r = await fetch(url); if (r.ok) { rawData = await r.json(); break; } } catch(e) {} }
        if (!rawData?.elements?.length) continue;
        let minDist = Infinity; let minPoint = null;
        for (const way of rawData.elements) {
          const coords = way.geometry || (way.lat ? [{lat: way.lat, lon: way.lon}] : []);
          for (const node of coords) {
            const d = calculateHaversine(lat, lng, node.lat, node.lon);
            if (d < minDist) { minDist = d; minPoint = node; }
          }
        }
        if (minPoint) { found = { distance: minDist, lat: minPoint.lat, lon: minPoint.lon }; break; }
      }
      if (found) { setSeaDistance(found.distance); toast.success(`Denize kuş uçuşu mesafe: ${found.distance >= 1000 ? (found.distance/1000).toFixed(2)+' km' : found.distance+' m'}`); } 
      else { toast.error("100 km içinde deniz kıyısı bulunamadı."); }
    } catch(err) { console.error(err); toast.error("Deniz mesafesi hesaplanamadı."); } finally { setSeaLoading(false); }
  }

  async function handleFindNearestMarket() {
    if (!form.lat || !form.lng) { toast.error("Önce koordinatları kilitleyin!"); return; }
    setMarketLoading(true); setMarketResult(null);
    const lat = form.lat; const lng = form.lng;
    const query = `[out:json][timeout:30]; ( nwr["shop"="mall"](around:4000,${lat},${lng}); nwr["shop"="supermarket"](around:3000,${lat},${lng}); nwr["shop"="wholesale"](around:3000,${lat},${lng}); ); out center;`;
    const endpoints = [`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`];
    try {
      let rawData = null;
      for (const url of endpoints) { try { const r = await fetch(url); if (r.ok) { rawData = await r.json(); break; } } catch(e) {} }
      if (!rawData?.elements?.length) { toast.error("Yakınlarda AVM veya Market bulunamadı."); return; }
      const parsed = rawData.elements.map(el => {
        const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if (!elLat || !elLon) return null;
        const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon);
        return { id: el.id, name: el.tags?.name || el.tags?.operator || 'İsimsiz', type: el.tags?.shop === 'mall' ? 'AVM' : 'Market', brand: el.tags?.brand || null, distance };
      }).filter(Boolean);
      parsed.sort((a, b) => a.distance - b.distance);
      const best = parsed[0]; setMarketResult(best);
      toast.success(`En yakın ${best.type}: ${best.name} (${best.distance >= 1000 ? (best.distance/1000).toFixed(2)+' km' : best.distance+' m'})`);
    } catch(err) { console.error(err); toast.error("Market sorgusu başarısız."); } finally { setMarketLoading(false); }
  }

  async function handleFindNearestHospital() {
    if (!form.lat || !form.lng) { toast.error("Önce koordinatları kilitleyin!"); return; }
    setHospitalLoading(true); setHospitalResults([]); const lat = form.lat; const lng = form.lng;
    const query = `[out:json][timeout:30]; ( nwr["amenity"="hospital"](around:15000,${lat},${lng}); ); out center;`;
    try {
      const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`); const rawData = await r.json();
      if (!rawData?.elements?.length) { toast.error("15 km içinde hastane bulunamadı."); return; }
      const parsed = rawData.elements.map(el => {
        const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if (!elLat || !elLon) return null;
        const nameUpper = (el.tags?.name || '').toUpperCase(); const type = (nameUpper.includes('DEVLET') || nameUpper.includes('ŞEHİR') || nameUpper.includes('EĞİTİM')) ? 'Devlet Hastanesi' : 'Özel/Diğer Hastane';
        const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon); return { id: el.id, name: el.tags?.name || 'İsimsiz Hastane', type, distance };
      }).filter(Boolean);
      parsed.sort((a, b) => a.distance - b.distance); setHospitalResults(parsed.slice(0, 2)); toast.success("Hastaneler bulundu!");
    } catch(err) { toast.error("Hastane sorgusu başarısız."); } finally { setHospitalLoading(false); }
  }

  // ============================================================
  // GELİŞTİRİLMİŞ ULAŞIM SORGULAMA FONKSİYONU
  // Türkiye'ye özel metro, metrobüs, tramvay, dolmuş desteği
  // 3 yedek sunucu + akıllı tip tespiti
  // ============================================================
  async function handleFindNearestTransport() {
    if (!form.lat || !form.lng) {
      toast.error("Önce koordinatları kilitleyin!");
      return;
    }
    setTransportLoading(true);
    setTransportResults([]);
    const lat = form.lat;
    const lng = form.lng;

    // Türkiye'ye özel çok kapsamlı sorgu
    const query = `
      [out:json][timeout:60];
      (
        nwr["railway"="station"](around:8000,${lat},${lng});
        nwr["railway"="subway_entrance"](around:8000,${lat},${lng});
        nwr["railway"="tram_stop"](around:3000,${lat},${lng});
        nwr["railway"="halt"](around:5000,${lat},${lng});
        nwr["public_transport"="station"](around:8000,${lat},${lng});
        nwr["public_transport"="stop_position"](around:3000,${lat},${lng});
        nwr["public_transport"="platform"](around:3000,${lat},${lng});
        nwr["highway"="bus_stop"](around:2000,${lat},${lng});
        nwr["amenity"="bus_station"](around:5000,${lat},${lng});
        nwr["network"~"İETT|IETT|Metro|Metrobüs|BRT|EGO|İzban"](around:5000,${lat},${lng});
        nwr["operator"~"İETT|IETT|Metro İstanbul|Başkentray|EGO|İZBAN|İzban|Marmaray"](around:8000,${lat},${lng});
        nwr["line"~"subway|tram|light_rail|bus_rapid_transit|monorail"](around:8000,${lat},${lng});
      );
      out center;
    `;

    // 3 yedek endpoint
    const endpoints = [
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://lz4.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      `https://z.overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    ];

    // Türkiye'ye özel akıllı tip tespiti
    const detectType = (tags, name) => {
      const n = (name || "").toUpperCase();
      const network = (tags.network || "").toUpperCase();
      const operator = (tags.operator || "").toUpperCase();
      const line = (tags.line || tags.railway || tags.public_transport || "").toLowerCase();

      // Metrobüs (BRT) — önce kontrol et
      if (
        n.includes("METROBÜS") || n.includes("METROBUS") ||
        network.includes("METROBÜS") || line === "bus_rapid_transit" ||
        (operator.includes("İETT") && n.includes("BRT"))
      ) return { label: "🚌 Metrobüs", priority: 1 };

      // Metro
      if (
        n.includes("METRO") ||
        tags.station === "subway" || tags.subway === "yes" ||
        line === "subway" || operator.includes("METRO İSTANBUL") ||
        tags.railway === "subway_entrance"
      ) return { label: "🚇 Metro", priority: 1 };

      // Tramvay
      if (
        n.includes("TRAMVAY") ||
        tags.railway === "tram_stop" || line === "tram" || line.includes("tram")
      ) return { label: "🚋 Tramvay", priority: 2 };

      // Marmaray / Banliyö
      if (
        n.includes("MARMARAY") || n.includes("BANLIYÖ") || n.includes("BAŞKENTRAY") ||
        n.includes("İZBAN") || n.includes("IZBAN") || line === "light_rail" ||
        operator.includes("MARMARAY") || operator.includes("BAŞKENTRAY")
      ) return { label: "🚆 Banliyö / Marmaray", priority: 1 };

      // Genel tren istasyonu
      if (tags.railway === "station" || tags.railway === "halt") {
        return { label: "🚉 Tren İstasyonu", priority: 2 };
      }

      // Otobüs terminali
      if (tags.amenity === "bus_station") return { label: "🚌 Otobüs Terminali", priority: 3 };

      // Dolmuş/Minibüs
      if (n.includes("DOLMUŞ") || n.includes("MİNİBÜS") || n.includes("DOLMUS")) {
        return { label: "🚐 Dolmuş", priority: 3 };
      }

      // Normal otobüs durağı
      if (
        tags.highway === "bus_stop" ||
        tags.public_transport === "platform" ||
        tags.public_transport === "stop_position"
      ) return { label: "🚌 Otobüs Durağı", priority: 4 };

      return { label: "🚏 Toplu Taşıma", priority: 5 };
    };

    try {
      let rawData = null;
      for (const url of endpoints) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (response.ok) {
            rawData = await response.json();
            break;
          }
        } catch (e) {
          console.warn("Yedek endpoint deneniyor...", e?.message);
        }
      }

      if (!rawData?.elements?.length) {
        toast.error("Yakında kayıtlı toplu taşıma noktası bulunamadı.");
        return;
      }

      // Elementleri parse et
      const parsed = rawData.elements
        .map((el) => {
          const elLat = el.lat || el.center?.lat;
          const elLon = el.lon || el.center?.lon;
          if (!elLat || !elLon) return null;
          const tags = el.tags || {};
          const name = tags.name || tags["name:tr"] || tags.operator || tags.ref || null;
          if (!name) return null;
          const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon);
          const { label, priority } = detectType(tags, name);
          return { id: el.id, name, type: label, priority, distance };
        })
        .filter(Boolean);

      if (!parsed.length) {
        toast.error("Tanımlanabilir toplu taşıma noktası bulunamadı.");
        return;
      }

      // Her tip için en yakın 1 tane al
      const bestByType = {};
      parsed.forEach((item) => {
        const key = item.type;
        if (!bestByType[key] || item.distance < bestByType[key].distance) {
          bestByType[key] = item;
        }
      });

      // Önceliğe göre sırala, max 5 göster
      const results = Object.values(bestByType)
        .sort((a, b) => a.priority - b.priority || a.distance - b.distance)
        .slice(0, 5);

      setTransportResults(results);
      toast.success(`${results.length} farklı ulaşım türü bulundu!`);

    } catch (err) {
      console.error(err);
      toast.error("Ulaşım sorgusu başarısız oldu.");
    } finally {
      setTransportLoading(false);
    }
  }

  async function handleFindUniversity() {
    if (!form.lat || !form.lng) { toast.error("Önce koordinatları kilitleyin!"); return; }
    setUniLoading(true); setUniResults([]); const lat = form.lat; const lng = form.lng;
    const query = `[out:json][timeout:30]; ( nwr["amenity"="university"](around:20000,${lat},${lng}); ); out center;`;
    try {
      const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`); const rawData = await r.json();
      if (!rawData?.elements?.length) { toast.error("20 km içinde üniversite bulunamadı."); return; }
      const parsed = rawData.elements.map(el => {
        const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if (!elLat || !elLon) return null;
        const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon); return { id: el.id, name: el.tags?.name || 'İsimsiz Üniversite', type: 'Üniversite', distance };
      }).filter(Boolean);
      parsed.sort((a, b) => a.distance - b.distance); setUniResults(parsed.slice(0, 2)); toast.success("Üniversiteler bulundu!");
    } catch(err) { toast.error("Üniversite sorgusu başarısız."); } finally { setUniLoading(false); }
  }

  async function handleFindCultureAndHistory() {
    if (!form.lat || !form.lng) { toast.error("Önce koordinatları kilitleyin!"); return; }
    setCultureLoading(true); setCultureResults([]); const lat = form.lat; const lng = form.lng;
    const query = `[out:json][timeout:30]; ( nwr["tourism"="museum"](around:15000,${lat},${lng}); nwr["historic"~"castle|ruins|archaeological_site|monument"](around:15000,${lat},${lng}); ); out center;`;
    try {
      const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`); const rawData = await r.json();
      if (!rawData?.elements?.length) { toast.error("15 km içinde müze veya tarihi bölge bulunamadı."); return; }
      const parsed = rawData.elements.map(el => {
        const elLat = el.lat || el.center?.lat; const elLon = el.lon || el.center?.lon; if (!elLat || !elLon) return null;
        const distance = calculateHaversine(parseFloat(lat), parseFloat(lng), elLat, elLon); const type = el.tags?.tourism === 'museum' ? 'Müze' : 'Tarihi Bölge';
        return { id: el.id, name: el.tags?.name || `İsimsiz ${type}`, type, distance };
      }).filter(Boolean);
      parsed.sort((a, b) => a.distance - b.distance); const namedResults = parsed.filter(item => !item.name.includes('İsimsiz'));
      setCultureResults(namedResults.slice(0, 3)); toast.success("Tarihi alanlar listelendi!");
    } catch(err) { toast.error("Kültür sorgusu başarısız."); } finally { setCultureLoading(false); }
  }

  async function handleGoToMainCoords() {
    if (!coordsInput.trim()) { toast.error("Lütfen koordinatları girin."); return; }
    const coordRegex = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/; if (!coordRegex.test(coordsInput)) { toast.error("Format hatalı!"); return; }
    const parts = coordsInput.split(','); const lat = parts[0].trim(); const lng = parts[1].trim(); setForm(prev => ({ ...prev, lat, lng }));
    if (mapRef.current && leafletLoaded) {
      const L = window.L; mapRef.current.flyTo([parseFloat(lat), parseFloat(lng)], 15, { animate: true, duration: 1.2 });
      if (!mainMarkerRef.current) {
        mainMarkerRef.current = L.marker([parseFloat(lat), parseFloat(lng)], { icon: L.divIcon({ html: `<div class="w-6 h-6 bg-teal-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">🏠</div>`, className: '', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(mapRef.current);
      } else { mainMarkerRef.current.setLatLng([parseFloat(lat), parseFloat(lng)]); }
    }
    setGeoLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=tr`);
      const data = await res.json();
      if (data?.address) {
        const addr = data.address;
        const city = (addr.province || addr.city || addr.state || '').toLowerCase().replace(' ili', '').replace('büyükşehir belediyesi', '').trim();
        const district = (addr.district || addr.city_district || addr.town || addr.borough || '').trim();
        let rawMahalle = '';
        if (addr.neighborhood && addr.neighborhood.trim() !== district) rawMahalle = addr.neighborhood;
        else if (addr.neighbourhood && addr.neighbourhood.trim() !== district) rawMahalle = addr.neighbourhood;
        else if (addr.quarter && addr.quarter.trim() !== district) rawMahalle = addr.quarter;
        else if (addr.suburb && addr.suburb.trim() !== district) rawMahalle = addr.suburb;
        else if (addr.village && addr.village.trim() !== district) rawMahalle = addr.village;
        let cleanNeighbourhood = rawMahalle.trim(); cleanNeighbourhood = cleanNeighbourhood.replace(/\s+(Mahallesi|mahallesi|Mah\.|mah\.|Mah|mah)$/i, '');
        setForm(prev => ({ ...prev, city, district, neighborhood: cleanNeighbourhood })); toast.success("Saf adres hiyerarşisi haritadan başarıyla çözüldü!");
      }
    } catch (err) { console.error(err); } finally { setGeoLoading(false); }
  }

  async function handleProcessLocationSelection(lat, lon, displayName) {
    if (!leafletLoaded || !mapRef.current) return;
    const targetLat = parseFloat(lat); const targetLng = parseFloat(lon); mapRef.current.flyTo([targetLat, targetLng], 15, { animate: true, duration: 1.2 }); setTargetCoordsInput(`${targetLat.toFixed(6)}, ${targetLng.toFixed(6)}`);
    if (!targetMarkerRef.current) {
      targetMarkerRef.current = window.L.marker([targetLat, targetLng], { icon: window.L.divIcon({ html: `<div class="w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">🎯</div>`, className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(mapRef.current);
    } else { targetMarkerRef.current.setLatLng([targetLat, targetLng]); }
    if (formRef.current.lat && formRef.current.lng) {
      const mLat = parseFloat(formRef.current.lat); const mLng = parseFloat(formRef.current.lng);
      if (!polylineRef.current) polylineRef.current = window.L.polyline([[mLat, mLng], [targetLat, targetLng]], { color: '#4f46e5', weight: 3, dashArray: '5, 5' }).addTo(mapRef.current);
      else polylineRef.current.setLatLngs([[mLat, mLng], [targetLat, targetLng]]); 
      const crowMeters = calculateHaversine(mLat, mLng, targetLat, targetLng); setCrowDistance(crowMeters); setSelectedDistanceType(null); setMeasuredDistance(null);
      setRoadLoading(true);
      try {
        const roadRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${mLng},${mLat};${targetLng},${targetLat}?overview=false`); const roadData = await roadRes.json();
        if (roadData?.routes?.[0]) setRoadDistance(Math.round(roadData.routes[0].distance)); else setRoadDistance(null);
      } catch (err) { console.error(err); setRoadDistance(null); } finally { setRoadLoading(false); }
    }
    setSuggestions([]); 
  }

  async function handleManualSearchClick() {
    if (!mapSearchQuery.trim()) return; setSearchLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1&accept-language=tr`); const data = await res.json();
      if (data && data.length > 0) await handleProcessLocationSelection(data[0].lat, data[0].lon, data[0].display_name); else toast.error("Konum bulunamadı.");
    } catch (err) { console.error(err); } finally { setSearchLoading(false); }
  }

  function handleSelectCategoryAndSave(chosenLabel, customMeters = null) {
    const finalMeters = customMeters || measuredDistance; if (!finalMeters) { toast.error("Mesafe değeri bulunamadı!"); return; }
    handleInputChangeValue(chosenLabel, String(finalMeters));
    setAddedLabels(prev => new Set([...prev, chosenLabel]));
    setTargetCoordsInput(''); setMeasuredDistance(null); setCrowDistance(null); setRoadDistance(null); setSelectedDistanceType(null); setMapSearchQuery('');
    if (targetMarkerRef.current && mapRef.current) mapRef.current.removeLayer(targetMarkerRef.current);
    if (polylineRef.current && mapRef.current) mapRef.current.removeLayer(polylineRef.current);
    targetMarkerRef.current = null; polylineRef.current = null;
    toast.success(`"${chosenLabel}" mesafesi başarıyla kutusuna senkronize edildi!`);
  }

  if (!isNew && loadingProperty) return (
    <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>
  );

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-none">
      
      {/* SOL TARAF */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 text-xs font-black">01</div>
            <div>
              <h1 className="text-xs font-black text-gray-800 uppercase tracking-tight">Lokasyon & Mesafe İstasyonu</h1>
              <p className="text-[10px] text-gray-400">Çift yönlü nizamî senkronizasyon ve konumsal zırh paneli.</p>
            </div>
          </div>
        </div>

        {/* PROJE ADI & NOT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">🏗️ Proje Adı</label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:bg-white focus-within:border-teal-500 transition-all shadow-2xs">
              <input type="text" value={form.project_name || ''} onChange={e => setForm(p => ({ ...p, project_name: e.target.value }))} placeholder="Örn: Marina Residence, Akdeniz Villaları..." className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">📝 Not</label>
            <textarea value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Bu ilana özel hatırlatmalar, özel notlar..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-700 placeholder-gray-300 focus:bg-white focus:outline-none focus:border-teal-500 transition-all shadow-2xs resize-none leading-relaxed" />
          </div>
        </div>

        {/* ANA KOORDİNAT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Mülk Ana Koordinatları
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus-within:bg-white focus-within:border-teal-500 shadow-2xs flex gap-2">
              <input type="text" value={coordsInput} onChange={e => setCoordsInput(e.target.value)} placeholder="Örn: 36.542849, 32.037513" className="w-full bg-transparent border-0 p-0 text-xs font-mono font-bold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none" />
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin text-teal-600 flex-shrink-0" /> : <button type="button" onClick={handleGoToMainCoords} className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0"><Navigation className="w-3 h-3 rotate-45" /> Konuma Git</button>}
            </div>
          </div>

          {/* AKILLI HIZLI SORGULAR */}
          {form.lat && form.lng && (
            <div className="space-y-3 pt-1 border-t border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">⚡ Akıllı Hızlı Sorgular</p>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={handleFindNearestAirports} disabled={airportLoading} className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{airportLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '✈️'} Havalimanı Bul</button>
                <button type="button" onClick={handleFindSeaDistance} disabled={seaLoading} className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{seaLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '🌊'} Denize Mesafe</button>
                <button type="button" onClick={handleFindNearestMarket} disabled={marketLoading} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{marketLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '🛍️'} AVM / Market Bul</button>
                <button type="button" onClick={handleFindNearestHospital} disabled={hospitalLoading} className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{hospitalLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '🏥'} Hastane Bul</button>
                <button type="button" onClick={handleFindUniversity} disabled={uniLoading} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{uniLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '🎓'} Üniversite Bul</button>
                <button type="button" onClick={handleFindNearestTransport} disabled={transportLoading} className="bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{transportLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '🚇'} Ulaşım Ağları</button>
                <button type="button" onClick={handleFindCultureAndHistory} disabled={cultureLoading} className="col-span-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">{cultureLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '🏺'} Tarihi Bölgeler & Müzeleri Bul</button>
              </div>

              {/* SORGU SONUÇLARI */}
              <div className="space-y-2 mt-2">
                {airportResults.map(r => (
                  <div key={r.id} className="text-[10px] bg-sky-50 border border-sky-100 p-2 rounded-lg flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-sky-800">✈️ {r.name} {r.iata ? `(${r.iata})` : ''}</span>
                      <span className="text-[9px] text-sky-600">{r.distance}m kuş uçuşu {airportWalkDistances[r.id] ? `• ${airportWalkDistances[r.id]}m yürüme` : ''}</span>
                    </div>
                    {addedLabels.has('Havalimanı') ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">✅ Forma Eklendi</span>
                    ) : (
                      <button type="button" onClick={() => handleSelectCategoryAndSave('Havalimanı', airportWalkDistances[r.id] ?? r.distance)} className="bg-sky-600 text-white px-2 py-1 rounded font-bold">+ Forma Ekle</button>
                    )}
                  </div>
                ))}
                {seaDistance !== null && (
                  <div className="text-[10px] bg-cyan-50 border border-cyan-100 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-cyan-800">🌊 Plaj/Kıyı ({seaDistance}m)</span>
                    {addedLabels.has('Denize') ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">✅ Forma Eklendi</span>
                    ) : (
                      <button type="button" onClick={() => handleSelectCategoryAndSave('Denize', seaDistance)} className="bg-cyan-600 text-white px-2 py-1 rounded font-bold">+ Forma Ekle</button>
                    )}
                  </div>
                )}
                {marketResult && (
                  <div className="text-[10px] bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-emerald-800">🛍️ {marketResult.name} {marketResult.brand ? `(${marketResult.brand})` : ''} ({marketResult.distance}m)</span>
                    {addedLabels.has('AVM / Market') ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">✅ Forma Eklendi</span>
                    ) : (
                      <button type="button" onClick={() => handleSelectCategoryAndSave('AVM / Market', marketResult.distance)} className="bg-emerald-600 text-white px-2 py-1 rounded font-bold">+ Forma Ekle</button>
                    )}
                  </div>
                )}
                {hospitalResults.map(r => (
                  <div key={r.id} className="text-[10px] bg-rose-50 border border-rose-100 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-rose-800">🏥 {r.name} - {r.type} ({r.distance}m)</span>
                    {addedLabels.has(r.type) ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">✅ Forma Eklendi</span>
                    ) : (
                      <button type="button" onClick={() => handleSelectCategoryAndSave(r.type, r.distance)} className="bg-rose-600 text-white px-2 py-1 rounded font-bold">+ Forma Ekle</button>
                    )}
                  </div>
                ))}

                {/* GELİŞTİRİLMİŞ ULAŞIM SONUÇLARI — tip ve isim gösterir */}
                {transportResults.map(r => (
                  <div key={r.id} className="text-[10px] bg-fuchsia-50 border border-fuchsia-100 p-2 rounded-lg flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-fuchsia-800">{r.type} — {r.name}</span>
                      <span className="text-[9px] text-fuchsia-500">
                        {r.distance >= 1000
                          ? `${(r.distance / 1000).toFixed(2)} km`
                          : `${r.distance} m`} uzaklıkta
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectCategoryAndSave(`${r.type} - ${r.name}`, r.distance)}
                      className="bg-fuchsia-600 text-white px-2 py-1 rounded font-bold flex-shrink-0 ml-2"
                    >
                      + Forma Ekle
                    </button>
                  </div>
                ))}

                {uniResults.map(r => (
                  <div key={r.id} className="text-[10px] bg-indigo-50 border border-indigo-100 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-indigo-800">🎓 {r.name} ({r.distance}m)</span>
                    <button type="button" onClick={() => handleSelectCategoryAndSave(r.name, r.distance)} className="bg-indigo-600 text-white px-2 py-1 rounded font-bold">+ Forma Ekle</button>
                  </div>
                ))}
                {cultureResults.map(r => (
                  <div key={r.id} className="text-[10px] bg-amber-50 border border-amber-100 p-2 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-amber-800">{r.type === 'Müze' ? '🏛️' : '🏺'} {r.name} ({r.distance}m)</span>
                    <button type="button" onClick={() => handleSelectCategoryAndSave(r.name, r.distance)} className="bg-amber-600 text-white px-2 py-1 rounded font-bold">+ Forma Ekle</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANA KURUMSAL MESAFE KARTLARI */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">📌 Ana Kurumsal Mesafe Kartları</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">🏖️ Denize Uzaklık</label>
                <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-2 focus-within:bg-white focus-within:border-teal-500 shadow-2xs">
                  <input type="text" value={getDistanceMeters('Denize')} onChange={e => handleInputChangeValue('Denize', e.target.value)} placeholder="m cinsinden" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  <button type="button" onClick={() => handleToggleVisibilityByLabel('Denize')} className="text-slate-400 hover:text-teal-600 ml-1">{getDistanceVisibility('Denize') ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">🏙️ Şehir Merkezi</label>
                <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-2 focus-within:bg-white focus-within:border-teal-500 shadow-2xs">
                  <input type="text" value={getDistanceMeters('Merkeze')} onChange={e => handleInputChangeValue('Merkeze', e.target.value)} placeholder="m cinsinden" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  <button type="button" onClick={() => handleToggleVisibilityByLabel('Merkeze')} className="text-slate-400 hover:text-teal-600 ml-1">{getDistanceVisibility('Merkeze') ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">✈️ Havalimanı</label>
                <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-2 focus-within:bg-white focus-within:border-teal-500 shadow-2xs">
                  <input type="text" value={getDistanceMeters('Havalimanı')} onChange={e => handleInputChangeValue('Havalimanı', e.target.value)} placeholder="m cinsinden" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  <button type="button" onClick={() => handleToggleVisibilityByLabel('Havalimanı')} className="text-slate-400 hover:text-teal-600 ml-1">{getDistanceVisibility('Havalimanı') ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase">🛒 AVM / Market</label>
                <div className="flex items-center bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-2 focus-within:bg-white focus-within:border-teal-500 shadow-2xs">
                  <input type="text" value={getDistanceMeters('AVM / Market')} onChange={e => handleInputChangeValue('AVM / Market', e.target.value)} placeholder="m cinsinden" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  <button type="button" onClick={() => handleToggleVisibilityByLabel('AVM / Market')} className="ml-1">{getDistanceVisibility('AVM / Market') ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}</button>
                </div>
              </div>
            </div>
          </div>

          {/* ŞEHİR / İLÇE / MAHALLE */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100/70">
              <span className="text-[11px] font-bold text-gray-500 w-16 pl-1">ŞEHİR</span>
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 focus:outline-none capitalize" placeholder="Bekleniyor..." />
              <button type="button" onClick={() => setForm(p => ({ ...p, city_visible: !p.city_visible }))} className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${form.city_visible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{form.city_visible ? 'Göster' : 'Gizle'}</button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100/70">
              <span className="text-[11px] font-bold text-gray-500 w-16 pl-1">İLÇE</span>
              <input type="text" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none" placeholder="Bekleniyor..." />
              <button type="button" onClick={() => setForm(p => ({ ...p, district_visible: !p.district_visible }))} className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${form.district_visible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{form.district_visible ? 'Göster' : 'Gizle'}</button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100/70">
              <span className="text-[11px] font-bold text-gray-500 w-16 pl-1">MAHALLE</span>
              <input type="text" value={form.neighborhood} onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))} className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 focus:outline-none" placeholder="Bekleniyor..." />
              <button type="button" onClick={() => setForm(p => ({ ...p, neighborhood_visible: !p.neighborhood_visible }))} className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${form.neighborhood_visible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{form.neighborhood_visible ? 'Göster' : 'Gizle'}</button>
            </div>
          </div>
        </div>

        {/* EKSTRA KONUMLAR */}
        {extraDistances && extraDistances.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-0.5">🌟 İlana Bağlanan Ekstra Konumlar</h4>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {extraDistances.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between border rounded-xl p-2.5 transition-all shadow-2xs ${item.visible ? 'bg-white border-teal-100' : 'bg-gray-50/70 border-gray-200 opacity-70'}`}>
                  <div className="flex flex-col max-w-[50%]">
                    <span className="truncate text-[11px] font-black text-gray-800" title={item.label}>📍 {item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold text-teal-600 w-16 text-right">
                      {isNaN(item.meters) ? item.meters : (Number(item.meters) >= 1000 ? `${(Number(item.meters) / 1000).toFixed(2)} km` : `${item.meters} m`)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); const fullIdx = form.distances.findIndex(d => d.label === item.label); if (fullIdx > -1) toggleDistanceVisibility(fullIdx); }}
                      className={`text-[9px] font-black px-2 py-1 rounded flex items-center gap-1 border transition-colors ${item.visible ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
                    >
                      {item.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, distances: p.distances.filter(d => d.label !== item.label) })); }} 
                      className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SAĞ TARAF */}
      <div className="lg:col-span-7 space-y-4 sticky top-6">

        {/* HARİTA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="relative">
            <div className="flex gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1.5 focus-within:border-teal-500 focus-within:bg-white shadow-sm">
              <input type="text" value={mapSearchQuery} onChange={e => setMapSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualSearchClick()} placeholder="Harita üzerinde konum arayın..." className="w-full bg-transparent border-0 px-2 py-1 text-xs font-bold text-gray-700 focus:ring-0 outline-none" />
              <button type="button" onClick={() => setMapType(mapType === 'satellite' ? 'standard' : 'satellite')} className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[10px] font-black ${mapType === 'satellite' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200'}`} title="Katman Değiştir"><Layers className="w-3.5 h-3.5" />{mapType === 'satellite' ? 'Uydu Açık' : 'Uyduyu Aç'}</button>
              <button type="button" onClick={handleManualSearchClick} disabled={searchLoading} className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all flex-shrink-0">{searchLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />} Bul</button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-64 overflow-y-auto z-[9999] p-1 divide-y divide-gray-50 animate-in fade-in duration-150">
                {suggestions.map((item, idx) => (
                  <button key={idx} type="button" onClick={() => handleProcessLocationSelection(item.lat, item.lon, item.display_name)} className="w-full text-left px-3 py-2.5 text-[11px] font-bold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors rounded-lg flex items-center gap-2 truncate">
                    <span className="text-gray-400 flex-shrink-0">📍</span>
                    <span className="truncate">{item.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div id="interactive-map" className="rounded-xl border border-gray-200 shadow-inner h-[530px] w-full z-10" style={{ minHeight: '530px' }} />
        </div>

        {/* MANUEL HARİTA KONSOLU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-indigo-600" /> Manuel Harita Konsolu</h3>
            <button type="button" onClick={() => setIsClickSelectActive(!isClickSelectActive)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${isClickSelectActive ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}><Crosshair className="w-3 h-3" />{isClickSelectActive ? 'Haritadan Seçim Açık' : 'Haritadan Seçimi Aç'}</button>
          </div>
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-600">
            <div>🛰️ Hedef Nokta: {targetCoordsInput || <span className="text-gray-400 font-normal">Haritaya tıklayarak veya aratarak pin bırakın...</span>}</div>
          </div>
          {crowDistance !== null && (
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span className={`text-xs font-bold transition-all ${selectedDistanceType === 'road' ? 'line-through text-gray-300' : 'text-slate-700'}`}>📏 Kuş Uçuşu: <span className="font-mono text-teal-600 bg-teal-50/50 px-1.5 py-0.5 rounded ml-1">{crowDistance} m</span></span>
                {selectedDistanceType === null && <button type="button" onClick={() => { setSelectedDistanceType('crow'); setMeasuredDistance(crowDistance); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-md transition-all shadow-xs">Kullan</button>}
              </div>
              <div className="flex items-center justify-between py-1">
                <span className={`text-xs font-bold transition-all ${selectedDistanceType === 'crow' ? 'line-through text-gray-300' : 'text-slate-700'}`}>🚗 En Kısa Yol: {roadLoading ? <span className="text-[11px] text-gray-400 italic">Hesaplanıyor...</span> : <span className="font-mono text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded ml-1">{roadDistance ? `${roadDistance} m` : 'Hesaplanamadı'}</span>}</span>
                {selectedDistanceType === null && !roadLoading && roadDistance && <button type="button" onClick={() => { setSelectedDistanceType('road'); setMeasuredDistance(roadDistance); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-md transition-all shadow-xs">Kullan</button>}
              </div>
              {measuredDistance !== null && (
                <div className="pt-2 border-t border-dashed border-gray-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">✍️ Seçilen Mesafeyi Düzenle (İsteğe Bağlı)</label>
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-teal-500 focus-within:bg-white transition-all shadow-sm"><input type="number" value={measuredDistance === null ? '' : measuredDistance} onChange={e => setMeasuredDistance(e.target.value === '' ? null : Number(e.target.value))} className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" /><span className="text-xs text-gray-400 font-bold ml-1">m</span></div>
                </div>
              )}
              {measuredDistance !== null && (
                <div className="pt-2.5 border-t border-gray-100 space-y-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">🏷️ Mesafe Hangi Kurumsal Başlığa Atansın?</label>
                  {availableCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">{availableCategories.map((category) => <button key={category} type="button" onClick={() => handleSelectCategoryAndSave(category)} className="bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:scale-102">{category}</button>)}</div>
                  ) : ( <p className="text-[11px] text-amber-600 font-semibold italic">Tüm ana kategoriler dolduruldu!</p> )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SOSYAL ÇEVRE RADARI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><Radar className="w-4 h-4 text-rose-600 animate-pulse" /> Ulaşım & Sosyal Çevre Radarı</h3>
            <button type="button" onClick={handleAutoScanNearbyRadar} disabled={radarLoading} className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1" >{radarLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : '🌐'} Önemli Konumları Otomatik Bul</button>
          </div>
          {radarResults.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2.5 divide-y divide-slate-200/50">
              {radarResults.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-2.5 first:pt-0 gap-2">
                  <div className="flex flex-col max-w-[45%]"><span className="font-extrabold text-slate-700 truncate">{item.name}</span><span className="text-[9px] text-slate-400 font-bold">{item.type} • {item.distance >= 1000 ? `${(item.distance/1000).toFixed(1)} km` : `${item.distance} m`} kuş uçuşu</span></div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    <button type="button" onClick={() => handleSelectCategoryAndSave('Denize', item.distance)} className="bg-white hover:bg-teal-600 hover:text-white border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all">🏖️ Deniz</button>
                    <button type="button" onClick={() => handleSelectCategoryAndSave('Merkeze', item.distance)} className="bg-white hover:bg-teal-600 hover:text-white border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all">🏙️ Merkez</button>
                    <button type="button" onClick={() => handleSelectCategoryAndSave('Havalimanı', item.distance)} className="bg-white hover:bg-teal-600 hover:text-white border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all">✈️ Haval.</button>
                    <button type="button" onClick={() => handleSelectCategoryAndSave('AVM / Market', item.distance)} className="bg-white hover:bg-teal-600 hover:text-white border border-gray-200 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all">🛒 AVM</button>
                    <button type="button" onClick={() => handleSelectCategoryAndSave(item.name, item.distance)} className="bg-slate-900 hover:bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded transition-all">+ Özel</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CANLI METİN İSTASYONU */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">✍️ Portföy İlan Açıklama Metni (Düzenlenebilir)</label>
            <button type="button" onClick={handleCopyToClipboardStation} className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"><Copy className="w-3.5 h-3.5" /> Metni Panoya Kopyala</button>
          </div>
          <textarea value={compiledTextOutput} onChange={(e) => setCompiledTextOutput(e.target.value)} rows={6} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500 transition-all font-mono shadow-2xs leading-relaxed resize-y" placeholder="JSON verisini yapıştırdığınızda veya haritadan konum ekledikçe burası otomatik olarak nizamî bir portföy ilan metni üretecektir..." />
        </div>

        {/* YAPAY ZEKA JSON ENTEGRASYON */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-indigo-600">⚡ Yapay Zeka (JSON) Veri Entegrasyonu</h3>
            <a href="https://gemini.google.com/gem/1gJI0wTld-4eE1YwW064Hod3IeewO-son?usp=sharing" target="_blank" rel="noopener noreferrer" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 self-start sm:self-auto">🤖 Gemini Gem Analiz Odası</a>
          </div>
          <p className="text-[10px] text-gray-400 leading-normal">Dışarıdan veya Gemini odasından aldığınız konum, metro ve durak analiz çıktılarını aşağıdaki kutuya yapıştırarak formu otomatik doldurabilirsiniz.</p>
          <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500 transition-all shadow-2xs leading-relaxed" placeholder='{ "sorgulanan_koordinat": "...", "tahmini_bolge": "...", "onemli_yerler_ve_avmler": [...] }' />
          <button type="button" onClick={handleProcessJsonPasteStation} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98">📥 JSON Çıktısını Çözümle ve Forma Aktar</button>
        </div>

        {/* KAYDET BUTONU */}
        <div className="pt-1 flex justify-end">
          <button type="button" onClick={handleSaveAndNext} disabled={mutation.isPending} className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Kaydet ve Sonraki Adıma Geç <ArrowRight className="w-3.5 h-3.5" /></button>
        </div>

      </div>
    </div>
  );
}