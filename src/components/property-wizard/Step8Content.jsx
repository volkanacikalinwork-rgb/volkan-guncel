import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GemOutputParser from './GemOutputParser';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';

function buildInfoText(form) {
  const city = form.city ? form.city.charAt(0).toUpperCase() + form.city.slice(1) : '';
  const rooms = form.room_types || [];
  const distances = form.distances || [];
  const features = form.features || [];
  const payment = form.payment || {};

  const distStr = distances.filter(d => d.label && d.meters).map(d => `${d.label}: ${d.meters}m`).join(', ');
  const roomLines = rooms.map((r, i) => `  Oda ${i + 1}: ${r.bedroom || ''} | ${r.size || '?'} m² | ${r.bath || 1} Banyo | Fiyat: ${r.currency || 'USD'} ${r.price || '?'}`).join('\n');

  return `--- PROJE BİLGİ KARTI ---
Proje Adı: ${form.title || '-'}
Referans: ${form.property_ref || '-'}
Lokasyon: Turkey / ${city}${form.district ? ' / ' + form.district : ''}${form.neighborhood ? ' / ' + form.neighborhood : ''}
Tür: ${form.type || '-'} | Alt Tip: ${form.sub_type || '-'}
Geliştirici: ${form.developer || '-'}
İnşaat Yılı: ${form.year_built || '-'} | Blok: ${form.block_count || '-'} | Kat: ${form.floors || '-'} | Alan: ${form.size_sqm || '-'} m²
Mesafeler: ${distStr || '-'}
Toplu Taşıma: ${[form.has_metro && 'Metro', form.has_metrobus && 'Metrobüs', form.has_bus && 'Otobüs'].filter(Boolean).join(', ') || '-'}

Özellikler: ${features.join(', ') || '-'}

Oda Tipleri:
${roomLines || '  -'}

Ödeme Planı: Peşinat %${payment.cash || 0} | İnşaat Altı %${payment.construction || 0} | Teslimatta %${payment.delivery || 0} | Vade %${payment.installment || 0}

AI Research Notu: ${form.ai_research || '-'}
--- / ---`;
}

export default function Step8Content({ form, setForm, gemLinks = [], onComplete }) {
  const [showEditor, setShowEditor] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const infoText = buildInfoText(form);

  const handleAiGenerate = async () => {
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a real estate content writer. Based on the property info below, generate:
1. A compelling property listing title (max 10 words)
2. An SEO meta title (max 60 chars, include city + type + "Turkey")
3. A short meta description (max 155 chars, natural English)
4. A detailed property description (HTML, 3-4 paragraphs)

Property info:
${infoText}

Return JSON: {"title": "...", "seo_title": "...", "seo_description": "...", "description": "<p>...</p>"}`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' }, seo_title: { type: 'string' },
          seo_description: { type: 'string' }, description: { type: 'string' }
        }
      }
    });
    setAiLoading(false);
    if (result.title) set('title', result.title);
    if (result.seo_title) set('seo_title', result.seo_title);
    if (result.seo_description) set('seo_description', result.seo_description);
    if (result.description) set('description', result.description);
    toast.success('AI içerik üretildi!');
  };

  if (!showEditor) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">08</span>
          <h2 className="text-sm font-bold text-gray-800">İçerik Üretme</h2>
        </div>

        {/* Hub card */}
        <div className="relative bg-white border border-gray-100 rounded-xl shadow-sm p-6 md:p-8 overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400" />
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">📄</div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Yapay Zeka İçerik Akışı</h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                Aşağıdaki GEM linklerini kullanarak mülk verilerini yapıştırın ve otomatik içerik üretin.
              </p>

            </div>
          </div>
        </div>

        {/* Gem Parser */}
        <GemOutputParser form={form} setForm={setForm} gemLinks={gemLinks} />
      </div>
    );
  }

  // Editor view
  return (
    <div>
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowEditor(false)}
            className="text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-lg transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <h2 className="text-sm font-bold text-gray-800">Yapay Zeka İçerik Yönetim Masası</h2>
        </div>
        <button type="button" onClick={handleAiGenerate} disabled={aiLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm">
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI ile Otomatik Oluştur
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">İlan Başlığı</label>
            <input type="text" value={form.title || ''} onChange={e => set('title', e.target.value)}
              placeholder="Yapay zeka tarafından üretilecek..."
              className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 focus:ring-0 outline-none" />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Meta Başlığı (SEO)</label>
            <input type="text" value={form.seo_title || ''} onChange={e => set('seo_title', e.target.value)}
              placeholder="SEO başlığı..."
              className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-gray-800 focus:ring-0 outline-none" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kısa Açıklama (Meta Description)</label>
          <textarea rows={2} value={form.seo_description || ''} onChange={e => set('seo_description', e.target.value)}
            placeholder="İlanın arama motorlarında görünecek kısa özeti..."
            className="w-full bg-transparent border-0 p-0 text-sm font-medium text-gray-700 focus:ring-0 outline-none resize-none" />
        </div>

        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
          <div className="p-2 bg-gray-50 border-b border-gray-100 flex gap-1 text-gray-400 text-xs">
            <button type="button" className="font-bold hover:text-gray-700 px-2 py-0.5 rounded">B</button>
            <button type="button" className="italic hover:text-gray-700 px-2 py-0.5 rounded">I</button>
            <button type="button" className="underline hover:text-gray-700 px-2 py-0.5 rounded">U</button>
            <div className="w-px bg-gray-200 mx-1" />
            <span className="px-2 py-0.5 text-gray-300">HTML</span>
          </div>
          <textarea rows={8} value={form.description || ''} onChange={e => set('description', e.target.value)}
            placeholder="Birebir algoritmik detaylı ilan metni (HTML formatında)..."
            className="w-full bg-transparent border-0 p-4 text-sm font-medium text-gray-700 focus:ring-0 outline-none" />
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onComplete}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            ☁️ Portföyü Yayına Al ve Sihirbazı Bitir
          </button>
        </div>
      </div>
    </div>
  );
}