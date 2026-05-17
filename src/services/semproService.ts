
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
      id: r.id,
      studentId: r.student_id,
      studentName: profileMap[r.student_id] || 'Student',
      status: r.status,
      rejectionReason: r.rejection_reason,
      proposalFile: r.proposal_file,
      schedule: r.schedule,
      proof: r.proof,
      grade: r.grade,
      postSeminar: r.post_seminar
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
      id: reg.id,
      studentId: reg.student_id,
      studentName: profile?.full_name || 'Student',
      status: reg.status,
      rejectionReason: reg.rejection_reason,
      proposalFile: reg.proposal_file,
      schedule: reg.schedule,
      proof: reg.proof,
      grade: reg.grade,
      postSeminar: reg.post_seminar
    };
  },

  saveRegistration: async (reg: SemproRegistration) => {
    const dbPayload: any = {
      student_id: reg.studentId,
      status: reg.status,
      rejection_reason: reg.rejectionReason,
      proposal_file: reg.proposalFile,
      schedule: reg.schedule,
      proof: reg.proof,
      grade: reg.grade,
      post_seminar: reg.postSeminar,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('sempro_registrations')
      .upsert(dbPayload, { onConflict: 'student_id' });

    if (error) {
       console.error('Sempro Upsert Error:', error);
       throw error;
    }
  }
};
