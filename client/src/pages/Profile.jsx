import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, UserIcon, EyeIcon, EyeSlashIcon, KeyIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.png'

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed! Please login again.');
      setTimeout(() => { logout(); navigate('/login'); }, 1500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const sectionColor = user?.section === 'beauty'
    ? 'from-pink-500 to-rose-400'
    : user?.section === 'bangles'
      ? 'from-amber-500 to-yellow-400'
      : 'from-brand-600 to-pink-500';

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className={`bg-gradient-to-r ${sectionColor} text-white px-4 md:px-8 lg:px-12 pt-10 pb-16`}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-xl">Profile</h2>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="logo" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <h3 className="font-bold text-xl">{user?.name}</h3>
          <p className="text-white/70 text-sm mt-1">ID: {user?.sectionId}</p>
          <span className="mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold capitalize">
            {user?.section} · {user?.role}
          </span>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12 -mt-8 space-y-4 md:max-w-2xl md:mx-auto">
        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Account Info</h4>
          <div className="space-y-3">
            {[
              { label: 'Full Name', val: user?.name },
              { label: 'Section ID', val: user?.sectionId },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-800 capitalize">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Change Password</h4>
          <form onSubmit={handleChange} className="space-y-4">
            {[
              { key: 'old', label: 'Current Password', field: 'oldPassword' },
              { key: 'new', label: 'New Password', field: 'newPassword' },
              { key: 'confirm', label: 'Confirm New Password', field: 'confirm' },
            ].map(({ key, label, field }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                <div className="relative">
                  <input
                    id={`pw-${key}`}
                    type={showPw[key] ? 'text' : 'password'}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-brand-500"
                  />
                  <button type="button"
                    onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition">
                    {showPw[key] ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-pink-500 text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 mt-2 flex items-center justify-center gap-2">
              <KeyIcon className="w-5 h-5 stroke-2" /> {loading ? 'Changing…' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Logout */}
        <button id="logout-btn"
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full bg-white rounded-2xl shadow-lg p-4 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition">
          <ArrowRightOnRectangleIcon className="w-5 h-5 stroke-2" /> Logout
        </button>
      </div>
    </div>
  );
}
