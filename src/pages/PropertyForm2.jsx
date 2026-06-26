import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, Save, Loader2, LayoutGrid, Building2,
  Plus, ChevronUp, Info, Bed, Maximize2, Bath, DoorOpen, Sofa, Layers, Tag, Rocket, Wallet,
  CheckCircle2, Search, Sparkles, Award, ShieldCheck, Waves, Tv, Anchor, BrainCircuit, Home,
  Construction, MapPinned, TrendingUp, Map, GraduationCap, HelpCircle, Trash2, Braces, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];

const BASE_CATEGORIES = ['Denize', 'Merkeze', 'Havalimanı', 'AVM / Market'];

const INITIAL_ROOM_TYPE = {
  bedrooms: '', size_sqm: '', bathrooms: '', balcony: '', salon: '', 
  floor_number: '', sub_type: '', boost: 'Default', price: '', 
  currency: 'USD', old_price: '', commission: ''
};

const HIZLI_BILGILER_FIELDS = [
  { key: 'property_type', label: 'Mülk Tipi', placeholder: 'Apartment' },
  { key: 'layout', label: 'Plan (1+1 vb.)', placeholder: '1+1' },
  { key: 'net_area', label: 'Net Alan', placeholder: '55 m²' },
  { key: 'sea_distance', label: 'Denize Mesafe', placeholder: '750 m' },
  { key: 'city', label: 'Şehir', placeholder: 'Alanya' },
  { key: 'district', label: 'İlçe / Bölge', placeholder: 'Kestel' },
  { key: 'citizenship_eligible', label: 'Vatandaşlığa Uygunluk', placeholder: 'Yes / No' },
  { key: 'investment_suitable', label: 'Yatırıma Uygunluk', placeholder: 'Yes / No' },
  { key: 'construction_year', label: 'İnşaat Yılı', placeholder: '2024' },
  { key: 'view', label: 'Manzara', placeholder: 'City + Nature' },
];

const EMPTY_HIZLI_BILGILER = HIZLI_BILGILER_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {});

const LONG_TEXT_SEO_FIELDS = [
  { key: 'ai_summary', label: 'AI Özet (ai_summary)', icon: BrainCircuit, color: 'violet', placeholder: 'Bölge ve proje hakkında genel AI özeti...' },
  { key: 'mulk_ozellikleri', label: 'Mülk Özellikleri (mulk_ozellikleri)', icon: Home, color: 'teal', placeholder: 'Dairenin iç özellikleri, m², kat, eşya durumu vb...' },
  { key: 'proje_ozellikleri', label: 'Proje Özellikleri (proje_ozellikleri)', icon: Construction, color: 'cyan', placeholder: 'Sitenin sosyal donatıları, güvenlik, havuz vb...' },
  { key: 'lokasyon_avantajlari', label: 'Lokasyon Avantajları (lokasyon_avantajlari)', icon: MapPinned, color: 'emerald', placeholder: 'Denize, merkeze, havalimanına mesafe avantajları...' },
  { key: 'yatirim_analizi', label: 'Yatırım Analizi (yatirim_analizi)', icon: TrendingUp, color: 'amber', placeholder: 'Kira getirisi, değer artış potansiyeli vb...' },
  { key: 'bolge_analizi', label: 'Bölge Analizi (bolge_analizi)', icon: Map, color: 'sky', placeholder: 'Bölgenin genel sosyo-ekonomik analizi...' },
  { key: 'emlak_uzmani_gorusu', label: 'Emlak Uzmanı Görüşü (emlak_uzmani_gorusu)', icon: GraduationCap, color: 'rose', placeholder: 'Uzman yorumu / tavsiye metni...' },
];

const formatMetersValue = (m) => {
  const num = Number(m);
  if (isNaN(num)) return m;
  return num >= 1000 ? `${(num / 1000).toFixed(2)} km` : `${num} m`;
};

const SEO_FIELD_ALIASES = {
  slug: ['url_slug', 'urlslug', 'url slug', 'slug'],
  seo_title: ['seo_title', 'seotitle', 'seo title'],
  meta_title: ['meta_title', 'metatitle', 'meta title'],
  meta_description: ['meta_description', 'metadescription', 'meta description'],
  seo_content: ['seo_content', 'seocontent', 'seo content'],
  ai_summary: ['ai_summary', 'aisummary', 'ai summary'],
  mulk_ozellikleri: ['mulk_ozellikleri', 'mulkozellikleri', 'mulk ozellikleri', 'mülk_özellikleri', 'mülk özellikleri'],
  proje_ozellikleri: ['proje_ozellikleri', 'projeozellikleri', 'proje ozellikleri', 'proje özellikleri'],
  lokasyon_avantajlari: ['lokasyon_avantajlari', 'lokasyonavantajlari', 'lokasyon avantajlari', 'lokasyon avantajları'],
  yatirim_analizi: ['yatirim_analizi', 'yatirimanalizi', 'yatirim analizi', 'yatırım analizi'],
  bolge_analizi: ['bolge_analizi', 'bolgeanalizi', 'bolge analizi', 'bölge analizi'],
  emlak_uzmani_gorusu: ['emlak_uzmani_gorusu', 'emlakuzmanigorusu', 'emlak uzmani gorusu', 'emlak uzmanı görüşü'],
};

const normalizeKey = (key) => key.toLowerCase().trim();

const normalizeSeoJson = (raw) => {
  const lookup = {};
  Object.keys(raw).forEach(k => {
    lookup[normalizeKey(k)] = raw[k];
  });

  const result = {};
  Object.entries(SEO_FIELD_ALIASES).forEach(([targetField, aliases]) => {
    for (const alias of aliases) {
      const normalizedAlias = normalizeKey(alias);
      if (lookup[normalizedAlias] !== undefined && lookup[normalizedAlias] !== '') {
        result[targetField] = lookup[normalizedAlias];
        break;
      }
    }
  });

  return result;
};

const extractNonScalarSeoData = (raw) => {
  const lookup = {};
  Object.keys(raw).forEach(k => {
    lookup[normalizeKey(k)] = raw[k];
  });

  const result = {};

  if (Array.isArray(lookup['faq'])) {
    result.faq = lookup['faq'].map(item => ({
      q: item?.q ?? item?.soru ?? item?.question ?? '',
      a: item?.a ?? item?.cevap ?? item?.answer ?? '',
    }));
  }

  const hizliKey = ['hizli_bilgiler', 'hizlibilgiler', 'quick_info', 'hızlı bilgiler'].find(k => lookup[k] && typeof lookup[k] === 'object');
  if (hizliKey) {
    result.hizli_bilgiler = { ...EMPTY_HIZLI_BILGILER, ...lookup[hizliKey] };
  }

  const jsonLdKey = ['json_ld_schema', 'jsonldschema', 'json-ld', 'jsonld'].find(k => lookup[k] && typeof lookup[k] === 'object');
  if (jsonLdKey) {
    result.json_ld_schema = lookup[jsonLdKey];
  }

  return result;
};

