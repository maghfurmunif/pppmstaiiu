
import { supabase } from '@/src/lib/supabase';

export interface PengabdianRegistration {
  id: string;
  dosenId: string;
  dosenName: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SURVEY_PENDING' | 'RKL_PENDING' | 'DEPLOYMENT_PENDING' | 'LOGBOOK' | 'LPK_PENDING' | 'COMPLETED';
  rejectionReason?: string;
  docs: any;
  info?: any;
  totalHours: number;
  logbooks: PengabdianLogbook[];
}

export interface PengabdianLogbook {
  id: string;
  date: string;
  hours: number;
  nama: string;
  pihakDesa: string;
  statusPihakDesa: 'VERIFIED' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const pengabdianService = {
  getRegistrations: async (): Promise<PengabdianRegistration[]> => {
    const { data: regs, error } = await supabase
      .from('pengabdian_registrations')
      .select('*');
    
    if (error) {
      console.error('Error fetching pengabdian registrations:', error);
      return [];
    }

    if (!regs || regs.length === 0) return [];

    const dosenIds = Array.from(new Set(regs.map(r => r.dosen_id)));
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', dosenIds);
    const profileMap = (profiles || []).reduce((acc: any, p) => ({ ...acc, [p.id]: p.full_name }), {});

    return regs.map(r => ({
      id: r.id,
      dosenId: r.dosen_id,
      dosenName: profileMap[r.dosen_id] || 'Dosen',
      status: r.status,
      rejectionReason: r.rejection_reason,
      docs: r.docs,
      info: r.info,
      logbooks: r.logbooks || [],
      totalHours: r.total_hours || 0
    }));
  },

  getRegistrationByDosen: async (dosenId: string): Promise<PengabdianRegistration | null> => {
    const { data: reg, error } = await supabase
      .from('pengabdian_registrations')
      .select('*')
      .eq('dosen_id', dosenId)
      .maybeSingle();
    
    if (error || !reg) {
      if (error) console.error('Error fetching pengabdian registration:', error);
      return null;
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', dosenId).maybeSingle();

    return {
      id: reg.id,
      dosenId: reg.dosen_id,
      dosenName: profile?.full_name || 'Dosen',
      status: reg.status,
      rejectionReason: reg.rejection_reason,
      docs: reg.docs,
      info: reg.info,
      logbooks: reg.logbooks || [],
      totalHours: reg.total_hours || 0
    };
  },

  saveRegistration: async (reg: PengabdianRegistration) => {
    const dbPayload: any = {
      dosen_id: reg.dosenId,
      status: reg.status,
      rejection_reason: reg.rejectionReason,
      docs: reg.docs,
      info: reg.info,
      total_hours: reg.totalHours,
      logbooks: reg.logbooks,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('pengabdian_registrations')
      .upsert(dbPayload, { onConflict: 'dosen_id' });

    if (error) {
      console.error('Pengabdian Upsert Error:', error);
      throw error;
    }
  },
};
