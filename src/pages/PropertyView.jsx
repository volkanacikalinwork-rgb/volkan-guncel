import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Building2, BedDouble, Bath, Maximize, MapPin, Calendar, Home, Eye, ChevronLeft, ChevronRight, X, ArrowLeft,
  Share2, Heart, Phone, Mail, CheckCircle2, Star, Plane, Building, ShoppingBag, Train, Bus, Navigation,
  Ruler, Layers, Globe, Clock, Tag, ChevronDown, ChevronUp, User, Award, Flag, FileText,
  Wallet, Percent, KeyRound, Armchair, Car, TreeDeciduous, Dumbbell, Shield, Camera,
  Coffee, Utensils, BookOpen, Gamepad2, Sparkles, Landmark, GraduationCap, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_LABELS = {
  apartment: 'Daire',
  villa: 'Villa',
  commercial: 'Ticari',
  land: 'Arsa',
};

const STATUS_LABELS = {
  active: 'Satilik',
  draft: 'Taslak',
  sold: 'Satildi',
  pending: 'Beklemede',
};

const CITY_LABELS = {
  istanbul: 'Istanbul',
  antalya: 'Antalya',
  alanya: 'Alanya',
  fethiye: 'Fethiye',
  bodrum: 'Bodrum',
  ankara: 'Ankara',
  izmir: 'Izmir',
  side: 'Side',
  kas: 'Kas',
  other: 'Diger',
};

const PROPERTY_STATUS_LABELS = {
  for_sale: 'Satilik',
  daily_rent: 'Gunluk Kiralik',
  long_rent: 'Uzun Dönem Kiralik',
};

const DISTANCE_ICONS = {
  'denize': 'BeachIcon',
  'deniz': 'BeachIcon',
  'beach': 'BeachIcon',
  'havalimani': Plane,
  'airport': Plane,
  'havaliman': Plane,
  'merkeze': Building,
  'merkez': Building,
  'center': Building,
  'city': Building,
  'avm': ShoppingBag,
  'mall': ShoppingBag,
  'market': ShoppingBag,
  'shopping': ShoppingBag,
  'metro': Train,
  'metrobus': Train,
  'bus': Bus,
  'otobüs': Bus,
  'okul': GraduationCap,
  'school': GraduationCap,
  'hastane': Stethoscope,
  'hospital': Stethoscope,
  'default': MapPin,
};

const FEATURE_CATEGORIES = {
  'Guvenlik & Teknik': ['Security', 'Camera', 'Alarm', 'Fire Alarm', 'Smart Home', 'Generator', 'Vehicle Charging Station'],
  'Spor & Saglik': ['Gym', 'Spa', 'Sauna', 'Turkish Bath', 'Steam Room', 'Jacuzzi', 'Massage Room', 'Wellness Club', 'Temperature Controlled Pool', 'Salt Room', 'Snow Room', 'Relax Room'],
  'Sosyal & Eglence': ['Pool', 'Indoor Pool', 'Private Pool', 'Infinity Pool', 'Children\'s Pool', 'Cinema', 'Game Room', 'Billiards', 'Table Tennis', 'Tennis', 'Basketball', 'Football', 'Volleyball', 'Golf', 'Bowling', 'Kids Play Area', 'Playground', 'Petting Farm', 'Water Town', 'Motor Town', 'Go-Kart', 'Surf', 'Skate Park', 'Dance Studio', 'Yoga', 'Events'],
  'Yasam & Konfor': ['Elevator', 'Indoor Parking', 'Private Parking', 'Garden', 'Private Garden', 'Winter Garden', 'Terrace', 'Balcony', 'En-suite Bathroom', 'Bathtub', 'Dressing Room', 'Laundry Room', 'Furniture', 'White Goods', 'Air Conditioning', 'Floor Heating', 'Natural Gas Infrastructure', 'Fireplace'],
  'Konum & Ulasim': ['Sea View', 'Seafront', 'City View', 'Nature View', 'Near the Sea', 'City Center', 'Near Bus Stop', 'Near to Metro', 'Beach Transfer Service', 'Jogging and Walking Track', 'Beach', 'Bike Track'],
  'Otel Hizmetleri': ['Concierge Service', 'Caretaker', 'Lobby', 'Cafe', 'Restaurant', 'Poolside Bar', 'Shops', 'Library', 'Conference Room'],
  'Resmi & Yatirim': ['Citizenship', 'Residence Permit', 'Invest in Turkey', 'Rental Guarantee'],
};

