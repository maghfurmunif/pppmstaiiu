
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FlaskConical, CheckCircle2, XCircle, Eye, 
  Search, Calendar, Clock, FileText, Save,
  MapPin, User, Users, ClipboardList, BookOpen,
  ArrowRight, MessageSquare, AlertCircle
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
      setSelectedReg(data.find(r => r.dosenId === selectedReg.dosenId) || null);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filtered = registrations.filter(r => 
    r.dosenName?.toLowerCase().includes(search.toLowerCase())
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
                   <div className="flex items-center space-x-2">
                     <div className={cn(
                        "w-2 h-2 rounded-full",
                        ['SUBMITTED', 'SEMPRO_SUBMITTED', 'RESULT_SUBMITTED', 'REVISION_SUBMITTED'].includes(reg.status) 
                          ? "bg-orange-500 animate-pulse" 
                          : "bg-slate-200"
                     )} />
                     <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Research Project</span>
                   </div>
                </div>
                <h4 className="font-bold text-slate-900 truncate">{reg.dosenName}</h4>
                <div className="flex items-center space-x-2 mt-1">
                   <span className={cn(
                     "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                     reg.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                   )}>
                     {reg.status.replace('_', ' ')}
                   </span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedReg ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="card bg-slate-900 text-white p-8">
                 <div className="flex justify-between items-start">
                    <div>
                       <h2 className="text-2xl font-black italic text-white uppercase underline decoration-primary underline-offset-4">{selectedReg.dosenName}</h2>
                       <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Dosen Researcher • ID: {selectedReg.dosenId}</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary">
                       {selectedReg.status}
                    </div>
                 </div>
              </div>

              {/* Action Phases */}
              {selectedReg.status === 'SUBMITTED' && (
                <ProposalAction reg={selectedReg} onAction={refreshData} />
              )}

              {selectedReg.status === 'SEMPRO_SUBMITTED' && (
                <SemproProofAction reg={selectedReg} onAction={refreshData} />
              )}

              {(selectedReg.status === 'PROGRESS' || selectedReg.status === 'APPROVED' || selectedReg.status === 'SEMPRO_SUBMITTED') && (
                <LogbookAction reg={selectedReg} onAction={refreshData} />
              )}

              {selectedReg.status === 'PROGRESS' && selectedReg.logbooks.filter(l => l.status === 'APPROVED').length >= 5 && (
                <div className="card p-8 bg-green-50 border-green-100 text-center space-y-4">
                   <CheckCircle2 size={48} className="text-green-500 mx-auto" />
                   <h3 className="text-xl font-bold text-green-900 italic">Kuota Logbook Terpenuhi</h3>
                   <p className="text-sm text-green-700">Dosen kini dapat mengunggah Hasil Penelitian.</p>
                </div>
              )}

              {selectedReg.status === 'RESULT_SUBMITTED' && (
                <ResultAction reg={selectedReg} onAction={refreshData} />
              )}

              {selectedReg.status === 'RESULT_APPROVED' && (
                <FinalSemproProofAction reg={selectedReg} onAction={refreshData} />
              )}

              {selectedReg.status === 'REVISION_SUBMITTED' && (
                <RevisionAction reg={selectedReg} onAction={refreshData} />
              )}

              {selectedReg.status === 'PUBLICATION' && (
                <div className="card p-10 text-center space-y-4 bg-slate-50">
                   <BookOpen size={48} className="text-primary mx-auto" />
                   <h3 className="text-xl font-bold italic">Menunggu Dosen Memilih Publikasi</h3>
                   <p className="text-sm text-slate-500 max-w-sm mx-auto">Admin akan mendapat kabar setelah dosen menentukan metode publikasi (Mandiri / via PPPM).</p>
                </div>
              )}

              {selectedReg.status === 'COMPLETED' && (
                <div className="card p-12 text-center space-y-6 bg-slate-900 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10"><FlaskConical size={120} /></div>
                   <CheckCircle2 size={64} className="text-primary mx-auto" />
                   <div>
                     <h2 className="text-3xl font-black italic uppercase tracking-tighter">Penelitian Selesai</h2>
                     <p className="text-slate-400 mt-2 font-medium">Seluruh tahapan telah dilalui. Terima kasih atas dedikasi dosen.</p>
                   </div>
                   {selectedReg.publication && (
                     <div className="pt-6 border-t border-white/10 text-left">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-2">Metode Publikasi</p>
                        <div className="flex items-center space-x-3 text-sm font-bold">
                           <BookOpen size={16} />
                           <span>{selectedReg.publication.method || 'PUBLIKASI MANDIRI'}</span>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {/* Status Log */}
              <div className="card p-8 bg-slate-50 border-none">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Informasi Proyek</h4>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Proposal</p>
                       {selectedReg.proposalFile ? (
                         <a href={selectedReg.proposalFile} target="_blank" className="flex items-center space-x-2 text-primary text-xs font-bold hover:underline">
                            <FileText size={14} />
                            <span>Buka Proposal</span>
                         </a>
                       ) : <span className="text-xs font-bold text-slate-400 italic">Belum diunggah</span>}
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Hasil Akhir</p>
                       {selectedReg.resultFile ? (
                         <a href={selectedReg.resultFile} target="_blank" className="flex items-center space-x-2 text-primary text-xs font-bold hover:underline">
                            <FileText size={14} />
                            <span>Buka Hasil</span>
                         </a>
                       ) : <span className="text-xs font-bold text-slate-400 italic">Belum diunggah</span>}
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
  const [showReject, setShowReject] = useState(false);
  const [info, setInfo] = useState({
     lokasi: 'Auditorium Lt. 2',
     tanggal: '',
     pukul: '10:00',
     catatan: ''
  });

  const handleApprove = async () => {
    if (!info.tanggal) return alert('Silakan isi tanggal seminar!');
    const updated = {
      ...reg,
      status: 'APPROVED' as any,
      semproInfo: info
    };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  const handleReject = async () => {
    if (!reason) return alert('Silakan isi alasan penolakan!');
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
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Pending Review</span>
       </div>

       <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penjadwalan Seminar Proposal</p>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Tanggal</label>
                <input type="date" className="input-field text-xs" value={info.tanggal} onChange={e => setInfo({...info, tanggal: e.target.value})} />
             </div>
             <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1">Waktu (WIB)</label>
                <input type="time" className="input-field text-xs" value={info.pukul} onChange={e => setInfo({...info, pukul: e.target.value})} />
             </div>
          </div>
          <input placeholder="Lokasi Seminar" className="input-field text-xs" value={info.lokasi} onChange={e => setInfo({...info, lokasi: e.target.value})} />
          <textarea placeholder="Catatan Tambahan (Opsional)" className="input-field text-xs h-20" value={info.catatan} onChange={e => setInfo({...info, catatan: e.target.value})} />
       </div>

       <div className="flex gap-4">
          {!showReject ? (
            <>
              <button onClick={handleApprove} className="btn-primary flex-grow h-14 uppercase tracking-widest text-[10px]">Terima & Jadwalkan</button>
              <button onClick={() => setShowReject(true)} className="btn-primary bg-red-600 flex-grow h-14 uppercase tracking-widest text-[10px]">Tolak Proposal</button>
            </>
          ) : (
            <div className="w-full space-y-4">
               <textarea placeholder="Alasan penolakan..." className="input-field h-24 text-sm" value={reason} onChange={e => setReason(e.target.value)} />
               <div className="flex gap-4">
                 <button onClick={handleReject} className="btn-primary bg-red-600 flex-grow h-12 uppercase tracking-widest text-[10px]">Konfirmasi Tolak</button>
                 <button onClick={() => setShowReject(false)} className="btn-primary bg-slate-200 text-slate-900 flex-grow h-12 uppercase tracking-widest text-[10px]">Batal</button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

function SemproProofAction({ reg, onAction }: { reg: PenelitianRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const handleApprove = async () => {
    const updated = { ...reg, status: 'PROGRESS' as any };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  const handleReject = async () => {
    if (!reason) return alert('Silakan isi alasan penolakan!');
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
          <h3 className="font-bold text-slate-900 italic">Bukti Seminar Proposal</h3>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Pending Review</span>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(reg.semproProof?.dokumentasi || []).map((url, i) => (
            <a key={i} href={url} target="_blank" className="aspect-square rounded-xl overflow-hidden border border-slate-100 group relative">
               <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="text-white" size={16} />
               </div>
            </a>
          ))}
          {reg.semproProof?.catatan && (
            <a href={reg.semproProof.catatan} target="_blank" className="aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-4">
               <FileText className="text-primary mb-2" size={24} />
               <span className="text-[9px] font-black text-primary uppercase text-center">Catatan Seminar</span>
            </a>
          )}
       </div>

       <div className="flex gap-4">
          {!showReject ? (
            <>
              <button onClick={handleApprove} className="btn-primary flex-grow h-14 uppercase tracking-widest text-[10px]">Setujui Bukti Sempro</button>
              <button onClick={() => setShowReject(true)} className="btn-primary bg-red-600 flex-grow h-14 uppercase tracking-widest text-[10px]">Tolak Bukti</button>
            </>
          ) : (
            <div className="w-full space-y-4">
               <textarea placeholder="Alasan penolakan bukti..." className="input-field h-24 text-sm" value={reason} onChange={e => setReason(e.target.value)} />
               <div className="flex gap-4">
                 <button onClick={handleReject} className="btn-primary bg-red-600 flex-grow h-12 uppercase tracking-widest text-[10px]">Konfirmasi Tolak</button>
                 <button onClick={() => setShowReject(false)} className="btn-primary bg-slate-200 text-slate-900 flex-grow h-12 uppercase tracking-widest text-[10px]">Batal</button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

function LogbookAction({ reg, onAction }: { reg: PenelitianRegistration, onAction: () => void }) {
  const handleApproveLog = async (logId: string) => {
    const updatedLogbooks = reg.logbooks.map(l => 
      l.id === logId ? { ...l, status: 'APPROVED' as any } : l
    );
    await penelitianService.saveRegistration({ ...reg, logbooks: updatedLogbooks });
    onAction();
  };

  const handleRejectLog = async (logId: string) => {
    const updatedLogbooks = reg.logbooks.map(l => 
      l.id === logId ? { ...l, status: 'REJECTED' as any } : l
    );
    await penelitianService.saveRegistration({ ...reg, logbooks: updatedLogbooks });
    onAction();
  };

  const pendingLogbooks = reg.logbooks.filter(l => l.status === 'PENDING');

  return (
    <div className="card p-8 bg-slate-50 border-none space-y-6">
       <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Manajemen Logbook ({reg.logbooks.length})</h4>
          <span className="text-[9px] font-bold text-primary italic">{reg.logbooks.filter(l => l.status === 'APPROVED').length} Approved</span>
       </div>

       {pendingLogbooks.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-100">
             <p className="text-xs text-slate-400 italic">Tidak ada logbook baru untuk direview.</p>
          </div>
       ) : (
         <div className="space-y-4">
            {pendingLogbooks.map(log => (
              <div key={log.id} className="card p-6 bg-white space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <h5 className="font-bold text-slate-900">{log.activity}</h5>
                       <p className="text-xs text-slate-400">{log.date} • {log.time}</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleApproveLog(log.id)} className="p-2 hover:bg-green-50 text-green-500 rounded-lg transition-colors"><CheckCircle2 size={18} /></button>
                       <button onClick={() => handleRejectLog(log.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><XCircle size={18} /></button>
                    </div>
                 </div>
                 <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{log.note}</p>
                 {log.photo && (
                    <a href={log.photo} target="_blank" className="inline-block px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-full">Lihat Dokumentasi</a>
                 )}
              </div>
            ))}
         </div>
       )}
    </div>
  );
}

function ResultAction({ reg, onAction }: { reg: PenelitianRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [info, setInfo] = useState({
     tanggal: '',
     pukul: '10:00',
     lokasi: 'Ruang Seminar Utama',
     panelis: '',
     peserta: 'Umum & Mahasiswa',
     infoLain: ''
  });

  const handleApprove = async () => {
    if (!info.tanggal || !info.panelis) return alert('Silakan isi tanggal dan panelis!');
    const updated = {
      ...reg,
      status: 'RESULT_APPROVED' as any,
      finalSemproInfo: info
    };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  const handleReject = async () => {
    if (!reason) return alert('Silakan isi alasan penolakan!');
    const updated = {
      ...reg,
      status: 'RESULT_SUBMITTED' as any, // Stay in result submitted but update reg or move to rejected
      rejectionReason: reason
    };
    // In this flow, rejection usually means they need to fix and re-upload
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8">
       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
             <FileText className="text-primary" />
             <h3 className="font-bold text-slate-900 italic">Review Hasil Penelitian</h3>
          </div>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Result Review</span>
       </div>

       <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penjadwalan Seminar Hasil</p>
          <div className="grid grid-cols-2 gap-4">
             <input type="date" className="input-field text-xs" value={info.tanggal} onChange={e => setInfo({...info, tanggal: e.target.value})} />
             <input type="time" className="input-field text-xs" value={info.pukul} onChange={e => setInfo({...info, pukul: e.target.value})} />
          </div>
          <input placeholder="Lokasi Seminar" className="input-field text-xs" value={info.lokasi} onChange={e => setInfo({...info, lokasi: e.target.value})} />
          <input placeholder="Panelis / Penguji" className="input-field text-xs" value={info.panelis} onChange={e => setInfo({...info, panelis: e.target.value})} />
          <input placeholder="Peserta" className="input-field text-xs" value={info.peserta} onChange={e => setInfo({...info, peserta: e.target.value})} />
          <textarea placeholder="Informasi Lainnya" className="input-field text-xs h-20" value={info.infoLain} onChange={e => setInfo({...info, infoLain: e.target.value})} />
       </div>

       <div className="flex gap-4">
          {!showReject ? (
            <>
              <button onClick={handleApprove} className="btn-primary flex-grow h-14 uppercase tracking-widest text-[10px]">Terima & Jadwalkan Seminar Hasil</button>
              <button onClick={() => setShowReject(true)} className="btn-primary bg-red-600 flex-grow h-14 uppercase tracking-widest text-[10px]">Tolak Hasil</button>
            </>
          ) : (
            <div className="w-full space-y-4">
               <textarea placeholder="Alasan penolakan & catatan perbaikan..." className="input-field h-24 text-sm" value={reason} onChange={e => setReason(e.target.value)} />
               <div className="flex gap-4">
                 <button onClick={handleReject} className="btn-primary bg-red-600 flex-grow h-12 uppercase tracking-widest text-[10px]">Konfirmasi Tolak</button>
                 <button onClick={() => setShowReject(false)} className="btn-primary bg-slate-200 text-slate-900 flex-grow h-12 uppercase tracking-widest text-[10px]">Batal</button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

function FinalSemproProofAction({ reg, onAction }: { reg: PenelitianRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const handleApprove = async () => {
    const updated = { ...reg, status: 'REVISION_SUBMITTED' as any }; // Wait for revision
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  const handleReject = async () => {
    if (!reason) return alert('Silakan isi alasan penolakan!');
    const updated = {
      ...reg,
      status: 'RESULT_APPROVED' as any, // Stay in this stage
      rejectionReason: reason
    };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8">
       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 italic">Review Bukti Seminar Hasil</h3>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Pending Approval</span>
       </div>

       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(reg.finalSemproProof?.dokumentasi || []).map((url, i) => (
            <a key={i} href={url} target="_blank" className="aspect-square rounded-xl overflow-hidden border border-slate-100 group relative">
               <img src={url} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="text-white" size={16} />
               </div>
            </a>
          ))}
          {reg.finalSemproProof?.catatan && (
            <a href={reg.finalSemproProof.catatan} target="_blank" className="aspect-square rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-4">
               <FileText className="text-primary mb-2" size={24} />
               <span className="text-[9px] font-black text-primary uppercase text-center">Catatan Seminar Hasil</span>
            </a>
          )}
       </div>

       <div className="flex gap-4">
          {!showReject ? (
            <>
              <button onClick={handleApprove} className="btn-primary flex-grow h-14 uppercase tracking-widest text-[10px]">Setujui Bukti Seminar Hasil</button>
              <button onClick={() => setShowReject(true)} className="btn-primary bg-red-600 flex-grow h-14 uppercase tracking-widest text-[10px]">Tolak Bukti</button>
            </>
          ) : (
            <div className="w-full space-y-4">
               <textarea placeholder="Alasan penolakan..." className="input-field h-24 text-sm" value={reason} onChange={e => setReason(e.target.value)} />
               <div className="flex gap-4">
                 <button onClick={handleReject} className="btn-primary bg-red-600 flex-grow h-12 uppercase tracking-widest text-[10px]">Konfirmasi Tolak</button>
                 <button onClick={() => setShowReject(false)} className="btn-primary bg-slate-200 text-slate-900 flex-grow h-12 uppercase tracking-widest text-[10px]">Batal</button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}

function RevisionAction({ reg, onAction }: { reg: PenelitianRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const handleApprove = async () => {
    const updated = { ...reg, status: 'PUBLICATION' as any };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  const handleReject = async () => {
    if (!reason) return alert('Silakan isi alasan penolakan!');
    const updated = {
      ...reg,
      status: 'REVISION_SUBMITTED' as any,
      rejectionReason: reason
    };
    await penelitianService.saveRegistration(updated);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8">
       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 italic">Review Hasil Revisi Final</h3>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Pending Review</span>
       </div>

       <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <FileText className="text-primary" />
             <span className="text-sm font-bold text-slate-700 font-mono">REVISI_FINAL_PENELITIAN.pdf</span>
          </div>
          {reg.finalRevisionFile && (
            <a href={reg.finalRevisionFile} target="_blank" className="btn-primary h-10 px-6 text-[10px] flex items-center">Download</a>
          )}
       </div>

       <div className="flex gap-4">
          {!showReject ? (
            <>
              <button onClick={handleApprove} className="btn-primary flex-grow h-14 uppercase tracking-widest text-[10px]">Setujui Revisi & Publikasi</button>
              <button onClick={() => setShowReject(true)} className="btn-primary bg-red-600 flex-grow h-14 uppercase tracking-widest text-[10px]">Tolak Revisi</button>
            </>
          ) : (
            <div className="w-full space-y-4">
               <textarea placeholder="Catatan kekurangan revisi..." className="input-field h-24 text-sm" value={reason} onChange={e => setReason(e.target.value)} />
               <div className="flex gap-4">
                 <button onClick={handleReject} className="btn-primary bg-red-600 flex-grow h-12 uppercase tracking-widest text-[10px]">Konfirmasi Tolak</button>
                 <button onClick={() => setShowReject(false)} className="btn-primary bg-slate-200 text-slate-900 flex-grow h-12 uppercase tracking-widest text-[10px]">Batal</button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
}
