import React, { useState } from 'react';
import { Armchair, Plus, Edit2, Trash2, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

export default function Tables({ tables, onAddTable, onUpdateTable, onDeleteTable }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    table_number: '',
    table_name: '',
    capacity: 8,
    notes: '',
  });

  const totalSeats = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const totalSeatedGuests = tables.reduce((acc, t) => {
    const guestsInTable = (t.guests || []).reduce((sum, g) => sum + (g.pax || 1), 0);
    return acc + guestsInTable;
  }, 0);
  const availableSeats = Math.max(0, totalSeats - totalSeatedGuests);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      table_number: `Meja ${tables.length + 1}`,
      table_name: `Meja ${tables.length + 1}`,
      capacity: 8,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      table_number: item.table_number,
      table_name: item.table_name || '',
      capacity: item.capacity || 8,
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      capacity: parseInt(formData.capacity) || 8,
    };
    if (editingItem) {
      await onUpdateTable(editingItem.id, payload);
    } else {
      await onAddTable(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Armchair className="w-6 h-6 text-rose-500" />
            <span>Denah Meja Tamu &amp; Kapasitas Kursi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur penempatan duduk per meja (Meja VIP, Keluarga Inti, Rekan Kampus, Kolega Kantor) agar resepsi tertib dan nyaman.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Meja</span>
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Meja Tersedia</span>
          <div className="text-xl font-bold text-slate-800 mt-1">{tables.length} Meja</div>
          <span className="text-[11px] text-slate-500">{totalSeats} Total Kursi</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tamu Teralokasi</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{totalSeatedGuests} Pax</div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {totalSeats > 0 ? Math.round((totalSeatedGuests / totalSeats) * 100) : 0}% Terisi
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase">Kursi Masih Kosong</span>
          <div className="text-xl font-bold text-blue-600 mt-1">{availableSeats} Kursi</div>
          <span className="text-[11px] text-slate-500">Siap dialokasikan</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400 text-sm">
            Belum ada denah meja. Klik "Tambah Meja" untuk mulai.
          </div>
        ) : (
          tables.map((table) => {
            const tableGuests = table.guests || [];
            const occupiedSeats = tableGuests.reduce((sum, g) => sum + (g.pax || 1), 0);
            const isFull = occupiedSeats >= table.capacity;
            const isOver = occupiedSeats > table.capacity;

            return (
              <div
                key={table.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:border-rose-200 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs font-mono">
                      {table.table_number}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isOver
                        ? 'bg-rose-100 text-rose-700'
                        : isFull
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {occupiedSeats} / {table.capacity} Kursi
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800">{table.table_name || table.table_number}</h3>
                  {table.notes && (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">{table.notes}</p>
                  )}

                  {/* Seated Guests List in Table */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Tamu yang Dialokasikan ({tableGuests.length}):
                    </span>
                    {tableGuests.length === 0 ? (
                      <p className="text-xs text-slate-300 italic py-1">Belum ada tamu di meja ini.</p>
                    ) : (
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {tableGuests.map((g) => (
                          <div
                            key={g.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 text-slate-700"
                          >
                            <span className="font-medium truncate max-w-[170px]">{g.name}</span>
                            <span className="text-[11px] font-semibold text-slate-500">{g.pax} Pax</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Sisa Kursi: <strong className="text-slate-600">{Math.max(0, table.capacity - occupiedSeats)}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(table)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                      title="Edit Meja"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus meja "${table.table_name || table.table_number}"?`)) {
                          onDeleteTable(table.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus Meja"
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
        title={editingItem ? 'Edit Meja' : 'Tambah Meja Tamu'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nomor / Label Meja</label>
              <input
                type="text"
                required
                placeholder="Contoh: Meja 1"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kapasitas Kursi</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama / Keterangan Meja</label>
            <input
              type="text"
              placeholder="Contoh: Meja VIP 1 - Keluarga Inti Pria"
              value={formData.table_name}
              onChange={(e) => setFormData({ ...formData, table_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Khusus tamu VIP dan sesepuh keluarga"
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
              Simpan Meja
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