const FEATURE_ICONS = {
  'Pool': 'BeachIcon', 'Sea View': 'BeachIcon', 'Seafront': 'BeachIcon', 'Indoor Pool': 'BeachIcon', 'Private Pool': 'BeachIcon', 'Infinity Pool': 'BeachIcon', 'Children\'s Pool': 'BeachIcon',
  'Security': Shield, 'Camera': Camera, 'Alarm': Shield, 'Smart Home': Sparkles, 'Generator': 'ZapIcon',
  'Gym': Dumbbell, 'Spa': Sparkles, 'Sauna': Sparkles, 'Turkish Bath': Sparkles, 'Steam Room': Sparkles, 'Jacuzzi': Sparkles, 'Massage Room': Sparkles,
  'Elevator': ChevronUp, 'Indoor Parking': Car, 'Private Parking': Car, 'Garden': TreeDeciduous, 'Private Garden': TreeDeciduous,
  'Cinema': 'FilmIcon', 'Game Room': Gamepad2, 'Billiards': Gamepad2, 'Tennis': Gamepad2, 'Basketball': Gamepad2,
  'Cafe': Coffee, 'Restaurant': Utensils, 'Poolside Bar': Coffee, 'Library': BookOpen,
  'Citizenship': Award, 'Residence Permit': FileText, 'Invest in Turkey': Landmark,
  'Beach': 'BeachIcon', 'Near the Sea': 'BeachIcon', 'City View': Building, 'Nature View': TreeDeciduous,
  'Caretaker': User, 'Concierge Service': User,
  'default': CheckCircle2,
};

// Simple Zap icon fallback
function Zap({ className }) {
  return <span className={className}>⚡</span>;
}

function Film({ className }) {
  return <span className={className}>🎬</span>;
}

function Waves({ className }) {
  return <span className={className}>🌊</span>;
}

