import { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { monthName } from '../utils';
import { ChevronDown, Layers, X } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; onAdd: (t: string, m: number, y: number) => void }
const Y = new Date().getFullYear();
const YEARS = [Y, Y + 1, Y + 2, Y + 3];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function Dropdown({ value, options, onSelect }: {
  value: number;
  options: { value: number; label: string }[];
  onSelect: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const label = options.find(o => o.value === value)?.label ?? String(value);

  return (
    <div ref={ref} className="relative flex-1">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200"
        style={{
          background: open ? 'rgba(249,168,212,.08)' : 'rgba(255,255,255,.6)',
          border: open ? '1px solid rgba(240,168,208,.5)' : '1px solid rgba(240,168,208,.25)',
          boxShadow: open ? '0 0 0 3px rgba(249,168,212,.12)' : 'none',
          color: '#6a3050',
        }}>
        <span>{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ color: '#d4a0c0' }} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-2xl overflow-y-auto"
          style={{
            background: 'rgba(255,248,253,.98)',
            border: '1px solid rgba(240,168,208,.3)',
            boxShadow: '0 16px 48px rgba(200,100,150,.2)',
            maxHeight: 220,
            zIndex: 9999,
          }}>
          <div className="p-1">
            {options.map(opt => {
              const active = opt.value === value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => { onSelect(opt.value); setOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 flex items-center gap-2"
                  style={{
                    color: active ? '#c0628f' : '#9d6e8a',
                    background: active ? 'rgba(249,168,212,.15)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.08)'; (e.currentTarget as HTMLElement).style.color = '#c0628f'; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9d6e8a'; } }}>
                  {active && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#e88cc4' }} />}
                  <span className={active ? 'font-bold' : ''}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddMonthForm({ open, onClose, onAdd }: Props) {
  const [m, setM] = useState(new Date().getMonth() + 1);
  const [y, setY] = useState(Y);
  const [t, setT] = useState('');
  const [descFocus, setDescFocus] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(t.trim() || `Этап: ${monthName(m)} ${y}`, m, y);
    setT(''); onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} style={{ overflow: 'visible' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(126,200,227,.35),rgba(249,168,212,.25))', border: '1px solid rgba(126,200,227,.3)', boxShadow: '0 4px 16px rgba(126,200,227,.2)' }}>
            <Layers className="w-4 h-4" style={{ color: '#7ec8e3' }} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold leading-none" style={{ color: '#5a2a4a' }}>Добавить этап</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#d4a0c0' }}>Месячный блок вашей цели</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Month + Year pickers */}
        <div className="px-5 pb-3 space-y-2" style={{ overflow: 'visible' }}>
          <div style={{ overflow: 'visible' }}>
            <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: '#d4a0c0' }}>Период</p>
            <div className="flex gap-2" style={{ overflow: 'visible' }}>
              <Dropdown value={m} options={MONTHS.map(i => ({ value: i, label: monthName(i) }))} onSelect={setM} />
              <Dropdown value={y} options={YEARS.map(v => ({ value: v, label: String(v) }))} onSelect={setY} />
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: '#d4a0c0' }}>Описание этапа</p>
            <div className="rounded-2xl px-3.5 py-2.5 transition-all duration-200"
              style={{
                background: descFocus ? 'rgba(249,168,212,.07)' : 'rgba(255,255,255,.6)',
                border: descFocus ? '1px solid rgba(240,168,208,.5)' : '1px solid rgba(240,168,208,.25)',
                boxShadow: descFocus ? '0 0 0 3px rgba(249,168,212,.12)' : 'none',
              }}>
              <input type="text" value={t} onChange={e => setT(e.target.value)}
                onFocus={() => setDescFocus(true)} onBlur={() => setDescFocus(false)}
                placeholder={`Например: изучить основы ${monthName(m)}...`}
                className="w-full text-[13px] font-medium bg-transparent outline-none"
                style={{ color: '#6a3050' }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 pb-5 pt-2">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Отмена
          </button>
          <button type="submit" className="btn btn-success flex-1">
            Сохранить этап
          </button>
        </div>

      </form>
    </Modal>
  );
}
