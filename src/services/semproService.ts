
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
    const { id, studentId, studentName, ...rest } = reg;
    const { error } = await supabase
      .from('sempro_registrations')
      .upsert({ 
        id, 
        ...rest, 
        student_id: studentId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
};
