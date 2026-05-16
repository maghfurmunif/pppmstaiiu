
import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, Info, CheckCircle2, MapPin, Users, 
  Calendar, ArrowRight, Loader2, Clock, AlertCircle, Camera
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { kknService, KKNRegistration, KKNStatus, KKNLogbook } from '@/src/services/kknService';
import { uploadToCloudinary } from '@/src/lib/cloudinary';
import { supabase } from '@/src/lib/supabase';

interface KKNSectionProps {
  type: 'REGULER' | 'MANDIRI';
}

export default function KKNSection({ type }: KKNSectionProps) {
  const [registration, setRegistration] = useState<KKNRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const data = await kknService.getRegistrationByStudent(userId, type);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [type, userId]);

  const handleEnroll = async () => {
    if (!userId) return;
    const newReg: KKNRegistration = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: userId,
      studentName: localStorage.getItem('user_name') || 'Student',
      type: type,
      status: 'PENDING',
      docs: {
         transkrip: false, pembayaran: false, krs: false, 
         kesehatan: false, foto: false, pernyataan: false, izinOrtu: false
      },
      logbooks: [],
      totalHours: 0
    };
    await kknService.saveRegistration(newReg);
    try {
      await supabase.from('logbooks').insert({
        user_id: userId,
        activity: `Mendaftar KKN ${type}`,
        is_approved: true
      });
    } catch (e) {
      console.error('Log activity error:', e);
    }
    setRegistration(newReg);
  };

  const updateRegistration = async (updates: Partial<KKNRegistration>) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    await kknService.updateRegistration(updated);
    setRegistration(updated);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs">
       <Loader2 className="animate-spin mb-4" size={32} />
       Syncing Data...
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Kuliah Kerja Nyata (KKN)</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            KKN {type}
          </h1>
          <p className="text-slate-500 font-medium">Monitoring dan pelaporan aktivitas pengabdian masyarakat Anda.</p>
        </div>
        <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Status</span>
           <span className={cn(
             "text-xs font-bold italic uppercase tracking-tighter",
             !registration ? "text-slate-300" : "text-primary"
           )}>
             {registration ? registration.status : 'NOT ENROLLED'}
           </span>
        </div>
      </div>

      {!registration ? (
        <EnrollStep onEnroll={handleEnroll} />
      ) : (
        <div className="space-y-10">
          <Stepper currentStatus={registration.status} />
          
          <AnimatePresence mode="wait">
            {registration.status === 'PENDING' && (
              <RegistrationStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'SUBMITTED' && (
              <PendingVerification message="Pendaftaran sedang ditinjau oleh Admin PPPM." />
            )}
            {registration.status === 'REJECTED' && (
              <RejectedStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'APPROVED' && (
              <ApprovedStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'SURVEY' && (
              <SurveyStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'SURVEY_PENDING' && (
              <PendingVerification message="Dokumentasi Survey sedang ditinjau Admin." />
            )}
            {registration.status === 'RKL' && (
              <RKLStep registration={registration} onUpdate={updateRegistration} />
            )}
             {registration.status === 'RKL_PENDING' && (
              <PendingVerification message="Rencana Kegiatan Lapangan (RKL) sedang ditinjau Admin." />
            )}
            {registration.status === 'DEPLOYMENT' && (
              <DeploymentStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'DEPLOYMENT_PENDING' && (
              <PendingVerification message="Dokumentasi Pemberangkatan sedang ditinjau Admin." />
            )}
            {registration.status === 'LOGBOOK' && (
              <LogbookStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'LPK' && (
              <LPKStep registration={registration} onUpdate={updateRegistration} />
            )}
            {registration.status === 'LPK_PENDING' && (
              <PendingVerification message="Laporan Pelaksanaan Kegiatan (LPK) sedang ditinjau Admin." />
            )}
            {registration.status === 'GRADING' && (
              <PendingVerification message="Admin sedang memasukkan penilaian akhir." />
            )}
            {registration.status === 'COMPLETED' && (
              <GradesStep registration={registration} />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Stepper({ currentStatus }: { currentStatus: KKNStatus }) {
  const steps = [
    { id: 'PENDING', label: 'Daftar' },
    { id: 'SURVEY', label: 'Survey' },
    { id: 'RKL', label: 'RKL' },
    { id: 'LOGBOOK', label: 'Logbook' },
    { id: 'LPK', label: 'LPK' },
    { id: 'COMPLETED', label: 'Nilai' },
  ];

  const getStepIndex = (status: KKNStatus) => {
    if (status === 'PENDING' || status === 'REJECTED') return 0;
    if (status === 'APPROVED' || status === 'SURVEY' || status === 'SURVEY_PENDING') return 1;
    if (status === 'RKL' || status === 'RKL_PENDING') return 2;
    if (status === 'DEPLOYMENT' || status === 'DEPLOYMENT_PENDING' || status === 'LOGBOOK') return 3;
    if (status === 'LPK' || status === 'LPK_PENDING') return 4;
    if (status === 'GRADING' || status === 'COMPLETED') return 5;
    return 0;
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="glass-morphism rounded-[32px] p-8 border-white/40 shadow-xl overflow-x-auto side-scrollbar">
      <div className="flex flex-nowrap items-center min-w-[700px] justify-between px-4 relative">
        <div className="absolute top-[20px] left-[40px] right-[40px] h-[2px] bg-slate-100 z-0" />
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center space-y-4 relative z-10 w-24">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg transition-all",
              currentIndex === i ? "bg-primary text-white scale-110 shadow-primary/30" : 
              currentIndex > i ? "bg-primary/20 text-primary" : "bg-slate-50 text-slate-300"
            )}>
              {currentIndex > i ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest text-center h-4",
              currentIndex >= i ? "text-primary" : "text-slate-400"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnrollStep({ onEnroll }: { onEnroll: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-12 text-center space-y-8 max-w-2xl mx-auto border-dashed border-2 border-slate-200 bg-white/50">
       <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto shadow-inner">
          <Calendar size={48} />
       </div>
       <div className="space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Mulai Perjalanan Anda</h2>
          <p className="text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
             Belum ada data pendaftaran untuk sesi KKN ini. Silakan klik tombol di bawah untuk mendaftarkan diri.
          </p>
       </div>
       <button onClick={onEnroll} className="btn-primary px-12 py-5 text-[10px] font-black tracking-[0.3em] uppercase shadow-2xl shadow-primary/30 scale-105 active:scale-95 transition-all">
          Daftar KKN Sekarang
       </button>
    </motion.div>
  );
}

function RegistrationStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const reqs = [
    { id: 'transkrip', label: 'Transkrip Nilai' },
    { id: 'pembayaran', label: 'Bukti Pembayaran' },
    { id: 'krs', label: 'KRS' },
    { id: 'kesehatan', label: 'Surat Kesehatan' },
    { id: 'foto', label: 'Pas Foto' },
    { id: 'pernyataan', label: 'Surat Pernyataan' },
    { id: 'izinOrtu', label: 'Izin Orang Tua' },
  ] as const;

  const handleFileChange = async (docId: string, file: File) => {
    try {
      setUploading(docId);
      const url = await uploadToCloudinary(file);
      const newDocs = { ...registration.docs, [docId]: url };
      onUpdate({ docs: newDocs });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  const isComplete = reqs.every(r => registration.docs[r.id]);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 italic ml-1">Unggah Dokumen Wajib</h3>
        <div className="grid gap-3">
          {reqs.map((r) => (
            <label key={r.id} className="card p-5 flex items-center justify-between group cursor-pointer hover:border-primary transition-all relative overflow-hidden">
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileChange(r.id, e.target.files[0])} 
                disabled={!!uploading}
              />
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  registration.docs[r.id] ? "bg-primary/10 text-primary" : "bg-slate-50 text-slate-300"
                )}>
                  {uploading === r.id ? <Loader2 className="animate-spin" size={16} /> : <FileUp size={16} />}
                </div>
                <span className="text-sm font-bold text-slate-700">{r.label}</span>
              </div>
              {registration.docs[r.id] ? (
                 <div className="flex items-center space-x-2">
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Uploaded</span>
                    <CheckCircle2 className="text-primary" size={18} />
                 </div>
              ) : <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Required • Klik untuk upload</div>}
              {uploading === r.id && <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/20 overflow-hidden"><motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1 }} className="h-full bg-primary" /></div>}
            </label>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 italic ml-1">Status Pengajuan</h3>
        <div className="card p-10 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
          <div className={cn(
             "w-20 h-20 rounded-full flex items-center justify-center border-4",
             isComplete ? "border-primary/20 text-primary" : "border-slate-100 text-slate-200"
          )}>
            {isComplete ? <CheckCircle2 size={40} /> : <FileUp size={40} />}
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-slate-900">Menunggu Submit</h4>
            <p className="text-sm text-slate-400 font-medium">
              {isComplete ? 'Semua berkas telah siap. Klik tombol di bawah untuk mengirim data ke Admin.' : 'Silakan lengkapi semua dokumen di samping untuk melanjutkan.'}
            </p>
          </div>
          <button 
            disabled={!isComplete} 
            onClick={() => onUpdate({ status: 'SUBMITTED' })} 
            className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
          >
            Ajukan Pendaftaran
          </button>
          <p className="text-[10px] text-slate-400 italic">Demo Mode: Admin will see your data in their dashboard.</p>
        </div>
      </div>
    </div>
  );
}

function RejectedStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  return (
    <div className="card p-10 border-red-200 bg-red-50/30 text-center space-y-6">
       <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
       </div>
       <div>
          <h3 className="text-2xl font-bold text-red-900">Pendaftaran Ditolak</h3>
          <p className="text-sm text-red-700/70 mt-2 italic font-medium bg-white p-4 rounded-xl shadow-sm inline-block">
             "{registration.rejectionReason || 'Ada berkas yang tidak sesuai.'}"
          </p>
       </div>
       <button onClick={() => onUpdate({ status: 'PENDING' })} className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-200">Perbaiki Berkas</button>
    </div>
  );
}

function ApprovedStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="card bg-green-50 border-green-200 p-8">
         <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600">
               <CheckCircle2 size={24} />
            </div>
            <div>
               <h3 className="font-bold text-green-900">Pendaftaran Disetujui!</h3>
               <p className="text-sm text-green-800/70 mt-1">Gunakan data di bawah ini untuk memulai survey lokasi.</p>
            </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-green-200/50">
            {[
              { label: 'Lokasi', value: registration.info?.lokasi },
              { label: 'Kelompok', value: registration.info?.kelompok },
              { label: 'DPL', value: registration.info?.dpl || 'Dr. Hanafi' },
              { label: 'Sosialisasi', value: registration.info?.tglSosialisasi },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-[10px] font-bold text-green-800/50 uppercase mb-1">{item.label}</div>
                <div className="font-bold text-green-900 text-sm italic">{item.value || '-'}</div>
              </div>
            ))}
         </div>
      </div>
      <button onClick={() => onUpdate({ status: 'SURVEY' })} className="w-full py-6 card border-dashed flex items-center justify-center space-x-3 text-primary hover:bg-primary/5 transition-all font-black text-xs uppercase tracking-[0.2em]">
         <MapPin size={20} />
         <span>Lanjut Ke Tahap Survey Lokasi</span>
      </button>
    </div>
  );
}

function SurveyStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  const [sosialisasi, setSosialisasi] = useState<string[]>(registration.surveyDocs?.sosialisasi || []);
  const [survei, setSurvei] = useState<string[]>(registration.surveyDocs?.survei || []);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (type: 'sos' | 'sur', file: File) => {
    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      if (type === 'sos') setSosialisasi(prev => [...prev, url].slice(0, 3));
      else setSurvei(prev => [...prev, url].slice(0, 3));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  const handleApply = () => {
     onUpdate({ 
       status: 'SURVEY_PENDING',
       surveyDocs: { sosialisasi, survei, status: 'PENDING' }
     });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
       <div className="card space-y-6">
          <h3 className="font-bold text-slate-800 italic">Dokumentasi Sosialisasi & Survey</h3>
          <div className="space-y-4">
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sosialisasi (Maks 3 Foto)</div>
                <div className="flex gap-2">
                   {[0, 1, 2].map(i => (
                     <label key={i} className={cn("flex-grow h-20 rounded-xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer overflow-hidden relative", sosialisasi[i] ? "border-primary" : "bg-slate-50 border-slate-200 text-slate-300")}>
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('sos', e.target.files[0])} disabled={!!uploading} />
                        {sosialisasi[i] ? (
                           <img src={sosialisasi[i]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                           uploading === 'sos' ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />
                        )}
                     </label>
                   ))}
                </div>
             </div>
             <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Survey Lokasi (Maks 3 Foto)</div>
                <div className="flex gap-2">
                   {[0, 1, 2].map(i => (
                     <label key={i} className={cn("flex-grow h-20 rounded-xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer overflow-hidden relative", survei[i] ? "border-primary" : "bg-slate-50 border-slate-200 text-slate-300")}>
                        <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('sur', e.target.files[0])} disabled={!!uploading} />
                        {survei[i] ? (
                           <img src={survei[i]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                           uploading === 'sur' ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />
                        )}
                     </label>
                   ))}
                </div>
             </div>
          </div>
          <button onClick={handleApply} disabled={sosialisasi.length < 3 || survei.length < 3} className="btn-primary w-full disabled:opacity-20 italic">Ajukan Dokumentasi</button>
       </div>
       <div className="card bg-slate-900 text-white p-10 flex flex-col justify-center space-y-4">
          <h4 className="text-xl font-black italic underline decoration-primary underline-offset-4">Panduan Survey</h4>
          <ul className="space-y-3 text-sm text-slate-400 font-medium">
             <li>• Ambil foto bersama aparat desa saat sosialisasi.</li>
             <li>• Ambil foto lokasi yang akan dijadikan pusat kegiatan.</li>
             <li>• Berkas akan diverifikasi oleh Admin sebelum masuk tahap RKL.</li>
          </ul>
       </div>
    </div>
  );
}

function RKLStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  const [individu, setIndividu] = useState<string | null>(registration.rkl?.fileIndividu || null);
  const [kelompok, setKelompok] = useState<string | null>(registration.rkl?.fileKelompok || null);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (type: 'ind' | 'kel', file: File) => {
    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      if (type === 'ind') setIndividu(url);
      else setKelompok(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Rencana Kegiatan Lapangan (RKL)</h3>
          <p className="text-slate-500 font-medium italic">Upload berkas RKL yang telah divalidasi oleh Dosen Pembimbing Lapangan.</p>
       </div>
       <div className="card divide-y divide-slate-100 p-0 overflow-hidden">
          <label className="p-8 flex justify-between items-center group cursor-pointer hover:bg-slate-50 transition-all">
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('ind', e.target.files[0])} disabled={!!uploading} />
             <div className="flex items-center space-x-4">
                <div className={cn("p-4 rounded-2xl transition-all", individu ? "bg-primary text-white" : "bg-slate-50 text-slate-300")}>
                   {uploading === 'ind' ? <Loader2 className="animate-spin" size={24} /> : <FileUp size={24} />}
                </div>
                <div>
                   <p className="font-bold text-slate-800 tracking-tight">Draf RKL Individu</p>
                   <p className="text-xs text-slate-400 font-medium">{individu ? 'Selesai Terupload' : 'PDF • Maks 5MB'}</p>
                </div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">{individu ? 'Ganti File' : 'Upload'}</span>
          </label>
          <label className="p-8 flex justify-between items-center group cursor-pointer hover:bg-slate-50 transition-all">
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('kel', e.target.files[0])} disabled={!!uploading} />
             <div className="flex items-center space-x-4">
                <div className={cn("p-4 rounded-2xl transition-all", kelompok ? "bg-primary text-white" : "bg-slate-50 text-slate-300")}>
                   {uploading === 'kel' ? <Loader2 className="animate-spin" size={24} /> : <FileUp size={24} />}
                </div>
                <div>
                   <p className="font-bold text-slate-800 tracking-tight">Draf RKL Kelompok</p>
                   <p className="text-xs text-slate-400 font-medium">{kelompok ? 'Selesai Terupload' : 'PDF • Maks 5MB'}</p>
                </div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">{kelompok ? 'Ganti File' : 'Upload'}</span>
          </label>
       </div>
       <button 
         onClick={() => onUpdate({ status: 'RKL_PENDING', rkl: { fileIndividu: individu, fileKelompok: kelompok, status: 'PENDING' } })} 
         disabled={!individu || !kelompok} 
         className="btn-primary w-full disabled:opacity-20"
       >
         {uploading ? 'Sedang Mengunggah...' : 'Kirim Berkas Ke Admin'}
       </button>
    </div>
  );
}

function DeploymentStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      onUpdate({ status: 'DEPLOYMENT_PENDING', deploymentPhoto: url });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-12 text-center space-y-10 border-dashed">
       <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-primary/10 rounded-[40px] animate-pulse" />
          <div className="relative w-full h-full flex items-center justify-center text-primary">
             {uploading ? <Loader2 className="animate-spin" size={48} /> : <Camera size={48} />}
          </div>
       </div>
       <div className="space-y-4">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Pemberangkatan</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
             Unggah foto Anda saat mengikuti acara pembekalan atau pemberangkatan resmi Kampus.
          </p>
       </div>
       <label className={cn("btn-primary bg-slate-900 text-white shadow-xl hover:scale-105 transition-all cursor-pointer inline-block mx-auto", uploading && "opacity-50 pointer-events-none")}>
          <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
          {uploading ? 'Mengunggah...' : 'Submit Dokumentasi'}
       </label>
    </div>
  );
}

function LogbookStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const targetHours = 126;
  const currentHours = registration.totalHours;

  const [form, setForm] = useState<Partial<KKNLogbook>>({
    date: new Date().toISOString().split('T')[0],
    jenis: 'INDIVIDU',
    startTime: '08:00',
    endTime: '12:00',
    photos: []
  });

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, photos: [...(prev.photos || []), url].slice(0, 3) }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const hours = kknService.calculateHours(form.startTime!, form.endTime!);
    const newEntry: KKNLogbook = {
      id: Math.random().toString(16),
      ...form as any,
      hours,
      status: 'PENDING',
      photos: form.photos || [],
      scanLogbook: form.photos?.[0] || 'scan'
    };
    const updated = {
       ...registration,
       logbooks: [newEntry, ...registration.logbooks],
       totalHours: registration.totalHours + hours
    };
    onUpdate(updated);
    setIsAdding(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      jenis: 'INDIVIDU',
      startTime: '08:00',
      endTime: '12:00',
      photos: []
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-900 italic flex items-center"><Clock className="mr-2 text-primary" size={20} /> Jurnal Aktivitas Harian</h3>
             <button onClick={() => setIsAdding(!isAdding)} className="btn-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">{isAdding ? 'Tutup Form' : 'Tambah Log'}</button>
          </div>

          {isAdding && (
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSubmit} className="card p-10 space-y-8 border-primary/20 bg-primary/5">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                         <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field mt-1" required />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kegiatan</label>
                         <input type="text" placeholder="Detail kegiatan hari ini..." className="input-field mt-1" onChange={e => setForm({...form, nama: e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mulai</label>
                            <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input-field mt-1" required />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selesai</label>
                            <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="input-field mt-1" required />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi & Pihak Desa</label>
                         <div className="grid grid-cols-2 gap-2 mt-1">
                            <input type="text" placeholder="Lokasi..." className="input-field" onChange={e => setForm({...form, lokasi: e.target.value})} />
                            <input type="text" placeholder="Pihak Desa..." className="input-field" onChange={e => setForm({...form, pihakDesa: e.target.value})} />
                         </div>
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dokumentasi (Maks 3)</label>
                         <label className={cn("card border-dashed p-10 bg-white/50 text-center hover:bg-white transition-all cursor-pointer relative overflow-hidden", uploading && "opacity-50")}>
                            <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
                            {uploading ? (
                               <Loader2 className="mx-auto text-primary animate-spin" size={32} />
                            ) : (
                               <FileUp className="mx-auto text-primary opacity-30" size={32} />
                            )}
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                               {uploading ? 'Mengunggah...' : `Upload Foto (${form.photos?.length}/3)`}
                            </p>
                         </label>
                         <div className="flex gap-2 mt-2">
                            {form.photos?.map((p, i) => (
                               <img key={i} src={p} className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm" referrerPolicy="no-referrer" />
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
                <button type="submit" className="btn-primary w-full shadow-2xl">Simpan Logbook Hari Ini</button>
            </motion.form>
          )}

          <div className="space-y-6">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic ml-1">Riwayat Logbook</h4>
             {registration.logbooks.length === 0 ? (
               <div className="card p-20 text-center text-slate-300 italic font-medium">Belum ada aktivitas yang dicatat.</div>
             ) : (
               <div className="space-y-4">
                 {registration.logbooks.map(log => (
                   <div key={log.id} className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all border-l-[6px] border-l-primary">
                      <div className="flex items-start space-x-4">
                         <div className="p-3 bg-slate-50 rounded-2xl text-primary font-black text-xs shrink-0">{log.date.split('-').reverse().slice(0,2).join('/')}</div>
                         <div className="space-y-1">
                            <h5 className="font-bold text-slate-900 tracking-tight italic">{log.nama}</h5>
                            <div className="flex items-center space-x-3 text-[10px] font-black uppercase text-slate-400">
                               <span className="flex items-center"><Clock size={10} className="mr-1"/> {log.hours.toFixed(1)} Jam</span>
                               <span className="flex items-center"><MapPin size={10} className="mr-1"/> {log.lokasi}</span>
                               <span className="px-2 py-0.5 rounded-full bg-slate-100 text-primary">{log.jenis}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <div className={cn(
                           "text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
                           log.status === 'APPROVED' ? "bg-green-100 text-green-600" : log.status === 'REJECTED' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"
                         )}>
                           {log.status}
                         </div>
                         <div className="flex -space-x-2">
                            {[1, 2].map(p => <div key={p} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />)}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
       </div>

       <div className="space-y-8">
          <div className="card bg-slate-900 border-none p-8 text-white relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <div>
                   <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Total Durasi</h5>
                   <div className="text-5xl font-black italic mt-1">{currentHours.toFixed(1)} <span className="text-sm font-bold opacity-30">/ {targetHours} Jam</span></div>
                </div>
                <div className="space-y-2">
                   <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (currentHours / targetHours) * 100)}%` }} className="h-full bg-primary shadow-[0_0_20px_rgba(136,164,124,0.5)]" />
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
                      <span>Progress</span>
                      <span>{Math.round((currentHours/targetHours)*100)}%</span>
                   </div>
                </div>
                {currentHours >= targetHours && (
                  <button onClick={() => onUpdate({ status: 'LPK' })} className="w-full btn-primary bg-primary text-white border-none py-4 text-[10px] shadow-2xl">Buka Fitur LPK</button>
                )}
             </div>
             <Clock size={160} className="absolute -right-12 -bottom-12 opacity-5 text-white" />
          </div>
          <div className="card p-6 bg-slate-50 border-none">
             <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 italic">Ringkasan Sistem</h5>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 font-medium">Logbooks Disetujui</span>
                   <span className="font-bold text-slate-900">{registration.logbooks.filter(l => l.status === 'APPROVED').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-400 font-medium">Sisa Jam Dibutuhkan</span>
                   <span className="font-bold text-primary">{Math.max(0, targetHours - currentHours).toFixed(1)} Jam</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function LPKStep({ registration, onUpdate }: { registration: KKNRegistration, onUpdate: (u: any) => void }) {
  const [files, setFiles] = useState<{ individu: string | null, kelompok: string | null }>({ 
    individu: registration.lpk?.fileIndividu || null, 
    kelompok: registration.lpk?.fileKelompok || null 
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (type: 'ind' | 'kel', file: File) => {
    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      setFiles(prev => ({ ...prev, [type === 'ind' ? 'individu' : 'kelompok']: url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-10 py-10">
       <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-[40px] flex items-center justify-center text-primary mx-auto">
             <CheckCircle2 size={48} />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Laporan KKN (LPK)</h3>
          <p className="text-slate-500 font-medium leading-relaxed italic">
             Selamat! Jam kerja Anda telah terpenuhi. Silakan unggah Laporan Pelaksanaan Kegiatan (LPK) Akhir.
          </p>
       </div>
       <div className="space-y-4">
          <label className={cn("w-full py-6 card border-dashed flex items-center justify-center space-x-3 transition-all cursor-pointer relative", files.individu ? "bg-primary/10 border-primary text-primary" : "text-slate-400")}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('ind', e.target.files[0])} disabled={!!uploading} />
             {uploading === 'ind' ? <Loader2 className="animate-spin" size={24} /> : <FileUp size={24} />}
             <span className="font-bold text-xs uppercase tracking-widest">{uploading === 'ind' ? 'Mengunggah...' : files.individu ? 'LPK Individu Terunggah' : 'Unggah LPK Individu'}</span>
          </label>
          <label className={cn("w-full py-6 card border-dashed flex items-center justify-center space-x-3 transition-all cursor-pointer relative", files.kelompok ? "bg-primary/10 border-primary text-primary" : "text-slate-400")}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('kel', e.target.files[0])} disabled={!!uploading} />
             {uploading === 'kel' ? <Loader2 className="animate-spin" size={24} /> : <FileUp size={24} />}
             <span className="font-bold text-xs uppercase tracking-widest">{uploading === 'kel' ? 'Mengunggah...' : files.kelompok ? 'LPK Kelompok Terunggah' : 'Unggah LPK Kelompok'}</span>
          </label>
       </div>
       <button 
         disabled={!files.individu || !files.kelompok || !!uploading} 
         onClick={() => onUpdate({ status: 'LPK_PENDING', lpk: { fileIndividu: files.individu, fileKelompok: files.kelompok, status: 'PENDING' } })} 
         className="btn-primary w-full py-5 shadow-2xl scale-105 active:scale-95 disabled:opacity-20"
       >
         {uploading ? 'Sedang Mengunggah...' : 'Finalisasi & Kirim Laporan Akhir'}
       </button>
    </div>
  );
}

function GradesStep({ registration }: { registration: KKNRegistration }) {
   if (!registration.grades) return <PendingVerification message="Nilai sedang divalidasi." />;

   const grades = [
      { name: 'Rencana Kegiatan (RKL)', score: registration.grades.rkl, weight: '5%' },
      { name: 'Kinerja Lapangan', score: registration.grades.kinerja, weight: '70%' },
      { name: 'Pelaksanaan (LPK)', score: registration.grades.lpk, weight: '15%' },
      { name: 'Responsi', score: registration.grades.responsi, weight: '10%' },
   ];

   return (
      <div className="max-w-4xl mx-auto space-y-10">
         <div className="card p-12 text-center bg-slate-900 border-none text-white relative overflow-hidden">
            <div className="relative z-10 space-y-2">
               <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Yudisium Akhir</h3>
               <div className="text-8xl font-black italic tracking-tighter text-white underline decoration-primary underline-offset-8">{registration.grades.gradeText}</div>
               <p className="text-xs font-bold text-slate-400 pt-6">Skor Akumulatif: {registration.grades.total.toFixed(2)}</p>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
         </div>

         <div className="grid md:grid-cols-2 gap-10">
            <div className="card space-y-6 bg-white p-8 border-slate-100 shadow-xl rounded-[32px]">
               <h4 className="font-bold text-slate-900 italic underline decoration-primary/30 underline-offset-4">Rincian Komponen</h4>
               <div className="space-y-4">
                  {grades.map((g, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 grow-on-hover">
                       <div>
                          <p className="font-bold text-slate-800 text-sm">{g.name}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Weight: {g.weight}</p>
                       </div>
                       <p className="text-xl font-black text-primary italic">{g.score}</p>
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex flex-col justify-between space-y-10">
               <div className="card bg-primary text-white p-10 flex flex-col items-center justify-center text-center space-y-6">
                  <CheckCircle2 size={48} className="text-white opacity-40" />
                   <div>
                      <h4 className="text-2xl font-black italic">KKN SELESAI</h4>
                      <p className="text-primary-foreground/60 text-sm font-medium mt-1">Anda telah menyelesaikan seluruh rangkaian Kuliah Kerja Nyata dengan sukses.</p>
                   </div>
               </div>
               <button className="btn-primary w-full py-5 flex items-center justify-center space-x-3 bg-slate-900 text-white border-none shadow-xl">
                  <FileUp size={18} className="text-primary" />
                  <span>Unduh Sertifikat Kelulusan</span>
               </button>
            </div>
         </div>
      </div>
   );
}

function PendingVerification({ message }: { message: string }) {
  return (
    <div className="card p-20 text-center space-y-8 bg-slate-50/50 border-dashed border-2 border-slate-200">
       <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
             <AlertCircle size={32} />
          </div>
       </div>
       <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Menunggu Verifikasi</h3>
          <p className="text-slate-400 font-medium italic">{message}</p>
       </div>
       <div className="pt-6">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sistem dalam tahap peninjauan manual oleh Admin PPPM.</p>
       </div>
    </div>
  );
}
