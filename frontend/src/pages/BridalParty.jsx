import React, { useState } from 'react';
import { Flower2, Plus, Edit2, Trash2, Phone, Shirt, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export const BRIDAL_ROLES = [
  'Maid of Honor',
  'Best Man',
  'Bridesmaid',
  'Groomsman',
  'Among Tamu',
  'Panitia Keluarga',
  'Penerima Tamu / Souvenir',
];

export const OUTFIT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Custom'];

export default function BridalParty({ bridalParty, onAddMember, onUpdateMember, onDeleteMember }) {
  const [filterRole, setFilterRole] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    role: BRIDAL_ROLES[0],
    name: '',
    phone: '',
    main_task: '',
    outfit_size: 'M',
    notes: '',
  });

  const filteredMembers = filterRole === 'Semua'
    ? bridalParty
    : bridalParty.filter((m) => m.role.toLowerCase().includes(filterRole.toLowerCase()));

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      role: BRIDAL_ROLES[0],
      name: '',
      phone: '',
      main_task: '',
      outfit_size: 'M',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      role: item.role,
      name: item.name,
      phone: item.phone || '',
      main_task: item.main_task || '',
      outfit_size: item.outfit_size || 'M',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      await onUpdateMember(editingItem.id, formData);
    } else {
      await onAddMember(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Flower2 className="w-6 h-6 text-rose-500" />
            <span>Pendamping Pengantin &amp; Panitia Acara</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data Maid of Honor, Best Man, Bridesmaids, Groomsmen, Among Tamu, ukuran seragam busana, dan tugas utama.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {/* Role Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['Semua', 'Bridesmaid', 'Groomsman', 'Among Tamu', 'Panitia'].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filterRole === r
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400 text-sm">
            Belum ada data anggota pendamping. Klik "Tambah Anggota" untuk mencatat.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-semibold text-[11px]">
                    {member.role}
                  </span>
                  {member.outfit_size && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      <Shirt className="w-3 h-3 text-slate-500" />
                      <span>Ukuran: {member.outfit_size}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-800">{member.name}</h3>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition mt-1"
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{member.phone}</span>
                    </a>
                  )}
                </div>

                {member.main_task && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <strong className="text-slate-700 font-semibold block text-[10px] uppercase tracking-wider">
                      Tugas Utama:
                    </strong>
                    <p className="leading-relaxed">{member.main_task}</p>
                  </div>
                )}

                {member.notes && (
                  <p className="text-[11px] text-slate-400 italic">“{member.notes}”</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus ${member.name} dari daftar pendamping?`)) {
                      onDeleteMember(member.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Anggota Pendamping' : 'Tambah Anggota Pendamping'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Peran / Tugas</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
              >
                {BRIDAL_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ukuran Baju / Seragam</label>
              <select
                value={formData.outfit_size}
                onChange={(e) => setFormData({ ...formData, outfit_size: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
              >
                {OUTFIT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Contoh: Citra Kirana"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">No. HP / WhatsApp</label>
            <input
              type="text"
              placeholder="Contoh: 081299990001"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tugas Utama</label>
            <textarea
              rows="2"
              value={formData.main_task}
              onChange={(e) => setFormData({ ...formData, main_task: e.target.value })}
              placeholder="Contoh: Mendampingi mempelai wanita, menjaga buket bunga dan riasan"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan</label>
            <input
              type="text"
              placeholder="Contoh: Seragam warna Peach Terracotta"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
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
