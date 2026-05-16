import { useState } from 'react';
import { motion } from 'motion/react';
import { FileUp, Save, Search, Plus, Archive, ExternalLink, Hash, Calendar, Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function DokumentasiSection() {
  const [showAdd, setShowAdd] = useState(false);
  
  const docs = [
    { type: 'Jurnal', title: 'Implementasi Kurikulum Merdeka di Madrasah', date: '12 Jan 2024', id: 'ISSN-2910-112' },
    { type: 'Buku', title: 'Filsafat Pendidikan Islam Modern', date: '05 Mar 2024', id: 'ISBN-978-602-1' },
    { type: 'Prosiding', title: 'Digitalisasi Pendidikan di Era 5.0', date: '20 Apr 2024', id: 'CONF-2024-01' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 uppercase">Dokumentasi Karya</h1>
           <p className="text-slate-500">Arsip digital seluruh penelitian, pengabdian, dan karya ilmiah anda.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center">
           <Plus size={18} className="mr-2" /> Tambah Karya Baru
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card space-y-6">
           <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="font-bold text-slate-800">Formulir Dokumentasi Karya</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-red-500 transition-colors">Batal</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Karya</label>
                    <select className="input-field">
                       <option>Penelitian</option>
                       <option>Pengabdian</option>
                       <option>Jurnal</option>
                       <option>Buku</option>
                       <option>Prosiding</option>
                       <option>Yang Lain...</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Karya</label>
                    <input className="input-field" placeholder="Masukkan judul lengkap..." />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Publikasi</label>
                       <input type="date" className="input-field" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ISBN / ISSN</label>
                       <input className="input-field" placeholder="Contoh: 123-456..." />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penulis Tambahan (Jika Ada)</label>
                    <input className="input-field" placeholder="Pisahkan dengan koma..." />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Penerbit / Nama Jurnal</label>
                    <input className="input-field" placeholder="Nama instansi/jurnal..." />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Penyimpanan</label>
                    <select className="input-field">
                       <option>Repository Institusi</option>
                       <option>SISTER</option>
                       <option>SINTA</option>
                       <option>Google Scholar</option>
                       <option>Yang Lain...</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Karya (PDF)</label>
              <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                 <FileUp size={32} />
                 <p className="text-[10px] font-bold mt-2 uppercase">Klik untuk upload file karya</p>
              </div>
           </div>

           <button className="btn-primary w-full flex items-center justify-center">
              Simpan ke Dokumentasi <Save size={18} className="ml-2" />
           </button>
        </motion.div>
      )}

      {/* List Archive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="font-bold text-slate-800 flex items-center">
              <Archive size={18} className="mr-2 text-primary" /> Arsip Karya Anda
           </h3>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input className="input-field pl-9 py-1.5 text-xs w-48" placeholder="Cari karya..." />
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {docs.map((doc, i) => (
             <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="card group hover:border-primary/30 transition-all border-l-4 border-l-primary"
             >
                <div className="flex items-center justify-between mb-4">
                   <div className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-1 rounded">{doc.type}</div>
                   <button className="text-slate-300 hover:text-primary transition-colors"><ExternalLink size={16} /></button>
                </div>
                <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 min-h-[40px] leading-tight">{doc.title}</h4>
                <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                   <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Calendar size={12} className="mr-2" /> {doc.date}
                   </div>
                   <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <Hash size={12} className="mr-2" /> {doc.id}
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
