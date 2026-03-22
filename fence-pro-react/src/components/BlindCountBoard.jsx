import React, { useState, useEffect } from 'react';

// ── Variance badge helper ─────────────────────────────────────────────────────
// COLOUR RULES (applied by absolute % of previous system count):
//
//   🟢 GREEN  — Zero variance or within tight tolerance
//               Regular: ±5%  |  Bulk categories: ±2%
//
//   🟠 ORANGE — Minor variance, worth a look
//               Regular: ±6–10%  |  Bulk: ±3–5%
//
//   🔴 RED    — Significant variance, investigate
//               Regular: >10%  |  Bulk: >5%
//
// Both positive (counted MORE) and negative (counted LESS) use the same
// absolute-value thresholds so the colour is never misleading.
function VarianceBadge({ variance, actualCount, category }) {
  // Reconstruct what the system previously held
  const previousCount = Math.max(0, actualCount - variance);

  const BULK_CATS = ['Shop Consumables', 'Chain Link', 'Vinyl Caps', 'Vinyl Hardware', 'Aluminum Hardware'];
  const isBulk    = BULK_CATS.some(c => (category || '').toLowerCase().includes(c.toLowerCase())) || previousCount > 100;

  const greenPct  = isBulk ? 0.02 : 0.05;  // within this %  → GREEN
  const orangePct = isBulk ? 0.05 : 0.10;  // within this %  → ORANGE  (beyond → RED)

  const greenThreshold  = Math.ceil(previousCount * greenPct);
  const orangeThreshold = Math.ceil(previousCount * orangePct);
  const absVar          = Math.abs(variance);

  let cls   = 'text-emerald-700 bg-emerald-100 border-emerald-300'; // 🟢 default GOOD
  let label = 'GOOD';

  if (variance !== 0) {
    const sign = variance > 0 ? '+' : '';
    label = `${sign}${variance}`;

    if (absVar <= greenThreshold) {
      cls = 'text-emerald-700 bg-emerald-100 border-emerald-300'; // 🟢 within tolerance
    } else if (absVar <= orangeThreshold) {
      cls = 'text-orange-700 bg-orange-100 border-orange-300';   // 🟠 minor variance
    } else {
      cls = 'text-red-700 bg-red-100 border-red-300';            // 🔴 significant variance
    }
  }

  return (
    <span className={`text-xs font-black px-3 py-1.5 rounded-md border-2 ${cls}`}>
      {label}
    </span>
  );
}

/**
 * BlindCountBoard — Rugged digital clipboard for physical inventory counts.
 *
 *  FLOW:
 *   1. Fetch count sheet + Big Bob's daily assignment.
 *   2. Crew picks a category and counts items one by one.
 *   3. After each "Submit", the system-stored count is compared and a
 *      GREEN / ORANGE / RED variance badge appears immediately.
 *      The old system count stays HIDDEN — true blind count.
 *   5. Quick-add panel lets shop crew add missing items on the fly.
 *   6. "Finish Section" logs skipped items + emails variance report.
 */
