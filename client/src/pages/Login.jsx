import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png'


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [sectionId, setSectionId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionId || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(sectionId, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-500 to-pink-400 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-pink-500 px-6 py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
              <img src={logo} alt="Bharat Beauty" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <h1 className="text-white text-2xl font-bold tracking-wide">Bharat Beauty</h1>
            <p className="text-pink-100 text-sm mt-1">Account Manager</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Section ID</label>
              <input
                id="sectionId"
                type="text"
                value={sectionId}
                onChange={e => setSectionId(e.target.value)}
                placeholder="e.g. BEAUTY-01"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-500 transition uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm font-medium focus:outline-none focus:border-brand-500 transition"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition">
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-pink-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:from-brand-700 hover:to-pink-600 transition-all disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="text-center text-xs text-gray-400 mt-2">
              <p>Default IDs: <span className="font-mono font-semibold text-brand-500">BEAUTY-01 / BANGLES-01</span></p>
            </div>
          </form>
        </div>

        <p className="text-center text-white/70 text-xs mt-6">© 2024 Bharat Beauty · All rights reserved</p>
      </div>
    </div>
  );
}
