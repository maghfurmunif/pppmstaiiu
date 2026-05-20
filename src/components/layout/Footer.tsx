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
            <div className="rounded-2xl overflow-hidden h-48 border border-white/10 bg-white/5 relative group">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.8396117650637!2d112.4497551!3d-7.028080!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e77e2daed698cdd%3A0xe96cf5d51d536768!2sSTAI%20Ihyaul%20Ulum%20Gresik!5e0!3m2!1sid!2sid!4v1716202400000!5m2!1sid!2sid" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }} 
                 allowFullScreen={true} 
                 loading="lazy" 
                 referrerPolicy="no-referrer"
                 className="opacity-80 group-hover:opacity-100 transition-opacity"
               ></iframe>
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
