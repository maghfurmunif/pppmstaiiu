
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
      dosenName: r.profiles?.full_name || 'Dosen'
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
      dosenName: data.profiles?.full_name || 'Dosen'
    };
  },

  saveRegistration: async (reg: PengabdianRegistration) => {
    const { id, dosenId, dosenName, ...rest } = reg;
    const { error } = await supabase
      .from('pengabdian_registrations')
      .upsert({ 
        id, 
        ...rest, 
        dosen_id: dosenId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
};
