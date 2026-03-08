import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function InlineEdit({ value, onSave, className = '', style, placeholder }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) { ref.current?.focus(); ref.current?.select(); } }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    else setDraft(value);
  };

  if (editing) {
    return (
      <input ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)}
        onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className={`w-full rounded-xl px-2 py-0.5 outline-none ${className}`}
        style={{ background: 'rgba(249,168,212,.08)', border: '1.5px solid rgba(240,168,208,.5)', color: '#3d1a30', ...style }}
        placeholder={placeholder} />
    );
  }

  return (
    <span className={`cursor-pointer rounded-lg px-1 py-0.5 -mx-1 transition-all hover:bg-pink-50 truncate block ${className}`}
      style={style}
      title={value}
      onClick={() => { setDraft(value); setEditing(true); }}>
      {value || <span style={{ opacity: 0.4 }}>{placeholder}</span>}
    </span>
  );
}
