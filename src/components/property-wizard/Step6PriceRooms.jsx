import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import WizardInfoBox from './WizardInfoBox';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const PROPERTY_STATUSES = [
  { value: 'for_sale', label: '🏷️ For Sale' },
  { value: 'daily_rent', label: '📅 Daily Rent' },
  { value: 'long_rent', label: '📋 Long Rent' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY', 'AED'];
const BEDROOM_OPTS = ['Studio', '1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1', 'Duplex', 'Penthouse', 'Villa'];

const defaultRoom = () => ({ bedroom: '1+1', sub_type: '', size: '', price: '', currency: 'USD', bath: 1, floor: '' });

export default function Step6PriceRooms({ form, setForm }) {
  const [expandedRoom, setExpandedRoom] = useState(null);

  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['property-types'],
    queryFn: () => base44.entities.PropertyType.list('order'),
  });
  const selectedType = propertyTypes.find(t => t.slug === form.type);
  const subTypeOpts = selectedType?.sub_types || [];

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const rooms = form.room_types || [];

  const addRoom = () => {
    const newRooms = [...rooms, defaultRoom()];
    setForm(f => ({ ...f, room_types: newRooms }));
    setExpandedRoom(newRooms.length - 1);
  };

  const removeRoom = (i) => setForm(f => ({ ...f, room_types: f.room_types.filter((_, idx) => idx !== i) }));
  const updateRoom = (i, key, val) => setForm(f => ({
    ...f,
    room_types: f.room_types.map((r, idx) => idx === i ? { ...r, [key]: val } : r)
  }));

  // Auto-compute showcase price as min of room prices
  const minPrice = rooms.reduce((min, r) => {
    const p = parseFloat(r.price);
    return (!isNaN(p) && (min === null || p < min)) ? p : min;
  }, null);

  const missingFields = [];
  if (!form.property_status) missingFields.push('Mülk Durumu');
  if (rooms.length === 0) missingFields.push('En az 1 oda tipi');

  return (
    <div>
      <WizardInfoBox>
        Birim bazlı fiyatlandırmayı yapın. Her oda tipi için başlangıç fiyatlarını kaydedin. Vitrin fiyatı otomatik olarak en düşük fiyattan belirlenir.
      </WizardInfoBox>

      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">06</span>
        <h2 className="text-sm font-bold text-gray-800">Fiyat ve Oda Detayları</h2>
      </div>

      {/* Property Status */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white mb-5">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Mülk Durumu <span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {PROPERTY_STATUSES.map(s => (
            <button key={s.value} type="button"
              onClick={() => set('property_status', s.value)}
              className={`px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                form.property_status === s.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-emerald-400 bg-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Room Types */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          🛏️ Tanımlı Oda Tipleri
          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-bold">({rooms.length})</span>
        </div>
        <button type="button" onClick={addRoom}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Yeni Ekle
        </button>
      </div>

      {/* Showcase price */}
      {minPrice !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="text-xs text-emerald-700 font-bold">🏷️ Vitrin Fiyatı:</span>
          <span className="text-sm font-bold text-emerald-800">{rooms.find(r => parseFloat(r.price) === minPrice)?.currency || 'USD'} {minPrice.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-600">(en düşük birim fiyatından otomatik)</span>
        </div>
      )}

      <div className="space-y-3">
        {rooms.map((room, i) => (
          <div key={i} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            <div
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() => setExpandedRoom(expandedRoom === i ? null : i)}
            >
              <div className="flex items-center gap-2">
                {expandedRoom === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                <span className="text-sm font-bold text-gray-700">{room.bedroom || 'Oda ' + (i + 1)}</span>
                {room.sub_type && <span className="text-xs text-gray-500 italic">{room.sub_type}</span>}
                {room.size && <span className="text-xs text-gray-400">{room.size} m²</span>}
                {room.price && <span className="text-xs font-semibold text-emerald-600">{room.currency} {Number(room.price).toLocaleString()}</span>}
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm('Sil?')) removeRoom(i); }}
                className="text-gray-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {expandedRoom === i && (
              <div className="border-t border-gray-100 p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Oda Sayısı</label>
                    <select value={room.bedroom} onChange={e => updateRoom(i, 'bedroom', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none">
                      {BEDROOM_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  {subTypeOpts.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alt Tip (isteğe bağlı)</label>
                      <select value={room.sub_type || ''} onChange={e => updateRoom(i, 'sub_type', e.target.value)}
                        className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none">
                        <option value="">— Seçiniz —</option>
                        {subTypeOpts.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alan (m²)</label>
                    <input type="number" value={room.size} onChange={e => updateRoom(i, 'size', e.target.value)}
                      placeholder="0" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Banyo</label>
                    <input type="number" value={room.bath} onChange={e => updateRoom(i, 'bath', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fiyat <span className="text-rose-500">*</span></label>
                    <input type="number" value={room.price} onChange={e => updateRoom(i, 'price', e.target.value)}
                      placeholder="0" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Para Birimi</label>
                    <select value={room.currency} onChange={e => updateRoom(i, 'currency', e.target.value)}
                      className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none">
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {missingFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl p-3 mt-4 flex items-center gap-2">
          ⚠️ Yayınlamak için şunları tamamlayın: {missingFields.join(', ')}
        </div>
      )}
    </div>
  );
}