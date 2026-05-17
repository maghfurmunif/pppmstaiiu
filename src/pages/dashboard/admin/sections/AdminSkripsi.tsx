
import { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, XCircle, Eye, Search, 
  FileText, Calendar, Clock, AlertCircle, Save,
  Download, GraduationCap
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { skripsiService, SkripsiRegistration } from '@/src/services/skripsiService';

export default function AdminSkripsi() {
  const [registrations, setRegistrations] = useState<SkripsiRegistration[]>([]);
  const [selectedReg, setSelectedReg] = useState<SkripsiRegistration | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await skripsiService.getRegistrations();
      setRegistrations(data);
    };
    fetchData();
  }, []);

  const refresh = async () => {
    const data = await skripsiService.getRegistrations();
    setRegistrations(data);
    if (selectedReg) {
      setSelectedReg(data.find(r => r.id === selectedReg.id) || null);
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen Skripsi</h1>
      
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
                <div className="flex justify-between items-center mb-1">
                   <p className="text-[9px] font-black text-primary uppercase">{reg.status}</p>
                   {reg.status === 'SUBMITTED' && <div className="w-2 h-2 bg-orange-400 animate-pulse rounded-full" />}
                </div>
                <h4 className="font-bold text-slate-900">{reg.studentName}</h4>
             </button>
           ))}
        </div>

        <div className="lg:col-span-2">
           {selectedReg ? (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="card p-8 bg-slate-900 text-white flex justify-between items-center">
                   <div>
                      <h2 className="text-2xl font-black italic tracking-tighter uppercase">{selectedReg.studentName}</h2>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Skripsi Stage: {selectedReg.status}</p>
                   </div>
                   <GraduationCap className="text-white/10" size={48} />
                </div>

                 {selectedReg.status === 'SUBMITTED' && (
                  <div className="card p-8 space-y-6">
                     <h3 className="font-bold italic">Validasi Syarat Pendaftaran</h3>
                     <div className="grid grid-cols-2 gap-3">
                        {Object.entries(selectedReg.registrationDocs || {}).map(([k, v]) => (
                          <div key={k} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                             <span className="text-[10px] font-bold text-slate-600 uppercase">{k.replace(/([A-Z])/g, ' $1')}</span>
                             {typeof v === 'string' && v.startsWith('http') ? (
                               <button onClick={() => window.open(v, '_blank')}>
                                 <Eye size={14} className="text-primary cursor-pointer" />
                               </button>
                             ) : (
                               <CheckCircle2 className="text-primary" size={14} />
                             )}
                          </div>
                        ))}
                     </div>
                     <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plot Dosen Pembimbing</label>
                        <input id="adv" placeholder="Nama Dosen Pembimbing..." className="input-field" />
                        <div className="flex gap-4">
                           <button 
                             onClick={async () => {
                               const updated = { 
                                 ...selectedReg, 
                                 status: 'APPROVED' as const,
                                 advisor: { name: (document.getElementById('adv') as HTMLInputElement).value || 'Dosen Pembimbing' }
                               };
                               await skripsiService.saveRegistration(updated);
                               refresh();
                             }}
                             className="btn-primary flex-grow"
                           >Terima & Plot Pembimbing</button>
                           <button 
                             onClick={async () => {
                               const reason = prompt('Alasan penolakan:');
                               if (!reason) return;
                               const updated = { ...selectedReg, status: 'REJECTED' as const, rejectionReason: reason };
                               await skripsiService.saveRegistration(updated);
                               refresh();
                             }}
                             className="btn-primary bg-red-600 flex-grow"
                           >Tolak</button>
                        </div>
                     </div>
                  </div>
                )}

                {selectedReg.status === 'APPROVED' && (
                   <div className="card p-20 text-center space-y-4">
                      <Clock className="text-primary opacity-20 mx-auto" size={48} />
                      <h3 className="font-bold text-slate-900 italic">Pendaftaran Disetujui</h3>
                      <p className="text-slate-400 text-sm">Menunggu mahasiswa menyetujui dosen pembimbing ({selectedReg.advisor?.name}) dan memulai bimbingan.</p>
                   </div>
                )}

                {selectedReg.status === 'PROGRESS' && (
                  <div className="card p-8 space-y-6">
                     <div className="flex justify-between items-end">
                        <h3 className="font-bold italic">Monitoring Bimbingan</h3>
                        <p className="text-2xl font-black text-primary italic">{selectedReg.logbooks.filter(l => l.status === 'APPROVED').length} <span className="text-[10px] text-slate-400 not-italic">/ 10</span></p>
                     </div>
                     <div className="space-y-3">
                        {selectedReg.logbooks.map(log => (
                          <div key={log.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                             <div className="flex flex-col">
                                <div className="text-xs font-bold text-slate-700">{log.date}: {log.topic}</div>
                                {log.photo && (
                                  <button 
                                    onClick={() => window.open(log.photo, '_blank')}
                                    className="text-[9px] font-bold text-primary flex items-center mt-1"
                                  >
                                    <Eye size={10} className="mr-1" /> LIHAT DOKUMENTASI
                                  </button>
                                )}
                             </div>
                             {log.status === 'PENDING' ? (
                               <button 
                                 onClick={async () => {
                                   const updatedLogbooks = selectedReg.logbooks.map(l => 
                                     l.id === log.id ? { ...l, status: 'APPROVED' as const } : l
                                   );
                                   const updated = { ...selectedReg, logbooks: updatedLogbooks };
                                   await skripsiService.saveRegistration(updated);
                                   refresh();
                                 }}
                                 className="text-[10px] font-black text-primary hover:underline"
                               >APPROVE</button>
                             ) : <span className="text-[10px] font-black text-green-600">APPROVED</span>}
                          </div>
                        ))}
                     </div>
                     {selectedReg.logbooks.filter(l => l.status === 'APPROVED').length >= 10 && (
                        <div className="p-4 bg-primary/10 text-primary text-xs font-bold rounded-xl italic">
                           Mahasiswa telah memenuhi syarat bimbingan minimal. Menunggu pendaftaran Munaqosyah.
                        </div>
                     )}
                  </div>
                )}

                {selectedReg.status === 'DOCS_SUBMITTED' && (
                  <div className="card p-8 space-y-6">
                     <h3 className="font-bold italic tracking-tighter">Penjadwalan Munaqosyah</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <input id="tgl-s" type="date" className="input-field text-xs" />
                        <input id="hari-s" placeholder="Hari" className="input-field text-xs" />
                        <input id="jam-s" placeholder="Jam" className="input-field text-xs" />
                        <input id="ruang-s" placeholder="Ruang" className="input-field text-xs" />
                     </div>
                     <button 
                        onClick={() => {
                           selectedReg.status = 'SCHEDULED';
                           selectedReg.examSchedule = {
                              tanggal: (document.getElementById('tgl-s') as HTMLInputElement).value,
                              hari: (document.getElementById('hari-s') as HTMLInputElement).value,
                              pukul: (document.getElementById('jam-s') as HTMLInputElement).value,
                              ruang: (document.getElementById('ruang-s') as HTMLInputElement).value
                           };
                           skripsiService.saveRegistration(selectedReg);
                           refresh();
                        }}
                        className="btn-primary w-full py-4 shadow-xl"
                     >Plot Jadwal Sidang</button>
                  </div>
                )}

                {selectedReg.status === 'COMPLETED' && !selectedReg.grades && (
                  <div className="card p-8 space-y-8">
                     <h3 className="font-bold italic">Input Skor Akhir Skripsi</h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Naskah (30%)</label>
                           <input id="naskah" type="number" className="input-field" placeholder="0-100" />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sidang (70%)</label>
                           <input id="sidang" type="number" className="input-field" placeholder="0-100" />
                        </div>
                     </div>
                     <button 
                        onClick={() => {
                           const n = Number((document.getElementById('naskah') as HTMLInputElement).value);
                           const s = Number((document.getElementById('sidang') as HTMLInputElement).value);
                           const { total, gradeText } = skripsiService.calculateFinalGrade(n, s);
                           selectedReg.grades = { naskah: n, sidang: s, total, gradeText };
                           skripsiService.saveRegistration(selectedReg);
                           refresh();
                        }}
                        className="btn-primary w-full py-5 shadow-2xl"
                     >Simpan Nilai & Selesaikan Progres</button>
                  </div>
                )}

             </div>
           ) : (
             <div className="card h-[500px] flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest italic border-dashed">Pilih Mahasiswa</div>
           )}
        </div>
      </div>
    </div>
  );
}
