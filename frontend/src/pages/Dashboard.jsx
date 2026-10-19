import React from 'react';
import { 
  Calendar, 
  Wallet, 
  PiggyBank, 
  Users, 
  CheckSquare, 
  Briefcase, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatRupiah } from '../api/client';

export default function Dashboard({ summary, onNavigate, onToggleChecklist }) {
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400 font-medium text-sm">Memuat Ringkasan Data...</div>
      </div>
    );
  }

  const profile = summary?.profile || {};
  const daysRemaining = summary?.days_remaining ?? 0;
  const budget = summary?.budget || { by_category: {} };
  const guests = summary?.guests || {};
  const checklist = summary?.checklist || {};
  const savings = summary?.savings || {};
  const vendorsCount = summary?.vendors_count ?? 0;
  const recentTasks = summary?.recent_tasks || [];
  const todayRundown = summary?.today_rundown || [];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white p-8 shadow-xl shadow-rose-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <span>💍 Rencana Pernikahan Bahagia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
            {profile.bride_name && profile.groom_name
              ? `${profile.bride_name} & ${profile.groom_name}`
              : (profile.bride_name || profile.groom_name || 'Rencana Pernikahan Impian')}
          </h2>
          <p className="mt-2 text-rose-100 text-sm sm:text-base leading-relaxed">
            {profile.notes || 'Semua progres persiapan, anggaran, tabungan, dan daftar tamu terpantau secara rapi dalam satu aplikasi.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Calendar className="w-4 h-4 text-rose-200" />
              <span>Hari-H: {profile.wedding_date || 'Belum diatur'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/15 px-3 py-1.5 rounded-lg backdrop-blur-xs">
              <Clock className="w-4 h-4 text-rose-200" />
              <span className="font-bold text-white">{daysRemaining} Hari Lagi Menuju Hari-H</span>
            </div>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Anggaran */}
        <div 
          onClick={() => onNavigate('budget')} 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Anggaran</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-800">{formatRupiah(budget.total_budget)}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Estimasi Biaya:</span>
            <span className="font-semibold text-slate-700">{formatRupiah(budget.estimated_cost)}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Sudah Dibayar:</span>
            <span className="font-semibold text-emerald-600">{formatRupiah(budget.paid_amount)}</span>
          </div>
        </div>

        {/* Card 2: Tabungan */}
        <div 
          onClick={() => onNavigate('savings')} 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tabungan Bersama</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-800">{formatRupiah(savings.total_collected)}</div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(savings.percentage || 0, 100)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Target: {formatRupiah(savings.target_total)}</span>
            <span className="font-bold text-rose-600">{savings.percentage}%</span>
          </div>
        </div>

        {/* Card 3: Tamu Undangan */}
        <div 
          onClick={() => onNavigate('guests')} 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tamu Undangan</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {guests.total_pax} <span className="text-xs font-normal text-slate-500">Pax ({guests.total_invited} Undangan)</span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500">
            <span className="text-emerald-600 font-medium">Hadir: {guests.attending_pax}</span>
            <span className="text-amber-600 font-medium">Belum: {guests.pending_pax}</span>
            <span className="text-rose-600 font-medium">Batal: {guests.declined_pax}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Souvenir Diterima:</span>
            <span className="font-semibold text-slate-700">{guests.souvenirs_given} orang</span>
          </div>
        </div>

        {/* Card 4: Checklist */}
        <div 
          onClick={() => onNavigate('checklist')} 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Checklist Tugas</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-800">
            {checklist.completed_tasks} / {checklist.total_tasks} <span className="text-xs font-normal text-slate-500">Tugas</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${checklist.percentage || 0}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Progres:</span>
            <span className="font-bold text-emerald-600">{checklist.percentage}% Selesai</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Budget Allocation & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Budget By Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Alokasi Biaya per Kategori</h3>
              <p className="text-xs text-slate-500">Rincian estimasi pengeluaran per sektor</p>
            </div>
            <button 
              onClick={() => onNavigate('budget')}
              className="text-xs text-rose-600 font-semibold flex items-center gap-1 hover:underline"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(budget.by_category || {}).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada item anggaran.</p>
            ) : (
              Object.entries(budget.by_category)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([cat, amount]) => {
                  const pct = budget.estimated_cost > 0 ? Math.round((amount / budget.estimated_cost) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">{formatRupiah(amount)}</span>
                          <span className="text-slate-400 text-[10px]">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Checklist Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Tugas Menunggu Penyelesaian</h3>
                <p className="text-xs text-slate-500">Fokus tindakan persiapan terdekat</p>
              </div>
              <button 
                onClick={() => onNavigate('checklist')}
                className="text-xs text-rose-600 font-semibold flex items-center gap-1 hover:underline"
              >
                Lihat Checklist <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-emerald-600 font-medium">
                  🎉 Semua tugas terdekat sudah diselesaikan!
                </div>
              ) : (
                recentTasks.map((t) => (
                  <div 
                    key={t.id} 
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition border border-slate-100"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={t.is_completed}
                        onChange={() => onToggleChecklist(t.id)}
                        className="mt-0.5 rounded border-slate-300 text-rose-500 focus:ring-rose-400 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-medium text-slate-800 leading-snug">{t.task}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                            {t.phase}
                          </span>
                          {t.pic && (
                            <span className="text-[10px] text-slate-400">
                              PIC: <span className="text-slate-600 font-medium">{t.pic}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Vendor Terdaftar: <strong className="text-slate-700">{vendorsCount} Vendor</strong></span>
            <button 
              onClick={() => onNavigate('vendors')}
              className="text-rose-600 hover:underline font-medium"
            >
              Kelola Vendor &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Rundown Preview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Susunan Acara Hari-H (Rundown Singkat)</h3>
            <p className="text-xs text-slate-500">Alur jadwal prosesi pernikahan</p>
          </div>
          <button 
            onClick={() => onNavigate('rundown')}
            className="text-xs text-rose-600 font-semibold flex items-center gap-1 hover:underline"
          >
            Buka Rundown Lengkap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {todayRundown.map((item) => (
            <div key={item.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-600 font-mono">{item.time}</span>
                <span className="text-[10px] text-slate-400 font-medium">{item.location}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.activity}</p>
              <p className="text-[11px] text-slate-500">PIC: {item.pic || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
