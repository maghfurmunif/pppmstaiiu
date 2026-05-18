
import { supabase } from '@/src/lib/supabase';
import { AcademicStatus } from './semproService';

export type PenelitianStatus = 
  | 'ENROLL' 
  | 'SUBMITTED' 
  | 'REJECTED' 
  | 'APPROVED' 
  | 'SEMPRO_SUBMITTED' 
  | 'PROGRESS' 
  | 'RESULT_SUBMITTED' 
  | 'RESULT_APPROVED'
  | 'REVISION_SUBMITTED'
  | 'PUBLICATION' 
  | 'COMPLETED';

export interface PenelitianRegistration {
  id: string;
  dosenId: string;
  dosenName: string;
  status: PenelitianStatus;
  rejectionReason?: string;
  proposalFile?: string;
  semproInfo?: {
    lokasi: string;
    tanggal: string;
    pukul: string;
    catatan?: string;
  };
  semproProof?: {
    dokumentasi: string[]; // min 3
    catatan: string; // min 1 photo
  };
  logbooks: PenelitianLogbook[];
  resultFile?: string;
  finalSemproInfo?: { // Research Seminar
    tanggal: string;
    pukul: string;
    lokasi: string;
    panelis: string;
    peserta: string;
    infoLain?: string;
  };
  finalSemproProof?: {
    dokumentasi: string[]; // min 3
    catatan: string; // min 1 photo
  };
  finalRevisionFile?: string;
  publication?: {
    type: 'MANDIRI' | 'PPPM';
    method?: string; // Jurnal, Buku, Prosiding, Lainnya
  };
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
    // Stage 1: Get registrations
    const { data: regs, error: regError } = await supabase
      .from('penelitian_registrations')
      .select('*');
    
    if (regError) {
      console.error('Error fetching penelitian registrations:', regError);
      return [];
    }

    if (!regs || regs.length === 0) return [];

    // Stage 2: Get profiles
    const dosenIds = Array.from(new Set(regs.map(r => r.dosen_id)));
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', dosenIds);

    const profileMap = (profiles || []).reduce((acc: any, p) => {
      acc[p.id] = p.full_name;
      return acc;
    }, {});

    return regs.map(r => ({
      ...r,
      dosenId: r.dosen_id,
      dosenName: profileMap[r.dosen_id] || 'Dosen Academic',
      logbooks: r.logbooks || [],
      semproInfo: r.sempro_info,
      semproProof: r.sempro_proof,
      finalSemproInfo: r.final_sempro_info,
      finalSemproProof: r.final_sempro_proof,
      resultFile: r.result_file,
      finalRevisionFile: r.final_revision_file,
      rejectionReason: r.rejection_reason,
      proposalFile: r.proposal_file
    }));
  },

  getRegistrationByDosen: async (dosenId: string): Promise<PenelitianRegistration | null> => {
    // Stage 1: Get registration
    const { data: reg, error: regError } = await supabase
      .from('penelitian_registrations')
      .select('*')
      .eq('dosen_id', dosenId)
      .maybeSingle();
    
    if (regError) {
      console.error('Error fetching penelitian registration:', regError);
      return null;
    }

    if (!reg) return null;

    // Stage 2: Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', dosenId)
      .maybeSingle();

    return {
      ...reg,
      dosenId: reg.dosen_id,
      dosenName: profile?.full_name || 'Dosen Academic',
      logbooks: reg.logbooks || [],
      semproInfo: reg.sempro_info,
      semproProof: reg.sempro_proof,
      finalSemproInfo: reg.final_sempro_info,
      finalSemproProof: reg.final_sempro_proof,
      resultFile: reg.result_file,
      finalRevisionFile: reg.final_revision_file,
      rejectionReason: reg.rejection_reason,
      proposalFile: reg.proposal_file
    };
  },

  saveRegistration: async (reg: PenelitianRegistration) => {
    const dbPayload: any = {
      dosen_id: reg.dosenId,
      status: reg.status,
      rejection_reason: reg.rejectionReason,
      proposal_file: reg.proposalFile,
      sempro_info: reg.semproInfo,
      sempro_proof: reg.semproProof,
      logbooks: reg.logbooks,
      result_file: reg.resultFile,
      final_sempro_info: reg.finalSemproInfo,
      final_sempro_proof: reg.finalSemproProof,
      final_revision_file: reg.finalRevisionFile,
      publication: reg.publication,
      updated_at: new Date().toISOString()
    };

    if (reg.id && reg.id.length > 20) {
      dbPayload.id = reg.id;
    }

    const { error } = await supabase
      .from('penelitian_registrations')
      .upsert(dbPayload, { onConflict: 'dosen_id' });

    if (error) {
       console.error('Penelitian Upsert Error:', error);
       throw error;
    }
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
      id: d.id,
      dosenId: d.dosen_id,
      jenisKarya: d.jenis_karya,
      judul: d.judul,
      tanggal: d.tanggal,
      isbnIssn: d.isbn_issn,
      penulisTambahan: d.penulis_tambahan,
      penerbit: d.penerbit,
      platform: d.platform,
      fileUrl: d.file_url
    }));
  },

  saveDokumentasi: async (doc: DosenDokumentasi) => {
    const dbPayload = {
      id: doc.id,
      dosen_id: doc.dosenId,
      jenis_karya: doc.jenisKarya,
      judul: doc.judul,
      tanggal: doc.tanggal,
      isbn_issn: doc.isbnIssn,
      penulis_tambahan: doc.penulisTambahan,
      penerbit: doc.penerbit,
      platform: doc.platform,
      file_url: doc.fileUrl
    };
    const { error } = await supabase
      .from('dosen_dokumentasi')
      .upsert(dbPayload);
    if (error) throw error;
  }
};
