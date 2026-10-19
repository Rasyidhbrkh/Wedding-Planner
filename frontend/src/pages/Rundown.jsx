import React, { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, Printer, MapPin, User, FileText } from 'lucide-react';
import Modal from '../components/Modal';

export default function Rundown({ rundownItems, onAddRundown, onUpdateRundown, onDeleteRundown }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    time: '',
    activity: '',
    pic: '',
    location: '',
    notes: '',
    order_index: 0,
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      time: '',
      activity: '',
      pic: '',
      location: 'Gedung Utama',
      notes: '',
      order_index: rundownItems.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      time: item.time,
      activity: item.activity,
      pic: item.pic || '',
      location: item.location || '',
      notes: item.notes || '',
      order_index: item.order_index || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      order_index: parseInt(formData.order_index) || 0,
    };
    if (editingItem) {
      await onUpdateRundown(editingItem.id, payload);
    } else {
      await onAddRundown(payload);
    }
    setIsModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-500" />
            <span>Susunan Acara Hari-H (Rundown)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jadwal kegiatan menit demi menit pada hari pernikahan, penanggung jawab lapangan, dan lokasi acara.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / PDF</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Printable Title (visible when printed) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold font-serif text-slate-900">RUNDOWN ACARA PERNIKAHAN</h1>
        <p className="text-sm text-slate-600">Jadwal &amp; Susunan Acara Hari Bahagia</p>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {rundownItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Belum ada susunan acara. Klik "Tambah Jadwal" untuk membuat rundown.
            </div>
          ) : (
            rundownItems.map((item, idx) => (
              <div 
                key={item.id} 
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center shrink-0 w-24 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-mono font-bold text-xs text-center">
                    <span>{item.time}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-800">{item.activity}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {item.pic && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>PIC: <strong className="text-slate-700">{item.pic}</strong></span>
                        </span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.location}</span>
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-slate-400 italic">“{item.notes}”</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 print:hidden self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus jadwal "${item.activity}"?`)) {
                        onDeleteRundown(item.id);
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
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Jadwal Rundown' : 'Tambah Jadwal Acara'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Waktu (Jam)</label>
              <input
                type="text"
                required
                placeholder="Contoh: 09.00 - 10.15"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Urutan (Index)</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Kegiatan / Prosesi</label>
            <input
              type="text"
              required
              placeholder="Contoh: Prosesi Akad Nikah & Ijab Kabul"
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Penanggung Jawab (PIC)</label>
              <input
                type="text"
                placeholder="Contoh: Penghulu & Saksi"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lokasi / Ruangan</label>
              <input
                type="text"
                placeholder="Contoh: Meja Akad Ballroom"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan / Keterangan Khusus</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Saksi dari pihak pria Bpk. Subroto, pihak wanita Bpk. Harun"
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
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
