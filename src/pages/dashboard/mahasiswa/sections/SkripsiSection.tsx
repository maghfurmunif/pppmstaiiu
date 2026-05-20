import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, CheckCircle2, Calendar, Clock, 
  AlertCircle, Camera, Loader2, Download, ExternalLink,
  GraduationCap, BookOpen, FileText, Info, UserCheck, MessageSquare, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '@/src/lib/utils';
import { skripsiService, SkripsiRegistration, SkripsiLogbook } from '@/src/services/skripsiService';
import { uploadToCloudinary } from '@/src/lib/cloudinary';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function SkripsiSection() {
  const [registration, setRegistration] = useState<SkripsiRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [munaqosyahPhotos, setMunaqosyahPhotos] = useState<string[]>([]);
  const [sidangPhotos, setSidangPhotos] = useState<string[]>([]);
  const [revisionPhotos, setRevisionPhotos] = useState<string[]>([]);
  const [finalFileUrl, setFinalFileUrl] = useState<string>('');

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (registration) {
      setMunaqosyahPhotos(registration.afterExamDocs?.munaqosyahPhotos || []);
      setSidangPhotos(registration.afterExamDocs?.sidangDocs || []);
      setRevisionPhotos(registration.afterExamDocs?.revisionDocs || []);
      setFinalFileUrl(registration.afterExamDocs?.finalSkripsiUrl || '');
    }
  }, [registration]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const data = await skripsiService.getRegistrationByStudent(userId);
        setRegistration(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async (docs: any) => {
    if (!userId) return;
    try {
      setActionLoading(true);
      setError(null);
      const newReg: SkripsiRegistration = {
        id: crypto.randomUUID(), 
        studentId: userId,
        studentName: localStorage.getItem('user_name') || 'Student',
        status: 'SUBMITTED',
        registrationDocs: docs,
        logbooks: []
      };
      await skripsiService.saveRegistration(newReg);
      
      // Artificial delay for DB propagation
      await new Promise(r => setTimeout(r, 1000));
      
      const refreshed = await skripsiService.getRegistrationByStudent(userId);
      setRegistration(refreshed || newReg);
      toast.success('Pendaftaran skripsi berhasil dikirim');
    } catch (err: any) {
      console.error('Skripsi enroll error:', err);
      setError(err.message || 'Gagal mendaftar skripsi');
      toast.error('Gagal mendaftar skripsi');
    } finally {
      setActionLoading(false);
    }
  };

  const updateRegistration = async (updates: Partial<SkripsiRegistration>, message?: string) => {
    if (!registration) return;
    try {
      setActionLoading(true);
      const updated = { ...registration, ...updates };
      await skripsiService.saveRegistration(updated);
      setRegistration(updated);
      if (message) toast.success(message);
    } catch (e) {
      toast.error('Gagal memperbarui status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Authorizing Skripsi Portal...</p>
     </div>
  );

  return (
    <div className="space-y-10 pb-20 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Final Gateway</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Skripsi Pribadi
          </h1>
          <p className="text-slate-500 font-medium pt-2 text-xs">Manajemen penelitian akhir dan tugas akhir strata satu Anda.</p>
        </div>
        <StatusBadge status={registration?.status || 'NOT_ENROLLED'} className="px-6 py-3 text-xs" />
      </div>

      {!registration ? (
        <div className="space-y-6">
           {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center space-x-3">
                <AlertCircle size={16} />
                <span>{error}</span>
             </div>
           )}
           <SkripsiEnrollment onEnroll={handleEnroll} actionLoading={actionLoading} />
        </div>
      ) : (
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {registration.status === 'SUBMITTED' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-20 text-center space-y-6 border-dashed"
              >
                 <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                 <h3 className="text-2xl font-bold text-slate-900 italic tracking-tighter underline decoration-primary/30 underline-offset-8">Verifikasi Pendaftaran Skripsi</h3>
                 <p className="text-slate-400 font-medium">Biro Skripsi STAI Ihyaul Ulum sedang memvalidasi berkas administrasi dan IPK Anda.</p>
              </motion.div>
            )}

            {registration.status === 'APPROVED' && registration.advisor && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="card bg-slate-900 text-white p-10 overflow-hidden relative">
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-primary uppercase tracking-widest">Dosen Pembimbing Utama</p>
                         <h3 className="text-3xl font-black italic tracking-tighter text-white">{registration.advisor.name}</h3>
                         <p className="text-xs text-slate-400 font-medium italic">Silakan lakukan bimbingan minimal 10 kali sebelum pendaftaran munaqosyah.</p>
                      </div>
                      <button 
                         disabled={actionLoading}
                         onClick={() => updateRegistration({ status: 'PROGRESS' }, 'Bimbingan dimulai')}
                         className="btn-primary py-4 px-10 text-[10px] shadow-2xl disabled:opacity-50"
                      >
                         {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Mulai Bimbingan Sekarang'}
                      </button>
                   </div>
                   <UserCheck size={180} className="absolute -right-10 -bottom-10 opacity-5" />
                </div>
              </motion.div>
            )}

            {registration.status === 'PROGRESS' && (
              <SkripsiBimbingan registration={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
            )}

            {registration.status === 'DOCS_SUBMITTED' && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="card p-20 text-center space-y-6 border-dashed"
               >
                 <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                 <h3 className="text-2xl font-bold text-slate-900 italic">Validasi Pendaftaran Munaqosyah</h3>
                 <p className="text-slate-400 font-medium">Berkas syarat ujian skripsi Anda sedang diverifikasi admin.</p>
               </motion.div>
            )}

            {registration.status === 'SCHEDULED' && registration.examSchedule && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                 <div className="card bg-primary text-white p-10 relative overflow-hidden shadow-2xl shadow-primary/20">
                    <div className="relative z-10">
                       <h3 className="text-2xl font-black italic mb-6 underline decoration-white/20 underline-offset-8">Jadwal Munaqosyah Anda</h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                          <div>
                             <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Hari & Tanggal</p>
                             <p className="font-bold text-lg text-white">{registration.examSchedule.hari}, {registration.examSchedule.tanggal}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Waktu & Ruang</p>
                             <p className="font-bold text-lg text-white">{registration.examSchedule.pukul} • {registration.examSchedule.ruang}</p>
                          </div>
                       </div>
                    </div>
                    <Calendar size={150} className="absolute -right-10 -bottom-10 text-white/10" />
                 </div>

                 <div className="card p-10 bg-white border border-slate-200 shadow-xl space-y-8">
                    <div className="border-b border-slate-100 pb-4">
                       <h4 className="font-black italic text-slate-900 uppercase tracking-tight text-xl flex items-center">
                          <Camera className="mr-2 text-primary" size={24} />
                          Langkah 1: Upload Dokumentasi Sidang Munaqosyah
                       </h4>
                       <p className="text-xs text-slate-500 font-medium mt-1 text-slate-600">
                          Wajib mengunggah minimal 3 foto dokumentasi pelaksanaan sidang munaqosyah Anda untuk membuka proses penilaian administratif oleh Admin.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {[0, 1, 2].map((idx) => {
                          const currentPhoto = munaqosyahPhotos[idx];
                          return (
                             <div key={idx} className="space-y-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Slot Foto {idx + 1} *</span>
                                <label className={cn(
                                   "h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden bg-slate-50 relative group",
                                   currentPhoto ? "border-primary" : "border-slate-300 hover:border-primary/50 text-slate-400 font-bold"
                                )}>
                                   <input 
                                      type="file" 
                                      className="hidden" 
                                      disabled={!!uploading}
                                      onChange={async (e) => {
                                         if (!e.target.files?.[0]) return;
                                         try {
                                            setUploading(`munaqosyah-${idx}`);
                                            const url = await uploadToCloudinary(e.target.files[0]);
                                            if (url) {
                                               const updated = [...munaqosyahPhotos];
                                               updated[idx] = url;
                                               setMunaqosyahPhotos(updated);
                                               toast.success(`Foto ${idx + 1} berhasil diunggah`);
                                            }
                                         } catch (err) {
                                            toast.error("Gagal mengunggah foto");
                                         } finally {
                                            setUploading(null);
                                         }
                                      }} 
                                   />
                                   {uploading === `munaqosyah-${idx}` ? (
                                      <Loader2 className="animate-spin text-primary" size={32} />
                                   ) : currentPhoto ? (
                                      <img src={currentPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={`Munaqosyah ${idx + 1}`} />
                                   ) : (
                                      <div className="flex flex-col items-center p-4 text-center">
                                         <Camera size={28} className="text-slate-300 group-hover:text-primary transition-colors" />
                                         <span className="text-[9px] font-black uppercase mt-2 text-slate-500">Pilih berkas gambar</span>
                                      </div>
                                   )}
                                </label>
                             </div>
                          );
                       })}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                       <button
                          disabled={munaqosyahPhotos.filter(Boolean).length < 3 || actionLoading}
                          onClick={async () => {
                             try {
                                setActionLoading(true);
                                const updatedDocs = {
                                   ...(registration.afterExamDocs || {}),
                                   munaqosyahPhotos: munaqosyahPhotos.filter(Boolean),
                                   isMunaqosyahSubmitted: true
                                };
                                await updateRegistration({ 
                                   status: 'GRADING', 
                                   afterExamDocs: updatedDocs 
                                }, 'Pemberkasan munaqosyah sukses! Silakan lanjutkan unggah berkas revisi & final.');
                             } finally {
                                setActionLoading(false);
                             }
                          }}
                          className="btn-primary py-4 px-10 h-14 uppercase tracking-widest text-xs font-black shadow-lg disabled:opacity-30 disabled:pointer-events-none"
                       >
                          {actionLoading ? <Loader2 className="animate-spin" /> : 'Kirim Dokumentasi Munaqosyah & Buka Menu Revisi'}
                       </button>
                    </div>
                 </div>
              </motion.div>
            )}

            {registration.status === 'GRADING' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                 {registration.afterExamDocs?.isSubmittedForReview ? (
                    <div className="card p-16 text-center space-y-6 border-dashed bg-white border-slate-200">
                       <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="text-primary animate-pulse" size={40} />
                       </div>
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Menunggu Verifikasi & Penilaian Akhir</h3>
                       <p className="text-slate-600 font-medium max-w-lg mx-auto leading-relaxed text-xs">
                          Seluruh berkas administrasi ujian, 3 dokumentasi sidang, 3 dokumentasi perbaikan revisi, dan naskah final skripsi (beserta lembar pengesahan) Anda telah diserahkan di sistem.
                       </p>
                       <p className="text-primary/90 font-black tracking-widest text-[10px] uppercase bg-primary/5 py-2 px-4 rounded-full inline-block">
                          NILAI AKAN DITERBITKAN SETELAH ADMIN MEMBERIKAN APPROVAL REVISI DAN SKOR.
                       </p>
                       <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                          <button 
                             onClick={() => window.open(registration.afterExamDocs?.finalSkripsiUrl, '_blank')} 
                             className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between border border-slate-200 text-xs font-bold text-slate-700 transition-all"
                          >
                             <span>Dokumen Final Skripsi (PDF)</span>
                             <Download size={14} className="text-primary" />
                          </button>
                          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200 text-xs text-slate-500">
                             <span>Dokumentasi Foto Uploaded</span>
                             <span className="font-extrabold text-primary text-[10px] uppercase">Lengkap ✓</span>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-10">
                       <div className="card bg-slate-900 text-white p-10 relative overflow-hidden shadow-2xl">
                          <div className="relative z-10">
                             <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Tahap Akhir Sidang Munaqosyah</p>
                             <h3 className="text-3xl font-black italic tracking-tighter text-white">PASCA-SIDANG & UNGGAH REVISI FINAL</h3>
                             <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed max-w-2xl">
                                Selamat atas pelaksanaan Sidang Munaqosyah Anda. Silakan selesaikan perbaikan draf dengan bimbingan dewan penguji, lalu unggah dokumen wajib berikut untuk pencairan nilai kelulusan Anda.
                             </p>
                          </div>
                       </div>

                       <div className="card p-10 bg-white border border-slate-200 space-y-8">
                          <h4 className="font-black italic text-slate-900 uppercase tracking-tight text-lg flex items-center border-b border-slate-100 pb-4">
                             <FileText className="mr-2 text-primary" size={20} />
                             1. Unggah Laporan Revisi & Dokumentasi
                          </h4>

                          <div className="space-y-6">
                             <div>
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">A. Dokumentasi Sidang Pasca-Sidang (Maksimal 3 Foto)</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   {[0, 1, 2].map((idx) => {
                                      const currentPhoto = sidangPhotos[idx];
                                      return (
                                         <label key={idx} className={cn(
                                            "h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden bg-slate-50 relative group",
                                            currentPhoto ? "border-primary" : "border-slate-200 hover:border-primary/50 text-slate-400"
                                         )}>
                                            <input 
                                               type="file" 
                                               className="hidden" 
                                               disabled={!!uploading}
                                               onChange={async (e) => {
                                                  if (!e.target.files?.[0]) return;
                                                  try {
                                                     setUploading(`sidang-${idx}`);
                                                     const url = await uploadToCloudinary(e.target.files[0]);
                                                     if (url) {
                                                        const updated = [...sidangPhotos];
                                                        updated[idx] = url;
                                                        setSidangPhotos(updated);
                                                        toast.success(`Foto Sidang ${idx + 1} berhasil diunggah`);
                                                     }
                                                  } catch (err) {
                                                     toast.error("Gagal mengunggah foto");
                                                  } finally {
                                                     setUploading(null);
                                                  }
                                               }} 
                                            />
                                            {uploading === `sidang-${idx}` ? (
                                               <Loader2 className="animate-spin text-primary" size={20} />
                                            ) : currentPhoto ? (
                                               <img src={currentPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                               <div className="flex flex-col items-center p-2 text-center text-slate-500">
                                                  <Camera size={20} className="text-slate-300 group-hover:text-primary" />
                                                  <span className="text-[8px] font-black uppercase mt-1">Upload Foto</span>
                                               </div>
                                            )}
                                         </label>
                                      );
                                   })}
                                </div>
                             </div>

                             <div>
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">B. Dokumentasi Bimbingan Perbaikan / Rapat Revisi (Maksimal 3 Foto)</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   {[0, 1, 2].map((idx) => {
                                      const currentPhoto = revisionPhotos[idx];
                                      return (
                                         <label key={idx} className={cn(
                                            "h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden bg-slate-50 relative group",
                                            currentPhoto ? "border-primary" : "border-slate-200 hover:border-primary/50 text-slate-400"
                                         )}>
                                            <input 
                                               type="file" 
                                               className="hidden" 
                                               disabled={!!uploading}
                                               onChange={async (e) => {
                                                  if (!e.target.files?.[0]) return;
                                                  try {
                                                     setUploading(`revision-${idx}`);
                                                     const url = await uploadToCloudinary(e.target.files[0]);
                                                     if (url) {
                                                        const updated = [...revisionPhotos];
                                                        updated[idx] = url;
                                                        setRevisionPhotos(updated);
                                                        toast.success(`Foto Bimbingan Revisi ${idx + 1} berhasil diunggah`);
                                                     }
                                                  } catch (err) {
                                                     toast.error("Gagal mengunggah foto");
                                                  } finally {
                                                     setUploading(null);
                                                  }
                                               }} 
                                            />
                                            {uploading === `revision-${idx}` ? (
                                               <Loader2 className="animate-spin text-primary" size={20} />
                                            ) : currentPhoto ? (
                                               <img src={currentPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                               <div className="flex flex-col items-center p-2 text-center text-slate-500 font-bold">
                                                  <Camera size={20} className="text-slate-300 group-hover:text-primary" />
                                                  <span className="text-[8px] font-black uppercase mt-1">Upload Foto</span>
                                               </div>
                                            )}
                                         </label>
                                      );
                                   })}
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="card p-10 bg-white border border-slate-200 space-y-6 bg-white">
                          <h4 className="font-black italic text-slate-900 uppercase tracking-tight text-lg flex items-center border-b border-slate-100 pb-4">
                             <FileUp className="mr-2 text-primary" size={20} />
                             2. File Naskah Perbaikan Skripsi Final & Laman Pengesahan
                          </h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                             Unggah naskah skripsi yang sudah direvisi secara lengkap berformat PDF, pastikan lembar/laman pengesahan bertanda tangan lengkap dari dewan penguji dan pembimbing sudah dipindai (scanned) di dalamnya.
                          </p>

                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div className="space-y-1">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-0.5">Berkas Skripsi Final (Lengkap PDF) *</span>
                                <p className="text-xs font-bold text-slate-700">
                                   {finalFileUrl ? "Naskah_Skripsi_Final_Lengkap.pdf" : "Belum ada berkas diunggah"}
                                </p>
                             </div>
                             
                             <label className="btn-primary py-3 px-6 text-[10px] uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-none">
                                <input 
                                   type="file" 
                                   className="hidden" 
                                   accept=".pdf" 
                                   disabled={!!uploading}
                                   onChange={async (e) => {
                                      if (!e.target.files?.[0]) return;
                                      try {
                                         setUploading('final-pdf');
                                         const url = await uploadToCloudinary(e.target.files[0]);
                                         if (url) {
                                            setFinalFileUrl(url);
                                            toast.success("Naskah skripsi final berhasil diunggah");
                                         }
                                      } catch (err) {
                                         toast.error("Gagal mengunggah PDF");
                                      } finally {
                                         setUploading(null);
                                      }
                                   }}
                                />
                                {uploading === 'final-pdf' ? 'MENGUNGGAH PDF...' : 'UNGGAH DOKUMEN PDF'}
                             </label>
                          </div>

                          <div className="pt-6 border-t border-slate-100 flex justify-end">
                             <button
                                disabled={!finalFileUrl || actionLoading}
                                onClick={async () => {
                                   try {
                                      setActionLoading(true);
                                      const updatedDocs = {
                                         ...registration.afterExamDocs,
                                         sidangDocs: sidangPhotos.filter(Boolean),
                                         revisionDocs: revisionPhotos.filter(Boolean),
                                         finalSkripsiUrl: finalFileUrl,
                                         isSubmittedForReview: true,
                                         status: 'PENDING_APPROVAL'
                                      };
                                      await updateRegistration({ 
                                         afterExamDocs: updatedDocs 
                                      }, 'Laporan perbaikan dan naskah final berhasil diserahkan ke Admin!');
                                   } finally {
                                      setActionLoading(false);
                                   }
                                }}
                                className="btn-primary py-4 px-10 h-14 uppercase tracking-widest text-xs font-black shadow-lg disabled:opacity-30 disabled:pointer-events-none"
                             >
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'KIRIM DATA REVISI & PENILAIAN'}
                             </button>
                          </div>
                       </div>
                    </div>
                 )}
              </motion.div>
            )}

            {registration.status === 'COMPLETED' && registration.grades && registration.grades.total !== undefined && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto space-y-10"
              >
                 <div className="card p-12 bg-slate-900 text-white text-center relative overflow-hidden shadow-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950">
                    <div className="relative z-10 space-y-4">
                       <CheckCircle2 size={64} className="mx-auto text-primary" />
                       <h2 className="text-4xl font-black italic tracking-tighter text-white">SKRIPSI SELESAI</h2>
                       <div className="inline-block px-10 py-3 bg-primary text-white rounded-full font-black text-3xl italic shadow-2xl">
                          {registration.grades?.gradeText} ({Number(registration.grades?.total || 0).toFixed(0)})
                       </div>
                    </div>
                 </div>
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="card p-8 bg-white border-slate-200 shadow-xl space-y-4 text-slate-900 font-bold">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Naskah Skripsi (30%)</p>
                        <p className="text-2xl font-black text-slate-900 italic">{(registration.grades?.naskah ?? 0).toFixed(0)}</p>
                    </div>
                    <div className="card p-8 bg-white border-slate-200 shadow-xl space-y-4 text-slate-900 font-bold">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ujian Munaqosyah (70%)</p>
                        <p className="text-2xl font-black text-slate-900 italic">{(registration.grades?.sidang ?? 0).toFixed(0)}</p>
                    </div>
                    <div className="card p-8 bg-primary text-white flex flex-col items-center justify-center text-center space-y-2">
                       <CheckCircle2 size={24} className="text-white" />
                       <p className="font-bold text-xs uppercase tracking-widest tracking-[0.1em] text-white">Gelar Akademik: S.Pd</p>
                    </div>
                 </div>
              </motion.div>
            )}

            {registration.status === 'COMPLETED' && (!registration.grades || registration.grades.total === undefined) && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="card p-20 text-center space-y-6 border-dashed"
               >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                     <Clock className="text-primary animate-pulse" size={40} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Dalam Penilaian Akhir</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">Sidang Munaqosyah telah selesai. Admin sedang menginput skor akhir skripsi Anda. Mohon cek kembali secara berkala.</p>
               </motion.div>
            )}

            {registration.status === 'REJECTED' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-12 border-red-200 bg-red-50 text-center space-y-6"
              >
                 <AlertCircle size={48} className="text-red-500 mx-auto" />
                 <div>
                    <h3 className="text-2xl font-bold text-red-900">Pendaftaran Ditolak</h3>
                    <p className="text-red-700/60 font-medium mt-2 italic">"{registration.rejectionReason || 'Ditemukan ketidaksesuaian berkas.'}"</p>
                 </div>
                 <button 
                   disabled={actionLoading}
                   onClick={() => updateRegistration({ status: 'ENROLL' as any })} 
                   className="btn-primary bg-red-600 hover:bg-red-700 text-[10px] disabled:opacity-50"
                 >
                   {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Perbaiki Berkas'}
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function SkripsiEnrollment({ onEnroll, actionLoading }: { onEnroll: (docs: any) => void, actionLoading: boolean }) {
  const [docs, setDocs] = useState<Record<string, string>>({
     sks: '', ipk: '', nilaiMataKuliah: '', administrasi: ''
  });
  const [uploading, setUploading] = useState<string | null>(null);
  
  const handleDocUpload = async (id: string, file: File) => {
    try {
      setUploading(id);
      const url = await uploadToCloudinary(file);
      if (url) {
        setDocs(prev => ({ ...prev, [id]: url }));
        toast.success('Berkas berhasil diunggah');
      }
    } catch (error) {
      console.error('Doc upload failed:', error);
      toast.error('Gagal mengunggah berkas');
    } finally {
      setUploading(null);
    }
  };

  const requirements = [
    { id: 'sks', label: 'Transkrip SKS (110-120 SKS)' },
    { id: 'ipk', label: 'Bukti IPK Minimum' },
    { id: 'nilaiMataKuliah', label: 'Transkrip Nilai (Bebas E)' },
    { id: 'administrasi', label: 'Bukti Lunas Administrasi' },
  ];

  const allReady = Object.values(docs).every(v => v && v !== '');

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="card p-8 bg-slate-900 text-white space-y-6">
           <h3 className="text-2xl font-black italic flex items-center">
             <FileUp className="mr-3 text-primary" size={24} />
             Syarat Akademik
           </h3>
           <ul className="space-y-4">
              {requirements.map(s => (
                <li key={s.id} className="group relative">
                  <label className={cn(
                    "flex flex-col space-y-3 p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                    docs[s.id] ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-100 group-hover:text-primary transition-colors">{s.label}</span>
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shadow-lg",
                        docs[s.id] ? "bg-primary border-primary text-white" : "border-white/20"
                      )}>
                        {docs[s.id] && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={e => e.target.files?.[0] && handleDocUpload(s.id, e.target.files[0])}
                      disabled={!!uploading || actionLoading}
                    />
                    
                    <div className="flex items-center space-x-3">
                       {uploading === s.id ? (
                         <div className="flex items-center space-x-2 text-[10px] font-black text-primary animate-pulse">
                            <Loader2 className="animate-spin" size={14} />
                            <span>MENGUNGGAH...</span>
                         </div>
                       ) : docs[s.id] ? (
                         <div className="flex items-center space-x-2 text-[10px] font-black text-primary uppercase">
                            <CheckCircle2 size={12} />
                            <span>File Terupload ✓</span>
                         </div>
                       ) : (
                         <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">
                            <FileUp size={14} />
                            <span>Ambil File Berkas</span>
                         </div>
                       )}
                    </div>
                  </label>
                </li>
              ))}
           </ul>
        </div>
      </div>
      <div className="card p-12 text-center flex flex-col items-center justify-center space-y-6 border-dashed border-2 border-slate-200 bg-white shadow-xl">
         <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary rotate-3 transition-transform hover:rotate-6">
            <GraduationCap size={40} />
         </div>
         <div className="space-y-4">
            <h4 className="text-2xl font-black text-slate-900 italic underline decoration-primary/30 underline-offset-8">Daftar Skripsi</h4>
            <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">Upload semua berkas pendukung di samping untuk mengaktifkan pendaftaran Anda.</p>
         </div>
         <button 
           disabled={!allReady || !!uploading || actionLoading}
           onClick={() => onEnroll(docs)}
           className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 shadow-2xl transition-all"
         >
           {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Daftar Skripsi Sekarang'}
         </button>
      </div>
    </div>
  );
}

function SkripsiBimbingan({ registration, onUpdate, actionLoading }: { registration: SkripsiRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draftUrl, setDraftUrl] = useState<string>(registration.finalDocs?.draftSkripsiUrl || '');
  const [uploadingDraft, setUploadingDraft] = useState(false);
  const [form, setForm] = useState<Partial<SkripsiLogbook>>({
    date: new Date().toISOString().split('T')[0],
  });

  const handleLogPhoto = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, photo: url }));
      toast.success('Bukti bimbingan berhasil diunggah');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Gagal mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.photo) return toast.error('Lampirkan bukti foto bimbingan');
    const newLog: SkripsiLogbook = {
      id: crypto.randomUUID(),
      ...form as any,
      status: 'PENDING'
    };
    onUpdate({ logbooks: [newLog, ...registration.logbooks] }, 'Progress bimbingan tersimpan');
    setIsAdding(false);
    setForm({ date: new Date().toISOString().split('T')[0] });
  };

  const bimbinganCount = registration.logbooks.filter(l => l.status === 'APPROVED').length;
  const isReadyForMunaqosyah = bimbinganCount >= 10;

  return (
    <div className="grid lg:grid-cols-3 gap-10 text-slate-900">
       <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900 italic flex items-center"><MessageSquare className="mr-2 text-primary" size={20} /> Jurnal Bimbingan</h3>
             <button onClick={() => setIsAdding(!isAdding)} className="btn-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">{isAdding ? 'Batal' : 'Input Progress'}</button>
          </div>

          <AnimatePresence>
            {isAdding && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }} 
                onSubmit={handleSubmit} 
                className="card p-8 space-y-6 bg-primary/5 border-primary/10 overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Tanggal</label>
                      <input type="date" className="input-field text-slate-900 bg-white shadow-sm font-bold" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Pokok Bahasan</label>
                      <input type="text" className="input-field text-slate-900 bg-white shadow-sm font-bold placeholder-slate-400" placeholder="Contoh: Bab 1 Pendahuluan" onChange={e => setForm({...form, topic: e.target.value})} required />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Catatan/Komentar</label>
                   <textarea className="input-field h-24 text-slate-900 bg-white shadow-sm font-bold placeholder-slate-400" placeholder="Apa yang Anda pelajari atau diskusikan?" onChange={e => setForm({...form, comment: e.target.value})} required />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Foto Bukti Bimbingan</label>
                   <div className="flex items-center gap-6">
                      <label className={cn("flex-grow h-32 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer overflow-hidden group/f", form.photo ? "border-primary" : "border-slate-200 text-slate-300 hover:border-primary/50")}>
                         <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleLogPhoto(e.target.files[0])} disabled={uploading} />
                         {uploading ? (
                           <Loader2 className="animate-spin text-primary" size={32} />
                         ) : form.photo ? (
                           <img src={form.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                         ) : (
                           <div className="flex flex-col items-center">
                              <Camera size={32} className="group-hover/f:text-primary transition-colors text-slate-400" />
                              <span className="text-[9px] font-black uppercase mt-2 text-slate-500">Upload Foto</span>
                           </div>
                         )}
                      </label>
                      {form.photo && <div className="text-[10px] font-black text-primary uppercase italic tracking-widest">Image Cloud Sync ✓</div>}
                   </div>
                </div>
                <button type="submit" disabled={!form.photo || uploading || actionLoading} className="w-full btn-primary py-5 text-[10px] tracking-widest shadow-2xl disabled:opacity-20 font-black uppercase">
                   {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Simpan Logbook'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
             {registration.logbooks.length === 0 ? (
                <div className="card p-20 text-center space-y-3 border-dashed opacity-50 bg-white border-slate-200">
                   <BookOpen className="mx-auto text-slate-300" size={48} />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada jurnal bimbingan</p>
                </div>
             ) : (
                registration.logbooks.map(log => (
                  <motion.div 
                    layout
                    key={log.id} 
                    className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all border-l-4 border-l-slate-100 hover:border-l-primary bg-white text-slate-900 border-slate-200"
                  >
                     <div className="flex items-start space-x-5">
                        <div className="flex flex-col items-center justify-center p-3 px-4 bg-slate-50 rounded-2xl border border-slate-200 min-w-[70px]">
                           <span className="text-[9px] font-black text-slate-400 uppercase">{log.date.split('-')[0]}</span>
                           <span className="text-sm font-black text-primary">{log.date.split('-').slice(1).reverse().join('/')}</span>
                        </div>
                        <div className="space-y-1">
                           <div className="flex items-center space-x-2">
                              <h5 className="font-bold text-slate-800 text-lg">{log.topic}</h5>
                              {log.photo && (
                                 <button onClick={() => window.open(log.photo, '_blank')} className="p-1 hover:bg-primary/5 rounded-lg text-primary opacity-40 hover:opacity-100 transition-all">
                                    <Eye size={14} />
                                 </button>
                              )}
                           </div>
                           <p className="text-xs text-slate-500 italic font-medium">"{log.comment}"</p>
                        </div>
                     </div>
                     <div className={cn(
                       "text-[9px] font-black uppercase px-4 py-1.5 rounded-full",
                       log.status === 'APPROVED' ? "bg-green-50 text-green-600 border border-green-100" : 
                       log.status === 'REJECTED' ? "bg-red-50 text-red-600 border border-red-100" :
                       "bg-slate-50 text-slate-400 border border-slate-100"
                     )}>
                       {log.status === 'APPROVED' ? 'Diverifikasi' : 
                        log.status === 'REJECTED' ? 'Ditolak' : 'Pending'}
                     </div>
                  </motion.div>
                ))
             )}
          </div>
       </div>

       <div className="space-y-8 text-center lg:text-left text-slate-900">
          <div className="card p-10 bg-slate-900 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
             <div className="relative z-10 space-y-8">
                <div>
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Bimbingan Tracker</p>
                   <div className="text-6xl font-black italic tracking-tighter flex items-end text-white">
                     {bimbinganCount} 
                     <span className="text-base font-black opacity-20 ml-3 mb-2 uppercase tracking-widest text-slate-400">/ 10</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (bimbinganCount / 10) * 100)}%` }} className="h-full bg-primary rounded-full shadow-lg shadow-primary/40" />
                   </div>
                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                      <span>Progress</span>
                      <span>{Math.min(100, Math.round((bimbinganCount / 10) * 100))}%</span>
                   </div>
                </div>
                {isReadyForMunaqosyah && registration.status === 'PROGRESS' && (
                  <button 
                    disabled={actionLoading}
                    onClick={async () => {
                       const fileInput = document.createElement('input');
                       fileInput.type = 'file';
                       fileInput.accept = 'application/pdf';
                       fileInput.onchange = async (e: any) => {
                         const file = e.target.files?.[0];
                         if (!file) return;
                         try {
                           toast.info('Mengunggah naskah draf skripsi PDF...');
                           const url = await uploadToCloudinary(file);
                           if (url) {
                             onUpdate({ 
                               status: 'DOCS_SUBMITTED' as any,
                               finalDocs: {
                                 ...(registration.finalDocs || {}),
                                 draftSkripsiUrl: url
                               }
                             }, 'Pendaftaran munaqosyah berhasil diajukan berserta draf naskah PDF.');
                             toast.success('Draf Skripsi berhasil terunggah dan didaftarkan.');
                           }
                         } catch (err) {
                           toast.error('Gagal mengunggah berkas PDF draf');
                         }
                       };
                       fileInput.click();
                     }} 
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center justify-center"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Daftar Munaqosyah (Upload Draft PDF)'}
                  </button>
                )}
             </div>
             <MessageSquare size={180} className="absolute -right-16 -bottom-16 opacity-5 text-white group-hover:rotate-12 transition-transform duration-700" />
          </div>
          
          <div className="card p-8 bg-slate-50 border-none">
             <div className="flex items-center space-x-3 mb-4">
                <Info size={16} className="text-primary" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pemberitahuan</h5>
             </div>
             <p className="text-xs text-slate-600 font-medium leading-relaxed italic text-left">
               Setiap input bimbingan wajib melampirkan foto dokumentasi sebagai bukti otentik kegiatan akademik.
             </p>
          </div>
       </div>
    </div>
  );
}
