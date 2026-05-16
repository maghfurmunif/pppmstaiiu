
import { AcademicStatus } from './semproService';

export interface SkripsiRegistration {
  id: string;
  studentId: string;
  studentName: string;
  status: AcademicStatus;
  rejectionReason?: string;

  // Phase 1: Registration
  registrationDocs?: {
    sks: boolean;
    ipk: boolean;
    nilaiMataKuliah: boolean;
    administrasi: boolean;
  };

  // Admin assigns
  advisor?: {
    name: string;
    info?: string;
  };

  // Phase 2: Bimbingan (Logbook)
  logbooks: SkripsiLogbook[];
  
  // Phase 3: Final Submission
  finalDocs?: {
    persetujuan: boolean;
    transkripKrs: boolean;
    bebasTanggungan: boolean;
    sertifikat: boolean;
    buktiBimbingan: boolean;
  };

  // Exam Info
  examSchedule?: {
    tanggal: string;
    hari: string;
    ruang: string;
    pukul: string;
    catatan?: string;
  };

  // Progress Docs (after exam)
  afterExamDocs?: {
    photos: string[]; // max 3
    revisions: string[]; // max 3
    finalRevisionFile?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };

  grades?: {
    naskah: number;  // 30%
    sidang: number;  // 70%
    total: number;
    gradeText: string;
  };
}

export interface SkripsiLogbook {
  id: string;
  date: string;
  topic: string;
  comment: string;
  photo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const STORAGE_KEY_SKRIPSI = 'skripsi_registrations';

export const skripsiService = {
  getRegistrations: (): SkripsiRegistration[] => {
    const data = localStorage.getItem(STORAGE_KEY_SKRIPSI);
    return data ? JSON.parse(data) : [];
  },
  getRegistrationByStudent: (studentId: string): SkripsiRegistration | null => {
    const regs = skripsiService.getRegistrations();
    return regs.find(r => r.studentId === studentId) || null;
  },
  saveRegistration: (reg: SkripsiRegistration) => {
    const regs = skripsiService.getRegistrations();
    const index = regs.findIndex(r => r.id === reg.id);
    if (index > -1) regs[index] = reg;
    else regs.push(reg);
    localStorage.setItem(STORAGE_KEY_SKRIPSI, JSON.stringify(regs));
  },
  calculateFinalGrade: (naskah: number, sidang: number) => {
    const total = (naskah * 0.3) + (sidang * 0.7);
    let gradeText = 'E';
    if (total >= 85) gradeText = 'A';
    else if (total >= 75) gradeText = 'B+';
    else if (total >= 65) gradeText = 'B';
    else if (total >= 55) gradeText = 'C';
    else if (total >= 45) gradeText = 'D';
    return { total, gradeText };
  }
};
