
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, Info, CheckCircle2, MapPin, HeartHandshake, 
  Calendar, ArrowRight, Loader2, Clock, AlertCircle, Camera
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { pengabdianService, PengabdianRegistration } from '@/src/services/pengabdianService';

export default function PengabdianDosenSection() {
  const [registration, setRegistration] = useState<PengabdianRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const dosenId = 'current_dosen'; 

  useEffect(() => {
    setRegistration(pengabdianService.getRegistrationByDosen(dosenId));
    setLoading(false);
  }, []);

  const handleEnroll = () => {
    const newReg: PengabdianRegistration = {
      id: Math.random().toString(36).substr(2, 9),
      dosenId: 'current_dosen',
      dosenName: localStorage.getItem('user_name') || 'Dosen STAI',
      status: 'SUBMITTED',
      docs: { suratTugas: true, proposal: true, kerjasama: true },
      logbooks: [],
      totalHours: 0
    };
    pengabdianService.saveRegistration(newReg);
    setRegistration(newReg);
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Pengabdian Masyarakat (Dosen)</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Pengabdian Dosen
          </h1>
          <p className="text-slate-500 font-medium">Monitoring dan pelaporan aktivitas pengabdian masyarakat Anda.</p>
        </div>
      </div>

      {!registration ? (
        <div className="card p-12 text-center space-y-8 max-w-2xl mx-auto border-dashed">
           <HeartHandshake size={48} className="text-primary mx-auto" />
           <h2 className="text-3xl font-bold italic">Mulai Program Pengabdian</h2>
           <p className="text-slate-500">Ajukan program pengabdian Anda untuk mendapatkan Surat Tugas dan Monitoring berkala.</p>
           <button onClick={handleEnroll} className="btn-primary px-12 py-5 uppercase tracking-widest text-xs font-black">Ajukan Pengabdian</button>
        </div>
      ) : (
        <div className="space-y-10">
           <div className="card p-10 bg-slate-900 text-white flex justify-between items-center">
              <div>
                 <p className="text-[10px] font-black text-primary uppercase tracking-widest">Current Status</p>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter mt-1">{registration.status.replace('_', ' ')}</h2>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Register ID</p>
                 <p className="font-bold text-white"># {registration.id}</p>
              </div>
           </div>

           {registration.status === 'SUBMITTED' && (
             <div className="card p-20 text-center border-dashed">
                <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-900 italic">Pendaftaran Sedang Ditinjau Admin</h3>
                <p className="text-slate-500 mt-2">Admin akan memverifikasi berkas dan menerbitkan Surat Tugas Anda.</p>
             </div>
           )}

           {registration.status === 'LOGBOOK' && (
             <div className="card p-10 text-center bg-primary/5 border-primary/20">
                <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
                <h3 className="text-xl font-bold text-primary italic">Siap Melaksanakan Pengabdian</h3>
                <p className="text-slate-600 mt-2">Anda dapat mulai mengisi logbook harian melalui menu Logbook.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
