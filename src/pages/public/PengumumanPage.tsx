import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Tag, Megaphone, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicService, Announcement } from '@/src/services/publicService';

export default function PengumumanPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await publicService.getAnnouncements();
      setAnnouncements(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="container mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
           <Link to="/" className="inline-flex items-center space-x-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
              <ArrowLeft size={14} />
              <span>Kembali ke Beranda</span>
           </Link>
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Pengumuman Terkini</h1>
           <p className="text-slate-500 font-medium">Informasi resmi seputar kegiatan akademik dan pengabdian masyarakat.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : announcements.length === 0 ? (
          <div className="card p-20 text-center bg-white border-none shadow-xl rounded-[40px]">
             <Megaphone className="mx-auto text-slate-200 mb-6" size={60} />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Belum ada pengumuman untuk ditampilkan.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {announcements.map((ann, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={ann.id} 
                className="card p-10 bg-white hover:shadow-2xl transition-all border-none shadow-lg group"
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{ann.tag}</span>
                    <span className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <Calendar size={14} />
                       <span>{new Date(ann.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic group-hover:text-primary transition-colors">{ann.title}</h2>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                    {ann.content.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
