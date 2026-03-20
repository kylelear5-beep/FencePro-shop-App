import React, { useState, useEffect } from 'react';
import BlindCountBoard from './BlindCountBoard';
import WeightCalculator from './WeightCalculator';
import SimpleCalculator from './SimpleCalculator';
import { PlusCircle, Package, AlertTriangle, ClipboardCheck, LayoutGrid, Calculator } from 'lucide-react';

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState('count'); // 'count', 'add', 'skipped'
  
  // States for 'add'
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [addStatus, setAddStatus] = useState(null);

  // States for 'skipped'
  const [skippedItems, setSkippedItems] = useState([]);
  const [skippedLoading, setSkippedLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'skipped') {
      const loadSkipped = async () => {
        setSkippedLoading(true);
        try {
          const res = await fetch('/api/inventory/not-counted');
          if (res.ok) {
            const data = await res.json();
            setSkippedItems(data.items || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setSkippedLoading(false);
        }
      };
      loadSkipped();
    }
  }, [activeTab]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddStatus({ status: 'loading' });

    try {
      const response = await fetch('/api/inventory/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, category, quantity: quantity || 0 })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to add item');
      
      setAddStatus({ status: 'success', message: `Added ${name} to ${category}!` });
      setSku('');
      setName('');
      // Leave category same to make bulk adding easy
      setQuantity('');
      
      setTimeout(() => setAddStatus(null), 3000);
    } catch (err) {
      setAddStatus({ status: 'error', message: err.message });
    }
  };

  return (
    <div className="module-content">
      <div className="module-header flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <h1 className="oswald-title text-3xl font-black text-gray-900">INVENTORY MANAGEMENT</h1>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('count')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase rounded-md transition-all ${
              activeTab === 'count' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ClipboardCheck size={16} /> Count
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase rounded-md transition-all ${
              activeTab === 'add' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <PlusCircle size={16} /> Add SKU
          </button>
          <button 
            onClick={() => setActiveTab('skipped')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase rounded-md transition-all ${
              activeTab === 'skipped' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <AlertTriangle size={16} /> Skipped
          </button>
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase rounded-md transition-all ${
              activeTab === 'calculator' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calculator size={16} /> Calculator
          </button>
        </div>
      </div>

      {activeTab === 'count' && (
        <BlindCountBoard counterName="Big Bob" />
      )}

      {activeTab === 'calculator' && (
        <div className="pt-4 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-3">
            <WeightCalculator />
          </div>
          <div className="lg:col-span-1">
            <SimpleCalculator />
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="max-w-2xl mx-auto bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-900 px-6 py-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Package className="text-amber-500" />
              Add New Material
            </h2>
          </div>
          <form className="p-6 space-y-5" onSubmit={handleAddItem}>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">SKU Number</label>
                <input 
                  type="text" 
                  required
                  value={sku}
                  onChange={e => setSku(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 font-bold focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. POST-VINYL-5X5"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-1">Section / Category</label>
                <input 
                  type="text" 
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 font-bold focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Vinyl Hardware"
                  list="recent-cats"
                />
                <datalist id="recent-cats">
                  <option value="Aluminum Hardware" />
                  <option value="Chain Link - Black" />
                  <option value="Chain Link - Galvanized" />
                  <option value="Chain Link - Misc/Tools" />
                  <option value="Shop Consumables" />
                  <option value="Vinyl Caps" />
                  <option value="Vinyl Hardware" />
                  <option value="Vinyl Linears" />
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase mb-1">Item Description / Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 font-bold focus:border-amber-500 focus:outline-none"
                placeholder="e.g. 5x5x108 .150W POST White"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 uppercase mb-1">Current On-Hand Qty (Optional)</label>
              <input 
                type="number" 
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2 font-bold focus:border-amber-500 focus:outline-none w-1/3"
                placeholder="0"
                min="0"
              />
            </div>

            {addStatus && (
              <div className={`p-4 rounded-lg text-sm font-bold border-2 ${
                addStatus.status === 'error' ? 'bg-red-50 text-red-700 border-red-300' :
                addStatus.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                'bg-blue-50 text-blue-700 border-blue-300'
              }`}>
                {addStatus.message || 'Processing...'}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={addStatus?.status === 'loading'}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-wide py-3 rounded-lg transition-colors"
              >
                Save New Item
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'skipped' && (
        <div className="max-w-4xl mx-auto bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-amber-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <AlertTriangle />
              Items Not Counted
            </h2>
            <span className="bg-white text-amber-700 text-xs font-black px-3 py-1 rounded-full">
              {skippedItems.length} Total
            </span>
          </div>
          
          {skippedLoading ? (
            <div className="p-8 text-center text-gray-500 font-bold uppercase">Loading...</div>
          ) : skippedItems.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-4xl">🎉</span>
              <p className="mt-2 text-lg font-black text-gray-400 uppercase tracking-widest">Nothing skipped!</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {skippedItems.map((item, id) => (
                <div key={id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 rounded uppercase">{item.sku}</span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 rounded uppercase">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">Skipped By: {item.skippedBy}</p>
                    <p className="text-xs font-bold text-gray-400">{new Date(item.skippedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
