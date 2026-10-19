import React, { useState } from 'react';
import { CheckSquare, Plus, Edit2, Trash2, Calendar, User, CheckCircle2, Clock } from 'lucide-react';
import Modal from '../components/Modal';

export const CHECKLIST_PHASES = [
  'H-12 bulan',
  'H-10 bulan',
  'H-9 bulan',
  'H-8 bulan',
  'H-6 bulan',
  'H-5 bulan',
  'H-4 bulan',
  'H-3 bulan',
  'H-2 bulan',
  'H-1 bulan',
  'H-2 minggu',
  'H-1 minggu',
  'H-1 hari',
  'Hari-H',
  'H+1 minggu',
  'H+1 bulan',
];

export default function Checklist({ checklistItems, onToggleChecklist, onAddChecklist, onUpdateChecklist, onDeleteChecklist }) {
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    phase: CHECKLIST_PHASES[0],
    task: '',
    pic: 'Kedua Mempelai',
    due_date: '',
    notes: '',
  });

  const totalTasks = checklistItems.length;
  const completedTasks = checklistItems.filter((t) => t.is_completed).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredItems = checklistItems.filter((item) => {
    const matchesFilter =
      filterStatus === 'Semua' ||
      (filterStatus === 'Selesai' && item.is_completed) ||
      (filterStatus === 'Belum' && !item.is_completed);

    const matchesSearch =
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.pic && item.pic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.phase.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Group by phase
  const grouped = filteredItems.reduce((acc, item) => {
    if (!acc[item.phase]) acc[item.phase] = [];
    acc[item.phase].push(item);
    return acc;
  }, {});

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      phase: CHECKLIST_PHASES[0],
      task: '',
      pic: 'Kedua Mempelai',
      due_date: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      phase: item.phase,
      task: item.task,
      pic: item.pic || '',
      due_date: item.due_date || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      await onUpdateChecklist(editingItem.id, {
        ...formData,
        is_completed: editingItem.is_completed,
      });
    } else {
      await onAddChecklist({
        ...formData,
        is_completed: false,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-rose-500" />
            <span>Checklist &amp; Timeline Persiapan</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dari H-12 bulan hingga sebulan setelah Hari-H — pantau semua kewajiban agar tidak ada yang terlewat.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm shadow-rose-200 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Progress & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs md:col-span-1 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase">Kemajuan Tugas</span>
            <span className="font-bold text-emerald-600">{percentage}% Selesai</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {completedTasks} <span className="text-sm font-normal text-slate-500">/ {totalTasks} Selesai</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs md:col-span-2 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari tugas, penanggung jawab, atau fase..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            {['Semua', 'Belum', 'Selesai'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterStatus === st
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grouped Checklist */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-400 text-sm">
            Tidak ada tugas yang sesuai dengan pencarian atau filter.
          </div>
        ) : (
          Object.entries(grouped).map(([phase, items]) => {
            const phaseDone = items.filter((i) => i.is_completed).length;
            return (
              <div key={phase} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-800">{phase}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-medium">
                      {phaseDone}/{items.length} Selesai
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 flex items-start justify-between gap-4 transition ${
                        item.is_completed ? 'bg-emerald-50/30' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={item.is_completed}
                          onChange={() => onToggleChecklist(item.id)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <p className={`text-xs font-medium leading-relaxed ${
                            item.is_completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}>
                            {item.task}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            {item.pic && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>PIC: <strong className="text-slate-700">{item.pic}</strong></span>
                              </span>
                            )}
                            {item.due_date && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Tenggat: {item.due_date}</span>
                              </span>
                            )}
                            {item.notes && (
                              <span className="text-slate-400 italic">“{item.notes}”</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus tugas "${item.task}"?`)) {
                              onDeleteChecklist(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
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
        title={editingItem ? 'Edit Tugas Checklist' : 'Tambah Tugas Checklist'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Fase Waktu (Timeline H-)</label>
            <select
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm bg-white"
            >
              {CHECKLIST_PHASES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Uraian Tugas / Tindakan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Booking vendor katering & uji rasa"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Penanggung Jawab (PIC)</label>
              <input
                type="text"
                placeholder="Contoh: Mempelai Wanita / WO"
                value={formData.pic}
                onChange={(e) => setFormData({ ...formData, pic: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Tanggal Selesai</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Contoh: Bawa contoh konsep dekorasi saat meeting"
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
              Simpan Tugas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
