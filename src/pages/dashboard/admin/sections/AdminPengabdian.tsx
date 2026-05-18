import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, CheckCircle2, XCircle, Eye, 
  Search, Filter, MapPin, Calendar, Clock, 
  FileText, Activity, AlertCircle, Save, Loader2,
  Trash2, ClipboardCheck, ArrowRight, UserCircle, 
  Building2, BookOpen, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { pengabdianService, PengabdianRegistration } from '@/src/services/pengabdianService';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function AdminPengabdian() {
  const [registrations, setRegistrations] = useState<PengabdianRegistration[]>([]);
  const [filter, setFilter] = useState<PengabdianRegistration['status'] | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<PengabdianRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    const data = await pengabdianService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filtered = registrations.filter(r => {
    const matchSearch = r.dosenName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' ? true : r.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading && registrations.length === 0) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Syncing Community Support Network...</p>
     </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Community Outreach Hub</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Manajemen Pengabdian
          </h1>
          <p className="text-slate-500 font-medium pt-2">Verifikasi program pengabdian masyarakat dosen dan validasi luaran.</p>
        </div>
        <div className="relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
           <input 
             type="text" 
             placeholder="Search Dosen..." 
             className="input-field pl-12 py-4 w-64 text-xs font-black uppercase tracking-widest shadow-sm bg-white" 
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
           {/* Filters */}
           <div className="flex gap-2 overflow-x-auto pb-4 side-scrollbar snap-x">
              {(['ALL', 'SUBMITTED', 'LOGBOOK', 'COMPLETED'] as const).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border snap-start",
                    filter === f ? "bg-slate-900 text-white shadow-xl border-slate-900 scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {f}
                </button>
              ))}
           </div>
           
           <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 side-scrollbar">
              {filtered.length === 0 ? (
                <div className="card p-20 text-center text-slate-300 italic font-black uppercase tracking-widest text-[10px] border-dashed border-2">No pengabdian logs detected.</div>
              ) : (
                filtered.map(reg => (
                  <button 
                    key={reg.id} 
                    onClick={() => setSelectedReg(reg)}
                    className={cn(
                      "w-full card p-6 text-left transition-all border-l-8 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden",
                      selectedReg?.id === reg.id ? "border-l-primary bg-primary/5 shadow-xl ring-2 ring-primary/10" : "border-l-slate-200 bg-white"
                    )}
                  >
                     <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Dosen Service</span>
                        <StatusBadge status={reg.status} />
                     </div>
                     <h4 className="font-black text-lg text-slate-900 truncate tracking-tight uppercase italic">{reg.dosenName}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: ARCHIVE-{reg.id.slice(0, 5)}</p>
                     
                     <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-5 transition-opacity">
                        <HeartHandshake size={80} />
                     </div>
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
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ type: 'spring', damping: 20 }}
                   className="space-y-8"
                 >
                   <div className="card bg-slate-900 text-white p-10 overflow-hidden relative shadow-2xl border-none">
                      <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Building2 size={240} className="text-primary" /></div>
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                         <div className="space-y-4">
                            <div className="inline-flex px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-lg">Outreach Profile</div>
                            <div className="space-y-1">
                               <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase underline decoration-primary/50 underline-offset-8">{selectedReg.dosenName}</h2>
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center pt-2">
                                  Expert Faculty 
                                  <span className="mx-3 text-slate-700 font-black">•</span>
                                  ID: {selectedReg.id.slice(0, 8)}
                               </p>
                            </div>
                         </div>
                         <div className="flex flex-col items-end space-y-3">
                            <StatusBadge status={selectedReg.status} />
                         </div>
                      </div>
                   </div>

                   <div className="animate-in fade-in zoom-in duration-500">
                      {selectedReg.status === 'SUBMITTED' && (
                        <PengabdianApproval reg={selectedReg} onAction={refreshData} />
                      )}
                      
                      {selectedReg.status === 'LOGBOOK' && (
                        <div className="card p-20 text-center bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                           <Activity size={80} className="text-primary mx-auto mb-8 animate-in zoom-in spin-in duration-700 shadow-teal-400" />
                           <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Project Operations Active</h3>
                           <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 italic max-w-sm mx-auto leading-relaxed">Dosen is currently executing the community outreach program and documenting tactical reports.</p>
                           
                           {selectedReg.info && (
                             <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10 text-left">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                   <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 leading-none">Sector</p>
                                   <span className="text-lg font-black text-white italic tracking-tighter truncate block">{selectedReg.info.lokasi}</span>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                   <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 leading-none">Deployed Since</p>
                                   <span className="text-lg font-black text-white italic tracking-tighter block">{selectedReg.info.tglBerangkat}</span>
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                                   <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1 leading-none">Unit ID</p>
                                   <span className="text-lg font-black text-white italic tracking-tighter block">{selectedReg.info.kelompok}</span>
                                </div>
                             </div>
                           )}
                        </div>
                      )}

                      {selectedReg.status === 'COMPLETED' && (
                        <div className="card p-20 text-center bg-slate-100 border-none shadow-inner relative overflow-hidden flex flex-col items-center">
                           <CheckCircle2 size={80} className="text-green-500 mb-8" />
                           <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Service Mission Accomplished</h3>
                           <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-6 italic">This project has been successfully archived in the institutional database.</p>
                           <button className="btn-primary mt-12 px-12 h-16 rounded-2xl shadow-xl font-black uppercase text-[11px] tracking-widest">Generate Certificate of Service</button>
                        </div>
                      )}
                   </div>
                 </motion.div>
               ) : (
                 <div className="card h-[700px] flex flex-col items-center justify-center text-center p-20 border-dashed border-2 bg-slate-50/50">
                    <div className="relative mb-10">
                       <HeartHandshake size={80} className="text-slate-200 scale-125" />
                       <Search size={32} className="text-primary absolute -right-2 -bottom-2 bg-white rounded-full p-1 shadow-lg" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em] italic leading-tight uppercase">Awaiting Outreach <br/> Selection</h3>
                    <p className="text-slate-400 text-xs font-bold mt-6 max-w-xs leading-relaxed">Please select a community service registration from the directory to start the audit process.</p>
                 </div>
               )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PengabdianApproval({ reg, onAction }: { reg: PengabdianRegistration, onAction: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);
  
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = {
        ...reg,
        status: 'LOGBOOK' as any,
        info: {
          lokasi: 'Kec. Dukun, Gresik',
          kelompok: 'DOSEN-SV-01',
          tglSosialisasi: new Date().toISOString().split('T')[0],
          tglBerangkat: new Date().toISOString().split('T')[0],
          tglPulang: new Date().toISOString().split('T')[0]
        }
      };
      await pengabdianService.saveRegistration(updated);
      toast.success('Pengabdian Dosen Disetujui!');
      onAction();
    } catch (e) { toast.error('Gagal validasi pengabdian'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="card p-12 bg-white shadow-2xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 rounded-[50px]">
       <div className="flex items-center justify-between border-b border-slate-100 pb-8">
          <div className="space-y-1">
             <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">Operation Mandate Audit</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic pl-1">Reviewing mission assignment letters and proposals</p>
          </div>
          <StatusBadge status="SUBMITTED" />
       </div>
       
       <div className="grid md:grid-cols-2 gap-10">
          <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-8 group hover:bg-slate-100 transition-colors">
             <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm text-primary flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={32} /></div>
                <div>
                   <p className="font-black italic text-xl uppercase tracking-tighter leading-none">Duty Order</p>
                   <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">Surat_Tugas.PDF</p>
                </div>
             </div>
             <button 
                onClick={() => reg.docs?.suratTugas && window.open(reg.docs.suratTugas, '_blank')}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center space-x-3 overflow-hidden group/btn"
             >
                <div className="w-0 group-hover/btn:w-4 transition-all duration-300 overflow-hidden"><Eye size={16} /></div>
                <span>AUDIT DOCUMENT</span>
             </button>
          </div>
          <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-8 group hover:bg-slate-100 transition-colors">
             <div className="flex items-center space-x-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm text-primary flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen size={32} /></div>
                <div>
                   <p className="font-black italic text-xl uppercase tracking-tighter leading-none">Strategic Proposal</p>
                   <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">Proposal_Service.PDF</p>
                </div>
             </div>
             <button 
                onClick={() => reg.docs?.proposalFile && window.open(reg.docs.proposalFile, '_blank')}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center space-x-3 overflow-hidden group/btn"
             >
                <div className="w-0 group-hover/btn:w-4 transition-all duration-300 overflow-hidden"><Eye size={16} /></div>
                <span>AUDIT DOCUMENT</span>
             </button>
          </div>
       </div>

       <div className="flex gap-6 pt-6">
          <button 
             disabled={actionLoading}
             onClick={handleApprove} 
             className="flex-grow h-24 btn-primary rounded-[36px] shadow-2xl shadow-primary/30 font-black uppercase text-[13px] tracking-[0.4em] flex items-center justify-center group"
          >
             {actionLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  AUTHORIZE SERVICE MISSION
                  <Send size={22} className="ml-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </>
             )}
          </button>
          <button className="h-24 px-12 bg-red-600 text-white rounded-[36px] shadow-xl hover:bg-red-700 transition-colors uppercase font-black text-[11px] tracking-widest">
             DENY & LOG
          </button>
       </div>
    </div>
  );
}
