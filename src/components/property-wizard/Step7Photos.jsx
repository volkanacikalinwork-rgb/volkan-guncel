import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import WizardInfoBox from './WizardInfoBox';
import { Plus, Loader2, X } from 'lucide-react';

const CATEGORIES = [
  { key: 'general', label: 'General', icon: '🖼️' },
  { key: 'indoor', label: 'Indoor', icon: '🛋️' },
  { key: 'facilities', label: 'Facilities', icon: '🏊' },
  { key: 'floor_plans', label: 'Floor Plans', icon: '📐' },
];

function PhotoCategory({ cat, images, onUpload, onRemove, onSetMain, mainImage }) {
  const [uploading, setUploading] = useState(false);
  const inputId = `photo-input-${cat.key}`;

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onUpload(cat.key, file_url);
    }
    setUploading(false);
    toast.success(`${files.length} görsel yüklendi!`);
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <span>{cat.icon}</span>
          {cat.label}
          <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-bold">
            {images.length} Görsel
          </span>
        </div>
        <label htmlFor={inputId} className="w-7 h-7 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </label>
        <input type="file" id={inputId} multiple accept="image/*" className="hidden" onChange={handleFiles} disabled={uploading} />
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-gray-300 italic py-1">Henüz görsel yüklenmedi...</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-100">
              <img src={url} alt="" className="w-full h-16 object-cover" />
              {mainImage === url && (
                <div className="absolute top-0.5 left-0.5 bg-primary text-white text-[8px] font-bold px-1 py-0.5 rounded">ANA</div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                <button type="button" onClick={() => onSetMain(url)}
                  className="text-[9px] font-bold text-white bg-primary/80 px-1.5 py-0.5 rounded hover:bg-primary w-full text-center">
                  Ana Yap
                </button>
                <button type="button" onClick={() => onRemove(cat.key, url)}
                  className="text-white bg-rose-500 rounded p-0.5">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Step7Photos({ form, setForm }) {
  const photos = form.photos || { general: [], indoor: [], facilities: [], floor_plans: [] };

  const setPhotos = (p) => setForm(f => ({ ...f, photos: p }));

  const onUpload = (cat, url) => {
    const updated = { ...photos, [cat]: [...(photos[cat] || []), url] };
    setPhotos(updated);
    // Set first image as main if none set
    if (!form.main_image) setForm(f => ({ ...f, main_image: url, photos: updated }));
  };

  const onRemove = (cat, url) => {
    const updated = { ...photos, [cat]: photos[cat].filter(u => u !== url) };
    setPhotos(updated);
    if (form.main_image === url) setForm(f => ({ ...f, main_image: '', photos: updated }));
  };

  const onSetMain = (url) => {
    setForm(f => ({ ...f, main_image: url }));
    toast.success('Ana görsel güncellendi!');
  };

  const totalPhotos = CATEGORIES.reduce((sum, c) => sum + (photos[c.key] || []).length, 0);

  return (
    <div>
      <WizardInfoBox>
        Mülk fotoğraflarını yükleyin. Sürükle-bırak veya butona tıklayarak görsel ekleyebilirsiniz. <b>Bu adımı atlayıp sonradan da yükleyebilirsiniz.</b>
      </WizardInfoBox>

      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">07</span>
        <h2 className="text-sm font-bold text-gray-800">Fotoğraf Yükleme</h2>
        {totalPhotos > 0 && <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full">{totalPhotos} toplam</span>}
      </div>

      <div className="space-y-3">
        {CATEGORIES.map(cat => (
          <PhotoCategory
            key={cat.key}
            cat={cat}
            images={photos[cat.key] || []}
            onUpload={onUpload}
            onRemove={onRemove}
            onSetMain={onSetMain}
            mainImage={form.main_image}
          />
        ))}
      </div>
    </div>
  );
}