import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Users, BarChart3, Globe, GraduationCap, Landmark, Loader2, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { publicService, Announcement } from '@/src/services/publicService';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user_role'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'MAHASISWA');
  const [stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    const savedId = localStorage.getItem('user_id');
    if (savedRole && savedId && window.location.pathname === '/') {
      navigate(`/dashboard/${savedRole.toLowerCase()}`);
      return;
    }

    const fetchData = async () => {
      try {
        const [statsData, annData] = await Promise.all([
          publicService.getGlobalStats(),
          publicService.getAnnouncements()
        ]);
        setStats(statsData);
        setAnnouncements(annData);
      } catch (e) {
        console.error('Landing page fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('user_role'));
      setUserRole(localStorage.getItem('user_role') || 'MAHASISWA');
    };
    const interval = setInterval(checkLogin, 2000);
    return () => clearInterval(interval);
  }, []);

  const getDashboardPath = () => `/dashboard/${userRole.toLowerCase()}`;

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[650px] overflow-hidden rounded-[40px] shadow-2xl mx-4 mt-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-slate-900/10 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-12 md:px-20 max-w-4xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black tracking-[0.3em] uppercase"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]"></span>
            <span>Digital Research Hub</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter"
          >
            Portal Digital <br />
            <span className="text-primary italic underline underline-offset-8 decoration-white/30">PPPM</span> STAI <br />
            <span className="text-white/80">Ihyaul Ulum</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-100 text-lg md:text-xl font-medium leading-relaxed max-w-2xl drop-shadow-lg"
          >
            Pusat Penelitian dan Pengabdian kepada Masyarakat STAI Ihyaul Ulum Gresik. 
            Digitalisasi manajemen akademik untuk masa depan yang lebih inovatif.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link 
              to={isLoggedIn ? getDashboardPath() : "/register"} 
              className="px-10 py-5 bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105 active:scale-95 flex items-center group"
            >
              {isLoggedIn ? 'Buka Dashboard' : 'Mari Bergabung'}
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
          </motion.div>
        </div>

        {/* Floating Stats Card - Real Liked Data */}
        <div className="absolute right-12 bottom-12 hidden lg:block">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[40px] space-y-6 w-85 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/60 font-black uppercase tracking-widest text-[10px]">Realtime Activity</span>
              <div className="flex items-center space-x-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                 <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Global Node Sync</span>
              </div>
            </div>
            <div className="space-y-1">
              {loading ? (
                <Loader2 className="animate-spin text-primary" />
              ) : (
                <>
                  <p className="text-4xl font-black text-white uppercase italic tracking-tighter">{stats?.totalActivity || 0} Aktif</p>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Aktivitas Terdaftar Sistem</p>
                </>
              )}
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                className="h-full bg-primary" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="card p-10 group hover:-translate-y-2 transition-all duration-500 border-none bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
          <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-500 mb-6 group-hover:rotate-12 transition-transform shadow-inner">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Penelitian Dosen</h3>
          <p className="text-slate-500 leading-relaxed text-sm font-medium">Akses dan kelola publikasi ilmiah, penelitian inovatif, dan karya akademik dosen dalam satu wadah.</p>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stats?.penelitian || 0} Terdaftar</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>

        <div className="card p-10 group hover:-translate-y-2 transition-all duration-500 bg-slate-900 shadow-2xl shadow-indigo-200 border-none">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase italic">Pengabdian KKN</h3>
          <p className="text-slate-400 leading-relaxed text-sm font-medium">Jembatani pengetahuan akademik dengan dampak sosial langsung bagi masyarakat melalui program KKN.</p>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stats?.kkn || 0} Proyek</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>

        <div className="card p-10 group hover:-translate-y-2 transition-all duration-500 border-none bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 group-hover:-rotate-12 transition-transform shadow-inner">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight uppercase italic">Tugas Akhir</h3>
          <p className="text-slate-500 leading-relaxed text-sm font-medium">Manajemen Seminar Proposal dan Skripsi yang efektif guna mempercepat kelulusan mahasiswa.</p>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digitalized</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>
      </section>

      {/* Stats and Announcements */}
      <section className="container mx-auto px-4 grid lg:grid-cols-3 gap-16 pt-12 items-start">
        <div className="lg:col-span-2 space-y-16">
          <div className="flex items-center justify-between border-b border-slate-100 pb-8">
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Laman Statistik</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Data Realtime dari Database Supabase</p>
            </div>
            <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">Live Sync</div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: 'Mahasiswa', value: stats?.mahasiswaCount || 0, sub: 'Terverifikasi', color: 'bg-blue-50 text-blue-500', icon: Users },
              { label: 'Dosen', value: stats?.dosenCount || 0, sub: 'Pembimbing Aktif', color: 'bg-primary/10 text-primary', icon: GraduationCap },
              { label: 'Total Aktivitas', value: stats?.totalActivity || 0, sub: 'KKN, Skripsi, Riset', color: 'bg-orange-50 text-orange-500', icon: BarChart3 }
            ].map((stat, i) => (
              <div key={i} className="card p-10 border-none bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all group">
                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter mb-1 uppercase italic">{stat.value}</p>
                <div className="flex items-center space-x-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card bg-slate-900 p-12 shadow-3xl relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Collaboration</div>
              <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Bergabung dengan Kami</h3>
              <p className="text-slate-400 max-w-lg font-medium">Berdampingan membangun ekosistem akademik yang unggul dan berkontribusi nyata bagi bangsa.</p>
              <div className="pt-6">
                <Link 
                  to={isLoggedIn ? getDashboardPath() : "/register"} 
                  className="px-12 py-5 bg-primary hover:bg-primary-dark text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 inline-block transition-all hover:scale-105 active:scale-95"
                >
                  {isLoggedIn ? 'Buka Dashboard' : 'Daftar Sekarang'}
                </Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 blur-xl group-hover:scale-110 transition-transform duration-1000">
              <Globe size={400} className="text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-end justify-between border-b border-slate-100 pb-8">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Pengumuman</h2>
             <Link to="/pengumuman" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Semua</Link>
          </div>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 side-scrollbar">
            {announcements.length === 0 ? (
               <div className="card p-10 text-center border-dashed border-2">
                  <Calendar className="mx-auto text-slate-200 mb-4" size={40} />
                  <p className="text-xs text-slate-300 font-black uppercase tracking-widest">Belum ada pengumuman</p>
               </div>
            ) : (
              announcements.map((item, i) => (
                <div key={i} className="card p-8 border-slate-100 hover:border-primary/30 transition-all flex group cursor-pointer bg-white">
                  <div className="text-center pr-8 mr-8 border-r border-slate-100 min-w-[80px]">
                    <p className="text-2xl font-black text-slate-900 leading-none">{new Date(item.created_at).getDate()}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black mt-2 tracking-widest">{new Date(item.created_at).toLocaleString('id-ID', { month: 'short' })}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-100">{item.tag}</span>
                    <p className="text-base font-black text-slate-800 leading-tight group-hover:text-primary transition-colors italic uppercase">{item.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

