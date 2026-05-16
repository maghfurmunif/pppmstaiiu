
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
    const { data, error } = await supabase
      .from('skripsi_registrations')
      .select('*, profiles(full_name)');
    
    if (error) {
      console.error('Error fetching skripsi registrations:', error);
      return [];
    }

    return (data || []).map(r => ({
      ...r,
      studentId: r.student_id,
      studentName: r.profiles?.full_name || 'Student',
      logbooks: r.logbooks || []
    }));
  },

  getRegistrationByStudent: async (studentId: string): Promise<SkripsiRegistration | null> => {
    const { data, error } = await supabase
      .from('skripsi_registrations')
      .select('*, profiles(full_name)')
      .eq('student_id', studentId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching skripsi registration:', error);
      return null;
    }

    return {
      ...data,
      studentId: data.student_id,
      studentName: data.profiles?.full_name || 'Student',
      logbooks: data.logbooks || []
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
