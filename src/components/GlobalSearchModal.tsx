import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchGrimoire } from '../lib/search';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const results = useMemo(() => (open ? searchGrimoire(query) : []), [open, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Busca global no grimório"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <Search className="w-5 h-5 text-[var(--accent-gold)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar quests, feitiços, perks, locais, mitos ou termos..."
            className="w-full bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Fechar busca"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--border-subtle)]">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">
              Nenhum registro encontrado para &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => {
                  navigate(item.route);
                  handleClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-surface-muted)] transition-colors flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-xs text-[var(--accent-gold)] font-medium">
                    {item.kind} · PDF p. {item.sourcePage}
                    {item.needsVerification ? ' · Verificar no jogo' : ''}
                  </div>
                  <div className="font-display text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                    {item.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0 self-center">
                  Abrir →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
