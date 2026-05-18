import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Edit2, X, User, 
  Mail, MessageCircle, Loader2, Save,
  GraduationCap, ClipboardList, MapPin, Trash2,
  FlaskConical, Globe, BookOpen, Layers
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

export interface UserProfile {
  id: string;
  email: string;
  role: 'ADMIN' | 'DOSEN' | 'MAHASISWA';
  full_name?: string;
  ttl?: string;
  alamat?: string;
  fakultas?: string;
  jurusan?: string;
  semester?: string;
  phone?: string;
  nim_nidn?: string;
  jabatan?: string;
  publications?: string;
  status_kkn?: string;
  status_sempro?: string;
  status_skripsi?: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUsers(data as UserProfile[]);
    } catch (e) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editingUser)
        .eq('id', editingUser.id);

      if (error) throw error;
      
      toast.success('Profil berhasil diperbarui');
      setIsEditModalOpen(false);
      
      const updatedUser = { ...selectedUser, ...editingUser } as UserProfile;
      setSelectedUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    } catch (e: any) {
      toast.error('Gagal memperbarui profil: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengguna ini secara permanen?')) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      toast.success('Pengguna berhasil dihapus');
    } catch (e) {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email?.toLowerCase().includes(search.toLowerCase()) || 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.nim_nidn?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>Identity & Access Control</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Manajemen Pengguna</h1>
          <p className="text-slate-500 font-medium mt-2 pt-2">Administrasi otorisasi, manajemen role, dan audit akses sistem akademik.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Cari Identitas..." 
                className="input-field pl-12 py-4 w-72 text-xs font-black uppercase tracking-widest shadow-sm bg-white" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 side-scrollbar snap-x">
         {['ALL', 'ADMIN', 'DOSEN', 'MAHASISWA'].map(role => (
            <button 
              key={role} 
              onClick={() => setFilterRole(role)}
              className={cn(
                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border snap-start",
                filterRole === role ? "bg-slate-900 text-white shadow-xl border-slate-900 scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-primary/40 hover:text-primary"
              )}
            >
              {role}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* List Users */}
        <div className="lg:col-span-1 space-y-3 max-h-[70vh] overflow-y-auto side-scrollbar pr-2">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Identity Node...</p>
             </div>
          ) : filteredUsers.length === 0 ? (
             <div className="card p-10 text-center border-dashed border-2 opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">No match found</p>
             </div>
          ) : (
            filteredUsers.map(user => (
              <button 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                className={cn(
                  "w-full card p-6 text-left transition-all border-l-[6px] group relative overflow-hidden",
                  selectedUser?.id === user.id ? "border-l-primary shadow-2xl bg-white scale-[1.02]" : "border-l-slate-200 hover:border-l-slate-400 bg-white/50"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                   <span className={cn(
                     "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                     user.role === 'ADMIN' ? "bg-slate-900 text-white" : 
                     user.role === 'DOSEN' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                   )}>
                     {user.role}
                   </span>
                   <span className="text-[9px] font-bold text-slate-300 italic group-hover:text-primary transition-colors">#{user.id.slice(0, 5).toUpperCase()}</span>
                </div>
                <h4 className="font-black text-slate-900 truncate uppercase italic leading-tight">{user.full_name || 'Anonymous Academic'}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mt-1">{user.email}</p>
              </button>
            ))
          )}
        </div>

        {/* User Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div 
              key={selectedUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="card p-12 relative overflow-hidden bg-white border-none shadow-3xl rounded-[48px]">
                 <div className="absolute top-0 right-0 p-12 opacity-5"><User size={250} /></div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center space-x-8">
                       <div className="w-24 h-24 bg-slate-900 rounded-[36px] flex items-center justify-center text-white font-black text-3xl uppercase shadow-2xl italic tracking-tighter shrink-0">
                          {selectedUser.full_name?.charAt(0) || <User />}
                       </div>
                       <div>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{selectedUser.full_name || 'BELUM DIISI'}</h2>
                          <div className="flex items-center space-x-3 mt-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary font-black text-[9px] uppercase tracking-[0.2em] rounded-lg border border-primary/20">{selectedUser.role} ACCESS</span>
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Identity Verified</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <button 
                         onClick={() => { setEditingUser(selectedUser); setIsEditModalOpen(true); }}
                         className="btn-primary h-14 px-8 rounded-2xl flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group"
                       >
                          <Edit2 size={18} className="group-hover:rotate-12 transition-transform" />
                          <span>Edit Profil</span>
                       </button>
                       <button 
                         onClick={() => handleDelete(selectedUser.id)}
                         className="p-4 bg-white border border-red-50 rounded-2xl text-red-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 hover:shadow-lg transition-all active:scale-95"
                       >
                          <Trash2 size={20} />
                       </button>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 border-t border-slate-100 pt-12">
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                          <span className="w-8 h-px bg-slate-200 mr-3" /> Informasi Personal
                       </h4>
                       <div className="space-y-6">
                          <DetailItem label={selectedUser.role === 'DOSEN' ? 'NIDN' : 'NIM'} value={selectedUser.nim_nidn} />
                          <DetailItem label="Alamat Email" value={selectedUser.email} icon={<Mail size={14} />} />
                          <DetailItem label="Telepon / WA" value={selectedUser.phone} icon={<MessageCircle size={14} />} />
                          <DetailItem label="Fakultas / Jurusan" value={`${selectedUser.fakultas || '-'} / ${selectedUser.jurusan || '-'}`} />
                          <DetailItem label="Tempat, Tanggal Lahir" value={selectedUser.ttl} />
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                          <span className="w-8 h-px bg-slate-200 mr-3" /> Data Akademik
                       </h4>
                       <div className="space-y-6">
                          <DetailItem label="Alamat Domisili" value={selectedUser.alamat} icon={<MapPin size={14} />} />
                          {selectedUser.role === 'MAHASISWA' ? (
                            <>
                               <DetailItem label="Semester Berjalan" value={selectedUser.semester} />
                               <div className="pt-6 grid grid-cols-3 gap-3">
                                  <StatusTag label="Status KKN" status={selectedUser.status_kkn} icon={<Globe size={12} />} />
                                  <StatusTag label="Status Sempro" status={selectedUser.status_sempro} icon={<BookOpen size={12} />} />
                                  <StatusTag label="Status Skripsi" status={selectedUser.status_skripsi} icon={<GraduationCap size={12} />} />
                               </div>
                            </>
                          ) : (
                            <>
                               <DetailItem label="Jabatan Fungsional" value={selectedUser.jabatan} icon={<Layers size={14} />} />
                               <div className="space-y-2">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Publikasi Riset</p>
                                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                     <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                        {selectedUser.publications || 'Belum ada publikasi terdaftar.'}
                                     </p>
                                  </div>
                               </div>
                            </>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="card h-[600px] flex flex-col items-center justify-center text-center p-20 border-dashed border-2 opacity-30 rounded-[48px]">
               <Users size={80} className="text-slate-200 mb-6" />
               <h3 className="text-2xl font-black text-slate-200 uppercase italic tracking-tighter">Identity Console View</h3>
               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 max-w-xs">Pilih salah satu identitas di panel kiri untuk membuka data biodata lengkap.</p>
            </div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsEditModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative card bg-white p-12 w-full max-w-4xl shadow-[0_50px_100px_rgba(0,0,0,0.3)] rounded-[56px] my-8 max-h-[90vh] overflow-y-auto side-scrollbar"
             >
                <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
                   <div>
                      <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase underline decoration-primary underline-offset-8">Edit Biodata</h2>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-3">Node Override: {selectedUser?.full_name}</p>
                   </div>
                   <button onClick={() => setIsEditModalOpen(false)} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <FormInput label="Nama Lengkap" value={editingUser?.full_name || ''} onChange={val => setEditingUser({...editingUser!, full_name: val})} />
                      <FormInput label="Tempat, Tanggal Lahir" value={editingUser?.ttl || ''} onChange={val => setEditingUser({...editingUser!, ttl: val})} />
                      <FormInput label="Nomor WhatsApp" value={editingUser?.phone || ''} onChange={val => setEditingUser({...editingUser!, phone: val})} />
                      <div className="grid grid-cols-2 gap-6">
                         <FormInput label="Fakultas" value={editingUser?.fakultas || ''} onChange={val => setEditingUser({...editingUser!, fakultas: val})} />
                         <FormInput label="Jurusan" value={editingUser?.jurusan || ''} onChange={val => setEditingUser({...editingUser!, jurusan: val})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Alamat Domisili</label>
                         <textarea className="input-field h-32 pt-5 px-6 font-medium leading-relaxed italic" value={editingUser?.alamat || ''} onChange={e => setEditingUser({...editingUser!, alamat: e.target.value})} />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <FormInput label={selectedUser?.role === 'DOSEN' ? 'NIDN' : 'NIM'} value={editingUser?.nim_nidn || ''} onChange={val => setEditingUser({...editingUser!, nim_nidn: val})} />

                      {selectedUser?.role === 'MAHASISWA' ? (
                        <>
                          <FormInput label="Semester" value={editingUser?.semester || ''} onChange={val => setEditingUser({...editingUser!, semester: val})} />
                          <FormInput label="Status KKN" value={editingUser?.status_kkn || ''} onChange={val => setEditingUser({...editingUser!, status_kkn: val})} />
                          <FormInput label="Status Sempro" value={editingUser?.status_sempro || ''} onChange={val => setEditingUser({...editingUser!, status_sempro: val})} />
                          <FormInput label="Status Skripsi" value={editingUser?.status_skripsi || ''} onChange={val => setEditingUser({...editingUser!, status_skripsi: val})} />
                        </>
                      ) : (
                        <>
                          <FormInput label="Jabatan Fungsional" value={editingUser?.jabatan || ''} onChange={val => setEditingUser({...editingUser!, jabatan: val})} />
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Katalog Publikasi Riset</label>
                             <textarea className="input-field h-64 pt-5 px-6 font-medium leading-relaxed italic" placeholder="Judul Jurnal, Buku, Prosiding..." value={editingUser?.publications || ''} onChange={e => setEditingUser({...editingUser!, publications: e.target.value})} />
                          </div>
                        </>
                      )}
                   </div>

                   <div className="md:col-span-2 pt-10">
                      <button type="submit" className="btn-primary w-full h-20 rounded-[28px] text-[13px] font-black uppercase tracking-[0.4em] shadow-3xl shadow-primary/40 italic">SIMPAN BIODATA PERMANEN</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-1">
       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{label}</label>
       <input className="input-field py-5 px-6 font-bold uppercase tracking-widest italic" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value?: string, icon?: React.ReactNode }) {
  return (
    <div className="space-y-2">
       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">{label}</p>
       <div className="flex items-center space-x-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          {icon && <span className="text-primary">{icon}</span>}
          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{value || '-'}</p>
       </div>
    </div>
  );
}

function StatusTag({ label, status, icon }: { label: string, status?: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900 text-white p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 shadow-xl border border-white/10 group hover:bg-primary transition-all cursor-default">
       <div className="text-white/40 group-hover:text-white transition-colors">{icon}</div>
       <div className="text-center">
          <span className="text-[7px] font-black text-white/40 uppercase block leading-none mb-1 group-hover:text-white/70">{label}</span>
          <span className="text-[9px] font-black text-white uppercase tracking-tighter leading-none">{status || 'BELUM'}</span>
       </div>
    </div>
  );
}
