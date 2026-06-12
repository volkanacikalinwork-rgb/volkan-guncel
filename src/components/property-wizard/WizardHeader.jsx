import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  { id: 1, label: 'Tür' },
  { id: 2, label: 'Genel' },
  { id: 3, label: 'Konum' },
  { id: 4, label: 'Proje' },
  { id: 5, label: 'Özellikler' },
  { id: 6, label: 'Fiyat' },
  { id: 7, label: 'Fotoğraf' },
  { id: 8, label: 'İçerik' },
];

export default function WizardHeader({ currentStep }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5 mb-6">
      <div className="flex items-center gap-3">
        <Link to="/properties" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Hızlı Portföy Ekleme</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tek sayfa üzerinden modern mülk/proje yükleme sihirbazı.</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 flex-shrink-0">
        {STEPS.map((s, i) => {
          const isDone = currentStep > s.id;
          const isActive = currentStep === s.id;
          return (
            <div key={s.id} className="flex items-center gap-1.5 flex-shrink-0">
              <div className={`flex items-center gap-1 ${!isActive && !isDone ? 'opacity-40' : ''}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  isActive ? 'bg-slate-900 text-white' :
                  isDone ? 'bg-emerald-500 text-white' :
                  'border border-gray-300 text-gray-600'
                }`}>
                  {isDone ? '✓' : s.id}
                </span>
                <span className={`text-xs ${isActive ? 'font-bold text-slate-900' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-3 ${isDone ? 'bg-emerald-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}