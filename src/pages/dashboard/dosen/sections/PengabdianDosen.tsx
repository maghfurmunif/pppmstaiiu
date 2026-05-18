
import { lazy, Suspense } from 'react';

const PengabdianDosenSection = lazy(() => import('./PengabdianDosenSection'));

export default function PengabdianDosen() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20 text-slate-400 italic">Loading Module...</div>}>
      <PengabdianDosenSection />
    </Suspense>
  );
}
