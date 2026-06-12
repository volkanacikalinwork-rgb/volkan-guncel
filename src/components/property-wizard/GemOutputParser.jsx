import { useState } from 'react';
import { CheckCircle2, AlertCircle, Layers } from 'lucide-react';

function buildInfoText(form) {
  const city = form.city ? form.city.charAt(0).toUpperCase() + form.city.slice(1) : '';
  const rooms = form.room_types || [];
  const distances = form.distances || [];
  const features = form.features || [];
  const payment = form.payment || {};
  const distStr = distances.filter(d => d.label && d.meters).map(d => `${d.label}: ${d.meters}m`).join(', ');
  const roomLines = rooms.map((r, i) =>
    `Oda ${i + 1}: Type: ${form.type || 'apartment'} | Bedroom: ${r.bedroom || ''} | Size: ${r.size || '?'} m² | Bath: ${r.bath || 1} | Floor: ${r.floor || '-'}`
  ).join('\n');

  const payLine = `On Handover: %${payment.delivery || ''}, Down Payment: %${payment.cash || ''}, Post Handover: %${payment.installment || ''}, During Construction: %${payment.construction || ''}`;

  return `Proje Adı: ${form.title || '-'}
Lokasyon: Turkey / ${city}${form.district ? ' / ' + form.district : ''}${form.neighborhood ? ' / ' + form.neighborhood : ''}
Özellikler: ${features.join(', ') || '-'}
Mesafeler: ${distStr || '-'}
Info Text: (mülk özeti buraya)
----- Oda Tipleri -----
${roomLines || '  -'}
Ödeme Planı (Proje): ${payLine}
-----------------
Yapı Bilgileri
TOPLAM ALAN: ${form.size_sqm || '-'}
BLOK SAYISI: ${form.block_count || '-'}
TESLİM / İNŞAAT TARİHİ: ${form.year_built || '-'}`;
}

