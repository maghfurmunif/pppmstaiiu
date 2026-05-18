import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, BookOpen, Clock, Calendar, CheckCircle2, 
  MapPin, User, MessageSquare, Camera, FileText, 
  Loader2, Download, ExternalLink, Info, AlertCircle,
  FlaskConical, CheckCircle, XCircle, Plus, Trash2,
  Users, ClipboardList, Send, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { penelitianService, PenelitianRegistration, PenelitianLogbook } from '@/src/services/penelitianService';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function PenelitianDosen() {
  const [registration, setRegistration] = useState<PenelitianRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const data = await penelitianService.getRegistrationByDosen(userId);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleEnroll = async () => {
    if (!userId) return;
    try {
      setActionLoading(true);
      const newReg: PenelitianRegistration = {
        id: crypto.randomUUID(), 
        dosenId: userId,
        dosenName: localStorage.getItem('user_name') || 'Dosen Academic',
        status: 'ENROLL',
        logbooks: []
      };
      await penelitianService.saveRegistration(newReg);
      setRegistration(newReg);
      toast.success('Workflow penelitian dimulai');
    } catch (e) {
      toast.error('Gagal memulai penelitian');
    } finally {
      setActionLoading(false);
    }
  };

  const updateRegistration = async (updates: Partial<PenelitianRegistration>, message?: string) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    try {
       setActionLoading(true);
       await penelitianService.saveRegistration(updated);
       setRegistration(updated);
       if (message) toast.success(message);
    } catch (e) {
       toast.error('Gagal menyimpan perubahan');
    } finally {
       setActionLoading(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Syncing Research Pipeline...</p>
     </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Research Pipeline</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Penelitian Dosen
          </h1>
          <p className="text-slate-500 font-medium pt-2">Manajemen riset, pengajuan proposal, dan publikasi ilmiah dosen.</p>
        </div>
        {registration && (
          <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Current Mode</span>
             <StatusBadge status={registration.status} />
          </div>
        )}
      </div>

      {!registration ? (
        <div className="card p-20 text-center space-y-8 border-dashed border-2 bg-white/50 relative overflow-hidden">
           <FlaskConical size={200} className="absolute -right-20 -bottom-20 text-primary/5 -rotate-12" />
           <FlaskConical size={64} className="mx-auto text-primary" />
           <div className="space-y-2 relative z-10">
              <h3 className="text-3xl font-black italic tracking-tighter uppercase">Inisiasi Riset Akademik</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">Ajukan proposal penelitian Anda ke PPPM untuk mendapatkan pendanaan, monitoring, dan dukungan publikasi.</p>
           </div>
           <button onClick={handleEnroll} disabled={actionLoading} className="btn-primary px-12 py-5 shadow-2xl relative z-10 transition-all hover:scale-105 active:scale-95">
             {actionLoading ? <Loader2 className="animate-spin" /> : 'Buat Pengajuan Penelitian Baru'}
           </button>
        </div>
      ) : (
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={registration.status}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {registration.status === 'ENROLL' && (
                <EnrollPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}

              {registration.status === 'REJECTED' && (
                <div className="card p-12 bg-red-50 border-red-100 flex flex-col items-center space-y-6 shadow-xl">
                   <AlertCircle size={64} className="text-red-500" />
                   <div className="text-center space-y-2">
                      <h3 className="text-3xl font-black italic text-red-900 uppercase tracking-tighter">Pengajuan Ditolak</h3>
                      <p className="text-red-600 font-bold italic underline decoration-red-200">Catatan: {registration.rejectionReason || 'Harap tinjau kembali proposal Anda.'}</p>
                   </div>
                   <button onClick={() => updateRegistration({ status: 'ENROLL' }, 'Silakan perbaiki proposal')} className="btn-primary bg-red-600 px-10 h-14 shadow-lg border-b-4 border-red-800">Re-Upload Proposal</button>
                </div>
              )}

              {registration.status === 'SUBMITTED' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><ClipboardList size={140} /></div>
                  <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Under Review</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Admin PPPM sedang mengaudit proposal penelitian Anda. Jadwal seminar proposal akan segera dipublikasikan di dashboard ini.</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="btn-primary bg-white/10 text-white border border-white/20 py-2 px-8 text-[10px] relative z-10 backdrop-blur-sm">Sync Status</button>
                </div>
              )}

              {registration.status === 'APPROVED' && registration.semproInfo && (
                <SemproSchedulePhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}

              {registration.status === 'SEMPRO_SUBMITTED' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 text-white border-none shadow-2xl">
                  <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                  <div className="space-y-3">
                     <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Validasi Bukti Seminar</h3>
                     <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Laporan dokumentasi & berita acara seminar proposal sedang diverifikasi oleh PPPM. </p>
                  </div>
                </div>
              )}

              {registration.status === 'PROGRESS' && (
                <PenelitianLogbookSection registration={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}

              {registration.status === 'RESULT_SUBMITTED' && (
                <div className="card p-20 text-center space-y-8 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 p-10 opacity-10 -rotate-12"><FlaskConical size={140} /></div>
                  <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Audit Laporan Hasil</h3>
                    <p className="text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">Hasil penelitian Anda akan segera dinilai untuk penjadwalan Seminar Hasil (Munaqosyah Dosen).</p>
                  </div>
                </div>
              )}

              {registration.status === 'RESULT_APPROVED' && registration.finalSemproInfo && (
                <ResultSchedulePhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}

              {registration.status === 'REVISION_SUBMITTED' && (
                 <RevisionPhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}

              {registration.status === 'PUBLICATION' && (
                 <PublicationChoicePhase reg={registration} onUpdate={updateRegistration} actionLoading={actionLoading} />
              )}

              {registration.status === 'COMPLETED' && (
                 <div className="max-w-4xl mx-auto space-y-10">
                    <div className="card p-12 bg-slate-900 text-white text-center relative overflow-hidden shadow-2xl border-none">
                       <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12 text-primary"><FlaskConical size={240} /></div>
                       <CheckCircle2 size={80} className="mx-auto mb-8 text-primary" />
                       <h2 className="text-5xl font-black italic mb-4 uppercase tracking-tighter">RISER ACHIEVED</h2>
                       <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">Research Completed successfully</p>
                       
                       <div className="mt-12 grid grid-cols-2 gap-6 text-left relative z-10">
                          <div className="p-6 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10">
                             <p className="text-[9px] font-black uppercase text-primary mb-2 tracking-widest">Publication Mode</p>
                             <p className="font-bold text-lg italic uppercase">{registration.publication?.method || 'PUBLIKASI MANDIRI'}</p>
                          </div>
                          <div className="p-6 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10">
                             <p className="text-[9px] font-black uppercase text-primary mb-2 tracking-widest">Archive ID</p>
                             <p className="font-bold text-lg italic">#{registration.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EnrollPhase({ reg, onUpdate, actionLoading }: { reg: PenelitianRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      onUpdate({ proposalFile: url }, 'Proposal terunggah');
    } catch (e) { toast.error('Gagal upload proposal'); }
    finally { setUploading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
       <div className="card p-10 bg-slate-900 text-white space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10"><FileText size={160} /></div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Proposal Submission</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Unggah draf proposal penelitian terbaru dalam format PDF untuk diverifikasi dewan pakar.</p>
          </div>
          
          <div className="space-y-4 relative z-10">
             <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] pl-1">Manuscript File (.PDF)</p>
             <label className={cn(
                "flex flex-col items-center justify-center p-12 rounded-[40px] border-2 border-dashed transition-all cursor-pointer group",
                reg.proposalFile ? "border-primary/50 bg-primary/10 shadow-inner" : "border-white/10 hover:border-primary/40 hover:bg-white/5"
             )}>
                <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={uploading} />
                {uploading ? <Loader2 size={40} className="animate-spin text-primary" /> : 
                 reg.proposalFile ? <div className="flex flex-col items-center space-y-3"><CheckCircle2 size={40} className="text-primary animate-in zoom-in" /> <span className="text-[10px] font-black uppercase tracking-widest text-primary">Proposal Cached</span></div> :
                 <div className="flex flex-col items-center space-y-3 text-slate-500 group-hover:text-slate-300"><FileUp size={40} /> <span className="text-[10px] font-black uppercase tracking-widest font-bold">Select PDF File</span></div>}
             </label>
          </div>

          <button 
            disabled={!reg.proposalFile || uploading || actionLoading}
            onClick={() => onUpdate({ status: 'SUBMITTED' }, 'Proposal diajukan!')}
            className="w-full h-16 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center relative z-10"
          >
            {actionLoading ? <Loader2 className="animate-spin" /> : 'SUBMIT PROPOSAL FOR AUDIT'}
          </button>
       </div>
       <div className="card p-12 flex flex-col justify-center space-y-8 border-slate-100 bg-white">
          <h4 className="text-2xl font-black italic text-slate-900 border-b border-slate-100 pb-4 uppercase tracking-tighter">Prosedur Riset</h4>
          <ul className="space-y-5">
             {[
               "Proposal disetujui & Penetapan Reviewer.",
               "Seminar Proposal & Validasi Bukti Seminar.",
               "Melaksanakan riset & Pencatatan Logbook Minimal 5 kali.",
               "Penyusunan Laporan Hasil & Seminar Hasil.",
               "Publikasi Jurnal / Buku & Finalisasi Berkas."
             ].map((t, i) => (
               <li key={i} className="flex items-start space-x-4 group">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">{i+1}</div>
                  <p className="text-sm font-bold text-slate-600 py-1 leading-tight">{t}</p>
               </li>
             ))}
          </ul>
       </div>
    </div>
  );
}

function SemproSchedulePhase({ reg, onUpdate, actionLoading }: { reg: PenelitianRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [proof, setProof] = useState<{ documentation: string[], notes: string }>({ documentation: [], notes: '' });
  const [uploading, setUploading] = useState(false);

  const handleDocs = async (files: FileList) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      setProof(prev => ({ ...prev, documentation: [...prev.documentation, ...urls] }));
      toast.success('Dokumentasi ditambahkan');
    } catch (e) { toast.error('Gagal upload dokumentasi'); }
    finally { setUploading(false); }
  };

  const handleNotes = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setProof(prev => ({ ...prev, notes: url }));
      toast.success('Berita acara terunggah');
    } catch (e) { toast.error('Gagal upload catatan'); }
    finally { setUploading(false); }
  };

  const isReady = proof.documentation.length >= 3 && proof.notes;

  return (
    <div className="space-y-10">
       <div className="card bg-slate-900 text-white p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Calendar size={160} /></div>
          <div className="flex justify-between items-center mb-10 relative z-10">
             <h3 className="text-3xl font-black italic uppercase tracking-tighter underline decoration-primary underline-offset-8">Seminar Proposal Presentation</h3>
             <span className="px-5 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary/30 backdrop-blur-sm">Official Schedule</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 relative z-10">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Venue</p>
                <p className="font-bold text-xl flex items-center space-x-2"><MapPin size={20} className="text-slate-500" /> <span>{reg.semproInfo?.lokasi}</span></p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Time & Date</p>
                <div className="font-bold text-xl flex items-center space-x-2">
                   <Calendar size={20} className="text-slate-500" /> <span>{reg.semproInfo?.tanggal}</span>
                </div>
                <p className="text-xs text-primary font-black ml-7 uppercase">{reg.semproInfo?.pukul} WIB</p>
             </div>
             {reg.semproInfo?.catatan && (
               <div className="space-y-1 col-span-2 md:col-span-1 border-l border-white/10 pl-8">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remarks</p>
                  <p className="text-sm text-slate-400 italic leading-relaxed font-medium">"{reg.semproInfo.catatan}"</p>
               </div>
             )}
          </div>
       </div>

       <div className="card p-10 space-y-10 bg-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
             <div className="space-y-1">
                <h4 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Upload Evidence</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Min 3 High-res Images & 1 Written Record (BA)</p>
             </div>
             <div className="flex gap-4">
                <label className="flex items-center space-x-2 px-6 py-3 bg-slate-50 hover:bg-primary/5 cursor-pointer rounded-2xl border border-slate-200 transition-all group">
                   <Camera size={18} className="text-primary group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Add Evidence ({proof.documentation.length})</span>
                   <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && handleDocs(e.target.files)} />
                </label>
                <label className="flex items-center space-x-2 px-6 py-3 bg-slate-50 hover:bg-primary/5 cursor-pointer rounded-2xl border border-slate-200 transition-all group">
                   <FileText size={18} className="text-primary group-hover:scale-125 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{proof.notes ? 'Notes Secured' : 'Attach Notes'}</span>
                   <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleNotes(e.target.files[0])} />
                </label>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4 bg-slate-50 rounded-[40px] border border-slate-100 min-h-[160px]">
             {proof.documentation.map((url, i) => (
                <div key={i} className="aspect-square rounded-3xl border bg-white relative group overflow-hidden shadow-sm">
                   <img src={url} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setProof(prev => ({...prev, documentation: prev.documentation.filter((_, idx) => idx !== i)}))} className="p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform"><Trash2 size={20} /></button>
                   </div>
                </div>
             ))}
             {proof.notes && (
                <div className="aspect-square rounded-3xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-6 shadow-inner text-center space-y-2">
                   <CheckCircle2 size={32} className="text-primary" />
                   <span className="text-[9px] font-black text-primary uppercase tracking-tighter leading-tight">Meeting Transcript Recorded</span>
                </div>
             )}
          </div>

          <button 
            disabled={!isReady || uploading || actionLoading}
            onClick={() => onUpdate({ status: 'SEMPRO_SUBMITTED', semproProof: { dokumentasi: proof.documentation, catatan: proof.notes } }, 'Bukti seminar dikirim!')}
            className="w-full h-20 btn-primary uppercase tracking-[0.25em] font-black shadow-2xl disabled:opacity-20 text-[11px] rounded-[32px] group"
          >
            {actionLoading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center justify-center">
                 SUBMIT SEMINAR PORTFOLIO <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
              </span>
            )}
          </button>
       </div>
    </div>
  );
}

function PenelitianLogbookSection({ registration, onUpdate, actionLoading }: { registration: PenelitianRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLog, setNewLog] = useState<Partial<PenelitianLogbook>>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    activity: '',
    note: ''
  });

  const handlePhoto = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setNewLog(prev => ({ ...prev, photo: url }));
      toast.success('Foto dokumentasi terunggah');
    } catch (e) { toast.error('Gagal upload dokumentasi'); }
    finally { setUploading(false); }
  };

  const saveLog = () => {
    if (!newLog.activity || !newLog.note) return toast.error('Lengkapi form logbook');
    const log: PenelitianLogbook = {
      id: crypto.randomUUID(),
      date: newLog.date!,
      time: newLog.time!,
      activity: newLog.activity!,
      note: newLog.note!,
      photo: newLog.photo || '',
      status: 'PENDING'
    };
    onUpdate({ logbooks: [log, ...registration.logbooks] }, 'Entry logbook disimpan');
    setIsAdding(false);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      activity: '',
      note: ''
    });
  };

  const approvedCount = registration.logbooks.filter(l => l.status === 'APPROVED').length;
  const isReadyForResults = approvedCount >= 5;

  const [uploadingResult, setUploadingResult] = useState(false);
  const handleResultFile = async (file: File) => {
     try {
       setUploadingResult(true);
       const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
       const url = await uploadToCloudinary(file);
       onUpdate({ resultFile: url, status: 'RESULT_SUBMITTED' }, 'Hasil penelitian diajukan!');
     } catch (e) { toast.error('Gagal upload hasil'); }
     finally { setUploadingResult(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
             <div>
                <h3 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">Activity Logbook</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic pl-1">Research in progress Monitoring</p>
             </div>
             {!isAdding && (
               <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center space-x-2 px-10 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-transform group">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">New Entry</span>
               </button>
             )}
          </div>

          <AnimatePresence>
          {isAdding && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card p-10 bg-slate-900 border-none shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10"><Plus size={80} className="text-white" /></div>
                <div className="grid grid-cols-2 gap-8 relative z-10">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Executing Date</label>
                      <input type="date" className="input-field bg-white/5 border-white/10 text-white h-14" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Time Range</label>
                      <input type="time" className="input-field bg-white/5 border-white/10 text-white h-14" value={newLog.time} onChange={e => setNewLog({...newLog, time: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-2 relative z-10">
                   <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Active Activity Title</label>
                   <input placeholder="Contoh: Analisis Data Statistik & Input Coding" className="input-field bg-white/5 border-white/10 text-white h-14" value={newLog.activity} onChange={e => setNewLog({...newLog, activity: e.target.value})} />
                </div>
                <div className="space-y-2 relative z-10">
                   <label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-1">Narrative Note / Findings</label>
                   <textarea placeholder="Deskripsikan hasil temuan atau progress hari ini..." className="input-field bg-white/5 border-white/10 text-white h-40 pt-4" value={newLog.note} onChange={e => setNewLog({...newLog, note: e.target.value})} />
                </div>
                
                <div className="flex items-center justify-between gap-6 relative z-10">
                   <label className="flex-grow flex items-center justify-center h-16 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all group">
                      {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                       newLog.photo ? <div className="flex items-center space-x-3 text-primary font-black uppercase text-[10px]"> <CheckCircle size={16} /> <span>Evidence Sealed</span> </div> :
                       <div className="flex items-center space-x-3 text-slate-500 group-hover:text-primary font-black uppercase text-[10px] transition-colors"> <Camera size={16} /> <span>Attach Documentation</span> </div>}
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                   </label>
                   <div className="flex space-x-4">
                      <button onClick={saveLog} disabled={actionLoading || uploading} className="btn-primary px-12 h-16 rounded-2xl shadow-xl uppercase font-black text-[11px] tracking-widest">{actionLoading ? <Loader2 className="animate-spin" /> : 'COMMIT ENTRY'}</button>
                      <button onClick={() => setIsAdding(false)} className="px-8 h-16 rounded-2xl bg-white/5 text-white font-black text-[10px] uppercase border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                   </div>
                </div>
             </motion.div>
          )}
          </AnimatePresence>

          <div className="space-y-6">
             {registration.logbooks.length === 0 ? (
               <div className="card p-20 text-center border-dashed border-2 text-slate-300 font-bold uppercase text-[11px] tracking-widest italic">Timeline empty. Start logging your progress.</div>
             ) : (
               registration.logbooks.map(log => (
                 <motion.div key={log.id} layout className="card p-8 bg-white flex flex-col space-y-6 hover:shadow-2xl transition-all border-slate-100 group">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                             <h5 className="text-xl font-black text-slate-900 italic tracking-tighter group-hover:text-primary transition-colors">{log.activity}</h5>
                             <span className={cn(
                               "px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border",
                               log.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" : log.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
                             )}>
                               {log.status}
                             </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] flex items-center space-x-3"> 
                             <div className="flex items-center space-x-1"><Calendar size={12} className="text-primary" /> <span>{log.date}</span> </div>
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                             <div className="flex items-center space-x-1"><Clock size={12} className="text-primary" /> <span>{log.time}</span></div>
                          </p>
                       </div>
                       {log.photo && (
                         <a href={log.photo} target="_blank" className="p-4 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-[20px] transition-all border border-slate-100 shadow-sm">
                            <Camera size={24} />
                         </a>
                       )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-[28px] italic border border-slate-50/80 shadow-inner">"{log.note}"</p>
                 </motion.div>
               ))
             )}
          </div>
       </div>

       <div className="space-y-8">
          <div className="card p-12 bg-slate-900 text-white text-center space-y-10 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
             <div className="absolute -top-10 -right-10 opacity-10 rotate-45"><FlaskConical size={200} className="text-primary" /></div>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] relative z-10 italic">Performance Index</p>
             <div className="flex items-end justify-center space-x-3 relative z-10 leading-none">
                <span className="text-[100px] font-black italic text-white tracking-tighter">{approvedCount}</span>
                <span className="text-4xl font-black text-slate-700 pb-4">/ 5</span>
             </div>
             <p className="text-xs text-slate-400 font-medium relative z-10 max-w-[200px] mx-auto leading-relaxed italic border-t border-white/10 pt-6">Admin harus memvalidasi minimal 5 logbook aktif untuk membuka gerbang laporan hasil.</p>
             
             {isReadyForResults && (
                <div className="pt-8 space-y-6 relative z-10">
                   <div className="space-y-4">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
                         <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                         <span>Milestone Ready</span>
                      </div>
                      <label className="flex flex-col items-center justify-center p-8 bg-white/5 border-2 border-dashed border-white/20 rounded-[32px] cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all group">
                        {uploadingResult ? <Loader2 className="animate-spin text-primary" /> : 
                         <div className="flex flex-col items-center space-y-3">
                           <FileUp size={40} className="text-primary group-hover:scale-125 transition-transform" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Publish Results (.PDF)</span>
                         </div>}
                        <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleResultFile(e.target.files[0])} disabled={uploadingResult} />
                      </label>
                   </div>
                </div>
             )}
          </div>
          
          <div className="card p-8 bg-white border-slate-100 shadow-sm space-y-5">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic border-b border-slate-50 pb-3">Strategic Protocol</h4>
             <div className="space-y-5">
                {[
                  "Submit final Research Manuscript (PDF).",
                  "Wait for PPPM Peer Review (Status Result).",
                  "Finalize Presentation and Public Defense.",
                  "Publish to National/International Journals."
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle size={14} className="text-primary shrink-0 mt-1" />
                    <p className="text-xs text-slate-600 font-bold leading-tight">{item}</p>
                  </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}

function ResultSchedulePhase({ reg, onUpdate, actionLoading }: { reg: PenelitianRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [proof, setProof] = useState<{ documentation: string[], notes: string }>({ documentation: [], notes: '' });
  const [uploading, setUploading] = useState(false);

  const handleDocs = async (files: FileList) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      setProof(prev => ({ ...prev, documentation: [...prev.documentation, ...urls] }));
      toast.success('Evidence documentation added');
    } catch (e) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleNotes = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setProof(prev => ({ ...prev, notes: url }));
      toast.success('Meeting transcript recorded');
    } catch (e) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const isReady = proof.documentation.length >= 3 && proof.notes;

  return (
    <div className="space-y-10">
       <div className="card bg-slate-900 text-white p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 -translate-y-10"><Users size={200} /></div>
          <div className="flex justify-between items-center mb-12 relative z-10">
             <div>
                <h3 className="text-4xl font-black italic underline decoration-primary underline-offset-8 uppercase tracking-tighter leading-none">Munaqosyah Dosen <br/> (Seminar Hasil)</h3>
                <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mt-6 italic">Final Academic Defense Schedule</p>
             </div>
             <Calendar className="text-primary" size={64} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
             <div className="space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Venue & Platform</p>
                <div className="space-y-0.5">
                   <p className="font-bold text-xl">{reg.finalSemproInfo?.lokasi}</p>
                   <p className="text-xs text-slate-400 font-bold italic tracking-tight">{reg.finalSemproInfo?.tanggal}</p>
                </div>
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Examiner Panel</p>
                <p className="font-bold text-xl italic tracking-tighter uppercase leading-tight">{reg.finalSemproInfo?.panelis}</p>
             </div>
             <div className="space-y-2 col-span-2 border-l border-white/10 pl-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Administrative Note</p>
                <p className="text-sm text-slate-400 italic leading-relaxed font-medium">"{reg.finalSemproInfo?.infoLain || 'Harap membawa naskah revisi hardcopy sebanyak 3 rangkap.'}"</p>
             </div>
          </div>
       </div>

       <div className="card p-12 space-y-10 bg-white shadow-xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
             <div className="space-y-1">
                <h4 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Record of Activity</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] italic pl-1">Validation of final public Defense and Exam</p>
             </div>
             <div className="flex gap-4">
                <label className="flex items-center space-x-3 px-8 py-4 bg-slate-50 hover:bg-primary/5 cursor-pointer rounded-3xl border border-slate-200 transition-all font-black uppercase text-[11px] tracking-widest group">
                   <Camera size={20} className="text-primary group-hover:scale-125 transition-transform" />
                   <span>Add Photos ({proof.documentation.length}/3)</span>
                   <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && handleDocs(e.target.files)} />
                </label>
                <label className="flex items-center space-x-3 px-8 py-4 bg-slate-50 hover:bg-primary/5 cursor-pointer rounded-3xl border border-slate-200 transition-all font-black uppercase text-[11px] tracking-widest group">
                   <FileText size={20} className="text-primary group-hover:scale-125 transition-transform" />
                   <span>Minutes ({proof.notes ? 1 : 0}/1)</span>
                   <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleNotes(e.target.files[0])} />
                </label>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 p-10 bg-slate-50 rounded-[50px] border border-slate-100 min-h-[220px]">
             {proof.documentation.map((url, i) => (
                <div key={i} className="aspect-square rounded-[36px] bg-white border border-slate-100 p-2 shadow-sm group relative overflow-hidden">
                   <img src={url} className="w-full h-full object-cover rounded-[28px] transition-transform group-hover:scale-105" />
                   <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => setProof(prev => ({...prev, documentation: prev.documentation.filter((_, idx) => idx !== i)}))} className="p-4 bg-red-600 text-white rounded-3xl shadow-2xl hover:scale-110 transition-transform"><Trash2 size={24} /></button>
                   </div>
                </div>
             ))}
             {proof.notes && (
                <div className="aspect-square rounded-[36px] border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center p-8 space-y-3 text-center shadow-inner">
                   <CheckCircle2 size={40} className="text-primary" />
                   <span className="text-[10px] font-black text-primary uppercase tracking-tighter leading-tight">OFFICIAL TRANSCRIPT <br/> SECURED</span>
                </div>
             )}
          </div>

          <button 
            disabled={!isReady || uploading || actionLoading}
            onClick={() => onUpdate({ status: 'REVISION_SUBMITTED', finalSemproProof: { dokumentasi: proof.documentation, catatan: proof.notes } }, 'Bukti seminar hasil terkirim!')}
            className="w-full h-20 btn-primary uppercase tracking-[0.3em] font-black shadow-2xl disabled:opacity-20 text-[12px] rounded-[36px] h-20 flex items-center justify-center group"
          >
            {actionLoading ? <Loader2 className="animate-spin text-white" /> : (
              <>
                FINALIZE AND SUBMIT DEFENSE PORTFOLIO 
                <ArrowRight size={20} className="ml-4 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
       </div>
    </div>
  );
}

function RevisionPhase({ reg, onUpdate, actionLoading }: { reg: PenelitianRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      onUpdate({ finalRevisionFile: url }, 'File revisi siap dikirim');
    } catch (e) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
       <div className="card p-16 bg-white border-none shadow-2xl space-y-12 text-center rounded-[60px] relative overflow-hidden">
          <div className="absolute -top-10 -left-10 opacity-5 rotate-12 shadow-inner"><BookOpen size={240} className="text-primary" /></div>
          <div className="space-y-3 relative z-10">
            <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-slate-900 underline decoration-primary/20 underline-offset-8">Pelaporan Hasil Final</h3>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 italic">Submission of post-defense revised manuscript</p>
          </div>
          
          <label className={cn(
             "flex flex-col items-center justify-center p-20 rounded-[64px] border-2 border-dashed transition-all cursor-pointer group shadow-inner relative z-10",
             reg.finalRevisionFile ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5" : "border-slate-100 hover:border-primary/40 hover:bg-slate-50"
          )}>
             <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={uploading} />
             {uploading ? <Loader2 size={64} className="animate-spin text-primary" /> : 
              reg.finalRevisionFile ? <div className="flex flex-col items-center space-y-4 animate-in zoom-in h-40 justify-center"><CheckCircle size={80} className="text-primary" /> <span className="font-black uppercase text-primary text-xs tracking-[0.3em]">MANUSCRIPT READY</span></div> :
              <div className="flex flex-col items-center space-y-4 text-slate-300 group-hover:text-primary transition-colors h-40 justify-center"><FileUp size={80} /> <span className="font-black uppercase text-slate-400 group-hover:text-primary text-xs tracking-[0.3em] transition-colors">Select Final Laporan (.PDF)</span></div>}
          </label>

          {reg.rejectionReason && (
             <div className="p-8 bg-red-50 border border-red-100 rounded-[36px] text-left flex items-start space-x-6 relative z-10 animate-in slide-in-from-bottom">
                <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
                <div className="space-y-1">
                   <p className="text-[11px] font-black uppercase text-red-400 tracking-[0.25em] italic">Official Audit Rejection Note</p>
                   <p className="text-md font-bold text-red-900 italic leading-relaxed">"{reg.rejectionReason}"</p>
                </div>
             </div>
          )}

          <button 
            disabled={!reg.finalRevisionFile || uploading || actionLoading}
            onClick={() => onUpdate({ status: 'REVISION_SUBMITTED' }, 'Laporan final dikirim!')}
            className="w-full h-20 btn-primary rounded-[36px] font-black uppercase tracking-[0.4em] shadow-2xl disabled:opacity-20 flex items-center justify-center space-x-4 relative z-10 group"
          >
             {actionLoading ? <Loader2 className="animate-spin" /> : (
               <>
                 <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                 <span>UPLOAD REPORT TO PPPM ARCHIVE</span>
               </>
             )}
          </button>
       </div>
    </div>
  );
}

