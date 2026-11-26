import React, { useState } from 'react';
import { glossary } from '../lib/data';

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, children }) => {
  const [open, setOpen] = useState(false);

  const entry = glossary.find(
    (g) =>
      g.termo_en.toLowerCase() === term.toLowerCase() ||
      g.termo_pt.toLowerCase() === term.toLowerCase() ||
      g.id === term
  );

  if (!entry) {
    return <span>{children ?? term}</span>;
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="underline decoration-dotted decoration-[var(--accent-gold)] underline-offset-4 font-medium text-[var(--accent-gold)] hover:opacity-85 cursor-help"
        aria-label={`Glossário: ${entry.termo_en}`}
      >
        {children ?? term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-left shadow-xl pointer-events-none"
        >
          <span className="block text-xs font-display font-semibold text-[var(--accent-gold)]">
            {entry.termo_en} · {entry.termo_pt}
          </span>
          <span className="mt-1 block text-xs text-[var(--text-secondary)] leading-snug">
            {entry.significado}
          </span>
        </span>
      )}
    </span>
  );
};
