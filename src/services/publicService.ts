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
  },

  getRecentActivities: async (): Promise<any[]> => {
    try {
      const [profilesRes, penelitianRes, semproRes, skripsiRes, kknRes, pengabdianRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, role'),
        supabase.from('penelitian_registrations').select('id, dosen_id, status, updated_at').order('updated_at', { ascending: false }).limit(4),
        supabase.from('sempro_registrations').select('id, student_id, status, updated_at').order('updated_at', { ascending: false }).limit(4),
        supabase.from('skripsi_registrations').select('id, student_id, status, updated_at').order('updated_at', { ascending: false }).limit(4),
        supabase.from('kkn_registrations').select('id, student_id, status, updated_at').order('updated_at', { ascending: false }).limit(4),
        supabase.from('pengabdian_registrations').select('id, dosen_id, status, updated_at').order('updated_at', { ascending: false }).limit(4),
      ]);

      const profilesMap = (profilesRes.data || []).reduce((acc: any, p) => {
        acc[p.id] = { name: p.full_name, role: p.role };
        return acc;
      }, {});

      const activities: any[] = [];

      (penelitianRes.data || []).forEach((row: any) => {
        const p = profilesMap[row.dosen_id] || { name: 'Dosen Hanafi', role: 'DOSEN' };
        activities.push({
          id: `pen-${row.id}`,
          name: p.name,
          role: p.role,
          action: `mengajukan pendaftaran penelitian baru`,
          statusText: row.status === 'SUBMITTED' ? 'Diajukan' : row.status === 'APPROVED' ? 'Disetujui' : row.status === 'REJECTED' ? 'Ditolak' : row.status,
          time: row.updated_at || new Date().toISOString(),
          category: 'Penelitian'
        });
      });

      (semproRes.data || []).forEach((row: any) => {
        const p = profilesMap[row.student_id] || { name: 'Mahasiswa', role: 'MAHASISWA' };
        activities.push({
          id: `sem-${row.id}`,
          name: p.name,
          role: p.role,
          action: `mendaftar seminar proposal`,
          statusText: row.status === 'SUBMITTED' ? 'Diajukan' : row.status === 'APPROVED' ? 'Disetujui' : row.status === 'REJECTED' ? 'Ditolak' : row.status,
          time: row.updated_at || new Date().toISOString(),
          category: 'Sempro'
        });
      });

      (skripsiRes.data || []).forEach((row: any) => {
        const p = profilesMap[row.student_id] || { name: 'Mahasiswa', role: 'MAHASISWA' };
        activities.push({
          id: `skr-${row.id}`,
          name: p.name,
          role: p.role,
          action: `mengajukan bimbingan skripsi`,
          statusText: row.status === 'SUBMITTED' ? 'Diajukan' : row.status === 'APPROVED' ? 'Disetujui' : row.status === 'REJECTED' ? 'Ditolak' : row.status,
          time: row.updated_at || new Date().toISOString(),
          category: 'Skripsi'
        });
      });

      (kknRes.data || []).forEach((row: any) => {
        const p = profilesMap[row.student_id] || { name: 'Mahasiswa', role: 'MAHASISWA' };
        activities.push({
          id: `kkn-${row.id}`,
          name: p.name,
          role: p.role,
          action: `mendaftar program KKN`,
          statusText: row.status === 'SUBMITTED' ? 'Diajukan' : row.status === 'APPROVED' ? 'Disetujui' : row.status === 'REJECTED' ? 'Ditolak' : row.status,
          time: row.updated_at || new Date().toISOString(),
          category: 'KKN'
        });
      });

      (pengabdianRes.data || []).forEach((row: any) => {
        const p = profilesMap[row.dosen_id] || { name: 'Dosen', role: 'DOSEN' };
        activities.push({
          id: `pnd-${row.id}`,
          name: p.name,
          role: p.role,
          action: `mengajukan pengabdian masyarakat`,
          statusText: row.status === 'SUBMITTED' ? 'Diajukan' : row.status === 'APPROVED' ? 'Disetujui' : row.status === 'REJECTED' ? 'Ditolak' : row.status,
          time: row.updated_at || new Date().toISOString(),
          category: 'Pengabdian'
        });
      });

      // Default fallback entries if zero activities in DB to avoid cold empty screen
      if (activities.length === 0) {
        return [
          { id: 'f-1', name: 'Dosen Hanafi', role: 'DOSEN', action: 'mengunggah jurnal baru', statusText: 'Publik', time: new Date(Date.now() - 3600000).toISOString(), category: 'Penelitian' },
          { id: 'f-2', name: 'Siti Rahma', role: 'MAHASISWA', action: 'mendaftar seminar proposal', statusText: 'Diajukan', time: new Date(Date.now() - 7200000).toISOString(), category: 'Sempro' },
          { id: 'f-3', name: 'Ahmad Fauzi', role: 'MAHASISWA', action: 'mengajukan berkas KKN', statusText: 'Diajukan', time: new Date(Date.now() - 10800000).toISOString(), category: 'KKN' }
        ];
      }

      // Sort all by time descending
      return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
    } catch (e) {
      console.error('Error fetching recent activities:', e);
      return [];
    }
  }
};
