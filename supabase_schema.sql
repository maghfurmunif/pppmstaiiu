-- Seed Admin User
-- Replace with actual UUID and email provided
-- UUID: f73b5da8-b142-4f01-8b38-31a54e9d4561
-- Email: maghfurmunif@gmail.com

-- Note: In a real Supabase environment, you would usually create the user via the Auth UI or edge functions.
-- This SQL is for the public.profiles table to ensure the user has 'admin' role.

INSERT INTO public.profiles (id, email, name, role)
VALUES ('f73b5da8-b142-4f01-8b38-31a54e9d4561', 'maghfurmunif@gmail.com', 'Admin Maghfur', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- RLS Policies for Supabase

-- Profiles: Users can read their own profile, admins can read all.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- KKN Registrations
ALTER TABLE public.kkn_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own KKN" ON public.kkn_registrations FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Admins can manage all KKN" ON public.kkn_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Sempro Registrations
ALTER TABLE public.sempro_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own Sempro" ON public.sempro_registrations FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Admins can manage all Sempro" ON public.sempro_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Skripsi Registrations
ALTER TABLE public.skripsi_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own Skripsi" ON public.skripsi_registrations FOR ALL USING (auth.uid()::text = student_id);
CREATE POLICY "Admins can manage all Skripsi" ON public.skripsi_registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
