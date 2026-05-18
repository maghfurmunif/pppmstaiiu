
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, BookOpen, Clock, Calendar, CheckCircle2, 
  MapPin, User, MessageSquare, Camera, FileText, 
  Loader2, Download, ExternalLink, Info, AlertCircle,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { penelitianService, PenelitianRegistration, PenelitianLogbook } from '@/src/services/penelitianService';

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

  const [uploading, setUploading] = useState(false);
  const handleProposalUpload = async (file: File) => {
    try {
      setUploading(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      if (url) {
        updateRegistration({ proposalFile: url });
      }
    } catch (error) {
      console.error('Proposal upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const updateRegistration = (updates: Partial<PenelitianRegistration>) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    penelitianService.saveRegistration(updated);
    setRegistration(updated);
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
              <div className="grid lg:grid-cols-2 gap-10">
                 <div className="card p-10 bg-slate-900 text-white space-y-6">
                    <h3 className="text-2xl font-black italic">Persyaratan Proposal</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Proposal harus mencakup Latar Belakang, Metodologi, RAB, dan Luaran yang dijanjikan. Admin akan meninjau kelayakan teknis dan anggaran.</p>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Upload Berkas Proposal (.PDF)</p>
                       <label className={cn(
                          "flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                          registration.proposalFile ? "border-primary/50 bg-primary/10" : "border-white/10 hover:border-white/20"
                       )}>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf"
                            onChange={e => e.target.files?.[0] && handleProposalUpload(e.target.files[0])}
                            disabled={uploading}
                          />
                          {uploading ? (
                             <Loader2 size={32} className="animate-spin text-primary" />
                          ) : registration.proposalFile ? (
                             <div className="flex flex-col items-center space-y-2">
                                <CheckCircle2 size={32} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Proposal Terunggah</span>
                             </div>
                          ) : (
                             <div className="flex flex-col items-center space-y-2 text-slate-500">
                                <FileUp size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Pilih Berkas PDF</span>
                             </div>
                          )}
                       </label>
                    </div>

                    <button 
                      disabled={!registration.proposalFile || uploading}
                      onClick={() => updateRegistration({ status: 'SUBMITTED' })}
                      className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-20"
                    >Kirim Proposal Sekarang</button>
                 </div>
              </div>
            )}

            {registration.status === 'SUBMITTED' && (
              <div className="card p-20 text-center space-y-6">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <h3 className="text-2xl font-bold text-slate-900 italic">Review Proposal Sedang Berlangsung</h3>
                <p className="text-slate-400">Tim reviewer PPPM sedang meninjau substansi proposal penelitian Anda.</p>
              </div>
            )}

            {registration.status === 'SCHEDULED' && registration.semproInfo && (
              <div className="space-y-10">
                 <div className="card bg-slate-900 text-white p-10">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-3xl font-black italic underline decoration-primary underline-offset-8">Seminar Proposal</h3>
                       <div className="p-3 bg-white/10 rounded-xl"><Calendar size={24} className="text-primary" /></div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 text-center lg:text-left">
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Lokasi</p>
                          <p className="font-bold text-lg">{registration.semproInfo.lokasi}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Waktu</p>
                          <p className="font-bold text-lg">{registration.semproInfo.tanggal}</p>
                          <p className="text-xs text-slate-400">{registration.semproInfo.pukul} WIB</p>
                       </div>
                    </div>
                 </div>
                 <div className="max-w-xl mx-auto space-y-6">
                    <button onClick={() => updateRegistration({ status: 'PROGRESS' })} className="w-full btn-primary py-5 shadow-2xl">Upload Bukti Seminar Proposal</button>
                 </div>
              </div>
            )}

            {registration.status === 'PROGRESS' && (
               <PenelitianLogbookSection registration={registration} onUpdate={updateRegistration} />
            )}

            {registration.status === 'COMPLETED' && (
               <div className="max-w-4xl mx-auto space-y-10">
                  <div className="card p-12 bg-primary text-white text-center relative overflow-hidden">
                     <h2 className="text-4xl font-black italic mb-4">PENELITIAN SELESAI</h2>
                     <p className="text-white/60 font-bold uppercase tracking-widest text-xs">PPPM STAI Ihyaul Ulum mengucapkan terima kasih atas kontribusi ilmiah Anda.</p>
                  </div>
               </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function PenelitianLogbookSection({ registration, onUpdate }: { registration: PenelitianRegistration, onUpdate: (u: any) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const logCount = registration.logbooks.length;
  const isReady = logCount >= 5;

  return (
    <div className="grid lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900 italic">Jurnal Penelitian</h3>
             <button onClick={() => setIsAdding(!isAdding)} className="btn-primary px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">{isAdding ? 'Batal' : 'Input Logbook'}</button>
          </div>
          {isAdding && (
            <div className="card p-8 bg-primary/5 space-y-4">
               {/* Simplified form for brevity in this complex flow */}
               <button onClick={() => {
                 const newLog: PenelitianLogbook = {
                   id: '',
                   date: '2024-05-16',
                   time: '10:00',
                   activity: 'Pengambilan Data Lapangan',
                   note: 'Data terkumpul 80%',
                   photo: '',
                   status: 'APPROVED'
                 };
                 onUpdate({ logbooks: [newLog, ...registration.logbooks] });
                 setIsAdding(false);
               }} className="btn-primary w-full py-4 text-[10px]">Mock Save Logbook</button>
            </div>
          )}
          <div className="space-y-4">
             {registration.logbooks.map(log => (
               <div key={log.id} className="card p-6 bg-white flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900">{log.activity}</h5>
                    <p className="text-xs text-slate-400">{log.date} • {log.time}</p>
                  </div>
                  <CheckCircle2 className="text-green-500" size={16} />
               </div>
             ))}
          </div>
       </div>
       <div className="space-y-8">
          <div className="card p-10 bg-slate-900 text-white text-center space-y-6">
             <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Progress Logbook</h4>
             <div className="text-5xl font-black italic">{logCount} / 5</div>
             {isReady && <button onClick={() => onUpdate({ status: 'COMPLETED' })} className="w-full btn-primary py-4 font-black shadow-2xl">Finalisasi & Selesaikan</button>}
          </div>
       </div>
    </div>
  );
}
