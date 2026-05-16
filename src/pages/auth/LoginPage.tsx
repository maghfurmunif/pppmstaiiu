import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user found');

      // Fetch Profile for Role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Fallback or handle missing profile
      }

      const userRole = profile?.role || 'MAHASISWA';
      const userId = authData.user.id;
      const userName = profile?.full_name || 'User Portal';

      localStorage.setItem('user_role', userRole);
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_name', userName);
      
      navigate(`/dashboard/${userRole.toLowerCase()}`);
      window.location.reload(); 
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-morphism border-white/40 shadow-2xl p-10 space-y-8 rounded-[40px]">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white font-bold italic text-2xl shadow-lg mb-4">STAI</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight italic">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Masuk ke portal akademik PPPM STAI Ihyaul Ulum</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">Email Institusi</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12 bg-white/50 focus:bg-white" 
                    placeholder="name@portal.ac.id"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Password</label>
                  <button type="button" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12 bg-white/50 focus:bg-white" 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button disabled={loading} className="btn-primary w-full flex items-center justify-center h-14 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to Portal <ArrowRight size={18} className="ml-2" /></>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-200/50 text-center">
            <p className="text-sm text-slate-500">
              New to the portal? <Link to="/register" className="text-primary font-bold hover:underline italic">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
