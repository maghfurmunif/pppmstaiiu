
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Eye, Search, 
  FileText, Calendar, Clock, AlertCircle, Save,
  Download, ExternalLink, Loader2, BookOpen, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { semproService, SemproRegistration } from '@/src/services/semproService';
import StatusBadge from '@/src/components/ui/StatusBadge';

export default function AdminSempro() {
  const [registrations, setRegistrations] = useState<SemproRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<SemproRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await semproService.getRegistrations();
      setRegistrations(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const refresh = async (quiet = false) => {
    if (!quiet) setActionLoading(true);
    const data = await semproService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
    if (!quiet) setActionLoading(false);
  };

  const handleAction = async (updated: SemproRegistration, successMessage: string) => {
    try {
      setActionLoading(true);
      await semproService.saveRegistration(updated);
      await refresh(true);
      toast.success(successMessage);
    } catch (e) {
      toast.error('Gagal memproses permintaan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Sempro Data...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic decoration-primary underline-offset-8 underline">Manajemen Sempro</h1>
          <p className="text-slate-500 font-medium text-xs mt-2">Validasi proposal dan penjadwalan seminar mahasiswa.</p>
        </div>
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          {registrations.length} Total Registrasi
        </div>
      </div>
      
      {registrations.length === 0 ? (
        <div className="card p-20 text-center space-y-4 border-dashed">
          <BookOpen className="mx-auto text-slate-200" size={64} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada pengajuan sempro</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="space-y-3 max-h-[70vh] overflow-y-auto side-scrollbar pr-2">
             {registrations.map(reg => (
               <button 
                 key={reg.id} 
                 onClick={() => setSelectedReg(reg)}
                 className={cn(
                   "w-full card p-5 text-left transition-all border-l-[6px] group",
                   selectedReg?.id === reg.id ? "border-l-primary shadow-xl scale-[1.02] bg-white" : "border-l-slate-200 hover:border-l-slate-400"
                 )}
               >
                  <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={reg.status} />
                    <span className="text-[9px] font-bold text-slate-400 italic">2026</span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{reg.studentName}</h4>
               </button>
             ))}
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
                  <div className="card p-8 bg-slate-900 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BookOpen size={120} />
                     </div>
                     <div className="relative z-10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Detailed View</p>
                        <h2 className="text-3xl font-black italic tracking-tighter">{selectedReg.studentName}</h2>
                        <div className="flex items-center space-x-3 mt-4">
                           <StatusBadge status={selectedReg.status} className="bg-white/10 border-white/20 text-white" />
                           {selectedReg.grade && <span className="text-xs font-black italic text-primary">Nilai: {selectedReg.grade}</span>}
                        </div>
                     </div>
                  </div>

                   {selectedReg.status === 'SUBMITTED' && (
                    <div className="card p-8 space-y-6">
                       <h3 className="font-bold italic flex items-center"><Search size={18} className="mr-2 text-primary" /> Review Proposal Awal</h3>
                       {selectedReg.proposalFile && (
                         <button 
                           onClick={() => window.open(selectedReg.proposalFile, '_blank')}
                           className="btn-primary w-full py-4 text-[10px] bg-slate-800"
                         >
                           <Eye size={14} className="mr-2" /> Lihat Proposal Mahasiswa
                         </button>
                       )}
                       <div className="flex gap-4">
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleAction({ ...selectedReg, status: 'APPROVED' as const }, 'Proposal disetujui')}
                            className="btn-primary flex-grow disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Terima Proposal'}
                          </button>
                          <button 
                            disabled={actionLoading}
                            onClick={() => {
                              const reason = prompt('Alasan penolakan:');
                              if (!reason) return;
                              handleAction({ ...selectedReg, status: 'REJECTED' as const, rejectionReason: reason }, 'Proposal ditolak');
                            }}
                            className="btn-primary bg-red-600 flex-grow disabled:opacity-50"
                          >Tolak</button>
                       </div>
                    </div>
                  )}

                  {selectedReg.status === 'APPROVED' && (
                    <div className="card p-8 space-y-6">
                       <h3 className="font-bold italic flex items-center"><Calendar size={18} className="mr-2 text-primary" /> Plotting Jadwal Seminar</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Tanggal</label>
                             <input type="date" className="input-field text-xs" id="tgl" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Jam Pelaksanaan</label>
                             <input type="text" placeholder="Jam (08:00 WIB)" className="input-field text-xs" id="jam" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Hari</label>
                             <input type="text" placeholder="Hari (Senin)" className="input-field text-xs" id="hari" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Lokasi/Ruang</label>
                             <input type="text" placeholder="Ruangan" className="input-field text-xs" id="ruang" />
                          </div>
                       </div>
                       <button 
                         disabled={actionLoading}
                         onClick={async () => {
                           const schedule = {
                             tanggal: (document.getElementById('tgl') as HTMLInputElement).value,
                             hari: (document.getElementById('hari') as HTMLInputElement).value,
                             pukul: (document.getElementById('jam') as HTMLInputElement).value,
                             ruang: (document.getElementById('ruang') as HTMLInputElement).value,
                             sifat: 'Terbuka'
                           };
                           if (!schedule.tanggal || !schedule.hari) return toast.error('Lengkapi data jadwal');
                           handleAction({ ...selectedReg, status: 'SCHEDULED' as const, schedule }, 'Jadwal seminar telah dikirim');
                         }}
                         className="btn-primary w-full disabled:opacity-50"
                       >
                         {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Kirim Jadwal Ke Mahasiswa'}
                       </button>
                    </div>
                  )}

                  {selectedReg.status === 'PROGRESS' && (
                    <div className="card p-8 space-y-6">
                       <h3 className="font-bold italic flex items-center"><CheckCircle2 size={18} className="mr-2 text-primary" /> Validasi Dokumentasi Seminar</h3>
                       <p className="text-xs text-slate-500 font-medium italic">Mahasiswa telah mengunggah bukti seminar & catatan revisi.</p>
                       
                       <div className="grid grid-cols-2 gap-4">
                          {(selectedReg.postSeminar?.dokumentasi || []).map((url, i) => (
                             <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-100 group relative">
                                <img src={url} className="w-full h-full object-cover" />
                                <button onClick={() => window.open(url, '_blank')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                   <Eye className="text-white" />
                                </button>
                             </div>
                          ))}
                       </div>

                       <div className="p-5 bg-slate-50 rounded-[20px] space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Perbaikan (File)</p>
                          <div className="flex gap-2 flex-wrap">
                             {(selectedReg.postSeminar?.catatan || []).map((url, i) => (
                                <button key={i} onClick={() => window.open(url, '_blank')} className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl text-[10px] font-black text-primary hover:bg-primary/5 transition-all border border-slate-200 shadow-sm">
                                   <FileText size={14} />
                                   <span>Review #{i+1}</span>
                                </button>
                             ))}
                          </div>
                       </div>

                       <button 
                         disabled={actionLoading}
                         onClick={async () => {
                           const grade = prompt('Berikan Nilai Akhir (contoh: A-):', 'A-') || 'A-';
                           handleAction({ ...selectedReg, status: 'COMPLETED' as const, grade }, 'Seminar Selesai & Nilai tersimpan');
                         }}
                         className="btn-primary w-full py-5 disabled:opacity-50"
                       >
                         {actionLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Setujui & Beri Nilai Akhir'}
                       </button>
                    </div>
                  )}
                  
                  {selectedReg.status === 'COMPLETED' && (
                    <div className="card p-10 bg-green-50 border-green-200 text-center space-y-3">
                       <CheckCircle2 size={40} className="mx-auto text-green-600" />
                       <h4 className="text-xl font-bold text-green-900 tracking-tighter">Proses Sempro Selesai</h4>
                       <p className="text-green-700/60 font-medium text-xs">Seluruh dokumen telah divalidasi dan nilai akhir telah diterbitkan.</p>
                       <div className="inline-block mt-4 px-6 py-2 bg-white border border-green-200 rounded-full font-black text-green-700 uppercase italic text-sm">Nilai: {selectedReg.grade}</div>
                    </div>
                  )}
               </motion.div>
             ) : (
               <div className="card p-32 text-center space-y-4 border-dashed">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-300 italic font-bold uppercase tracking-widest text-xs">Pilih data mahasiswa untuk memproses pengajuan</p>
               </div>
             )}
             </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