export default function PropertyForm2() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('specs');
  const [featureSearch, setFeatureSearch] = useState('');
  const [bulkFeaturesText, setBulkFeaturesText] = useState('');
  
  const [gemJsonInput, setGemJsonInput] = useState('');
  const [seoJsonInput, setSeoJsonInput] = useState('');
  const [showSeoJsonBox, setShowSeoJsonBox] = useState(false);

  const [jsonLdText, setJsonLdText] = useState('');
  const [jsonLdError, setJsonLdError] = useState(null);

  const seoJsonPreview = useMemo(() => {
    if (!seoJsonInput.trim()) return null;
    try {
      const cleanInput = seoJsonInput.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanInput);
      const normalized = normalizeSeoJson(parsed);
      const extra = extractNonScalarSeoData(parsed);
      return { data: { ...normalized, ...extra }, error: null };
    } catch (err) {
      return { data: null, error: 'Geçersiz JSON formatı' };
    }
  }, [seoJsonInput]);

  const [form, setForm] = useState({
    title: '', slug: '', type: 'apartment', sub_type: '',
    price: '', currency: 'USD', bedrooms: '', bathrooms: '', size_sqm: '',
    sea_view: false, seafront: false, near_the_sea: false, citizenship_eligible: false, residency_eligible: false,
    description: '', features: [], main_image: '', featured: false,
    floor_number: '',
    market_status: 'For Sale', balcony: '', salon: '', boost: 'Default', old_price: '', commission: '',
    project_name: '', construction_year: '', total_sqm: '', block_count: '', floor_count: '',
    developer_company: '', list_link_1: '', list_link_2: '',
    payment_down: 100, payment_under_construction: 0, payment_delivery: 0, payment_installment: 0,
    seo_title: '', meta_title: '', meta_description: '', seo_content: '',
    ai_summary: '', mulk_ozellikleri: '', proje_ozellikleri: '', lokasyon_avantajlari: '',
    yatirim_analizi: '', bolge_analizi: '', emlak_uzmani_gorusu: '',
    faq: [],
    hizli_bilgiler: { ...EMPTY_HIZLI_BILGILER },
    json_ld_schema: null,
    room_types: [{ ...INITIAL_ROOM_TYPE }],
    images: []
  });

  const { data: propertyData, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => base44.entities.Property.filter({ id }),
    enabled: !!id,
  });

  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['property-types'],
    queryFn: () => base44.entities.PropertyType.list('order'),
  });

  const { data: allFeatures = [] } = useQuery({
    queryKey: ['all-features'],
    queryFn: () => base44.entities.Feature.list(),
  });

  useEffect(() => {
    if (propertyData?.[0]) {
      const data = propertyData[0];
      const room_types = data.room_types || [
        {
          bedrooms: data.bedrooms || '',
          size_sqm: data.size_sqm || '',
          bathrooms: data.bathrooms || '',
          balcony: data.balcony || '',
          salon: data.salon || '',
          floor_number: data.floor_number || '',
          sub_type: data.sub_type || '',
          boost: data.boost || 'Default',
          price: data.price || '',
          currency: data.currency || 'USD',
          old_price: data.old_price || '',
          commission: data.commission || ''
        }
      ];
      const hizli_bilgiler = { ...EMPTY_HIZLI_BILGILER, ...(data.hizli_bilgiler || {}) };
      const faq = Array.isArray(data.faq) ? data.faq : [];
      const json_ld_schema = data.json_ld_schema || null;

      setForm(prev => ({
        ...prev,
        ...data,
        room_types,
        images: data.images || [],
        hizli_bilgiler,
        faq,
        json_ld_schema,
      }));
      setJsonLdText(json_ld_schema ? JSON.stringify(json_ld_schema, null, 2) : '');
    }
  }, [propertyData]);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Property.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Mülk portföy detayları başarıyla tamamlandı!');
      navigate('/properties');
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleAddRoomType = () => {
    setForm(f => ({
      ...f,
      room_types: [...(f.room_types || []), { ...INITIAL_ROOM_TYPE }]
    }));
  };

  const handleRemoveRoomType = (index) => {
    setForm(f => ({
      ...f,
      room_types: f.room_types.filter((_, i) => i !== index)
    }));
  };

  const setRoomValue = (index, key, val) => {
    setForm(f => {
      const updatedRooms = [...f.room_types];
      updatedRooms[index] = { ...updatedRooms[index], [key]: val };
      return { ...f, room_types: updatedRooms };
    });
  };

  const setHizliBilgi = (key, val) => {
    setForm(f => ({
      ...f,
      hizli_bilgiler: { ...(f.hizli_bilgiler || EMPTY_HIZLI_BILGILER), [key]: val }
    }));
  };

  const handleAddFaq = () => {
    setForm(f => ({ ...f, faq: [...(f.faq || []), { q: '', a: '' }] }));
  };

  const handleRemoveFaq = (index) => {
    setForm(f => ({ ...f, faq: (f.faq || []).filter((_, i) => i !== index) }));
  };

  const setFaqValue = (index, key, val) => {
    setForm(f => {
      const items = [...(f.faq || [])];
      items[index] = { ...items[index], [key]: val };
      return { ...f, faq: items };
    });
  };

  const handleApplyJsonLd = () => {
    if (!jsonLdText.trim()) {
      set('json_ld_schema', null);
      setJsonLdError(null);
      toast.success('JSON-LD şeması temizlendi.');
      return;
    }
    try {
      const cleanInput = jsonLdText.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleanInput);
      set('json_ld_schema', parsed);
      setJsonLdError(null);
      toast.success('JSON-LD şeması doğrulandı ve forma uygulandı!');
    } catch (err) {
      setJsonLdError(err.message);
      toast.error('JSON-LD ayrıştırma hatası: ' + err.message);
    }
  };

  const handleConstructionYearChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 6);
    } else if (val.length === 2 && e.target.value.length === 2) {
      val = val + '/'; 
    }
    set('construction_year', val);
  };

  const handleApplyGemProjectDetails = () => {
    if (!gemJsonInput.trim()) return;
    try {
      const parsedData = JSON.parse(gemJsonInput.trim());
      setForm(prev => ({
        ...prev,
        project_name: parsedData.proje_adi || prev.project_name,
        construction_year: parsedData.insaat_yili ? String(parsedData.insaat_yili) : prev.construction_year,
        total_sqm: parsedData.toplam_m2 || prev.total_sqm,
        block_count: parsedData.blok_sayisi || prev.block_count,
        floor_count: parsedData.kat_sayisi || prev.floor_count,
        title: prev.title || parsedData.proje_adi || ''
      }));
      toast.success('Gem proje detayları başarıyla alanlara yüklendi!');
      setGemJsonInput('');
    } catch (error) {
      toast.error('Geçersiz JSON formatı! Lütfen Gem çıktısını eksiksiz kopyaladığınızdan emin olun.');
    }
  };

  const handleApplySeoJson = () => {
    if (!seoJsonInput.trim()) return;
    try {
      const cleanInput = seoJsonInput.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsedData = JSON.parse(cleanInput);
      const normalized = normalizeSeoJson(parsedData);
      const extra = extractNonScalarSeoData(parsedData);

      if (Object.keys(normalized).length === 0 && Object.keys(extra).length === 0) {
        toast.error('JSON içinde tanınan bir SEO alanı bulunamadı.');
        return;
      }

      setForm(prev => ({
        ...prev,
        ...(normalized.slug !== undefined && { slug: normalized.slug }),
        ...(normalized.seo_title !== undefined && { seo_title: normalized.seo_title }),
        ...(normalized.meta_title !== undefined && { meta_title: normalized.meta_title }),
        ...(normalized.meta_description !== undefined && { meta_description: normalized.meta_description }),
        // === DEĞİŞİKLİK: seo_content yoksa girilen ham JSON'u yaz ===
        seo_content: normalized.seo_content !== undefined ? normalized.seo_content : cleanInput,
        // =============================================================
        ...(normalized.ai_summary !== undefined && { ai_summary: normalized.ai_summary }),
        ...(normalized.mulk_ozellikleri !== undefined && { mulk_ozellikleri: normalized.mulk_ozellikleri }),
        ...(normalized.proje_ozellikleri !== undefined && { proje_ozellikleri: normalized.proje_ozellikleri }),
        ...(normalized.lokasyon_avantajlari !== undefined && { lokasyon_avantajlari: normalized.lokasyon_avantajlari }),
        ...(normalized.yatirim_analizi !== undefined && { yatirim_analizi: normalized.yatirim_analizi }),
        ...(normalized.bolge_analizi !== undefined && { bolge_analizi: normalized.bolge_analizi }),
        ...(normalized.emlak_uzmani_gorusu !== undefined && { emlak_uzmani_gorusu: normalized.emlak_uzmani_gorusu }),
        ...(extra.faq !== undefined && { faq: extra.faq }),
        ...(extra.hizli_bilgiler !== undefined && { hizli_bilgiler: { ...EMPTY_HIZLI_BILGILER, ...extra.hizli_bilgiler } }),
        ...(extra.json_ld_schema !== undefined && { json_ld_schema: extra.json_ld_schema }),
      }));

      if (extra.json_ld_schema !== undefined) {
        setJsonLdText(JSON.stringify(extra.json_ld_schema, null, 2));
        setJsonLdError(null);
      }

      toast.success('SEO verileri başarıyla alanlara aktarıldı!');
      setSeoJsonInput('');
      setShowSeoJsonBox(false);
    } catch (error) {
      toast.error('JSON parse hatası: ' + error.message);
    }
  };

  const handleToggleFeature = (featureSlug) => {
    const currentFeatures = form.features || [];
    const isSelected = currentFeatures.includes(featureSlug);
    const updatedFeatures = isSelected 
      ? currentFeatures.filter(f => f !== featureSlug)
      : [...currentFeatures, featureSlug];

    const slugLower = featureSlug.toLowerCase();
    let dynamicBooleans = {};
    
    if (slugLower.includes('citizen') || slugLower.includes('vatandas')) dynamicBooleans.citizenship_eligible = !isSelected;
    if (slugLower.includes('residen') || slugLower.includes('ikamet')) dynamicBooleans.residency_eligible = !isSelected;
    if (slugLower.includes('sea-view') || slugLower.includes('deniz-manz')) dynamicBooleans.sea_view = !isSelected;
    if (slugLower.includes('seafront') || slugLower.includes('denize-sifir')) dynamicBooleans.seafront = !isSelected;
    if (slugLower.includes('near-sea') || slugLower.includes('denize-yakin')) dynamicBooleans.near_the_sea = !isSelected;

    setForm(prev => ({
      ...prev,
      features: updatedFeatures,
      ...dynamicBooleans
    }));
  };

  const handleToggleSpecialFeature = (type) => {
    const findSlug = (keyword) => allFeatures.find(f => f.slug?.toLowerCase().includes(keyword) || f.name?.toLowerCase().includes(keyword))?.slug || keyword;

    setForm(prev => {
      let updatedFeatures = [...(prev.features || [])];
      let updates = {};

      const toggleSlugHelper = (slug, forceState) => {
        if (forceState && !updatedFeatures.includes(slug)) updatedFeatures.push(slug);
        if (!forceState) updatedFeatures = updatedFeatures.filter(x => x !== slug);
      };

      if (type === 'citizenship') {
        const nextVal = !prev.citizenship_eligible;
        updates.citizenship_eligible = nextVal;
        toggleSlugHelper(findSlug('citizen'), nextVal);
      } else if (type === 'residency') {
        const nextVal = !prev.residency_eligible;
        updates.residency_eligible = nextVal;
        toggleSlugHelper(findSlug('residen'), nextVal);
      } else if (type === 'sea_view') {
        const nextVal = !prev.sea_view;
        updates.sea_view = nextVal;
        toggleSlugHelper(findSlug('sea-view'), nextVal);
      } else if (type === 'seafront') {
        const nextVal = !prev.seafront;
        updates.seafront = nextVal;
        toggleSlugHelper(findSlug('seafront'), nextVal);
      } else if (type === 'near_the_sea') {
        const nextVal = !prev.near_the_sea;
        updates.near_the_sea = nextVal;
        toggleSlugHelper(findSlug('near-sea') || findSlug('denize-yakin') || 'near-the-sea', nextVal);
      } else if (type === 'furniture') {
        const slug = findSlug('furnit') || findSlug('mobilya') || 'furniture';
        const nextVal = !updatedFeatures.includes(slug);
        toggleSlugHelper(slug, nextVal);
      } else if (type === 'white_goods') {
        const slug = findSlug('white-goods') || findSlug('beyaz-esya') || 'white-goods';
        const nextVal = !updatedFeatures.includes(slug);
        toggleSlugHelper(slug, nextVal);
      }

      return { ...prev, ...updates, features: updatedFeatures };
    });
  };

  const isCitizenshipActive = useMemo(() => form.citizenship_eligible || form.features?.some(f => f.toLowerCase().includes('citizen') || f.toLowerCase().includes('vatandas')), [form.citizenship_eligible, form.features]);
  const isResidencyActive = useMemo(() => form.residency_eligible || form.features?.some(f => f.toLowerCase().includes('residen') || f.toLowerCase().includes('ikamet')), [form.residency_eligible, form.features]);
  const isSeaViewActive = useMemo(() => form.sea_view || form.features?.some(f => f.toLowerCase().includes('sea-view') || f.toLowerCase().includes('deniz-manz')), [form.sea_view, form.features]);
  const isSeafrontActive = useMemo(() => form.seafront || form.features?.some(f => f.toLowerCase().includes('seafront') || f.toLowerCase().includes('denize-sifir')), [form.seafront, form.features]);
  const isNearTheSeaActive = useMemo(() => form.near_the_sea || form.features?.some(f => f.toLowerCase().includes('near-sea') || f.toLowerCase().includes('denize-yakin')), [form.near_the_sea, form.features]);
  const isFurnitureActive = useMemo(() => form.features?.some(f => f.toLowerCase().includes('furnit') || f.toLowerCase().includes('esya') || f.toLowerCase().includes('mobilya')), [form.features]);
  const isWhiteGoodsActive = useMemo(() => form.features?.some(f => f.toLowerCase().includes('white-goods') || f.toLowerCase().includes('beyaz-esya')), [form.features]);

  const handleApplyBulkFeatures = () => {
    if (!bulkFeaturesText.trim()) return;
    const inputNames = bulkFeaturesText.split(/,|\n/).map(name => name.trim().toLowerCase()).filter(Boolean);
    const matchedSlugs = allFeatures.filter(feat => feat.name && inputNames.includes(feat.name.toLowerCase().trim())).map(feat => feat.slug);

    if (matchedSlugs.length > 0) {
      setForm(f => {
        const currentFeatures = f.features || [];
        const combinedFeatures = Array.from(new Set([...currentFeatures, ...matchedSlugs]));
        let extraBooleans = {};
        matchedSlugs.forEach(slug => {
          const s = slug.toLowerCase();
          if (s.includes('citizen') || s.includes('vatandas')) extraBooleans.citizenship_eligible = true;
          if (s.includes('residen') || s.includes('ikamet')) extraBooleans.residency_eligible = true;
          if (s.includes('sea-view') || s.includes('deniz-manz')) extraBooleans.sea_view = true;
          if (s.includes('seafront') || s.includes('denize-sifir')) extraBooleans.seafront = true;
          if (s.includes('near-sea') || s.includes('denize-yakin')) extraBooleans.near_the_sea = true;
        });
        return { ...f, features: combinedFeatures, ...extraBooleans };
      });
      toast.success(`${matchedSlugs.length} adet yeni özellik başarıyla seçildi!`);
      setBulkFeaturesText('');
    } else {
      toast.error('Girdiğiniz kelimelerle eşleşen bir sistem özelliği bulunamadı.');
    }
  };

  const filteredFeatures = useMemo(() => {
    const searchLower = featureSearch.toLowerCase().trim();
    if (!searchLower) return allFeatures;
    return allFeatures.filter(feat => feat.name?.toLowerCase().includes(searchLower));
  }, [allFeatures, featureSearch]);

  const selectedFeaturesItems = useMemo(() => {
    return allFeatures.filter(feat => form.features?.includes(feat.slug));
  }, [allFeatures, form.features]);

  function buildLocationDistanceHtml() {
    const hasLocation = form.country || form.city || form.district || form.neighborhood;
    const hasDistances = Array.isArray(form.distances) && form.distances.some(d => d.meters);

    if (!hasLocation && !hasDistances) return '';
    let html = `<h3><strong>Konum ve Mesafe Bilgileri</strong></h3>`;

    if (hasLocation) {
      html += `<ul>`;
      const parts = [form.country, form.city, form.district, form.neighborhood].filter(Boolean);
      html += `<li><strong>Konum:</strong> ${parts.join(' / ')}</li>`;
      html += `</ul>`;
    }

    if (hasDistances) {
      html += `<h4><strong>Ulaşım Noktaları ve Önemli Mesafeler</strong></h4><ul>`;
      BASE_CATEGORIES.forEach(cat => {
        const meters = form.distances?.find(d => d.label === cat)?.meters;
        if (!meters) return;
        if (cat === 'Havalimanı' && form.selected_airport_name) {
          html += `<li>${form.selected_airport_name}: ${formatMetersValue(meters)}</li>`;
        } else {
          html += `<li>${cat}: ${formatMetersValue(meters)}</li>`;
        }
      });
      form.distances?.forEach(d => {
        if (BASE_CATEGORIES.includes(d.label) || !d.meters) return;
        html += `<li>${d.label}: ${formatMetersValue(d.meters)}</li>`;
      });
      html += `</ul>`;
    }
    return html;
  }

  const handleAutoGenerateDescription = () => {
    const targetProjectName = form.project_name || form.title || 'Gayrimenkul Tanıtım Portföyü';
    let html = `<h2><strong>Mülk Adı: ${targetProjectName}</strong></h2>`;
    html += `<p>${form.property_ref ? `Ref No: <strong>${form.property_ref}</strong> | ` : ''} Durum: <strong>${form.market_status || 'For Sale'}</strong></p>`;
    
    if (form.type || form.construction_year || form.total_sqm || form.block_count || form.floor_count) {
      html += `<h3><strong>Genel Proje ve Yapı Bilgileri</strong></h3><ul>`;
      if (form.type) html += `<li><strong>Mülk Tipi:</strong> ${form.type.toUpperCase()} ${form.sub_type ? `(${form.sub_type})` : ''}</li>`;
      if (form.construction_year) html += `<li><strong>İnşaat / Teslim Yılı:</strong> ${form.construction_year}</li>`;
      if (form.total_sqm) html += `<li><strong>Toplam Proje Alanı:</strong> ${form.total_sqm} m²</li>`;
      if (form.block_count) html += `<li><strong>Blok Sayısı:</strong> ${form.block_count}</li>`;
      if (form.floor_count) html += `<li><strong>Kat Sayısı:</strong> ${form.floor_count}</li>`;
      html += `</ul>`;
    }

    const getFeatureDbName = (keyword, defaultName) => {
      return allFeatures.find(f => f.slug?.toLowerCase().includes(keyword) || f.name?.toLowerCase().includes(keyword))?.name || defaultName;
    };

    if (isCitizenshipActive || isResidencyActive || isSeaViewActive || isSeafrontActive || isNearTheSeaActive) {
      html += `<h3><strong>Öne Çıkan Özellikler</strong></h3><ul>`;
      if (isCitizenshipActive) html += `<li>${getFeatureDbName('citizen', 'Citizenship')}</li>`;
      if (isResidencyActive) html += `<li>${getFeatureDbName('residen', 'Residence Permit')}</li>`;
      if (isSeaViewActive) html += `<li>${getFeatureDbName('sea-view', 'Sea View')}</li>`;
      if (isSeafrontActive) html += `<li>${getFeatureDbName('seafront', 'Seafront')}</li>`;
      if (isNearTheSeaActive) html += `<li>${getFeatureDbName('near-sea', 'Near the Sea')}</li>`;
      html += `</ul>`;
    }

    if (form.room_types && form.room_types.some(room => room.bedrooms || room.size_sqm)) {
      html += `<h3><strong>Mevcut Oda Tipleri</strong></h3>`;
      form.room_types.forEach((room) => {
        if (!room.bedrooms && !room.size_sqm) return;
        html += `<p style="line-height: 1.6; margin-bottom: 18px;">`;
        html += `<strong>Oda Planı:</strong> ${room.bedrooms || 0}+${room.salon || 0} ${room.sub_type || ''}<br />`;
        if (room.size_sqm) html += `<strong>Net Alan:</strong> ${room.size_sqm} m²<br />`;
        if (room.floor_number || room.bathrooms || room.balcony) {
          html += `<strong>Yapı Detayları:</strong><br />`;
          if (room.floor_number) html += `Kat: ${room.floor_number}<br />`;
          if (room.bathrooms) html += `Banyo: ${room.bathrooms}<br />`;
          if (room.balcony) html += `Balkon: ${room.balcony}<br />`;
        }
        html += `</p>`;
      });
    }

    if (Number(form.payment_down) > 0 || Number(form.payment_under_construction) > 0 || Number(form.payment_delivery) > 0 || Number(form.payment_installment) > 0) {
      html += `<h3><strong>Ödeme Planı Yapılandırması</strong></h3><ul>`;
      if (Number(form.payment_down) > 0) html += `<li><strong>Peşinat Oranı:</strong> %${form.payment_down}</li>`;
      if (Number(form.payment_under_construction) > 0) html += `<li><strong>İnşaat Süreci Ara Ödeme:</strong> %${form.payment_under_construction}</li>`;
      if (Number(form.payment_delivery) > 0) html += `<li><strong>Teslimat Esnası Ödeme:</strong> %${form.payment_delivery}</li>`;
      if (Number(form.payment_installment) > 0) html += `<li><strong>Vade / Taksitlendirme İmkanı:</strong> %${form.payment_installment}</li>`;
      html += `</ul>`;
    }

    if (selectedFeaturesItems.length > 0) {
      html += `<h3><strong>Kompleks Özellikleri ve Sosyal Donatılar</strong></h3>`;
      html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; margin-top: 5px;">`;
      selectedFeaturesItems.forEach(feat => {
        html += `<span>- ${feat.name}</span>`;
      });
      html += `</div>`;
    }

    html += buildLocationDistanceHtml();
    set('description', html);
    toast.success('Dolu alanlar filtrelenerek açıklama metni başarıyla üretildi!');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const data = { ...form };

    if (data.room_types && data.room_types.length > 0) {
      const mainRoom = data.room_types[0];
      data.price = mainRoom.price ? Number(mainRoom.price) : '';
      data.old_price = mainRoom.old_price ? Number(mainRoom.old_price) : '';
      data.commission = mainRoom.commission ? Number(mainRoom.commission) : '';
      data.bedrooms = mainRoom.bedrooms ? Number(mainRoom.bedrooms) : '';
      data.bathrooms = mainRoom.bathrooms ? Number(mainRoom.bathrooms) : '';
      data.balcony = mainRoom.balcony ? Number(mainRoom.balcony) : '';
      data.salon = mainRoom.salon ? Number(mainRoom.salon) : '';
      data.size_sqm = mainRoom.size_sqm ? Number(mainRoom.size_sqm) : '';
      data.floor_number = mainRoom.floor_number ? Number(mainRoom.floor_number) : '';
      data.sub_type = mainRoom.sub_type;
      data.boost = mainRoom.boost;
      data.currency = mainRoom.currency;
    }

    if (data.room_types) {
      data.room_types = data.room_types.map(room => ({
        ...room,
        price: room.price ? Number(room.price) : '',
        old_price: room.old_price ? Number(room.old_price) : '',
        commission: room.commission ? Number(room.commission) : '',
        bedrooms: room.bedrooms ? Number(room.bedrooms) : '',
        bathrooms: room.bathrooms ? Number(room.bathrooms) : '',
        balcony: room.balcony ? Number(room.balcony) : '',
        salon: room.salon ? Number(room.salon) : '',
        size_sqm: room.size_sqm ? Number(room.size_sqm) : '',
        floor_number: room.floor_number ? Number(room.floor_number) : '',
      }));
    }

    if (data.total_sqm) data.total_sqm = Number(data.total_sqm);
    if (data.block_count) data.block_count = Number(data.block_count);
    if (data.floor_count) data.floor_count = Number(data.floor_count);
    if (data.payment_down) data.payment_down = Number(data.payment_down);
    if (data.payment_under_construction) data.payment_under_construction = Number(data.payment_under_construction);
    if (data.payment_delivery) data.payment_delivery = Number(data.payment_delivery);
    if (data.payment_installment) data.payment_installment = Number(data.payment_installment);
    
    if (!data.title) data.title = data.seo_title || data.project_name || 'Gayrimenkul Portföyü';

    if (Array.isArray(data.faq)) {
      data.faq = data.faq.filter(item => (item.q && item.q.trim()) || (item.a && item.a.trim()));
    }

    mutation.mutate(data);
  };

  const selectedTypeObj = propertyTypes.find(t => t.slug === form.type);
  const subTypeOptions = selectedTypeObj?.sub_types || [];

  const tabs = [
    { id: 'specs', label: 'Yapı & Fiyat', icon: '🏙️' },
    { id: 'features', label: 'Özellik Seçimi', icon: '✨' },
    { id: 'photos', label: 'Fotoğraflar', icon: '📸' },
    { id: 'seo', label: 'Medya & SEO', icon: '🔍' },
  ];

  const totalPayment = (Number(form.payment_down) || 0) + (Number(form.payment_under_construction) || 0) + (Number(form.payment_delivery) || 0) + (Number(form.payment_installment) || 0);

  const colorMap = {
    violet: { border: 'border-violet-200', focus: 'focus-visible:ring-violet-500', text: 'text-violet-600', bg: 'bg-violet-50/40' },
    teal: { border: 'border-teal-200', focus: 'focus-visible:ring-teal-500', text: 'text-teal-600', bg: 'bg-teal-50/40' },
    cyan: { border: 'border-cyan-200', focus: 'focus-visible:ring-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-50/40' },
    emerald: { border: 'border-emerald-200', focus: 'focus-visible:ring-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50/40' },
    amber: { border: 'border-amber-200', focus: 'focus-visible:ring-amber-500', text: 'text-amber-600', bg: 'bg-amber-50/40' },
    sky: { border: 'border-sky-200', focus: 'focus-visible:ring-sky-500', text: 'text-sky-600', bg: 'bg-sky-50/40' },
    rose: { border: 'border-rose-200', focus: 'focus-visible:ring-rose-500', text: 'text-rose-600', bg: 'bg-rose-50/40' },
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 select-none">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to={`/properties/${id}`}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold font-jakarta text-foreground">Hızlı Portföy Ekleme - Adım 2</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ref No: <span className="font-mono font-bold text-primary">{form.property_ref || 'Atanmadı'}</span> · Proje: {form.project_name || 'Belirtilmedi'}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="sm:ml-auto gap-2 gradient-primary text-white border-0 hover:opacity-90 px-6 h-10 rounded-xl shadow-sm">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Portföyü Yayına Al
        </Button>
      </div>

      {/* Tab Navigasyon */}
      <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form İçerikleri */}
      <div className="space-y-6">
        {/* TAB 1: YAPI & FİYAT */}
        {activeTab === 'specs' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <LayoutGrid className="w-4 h-4 text-primary" /> Yapısal Sınıflandırma
              </h3>
              <div className="sm:max-w-md">
                <Label className="text-xs">Mülk Ana Tipi</Label>
                <Select value={form.type || 'apartment'} onValueChange={v => { set('type', v); set('sub_type', ''); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {propertyTypes.filter(t => t.is_active).map(t => (
                      <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Building2 className="w-4 h-4 text-primary" /> Proje Detayları
              </h3>
              
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-emerald-100 rounded-xl p-3 shadow-xs">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Gemini AI ile Detayları Otomatik Doldur
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Aşağıdaki butondan Gem şablonunu açıp gelen JSON verisini kopyalayın ve metin kutusuna yapıştırın.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 text-xs font-bold rounded-xl h-8 px-4 transition-all shrink-0">
                    <a href="https://gemini.google.com/gem/1aBMDCmyLYc7hHgMB_BWOFL7woCtNsca1?usp=sharing" target="_blank" rel="noopener noreferrer">
                      Gem Şablonunu Aç
                    </a>
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      placeholder='Örn: {"proje_adi": "Lory Queen Residence", "insaat_yili": 2015, "toplam_m2": 9318, "blok_sayisi": 5, "kat_sayisi": 5}'
                      value={gemJsonInput}
                      onChange={e => setGemJsonInput(e.target.value)}
                      className="flex min-h-[60px] w-full rounded-xl border border-input bg-white px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-y font-mono text-foreground"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyGemProjectDetails}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-xs shrink-0 h-auto sm:w-32 flex items-center justify-center self-stretch"
                    >
                      Veriyi Aktar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="sm:col-span-1 lg:col-span-1">
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🏢 PROJE ADI</Label>
                  <Input type="text" value={form.project_name || ''} onChange={e => set('project_name', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="Proje İsmi" />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">📅 İNŞAAT YILI *</Label>
                  <Input 
                    type="text" 
                    value={form.construction_year || ''} 
                    onChange={handleConstructionYearChange} 
                    className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" 
                    placeholder="06/2015"
                    maxLength={7}
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">📐 TOPLAM M²</Label>
                  <div className="relative mt-1.5">
                    <Input type="number" value={form.total_sqm || ''} onChange={e => set('total_sqm', e.target.value)} className="border-emerald-200 focus-visible:ring-emerald-500 pr-8" placeholder="3" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">m²</span>
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🏢 BLOK SAYISI *</Label>
                  <Input type="number" value={form.block_count || ''} onChange={e => set('block_count', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="1" />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🏢 KAT SAYISI *</Label>
                  <Input type="number" value={form.floor_count || ''} onChange={e => set('floor_count', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="2" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">👷 GELİŞTİRİCİ ŞİRKET *</Label>
                  <Input type="text" value={form.developer_company || ''} onChange={e => set('developer_company', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="Firma Adı" />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🔗 LİSTE LİNKİ 1 *</Label>
                  <Input type="text" value={form.list_link_1 || ''} onChange={e => set('list_link_1', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="http..." />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">🔗 LİSTE LİNKİ 2 *</Label>
                  <Input type="text" value={form.list_link_2 || ''} onChange={e => set('list_link_2', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" placeholder="http..." />
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 mt-4 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <Label className="text-xs font-bold text-gray-800 flex items-center gap-2">💳 Ödeme Planı Yapılandırma *</Label>
                  <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${totalPayment === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    TOPLAM: %{totalPayment}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center">
                    <Label className="text-[10px] font-bold text-emerald-600 mb-1 block">PEŞİNAT</Label>
                    <div className="flex items-center justify-center gap-1">
                      <Input type="number" min="0" max="100" value={form.payment_down ?? ''} onChange={e => set('payment_down', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0" />
                      <span className="text-lg font-bold text-gray-700">%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center hover:border-emerald-200 transition-colors">
                    <Label className="text-[10px] font-bold text-gray-400 mb-1 block">İNŞAAT ALTI</Label>
                    <div className="flex items-center justify-center gap-1">
                      <Input type="number" min="0" max="100" value={form.payment_under_construction ?? ''} onChange={e => set('payment_under_construction', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0 text-gray-500" />
                      <span className="text-lg font-bold text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center hover:border-emerald-200 transition-colors">
                    <Label className="text-[10px] font-bold text-gray-400 mb-1 block">TESLİMATTA</Label>
                    <div className="flex items-center justify-center gap-1">
                      <Input type="number" min="0" max="100" value={form.payment_delivery ?? ''} onChange={e => set('payment_delivery', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0 text-gray-500" />
                      <span className="text-lg font-bold text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-center hover:border-emerald-200 transition-colors">
                    <Label className="text-[10px] font-bold text-gray-400 mb-1 block">VADE</Label>
                    <div className="flex items-center justify-center gap-1">
                      <Input type="number" min="0" max="100" value={form.payment_installment ?? ''} onChange={e => set('payment_installment', e.target.value)} className="w-16 h-8 text-center font-bold border-0 bg-transparent focus-visible:ring-0 shadow-none text-lg p-0 text-gray-500" />
                      <span className="text-lg font-bold text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                    <span>DAĞILIM İLERLEMESİ</span>
                    <span className={totalPayment !== 100 ? 'text-rose-500' : 'text-emerald-600'}>%{totalPayment} / %100</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(form.payment_down || 0, 100)}%` }}></div>
                    <div className="h-full bg-teal-400 transition-all duration-300" style={{ width: `${Math.min(form.payment_under_construction || 0, 100)}%` }}></div>
                    <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${Math.min(form.payment_delivery || 0, 100)}%` }}></div>
                    <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${Math.min(form.payment_installment || 0, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fiyat ve Oda Detayları
                </h3>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-inner/5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <Info className="w-3.5 h-3.5 text-cyan-500" />
                  <span>MÜLK DURUMU (İNŞAAT / HAZIR) <span className="text-rose-500">*</span></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Rent', 'For Sale', 'Daily Rent'].map((status, index) => {
                    const isSelected = form.market_status === status;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => set('market_status', status)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-white border-cyan-500 text-cyan-600 shadow-xs ring-1 ring-cyan-500/10 font-bold'
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 font-jakarta">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Tanımlı Oda Tipleri <span className="text-slate-400 font-normal">({form.room_types?.length || 0})</span></span>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddRoomType}
                  className="h-8 rounded-lg border-cyan-500/20 text-cyan-600 font-semibold text-xs hover:bg-cyan-50/50 gap-1"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Yeni Ekle
                </Button>
              </div>

              {(form.room_types || []).map((room, index) => (
                <div key={index} className="bg-white border-2 border-teal-500/20 rounded-2xl p-4 space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-cyan-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                        {index + 1}
                      </div>
                      <span className="text-xs font-bold text-slate-800 font-jakarta">
                        {room.bedrooms ? `${room.bedrooms}+${room.salon || 0}` : 'Tanımlı Oda Tipi'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {form.room_types.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRoomType(index)}
                          className="text-rose-500 hover:text-rose-700 text-xs h-7 px-2"
                        >
                          Sil
                        </Button>
                      )}
                      <ChevronUp className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Bed className="w-3.5 h-3.5 text-slate-300" /> YATAK ODASI
                        </Label>
                        <Input type="number" value={room.bedrooms || ''} onChange={e => setRoomValue(index, 'bedrooms', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-300" /> M² (NET)
                        </Label>
                        <Input type="number" value={room.size_sqm || ''} onChange={e => setRoomValue(index, 'size_sqm', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Bath className="w-3.5 h-3.5 text-slate-300" /> BANYO
                        </Label>
                        <Input type="number" value={room.bathrooms || ''} onChange={e => setRoomValue(index, 'bathrooms', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-300" /> BALKON
                        </Label>
                        <Input type="number" value={room.balcony || ''} onChange={e => setRoomValue(index, 'balcony', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Sofa className="w-3.5 h-3.5 text-slate-300" /> SALON
                        </Label>
                        <Input type="number" value={room.salon || ''} onChange={e => setRoomValue(index, 'salon', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-300" /> KAT
                        </Label>
                        <Input type="number" value={room.floor_number || ''} onChange={e => setRoomValue(index, 'floor_number', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500" />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-300" /> ALT TİP
                        </Label>
                        <Select value={room.sub_type || ''} onValueChange={v => setRoomValue(index, 'sub_type', v)}>
                          <SelectTrigger className="h-10 bg-slate-50/40 border-slate-200 focus:ring-cyan-500 text-slate-700 text-xs">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {subTypeOptions.length > 0 ? (
                              subTypeOptions.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)
                            ) : (
                              <SelectItem value="none" disabled>Seçiniz</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                          <Rocket className="w-3.5 h-3.5 text-slate-300" /> BOOST
                        </Label>
                        <Select value={room.boost || 'Default'} onValueChange={v => setRoomValue(index, 'boost', v)}>
                          <SelectTrigger className="h-10 bg-slate-50/40 border-slate-200 focus:ring-cyan-500 text-slate-700 text-xs">
                            <SelectValue placeholder="Default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Default">Default</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Highlighted">Highlighted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-3.5 space-y-3 bg-slate-50/30">
                      <div className="text-[10px] font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <Wallet className="w-4 h-4 text-teal-500" /> FİYATLANDIRMA
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">FİYAT</Label>
                          <Input type="number" value={room.price || ''} onChange={e => setRoomValue(index, 'price', e.target.value)} className="h-10 bg-white border-slate-200 focus-visible:ring-cyan-500" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">PARA BİRİMİ</Label>
                          <Select value={room.currency || 'EUR'} onValueChange={v => setRoomValue(index, 'currency', v)}>
                            <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-cyan-500 text-slate-700 text-xs">
                              <SelectValue placeholder="EUR (€)" />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENCIES.map(c => {
                                const symbol = c === 'EUR' ? '€' : c === 'USD' ? '$' : c === 'GBP' ? '£' : '₺';
                                return <SelectItem key={c} value={c}>{c} ({symbol})</SelectItem>
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">ESKİ FİYAT (OPSİYONEL)</Label>
                          <Input type="number" value={room.old_price || ''} onChange={e => setRoomValue(index, 'old_price', e.target.value)} placeholder="€" className="h-10 bg-white border-slate-200 focus-visible:ring-cyan-500" />
                          <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">*İndirim mevcutsa girebilirsiniz</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        % ACENTE KOMİSYONU
                      </div>
                      <div className="relative max-w-xs">
                        <Input type="number" value={room.commission || ''} onChange={e => setRoomValue(index, 'commission', e.target.value)} className="h-10 bg-slate-50/40 border-slate-200 focus-visible:ring-cyan-500 pr-8" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold select-none">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ÖZELLİK SEÇİMİ */}
        {activeTab === 'features' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <div className="bg-card rounded-xl border border-border p-5 space-y-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b pb-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sosyal Donatılar ve İlan Özellikleri</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Filtre altyapısı için listeden detaylı seçim yapın</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  ⭐ Öne Çıkan Kritik Portföy Özellikleri (Hızlı Seçim)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  <div 
                    onClick={() => handleToggleSpecialFeature('citizenship')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isCitizenshipActive 
                        ? 'bg-amber-50/70 border-amber-500 text-amber-800 shadow-xs font-bold ring-1 ring-amber-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">🇹🇷</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" /> Citizenship
                    </span>
                  </div>

                  <div 
                    onClick={() => handleToggleSpecialFeature('residency')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isResidencyActive 
                        ? 'bg-blue-50/70 border-blue-500 text-blue-800 shadow-xs font-bold ring-1 ring-blue-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">🪪</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Residence Permit
                    </span>
                  </div>

                  <div 
                    onClick={() => handleToggleSpecialFeature('sea_view')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isSeaViewActive 
                        ? 'bg-cyan-50/70 border-cyan-500 text-cyan-800 shadow-xs font-bold ring-1 ring-cyan-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">🌊</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-cyan-600" /> Sea View
                    </span>
                  </div>

                  <div 
                    onClick={() => handleToggleSpecialFeature('seafront')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isSeafrontActive 
                        ? 'bg-sky-100/60 border-sky-500 text-sky-800 shadow-xs font-bold ring-1 ring-sky-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">🏖️</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Seafront
                    </span>
                  </div>

                  <div 
                    onClick={() => handleToggleSpecialFeature('near_the_sea')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isNearTheSeaActive 
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-800 shadow-xs font-bold ring-1 ring-emerald-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">⚓</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <Anchor className="w-3.5 h-3.5 text-emerald-600" /> Near the Sea
                    </span>
                  </div>

                  <div 
                    onClick={() => handleToggleSpecialFeature('furniture')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isFurnitureActive 
                        ? 'bg-purple-50/70 border-purple-500 text-purple-800 shadow-xs font-bold ring-1 ring-purple-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">🛋️</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <Sofa className="w-3.5 h-3.5 text-purple-600" /> Furniture
                    </span>
                  </div>

                  <div 
                    onClick={() => handleToggleSpecialFeature('white_goods')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center space-y-1.5 ${
                      isWhiteGoodsActive 
                        ? 'bg-indigo-50/70 border-indigo-500 text-indigo-800 shadow-xs font-bold ring-1 ring-indigo-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="text-xl">📺</div>
                    <span className="text-[11px] font-jakarta tracking-wide flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5 text-indigo-600" /> White Goods
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-teal-100 rounded-xl shadow-xs">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" /> Sosyal Alan Seçici
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Gemini AI İle Özellikleri Eşleştir veya araştır
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="border-teal-500 text-teal-700 bg-teal-50/40 hover:bg-teal-50 text-xs font-bold rounded-xl h-8 px-4 transition-all">
                    <a href="https://gemini.google.com/gem/f5571d60b8e3?usp=sharing" target="_blank" rel="noopener noreferrer">
                      Gemini Araçlarını Aç
                    </a>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" /> METİNDEN TOPLU ÖZELLİK SEÇ (VİRGÜLLE VEYA ALT ALTA AYRILMIŞ)
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      placeholder="Örn: Pool, Seafront, near-sea, Security, Elevator, Gym, Spa, Citizenship, Private Pool"
                      value={bulkFeaturesText}
                      onChange={e => setBulkFeaturesText(e.target.value)}
                      className="flex min-h-[70px] w-full rounded-xl border border-input bg-white px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 resize-y"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyBulkFeatures}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-xs shrink-0 h-auto sm:w-32 flex items-center justify-center self-stretch"
                    >
                      Eşleştir ve Seç
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Özellik ara... (Örn: Pool, Güvenlik, Kapalı Havuz)"
                  value={featureSearch}
                  onChange={e => setFeatureSearch(e.target.value)}
                  className="pl-10 h-10 bg-white border border-border shadow-xs rounded-xl focus-visible:ring-teal-500 font-medium text-xs text-foreground"
                />
              </div>

              {selectedFeaturesItems.length > 0 && (
                <div className="bg-emerald-50/20 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Seçilen Özellikler ({selectedFeaturesItems.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedFeaturesItems.map(feat => (
                      <div 
                        key={`selected-${feat.slug}`}
                        onClick={() => handleToggleFeature(feat.slug)}
                        className="flex items-center justify-between p-3 rounded-xl border border-emerald-500 bg-white ring-1 ring-emerald-500/10 transition-all cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{feat.emoji || feat.icon || '✨'}</span>
                          <span className="text-xs font-bold text-slate-800">{feat.name}</span>
                        </div>
                        <Switch checked={true} onCheckedChange={() => handleToggleFeature(feat.slug)} onClick={(e) => e.stopPropagation()} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map(feat => {
                    const isSelected = form.features?.includes(feat.slug);
                    return (
                      <div 
                        key={feat.slug}
                        onClick={() => handleToggleFeature(feat.slug)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected 
                            ? 'bg-teal-50/40 border-teal-500 ring-1 ring-teal-500/20' 
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{feat.emoji || feat.icon || '✨'}</span>
                          <span className="text-xs font-bold text-slate-700">{feat.name}</span>
                        </div>
                        <Switch 
                          checked={!!isSelected} 
                          onCheckedChange={() => handleToggleFeature(feat.slug)} 
                          onClick={(e) => e.stopPropagation()} 
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-6 text-xs text-muted-foreground font-medium">
                    Aranan kriterlere uygun ilan özelliği bulunamadı.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FOTOĞRAFLAR */}
        {activeTab === 'photos' && (
          <div className="space-y-6 max-w-5xl mx-auto bg-card rounded-xl border border-border p-6 shadow-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  📸 Galeri & Fotoğraf Yönetimi
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mülke ait tüm görselleri yükleyin. Yüklediğiniz görsellerden birini vitrin (ana görsel) yapabilirsiniz.
                </p>
              </div>
              <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold">
                {(form.images || []).length} Görsel Yüklü
              </span>
            </div>

            <label className="block border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-white transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:scale-110 transition-all">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Fotoğrafları buraya sürükleyin veya tıklayarak <span className="text-teal-600 underline">seçin</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Birden fazla dosya seçebilirsiniz (PNG, JPG, WEBP)</p>
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  
                  toast.loading(`${files.length} görsel yükleniyor...`, { id: 'bulk-upload' });
                  try {
                    const uploadedUrls = [];
                    for (const file of files) {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      uploadedUrls.push(file_url);
                    }
                    
                    setForm(prev => {
                      const currentImages = prev.images || [];
                      const combined = [...currentImages, ...uploadedUrls];
                      return {
                        ...prev,
                        images: combined,
                        main_image: prev.main_image || uploadedUrls[0] || ''
                      };
                    });
                    toast.success('Görsel başarıyla galeriye eklendi!', { id: 'bulk-upload' });
                  } catch (err) {
                    toast.error('Görseller yüklenirken bir sorun oluştu.', { id: 'bulk-upload' });
                  }
                }}
              />
            </label>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
              <Label className="text-xs font-bold text-slate-600">🔗 VEYA URL İLE TEKİL GÖRSEL EKLE</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="custom-img-url-input"
                  placeholder="https://example.com/resim.jpg"
                  className="bg-white text-xs h-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        setForm(prev => ({
                          ...prev,
                          images: [...(prev.images || []), val],
                          main_image: prev.main_image || val
                        }));
                        e.target.value = '';
                        toast.success('Görsel URL\'i galeriye eklendi!');
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById('custom-img-url-input');
                    const val = input?.value?.trim();
                    if (val) {
                      setForm(prev => ({
                        ...prev,
                        images: [...(prev.images || []), val],
                        main_image: prev.main_image || val
                      }));
                      input.value = '';
                      toast.success('Görsel URL\'i galeriye eklendi!');
                    } else {
                      toast.error('Lütfen geçerli bir URL girin.');
                    }
                  }}
                  className="bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-lg"
                >
                  Ekle
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-600 block">GALERİ GÖRSELLERİ</Label>
              
              {(!form.images || form.images.length === 0) ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-muted-foreground bg-slate-50/30">
                  Henüz galeriye bir fotoğraf eklenmedi. Üstteki panelden çoklu yükleme yapabilirsiniz.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {form.images.map((url, idx) => {
                    const isMain = form.main_image === url;
                    return (
                      <div key={idx} className={`relative group rounded-xl overflow-hidden border bg-slate-50 transition-all ${isMain ? 'ring-2 ring-teal-500 border-transparent shadow-sm' : 'border-slate-200'}`}>
                        <img src={url} alt={`Galeri ${idx + 1}`} className="w-full h-28 object-cover" />
                        
                        {isMain && (
                          <span className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                            VİTRİN
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => {
                                set('main_image', url);
                                toast.success('Vitrin (ana görsel) başarıyla güncellendi!');
                              }}
                              className="text-[10px] font-bold text-white bg-teal-600/90 hover:bg-teal-600 px-2 py-1 rounded-md w-full text-center transition-colors"
                            >
                              Vitrin Yap
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setForm(prev => {
                                const filteredImages = prev.images.filter(u => u !== url);
                                let nextMain = prev.main_image;
                                if (isMain) {
                                  nextMain = filteredImages[0] || '';
                                }
                                return { ...prev, images: filteredImages, main_image: nextMain };
                              });
                              toast.success('Görsel galeriden kaldırıldı.');
                            }}
                            className="text-[10px] font-bold text-white bg-rose-600/90 hover:bg-rose-600 px-2 py-1 rounded-md w-full text-center transition-colors"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MEDYA & SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
              <div className="pt-1">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleAutoGenerateDescription}
                  className="gap-2 border-teal-500 text-teal-700 bg-white hover:bg-teal-50 font-bold text-xs py-5 rounded-full transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Form Verilerinden Açıklama Metni Üret (Dolu Alanları Al)
                </Button>
              </div>

              <div className="min-h-[400px] border border-slate-200 rounded-lg overflow-hidden bg-white">
                <ReactQuill
                  value={form.description || ''}
                  onChange={val => set('description', val)}
                  className="h-72"
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'clean']
                    ]
                  }}
                />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-primary" /> Google SERP Önizlemesi
                </h3>
                <Button asChild size="sm" variant="outline" className="border-teal-500 text-teal-700 bg-teal-50/40 hover:bg-teal-50 text-xs font-bold rounded-xl h-8 px-4 transition-all shrink-0">
                  <a href="https://gemini.google.com/gem/18cQn6ttRnjpD_X0BL474UpmBF6Vnbbcu?usp=sharing" target="_blank" rel="noopener noreferrer">
                    Title / Meta Title / Description / Content Gem
                  </a>
                </Button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 max-w-xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[13px] text-slate-800">propertiesforsaleturkey.com</p>
                    <p className="text-[12px] text-slate-500 truncate">
                      https://propertiesforsaleturkey.com/property/{form.slug || 'ornek-url-slug'}
                    </p>
                  </div>
                </div>
                <p className="text-[18px] text-[#1a0dab] leading-snug mt-1 truncate">
                  {form.meta_title || form.seo_title || 'Meta başlığınız burada görünecek'}
                </p>
                <p className="text-[13px] text-[#4d5156] leading-snug mt-1 line-clamp-2">
                  {form.meta_description || 'Meta açıklamanız burada görünecek. SEO Ayarları kısmından Meta Description alanını doldurun.'}
                </p>
              </div>

              {form.seo_content && (
                <div className="pt-3 border-t border-border space-y-2">
                  <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    SEO Content Önizlemesi
                  </Label>
                  <div
                    className="prose prose-sm max-w-none max-h-[420px] overflow-y-auto border border-slate-100 rounded-lg p-4 bg-slate-50/40 text-slate-800 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-0 [&_h3]:text-sm [&_h3]:font-bold [&_h4]:text-xs [&_h4]:font-bold [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: form.seo_content }}
                  />
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">SEO Ayarları</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    JSON formatındaki SEO verisini yapıştırarak alanları otomatik doldurun (slug, title, meta, content, ai_summary, faq, hizli_bilgiler, json_ld_schema vb.)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSeoJsonBox(v => !v)}
                  className="gap-2 border-teal-500 text-teal-700 bg-white hover:bg-teal-50 font-bold text-xs rounded-xl h-9 px-4 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  SEO'yu Otomatik Tamamla
                </Button>
              </div>

              {showSeoJsonBox && (
                <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-4 space-y-2">
                  <Label className="text-[11px] font-bold text-teal-700">
                    JSON Verisini Yapıştır (tüm gem çıktısını olduğu gibi yapıştırabilirsiniz)
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      placeholder='Örn: {"url_slug": "...", "seo_title": "...", "ai_summary": "...", "faq": [...], "hizli_bilgiler": {...}, "json_ld_schema": {...}}'
                      value={seoJsonInput}
                      onChange={e => setSeoJsonInput(e.target.value)}
                      className="flex min-h-[120px] w-full rounded-xl border border-input bg-white px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 resize-y font-mono text-foreground"
                    />
                    <Button
                      type="button"
                      onClick={handleApplySeoJson}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-xs shrink-0 h-auto sm:w-32 flex items-center justify-center self-stretch"
                    >
                      Verileri Aktar
                    </Button>
                  </div>

                  {seoJsonPreview?.error && (
                    <p className="text-[11px] font-semibold text-rose-600">⚠️ {seoJsonPreview.error}</p>
                  )}

                  {seoJsonPreview?.data && (
                    <div className="bg-white border border-teal-100 rounded-xl p-4 space-y-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50 pb-2">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Önizleme — Aktarmadan Önce Kontrol Edin
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {seoJsonPreview.data.slug && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">URL Slug:</span>{' '}
                            <span className="font-mono text-slate-700">/property/{seoJsonPreview.data.slug}</span>
                          </div>
                        )}
                        {seoJsonPreview.data.seo_title && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">SEO Title:</span>{' '}
                            <span className="text-slate-700">{seoJsonPreview.data.seo_title}</span>
                          </div>
                        )}
                        {seoJsonPreview.data.meta_title && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">Meta Title:</span>{' '}
                            <span className="text-[#1a0dab]">{seoJsonPreview.data.meta_title}</span>
                          </div>
                        )}
                        {seoJsonPreview.data.meta_description && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">Meta Description:</span>{' '}
                            <span className="text-[#4d5156]">{seoJsonPreview.data.meta_description}</span>
                          </div>
                        )}
                        {seoJsonPreview.data.ai_summary && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">AI Özet:</span>{' '}
                            <span className="text-slate-700">{seoJsonPreview.data.ai_summary.slice(0, 160)}...</span>
                          </div>
                        )}
                        {Array.isArray(seoJsonPreview.data.faq) && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">FAQ:</span>{' '}
                            <span className="text-slate-700">{seoJsonPreview.data.faq.length} soru bulundu</span>
                          </div>
                        )}
                        {seoJsonPreview.data.hizli_bilgiler && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">Hızlı Bilgiler:</span>{' '}
                            <span className="text-slate-700">{Object.values(seoJsonPreview.data.hizli_bilgiler).filter(Boolean).length} alan bulundu</span>
                          </div>
                        )}
                        {seoJsonPreview.data.json_ld_schema && (
                          <div className="sm:col-span-2">
                            <span className="font-bold text-slate-500">JSON-LD Şeması:</span>{' '}
                            <span className="text-slate-700">Bulundu, "Aktar" sonrası JSON-LD kutusuna yüklenecek</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">URL Slug</Label>
                  <Input value={form.slug || ''} onChange={e => set('slug', e.target.value)} className="mt-1.5 font-mono text-xs" placeholder="ornek-url-slug" />
                </div>
                <div>
                  <Label className="text-xs">SEO Title</Label>
                  <Input value={form.seo_title || ''} onChange={e => set('seo_title', e.target.value)} className="mt-1.5 text-xs" placeholder="SEO başlığı" />
                </div>
                <div>
                  <Label className="text-xs">Meta Title</Label>
                  <Input value={form.meta_title || ''} onChange={e => set('meta_title', e.target.value)} className="mt-1.5 text-xs" placeholder="Meta başlık" />
                </div>
                <div>
                  <Label className="text-xs">Meta Description</Label>
                  <Input value={form.meta_description || ''} onChange={e => set('meta_description', e.target.value)} className="mt-1.5 text-xs" placeholder="Meta açıklama" />
                </div>
              </div>

              <div>
                <Label className="text-xs">SEO Content</Label>
                <textarea
                  value={form.seo_content || ''}
                  onChange={e => set('seo_content', e.target.value)}
                  className="mt-1.5 w-full min-h-[180px] rounded-xl border border-input bg-white px-3 py-2 text-xs resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus:border-teal-500"
                  placeholder="SEO içeriği (markdown/metin) — ya da yukarıdaki JSON kutusundan otomatik doldurulur"
                />
              </div>
            </div>

            {/* Detaylı SEO İçerikleri */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div className="border-b pb-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-primary" /> Detaylı SEO İçerikleri (AI Üretimi)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Yukarıdaki "SEO'yu Otomatik Tamamla" kutusuna JSON yapıştırdığınızda bu alanlar otomatik doldurulur; manuel olarak da düzenleyebilirsiniz.
                </p>
              </div>

              <div className="space-y-5">
                {LONG_TEXT_SEO_FIELDS.map(({ key, label, icon: Icon, color, placeholder }) => {
                  const c = colorMap[color] || colorMap.teal;
                  const value = form[key] || '';
                  return (
                    <div key={key} className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-2`}>
                      <Label className={`text-[11px] font-bold ${c.text} flex items-center gap-1.5`}>
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </Label>
                      <textarea
                        value={value}
                        onChange={e => set(key, e.target.value)}
                        placeholder={placeholder}
                        className={`w-full min-h-[110px] rounded-xl border border-input bg-white px-3 py-2 text-xs resize-y focus-visible:outline-none focus-visible:ring-2 ${c.focus} focus:border-current`}
                      />
                      {value && (
                        <div className="bg-white border border-slate-100 rounded-lg p-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Önizleme</span>
                          <p className="text-[12px] text-slate-700 leading-relaxed line-clamp-4">{value}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hızlı Bilgiler */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div className="border-b pb-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-primary" /> Hızlı Bilgiler (hizli_bilgiler)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sayfa üzerinde özet kart olarak gösterilecek anahtar/değer bilgileri.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {HIZLI_BILGILER_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <Label className="text-[11px] font-bold text-slate-500">{label}</Label>
                    <Input
                      value={form.hizli_bilgiler?.[key] || ''}
                      onChange={e => setHizliBilgi(key, e.target.value)}
                      placeholder={placeholder}
                      className="mt-1.5 text-xs bg-slate-50/40"
                    />
                  </div>
                ))}
              </div>

              {Object.values(form.hizli_bilgiler || {}).some(Boolean) && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Önizleme</span>
                  <div className="flex flex-wrap gap-2">
                    {HIZLI_BILGILER_FIELDS.filter(f => form.hizli_bilgiler?.[f.key]).map(f => (
                      <span key={f.key} className="text-[11px] bg-white border border-slate-200 rounded-full px-3 py-1 font-medium text-slate-700">
                        <span className="text-slate-400 font-semibold">{f.label}:</span> {form.hizli_bilgiler[f.key]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sıkça Sorulan Sorular */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-primary" /> Sıkça Sorulan Sorular (faq)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Sayfanın FAQ bölümünde ve FAQPage şemasında kullanılacak soru/cevap çiftleri.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddFaq}
                  className="h-8 rounded-lg border-teal-500/30 text-teal-600 font-semibold text-xs hover:bg-teal-50/50 gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Soru Ekle
                </Button>
              </div>

              {(!form.faq || form.faq.length === 0) ? (
                <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-muted-foreground bg-slate-50/30">
                  Henüz bir FAQ sorusu eklenmedi. "Soru Ekle" butonuyla başlayabilir veya yukarıdaki JSON kutusundan toplu aktarabilirsiniz.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.faq.map((item, index) => (
                    <div key={index} className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 space-y-2.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Soru #{index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFaq(index)}
                          className="text-rose-500 hover:text-rose-700 h-7 px-2 gap-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Sil
                        </Button>
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">Soru</Label>
                        <Input
                          value={item.q || ''}
                          onChange={e => setFaqValue(index, 'q', e.target.value)}
                          placeholder="Örn: Bu daire yatırım için uygun mu?"
                          className="mt-1 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">Cevap</Label>
                        <textarea
                          value={item.a || ''}
                          onChange={e => setFaqValue(index, 'a', e.target.value)}
                          placeholder="Cevap metni..."
                          className="mt-1 w-full min-h-[70px] rounded-lg border border-input bg-white px-3 py-2 text-xs resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* JSON-LD Şeması */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
              <div className="border-b pb-3">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Braces className="w-4 h-4 text-primary" /> JSON-LD Şeması (json_ld_schema)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Sayfanın <code className="bg-slate-100 px-1 rounded">&lt;script type="application/ld+json"&gt;</code> etiketine basılacak yapısal veri. Ham JSON olarak düzenleyin ve doğrulayın.
                </p>
              </div>

              <textarea
                value={jsonLdText}
                onChange={e => setJsonLdText(e.target.value)}
                placeholder='{"@context": "https://schema.org", "@graph": [...]}'
                className="w-full min-h-[220px] rounded-xl border border-input bg-slate-900 text-emerald-300 px-3 py-2.5 text-[11px] font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus:border-teal-500"
              />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleApplyJsonLd}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-xs gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Şemayı Doğrula ve Uygula
                </Button>

                {jsonLdError ? (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Geçersiz JSON: {jsonLdError}
                  </span>
                ) : form.json_ld_schema ? (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Şema geçerli ve forma uygulandı
                  </span>
                ) : null}
              </div>

              {form.json_ld_schema && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Uygulanan Şema Önizlemesi</span>
                  <pre className="text-[10px] text-slate-700 whitespace-pre-wrap break-all font-mono">
                    {JSON.stringify(form.json_ld_schema, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alt Kaydetme Butonu */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-2 gradient-primary text-white border-0 hover:opacity-90 px-8 h-11 rounded-xl shadow-md font-bold text-sm">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet ve Sihirbazı Kapat
        </Button>
      </div>
    </div>
  );
}