export default function BlindCountBoard({ counterName = 'Unknown' }) {
  const [categories, setCategories]             = useState([]);
  const [items, setItems]                       = useState([]);
  const [assignment, setAssignment]             = useState(null);
  const [activeCategory, setActiveCategory]     = useState(null);
  const [counts, setCounts]                     = useState({});
  const [status, setStatus]                     = useState({});
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [dayFinished, setDayFinished]           = useState(null);
  const [showWeekSchedule, setShowWeekSchedule] = useState(false);
  
  // Track start times per category
  const [startTimes, setStartTimes] = useState({});

  // Quick-add (shop side)
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addForm, setAddForm]           = useState({ sku: '', name: '', category: '', quantity: '0' });
  const [addStatus, setAddStatus]       = useState(null);


  // ── Data load ────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Bypass-Tunnel-Reminder': 'true' };
      const [sheetRes, assignRes] = await Promise.all([
        fetch('/api/inventory/count-sheet', { headers }),
        fetch('/api/inventory/daily-assignment', { headers }),
      ]);
      if (!sheetRes.ok) throw new Error('Failed to load count sheet');
      const sheetData = await sheetRes.json();
      setItems(sheetData.items || []);
      setCategories(sheetData.categories || []);
      if (assignRes.ok) setAssignment(await assignRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleCountChange = (sku, value) =>
    setCounts(prev => ({ ...prev, [sku]: value }));

  const handleSubmit = async (sku) => {
    const actualCount = parseInt(counts[sku], 10);
    if (isNaN(actualCount)) return;
    setStatus(prev => ({ ...prev, [sku]: 'submitting' }));
    try {
      const res = await fetch('/api/inventory/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ sku, actualCount, counterName }),
      });
      if (!res.ok) throw new Error('Reconciliation failed');
      const result = await res.json();
      
      const newStatus = { ...status, [sku]: { done: true, variance: result.variance, actualCount } };
      setStatus(newStatus);

      // ── AUTO-FINISH LOGIC ──
      // If this was the last item in the active category, trigger the report automatically
      const currentCatItems = categories.find(c => c.name === activeCategory)?.items || [];
      const doneCount = currentCatItems.filter(i => (i.sku === sku) || (newStatus[i.sku] && newStatus[i.sku].done)).length;
      
      if (doneCount === currentCatItems.length && currentCatItems.length > 0) {
        handleFinishDay(activeCategory, newStatus);
      }
    } catch {
      setStatus(prev => ({ ...prev, [sku]: 'error' }));
    }
  };

  const handleFinishDay = async (categoryName, currentStatus = status) => {
    const catItems   = categories.find(c => c.name === categoryName)?.items || [];
    const countedSkus = catItems.filter(i => currentStatus[i.sku] && currentStatus[i.sku].done).map(i => i.sku);
    const startTime = startTimes[categoryName] || new Date().toISOString();
    const finishTime = new Date().toISOString();
    try {
      const res = await fetch('/api/inventory/finish-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ category: categoryName, countedSkus, counterName, sendReport: true, startTime, finishTime }),
      });
      if (!res.ok) throw new Error('Failed to finish');
      const summary = await res.json();
      setDayFinished(summary);
    } catch { /* silently ignore */ }
  };


  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!addForm.sku.trim() || !addForm.name.trim() || !addForm.category.trim()) return;
    setAddStatus({ type: 'loading' });
    try {
      const res = await fetch('/api/inventory/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({ ...addForm, quantity: parseInt(addForm.quantity, 10) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAddStatus({ type: 'success', message: `Added ${addForm.name}!` });
      setAddForm({ sku: '', name: '', category: activeCategory || '', quantity: '0' });
      await load();
      setTimeout(() => { setAddStatus(null); setShowAddPanel(false); }, 2000);
    } catch (err) {
      setAddStatus({ type: 'error', message: err.message });
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isDone            = (sku) => { const s = status[sku]; return s && typeof s === 'object' && s.done; };
  const categoryDoneCount = (ci)  => ci.filter(i => isDone(i.sku)).length;
  const totalItems        = items.length;
  const totalDone         = Object.values(status).filter(s => typeof s === 'object' && s.done).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold text-gray-600 uppercase tracking-wide">Loading count sheet...</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 text-center max-w-md">
        <p className="text-xl font-black text-red-700 uppercase mb-2">⚠ Error</p>
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={load} className="mt-4 px-4 py-2 bg-red-600 text-white font-black uppercase rounded-lg">Retry</button>
      </div>
    </div>
  );

  // ── Day Finished Summary ───────────────────────────────────────────────────
  if (dayFinished) return (
    <div className="max-w-4xl mx-auto">
      <header className="bg-emerald-800 text-white rounded-t-xl px-6 py-6 text-center">
        <p className="text-4xl mb-2">✅</p>
        <h2 className="text-2xl font-black tracking-tight uppercase">Section Complete</h2>
        <p className="text-emerald-200 text-sm font-semibold mt-1">{dayFinished.message}</p>
        {dayFinished.emailReport?.sent && (
          <p className="text-emerald-300 text-xs mt-1 font-bold">📧 Variance report emailed to management</p>
        )}
        {dayFinished.emailReport?.betaMock && (
          <p className="text-amber-300 text-xs mt-1">(Email configured but in BETA mock mode — set SMTP_* in .env to go live)</p>
        )}
      </header>

      {/* Counted */}
      <div className="bg-white border-2 border-gray-200">
        <div className="bg-gray-900 text-white px-6 py-3">
          <h3 className="text-sm font-black uppercase tracking-wide">✓ Counted — {dayFinished.counted} items</h3>
        </div>
        {activeCategory && categories.find(c => c.name === activeCategory)?.items
          .filter(i => isDone(i.sku))
          .map(item => {
            const s        = status[item.sku];
            const variance = s?.variance ?? 0;
            const actual   = Number(counts[item.sku] || 0);
            return (
              <div key={item.sku} className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">{item.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600">Counted: {actual}</span>
                  <VarianceBadge variance={variance} actualCount={actual} category={activeCategory} />
                </div>
              </div>
            );
          })}
      </div>

      {/* Skipped */}
      {dayFinished.skipped > 0 && (
        <div className="bg-white border-2 border-gray-200 border-t-0">
          <div className="bg-amber-600 text-white px-6 py-3">
            <h3 className="text-sm font-black uppercase tracking-wide">⊘ Not Counted — {dayFinished.skipped} items</h3>
          </div>
          {dayFinished.skippedItems.map(item => (
            <div key={item.sku} className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">{item.sku}</p>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-100 border-2 border-amber-300 px-3 py-1.5 rounded-md">SKIPPED</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 bg-gray-100 border-2 border-gray-300 rounded-b-xl px-5 py-3 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-600">📋 Variance report generated. Review flagged items with management.</p>
        <button
          onClick={() => { setDayFinished(null); setActiveCategory(null); load(); }}
          className="px-4 py-2 bg-gray-800 text-white text-xs font-black uppercase rounded-lg hover:bg-gray-700 transition-colors"
        >
          New Count
        </button>
      </div>
    </div>
  );

  // ── Category Selector ──────────────────────────────────────────────────────
  if (!activeCategory) {
    const todaysCategories = assignment?.categories || [];
    const isAssigned = (n) => todaysCategories.includes(n);

    return (
      <div className="max-w-4xl mx-auto">
        {assignment && (
          <div className={`rounded-t-xl px-6 py-5 ${assignment.assigned ? 'bg-gray-900 text-white' : 'bg-gray-700 text-gray-300'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🦺</span>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase">
                  {assignment.assigned ? `${assignment.dayName} Count` : 'No Count Today'}
                </h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                  Big Bob's Orders • Week {assignment.weekNumber || ''}
                </p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-3 border border-gray-700">
              <p className="text-sm font-semibold text-amber-400 leading-relaxed">"{assignment.message}"</p>
            </div>

            {assignment.weekSchedule && (
              <div className="mt-3">
                <button
                  onClick={() => setShowWeekSchedule(!showWeekSchedule)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-300 uppercase cursor-pointer transition-colors"
                >
                  {showWeekSchedule ? '▾ Hide Week Schedule' : '▸ Show Full Week'}
                </button>
                {showWeekSchedule && (
                  <div className="mt-2 grid grid-cols-5 gap-1">
                    {assignment.weekSchedule.map((day, idx) => (
                      <div key={day.day} className={`text-center p-2 rounded text-xs ${
                        idx === (new Date().getDay() - 1) ? 'bg-amber-500 text-black font-black' : 'bg-gray-800 text-gray-400'
                      }`}>
                        <p className="font-bold">{day.day.slice(0, 3)}</p>
                        {day.categories.map(c => <p key={c} className="mt-1 text-[10px] leading-tight">{c}</p>)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <span className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md">Counter: {counterName}</span>
              <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-md border border-gray-700">{totalDone}/{totalItems} Total</span>
            </div>
          </div>
        )}

        <div className="bg-gray-800 h-2">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${totalItems > 0 ? (totalDone / totalItems) * 100 : 0}%` }} />
        </div>

        <div className={`bg-white border-2 border-gray-200 ${assignment ? '' : 'rounded-t-xl'} rounded-b-xl divide-y-2 divide-gray-100`}>
          {/* Assigned today */}
          {categories.filter(cat => isAssigned(cat.name)).map((cat) => {
            const done = categoryDoneCount(cat.items);
            const total = cat.items.length;
            const complete = done === total;
            return (
              <button key={cat.name}
                onClick={() => { 
                  setActiveCategory(cat.name); 
                  setAddForm(f => ({ ...f, category: cat.name }));
                  if (!startTimes[cat.name]) {
                    setStartTimes(prev => ({ ...prev, [cat.name]: new Date().toISOString() }));
                  }
                }}
                className={`w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-amber-50 ${complete ? 'bg-emerald-50' : 'bg-amber-50/30'}`}
              >
                <div className="flex items-center gap-4">
                  {complete
                    ? <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-black">✓</span>
                    : <span className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center text-sm font-black">{done > 0 ? done : '!'}</span>}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{cat.name}</p>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded uppercase">Today</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500">{total} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-md ${complete ? 'bg-emerald-600 text-white' : done > 0 ? 'bg-amber-100 text-amber-800' : 'bg-amber-500 text-black'}`}>
                    {complete ? 'DONE' : done > 0 ? `${done}/${total}` : 'START'}
                  </span>
                  <span className="text-gray-400 text-xl">→</span>
                </div>
              </button>
            );
          })}
          {/* Other categories */}
          {categories.filter(cat => !isAssigned(cat.name)).map((cat) => {
            const done = categoryDoneCount(cat.items);
            const total = cat.items.length;
            const complete = done === total;
            return (
              <button key={cat.name}
                onClick={() => { 
                  setActiveCategory(cat.name); 
                  setAddForm(f => ({ ...f, category: cat.name }));
                  if (!startTimes[cat.name]) {
                    setStartTimes(prev => ({ ...prev, [cat.name]: new Date().toISOString() }));
                  }
                }}
                className={`w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-gray-50 ${complete ? 'bg-emerald-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {complete
                    ? <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                    : <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">{done > 0 ? done : ''}</span>}
                  <div>
                    <p className="text-base font-bold text-gray-600 uppercase tracking-tight">{cat.name}</p>
                    <p className="text-xs text-gray-400">{total} items</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${complete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                  {complete ? 'DONE' : done > 0 ? `${done}/${total}` : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Active Category Counting ───────────────────────────────────────────────
  const activeCat = categories.find(c => c.name === activeCategory);
  const catItems  = activeCat ? activeCat.items : [];
  const catDone   = categoryDoneCount(catItems);

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <header className="bg-gray-900 text-white rounded-t-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveCategory(null)}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors">
            ←
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase">{activeCategory}</h2>
            <p className="text-gray-400 text-sm font-semibold mt-0.5">{catDone}/{catItems.length} items counted</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md">Counter: {counterName}</span>
          <button onClick={() => setShowAddPanel(!showAddPanel)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase px-3 py-2 rounded-md transition-colors">
            + ADD ITEM
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-gray-800 h-2">
        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${catItems.length > 0 ? (catDone / catItems.length) * 100 : 0}%` }} />
      </div>

      {/* Quick-Add Panel */}
      {showAddPanel && (
        <div className="bg-amber-50 border-2 border-amber-400 px-6 py-4">
          <p className="text-xs font-black text-amber-800 uppercase mb-3">📦 Add Item to "{activeCategory}" — syncs to management</p>
          <form onSubmit={handleAddItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input type="text" required placeholder="SKU *"
              value={addForm.sku} onChange={e => setAddForm(f => ({ ...f, sku: e.target.value }))}
              className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" />
            <input type="text" required placeholder="Description *"
              value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500 col-span-2" />
            <input type="number" min="0" placeholder="Qty on hand"
              value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))}
              className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" />
            <div className="col-span-2 sm:col-span-4 flex gap-3 items-center">
              <button type="submit" disabled={addStatus?.type === 'loading'}
                className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase px-4 py-2 rounded-lg transition-colors">
                {addStatus?.type === 'loading' ? 'Saving...' : 'Save Item'}
              </button>
              <button type="button" onClick={() => setShowAddPanel(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              {addStatus && (
                <span className={`text-xs font-black ${addStatus.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {addStatus.message}
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Variance Legend */}
      <div className="bg-gray-50 border-x-2 border-gray-200 px-6 py-2 flex items-center gap-3 flex-wrap text-xs font-bold">
        <span className="text-gray-500 uppercase">Variance:</span>
        <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">🟢 GREEN = Good</span>
        <span className="text-orange-700 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded">🟠 ORANGE = Minor — review</span>
        <span className="text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded">🔴 RED = Investigate</span>
      </div>

      {/* Item Rows */}
      <div className="bg-white border-2 border-gray-200 rounded-b-xl divide-y-2 divide-gray-100">
        {catItems.length === 0 && (
          <div className="p-10 text-center text-gray-400 font-bold uppercase">No items in this category</div>
        )}

        {catItems.map((item, idx) => {
          const itemDone    = isDone(item.sku);
          const isSubmitting = status[item.sku] === 'submitting';
          const isError     = status[item.sku] === 'error';
          const itemStatus  = status[item.sku];
          const isRemoving  = removing[item.sku];

          return (
            <div key={item.sku}
              className={`px-6 py-5 transition-colors duration-300 ${
                itemDone ? 'bg-emerald-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-gray-900 uppercase tracking-tight leading-tight">{item.name}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mt-1">{item.sku}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {itemDone ? (
                    <>
                      {/* Checkmark */}
                      <span className="bg-emerald-600 text-white text-xs font-black uppercase px-2 py-1.5 rounded-md">✓</span>

                      {/* ── LIVE VARIANCE BADGE ── */}
                      <VarianceBadge
                        variance={itemStatus?.variance ?? 0}
                        actualCount={Number(counts[item.sku] || 0)}
                        category={activeCategory}
                      />

                      {/* Allow correction */}
                      <input type="number" min="0"
                        value={counts[item.sku] ?? ''}
                        onChange={e => handleCountChange(item.sku, e.target.value)}
                        className="w-24 h-10 px-3 text-base font-bold text-gray-900 bg-emerald-50 border-2 border-emerald-400 rounded-lg focus:border-amber-500 focus:outline-none"
                      />
                      <button onClick={() => handleSubmit(item.sku)}
                        className="h-10 px-3 text-xs font-black uppercase rounded-lg bg-gray-700 hover:bg-gray-800 text-white cursor-pointer transition-all">
                        Update
                      </button>
                    </>
                  ) : (
                    <>
                      <input type="number" placeholder="Count"
                        value={counts[item.sku] || ''}
                        onChange={e => handleCountChange(item.sku, e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubmit(item.sku)}
                        min="0"
                        className="w-28 h-11 px-3 text-base font-bold text-gray-900 bg-gray-100 border-2 border-gray-300 rounded-lg placeholder:text-gray-400 placeholder:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                      />
                      <button onClick={() => handleSubmit(item.sku)}
                        disabled={isSubmitting}
                        className={`h-11 px-4 text-xs font-black uppercase tracking-wide rounded-lg cursor-pointer transition-all ${
                          isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-black shadow-md'
                        }`}>
                        {isSubmitting ? '...' : 'Submit'}
                      </button>
                    </>
                  )}

                  {isError && (
                    <span className="text-xs font-black text-red-600 uppercase bg-red-100 px-2 py-1 rounded-md">⚠ Failed</span>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button onClick={() => setActiveCategory(null)}
          className="text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
          ← Back to all sections
        </button>
        <button onClick={() => handleFinishDay(activeCategory)}
          className={`h-11 px-6 text-sm font-black uppercase tracking-wide rounded-lg cursor-pointer transition-all shadow-md ${
            catDone === catItems.length
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
          }`}>
          {catDone === catItems.length
            ? '✓ Finish Section + Email Report'
            : `Finish Section (${catItems.length - catDone} uncounted)`}
        </button>
      </div>

      {catDone < catItems.length && (
        <div className="mt-3 bg-amber-100 border-2 border-amber-400 rounded-lg px-5 py-3 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-amber-800 font-medium">
            <strong>Blank items won't be counted.</strong> {catItems.length - catDone} items will be logged as "Not Counted" if you finish now. You can come back to them.
          </p>
        </div>
      )}
    </div>
  );
}
