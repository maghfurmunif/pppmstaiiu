/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from '@/src/components/layout/Navbar';
import LandingPage from '@/src/pages/LandingPage';
import LoginPage from '@/src/pages/auth/LoginPage';
import RegisterPage from '@/src/pages/auth/RegisterPage';

// Lazy loading for dashboard routes to prevent "bottleneck" as requested
const MahasiswaDashboard = lazy(() => import('@/src/pages/dashboard/mahasiswa/MahasiswaDashboard'));
const DosenDashboard = lazy(() => import('@/src/pages/dashboard/dosen/DosenDashboard'));
const AdminDashboard = lazy(() => import('@/src/pages/dashboard/admin/AdminDashboard'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Dashboard Routes with nested dynamic routing as requested */}
              <Route 
                path="/dashboard/mahasiswa/*" 
                element={
                  localStorage.getItem('user_role')?.toUpperCase() === 'MAHASISWA' 
                    ? <MahasiswaDashboard /> 
                    : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/dashboard/dosen/*" 
                element={
                  localStorage.getItem('user_role')?.toUpperCase() === 'DOSEN' 
                    ? <DosenDashboard /> 
                    : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/dashboard/admin/*" 
                element={
                  localStorage.getItem('user_role')?.toUpperCase() === 'ADMIN' 
                    ? <AdminDashboard /> 
                    : <Navigate to="/login" replace />
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="py-8 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} PPPM STAI Ihyaul Ulum. All rights reserved.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
