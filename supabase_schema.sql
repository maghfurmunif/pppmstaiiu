
-- Supabase Schema for PPPM STAI Ihyaul Ulum Portal
-- Generated for Cloudflare Deployment Compatibility

-- 1. PROFILES (Extension of auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('MAHASISWA', 'DOSEN', 'ADMIN')),
  nim_nidn TEXT UNIQUE,
  jurusan TEXT,
  fakultas TEXT,
  semester INT,
  nomor_sk_yayasan TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. KKN REGISTRATIONS
CREATE TABLE kkn_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('REGULER', 'MANDIRI')),
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  docs JSONB, -- Stores file URLs and verification status
  info JSONB, -- Stores location, group, DPL info
  grades JSONB, -- Stores final scores
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for KKN
ALTER TABLE kkn_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students see own KKN" 
ON kkn_registrations FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Admins see all KKN" 
ON kkn_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 3. LOGBOOKS (Universal for KKN, Penelitian, Pengabdian)
CREATE TABLE logbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  parent_id UUID NOT NULL, -- Link to KKN/Penelitian/Pengabdian ID
  parent_type TEXT NOT NULL CHECK (parent_type IN ('KKN', 'PENELITIAN', 'PENGABDIAN')),
  date DATE NOT NULL,
  hours NUMERIC(4,2),
  activity TEXT NOT NULL,
  pihak_desa TEXT, -- For KKN/Pengabdian
  status_desa TEXT DEFAULT 'PENDING',
  admin_status TEXT DEFAULT 'PENDING',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Logbooks
ALTER TABLE logbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own logbooks" 
ON logbooks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all logbooks" 
ON logbooks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 4. PENELITIAN (Research)
CREATE TABLE penelitian_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dosen_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  proposal_url TEXT,
  sempro_info JSONB,
  final_result_url TEXT,
  publication_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PENGABDIAN (Community Service)
CREATE TABLE pengabdian_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dosen_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  docs JSONB,
  info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Dosen Activities
ALTER TABLE penelitian_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengabdian_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dosen manage own research" ON penelitian_registrations FOR ALL USING (auth.uid() = dosen_id);
CREATE POLICY "Dosen manage own service" ON pengabdian_registrations FOR ALL USING (auth.uid() = dosen_id);
CREATE POLICY "Admin manage all research" ON penelitian_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- 6. DOKUMENTASI (Repository)
CREATE TABLE dokumentasi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dosen_id UUID REFERENCES profiles(id) NOT NULL,
  judul TEXT NOT NULL,
  jenis_karya TEXT NOT NULL,
  platform TEXT NOT NULL,
  file_url TEXT NOT NULL,
  tanggal DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE dokumentasi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can see documentation" ON dokumentasi FOR SELECT USING (true);
CREATE POLICY "Dosen manage own docs" ON dokumentasi FOR ALL USING (auth.uid() = dosen_id);

-- trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_kkn_updated_at BEFORE UPDATE ON kkn_registrations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
