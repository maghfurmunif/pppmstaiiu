import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, Layers, 
  Calendar, FileText, Download, ExternalLink,
  Tag, Hash, User, Globe, Save,
  FileUp, Loader2, CheckCircle2, Trash2, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { penelitianService, DosenDokumentasi } from '@/src/services/penelitianService';

export default function DosenDokumentasiSection() {
  const [docs, setDocs] = useState<DosenDokumentasi[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const data = await penelitianService.getDokumentasi(userId);
      setDocs(data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const [saving, setSaving] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setUploadingFile(true);
      const { uploadToCloudinary } = await import('@/src/lib/cloudinary');
      const url = await uploadToCloudinary(file);
      setFileUrl(url);
      toast.success('File manuskrip terunggah');
    } catch (error) {
      toast.error('Gagal upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const newDoc: DosenDokumentasi = {
      id: crypto.randomUUID(), 
      dosenId: userId,
      jenisKarya: formData.get('jenis') as string,
      judul: formData.get('judul') as string,
      tanggal: formData.get('tanggal') as string,
      isbnIssn: formData.get('isbn') as string,
      penulisTambahan: formData.get('penulis') as string,
      penerbit: formData.get('penerbit') as string,
      platform: formData.get('platform') as any,
      fileUrl: fileUrl || '#'
    };
    try {
      await penelitianService.saveDokumentasi(newDoc);
      setDocs(prev => [newDoc, ...prev]);
      setIsAdding(false);
      setFileUrl('');
      toast.success('Karya ilmiah berhasil didokumentasikan');
    } catch (error) {
      toast.error('Gagal menyimpan dokumentasi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
     <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p>Opening Digital Archives...</p>
     </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Digital Scholarly Library</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">
            Arsip Dokumentasi
          </h1>
          <p className="text-slate-500 font-medium pt-2">Simpan dan organisir seluruh karya ilmiah, buku, dan pengabdian Anda dalam satu repositori.</p>
        </div>
        <button 
           onClick={() => setIsAdding(!isAdding)}
           className={cn(
             "px-8 py-4 shadow-2xl flex items-center space-x-2 font-black uppercase text-[11px] tracking-widest rounded-2xl transition-all",
             isAdding ? "bg-slate-100 text-slate-900 shadow-none border border-slate-200" : "btn-primary"
           )}
        >
           {isAdding ? <span>Tutup Desk Dokumen</span> : (
             <>
               <Plus size={18} />
               <span>Registrasi Karya Baru</span>
             </>
           )}
        </button>
      </div>

      <AnimatePresence>
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="card p-10 bg-slate-900 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-none relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Save size={120} /></div>
           <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Judul Lengkap Karya Ilmiah</label>
                    <input name="judul" required className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="Ex: Analisis Dampak Ekonomi Syariah di Pedesaan..." />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Jenis Karya</label>
                       <select name="jenis" className="input-field bg-white/5 border-white/10 text-white h-14 appearance-none">
                          <option className="bg-white text-slate-900">Penelitian</option>
                          <option className="bg-white text-slate-900">Pengabdian</option>
                          <option className="bg-white text-slate-900">Buku</option>
                          <option className="bg-white text-slate-900">Jurnal</option>
                          <option className="bg-white text-slate-900">Lainnya</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Tanggal Publikasi</label>
                       <input name="tanggal" type="date" className="input-field bg-white/5 border-white/10 text-white h-14" required />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Cluster / Platform</label>
                    <select name="platform" className="input-field bg-white/5 border-white/10 text-white h-14">
                       <option value="REPOSITORY" className="bg-white text-slate-900">Repository Institusi</option>
                       <option value="SISTER" className="bg-white text-slate-900">SISTER</option>
                       <option value="SINTA" className="bg-white text-slate-900">SINTA</option>
                       <option value="LAIN" className="bg-white text-slate-900">Lainnya</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">ISBN / ISSN</label>
                       <input name="isbn" className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="0000-0000" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Penerbit</label>
                       <input name="penerbit" className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="Publisher Name..." />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Co-Authors</label>
                    <input name="penulis" className="input-field bg-white/5 border-white/10 text-white h-14" placeholder="Ahmad, Budi, Siti..." />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] block pl-1">Unggah Manusript (PDF/JPG)</label>
                    <label className={cn(
                       "flex items-center justify-center h-14 rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
                       fileUrl ? "border-primary/50 bg-white/10" : "border-white/10 hover:border-primary/40 hover:bg-white/5"
                    )}>
                       <input 
                         type="file" 
                         className="hidden" 
                         onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                         disabled={uploadingFile}
                       />
                       {uploadingFile ? (
                          <Loader2 size={24} className="animate-spin text-primary" />
                       ) : fileUrl ? (
                          <div className="flex items-center space-x-2 text-primary font-black uppercase text-[10px] tracking-widest leading-none">
                             <CheckCircle2 size={16} />
                             <span>Evidence Sealed</span>
                          </div>
                       ) : (
                          <div className="flex items-center space-x-3 text-slate-500 group-hover:text-primary transition-colors">
                             <FileUp size={20} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Select Archive File</span>
                          </div>
                       )}
                    </label>
                 </div>

                 <button type="submit" disabled={saving || uploadingFile} className="w-full h-16 btn-primary rounded-2xl shadow-xl font-black uppercase text-[11px] tracking-[0.2em] disabled:opacity-50 mt-4 group">
                    {saving ? <Loader2 className="animate-spin" /> : (
                      <span className="flex items-center justify-center">COMMIT TO DIGITAL LIBRARY <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" /></span>
                    )}
                 </button>
              </div>
           </form>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {docs.length > 0 ? (
          docs.map((doc) => (
            <div key={doc.id} className="card p-10 bg-white hover:border-primary/30 transition-all group flex flex-col justify-between h-full border-slate-100 shadow-sm">
               <div>
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-primary transition-all shadow-lg group-hover:scale-110">
                        <Layers size={22} />
                     </div>
                     <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{doc.jenisKarya}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors italic tracking-tighter uppercase">{doc.judul}</h3>
                  
                  <div className="space-y-4 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                     <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Calendar size={14} className="mr-3 text-primary opacity-50" />
                        <span>Pub: {doc.tanggal}</span>
                     </div>
                     <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <Tag size={14} className="mr-3 text-primary opacity-50" />
                        <span>Platform: {doc.platform}</span>
                     </div>
                     {doc.penerbit && (
                       <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          <Globe size={14} className="mr-3 text-primary opacity-50" />
                          <span>Pub: {doc.penerbit}</span>
                       </div>
                     )}
                  </div>
               </div>

               <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <button onClick={() => window.open(doc.fileUrl, '_blank')} className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center transition-all group/btn h-10 px-4 rounded-xl hover:bg-primary/5">
                    <Download size={14} className="mr-2 group-hover/btn:-translate-y-1 transition-transform" />
                    <span>Download</span>
                  </button>
                  <button className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center transition-all group/btn h-10 px-4 rounded-xl hover:bg-primary/5">
                    <ExternalLink size={14} className="mr-2 group-hover/btn:translate-x-1 transition-transform" />
                    <span>Reference</span>
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-32 text-center text-slate-300 font-bold uppercase tracking-widest italic border-dashed border-2 flex flex-col items-center space-y-4">
             <Layers size={48} className="opacity-20" />
             <p className="text-xs">Digital archives empty. Please register your academic work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
