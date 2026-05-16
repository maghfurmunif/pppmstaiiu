
export type AcademicStatus = 'ENROLL' | 'SUBMITTED' | 'REJECTED' | 'APPROVED' | 'SCHEDULED' | 'PROGRESS' | 'DOCS_SUBMITTED' | 'GRADING' | 'COMPLETED';

export interface SemproRegistration {
  id: string;
  studentId: string;
  studentName: string;
  status: AcademicStatus;
  rejectionReason?: string;
  proposalFile?: string;
  
  // Admin assigns
  schedule?: {
    tanggal: string;
    hari: string;
    pukul: string;
    ruang: string;
    sifat: string;
    catatan?: string;
  };
  
  // Student uploads proof
  proof?: {
    docs: string[]; // min 3
    notes: string[]; // max 3
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
  
  grade?: string;
}

const STORAGE_KEY_SEMPRO = 'sempro_registrations';

export const semproService = {
  getRegistrations: (): SemproRegistration[] => {
    const data = localStorage.getItem(STORAGE_KEY_SEMPRO);
    return data ? JSON.parse(data) : [];
  },

  getRegistrationByStudent: (studentId: string): SemproRegistration | null => {
    const regs = semproService.getRegistrations();
    return regs.find(r => r.studentId === studentId) || null;
  },

  saveRegistration: (reg: SemproRegistration) => {
    const regs = semproService.getRegistrations();
    const index = regs.findIndex(r => r.id === reg.id);
    if (index > -1) {
      regs[index] = reg;
    } else {
      regs.push(reg);
    }
    localStorage.setItem(STORAGE_KEY_SEMPRO, JSON.stringify(regs));
  }
};
