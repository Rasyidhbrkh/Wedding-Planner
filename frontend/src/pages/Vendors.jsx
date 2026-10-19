import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Phone, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../api/client';
import Modal from '../components/Modal';

export const VENDOR_CATEGORIES = [
  'Venue / Gedung',
  'Katering',
  'Dekorasi & Bunga',
  'Fotografi & Video',
  'Make Up & Busana',
  'Musik & Sound',
  'MC & Host',
  'Undangan & Souvenir',
  'Wedding Organizer (WO)',
  'Bulan Madu',
  'Lain-lain',
];

export const VENDOR_STATUSES = [
  'Belum Booking',
  'Diskusi / Penawaran',
  'DP',
  'Lunas',
  'Selesai',
];

export default function Vendors({ vendors, onAddVendor, onUpdateVendor, onDeleteVendor }) {
  const [filterCat, setFilterCat] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    category: VENDOR_CATEGORIES[0],
    name: '',
    contact: '',
    deal_price: 0,
    paid_amount: 0,
    status: 'Belum Booking',
    notes: '',
  });

  const filteredVendors = filterCat === 'Semua' 
    ? vendors 
    : vendors.filter((v) => v.category === filterCat);

  const totalDeal = vendors.reduce((acc, v) => acc + (v.deal_price || 0), 0);
  const totalPaid = vendors.reduce((acc, v) => acc + (v.paid_amount || 0), 0);
  const totalRemaining = Math.max(0, totalDeal - totalPaid);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      category: filterCat !== 'Semua' ? filterCat : VENDOR_CATEGORIES[0],
      name: '',
      contact: '',
      deal_price: 0,
      paid_amount: 0,
      status: 'Belum Booking',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      contact: item.contact || '',
      deal_price: item.deal_price,
      paid_amount: item.paid_amount,
      status: item.status,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      deal_price: parseFloat(formData.deal_price) || 0,
      paid_amount: parseFloat(formData.paid_amount) || 0,
    };
    if (editingItem) {
      await onUpdateVendor(editingItem.id, payload);
    } else {
      await onAddVendor(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-rose-500" />
            <span>Daftar Vendor Pernikahan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Lacak status kontrak deal, pembayaran uang muka (DP), pelunasan, dan kontak penanggung jawab vendor.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Vendor</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Nilai Deal</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{formatRupiah(totalDeal)}</div>
          <span className="text-[11px] text-slate-500">{vendors.length} Vendor Rekanan</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Sudah Dibayarkan</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatRupiah(totalPaid)}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Uang muka &amp; termin</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Sisa Tagihan</span>
          <div className="text-xl font-bold text-rose-600 mt-1">{formatRupiah(totalRemaining)}</div>
          <span className="text-[11px] text-slate-500">Kewajiban pelunasan</span>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterCat('Semua')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            filterCat === 'Semua'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Semua ({vendors.length})
        </button>
        {VENDOR_CATEGORIES.map((c) => {
          const count = vendors.filter((v) => v.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filterCat === c
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {c} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400 text-sm">
            Tidak ada vendor pada kategori ini.
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const isLunas = vendor.status === 'Lunas' || vendor.status === 'Selesai';
            const isDP = vendor.status === 'DP';
            return (
              <div 
                key={vendor.id} 
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-semibold">
                      {vendor.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isLunas
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isDP
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isLunas ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {vendor.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 leading-snug">{vendor.name}</h3>

                  {vendor.contact && (
                    <a
                      href={`tel:${vendor.contact}`}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.contact}</span>
                    </a>
                  )}

                  {vendor.notes && (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      “{vendor.notes}”
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Harga Deal:</span>
                    <strong className="text-slate-800">{formatRupiah(vendor.deal_price)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sudah Dibayar:</span>
                    <strong className="text-emerald-600">{formatRupiah(vendor.paid_amount)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sisa Tagihan:</span>
                    <strong className="text-rose-600">{formatRupiah(vendor.remaining)}</strong>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus vendor "${vendor.name}"?`)) {
                          onDeleteVendor(vendor.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Vendor' : 'Tambah Vendor Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kategori Vendor</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
            >
              {VENDOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Vendor</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sasana Kriya Ballroom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kontak / No. Telepon / WA</label>
              <input
                type="text"
                placeholder="Contoh: 081234567890"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status Kontrak</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
              >
                {VENDOR_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Harga Kesepakatan Deal (Rp)</label>
              <input
                type="number"
                value={formData.deal_price}
                onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sudah Dibayar / DP (Rp)</label>
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
              placeholder="Contoh: PIC: Ibu Ratna, pelunasan H-7 hari"
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
              Simpan Vendor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
