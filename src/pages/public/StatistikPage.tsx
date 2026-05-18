import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, BarChart3, Globe, Download, ArrowLeft, Loader2, BookOpen, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicService } from '@/src/services/publicService';

export default function StatistikPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await publicService.getGlobalStats();
      setStats(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="container mx-auto max-w-6xl space-y-16">
        <div className="text-center space-y-4">
           <Link to="/" className="inline-flex items-center space-x-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} />
              <span>Kembali ke Beranda</span>
           </Link>
           <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">Laman Statistik</h1>
           <p className="text-slate-500 font-medium text-lg">Visualisasi data realtime manajemen akademik PPPM STAI Ihyaul Ulum.</p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
               <Loader2 className="animate-spin text-primary" size={40} />
               <p>Mengkalkulasi Data Sistem...</p>
            </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Mahasiswa', value: stats.mahasiswaCount, icon: Users, color: 'bg-blue-50 text-blue-500' },
                { label: 'Dosen Pembimbing', value: stats.dosenCount, icon: GraduationCap, color: 'bg-primary/10 text-primary' },
                { label: 'Penelitian Dosen', value: stats.penelitian, icon: FlaskConical, color: 'bg-rose-50 text-rose-500' },
                { label: 'Proyek KKN', value: stats.kkn, icon: Globe, color: 'bg-indigo-50 text-indigo-500' }
              ].map((item, i) => (
                <div key={i} className="card p-10 bg-white shadow-xl border-none flex flex-col items-center space-y-6 text-center group">
                   <div className={`w-16 h-16 ${item.color} rounded-[28px] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                      <item.icon size={30} />
                   </div>
                   <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
                      <p className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">{item.value}</p>
                   </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="card p-12 bg-white shadow-2xl border-none space-y-10">
                  <h3 className="text-2xl font-black text-slate-900 italic uppercase flex items-center tracking-tight">
                     <BarChart3 className="mr-3 text-primary" /> Rincian Aktivitas
                  </h3>
                  <div className="space-y-8">
                     {[
                       { label: 'Kuliah Kerja Nyata (KKN)', total: stats.kkn, progress: 'w-[85%]', color: 'bg-indigo-500' },
                       { label: 'Seminar Proposal (Sempro)', total: stats.sempro, progress: 'w-[70%]', color: 'bg-blue-500' },
                       { label: 'Skripsi Mahasiswa', total: stats.skripsi, progress: 'w-[92%]', color: 'bg-emerald-500' },
                       { label: 'Penelitian Dosen', total: stats.penelitian, progress: 'w-[65%]', color: 'bg-rose-500' }
                     ].map((row, i) => (
                       <div key={i} className="space-y-3">
                          <div className="flex justify-between items-end">
                             <span className="text-xs font-black uppercase tracking-widest text-slate-500">{row.label}</span>
                             <span className="text-xl font-black text-slate-900 italic">{row.total}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(row.total / (stats.totalActivity || 1)) * 100}%` }}
                               className={`h-full ${row.color}`} 
                             />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="card p-12 bg-slate-900 shadow-2xl border-none text-white overflow-hidden relative">
                  <div className="relative z-10 space-y-6">
                    <div className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Academic Transparency</div>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Integritas Data</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">Seluruh data yang ditampilkan bersifat realtime dan diambil langsung dari database terpusat STAI Ihyaul Ulum. Kami menjamin transparansi pelaporan akademik guna mendukung mutu pendidikan yang lebih baik.</p>
                     <div className="grid grid-cols-2 gap-6 pt-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                           <p className="text-3xl font-black italic tracking-tighter mb-1 text-primary">{stats.totalActivity}</p>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Record</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                           <p className="text-3xl font-black italic tracking-tighter mb-1 text-primary">{stats.activeUsers}</p>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">User Aktif</p>
                        </div>
                     </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/2 translate-y-1/2">
                     <Globe size={400} />
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
