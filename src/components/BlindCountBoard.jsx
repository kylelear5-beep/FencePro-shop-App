import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';

// ── Variance badge helper ─────────────────────────────────────────────────────
function VarianceBadge({ variance, actualCount, category }) {
  const { t } = useI18n();
  const previousCount = Math.max(0, actualCount - variance);
  const BULK_CATS = ['Shop Consumables', 'Chain Link', 'Vinyl Caps', 'Vinyl Hardware', 'Aluminum Hardware'];
  const isBulk = BULK_CATS.some(c => (category || '').toLowerCase().includes(c.toLowerCase())) || previousCount > 100;
  const greenPct = isBulk ? 0.02 : 0.05;
  const orangePct = isBulk ? 0.05 : 0.10;
  const greenThreshold = Math.ceil(previousCount * greenPct);
  const orangeThreshold = Math.ceil(previousCount * orangePct);
  const absVar = Math.abs(variance);
  let cls = 'text-emerald-700 bg-emerald-100 border-emerald-300';
  let label = t('bcb_good');
  if (variance !== 0) {
    const sign = variance > 0 ? '+' : '';
    label = `${sign}${variance}`;
    if (absVar <= greenThreshold) {
      cls = 'text-emerald-700 bg-emerald-100 border-emerald-300';
    } else if (absVar <= orangeThreshold) {
      cls = 'text-orange-700 bg-orange-100 border-orange-300';
    } else {
      cls = 'text-red-700 bg-red-100 border-red-300';
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
 */
export default function BlindCountBoard({ counterName = 'Unknown' }) {
  const { t } = useI18n();
  const [categories, setCategories]             = useState([]);
  const [items, setItems]                       = useState([]);
  const [assignment, setAssignment]             = useState(null);
  const [activeCategory, setActiveCategory]     = useState(null);
  const [counts, setCounts]                     = useState({});
  const [results, setResults]                   = useState({});       // per-item results after submit
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [submitting, setSubmitting]             = useState(false);
  const [dayFinished, setDayFinished]           = useState(null);
  const [showWeekSchedule, setShowWeekSchedule] = useState(false);
  const [startTimes, setStartTimes]             = useState({});

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

  const handleSubmitAll = async () => {
    const activeCat = categories.find(c => c.name === activeCategory);
    if (!activeCat) return;

    const catItems = activeCat.items;
    const itemsToSubmit = catItems.filter(i => counts[i.sku] !== undefined && counts[i.sku] !== '');

    if (itemsToSubmit.length === 0) {
      alert(t('bcb_enter_at_least'));
      return;
    }

    setSubmitting(true);

    try {
      const newResults = {};
      const countedSkus = [];

      for (const item of itemsToSubmit) {
        const actualCount = parseInt(counts[item.sku], 10);
        if (isNaN(actualCount)) continue;

        const res = await fetch('/api/inventory/reconcile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
          body: JSON.stringify({ sku: item.sku, actualCount, counterName }),
        });

        if (res.ok) {
          const result = await res.json();
          newResults[item.sku] = { done: true, variance: result.variance, actualCount };
          countedSkus.push(item.sku);
        } else {
          newResults[item.sku] = { done: false, error: true };
        }
      }
      setResults(newResults);

      const startTime = startTimes[activeCategory] || new Date().toISOString();
      const finishTime = new Date().toISOString();

      const finishRes = await fetch('/api/inventory/finish-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true' },
        body: JSON.stringify({
          category: activeCategory,
          countedSkus,
          counterName,
          sendReport: true,
          startTime,
          finishTime,
        }),
      });

      if (finishRes.ok) {
        const summary = await finishRes.json();
        setDayFinished(summary);
      }
    } catch (err) {
      console.error('Submit all failed:', err);
      alert(t('bcb_submit_error'));
    } finally {
      setSubmitting(false);
    }
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
  const totalItems = items.length;
  const totalDone  = Object.values(results).filter(s => typeof s === 'object' && s.done).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-bold text-gray-600 uppercase tracking-wide">{t('bcb_loading')}</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-8 text-center max-w-md">
        <p className="text-xl font-black text-red-700 uppercase mb-2">{t('bcb_error')}</p>
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={load} className="mt-4 px-4 py-2 bg-red-600 text-white font-black uppercase rounded-lg">{t('bcb_retry')}</button>
      </div>
    </div>
  );

  // ── Day Finished Summary ───────────────────────────────────────────────────
  if (dayFinished) return (
    <div className="max-w-4xl mx-auto">
      <header className="bg-emerald-800 text-white rounded-t-xl px-6 py-6 text-center">
        <p className="text-4xl mb-2">✅</p>
        <h2 className="text-2xl font-black tracking-tight uppercase">{t('bcb_section_complete')}</h2>
        <p className="text-emerald-200 text-sm font-semibold mt-1">{dayFinished.message}</p>
        {dayFinished.emailReport?.sent && (
          <p className="text-emerald-300 text-xs mt-1 font-bold">{t('bcb_email_sent')}</p>
        )}
        {dayFinished.emailReport?.sent === false && dayFinished.emailReport?.reason && (
          <p className="text-amber-300 text-xs mt-1 font-bold">{t('bcb_email_label')} {dayFinished.emailReport.reason}</p>
        )}
      </header>

      {/* Counted */}
      <div className="bg-white border-2 border-gray-200">
        <div className="bg-gray-900 text-white px-6 py-3">
          <h3 className="text-sm font-black uppercase tracking-wide">{t('bcb_counted_items', { count: dayFinished.counted })}</h3>
        </div>
        {dayFinished.countedItems?.map(item => {
          const variance = item.variance ?? 0;
          const actual   = item.actualCount ?? 0;
          return (
            <div key={item.sku} className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">{item.sku}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-600">{t('bcb_counted')} {actual}</span>
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
            <h3 className="text-sm font-black uppercase tracking-wide">{t('bcb_not_counted', { count: dayFinished.skipped })}</h3>
          </div>
          {dayFinished.skippedItems.map(item => (
            <div key={item.sku} className="px-6 py-3 flex items-center justify-between border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-xs font-bold text-gray-400 uppercase">{item.sku}</p>
              </div>
              <span className="text-xs font-black text-amber-700 bg-amber-100 border-2 border-amber-300 px-3 py-1.5 rounded-md">{t('bcb_skipped')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 bg-gray-100 border-2 border-gray-300 rounded-b-xl px-5 py-3 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-600">{t('bcb_variance_report')}</p>
        <button
          onClick={() => { setDayFinished(null); setActiveCategory(null); setResults({}); setCounts({}); load(); }}
          className="px-4 py-2 bg-gray-800 text-white text-xs font-black uppercase rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t('bcb_new_count')}
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
                  {assignment.assigned ? `${assignment.dayName} ${t('bcb_count')}` : t('bcb_no_count_today')}
                </h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">
                  {t('bcb_bobs_orders', { week: assignment.weekNumber || '' })}
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
                  {showWeekSchedule ? t('bcb_hide_week') : t('bcb_show_week')}
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
              <span className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md">{t('bcb_counter')} {counterName}</span>
              <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-md border border-gray-700">{totalDone}/{totalItems} {t('bcb_total')}</span>
            </div>
          </div>
        )}

        <div className="bg-gray-800 h-2">
          <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${totalItems > 0 ? (totalDone / totalItems) * 100 : 0}%` }} />
        </div>

        <div className={`bg-white border-2 border-gray-200 ${assignment ? '' : 'rounded-t-xl'} rounded-b-xl divide-y-2 divide-gray-100`}>
          {/* Assigned today */}
          {categories.filter(cat => isAssigned(cat.name)).map((cat) => {
            const total = cat.items.length;
            return (
              <button key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setAddForm(f => ({ ...f, category: cat.name }));
                  if (!startTimes[cat.name]) {
                    setStartTimes(prev => ({ ...prev, [cat.name]: new Date().toISOString() }));
                  }
                }}
                className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-amber-50 bg-amber-50/30"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center text-sm font-black">!</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{cat.name}</p>
                      <span className="text-[10px] font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded uppercase">{t('bcb_today')}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500">{total} {t('bcb_items')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase px-3 py-1.5 rounded-md bg-amber-500 text-black">{t('bcb_start')}</span>
                  <span className="text-gray-400 text-xl">→</span>
                </div>
              </button>
            );
          })}
          {/* Other categories */}
          {categories.filter(cat => !isAssigned(cat.name)).map((cat) => {
            const total = cat.items.length;
            return (
              <button key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setAddForm(f => ({ ...f, category: cat.name }));
                  if (!startTimes[cat.name]) {
                    setStartTimes(prev => ({ ...prev, [cat.name]: new Date().toISOString() }));
                  }
                }}
                className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold"></span>
                  <div>
                    <p className="text-base font-bold text-gray-600 uppercase tracking-tight">{cat.name}</p>
                    <p className="text-xs text-gray-400">{total} {t('bcb_items')}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-md bg-gray-100 text-gray-400"></span>
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
  const filledCount = catItems.filter(i => counts[i.sku] !== undefined && counts[i.sku] !== '').length;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <header className="bg-gray-900 text-white rounded-t-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <button onClick={() => { setActiveCategory(null); setResults({}); }}
            className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors">
            ←
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase">{activeCategory}</h2>
            <p className="text-gray-400 text-sm font-semibold mt-0.5">{t('bcb_items_filled', { filled: filledCount, total: catItems.length })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-500 text-black text-xs font-black uppercase tracking-widest px-4 py-2 rounded-md">{t('bcb_counter')} {counterName}</span>
          <button onClick={() => setShowAddPanel(!showAddPanel)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase px-3 py-2 rounded-md transition-colors">
            {t('bcb_add_item')}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-gray-800 h-2">
        <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${catItems.length > 0 ? (filledCount / catItems.length) * 100 : 0}%` }} />
      </div>

      {/* Quick-Add Panel */}
      {showAddPanel && (
        <div className="bg-amber-50 border-2 border-amber-400 px-6 py-4">
          <p className="text-xs font-black text-amber-800 uppercase mb-3">{t('bcb_add_item_msg', { category: activeCategory })}</p>
          <form onSubmit={handleAddItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input type="text" required placeholder={t('bcb_sku')}
              value={addForm.sku} onChange={e => setAddForm(f => ({ ...f, sku: e.target.value }))}
              className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" />
            <input type="text" required placeholder={t('bcb_description')}
              value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
              className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500 col-span-2" />
            <input type="number" min="0" placeholder={t('bcb_qty_on_hand')}
              value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))}
              className="border-2 border-amber-300 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500" />
            <div className="col-span-2 sm:col-span-4 flex gap-3 items-center">
              <button type="submit" disabled={addStatus?.type === 'loading'}
                className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase px-4 py-2 rounded-lg transition-colors">
                {addStatus?.type === 'loading' ? t('bcb_saving') : t('bcb_save_item')}
              </button>
              <button type="button" onClick={() => setShowAddPanel(false)}
                className="text-xs font-bold text-gray-500 hover:text-gray-700">{t('bcb_cancel_add')}</button>
              {addStatus && (
                <span className={`text-xs font-black ${addStatus.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {addStatus.message}
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border-x-2 border-gray-200 px-6 py-3 flex items-start gap-3">
        <span className="text-xl">📋</span>
        <p className="text-sm text-blue-800 font-semibold">
          {t('bcb_instructions')} <strong>{t('bcb_instructions_btn')}</strong> {t('bcb_instructions_end')}
        </p>
      </div>

      {/* Item Rows — just count inputs, no individual submit buttons */}
      <div className="bg-white border-2 border-gray-200 rounded-b-xl divide-y-2 divide-gray-100">
        {catItems.length === 0 && (
          <div className="p-10 text-center text-gray-400 font-bold uppercase">{t('bcb_no_items')}</div>
        )}

        {catItems.map((item, idx) => {
          const result = results[item.sku];
          const hasFilled = counts[item.sku] !== undefined && counts[item.sku] !== '';

          return (
            <div key={item.sku}
              className={`px-6 py-4 transition-colors duration-300 ${
                result?.done ? 'bg-emerald-50' : hasFilled ? 'bg-amber-50/40' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-black text-gray-900 uppercase tracking-tight leading-tight">{item.name}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mt-1">{item.sku}</p>
                </div>

                {/* Count Input + Result */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {result?.done && (
                    <>
                      <span className="bg-emerald-600 text-white text-xs font-black uppercase px-2 py-1.5 rounded-md">✓</span>
                      <VarianceBadge
                        variance={result.variance ?? 0}
                        actualCount={Number(counts[item.sku] || 0)}
                        category={activeCategory}
                      />
                    </>
                  )}
                  {result?.error && (
                    <span className="text-xs font-black text-red-600 uppercase bg-red-100 px-2 py-1 rounded-md">{t('bcb_failed')}</span>
                  )}

                  <input type="number" placeholder={t('bcb_count')}
                    value={counts[item.sku] || ''}
                    onChange={e => handleCountChange(item.sku, e.target.value)}
                    min="0"
                    disabled={submitting}
                    className="w-28 h-11 px-3 text-base font-bold text-gray-900 bg-gray-100 border-2 border-gray-300 rounded-lg placeholder:text-gray-400 placeholder:text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Single Submit All Button */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button onClick={() => { setActiveCategory(null); setResults({}); }}
          className="text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
          {t('bcb_back_sections')}
        </button>
        <button
          onClick={handleSubmitAll}
          disabled={submitting || filledCount === 0}
          className={`h-12 px-8 text-sm font-black uppercase tracking-wide rounded-lg cursor-pointer transition-all shadow-lg ${
            submitting
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : filledCount === catItems.length
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : filledCount > 0
                  ? 'bg-amber-500 hover:bg-amber-600 text-black'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitting
            ? t('bcb_submitting')
            : filledCount === catItems.length
              ? t('bcb_submit_all', { count: filledCount })
              : filledCount > 0
                ? t('bcb_submit_partial', { filled: filledCount, total: catItems.length })
                : t('bcb_enter_counts')}
        </button>
      </div>

      {filledCount < catItems.length && filledCount > 0 && (
        <div className="mt-3 bg-amber-100 border-2 border-amber-400 rounded-lg px-5 py-3 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <p className="text-sm text-amber-800 font-medium">
            <strong>{t('bcb_items_no_count', { count: catItems.length - filledCount })}</strong> {t('bcb_not_counted_note')}
          </p>
        </div>
      )}
    </div>
  );
}
