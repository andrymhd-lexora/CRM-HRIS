import React from 'react';
import { Users, Target, CircleDollarSign, CheckSquare, UserPlus, X } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: 'contact' | 'lead' | 'deal' | 'task' | 'employee') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">Quick Add Menu</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => onSelect('employee')}
            className="w-full p-3 bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200/80 hover:border-indigo-300 rounded-2xl flex items-center gap-3 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-indigo-950">Buka HRIS / Karyawan Baru</div>
              <div className="text-[10px] text-indigo-600 font-medium">Sistem Kepegawaian & Presensi</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('contact')}
            className="w-full p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 rounded-2xl flex items-center gap-3 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Tambah Kontak Baru</div>
              <div className="text-[10px] text-slate-500">Database pelanggan & partner</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('lead')}
            className="w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 rounded-2xl flex items-center gap-3 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Tambah Lead Baru</div>
              <div className="text-[10px] text-slate-500">Prospek & kualifikasi lead</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('deal')}
            className="w-full p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 rounded-2xl flex items-center gap-3 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Tambah Deal Baru</div>
              <div className="text-[10px] text-slate-500">Peluang transaksi sales pipeline</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('task')}
            className="w-full p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 rounded-2xl flex items-center gap-3 transition-all group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Tambah Task Baru</div>
              <div className="text-[10px] text-slate-500">Agenda follow-up & deadline</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
