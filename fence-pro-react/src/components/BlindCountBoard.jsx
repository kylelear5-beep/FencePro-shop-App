import React, { useState, useEffect } from 'react';

/**
 * BlindCountBoard — Rugged digital clipboard for physical inventory counts.
 *
 * Flow:
 *   1. Fetches Big Bob's daily assignment (randomized category for today)
 *   2. Shows the assigned category with his message
 *   3. Crew counts items one by one — variance shows after each submit
 *   4. Blank items are NOT counted — tracked separately
 *   5. "Finish Day" sends uncounted items to the not-counted list
 *
 * Props:
 *   counterName (string) — Name of the person performing the count
 */
export default function BlindCountBoard({ counterName = 'Unknown' }) {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dayFinished, setDayFinished] = useState(null);
  const [showWeekSchedule, setShowWeekSchedule] = useState(false);

  // Fetch count sheet + daily assignment on mount
  useEffect(() => {
    const load = async () => {
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

        if (assignRes.ok) {
          const assignData = await assignRes.json();
          setAssignment(assignData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCountChange = (sku, value) => {
    setCounts(prev => ({ ...prev, [sku]: value }));
  };

  const handleSubmit = async (sku) => {
    const rawValue = counts[sku];
    const actualCount = parseInt(rawValue, 10);
    if (isNaN(actualCount)) return;

    try {
      setStatus(prev => ({ ...prev, [sku]: 'submitting' }));
      const response = await fetch('/api/inventory/reconcile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({ sku, actualCount, counterName }),
      });
      if (!response.ok) throw new Error('Reconciliation failed');
      const result = await response.json();
      setStatus(prev => ({
        ...prev,
        [sku]: { done: true, variance: result.variance, message: result.message },
      }));
    } catch {
      setStatus(prev => ({ ...prev, [sku]: 'error' }));
    }
  };

  const handleFinishDay = async (categoryName) => {
    const catItems = categories.find(c => c.name === categoryName)?.items || [];
    const countedSkus = catItems.filter(i => isDone(i.sku)).map(i => i.sku);

    try {
      const response = await fetch('/api/inventory/finish-day', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          category: categoryName,
          countedSkus,
          counterName,
          sendReport: true,  // triggers email to GM + ops
        }),
      });
      if (!response.ok) throw new Error('Failed to finish day');
      const result = await response.json();
      setDayFinished(result);
    } catch {
      // silently fail — could add error handling later
    }
  };

  const isDone = (sku) => {
    const s = status[sku];
    return s && typeof s === 'object' && s.done;
  };

  const categoryDoneCount = (catItems) => catItems.filter(i => isDone(i.sku)).length;

  const totalItems = items.length;
  const totalDone = Object.values(status).filter(s => typeof s === 'object' && s.done).length;

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-600 uppercase tracking-wide">Loading count sheet...</p>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 text-center max-w-md">
          <p className="text-xl font-black text-red-700 uppercase mb-2">⚠ Error</p>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  // ─── Day Finished Summary ───
  if (dayFinished) {
    return (
      <div className="max-w-4xl mx-auto">
        <header className="bg-emerald-800 text-white rounded-t-xl px-6 py-6 text-center">
          <p className="text-4xl mb-2">✅</p>
          <h2 className="text-2xl font-black tracking-tight uppercase">Day Complete</h2>
          <p className="text-emerald-200 text-sm font-semibold mt-1">
            {dayFinished.message}
          </p>
        </header>

        {/* Variance Report for counted items */}
        <div className="bg-white border-2 border-gray-200">
          <div className="bg-gray-900 text-white px-6 py-3">
            <h3 className="text-sm font-black uppercase tracking-wide">
              ✓ Counted — {dayFinished.counted} items
            </h3>
          </div>
          {activeCategory && categories.find(c => c.name === activeCategory)?.items
            .filter(i => isDone(i.sku))
            .map(item => {
              const itemStatus = status[item.sku];
              const variance = itemStatus?.variance ?? 0;
              return (
                <div key={item.sku} className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-600">
                      Counted: {counts[item.sku]}
                    </span>
                    <span className={`text-xs font-black px-3 py-1.5 rounded-md border-2 ${
                      variance === 0 ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
                      : variance > 0 ? 'text-blue-700 bg-blue-100 border-blue-300'
                      : 'text-red-700 bg-red-100 border-red-300'
                    }`}>
                      {variance === 0 ? 'MATCH' : `${variance > 0 ? '+' : ''}${variance}`}
                    </span>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Not Counted items */}
        {dayFinished.skipped > 0 && (
          <div className="bg-white border-2 border-gray-200 border-t-0">
            <div className="bg-amber-600 text-white px-6 py-3">
              <h3 className="text-sm font-black uppercase tracking-wide">
                ⊘ Not Counted — {dayFinished.skipped} items
              </h3>
            </div>
            {dayFinished.skippedItems.map(item => (
              <div key={item.sku} className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">{item.sku}</p>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-100 border-2 border-amber-300 px-3 py-1.5 rounded-md">
                  SKIPPED
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 bg-gray-100 border-2 border-gray-300 rounded-b-xl rounded-lg px-5 py-3 text-center">
          <p className="text-sm font-bold text-gray-600">
            📋 Report generated — forward variances to GM for review. Not-counted items are tracked in the inventory tab.
          </p>
        </div>
      </div>
    );
  }

  // ─── CATEGORY SELECTOR (no active category) ───
  if (!activeCategory) {
    // Figure out which categories are assigned today
    const todaysCategories = assignment?.categories || [];
    const isAssigned = (catName) => todaysCategories.includes(catName);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Big Bob's Daily Assignment */}
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
              <p className="text-sm font-semibold text-amber-400 leading-relaxed">
                "{assignment.message}"
              </p>
            </div>

            {/* Week schedule toggle */}
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
                        {day.categories.map(c => (
                          <p key={c} className="mt-1 text-[10px] leading-tight">{c}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <span className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md">
                Counter: {counterName}
              </span>
              <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-md border border-gray-700">
                {totalDone}/{totalItems} Total
              </span>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="bg-gray-800 h-2">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${totalItems > 0 ? (totalDone / totalItems) * 100 : 0}%` }} />
        </div>

        {/* Category Cards — assigned categories first */}
        <div className={`bg-white border-2 border-gray-200 ${assignment ? '' : 'rounded-t-xl'} rounded-b-xl divide-y-2 divide-gray-100`}>
          {/* Today's assigned categories */}
          {categories
            .filter(cat => isAssigned(cat.name))
            .map((cat) => {
              const done = categoryDoneCount(cat.items);
              const total = cat.items.length;
              const complete = done === total;

              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-amber-50 ${
                    complete ? 'bg-emerald-50' : 'bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {complete ? (
                      <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-black">✓</span>
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center text-sm font-black">
                        {done > 0 ? done : '!'}
                      </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{cat.name}</p>
                        <span className="text-[10px] font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded uppercase">Today</span>
                      </div>
                      <p className="text-xs font-bold text-gray-500">{total} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-md ${
                      complete ? 'bg-emerald-600 text-white' : done > 0 ? 'bg-amber-100 text-amber-800' : 'bg-amber-500 text-black'
                    }`}>
                      {complete ? 'DONE' : done > 0 ? `${done}/${total}` : 'START'}
                    </span>
                    <span className="text-gray-400 text-xl">→</span>
                  </div>
                </button>
              );
            })}

          {/* Other categories (not assigned today, but accessible) */}
          {categories
            .filter(cat => !isAssigned(cat.name))
            .map((cat) => {
              const done = categoryDoneCount(cat.items);
              const total = cat.items.length;
              const complete = done === total;

              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-gray-50 ${
                    complete ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {complete ? (
                      <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                        {done > 0 ? done : ''}
                      </span>
                    )}
                    <div>
                      <p className="text-base font-bold text-gray-600 uppercase tracking-tight">{cat.name}</p>
                      <p className="text-xs text-gray-400">{total} items</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${
                    complete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {complete ? 'DONE' : done > 0 ? `${done}/${total}` : ''}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    );
  }

  // ─── COUNTING WITHIN A CATEGORY ───
  const activeCat = categories.find(c => c.name === activeCategory);
  const catItems = activeCat ? activeCat.items : [];
  const catDone = categoryDoneCount(catItems);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="bg-gray-900 text-white rounded-t-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveCategory(null)}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase">{activeCategory}</h2>
            <p className="text-gray-400 text-sm font-semibold mt-0.5">
              {catDone}/{catItems.length} items counted
            </p>
          </div>
        </div>
        <span className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md">
          Counter: {counterName}
        </span>
      </header>

      {/* Progress */}
      <div className="bg-gray-800 h-2">
        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${catItems.length > 0 ? (catDone / catItems.length) * 100 : 0}%` }} />
      </div>

      {/* Items */}
      <div className="bg-white border-2 border-gray-200 rounded-b-xl divide-y-2 divide-gray-100">
        {catItems.map((item, idx) => {
          const itemDone = isDone(item.sku);
          const isSubmitting = status[item.sku] === 'submitting';
          const isError = status[item.sku] === 'error';
          const itemStatus = status[item.sku];
          const _variance = itemDone ? (itemStatus?.variance ?? 0) : null;

          return (
            <div
              key={item.sku}
              className={`px-6 py-5 transition-colors duration-300 ${
                itemDone ? 'bg-emerald-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-gray-900 uppercase tracking-tight leading-tight">{item.name}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mt-1">{item.sku}</p>
                </div>

                {/* Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {itemDone ? (
                    <>
                      <span className="bg-emerald-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-md">✓</span>
                      <input
                        type="number"
                        placeholder="Enter physical count"
                        value={counts[item.sku] ?? ''}
                        onChange={(e) => handleCountChange(item.sku, e.target.value)}
                        min="0"
                        className="w-36 h-11 px-4 text-base font-bold text-gray-900 bg-emerald-50 border-2 border-emerald-400 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => handleSubmit(item.sku)}
                        className="h-11 px-4 text-xs font-black uppercase tracking-wide rounded-lg bg-gray-700 hover:bg-gray-800 text-white cursor-pointer transition-all"
                      >
                        Update
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="Enter physical count"
                        value={counts[item.sku] || ''}
                        onChange={(e) => handleCountChange(item.sku, e.target.value)}
                        min="0"
                        className="w-36 h-11 px-4 text-base font-bold text-gray-900 bg-gray-100 border-2 border-gray-300 rounded-lg placeholder:text-gray-400 placeholder:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                      />
                      <button
                        onClick={() => handleSubmit(item.sku)}
                        disabled={isSubmitting}
                        className={`h-11 px-4 text-xs font-black uppercase tracking-wide rounded-lg cursor-pointer transition-all ${
                          isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-black shadow-md'
                        }`}
                      >
                        {isSubmitting ? 'Sending...' : 'Submit Count'}
                      </button>
                    </>
                  )}

                  {isError && (
                    <span className="text-xs font-black text-red-600 uppercase bg-red-100 px-3 py-1 rounded-md">⚠ Failed</span>
                  )}
                </div>
              </div>

              {/* Variance hidden during counting — only shown in Finish Day report */}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={() => setActiveCategory(null)}
          className="text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer transition-colors flex items-center gap-2"
        >
          ← Back to all sections
        </button>

        {/* Finish Day button — always available so you can end early */}
        <button
          onClick={() => handleFinishDay(activeCategory)}
          className={`h-11 px-6 text-sm font-black uppercase tracking-wide rounded-lg cursor-pointer transition-all shadow-md ${
            catDone === catItems.length
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-800 hover:bg-gray-900 text-white'
          }`}
        >
          {catDone === catItems.length ? '✓ Finish Section' : `Finish Day (${catItems.length - catDone} uncounted)`}
        </button>
      </div>

      {/* Count status note */}
      {catDone < catItems.length && (
        <div className="mt-3 bg-amber-100 border-2 border-amber-400 rounded-lg px-5 py-3 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-amber-800 font-medium">
            <strong>Blank items won't be counted.</strong> If you hit "Finish Day" now, {catItems.length - catDone} items will be logged
            as "Not Counted" and tracked in the inventory tab. You can always come back to them later.
          </p>
        </div>
      )}
    </div>
  );
}
