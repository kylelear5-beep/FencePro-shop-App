import React, { useState } from 'react';
import { Calculator, Scale, Hash } from 'lucide-react';

export default function WeightCalculator() {
  const [knownQty, setKnownQty] = useState('');
  const [knownWeight, setKnownWeight] = useState('');
  
  const [targetQty, setTargetQty] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Calculations
  const unitWeight = (knownQty && knownWeight && Number(knownQty) > 0) 
    ? Number(knownWeight) / Number(knownQty) 
    : 0;

  const calculatedWeight = (unitWeight && targetQty) 
    ? (unitWeight * Number(targetQty)).toFixed(2) 
    : '0.00';

  const calculatedQty = (unitWeight && targetWeight && unitWeight > 0)
    ? Math.round(Number(targetWeight) / unitWeight)
    : 0;

  return (
    <div className="w-full bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
        <Calculator className="text-white" />
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Weight & Piece Convertor
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Step 1: Establish Baseline */}
        <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-xl">
          <h3 className="text-base font-black text-blue-800 uppercase mb-4 flex items-center gap-2">
            <span className="bg-blue-200 text-blue-800 w-7 h-7 flex items-center justify-center rounded-full text-sm">1</span>
            Establish Baseline Weight
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase mb-2">Known Quantity (Pieces)</label>
              <div className="relative">
                <Hash className="absolute left-4 top-3.5 text-blue-500" size={20} />
                <input 
                  type="number" 
                  value={knownQty}
                  onChange={e => setKnownQty(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg pl-12 pr-4 py-3 text-lg font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  placeholder="e.g. 10"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase mb-2">Known Weight (lbs)</label>
              <div className="relative">
                <Scale className="absolute left-4 top-3.5 text-blue-500" size={20} />
                <input 
                  type="number" 
                  value={knownWeight}
                  onChange={e => setKnownWeight(e.target.value)}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg pl-12 pr-4 py-3 text-lg font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  placeholder="e.g. 25"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          {unitWeight > 0 && (
            <div className="mt-6 text-sm font-bold text-gray-700 bg-white border border-blue-100 py-3 px-4 rounded-lg text-center shadow-sm flex items-center justify-center gap-2">
              Estimated Unit Weight: <span className="text-blue-600 text-lg">{unitWeight.toFixed(4)} <span className="text-sm">lbs / piece</span></span>
            </div>
          )}
        </div>

        {/* Step 2: Calculate */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-300 ${unitWeight > 0 ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          
          {/* Pieces to Weight */}
          <div className="bg-white border-2 border-amber-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-black text-amber-800 uppercase mb-4 flex items-center gap-2">
              <span className="bg-amber-200 text-amber-800 w-7 h-7 flex items-center justify-center rounded-full">2A</span>
              Find Total Weight
            </h3>
            <label className="block text-sm font-black text-gray-700 uppercase mb-2">Target Quantity</label>
            <input 
              type="number" 
              value={targetQty}
              onChange={e => setTargetQty(e.target.value)}
              disabled={!unitWeight}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 text-lg mb-4 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all"
              placeholder="e.g. 50"
            />
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 text-center border border-amber-100 shadow-inner">
              <span className="block text-sm font-black text-amber-600/80 uppercase mb-2">Estimated Weight</span>
              <span className="text-5xl font-black text-amber-700 tracking-tight">{calculatedWeight} <span className="text-xl font-bold opacity-60">lbs</span></span>
            </div>
          </div>

          {/* Weight to Pieces */}
          <div className="bg-white border-2 border-emerald-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-black text-emerald-800 uppercase mb-4 flex items-center gap-2">
              <span className="bg-emerald-200 text-emerald-800 w-7 h-7 flex items-center justify-center rounded-full">2B</span>
              Find Total Pieces
            </h3>
            <label className="block text-sm font-black text-gray-700 uppercase mb-2">Target Weight (lbs)</label>
            <input 
              type="number" 
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              disabled={!unitWeight}
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-3 text-lg mb-4 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all"
              placeholder="e.g. 125"
            />
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 text-center border border-emerald-100 shadow-inner">
              <span className="block text-sm font-black text-emerald-600/80 uppercase mb-2">Estimated Pieces</span>
              <span className="text-5xl font-black text-emerald-700 tracking-tight">{calculatedQty} <span className="text-xl font-bold opacity-60">pcs</span></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
