
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
    const { data: regs, error } = await supabase
      .from('kkn_registrations')
      .select('*');
    
    if (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }

    if (!regs || regs.length === 0) return [];

    const studentIds = Array.from(new Set(regs.map(r => r.student_id)));
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', studentIds);
    const profileMap = (profiles || []).reduce((acc: any, p) => ({ ...acc, [p.id]: p.full_name }), {});

    return regs.map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentName: profileMap[r.student_id] || 'Student',
      type: r.type,
      status: r.status,
      rejectionReason: r.rejection_reason,
      docs: r.docs,
      info: r.info,
      surveyDocs: r.survey_docs,
      rkl: r.rkl,
      deployment: r.deployment,
      logbooks: r.logbooks || [],
      totalHours: r.total_hours || 0,
      lpk: r.lpk,
      grades: r.grades
    }));
  },

  getRegistrationByStudent: async (studentId: string, type: 'REGULER' | 'MANDIRI'): Promise<KKNRegistration | null> => {
    const { data: reg, error } = await supabase
      .from('kkn_registrations')
      .select('*')
      .eq('student_id', studentId)
      .eq('type', type)
      .maybeSingle();
    
    if (error || !reg) {
      if (error) console.error('Error fetching registration:', error);
      return null;
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', studentId).maybeSingle();

    return {
      id: reg.id,
      studentId: reg.student_id,
      studentName: profile?.full_name || 'Student',
      type: reg.type,
      status: reg.status,
      rejectionReason: reg.rejection_reason,
      docs: reg.docs,
      info: reg.info,
      surveyDocs: reg.survey_docs,
      rkl: reg.rkl,
      deployment: reg.deployment,
      logbooks: reg.logbooks || [],
      totalHours: reg.total_hours || 0,
      lpk: reg.lpk,
      grades: reg.grades
    };
  },

  saveRegistration: async (reg: KKNRegistration) => {
    // Pick ONLY columns that exist in the database table
    const dbPayload: any = {
      student_id: reg.studentId,
      type: reg.type,
      status: reg.status,
      rejection_reason: reg.rejectionReason,
      docs: reg.docs,
      info: reg.info,
      survey_docs: reg.surveyDocs,
      rkl: reg.rkl,
      deployment: reg.deployment,
      logbooks: reg.logbooks,
      total_hours: reg.totalHours,
      lpk: reg.lpk,
      grades: reg.grades,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('kkn_registrations')
      .upsert(dbPayload, { onConflict: 'student_id,type' });

    if (error) {
      console.error('Detailed Upsert Error:', error);
      throw error;
    }
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
