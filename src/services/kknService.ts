
import { supabase } from '@/src/lib/supabase';

export type KKNStatus = 'ENROLL' | 'PENDING' | 'SUBMITTED' | 'REJECTED' | 'APPROVED' | 'SURVEY' | 'SURVEY_PENDING' | 'RKL' | 'RKL_PENDING' | 'DEPLOYMENT' | 'DEPLOYMENT_PENDING' | 'LOGBOOK' | 'LPK' | 'LPK_PENDING' | 'GRADING' | 'COMPLETED';

export interface KKNRegistration {
  id: string;
  studentId: string;
  studentName: string;
  type: 'REGULER' | 'MANDIRI';
  status: KKNStatus;
  rejectionReason?: string;
  docs: any;
  info?: any;
  surveyDocs?: any;
  rkl?: any;
  deployment?: any;
  logbooks: KKNLogbook[];
  totalHours: number;
  lpk?: any;
  grades?: any;
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

export const kknService = {
  getRegistrations: async (): Promise<KKNRegistration[]> => {
    const { data, error } = await supabase
      .from('kkn_registrations')
      .select('*, profiles(full_name)');
    
    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }

    return (data || []).map(r => ({
      ...r,
      studentId: r.student_id,
      studentName: r.profiles?.full_name || 'Student',
      logbooks: [], // Logbooks usually fetched separately or joined
      totalHours: 0
    }));
  },

  getRegistrationByStudent: async (studentId: string, type: 'REGULER' | 'MANDIRI'): Promise<KKNRegistration | null> => {
    const { data, error } = await supabase
      .from('kkn_registrations')
      .select('*, profiles(full_name)')
      .eq('student_id', studentId)
      .eq('type', type)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching registration:', error);
      return null;
    }

    return {
      ...data,
      studentId: data.student_id,
      studentName: data.profiles?.full_name || 'Student',
      logbooks: [], 
      totalHours: 0
    };
  },

  saveRegistration: async (reg: KKNRegistration) => {
    const { id, studentId, studentName, ...rest } = reg;
    const dbPayload = {
      ...rest,
      student_id: studentId,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('kkn_registrations')
      .upsert({ id, ...dbPayload });

    if (error) throw error;
  },

  updateRegistration: async (reg: KKNRegistration) => {
    await kknService.saveRegistration(reg);
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
