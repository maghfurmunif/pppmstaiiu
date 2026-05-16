import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, UserCheck, BookOpen, GraduationCap, ArrowLeft, Loader2, ArrowRight, LogOut, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Suspense, lazy, useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';

// Lazy load sub-sections for performance
const KKNSection = lazy(() => import('./sections/KKNSection'));
const SemproSection = lazy(() => import('./sections/SemproSection'));
const SkripsiSection = lazy(() => import('./sections/SkripsiSection'));

export default function MahasiswaDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || 'User';
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  const menus = [
    { id: 'overview', name: 'Dashboard', path: '/dashboard/mahasiswa', icon: LayoutDashboard },
    { id: 'kkn-pribadi', name: 'KKN Pribadi', path: '/dashboard/mahasiswa/kkn', icon: Users },
    { id: 'kkn-mandiri', name: 'KKN Mandiri', path: '/dashboard/mahasiswa/kkn-mandiri', icon: Users },
    { id: 'sempro', name: 'Seminar Proposal', path: '/dashboard/mahasiswa/sempro', icon: BookOpen },
    { id: 'skripsi', name: 'Skripsi Pribadi', path: '/dashboard/mahasiswa/skripsi', icon: GraduationCap },
    { id: 'account', name: 'Akun Saya', path: '/dashboard/mahasiswa/account', icon: Users },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold italic">STAI</div>
          <span className="font-black text-xs uppercase tracking-widest italic text-slate-900">Student Portal</span>
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
                      location.pathname === menu.path ? "bg-primary text-white shadow-xl" : "text-white/40 hover:text-white"
                    )}
                  >
                    <menu.icon size={18} />
                    <span>{menu.name}</span>
                  </Link>
                ))}
             </div>
             <button 
                onClick={handleLogout}
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
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Student Portal</div>
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
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]" 
                    : "text-slate-400 hover:text-primary hover:bg-primary/5"
                )}
              >
                 <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    (location.pathname === menu.path)
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-400"
                 )}>
                   <menu.icon size={16} />
                 </div>
                <span>{menu.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-auto pt-6 space-y-3">
            <div className="p-4 bg-slate-900 rounded-[24px] flex items-center space-x-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold italic shadow-md shrink-0">M</div>
              <div className="overflow-hidden">
                <div className="text-[10px] font-black text-white truncate">{localStorage.getItem('user_name') || 'Ahmad Maghfur'}</div>
                <div className="text-[9px] font-bold text-primary uppercase tracking-tighter">Mahasiswa • PAI</div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
            >
              <LogOut size={14} />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Workspace...</p>
            </div>
          }>
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="kkn" element={<KKNSection type="REGULER" />} />
              <Route path="kkn-mandiri" element={<KKNSection type="MANDIRI" />} />
              <Route path="sempro" element={<SemproSection />} />
              <Route path="skripsi" element={<SkripsiSection />} />
              <Route path="account" element={<div className="card p-10 text-center text-slate-400">Account Settings Under Development</div>} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('logbooks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) setActivities(data);
    };
    fetchActivities();
  }, [userId]);

  const stats = [
    { label: 'KKN Progress', status: 'Active', color: 'primary', value: 25, icon: Users, path: '/dashboard/mahasiswa/kkn' },
    { label: 'Sempro Status', status: 'Idle', color: 'slate', value: 0, icon: BookOpen, path: '/dashboard/mahasiswa/sempro' },
    { label: 'Skripsi Phase', status: 'Locked', color: 'slate', value: 0, icon: GraduationCap, path: '/dashboard/mahasiswa/skripsi' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Academic Session 2024/2025</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Halo, <span className="text-primary italic">{localStorage.getItem('user_name') || 'Student'}</span> 👋</h1>
          <p className="text-slate-500 font-medium">Lacak progress akademik dan pengabdian Anda di sini.</p>
        </div>
      </div>

      {/* Stats ... same as before but maybe with real count if I had them */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="card p-8 group hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", 
                stat.color === 'primary' ? "bg-primary text-white shadow-primary/20" : 
                "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary")}>
                <stat.icon size={24} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Status</p>
                <p className="text-sm font-bold text-slate-900">{stat.status}</p>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-xl mb-4 tracking-tight relative z-10">{stat.label}</h3>
            <div className="space-y-3 relative z-10">
               <div className="flex justify-between items-end">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</span>
                 <span className="text-sm font-bold text-primary">{stat.value}%</span>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${stat.value}%` }}
                   transition={{ duration: 1, delay: 0.5 }}
                   className={cn("h-full", stat.color === 'primary' ? "bg-primary" : "bg-slate-300")}
                 />
               </div>
            </div>
            <ArrowRight className="absolute right-4 bottom-4 text-slate-100 group-hover:text-primary/20 transition-colors" size={64} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 italic">Timeline Aktivitas</h2>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Full History</button>
          </div>
          <div className="space-y-4">
             {activities.length === 0 ? (
               <div className="card p-10 text-center text-slate-400 italic text-xs">Belum ada aktivitas tercatat.</div>
             ) : (
               activities.map((activity, i) => (
                 <div key={i} className="card p-6 flex items-center space-x-5 hover:border-primary/20 transition-all cursor-pointer group">
                   <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-primary/10 text-primary")}>
                      <Users size={20} />
                   </div>
                   <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{activity.activity}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(activity.created_at).toLocaleDateString()}</p>
                   </div>
                   <ArrowRight size={16} className="text-slate-200 group-hover:text-primary transition-colors" />
                 </div>
               ))
             )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 italic">Verifikasi Berkas</h2>
          <div className="card p-8 bg-slate-900 text-white overflow-hidden relative">
             <div className="relative z-10 space-y-6">
                {[
                  { name: 'KTM Digital', checked: true },
                  { name: 'Transkrip Nilai (Lulus Kriteria)', checked: true },
                  { name: 'Sertifikat TOEFL/TOAFL', checked: false }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <span className="text-sm font-bold text-slate-300">{item.name}</span>
                     {item.checked ? (
                       <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                         <Check size={14} strokeWidth={4} />
                       </div>
                     ) : (
                       <div className="w-6 h-6 rounded-full border-2 border-slate-700" />
                     )}
                  </div>
                ))}
                <div className="pt-2">
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    Upload Missing Files
                  </button>
                </div>
             </div>
             <div className="absolute -right-10 -bottom-10 opacity-10">
                <BookOpen size={200} />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Check({ size, strokeWidth }: { size: number, strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
