
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, CheckCircle2, Calendar, Clock, 
  AlertCircle, Camera, Loader2, Download, ExternalLink,
  BookOpen, FileText, Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { semproService, SemproRegistration, AcademicStatus } from '@/src/services/semproService';

import { uploadToCloudinary } from '@/src/lib/cloudinary';

const TEMPLATE_URL = "https://drive.google.com/file/d/1UjFVYzulNNA8aWHIPNhI26o2ZIbkzoNC/view?usp=sharing";

export default function SemproSection() {
  const [registration, setRegistration] = useState<SemproRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState({ proposal: '' });
  const [postDocs, setPostDocs] = useState({ dokumentasi: [] as string[], catatan: [] as string[] });
  const [uploadingPost, setUploadingPost] = useState<string | null>(null);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const data = await semproService.getRegistrationByStudent(userId);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setDocs({ proposal: url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEnroll = async () => {
    if (!userId || !docs.proposal) return;
    const newReg: SemproRegistration = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: userId,
      studentName: localStorage.getItem('user_name') || 'Student',
      status: 'PENDING',
      fileProposal: docs.proposal
    };
    await semproService.saveRegistration(newReg);
    setRegistration(newReg);
  };

  const handlePostUpload = async (type: 'dok' | 'cat', file: File) => {
    try {
      setUploadingPost(type);
      const url = await uploadToCloudinary(file);
      if (type === 'dok') setPostDocs(prev => ({ ...prev, dokumentasi: [...prev.dokumentasi, url].slice(0, 3) }));
      else setPostDocs(prev => ({ ...prev, catatan: [...prev.catatan, url].slice(0, 3) }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingPost(null);
    }
  };

  const handleFinishSempro = async () => {
    if (postDocs.dokumentasi.length < 3) return;
    await updateRegistration({ 
      status: 'PROGRESS',
      postSeminar: {
        dokumentasi: postDocs.dokumentasi,
        catatan: postDocs.catatan
      }
    });
  };

  const updateRegistration = async (updates: Partial<SemproRegistration>) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    await semproService.saveRegistration(updated);
    setRegistration(updated);
  };

  if (loading) return null;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Academic Pipeline</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Seminar Proposal
          </h1>
          <p className="text-slate-500 font-medium pt-2">Manajemen pengajuan dan pelaksanaan seminar proposal skripsi Anda.</p>
        </div>
        <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Status Pipeline</span>
           <span className="text-xs font-black text-primary uppercase italic tracking-tighter">
             {registration?.status || 'NOT_ENROLLED'}
           </span>
        </div>
      </div>

      {!registration || registration.status === 'ENROLL' ? (
        <div className="grid lg:grid-cols-2 gap-10">
           <div className="space-y-8">
              <div className="card p-8 bg-slate-900 text-white space-y-6">
                 <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Download size={24} />
                 </div>
                 <h3 className="text-2xl font-black italic tracking-tighter">Template Proposal</h3>
                 <p className="text-slate-400 text-sm leading-relaxed">
                    Pastikan proposal Anda sesuai dengan format standar kampus STAI Ihyaul Ulum. Unduh template di bawah ini sebelum mengunggah berkas.
                 </p>
                 <a 
                    href={TEMPLATE_URL} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center space-x-2 w-full py-4 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                  >
                    <span>Download Template .DOCX</span>
                    <ExternalLink size={14} />
                 </a>
              </div>
           </div>
            <div className="card p-12 text-center flex flex-col items-center justify-center space-y-8 border-dashed border-2 border-slate-200 bg-white/50">
               <label className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer", docs.proposal ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                  <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={uploading} />
                  {uploading ? <Loader2 className="animate-spin" size={40} /> : docs.proposal ? <CheckCircle2 size={40} /> : <FileUp size={40} />}
               </label>
               <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-900 italic">{docs.proposal ? 'Proposal Siap Dikirim' : 'Siap Kirim Proposal?'}</h4>
                  <p className="text-sm text-slate-400 font-medium">
                     {docs.proposal ? 'File PDF telah terunggah. Silakan klik tombol di bawah.' : 'Klik icon di atas untuk mengunggah proposal Anda.'}
                  </p>
               </div>
               <button 
                  onClick={handleEnroll}
                  disabled={!docs.proposal || uploading}
                  className="btn-primary w-full py-5 text-[10px] font-black tracking-widest uppercase shadow-xl disabled:opacity-20"
               >
                  {uploading ? 'Menunggu Unggahan...' : 'Ajukan Seminar Proposal'}
               </button>
            </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
           {registration.status === 'PENDING' && (
             <div className="card p-20 text-center space-y-6">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <h3 className="text-2xl font-bold text-slate-900 italic">Menunggu Review Admin</h3>
                <p className="text-slate-400">Proposal Anda sedang ditinjau oleh PPPM. Kami akan segera memberi kabar.</p>
             </div>
           )}

           {registration.status === 'REJECTED' && (
             <div className="card p-12 border-red-200 bg-red-50 text-center space-y-6">
                 <AlertCircle size={48} className="text-red-500 mx-auto" />
                 <div>
                    <h3 className="text-2xl font-bold text-red-900">Proposal Ditolak</h3>
                    <p className="text-red-700/60 font-medium mt-2">"{registration.rejectionReason || 'Format proposal tidak sesuai.'}"</p>
                 </div>
                 <button onClick={() => updateRegistration({ status: 'ENROLL' })} className="btn-primary bg-red-600 hover:bg-red-700 text-[10px]">Unggah Perbaikan</button>
             </div>
           )}

           {registration.status === 'APPROVED' && (
              <div className="card p-20 text-center space-y-6 bg-slate-50 border-dashed">
                 <Calendar className="text-primary opacity-20 mx-auto" size={80} />
                 <h3 className="text-2xl font-bold text-slate-900">Menunggu Jadwal Seminar</h3>
                 <p className="text-slate-400 max-w-sm mx-auto">Selamat! Proposal Anda telah disetujui. Admin sedang menjadwalkan waktu seminar Anda.</p>
              </div>
           )}

            {registration.status === 'SCHEDULED' && registration.schedule && (
               <div className="space-y-10">
                  <div className="card bg-slate-900 text-white p-10 overflow-hidden relative">
                     <div className="relative z-10 grid md:grid-cols-4 gap-10">
                        <div className="md:col-span-2 space-y-4">
                           <h3 className="text-3xl font-black italic underline decoration-primary underline-offset-8">Jadwal Seminar</h3>
                           <p className="text-slate-400 text-sm font-medium">Pastikan Anda hadir 15 menit sebelum waktu yang ditentukan dengan membawa naskah cetak.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 md:col-span-2">
                           <div>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Tanggal & Waktu</p>
                              <p className="text-lg font-bold">{registration.schedule.tanggal}</p>
                              <p className="text-xs text-slate-400">{registration.schedule.hari}, {registration.schedule.pukul} WIB</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Ruangan & Sifat</p>
                              <p className="text-lg font-bold">{registration.schedule.ruang}</p>
                              <p className="text-xs text-slate-400">Sifat: {registration.schedule.sifat}</p>
                           </div>
                        </div>
                     </div>
                     <BookOpen size={200} className="absolute -right-20 -bottom-20 text-white/5" />
                  </div>
                  
                  <div className="max-w-2xl mx-auto space-y-8">
                     <div className="text-center">
                        <h4 className="text-lg font-bold text-slate-900 italic">Selesaikan Berkas Pasca-Seminar</h4>
                        <p className="text-sm text-slate-400">Upload dokumentasi (min 3) dan catatan perbaikan (max 3) untuk mendapatkan nilai akhir.</p>
                     </div>
                     <div className="grid md:grid-cols-2 gap-4">
                        <label className={cn("card p-6 border-dashed flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-slate-50 transition-all text-center", postDocs.dokumentasi.length >= 3 ? "border-primary" : "text-slate-300")}>
                           <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handlePostUpload('dok', e.target.files[0])} disabled={!!uploadingPost} />
                           {uploadingPost === 'dok' ? <Loader2 className="animate-spin text-primary" /> : <Camera className={postDocs.dokumentasi.length >= 3 ? "text-primary" : ""} />}
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", postDocs.dokumentasi.length >= 3 ? "text-primary" : "text-slate-400")}>
                              {postDocs.dokumentasi.length >= 3 ? 'Dokumentasi Lengkap' : `Dokumentasi (${postDocs.dokumentasi.length}/3)`}
                           </span>
                        </label>
                        <label className={cn("card p-6 border-dashed flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-slate-50 transition-all text-center", postDocs.catatan.length > 0 ? "border-primary" : "text-slate-300")}>
                           <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handlePostUpload('cat', e.target.files[0])} disabled={!!uploadingPost} />
                           {uploadingPost === 'cat' ? <Loader2 className="animate-spin text-primary" /> : <FileText className={postDocs.catatan.length > 0 ? "text-primary" : ""} />}
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", postDocs.catatan.length > 0 ? "text-primary" : "text-slate-400")}>
                              {postDocs.catatan.length > 0 ? `Catatan (${postDocs.catatan.length}/3)` : 'Catatan Perbaikan'}
                           </span>
                        </label>
                     </div>
                     <button 
                        onClick={handleFinishSempro}
                        disabled={postDocs.dokumentasi.length < 3 || !!uploadingPost}
                        className="w-full py-5 btn-primary shadow-2xl disabled:opacity-20"
                     >
                        {uploadingPost ? 'Sedang Mengunggah...' : 'Simpan Dokumentasi Seminar'}
                     </button>
                  </div>
               </div>
            )}

           {registration.status === 'PROGRESS' && (
              <div className="card p-20 text-center space-y-6">
                 <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                 <h3 className="text-2xl font-bold text-slate-900 italic">Validasi Akhir Seminar</h3>
                 <p className="text-slate-400">Admin sedang memverifikasi dokumentasi dan catatan seminar proposal Anda.</p>
              </div>
           )}

           {registration.status === 'COMPLETED' && (
              <div className="max-w-4xl mx-auto space-y-10">
                 <div className="card p-12 bg-primary text-white text-center relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                       <CheckCircle2 size={64} className="mx-auto text-white opacity-40" />
                       <h2 className="text-4xl font-black italic tracking-tighter">SEMPRO SELESAI</h2>
                       <div className="inline-block px-10 py-3 bg-white text-primary rounded-full font-black text-3xl italic shadow-2xl">
                          NILAI: {registration.grade || 'A'}
                       </div>
                    </div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="card p-8 bg-slate-900 text-white space-y-4">
                       <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Unduh Berkas</h3>
                       <p className="text-slate-400 text-sm">Download surat keterangan telah melaksanakan seminar proposal untuk syarat skripsi.</p>
                       <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all">
                          <Download size={14} />
                          <span>SURAT KETERANGAN SEMPRO.PDF</span>
                       </button>
                    </div>
                    <div className="card p-8 flex flex-col justify-center space-y-4">
                       <div className="flex items-center space-x-3 text-slate-400">
                          <Info size={16} />
                          <p className="text-xs font-bold uppercase tracking-widest">Langkah Selanjutnya</p>
                       </div>
                       <p className="text-slate-600 text-xs leading-relaxed font-medium">
                          Anda sekarang dapat melakukan pendaftaran skripsi melalui menu Skripsi Pribadi. Pastikan tema proposal Anda sudah dimantapkan.
                       </p>
                    </div>
                 </div>
              </div>
           )}

        </AnimatePresence>
      )}
    </div>
  );
}
