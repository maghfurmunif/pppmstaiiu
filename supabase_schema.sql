-- Reset everything
DROP TABLE IF EXISTS public.kkn_registrations CASCADE;
DROP TABLE IF EXISTS public.sempro_registrations CASCADE;
DROP TABLE IF EXISTS public.skripsi_registrations CASCADE;
DROP TABLE IF EXISTS public.penelitian_registrations CASCADE;
DROP TABLE IF EXISTS public.pengabdian_registrations CASCADE;
DROP TABLE IF EXISTS public.dosen_dokumentasi CASCADE;
DROP TABLE IF EXISTS public.logbooks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table (Linked to Auth.Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'MAHASISWA',
  avatar_url TEXT,
  nim_nidn TEXT,
  jurusan TEXT,
  fakultas TEXT,
  semester INTEGER,
  nomor_sk_yayasan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KKN Registrations
CREATE TABLE public.kkn_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  type TEXT CHECK (type IN ('REGULER', 'MANDIRI')),
  status TEXT,
  "rejectionReason" TEXT,
  docs JSONB DEFAULT '{}'::jsonb,
  info JSONB DEFAULT '{}'::jsonb,
  "surveyDocs" JSONB DEFAULT '{}'::jsonb,
  rkl JSONB DEFAULT '{}'::jsonb,
  deployment JSONB DEFAULT '{}'::jsonb,
  logbooks JSONB DEFAULT '[]'::jsonb,
  "totalHours" INTEGER DEFAULT 0,
  lpk JSONB DEFAULT '{}'::jsonb,
  grades JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sempro Registrations
CREATE TABLE public.sempro_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT,
  "rejectionReason" TEXT,
  "proposalFile" TEXT,
  schedule JSONB DEFAULT '{}'::jsonb,
  proof JSONB DEFAULT '{}'::jsonb,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Skripsi Registrations
CREATE TABLE public.skripsi_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT,
  "rejectionReason" TEXT,
  "registrationDocs" JSONB DEFAULT '{}'::jsonb,
  advisor JSONB DEFAULT '{}'::jsonb,
  logbooks JSONB DEFAULT '[]'::jsonb,
  "finalDocs" JSONB DEFAULT '{}'::jsonb,
  "examSchedule" JSONB DEFAULT '{}'::jsonb,
  "afterExamDocs" JSONB DEFAULT '{}'::jsonb,
  grades JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Penelitian Registrations
CREATE TABLE public.penelitian_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT,
  "rejectionReason" TEXT,
  "proposalFile" TEXT,
  "semproInfo" JSONB DEFAULT '{}'::jsonb,
  "semproProof" JSONB DEFAULT '{}'::jsonb,
  logbooks JSONB DEFAULT '[]'::jsonb,
  "resultFile" TEXT,
  "finalSemproInfo" JSONB DEFAULT '{}'::jsonb,
  "finalSemproProof" JSONB DEFAULT '{}'::jsonb,
  "finalRevisionFile" TEXT,
  publication JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pengabdian Registrations
CREATE TABLE public.pengabdian_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT,
  "rejectionReason" TEXT,
  docs JSONB DEFAULT '{}'::jsonb,
  info JSONB DEFAULT '{}'::jsonb,
  "totalHours" INTEGER DEFAULT 0,
  logbooks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Dosen Dokumentasi
CREATE TABLE public.dosen_dokumentasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dosen_id UUID NOT NULL REFERENCES public.profiles(id),
  "jenisKarya" TEXT,
  judul TEXT,
  tanggal TEXT,
  "isbnIssn" TEXT,
  "penulisTambahan" TEXT,
  penerbit TEXT,
  platform TEXT,
  "fileUrl" TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Activity Logbooks (Generic logs for students)
CREATE TABLE public.logbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  activity TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kkn_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sempro_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skripsi_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penelitian_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengabdian_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosen_dokumentasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logbooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Create a security definer function to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND UPPER(role) = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- KKN
CREATE POLICY "Users view own KKN" ON public.kkn_registrations FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Users insert own KKN" ON public.kkn_registrations FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Users update own KKN" ON public.kkn_registrations FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Admins manage KKN" ON public.kkn_registrations FOR ALL USING (public.is_admin());

-- Sempro
CREATE POLICY "Users manage own Sempro" ON public.sempro_registrations FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admins manage Sempro" ON public.sempro_registrations FOR ALL USING (public.is_admin());

-- Skripsi
CREATE POLICY "Users manage own Skripsi" ON public.skripsi_registrations FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admins manage Skripsi" ON public.skripsi_registrations FOR ALL USING (public.is_admin());

-- Penelitian
CREATE POLICY "Users manage own Penelitian" ON public.penelitian_registrations FOR ALL USING (dosen_id = auth.uid());
CREATE POLICY "Admins manage Penelitian" ON public.penelitian_registrations FOR ALL USING (public.is_admin());

-- Pengabdian
CREATE POLICY "Users manage own Pengabdian" ON public.pengabdian_registrations FOR ALL USING (dosen_id = auth.uid());
CREATE POLICY "Admins manage Pengabdian" ON public.pengabdian_registrations FOR ALL USING (public.is_admin());

-- Dosen Dokumentasi
CREATE POLICY "Users manage own Dokumentasi" ON public.dosen_dokumentasi FOR ALL USING (dosen_id = auth.uid());
CREATE POLICY "Admins manage Dokumentasi" ON public.dosen_dokumentasi FOR ALL USING (public.is_admin());

-- Logbooks
CREATE POLICY "Users manage own logbooks" ON public.logbooks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins manage logbooks" ON public.logbooks FOR ALL USING (public.is_admin());
