
import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, CheckCircle2, Calendar, Clock, 
  AlertCircle, Camera, Loader2, Download, ExternalLink,
  GraduationCap, BookOpen, FileText, Info, UserCheck, MessageSquare
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { skripsiService, SkripsiRegistration, SkripsiLogbook } from '@/src/services/skripsiService';

import { uploadToCloudinary } from '@/src/lib/cloudinary';

export default function SkripsiSection() {
  const [registration, setRegistration] = useState<SkripsiRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const data = await skripsiService.getRegistrationByStudent(userId);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleUpload = async (file: File) => {
    try {
      setUploading('main');
      const url = await uploadToCloudinary(file);
      return url;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    } finally {
      setUploading(null);
    }
  };

  const handleEnroll = async (docs: any) => {
    if (!userId) return;
    const newReg: SkripsiRegistration = {
      id: '', // Let DB generate UUID
      studentId: userId,
      studentName: localStorage.getItem('user_name') || 'Student',
      status: 'SUBMITTED',
      registrationDocs: docs,
      logbooks: []
    };
    await skripsiService.saveRegistration(newReg);
    setRegistration(newReg);
  };

  const updateRegistration = async (updates: Partial<SkripsiRegistration>) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    await skripsiService.saveRegistration(updated);
    setRegistration(updated);
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs">
        <Loader2 className="animate-spin mb-4" size={32} />
        Authorizing Skripsi Portal...
     </div>
  );

  return (
    <div className="space-y-10 pb-20 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Final Gateway</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Skripsi Pribadi
          </h1>
          <p className="text-slate-500 font-medium pt-2">Manajemen penelitian akhir dan tugas akhir strata satu Anda.</p>
        </div>
        <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Status</span>
           <span className="text-xs font-black text-primary uppercase italic tracking-tighter">
             {registration?.status || 'NOT_ENROLLED'}
           </span>
        </div>
      </div>

      {!registration ? (
        <SkripsiEnrollment onEnroll={handleEnroll} />
      ) : (
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {registration.status === 'SUBMITTED' && (
              <div className="card p-20 text-center space-y-6">
                 <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                 <h3 className="text-2xl font-bold text-slate-900 italic tracking-tighter underline decoration-primary/30 underline-offset-8">Verifikasi Pendaftaran Skripsi</h3>
                 <p className="text-slate-400 font-medium">Biro Skripsi STAI Ihyaul Ulum sedang memvalidasi berkas administrasi dan IPK Anda.</p>
              </div>
            )}

            {registration.status === 'APPROVED' && registration.advisor && (
              <div className="space-y-10">
                <div className="card bg-slate-900 text-white p-10 overflow-hidden relative">
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-primary uppercase tracking-widest">Dosen Pembimbing Utama</p>
                         <h3 className="text-3xl font-black italic tracking-tighter">{registration.advisor.name}</h3>
                         <p className="text-xs text-slate-400 font-medium">Silakan lakukan bimbingan minimal 10 kali sebelum pendaftaran munaqosyah.</p>
                      </div>
                      <button 
                         onClick={() => updateRegistration({ status: 'PROGRESS' })}
                         className="btn-primary py-4 px-10 text-[10px] shadow-2xl"
                      >
                         Mulai Bimbingan Sekarang
                      </button>
                   </div>
                   <UserCheck size={180} className="absolute -right-10 -bottom-10 opacity-5" />
                </div>
              </div>
            )}

            {registration.status === 'PROGRESS' && (
              <SkripsiBimbingan registration={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'DOCS_SUBMITTED' && (
               <div className="card p-20 text-center space-y-6">
                 <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                 <h3 className="text-2xl font-bold text-slate-900 italic">Validasi Pendaftaran Munaqosyah</h3>
                 <p className="text-slate-400 font-medium">Berkas syarat ujian skripsi Anda sedang diverifikasi admin.</p>
              </div>
            )}

            {registration.status === 'SCHEDULED' && registration.examSchedule && (
              <div className="space-y-10">
                 <div className="card bg-primary text-white p-10">
                    <h3 className="text-2xl font-black italic mb-6 underline decoration-white/20 underline-offset-8">Jadwal Munaqosyah</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                       <div>
                          <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Hari & Tanggal</p>
                          <p className="font-bold text-lg">{registration.examSchedule.hari}, {registration.examSchedule.tanggal}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Waktu & Ruang</p>
                          <p className="font-bold text-lg">{registration.examSchedule.pukul} • {registration.examSchedule.ruang}</p>
                       </div>
                    </div>
                 </div>
                 <div className="max-w-2xl mx-auto space-y-8">
                    <h4 className="text-center font-bold text-slate-900 italic">Dokumentasi & Revisi Pasca-Ujian</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div onClick={() => updateRegistration({ status: 'COMPLETED' })} className="card p-8 border-dashed flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-primary/5 transition-all group">
                          <Camera className="text-slate-300 group-hover:text-primary" />
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest">Upload Bukti Sidang</span>
                       </div>
                       <div className="card p-8 border-dashed flex flex-col items-center justify-center space-y-3 opacity-30 cursor-not-allowed">
                          <FileText className="text-slate-300" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revisi Final</span>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {registration.status === 'COMPLETED' && registration.grades && (
              <div className="max-w-4xl mx-auto space-y-10">
                 <div className="card p-12 bg-slate-900 text-white text-center relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                       <CheckCircle2 size={64} className="mx-auto text-primary" />
                       <h2 className="text-4xl font-black italic tracking-tighter">SKRIPSI SELESAI</h2>
                       <div className="inline-block px-10 py-3 bg-primary text-white rounded-full font-black text-3xl italic shadow-2xl">
                         {registration.grades.gradeText} ({registration.grades.total.toFixed(0)})
                       </div>
                    </div>
                 </div>
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="card p-8 bg-white border-slate-100 shadow-xl space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Naskah Skripsi</p>
                        <p className="text-2xl font-black text-slate-900 italic">{registration.grades.naskah}</p>
                    </div>
                    <div className="card p-8 bg-white border-slate-100 shadow-xl space-y-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ujian Munaqosyah</p>
                        <p className="text-2xl font-black text-slate-900 italic">{registration.grades.sidang}</p>
                    </div>
                    <div className="card p-8 bg-primary text-white flex flex-col items-center justify-center text-center space-y-2">
                       <CheckCircle2 size={24} />
                       <p className="font-bold text-xs uppercase tracking-widest">Gelar Akademik: S.Pd</p>
                    </div>
                 </div>
              </div>
            )}
           {registration.status === 'REJECTED' && (
              <div className="card p-12 border-red-200 bg-red-50 text-center space-y-6">
                 <AlertCircle size={48} className="text-red-500 mx-auto" />
                 <div>
                    <h3 className="text-2xl font-bold text-red-900">Pendaftaran Ditolak</h3>
                    <p className="text-red-700/60 font-medium mt-2">"{registration.rejectionReason || 'Ditemukan ketidaksesuaian berkas.'}"</p>
                 </div>
                 <button onClick={() => updateRegistration({ status: 'ENROLL' })} className="btn-primary bg-red-600 hover:bg-red-700 text-[10px]">Perbaiki Berkas</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SkripsiEnrollment({ onEnroll }: { onEnroll: (docs: any) => void }) {
  const [docs, setDocs] = useState({
     sks: false, ipk: false, nilaiMataKuliah: false, administrasi: false
  });
  
  const allReady = Object.values(docs).every(v => v);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="card p-8 bg-slate-900 text-white space-y-6">
           <h3 className="text-2xl font-black italic">Syarat Akademik</h3>
           <ul className="space-y-4">
              {[
                { id: 'sks', label: 'Telah Menempuh 110-120 SKS' },
                { id: 'ipk', label: 'Memenuhi IPK Minimum Program Studi' },
                { id: 'nilaiMataKuliah', label: 'Bebas Nilai E & Batasan Nilai D' },
                { id: 'administrasi', label: 'Lunas Administrasi Semester Berjalan' },
              ].map(s => (
                <li key={s.id} onClick={() => setDocs({...docs, [s.id as keyof typeof docs]: !docs[s.id as keyof typeof docs]})} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{s.label}</span>
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                    docs[s.id as keyof typeof docs] ? "bg-primary border-primary text-white" : "border-white/10"
                  )}>
                    {docs[s.id as keyof typeof docs] && <CheckCircle2 size={14} />}
                  </div>
                </li>
              ))}
           </ul>
        </div>
      </div>
      <div className="card p-12 text-center flex flex-col items-center justify-center space-y-6 border-dashed border-2 border-slate-200 bg-white/50">
         <div className="w-16 h-16 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary">
            <GraduationCap size={32} />
         </div>
         <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900 italic underline decoration-primary/30 underline-offset-8">Daftar Skripsi</h4>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">Upload berkas pendukung sesuai kriteria akademik untuk mendaftar.</p>
         </div>
         <button 
           disabled={!allReady}
           onClick={() => onEnroll(docs)}
           className="btn-primary w-full py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 shadow-xl"
         >
           Daftar Skripsi Sekarang
         </button>
      </div>
    </div>
  );
}

function SkripsiBimbingan({ registration, onUpdate }: { registration: SkripsiRegistration, onUpdate: (u: any) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<SkripsiLogbook>>({
    date: new Date().toISOString().split('T')[0],
  });

  const handleLogPhoto = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, photo: url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.photo) return;
    const newLog: SkripsiLogbook = {
      id: '',
      ...form as any,
      status: 'PENDING'
    };
    onUpdate({ logbooks: [newLog, ...registration.logbooks] });
    setIsAdding(false);
    setForm({ date: new Date().toISOString().split('T')[0] });
  };

  const bimbinganCount = registration.logbooks.filter(l => l.status === 'APPROVED').length;
  const isReadyForMunaqosyah = bimbinganCount >= 10;

  return (
    <div className="grid lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900 italic flex items-center"><MessageSquare className="mr-2 text-primary" size={20} /> Jurnal Bimbingan</h3>
             <button onClick={() => setIsAdding(!isAdding)} className="btn-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">{isAdding ? 'Batal' : 'Input Progress'}</button>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleSubmit} className="card p-8 space-y-6 bg-primary/5 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tanggal</label>
                      <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pokok Bahasan</label>
                      <input type="text" className="input-field" placeholder="Bab 1... Bab 2..." onChange={e => setForm({...form, topic: e.target.value})} required />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Catatan/Komentar</label>
                   <textarea className="input-field h-24" placeholder="Komentar pembimbing..." onChange={e => setForm({...form, comment: e.target.value})} required />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Foto Bukti Bimbingan</label>
                   <div className="flex items-center gap-4">
                      <label className={cn("flex-grow h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer overflow-hidden", form.photo ? "border-primary" : "border-slate-200 text-slate-300 hover:border-primary/50")}>
                         <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleLogPhoto(e.target.files[0])} disabled={uploading} />
                         {uploading ? <Loader2 className="animate-spin" size={24} /> : form.photo ? <img src={form.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Camera size={24} />}
                      </label>
                      {form.photo && <div className="text-[10px] font-black text-primary uppercase italic">Terverifikasi di Cloudinary ✓</div>}
                   </div>
                </div>
                <button type="submit" disabled={!form.photo || uploading} className="w-full btn-primary py-4 text-[10px] tracking-widest shadow-xl disabled:opacity-20">
                   {uploading ? 'Sedang Mengunggah...' : 'Simpan Logbook Bimbingan'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
             {registration.logbooks.map(log => (
               <div key={log.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-x-1 transition-all">
                  <div className="flex items-start space-x-4">
                     <div className="p-3 bg-slate-50 rounded-xl text-primary font-black text-xs">{log.date.split('-').reverse().join('/')}</div>
                     <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                           <h5 className="font-bold text-slate-800">{log.topic}</h5>
                           {log.photo && (
                              <button onClick={() => window.open(log.photo, '_blank')}>
                                 <Eye size={12} className="text-primary opacity-50 hover:opacity-100" />
                              </button>
                           )}
                        </div>
                        <p className="text-xs text-slate-400 italic line-clamp-1">"{log.comment}"</p>
                     </div>
                  </div>
                  <div className={cn(
                    "text-[9px] font-black uppercase px-3 py-1 rounded-full",
                    log.status === 'APPROVED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {log.status}
                  </div>
               </div>
             ))}
          </div>
       </div>

       <div className="space-y-8 text-center lg:text-left">
          <div className="card p-10 bg-slate-900 text-white relative overflow-hidden group">
             <div className="relative z-10 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Quota Bimbingan</h4>
                  <div className="text-5xl font-black italic mt-2">{bimbinganCount} <span className="text-sm opacity-30">/ 10 KALI</span></div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (bimbinganCount / 10) * 100)}%` }} className="h-full bg-primary" />
                </div>
                {isReadyForMunaqosyah && (
                  <button onClick={() => onUpdate({ status: 'DOCS_SUBMITTED' })} className="w-full py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase shadow-2xl hover:scale-105 transition-all">Daftar Munaqosyah</button>
                )}
             </div>
             <MessageSquare size={160} className="absolute -right-12 -bottom-12 opacity-5 text-white group-hover:rotate-12 transition-transform" />
          </div>
       </div>
    </div>
  );
}
