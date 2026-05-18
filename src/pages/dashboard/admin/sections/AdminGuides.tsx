import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, Search, Trash2, Edit2, 
  Download, Link as LinkIcon, Loader2, Save, X,
  ExternalLink, BookOpen, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { publicService, Guide } from '@/src/services/publicService';

export default function AdminGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Partial<Guide> | null>(null);
  const [search, setSearch] = useState('');

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const data = await publicService.getGuides();
      setGuides(data);
    } catch (e) {
      toast.error('Gagal memuat panduan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide?.title || !editingGuide?.file_url) return toast.error('Harap isi judul dan link download');
    
    try {
      await publicService.saveGuide(editingGuide);
      toast.success('Panduan berhasil disimpan');
      setIsModalOpen(false);
      setEditingGuide(null);
      fetchGuides();
    } catch (e) {
      toast.error('Gagal menyimpan panduan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus panduan ini?')) return;
    try {
      await publicService.deleteGuide(id);
      toast.success('Panduan dihapus');
      fetchGuides();
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  const filtered = guides.filter(g => 
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Resource Knowledge Base</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Kelola Panduan</h1>
          <p className="text-slate-500 font-medium pt-2">Manajemen dokumen referensi, SOP, dan file instruksi sistem.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search Assets..." 
                className="input-field pl-12 py-4 w-64 text-xs font-black uppercase tracking-widest shadow-sm bg-white" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <button 
             onClick={() => { setEditingGuide({}); setIsModalOpen(true); }}
             className="btn-primary h-14 px-8 rounded-2xl flex items-center space-x-3 shadow-xl transition-all hover:scale-105 active:scale-95 group"
           >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-widest hidden md:block">Add Resource</span>
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
           <Loader2 className="animate-spin text-primary" size={40} />
           <p>Indexing Resource Repository...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {filtered.length === 0 ? (
             <div className="col-span-full card p-20 text-center border-dashed border-2 m-4 rounded-[40px]">
                <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No guides available in database.</p>
             </div>
           ) : (
             filtered.map((guide, idx) => (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 key={guide.id} 
                 className="card p-8 bg-white hover:shadow-2xl transition-all group border-none shadow-lg flex items-center justify-between"
               >
                 <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                       <FileText size={32} />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-900 leading-tight tracking-tight uppercase italic group-hover:text-primary transition-colors">{guide.title}</h3>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{new Date(guide.created_at).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3">
                    <a 
                      href={guide.file_url} 
                      target="_blank" 
                      className="p-3.5 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                    >
                       <Download size={18} />
                    </a>
                    <button 
                      onClick={() => { setEditingGuide(guide); setIsModalOpen(true); }}
                      className="p-3.5 bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all"
                    >
                       <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(guide.id)}
                      className="p-3.5 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
               </motion.div>
             ))
           )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative card bg-white p-10 w-full max-w-xl shadow-3xl rounded-[40px] overflow-hidden"
             >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary underline-offset-8">Data Panduan</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Resource Nomenclature</label>
                      <input 
                        className="input-field py-5 px-6 font-bold uppercase tracking-widest italic" 
                        placeholder="Judul Panduan (mis: SOP KKN 2024)..."
                        value={editingGuide?.title || ''}
                        onChange={e => setEditingGuide({...editingGuide, title: e.target.value})}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Download / CDN URL</label>
                      <div className="relative group">
                         <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input 
                           className="input-field py-5 pl-16 pr-6 font-bold uppercase tracking-widest" 
                           placeholder="https://cloud.stai.ac.id/file.pdf"
                           value={editingGuide?.file_url || ''}
                           onChange={e => setEditingGuide({...editingGuide, file_url: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="p-6 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-start space-x-4">
                      <AlertCircle className="text-blue-500 flex-shrink-0" size={24} />
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider leading-relaxed">Pastikan link file bersifat publik dan dapat diakses/didownload langsung oleh seluruh civitas akademika tanpa pembatasan folder.</p>
                   </div>

                   <button type="submit" className="btn-primary w-full h-18 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 rounded-3xl mt-4 italic">
                      Save Resource
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
