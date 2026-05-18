import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Eye, Search, 
  Filter, MapPin, Calendar, Clock, ArrowRight,
  FileText, Activity, AlertCircle, Save, Loader2,
  Trash2, ClipboardCheck, GraduationCap, Building2,
  Camera, Plus, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { kknService, KKNRegistration, KKNLogbook, KKNStatus } from '@/src/services/kknService';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function AdminKKN() {
  const [registrations, setRegistrations] = useState<KKNRegistration[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'SUBMITTED' | 'LPK_PENDING' | 'GRADING'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<KKNRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await kknService.getRegistrations();
      setRegistrations(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    const data = await kknService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
  };

  const filtered = registrations.filter(r => {
    const matchSearch = r.studentName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' ? true : r.status.includes(filter);
    return matchSearch && matchFilter;
  });

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Syncing Community Service Data...</p>
     </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>HQ Command Center</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Manajemen KKN
          </h1>
          <p className="text-slate-500 font-medium pt-2">Audit berkas pendaftaran, evaluasi logbook harian, dan validasi nilai akhir.</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search Candidate..." 
                className="input-field pl-12 py-4 w-72 text-xs font-bold uppercase tracking-widest border-slate-200 focus:w-80 transition-all bg-white shadow-sm" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* List Column */}
        <div className="lg:col-span-1 space-y-6">
           <div className="flex gap-2 overflow-x-auto pb-4 side-scrollbar snap-x">
              {(['ALL', 'SUBMITTED', 'LPK_PENDING', 'GRADING'] as const).map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border snap-start",
                    filter === f ? "bg-slate-900 text-white shadow-xl border-slate-900 scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {f === 'SUBMITTED' ? 'Inbox Pendaftaran' : f.replace('_', ' ')}
                </button>
              ))}
           </div>
           
           <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 side-scrollbar">
              {filtered.length === 0 ? (
                <div className="card p-20 text-center text-slate-300 italic font-black uppercase tracking-widest text-[10px] border-dashed border-2">No active records found.</div>
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
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">{reg.type}</span>
                        <StatusBadge status={reg.status} />
                     </div>
                     <h4 className="font-black text-lg text-slate-900 truncate tracking-tight uppercase italic">{reg.studentName}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {reg.id.slice(0, 8)}</p>
                     
                     <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-5 transition-opacity">
                        <GraduationCap size={80} />
                     </div>
                  </button>
                ))
              )}
           </div>
        </div>

        {/* Detail Column */}
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
                  <div className="card bg-slate-900 text-white p-10 overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border-none">
                     <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12"><Building2 size={240} className="text-primary" /></div>
                     <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-4">
                           <div className="inline-flex px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-lg">Operational Profile</div>
                           <div className="space-y-1">
                              <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase underline decoration-primary/50 underline-offset-8">{selectedReg.studentName}</h2>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center pt-2">
                                 <Hash size={14} className="mr-2 text-primary" /> {selectedReg.studentId} 
                                 <span className="mx-3 text-slate-700">•</span>
                                 <Calendar size={14} className="mr-2 text-primary" /> {new Date().getFullYear()} SESSION
                              </p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                           <StatusBadge status={selectedReg.status} />
                           <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 backdrop-blur-sm">
                              ARCHIVE #{selectedReg.id.slice(0, 8)}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Context-Aware Dynamic Phase Controls */}
                  <div className="animate-in fade-in zoom-in duration-500">
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
                      <div className="card p-20 text-center bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
                         <div className="absolute inset-0 bg-green-500/5" />
                         <CheckCircle2 size={80} className="text-primary mx-auto mb-8 animate-in zoom-in spin-in duration-700" />
                         <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Yudisium Completed</h3>
                         <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 italic">Candidate has fulfilled and defended all academic requirements.</p>
                         
                         <div className="mt-12 grid grid-cols-2 gap-6 relative z-10">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                               <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Final Score</p>
                               <span className="text-3xl font-black text-white italic">{selectedReg.grades?.total.toFixed(1)}</span>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                               <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Final Grade</p>
                               <span className="text-3xl font-black text-white italic">{selectedReg.grades?.gradeText}</span>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Footer */}
                  {selectedReg.info && (
                    <div className="card p-10 grid grid-cols-2 lg:grid-cols-4 gap-10 bg-white shadow-xl shadow-slate-200/50">
                       {[
                         { label: 'Deployed Location', value: selectedReg.info.lokasi, icon: MapPin },
                         { label: 'Tactical Group', value: selectedReg.info.kelompok, icon: Users },
                         { label: 'Lead Supervisor (DPL)', value: selectedReg.info.dpl, icon: UserCircle },
                         { label: 'Socialization Sync', value: selectedReg.info.tglSosialisasi, icon: Calendar },
                       ].map((item, i) => (
                         <div key={i} className="space-y-3">
                            <div className="flex items-center space-x-2">
                               <item.icon size={14} className="text-primary" />
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            </div>
                            <p className="text-md font-black text-slate-900 italic tracking-tight">{item.value || 'UNASSIGNED'}</p>
                         </div>
                       ))}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="card h-[700px] flex flex-col items-center justify-center text-center p-20 border-dashed border-2 bg-slate-50/50">
                   <div className="relative mb-10">
                      <Users size={80} className="text-slate-200 scale-125" />
                      <Search size={32} className="text-primary absolute -right-2 -bottom-2 bg-white rounded-full p-1 shadow-lg" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em] italic leading-tight">Awaiting Candidate <br/> Selection</h3>
                   <p className="text-slate-400 text-xs font-bold mt-6 max-w-xs leading-relaxed">Select a military-grade record from the explorer list to perform administrative audits.</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import { UserCircle, Hash } from 'lucide-react';

function RegistrationApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [info, setInfo] = useState({
     lokasi: 'Desa Mentaras, Gresik',
     kelompok: 'REG-01',
     dpl: 'DPL Akademik (TBA)',
     tglSosialisasi: new Date().toISOString().split('T')[0],
     tglBerangkat: new Date().toISOString().split('T')[0],
     tglPulang: new Date().toISOString().split('T')[0],
     lokasiSosialisasi: 'Gedung Serbaguna Desa'
  });

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updatedReg = { ...reg, status: 'APPROVED' as KKNStatus, info: info as any };
      await kknService.updateRegistration(updatedReg);
      toast.success('Pendaftaran Mahasiswa Disetujui!');
      onAction();
    } catch (error) { toast.error('Gagal memproses persetujuan'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!reason) return toast.error('Berikan alasan penolakan');
    setActionLoading(true);
    try {
      const updatedReg = { ...reg, status: 'REJECTED' as KKNStatus, rejectionReason: reason };
      await kknService.updateRegistration(updatedReg);
      toast.info('Pendaftaran ditolak');
      onAction();
    } catch (error) { toast.error('Gagal menolak pendaftaran'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="card p-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-white shadow-2xl">
       <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
             <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Admission Audit</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 italic">Verify student eligibility documents</p>
          </div>
          <StatusBadge status="SUBMITTED" />
       </div>

       <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Manifest Dokumen</p>
             <div className="grid grid-cols-1 gap-3">
                {Object.entries(reg.docs).map(([key, ok]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                     <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</span>
                     {typeof ok === 'string' && ok.startsWith('http') ? (
                       <button onClick={() => window.open(ok, '_blank')} className="p-2 bg-white rounded-xl shadow-sm text-primary hover:scale-110 transition-transform">
                          <Eye size={18} />
                       </button>
                     ) : (
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Missing Proof</span>
                     )}
                  </div>
                ))}
             </div>
          </div>
          <div className="flex flex-col justify-between space-y-8">
             <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic underline decoration-primary/30 underline-offset-4">Strategic Deployment Config</p>
                <div className="grid grid-cols-1 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Assign Location</label>
                      <input className="input-field h-14 font-bold" value={info.lokasi} onChange={e => setInfo({...info, lokasi: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Squad Name</label>
                         <input className="input-field h-14 font-bold text-center" value={info.kelompok} onChange={e => setInfo({...info, kelompok: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Sync Date</label>
                         <input type="date" className="input-field h-14 font-bold" value={info.tglSosialisasi} onChange={e => setInfo({...info, tglSosialisasi: e.target.value})} />
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Assign DPL (Lead)</label>
                      <input className="input-field h-14 font-bold" value={info.dpl} onChange={e => setInfo({...info, dpl: e.target.value})} />
                   </div>
                </div>
             </div>

             <div className="space-y-8 pt-8 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     disabled={actionLoading}
                     onClick={handleApprove} 
                     className="btn-primary flex items-center justify-center h-16 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                   >
                     {actionLoading ? <Loader2 className="animate-spin" /> : <ClipboardCheck className="mr-3" size={20} />} 
                     AUTHORIZE ADMISSION
                   </button>
                   <button 
                     disabled={actionLoading}
                     onClick={handleReject} 
                     className="bg-red-600 text-white flex items-center justify-center h-16 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-200 hover:bg-red-700 transition-colors"
                   >
                     {actionLoading ? <Loader2 className="animate-spin" /> : <XCircle className="mr-3" size={20} />} 
                     DENY & ARCHIVE
                   </button>
                </div>
                {reason !== undefined && (
                   <textarea 
                     placeholder="State the reasons for rejection (REQUIRED)..." 
                     className="input-field h-24 text-sm font-bold pt-4 focus:ring-red-500/20 focus:border-red-500/50 bg-red-50/10"
                     value={reason}
                     onChange={e => setReason(e.target.value)}
                   />
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

function SurveyApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = {
        ...reg,
        status: 'RKL' as KKNStatus,
        surveyDocs: reg.surveyDocs ? { ...reg.surveyDocs, status: 'APPROVED' as const } : undefined
      };
      await kknService.updateRegistration(updated);
      toast.success('Survey Disetujui!');
      onAction();
    } catch (error) { toast.error('Gagal memproses'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="card p-12 bg-white shadow-xl space-y-10 animate-in slide-in-from-left duration-500">
       <div className="flex justify-between items-center bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
          <div className="space-y-1">
             <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Intelligence Report (Survey)</h3>
             <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-4 pl-1">Validation of field findings</p>
          </div>
          <Activity size={48} className="text-primary animate-pulse" />
       </div>

       <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">Socialization Intel</p>
             <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-[32px] border border-slate-100 min-h-[120px]">
                {reg.surveyDocs?.sosialisasi?.map((url, i) => (
                   <div key={i} className="aspect-square bg-white rounded-2xl border flex items-center justify-center p-1 group relative overflow-hidden shadow-sm">
                      <img src={url} className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                      <button onClick={() => window.open(url, '_blank')} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Eye className="text-white" /></button>
                   </div>
                )) || <div className="col-span-full flex items-center justify-center italic text-slate-300 font-bold uppercase text-[9px]">Missing Assets</div>}
             </div>
          </div>
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 italic">Field Survey Proof</p>
             <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-[32px] border border-slate-100 min-h-[120px]">
                {reg.surveyDocs?.survei?.map((url, i) => (
                   <div key={i} className="aspect-square bg-white rounded-2xl border flex items-center justify-center p-1 group relative overflow-hidden shadow-sm">
                      <img src={url} className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                      <button onClick={() => window.open(url, '_blank')} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Eye className="text-white" /></button>
                   </div>
                )) || <div className="col-span-full flex items-center justify-center italic text-slate-300 font-bold uppercase text-[9px]">Missing Assets</div>}
             </div>
          </div>
       </div>

       <div className="flex gap-4 pt-6">
          <button 
            disabled={actionLoading}
            onClick={handleApprove} 
            className="flex-grow h-20 bg-primary text-white rounded-[28px] shadow-2xl shadow-primary/30 font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all"
          >
            {actionLoading ? <Loader2 className="animate-spin" /> : (
               <span className="flex items-center">VALIDATE INTELLIGENCE <ArrowRight size={20} className="ml-4" /></span>
            )}
          </button>
          <button className="h-20 px-10 bg-red-600 text-white rounded-[28px] shadow-xl hover:bg-red-700 transition-colors uppercase font-black text-[11px] tracking-widest">
             REFUTE DATA
          </button>
       </div>
    </div>
  );
}

function RKLApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = {
        ...reg,
        status: 'DEPLOYMENT' as KKNStatus,
        rkl: reg.rkl ? { ...reg.rkl, status: 'APPROVED' as const } : undefined
      };
      await kknService.updateRegistration(updated);
      toast.success('RKL Disetujui!');
      onAction();
    } catch (error) { toast.error('Gagal memproses RKL'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="card p-12 bg-white space-y-12 shadow-2xl relative overflow-hidden">
       <div className="absolute -top-10 -right-10 opacity-5 rotate-12"><FileText size={240} className="text-primary" /></div>
       <div className="text-center space-y-3 relative z-10">
          <h3 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Operational Directives (RKL)</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 italic">Auditing individual and group mission plans</p>
       </div>

       <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col items-center justify-center space-y-6 group hover:bg-slate-100 transition-colors">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><FileText size={40} /></div>
             <div className="text-center">
                <p className="font-black italic text-xl uppercase tracking-tighter">Individual Plan</p>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Manuscript.pdf</p>
             </div>
             <button onClick={() => reg.rkl?.fileIndividu && window.open(reg.rkl.fileIndividu, '_blank')} className="btn-primary px-8 h-12 text-[9px] uppercase font-black bg-slate-900 border-none rounded-xl">Review Manuscript</button>
          </div>
          <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col items-center justify-center space-y-6 group hover:bg-slate-100 transition-colors">
             <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Users size={40} /></div>
             <div className="text-center">
                <p className="font-black italic text-xl uppercase tracking-tighter">Squad Tactical Plan</p>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Team_RKL.pdf</p>
             </div>
             <button onClick={() => reg.rkl?.fileKelompok && window.open(reg.rkl.fileKelompok, '_blank')} className="btn-primary px-8 h-12 text-[9px] uppercase font-black bg-slate-900 border-none rounded-xl">Review Manuscript</button>
          </div>
       </div>

       <div className="space-y-6 relative z-10 border-t border-slate-100 pt-10">
          <textarea placeholder="Directives for revisions (Optional)..." className="input-field h-24 pt-4 text-sm font-bold bg-slate-50/50" />
          <div className="flex gap-6">
             <button 
               disabled={actionLoading}
               onClick={handleApprove} 
               className="flex-grow h-20 btn-primary rounded-[32px] shadow-2xl uppercase font-black text-[11px] tracking-[0.3em] flex items-center justify-center"
             >
               {actionLoading ? <Loader2 className="animate-spin" /> : (
                 <span className="flex items-center">AUTHORIZE RKL AND DEPLOY <ArrowRight size={20} className="ml-4" /></span>
               )}
             </button>
             <button className="h-20 px-12 bg-red-600 text-white rounded-[32px] font-black uppercase text-[10px] tracking-widest shadow-xl">DENY MISSION</button>
          </div>
       </div>
    </div>
  );
}

function DeploymentApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = { ...reg, status: 'LOGBOOK' as KKNStatus };
      await kknService.updateRegistration(updated);
      toast.success('Pemberangkatan Valid!');
      onAction();
    } catch (error) { toast.error('Gagal validasi'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="card p-20 text-center space-y-10 border-none bg-slate-900 text-white relative overflow-hidden shadow-2xl rounded-[50px]">
       <div className="absolute inset-0 bg-primary/5 animate-pulse" />
       <div className="relative z-10 w-32 h-32 bg-primary/20 rounded-[44px] flex items-center justify-center text-primary mx-auto border border-primary/20 backdrop-blur-md">
          {actionLoading ? <Loader2 className="animate-spin" size={60} /> : <ClipboardCheck size={60} />}
       </div>
       <div className="space-y-4 relative z-10">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter">Mission Deployment</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px] max-w-sm mx-auto leading-relaxed">Validate the departure rituals and candidate readiness for field work.</p>
       </div>
       <div className="flex gap-4 relative z-10 max-w-md mx-auto">
          {reg.deploymentPhoto && (
            <button onClick={() => window.open(reg.deploymentPhoto, '_blank')} className="flex-grow h-16 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-white/10">VIEW CEREMONY PROOF</button>
          )}
          <button onClick={handleApprove} className="btn-primary flex-grow h-16 rounded-2xl shadow-2xl font-black uppercase text-[10px] tracking-widest">
             {actionLoading ? <Loader2 className="animate-spin" /> : 'CONFIRM DEPLOYMENT'}
          </button>
       </div>
    </div>
  );
}

function LogbookApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [logbooks, setLogbooks] = useState([...reg.logbooks]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
     setActionLoading(id);
     try {
       const updatedLogbooks = reg.logbooks.map(l => 
         l.id === id ? { ...l, status } : l
       );
       const updated = { ...reg, logbooks: updatedLogbooks };
       await kknService.updateRegistration(updated);
       setLogbooks(updatedLogbooks);
       toast.success(`Logbook ${status.toLowerCase()}`);
       onAction();
     } catch (error) { toast.error('Gagal update'); }
     finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
       <div className="flex justify-between items-end bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div>
            <h3 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">Activity Stream</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 italic pl-1">Live monitoring of candidate logbooks</p>
          </div>
          <div className="text-right">
             <div className="text-6xl font-black italic text-primary tracking-tighter leading-none">{reg.totalHours.toFixed(1)}</div>
             <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black italic">Accumulated Hours</span>
          </div>
       </div>

       <div className="space-y-6">
          {logbooks.map(log => (
            <div key={log.id} className={cn(
              "card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-2xl transition-all border-l-8 group",
              log.status === 'APPROVED' ? "border-l-green-500" : log.status === 'REJECTED' ? "border-l-red-500" : "border-l-primary/30"
            )}>
               <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center space-x-4">
                     <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em]">{log.date}</span>
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">{log.hours} HOURS LOGGED</span>
                  </div>
                  <div className="space-y-1">
                     <h5 className="font-black text-2xl text-slate-900 italic tracking-tighter uppercase group-hover:text-primary transition-colors underline decoration-slate-100 underline-offset-4">{log.nama}</h5>
                     <p className="text-sm text-slate-500 font-medium italic border-l-4 border-slate-100 pl-4 py-2 mt-4 bg-slate-50/50 rounded-r-2xl">"{log.note || 'No specific narrative provided.'}"</p>
                  </div>
                  <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"><MapPin size={12} className="text-primary" /> {log.lokasi}</div>
                     <div className="flex items-center space-x-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Building2 size={12} className="text-primary" /> {log.pihakDesa} ({log.statusPihakDesa})</div>
                  </div>
               </div>
               
               <div className="flex flex-col items-center space-y-6">
                  {log.photos && log.photos[0] && (
                    <button onClick={() => window.open(log.photos[0], '_blank')} className="p-5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-[28px] transition-all border border-slate-100 group-hover:scale-110">
                       <Camera size={24} />
                    </button>
                  )}
                  {log.status === 'PENDING' ? (
                    <div className="flex space-x-3">
                       <button onClick={() => handleAction(log.id, 'APPROVED')} disabled={!!actionLoading} className="p-4 bg-green-500 text-white rounded-2xl hover:scale-110 transition-all shadow-lg">{actionLoading === log.id ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}</button>
                       <button onClick={() => handleAction(log.id, 'REJECTED')} disabled={!!actionLoading} className="p-4 bg-red-500 text-white rounded-2xl hover:scale-110 transition-all shadow-lg">{actionLoading === log.id ? <Loader2 size={24} className="animate-spin" /> : <XCircle size={24} />}</button>
                    </div>
                  ) : (
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-2xl shadow-inner italic",
                      log.status === 'APPROVED' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                       {log.status} SECURED
                    </div>
                  )}
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function LPKApproval({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [actionLoading, setActionLoading] = useState(false);
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const updated = {
        ...reg,
        status: 'GRADING' as KKNStatus,
        lpk: reg.lpk ? { ...reg.lpk, status: 'APPROVED' as const } : undefined
      };
      await kknService.updateRegistration(updated);
      toast.success('LPK Disetujui!');
      onAction();
    } catch (error) { toast.error('Gagal memproses LPK'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="card p-12 bg-white space-y-12 shadow-2xl rounded-[50px] relative overflow-hidden border-none">
       <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><ClipboardCheck size={180} /></div>
       <div className="text-center space-y-4">
          <h3 className="text-4xl font-black italic text-slate-900 uppercase tracking-tighter underline decoration-primary/30 underline-offset-8">Final Mission Report (LPK)</h3>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] italic">Summative verification of academic activities</p>
       </div>
       
       <div className="grid md:grid-cols-2 gap-10">
          <div className="card p-10 bg-slate-900 border-none space-y-8 group hover:scale-[1.02] transition-all relative overflow-hidden">
             <div className="absolute -left-4 -bottom-4 opacity-5"><UserCircle size={100} className="text-white" /></div>
             <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><FileText size={32} /></div>
                <div>
                   <p className="font-black text-white italic text-xl uppercase tracking-tighter leading-none">Individu.PDF</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic leading-none">Personal Report Archive</p>
                </div>
             </div>
             <button 
               onClick={() => reg.lpk?.fileIndividu && window.open(reg.lpk.fileIndividu, '_blank')}
               className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
             >AUDIT MANUSCRIPT</button>
          </div>
          <div className="card p-10 bg-slate-900 border-none space-y-8 group hover:scale-[1.02] transition-all relative overflow-hidden">
             <div className="absolute -left-4 -bottom-4 opacity-5"><Users size={100} className="text-white" /></div>
             <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all"><FileText size={32} /></div>
                <div>
                   <p className="font-black text-white italic text-xl uppercase tracking-tighter leading-none">Kelompok.PDF</p>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic leading-none">Strategic Squadron Archive</p>
                </div>
             </div>
             <button 
               onClick={() => reg.lpk?.fileKelompok && window.open(reg.lpk.fileKelompok, '_blank')}
               className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
             >AUDIT MANUSCRIPT</button>
          </div>
       </div>

       <div className="flex pt-6">
          <button 
            onClick={handleApprove} 
            disabled={actionLoading}
            className="w-full h-20 btn-primary rounded-[32px] font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl flex items-center justify-center relative group"
          >
             {actionLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  AUTHORIZE AND OPEN GRADING GATEWAY
                  <ArrowRight size={22} className="ml-5 group-hover:translate-x-2 transition-transform" />
                </>
             )}
          </button>
       </div>
    </div>
  );
}

function GradingBox({ reg, onAction }: { reg: KKNRegistration, onAction: () => void }) {
  const [scores, setScores] = useState({ 
    rkl: reg.grades?.rkl || 90, 
    kinerja: reg.grades?.kinerja || 85, 
    lpk: reg.grades?.lpk || 88, 
    responsi: reg.grades?.responsi || 80 
  });
  const [actionLoading, setActionLoading] = useState(false);

  const handleFinish = async () => {
    setActionLoading(true);
    try {
      const { total, gradeText } = kknService.calculateFinalGrade(scores.rkl, scores.kinerja, scores.lpk, scores.responsi);
      const updated = {
        ...reg,
        status: 'COMPLETED' as KKNStatus,
        grades: { ...scores, total, gradeText }
      };
      await kknService.updateRegistration(updated);
      toast.success('Yudisium Berhasil!');
      onAction();
    } catch (error) { toast.error('Gagal yudisium'); }
    finally { setActionLoading(false); }
  };

  const currentTotal = kknService.calculateFinalGrade(scores.rkl, scores.kinerja, scores.lpk, scores.responsi).total;

  return (
    <div className="card p-12 bg-white space-y-12 shadow-2xl rounded-[50px] animate-in zoom-in spin-in-1 duration-700">
       <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-8">
          <div className="space-y-1">
             <h3 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Judicial Review (Grading)</h3>
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 italic pl-1">Input final academic performance weights</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 pr-1 leading-none">Simulated Result</p>
             <div className="text-7xl font-black text-primary italic leading-none">{currentTotal.toFixed(1)}</div>
          </div>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { id: 'rkl', label: 'RKL Design (5%)', value: scores.rkl },
            { id: 'kinerja', label: 'Field Execution (70%)', value: scores.kinerja },
            { id: 'lpk', label: 'Synthesized Report (15%)', value: scores.lpk },
            { id: 'responsi', label: 'Strategic Defense (10%)', value: scores.responsi },
          ].map(comp => (
            <div key={comp.id} className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center italic">{comp.label}</label>
               <input 
                 type="number" 
                 className="input-field h-20 text-3xl font-black italic text-center p-0 focus:scale-105 transition-transform" 
                 value={comp.value} 
                 onChange={e => setScores({...scores, [comp.id]: Number(e.target.value)})}
               />
            </div>
          ))}
       </div>

       <div className="pt-6">
          <button 
            disabled={actionLoading}
            onClick={handleFinish} 
            className="w-full h-24 btn-primary rounded-[40px] font-black uppercase text-[15px] tracking-[0.5em] shadow-[0_30px_60px_-15px_rgba(var(--primary),0.3)] relative group overflow-hidden"
          >
             {actionLoading ? <Loader2 className="animate-spin" /> : (
                <>
                   <span className="relative z-10 flex items-center justify-center">FINALIZE YUDISIUM <ClipboardCheck size={28} className="ml-6" /></span>
                   <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </>
             )}
          </button>
       </div>
    </div>
  );
}

