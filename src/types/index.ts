export type UserRole = 'MAHASISWA' | 'DOSEN' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  nim?: string; // For Mahasiswa
  nidn?: string; // For Dosen
  jurusan?: string;
  fakultas?: string;
  semester?: number;
  nomorYayasan?: string; // For Dosen
  createdAt: string;
}

export type StatusKKN = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ONGOING' | 'COMPLETED';

export interface KKNRegistration {
  id: string;
  userId: string;
  type: 'REGULER' | 'MANDIRI';
  files: {
    transkrip: string;
    pembayaran: string;
    krs: string;
    kesehatan: string;
    pasFoto: string;
    pernyataan: string;
    izinOrtu: string;
  };
  status: StatusKKN;
  rejectionReason?: string;
  adminNote?: string;
  info?: {
    lokasi: string;
    tanggalBerangkat: string;
    tanggalPulang: string;
    dpl: string;
    kelompok: string;
    tanggalSosialisasi: string;
    lokasiSosialisasi: string;
  };
  createdAt: string;
}

export interface LogbookEntry {
  id: string;
  relatedId: string; // KKN ID or Skripsi ID
  date: string;
  location?: string;
  activityName: string;
  activityType?: 'INDIVIDU' | 'KELOMPOK';
  partiesInvolved?: string;
  partyStatus?: string;
  startTime?: string;
  endTime?: string;
  photos: string[];
  scanLogbook?: string;
  impactCount?: number; // For KKN Mandiri
  comment?: string; // For Skripsi/Research
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}
