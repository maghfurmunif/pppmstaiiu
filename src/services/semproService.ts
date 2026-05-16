
import { supabase } from '@/src/lib/supabase';

export type AcademicStatus = 'ENROLL' | 'SUBMITTED' | 'REJECTED' | 'APPROVED' | 'SCHEDULED' | 'PROGRESS' | 'DOCS_SUBMITTED' | 'GRADING' | 'COMPLETED';

export interface SemproRegistration {
  id: string;
  studentId: string;
  studentName: string;
  status: AcademicStatus;
  rejectionReason?: string;
  proposalFile?: string;
  schedule?: any;
  proof?: any;
  grade?: string;
  postSeminar?: {
    dokumentasi: string[];
    catatan: string[];
  };
}

export const semproService = {
  getRegistrations: async (): Promise<SemproRegistration[]> => {
    const { data, error } = await supabase
      .from('sempro_registrations')
      .select('*, profiles(full_name)');
    
    if (error) {
      console.error('Error fetching sempro registrations:', error);
      return [];
    }

    return (data || []).map(r => ({
      ...r,
      studentId: r.student_id,
      studentName: r.profiles?.full_name || 'Student'
    }));
  },

  getRegistrationByStudent: async (studentId: string): Promise<SemproRegistration | null> => {
    const { data, error } = await supabase
      .from('sempro_registrations')
      .select('*, profiles(full_name)')
      .eq('student_id', studentId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching sempro registration:', error);
      return null;
    }

    return {
      ...data,
      studentId: data.student_id,
      studentName: data.profiles?.full_name || 'Student'
    };
  },

  saveRegistration: async (reg: SemproRegistration) => {
    const dbPayload: any = {
      student_id: reg.studentId,
      status: reg.status,
      rejectionReason: reg.rejectionReason,
      proposalFile: reg.proposalFile,
      schedule: reg.schedule,
      proof: reg.proof,
      grade: reg.grade,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('sempro_registrations')
      .upsert(dbPayload);

    if (error) {
       console.error('Sempro Upsert Error:', error);
       throw error;
    }
  }
};
