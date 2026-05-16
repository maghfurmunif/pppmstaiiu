
import { useState, useEffect, type FormEvent } from 'react';
import { 
  Plus, Search, Filter, Layers, 
  Calendar, FileText, Download, ExternalLink,
  Tag, Hash, User, Globe, Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { penelitianService, DosenDokumentasi } from '@/src/services/penelitianService';

export default function DosenDokumentasiSection() {
  const [docs, setDocs] = useState<DosenDokumentasi[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const dosenId = 'dosen_123';

  useEffect(() => {
    setDocs(penelitianService.getDokumentasi(dosenId));
  }, []);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newDoc: DosenDokumentasi = {
      id: Math.random().toString(36).substr(2, 9),
      dosenId,
      jenisKarya: formData.get('jenis') as string,
      judul: formData.get('judul') as string,
      tanggal: formData.get('tanggal') as string,
      isbnIssn: formData.get('isbn') as string,
      penulisTambahan: formData.get('penulis') as string,
      penerbit: formData.get('penerbit') as string,
      platform: formData.get('platform') as any,
      fileUrl: '#'
    };
    penelitianService.saveDokumentasi(newDoc);
    setDocs([newDoc, ...docs]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Digital Library</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Arsip Dokumentasi
          </h1>
          <p className="text-slate-500 font-medium pt-2">Simpan dan organisir seluruh karya ilmiah, buku, dan pengabdian Anda.</p>
        </div>
        <button 
           onClick={() => setIsAdding(!isAdding)}
           className="btn-primary px-8 py-4 shadow-xl flex items-center space-x-2"
        >
           {isAdding ? <span>Tutup Form</span> : (
             <>
               <Plus size={18} />
               <span>Daftarkan Karya Baru</span>
             </>
           )}
        </button>
      </div>

      {isAdding && (
        <div className="card p-10 bg-white shadow-2xl border-primary/20">
           <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Judul Karya Ilmiah</label>
                    <input name="judul" required className="input-field" placeholder="Masukkan judul lengkap..." />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Jenis Karya</label>
                       <select name="jenis" className="input-field">
                          <option>Penelitian</option>
                          <option>Pengabdian</option>
                          <option>Buku</option>
                          <option>Jurnal</option>
                          <option>Lainnya</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Tanggal Publikasi</label>
                       <input name="tanggal" type="date" className="input-field" required />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Platform Penyimpanan</label>
                    <select name="platform" className="input-field">
                       <option value="REPOSITORY">Repository Institusi</option>
                       <option value="SISTER">SISTER</option>
                       <option value="SINTA">SINTA</option>
                       <option value="LAIN">Lainnya</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">ISBN / ISSN (Opsional)</label>
                    <input name="isbn" className="input-field" placeholder="0000-0000-0000" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Penerbit / Jurnal Publikasi</label>
                    <input name="penerbit" className="input-field" placeholder="Nama Penerbit atau Jurnal..." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Penulis Tambahan (Opsional)</label>
                    <input name="penulis" className="input-field" placeholder="Ahmad, Budi, etc..." />
                 </div>
                 <button type="submit" className="w-full btn-primary py-5 shadow-xl font-black italic">SIMPAN KE DOKUMENTASI DIGITAL</button>
              </div>
           </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {docs.length > 0 ? (
          docs.map((doc) => (
            <div key={doc.id} className="card p-8 bg-white hover:border-primary/20 transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                     <Layers size={20} />
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.jenisKarya}</div>
               </div>
               <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors italic">{doc.judul}</h3>
               
               <div className="space-y-3 mb-8">
                  <div className="flex items-center text-xs text-slate-500 font-medium">
                     <Calendar size={14} className="mr-2 opacity-30" />
                     <span>Dipublikasikan: {doc.tanggal}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 font-medium">
                     <Tag size={14} className="mr-2 opacity-30" />
                     <span>Platform: {doc.platform}</span>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center transition-colors">
                    <Download size={14} className="mr-1.5" />
                    <span>Download</span>
                  </button>
                  <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center transition-colors">
                    <ExternalLink size={14} className="mr-1.5" />
                    <span>Link</span>
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-32 text-center text-slate-300 font-bold uppercase tracking-widest italic border-dashed border-2">Belum ada karya terdokumentasi.</div>
        )}
      </div>
    </div>
  );
}
