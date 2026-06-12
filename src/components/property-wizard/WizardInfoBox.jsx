import { Info } from 'lucide-react';

export default function WizardInfoBox({ children }) {
  return (
    <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-4 flex gap-3 items-start mb-6">
      <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs md:text-sm text-indigo-950 leading-relaxed">{children}</p>
    </div>
  );
}