import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, ArrowLeft, Loader2, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicService, Guide } from '@/src/services/publicService';

export default function PanduanPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await publicService.getGuides();
      setGuides(data);
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
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Pusat Panduan</h1>
           <p className="text-slate-500 font-medium">Download SOP, Modul, dan dokumen petunjuk sistem lainnya.</p>
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : guides.length === 0 ? (
          <div className="card p-20 text-center bg-white border-none shadow-xl rounded-[40px]">
             <BookOpen className="mx-auto text-slate-200 mb-6" size={60} />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Belum ada panduan yang dipublikasi.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {guides.map((guide, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={guide.id} 
                className="card p-8 bg-white hover:shadow-2xl transition-all border-none shadow-lg group flex flex-col md:flex-row items-center justify-between gap-8"
              >
                <div className="flex items-center space-x-8">
                   <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-500 group-hover:bg-primary group-hover:text-white transition-all shadow-inner shrink-0 leading-none">
                      <FileText size={36} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic group-hover:text-primary transition-colors">{guide.title}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(guide.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                   </div>
                </div>
                <a 
                  href={guide.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full md:w-auto px-10 py-5 bg-slate-900 hover:bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center space-x-3 transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                   <Download size={16} />
                   <span>Download PDF</span>
                </a>
              </motion.div>
            ))}
          </div>
        )}

        <div className="card p-10 bg-indigo-50 border-indigo-100 border-2 rounded-[40px] flex items-start space-x-6 text-indigo-900 mt-12">
           <HelpCircle className="text-indigo-500 shrink-0" size={32} />
           <div className="space-y-2">
              <h4 className="font-black uppercase tracking-widest text-sm">Butuh Bantuan Lebih Lanjut?</h4>
              <p className="text-sm font-medium leading-relaxed opacity-70">Jika Anda tidak menemukan panduan yang dicari atau mengalami kendala dalam mengunduh dokumen, silakan hubungi tim administrasi PPPM melalui Call Center yang tertera di bagian bawah halaman ini.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
