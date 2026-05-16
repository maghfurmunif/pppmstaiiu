import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUp, Info, CheckCircle2, FlaskConical, Calendar, Send, BadgeCheck, FileCheck, ExternalLink, Archive, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import LogbookForm, { LogbookList } from '@/src/components/dashboard/Logbook';
import { penelitianService, PenelitianRegistration } from '@/src/services/penelitianService';

export default function PenelitianSection() {
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
    const newReg: PenelitianRegistration = {
      id: Math.random().toString(36).substr(2, 9),
      dosenId: userId,
      dosenName: localStorage.getItem('user_name') || 'Dosen',
      status: 'SUBMITTED',
      logbooks: []
    };
    await penelitianService.saveRegistration(newReg);
    setRegistration(newReg);
  };

  const updateRegistration = async (updates: Partial<PenelitianRegistration>) => {
    if (!registration) return;
    const updated = { ...registration, ...updates };
    await penelitianService.saveRegistration(updated);
    setRegistration(updated);
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs">
        <Loader2 className="animate-spin mb-4" size={32} />
        Syncing Research Data...
     </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase italic underline decoration-primary/30 underline-offset-8">Penelitian Dosen</h1>
          <p className="text-slate-500 font-medium pt-2">Kelola siklus riset dari hibah proposal hingga publikasi.</p>
        </div>
        <div className="flex items-center glass-morphism rounded-2xl px-6 py-3 border-white/40 shadow-lg">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Status</span>
           <span className="text-xs font-black text-primary uppercase italic tracking-tighter">
             {registration?.status || 'NOT_ENROLLED'}
           </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!registration && (
          <ProposalStep onEnroll={handleEnroll} />
        )}
        {registration?.status === 'SUBMITTED' && (
          <div className="card p-20 text-center space-y-6">
             <Loader2 className="animate-spin text-primary mx-auto" size={48} />
             <h3 className="text-2xl font-bold text-slate-900 italic">Menunggu Review Admin</h3>
             <p className="text-slate-400">Proposal penelitian Anda sedang ditinjau oleh PPPM.</p>
          </div>
        )}
        {registration?.status === 'APPROVED' && (
          <SeminarStep onNext={() => updateRegistration({ status: 'PROGRESS' })} />
        )}
        {registration?.status === 'PROGRESS' && (
          <ResearchPhase 
             registration={registration} 
             onAdd={(log: any) => updateRegistration({ logbooks: [log, ...registration.logbooks] })} 
             onNext={() => updateRegistration({ status: 'SCHEDULED' })} 
          />
        )}
        {registration?.status === 'SCHEDULED' && (
          <SeminarHasilStep onNext={() => updateRegistration({ status: 'GRADING' })} />
        )}
        {registration?.status === 'GRADING' && (
          <RevisionStep onNext={() => updateRegistration({ status: 'COMPLETED' })} />
        )}
        {registration?.status === 'COMPLETED' && (
          <PublicationStep registration={registration} onUpdate={updateRegistration} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProposalStep({ onEnroll }: { onEnroll: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
       <div className="card space-y-6 text-center py-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
             <FlaskConical size={40} />
          </div>
          <div>
             <h3 className="text-2xl font-bold text-slate-900">Unggah Proposal Penelitian</h3>
             <p className="text-slate-500 mt-2">Dapatkan pembiayaan hibah internal dengan mengajukan proposal terbaik anda.</p>
          </div>
          <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl group hover:border-primary transition-all cursor-pointer">
             <FileUp size={32} className="mx-auto text-slate-300 group-hover:text-primary transition-colors" />
             <p className="text-sm font-bold text-slate-400 mt-4 uppercase">Upload PDF Proposal</p>
          </div>
          <button onClick={onEnroll} className="btn-primary w-full">Ajukan Proposal</button>
       </div>
    </motion.div>
  );
}

function SeminarStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
       <div className="card bg-slate-900 text-white p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
             <h3 className="text-primary font-black uppercase tracking-widest text-[10px]">Jadwal Seminar Proposal</h3>
             <div className="text-4xl font-black">20 Juni 2024</div>
             <p className="text-white/60">Pukul 09:00 WIB • Ruang Rapat Lt. 2</p>
          </div>
          <button onClick={onNext} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all text-xs uppercase tracking-widest">
             Mulai Tahap Penelitian
          </button>
       </div>
    </motion.div>
  );
}

