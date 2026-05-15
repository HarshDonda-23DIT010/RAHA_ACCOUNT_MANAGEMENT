import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, UserGroupIcon, BuildingStorefrontIcon, PlusIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';

const COLORS = ['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500'];
const getColor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
const fmt = (n) => `₹${Math.abs(Number(n || 0)).toLocaleString('en-IN')}`;
const timeAgo = (d) => {
  const diff = Date.now() - new Date(d);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today'; if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`; if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
};

export default function Section() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('customer');
  const [parties, setParties] = useState([]);
  const [summary, setSummary] = useState({ willGet: 0, willGive: 0 });
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const isBeauty = section === 'beauty';
  const themeGrad = isBeauty
    ? 'from-pink-500 to-rose-400'
    : 'from-amber-500 to-yellow-400';
  const themeBtn = isBeauty ? 'bg-brand-600' : 'bg-amber-500';

  const load = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([
        api.get(`/parties?section=${section}&type=${tab}`),
        api.get(`/parties/summary?section=${section}`),
      ]);
      setParties(p.data);
      setSummary(s.data);
    } catch { toast.error('Failed to load data'); }
  }, [section, tab]);

  useEffect(() => { load(); }, [load]);

  const filtered = parties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return toast.error('Name is required');
    setLoading(true);
    try {
      await api.post('/parties', { name: addForm.name, phone: addForm.phone, type: tab, section });
      toast.success(`${tab === 'customer' ? 'Customer' : 'Provider'} added!`);
      setAddForm({ name: '', phone: '' });
      setShowAdd(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`bg-gradient-to-r ${themeGrad} text-white px-4 md:px-8 lg:px-12 pt-10 pb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-white/70 uppercase tracking-widest font-medium">Section</p>
            <h2 className="font-bold text-xl flex items-center gap-2">
              {isBeauty ? <SparklesIcon className="w-6 h-6 text-pink-200" /> : <StarIcon className="w-6 h-6 text-amber-200" />}
              {isBeauty ? 'Beauty' : 'Bangles'}
            </h2>
          </div>
        </div>
        {/* Summary */}
        <div className="flex gap-3">
          <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-green-900">You will get</p>
            <p className="font-bold text-lg text-green-600">{fmt(summary.willGet)}</p>
          </div>
          <div className="flex-1 bg-white/20 rounded-xl p-3 text-center">
            <p className="text-xs text-red-900">You will give</p>
            <p className="font-bold text-lg text-red-600">{fmt(summary.willGive)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm md:px-8 lg:px-12">
        {['customer', 'provider'].map(t => (
          <button key={t} id={`tab-${t}`}
            onClick={() => { setTab(t); setSearch(''); }}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all ${tab === t
              ? `${isBeauty ? 'text-brand-600 border-b-2 border-brand-600' : 'text-amber-600 border-b-2 border-amber-500'}`
              : 'text-gray-400'}`}>
            {t === 'customer' ? <UserGroupIcon className="w-5 h-5" /> : <BuildingStorefrontIcon className="w-5 h-5" />}
            {t === 'customer' ? 'Customers' : 'Providers'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 md:px-8 lg:px-12 pt-4 pb-2">
        <input
          id="party-search"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 bg-white"
        />
      </div>

      {/* Party list */}
      <div className="px-4 md:px-8 lg:px-12 space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 mt-2">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-16 flex flex-col items-center">
            {tab === 'customer' ? <UserGroupIcon className="w-12 h-12 mb-3 text-gray-300" /> : <BuildingStorefrontIcon className="w-12 h-12 mb-3 text-gray-300" />}
            <p className="font-medium">No {tab}s yet</p>
            <p className="text-sm">Tap + to add your first {tab}</p>
          </div>
        )}
        {filtered.map(party => (
          <button key={party._id} id={`party-${party._id}`}
            onClick={() => navigate(`/party/${party._id}`)}
            className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex items-center gap-3 text-left active:scale-98">
            <div className={`w-12 h-12 rounded-full ${getColor(party.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {initials(party.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{party.name}</p>
              <p className="text-xs text-gray-400">{timeAgo(party.updatedAt)}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {party.balance === 0 && <p className="text-gray-400 font-semibold text-sm">₹0</p>}
              {party.balance > 0 && (
                <>
                  <p className="text-green-600 font-bold text-sm">{fmt(party.balance)}</p>
                  <p className="text-xs text-green-500">will get</p>
                </>
              )}
              {party.balance < 0 && (
                <>
                  <p className="text-red-500 font-bold text-sm">{fmt(party.balance)}</p>
                  <p className="text-xs text-red-400">will give</p>
                </>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* FAB */}
      <button id="add-party-fab"
        onClick={() => setShowAdd(true)}
        className={`fixed bottom-6 right-6 ${themeBtn} text-white px-6 py-3.5 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm hover:opacity-90 active:scale-95 transition-all z-20`}>
        <PlusIcon className="w-5 h-5 stroke-2" />
        Add {tab === 'customer' ? 'Customer' : 'Provider'}
      </button>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center md:p-4">
          <div className="w-full bg-white rounded-t-3xl md:rounded-3xl p-6 animate-slide-up md:max-w-md">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden"></div>
            <h3 className="text-lg font-bold text-gray-800 mb-5">
              Add {tab === 'customer' ? 'Customer' : 'Provider'}
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name *</label>
                <input
                  id="add-name"
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone (optional)</label>
                <input
                  id="add-phone"
                  type="tel"
                  value={addForm.phone}
                  onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 border-2 border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className={`flex-1 ${themeBtn} text-white py-3 rounded-xl text-sm font-bold disabled:opacity-60`}>
                  {loading ? 'Adding…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
