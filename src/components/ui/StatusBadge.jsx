import { cn } from '@/lib/utils';

const statusConfig = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  sold: 'bg-slate-100 text-slate-600 border-slate-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
  new: 'bg-violet-50 text-violet-700 border-violet-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  qualified: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  proposal: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
  upcoming: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
  sold_out: 'bg-rose-50 text-rose-700 border-rose-200',
};

const labels = {
  active: 'Aktif', published: 'Yayında', draft: 'Taslak',
  sold: 'Satıldı', pending: 'Beklemede', archived: 'Arşiv',
  new: 'Yeni', contacted: 'İletişimde', qualified: 'Nitelikli',
  proposal: 'Teklif', closed: 'Kapandı', lost: 'Kayıp',
  upcoming: 'Yakında', completed: 'Tamamlandı', sold_out: 'Tükendi',
};

export default function StatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      statusConfig[status] || 'bg-slate-100 text-slate-600 border-slate-200'
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {labels[status] || status}
    </span>
  );
}