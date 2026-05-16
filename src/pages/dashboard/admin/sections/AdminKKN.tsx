
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Eye, Search, 
  Filter, MapPin, Calendar, Clock, ArrowRight,
  FileText, Activity, AlertCircle, Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { kknService, KKNRegistration, KKNLogbook } from '@/src/services/kknService';

export default function AdminKKN() {
  const [registrations, setRegistrations] = useState<KKNRegistration[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'LPK_PENDING' | 'GRADING'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<KKNRegistration | null>(null);

  useEffect(() => {
    setRegistrations(kknService.getRegistrations());
  }, []);

  const refreshData = () => {
    setRegistrations(kknService.getRegistrations());
    if (selectedReg) {
      setSelectedReg(kknService.getRegistrations().find(r => r.id === selectedReg.id) || null);
    }
  };

  const filtered = registrations.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' ? true : r.status.includes(filter);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen KKN</h1>
          <p className="text-slate-500 font-medium mt-1">Verifikasi berkas, monitoring logbook, dan penilaian akhir.</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari mahasiswa..." 
                className="input-field pl-12 py-3 w-64 text-sm" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* List */}
        <div className="lg:col-span-1 space-y-4">
           <div className="flex gap-2 overflow-x-auto pb-2 side-scrollbar">
              {(['ALL', 'SUBMITTED', 'LPK_PENDING', 'GRADING'] as const).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                    filter === f ? "bg-primary text-white shadow-lg" : "bg-white text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {f === 'SUBMITTED' ? 'PENDAFTARAN' : f.replace('_', ' ')}
                </button>
              ))}
           </div>
           
           <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="card p-10 text-center text-slate-400 italic font-medium text-xs">Tidak ada data pendaftaran.</div>
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
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{reg.type}</span>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          reg.status.includes('PENDING') ? "bg-orange-400 animate-pulse" : "bg-slate-200"
                        )} />
                     </div>
                     <h4 className="font-bold text-slate-900 truncate">{reg.studentName}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{reg.status.replace('_', ' ')}</p>
                  </button>
                ))
              )}
           </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
              {selectedReg ? (
                <motion.div 
                  key={selectedReg.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="card bg-slate-900 text-white p-8 overflow-hidden relative">
                     <div className="relative z-10 flex justify-between items-center">
                        <div>
                           <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase underline decoration-primary underline-offset-4">{selectedReg.studentName}</h2>
                           <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{selectedReg.studentId} • {selectedReg.type} KKN</p>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
                           ID: {selectedReg.id}
                        </div>
                     </div>
                  </div>

                  {/* Dynamic Phase Controls */}
                  {selectedReg.status === 'SUBMITTED' && (
                    <RegistrationApproval reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'SURVEY_PENDING' && (
                    <SurveyApproval reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'RKL_PENDING' && (
                    <RKLApproval reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'DEPLOYMENT_PENDING' && (
                    <DeploymentApproval reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'LOGBOOK' && (
                    <LogbookApproval reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'LPK_PENDING' && (
                    <LPKApproval reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'GRADING' && (
                    <GradingBox reg={selectedReg} onAction={refreshData} />
                  )}
                  {selectedReg.status === 'COMPLETED' && (
                    <div className="card p-10 text-center border-green-200 bg-green-50/20">
                       <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
                       <h3 className="text-xl font-bold text-green-900">KKN Selesai & Dinilai</h3>
                       <p className="text-sm text-green-800/60 mt-2">Seluruh proses akademik telah dituntaskan.</p>
                    </div>
                  )}

                  {/* Info Box if already defined */}
                  {selectedReg.info && (
                    <div className="card grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-slate-50 border-none shadow-inner">
                       {[
                         { label: 'Lokasi', value: selectedReg.info.lokasi },
                         { label: 'Kelompok', value: selectedReg.info.kelompok },
                         { label: 'DPL', value: selectedReg.info.dpl },
                         { label: 'Sosialisasi', value: selectedReg.info.tglSosialisasi },
                       ].map((item, i) => (
                         <div key={i}>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <p className="text-sm font-bold text-slate-900 mt-1">{item.value}</p>
                         </div>
                       ))}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="card h-[500px] flex flex-col items-center justify-center text-center p-20 border-dashed">
                   <Users size={64} className="text-slate-100 mb-6" />
                   <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest italic">Pilih mahasiswa untuk dikelola</h3>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function RegistrationApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [info, setInfo] = useState({
     lokasi: 'Desa Mentaras',
     kelompok: 'Kelompok 04',
     dpl: 'Dr. Ahmad M.Si',
     tglSosialisasi: '2024-06-12',
     tglBerangkat: '2024-06-15',
     tglPulang: '2024-07-30',
     lokasiSosialisasi: 'Gedung Serbaguna Desa'
  });

  const handleApprove = () => {
    reg.status = 'APPROVED';
    reg.info = info as any;
    kknService.updateRegistration(reg);
    onAction();
  };

  const handleReject = () => {
    reg.status = 'REJECTED';
    reg.rejectionReason = reason;
    kknService.updateRegistration(reg);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 italic">Verifikasi Berkas Mahasiswa</h3>
          <span className="text-[10px] font-black text-orange-500 uppercase px-3 py-1 bg-orange-50 rounded-full">Pending Review</span>
       </div>
       <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Dokumen</p>
             <div className="space-y-2">
                {Object.entries(reg.docs).map(([key, ok]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <span className="text-xs font-bold text-slate-700 capitalize">{key}</span>
                     <Eye size={16} className="text-primary cursor-pointer hover:scale-110 transition-transform" />
                  </div>
                ))}
             </div>
          </div>
          <div className="space-y-6">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tindakan Cepat</p>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={handleApprove} className="btn-primary flex items-center justify-center py-4 text-[10px]"><CheckCircle2 className="mr-2" size={16} /> Terima</button>
                   <button onClick={handleReject} className="btn-primary bg-red-600 hover:bg-red-700 flex items-center justify-center py-4 text-[10px]"><XCircle className="mr-2" size={16} /> Tolak</button>
                </div>
                {reg.status !== 'APPROVED' && (
                  <textarea 
                    placeholder="Alasan penolakan..." 
                    className="input-field h-24 text-sm"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                  />
                )}
             </div>
          </div>
       </div>
       <div className="space-y-4 pt-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Pengaturan Penempatan (Set after approval)</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
             <input placeholder="Lokasi KKN" className="input-field text-xs" value={info.lokasi} onChange={e => setInfo({...info, lokasi: e.target.value})} />
             <input placeholder="Kelompok" className="input-field text-xs" value={info.kelompok} onChange={e => setInfo({...info, kelompok: e.target.value})} />
             <input placeholder="DPL" className="input-field text-xs" value={info.dpl} onChange={e => setInfo({...info, dpl: e.target.value})} />
             <input placeholder="Tgl Sosialisasi" type="date" className="input-field text-xs" value={info.tglSosialisasi} onChange={e => setInfo({...info, tglSosialisasi: e.target.value})} />
          </div>
       </div>
    </div>
  );
}

function SurveyApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const handleApprove = () => {
    reg.status = 'RKL';
    if (reg.surveyDocs) reg.surveyDocs.status = 'APPROVED';
    kknService.updateRegistration(reg);
    onAction();
  };

  return (
    <div className="card p-8 space-y-6">
       <h3 className="font-bold text-slate-900 italic">Verifikasi Dokumentasi Survey</h3>
       <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
             <p className="text-[10px] font-black text-slate-400 uppercase">Foto Sosialisasi</p>
             <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><Eye size={16}/></div>)}
             </div>
          </div>
          <div className="space-y-3">
             <p className="text-[10px] font-black text-slate-400 uppercase">Foto Survey</p>
             <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-300"><Eye size={16}/></div>)}
             </div>
          </div>
       </div>
       <div className="flex gap-4">
          <button onClick={handleApprove} className="btn-primary flex-grow">Setujui Survey</button>
          <button className="btn-primary bg-red-600 flex-grow">Tolak & Ulangi</button>
       </div>
    </div>
  );
}

function RKLApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const handleApprove = () => {
    reg.status = 'DEPLOYMENT';
    if (reg.rkl) reg.rkl.status = 'APPROVED';
    kknService.updateRegistration(reg);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8">
       <h3 className="font-bold text-slate-900 italic">Review Rencana Kegiatan Lapangan (RKL)</h3>
       <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
             <div className="flex items-center space-x-3">
                <FileText className="text-primary" />
                <span className="text-sm font-bold text-slate-700">RKL Individu.pdf</span>
             </div>
             <button className="text-[10px] font-black text-primary hover:underline">LIHAT</button>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
             <div className="flex items-center space-x-3">
                <FileText className="text-primary" />
                <span className="text-sm font-bold text-slate-700">RKL Kelompok.pdf</span>
             </div>
             <button className="text-[10px] font-black text-primary hover:underline">LIHAT</button>
          </div>
       </div>
       <div className="space-y-4">
          <textarea placeholder="Catatan untuk mahasiswa..." className="input-field text-sm h-20" />
          <div className="flex gap-4">
             <button onClick={handleApprove} className="btn-primary flex-grow py-5">Terima & Lanjut Deployment</button>
             <button className="btn-primary bg-red-500 flex-grow py-5">Tolak RKL</button>
          </div>
       </div>
    </div>
  );
}

function DeploymentApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const handleApprove = () => {
    reg.status = 'LOGBOOK';
    kknService.updateRegistration(reg);
    onAction();
  };

  return (
    <div className="card p-10 text-center space-y-8">
       <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
          <CheckCircle2 size={40} />
       </div>
       <h3 className="text-xl font-black italic underline decoration-primary underline-offset-4">Approval Pemberangkatan</h3>
       <div className="flex gap-4">
          <button onClick={handleApprove} className="btn-primary flex-grow py-4">Validasi Selesai: Mulai KKN</button>
       </div>
    </div>
  );
}

function LogbookApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [logbooks, setLogbooks] = useState([...reg.logbooks]);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
     const index = reg.logbooks.findIndex(l => l.id === id);
     if (index > -1) {
        reg.logbooks[index].status = status;
        kknService.updateRegistration(reg);
        onAction();
        setLogbooks([...reg.logbooks]);
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
          <h3 className="font-bold text-slate-900 italic">Monitoring Logbook</h3>
          <div className="text-[40px] font-black italic text-primary leading-none">{reg.totalHours.toFixed(1)} <span className="text-[10px] text-slate-400 not-italic uppercase tracking-widest font-black">/ 126 Jam</span></div>
       </div>
       <div className="space-y-4">
          {logbooks.map(log => (
            <div key={log.id} className="card p-6 flex items-center justify-between border-l-4 border-l-primary/30">
               <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase">{log.date} • {log.hours} Jam</div>
                  <h5 className="font-bold text-slate-900 italic text-sm">{log.nama}</h5>
                  <p className="text-[10px] font-medium text-slate-500">Desa: {log.pihakDesa} ({log.statusPihakDesa})</p>
               </div>
               {log.status === 'PENDING' ? (
                 <div className="flex space-x-2">
                    <button onClick={() => handleAction(log.id, 'APPROVED')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><CheckCircle2 size={18} /></button>
                    <button onClick={() => handleAction(log.id, 'REJECTED')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><XCircle size={18} /></button>
                 </div>
               ) : (
                 <div className={cn(
                   "text-[9px] font-black uppercase px-2 py-1 rounded-full",
                   log.status === 'APPROVED' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                 )}>
                    {log.status}
                 </div>
               )}
            </div>
          ))}
       </div>
    </div>
  );
}

function LPKApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const handleApprove = () => {
    reg.status = 'GRADING';
    if (reg.lpk) reg.lpk.status = 'APPROVED';
    kknService.updateRegistration(reg);
    onAction();
  };

  return (
    <div className="card p-8 space-y-10">
       <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-4 italic">Verifikasi Laporan Akhir (LPK)</h3>
       <div className="grid md:grid-cols-2 gap-8">
          <div className="card bg-slate-50 border-none space-y-4">
             <div className="flex items-center space-x-4">
                <FileText className="text-primary" />
                <p className="font-bold text-slate-800 text-sm">LPK Individu</p>
             </div>
             <button className="btn-primary w-full py-2.5 text-[10px] bg-slate-900">Review PDF</button>
          </div>
          <div className="card bg-slate-50 border-none space-y-4">
             <div className="flex items-center space-x-4">
                <FileText className="text-primary" />
                <p className="font-bold text-slate-800 text-sm">LPK Kelompok</p>
             </div>
             <button className="btn-primary w-full py-2.5 text-[10px] bg-slate-900">Review PDF</button>
          </div>
       </div>
       <div className="flex gap-4">
          <button onClick={handleApprove} className="btn-primary flex-grow py-5">Setujui & Lanjut Penilaian</button>
       </div>
    </div>
  );
}

function GradingBox({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [scores, setScores] = useState({ rkl: 90, kinerja: 85, lpk: 88, responsi: 80 });

  const handleFinish = () => {
    const { total, gradeText } = kknService.calculateFinalGrade(scores.rkl, scores.kinerja, scores.lpk, scores.responsi);
    reg.grades = { ...scores, total, gradeText };
    reg.status = 'COMPLETED';
    kknService.updateRegistration(reg);
    onAction();
  };

  return (
    <div className="card p-10 space-y-10">
       <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-primary underline-offset-8">Input Penilaian Akhir</h3>
          <div className="text-3xl font-black text-primary italic">
             {kknService.calculateFinalGrade(scores.rkl, scores.kinerja, scores.lpk, scores.responsi).total.toFixed(1)}
          </div>
       </div>
       <div className="grid md:grid-cols-2 gap-8">
          {[
            { id: 'rkl', label: 'Rencana Kegiatan (5%)', value: scores.rkl },
            { id: 'kinerja', label: 'Kinerja Lapangan (70%)', value: scores.kinerja },
            { id: 'lpk', label: 'Pelaporan KKN (15%)', value: scores.lpk },
            { id: 'responsi', label: 'Responsi (10%)', value: scores.responsi },
          ].map(comp => (
            <div key={comp.id}>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{comp.label}</label>
               <input 
                 type="number" 
                 className="input-field" 
                 value={comp.value} 
                 onChange={e => setScores({...scores, [comp.id]: Number(e.target.value)})}
               />
            </div>
          ))}
       </div>
       <button onClick={handleFinish} className="btn-primary w-full py-5 text-[10px] tracking-widest shadow-2xl">Finalisasi & Simpan Sertifikat</button>
    </div>
  );
}

