import React, { useState } from 'react';
import { PipelineStage } from '../types/crm';
import { SlidersHorizontal, Plus, Trash2, CheckCircle2, Target, CircleDollarSign } from 'lucide-react';

interface PipelineConfigViewProps {
  pipelineStages: PipelineStage[];
  onAddStage: (module: 'leads' | 'deals', stageName: string, color: string) => void;
  onDeleteStage: (id: any) => void;
}

export const PipelineConfigView: React.FC<PipelineConfigViewProps> = ({
  pipelineStages,
  onAddStage,
  onDeleteStage
}) => {
  const [newLeadStage, setNewLeadStage] = useState('');
  const [newLeadColor, setNewLeadColor] = useState('#3B82F6');

  const [newDealStage, setNewDealStage] = useState('');
  const [newDealColor, setNewDealColor] = useState('#0D9488');

  const leadStages = pipelineStages
    .filter((s) => s.module === 'leads')
    .sort((a, b) => a.order - b.order);

  const dealStages = pipelineStages
    .filter((s) => s.module === 'deals')
    .sort((a, b) => a.order - b.order);

  const handleAddLeadStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadStage.trim()) return;
    onAddStage('leads', newLeadStage.trim(), newLeadColor);
    setNewLeadStage('');
  };

  const handleAddDealStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealStage.trim()) return;
    onAddStage('deals', newDealStage.trim(), newDealColor);
    setNewDealStage('');
  };

  const colorPresets = [
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#16A34A', // Green
    '#0D9488', // Teal
    '#EF4444'  // Red
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <span>Pipeline Configuration</span>
        </h2>
        <p className="text-xs text-slate-500">
          Kustomisasi tahapan (stages) dan warna identitas untuk Leads Pipeline dan Deals Pipeline.
        </p>
      </div>

      {/* Grid: Lead Stages & Deal Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads Pipeline Stages */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Lead Pipeline Stages</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              {leadStages.length} Stage
            </span>
          </div>

          <div className="space-y-2">
            {leadStages.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs font-extrabold text-slate-800">{s.stageName}</span>
                </div>

                <button
                  onClick={() => s.id && onDeleteStage(s.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus Stage"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Lead Stage Form */}
          <form onSubmit={handleAddLeadStage} className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Tambah Stage Baru (Leads)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newLeadStage}
                onChange={(e) => setNewLeadStage(e.target.value)}
                placeholder="Nama stage..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                + Tambah
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 mr-1">Warna:</span>
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewLeadColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    newLeadColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </form>
        </div>

        {/* Deals Pipeline Stages */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-teal-600" />
              <span>Deal Pipeline Stages</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
              {dealStages.length} Stage
            </span>
          </div>

          <div className="space-y-2">
            {dealStages.map((s, idx) => (
              <div
                key={s.id || idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs font-extrabold text-slate-800">{s.stageName}</span>
                </div>

                <button
                  onClick={() => s.id && onDeleteStage(s.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus Stage"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Deal Stage Form */}
          <form onSubmit={handleAddDealStage} className="pt-3 border-t border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Tambah Stage Baru (Deals)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newDealStage}
                onChange={(e) => setNewDealStage(e.target.value)}
                placeholder="Nama stage..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                + Tambah
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 mr-1">Warna:</span>
              {colorPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewDealColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    newDealColor === c ? 'scale-125 ring-2 ring-teal-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
