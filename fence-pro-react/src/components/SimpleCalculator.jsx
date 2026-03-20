import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function SimpleCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousVal, setPreviousVal] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNewVal, setWaitingForNewVal] = useState(false);

  const handleNum = (num) => {
    if (waitingForNewVal) {
      setDisplay(String(num));
      setWaitingForNewVal(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForNewVal) {
      setDisplay('0.');
      setWaitingForNewVal(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const calculate = (a, b, op) => {
    a = parseFloat(a);
    b = parseFloat(b);
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '×') return a * b;
    if (op === '÷') return a / b;
    return b;
  };

  const handleOp = (nextOp) => {
    const inputValue = parseFloat(display);

    if (previousVal == null) {
      setPreviousVal(inputValue);
    } else if (operator) {
      const result = calculate(previousVal, inputValue, operator);
      setDisplay(String(result));
      setPreviousVal(result);
    }

    setWaitingForNewVal(true);
    setOperator(nextOp);
  };

  const handleEqual = () => {
    if (!operator || previousVal == null) return;
    
    const result = calculate(previousVal, parseFloat(display), operator);
    setDisplay(String(result));
    setPreviousVal(null);
    setOperator(null);
    setWaitingForNewVal(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousVal(null);
    setOperator(null);
    setWaitingForNewVal(false);
  };

  const handleDel = () => {
    if (waitingForNewVal) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Calculator size={16} className="text-blue-400" /> Standard
        </h2>
      </div>
      <div className="p-5 flex-grow flex flex-col">
        {/* Display */}
        <div className="bg-gray-800 rounded-lg p-5 mb-4 text-right overflow-hidden shadow-inner border border-gray-700">
          <div className="h-6 text-gray-400 text-sm font-bold font-mono tracking-wider mb-1">
            {previousVal != null ? `${previousVal} ${operator}` : ''}
          </div>
          <div className="text-5xl font-black text-white truncate font-mono tracking-tighter">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 flex-grow select-none touch-manipulation">
          <button onClick={handleClear} className="col-span-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-black text-xl transition-all duration-75 active:scale-95 py-3 md:py-4">AC</button>
          <button onClick={handleDel} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl font-black text-xl transition-all duration-75 active:scale-95 py-3 md:py-4">DEL</button>
          <button onClick={() => handleOp('÷')} className={`bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-2xl transition-all duration-75 active:scale-95 py-3 md:py-4 ${operator === '÷' ? 'ring-2 ring-white z-10' : ''}`}>÷</button>
          
          <button onClick={() => handleNum(7)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">7</button>
          <button onClick={() => handleNum(8)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">8</button>
          <button onClick={() => handleNum(9)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">9</button>
          <button onClick={() => handleOp('×')} className={`bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5 ${operator === '×' ? 'ring-2 ring-white z-10' : ''}`}>×</button>
          
          <button onClick={() => handleNum(4)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">4</button>
          <button onClick={() => handleNum(5)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">5</button>
          <button onClick={() => handleNum(6)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">6</button>
          <button onClick={() => handleOp('-')} className={`bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5 ${operator === '-' ? 'ring-2 ring-white z-10' : ''}`}>-</button>
          
          <button onClick={() => handleNum(1)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">1</button>
          <button onClick={() => handleNum(2)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">2</button>
          <button onClick={() => handleNum(3)} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">3</button>
          <button onClick={() => handleOp('+')} className={`bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5 ${operator === '+' ? 'ring-2 ring-white z-10' : ''}`}>+</button>
          
          <button onClick={() => handleNum(0)} className="col-span-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">0</button>
          <button onClick={handleDecimal} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl font-bold text-2xl transition-all duration-75 active:scale-95 py-4 md:py-5">.</button>
          <button onClick={handleEqual} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-2xl shadow-lg transition-all duration-75 active:scale-95 py-4 md:py-5">=</button>
        </div>
      </div>
    </div>
  );
}
