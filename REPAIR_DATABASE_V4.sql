-- REPAIR DATABASE v4 --
-- Jalankan query ini di SQL Editor Supabase --

-- 1. SEMINAR PROPOSAL FIXES
ALTER TABLE IF EXISTS sempro_registrations ADD COLUMN IF NOT EXISTS proof JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS sempro_registrations ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE IF EXISTS sempro_registrations ADD COLUMN IF NOT EXISTS post_seminar JSONB DEFAULT '{}';

-- Fix constraints for sempro
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sempro_registrations_student_id_key') THEN
        ALTER TABLE sempro_registrations ADD CONSTRAINT sempro_registrations_student_id_key UNIQUE (student_id);
    END IF;
END $$;


-- 2. PENELITIAN DOSEN FIXES
-- Ensure all columns exist
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS proposal_file TEXT;
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS sempro_info JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS sempro_proof JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS logbooks JSONB DEFAULT '[]';
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS result_file TEXT;
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS final_sempro_info JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS final_sempro_proof JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS final_revision_file TEXT;
ALTER TABLE IF EXISTS penelitian_registrations ADD COLUMN IF NOT EXISTS publication JSONB DEFAULT '{}';

-- Ensure Foreign Key to Profiles exists for easy joining
DO $$ 
BEGIN 
    -- First remove old reference if it points to auth.users (some versions did)
    -- This is optional but cleaner for joining with 'profiles' table
    ALTER TABLE penelitian_registrations DROP CONSTRAINT IF EXISTS penelitian_registrations_dosen_id_fkey;
    ALTER TABLE penelitian_registrations ADD CONSTRAINT penelitian_registrations_dosen_id_fkey 
    FOREIGN KEY (dosen_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN
    -- If profiles doesn't exist or other error, just ignore
END $$;


-- 3. DOSEN DOKUMENTASI FIXES
ALTER TABLE IF EXISTS dosen_dokumentasi ALTER COLUMN tanggal TYPE TEXT;


-- 4. SKRIPSI FIXES (Just in case)
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS registration_docs JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS advisor JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS logbooks JSONB DEFAULT '[]';
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS final_docs JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS exam_schedule JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS after_exam_docs JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS skripsi_registrations ADD COLUMN IF NOT EXISTS grades JSONB DEFAULT '{}';

-- REFRESH PostgREST Cache (Penting!)
-- Di beberapa versi Supabase, Anda mungkin perlu melakukan restart or reload
-- Tapi biasanya menjalankan DDL sudah cukup memperbarui cache.
