
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
    const { data, error } = await supabase
      .from('pengabdian_registrations')
      .select('*, profiles(full_name)');
    
    if (error) {
      console.error('Error fetching pengabdian registrations:', error);
      return [];
    }

    return (data || []).map(r => ({
      ...r,
      dosenId: r.dosen_id,
      dosenName: r.profiles?.full_name || 'Dosen',
      logbooks: r.logbooks || [],
      totalHours: r.totalHours || 0
    }));
  },

  getRegistrationByDosen: async (dosenId: string): Promise<PengabdianRegistration | null> => {
    const { data, error } = await supabase
      .from('pengabdian_registrations')
      .select('*, profiles(full_name)')
      .eq('dosen_id', dosenId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching pengabdian registration:', error);
      return null;
    }

    return {
      ...data,
      dosenId: data.dosen_id,
      dosenName: data.profiles?.full_name || 'Dosen',
      logbooks: data.logbooks || [],
      totalHours: data.totalHours || 0
    };
  },

  saveRegistration: async (reg: PengabdianRegistration) => {
    const dbPayload: any = {
      dosen_id: reg.dosenId,
      status: reg.status,
      rejectionReason: reg.rejectionReason,
      docs: reg.docs,
      info: reg.info,
      totalHours: reg.totalHours,
      logbooks: reg.logbooks,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('pengabdian_registrations')
      .upsert(dbPayload);

    if (error) {
      console.error('Pengabdian Upsert Error:', error);
      throw error;
    }
  },
};
