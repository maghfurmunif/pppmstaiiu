
import { supabase } from '@/src/lib/supabase';

export type NodeType = 'ULAMA' | 'PESANTREN' | 'KITAB' | 'MANUSKRIP' | 'KOTA' | 'ORGANISASI';
export type EdgeType = 'BELAJAR_KEPADA' | 'MENGAJAR' | 'MENYALIN' | 'MEMILIKI' | 'MEMBERI_IJAZAH' | 'BAIAT' | 'ALUMNI';

export interface SanadNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  metadata?: any; // For Ulama: birth/death, For Kitab: author, etc.
  photo?: string;
  location?: [number, number];
}

export interface SanadEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  description?: string;
  sourceRef?: string; // Reference to text/manuscript/history
}

export const sanadService = {
  getNodes: async (): Promise<SanadNode[]> => {
    const { data, error } = await supabase.from('sanad_nodes').select('*');
    if (error) {
      console.error('Error fetching sanad nodes:', error);
      return [];
    }
    return data || [];
  },

  getEdges: async (): Promise<SanadEdge[]> => {
    const { data, error } = await supabase.from('sanad_edges').select('*');
    if (error) {
      console.error('Error fetching sanad edges:', error);
      return [];
    }
    return data || [];
  },

  getNodeDetails: async (id: string): Promise<SanadNode | null> => {
    const { data, error } = await supabase.from('sanad_nodes').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  getPathsToHaromain: async (startNodeId: string): Promise<SanadEdge[][]> => {
    // This would be a BFS/DFS on the edges to find paths to nodes with metadata.isHaromain = true
    // For now, mock or implement basic traversal if data is small
    return [];
  },

  // Seed initial data for Qomaruddin
  seedInitialData: async () => {
    // Check if empty
    const { count } = await supabase.from('sanad_nodes').select('*', { count: 'exact', head: true });
    if (count && count > 0) return;

    const qomaruddinId = crypto.randomUUID();
    const nodes: Omit<SanadNode, 'id'>[] = [
      { name: 'Pondok Qomaruddin', type: 'PESANTREN', description: 'Titik awal sanad di Gresik.' },
      { name: 'Kiai Qomaruddin', type: 'ULAMA', description: 'Pendiri Pondok Qomaruddin.' },
    ];

    // Implementation of seed would go here if needed via tool
  }
};
