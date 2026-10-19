import React, { useState } from 'react';
import { WalletCards, Plus, Edit2, Trash2, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../api/client';
import Modal from '../components/Modal';

export const BUDGET_CATEGORIES = [
  '🏛️ Venue / Gedung',
  '🍽️ Katering',
  '📸 Fotografi & Videografi',
  '💐 Dekorasi & Bunga',
  '👰 Busana Pengantin',
  '💄 Rias & Hair Do',
  '✉️ Undangan & Souvenir',
  '🎶 Musik / Hiburan',
  '🎤 MC & Among Tamu',
  '📄 Dokumen & Administrasi',
  '💍 Cincin Pernikahan',
  '🚗 Transportasi',
  '🏨 Akomodasi Tamu',
  '✈️ Bulan Madu',
  '✨ Lain-lain',
];

export default function Budget({ budgetItems, totalBudget, onAddBudget, onUpdateBudget, onDeleteBudget }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: BUDGET_CATEGORIES[0],
    name: '',
    estimated_cost: 0,
    actual_cost: 0,
    paid_amount: 0,
    notes: '',
  });

  const filteredItems = selectedCategory === 'Semua'
    ? budgetItems
    : budgetItems.filter((i) => i.category === selectedCategory);

  const totalEstimated = budgetItems.reduce((acc, i) => acc + (i.estimated_cost || 0), 0);
  const totalPaid = budgetItems.reduce((acc, i) => acc + (i.paid_amount || 0), 0);
  const totalRemaining = Math.max(0, totalBudget - totalEstimated);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      category: selectedCategory !== 'Semua' ? selectedCategory : BUDGET_CATEGORIES[0],
      name: '',
      estimated_cost: 0,
      actual_cost: 0,
      paid_amount: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      estimated_cost: item.estimated_cost,
      actual_cost: item.actual_cost,
      paid_amount: item.paid_amount,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      estimated_cost: parseFloat(formData.estimated_cost) || 0,
      actual_cost: parseFloat(formData.actual_cost) || 0,
      paid_amount: parseFloat(formData.paid_amount) || 0,
    };

    if (editingItem) {
      await onUpdateBudget(editingItem.id, payload);
    } else {
      await onAddBudget(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-rose-500" />
            <span>Anggaran &amp; Biaya Pernikahan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rincian alokasi biaya per sektor, pembayaran termin (DP/Lunas), dan sisa anggaran.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Biaya</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Anggaran Pagu</span>
          <div className="text-xl font-bold text-slate-800 mt-2">{formatRupiah(totalBudget)}</div>
          <span className="text-[11px] text-slate-500">Batas anggaran yang ditetapkan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Estimasi Biaya</span>
          <div className="text-xl font-bold text-amber-600 mt-2">{formatRupiah(totalEstimated)}</div>
          <span className="text-[11px] text-slate-500">{budgetItems.length} Pos Pengeluaran</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sudah Dibayarkan</span>
          <div className="text-xl font-bold text-emerald-600 mt-2">{formatRupiah(totalPaid)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {totalEstimated > 0 ? Math.round((totalPaid / totalEstimated) * 100) : 0}% Terbayar
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Pagu Anggaran</span>
          <div className="text-xl font-bold text-blue-600 mt-2">{formatRupiah(totalRemaining)}</div>
          <span className="text-[11px] text-slate-500">Cadangan / Surplus dana</span>
        </div>
      </div>

      {/* Category Filter Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('Semua')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === 'Semua'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua ({budgetItems.length})
        </button>
        {BUDGET_CATEGORIES.map((cat) => {
          const count = budgetItems.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Nama Item / Vendor</th>
                <th className="py-3 px-4">Estimasi Biaya</th>
                <th className="py-3 px-4">Sudah Dibayar</th>
                <th className="py-3 px-4">Sisa Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Tidak ada item pengeluaran pada kategori ini.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLunas = item.status === 'Lunas';
                  const isDP = item.status === 'DP';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">{item.category}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{formatRupiah(item.estimated_cost)}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">{formatRupiah(item.paid_amount)}</td>
                      <td className="py-3.5 px-4 font-semibold text-rose-600">{formatRupiah(item.remaining)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          isLunas
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDP
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isLunas ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
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
                              if (window.confirm(`Hapus item ${item.name}?`)) {
                                onDeleteBudget(item.id);
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
        title={editingItem ? 'Edit Item Anggaran' : 'Tambah Item Anggaran'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kategori Sektor</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
            >
              {BUDGET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Item / Vendor</label>
            <input
              type="text"
              required
              placeholder="Contoh: Paket Katering 500 Pax"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estimasi Biaya (Rp)</label>
              <input
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sudah Dibayar (Rp)</label>
              <input
                type="number"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
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
              placeholder="Contoh: Pembayaran termin ke-1 via transfer BCA"
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
              Simpan Item
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
