
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, CheckCircle2, XCircle, Eye, 
  Search, Filter, MapPin, Calendar, Clock, 
  FileText, Activity, AlertCircle, Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { pengabdianService, PengabdianRegistration } from '@/src/services/pengabdianService';

export default function AdminPengabdian() {
  const [registrations, setRegistrations] = useState<PengabdianRegistration[]>([]);
  const [filter, setFilter] = useState<PengabdianRegistration['status'] | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<PengabdianRegistration | null>(null);

  const refreshData = async () => {
    const data = await pengabdianService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filtered = registrations.filter(r => {
    const matchSearch = r.dosenName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' ? true : r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen Pengabdian</h1>
          <p className="text-slate-500 font-medium mt-1">Verifikasi berkas dan monitoring pengabdian dosen.</p>
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
        <div className="lg:col-span-1 space-y-4">
           {/* Filters */}
           <div className="flex gap-2 overflow-x-auto pb-2 side-scrollbar">
              {(['ALL', 'SUBMITTED', 'LOGBOOK', 'COMPLETED'] as const).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                    filter === f ? "bg-primary text-white shadow-lg" : "bg-white text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="card p-10 text-center text-slate-400 italic font-medium text-xs">Tidak ada data pengabdian.</div>
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
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Community Service</span>
                        <div className={cn("w-2 h-2 rounded-full", reg.status === 'SUBMITTED' ? "bg-orange-400 animate-pulse" : "bg-slate-200")} />
                     </div>
                     <h4 className="font-bold text-slate-900 truncate">{reg.dosenName}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{reg.status.replace('_', ' ')}</p>
                  </button>
                ))
              )}
           </div>
        </div>

        <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
               {selectedReg ? (
                 <motion.div 
                   key={selectedReg.id}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-8"
                 >
                   <div className="card bg-slate-900 text-white p-8">
                      <h2 className="text-2xl font-black italic text-white uppercase underline decoration-primary underline-offset-4">{selectedReg.dosenName}</h2>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Dosen Programmer • ID: {selectedReg.id}</p>
                   </div>

                   {selectedReg.status === 'SUBMITTED' && (
                     <PengabdianApproval reg={selectedReg} onAction={refreshData} />
                   )}
                   
                   {selectedReg.status === 'LOGBOOK' && (
                     <div className="card p-10 text-center border-slate-200">
                        <Activity size={48} className="text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold italic">Dalam Tahap Pelaksanaan</h3>
                        <p className="text-sm text-slate-500 mt-2">Dosen sedang menjalankan program pengabdian dan mengisi logbook.</p>
                     </div>
                   )}
                 </motion.div>
               ) : (
                 <div className="card h-[400px] flex flex-col items-center justify-center text-center p-20 border-dashed">
                    <HeartHandshake size={64} className="text-slate-100 mb-4" />
                    <h3 className="text-xl font-bold text-slate-300 uppercase italic tracking-widest">Pilih pendaftaran pengabdian</h3>
                 </div>
               )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PengabdianApproval({ reg, onAction }: { reg: PengabdianRegistration, onAction: () => void }) {
  const handleApprove = async () => {
    const updated = {
      ...reg,
      status: 'LOGBOOK' as any,
      info: {
        lokasi: 'Kec. Dukun, Gresik',
        kelompok: 'Dosen-01',
        tglSosialisasi: '2024-06-01',
        tglBerangkat: '2024-06-02',
        tglPulang: '2024-06-30'
      }
    };
    await pengabdianService.saveRegistration(updated);
    onAction();
  };

  return (
    <div className="card p-8 space-y-8">
       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 italic">Verifikasi Pengabdian Dosen</h3>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase">Review Required</span>
       </div>
       <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                   <FileText className="text-primary" />
                   <span className="text-sm font-bold text-slate-700">Surat_Tugas.pdf</span>
                </div>
                <button onClick={() => reg.suratTugas && window.open(reg.suratTugas, '_blank')}>
                   <Eye size={18} className="text-primary cursor-pointer hover:scale-110 transition-transform" />
                </button>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                   <FileText className="text-primary" />
                   <span className="text-sm font-bold text-slate-700">Proposal_Pengabdian.pdf</span>
                </div>
                <button onClick={() => reg.proposalFile && window.open(reg.proposalFile, '_blank')}>
                   <Eye size={18} className="text-primary cursor-pointer hover:scale-110 transition-transform" />
                </button>
             </div>
       </div>
       <div className="flex gap-4 pt-4">
          <button onClick={handleApprove} className="btn-primary flex-grow py-5 text-xs">Setujui & Terbitkan Surat Jalan</button>
          <button className="btn-primary bg-red-600 flex-grow py-5 text-xs">Tolak Berkas</button>
       </div>
    </div>
  );
}
