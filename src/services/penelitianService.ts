
import { AcademicStatus } from './semproService';

export interface PenelitianRegistration {
  id: string;
  dosenId: string;
  dosenName: string;
  status: AcademicStatus;
  rejectionReason?: string;
  proposalFile?: string;

  // Sempro Info (assigned by Admin)
  semproInfo?: {
    lokasi: string;
    tanggal: string;
    pukul: string;
    catatan?: string;
  };

  // Proof of Sempro
  semproProof?: {
    photos: string[]; // min 3
    note: string; // min 1
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };

  // Research Phase (Logbook)
  logbooks: PenelitianLogbook[];

  // Results
  resultFile?: string;

  // Final Seminar Info
  finalSemproInfo?: {
    tanggal: string;
    pukul: string;
    lokasi: string;
    panelis: string;
    peserta: string;
    catatan?: string;
  };

  // Final Seminar Proof
  finalSemproProof?: {
    photos: string[]; // min 3
    note: string; // min 1
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };

  // Final Revision
  finalRevisionFile?: string;
  
  // Publication Option
  publication?: {
    method: 'MANDIRI' | 'PPPM';
    type?: 'JURNAL' | 'BUKU' | 'PROSIDING' | 'LAIN';
    otherType?: string;
  };
}

export interface PenelitianLogbook {
  id: string;
  date: string;
  time: string;
  activity: string;
  note: string;
  photo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DosenDokumentasi {
  id: string;
  dosenId: string;
  jenisKarya: string;
  judul: string;
  tanggal: string;
  isbnIssn?: string;
  penulisTambahan?: string;
  penerbit: string;
  platform: 'REPOSITORY' | 'SISTER' | 'SINTA' | 'LAIN';
  fileUrl: string;
}

const STORAGE_KEY_PENELITIAN = 'dosen_penelitian';
const STORAGE_KEY_DOKUMENTASI = 'dosen_dokumentasi';

export const penelitianService = {
  getRegistrations: (): PenelitianRegistration[] => {
    const data = localStorage.getItem(STORAGE_KEY_PENELITIAN);
    return data ? JSON.parse(data) : [];
  },
  getRegistrationByDosen: (dosenId: string): PenelitianRegistration | null => {
    const regs = penelitianService.getRegistrations();
    return regs.find(r => r.dosenId === dosenId) || null;
  },
  saveRegistration: (reg: PenelitianRegistration) => {
    const regs = penelitianService.getRegistrations();
    const index = regs.findIndex(r => r.id === reg.id);
    if (index > -1) regs[index] = reg;
    else regs.push(reg);
    localStorage.setItem(STORAGE_KEY_PENELITIAN, JSON.stringify(regs));
  },
  
  getDokumentasi: (dosenId?: string): DosenDokumentasi[] => {
    const data = localStorage.getItem(STORAGE_KEY_DOKUMENTASI);
    const all = data ? JSON.parse(data) : [];
    return dosenId ? all.filter((d: any) => d.dosenId === dosenId) : all;
  },
  saveDokumentasi: (doc: DosenDokumentasi) => {
    const all = penelitianService.getDokumentasi();
    all.push(doc);
    localStorage.setItem(STORAGE_KEY_DOKUMENTASI, JSON.stringify(all));
  }
};
