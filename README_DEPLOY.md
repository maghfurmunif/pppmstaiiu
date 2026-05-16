
# Deployment Guide: Cloudflare Pages via GitHub

Aplikasi ini sudah siap untuk dideploy ke **Cloudflare Pages**. 
Ikuti langkah-langkah berikut untuk integrasi otomatis (CI/CD) via GitHub:

## 1. Persiapan GitHub
1. Buat repository baru di GitHub.
2. Push source code ini ke repository tersebut:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO_NAME.git
   git push -u origin main
   ```

## 2. Konfigurasi Cloudflare Pages
1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Pergi ke **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Pilih repository Anda.
4. Gunakan pengaturan build berikut:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Klik **Save and Deploy**.

## 3. Variabel Lingkungan (Environment Variables)
Jika Anda menggunakan Supabase atau API eksternal, tambahkan di tab **Settings** > **Environment variables** di dashboard Cloudflare Pages:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (Untuk fitur AI jika ada)

## 4. Tips Cloudflare compatibility
Jangan lupa tambahkan file `_redirects` di folder `public/` (atau pastikan Vite menyertakannya) agar routing SPA (Single Page Application) berjalan lancar saat di-refresh:
```
/*    /index.html   200
```

*Dibuat oleh Tim AI Studio Build.*
