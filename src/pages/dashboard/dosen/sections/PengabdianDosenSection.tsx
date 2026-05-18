
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, Info, CheckCircle2, MapPin, HeartHandshake, 
  Calendar, ArrowRight, Loader2, Clock, AlertCircle, Camera
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { pengabdianService, PengabdianRegistration } from '@/src/services/pengabdianService';

export default function PengabdianDosenSection() {
  const [registration, setRegistration] = useState<PengabdianRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const data = await pengabdianService.getRegistrationByDosen(userId);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<{ proposal?: string, suratTugas?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (type: 'proposal' | 'suratTugas', file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setDocs(prev => ({ ...prev, [type]: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleEnroll = async () => {
    if (!userId || !docs.proposal) {
       setError('Silakan upload proposal terlebih dahulu.');
       return;
    }
    try {
      setError(null);
      setLoading(true);
      const newReg: PengabdianRegistration = {
        id: crypto.randomUUID(), 
        dosenId: userId,
        dosenName: localStorage.getItem('user_name') || 'Dosen',
        status: 'SUBMITTED',
        docs: { ...docs, suratTugas: docs.suratTugas || true, proposal: docs.proposal },
        logbooks: [],
        totalHours: 0
      };
      await pengabdianService.saveRegistration(newReg);
      
      const refreshed = await pengabdianService.getRegistrationByDosen(userId);
      setRegistration(refreshed || newReg);
    } catch (err: any) {
      console.error('Pengabdian enrollment error:', err);
      setError('Gagal mengajukan pengabdian. Pastikan tabel pengabdian_registrations sudah ada.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Pengabdian Masyarakat (Dosen)</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Pengabdian Dosen
          </h1>
          <p className="text-slate-500 font-medium">Monitoring dan pelaporan aktivitas pengabdian masyarakat Anda.</p>
        </div>
      </div>

      {!registration ? (
        <div className="grid lg:grid-cols-2 gap-10">
           <div className="card p-10 bg-slate-900 text-white space-y-8">
              <div className="space-y-2">
                 <h2 className="text-2xl font-black italic">Mulai Pengabdian</h2>
                 <p className="text-slate-400 text-sm">Ajukan program pengabdian Anda untuk mendapatkan Surat Tugas dan Monitoring berkala.</p>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-primary tracking-widest block mb-3">Upload Proposal Pengabdian (.PDF)</label>
                    <label className={cn(
                       "flex items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                       docs.proposal ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20"
                    )}>
                       <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload('proposal', e.target.files[0])} />
                       {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                        docs.proposal ? <CheckCircle2 className="text-primary" /> : <FileUp className="text-slate-500" />}
                    </label>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-black uppercase text-primary tracking-widest block mb-3">Upload Surat Tugas (Opsional)</label>
                    <label className={cn(
                       "flex items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                       docs.suratTugas ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20"
                    )}>
                       <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload('suratTugas', e.target.files[0])} />
                       {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                        docs.suratTugas ? <CheckCircle2 className="text-primary" /> : <FileUp className="text-slate-500" />}
                    </label>
                 </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 italic">
                  {error}
                </div>
              )}

              <button 
                onClick={handleEnroll} 
                disabled={loading || uploading || !docs.proposal}
                className="w-full btn-primary py-5 uppercase tracking-widest text-xs font-black disabled:opacity-20"
              >
                {loading ? 'Memproses...' : 'Ajukan Pengabdian'}
              </button>
           </div>
           
           <div className="card p-10 flex flex-col justify-center space-y-6">
              <h4 className="text-xl font-bold italic">Alur Pengabdian</h4>
              <ul className="space-y-6">
                 {[
                   "Upload Proposal & Berkas Kerjasama.",
                   "Verifikasi Admin & Penerbitan Surat Tugas.",
                   "Pelaksanaan Pengabdian.",
                   "Pengisian Logbook Mingguan (Min. 30 Jam).",
                   "Upload Laporan Akhir & Verifikasi."
                 ].map((t, i) => (
                   <li key={i} className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">{i+1}</div>
                      <p className="text-sm font-bold text-slate-600 h-8 flex items-center">{t}</p>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      ) : (
        <div className="space-y-10">
           <div className="card p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><HeartHandshake size={120} /></div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Status Pengabdian</p>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter mt-1">{registration.status.replace('_', ' ')}</h2>
              </div>
              <div className="text-right relative z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dosen Pengabdian</p>
                 <p className="font-bold text-white text-lg">{registration.dosenName}</p>
              </div>
           </div>

           {registration.status === 'SUBMITTED' && (
             <div className="card p-20 text-center border-dashed bg-white shadow-sm flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                   <Clock size={40} />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                   <h3 className="text-2xl font-black text-slate-900 italic uppercase">Menunggu Verifikasi Admin</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">Admin PPPM sedang memverifikasi berkas proposal dan surat tugas Anda. Harap tunggu hingga status berubah menjadi LOGBOOK.</p>
                </div>
             </div>
           )}

           {registration.status === 'LOGBOOK' && (
              <PengabdianLogbookSection registration={registration} />
           )}
        </div>
      )}
    </div>
  );
}

function PengabdianLogbookSection({ registration }: { registration: PengabdianRegistration }) {
   const [isAdding, setIsAdding] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [photo, setPhoto] = useState('');

   const handleAddLog = async (e: any) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const log = {
         id: crypto.randomUUID(),
         date: formData.get('date') as string,
         hours: parseInt(formData.get('hours') as string),
         nama: formData.get('nama') as string,
         pihakDesa: formData.get('pihakDesa') as string,
         statusPihakDesa: 'PENDING',
         status: 'PENDING',
         photo
      };
      
      const updated = {
         ...registration,
         logbooks: [log, ...(registration.logbooks || [])],
         totalHours: (registration.totalHours || 0) + log.hours
      };
      
      try {
         await pengabdianService.saveRegistration(updated as any);
         window.location.reload(); // Refresh to show new log
      } catch (e) { console.error(e); }
   };

   const handlePhoto = async (file: File) => {
      try {
        setUploading(true);
        const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
        const url = await uploadToCloudinary(file);
        setPhoto(url);
      } catch (e) { console.error(e); }
      finally { setUploading(false); }
   };

   return (
      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border shadow-sm">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter italic">Logbook Aktivitas</h3>
               <button onClick={() => setIsAdding(!isAdding)} className="btn-primary px-8 py-3 rounded-2xl shadow-lg">
                  {isAdding ? 'Tutup Form' : 'Tambah Entry'}
               </button>
            </div>

            {isAdding && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-10 bg-slate-900 text-white space-y-6">
                  <form onSubmit={handleAddLog} className="grid grid-cols-2 gap-6">
                     <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest">Nama Kegiatan</label>
                        <input name="nama" required className="input-field bg-white/5 border-white/10 text-white" placeholder="Contoh: Penyuluhan UMKM" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest">Tanggal</label>
                        <input name="date" type="date" required className="input-field bg-white/5 border-white/10 text-white" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest">Durasi (Jam)</label>
                        <input name="hours" type="number" required className="input-field bg-white/5 border-white/10 text-white" placeholder="0" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest">Pihak Desa Terkait</label>
                        <input name="pihakDesa" required className="input-field bg-white/5 border-white/10 text-white" placeholder="Nama Perangkat Desa" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-widest">Foto Dokumentasi</label>
                        <label className="flex items-center justify-center p-3 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                           <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                           {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                            photo ? <CheckCircle2 className="text-primary" /> : <Camera size={20} className="text-slate-400" />}
                        </label>
                     </div>
                     <button type="submit" className="col-span-2 btn-primary py-4 rounded-xl mt-4">Simpan Progress</button>
                  </form>
               </motion.div>
            )}

            <div className="space-y-4">
               {registration.logbooks?.map(log => (
                  <div key={log.id} className="card p-6 bg-white flex justify-between items-center hover:shadow-md transition-shadow">
                     <div className="flex items-center space-x-6">
                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl">
                           <Activity size={20} className="text-primary" />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900 italic tracking-tight">{log.nama}</h4>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{log.date} • {log.hours} Jam</p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-6 text-right">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Desa Verify</p>
                           <p className={cn("text-[10px] font-black", log.statusPihakDesa === 'VERIFIED' ? "text-green-500" : "text-orange-500")}>{log.statusPihakDesa}</p>
                        </div>
                        <div className={cn(
                           "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                           log.status === 'APPROVED' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                        )}>
                           {log.status}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <div className="card p-10 bg-slate-900 text-white text-center space-y-8 relative overflow-hidden shadow-2xl">
               <div className="absolute -top-10 -right-10 opacity-10"><Clock size={160} /></div>
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] relative z-10">Accumulated Hours</p>
               <div className="text-7xl font-black italic relative z-10">{registration.totalHours || 0}</div>
               <p className="text-xs text-slate-400 font-medium relative z-10">Minimal 30 jam pengabdian yang terverifikasi untuk masuk tahap pelaporan akhir.</p>
               <div className="h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (registration.totalHours / 30) * 100)}%` }} />
               </div>
            </div>
            
            <div className="card p-8 bg-slate-50 space-y-4 border-none shadow-inner">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Detail Informasi</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                     <span className="font-bold text-slate-500 flex items-center"> <MapPin size={14} className="mr-2" /> Lokasi</span>
                     <span className="font-black text-slate-900">{registration.info?.lokasi || 'Belum Ditentukan'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="font-bold text-slate-500 flex items-center"> <Users size={14} className="mr-2" /> Kelompok</span>
                     <span className="font-black text-slate-900">{registration.info?.kelompok || 'Belum Ditentukan'}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
