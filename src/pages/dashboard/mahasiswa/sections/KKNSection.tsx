import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, Info, CheckCircle2, MapPin, Users, 
  Calendar, ArrowRight, Loader2, Clock, AlertCircle, Camera,
  BookOpen, Download, Trash2, Send, CloudDownload, Building2,
  ClipboardCheck, History, Plus, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { kknService, KKNRegistration, KKNStatus, KKNLogbook } from '@/src/services/kknService';
import { uploadToCloudinary } from '@/src/lib/cloudinary';
import { supabase } from '@/src/lib/supabase';
import StatusBadge from '@/src/components/ui/StatusBadge';

interface KKNSectionProps {
  type: 'REGULER' | 'MANDIRI';
}

export default function KKNSection({ type }: KKNSectionProps) {
  const [registration, setRegistration] = useState<KKNRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const data = await kknService.getRegistrationByStudent(userId, type);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [type, userId]);

  const handleEnroll = async () => {
    if (!userId) return;
    try {
      setActionLoading(true);
      const newReg: KKNRegistration = {
        id: crypto.randomUUID(), 
        studentId: userId,
        studentName: localStorage.getItem('user_name') || 'Student Academic',
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
      
      // Activity log
      try {
        await supabase.from('logbooks').insert({
          user_id: userId,
          activity: `Inisiasi Pendaftaran KKN ${type}`,
          is_approved: true
        });
      } catch (e) {}

      setRegistration(newReg);
      toast.success('Pendaftaran KKN Berhasil Dimulai');
    } catch (err: any) {
      toast.error('Gagal melakukan pendaftaran');
    } finally {
      setActionLoading(false);
    }
  };

  const updateRegistration = async (updates: Partial<KKNRegistration>, message?: string) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    try {
       setActionLoading(true);
       await kknService.updateRegistration(updated);
       setRegistration(updated);
       if (message) toast.success(message);
    } catch (e) {
       toast.error('Gagal memperbarui data');
    } finally {
       setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
       <Loader2 className="animate-spin text-primary" size={40} />
       <p>Syncing Community Mission Data...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Field Mission Unit</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            KKN {type}
          </h1>
          <p className="text-slate-500 font-medium pt-2">Pelaporan aktivitas pengabdian masyarakat dan monitoring logbook harian.</p>
        </div>
        {registration && (
          <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Current Status</span>
             <StatusBadge status={registration.status} />
          </div>
        )}
      </div>

      {!registration ? (
        <div className="card p-20 text-center space-y-8 border-dashed border-2 bg-white/50 relative overflow-hidden">
           <Building2 size={240} className="absolute -right-20 -bottom-20 text-primary/5 -rotate-12" />
           <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto shadow-inner relative z-10">
              <Calendar size={48} />
           </div>
           <div className="space-y-4 relative z-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Inisiasi Misi KKN</h2>
              <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed uppercase tracking-widest text-[10px] italic">
                 Belum ada data pendaftaran terdeteksi. Silakan aktifkan pendaftaran untuk memulai alur KKN {type}.
              </p>
           </div>
           <button onClick={handleEnroll} disabled={actionLoading} className="btn-primary px-16 py-6 text-[11px] font-black tracking-[0.4em] uppercase shadow-2xl relative z-10 transition-all hover:scale-105 active:scale-95">
              {actionLoading ? <Loader2 className="animate-spin" /> : 'BUAT PENDAFTARAN BARU'}
           </button>
        </div>
      ) : (
        <div className="space-y-12">
          <Stepper currentStatus={registration.status} />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={registration.status}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {registration.status === 'PENDING' && (
                <RegistrationPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}
              {registration.status === 'SUBMITTED' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Building2 size={160} /></div>
                   <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                   <div className="space-y-3 relative z-10">
                     <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Audit In Progress</h3>
                     <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Pendaftaran Anda sedang ditinjau oleh Admin PPPM. Notifikasi akan muncul saat status berubah.</p>
                   </div>
                </div>
              )}
              {registration.status === 'REJECTED' && (
                <div className="card p-16 border-red-200 bg-red-50 text-center space-y-8 shadow-2xl">
                   <AlertCircle size={80} className="text-red-500 mx-auto" />
                   <div>
                      <h3 className="text-3xl font-black text-red-900 italic tracking-tighter uppercase">Pendaftaran Ditolak</h3>
                      <p className="text-md font-bold text-red-700 mt-4 italic bg-white p-6 rounded-3xl shadow-sm inline-block border border-red-100">
                         "{registration.rejectionReason || 'Ada berkas yang tidak sesuai syarat.'}"
                      </p>
                   </div>
                   <button onClick={() => updateRegistration({ status: 'PENDING' }, 'Silakan perbaiki berkas')} className="btn-primary bg-red-600 px-12 h-16 shadow-xl shadow-red-200 uppercase font-black tracking-widest text-[11px]">Re-Upload Berkas</button>
                </div>
              )}
              {registration.status === 'APPROVED' && (
                <div className="space-y-10">
                   <div className="card bg-slate-900 text-white border-none p-12 relative overflow-hidden shadow-2xl">
                      <div className="absolute right-0 bottom-0 p-10 opacity-10 rotate-12"><MapPin size={180} className="text-primary" /></div>
                      <div className="flex items-start space-x-6 relative z-10">
                         <div className="p-6 bg-primary/20 rounded-[40px] shadow-sm text-primary backdrop-blur-md border border-primary/20">
                            <CheckCircle2 size={40} />
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Mission Authorized!</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Pendaftaran Anda telah divalidasi. Perhatikan detail penempatan di bawah.</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-12 pt-10 border-t border-white/5 relative z-10">
                         {[
                           { label: 'Deployed Location', value: registration.info?.lokasi, icon: MapPin },
                           { label: 'Tactical Group', value: registration.info?.kelompok, icon: Users },
                           { label: 'Assigned DPL', value: registration.info?.dpl, icon: BookOpen },
                           { label: 'Socialization Sync', value: registration.info?.tglSosialisasi, icon: History },
                         ].map((item, i) => (
                           <div key={i} className="space-y-2">
                             <div className="flex items-center space-x-2 text-primary">
                                <item.icon size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                             </div>
                             <p className="font-black text-xl italic text-white tracking-tighter">{item.value || 'UNASSIGNED'}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                   <button onClick={() => updateRegistration({ status: 'SURVEY' }, 'Tahap Survey Diaktifkan')} className="w-full h-24 card border-dashed bg-white border-primary/20 flex items-center justify-center space-x-4 text-primary hover:bg-primary/5 transition-all font-black text-[11px] uppercase tracking-[0.4em] shadow-xl group">
                      <MapPin size={24} className="group-hover:scale-125 transition-transform" />
                      <span>Proceed to Field Induction (Survey)</span>
                      <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                   </button>
                </div>
              )}
              {registration.status === 'SURVEY' && (
                <SurveyPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}
              {registration.status === 'SURVEY_PENDING' && (
                 <div className="card p-20 text-center space-y-8 bg-slate-900 border-none shadow-2xl text-white">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Survey Audit</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px]">Dokumentasi survey sedang ditinjau Admin PPPM.</p>
                 </div>
              )}
              {registration.status === 'RKL' && (
                <RKLPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}
              {registration.status === 'RKL_PENDING' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 border-none shadow-2xl text-white">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Strategic Review (RKL)</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px]">Rencana Kegiatan Lapangan sedang diverifikasi Admin.</p>
                 </div>
              )}
              {registration.status === 'DEPLOYMENT' && (
                <DeploymentPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}
              {registration.status === 'DEPLOYMENT_PENDING' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 border-none shadow-2xl text-white">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Departure Validation</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px]">Bukti pemberangkatan sedang diverifikasi.</p>
                 </div>
              )}
              {registration.status === 'LOGBOOK' && (
                <LogbookPhase registration={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}
              {registration.status === 'LPK' && (
                <LPKPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}
              {registration.status === 'LPK_PENDING' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 border-none shadow-2xl text-white">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Final Report Audit (LPK)</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px]">Laporan akhir sedang diverifikasi Admin PPPM.</p>
                 </div>
              )}
              {registration.status === 'GRADING' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 border-none shadow-2xl text-white">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Yudisium Pending</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px]">Admin sedang menginput nilai akhir Anda.</p>
                 </div>
              )}
              {registration.status === 'COMPLETED' && (
                <GradesPhase registration={registration} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Stepper({ currentStatus }: { currentStatus: KKNStatus }) {
  const steps = [
    { id: 'PENDING', label: 'Admission' },
    { id: 'SURVEY', label: 'Induction' },
    { id: 'RKL', label: 'Strategy' },
    { id: 'LOGBOOK', label: 'Operational' },
    { id: 'LPK', label: 'Final Report' },
    { id: 'COMPLETED', label: 'Yudisium' },
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
    <div className="card rounded-[40px] p-10 bg-white shadow-xl border-slate-100 overflow-x-auto side-scrollbar">
      <div className="flex flex-nowrap items-center min-w-[700px] justify-between px-6 relative">
        <div className="absolute top-[20px] left-[60px] right-[60px] h-[3px] bg-slate-100 z-0" />
        {steps.map((step, i) => (
          <div key={step.id} className="flex flex-col items-center space-y-5 relative z-10 w-28">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg transition-all duration-500",
              currentIndex === i ? "bg-slate-900 text-white scale-110 shadow-slate-900/20 ring-4 ring-primary/20" : 
              currentIndex > i ? "bg-primary text-white" : "bg-white border-2 border-slate-100 text-slate-300"
            )}>
              {currentIndex > i ? <CheckCircle2 size={24} /> : i + 1}
            </div>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] text-center italic",
              currentIndex >= i ? "text-slate-900" : "text-slate-400 opacity-50"
            )}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegistrationPhase({ reg, onUpdate, actionLoading }: { reg: KKNRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const reqs = [
    { id: 'transkrip', label: 'Transkrip Nilai (Lama)' },
    { id: 'pembayaran', label: 'Bukti Slip Pembayaran' },
    { id: 'krs', label: 'KRS Aktif (.PDF)' },
    { id: 'kesehatan', label: 'Check-up Kesehatan' },
    { id: 'foto', label: 'Pas Foto Tactical (3x4)' },
    { id: 'pernyataan', label: 'Sumpah Pernyataan' },
    { id: 'izinOrtu', label: 'Wali/Parental Consent' },
  ] as const;

  const handleFileChange = async (docId: string, file: File) => {
    try {
      setUploading(docId);
      const url = await uploadToCloudinary(file);
      const newDocs = { ...reg.docs, [docId]: url };
      onUpdate({ docs: newDocs }, 'Dokumen terarsip');
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const isComplete = reqs.every(r => reg.docs[r.id]);

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 ml-1 mb-6">
           <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><FileUp size={20} /></div>
           <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter underline decoration-primary/20 underline-offset-4">Admission Manifest</h3>
        </div>
        <div className="grid gap-4">
          {reqs.map((r) => (
            <label key={r.id} className={cn(
               "card p-6 flex items-center justify-between group cursor-pointer transition-all border-slate-100 hover:shadow-xl relative overflow-hidden",
               reg.docs[r.id] ? "bg-white border-primary/20" : "bg-white hover:border-primary/40"
            )}>
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileChange(r.id, e.target.files[0])} disabled={!!uploading} />
              <div className="flex items-center space-x-5">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  reg.docs[r.id] ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"
                )}>
                  {uploading === r.id ? <Loader2 className="animate-spin" size={20} /> : <FileUp size={20} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{r.label}</span>
                  {reg.docs[r.id] && (
                    <button onClick={(e) => { e.stopPropagation(); window.open(reg.docs[r.id] as string, '_blank'); }} className="text-[8px] font-black text-primary hover:underline text-left mt-1 uppercase tracking-[0.2em] italic">👁 View Secure Attachment</button>
                  )}
                </div>
              </div>
              {reg.docs[r.id] ? <CheckCircle2 className="text-primary animate-in zoom-in" size={24} /> : <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-lg">Action Required</div>}
            </label>
          ))}
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-3 ml-1 mb-6">
           <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><BookOpen size={20} /></div>
           <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter underline decoration-primary/20 underline-offset-4">Strategic Archives</h3>
        </div>
        <div className="card p-12 bg-slate-900 text-white overflow-hidden relative shadow-2xl border-none min-h-[500px] flex flex-col justify-between">
           <div className="absolute -right-16 -top-16 opacity-5 rotate-12 text-primary"><BookOpen size={300} /></div>
           <div className="space-y-10 relative z-10">
              {[
                { name: 'Template Rencana Lapangan (RKL)', link: '#' },
                { name: 'Template Pelaporan Hasil (LPK)', link: '#' },
                { name: 'Official KKN Handbook 2024', link: '#' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group border-b border-white/5 pb-8 last:border-0 last:pb-0">
                   <div className="flex flex-col">
                      <span className="text-lg font-black text-white italic tracking-tight">{item.name}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2 italic flex items-center"><CloudDownload size={12} className="mr-2" /> PDF / G-DOC SOURCE</span>
                   </div>
                   <button onClick={() => window.open(item.link, '_blank')} className="w-12 h-12 bg-white/5 text-primary border border-white/10 rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-lg"><Download size={20} /></button>
                </div>
              ))}
           </div>
           
           <div className="relative z-10 pt-10">
              <button 
                disabled={!isComplete || actionLoading} 
                onClick={() => onUpdate({ status: 'SUBMITTED' }, 'Pendaftaran resmi diajukan!')} 
                className={cn(
                  "w-full h-20 rounded-[28px] text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center",
                  isComplete ? "btn-primary hover:scale-[1.02] active:scale-95" : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                )}
              >
                {actionLoading ? <Loader2 className="animate-spin" /> : (
                  <>SUBMIT ADMISSION MANIFEST <Send size={20} className="ml-5" /></>
                )}
              </button>
              {!isComplete && (
                 <div className="flex items-center justify-center space-x-3 mt-6 text-orange-500/60 font-black text-[9px] uppercase tracking-widest italic animate-pulse">
                    <Info size={14} />
                    <span>Portal locked: Please complete all manifest uploads.</span>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

function SurveyPhase({ reg, onUpdate, actionLoading }: { reg: KKNRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [sosialisasi, setSosialisasi] = useState<string[]>(reg.surveyDocs?.sosialisasi || []);
  const [survei, setSurvei] = useState<string[]>(reg.surveyDocs?.survei || []);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (type: 'sos' | 'sur', file: File) => {
    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      if (type === 'sos') setSosialisasi(prev => [...prev, url].slice(0, 3));
      else setSurvei(prev => [...prev, url].slice(0, 3));
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 space-y-8">
          <div className="card p-10 bg-white space-y-10 shadow-xl border-slate-100">
             <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Induction Portofolio</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 italic pl-1">Capture field synchronization evidence</p>
                </div>
                <Users size={40} className="text-primary opacity-20" />
             </div>
             
             <div className="space-y-10">
                <div className="space-y-4">
                   <div className="flex items-center space-x-3 pl-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Village Official Socialization (Min 3 Assets)</p>
                   </div>
                   <div className="grid grid-cols-3 gap-6">
                      {[0, 1, 2].map(i => (
                        <label key={i} className={cn(
                          "aspect-[4/3] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden",
                          sosialisasi[i] ? "border-primary bg-primary/5 shadow-inner" : "bg-slate-50 border-slate-200 hover:border-primary/40 hover:bg-white"
                        )}>
                           <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('sos', e.target.files[0])} disabled={!!uploading} />
                           {sosialisasi[i] ? (
                              <img src={sosialisasi[i]} className="w-full h-full object-cover rounded-[28px] transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                           ) : (
                              uploading === 'sos' ? <Loader2 className="animate-spin text-primary" size={32} /> : <div className="flex flex-col items-center space-y-2 text-slate-300 group-hover:text-primary transition-colors"><Camera size={28} /> <span className="text-[9px] font-black uppercase">Attach</span></div>
                           )}
                           {sosialisasi[i] && (
                             <button onClick={(e) => { e.preventDefault(); setSosialisasi(s => s.filter((_, idx) => idx !== i)); }} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                               <Trash2 size={24} className="text-white" />
                             </button>
                           )}
                        </label>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center space-x-3 pl-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sector Site Survey (Min 3 Assets)</p>
                   </div>
                   <div className="grid grid-cols-3 gap-6">
                      {[0, 1, 2].map(i => (
                        <label key={i} className={cn(
                          "aspect-[4/3] rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden",
                          survei[i] ? "border-primary bg-primary/5 shadow-inner" : "bg-slate-50 border-slate-200 hover:border-primary/40 hover:bg-white"
                        )}>
                           <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('sur', e.target.files[0])} disabled={!!uploading} />
                           {survei[i] ? (
                              <img src={survei[i]} className="w-full h-full object-cover rounded-[28px] transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                           ) : (
                              uploading === 'sur' ? <Loader2 className="animate-spin text-primary" size={32} /> : <div className="flex flex-col items-center space-y-2 text-slate-300 group-hover:text-primary transition-colors"><Camera size={28} /> <span className="text-[9px] font-black uppercase">Attach</span></div>
                           )}
                           {survei[i] && (
                             <button onClick={(e) => { e.preventDefault(); setSurvei(s => s.filter((_, idx) => idx !== i)); }} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                               <Trash2 size={24} className="text-white" />
                             </button>
                           )}
                        </label>
                      ))}
                   </div>
                </div>
             </div>

             <button 
                onClick={() => onUpdate({ status: 'SURVEY_PENDING', surveyDocs: { sosialisasi, survei, status: 'PENDING' } }, 'Laporan Intel Survey Dikirim!')} 
                disabled={sosialisasi.length < 3 || survei.length < 3 || actionLoading} 
                className="w-full h-20 btn-primary uppercase tracking-[0.3em] font-black shadow-2xl disabled:opacity-20 text-[11px] rounded-[32px] group"
             >
                {actionLoading ? <Loader2 className="animate-spin" /> : (
                  <span className="flex items-center justify-center">SUBMIT INTELLIGENCE PORTFOLIO <ArrowRight size={20} className="ml-4 group-hover:translate-x-3 transition-transform" /></span>
                )}
             </button>
          </div>
       </div>

       <div className="space-y-8">
          <div className="card p-12 bg-slate-900 text-white space-y-8 relative overflow-hidden shadow-2xl border-none">
             <div className="absolute -top-10 -right-10 opacity-5 rotate-45"><MapPin size={240} className="text-primary" /></div>
             <div className="space-y-2 relative z-10">
                <h4 className="text-2xl font-black italic uppercase tracking-tighter">Strategic Protocol</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 italic">Induction Ground Rules</p>
             </div>
             <ul className="space-y-6 relative z-10">
                {[
                  "Foto wajib menampilkan aparat desa setempat.",
                  "Dokumentasi lokasi harus mencakup calon posko kegiatan.",
                  "Koordinasi dengan DPL via daring sebelum submit.",
                  "Validasi admin membutuhkan data visual yang kontras."
                ].map((t, i) => (
                  <li key={i} className="flex items-start space-x-4 group">
                     <div className="w-8 h-8 shrink-0 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[11px] font-black text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">{i+1}</div>
                     <p className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors leading-tight pt-1.5">{t}</p>
                  </li>
                ))}
             </ul>
          </div>
       </div>
    </div>
  );
}

function RKLPhase({ reg, onUpdate, actionLoading }: { reg: KKNRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [individu, setIndividu] = useState<string | null>(reg.rkl?.fileIndividu || null);
  const [kelompok, setKelompok] = useState<string | null>(reg.rkl?.fileKelompok || null);
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (type: 'ind' | 'kel', file: File) => {
    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      if (type === 'ind') setIndividu(url);
      else setKelompok(url);
      toast.success('Rencana Terunggah');
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const isReady = individu && kelompok;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
       <div className="text-center space-y-3">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-primary/30 underline-offset-8">Pelaporan RKL</h3>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic mt-4">Drafting your strategic mission directives</p>
       </div>

       <div className="grid md:grid-cols-2 gap-10">
          <label className={cn(
             "card p-12 flex flex-col items-center space-y-8 transition-all border-2 border-dashed relative overflow-hidden cursor-pointer group",
             individu ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 bg-white hover:border-primary/40 hover:bg-slate-50 shadow-xl"
          )}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('ind', e.target.files[0])} disabled={!!uploading} />
             <div className={cn("w-20 h-20 rounded-[32px] flex items-center justify-center transition-all", individu ? "bg-primary text-white" : "bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:text-primary")}>
                {uploading === 'ind' ? <Loader2 className="animate-spin" size={40} /> : <FileUp size={40} />}
             </div>
             <div className="text-center space-y-2">
                <p className="font-black italic text-2xl uppercase tracking-tighter">Individual RKL</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{individu ? 'Document Secured' : 'Attach PDF Manuscript'}</p>
             </div>
             {individu && <div className="absolute top-4 right-4"><CheckCircle2 className="text-primary animate-in zoom-in" size={24} /></div>}
          </label>

          <label className={cn(
             "card p-12 flex flex-col items-center space-y-8 transition-all border-2 border-dashed relative overflow-hidden cursor-pointer group",
             kelompok ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 bg-white hover:border-primary/40 hover:bg-slate-50 shadow-xl"
          )}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('kel', e.target.files[0])} disabled={!!uploading} />
             <div className={cn("w-20 h-20 rounded-[32px] flex items-center justify-center transition-all", kelompok ? "bg-primary text-white" : "bg-slate-50 text-slate-300 group-hover:scale-110 group-hover:text-primary")}>
                {uploading === 'kel' ? <Loader2 className="animate-spin" size={40} /> : <Users size={40} />}
             </div>
             <div className="text-center space-y-2">
                <p className="font-black italic text-2xl uppercase tracking-tighter">Group RKL</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kelompok ? 'Document Secured' : 'Attach Team Directive'}</p>
             </div>
             {kelompok && <div className="absolute top-4 right-4"><CheckCircle2 className="text-primary animate-in zoom-in" size={24} /></div>}
          </label>
       </div>

       <button 
          onClick={() => onUpdate({ status: 'RKL_PENDING', rkl: { fileIndividu: individu, fileKelompok: kelompok, status: 'PENDING' } }, 'Berkas RKL diajukan!')} 
          disabled={!isReady || actionLoading || !!uploading} 
          className="w-full h-24 btn-primary rounded-[40px] shadow-[0_20px_50px_rgba(var(--primary),0.3)] font-black uppercase text-[12px] tracking-[0.5em] disabled:opacity-20 flex items-center justify-center group"
       >
          {actionLoading ? <Loader2 className="animate-spin" /> : (
            <>AUTHORIZE MISSION STRATEGY <Send size={24} className="ml-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /></>
          )}
       </button>
    </div>
  );
}

function DeploymentPhase({ reg, onUpdate, actionLoading }: { reg: KKNRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      onUpdate({ status: 'DEPLOYMENT_PENDING', deploymentPhoto: url }, 'Bukti pemberangkatan terunggah!');
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12">
       <div className="card p-20 text-center space-y-10 border-none bg-slate-900 text-white relative overflow-hidden shadow-2xl rounded-[60px]">
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          <div className="absolute -left-10 -bottom-10 opacity-5 rotate-12"><Building2 size={240} className="text-white" /></div>
          
          <div className="relative z-10 w-32 h-32 bg-primary/20 rounded-[48px] flex items-center justify-center text-primary mx-auto border border-white/5 backdrop-blur-md">
             {uploading ? <Loader2 className="animate-spin" size={60} /> : <Camera size={60} />}
          </div>
          <div className="space-y-4 relative z-10">
             <h3 className="text-4xl font-black italic uppercase tracking-tighter">Pemberangkatan</h3>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] max-w-sm mx-auto leading-relaxed italic">
                Unggah dokumentasi resmi saat pelepasan atau pemberangkatan ke lokasi KKN untuk validasi operasional.
             </p>
          </div>
          
          <label className={cn(
             "w-full h-20 btn-primary rounded-[32px] shadow-2xl transition-all cursor-pointer flex items-center justify-center font-black uppercase text-[11px] tracking-[0.4em] relative z-10",
             uploading && "opacity-50 pointer-events-none"
          )}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading} />
             {uploading ? <Loader2 className="animate-spin mr-3" /> : <ClipboardCheck className="mr-4" />}
             {uploading ? 'Processing Archives...' : 'UPLOAD DEPLOYMENT PROOF'}
          </label>
       </div>
    </div>
  );
}

function LogbookPhase({ registration, onUpdate, actionLoading }: { registration: KKNRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
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
      toast.success('Foto dokumentasi logbook ok');
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.lokasi) return toast.error('Lengkapi data logbook');
    const hours = kknService.calculateHours(form.startTime!, form.endTime!);
    const newEntry: KKNLogbook = {
      id: crypto.randomUUID(),
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
    onUpdate(updated, 'Jurnal Aktivitas Tersimpan');
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
       <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-center bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
             <div>
               <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter leading-none">Mission Logs</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 italic pl-1 italic">Real-time daily reporting stream</p>
             </div>
             {!isAdding && (
               <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center space-x-3 px-10 py-4 rounded-[24px] shadow-2xl transition-all hover:scale-105 active:scale-95 group font-black uppercase text-[11px] tracking-widest">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span>Log Activity</span>
               </button>
             )}
          </div>

          <AnimatePresence>
          {isAdding && (
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleSubmit} className="card p-12 space-y-10 border-primary/30 bg-primary/5 shadow-2xl rounded-[48px] relative overflow-hidden border-none text-slate-900">
                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12"><ClipboardCheck size={120} /></div>
                <div className="grid md:grid-cols-2 gap-10 relative z-10">
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1 italic">TANGGAL OPERASI</label>
                         <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field h-16 font-bold bg-white text-slate-900" required />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1 italic">NAMA KEGIATAN TACTICAL</label>
                         <input type="text" placeholder="Detail kegiatan hari ini..." className="input-field h-16 bg-white text-slate-900 font-bold" onChange={e => setForm({...form, nama: e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">JAM MULAI</label>
                            <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input-field h-16 bg-white text-slate-900 font-bold" required />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">JAM SELESAI</label>
                            <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} className="input-field h-16 bg-white text-slate-900 font-bold" required />
                         </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">DESA & PIHAK TERKAIT</label>
                         <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="Lokasi..." className="input-field h-16 bg-white" onChange={e => setForm({...form, lokasi: e.target.value})} />
                            <input type="text" placeholder="Pihak Desa..." className="input-field h-16 bg-white" onChange={e => setForm({...form, pihakDesa: e.target.value})} />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] ml-1">DOKUMENTASI VISUAL (MAKS 3)</label>
                         <label className={cn(
                            "flex items-center justify-center p-12 bg-white/50 border-2 border-dashed border-primary/20 rounded-[40px] cursor-pointer hover:bg-white hover:border-primary/50 transition-all group overflow-hidden relative",
                            form.photos?.length === 3 && "pointer-events-none opacity-50"
                         )}>
                            <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={uploading || form.photos?.length === 3} />
                            {uploading ? <Loader2 className="animate-spin text-primary" size={32} /> : 
                             form.photos && form.photos.length > 0 ? <div className="flex flex-col items-center space-y-2 text-primary font-black uppercase text-[10px] tracking-widest"><CheckCircle2 size={24} /> <span>Assets Secured ({form.photos.length}/3)</span></div> :
                             <div className="flex flex-col items-center space-y-2 text-slate-400 group-hover:text-primary transition-colors"><Camera size={28} /> <span className="text-[10px] font-black uppercase tracking-widest">Attach Manifest</span></div>}
                         </label>
                         <div className="flex gap-4 mt-6">
                            {form.photos?.map((p, i) => (
                               <div key={i} className="w-16 h-16 rounded-[20px] bg-white border border-primary/10 overflow-hidden shadow-lg relative group/item">
                                  <img src={p} className="w-full h-full object-cover" />
                                  <button onClick={(e) => { e.preventDefault(); setForm(f => ({...f, photos: f.photos?.filter((_, idx) => idx !== i)})); }} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-all"><Trash2 size={16} className="text-white" /></button>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
                <div className="flex gap-6 relative z-10 pt-4">
                  <button type="submit" disabled={actionLoading || uploading} className="flex-grow h-20 btn-primary rounded-[32px] shadow-2xl font-black uppercase tracking-[0.4em] text-[12px]">{actionLoading ? <Loader2 className="animate-spin" /> : 'SAVE FIELD ENTRY'}</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="px-10 h-20 bg-white/10 text-slate-500 rounded-[32px] font-black uppercase text-[10px] tracking-widest border border-primary/10 hover:bg-white hover:text-primary transition-all">Cancel</button>
                </div>
            </motion.form>
          )}
          </AnimatePresence>

          <div className="space-y-8">
             <div className="flex items-center space-x-3 ml-2">
                <History size={18} className="text-primary opacity-50" />
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] italic">Historical Record of Activities</h4>
             </div>
             {registration.logbooks.length === 0 ? (
               <div className="card p-32 text-center text-slate-300 font-black uppercase tracking-widest text-[11px] italic border-dashed border-2 bg-slate-50/30">Intelligence stream silent. No activities logged yet.</div>
             ) : (
               <div className="space-y-6 pr-2 max-h-[800px] overflow-y-auto side-scrollbar">
                 {registration.logbooks.map(log => (
                   <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={log.id} className="card p-8 bg-white flex flex-col space-y-6 hover:shadow-2xl transition-all border-l-8 border-l-primary group">
                      <div className="flex justify-between items-start">
                         <div className="space-y-3">
                            <div className="flex items-center space-x-4">
                               <h5 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase group-hover:text-primary transition-colors">{log.nama}</h5>
                               <span className={cn(
                                 "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border",
                                 log.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" : log.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
                               )}>
                                 {log.status}
                               </span>
                            </div>
                            <div className="flex items-center space-x-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               <div className="flex items-center space-x-1.5"><Calendar size={12} className="text-primary" /> <span>{log.date}</span></div>
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                               <div className="flex items-center space-x-1.5"><Clock size={12} className="text-primary" /> <span>{log.hours.toFixed(1)} Hours Total</span></div>
                            </div>
                         </div>
                         <div className="flex gap-2">
                           {log.photos?.map((p, i) => (
                             <button key={i} onClick={() => window.open(p, '_blank')} className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:scale-110 transition-transform">
                                <img src={p} className="w-full h-full object-cover" />
                             </button>
                           ))}
                         </div>
                      </div>
                      <div className="flex items-center space-x-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-slate-50 pt-5"> 
                         <div className="flex items-center space-x-1.5"><MapPin size={12} /> <span>{log.lokasi}</span></div>
                         <div className="flex items-center space-x-1.5"><Users size={12} /> <span>Official: {log.pihakDesa}</span></div>
                      </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
       </div>

       <div className="space-y-8 lg:sticky lg:top-8 self-start">
          <div className="card bg-slate-900 border-none p-12 text-white relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] rounded-[50px]">
             <div className="absolute -top-10 -right-10 opacity-5 rotate-45"><Clock size={240} className="text-primary font-black" /></div>
             <div className="relative z-10 space-y-10">
                <div className="text-center">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Mission Progress</p>
                   <div className="text-[80px] font-black italic mt-4 leading-none tracking-tighter text-white">{currentHours.toFixed(1)}</div>
                   <p className="text-sm font-black text-slate-500 mt-2 uppercase tracking-widest">Total / {targetHours} Hours Target</p>
                </div>
                
                <div className="space-y-3">
                   <div className="h-6 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (currentHours / targetHours) * 100)}%` }} className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)] border-r-4 border-white/20" />
                   </div>
                   <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] italic text-primary">
                      <span>Live Stats</span>
                      <span>{Math.round((currentHours/targetHours)*100)}% Fulfilled</span>
                   </div>
                </div>

                {currentHours >= targetHours && (
                  <button onClick={() => onUpdate({ status: 'LPK' }, 'Syarat jam terpenuhi!')} className="w-full h-20 btn-primary bg-primary text-white border-none text-[12px] shadow-[0_20px_50px_rgba(var(--primary),0.3)] font-black uppercase tracking-[0.4em] rounded-[28px] animate-in zoom-in slide-in-from-bottom duration-700">UNLOCK FINAL REPORT PORTAL</button>
                )}
             </div>
          </div>
          
          <div className="card p-10 bg-white border-slate-100 shadow-sm space-y-6">
             <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] mb-4 italic pb-4 border-b border-slate-50">Operational Protocol</h5>
             <div className="space-y-6">
                {[
                  "Logbook disubmit setiap hari setelah kegiatan.",
                  "Wajib melampirkan minimal 1 dokumentasi visual.",
                  "Total minimal 126 jam untuk mendaftar LPK.",
                  "Admin memverifikasi setiap entri mingguan."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{item}</p>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}

function LPKPhase({ reg, onUpdate, actionLoading }: { reg: KKNRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [files, setFiles] = useState<{ individu: string | null, kelompok: string | null }>({ 
    individu: reg.lpk?.fileIndividu || null, 
    kelompok: reg.lpk?.fileKelompok || null 
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (type: 'ind' | 'kel', file: File) => {
    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      setFiles(prev => ({ ...prev, [type === 'ind' ? 'individu' : 'kelompok']: url }));
      toast.success('Laporan terunggah');
    } catch (error) { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const isReady = files.individu && files.kelompok;

  return (
    <div className="max-w-3xl mx-auto space-y-12">
       <div className="text-center space-y-4">
          <div className="w-32 h-32 bg-primary/10 rounded-[50px] flex items-center justify-center text-primary mx-auto shadow-inner mb-6">
             <CheckCircle2 size={64} />
          </div>
          <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic underline decoration-primary/20 underline-offset-8">Laporan Akhir (LPK)</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] italic max-w-lg mx-auto leading-relaxed mt-6">
             Congratulations! You have fulfilled the operational hours. Now, finalize and submit your synthesized mission reports.
          </p>
       </div>
       
       <div className="grid md:grid-cols-2 gap-8">
          <label className={cn(
             "h-44 card border-2 border-dashed flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer group relative overflow-hidden",
             files.individu ? "bg-primary/5 border-primary text-primary shadow-inner" : "bg-white border-slate-100 hover:border-primary/40 hover:bg-slate-50"
          )}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('ind', e.target.files[0])} disabled={!!uploading} />
             {uploading === 'ind' ? <Loader2 className="animate-spin" size={32} /> : files.individu ? <CheckCircle2 size={40} className="animate-in zoom-in" /> : <FileUp size={40} className="text-slate-300 group-hover:text-primary transition-colors" />}
             <span className="font-black text-[11px] uppercase tracking-widest">{uploading === 'ind' ? 'Archiving...' : files.individu ? 'Individu Archived' : 'Unggah LPK Individu'}</span>
          </label>
          <label className={cn(
             "h-44 card border-2 border-dashed flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer group relative overflow-hidden",
             files.kelompok ? "bg-primary/5 border-primary text-primary shadow-inner" : "bg-white border-slate-100 hover:border-primary/40 hover:bg-slate-50"
          )}>
             <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('kel', e.target.files[0])} disabled={!!uploading} />
             {uploading === 'kel' ? <Loader2 className="animate-spin" size={32} /> : files.kelompok ? <CheckCircle2 size={40} className="animate-in zoom-in" /> : <Users size={40} className="text-slate-300 group-hover:text-primary transition-colors" />}
             <span className="font-black text-[11px] uppercase tracking-widest">{uploading === 'kel' ? 'Archiving...' : files.kelompok ? 'Kelompok Archived' : 'Unggah LPK Kelompok'}</span>
          </label>
       </div>
       
       <button 
          disabled={!isReady || !!uploading || actionLoading} 
          onClick={() => onUpdate({ status: 'LPK_PENDING', lpk: { fileIndividu: files.individu, fileKelompok: files.kelompok, status: 'PENDING' } }, 'Laporan Akhir Diajukan!')} 
          className="w-full h-24 btn-primary rounded-[40px] shadow-[0_30px_60px_-15px_rgba(var(--primary),0.3)] font-black uppercase text-[12px] tracking-[0.5em] disabled:opacity-20 flex items-center justify-center group"
       >
          {actionLoading ? <Loader2 className="animate-spin" /> : (
            <>FINALIZE AND SUBMIT FOR YUDISIUM <ClipboardCheck size={28} className="ml-6 group-hover:scale-110 transition-transform" /></>
          )}
       </button>
    </div>
  );
}

function GradesPhase({ registration }: { registration: KKNRegistration }) {
   if (!registration.grades) return (
     <div className="card p-20 text-center bg-slate-900 border-none shadow-2xl text-white">
        <Loader2 className="animate-spin text-primary mx-auto mb-8" size={60} />
        <h3 className="text-4xl font-black italic tracking-tighter uppercase">Audit Finalization</h3>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 italic">Admiral board is currently finalizing your yudisium record.</p>
     </div>
   );

   const grades = [
      { name: 'Mission Planning (RKL)', score: registration.grades.rkl, weight: '5%' },
      { name: 'Field Execution Force', score: registration.grades.kinerja, weight: '70%' },
      { name: 'Synthesized Report (LPK)', score: registration.grades.lpk, weight: '15%' },
      { name: 'Tactical Defense (Responsi)', score: registration.grades.responsi, weight: '10%' },
   ];

   return (
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in zoom-in duration-1000">
         <div className="card p-16 text-center bg-slate-900 border-none text-white relative overflow-hidden rounded-[80px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="absolute -right-20 -bottom-20 opacity-5 rotate-12"><GraduationCap size={400} /></div>
            
            <div className="relative z-10 space-y-12">
               <div className="space-y-4">
                  <p className="text-[12px] font-black text-primary uppercase tracking-[0.6em] italic">Strategic Yudisium Achieved</p>
                  <div className="flex items-center justify-center space-x-10">
                     <div className="text-[140px] font-black italic text-white tracking-tighter leading-none">{registration.grades.total.toFixed(1)}</div>
                     <div className="w-[3px] h-32 bg-white/10" />
                     <div className="text-[120px] font-black italic text-primary tracking-tighter leading-none">{registration.grades.gradeText}</div>
                  </div>
               </div>
               
               <div className="grid md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
                  {grades.map((g, i) => (
                     <div key={i} className="space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] h-10 flex items-center justify-center text-center">{g.name}</p>
                        <p className="text-4xl font-black italic text-white leading-none tracking-tighter">{g.score}</p>
                        <p className="text-[9px] font-black text-primary opacity-50 uppercase tracking-widest">{g.weight} Weight</p>
                     </div>
                  ))}
               </div>
               
               <div className="pt-8">
                  <button onClick={() => window.print()} className="px-16 h-20 bg-white/5 border border-white/10 text-white rounded-[32px] font-black uppercase text-[12px] tracking-[0.5em] transition-all hover:bg-white/10 flex items-center justify-center mx-auto group">
                     <CloudDownload size={24} className="mr-6 group-hover:translate-y-1 transition-transform" />
                     GENERATE OFFICIAL RECORD
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
