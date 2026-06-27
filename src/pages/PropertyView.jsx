import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Building2, BedDouble, Bath, Maximize, MapPin, Calendar, Home, Eye, ChevronLeft, ChevronRight, X, ArrowLeft, Share2, Heart, Phone, Mail, CheckCircle2, Star, Plane, Building, ShoppingBag, Train, Bus, Navigation, Ruler, Layers, User, Globe, Clock, Tag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_LABELS = {
  apartment: 'Daire',
  villa: 'Villa',
  commercial: 'Ticari',
  land: 'Arsa',
};

const STATUS_LABELS = {
  active: 'Aktif',
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

const DISTANCE_ICONS = {
  'Denize': BeachIcon,
  'Beach': BeachIcon,
  'Merkeze': Building2,
  'City': Building2,
  'Center': Building2,
  'Havalimani': Plane,
  'Airport': Plane,
  'AVM': ShoppingBag,
  'Mall': ShoppingBag,
  'Shopping': ShoppingBag,
  'Market': ShoppingBag,
  'Metro': Train,
  'Metrobus': Train,
  'Bus': Bus,
  'default': MapPin,
};

function BeachIcon({ className }) {
  return <span className={className}>🏖️</span>;
}

function formatDistance(meters) {
  const m = parseInt(meters);
  if (isNaN(m) || m === 0) return '';
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m} m`;
}

function formatPrice(amount, currency = 'USD') {
  if (!amount) return '';
  return `${currency} ${Number(amount).toLocaleString()}`;
}

export default function PropertyView() {
  const { id } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => base44.entities.Property.filter({ id }),
    select: (data) => data?.[0] || null,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Ilan bulunamadi</h2>
          <p className="text-sm text-gray-500 mb-4">Bu ilan mevcut degil veya silinmis olabilir.</p>
          <Link to="/properties">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Illara Don
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

  // Data destructuring
  const photos = property.photos || { general: [], indoor: [], facilities: [], floor_plans: [] };
  const distances = property.distances || [];
  const roomTypes = property.room_types || [];
  const payment = property.payment || { cash: 0, construction: 0, delivery: 0, installment: 0 };
  const features = property.features || [];

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setActiveImage((prev) => (prev + 1) % images.length);
    } else {
      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getDistanceIcon = (label) => {
    const key = Object.keys(DISTANCE_ICONS).find(k => label?.toLowerCase().includes(k.toLowerCase()));
    return DISTANCE_ICONS[key] || DISTANCE_ICONS.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Illara Don</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <Share2 className="w-4 h-4 mr-1.5" /> Paylas
            </Button>
            <Link to={`/properties/${property.id}`}>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Home className="w-4 h-4 mr-1.5" /> Duzenle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Main Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 cursor-pointer group" onClick={() => setShowGalleryModal(true)}>
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500">
                <Building2 className="w-20 h-20 text-white/50" />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); navigateImage('next'); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> {activeImage + 1} / {images.length}
            </div>
          </div>

          {/* Grid Thumbnails */}
          <div className="grid grid-cols-2 gap-2">
            {photos.general?.slice(0, 2).map((img, i) => (
              <div key={`general-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all" onClick={() => { setActiveImage(images.indexOf(img)); setShowGalleryModal(true); }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {photos.indoor?.slice(0, 2).map((img, i) => (
              <div key={`indoor-${i}`} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all" onClick={() => { setActiveImage(images.indexOf(img)); setShowGalleryModal(true); }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {/* Show "View All" overlay if more images */}
            {images.length > 4 && (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 cursor-pointer" onClick={() => setShowGalleryModal(true)}>
                <img src={images[3]} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">+{images.length - 4} daha</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Basic Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {property.property_ref && (
                    <span className="text-xs font-bold text-gray-400 tracking-wide uppercase mb-1 block">
                      Ref: {property.property_ref}
                    </span>
                  )}
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title || 'Basliksiz Ilan'}</h1>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{CITY_LABELS[property.city] || property.city}</span>
                    {property.district && <span>, {property.district}</span>}
                    {property.neighborhood && <span>, {property.neighborhood}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{formatPrice(property.price, property.currency)}</div>
                  {property.property_status === 'daily_rent' && <span className="text-xs text-gray-400">/ gunluk</span>}
                  {property.property_status === 'long_rent' && <span className="text-xs text-gray-400">/ aylik</span>}
                </div>
              </div>

              {/* Eligibility Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {property.citizenship_eligible && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> T.C. Vatandasligi Uygun
                  </span>
                )}
                {property.residency_eligible && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ikamet Iznine Uygun
                  </span>
                )}
                {property.sea_view && (
                  <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-cyan-200">
                    🏖️ Deniz Manzarali
                  </span>
                )}
                {property.featured && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> One Cikan
                  </span>
                )}
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <BedDouble className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800">{property.bedrooms || '-'}</div>
                  <div className="text-xs text-gray-500">Yatak Odasi</div>
                </div>
                <div className="text-center">
                  <Bath className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800">{property.bathrooms || '-'}</div>
                  <div className="text-xs text-gray-500">Banyo</div>
                </div>
                <div className="text-center">
                  <Maximize className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800">{property.size_sqm ? `${property.size_sqm}` : '-'}</div>
                  <div className="text-xs text-gray-500">m²</div>
                </div>
                <div className="text-center">
                  <Home className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-800 capitalize">{TYPE_LABELS[property.type] || property.type || '-'}</div>
                  <div className="text-xs text-gray-500">Tur</div>
                </div>
              </div>
            </div>

            {/* Room Types Table */}
            {roomTypes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-teal-600" /> Oda Tipleri ve Fiyatlar
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-y border-gray-100">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Oda Tipi</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Alt Tip</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">m²</th>
                        <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Banyo</th>
                        <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Fiyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {roomTypes.map((room, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">{room.bedroom}</td>
                          <td className="px-4 py-3 text-gray-600">{room.sub_type || '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{room.size ? `${room.size} m²` : '-'}</td>
                          <td className="px-4 py-3 text-gray-600">{room.bath || '-'}</td>
                          <td className="px-4 py-3 text-right font-semibold text-teal-600">{formatPrice(room.price, room.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" /> Ozellikler ve Olanaklar
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {(showAllFeatures ? features : features.slice(0, 12)).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {features.length > 12 && (
                  <button onClick={() => setShowAllFeatures(!showAllFeatures)} className="w-full mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center justify-center gap-1">
                    {showAllFeatures ? <>Daha az goster <ChevronDown className="w-4 h-4 rotate-180" /></> : <>Tum ozellikleri goster ({features.length - 12} daha) <ChevronDown className="w-4 h-4" /></>}
                  </button>
                )}
              </div>
            )}

            {/* Distances */}
            {distances.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-teal-600" /> Onemli Mesafeler
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {distances.map((d, i) => {
                    const Icon = getDistanceIcon(d.label);
                    return (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          {typeof Icon === 'string' ? <span className="text-lg">{Icon}</span> : <Icon className="w-4 h-4 text-gray-500" />}
                          <span className="text-xs font-medium text-gray-500 uppercase">{d.label}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-800">{formatDistance(d.meters)}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Transport Info */}
                {(property.has_metro || property.has_metrobus || property.has_bus) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Toplu Tasima</h3>
                    <div className="flex flex-wrap gap-3">
                      {property.has_metro && (
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                          <Train className="w-3.5 h-3.5" /> Metro {property.dist_metro ? `(${formatDistance(property.dist_metro)})` : ''}
                        </span>
                      )}
                      {property.has_metrobus && (
                        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full">
                          <Bus className="w-3.5 h-3.5" /> Metrobus {property.dist_metrobus ? `(${formatDistance(property.dist_metrobus)})` : ''}
                        </span>
                      )}
                      {property.has_bus && (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                          <Bus className="w-3.5 h-3.5" /> Otobus Duragi {property.dist_bus ? `(${formatDistance(property.dist_bus)})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Plan */}
            {(payment.cash > 0 || payment.construction > 0 || payment.delivery > 0 || payment.installment > 0) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-600" /> Odeme Plani
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { key: 'cash', label: 'Pesinat', color: 'emerald' },
                    { key: 'construction', label: 'Insat Alti', color: 'blue' },
                    { key: 'delivery', label: 'Teslimatta', color: 'amber' },
                    { key: 'installment', label: 'Vade', color: 'purple' },
                  ].map(({ key, label, color }) => payment[key] > 0 && (
                    <div key={key} className={`bg-${color}-50 rounded-xl p-4 border border-${color}-100`}>
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">{label}</div>
                      <div className={`text-2xl font-bold text-${color}-600`}>%{payment[key]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            {property.lat && property.lng && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" /> Konum
                </h2>
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    title="Mulk Konumu"
                    width="100%"
                    height="100%"
                    src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&hl=tr&output=embed`}
                    frameBorder="0"
                    className="border-0"
                    allowFullScreen
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{CITY_LABELS[property.city] || property.city}{property.district && `, ${property.district}`}{property.neighborhood && `, ${property.neighborhood}`}</span>
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" /> Aciklama
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: property.description }} />
              </div>
            )}

            {/* Project Details */}
            {(property.developer || property.year_built || property.floors || property.block_count) && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" /> Proje Detaylari
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {property.developer && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase mb-1">Gelistirici</div>
                      <div className="font-semibold text-gray-800">{property.developer}</div>
                    </div>
                  )}
                  {property.year_built && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase mb-1">Tamamlanma Tarihi</div>
                      <div className="font-semibold text-gray-800">{property.year_built}</div>
                    </div>
                  )}
                  {property.floors && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase mb-1">Kat Sayisi</div>
                      <div className="font-semibold text-gray-800">{property.floors}</div>
                    </div>
                  )}
                  {property.block_count && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase mb-1">Blok Sayisi</div>
                      <div className="font-semibold text-gray-800">{property.block_count}</div>
                    </div>
                  )}
                </div>
                {(property.list_link_1 || property.list_link_2) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                    {property.list_link_1 && (
                      <a href={property.list_link_1} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium">
                        <Globe className="w-4 h-4" /> Lisansli Liste 1
                      </a>
                    )}
                    {property.list_link_2 && (
                      <a href={property.list_link_2} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium">
                        <Globe className="w-4 h-4" /> Lisansli Liste 2
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-20">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Iletisim</h3>
              <div className="space-y-3">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white h-11">
                  <Phone className="w-4 h-4 mr-2" /> Hemen Ara
                </Button>
                <Button variant="outline" className="w-full h-11">
                  <Mail className="w-4 h-4 mr-2" /> E-posta Gonder
                </Button>
                <Button variant="outline" className="w-full h-11">
                  <Heart className="w-4 h-4 mr-2" /> Kaydet
                </Button>
              </div>
            </div>

            {/* Floor Plans */}
            {photos.floor_plans?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-teal-600" /> Kat Planlari
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {photos.floor_plans.map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-teal-500" onClick={() => { setActiveImage(images.indexOf(img)); setShowGalleryModal(true); }}>
                      <img src={img} alt={`Floor plan ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Hizli Bilgi</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Durum</span>
                  <span className="font-medium text-gray-800">{STATUS_LABELS[property.status] || property.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mulk Tipi</span>
                  <span className="font-medium text-gray-800">{TYPE_LABELS[property.type] || property.type}</span>
                </div>
                {property.sub_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Alt Tip</span>
                    <span className="font-medium text-gray-800">{property.sub_type}</span>
                  </div>
                )}
                {property.floor_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bulundugu Kat</span>
                    <span className="font-medium text-gray-800">{property.floor_number}. Kat</span>
                  </div>
                )}
                {property.year_built && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Yapim Yili</span>
                    <span className="font-medium text-gray-800">{property.year_built}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button onClick={() => setShowGalleryModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white p-2">
            <X className="w-8 h-8" />
          </button>
          <button onClick={() => navigateImage('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button onClick={() => navigateImage('next')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2">
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="max-w-5xl max-h-[80vh] w-full mx-4">
            {images[activeImage] && (
              <img src={images[activeImage]} alt="" className="w-full h-full object-contain" />
            )}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
