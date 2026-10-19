import React, { useState, useEffect } from 'react';
import { Heart, Save, CheckCircle, Calendar, MapPin, DollarSign, FileText } from 'lucide-react';
import { formatRupiah } from '../api/client';

export default function Profile({ profile, onUpdateProfile }) {
  const [formData, setFormData] = useState({
    bride_name: '',
    groom_name: '',
    wedding_date: '',
    location: '',
    total_budget: 0,
    target_savings: 0,
    notes: '',
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        bride_name: profile.bride_name || '',
        groom_name: profile.groom_name || '',
        wedding_date: profile.wedding_date || '',
        location: profile.location || '',
        total_budget: profile.total_budget || 0,
        target_savings: profile.target_savings || 0,
        notes: profile.notes || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateProfile({
        ...formData,
        total_budget: parseFloat(formData.total_budget) || 0,
        target_savings: parseFloat(formData.target_savings) || 0,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan profil: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Decorative Title Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-rose-50 text-rose-500 mb-1">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-800">
          Sampul &amp; Informasi Pengantin
        </h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto">
          Atur informasi kedua mempelai, tanggal sakral pernikahan, lokasi venue utama, dan sasaran anggaran.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Profil pernikahan berhasil diperbarui!</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mempelai Wanita */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>👰 Nama Mempelai Wanita</span>
            </label>
            <input
              type="text"
              required
              value={formData.bride_name}
              onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
              placeholder="Masukkan nama mempelai wanita"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-slate-800"
            />
          </div>

          {/* Mempelai Pria */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🤵 Nama Mempelai Pria</span>
            </label>
            <input
              type="text"
              required
              value={formData.groom_name}
              onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
              placeholder="Masukkan nama mempelai pria"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-slate-800"
            />
          </div>

          {/* Tanggal Pernikahan */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span>Tanggal Pernikahan (Hari-H)</span>
            </label>
            <input
              type="date"
              required
              value={formData.wedding_date}
              onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-slate-800"
            />
          </div>

          {/* Lokasi Acara */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Lokasi Acara / Venue</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Contoh: Sasana Kriya Ballroom, TMII, Jakarta"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-slate-800"
            />
          </div>

          {/* Total Anggaran */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>Total Alokasi Anggaran (Rp)</span>
            </label>
            <input
              type="number"
              value={formData.total_budget}
              onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-slate-800"
            />
            <p className="text-[11px] text-slate-400">{formatRupiah(formData.total_budget)}</p>
          </div>

          {/* Target Tabungan */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>Target Total Tabungan Bersama (Rp)</span>
            </label>
            <input
              type="number"
              value={formData.target_savings}
              onChange={(e) => setFormData({ ...formData, target_savings: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-medium text-slate-800"
            />
            <p className="text-[11px] text-slate-400">{formatRupiah(formData.target_savings)}</p>
          </div>
        </div>

        {/* Catatan / Tema */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Catatan Khusus / Konsep Pernikahan</span>
          </label>
          <textarea
            rows="4"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Contoh: Konsep nuansa Warm Champagne & White Rose. Busana adat saat akad dan internasional saat resepsi."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm text-slate-800 resize-none"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-sm shadow-md shadow-rose-200 active:scale-95 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Profil Pernikahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
