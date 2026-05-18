
import { cn } from '@/src/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getColors = () => {
    const s = status.toUpperCase();
    if (['APPROVED', 'COMPLETED', 'VERIFIED', 'SUCCESS'].includes(s)) 
      return 'bg-green-100 text-green-700 border-green-200';
    if (['REJECTED', 'FAILED', 'ERROR'].includes(s)) 
      return 'bg-red-100 text-red-700 border-red-200';
    if (['SUBMITTED', 'PENDING', 'PROGRESS'].includes(s)) 
      return 'bg-blue-100 text-blue-700 border-blue-200';
    if (['SCHEDULED', 'IN_REVIEW'].includes(s)) 
      return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
      getColors(),
      className
    )}>
      {status}
    </span>
  );
}
