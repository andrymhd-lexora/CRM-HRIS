import React from 'react';
import { Deal, Lead, Contact, Task, PipelineStage } from '../types/crm';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle2,
  Users
} from 'lucide-react';

interface AnalyticsViewProps {
  deals: Deal[];
  leads: Lead[];
  contacts: Contact[];
  tasks: Task[];
  pipelineStages: PipelineStage[];
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  deals,
  leads,
  contacts,
  tasks,
  pipelineStages,
  currency
}) => {
  const { language, t, formatCurrency: formatMoney } = useLanguage();

  // 1. Deals Stage Data for Bar Chart
  const dealStagesList = pipelineStages
    .filter((s) => s.module === 'deals')
    .sort((a, b) => a.order - b.order);

  const stageChartData = dealStagesList.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage.stageName);
    const totalVal = stageDeals.reduce((acc, d) => acc + (d.value || 0), 0);
    return {
      name: stage.stageName,
      count: stageDeals.length,
      value: totalVal
    };
  });

  // 2. Lead Sources Pie Chart Data
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const src = l.source || (language === 'id' ? 'Lainnya' : 'Other');
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const sourcePieData = Object.keys(sourceCounts).map((key) => ({
    name: key,
    value: sourceCounts[key]
  }));

  const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#16A34A', '#0D9488'];

  // KPIs
  const totalDeals = deals.length;
  const wonDeals = deals.filter((d) => d.stage === 'Closed Won');
  const totalWonRevenue = wonDeals.reduce((acc, d) => acc + (d.value || 0), 0);
  const avgDealSize = totalDeals > 0 ? Math.round(deals.reduce((acc, d) => acc + (d.value || 0), 0) / totalDeals) : 0;

  const closedDealsCount = deals.filter((d) => d.stage === 'Closed Won' || d.stage === 'Closed Lost').length;
  const winRate = closedDealsCount > 0 ? Math.round((wonDeals.length / closedDealsCount) * 100) : 0;

  const completedTasksCount = tasks.filter((tItem) => tItem.status === 'Done' || tItem.status === 'Completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <span>{t.analytics.title}</span>
        </h2>
        <p className="text-xs text-slate-500">
          {t.analytics.subtitle}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.analytics.totalRevenue}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatMoney(totalWonRevenue, currency)}
          </div>
          <p className="text-[10px] font-semibold text-emerald-600">
            {wonDeals.length} {language === 'id' ? 'deal berhasil closed won' : 'deals closed won'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.analytics.winRate}</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{winRate}%</div>
          <p className="text-[10px] font-semibold text-purple-600">
            {wonDeals.length} {language === 'id' ? `won dari ${closedDealsCount} closed` : `won from ${closedDealsCount} closed`}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.analytics.avgDealValue}</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatMoney(avgDealSize, currency)}
          </div>
          <p className="text-[10px] font-semibold text-blue-600">
            {language === 'id' ? 'Rata-rata nilai per deal' : 'Average value per deal'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{t.analytics.taskCompletion}</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{taskCompletionRate}%</div>
          <p className="text-[10px] font-semibold text-teal-600">
            {completedTasksCount} {language === 'id' ? `dari ${tasks.length} task selesai` : `of ${tasks.length} tasks completed`}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Stage Revenue Bar Chart */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>{t.analytics.stageDistribution}</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Stage Value ({currency})</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val: number) => [formatMoney(val, currency), 'Total Value']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <span>{t.analytics.leadSources}</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {leads.length} {language === 'id' ? 'Total Leads' : 'Total Leads'}
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {sourcePieData.length === 0 ? (
              <div className="text-center text-slate-400 text-xs">
                {language === 'id' ? 'Belum ada data lead source' : 'No lead source data available'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourcePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourcePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
