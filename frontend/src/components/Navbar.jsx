import React from 'react';
import { Heart, MapPin, Database, RefreshCw, LogOut, User, ShieldCheck } from 'lucide-react';

export default function Navbar({ profile, currentUser, onRefresh, isRefreshing, onLogout }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {profile?.bride_name && profile?.groom_name ? (
            <>
              <span className="font-serif italic font-bold text-lg text-slate-800">
                {profile.bride_name}
              </span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="font-serif italic font-bold text-lg text-slate-800">
                {profile.groom_name}
              </span>
            </>
          ) : (
            <span className="font-serif italic font-bold text-base sm:text-lg text-slate-800">
              {profile?.bride_name || profile?.groom_name || currentUser?.name || 'Wedding Planner'}
            </span>
          )}
        </div>

        {profile?.location && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 pl-4 border-l border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-xs">{profile.location}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium">
          <Database className="w-3.5 h-3.5" />
          <span>MySQL Connected</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          title="Segarkan Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* User Info & Logout */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name || currentUser.username}
              </span>
              <span className="text-[10px] text-rose-500 font-medium">
                💍 Akun Pengantin
              </span>
            </div>

            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {currentUser.username ? currentUser.username.substring(0, 2) : 'US'}
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