function ResearchPhase({ registration, onAdd, onNext }: { registration: PenelitianRegistration, onAdd: (l: any) => void, onNext: () => void }) {
  const target = 5;
  const count = registration.logbooks.length;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 italic">Logbook Penelitian</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Minimal {target} Logbook</span>
             </div>
             <LogbookForm type="RESEARCH" onSubmit={(log) => onAdd({ ...log, id: Math.random().toString(16), status: 'PENDING' })} />
             <LogbookList entries={registration.logbooks.map(l => ({
                date: l.date,
                activityName: l.activity,
                status: l.status,
                description: l.note
             }))} />
          </div>
          <div className="space-y-6">
             <div className="card bg-slate-900 text-white p-8 space-y-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                   <h3 className="font-bold text-primary text-[10px] uppercase tracking-[0.3em]">Research Progress</h3>
                   <div className="text-5xl font-black italic">{count} / {target}</div>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (count/target)*100)}%` }} />
                   </div>
                   {count >= target && (
                      <button onClick={onNext} className="w-full btn-primary text-white font-bold py-4 rounded-xl mt-4 animate-pulse">
                         Ajukan Hasil Penelitian
                      </button>
                   )}
                </div>
                <FlaskConical size={140} className="absolute -right-20 -bottom-20 opacity-5" />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function SeminarHasilStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
       <div className="card p-10 space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
             <FileCheck size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 italic">Hasil Penelitian Menunggu Seminar</h3>
          <p className="text-slate-500 font-medium">Anda telah mengunggah naskah hasil penelitian. Admin akan segera merilis jadwal Seminar Hasil Penelitian.</p>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <Calendar size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Estimasi Jadwal</span>
             </div>
             <span className="text-xs font-black text-primary uppercase tracking-widest">Validasi Admin</span>
          </div>
          <button onClick={onNext} className="btn-primary w-full shadow-xl">Selesaikan Seminar Hasil</button>
       </div>
    </div>
  );
}

function RevisionStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="card max-w-lg mx-auto space-y-8 text-center p-12 border-dashed">
       <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
          <FileUp size={32} />
       </div>
       <h3 className="text-2xl font-black italic underline decoration-primary underline-offset-8">Unggah Revisi Final</h3>
       <p className="text-slate-500 font-medium">Pastikan semua catatan dari penguji telah diperbaiki dalam draf final ini.</p>
       <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center hover:border-primary transition-all cursor-pointer">
          <FileUp size={40} className="text-slate-300" />
          <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Upload Revisi (PDF)</p>
       </div>
       <button onClick={onNext} className="btn-primary w-full shadow-2xl">Finalisasi & Submit Hasil Riset</button>
    </div>
  );
}

function PublicationStep({ registration, onUpdate }: { registration: PenelitianRegistration, onUpdate: (u: any) => void }) {
   const [choice, setChoice] = useState<'MANDIRI' | 'PPPM' | null>(registration.publication?.method || null);
   const [format, setFormat] = useState('');

   const handleChoice = (method: 'MANDIRI' | 'PPPM') => {
      setChoice(method);
      onUpdate({ publication: { method } });
   };

   return (
     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-8">
        {!choice ? (
          <div className="space-y-8">
             <div className="text-center space-y-2">
                <h3 className="text-3xl font-black italic text-slate-900 tracking-tight underline decoration-primary underline-offset-8">Pilihan Publikasi</h3>
                <p className="text-slate-500 font-medium">Bagaimana penelitian ini akan dipublikasikan?</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => handleChoice('MANDIRI')} className="card p-12 hover:border-primary transition-all text-center space-y-6 group">
                   <ExternalLink size={48} className="mx-auto text-slate-300 group-hover:text-primary transition-colors" />
                   <div className="space-y-2">
                      <h4 className="font-bold text-xl text-slate-900 italic">Mandiri</h4>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">Diterbitkan oleh Dosen secara eksternal melalui jurnal bereputasi.</p>
                   </div>
                </button>
                <button onClick={() => handleChoice('PPPM')} className="card p-12 hover:border-primary transition-all text-center space-y-6 group">
                   <Archive size={48} className="mx-auto text-slate-300 group-hover:text-primary transition-colors" />
                   <div className="space-y-2">
                      <h4 className="font-bold text-xl text-slate-900 italic">Oleh PPPM STAI IU</h4>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed">Diterbitkan melalui kanal jurnal atau buku institusi STAI Ihyaul Ulum.</p>
                   </div>
                </button>
             </div>
          </div>
        ) : (
          <div className="card p-12 text-center space-y-8 bg-slate-900 text-white relative overflow-hidden">
             <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                   <BadgeCheck size={56} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-4xl font-black italic tracking-tighter decoration-primary underline underline-offset-8">Penelitian Selesai!</h3>
                   <p className="text-slate-400 font-medium">Terima kasih atas kontribusi ilmiah Anda pada civitas akademika.</p>
                </div>
                
                {choice === 'PPPM' && (
                   <div className="max-w-sm mx-auto space-y-4">
                      <p className="text-xs font-black text-primary uppercase tracking-widest">Format Penerbitan PPPM</p>
                      <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none" onChange={(e) => setFormat(e.target.value)}>
                         <option className="bg-slate-900">Jurnal</option>
                         <option className="bg-slate-900">Buku</option>
                         <option className="bg-slate-900">Prosiding</option>
                         <option className="bg-slate-900">Yang Lain...</option>
                      </select>
                   </div>
                )}
                
                <div className="p-6 bg-primary text-white font-black italic rounded-2xl shadow-2xl">
                   PENELITIAN TELAH MASUK TAHAP ARCHIVING.
                </div>
                <button onClick={() => setChoice(null)} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-primary transition-colors">Ubah Model Publikasi</button>
             </div>
             <FlaskConical size={200} className="absolute -left-20 -bottom-20 opacity-5" />
          </div>
        )}
     </motion.div>
   );
}
}
