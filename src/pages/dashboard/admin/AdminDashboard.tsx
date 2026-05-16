import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart3, Users, BookOpen, GraduationCap, 
  FlaskConical, HeartHandshake, Settings, 
  Bell, FileText, Activity, Layers, Search, Filter,
  Globe, LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Suspense, lazy, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { kknService } from '@/src/services/kknService';

// Admin Sections
const AdminManagement = lazy(() => import('./sections/AdminManagement'));
const AdminKKN = lazy(() => import('./sections/AdminKKN'));
const AdminSempro = lazy(() => import('./sections/AdminSempro'));
const AdminSkripsi = lazy(() => import('./sections/AdminSkripsi'));
const AdminPenelitian = lazy(() => import('./sections/AdminPenelitian'));
const AdminPengabdian = lazy(() => import('./sections/AdminPengabdian'));
const AdminDokumentasi = lazy(() => import('./sections/AdminDokumentasi'));

export default function AdminDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const menus = [
    { id: 'overview', name: 'Dashboard', path: '/dashboard/admin', icon: BarChart3 },
    { id: 'kkn', name: 'Manajemen KKN', path: '/dashboard/admin/kkn', icon: Globe },
    { id: 'penelitian', name: 'Penelitian Dosen', path: '/dashboard/admin/penelitian', icon: FlaskConical },
    { id: 'pengabdian', name: 'Pengabdian Dosen', path: '/dashboard/admin/pengabdian', icon: HeartHandshake },
    { id: 'dokumentasi', name: 'Dokumentasi', path: '/dashboard/admin/dokumentasi', icon: FileText },
    { id: 'sempro', name: 'Seminar Proposal', path: '/dashboard/admin/sempro', icon: BookOpen },
    { id: 'skripsi', name: 'Skripsi Mahasiswa', path: '/dashboard/admin/skripsi', icon: GraduationCap },
    { id: 'users', name: 'Kelola Pengguna', path: '/dashboard/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold italic">STAI</div>
          <span className="font-black text-xs uppercase tracking-widest italic text-slate-900">Admin Panel</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-50 rounded-xl text-slate-900">
          {isMobileMenuOpen ? <Bell className="rotate-90" /> : <Layers />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 z-40 lg:hidden bg-slate-900 p-6 flex flex-col space-y-4"
          >
             <div className="flex justify-between items-center mb-10">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold italic">STAI</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white ring-1 ring-white/20 p-2 rounded-xl">Tutup</button>
             </div>
             <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {menus.map(menu => (
                  <Link 
                    key={menu.id} 
                    to={menu.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-[0.2em]",
                      location.pathname === menu.path ? "bg-white text-slate-900 shadow-xl" : "text-white/40 hover:text-white"
                    )}
                  >
                    <menu.icon size={18} />
                    <span>{menu.name}</span>
                  </Link>
                ))}
             </div>
             <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full py-5 bg-red-600/20 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Logout Sesi
             </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside className="w-72 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] p-6 z-20">
        <div className="glass-morphism h-full rounded-[32px] p-4 flex flex-col shadow-xl border-white/40">
          <div className="mb-6 px-4">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Admin Panel</div>
             <div className="h-1 w-8 bg-primary mt-1 rounded-full"></div>
          </div>
          <div className="space-y-1 overflow-y-auto side-scrollbar pr-2">
            {menus.map((menu) => (
              <Link 
                key={menu.id} 
                to={menu.path}
                className={cn(
                  "flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-widest",
                  (location.pathname === menu.path)
                    ? "bg-slate-900 text-white shadow-lg shadow-black/20 scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  (location.pathname === menu.path)
                    ? "bg-white/10 text-white"
                    : "bg-slate-100 text-slate-400"
                )}>
                  <menu.icon size={16} />
                </div>
                <span>{menu.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-auto pt-6 space-y-3">
            <div className="p-4 bg-primary rounded-[24px] flex items-center space-x-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-bold italic shadow-md shrink-0">A</div>
              <div className="overflow-hidden">
                <div className="text-[10px] font-black text-white truncate">Administrator</div>
                <div className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">Super Admin Control</div>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('user_role');
                localStorage.removeItem('user_name');
                window.location.href = '/';
              }}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
            >
              <LogOut size={14} />
              <span>Keluar Sesi Admin</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Authorizing Admin Access...</p>
            </div>
          }>
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="kkn" element={<AdminKKN />} />
              <Route path="penelitian" element={<AdminPenelitian />} />
              <Route path="pengabdian" element={<AdminPengabdian />} />
              <Route path="dokumentasi" element={<AdminDokumentasi />} />
              <Route path="sempro" element={<AdminSempro />} />
              <Route path="skripsi" element={<AdminSkripsi />} />
              <Route path="users" element={<div className="card p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">User Management Under Construction</div>} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function AdminOverview() {
  const [statsData, setStatsData] = useState({
    mahasiswa: 1240,
    penelitian: 45,
    kknAktif: 0,
    alerts: 0
  });

  useEffect(() => {
    const regs = kknService.getRegistrations();
    setStatsData(prev => ({
      ...prev,
      kknAktif: regs.filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length,
      alerts: regs.filter(r => r.status.includes('PENDING') || r.status === 'SUBMITTED').length
    }));
  }, []);

  const data = [
    { name: 'Jan', reports: 400 },
    { name: 'Feb', reports: 300 },
    { name: 'Mar', reports: 200 },
    { name: 'Apr', reports: 278 },
    { name: 'May', reports: 589 },
    { name: 'Jun', reports: 239 },
  ];

  const stats = [
    { label: 'Mahasiswa', value: statsData.mahasiswa.toLocaleString(), trend: '+12%', icon: Users },
    { label: 'Penelitian', value: statsData.penelitian.toString(), trend: '+2', icon: FlaskConical },
    { label: 'KKN Aktif', value: statsData.kknAktif.toString(), trend: `+${statsData.kknAktif}`, icon: Activity },
    { label: 'Alerts', value: statsData.alerts.toString(), trend: statsData.alerts > 0 ? '+!' : '0', icon: Bell },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>System Priority: Stable</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Main Console <span className="text-primary italic">Admin</span></h1>
          <p className="text-slate-500 font-medium">Monitoring sistem portal akademik secara menyeluruh.</p>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           Last sync: Just now
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card p-8 group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                <stat.icon size={20} />
              </div>
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", stat.trend.includes('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mb-1 uppercase italic">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 card p-10 h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-bold text-slate-900 italic flex items-center"><BarChart3 size={18} className="mr-2 text-primary" /> Statistik Pelaporan Digital</h3>
              <div className="flex space-x-2">
                {['6M', '1Y', 'ALL'].map(t => (
                  <button key={t} className="px-3 py-1 rounded-full text-[9px] font-black border border-slate-100 text-slate-400 hover:text-primary transition-colors">{t}</button>
                ))}
              </div>
            </div>
            <div className="flex-grow pr-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#88A47C" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#88A47C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} dx={-10} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold'}} />
                    <Area type="monotone" dataKey="reports" stroke="#88A47C" fillOpacity={1} fill="url(#colorReports)" strokeWidth={4} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-slate-900 italic">System Feed</h3>
            <div className="card p-8 space-y-8 max-h-[360px] overflow-y-auto side-scrollbar bg-slate-50 border-none shadow-inner">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="flex space-x-4 relative">
                    {i !== 6 && <div className="absolute left-[13px] top-8 bottom-[-24px] w-0.5 bg-slate-200" />}
                    <div className="w-7 h-7 rounded-full bg-white border-2 border-primary flex items-center justify-center shrink-0 z-10">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs font-bold text-slate-700">Dosen Hanafi <span className="font-medium text-slate-400 italic">mengunggah jurnal baru</span></p>
                       <p className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">10:42 AM • Research</p>
                    </div>
                 </div>
               ))}
            </div>
            <div className="card p-6 bg-slate-900 text-white text-center cursor-pointer hover:bg-slate-800 transition-colors">
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Full Audit Log</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
