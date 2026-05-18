-- MIGRASI DATABASE v3 --
-- Jalankan query ini di SQL Editor Supabase Anda --

-- 1. KKN Registrations
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS total_hours NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS survey_docs JSONB;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS rkl JSONB;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS deployment JSONB;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS logbooks JSONB DEFAULT '[]';
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS lpk JSONB;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS grades JSONB;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE IF EXISTS kkn_registrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kkn_registrations_student_id_type_key') THEN
        ALTER TABLE kkn_registrations ADD CONSTRAINT kkn_registrations_student_id_type_key UNIQUE (student_id, type);
    END IF;
END $$;

-- 2. Seminar Proposal Registrations
CREATE TABLE IF NOT EXISTS sempro_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    status TEXT DEFAULT 'ENROLL',
    rejection_reason TEXT,
    proposal_file TEXT,
    schedule JSONB,
    proof JSONB,
    grade TEXT,
    post_seminar JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sempro_registrations_student_id_key') THEN
        ALTER TABLE sempro_registrations ADD CONSTRAINT sempro_registrations_student_id_key UNIQUE (student_id);
    END IF;
END $$;

-- 3. Skripsi Registrations
CREATE TABLE IF NOT EXISTS skripsi_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    status TEXT DEFAULT 'ENROLL',
    rejection_reason TEXT,
    registration_docs JSONB,
    advisor JSONB,
    logbooks JSONB DEFAULT '[]',
    final_docs JSONB,
    exam_schedule JSONB,
    after_exam_docs JSONB,
    grades JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'skripsi_registrations_student_id_key') THEN
        ALTER TABLE skripsi_registrations ADD CONSTRAINT skripsi_registrations_student_id_key UNIQUE (student_id);
    END IF;
END $$;

-- 4. Penelitian Dosen
CREATE TABLE IF NOT EXISTS penelitian_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dosen_id UUID NOT NULL,
    status TEXT DEFAULT 'ENROLL',
    rejection_reason TEXT,
    proposal_file TEXT,
    sempro_info JSONB,
    sempro_proof JSONB,
    logbooks JSONB DEFAULT '[]',
    result_file TEXT,
    final_sempro_info JSONB,
    final_sempro_proof JSONB,
    final_revision_file TEXT,
    publication JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'penelitian_registrations_dosen_id_key') THEN
        ALTER TABLE penelitian_registrations ADD CONSTRAINT penelitian_registrations_dosen_id_key UNIQUE (dosen_id);
    END IF;
END $$;

-- 5. Dokumentasi Dosen
CREATE TABLE IF NOT EXISTS dosen_dokumentasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dosen_id UUID NOT NULL,
    jenis_karya TEXT,
    judul TEXT,
    tanggal DATE,
    isbn_issn TEXT,
    penulis_tambahan TEXT,
    penerbit TEXT,
    platform TEXT,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pengabdian Dosen
CREATE TABLE IF NOT EXISTS pengabdian_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dosen_id UUID NOT NULL,
    status TEXT DEFAULT 'SUBMITTED',
    rejection_reason TEXT,
    docs JSONB,
    info JSONB,
    total_hours NUMERIC DEFAULT 0,
    logbooks JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pengabdian_registrations_dosen_id_key') THEN
        ALTER TABLE pengabdian_registrations ADD CONSTRAINT pengabdian_registrations_dosen_id_key UNIQUE (dosen_id);
    END IF;
END $$;

-- 7. Memastikan kolom case-sensitive teratasi (hanya jika tabel lama masih menggunakan camelCase)
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE kkn_registrations RENAME COLUMN "totalHours" TO total_hours;
    EXCEPTION WHEN others THEN END;
    BEGIN
        ALTER TABLE sempro_registrations RENAME COLUMN "proposalFile" TO proposal_file;
    EXCEPTION WHEN others THEN END;
    BEGIN
        ALTER TABLE skripsi_registrations RENAME COLUMN "registrationDocs" TO registration_docs;
    EXCEPTION WHEN others THEN END;
END $$;
