import React from 'react';
import { 
  LayoutDashboard, 
  Heart, 
  PiggyBank, 
  WalletCards, 
  CheckSquare, 
  Clock, 
  Users, 
  Briefcase, 
  Armchair, 
  Flower2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, profile, daysRemaining, currentUser }) {
  const menuItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'profile', label: 'Sampul & Profil', icon: Heart },
    { id: 'savings', label: 'Tabungan', icon: PiggyBank },
    { id: 'budget', label: 'Anggaran & Biaya', icon: WalletCards },
    { id: 'checklist', label: 'Checklist Tugas', icon: CheckSquare },
    { id: 'rundown', label: 'Rundown Hari-H', icon: Clock },
    { id: 'guests', label: 'Daftar Tamu', icon: Users },
    { id: 'vendors', label: 'Daftar Vendor', icon: Briefcase },
    { id: 'tables', label: 'Denah Meja', icon: Armchair },
    { id: 'bridal-party', label: 'Pendamping & Panitia', icon: Flower2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-800 leading-tight">Wedding Planner</h1>
          <p className="text-xs text-rose-500 font-medium truncate max-w-[140px]">
            {profile?.bride_name && profile?.groom_name
              ? `${profile.bride_name.split(' ')[0]} & ${profile.groom_name.split(' ')[0]}`
              : (currentUser?.name || 'Rencana Bahagia')}
          </p>
        </div>
      </div>

      {/* Countdown Card Widget in Sidebar */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50/40 p-3.5 rounded-xl border border-rose-100/70 text-center">
          <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Hitung Mundur</span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-serif">
            {daysRemaining !== undefined ? daysRemaining : '—'} <span className="text-xs font-sans font-medium text-slate-600">Hari Lagi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {profile?.wedding_date || 'Tanggal belum diatur'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card & Footer info */}
      {currentUser && (
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {currentUser.name || currentUser.username}
              </p>
              <p className="text-[10px] text-rose-500 font-medium">
                💍 Akun Pengantin
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50">
        <p className="text-[11px] text-slate-400">Golang + MySQL + React</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Automated Wedding Suite</p>
      </div>
    </aside>
  );
}
