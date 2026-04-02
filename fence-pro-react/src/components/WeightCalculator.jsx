import React, { useState } from 'react';
import { Scale, Hash, RefreshCcw, Zap } from 'lucide-react';
import { useI18n } from '../i18n';

export default function WeightCalculator() {
  const { t } = useI18n();
  const [sampleQty, setSampleQty] = useState('50');
  const [sampleWeight, setSampleWeight] = useState('');
  const [totalWeight, setTotalWeight] = useState('');

  const reset = () => {
    setSampleWeight('');
    setTotalWeight('');
    setSampleQty('50');
  };

  const unitWeight = (sampleWeight && sampleQty && Number(sampleQty) > 0)
    ? Number(sampleWeight) / Number(sampleQty)
    : 0;

  const totalPieces = (unitWeight && totalWeight)
    ? Math.round(Number(totalWeight) / unitWeight)
    : 0;

  return (
    <div className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full font-sans text-white">
      {/* Mini Header */}
      <div className="bg-slate-800 px-5 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Scale className="text-amber-500" size={18} />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-200">
            {t('wc_title')}
          </h2>
        </div>
        <button onClick={reset} className="text-slate-500 hover:text-white transition-colors">
          <RefreshCcw size={14} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Step 1: Small Sample */}
        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-700/50">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('wc_sample_size')}</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="number"
                value={sampleQty}
                onChange={e => setSampleQty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm font-bold focus:border-amber-500 focus:outline-none transition-all"
                placeholder="50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">{t('wc_sample_weight')}</label>
            <input
              type="number"
              value={sampleWeight}
              onChange={e => setSampleWeight(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm font-bold focus:border-amber-500 focus:outline-none transition-all text-amber-500"
              placeholder="0.00"
              step="0.001"
            />
          </div>
        </div>

        {/* Step 2: Total Weight */}
        <div className={`space-y-4 transition-all duration-300 ${unitWeight > 0 ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-amber-500 uppercase tracking-widest">{t('wc_total_weight')}</label>
            <input
              type="number"
              value={totalWeight}
              onChange={e => setTotalWeight(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-4 py-4 text-3xl font-black text-white focus:border-amber-500 focus:outline-none transition-all shadow-inner"
              placeholder="0.00"
            />
          </div>

          <div className="bg-amber-500 rounded-xl p-5 text-center shadow-lg transform active:scale-95 transition-transform cursor-default">
            <span className="block text-[10px] font-black text-amber-900 uppercase mb-1 tracking-widest">{t('wc_total_pieces')}</span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black text-slate-900 leading-none">{totalPieces.toLocaleString()}</span>
              <span className="text-xs font-black text-amber-900 border-2 border-amber-900/20 px-2 py-0.5 rounded-md uppercase">{t('wc_pieces')}</span>
            </div>
          </div>
        </div>

        {unitWeight === 0 && (
          <div className="py-8 text-center bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
             <p className="text-xs font-bold text-slate-500 italic">{t('wc_hint')}</p>
          </div>
        )}

        <div className="flex items-start gap-2 pt-2">
           <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
           <p className="text-[10px] text-slate-400 leading-tight">
             {t('wc_tip')}
           </p>
        </div>
      </div>
    </div>
  );
}
