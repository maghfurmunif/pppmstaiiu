import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Plus, Search, Trash2, Edit2, 
  Calendar, Tag, Loader2, Save, X,
  FileText, Megaphone, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { publicService, Announcement } from '@/src/services/publicService';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);
  const [search, setSearch] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await publicService.getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      toast.error('Gagal memuat pengumuman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn?.title || !editingAnn?.content) return toast.error('Harap isi judul dan konten');
    
    try {
      await publicService.saveAnnouncement({
        ...editingAnn,
        tag: editingAnn.tag || 'Umum',
        created_at: editingAnn.created_at || new Date().toISOString()
      });
      toast.success('Pengumuman berhasil disimpan');
      setIsModalOpen(false);
      setEditingAnn(null);
      fetchAnnouncements();
    } catch (e) {
      toast.error('Gagal menyimpan pengumuman');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      await publicService.deleteAnnouncement(id);
      toast.success('Pengumuman dihapus');
      fetchAnnouncements();
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  };

  const filtered = announcements.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Pusat Informasi</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Kelola Pengumuman</h1>
          <p className="text-slate-500 font-medium pt-2">Publikasi berita, jadwal, dan informasi penting bagi civitas akademika.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Cari Berita..." 
                className="input-field pl-12 py-4 w-64 text-xs font-black uppercase tracking-widest shadow-sm bg-white" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <button 
             onClick={() => { setEditingAnn({}); setIsModalOpen(true); }}
             className="btn-primary h-14 px-8 rounded-2xl flex items-center space-x-3 shadow-xl transition-all hover:scale-105 active:scale-95 group"
           >
              <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-widest hidden md:block">Tulis Pengumuman</span>
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 italic text-slate-400 font-bold uppercase tracking-widest text-xs space-y-4">
           <Loader2 className="animate-spin text-primary" size={40} />
           <p>Menyelaraskan Pengumuman...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {filtered.length === 0 ? (
             <div className="card p-20 text-center border-dashed border-2 m-4 rounded-[40px]">
                <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-300 font-black uppercase tracking-widest text-xs">Belum ada pengumuman aktif.</p>
             </div>
           ) : (
             filtered.map((ann, idx) => (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.05 }}
                 key={ann.id} 
                 className="card p-10 bg-white hover:shadow-2xl transition-all group border-none shadow-lg relative overflow-hidden"
               >
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform"><Megaphone size={120} /></div>
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-4 flex-grow">
                       <div className="flex items-center space-x-4">
                          <span className="px-4 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary/20">{ann.tag}</span>
                          <span className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <Calendar size={14} className="text-slate-300" />
                             <span>{new Date(ann.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                          </span>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase italic group-hover:text-primary transition-colors">{ann.title}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed max-w-3xl line-clamp-2">{ann.content}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                       <button 
                         onClick={() => { setEditingAnn(ann); setIsModalOpen(true); }}
                         className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary hover:shadow-lg transition-all active:scale-95"
                       >
                          <Edit2 size={18} />
                       </button>
                       <button 
                         onClick={() => handleDelete(ann.id)}
                         className="p-4 bg-white border border-red-50 rounded-2xl text-red-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 hover:shadow-lg transition-all active:scale-95"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
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
               className="relative card bg-white p-10 w-full max-w-2xl shadow-3xl rounded-[40px] overflow-hidden"
             >
                <div className="flex items-center justify-between mb-10">
                   <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary underline-offset-8">Buat Pengumuman</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Judul Pengumuman</label>
                      <input 
                        className="input-field py-5 px-6 font-bold uppercase tracking-widest italic" 
                        placeholder="Judul Pengumuman..."
                        value={editingAnn?.title || ''}
                        onChange={e => setEditingAnn({...editingAnn, title: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Klasifikasi / Kategori</label>
                        <select 
                          className="input-field py-5 px-6 font-bold uppercase tracking-widest"
                          value={editingAnn?.tag || 'Umum'}
                          onChange={e => setEditingAnn({...editingAnn, tag: e.target.value})}
                        >
                           <option value="Umum">Umum</option>
                           <option value="Akademik">Akademik</option>
                           <option value="Seminar">Seminar</option>
                           <option value="KKN">KKN</option>
                           <option value="Skripsi">Skripsi</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Tanggal Terbit</label>
                        <input 
                          type="date"
                          className="input-field py-5 px-6 font-bold uppercase tracking-widest"
                          value={editingAnn?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]}
                          onChange={e => setEditingAnn({...editingAnn, created_at: new Date(e.target.value).toISOString()})}
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Konten / Isi Pengumuman</label>
                      <textarea 
                        className="input-field py-6 px-6 h-48 font-medium leading-relaxed" 
                        placeholder="Deskripsi detail pengumuman..."
                        value={editingAnn?.content || ''}
                        onChange={e => setEditingAnn({...editingAnn, content: e.target.value})}
                      />
                   </div>

                   <button type="submit" className="btn-primary w-full h-18 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 rounded-3xl mt-4">
                      Terbitkan Sekarang
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
