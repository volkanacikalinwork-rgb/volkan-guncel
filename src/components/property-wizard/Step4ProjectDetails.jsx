import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WizardInfoBox from './WizardInfoBox';
import { Sparkles, Loader2 } from 'lucide-react';

const DEFAULT_PAYMENT = { cash: 0, construction: 0, delivery: 0, installment: 0 };

export default function Step4ProjectDetails({ form, setForm }) {
  const [aiLoading, setAiLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const payment = form.payment || DEFAULT_PAYMENT;
  const setPayment = (key, val) => setForm(f => ({ ...f, payment: { ...(f.payment || DEFAULT_PAYMENT), [key]: Number(val) || 0 } }));
  const payTotal = (payment.cash || 0) + (payment.construction || 0) + (payment.delivery || 0) + (payment.installment || 0);

  const handleAiResearch = async () => {
    const title = form.title || '';
    if (!title) { toast.error('Proje adı bulunamadı'); return; }
    setAiLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Research the real estate project "${title}" in ${form.city || 'Turkey'}. Find: construction/completion year (MM/YYYY), total land area (sqm), number of blocks, number of floors, developer company name.
Return JSON only: {"year_built": "07/2026", "size_sqm": 50000, "block_count": 3, "floors": 12, "developer": "Company Name"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          year_built: { type: 'string' }, size_sqm: { type: 'number' },
          block_count: { type: 'number' }, floors: { type: 'number' }, developer: { type: 'string' }
        }
      }
    });
    setAiLoading(false);
    const updates = {};
    if (result.year_built) updates.year_built = result.year_built;
    if (result.size_sqm) updates.size_sqm = String(result.size_sqm);
    if (result.block_count) updates.block_count = String(result.block_count);
    if (result.floors) updates.floors = String(result.floors);
    if (result.developer) updates.developer = result.developer;
    setForm(f => ({ ...f, ...updates }));
    toast.success('AI yapı bilgilerini getirdi!');
  };

  return (
    <div>
      <WizardInfoBox>Teknik detayları netleştirin. Yapım yılı, arsa genişliği ve özel ödeme planlarını buradan tanımlayabilirsiniz.</WizardInfoBox>

      {/* Project name echo */}
      {form.title && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mb-5 flex items-center justify-between gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">📋 Proje İsmi</label>
            <p className="text-sm font-bold text-gray-700">{form.title}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">04</span>
          <h2 className="text-sm font-bold text-gray-800">Proje Detayları</h2>
        </div>
        <button type="button" onClick={handleAiResearch} disabled={aiLoading}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all">
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI ile Teknik Detayları Araştır
        </button>
      </div>

      <div className="space-y-5">
        {/* Technical fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'year_built', label: '🏗️ İnşaat Yılı', placeholder: 'AA/YYYY', required: true },
            { key: 'size_sqm', label: '🔳 Toplam M²', placeholder: '0', suffix: 'm²' },
            { key: 'block_count', label: '🏢 Blok Sayısı', placeholder: '0', required: true },
            { key: 'floors', label: '📶 Kat Sayısı', placeholder: '0', required: true },
          ].map(({ key, label, placeholder, suffix, required }) => (
            <div key={key} className="bg-white border border-gray-200 rounded-xl p-3 transition-all focus-within:border-emerald-500">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {label} {required && <span className="text-rose-500">*</span>}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type={key === 'year_built' ? 'text' : 'number'}
                  value={form[key] || ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none"
                />
                {suffix && <span className="text-xs text-gray-400 font-medium">{suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Developer + Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">🏢 Geliştirici Şirket <span className="text-rose-500">*</span></label>
            <input type="text" value={form.developer || ''} onChange={e => set('developer', e.target.value)}
              placeholder="Şirket adı..." className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
          </div>
          <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">🔗 Liste Linki 1 <span className="text-rose-500">*</span></label>
            <input type="url" value={form.list_link_1 || ''} onChange={e => set('list_link_1', e.target.value)}
              placeholder="URL" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
          </div>
          <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl p-3 focus-within:border-emerald-500 transition-all">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">🔗 Liste Linki 2 <span className="text-rose-500">*</span></label>
            <input type="url" value={form.list_link_2 || ''} onChange={e => set('list_link_2', e.target.value)}
              placeholder="URL" className="w-full bg-transparent border-0 p-0 text-xs font-bold text-gray-800 focus:ring-0 outline-none" />
          </div>
        </div>

        {/* Payment Plan */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              💰 Ödeme Planı Yapılandırma <span className="text-rose-500">*</span>
            </h3>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
              payTotal === 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              Toplam: %{payTotal}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { key: 'cash', label: 'Peşinat' },
              { key: 'construction', label: 'İnşaat Altı' },
              { key: 'delivery', label: 'Teslimatta' },
              { key: 'installment', label: 'Vade' },
            ].map(({ key, label }) => (
              <div key={key} className="bg-gray-50/50 border border-gray-200/60 rounded-xl p-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                <label className="block text-[9px] font-bold text-gray-400 text-center uppercase tracking-wider mb-1">{label}</label>
                <div className="flex items-center justify-center gap-0.5">
                  <input
                    type="number"
                    value={payment[key] || 0}
                    onChange={e => setPayment(key, e.target.value)}
                    min="0" max="100"
                    className="w-12 text-center bg-transparent border-0 p-0 text-sm font-bold text-gray-800 focus:ring-0 outline-none"
                  />
                  <span className="text-xs text-gray-400 font-semibold">%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${payTotal === 100 ? 'bg-emerald-500' : payTotal > 100 ? 'bg-rose-500' : 'bg-amber-400'}`}
              style={{ width: `${Math.min(payTotal, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 text-right">Dağılım: {payTotal}% / %100</p>
        </div>
      </div>

      {/* Validation hint */}
      {(!form.block_count || !form.floors || !form.developer || !form.list_link_1) && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl p-3 mt-4 flex items-center gap-2">
          ⚠️ Devam etmek için: Blok Sayısı, Kat Sayısı, Geliştirici Şirket ve Liste Linki 1 zorunludur.
          {payTotal !== 100 && ' Ödeme planı toplamı %100 olmalıdır.'}
        </div>
      )}
    </div>
  );
}