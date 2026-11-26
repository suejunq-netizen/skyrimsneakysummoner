import React from 'react';

/**
 * Ícones originais (traço único, 24x24) inspirados em temas nórdicos e necromânticos.
 * Desenhados para este projeto: não usam nenhum asset do jogo nem de terceiros.
 */
export type GameIconName =
  | 'skull'
  | 'bow'
  | 'tome'
  | 'robe'
  | 'stone'
  | 'amulet'
  | 'mask'
  | 'star'
  | 'tower'
  | 'ship'
  | 'scroll';

const PATHS: Record<GameIconName, React.ReactNode> = {
  skull: (
    <>
      <path d="M12 3c-4 0-7 2.8-7 6.5 0 2.2 1 3.6 2.5 4.6V18h9v-3.9c1.5-1 2.5-2.4 2.5-4.6C19 5.8 16 3 12 3z" />
      <circle cx="9" cy="10" r="1.5" />
      <circle cx="15" cy="10" r="1.5" />
      <path d="M12 12.5l-1 2h2zM10 18v2.5M12 18v2.5M14 18v2.5" />
    </>
  ),
  bow: (
    <>
      <path d="M6 3c8 3 8 15 0 18M6 3v18" />
      <path d="M6 12h14M17 9l3 3-3 3" />
    </>
  ),
  tome: (
    <>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M8 4v16" />
      <path d="M13 9l2 2-2 2-2-2z" />
    </>
  ),
  robe: (
    <>
      <path d="M12 3c-2.5 0-4 1.8-4 4 0 1.2.5 2 1.2 2.7L5 21h14l-4.2-11.3C15.5 9 16 8.2 16 7c0-2.2-1.5-4-4-4z" />
      <path d="M12 9v12" />
    </>
  ),
  stone: (
    <>
      <path d="M9 21l-1-14 4-4 4 4-1 14z" />
      <path d="M12 8v6M10 11h4" />
    </>
  ),
  amulet: (
    <>
      <path d="M7 3l5 7 5-7" />
      <path d="M12 10l3 4-3 5-3-5z" />
    </>
  ),
  mask: (
    <>
      <path d="M4 6c4-2 12-2 16 0v5c0 5-4 9-8 10-4-1-8-5-8-10z" />
      <path d="M8 10l3 1M16 10l-3 1M9 15h6" />
    </>
  ),
  star: <path d="M12 3l2.2 6.3H21l-5.3 3.9 2 6.4L12 15.8l-5.7 3.8 2-6.4L3 9.3h6.8z" />,
  tower: (
    <>
      <path d="M7 21V8L5 7V3h3v2h2V3h4v2h2V3h3v4l-2 1v13z" />
      <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
    </>
  ),
  ship: (
    <>
      <path d="M3 16h18l-3 5H6z" />
      <path d="M12 3v13M12 4l6 9h-6z" />
    </>
  ),
  scroll: (
    <>
      <path d="M8 4h10v13a3 3 0 0 0 3 3H9a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2z" />
      <path d="M10 8h6M10 12h6" />
    </>
  ),
};

interface GameIconProps {
  name: GameIconName;
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ name, className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {PATHS[name]}
  </svg>
);
