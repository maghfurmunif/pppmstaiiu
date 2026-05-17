
import { supabase } from '@/src/lib/supabase';
import { AcademicStatus } from './semproService';

export interface SkripsiRegistration {
  id: string;
  studentId: string;
  studentName: string;
  status: AcademicStatus;
  rejectionReason?: string;
  registrationDocs?: any;
  advisor?: any;
  logbooks: SkripsiLogbook[];
  finalDocs?: any;
  examSchedule?: any;
  afterExamDocs?: any;
  grades?: any;
}

export interface SkripsiLogbook {
  id: string;
  date: string;
  topic: string;
  comment: string;
  photo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const skripsiService = {
  getRegistrations: async (): Promise<SkripsiRegistration[]> => {
    const { data: regs, error } = await supabase
      .from('skripsi_registrations')
      .select('*');
    
    if (error) {
      console.error('Error fetching skripsi registrations:', error);
      return [];
    }

    if (!regs || regs.length === 0) return [];

    const studentIds = Array.from(new Set(regs.map(r => r.student_id)));
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', studentIds);
    const profileMap = (profiles || []).reduce((acc: any, p) => ({ ...acc, [p.id]: p.full_name }), {});

    return regs.map(r => ({
      ...r,
      studentId: r.student_id,
      studentName: profileMap[r.student_id] || 'Student',
      logbooks: r.logbooks || []
    }));
  },

  getRegistrationByStudent: async (studentId: string): Promise<SkripsiRegistration | null> => {
    const { data: reg, error } = await supabase
      .from('skripsi_registrations')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    
    if (error || !reg) {
      if (error) console.error('Error fetching skripsi registration:', error);
      return null;
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', studentId).maybeSingle();

    return {
      ...reg,
      studentId: reg.student_id,
      studentName: profile?.full_name || 'Student',
      logbooks: reg.logbooks || []
    };
  },

  saveRegistration: async (reg: SkripsiRegistration) => {
    const dbPayload: any = {
      student_id: reg.studentId,
      status: reg.status,
      rejectionReason: reg.rejectionReason,
      registrationDocs: reg.registrationDocs,
      advisor: reg.advisor,
      logbooks: reg.logbooks,
      finalDocs: reg.finalDocs,
      examSchedule: reg.examSchedule,
      afterExamDocs: reg.afterExamDocs,
      grades: reg.grades,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('skripsi_registrations')
      .upsert(dbPayload);

    if (error) {
      console.error('Skripsi Upsert Error:', error);
      throw error;
    }
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
