
-- FIX SKRIPSI REGISTRATIONS
CREATE TABLE IF NOT EXISTS skripsi_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'ENROLL',
    student_name TEXT,
    registration_docs JSONB DEFAULT '{}',
    logbooks JSONB DEFAULT '[]',
    advisor JSONB DEFAULT NULL,
    exam_schedule JSONB DEFAULT NULL,
    grades JSONB DEFAULT NULL,
    rejection_reason TEXT,
    total_hours NUMERIC DEFAULT 0, -- Some users seem to expect this here too
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure registration_docs column exists if table was already there
ALTER TABLE skripsi_registrations ADD COLUMN IF NOT EXISTS registration_docs JSONB DEFAULT '{}';
ALTER TABLE skripsi_registrations ADD COLUMN IF NOT EXISTS total_hours NUMERIC DEFAULT 0;

-- Ensure UNIQUE constraint for ON CONFLICT (student_id)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skripsi_registrations_student_id_key') THEN
        ALTER TABLE skripsi_registrations ADD CONSTRAINT skripsi_registrations_student_id_key UNIQUE (student_id);
    END IF;
END $$;


-- FIX KKN REGISTRATIONS
CREATE TABLE IF NOT EXISTS kkn_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL, -- REGULER or MANDIRI
    status TEXT NOT NULL DEFAULT 'ENROLL',
    student_name TEXT,
    docs JSONB DEFAULT '{}',
    info JSONB DEFAULT '{}',
    survey_docs JSONB DEFAULT '{}',
    rkl JSONB DEFAULT '{}',
    deployment JSONB DEFAULT '{}',
    logbooks JSONB DEFAULT '[]',
    total_hours NUMERIC DEFAULT 0,
    lpk JSONB DEFAULT '{}',
    grades JSONB DEFAULT '{}',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure total_hours column exists
ALTER TABLE kkn_registrations ADD COLUMN IF NOT EXISTS total_hours NUMERIC DEFAULT 0;

-- Ensure UNIQUE constraint for ON CONFLICT (student_id, type)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kkn_registrations_student_id_type_key') THEN
        ALTER TABLE kkn_registrations ADD CONSTRAINT kkn_registrations_student_id_type_key UNIQUE (student_id, type);
    END IF;
END $$;


-- FIX SEMPRO REGISTRATIONS
CREATE TABLE IF NOT EXISTS sempro_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'ENROLL',
    student_name TEXT,
    proposal_file TEXT,
    schedule JSONB DEFAULT NULL,
    grades JSONB DEFAULT NULL,
    logbooks JSONB DEFAULT '[]',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure proposal_file column exists (some code used proposalFile)
ALTER TABLE sempro_registrations ADD COLUMN IF NOT EXISTS proposal_file TEXT;

-- Ensure UNIQUE constraint for ON CONFLICT (student_id)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sempro_registrations_student_id_key') THEN
        ALTER TABLE sempro_registrations ADD CONSTRAINT sempro_registrations_student_id_key UNIQUE (student_id);
    END IF;
END $$;


-- FIX PENELITIAN REGISTRATIONS
CREATE TABLE IF NOT EXISTS penelitian_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dosen_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'ENROLL',
    rejection_reason TEXT,
    proposal_file TEXT,
    sempro_info JSONB DEFAULT '{}',
    sempro_proof JSONB DEFAULT '{}',
    logbooks JSONB DEFAULT '[]',
    result_file TEXT,
    final_sempro_info JSONB DEFAULT '{}',
    final_sempro_proof JSONB DEFAULT '{}',
    final_revision_file TEXT,
    publication JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure UNIQUE constraint for ON CONFLICT (dosen_id)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'penelitian_registrations_dosen_id_key') THEN
        ALTER TABLE penelitian_registrations ADD CONSTRAINT penelitian_registrations_dosen_id_key UNIQUE (dosen_id);
    END IF;
END $$;


-- FIX DOSEN DOKUMENTASI
CREATE TABLE IF NOT EXISTS dosen_dokumentasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dosen_id UUID NOT NULL REFERENCES auth.users(id),
    jenis_karya TEXT,
    judul TEXT,
    tanggal TEXT,
    isbn_issn TEXT,
    penulis_tambahan TEXT,
    penerbit TEXT,
    platform TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all profiles exist for test users (optional, but helps development)
-- INSERT INTO profiles (id, full_name, role)
-- SELECT id, email as full_name, 'MAHASISWA' FROM auth.users ON CONFLICT (id) DO NOTHING;
