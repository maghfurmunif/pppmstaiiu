
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  FlaskConical, HeartHandshake, Settings, 
  Bell, FileText, Activity, Layers, Search, Filter,
  Globe, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { penelitianService } from '@/src/services/penelitianService';

// Lazy load dosen sections
const PenelitianDosen = lazy(() => import('./sections/PenelitianDosen'));
const PengabdianDosen = lazy(() => import('./sections/PengabdianDosen'));
const DosenDokumentasi = lazy(() => import('./sections/DosenDokumentasi'));
const ProfileSection = lazy(() => import('../shared/ProfileSection'));

export default function DosenDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menus = [
    { id: 'overview', name: 'Dashboard', path: '/dashboard/dosen', icon: LayoutDashboard },
    { id: 'penelitian', name: 'Penelitian', path: '/dashboard/dosen/penelitian', icon: FlaskConical },
    { id: 'pengabdian', name: 'Pengabdian', path: '/dashboard/dosen/pengabdian', icon: HeartHandshake },
    { id: 'jurnal', name: 'Jurnal STAIU', path: 'https://jurnal.staiiu.ac.id', icon: Globe, external: true },
    { id: 'dokumentasi', name: 'Dokumentasi', path: '/dashboard/dosen/dokumentasi', icon: Layers },
    { id: 'settings', name: 'Profil Saya', path: '/dashboard/dosen/profile', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold italic">STAI</div>
          <span className="font-black text-xs uppercase tracking-widest italic text-slate-900">Dosen Portal</span>
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
                  menu.external ? (
                    <a key={menu.id} href={menu.path} target="_blank" rel="noreferrer" className="flex items-center space-x-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-[0.2em] text-white/40 hover:text-white">
                      <menu.icon size={18} />
                      <span>{menu.name}</span>
                    </a>
                  ) : (
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
                  )
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
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Dosen Portal</div>
             <div className="h-1 w-8 bg-primary mt-1 rounded-full"></div>
          </div>
          <div className="space-y-1 overflow-y-auto side-scrollbar pr-2">
            {menus.map((menu) => (
              menu.external ? (
                <a 
                  key={menu.id} 
                  href={menu.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-white/50"
                >
                   <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
                    <menu.icon size={16} />
                   </div>
                   <span>{menu.name}</span>
                </a>
              ) : (
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
              )
            ))}
          </div>
          
          <div className="mt-auto pt-6 space-y-3">
            <div className="p-4 bg-slate-900 rounded-[24px] flex items-center space-x-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold italic shadow-md shrink-0">D</div>
              <div className="overflow-hidden">
                <div className="text-[10px] font-black text-white truncate">{localStorage.getItem('user_name') || 'Dosen Academic'}</div>
                <div className="text-[9px] font-bold text-primary uppercase tracking-tighter">Academic Faculty</div>
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
              <span>LOGOUT</span>
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
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Authorizing Faculty Access...</p>
            </div>
          }>
            <Routes>
              <Route index element={<DosenOverview />} />
              <Route path="penelitian" element={<PenelitianDosen />} />
              <Route path="pengabdian" element={<PengabdianDosen />} />
              <Route path="dokumentasi" element={<DosenDokumentasi />} />
              <Route path="profile" element={<ProfileSection />} />
              <Route path="*" element={<div className="card p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">Section Under Development</div>} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function DosenOverview() {
  const navigate = useNavigate();
  return (
     <div className="space-y-10">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Active Session 2024/2025</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Halo, <span className="text-primary italic">{localStorage.getItem('user_name') || 'Dosen'}</span> 👋</h1>
          <p className="text-slate-500 font-medium">Lacak penelitian, pengabdian, dan publikasi ilmiah Anda dalam satu dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { title: 'Penelitian Dosen', desc: 'Kelola proposal dan hasil riset.', icon: FlaskConical, path: 'penelitian' },
             { title: 'Pengabdian Masyarakat', desc: 'Monitoring aktivitas pengabdian.', icon: HeartHandshake, path: 'pengabdian' },
             { title: 'Arsip Dokumentasi', desc: 'Simpan semua karya ilmiah Anda.', icon: Layers, path: 'dokumentasi' },
           ].map((card, i) => (
             <div 
               key={i} 
               onClick={() => navigate(card.path)}
               className="card p-8 group hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden h-full flex flex-col justify-between"
             >
                <div className="relative z-10 space-y-4">
                   <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-primary transition-all">
                      <card.icon size={24} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold italic tracking-tighter uppercase underline decoration-primary/30 underline-offset-4">{card.title}</h3>
                      <p className="text-sm font-medium text-slate-400">{card.desc}</p>
                   </div>
                </div>
                <div className="pt-8 relative z-10 flex items-center text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform">
                   <span>Kelola Sekarang</span>
                   <ChevronRight size={14} className="ml-1" />
                </div>
                <card.icon size={160} className="absolute -right-12 -bottom-12 text-slate-50 opacity-20 -rotate-12 group-hover:rotate-0 transition-transform" />
             </div>
           ))}
        </div>
     </div>
  );
}
