import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Send, GraduationCap, BookOpen, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UserRole } from '@/src/types/index';
import { supabase } from '@/src/lib/supabase';

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>('MAHASISWA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    nim: '',
    nidn: '',
    email: '',
    password: '',
    jurusan: '',
    fakultas: '',
    semester: '',
    nomorYayasan: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Supabase Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create Profile in 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          role: role,
          email: formData.email,
          nim_nidn: role === 'MAHASISWA' ? formData.nim : formData.nidn,
          jurusan: formData.jurusan,
          fakultas: formData.fakultas,
          semester: role === 'MAHASISWA' ? parseInt(formData.semester) : null,
          nomor_sk_yayasan: role === 'DOSEN' ? formData.nomorYayasan : null,
        });

      if (profileError) throw profileError;

      // 3. Success Logic
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_id', authData.user.id);
      localStorage.setItem('user_name', formData.fullName);
      
      navigate(`/dashboard/${role.toLowerCase()}`);
      window.location.reload(); 
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center py-20 relative">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="glass-morphism border-white/40 shadow-2xl p-10 md:p-12 space-y-10 rounded-[40px]">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white font-bold italic text-2xl shadow-lg mb-4">STAI</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight italic">Buat Akun Portal</h1>
            <p className="text-slate-500 text-sm">Bergabunglah dengan ekosistem akademik STAI Ihyaul Ulum</p>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center space-x-3 max-w-[200px] mx-auto">
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-primary shadow-[0_0_10px_rgba(136,164,124,0.5)]" : "bg-slate-200")} />
            <div className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-primary shadow-[0_0_10px_rgba(136,164,124,0.5)]" : "bg-slate-200")} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 text-sm"
              >
                <AlertCircle size={18} />
                <p>{error}</p>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <button 
                    type="button"
                    onClick={() => setRole('MAHASISWA')}
                    className={cn(
                      "group relative flex flex-col items-center p-8 rounded-[32px] border-2 transition-all duration-300",
                      role === 'MAHASISWA' 
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                        : "border-slate-100 hover:border-slate-200 bg-white/50 text-slate-400"
                    )}
                  >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors", role === 'MAHASISWA' ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                      <GraduationCap size={32} />
                    </div>
                    <span className="font-bold tracking-tight">Mahasiswa</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('DOSEN')}
                    className={cn(
                      "group relative flex flex-col items-center p-8 rounded-[32px] border-2 transition-all duration-300",
                      role === 'DOSEN' 
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                        : "border-slate-100 hover:border-slate-200 bg-white/50 text-slate-400"
                    )}
                  >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors", role === 'DOSEN' ? "bg-primary text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                      <BookOpen size={32} />
                    </div>
                    <span className="font-bold tracking-tight">Dosen</span>
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                      <input 
                        className="input-field input-with-icon bg-white/50" 
                        placeholder="Your full name" 
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">
                        {role === 'MAHASISWA' ? 'NIM' : 'NIDN'}
                      </label>
                      <input 
                        className="input-field bg-white/50" 
                        placeholder={role === 'MAHASISWA' ? "Nomor Induk Mahasiswa" : "Nomor Induk Dosen"} 
                        required={role === 'MAHASISWA'}
                        value={role === 'MAHASISWA' ? formData.nim : formData.nidn}
                        onChange={(e) => setFormData({...formData, [role === 'MAHASISWA' ? 'nim' : 'nidn']: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Faculty</label>
                      <input 
                        className="input-field bg-white/50" 
                        placeholder="Fakultas" 
                        required
                        value={formData.fakultas}
                        onChange={(e) => setFormData({...formData, fakultas: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button type="button" onClick={nextStep} className="btn-primary w-full h-14 shadow-xl shadow-primary/20 flex items-center justify-center group">
                  Continue Registration <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {role === 'MAHASISWA' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Jurusan</label>
                        <input className="input-field bg-white/50" placeholder="Program Studi" required value={formData.jurusan} onChange={(e) => setFormData({...formData, jurusan: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Semester</label>
                        <input type="number" className="input-field bg-white/50" placeholder="1-14" required value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Nomor Yayasan</label>
                      <input className="input-field bg-white/50" placeholder="Nomor SK Yayasan" required value={formData.nomorYayasan} onChange={(e) => setFormData({...formData, nomorYayasan: e.target.value})} />
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Portal Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                      <input type="email" className="input-field input-with-icon bg-white/50" placeholder="name@portal.ac.id" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Password Keamanan</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" size={18} />
                      <input type="password" className="input-field input-with-icon bg-white/50" placeholder="••••••••" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button type="button" onClick={prevStep} className="px-8 py-2 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-colors uppercase text-[10px] tracking-widest">
                    Kembali
                  </button>
                  <button disabled={loading} className="btn-primary flex-grow flex items-center justify-center h-14 shadow-xl shadow-primary/20">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Selesaikan Pendaftaran <Send size={18} className="ml-2" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="pt-6 border-t border-slate-200/50 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun? <Link to="/login" className="text-primary font-bold hover:underline italic">Masuk Portal</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
