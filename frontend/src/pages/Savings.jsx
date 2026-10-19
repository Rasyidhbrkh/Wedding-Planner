import React, { useState } from 'react';
import { PiggyBank, Plus, Edit2, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { formatRupiah } from '../api/client';
import Modal from '../components/Modal';

export default function Savings({ savings, targetSavings, onAddSavings, onUpdateSavings, onDeleteSavings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    month_number: 1,
    month_year: '',
    target_amount: 4000000,
    groom_saved: 0,
    bride_saved: 0,
    notes: '',
  });

  const totalCollected = savings.reduce((acc, s) => acc + (s.total_saved || 0), 0);
  const groomTotal = savings.reduce((acc, s) => acc + (s.groom_saved || 0), 0);
  const brideTotal = savings.reduce((acc, s) => acc + (s.bride_saved || 0), 0);
  const remaining = Math.max(0, targetSavings - totalCollected);
  const percentage = targetSavings > 0 ? Math.round((totalCollected / targetSavings) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      month_number: savings.length + 1,
      month_year: '',
      target_amount: 4000000,
      groom_saved: 0,
      bride_saved: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      month_number: item.month_number,
      month_year: item.month_year,
      target_amount: item.target_amount,
      groom_saved: item.groom_saved,
      bride_saved: item.bride_saved,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      month_number: parseInt(formData.month_number) || 1,
      target_amount: parseFloat(formData.target_amount) || 0,
      groom_saved: parseFloat(formData.groom_saved) || 0,
      bride_saved: parseFloat(formData.bride_saved) || 0,
    };

    if (editingItem) {
      await onUpdateSavings(editingItem.id, payload);
    } else {
      await onAddSavings(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-rose-500" />
            <span>Tabungan Pernikahan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rencanakan dan catat komitmen menabung tiap bulan antara calon mempelai pria &amp; wanita.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bulan Tabungan</span>
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Total</span>
          <div className="text-xl font-bold text-slate-800 mt-2">{formatRupiah(targetSavings)}</div>
          <span className="text-[11px] text-slate-500">Sasaran dana pernikahan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Terkumpul</span>
          <div className="text-xl font-bold text-emerald-600 mt-2">{formatRupiah(totalCollected)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{percentage}% Tercapai</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ditabung Oleh Pria</span>
          <div className="text-xl font-bold text-blue-600 mt-2">{formatRupiah(groomTotal)}</div>
          <span className="text-[11px] text-slate-500">Mempelai Pria</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ditabung Oleh Wanita</span>
          <div className="text-xl font-bold text-pink-600 mt-2">{formatRupiah(brideTotal)}</div>
          <span className="text-[11px] text-slate-500">Mempelai Wanita</span>
        </div>
      </div>

      {/* Progress Bar Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">Kemajuan Tabungan Menuju Hari-H</span>
          <span className="font-bold text-rose-600">{percentage}% (Sisa {formatRupiah(remaining)})</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Monthly Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Bulan Ke-</th>
                <th className="py-3 px-4">Bulan / Tahun</th>
                <th className="py-3 px-4">Target (Rp)</th>
                <th className="py-3 px-4">Ditabung Pria</th>
                <th className="py-3 px-4">Ditabung Wanita</th>
                <th className="py-3 px-4">Total Ditabung</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {savings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Belum ada data tabungan bulanan. Klik "Tambah Bulan Tabungan" untuk mulai.
                  </td>
                </tr>
              ) : (
                savings.map((item) => {
                  const isDone = item.status === 'Tercapai';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-700">#{item.month_number}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{item.month_year}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatRupiah(item.target_amount)}</td>
                      <td className="py-3.5 px-4 font-semibold text-blue-600">{formatRupiah(item.groom_saved)}</td>
                      <td className="py-3.5 px-4 font-semibold text-pink-600">{formatRupiah(item.bride_saved)}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{formatRupiah(item.total_saved)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          isDone 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{item.notes || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus catatan tabungan bulan ${item.month_year}?`)) {
                                onDeleteSavings(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Tabungan Bulanan' : 'Tambah Tabungan Bulanan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bulan Ke-</label>
              <input
                type="number"
                required
                value={formData.month_number}
                onChange={(e) => setFormData({ ...formData, month_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Bulan / Tahun</label>
              <input
                type="text"
                required
                placeholder="Contoh: November 2026"
                value={formData.month_year}
                onChange={(e) => setFormData({ ...formData, month_year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Target Menabung Bulan Ini (Rp)</label>
            <input
              type="number"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ditabung Oleh Pria (Rp)</label>
              <input
                type="number"
                value={formData.groom_saved}
                onChange={(e) => setFormData({ ...formData, groom_saved: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ditabung Oleh Wanita (Rp)</label>
              <input
                type="number"
                value={formData.bride_saved}
                onChange={(e) => setFormData({ ...formData, bride_saved: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Pembayaran DP venue dan souvenir"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-sm shadow-rose-200"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
