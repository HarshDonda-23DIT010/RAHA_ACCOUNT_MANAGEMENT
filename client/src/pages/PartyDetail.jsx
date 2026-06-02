import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PhoneIcon, ClipboardDocumentListIcon, ArrowDownRightIcon, ArrowUpRightIcon, PaperClipIcon, TrashIcon, PlusIcon, CameraIcon, XMarkIcon, CalendarDaysIcon, FunnelIcon } from '@heroicons/react/24/outline';

const fmt = (n) => `₹${Math.abs(Number(n || 0)).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const monthStartStr = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };

const DATE_PRESETS = [
  { label: 'Today',      from: todayStr,      to: todayStr },
  { label: 'This Week',  from: () => daysAgoStr(6), to: todayStr },
  { label: 'This Month', from: monthStartStr, to: todayStr },
  { label: 'Last 3 Mon', from: () => daysAgoStr(89), to: todayStr },
];

export default function PartyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [party, setParty] = useState(null);
  const [txns, setTxns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [billPreview, setBillPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({
    type: 'in', amount: '', note: '', date: new Date().toISOString().slice(0, 10), billImage: null,
  });

  // Date filter state
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activePreset, setActivePreset] = useState('');

  const load = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([
        api.get(`/parties/${id}`),
        api.get(`/transactions?partyId=${id}`),
      ]);
      setParty(p.data);
      setTxns(t.data);
    } catch { toast.error('Failed to load'); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const isBeauty = party?.section === 'beauty';
  const themeGrad = isBeauty ? 'from-pink-500 to-rose-400' : 'from-amber-500 to-yellow-400';
  const themeColor = isBeauty ? 'text-brand-600' : 'text-amber-600';
  const themeBorder = isBeauty ? 'border-brand-400' : 'border-amber-400';
  const themeBg = isBeauty ? 'bg-pink-50' : 'bg-amber-50';

  // Filtered transactions
  const isFilterActive = dateFrom || dateTo;

  const filteredTxns = useMemo(() => {
    if (!isFilterActive) return txns;
    return txns.filter(txn => {
      const txnDate = new Date(txn.date);
      if (dateFrom) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
        if (txnDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
        if (txnDate > to) return false;
      }
      return true;
    });
  }, [txns, dateFrom, dateTo, isFilterActive]);

  // Filtered period totals
  const periodTotals = useMemo(() => {
    return filteredTxns.reduce(
      (acc, t) => {
        if (t.type === 'in') acc.cashIn += t.amount;
        else acc.cashOut += t.amount;
        return acc;
      },
      { cashIn: 0, cashOut: 0 }
    );
  }, [filteredTxns]);

  const applyPreset = (preset) => {
    setDateFrom(preset.from());
    setDateTo(preset.to());
    setActivePreset(preset.label);
  };

  const clearFilter = () => {
    setDateFrom('');
    setDateTo('');
    setActivePreset('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return toast.error('Enter a valid amount');

    setLoading(true);
    const fd = new FormData();
    fd.append('partyId', id);
    fd.append('section', party.section);
    fd.append('type', form.type);
    fd.append('amount', form.amount);
    fd.append('note', form.note);
    fd.append('date', form.date);
    if (form.billImage) fd.append('billImage', form.billImage);

    try {
      await api.post('/transactions', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Transaction added!');
      setForm({ type: 'in', amount: '', note: '', date: new Date().toISOString().slice(0, 10), billImage: null });
      setBillPreview(null);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add transaction');
    } finally { setLoading(false); }
  };

  const handleDelete = async (txnId) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeleting(txnId);
    try {
      await api.delete(`/transactions/${txnId}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => ({ ...f, billImage: file }));
    setBillPreview(URL.createObjectURL(file));
  };

  if (!party) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-4xl">⏳</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className={`bg-gradient-to-r ${themeGrad} text-white px-4 md:px-8 lg:px-12 pt-10 pb-8`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-white/70 uppercase tracking-widest font-medium capitalize">{party.type}</p>
            <h2 className="font-bold text-xl">{party.name}</h2>
            {party.phone && <p className="text-white/70 text-xs flex items-center gap-1"><PhoneIcon className="w-3 h-3" /> {party.phone}</p>}
          </div>
        </div>

        {/* Balance Summary */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">You will get</p>
            <p className="font-bold text-lg">{party.balance > 0 ? fmt(party.balance) : '₹0'}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-white/70">You will give</p>
            <p className="font-bold text-lg">{party.balance < 0 ? fmt(party.balance) : '₹0'}</p>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="px-4 md:px-8 lg:px-12 mt-4">

        {/* Section header + Filter toggle */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Transactions
            {isFilterActive && (
              <span className={`ml-2 ${themeColor} normal-case font-bold`}>
                ({filteredTxns.length} of {txns.length})
              </span>
            )}
          </h3>
          <button
            id="txn-filter-toggle"
            onClick={() => setShowFilter(v => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
              isFilterActive
                ? `${themeColor} ${themeBorder} ${themeBg} border-current`
                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'
            }`}>
            <FunnelIcon className="w-3.5 h-3.5" />
            {isFilterActive ? 'Filtered' : 'Filter by Date'}
            {isFilterActive && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">✓</span>
            )}
          </button>
        </div>

        {/* Date Filter Panel */}
        {showFilter && (
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-4 shadow-sm space-y-3">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className={`w-4 h-4 ${themeColor}`} />
                <span className="text-sm font-bold text-gray-700">Filter by Bill Date</span>
              </div>
              {isFilterActive && (
                <button onClick={clearFilter}
                  className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:text-red-600 transition">
                  <XMarkIcon className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  id={`preset-${preset.label.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    activePreset === preset.label
                      ? `${themeColor} ${themeBorder} ${themeBg} border-current`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-gray-50'
                  }`}>
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom From / To */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">From</label>
                <input
                  id="filter-from"
                  type="date"
                  value={dateFrom}
                  max={dateTo || todayStr()}
                  onChange={e => { setDateFrom(e.target.value); setActivePreset(''); }}
                  className={`w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition ${dateFrom ? themeBorder : 'border-gray-200'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">To</label>
                <input
                  id="filter-to"
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  max={todayStr()}
                  onChange={e => { setDateTo(e.target.value); setActivePreset(''); }}
                  className={`w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none transition ${dateTo ? themeBorder : 'border-gray-200'}`}
                />
              </div>
            </div>

            {/* Period Summary — shows when filter is active */}
            {isFilterActive && filteredTxns.length > 0 && (
              <div className={`rounded-xl p-3 ${themeBg} grid grid-cols-3 gap-2 text-center`}>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Cash In</p>
                  <p className="text-green-600 font-bold text-sm">{fmt(periodTotals.cashIn)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Cash Out</p>
                  <p className="text-red-500 font-bold text-sm">{fmt(periodTotals.cashOut)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Net</p>
                  <p className={`font-bold text-sm ${periodTotals.cashIn >= periodTotals.cashOut ? 'text-green-600' : 'text-red-500'}`}>
                    {periodTotals.cashIn >= periodTotals.cashOut ? '+' : '-'}{fmt(periodTotals.cashIn - periodTotals.cashOut)}
                  </p>
                </div>
              </div>
            )}

            {/* No results message */}
            {isFilterActive && filteredTxns.length === 0 && (
              <p className="text-xs text-center text-gray-400 py-1">No transactions in this date range</p>
            )}
          </div>
        )}

        {/* Transaction List */}
        <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {filteredTxns.length === 0 && txns.length === 0 && (
            <div className="text-center py-16 text-gray-400 md:col-span-full flex flex-col items-center">
              <ClipboardDocumentListIcon className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm">Tap + to add a transaction</p>
            </div>
          )}
          {filteredTxns.length === 0 && txns.length > 0 && (
            <div className="text-center py-12 text-gray-400 md:col-span-full flex flex-col items-center">
              <CalendarDaysIcon className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-medium">No transactions in this date range</p>
              <button onClick={clearFilter} className={`text-sm underline mt-1 ${themeColor}`}>Clear filter</button>
            </div>
          )}
          {filteredTxns.map(txn => (
            <div key={txn._id} id={`txn-${txn._id}`}
              className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${txn.type === 'in' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    {txn.type === 'in' ? <ArrowDownRightIcon className="w-6 h-6 stroke-2" /> : <ArrowUpRightIcon className="w-6 h-6 stroke-2" />}
                  </div>
                  <div>
                    <p className={`font-bold text-base ${txn.type === 'in' ? 'text-green-600' : 'text-red-500'}`}>
                      {txn.type === 'in' ? '+' : '-'}{fmt(txn.amount)}
                    </p>
                    {txn.note && <p className="text-xs text-gray-500 mt-0.5">{txn.note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(txn.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {txn.billImage && (
                    <a href={`/uploads/${txn.billImage}`} target="_blank" rel="noreferrer"
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium flex items-center gap-1 hover:bg-blue-100 transition">
                      <PaperClipIcon className="w-4 h-4" /> Bill
                    </a>
                  )}
                  <button onClick={() => handleDelete(txn._id)} disabled={deleting === txn._id}
                    className="text-xs bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition flex items-center justify-center h-6 w-6">
                    {deleting === txn._id ? '…' : <TrashIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button id="add-txn-fab"
        onClick={() => setShowForm(true)}
        className={`fixed bottom-6 right-6 ${isBeauty ? 'bg-brand-600' : 'bg-amber-500'} text-white px-6 py-3.5 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 active:scale-95 transition-all z-20`}>
        <PlusIcon className="w-5 h-5 stroke-2" /> Add Transaction
      </button>

      {/* Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center md:p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="w-full bg-white rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto md:max-w-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-5">Add Transaction</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Transaction Type</label>
                <div className="flex gap-3">
                  <button type="button" id="type-in"
                    onClick={() => setForm(f => ({ ...f, type: 'in' }))}
                    className={`flex flex-1 items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition ${form.type === 'in' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-gray-500'}`}>
                    <ArrowDownRightIcon className="w-5 h-5" /> Cash In (Received)
                  </button>
                  <button type="button" id="type-out"
                    onClick={() => setForm(f => ({ ...f, type: 'out' }))}
                    className={`flex flex-1 items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition ${form.type === 'out' ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 text-gray-500'}`}>
                    <ArrowUpRightIcon className="w-5 h-5" /> Cash Out (Given)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount (₹) *</label>
                <input id="txn-amount" type="number" min="0" step="0.01"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-brand-500 text-center"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Note (optional)</label>
                <input id="txn-note" type="text"
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Lipstick, bangles order…"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                <input id="txn-date" type="date"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Bill Image */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill Image (optional)</label>
                <input ref={fileRef} type="file" id="txn-bill" accept="image/*,application/pdf"
                  onChange={handleFile} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-500 transition flex items-center justify-center gap-2">
                  <CameraIcon className="w-5 h-5" /> {form.billImage ? form.billImage.name : 'Upload Bill Photo / PDF'}
                </button>
                {billPreview && (
                  <div className="mt-2 relative">
                    <img src={billPreview} alt="bill preview" className="w-full h-32 object-cover rounded-xl" />
                    <button type="button" onClick={() => { setBillPreview(null); setForm(f => ({ ...f, billImage: null })); fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center hover:bg-red-600 transition"><XMarkIcon className="w-4 h-4 stroke-2" /></button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border-2 border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className={`flex-1 ${form.type === 'in' ? 'bg-green-500' : 'bg-red-500'} text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60`}>
                  {loading ? 'Saving…' : `Save ${form.type === 'in' ? 'Cash In' : 'Cash Out'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
