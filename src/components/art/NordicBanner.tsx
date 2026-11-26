import React from 'react';
import type { PhaseId } from '../../types/grimoire';

/**
 * Paisagem nórdica original em SVG (montanhas, pinheiros, aurora e lua).
 * A paleta muda por fase da rota. Não usa nenhum asset do jogo.
 */
const PALETTES: Record<PhaseId, { top: string; bottom: string; far: string; mid: string; near: string; glow: string; moon: string }> = {
  early: { top: '#1c2b47', bottom: '#d9a76b', far: '#5d6b86', mid: '#2f3d57', near: '#141c2b', glow: '#f2c98a', moon: '#f6e7c1' },
  mid: { top: '#1a2142', bottom: '#80506f', far: '#4f5780', mid: '#2a3157', near: '#12162b', glow: '#b97ba0', moon: '#efe3d0' },
  late: { top: '#071326', bottom: '#1b5063', far: '#2d5870', mid: '#173449', near: '#0a1a28', glow: '#57d1b8', moon: '#dff4f3' },
  end: { top: '#150a12', bottom: '#6b1f2d', far: '#4a2630', mid: '#2e1620', near: '#12080e', glow: '#d04a55', moon: '#f0b4a8' },
};

const STARS: Array<[number, number, number]> = [
  [60, 30, 1.2], [140, 62, 1], [230, 24, 1.4], [330, 50, 1], [420, 18, 1.2], [520, 58, 1],
  [610, 30, 1.5], [720, 20, 1], [810, 60, 1.2], [900, 28, 1], [990, 52, 1.4], [1090, 24, 1.1],
  [1160, 64, 1], [270, 84, 0.9], [680, 78, 0.9], [940, 90, 0.9],
];

export const NordicBanner: React.FC<{ phase: PhaseId; className?: string }> = ({ phase, className }) => {
  const p = PALETTES[phase];
  const id = `nb-${phase}`;
  const pines: number[] = [];
  for (let x = 12; x < 1200; x += 34) pines.push(x);
  return (
    <svg
      viewBox="0 0 1200 280"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.top} />
          <stop offset="1" stopColor={p.bottom} />
        </linearGradient>
        <linearGradient id={`${id}-aur`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={p.glow} stopOpacity="0" />
          <stop offset="0.5" stopColor={p.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width="1200" height="280" fill={`url(#${id}-sky)`} />
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.75" />
      ))}
      <path
        d="M-20 110 C200 40 380 150 560 90 S900 30 1220 100 L1220 150 C900 90 700 170 520 140 S160 80 -20 160z"
        fill={`url(#${id}-aur)`}
        filter={`url(#${id}-blur)`}
      />
      <circle cx="1010" cy="70" r="30" fill={p.moon} opacity="0.92" />
      <circle cx="1022" cy="62" r="26" fill={p.top} opacity="0.28" />
      <polygon points="0,230 120,130 210,200 330,100 450,205 560,140 680,215 800,110 930,200 1060,135 1200,210 1200,280 0,280" fill={p.far} />
      <polygon points="0,250 90,185 190,235 300,170 420,240 540,190 660,245 790,175 910,240 1040,185 1200,245 1200,280 0,280" fill={p.mid} />
      <g fill={p.near}>
        <rect x="0" y="252" width="1200" height="28" />
        {pines.map((x, i) => {
          const h = 26 + ((i * 7) % 5) * 5;
          return <polygon key={x} points={`${x},${258 - h} ${x - 9},258 ${x + 9},258`} />;
        })}
      </g>
    </svg>
  );
};
