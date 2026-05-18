import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          {/* Section 1: Profile & Contact */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
               <img 
                 src="https://res.cloudinary.com/dlvvzsyzv/image/upload/q_auto/f_auto/v1779118998/images_nvrkgt.jpg" 
                 alt="Logo" 
                 className="w-12 h-12 rounded-xl object-contain bg-white p-1"
               />
               <div>
                 <span className="block font-black text-white leading-none text-xl tracking-tighter italic">PPPM</span>
                 <span className="block text-[10px] text-slate-400 uppercase tracking-widest mt-1">STAI Ihyaul Ulum</span>
               </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Pusat Penelitian dan Pengabdian kepada Masyarakat (PPPM) STAI Ihyaul Ulum Gresik berkomitmen untuk memajukan ilmu pengetahuan dan pemberdayaan masyarakat.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                  <Phone size={16} />
                </div>
                <span>+62 812-3456-7890 (Call Center)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <span>pppm@stai-ihyaululum.ac.id</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                  <MessageCircle size={16} />
                </div>
                <span>+62 812-3456-7891 (WhatsApp)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white italic tracking-tight">Menu Utama</h4>
            <div className="grid grid-cols-1 gap-4">
              <Link to="/" className="text-sm hover:text-primary transition-colors flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Dashboard</span>
              </Link>
              <Link to="/pengumuman" className="text-sm hover:text-primary transition-colors flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Pengumuman</span>
              </Link>
              <Link to="/statistik" className="text-sm hover:text-primary transition-colors flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Statistik</span>
              </Link>
              <Link to="/panduan" className="text-sm hover:text-primary transition-colors flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Panduan</span>
              </Link>
              <Link to="/login" className="text-sm hover:text-primary transition-colors flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Login Akun</span>
              </Link>
            </div>
          </div>

          {/* Section 3: Map */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white italic tracking-tight">Lokasi Kampus</h4>
            <div className="rounded-2xl overflow-hidden h-48 border border-white/10 bg-white/5 flex items-center justify-center group">
               <div className="text-center p-6 space-y-4">
                  <MapPin className="mx-auto text-primary animate-bounce" size={32} />
                  <p className="text-xs text-slate-400 font-medium">XGR5+JG Sembungan Kidul, Gresik Regency, East Java</p>
                  <a 
                    href="https://www.google.com/maps/search/XGR5%2BJG+Sembungan+Kidul,+Gresik+Regency,+East+Java" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Buka di Google Maps
                  </a>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} STAI Ihyaul Ulum Gresik. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-6 text-slate-500">
            <Facebook size={18} className="hover:text-primary cursor-pointer transition-colors" />
            <Instagram size={18} className="hover:text-primary cursor-pointer transition-colors" />
            <Youtube size={18} className="hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
