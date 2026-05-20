/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';
import LandingPage from '@/src/pages/LandingPage';
import LoginPage from '@/src/pages/auth/LoginPage';
import RegisterPage from '@/src/pages/auth/RegisterPage';
import PengumumanPage from '@/src/pages/public/PengumumanPage';
import StatistikPage from '@/src/pages/public/StatistikPage';
import PanduanPage from '@/src/pages/public/PanduanPage';

// Lazy loading for dashboard routes to prevent "bottleneck" as requested
const MahasiswaDashboard = lazy(() => import('@/src/pages/dashboard/mahasiswa/MahasiswaDashboard'));
const DosenDashboard = lazy(() => import('@/src/pages/dashboard/dosen/DosenDashboard'));
const AdminDashboard = lazy(() => import('@/src/pages/dashboard/admin/AdminDashboard'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" richColors />
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<div className="flex items-center justify-center h-screen italic font-black text-slate-300">Loading Portal...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/pengumuman" element={<PengumumanPage />} />
              <Route path="/statistik" element={<StatistikPage />} />
              <Route path="/panduan" element={<PanduanPage />} />
              
              {/* Dashboard Routes with nested dynamic routing as requested */}
              <Route 
                path="/dashboard/mahasiswa/*" 
                element={
                  localStorage.getItem('user_role')?.toUpperCase() === 'MAHASISWA' && localStorage.getItem('user_id')
                    ? <MahasiswaDashboard /> 
                    : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/dashboard/dosen/*" 
                element={
                  localStorage.getItem('user_role')?.toUpperCase() === 'DOSEN' && localStorage.getItem('user_id')
                    ? <DosenDashboard /> 
                    : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/dashboard/admin/*" 
                element={
                  localStorage.getItem('user_role')?.toUpperCase() === 'ADMIN' && localStorage.getItem('user_id')
                    ? <AdminDashboard /> 
                    : <Navigate to="/login" replace />
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
