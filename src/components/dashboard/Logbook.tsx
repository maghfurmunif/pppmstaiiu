import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Calendar, Clock, MapPin, Send, Trash2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LogbookFormProps {
  type: 'KKN' | 'SKRIPSI' | 'RESEARCH';
  isMandiri?: boolean;
  onSubmit: (data: any) => void;
}

export default function LogbookForm({ type, isMandiri, onSubmit }: LogbookFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 3) return alert('Maksimal 3 foto');
    
    setPhotos([...photos, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f as Blob));
    setPreviews([...previews, ...newPreviews]);
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  return (
    <form className="space-y-6 glass-morphism p-8 rounded-[32px] border-white/40 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <FileText size={120} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Kegiatan</label>
          <input type="date" className="input-field bg-white/50" required />
        </div>
        {(type === 'KKN' || type === 'RESEARCH') && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pukul Kegiatan</label>
            <div className="flex items-center space-x-3">
              <input type="time" className="input-field bg-white/50" required />
              <span className="text-[10px] font-bold text-slate-300">S/D</span>
              <input type="time" className="input-field bg-white/50" required />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 relative z-10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama/Judul Kegiatan</label>
        <input className="input-field bg-white/50" placeholder="Contoh: Sosialisasi Pendidikan..." required />
      </div>

      {type === 'KKN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kegiatan</label>
            <select className="input-field bg-white/50 appearance-none">
              <option>Individu</option>
              <option>Kelompok</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lokasi</label>
            <div className="relative">
              <input className="input-field bg-white/50 pl-10" placeholder="Dusun/Balai Desa" />
              <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>
        </div>
      )}

      {isMandiri && (
        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah Orang Terlibat (Mandat Kuantitatif)</label>
          <input type="number" className="input-field bg-white/50" placeholder="0" />
        </div>
      )}

      <div className="space-y-2 relative z-10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Uraian/Catatan Kegiatan</label>
        <textarea className="input-field bg-white/50 min-h-[120px] resize-none" placeholder="Jabarkan detail kegiatan..." />
      </div>

      {/* Photo Uploads */}
      <div className="space-y-4 relative z-10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Dokumentasi (Maks 3 Foto)</label>
        <div className="flex flex-wrap gap-4">
          {previews.map((url, i) => (
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               key={i} 
               className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/40 group shadow-lg"
            >
              <img src={url} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={() => removePhoto(i)}
                className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="text-white" size={20} />
              </button>
            </motion.div>
          ))}
          {previews.length < 3 && (
            <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
              <Camera size={24} />
              <span className="text-[9px] font-black mt-2 tracking-widest uppercase">UPLOAD</span>
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} multiple />
            </label>
          )}
        </div>
      </div>

      <div className="pt-4 relative z-10">
        <button type="submit" className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center">
          Kirim Logbook <Send size={16} className="ml-3" />
        </button>
      </div>
    </form>
  );
}

export function LogbookList({ entries }: { entries: any[] }) {
  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={i} 
          className="card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/20 transition-all group"
        >
          <div className="flex items-start space-x-5">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary shrink-0 group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{entry.date} • {entry.time || entry.duration}</span>
                <span className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter",
                  entry.status === 'APPROVED' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                )}>
                  {entry.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 mt-1.5 text-lg leading-tight truncate">{entry.activityName}</h4>
              <p className="text-sm text-slate-500 mt-1 line-clamp-1 italic">{entry.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 shrink-0">
            <div className="flex -space-x-3 overflow-hidden">
               {entry.photos?.map((p: string, j: number) => (
                 <img key={j} src={p} className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-lg" />
               ))}
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50">
              {entry.status === 'PENDING' && <AlertTriangle size={18} className="text-orange-400" />}
              {entry.status === 'APPROVED' && <CheckCircle2 size={18} className="text-primary" strokeWidth={3} />}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
