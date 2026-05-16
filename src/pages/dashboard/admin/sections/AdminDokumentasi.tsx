
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Search, Plus, Filter, 
  ExternalLink, Download, Clock
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { penelitianService, DosenDokumentasi } from '@/src/services/penelitianService';

export default function AdminDokumentasi() {
  const [docs, setDocs] = useState<DosenDokumentasi[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await penelitianService.getDokumentasi();
      setDocs(data);
    };
    fetchData();
  }, []);

  const filtered = docs.filter(d => 
    d.judul.toLowerCase().includes(search.toLowerCase()) || 
    d.jenisKarya.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary underline-offset-8">Repository Dokumentasi</h1>
          <p className="text-slate-500 font-medium mt-1">Lacak dan kelola arsip digital hasil karya dosen.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari judul/karya..." 
            className="input-field pl-12 py-3 w-64 text-sm" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden border-none shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">Jenis Karya</th>
              <th className="px-8 py-5">Judul & Penulis</th>
              <th className="px-8 py-5">Platform</th>
              <th className="px-8 py-5">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">Belum ada dokumentasi yang diunggah.</td>
              </tr>
            ) : (
              filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                      {doc.jenisKarya}
                    </span>
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{doc.judul}</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{doc.tanggal}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                       <div className="w-2 h-2 rounded-full bg-green-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase">{doc.platform}</span>
                    </div>
                  </td>
                   <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-primary hover:border-primary transition-all shadow-sm"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
