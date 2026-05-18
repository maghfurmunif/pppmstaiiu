
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, BookOpen, Clock, Calendar, CheckCircle2, 
  MapPin, User, MessageSquare, Camera, FileText, 
  Loader2, Download, ExternalLink, Info, AlertCircle,
  FlaskConical, CheckCircle, XCircle, Plus, Trash2,
  Users, ClipboardList, Send
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { penelitianService, PenelitianRegistration, PenelitianLogbook, PenelitianStatus } from '@/src/services/penelitianService';

export default function PenelitianDosen() {
  const [registration, setRegistration] = useState<PenelitianRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const data = await penelitianService.getRegistrationByDosen(userId);
      setRegistration(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleEnroll = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const newReg: PenelitianRegistration = {
        id: crypto.randomUUID(), 
        dosenId: userId,
        dosenName: localStorage.getItem('user_name') || 'Dosen Academic',
        status: 'ENROLL',
        logbooks: []
      };
      await penelitianService.saveRegistration(newReg);
      setRegistration(newReg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateRegistration = async (updates: Partial<PenelitianRegistration>) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    setRegistration(updated);
    try {
       await penelitianService.saveRegistration(updated);
    } catch (e) {
       console.error('Save failed:', e);
    }
  };

  if (loading) return null;

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
        <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Stage</span>
           <span className="text-xs font-black text-primary uppercase italic tracking-tighter">
             {registration?.status || 'NOT_ENROLLED'}
           </span>
        </div>
      </div>

      {!registration ? (
        <div className="card p-20 text-center space-y-8 border-dashed border-2 bg-white/50">
           <FlaskConical size={64} className="mx-auto text-primary/20" />
           <div className="space-y-2">
              <h3 className="text-2xl font-black italic">Mulai Riset Baru</h3>
              <p className="text-slate-400 font-medium">Ajukan proposal penelitian Anda ke PPPM untuk mendapatkan pendanaan dan dukungan publikasi.</p>
           </div>
           <button onClick={handleEnroll} className="btn-primary px-12 py-5 shadow-2xl">Buat Pengajuan Penelitian</button>
        </div>
      ) : (
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            {registration.status === 'ENROLL' && (
              <EnrollPhase reg={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'REJECTED' && (
              <div className="card p-12 bg-red-50 border-red-100 flex flex-col items-center space-y-6">
                 <AlertCircle size={64} className="text-red-500" />
                 <div className="text-center">
                    <h3 className="text-2xl font-black italic text-red-900 uppercase">Pengajuan Ditolak</h3>
                    <p className="text-red-600 mt-2 font-medium">{registration.rejectionReason || 'Harap tinjau kembali proposal Anda.'}</p>
                 </div>
                 <button onClick={() => updateRegistration({ status: 'ENROLL' })} className="btn-primary bg-red-600 px-10">Re-Upload Proposal</button>
              </div>
            )}

            {registration.status === 'SUBMITTED' && (
              <div className="card p-20 text-center space-y-6 bg-slate-900 text-white border-none">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <h3 className="text-2xl font-black text-white italic uppercase tracking-widest">Review Proposal Berlangsung</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Admin PPPM sedang meninjau proposal Anda. Anda akan mendapatkan notifikasi jadwal seminar proposal via sistem ini.</p>
              </div>
            )}

            {registration.status === 'APPROVED' && registration.semproInfo && (
              <SemproSchedulePhase reg={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'SEMPRO_SUBMITTED' && (
              <div className="card p-20 text-center space-y-6 bg-slate-900 text-white border-none">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <h3 className="text-2xl font-black text-white italic uppercase tracking-widest">Verifikasi Bukti Seminar</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Admin sedang memverifikasi bukti seminar proposal Anda. Persiapkan diri untuk tahap penelitian.</p>
              </div>
            )}

            {registration.status === 'PROGRESS' && (
              <PenelitianLogbookSection registration={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'RESULT_SUBMITTED' && (
              <div className="card p-20 text-center space-y-6 bg-slate-900 text-white border-none">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <h3 className="text-2xl font-black text-white italic uppercase tracking-widest">Review Hasil Penelitian</h3>
                <p className="text-slate-400 max-w-sm mx-auto">Admin sedang meninjau hasil penelitian Anda untuk penjadwalan Seminar Hasil.</p>
              </div>
            )}

            {registration.status === 'RESULT_APPROVED' && registration.finalSemproInfo && (
              <ResultSchedulePhase reg={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'REVISION_SUBMITTED' && (
               <RevisionPhase reg={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'PUBLICATION' && (
               <PublicationChoicePhase reg={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'COMPLETED' && (
               <div className="max-w-4xl mx-auto space-y-10">
                  <div className="card p-12 bg-primary text-white text-center relative overflow-hidden shadow-2xl">
                     <div className="absolute -right-10 -bottom-10 opacity-20 rotate-12"><FlaskConical size={200} /></div>
                     <CheckCircle2 size={64} className="mx-auto mb-6 text-white" />
                     <h2 className="text-4xl font-black italic mb-4 uppercase tracking-tighter">PENELITIAN SELESAI</h2>
                     <p className="text-white/80 font-bold uppercase tracking-widest text-xs">PPPM STAI Ihyaul Ulum mengucapkan terima kasih atas kontribusi ilmiah Anda.</p>
                     
                     <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                        <div className="p-5 bg-white/10 rounded-2xl">
                           <p className="text-[9px] font-black uppercase text-white/50 mb-2">Metode Publikasi</p>
                           <p className="font-bold text-sm">{registration.publication?.method || 'PUBLIKASI MANDIRI'}</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EnrollPhase({ reg, onUpdate }: { reg: PenelitianRegistration, onUpdate: (u: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      onUpdate({ proposalFile: url });
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10">
       <div className="card p-10 bg-slate-900 text-white space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic">Upload Proposal</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Proposal harus dalam format PDF dan sesuai dengan template yang disediakan PPPM.</p>
          </div>
          
          <div className="space-y-4">
             <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Berkas Proposal (.PDF)</p>
             <label className={cn(
                "flex flex-col items-center justify-center p-12 rounded-[32px] border-2 border-dashed transition-all cursor-pointer",
                reg.proposalFile ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20"
             )}>
                <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={uploading} />
                {uploading ? <Loader2 size={32} className="animate-spin text-primary" /> : 
                 reg.proposalFile ? <div className="flex flex-col items-center space-y-2"><CheckCircle2 size={32} className="text-primary" /> <span className="text-[10px] font-black uppercase tracking-widest">Proposal Terunggah</span></div> :
                 <div className="flex flex-col items-center space-y-2 text-slate-500"><FileUp size={32} /> <span className="text-[10px] font-black uppercase tracking-widest">Pilih Berkas PDF</span></div>}
             </label>
          </div>

          <button 
            disabled={!reg.proposalFile || uploading}
            onClick={() => onUpdate({ status: 'SUBMITTED' })}
            className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 transition-all hover:scale-[1.02] active:scale-95"
          >Kirim Proposal Sekarang</button>
       </div>
       <div className="card p-10 flex flex-col justify-center space-y-6">
          <h4 className="text-xl font-bold italic">Panduan Penelitian</h4>
          <ul className="space-y-4">
             {[
               "Proposal disetujui Admin PPPM.",
               "Melakukan Seminar Proposal (Upload Dokumentasi).",
               "Tahap Penelitian & Pengisian Logbook (min 5 logbook).",
               "Upload Hasil & Seminar Hasil.",
               "Upload Revisi Final & Publikasi."
             ].map((t, i) => (
               <li key={i} className="flex items-start space-x-3 group">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">{i+1}</div>
                  <p className="text-xs font-bold text-slate-600 py-1">{t}</p>
               </li>
             ))}
          </ul>
       </div>
    </div>
  );
}

function SemproSchedulePhase({ reg, onUpdate }: { reg: PenelitianRegistration, onUpdate: (u: any) => void }) {
  const [proof, setProof] = useState<{ documentation: string[], notes: string }>({ documentation: [], notes: '' });
  const [uploading, setUploading] = useState(false);

  const handleDocs = async (files: FileList) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      setProof(prev => ({ ...prev, documentation: [...prev.documentation, ...urls] }));
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleNotes = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setProof(prev => ({ ...prev, notes: url }));
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const isReady = proof.documentation.length >= 3 && proof.notes;

  return (
    <div className="space-y-10">
       <div className="card bg-slate-900 text-white p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Calendar size={120} /></div>
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-3xl font-black italic underline decoration-primary underline-offset-8 uppercase">Seminar Proposal</h3>
             <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30">Jadwal Terdaftar</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Lokasi</p>
                <p className="font-bold text-lg flex items-center space-x-2"><MapPin size={18} className="text-slate-400" /> <span>{reg.semproInfo?.lokasi}</span></p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Waktu</p>
                <div className="font-bold text-lg flex items-center space-x-2">
                   <Calendar size={18} className="text-slate-400" /> <span>{reg.semproInfo?.tanggal}</span>
                </div>
                <p className="text-xs text-slate-400 font-bold ml-7 uppercase tracking-tight">{reg.semproInfo?.pukul} WIB</p>
             </div>
             {reg.semproInfo?.catatan && (
               <div className="space-y-1 lg:col-span-1 border-l border-white/10 pl-6">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">Info Tambahan</p>
                  <p className="text-xs text-slate-400 leading-relaxed italic">"{reg.semproInfo.catatan}"</p>
               </div>
             )}
          </div>
       </div>

       <div className="card p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
             <div>
                <h4 className="text-xl font-bold italic">Upload Bukti Seminar</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Minimal 3 Foto Dokumentasi & 1 Foto Catatan</p>
             </div>
             <div className="flex space-x-4">
                <label className="flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl border border-slate-200 transition-colors">
                   <Camera size={16} className="text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Add Documentation ({proof.documentation.length})</span>
                   <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && handleDocs(e.target.files)} />
                </label>
                <label className="flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-xl border border-slate-200 transition-colors">
                   <FileText size={16} className="text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{proof.notes ? 'Notes Added' : 'Add Notes'}</span>
                   <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleNotes(e.target.files[0])} />
                </label>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {proof.documentation.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl border bg-slate-50 relative group overflow-hidden shadow-sm">
                   <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   <button onClick={() => setProof(prev => ({...prev, documentation: prev.documentation.filter((_, idx) => idx !== i)}))} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </div>
             ))}
             {proof.notes && (
                <div className="aspect-square rounded-2xl border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-4 shadow-inner">
                   <CheckCircle2 size={32} className="text-primary mb-2" />
                   <span className="text-[9px] font-black text-primary uppercase text-center">Catatan Terunggah</span>
                </div>
             )}
          </div>

          <button 
            disabled={!isReady || uploading}
            onClick={() => onUpdate({ status: 'SEMPRO_SUBMITTED', semproProof: { dokumentasi: proof.documentation, catatan: proof.notes } })}
            className="w-full h-16 btn-primary uppercase tracking-[0.2em] font-black shadow-2xl disabled:opacity-20"
          >Kirim Bukti Seminar Sekarang</button>
       </div>
    </div>
  );
}

function PenelitianLogbookSection({ registration, onUpdate }: { registration: PenelitianRegistration, onUpdate: (u: any) => void }) {
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
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const saveLog = () => {
    if (!newLog.activity || !newLog.note) return alert('Semua field harus diisi!');
    const log: PenelitianLogbook = {
      id: crypto.randomUUID(),
      date: newLog.date!,
      time: newLog.time!,
      activity: newLog.activity!,
      note: newLog.note!,
      photo: newLog.photo || '',
      status: 'PENDING'
    };
    onUpdate({ logbooks: [log, ...registration.logbooks] });
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
       onUpdate({ resultFile: url, status: 'RESULT_SUBMITTED' });
     } catch (e) { console.error(e); }
     finally { setUploadingResult(false); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
             <div>
                <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Logbook Penelitian</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: {registration.status}</p>
             </div>
             {!isAdding && (
               <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center space-x-2 px-8 py-3 rounded-2xl shadow-xl">
                  <Plus size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Entry Baru</span>
               </button>
             )}
          </div>

          {isAdding && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-10 bg-primary/5 border-primary/20 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tanggal</label>
                      <input type="date" className="input-field" value={newLog.date} onChange={e => setNewLog({...newLog, date: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pukul</label>
                      <input type="time" className="input-field" value={newLog.time} onChange={e => setNewLog({...newLog, time: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Kegiatan</label>
                   <input placeholder="Contoh: Pengumpulan Data Survey" className="input-field" value={newLog.activity} onChange={e => setNewLog({...newLog, activity: e.target.value})} />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Uraian / Catatan</label>
                   <textarea placeholder="Detail progress hari ini..." className="input-field h-32" value={newLog.note} onChange={e => setNewLog({...newLog, note: e.target.value})} />
                </div>
                
                <div className="flex items-center justify-between gap-6">
                   <label className="flex-grow flex items-center justify-center h-14 bg-white rounded-2xl border-2 border-dashed border-primary/30 cursor-pointer hover:bg-primary/5 transition-all">
                      {uploading ? <Loader2 className="animate-spin text-primary" /> : 
                       newLog.photo ? <div className="flex items-center space-x-2 text-primary font-black uppercase text-[10px]"> <CheckCircle size={14} /> <span>Foto Terlampir</span> </div> :
                       <div className="flex items-center space-x-2 text-slate-400 font-black uppercase text-[10px]"> <Camera size={14} /> <span>Lampiran Dokumentasi</span> </div>}
                      <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                   </label>
                   <div className="flex space-x-3">
                      <button onClick={saveLog} className="btn-primary px-10 h-14 rounded-2xl shadow-xl">Simpan Entry</button>
                      <button onClick={() => setIsAdding(false)} className="px-6 h-14 rounded-2xl border-2 border-slate-200 text-slate-400 hover:bg-slate-50 transition-all uppercase text-[10px] font-black">Batal</button>
                   </div>
                </div>
             </motion.div>
          )}

          <div className="space-y-4">
             {registration.logbooks.map(log => (
               <div key={log.id} className="card p-8 bg-white flex flex-col space-y-4 hover:shadow-xl transition-shadow border-slate-100">
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                           <h5 className="text-lg font-bold text-slate-900 italic tracking-tight">{log.activity}</h5>
                           <span className={cn(
                             "px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                             log.status === 'APPROVED' ? "bg-green-50 text-green-600" : log.status === 'REJECTED' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                           )}>
                             {log.status}
                           </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase flex items-center space-x-2"> 
                           <Calendar size={12} /> <span>{log.date}</span> 
                           <span className="w-1 h-1 rounded-full bg-slate-300" />
                           <Clock size={12} /> <span>{log.time}</span>
                        </p>
                     </div>
                     {log.photo && (
                       <a href={log.photo} target="_blank" className="p-3 bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-colors border border-slate-100">
                          <Camera size={20} />
                       </a>
                     )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl italic border border-slate-50">"{log.note}"</p>
               </div>
             ))}
          </div>
       </div>

       <div className="space-y-8">
          <div className="card p-10 bg-slate-900 text-white text-center space-y-8 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 opacity-10"><ClipboardList size={160} /></div>
             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] relative z-10">Target Logbook</h4>
             <div className="text-7xl font-black italic relative z-10 leading-none">{approvedCount} <span className="text-2xl text-slate-600">/ 5</span></div>
             <p className="text-xs text-slate-400 font-medium relative z-10 max-w-[200px] mx-auto">Admin harus menyetujui minimal 5 logbook agar Anda bisa lanjut ke tahap Hasil Penelitian.</p>
             
             {isReadyForResults && (
                <div className="pt-6 border-t border-white/10 space-y-6 relative z-10">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Kirim Hasil Penelitian</p>
                      <label className="flex flex-col items-center justify-center p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                        {uploadingResult ? <Loader2 className="animate-spin text-primary" /> : 
                         <div className="flex flex-col items-center space-y-2">
                           <FileUp className="text-primary" size={24} />
                           <span className="text-[9px] font-black uppercase tracking-widest">Pilih Laporan Hasil (.PDF)</span>
                         </div>}
                        <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleResultFile(e.target.files[0])} disabled={uploadingResult} />
                      </label>
                   </div>
                </div>
             )}
          </div>
          
          <div className="card p-8 bg-slate-50 border-none space-y-4">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Informasi Tahap Selanjutnya</h4>
             <p className="text-xs text-slate-600 leading-relaxed font-medium">Setelah Laporan Hasil diupload:
                <br/><span className="text-primary font-bold">1. Review Admin Hasil Penelitian</span>
                <br/><span className="text-primary font-bold">2. Penjadwalan Seminar Hasil</span>
                <br/><span className="text-primary font-bold">3. Pelaksanaan Seminar & Revisi</span>
             </p>
          </div>
       </div>
    </div>
  );
}

function ResultSchedulePhase({ reg, onUpdate }: { reg: PenelitianRegistration, onUpdate: (u: any) => void }) {
  const [proof, setProof] = useState<{ documentation: string[], notes: string }>({ documentation: [], notes: '' });
  const [uploading, setUploading] = useState(false);

  const handleDocs = async (files: FileList) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      setProof(prev => ({ ...prev, documentation: [...prev.documentation, ...urls] }));
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleNotes = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setProof(prev => ({ ...prev, notes: url }));
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const isReady = proof.documentation.length >= 3 && proof.notes;

  return (
    <div className="space-y-10">
       <div className="card bg-slate-900 text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10"><Users size={140} /></div>
          <div className="flex justify-between items-center mb-12">
             <div>
                <h3 className="text-3xl font-black italic underline decoration-primary underline-offset-8 uppercase tracking-tighter">Seminar Hasil Penelitian</h3>
                <p className="text-xs text-primary font-black uppercase tracking-widest mt-4">Jadwal Presentasi Final</p>
             </div>
             <Calendar className="text-primary" size={48} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Waktu & Lokasi</p>
                <p className="font-bold text-lg">{reg.finalSemproInfo?.tanggal}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">{reg.finalSemproInfo?.pukul} WIB – {reg.finalSemproInfo?.lokasi}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Panelis / Penguji</p>
                <p className="font-bold text-lg">{reg.finalSemproInfo?.panelis}</p>
             </div>
             <div className="space-y-1 col-span-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Keterangan Tambahan</p>
                <p className="text-xs text-slate-400 italic leading-relaxed">"{reg.finalSemproInfo?.infoLain || 'Harap hadir 30 menit sebelum jadwal untuk persiapan teknis.'}"</p>
             </div>
          </div>
       </div>

       <div className="card p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <h4 className="text-xl font-bold italic">Upload Bukti Seminar Hasil</h4>
             <div className="flex space-x-4">
                <label className="flex items-center space-x-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-2xl border border-slate-200 transition-all font-black uppercase text-[10px]">
                   <Camera size={18} className="text-primary" />
                   <span>Dokumentasi ({proof.documentation.length}/3)</span>
                   <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && handleDocs(e.target.files)} />
                </label>
                <label className="flex items-center space-x-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer rounded-2xl border border-slate-200 transition-all font-black uppercase text-[10px]">
                   <FileText size={18} className="text-primary" />
                   <span>Catatan ({proof.notes ? 1 : 0}/1)</span>
                   <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleNotes(e.target.files[0])} />
                </label>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
             {proof.documentation.map((url, i) => <img key={i} src={url} className="aspect-square rounded-2xl object-cover border" />)}
             {proof.notes && <div className="aspect-square rounded-2xl border-2 border-primary/20 bg-primary/5 flex items-center justify-center text-primary font-black text-[9px] uppercase">Catatan Seminar</div>}
          </div>

          <button 
            disabled={!isReady || uploading}
            onClick={() => onUpdate({ status: 'REVISION_SUBMITTED', finalSemproProof: { dokumentasi: proof.documentation, catatan: proof.notes } })}
            className="w-full h-16 btn-primary uppercase tracking-[0.2em] font-black shadow-2xl disabled:opacity-20"
          >Kirim Bukti & Tunggu Konfirmasi Revisi</button>
       </div>
    </div>
  );
}

function RevisionPhase({ reg, onUpdate }: { reg: PenelitianRegistration, onUpdate: (u: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      onUpdate({ finalRevisionFile: url });
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
       <div className="card p-12 bg-white border-none shadow-sm space-y-8 text-center">
          <BookOpen className="text-primary mx-auto" size={64} />
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Submit Revisi Final</h3>
            <p className="text-slate-400 font-medium mt-2">Unggah PDF hasil penelitian yang sudah direvisi sesuai catatan seminar hasil.</p>
          </div>
          
          <label className={cn(
             "flex flex-col items-center justify-center p-16 rounded-[48px] border-2 border-dashed transition-all cursor-pointer",
             reg.finalRevisionFile ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
          )}>
             {uploading ? <Loader2 className="animate-spin text-primary" /> : 
              reg.finalRevisionFile ? <div className="flex flex-col items-center space-y-3"><CheckCircle size={48} className="text-primary" /> <span className="font-black uppercase text-primary text-xs tracking-widest">Revisi Siap Dikirim</span></div> :
              <div className="flex flex-col items-center space-y-3"><FileUp size={48} className="text-slate-300" /> <span className="font-black uppercase text-slate-400 text-xs tracking-widest">Pilih Laporan Final (PDF)</span></div>}
             <input type="file" className="hidden" accept=".pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>

          {reg.rejectionReason && (
             <div className="p-6 bg-red-50 border border-red-100 rounded-[28px] text-left flex items-start space-x-4">
                <AlertCircle className="text-red-500 shrink-0" />
                <div>
                   <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">Catatan Admin</p>
                   <p className="text-sm font-bold text-red-900 mt-1 italic">"{reg.rejectionReason}"</p>
                </div>
             </div>
          )}

          <button 
            disabled={!reg.finalRevisionFile || uploading}
            onClick={() => onUpdate({ status: 'REVISION_SUBMITTED' })}
            className="w-full h-16 btn-primary rounded-[28px] font-black uppercase tracking-[0.2em] shadow-2xl disabled:opacity-20 flex items-center justify-center space-x-3"
          >
             <Send size={18} />
             <span>Submit Laporan Sekarang</span>
          </button>
       </div>
    </div>
  );
}

function PublicationChoicePhase({ reg, onUpdate }: { reg: PenelitianRegistration, onUpdate: (u: any) => void }) {
  const [choice, setChoice] = useState<'MANDIRI' | 'PPPM' | null>(null);
  const [method, setMethod] = useState('');
  const [other, setOther] = useState('');

  const methods = ['Jurnal', 'Buku', 'Prosiding', 'Lainnya'];

  const finalize = () => {
    if (!choice) return;
    const finalMethod = choice === 'MANDIRI' ? 'PUBLIKASI MANDIRI' : (method === 'Lainnya' ? other : method);
    if (choice === 'PPPM' && !finalMethod) return alert('Silakan pilih metode publikasi!');
    
    onUpdate({ 
      status: 'COMPLETED',
      publication: { type: choice, method: finalMethod }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
       <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">Rencana Publikasi</h2>
          <p className="text-slate-400 font-medium">Proposal Anda telah disetujui sepenuhnya. Bagaimana rencana publikasi hasil riset ini?</p>
       </div>

       <div className="grid grid-cols-2 gap-8">
          <button 
            onClick={() => setChoice('MANDIRI')}
            className={cn(
              "card p-10 flex flex-col items-center space-y-6 transition-all border-2",
              choice === 'MANDIRI' ? "border-primary bg-primary/5 shadow-2xl scale-[1.05]" : "border-transparent hover:border-slate-200"
            )}
          >
             <User size={48} className={choice === 'MANDIRI' ? "text-primary" : "text-slate-300"} />
             <div className="text-center">
                <h4 className="font-black italic text-lg uppercase">Mandiri</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-2">Dosen menerbitkan secara personal</p>
             </div>
          </button>
          
          <button 
            onClick={() => setChoice('PPPM')}
            className={cn(
              "card p-10 flex flex-col items-center space-y-6 transition-all border-2",
              choice === 'PPPM' ? "border-primary bg-primary/5 shadow-2xl scale-[1.05]" : "border-transparent hover:border-slate-200"
            )}
          >
             <FlaskConical size={48} className={choice === 'PPPM' ? "text-primary" : "text-slate-300"} />
             <div className="text-center">
                <h4 className="font-black italic text-lg uppercase">PPPM STAI IU</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-2">Diterbitkan oleh institusi & didampingi</p>
             </div>
          </button>
       </div>

       {choice === 'PPPM' && (
         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card p-10 space-y-6 bg-slate-50">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Pilih Media Publikasi</p>
            <div className="grid grid-cols-2 gap-4">
               {methods.map(m => (
                 <button 
                   key={m} 
                   onClick={() => setMethod(m as any)}
                   className={cn(
                     "px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                     method === m ? "bg-primary text-white shadow-xl" : "bg-white text-slate-600 border border-slate-200 hover:border-primary/30"
                   )}
                 >{m}</button>
               ))}
            </div>
            {method === 'Lainnya' && (
              <input 
                placeholder="Sebutkan media lainnya..." 
                className="input-field" 
                value={other} 
                onChange={e => setOther(e.target.value)}
              />
            )}
         </motion.div>
       )}

       {choice && (
         <button 
           onClick={finalize}
           className="w-full h-20 btn-primary rounded-[32px] font-black uppercase tracking-[0.3em] shadow-2xl relative group overflow-hidden"
         >
            <span className="relative z-10">Selesaikan Penelitian & Terbitkan</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
         </button>
       )}
    </div>
  );
}
