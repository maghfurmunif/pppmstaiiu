
import { supabase } from '@/src/lib/supabase';
import { AcademicStatus } from './semproService';

export interface PenelitianRegistration {
  id: string;
  dosenId: string;
  dosenName: string;
  status: AcademicStatus;
  rejectionReason?: string;
  proposalFile?: string;
  semproInfo?: any;
  semproProof?: any;
  logbooks: PenelitianLogbook[];
  resultFile?: string;
  finalSemproInfo?: any;
  finalSemproProof?: any;
  finalRevisionFile?: string;
  publication?: any;
}

export interface PenelitianLogbook {
  id: string;
  date: string;
  time: string;
  activity: string;
  note: string;
  photo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DosenDokumentasi {
  id: string;
  dosenId: string;
  jenisKarya: string;
  judul: string;
  tanggal: string;
  isbnIssn?: string;
  penulisTambahan?: string;
  penerbit: string;
  platform: 'REPOSITORY' | 'SISTER' | 'SINTA' | 'LAIN';
  fileUrl: string;
}

export const penelitianService = {
  getRegistrations: async (): Promise<PenelitianRegistration[]> => {
    const { data, error } = await supabase
      .from('penelitian_registrations')
      .select('*, profiles(full_name)');
    
    if (error) {
      console.error('Error fetching penelitian registrations:', error);
      return [];
    }

    return (data || []).map(r => ({
      ...r,
      dosenId: r.dosen_id,
      dosenName: r.profiles?.full_name || 'Dosen',
      logbooks: []
    }));
  },

  getRegistrationByDosen: async (dosenId: string): Promise<PenelitianRegistration | null> => {
    const { data, error } = await supabase
      .from('penelitian_registrations')
      .select('*, profiles(full_name)')
      .eq('dosen_id', dosenId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') console.error('Error fetching penelitian registration:', error);
      return null;
    }

    return {
      ...data,
      dosenId: data.dosen_id,
      dosenName: data.profiles?.full_name || 'Dosen',
      logbooks: []
    };
  },

  saveRegistration: async (reg: PenelitianRegistration) => {
    const { id, dosenId, dosenName, ...rest } = reg;
    const { error } = await supabase
      .from('penelitian_registrations')
      .upsert({ 
        id, 
        ...rest, 
        dosen_id: dosenId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  },
  
  getDokumentasi: async (dosenId?: string): Promise<DosenDokumentasi[]> => {
    let query = supabase.from('dosen_dokumentasi').select('*');
    if (dosenId) query = query.eq('dosen_id', dosenId);
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching dokumentasi:', error);
      return [];
    }
    return (data || []).map(d => ({
      ...d,
      dosenId: d.dosen_id
    }));
  },

  saveDokumentasi: async (doc: DosenDokumentasi) => {
    const { dosenId, ...rest } = doc;
    const { error } = await supabase
      .from('dosen_dokumentasi')
      .insert({ 
        ...rest, 
        dosen_id: dosenId 
      });
    if (error) throw error;
  }
};
