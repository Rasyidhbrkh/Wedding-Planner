import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Search, CheckCircle2, XCircle, Clock, Gift, MessageCircle } from 'lucide-react';
import { formatRupiah } from '../api/client';
import Modal from '../components/Modal';

export const GUEST_CATEGORIES = [
  'Pihak Pria',
  'Pihak Wanita',
  'Keluarga',
  'VIP',
  'Teman',
  'Kolega',
  'Tetangga',
];

export const RSVP_STATUSES = [
  'Belum Konfirmasi',
  'Hadir',
  'Tidak Hadir',
];

export default function Guests({ 
  guests, 
  onAddGuest, 
  onUpdateGuest, 
  onToggleSouvenir, 
  onDeleteGuest,
  profile 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterRSVP, setFilterRSVP] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: GUEST_CATEGORIES[0],
    phone: '',
    pax: 1,
    rsvp_status: 'Belum Konfirmasi',
    table_number: '',
    gift_amount: 0,
    notes: '',
  });

  const totalGuests = guests.length;
  const totalPax = guests.reduce((acc, g) => acc + (g.pax || 0), 0);
  const attendingPax = guests.filter((g) => g.rsvp_status === 'Hadir').reduce((acc, g) => acc + (g.pax || 0), 0);
  const declinedPax = guests.filter((g) => g.rsvp_status === 'Tidak Hadir').reduce((acc, g) => acc + (g.pax || 0), 0);
  const pendingPax = guests.filter((g) => g.rsvp_status === 'Belum Konfirmasi').reduce((acc, g) => acc + (g.pax || 0), 0);
  const souvenirsCount = guests.filter((g) => g.souvenir_given).length;

  const filteredGuests = guests.filter((g) => {
    const matchesCategory = filterCategory === 'Semua' || g.category === filterCategory;
    const matchesRSVP = filterRSVP === 'Semua' || g.rsvp_status === filterRSVP;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.phone && g.phone.includes(searchQuery)) ||
      (g.table_number && g.table_number.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesRSVP && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: filterCategory !== 'Semua' ? filterCategory : GUEST_CATEGORIES[0],
      phone: '',
      pax: 1,
      rsvp_status: 'Belum Konfirmasi',
      table_number: '',
      gift_amount: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      phone: item.phone || '',
      pax: item.pax || 1,
      rsvp_status: item.rsvp_status || 'Belum Konfirmasi',
      table_number: item.table_number || '',
      gift_amount: item.gift_amount || 0,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      pax: parseInt(formData.pax) || 1,
      gift_amount: parseFloat(formData.gift_amount) || 0,
    };

    if (editingItem) {
      await onUpdateGuest(editingItem.id, {
        ...payload,
        souvenir_given: editingItem.souvenir_given,
      });
    } else {
      await onAddGuest({
        ...payload,
        souvenir_given: false,
      });
    }
    setIsModalOpen(false);
  };

  const handleSendWhatsApp = (guest) => {
    if (!guest.phone) {
      alert('Nomor HP tamu belum diisi.');
      return;
    }
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '62' + cleanPhone.slice(1);
    }
    const msg = encodeURIComponent(
      `Halo ${guest.name},\n\nKami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam momen bahagia pernikahan kami:\n\n💍 ${profile?.bride_name} & ${profile?.groom_name}\n📅 Tanggal: ${profile?.wedding_date}\n📍 Lokasi: ${profile?.location}\n\nMohon konfirmasi kehadiran (RSVP). Kehadiran dan doa restu Anda merupakan kehormatan terbesar bagi kami.`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-500" />
            <span>Daftar Tamu Undangan &amp; RSVP</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data undangan, kapasitas kursi (pax), status kehadiran (RSVP), pembagian souvenir, dan kirim pesan undangan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tamu</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Undangan</span>
          <div className="text-lg font-bold text-slate-800 mt-1">{totalGuests} <span className="text-xs font-normal text-slate-500">Nama</span></div>
          <span className="text-[11px] text-slate-500">{totalPax} Total Pax</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Konfirmasi Hadir</span>
          <div className="text-lg font-bold text-emerald-600 mt-1">{attendingPax} <span className="text-xs font-normal text-emerald-700">Pax</span></div>
          <span className="text-[11px] text-slate-500">
            {totalPax > 0 ? Math.round((attendingPax / totalPax) * 100) : 0}% dari total
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Belum Konfirmasi</span>
          <div className="text-lg font-bold text-amber-600 mt-1">{pendingPax} <span className="text-xs font-normal text-amber-700">Pax</span></div>
          <span className="text-[11px] text-slate-500">Menunggu kabar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Tidak Bisa Hadir</span>
          <div className="text-lg font-bold text-rose-600 mt-1">{declinedPax} <span className="text-xs font-normal text-rose-700">Pax</span></div>
          <span className="text-[11px] text-slate-500">Berhalangan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Souvenir Diberikan</span>
          <div className="text-lg font-bold text-indigo-600 mt-1">{souvenirsCount} <span className="text-xs font-normal text-slate-500">Tamu</span></div>
          <span className="text-[11px] text-slate-500">Serah terima di resepsi</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama tamu, no hp, meja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            {GUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* RSVP Filter */}
          <select
            value={filterRSVP}
            onChange={(e) => setFilterRSVP(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none"
          >
            <option value="Semua">Semua Status RSVP</option>
            {RSVP_STATUSES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 text-center">Souvenir</th>
                <th className="py-3 px-4">Nama Tamu</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">No. HP</th>
                <th className="py-3 px-4 text-center">Pax</th>
                <th className="py-3 px-4">Status RSVP</th>
                <th className="py-3 px-4">No. Meja</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Tidak ada data tamu yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const isHadir = guest.rsvp_status === 'Hadir';
                  const isDeclined = guest.rsvp_status === 'Tidak Hadir';
                  return (
                    <tr key={guest.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={guest.souvenir_given}
                          onChange={() => onToggleSouvenir(guest.id)}
                          className="rounded border-slate-300 text-rose-500 focus:ring-rose-400 w-4 h-4 cursor-pointer"
                          title="Tandai souvenir diterima"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{guest.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                          {guest.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{guest.phone || '—'}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">{guest.pax}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          isHadir
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDeclined
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isHadir ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isDeclined ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {guest.rsvp_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{guest.table_number || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{guest.notes || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {guest.phone && (
                            <button
                              onClick={() => handleSendWhatsApp(guest)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                              title="Kirim Undangan via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(guest)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus data tamu "${guest.name}"?`)) {
                                onDeleteGuest(guest.id);
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
        title={editingItem ? 'Edit Data Tamu' : 'Tambah Tamu Undangan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Tamu / Keluarga</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bpk. Budi & Rekan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kategori Hubungan</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
              >
                {GUEST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                placeholder="Contoh: 08123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Jumlah Pax (Kursi)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.pax}
                onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status Kehadiran (RSVP)</label>
              <select
                value={formData.rsvp_status}
                onChange={(e) => setFormData({ ...formData, rsvp_status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
              >
                {RSVP_STATUSES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor Meja / Alokasi</label>
              <input
                type="text"
                placeholder="Contoh: Meja 1 / Meja VIP"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Angpao / Hadiah (Opsional)</label>
              <input
                type="number"
                value={formData.gift_amount}
                onChange={(e) => setFormData({ ...formData, gift_amount: e.target.value })}
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
              placeholder="Contoh: Sahabat SMP, tempat duduk dekat panggung"
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
              Simpan Tamu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
