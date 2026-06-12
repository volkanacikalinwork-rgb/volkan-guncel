import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WizardInfoBox from './WizardInfoBox';
import { Sparkles, Loader2, Upload, X } from 'lucide-react';

const CITY_REF_STARTS = { istanbul: 34000 };
const getRefStart = (city) => CITY_REF_STARTS[city] || 1000;

export default function Step2BasicInfo({ form, setForm, lastRefNos = {} }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRealPhoto, setIsRealPhoto] = useState(form.image_type !== '3d');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const suggestedRef = (lastRefNos[form.city] || getRefStart(form.city) - 1) + 1;
  const refExists = Object.values(lastRefNos).includes(parseInt(form.property_ref));

  const handleAiSearch = async () => {
    if (!form.title) { toast.error('Önce proje adını girin'); return; }
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Research the real estate project named "${form.title}" in ${form.city || 'Turkey'}. 
Return a brief 2-3 sentence description about its location, type, and key features.
Return ONLY the description text, no formatting.`,
      add_context_from_internet: true,
    });
    setAiLoading(false);
    set('ai_research', result);
    toast.success('AI araştırma tamamlandı!');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('main_image', file_url);
    set('image_type', isRealPhoto ? 'real' : '3d');
    setUploading(false);
    toast.success('Görsel yüklendi!');
  };

  const toggleRealPhoto = (v) => {
    setIsRealPhoto(v);
    set('image_type', v ? 'real' : '3d');
  };

  return (
    <div>
      <WizardInfoBox>
        Projenin genel kimliğini belirleyin. Referans numarası kök olarak kullanılacak ve ana vitrin fotoğrafı tüm birimlere yansıtılacaktır.
      </WizardInfoBox>

      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">02</span>
        <h2 className="text-sm font-bold text-gray-800">Genel Bilgiler</h2>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Name */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all focus-within:border-emerald-500 focus-within:shadow-sm">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Proje Adı <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Alanya'da Deniz Manzaralı..."
                className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
              />
              <button
                type="button"
                onClick={handleAiSearch}
                disabled={aiLoading || !form.title}
                title="AI ile araştır"
                className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg disabled:opacity-40 transition-colors"
              >
                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI
              </button>
            </div>
            {form.ai_research && (
              <p className="text-[11px] text-indigo-700 bg-indigo-50 rounded-lg p-2 mt-2 leading-relaxed">{form.ai_research}</p>
            )}
          </div>

          {/* Ref No */}
          <div className={`bg-white border rounded-xl p-4 transition-all focus-within:border-emerald-500 ${refExists && form.property_ref ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Referans No <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.property_ref}
              onChange={e => set('property_ref', e.target.value)}
              placeholder={String(suggestedRef)}
              className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 placeholder-gray-300 focus:ring-0 outline-none"
            />
            {refExists && form.property_ref ? (
              <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">⚠️ Bu referans numarası daha önce kullanıldı!</p>
            ) : (
              <p className="text-[11px] text-gray-400 mt-1.5">Önerilen: <span className="font-bold text-emerald-600">{suggestedRef}</span></p>
            )}
          </div>
        </div>

        {/* Cover Image */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              📷 Ana Görsel <span className="text-rose-500">*</span>
            </h3>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-medium text-gray-600">Gerçek Fotoğraf</span>
              <div className="relative">
                <input type="checkbox" checked={isRealPhoto} onChange={e => toggleRealPhoto(e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </div>
            </label>
          </div>

          {form.main_image ? (
            <div className="relative inline-block">
              <img src={form.main_image} alt="cover" className="max-h-48 rounded-xl border border-gray-100 object-cover shadow-sm" />
              <button
                type="button"
                onClick={() => set('main_image', '')}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white shadow-md flex items-center justify-center hover:bg-rose-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${isRealPhoto ? 'bg-emerald-500 text-white' : 'bg-violet-500 text-white'}`}>
                {isRealPhoto ? '📷 Gerçek' : '🎨 3D'}
              </span>
            </div>
          ) : (
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 hover:border-emerald-400 transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-3">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : <Upload className="w-5 h-5" />}
              </div>
              <p className="text-sm font-medium text-gray-700">{uploading ? 'Yükleniyor...' : 'Görseli buraya sürükleyin veya tıklayın'}</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          )}

          {!form.main_image && (
            <div className="mt-3">
              <p className="text-[11px] text-gray-400 mb-1">veya URL ile ekle:</p>
              <input
                type="text"
                value={form.main_image}
                onChange={e => set('main_image', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}