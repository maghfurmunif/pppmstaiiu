
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, CheckCircle2, XCircle, Eye, Search, 
  FileText, Calendar, Clock, AlertCircle, Save,
  Download, ExternalLink
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { semproService, SemproRegistration } from '@/src/services/semproService';

export default function AdminSempro() {
  const [registrations, setRegistrations] = useState<SemproRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<SemproRegistration | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await semproService.getRegistrations();
      setRegistrations(data);
    };
    fetchData();
  }, []);

  const refresh = async () => {
    const data = await semproService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen Sempro</h1>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="space-y-3">
           {registrations.map(reg => (
             <button 
               key={reg.id} 
               onClick={() => setSelectedReg(reg)}
               className={cn(
                 "w-full card p-5 text-left transition-all border-l-[6px]",
                 selectedReg?.id === reg.id ? "border-l-primary shadow-xl scale-[1.02]" : "border-l-slate-200"
               )}
             >
                <p className="text-[10px] font-black text-primary uppercase">{reg.status}</p>
                <h4 className="font-bold text-slate-900">{reg.studentName}</h4>
             </button>
           ))}
        </div>

        <div className="lg:col-span-2">
           {selectedReg ? (
             <div className="space-y-6">
                <div className="card p-8 bg-slate-900 text-white">
                   <h2 className="text-2xl font-black italic">{selectedReg.studentName}</h2>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: {selectedReg.status}</p>
                </div>

                 {selectedReg.status === 'SUBMITTED' && (
                  <div className="card p-8 space-y-6">
                     <h3 className="font-bold italic">Review Proposal Awal</h3>
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
                          onClick={async () => {
                            const updated = { ...selectedReg, status: 'APPROVED' as const };
                            await semproService.saveRegistration(updated);
                            refresh();
                          }}
                          className="btn-primary flex-grow"
                        >Terima Proposal</button>
                        <button 
                          onClick={async () => {
                            const reason = prompt('Alasan penolakan:');
                            if (!reason) return;
                            const updated = { ...selectedReg, status: 'REJECTED' as const, rejectionReason: reason };
                            await semproService.saveRegistration(updated);
                            refresh();
                          }}
                          className="btn-primary bg-red-600 flex-grow"
                        >Tolak</button>
                     </div>
                  </div>
                )}

                {selectedReg.status === 'APPROVED' && (
                  <div className="card p-8 space-y-6">
                     <h3 className="font-bold italic">Plotting Jadwal Seminar</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="input-field text-xs" id="tgl" />
                        <input type="text" placeholder="Jam (08:00 WIB)" className="input-field text-xs" id="jam" />
                        <input type="text" placeholder="Hari (Senin)" className="input-field text-xs" id="hari" />
                        <input type="text" placeholder="Ruangan" className="input-field text-xs" id="ruang" />
                     </div>
                     <button 
                       onClick={async () => {
                         const schedule = {
                           tanggal: (document.getElementById('tgl') as HTMLInputElement).value,
                           hari: (document.getElementById('hari') as HTMLInputElement).value,
                           pukul: (document.getElementById('jam') as HTMLInputElement).value,
                           ruang: (document.getElementById('ruang') as HTMLInputElement).value,
                           sifat: 'Terbuka'
                         };
                         const updated = { ...selectedReg, status: 'SCHEDULED' as const, schedule };
                         await semproService.saveRegistration(updated);
                         refresh();
                       }}
                       className="btn-primary w-full"
                     >Kirim Jadwal Ke Mahasiswa</button>
                  </div>
                )}

                {selectedReg.status === 'PROGRESS' && (
                  <div className="card p-8 space-y-6">
                     <h3 className="font-bold italic">Validasi Dokumentasi Seminar</h3>
                     <p className="text-xs text-slate-400">Mahasiswa telah mengunggah bukti seminar.</p>
                     
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

                     <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan Perbaikan</p>
                        <div className="flex gap-2 flex-wrap">
                           {(selectedReg.postSeminar?.catatan || []).map((url, i) => (
                              <button key={i} onClick={() => window.open(url, '_blank')} className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-all border border-slate-200">
                                 <FileText size={14} />
                                 <span>Catatan {i+1}</span>
                              </button>
                           ))}
                        </div>
                     </div>

                     <button 
                       onClick={async () => {
                         const grade = prompt('Berikan Nilai Akhir (contoh: A-):', 'A-') || 'A-';
                         const updated = { ...selectedReg, status: 'COMPLETED' as const, grade };
                         await semproService.saveRegistration(updated);
                         refresh();
                       }}
                       className="btn-primary w-full py-5"
                     >Setujui & Beri Nilai Akhir</button>
                  </div>
                )}
             </div>
           ) : (
             <div className="card p-20 text-center text-slate-300 italic font-bold uppercase tracking-widest border-dashed">Pilih Mahasiswa</div>
           )}
        </div>
      </div>
    </div>
  );
}
