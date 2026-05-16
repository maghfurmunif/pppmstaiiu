
export interface PengabdianRegistration {
  id: string;
  dosenId: string;
  dosenName: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SURVEY_PENDING' | 'RKL_PENDING' | 'DEPLOYMENT_PENDING' | 'LOGBOOK' | 'LPK_PENDING' | 'COMPLETED';
  rejectionReason?: string;
  docs: {
    suratTugas?: boolean;
    proposal?: boolean;
    kerjasama?: boolean;
  };
  info?: {
    lokasi: string;
    kelompok: string;
    tglSosialisasi: string;
    tglBerangkat: string;
    tglPulang: string;
  };
  totalHours: number;
  logbooks: PengabdianLogbook[];
}

export interface PengabdianLogbook {
  id: string;
  date: string;
  hours: number;
  nama: string;
  pihakDesa: string;
  statusPihakDesa: 'VERIFIED' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const STORAGE_KEY = 'dosen_pengabdian';

export const pengabdianService = {
  getRegistrations: (): PengabdianRegistration[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  getRegistrationByDosen: (dosenId: string): PengabdianRegistration | null => {
    const regs = pengabdianService.getRegistrations();
    return regs.find(r => r.dosenId === dosenId) || null;
  },
  saveRegistration: (reg: PengabdianRegistration) => {
    const regs = pengabdianService.getRegistrations();
    const index = regs.findIndex(r => r.id === reg.id);
    if (index > -1) regs[index] = reg;
    else regs.push(reg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
  }
};