function PublicationChoicePhase({ reg, onUpdate, actionLoading }: { reg: PenelitianRegistration, onUpdate: (u: any, m?: string) => void, actionLoading: boolean }) {
  const [choice, setChoice] = useState<'MANDIRI' | 'PPPM' | null>(null);
  const [method, setMethod] = useState('');
  const [other, setOther] = useState('');

  const methods = ['Jurnal', 'Buku', 'Prosiding', 'Lainnya'];

  const finalize = () => {
    if (!choice) return;
    const finalMethod = choice === 'MANDIRI' ? 'PUBLIKASI MANDIRI' : (method === 'Lainnya' ? other : method);
    if (choice === 'PPPM' && !finalMethod) return toast.error('Pilih metode publikasi');
    
    onUpdate({ 
      status: 'COMPLETED',
      publication: { type: choice, method: finalMethod }
    }, 'Penelitian Selesai & Terklasifikasi!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
       <div className="text-center space-y-3">
          <h2 className="text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Rencana Publikasi Luaran</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">Post-research publication strategy selection</p>
       </div>

       <div className="grid grid-cols-2 gap-10">
          <button 
            onClick={() => setChoice('MANDIRI')}
            className={cn(
              "card p-12 flex flex-col items-center space-y-8 transition-all border-4 rounded-[48px] group",
              choice === 'MANDIRI' ? "border-primary bg-primary/5 shadow-2xl scale-[1.05]" : "border-transparent bg-white hover:border-slate-100 hover:shadow-xl"
            )}
          >
             <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-all", choice === 'MANDIRI' ? "bg-primary text-white" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100")}>
                <User size={40} />
             </div>
             <div className="text-center space-y-2">
                <h4 className="font-black italic text-2xl uppercase tracking-tighter">MANDIRI</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Dosen menerbitkan secara personal <br/> & memelihara arsip pribadi</p>
             </div>
          </button>
          
          <button 
            onClick={() => setChoice('PPPM')}
            className={cn(
              "card p-12 flex flex-col items-center space-y-8 transition-all border-4 rounded-[48px] group",
              choice === 'PPPM' ? "border-primary bg-primary/5 shadow-2xl scale-[1.05]" : "border-transparent bg-white hover:border-slate-100 hover:shadow-xl"
            )}
          >
             <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center transition-all", choice === 'PPPM' ? "bg-primary text-white" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100")}>
                <FlaskConical size={40} />
             </div>
             <div className="text-center space-y-2">
                <h4 className="font-black italic text-2xl uppercase tracking-tighter">ARCHIVE PPPM</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Diterbitkan institusi, didampingi proses <br/> & masuk database jurnal STAI IU</p>
             </div>
          </button>
       </div>

       <AnimatePresence>
       {choice === 'PPPM' && (
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="card p-12 space-y-10 bg-slate-50 border-none shadow-inner rounded-[48px]">
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] text-center italic">Selection: Media of Dissemination</p>
            <div className="grid grid-cols-2 gap-6">
               {methods.map(m => (
                 <button 
                   key={m} 
                   onClick={() => setMethod(m as any)}
                   className={cn(
                     "h-16 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all border shadow-sm",
                     method === m ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-primary/40 hover:text-primary"
                   )}
                 >{m}</button>
               ))}
            </div>
            {method === 'Lainnya' && (
              <input 
                placeholder="Spesifikasikan media publikasi lainnya..." 
                className="input-field h-14 bg-white shadow-sm border-slate-100" 
                value={other} 
                onChange={e => setOther(e.target.value)}
              />
            )}
         </motion.div>
       )}
       </AnimatePresence>

       {choice && (
         <button 
           onClick={finalize}
           disabled={actionLoading}
           className="w-full h-24 btn-primary rounded-[48px] font-black uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(var(--primary),0.3)] relative group overflow-hidden text-[13px]"
         >
            {actionLoading ? <Loader2 className="animate-spin" /> : (
              <>
                <span className="relative z-10">ARCHIVE AND COMPLETE PROJECT</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </>
            )}
         </button>
       )}
    </div>
  );
}
