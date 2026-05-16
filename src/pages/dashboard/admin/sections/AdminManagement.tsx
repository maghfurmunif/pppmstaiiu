import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, CheckCircle2, XCircle, ArrowRight, FileText, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function AdminManagement({ module }: { module: string }) {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const mockData = {
    KKN_REGULER: [
      { id: '1', name: 'Ahmad Fauzi', subtitle: 'NIM: 202109001', info: 'Teknik Informatika', time: '1 jam lalu' },
      { id: '2', name: 'Siti Rahma', subtitle: 'NIM: 202109005', info: 'Ekonomi Syariah', time: '5 jam lalu' },
    ],
    RESEARCH: [
      { id: '101', name: 'Dr. Hanafi', subtitle: 'NIDN: 0721001', info: 'Fak. Tarbiyah', time: '2 jam lalu' },
    ]
  };

  const list = (mockData as any)[module] || mockData.KKN_REGULER;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-900 uppercase">Kelola {module.replace('_', ' ')}</h1>
           <p className="text-sm text-slate-500">Tinjau, setujui, atau tolak pengajuan dari pengguna.</p>
        </div>
        <div className="flex items-center space-x-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input className="input-field pl-9 py-2 text-xs w-64" placeholder="Cari nama atau ID..." />
           </div>
           <button className="p-2 border border-slate-200 rounded-lg text-slate-400"><Filter size={18} /></button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-100">
         {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((t) => (
           <button 
             key={t}
             onClick={() => setActiveTab(t)}
             className={cn(
               "pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative",
               activeTab === t ? "text-primary" : "text-slate-400 hover:text-slate-600"
             )}
           >
             {t}
             {activeTab === t && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
         {list.map((item: any) => (
            <motion.div 
               key={item.id} 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }}
               className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
            >
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                     <User size={24} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.name}</h4>
                     <p className="text-xs text-slate-400 font-medium">{item.subtitle} • {item.info}</p>
                  </div>
               </div>

               <div className="flex items-center space-x-3">
                  <div className="text-right hidden md:block">
                     <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Terakhir Online</div>
                     <div className="text-xs text-slate-400 font-bold">{item.time}</div>
                  </div>
                  <button className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-bold text-xs transition-all">
                     <FileText size={14} />
                     <span>Review Data</span>
                  </button>
                  <div className="flex items-center space-x-1">
                     <button className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"><XCircle size={20} /></button>
                     <button className="p-2 bg-green-50 text-green-500 rounded-xl hover:bg-green-100 transition-colors"><CheckCircle2 size={20} /></button>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="flex items-center justify-center pt-8">
         <button className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center hover:text-primary transition-colors">
            Muat Lebih Banyak <ArrowRight size={14} className="ml-2" />
         </button>
      </div>
    </div>
  );
}
