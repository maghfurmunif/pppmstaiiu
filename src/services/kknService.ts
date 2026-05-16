
export type KKNStatus = 'ENROLL' | 'PENDING' | 'SUBMITTED' | 'REJECTED' | 'APPROVED' | 'SURVEY' | 'SURVEY_PENDING' | 'RKL' | 'RKL_PENDING' | 'DEPLOYMENT' | 'DEPLOYMENT_PENDING' | 'LOGBOOK' | 'LPK' | 'LPK_PENDING' | 'GRADING' | 'COMPLETED';

export interface KKNRegistration {
  id: string;
  studentId: string;
  studentName: string;
  type: 'REGULER' | 'MANDIRI';
  status: KKNStatus;
  rejectionReason?: string;
  
  // Phase 1: Registration Docs
  docs: {
    transkrip: boolean;
    pembayaran: boolean;
    krs: boolean;
    kesehatan: boolean;
    foto: boolean;
    pernyataan: boolean;
    izinOrtu: boolean;
  };
  
  // Phase 2: Info (assigned by Admin)
  info?: {
    lokasi: string;
    tglBerangkat: string;
    tglPulang: string;
    dpl: string;
    kelompok: string;
    tglSosialisasi: string;
    lokasiSosialisasi: string;
    catatan?: string;
  };
  
  // Phase 2: Student Survey Docs
  surveyDocs?: {
    sosialisasi: string[]; // URLs or Base64 (simulated)
    survei: string[]; // URLs or Base64 (simulated)
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    catatan?: string;
  };
  
  // Phase 3: RKL
  rkl?: {
    fileIndividu: string;
    fileKelompok: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    catatan?: string;
  };

  // Phase 4: Deployment
  deployment?: {
    foto: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };

  // Phase 5: Logbook
  logbooks: KKNLogbook[];
  totalHours: number;

  // Phase 6: LPK
  lpk?: {
    fileIndividu: string;
    fileKelompok: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    catatan?: string;
  };

  // Phase 7: Grading
  grades?: {
    rkl: number; // 5%
    kinerja: number; // 70%
    lpk: number; // 15%
    responsi: number; // 10%
    total: number;
    gradeText: string; // A, B, etc.
  };
}

export interface KKNLogbook {
  id: string;
  date: string;
  lokasi: string;
  nama: string;
  jenis: 'INDIVIDU' | 'KELOMPOK';
  pihakDesa: string;
  statusPihakDesa: string;
  startTime: string;
  endTime: string;
  photos: string[];
  scanLogbook: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hours: number;
  catatan?: string;
}

const STORAGE_KEY = 'kkn_registrations_v2';

export const kknService = {
  getRegistrations: (): KKNRegistration[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getRegistrationByStudent: (studentId: string, type: 'REGULER' | 'MANDIRI'): KKNRegistration | null => {
    const regs = kknService.getRegistrations();
    // Special case for demo: if no studentId is provided (anon dashboard), we check if any exists for that type
    return regs.find(r => r.studentId === (studentId || 'current_user') && r.type === type) || null;
  },

  saveRegistration: (reg: KKNRegistration) => {
    const regs = kknService.getRegistrations();
    const index = regs.findIndex(r => r.id === reg.id);
    if (index > -1) {
      regs[index] = reg;
    } else {
      regs.push(reg);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regs));
  },

  updateRegistration: (reg: KKNRegistration) => {
    kknService.saveRegistration(reg);
  },

  calculateHours: (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0, totalMinutes / 60);
  },

  calculateFinalGrade: (rkl: number, kinerja: number, lpk: number, responsi: number) => {
    const total = (rkl * 0.05) + (kinerja * 0.70) + (lpk * 0.15) + (responsi * 0.10);
    let gradeText = 'E';
    if (total >= 85) gradeText = 'A';
    else if (total >= 75) gradeText = 'B+';
    else if (total >= 65) gradeText = 'B';
    else if (total >= 55) gradeText = 'C';
    else if (total >= 45) gradeText = 'D';
    return { total, gradeText };
  }
};
