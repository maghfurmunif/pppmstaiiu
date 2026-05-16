import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Users, BarChart3, Globe, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user_role'));
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'MAHASISWA');
  const navigate = useNavigate();

  useEffect(() => {
    const savedRole = localStorage.getItem('user_role');
    if (savedRole) {
      navigate(`/dashboard/${savedRole.toLowerCase()}`);
      return;
    }

    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem('user_role'));
      setUserRole(localStorage.getItem('user_role') || 'MAHASISWA');
    };
    const interval = setInterval(checkLogin, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDashboardPath = () => `/dashboard/${userRole.toLowerCase()}`;

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[650px] overflow-hidden rounded-[40px] shadow-2xl mx-4 mt-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20 backdrop-blur-[2px]"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-center px-12 md:px-20 max-w-4xl space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span>Academic Excellence</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white leading-tight"
          >
            PPPM Digital <br />
            <span className="text-primary italic">Portal</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl"
          >
            Pusat Penelitian dan Pengabdian kepada Masyarakat STAI Ihyaul Ulum Gresik. 
            Mengintegrasikan penelitian inovatif dengan pengabdian berkelanjutan dalam satu platform digital.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link 
              to={isLoggedIn ? getDashboardPath() : "/register"} 
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center group"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md border border-white/30 shadow-lg transition-all">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Floating Stats Card */}
        <div className="absolute right-12 bottom-12 hidden lg:block">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-morphism p-8 rounded-[32px] space-y-6 w-80"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Realtime Activity</span>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700" />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white uppercase italic tracking-tighter">84 Active</p>
              <p className="text-slate-400 text-sm">Researchers currently online</p>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="card p-8 group hover:-translate-y-2 transition-all duration-500">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 group-hover:rotate-12 transition-transform">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Journal of Research</h3>
          <p className="text-slate-500 leading-relaxed text-sm">Access peer-reviewed articles and the latest scientific findings from our academic community.</p>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">2.4k Papers</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>

        <div className="card p-8 group hover:-translate-y-2 transition-all duration-500 bg-slate-900 shadow-slate-200">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
            <Globe size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Community Service</h3>
          <p className="text-slate-400 leading-relaxed text-sm">Join our initiatives to bridge academic knowledge with practical social impact in local communities through KKN programs.</p>
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">128 Projects</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>

        <div className="card p-8 group hover:-translate-y-2 transition-all duration-500">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 group-hover:-rotate-12 transition-transform">
            <BarChart3 size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Academic Archive</h3>
          <p className="text-slate-500 leading-relaxed text-sm">A centralized repository for student theses, field reports, and academic research data.</p>
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digitalized</span>
            <ArrowRight size={16} className="text-primary" />
          </div>
        </div>
      </section>

      {/* Stats and Announcements */}
      <section className="container mx-auto px-4 grid lg:grid-cols-3 gap-12 pt-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight italic">Portal Stats</h2>
            <div className="px-4 py-1.5 bg-slate-100 rounded-full text-slate-500 text-xs font-bold uppercase tracking-widest">Live Updates</div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Mahasiswa Aktif', value: '1.2k', sub: '+12 this month', icon: Users },
              { label: 'Dosen Pembimbing', value: '45', sub: 'Verified mentors', icon: GraduationCap },
              { label: 'Proyek KKN', value: '850', sub: 'Completed reports', icon: BarChart3 }
            ].map((stat, i) => (
              <div key={i} className="card p-8 border-none bg-slate-50 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                  <stat.icon size={20} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter mb-1 uppercase italic">{stat.value}</p>
                <p className="text-xs text-primary font-medium">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="card-gradient p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 italic">Ready to contribute?</h3>
              <p className="text-slate-600 max-w-lg">Bergabunglah dengan ribuan akademisi lainnya dalam membangun masa depan riset Indonesia yang lebih inklusif.</p>
              <div className="pt-4">
                <Link 
                  to={isLoggedIn ? getDashboardPath() : "/register"} 
                  className="btn-primary px-10 py-4 shadow-xl inline-block text-center"
                >
                  {isLoggedIn ? 'Go to Dashboard' : 'Join Research Team'}
                </Link>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 blur-xl">
              <Globe size={300} />
            </div>
          </div>
        </div>

        <div className="space-y-8 h-full">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight italic">Announcements</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { date: 'Oct 24', title: 'Pendaftaran KKN Semester Ganjil 2024', tag: 'Academic' },
              { date: 'Oct 20', title: 'Seminar Nasional Pengabdian Masyarakat', tag: 'Event' },
              { date: 'Oct 15', title: 'Workshop Penulisan Jurnal Internasional', tag: 'Workshop' },
              { date: 'Oct 10', title: 'Jadwal Skripsi dan Yudisium Gelombang 2', tag: 'Deadline' }
            ].map((item, i) => (
              <div key={i} className="card p-6 border-slate-100 hover:border-primary/30 transition-all flex group cursor-pointer">
                <div className="text-center pr-6 mr-6 border-r border-slate-100 min-w-[70px]">
                  <p className="text-lg font-bold text-slate-900 leading-none">{item.date.split(' ')[1]}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">{item.date.split(' ')[0]}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.tag}</span>
                  <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-primary transition-colors">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
