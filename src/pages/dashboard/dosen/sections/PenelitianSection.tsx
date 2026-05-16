import { useState } from 'react';
import { motion } from 'motion/react';
import { FileUp, Info, CheckCircle2, FlaskConical, Calendar, Send, BadgeCheck, FileCheck, ExternalLink, Archive } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import LogbookForm, { LogbookList } from '@/src/components/dashboard/Logbook';

export default function PenelitianSection() {
  const [step, setStep] = useState(1); // 1: Proposal, 2: Sempro, 3: Penelitian (Logbook 5x), 4: Seminar Hasil, 5: Revision, 6: Publication
  const [logbookCount, setLogbookCount] = useState(0);
  const targetLogbook = 5;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase">Penelitian Dosen</h1>
          <p className="text-slate-500">Kelola siklus riset dari hibah proposal hingga publikasi.</p>
        </div>
      </div>

      {step === 1 && <ProposalStep onNext={() => setStep(2)} />}
      {step === 2 && <SeminarStep onNext={() => setStep(3)} />}
      {step === 3 && <ResearchPhase count={logbookCount} onAdd={() => setLogbookCount(c => c+1)} target={targetLogbook} onNext={() => setStep(4)} />}
      {step === 4 && <SeminarHasilStep onNext={() => setStep(5)} />}
      {step === 5 && <RevisionStep onNext={() => setStep(6)} />}
      {step === 6 && <PublicationStep />}
    </div>
  );
}

function ProposalStep({ onNext }: { onNext: () => void }) {
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
          <button onClick={onNext} className="btn-primary w-full">Ajukan Proposal</button>
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
          <button onClick={onNext} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
             Demo: Selesaikan Seminar
          </button>
       </div>
    </motion.div>
  );
}

function ResearchPhase({ count, target, onAdd, onNext }: { count: number, target: number, onAdd: () => void, onNext: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Logbook Penelitian</h3>
                <span className="text-xs font-bold text-slate-400">Minimal {target} Logbook</span>
             </div>
             <LogbookForm type="RESEARCH" onSubmit={onAdd} />
             <LogbookList entries={[
               { date: '2 Juli 2024', activityName: 'Pengumpulan Data Primer', status: 'APPROVED', description: 'Wawancara dengan subjek penelitian di Gresik' }
             ]} />
          </div>
          <div className="space-y-6">
             <div className="card bg-primary text-white p-6 space-y-4 shadow-xl shadow-primary/20">
                <h3 className="font-bold text-white/50 text-[10px] uppercase">Progress Logbook</h3>
                <div className="text-4xl font-black">{count} / {target}</div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-white" style={{ width: `${(count/target)*100}%` }} />
                </div>
                {count >= target && (
                   <button onClick={onNext} className="w-full bg-white text-primary font-bold py-3 rounded-xl mt-4 animate-bounce">
                      Unggah Hasil Penelitian
                   </button>
                )}
                <button onClick={onAdd} className="w-full bg-white/10 text-white font-bold py-2 rounded-xl text-xs uppercase">Demo: Add Logbook</button>
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
          <h3 className="text-2xl font-bold text-slate-900">Hasil Penelitian Diunggah</h3>
          <p className="text-slate-500">Anda telah mengunggah naskah hasil penelitian. Admin akan segera merilis jadwal Seminar Hasil Penelitian.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <Calendar size={18} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Estimasi Jadwal</span>
             </div>
             <span className="text-xs font-bold text-primary">JULI 2024</span>
          </div>
          <button onClick={onNext} className="btn-primary w-full">Demo: Lanjut ke Pasca Seminar</button>
       </div>
    </div>
  );
}

function RevisionStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="card max-w-lg mx-auto space-y-8 text-center p-10">
       <h3 className="text-xl font-bold">Unggah Revisi Final</h3>
       <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center">
          <FileUp size={40} className="text-slate-300" />
          <p className="text-xs font-bold text-slate-400 mt-4 uppercase">Upload Revisi (PDF)</p>
       </div>
       <button onClick={onNext} className="btn-primary w-full">Finalisasi Hasil</button>
    </div>
  );
}

function PublicationStep() {
   const [choice, setChoice] = useState<'MANDIRI' | 'PPPM' | null>(null);
   const [format, setFormat] = useState('');

   return (
     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-8">
        {!choice ? (
          <div className="space-y-8">
             <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">Pilihan Publikasi</h3>
                <p className="text-slate-500">Bagaimana penelitian ini akan dipublikasikan?</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setChoice('MANDIRI')} className="card p-10 hover:border-primary transition-all text-center space-y-4">
                   <ExternalLink size={40} className="mx-auto text-primary" />
                   <h4 className="font-bold text-lg text-slate-900">Mandiri</h4>
                   <p className="text-sm text-slate-500">Diterbitkan oleh Dosen secara eksternal.</p>
                </button>
                <button onClick={() => setChoice('PPPM')} className="card p-10 hover:border-primary transition-all text-center space-y-4">
                   <Archive size={40} className="mx-auto text-primary" />
                   <h4 className="font-bold text-lg text-slate-900">Oleh PPPM STAI IU</h4>
                   <p className="text-sm text-slate-500">Diterbitkan melalui kanal institusi.</p>
                </button>
             </div>
          </div>
        ) : (
          <div className="card p-10 text-center space-y-8">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-primary mx-auto">
                <BadgeCheck size={48} />
             </div>
             <h3 className="text-2xl font-black text-slate-900">Penelitian Selesai!</h3>
             
             {choice === 'PPPM' && (
                <div className="max-w-sm mx-auto space-y-4">
                   <p className="text-sm text-slate-500">Pilih format penerbitan PPPM:</p>
                   <select className="input-field" onChange={(e) => setFormat(e.target.value)}>
                      <option>Jurnal</option>
                      <option>Buku</option>
                      <option>Prosiding</option>
                      <option>Yang Lain...</option>
                   </select>
                </div>
             )}
             
             <div className="p-6 bg-sage-light rounded-2xl text-primary font-bold">
                Terima kasih atas kontribusi ilmiah anda pada STAI Ihyaul Ulum.
             </div>
             <button onClick={() => setChoice(null)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Ubah Pilihan</button>
          </div>
        )}
     </motion.div>
   );
}
