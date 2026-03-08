import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Props { placeholder: string; onAdd: (v: string) => void; label?: string }

export function AddInline({ placeholder, onAdd, label }: Props) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);

  const commit = () => { if (val.trim()) { onAdd(val.trim()); setVal(''); } setOpen(false); };

  if (open) {
    return (
      <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(''); setOpen(false); } }}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 text-[13px] text-white/80 placeholder:text-white/20 rounded-xl outline-none ani-scale"
        style={{ background:'rgba(124,58,237,.12)', border:'1px solid rgba(124,58,237,.3)' }} />
    );
  }

  return (
    <button onClick={() => setOpen(true)} className="btn-inline">
      <Plus className="w-3.5 h-3.5" />
      <span>{label ?? placeholder}</span>
    </button>
  );
}
