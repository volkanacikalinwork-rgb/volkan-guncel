import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export default function WizardFooter({
  step, totalSteps = 8, onBack, onNext,
  nextLabel, backLabel, nextDisabled = false, loading = false
}) {
  return (
    <div className="flex justify-between items-center border-t border-gray-100 pt-5 mt-6">
      <button
        type="button"
        onClick={onBack}
        disabled={step === 1}
        className="text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-3 h-3" />
        {backLabel || (step > 1 ? `Adım ${step - 1}'e Dön` : 'Geri')}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {nextLabel || 'Devam Et'}
        {!loading && <ArrowRight className="w-3 h-3" />}
      </button>
    </div>
  );
}