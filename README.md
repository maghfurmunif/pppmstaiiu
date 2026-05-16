# Portal Akademik STAI Ihyaul Ulum

Aplikasi portal akademik untuk mahasiswa (KKN, Sempro, Skripsi) dan manajemen admin.

## Persiapan Lokal (Local Deployment)

Ikuti langkah-langkah berikut untuk menjalankan aplikasi di komputer Anda:

### 1. Prasyarat
- Pastikan Anda sudah menginstal **Node.js** (versi 18 atau lebih baru).
- Pastikan Anda memiliki akun **Supabase**, **Cloudinary**, dan API Key **Google Gemini**.

### 2. Instalasi
1. Ekspor kode dari AI Studio (Download ZIP).
2. Buka terminal di folder proyek tersebut.
3. Jalankan perintah:
   ```bash
   npm install
   ```
   *Catatan: Anda mungkin melihat peringatan tentang `node-domexception`. Peringatan ini bersifat informatif (deprecation warning) dari pustaka pihak ketiga and tidak akan mengganggu fungsi aplikasi.*

### 3. Konfigurasi Environment
1. Buat file baru bernama `.env` di folder root (seperti `.env.example`).
2. Masukkan kunci API Anda:
   ```env
   # Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key

   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Cloudinary Configuration
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

   # Admin Email
   VITE_ADMIN_EMAIL="maghfurmunif@gmail.com"
   ```

### 4. Menjalankan Aplikasi
Untuk mode pengembangan:
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

Untuk mode produksi (Build):
```bash
npm run build
npm run preview
```

## Fitur Utama
- **Dashboard Mahasiswa:** Monitoring KKN, Seminar Proposal, dan Skripsi.
- **Logbook Digital:** Pelaporan aktivitas harian dengan foto.
- **Verifikasi Admin:** Manajemen pendaftaran dan validasi berkas.
- **AI Integration:** Bantuan analisis atau asisten akademik.
