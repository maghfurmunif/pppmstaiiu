import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Reactive check for logged in user
  const [isLoggedIn, setIsLoggedIn] = useState(!!(localStorage.getItem('user_role') && localStorage.getItem('user_id')));
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || 'Ahmad Maghfur');
  const [userRole, setUserRole] = useState(localStorage.getItem('user_role') || 'MAHASISWA');

  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem('user_role');
      const userId = localStorage.getItem('user_id');
      setIsLoggedIn(!!(role && userId));
      setUserName(localStorage.getItem('user_name') || 'Ahmad Maghfur');
      setUserRole(role || 'MAHASISWA');
    };

    window.addEventListener('storage', handleStorageChange);
    // Poll frequently to ensure UI stays in sync with localStorage even if not triggered by event
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
    navigate('/login');
    window.location.reload(); // Force a full reload to clear all states
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://res.cloudinary.com/dlvvzsyzv/image/upload/q_auto/f_auto/v1779118998/images_nvrkgt.jpg" 
              alt="Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-slate-50 p-1 shadow-sm"
            />
            <div>
              <span className="block font-bold text-slate-900 leading-none text-lg">PPPM STAI</span>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-1">Ihyaul Ulum Gresik</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-500 hover:text-primary font-medium text-sm transition-colors">Dashboard</Link>
            <Link to="/pengumuman" className="text-slate-500 hover:text-primary font-medium text-sm transition-colors">Pengumuman</Link>
            <Link to="/statistik" className="text-slate-500 hover:text-primary font-medium text-sm transition-colors">Statistik</Link>
            <Link to="/panduan" className="text-slate-500 hover:text-primary font-medium text-sm transition-colors">Panduan</Link>
            
            <div className="flex items-center space-x-4 pl-8 border-l border-slate-100">
              {isLoggedIn ? (
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => navigate(`/dashboard/${userRole.toLowerCase()}`)} 
                    className="flex items-center space-x-3 group"
                  >
                    <div className="text-right hidden lg:block">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{userName}</p>
                      <p className="text-[10px] text-primary font-black tracking-widest uppercase">{userRole}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <User size={18} />
                    </div>
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-md shadow-red-200"
                  >
                    <LogOut size={14} />
                    <span>LOGOUT</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="px-5 py-2 text-slate-500 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors">Login</Link>
                  <Link to="/register" className="btn-primary px-8 py-3 text-[10px] uppercase tracking-widest font-black shadow-lg shadow-primary/20">Get Started</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

          {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl"
        >
          <Link to="/" className="block py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
          <Link to="/pengumuman" className="block py-2 text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Pengumuman</Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
            {isLoggedIn ? (
              <>
                <Link to={`/dashboard/${userRole.toLowerCase()}`} className="w-full text-center py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-black/20" onClick={() => setIsOpen(false)}>MY DASHBOARD</Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-center py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-200">LOGOUT</button>
              </>
            ) : (
              <>
                <Link to="/login" className="w-full text-center py-3 text-slate-600 font-bold" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-center" onClick={() => setIsOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