function formatDistance(meters) {
  const m = parseInt(meters);
  if (isNaN(m) || m === 0) return '';
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function formatPrice(amount, currency = 'USD') {
  if (!amount) return '';
  return `${Number(amount).toLocaleString()} ${currency}`;
}

function getDistanceIcon(label) {
  const lower = (label || '').toLowerCase();
  const key = Object.keys(DISTANCE_ICONS).find(k => lower.includes(k));
  const iconValue = DISTANCE_ICONS[key] || DISTANCE_ICONS.default;
  // Return icon or string identifier for emoji icons
  return iconValue;
}

function categorizeFeatures(features) {
  const categorized = {};
  const usedFeatures = new Set();

  Object.entries(FEATURE_CATEGORIES).forEach(([category, categoryFeatures]) => {
    categorized[category] = [];
    features.forEach(f => {
      if (categoryFeatures.some(cf => f.toLowerCase().includes(cf.toLowerCase())) && !usedFeatures.has(f)) {
        categorized[category].push(f);
        usedFeatures.add(f);
      }
    });
  });

  const uncategorized = features.filter(f => !usedFeatures.has(f));
  if (uncategorized.length > 0) {
    categorized['Diger'] = uncategorized;
  }

  return categorized;
}

function generateFAQs(property) {
  const faqs = [];

  if (property.citizenship_eligible) {
    faqs.push({
      question: 'Bu mülk Türk vatandaşlığına uygun mu?',
      answer: 'Evet, bu mülk Türk vatandaşlığı başvurusu için uygundur. Türkiye\'de en az 400.000 USD değerinde mülk satın alarak Türk vatandaşlığına başvurabilirsiniz.',
    });
  }

  if (property.residency_eligible) {
    faqs.push({
      question: 'Bu mülk ikamet izni için uygun mu?',
      answer: 'Evet, bu mülk tapu devri sonrası ikamet izni başvurusu için uygundur.',
    });
  }

  if (property.year_built) {
    faqs.push({
      question: 'Proje ne zaman tamamlanacak?',
      answer: `Projenin teslim tarihi ${property.year_built} olarak planlanmaktadır.`,
    });
  }

  if (property.developer) {
    faqs.push({
      question: 'Projeyi kim geliştirdi?',
      answer: `Bu proje ${property.developer} tarafından geliştirilmektedir.`,
    });
  }

  const payment = property.payment || {};
  if (payment.cash < 100) {
    faqs.push({
      question: 'Ödeme planları nelerdir?',
      answer: `Peşinat: %${payment.cash || 0}, İnşaat altı: %${payment.construction || 0}, Teslimatta: %${payment.delivery || 0}, Vade: %${payment.installment || 0} şeklinde ödeme planı sunulmaktadır.`,
    });
  }

  faqs.push({
    question: 'Mülkün konumu nasıldır?',
    answer: `${CITY_LABELS[property.city] || property.city}${property.district ? ', ' + property.district : ''}${property.neighborhood ? ', ' + property.neighborhood : ''} bölgesinde yer almaktadır.`,
  });

  return faqs;
}

export default function PropertyView() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => base44.entities.Property.filter({ id }),
    select: (data) => data?.[0] || null,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md">
          <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">İlan Bulunamadı</h2>
          <p className="text-gray-500 mb-6">Bu ilan mevcut değil veya kaldırılmış olabilir.</p>
          <Link to="/properties">
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 h-12">
              <ArrowLeft className="w-4 h-4 mr-2" /> İlanlara Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Collect all images
  const allImages = [];
  if (property.main_image) allImages.push(property.main_image);
  if (property.photos?.general?.length) allImages.push(...property.photos.general);
  if (property.photos?.indoor?.length) allImages.push(...property.photos.indoor);
  if (property.photos?.facilities?.length) allImages.push(...property.photos.facilities);
  if (property.images?.length) allImages.push(...property.images);
  const images = allImages.length > 0 ? [...new Set(allImages)] : [];

  const photos = property.photos || { general: [], indoor: [], facilities: [], floor_plans: [] };
  const distances = property.distances || [];
  const roomTypes = property.room_types || [];
  const payment = property.payment || { cash: 0, construction: 0, delivery: 0, installment: 0 };
  const features = property.features || [];
  const categorizedFeatures = categorizeFeatures(features);
  const faqs = generateFAQs(property);

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setActiveImage((prev) => (prev + 1) % images.length);
    } else {
      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/properties" className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium hidden sm:inline">İlanlara Dön</span>
              </Link>
              <div className="hidden sm:block h-5 w-px bg-gray-200"></div>
              <div className="hidden sm:block text-xs text-gray-400">
                <span className="font-mono">{property.property_ref}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-teal-600"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="hidden sm:inline ml-1.5">Kaydet</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-teal-600">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Paylaş</span>
              </Button>
              <Link to={`/properties/${property.id}`}>
                <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                  <Home className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Düzenle</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto">
          <Link to="/properties" className="hover:text-teal-600 whitespace-nowrap">İlanlar</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-gray-400">{CITY_LABELS[property.city] || property.city}</span>
          {property.district && <>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-400">{property.district}</span>
          </>}
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-teal-600 font-medium truncate">{property.title}</span>
        </nav>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-200 cursor-pointer group" onClick={() => setShowGalleryModal(true)}>
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-600">
                <Building2 className="w-24 h-24 text-white/30" />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 font-medium">
              <Eye className="w-3.5 h-3.5" /> {activeImage + 1} / {images.length} Fotoğraf
            </div>
            {/* Status Badge */}
            {property.status === 'active' && (
              <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                {PROPERTY_STATUS_LABELS[property.property_status] || 'Aktif'}
              </div>
            )}
            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Öne Çıkan
              </div>
            )}
          </div>

          {/* Grid Thumbnails */}
          <div className="hidden lg:grid grid-cols-2 gap-2">
            {[images[1], images[2], images[3], images[4]].map((img, i) => img ? (
              <div
                key={i}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 cursor-pointer transition-all hover:ring-2 hover:ring-teal-500 ${activeImage === i + 1 ? 'ring-2 ring-teal-500' : ''}`}
                onClick={() => setActiveImage(i + 1)}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div key={i} className="relative aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
            ))}
            {images.length > 5 && (
              <div
                className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 cursor-pointer"
                onClick={() => setShowGalleryModal(true)}
              >
                <img src={images[5]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-medium">
                  <Maximize className="w-6 h-6 mb-1" />
                  <span className="text-sm">+{images.length - 5} daha</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {property.property_ref && (
                  <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-mono font-medium px-3 py-1 rounded-full">
                    <KeyRound className="w-3 h-3" /> {property.property_ref}
                  </span>
                )}
                {property.type && (
                  <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-100">
                    <Building2 className="w-3 h-3" /> {TYPE_LABELS[property.type] || property.type}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{property.title || 'Başlıksız İlan'}</h1>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4 text-teal-500" />
                <span className="text-sm sm:text-base">
                  {CITY_LABELS[property.city] || property.city}
                  {property.district && <>, {property.district}</>}
                  {property.neighborhood && <>, {property.neighborhood}</>}
                </span>
              </div>
            </div>
            <div className="lg:text-right flex-shrink-0">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                {formatPrice(property.price, property.currency)}
              </div>
              {property.property_status === 'daily_rent' && (
                <div className="text-sm text-gray-500 mt-1">Günlük kiralık</div>
              )}
              {property.property_status === 'long_rent' && (
                <div className="text-sm text-gray-500 mt-1">Aylık kiralık</div>
              )}
            </div>
          </div>

          {/* Eligibility Badges */}
          <div className="flex flex-wrap gap-2">
            {property.citizenship_eligible && (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
                <Award className="w-4 h-4" /> Türk Vatandaşlığı Uygun
              </span>
            )}
            {property.residency_eligible && (
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
                <FileText className="w-4 h-4" /> İkamet İznine Uygun
              </span>
            )}
            {property.sea_view && (
              <span className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 text-sm font-semibold px-4 py-2 rounded-xl border border-cyan-200 shadow-sm">
                <span className="text-lg">🏖️</span> Deniz Manzaralı
              </span>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div id="overview" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: BedDouble, label: 'Yatak Odası', value: property.bedrooms || '-', suffix: '' },
                { icon: Bath, label: 'Banyo', value: property.bathrooms || '-', suffix: '' },
                { icon: Maximize, label: 'Alan', value: property.size_sqm || '-', suffix: ' m²' },
                { icon: Building2, label: 'Blok', value: property.block_count || '-', suffix: '' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <item.icon className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-800">{item.value}{item.suffix}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Project Details */}
            {(property.developer || property.year_built || property.floors || property.floor_number) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-teal-600" /> Proje Detayları
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {property.developer && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Geliştirici</div>
                      <div className="text-sm font-bold text-gray-800">{property.developer}</div>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Teslim Tarihi</div>
                      <div className="text-sm font-bold text-gray-800">{property.year_built}</div>
                    </div>
                  )}
                  {property.floors && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Kat Sayısı</div>
                      <div className="text-sm font-bold text-gray-800">{property.floors}</div>
                    </div>
                  )}
                  {property.floor_number && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Bulunduğu Kat</div>
                      <div className="text-sm font-bold text-gray-800">{property.floor_number}. Kat</div>
                    </div>
                  )}
                </div>
                {(property.list_link_1 || property.list_link_2) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                    {property.list_link_1 && (
                      <a href={property.list_link_1} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium bg-teal-50 px-3 py-1.5 rounded-lg">
                        <Globe className="w-4 h-4" /> Kaynak 1
                      </a>
                    )}
                    {property.list_link_2 && (
                      <a href={property.list_link_2} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium bg-teal-50 px-3 py-1.5 rounded-lg">
                        <Globe className="w-4 h-4" /> Kaynak 2
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Room Types */}
            {roomTypes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" /> Oda Tipleri ve Fiyatlandırma
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roomTypes.map((room, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-lg font-bold text-gray-800">{room.bedroom}</div>
                          {room.sub_type && <div className="text-xs text-gray-500">{room.sub_type}</div>}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-teal-600">{formatPrice(room.price, room.currency)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <Ruler className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                          <div className="font-semibold">{room.size ? `${room.size} m²` : '-'}</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <Bath className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                          <div className="font-semibold">{room.bath || '-'} Banyo</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <Building2 className="w-3 h-3 text-gray-400 mx-auto mb-0.5" />
                          <div className="font-semibold">{room.floor ? `${room.floor}. Kat` : '-'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Plan */}
            {(payment.cash > 0 || payment.construction > 0 || payment.delivery > 0 || payment.installment > 0) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-teal-600" /> Ödeme Planı
                </h2>
                <div className="space-y-4">
                  {[
                    { key: 'cash', label: 'Peşinat', color: 'emerald', icon: Percent },
                    { key: 'construction', label: 'İnşaat Altı', color: 'blue', icon: Building },
                    { key: 'delivery', label: 'Teslimatta', color: 'amber', icon: Calendar },
                    { key: 'installment', label: 'Vade', color: 'purple', icon: Clock },
                  ].map(({ key, label, color, icon: Icon }) => payment[key] > 0 && (
                    <div key={key} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-600">{label}</span>
                          <span className={`text-lg font-bold text-${color}-600`}>%{payment[key]}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-${color}-500 rounded-full transition-all`} style={{ width: `${payment[key]}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Toplam</span>
                    <span className="text-lg font-bold text-gray-800">%{(payment.cash || 0) + (payment.construction || 0) + (payment.delivery || 0) + (payment.installment || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Distances */}
            {distances.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-teal-600" /> Konum ve Mesafeler
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {distances.map((d, i) => {
                    const iconOrString = getDistanceIcon(d.label);
                    const isEmoji = typeof iconOrString === 'string';
                    return (
                      <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-teal-200 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                          {isEmoji ? <span className="text-xl">🏖️</span> : <span className="text-xl">{iconOrString === 'BeachIcon' ? '🏖️' : ''}</span>}
                          {!isEmoji && iconOrString && typeof iconOrString !== 'string' && <span className="text-xl">{React.createElement(iconOrString, { className: 'w-6 h-6 text-teal-500' })}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 font-semibold uppercase">{d.label}</div>
                          <div className="text-xl font-bold text-gray-800">{formatDistance(d.meters)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Transport */}
                {(property.has_metro || property.has_metrobus || property.has_bus) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Train className="w-4 h-4" /> Ulaşım İmkanları
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {property.has_metro && (
                        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-xl border border-blue-100">
                          <Train className="w-4 h-4" /> Metro {property.dist_metro ? `(${formatDistance(property.dist_metro)})` : ''}
                        </span>
                      )}
                      {property.has_metrobus && (
                        <span className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-sm font-medium px-4 py-2 rounded-xl border border-purple-100">
                          <Bus className="w-4 h-4" /> Metrobüs {property.dist_metrobus ? `(${formatDistance(property.dist_metrobus)})` : ''}
                        </span>
                      )}
                      {property.has_bus && (
                        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-xl border border-green-100">
                          <Bus className="w-4 h-4" /> Otobüs {property.dist_bus ? `(${formatDistance(property.dist_bus)})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Features by Category */}
            {features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" /> Özellikler ve Olanaklar
                </h2>
                <div className="space-y-4">
                  {Object.entries(categorizedFeatures).map(([category, categoryFeatures]) =>
                    categoryFeatures.length > 0 && (
                      <div key={category}>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {categoryFeatures.map((feature, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Map */}
            {property.lat && property.lng && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" /> Harita ve Konum
                </h2>
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <iframe
                    title="Mülk Konumu"
                    width="100%"
                    height="100%"
                    src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&hl=tr&output=embed`}
                    frameBorder="0"
                    className="border-0"
                    allowFullScreen
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
                  <MapPin className="w-4 h-4 text-teal-500" />
                  <span>{CITY_LABELS[property.city] || property.city}{property.district && `, ${property.district}`}{property.neighborhood && `, ${property.neighborhood}`}</span>
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" /> Açıklama
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: property.description }} />
              </div>
            )}

            {/* Floor Plans */}
            {photos.floor_plans?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-teal-600" /> Kat Planları
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.floor_plans.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all" onClick={() => { setActiveImage(images.indexOf(img)); setShowGalleryModal(true); }}>
                      <img src={img} alt={`Kat planı ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" /> Sıkça Sorulan Sorular
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      >
                        <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                        {expandedFaq === i ? <ChevronUp className="w-5 h-5 text-teal-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {expandedFaq === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.answer}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Başlangıç Fiyatı</div>
                <div className="text-2xl font-bold text-teal-600 mb-1">{formatPrice(property.price, property.currency)}</div>
                {roomTypes.length > 0 && <div className="text-xs text-gray-500">Farklı oda tipleri mevcut</div>}
              </div>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white h-12 text-base font-semibold shadow-lg shadow-teal-500/25">
                  <Phone className="w-4 h-4 mr-2" /> Hemen Arayın
                </Button>
                <Button variant="outline" className="w-full h-12 border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-700">
                  <Mail className="w-4 h-4 mr-2" /> E-posta Gönderin
                </Button>
                <Button variant="outline" className="w-full h-12 border-2 border-gray-200 text-gray-700 hover:border-teal-300 hover:text-teal-700">
                  <Sparkles className="w-4 h-4 mr-2" />&nbsp;WhatsApp ile İletişim
                </Button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-center text-xs text-gray-500">
                  <User className="w-4 h-4 inline mr-1" />
                  Uzman danışmanlarımız size yardımcı olmak için hazır
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4 opacity-90">Hızlı Bilgi</h3>
              <div className="space-y-3">
                {[
                  { label: 'Mülk Tipi', value: TYPE_LABELS[property.type] || property.type },
                  { label: 'Durum', value: PROPERTY_STATUS_LABELS[property.property_status] || STATUS_LABELS[property.status] || property.status },
                  { label: 'Şehir', value: CITY_LABELS[property.city] || property.city },
                  property.district && { label: 'İlçe', value: property.district },
                  property.bedrooms && { label: 'Yatak Odası', value: property.bedrooms },
                  property.bathrooms && { label: 'Banyo', value: property.bathrooms },
                  property.size_sqm && { label: 'Alan', value: `${property.size_sqm} m²` },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">{item.label}</span>
                    <span className="font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ref Number */}
            {property.property_ref && (
              <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">Referans Numarası</div>
                  <div className="font-mono font-bold text-gray-800">{property.property_ref}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setShowGalleryModal(false)}
          >
            <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10" onClick={() => setShowGalleryModal(false)}>
              <X className="w-8 h-8" />
            </button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10" onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}>
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-10" onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}>
              <ChevronRight className="w-10 h-10" />
            </button>
            <div className="max-w-6xl max-h-[85vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  src={images[activeImage]}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {activeImage + 1} / {images.length}
            </div>
            {/* Thumbnails */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2">
              {images.slice(0, 10).map((img, i) => (
                <div
                  key={i}
                  className={`w-16 h-12 rounded-lg overflow-hidden cursor-pointer transition-all ${activeImage === i ? 'ring-2 ring-white scale-105' : 'opacity-60 hover:opacity-100'}`}
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
