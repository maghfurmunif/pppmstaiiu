
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
    // Phase 1: Fetch registrations
    const { data: regs, error: regError } = await supabase
      .from('sempro_registrations')
      .select('*');
    
    if (regError) {
      console.error('Error fetching sempro registrations:', regError);
      return [];
    }

    if (!regs || regs.length === 0) return [];

    // Phase 2: Fetch profiles for the students in these registrations
    const studentIds = Array.from(new Set(regs.map(r => r.student_id)));
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds);

    const profileMap = (profiles || []).reduce((acc: any, p) => {
      acc[p.id] = p.full_name;
      return acc;
    }, {});

    return regs.map(r => ({
      ...r,
      studentId: r.student_id,
      studentName: profileMap[r.student_id] || 'Student'
    }));
  },

  getRegistrationByStudent: async (studentId: string): Promise<SemproRegistration | null> => {
    // Phase 1: Fetch registration
    const { data: reg, error: regError } = await supabase
      .from('sempro_registrations')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    
    if (regError) {
       console.error('Error fetching sempro registration:', regError);
       return null;
    }

    if (!reg) return null;

    // Phase 2: Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .maybeSingle();

    return {
      ...reg,
      studentId: reg.student_id,
      studentName: profile?.full_name || 'Student'
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
