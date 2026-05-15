import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserCircleIcon, ArrowRightOnRectangleIcon, ChevronRightIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png'

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [beautySummary, setBeautySummary] = useState({ willGet: 0, willGive: 0 });
  const [banglesSummary, setBanglesSummary] = useState({ willGet: 0, willGive: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/parties/summary?section=beauty'),
      api.get('/parties/summary?section=bangles'),
    ]).then(([b, g]) => {
      setBeautySummary(b.data);
      setBanglesSummary(g.data);
    }).catch(() => { });
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-brand-600 to-pink-500 text-white px-4 md:px-8 lg:px-12 pt-10 pb-20 md:pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="logo" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <div>
              <p className="text-xs text-pink-200 font-medium">Welcome back,</p>
              <p className="font-bold text-lg leading-tight">Bharat Beauty</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
              <UserCircleIcon className="w-6 h-6" />
            </button>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <h2 className="mt-5 text-xl font-bold">Account Manager</h2>
        <p className="text-pink-100 text-sm">Select a section to manage accounts</p>
      </div>

      {/* Section Cards */}
      <div className="px-4 md:px-8 lg:px-12 -mt-12 md:-mt-16 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-8 pb-8">
        {/* Beauty */}
        <button
          id="beauty-section-btn"
          onClick={() => navigate('/section/beauty')}
          className="w-full bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all active:scale-98 text-left">
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-4 flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-pink-100" />
            <div>
              <h3 className="text-white font-bold text-lg">Beauty Section</h3>
              <p className="text-pink-100 text-xs">Customers & Providers</p>
            </div>
            <ChevronRightIcon className="ml-auto w-6 h-6 text-white/70" />
          </div>
          <div className="px-4 py-3 flex justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">You will get</p>
              <p className="text-green-600 font-bold text-base">{fmt(beautySummary.willGet)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">You will give</p>
              <p className="text-red-500 font-bold text-base">{fmt(beautySummary.willGive)}</p>
            </div>
          </div>
        </button>

        {/* Bangles */}
        <button
          id="bangles-section-btn"
          onClick={() => navigate('/section/bangles')}
          className="w-full bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all active:scale-98 text-left">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 flex items-center gap-3">
            <StarIcon className="w-8 h-8 text-amber-100" />
            <div>
              <h3 className="text-white font-bold text-lg">Bangles Section</h3>
              <p className="text-yellow-100 text-xs">Customers & Providers</p>
            </div>
            <ChevronRightIcon className="ml-auto w-6 h-6 text-white/70" />
          </div>
          <div className="px-4 py-3 flex justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">You will get</p>
              <p className="text-green-600 font-bold text-base">{fmt(banglesSummary.willGet)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-medium">You will give</p>
              <p className="text-red-500 font-bold text-base">{fmt(banglesSummary.willGive)}</p>
            </div>
          </div>
        </button>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-500 mb-3 md:mb-4">Overall Summary</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Total to Receive</p>
              <p className="text-green-600 font-bold text-lg">{fmt(beautySummary.willGet + banglesSummary.willGet)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Total to Pay</p>
              <p className="text-red-500 font-bold text-lg">{fmt(beautySummary.willGive + banglesSummary.willGive)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
