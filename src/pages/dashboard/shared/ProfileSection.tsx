import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, 
  GraduationCap, ClipboardList, Layers,
  Save, Loader2, Camera, MessageCircle,
  BookOpen, Globe, Info
} from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';

export default function ProfileSection() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId);

    if (error) {
      toast.error('Gagal memperbarui profil: ' + error.message);
    } else {
      toast.success('Profil berhasil diperbarui secara permanen');
      localStorage.setItem('user_name', profile.full_name || '');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Bio-Data...</p>
    </div>
  );

  const isDosen = profile?.role === 'DOSEN';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Profil Saya</h1>
          <p className="text-slate-500 font-medium mt-2 pt-2">Lengkapi biodata Anda untuk keperluan administrasi dan pelaporan resmi.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 space-y-6">
           <div className="card p-10 bg-slate-900 text-white border-none shadow-2xl rounded-[40px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                 {isDosen ? <GraduationCap size={150} /> : <User size={150} />}
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                 <div className="w-24 h-24 bg-white/10 rounded-[36px] flex items-center justify-center text-primary font-black text-4xl uppercase italic border border-white/20 shadow-inner">
                    {profile?.full_name?.charAt(0) || <User />}
                 </div>
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">{profile?.full_name || 'BELUM DIISI'}</h3>
                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mt-2 italic">{profile?.role}</p>
                 </div>
                 <div className="w-full pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div className="text-left">
                       <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Identitas</p>
                       <p className="text-[10px] font-bold text-slate-200 uppercase tracking-tighter italic">Verified Member</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Joined Date</p>
                       <p className="text-[10px] font-bold text-slate-200 uppercase tracking-tighter italic">{new Date(profile?.created_at).getFullYear()}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-8 bg-white border-none shadow-xl rounded-[32px] space-y-4">
              <div className="flex items-start space-x-4 text-slate-400">
                 <Info size={20} className="shrink-0 text-primary" />
                 <p className="text-[10px] font-medium leading-relaxed italic">Pastikan data yang Anda masukkan sesuai dengan KTP dan dokumen resmi akademik. Data ini akan digunakan untuk sertifikat KKN, Sempro, dan Skripsi.</p>
              </div>
           </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-8">
           <div className="card p-10 bg-white border-none shadow-2xl rounded-[40px] space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                       <span className="w-8 h-px bg-slate-200 mr-3" /> Biodata Utama
                    </h4>
                    <div className="space-y-4">
                       <InputGroup label="Nama Lengkap" value={profile?.full_name || ''} onChange={v => setProfile({...profile, full_name: v})} />
                       <InputGroup label="Tempat, Tanggal Lahir" value={profile?.ttl || ''} onChange={v => setProfile({...profile, ttl: v})} />
                       <InputGroup label="Nomor WhatsApp" value={profile?.phone || ''} icon={<MessageCircle size={14} />} onChange={v => setProfile({...profile, phone: v})} />
                       <div className="grid grid-cols-2 gap-4">
                          <InputGroup label="Fakultas" value={profile?.fakultas || ''} onChange={v => setProfile({...profile, fakultas: v})} />
                          <InputGroup label="Jurusan" value={profile?.jurusan || ''} onChange={v => setProfile({...profile, jurusan: v})} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                       <span className="w-8 h-px bg-slate-200 mr-3" /> Data Akademik
                    </h4>
                    <div className="space-y-4">
                       <InputGroup label={isDosen ? 'NIDN' : 'NIM'} value={profile?.nim_nidn || ''} onChange={v => setProfile({...profile, nim_nidn: v})} />
                       {isDosen ? (
                         <>
                            <InputGroup label="Jabatan Fungsional" value={profile?.jabatan || ''} icon={<Layers size={14} />} onChange={v => setProfile({...profile, jabatan: v})} />
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Katalog Publikasi Riset</label>
                               <textarea 
                                 className="input-field h-40 pt-5 px-6 font-medium italic leading-relaxed"
                                 placeholder="Sebutkan jurnal atau karya ilmiah Anda..."
                                 value={profile?.publications || ''}
                                 onChange={e => setProfile({...profile, publications: e.target.value})}
                               />
                            </div>
                         </>
                       ) : (
                         <>
                            <InputGroup label="Semester Berjalan" value={profile?.semester || ''} onChange={v => setProfile({...profile, semester: v})} />
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Alamat Domisili Lengkap</label>
                               <textarea 
                                 className="input-field h-52 pt-5 px-6 font-medium italic leading-relaxed"
                                 placeholder="Tulis alamat rumah lengkap Anda..."
                                 value={profile?.alamat || ''}
                                 onChange={e => setProfile({...profile, alamat: e.target.value})}
                               />
                            </div>
                         </>
                       )}
                    </div>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                 <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary w-full h-20 rounded-[28px] text-[12px] font-black uppercase tracking-[0.4em] shadow-3xl shadow-primary/40 italic flex items-center justify-center space-x-4"
                 >
                    {saving ? <Loader2 size={24} className="animate-spin" /> : (
                      <>
                        <Save size={20} />
                        <span>Simpan Perubahan Permanen</span>
                      </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      </form>
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, icon }: { label: string, value: string, onChange: (v: string) => void, icon?: any }) {
  return (
    <div className="space-y-1 group">
       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 group-focus-within:text-primary transition-colors">{label}</label>
       <div className="relative">
          {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"><icon size={16} /></div>}
          <input 
            type="text" 
            className={cn("input-field h-14 px-6 font-bold uppercase tracking-widest italic transition-shadow", icon && "pl-14")}
            value={value} 
            onChange={e => onChange(e.target.value)} 
          />
       </div>
    </div>
  );
}
