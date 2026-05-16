
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FlaskConical, CheckCircle2, XCircle, Eye, 
  Search, Calendar, Clock, FileText, Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { penelitianService, PenelitianRegistration } from '@/src/services/penelitianService';

export default function AdminPenelitian() {
  const [registrations, setRegistrations] = useState<PenelitianRegistration[]>([]);
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<PenelitianRegistration | null>(null);

  const refreshData = async () => {
    const data = await penelitianService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filtered = registrations.filter(r => 
    r.dosenName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen Penelitian</h1>
          <p className="text-slate-500 font-medium mt-1">Kelola proposal, seminar, dan publikasi penelitian dosen.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari dosen..." 
            className="input-field pl-12 py-3 w-64 text-sm" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 italic text-xs font-medium">Belum ada pengajuan penelitian.</div>
          ) : (
            filtered.map(reg => (
              <button 
                key={reg.id} 
                onClick={() => setSelectedReg(reg)}
                className={cn(
                  "w-full card p-5 text-left transition-all border-l-[6px] grow-on-hover",
                  selectedReg?.id === reg.id ? "border-l-primary ring-2 ring-primary/10 shadow-xl" : "border-l-slate-200"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Research Project</span>
                   <div className={cn("w-2 h-2 rounded-full", reg.status === 'SUBMITTED' ? "bg-orange-400 animate-pulse" : "bg-slate-200")} />
                </div>
                <h4 className="font-bold text-slate-900 truncate">{reg.dosenName}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{reg.status.replace('_', ' ')}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedReg ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="card bg-slate-900 text-white p-8">
                 <h2 className="text-2xl font-black italic text-white uppercase underline decoration-primary underline-offset-4">{selectedReg.dosenName}</h2>
                 <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Dosen Researcher • ID: {selectedReg.id}</p>
              </div>

              {/* Action Phases */}
              {selectedReg.status === 'SUBMITTED' && (
                <ProposalAction reg={selectedReg} onAction={refreshData} />
              )}
              
              {selectedReg.status === 'APPROVED' && (
                <div className="card p-10 text-center space-y-4">
                   <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                     <CheckCircle2 size={32} />
                   </div>
                   <h3 className="text-xl font-bold italic">Proposal Disetujui</h3>
                   <p className="text-sm text-slate-500 max-w-sm mx-auto">Menunggu Dosen untuk melaksanakan kegiatan seminar proposal.</p>
                </div>
              )}

              {/* More phases can be added here like AdminKKN pattern */}
              <div className="card p-8 bg-slate-50 border-none">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Status Log</h4>
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-2 h-2 rounded-full bg-primary" />
                       <p className="text-xs font-bold text-slate-700">Pendaftaran diterima pada {new Date().toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="card h-[400px] flex flex-col items-center justify-center text-center p-20 border-dashed">
               <FlaskConical size={64} className="text-slate-100 mb-4" />
               <h3 className="text-xl font-bold text-slate-300 uppercase italic tracking-widest">Pilih pengajuan penelitian</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProposalAction({ reg, onAction }: { reg: PenelitianRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [info, setInfo] = useState({
     lokasi: 'Auditorium Lt. 2',
     tanggal: '',
     pukul: '10:00',
     catatan: ''
  });

  const handleApprove = async () => {
    const updated = {
      ...reg,
      status: 'APPROVED' as any,
      semproInfo: info as any
    };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  const handleReject = async () => {
    const updated = {
      ...reg,
      status: 'REJECTED' as any,
      rejectionReason: reason
    };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8">
       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 italic">Review Proposal Penelitian</h3>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Pending Approval</span>
       </div>

       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
          <div className="flex items-center space-x-3">
             <FileText className="text-primary" />
             <span className="text-sm font-bold text-slate-700">Proposal_Dosen.pdf</span>
          </div>
          <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Lihat File</button>
       </div>

       <div className="space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penjadwalan Seminar Proposal</p>
          <div className="grid grid-cols-2 gap-4">
             <input type="date" className="input-field text-xs" value={info.tanggal} onChange={e => setInfo({...info, tanggal: e.target.value})} />
             <input type="time" className="input-field text-xs" value={info.pukul} onChange={e => setInfo({...info, pukul: e.target.value})} />
          </div>
          <input placeholder="Lokasi Seminar" className="input-field text-xs" value={info.lokasi} onChange={e => setInfo({...info, lokasi: e.target.value})} />
       </div>

       <div className="flex gap-4">
          <button onClick={handleApprove} className="btn-primary flex-grow h-14">Terima & Jadwalkan</button>
          <button onClick={handleReject} className="btn-primary bg-red-600 flex-grow h-14">Tolak Proposal</button>
       </div>
       {reason && <textarea placeholder="Alasan penolakan..." className="input-field h-20 text-sm mt-4" value={reason} onChange={e => setReason(e.target.value)} />}
    </div>
  );
}
