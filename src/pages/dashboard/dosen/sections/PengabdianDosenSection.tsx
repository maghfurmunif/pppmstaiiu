import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, Info, CheckCircle2, MapPin, HeartHandshake, 
  Calendar, ArrowRight, Loader2, Clock, AlertCircle, Camera,
  Activity, Users, Trash2, Send, Download, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { pengabdianService, PengabdianRegistration } from '@/src/services/pengabdianService';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function PengabdianDosenSection() {
  const [registration, setRegistration] = useState<PengabdianRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const data = await pengabdianService.getRegistrationByDosen(userId);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<{ proposal?: string, suratTugas?: string }>({});

  const handleUpload = async (type: 'proposal' | 'suratTugas', file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setDocs(prev => ({ ...prev, [type]: url }));
      toast.success(`${type === 'proposal' ? 'Proposal' : 'Surat Tugas'} terupload`);
    } catch (e) {
      toast.error('Gagal upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleEnroll = async () => {
    if (!userId || !docs.proposal) {
       return toast.error('Silakan upload proposal terlebih dahulu.');
    }
    try {
      setActionLoading(true);
      const newReg: PengabdianRegistration = {
        id: crypto.randomUUID(), 
        dosenId: userId,
        dosenName: localStorage.getItem('user_name') || 'Dosen',
        status: 'SUBMITTED',
        docs: { ...docs, suratTugas: docs.suratTugas, proposalFile: docs.proposal },
        logbooks: [],
        totalHours: 0
      };
      await pengabdianService.saveRegistration(newReg);
      const refreshed = await pengabdianService.getRegistrationByDosen(userId);
      setRegistration(refreshed || newReg);
      toast.success('Pengabdian berhasil diajukan!');
    } catch (err: any) {
      toast.error('Gagal mengajukan pengabdian');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p>Syncing Community Services...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Community Outreach Portal</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Pengabdian Dosen
          </h1>
          <p className="text-slate-500 font-medium">Monitoring dan pelaporan aktivitas pengabdian masyarakat Anda.</p>
        </div>
        {registration && (
          <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Current Status</span>
             <StatusBadge status={registration.status} />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
      {!registration ? (
        <motion.div 
          key="enroll"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="grid lg:grid-cols-2 gap-10"
        >
           <div className="card p-10 bg-slate-900 text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12"><HeartHandshake size={200} /></div>
              <div className="space-y-2 relative z-10">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase">Mulai Program Pengabdian</h2>
                 <p className="text-slate-400 text-sm font-medium">Ajukan program pengabdian Anda untuk mendapatkan Surat Tugas dan pendataan aktivitas.</p>
              </div>

              <div className="space-y-6 relative z-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-primary tracking-[0.25em] block pl-1">Proposal Dokument (PDF)</label>
                    <label className={cn(
                       "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer transition-all group",
                       docs.proposal ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}>
                       <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload('proposal', e.target.files[0])} disabled={uploading} />
                       {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                        docs.proposal ? <div className="flex flex-col items-center space-y-2 text-primary">
                          <CheckCircle2 size={32} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Proposal Uploaded</span>
                        </div> : <div className="flex flex-col items-center space-y-2 text-slate-500 group-hover:text-slate-300">
                          <FileUp size={32} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Select PDF File</span>
                        </div>}
                    </label>
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-primary tracking-[0.25em] block pl-1">Surat Tugas Akademik (PDF) <span className="opacity-40 italic font-medium ml-1">Optional</span></label>
                    <label className={cn(
                       "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[32px] cursor-pointer transition-all group",
                       docs.suratTugas ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}>
                       <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleUpload('suratTugas', e.target.files[0])} disabled={uploading} />
                       {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                        docs.suratTugas ? <div className="flex flex-col items-center space-y-2 text-primary">
                          <CheckCircle2 size={32} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Assigment Task Uploaded</span>
                        </div> : <div className="flex flex-col items-center space-y-2 text-slate-500 group-hover:text-slate-300">
                          <FileUp size={32} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Select Assignment File</span>
                        </div>}
                    </label>
                 </div>
              </div>

              <button 
                onClick={handleEnroll} 
                disabled={actionLoading || uploading || !docs.proposal}
                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center relative z-10"
              >
                {actionLoading ? <Loader2 className="animate-spin" /> : 'Kirim Pengajuan Pengabdian'}
              </button>
           </div>
           
           <div className="card p-12 bg-white flex flex-col justify-center space-y-8 border-slate-100">
              <h4 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 border-b border-slate-100 pb-4">Timeline & SOP</h4>
              <ul className="space-y-4">
                 {[
                   "Pengajuan Proposal Kerjasama Desa/Mitra.",
                   "Verifikasi PPPM & Penerbitan Surat Tugas Formal.",
                   "Pelaksanaan Aktivitas Pengabdian di Lapangan.",
                   "Monitoring via Logbook Mingguan (Min. 30 Jam).",
                   "Submit Laporan Akhir & Luaran Pengabdian."
                 ].map((t, i) => (
                   <li key={i} className="flex items-start space-x-6 group">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-slate-100">{i+1}</div>
                      <p className="text-sm font-bold text-slate-600 leading-tight pt-2.5">{t}</p>
                   </li>
                 ))}
              </ul>
           </div>
        </motion.div>
      ) : (
        <motion.div 
          key="active"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
           <div className="card p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-10"><HeartHandshake size={120} /></div>
              <div className="relative z-10 space-y-1">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Program Profile</p>
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter mt-1">{registration.dosenName}</h2>
                 <div className="flex items-center space-x-4 mt-4">
                    <StatusBadge status={registration.status} className="bg-white/10 border-white/20 text-white" />
                    <span className="text-[10px] font-black text-slate-400">ID: {registration.id.slice(0, 8)}</span>
                 </div>
              </div>
              <div className="text-right relative z-10 hidden md:block">
                 <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assignment Docs</p>
                    <button onClick={() => window.open(registration.docs?.proposalFile, '_blank')} className="text-xs font-black text-primary hover:underline flex items-center">
                      <Download size={14} className="mr-1" /> View Proposal
                    </button>
                 </div>
              </div>
           </div>

           {registration.status === 'SUBMITTED' && (
             <div className="card p-20 text-center border-dashed border-2 bg-white flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-primary shadow-inner">
                   <Clock size={40} className="animate-pulse" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                   <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Queue: Verification</h3>
                   <p className="text-slate-500 font-medium leading-relaxed">Admin PPPM sedang meninjau kelayakan program pengabdian Anda. Anda akan diarahkan ke tahap logbook setelah divalidasi.</p>
                </div>
                <button onClick={() => window.location.reload()} className="btn-primary py-2 px-8 text-[10px] bg-slate-100 text-slate-900 border border-slate-200 shadow-none">Check sync status...</button>
             </div>
           )}

           {registration.status === 'LOGBOOK' && (
              <PengabdianLogbookSection registration={registration} />
           )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function PengabdianLogbookSection({ registration }: { registration: PengabdianRegistration }) {
   const [isAdding, setIsAdding] = useState(false);
   const [uploading, setUploading] = useState(false);
   const [photo, setPhoto] = useState('');
   const [actionLoading, setActionLoading] = useState(false);

   const handleAddLog = async (e: any) => {
      e.preventDefault();
      try {
         setActionLoading(true);
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
         
         await pengabdianService.saveRegistration(updated as any);
         toast.success('Logbook tersimpan!');
         window.location.reload(); 
      } catch (e) { 
         toast.error('Gagal menyimpan logbook');
      } finally {
         setActionLoading(false);
      }
   };

   const handlePhoto = async (file: File) => {
      try {
        setUploading(true);
        const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
        const url = await uploadToCloudinary(file);
        setPhoto(url);
        toast.success('Foto dokumentasi terunggah');
      } catch (e) {
        toast.error('Gagal upload foto');
      } finally {
        setUploading(false);
      }
   };

   return (
      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
               <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Aktivitas Mingguan</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Daftar Logbook Monitoring</p>
               </div>
               <button 
                  onClick={() => setIsAdding(!isAdding)} 
                  className={cn(
                    "px-8 py-3 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest transition-all",
                    isAdding ? "bg-slate-100 text-slate-900" : "btn-primary"
                  )}
               >
                  {isAdding ? 'Batalkan' : 'Buat Entry Baru'}
               </button>
            </div>

            <AnimatePresence>
            {isAdding && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }} 
                 animate={{ opacity: 1, height: 'auto' }} 
                 exit={{ opacity: 0, height: 0 }}
                 className="card p-10 bg-slate-900 text-white space-y-8 overflow-hidden shadow-2xl relative"
               >
                  <div className="absolute top-0 right-0 p-10 opacity-10"><Plus size={80} /></div>
                  <form onSubmit={handleAddLog} className="grid grid-cols-2 gap-8 relative z-10">
                     <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Deskripsi Kegiatan</label>
                        <input name="nama" required className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="Contoh: Sosialisasi Pencegahan Stunting Desa X" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Tanggal Pelaksanaan</label>
                        <input name="date" type="date" required className="input-field bg-white/5 border-white/10 text-white h-14" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Durasi Kerja (Jam)</label>
                        <input name="hours" type="number" required className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="0" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Person In Charge (Pihak Desa)</label>
                        <input name="pihakDesa" required className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="Nama Perangkat Desa / Tokoh Masyarakat" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Photo Evidence</label>
                        <label className="flex items-center justify-center h-14 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                           <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                           {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                            photo ? <CheckCircle2 className="text-primary" /> : <Camera size={20} className="text-slate-400" />}
                        </label>
                     </div>
                     <button type="submit" disabled={actionLoading || uploading} className="col-span-2 h-16 btn-primary rounded-2xl shadow-xl uppercase font-black tracking-widest text-[11px] mt-2">
                       {actionLoading ? <Loader2 className="animate-spin" /> : 'Sahkan & Simpan Logbook'}
                     </button>
                  </form>
               </motion.div>
            )}
            </AnimatePresence>

            <div className="space-y-4">
               {registration.logbooks?.length === 0 ? (
                 <div className="card p-20 text-center border-dashed border-2 text-slate-300 font-bold uppercase tracking-widest italic text-xs">Belum ada entry logbook.</div>
               ) : (
                 registration.logbooks?.map(log => (
                    <div key={log.id} className="card p-6 bg-white flex justify-between items-center group hover:border-primary/30 transition-all border-slate-100 shadow-sm">
                       <div className="flex items-center space-x-6">
                          <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-[20px] group-hover:bg-primary/10 transition-colors">
                             <Activity size={24} className="text-primary" />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 italic tracking-tight text-lg group-hover:text-primary transition-colors">{log.nama}</h4>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{log.date} • <span className="text-slate-700">{log.hours} Jam</span></p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-8 text-right">
                          <div className="hidden md:block">
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Desa Verify Accountable</p>
                             <div className="flex items-center justify-end space-x-2">
                                <span className={cn("text-[10px] font-black", log.statusPihakDesa === 'VERIFIED' ? "text-green-500" : "text-orange-500")}>@{log.pihakDesa}</span>
                                {log.statusPihakDesa === 'VERIFIED' ? <CheckCircle2 size={12} className="text-green-500" /> : <Clock size={12} className="text-orange-500" />}
                             </div>
                          </div>
                          <div className={cn(
                             "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border",
                             log.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                          )}>
                             {log.status}
                          </div>
                       </div>
                    </div>
                 ))
               )}
            </div>
         </div>

         <div className="space-y-8">
            <div className="card p-10 bg-slate-900 text-white text-center space-y-8 relative overflow-hidden shadow-2xl">
               <div className="absolute -top-10 -right-10 opacity-10"><Clock size={160} /></div>
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] relative z-10">Logged Performance</p>
               <div className="text-7xl font-black italic relative z-10 leading-none">{registration.totalHours || 0} <span className="text-2xl text-slate-600">H</span></div>
               <p className="text-xs text-slate-400 font-medium relative z-10 leading-relaxed max-w-[220px] mx-auto italic">Target 30 jam bimbingan pengabdian terverifikasi.</p>
               <div className="h-3 bg-white/10 rounded-full overflow-hidden relative z-10 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (registration.totalHours / 30) * 100)}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                  />
               </div>
            </div>
            
            <div className="card p-10 bg-slate-50 space-y-6 border-none shadow-inner border-slate-100">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-200 pb-3 italic">Assignment Metadata</h4>
               <div className="space-y-5">
                  <div className="flex flex-col space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center"> <MapPin size={10} className="mr-1.5 text-primary" /> Target Region</span>
                     <span className="font-bold text-slate-900 text-sm italic">{registration.info?.lokasi || 'Belum Ditentukan'}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center"> <Users size={10} className="mr-1.5 text-primary" /> Task Force Unit</span>
                     <span className="font-bold text-slate-900 text-sm italic">{registration.info?.kelompok || 'Belum Ditentukan'}</span>
                  </div>
               </div>
               
               <div className="pt-6 mt-6 border-t border-slate-200">
                  <button onClick={() => window.open(registration.docs?.proposalFile, '_blank')} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-primary transition-all text-slate-900 group shadow-sm">
                     <div className="flex items-center">
                        <Download size={16} className="text-primary mr-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Proposal PDF</span>
                     </div>
                     <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
