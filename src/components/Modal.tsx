import { type ReactNode, useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 ani-fade" style={{ background: 'rgba(100,50,80,.25)', backdropFilter:'blur(12px)' }} onClick={onClose} />
      <div className="relative w-full max-w-[460px] ani-scale rounded-3xl"
        style={{ background:'rgba(255,248,253,.97)', border:'1px solid rgba(240,168,208,.35)', boxShadow:'0 25px 80px rgba(200,100,150,.2), 0 0 0 1px rgba(249,168,212,.1), inset 0 1px 0 rgba(255,255,255,.9)' }}>
        <div className="absolute top-0 left-1/4 right-1/4 h-px rounded-full" style={{ background:'linear-gradient(90deg,transparent,rgba(249,168,212,.7),transparent)' }} />
        {children}
      </div>
    </div>
  );
}
