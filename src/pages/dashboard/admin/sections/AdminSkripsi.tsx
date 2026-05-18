import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Eye, Search, 
  FileText, Calendar, Clock, AlertCircle, Save,
  Download, GraduationCap, Loader2, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatDate } from '@/src/lib/utils';
import { skripsiService, SkripsiRegistration } from '@/src/services/skripsiService';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function AdminSkripsi() {
  const [registrations, setRegistrations] = useState<SkripsiRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<SkripsiRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await skripsiService.getRegistrations();
      setRegistrations(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const refresh = async (quiet = false) => {
    if (!quiet) setActionLoading(true);
    const data = await skripsiService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
    if (!quiet) setActionLoading(false);
  };

  const handleAction = async (updated: SkripsiRegistration, message: string) => {
    try {
      setActionLoading(true);
      await skripsiService.saveRegistration(updated);
      await refresh(true);
      toast.success(message);
    } catch (e) {
      toast.error('Gagal memproses pengajuan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Syncing Skripsi Portal...</p>
     </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen Skripsi</h1>
          <p className="text-slate-500 font-medium text-xs mt-2 italic">Validasi berkas munaqosyah dan monitoring bimbingan mahasiswa.</p>
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
           {registrations.length} Students Active
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto side-scrollbar pr-2">
           {registrations.length === 0 ? (
             <div className="card p-10 text-center border-dashed">
                <Users className="mx-auto text-slate-200 mb-2" />
                <p className="text-[9px] font-black text-slate-300 uppercase">No Data Found</p>
             </div>
           ) : (
             registrations.map(reg => (
               <button 
                 key={reg.id} 
                 onClick={() => setSelectedReg(reg)}
                 className={cn(
                   "w-full card p-5 text-left transition-all border-l-[6px] group",
                   selectedReg?.id === reg.id ? "border-l-primary shadow-xl scale-[1.02] bg-white" : "border-l-slate-200 hover:border-l-slate-400"
                 )}
               >
                  <div className="flex justify-between items-center mb-2">
                     <StatusBadge status={reg.status} />
                     <span className="text-[9px] font-bold text-slate-300 italic">#{reg.id.slice(0, 5)}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 truncate group-hover:text-primary">{reg.studentName}</h4>
               </button>
             ))
           )}
        </div>

        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
           {selectedReg ? (
             <motion.div 
               key={selectedReg.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
             >
                <div className="card p-10 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Administrative Review</p>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase">{selectedReg.studentName}</h2>
                      <div className="flex items-center space-x-3 mt-4">
                         <StatusBadge status={selectedReg.status} className="bg-white/10 border-white/20 text-white" />
                         {selectedReg.advisor && <span className="text-xs font-black italic text-primary">Advisor: {selectedReg.advisor.name}</span>}
                      </div>
                   </div>
                   <GraduationCap className="absolute -right-6 -bottom-6 opacity-10" size={140} />
                </div>

                 {selectedReg.status === 'SUBMITTED' && (
                  <div className="card p-8 space-y-6 bg-white">
                     <h3 className="font-bold italic flex items-center text-slate-900 text-lg">
                       <FileText className="mr-2 text-primary" size={18} />
                       Validasi Syarat Pendaftaran
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        {Object.entries(selectedReg.registrationDocs || {}).map(([k, v]) => (
                          <div key={k} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group hover:border-primary/30 transition-all">
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k}</span>
                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">Document Provided</span>
                             </div>
                             {typeof v === 'string' && v.startsWith('http') ? (
                               <button onClick={() => window.open(v, '_blank')} className="p-2 bg-white rounded-xl shadow-sm text-primary hover:scale-110 transition-all">
                                 <Eye size={14} />
                               </button>
                             ) : (
                               <CheckCircle2 className="text-green-500" size={14} />
                             )}
                          </div>
                        ))}
                     </div>
                     <div className="space-y-4 pt-6 border-t border-slate-100">
                        <div className="space-y-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Plot Dosen Pembimbing</label>
                           <input id="adv" placeholder="Input Nama Dosen Pembimbing..." className="input-field shadow-sm" defaultValue={selectedReg.advisor?.name || ''} />
                        </div>
                        <div className="flex gap-4">
                           <button 
                             disabled={actionLoading}
                             onClick={() => {
                               const adv = (document.getElementById('adv') as HTMLInputElement).value;
                               if (!adv) return toast.error('Isi nama pembimbing');
                               handleAction({ 
                                 ...selectedReg, 
                                 status: 'APPROVED' as any,
                                 advisor: { name: adv }
                               }, `Advisor ${adv} telah diplot`);
                             }}
                             className="btn-primary flex-grow h-14 uppercase tracking-widest text-[10px]"
                           >
                             {actionLoading ? <Loader2 className="animate-spin" /> : 'Sahkan & Plot Advisor'}
                           </button>
                           <button 
                             disabled={actionLoading}
                             onClick={() => {
                               const reason = prompt('Alasan penolakan:');
                               if (!reason) return;
                               handleAction({ ...selectedReg, status: 'REJECTED' as any, rejectionReason: reason }, 'Pendaftaran ditolak');
                             }}
                             className="btn-primary bg-red-600 flex-grow h-14 uppercase tracking-widest text-[10px]"
                           >Tolak Berkas</button>
                        </div>
                     </div>
                  </div>
                )}

                 {selectedReg.status === 'APPROVED' && (
                    <div className="card p-20 text-center space-y-4 border-dashed">
                       <Clock className="text-primary opacity-20 mx-auto" size={48} />
                       <h3 className="font-bold text-slate-900 italic text-xl">Pendaftaran Disetujui</h3>
                       <p className="text-slate-400 text-sm font-medium">Menunggu mahasiswa menyetujui dosen pembimbing ({selectedReg.advisor?.name}) dan memulai bimbingan.</p>
                       <div className="pt-4">
                          <button onClick={() => refresh()} className="btn-primary py-2 px-6 text-[10px] bg-slate-100 text-slate-900 shadow-none border border-slate-200">Sync status...</button>
                       </div>
                    </div>
                 )}

                 {selectedReg.status === 'PROGRESS' && (
                   <div className="card p-8 space-y-8 bg-white">
                      <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                         <div className="space-y-1">
                            <h3 className="font-bold italic text-slate-900 flex items-center text-lg">
                              <MessageSquare className="mr-2 text-primary" size={18} />
                              Monitoring Jurnal Bimbingan
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">Minimal 10 kali bimbingan</p>
                         </div>
                         <div className="text-right">
                            <p className="text-3xl font-black text-primary italic tracking-tighter">{selectedReg.logbooks.filter(l => l.status === 'APPROVED').length}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Approved Docs</p>
                         </div>
                      </div>
                      <div className="space-y-4">
                         {selectedReg.logbooks.length === 0 ? (
                           <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-100">
                              <p className="text-xs text-slate-400 italic font-medium">Mahasiswa belum menginput progres bimbingan.</p>
                           </div>
                         ) : (
                           selectedReg.logbooks.map(log => (
                             <div key={log.id} className="p-5 bg-slate-50 rounded-[28px] flex justify-between items-center border border-slate-100 group hover:shadow-lg transition-all">
                                <div className="flex items-center space-x-4">
                                   <div className="p-3 bg-white rounded-2xl shadow-sm font-black text-primary text-[10px] border border-slate-100">
                                      {log.date.split('-').slice(1).reverse().join('/')}
                                   </div>
                                   <div className="flex flex-col">
                                      <div className="text-sm font-bold text-slate-800">{log.topic}</div>
                                      {log.photo && (
                                        <button 
                                          onClick={() => window.open(log.photo, '_blank')}
                                          className="text-[9px] font-black text-primary flex items-center mt-1 uppercase tracking-widest hover:underline"
                                        >
                                          <Eye size={10} className="mr-1" /> View Evidence
                                        </button>
                                      )}
                                   </div>
                                </div>
                                {log.status === 'PENDING' ? (
                                  <button 
                                    disabled={actionLoading}
                                    onClick={() => {
                                      const updatedLogbooks = selectedReg.logbooks.map(l => 
                                        l.id === log.id ? { ...l, status: 'APPROVED' as any } : l
                                      );
                                      handleAction({ ...selectedReg, logbooks: updatedLogbooks }, 'Logbook bimbingan diverifikasi');
                                    }}
                                    className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                  >Verify</button>
                                ) : <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase tracking-widest">Verified</span>}
                             </div>
                           ))
                         )}
                      </div>
                      {selectedReg.logbooks.filter(l => l.status === 'APPROVED').length >= 10 && (
                         <div className="p-5 bg-primary rounded-3xl text-white flex items-center space-x-4 shadow-2xl shadow-primary/20">
                            <div className="p-3 bg-white/20 rounded-xl"><CheckCircle2 size={24} /></div>
                            <div>
                               <p className="font-black text-xs uppercase tracking-widest">Ready for Final Exam</p>
                               <p className="text-[10px] font-medium opacity-80 italic">Mahasiswa telah memenuhi syarat bimbingan minimal. Menunggu pendaftaran Munaqosyah.</p>
                            </div>
                         </div>
                      )}
                   </div>
                 )}

                 {selectedReg.status === 'DOCS_SUBMITTED' && (
                   <div className="card p-8 space-y-8 bg-white">
                      <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                         <Calendar className="text-primary" size={20} />
                         <h3 className="font-bold italic tracking-tighter text-slate-900 text-lg uppercase">Penjadwalan Sidang Munaqosyah</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hari & Tanggal</label>
                            <div className="flex gap-2">
                               <input id="hari-s" placeholder="Hari" className="input-field text-xs shadow-sm bg-white" />
                               <input id="tgl-s" type="date" className="input-field text-xs shadow-sm bg-white" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Jam & Ruangan</label>
                            <div className="flex gap-2">
                               <input id="jam-s" placeholder="Waktu (09:00 WIB)" className="input-field text-xs shadow-sm bg-white" />
                               <input id="ruang-s" placeholder="Nama Ruang" className="input-field text-xs shadow-sm bg-white" />
                            </div>
                         </div>
                      </div>
                      <button 
                         disabled={actionLoading}
                         onClick={() => {
                            const schedule = {
                               tanggal: (document.getElementById('tgl-s') as HTMLInputElement).value,
                               hari: (document.getElementById('hari-s') as HTMLInputElement).value,
                               pukul: (document.getElementById('jam-s') as HTMLInputElement).value,
                               ruang: (document.getElementById('ruang-s') as HTMLInputElement).value
                            };
                            if (!schedule.tanggal || !schedule.hari) return toast.error('Lengkapi data jadwal');
                            handleAction({
                               ...selectedReg,
                               status: 'SCHEDULED' as any,
                               examSchedule: schedule
                            }, 'Jadwal munaqosyah telah dipublikasikan');
                         }}
                         className="btn-primary w-full py-5 shadow-2xl uppercase tracking-[0.2em] text-[11px] font-black h-16"
                      >
                        {actionLoading ? <Loader2 className="animate-spin text-white" /> : 'PLOT JADWAL SIDANG SEKARANG'}
                      </button>
                   </div>
                 )}

                 {selectedReg.status === 'COMPLETED' && !selectedReg.grades && (
                   <div className="card p-10 space-y-10 bg-white">
                      <div className="flex items-center space-x-3 border-b border-slate-100 pb-5">
                         <Save className="text-primary" size={24} />
                         <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-900">Input Skor Akhir Skripsi</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Naskah Skripsi (30%)</label>
                            <input id="naskah" type="number" className="input-field h-14 text-2xl font-black italic text-primary bg-white shadow-inner" placeholder="0" max={100} />
                            <p className="text-[10px] text-slate-400 font-medium italic">Nilai kualitas penulisan dan orisinalitas.</p>
                         </div>
                         <div className="space-y-3 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Sidang Munaqosyah (70%)</label>
                            <input id="sidang" type="number" className="input-field h-14 text-2xl font-black italic text-primary bg-white shadow-inner" placeholder="0" max={100} />
                            <p className="text-[10px] text-slate-400 font-medium italic">Nilai penguasaan materi dan retorika.</p>
                         </div>
                      </div>
                      <button 
                         disabled={actionLoading}
                         onClick={() => {
                            const n = Number((document.getElementById('naskah') as HTMLInputElement).value);
                            const s = Number((document.getElementById('sidang') as HTMLInputElement).value);
                            if (isNaN(n) || isNaN(s) || n > 100 || s > 100) return toast.error('Check input nilai (0-100)');
                            const { total, gradeText } = skripsiService.calculateFinalGrade(n, s);
                            handleAction({
                               ...selectedReg,
                               status: 'COMPLETED' as any,
                               grades: { naskah: n, sidang: s, total, gradeText }
                            }, 'Skripsi COMPLETED! Nilai akhir diterbitkan.');
                         }}
                         className="btn-primary w-full py-5 shadow-2xl text-[11px] font-black uppercase tracking-[0.2em]"
                      >
                         {actionLoading ? <Loader2 className="animate-spin" /> : 'SIMPAN NILAI & SELESAIKAN PROSES'}
                      </button>
                   </div>
                 )}

                 {selectedReg.status === 'COMPLETED' && selectedReg.grades && (
                   <div className="card p-12 bg-green-50 border-green-200 text-center space-y-4">
                      <CheckCircle2 size={64} className="mx-auto text-green-600" />
                      <h4 className="text-2xl font-black text-green-900 tracking-tighter uppercase italic">Skripsi Completed</h4>
                      <p className="text-green-700/60 font-medium text-xs">Nilai akhir: <span className="font-black text-green-800">{selectedReg.grades.gradeText} ({selectedReg.grades.total.toFixed(0)})</span></p>
                      <button onClick={() => setSelectedReg(null)} className="btn-primary bg-green-600 hover:bg-green-700 mt-4 px-10 text-[10px] uppercase tracking-widest">Back to list</button>
                   </div>
                 )}
               </motion.div>
           ) : (
             <div className="card h-[500px] flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest italic border-dashed">Pilih Mahasiswa</div>
           )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