export default function GemOutputParser({ form, setForm, gemLinks = [] }) {
  const [gemText, setGemText] = useState('');
  const [pool, setPool] = useState({ seoTitles: [], metaTitles: [], metaDescs: [], si: 0, mi: 0, di: 0 });
  const [parsed, setParsed] = useState(false);

  const infoText = buildInfoText(form);

  const copy = () => {
    navigator.clipboard.writeText(infoText);
  };

  const parseJson = (text) => {
    try {
      const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
      const data = JSON.parse(cleaned);
      const seoTitles = data?.titles?.seo_titles || [];
      const metaTitles = data?.titles?.meta_titles || [];
      const metaDescs = data?.meta_descriptions || [];
      if (seoTitles.length || metaTitles.length || metaDescs.length) {
        return { seoTitles, metaTitles, metaDescs };
      }
    } catch {}
    return null;
  };

  const parseText = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let section = '';
    const seoTitles = [], metaTitles = [], metaDescs = [];
    lines.forEach(line => {
      const ll = line.toLowerCase();
      if (ll.includes('seo başlık') || ll.includes('seo_title') || ll.includes('seo title')) { section = 'seo'; return; }
      if (ll.includes('meta başlık') || ll.includes('meta_title') || ll.includes('meta title')) { section = 'meta'; return; }
      if (ll.includes('description') || ll.includes('açıklama') || ll.includes('meta_desc')) { section = 'desc'; return; }
      const clean = line.replace(/^\d+[\.\-\)]\s*/, '').replace(/^["']|["']$/g, '');
      if (clean.length > 5) {
        if (section === 'seo') seoTitles.push(clean);
        else if (section === 'meta') metaTitles.push(clean);
        else if (section === 'desc') metaDescs.push(clean);
      }
    });
    if (seoTitles.length || metaTitles.length || metaDescs.length) return { seoTitles, metaTitles, metaDescs };
    return null;
  };

  const handlePaste = (text) => {
    setGemText(text);
    if (!text.trim()) { setParsed(false); return; }
    const result = parseJson(text) || parseText(text);
    if (result) {
      setPool({ ...result, si: 0, mi: 0, di: 0 });
      setParsed(true);
      // Auto-apply first options
      applyToForm(result.seoTitles[0], result.metaTitles[0], result.metaDescs[0]);
    }
  };

  const applyToForm = (seo, meta, desc) => {
    setForm(f => ({
      ...f,
      seo_title: seo || f.seo_title,
      title: seo || f.title,
      seo_description: desc || f.seo_description,
    }));
  };

  const select = (type, idx) => {
    const newPool = { ...pool, [type === 'seo' ? 'si' : type === 'meta' ? 'mi' : 'di']: idx };
    setPool(newPool);
    applyToForm(
      newPool.seoTitles[newPool.si],
      newPool.metaTitles[newPool.mi],
      newPool.metaDescs[newPool.di]
    );
  };

  const charColor = (len, max) => len === 0 ? 'text-gray-400' : len <= max ? 'text-emerald-600' : 'text-rose-500';

  const activeTitle = pool.seoTitles[pool.si] || '';
  const activeMeta = pool.metaTitles[pool.mi] || '';
  const activeDesc = pool.metaDescs[pool.di] || '';

  return (
    <div className="space-y-5">
      {/* Step 1: Copy data */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">1. Adım: Veriyi Kopyalayın</h3>
          <button type="button" onClick={copy}
            className="text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors">
            📋 Panoya Kopyala
          </button>
        </div>
        <textarea readOnly rows={6} value={infoText}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-500 focus:ring-0 outline-none leading-relaxed resize-none" />
        {gemLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {gemLinks.map((g, i) => (
              <a key={i} href={g.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm">
                💎 {g.name}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Paste Gem output */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">2. Adım: GEM Çıktısını Yapıştırın</h3>
        <textarea rows={6} value={gemText} onChange={e => handlePaste(e.target.value)}
          placeholder="Gemini GEM'den aldığınız JSON veya metin çıktısını buraya yapıştırın..."
          className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs font-mono text-slate-700 focus:ring-0 outline-none leading-relaxed resize-none" />
        {parsed && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>GEM çıktısı başarıyla ayrıştırıldı. Aşağıdan alternatifleri seçebilirsiniz.</span>
          </div>
        )}
      </div>

      {/* Parsed alternatives + right panel */}
      {parsed && (pool.seoTitles.length > 0 || pool.metaTitles.length > 0 || pool.metaDescs.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Alternatives columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SEO Titles */}
            <div>
              <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> SEO Başlıkları
              </p>
              <div className="space-y-2">
                {pool.seoTitles.map((t, i) => (
                  <button key={i} type="button" onClick={() => select('seo', i)}
                    className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl border transition-all ${
                      pool.si === i ? 'border-teal-500 bg-teal-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Meta Titles */}
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Meta Başlıkları
              </p>
              <div className="space-y-2">
                {pool.metaTitles.map((t, i) => (
                  <button key={i} type="button" onClick={() => select('meta', i)}
                    className={`w-full text-left p-2.5 text-xs font-semibold rounded-xl border transition-all ${
                      pool.mi === i ? 'border-emerald-500 bg-emerald-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Meta Descs */}
            <div>
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Meta Açıklamaları
              </p>
              <div className="space-y-2">
                {pool.metaDescs.map((d, i) => (
                  <button key={i} type="button" onClick={() => select('desc', i)}
                    className={`w-full text-left p-2.5 text-xs font-medium rounded-xl border transition-all leading-relaxed ${
                      pool.di === i ? 'border-blue-500 bg-blue-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right summary panel */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 sticky top-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">Seçili Veriler</h3>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">SEO Title (Başlık)</span>
                  {activeTitle.length > 0 && (activeTitle.length <= 60
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />)}
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-700 leading-relaxed min-h-[40px]">
                  {activeTitle || <span className="text-slate-300">Seçilmedi...</span>}
                </div>
                <div className={`text-right text-[10px] font-mono ${charColor(activeTitle.length, 60)}`}>{activeTitle.length}/60 karakter</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Meta Title</span>
                  {activeMeta.length > 0 && (activeMeta.length <= 70
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />)}
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-700 leading-relaxed min-h-[40px]">
                  {activeMeta || <span className="text-slate-300">Seçilmedi...</span>}
                </div>
                <div className={`text-right text-[10px] font-mono ${charColor(activeMeta.length, 70)}`}>{activeMeta.length}/70 karakter</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Description</span>
                  {activeDesc.length > 0 && (activeDesc.length <= 160
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />)}
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-medium text-slate-600 leading-relaxed min-h-[48px]">
                  {activeDesc || <span className="text-slate-300">Seçilmedi...</span>}
                </div>
                <div className={`text-right text-[10px] font-mono ${charColor(activeDesc.length, 160)}`}>{activeDesc.length}/160 karakter</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}