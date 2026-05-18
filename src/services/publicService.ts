import { supabase } from '@/src/lib/supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  tag: string;
  created_at: string;
}

export interface Guide {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

export const publicService = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
       console.error('Error fetching announcements:', error);
       return [];
    }
    return data || [];
  },

  saveAnnouncement: async (ann: Partial<Announcement>) => {
    const { error } = await supabase
      .from('announcements')
      .upsert(ann);
    if (error) throw error;
  },

  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getGuides: async (): Promise<Guide[]> => {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
       console.error('Error fetching guides:', error);
       return [];
    }
    return data || [];
  },

  saveGuide: async (guide: Partial<Guide>) => {
    const { error } = await supabase
      .from('guides')
      .upsert(guide);
    if (error) throw error;
  },

  deleteGuide: async (id: string) => {
    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getGlobalStats: async () => {
    const [penelitian, sempro, skripsi, kkn, profiles] = await Promise.all([
      supabase.from('penelitian_registrations').select('id', { count: 'exact', head: true }),
      supabase.from('sempro_registrations').select('id', { count: 'exact', head: true }),
      supabase.from('skripsi_registrations').select('id', { count: 'exact', head: true }),
      supabase.from('kkn_registrations').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id, role')
    ]);

    const activeUsers = profiles.data?.length || 0;
    const dosenCount = profiles.data?.filter(p => p.role === 'DOSEN').length || 0;
    const mahasiswaCount = profiles.data?.filter(p => p.role === 'MAHASISWA').length || 0;

    return {
      penelitian: penelitian.count || 0,
      sempro: sempro.count || 0,
      skripsi: skripsi.count || 0,
      kkn: kkn.count || 0,
      totalActivity: (penelitian.count || 0) + (sempro.count || 0) + (skripsi.count || 0) + (kkn.count || 0),
      activeUsers,
      dosenCount,
      mahasiswaCount
    };
  }
};
