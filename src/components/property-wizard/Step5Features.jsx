import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Sparkles, Loader2, Search } from 'lucide-react';
import { ALL_FEATURES } from '@/lib/constants';
import WizardInfoBox from './WizardInfoBox';

const POPULAR = ['Pool', 'Elevator', 'Security', 'Gym', 'Outdoor Parking', 'Indoor Parking', 'Garden', 'Sea View', 'Furniture', 'Air Conditioning', 'Generator', 'Camera', 'White Goods', 'Smart Home'];

export default function Step5Features({ form, setForm }) {
  const [search, setSearch] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const selected = form.features || [];

  const toggle = (f) => {
    set('features', selected.includes(f) ? selected.filter(x => x !== f) : [...selected, f]);
  };

  const filtered = ALL_FEATURES.filter(f => f.toLowerCase().includes(search.toLowerCase()));

  const handleAiFeatures = async () => {
    if (!form.title) { toast.error('Önce proje adını girin'); return; }
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `For "${form.title}" (${form.type || 'apartment'}) in ${form.city || 'Turkey'}, suggest the most likely features from: ${ALL_FEATURES.join(', ')}. Return JSON: {"features": ["Pool", "Elevator", ...]} max 15 items, only from the list above.`,
      add_context_from_internet: true,
      response_json_schema: { type: 'object', properties: { features: { type: 'array', items: { type: 'string' } } } }
    });
    setAiLoading(false);
    if (result?.features) {
      const valid = result.features.filter(f => ALL_FEATURES.includes(f));
      set('features', valid);
      toast.success(`AI ${valid.length} özellik önerdi!`);
    }
  };

  const selectPopular = () => {
    const toAdd = POPULAR.filter(f => !selected.includes(f));
    set('features', [...selected, ...toAdd]);
    toast.success('Popüler özellikler eklendi!');
  };

  return (
    <div>
      <WizardInfoBox>
        Özellikleri belirleyin. Seçili mülk türleri için öne çıkan özellikleri işaretleyin. En az 1 özellik seçmeniz zorunludur.
      </WizardInfoBox>

      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">05</span>
          <h2 className="text-sm font-bold text-gray-800">{form.type ? form.type.charAt(0).toUpperCase() + form.type.slice(1) : 'Apartment'} Özellikleri</h2>
          <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded">{selected.length} seçili</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleAiFeatures} disabled={aiLoading}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI ile Araştır
          </button>
          <button type="button" onClick={selectPopular}
            className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
            ⭐ Trendleri Otomatik Seç
          </button>
        </div>
      </div>

      {/* Selected */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
          {selected.map(f => (
            <button key={f} type="button" onClick={() => toggle(f)}
              className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full hover:bg-emerald-700 transition-colors">
              {f} ×
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Özellik ara..."
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Feature chips */}
      <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
        {filtered.map(f => {
          const isSel = selected.includes(f);
          return (
            <button key={f} type="button" onClick={() => toggle(f)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                isSel ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-700'
              }`}>
              {f}
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl p-3 mt-4 flex items-center gap-2">
          ⚠️ En az 1 özellik seçmeniz zorunludur.
        </div>
      )}
    </div>
  );
}