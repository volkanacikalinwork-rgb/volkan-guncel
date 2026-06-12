import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import WizardInfoBox from './WizardInfoBox';

const TYPE_ICONS = { apartment: '🏢', villa: '🏡', commercial: '🏪', land: '🌍' };

export default function Step1PropertyType({ form, setForm }) {
  const { data: propertyTypes = [] } = useQuery({
    queryKey: ['property-types'],
    queryFn: () => base44.entities.PropertyType.list('order'),
  });

  const types = propertyTypes.filter(t => t.is_active);
  const selected = form.type;

  return (
    <div>
      <WizardInfoBox>Portföyünüze ekleyeceğiniz mülk türünü seçin. Seçtiğiniz tür, ilerleyen adımlardaki alanları ve kategorileri belirler.</WizardInfoBox>

      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">01</span>
        <h2 className="text-sm font-bold text-gray-800">Mülk Türü Seçimi</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {types.map(t => (
          <button
            key={t.slug}
            type="button"
            onClick={() => setForm(f => ({ ...f, type: t.slug, sub_type: '' }))}
            className={`p-5 rounded-xl border-2 transition-all text-center hover:border-emerald-400 hover:shadow-sm ${
              selected === t.slug
                ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-3xl mb-2">{t.icon || TYPE_ICONS[t.slug] || '🏠'}</div>
            <p className={`text-sm font-bold ${selected === t.slug ? 'text-emerald-700' : 'text-gray-700'}`}>{t.name}</p>
          </button>
        ))}
      </div>


    </div>
  );
}