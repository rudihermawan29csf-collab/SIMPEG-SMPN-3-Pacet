import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../types';
import { mockDataService } from '../services/mockService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    mockDataService.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8">Memuat data dashboard...</div>;

  const chartData = [
    { name: 'PNS', value: stats.totalPNS },
    { name: 'PPPK', value: stats.totalPPPK },
    { name: 'Honorer', value: stats.totalHonorer },
  ];

  const StatCard = ({ title, value, icon: Icon, color, desc }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">{desc}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Ringkasan data kepegawaian SMPN 3 Pacet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pegawai" 
          value={stats.totalEmployees} 
          icon={Users} 
          color="bg-blue-500" 
          desc="Termasuk Guru & Staf"
        />
        <StatCard 
          title="Dokumen Lengkap" 
          value={`${stats.documentsUploaded}`} 
          icon={FileCheck} 
          color="bg-emerald-500" 
          desc="File terverifikasi"
        />
        <StatCard 
          title="Belum Lengkap" 
          value="12" 
          icon={AlertCircle} 
          color="bg-amber-500" 
          desc="Perlu tindak lanjut"
        />
        <StatCard 
          title="Keaktifan" 
          value="98%" 
          icon={TrendingUp} 
          color="bg-indigo-500" 
          desc="Bulan ini"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-6">Status Kepegawaian</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Informasi Penting</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-medium text-blue-800 text-sm">Pembaruan Sistem</h4>
              <p className="text-blue-600 text-xs mt-1">
                Mohon lengkapi SK Penugasan terbaru sebelum tanggal 30 bulan ini.
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h4 className="font-medium text-amber-800 text-sm">Validasi Data</h4>
              <p className="text-amber-600 text-xs mt-1">
                Admin sedang melakukan verifikasi berkas sertifikasi.
              </p>
            </div>
            <div className="mt-4">
                <button className="w-full py-2 px-4 bg-slate-50 text-slate-600 rounded-lg text-sm hover:bg-slate-100 transition-colors">
                    Lihat Pengumuman Lainnya
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
