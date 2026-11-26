import React from 'react';

interface RuneRingProps {
  level: number;
  max?: number;
  gateLevels: number[];
}

/** Anel de progresso original: 46 marcas, marcas largas nos níveis em que algo é liberado. */
export const RuneRing: React.FC<RuneRingProps> = ({ level, max = 46, gateLevels }) => {
  const circumference = 2 * Math.PI * 92;
  const ticks = Array.from({ length: max }, (_, i) => {
    const a = (i / max) * Math.PI * 2;
    const isGate = gateLevels.includes(i + 1);
    const r1 = 104;
    const r2 = isGate ? 116 : 111;
    return {
      key: i,
      x1: 120 + r1 * Math.sin(a),
      y1: 120 - r1 * Math.cos(a),
      x2: 120 + r2 * Math.sin(a),
      y2: 120 - r2 * Math.cos(a),
      isGate,
      reached: i + 1 <= level,
    };
  });
  return (
    <svg viewBox="0 0 240 240" className="w-52 h-52 sm:w-60 sm:h-60" role="img" aria-label={`Nível ${level} de ${max}`}>
      {ticks.map((t) => (
        <line
          key={t.key}
          x1={t.x1.toFixed(1)}
          y1={t.y1.toFixed(1)}
          x2={t.x2.toFixed(1)}
          y2={t.y2.toFixed(1)}
          stroke={t.isGate ? '#d4af37' : t.reached ? '#6cb8c7' : 'rgba(236,231,220,0.35)'}
          strokeWidth={t.isGate ? 3 : 1.6}
          strokeLinecap="round"
        />
      ))}
      <circle cx="120" cy="120" r="92" fill="rgba(10,14,22,0.55)" stroke="rgba(236,231,220,0.25)" strokeWidth="6" />
      <circle
        cx="120"
        cy="120"
        r="92"
        fill="none"
        stroke="#6cb8c7"
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 120 120)"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.min(level, max) / max)}
      />
      <text x="120" y="98" textAnchor="middle" fontSize="15" fill="#c4beaf" style={{ fontFamily: 'var(--font-display)' }}>
        Nível
      </text>
      <text x="120" y="150" textAnchor="middle" fontSize="54" fontWeight="700" fill="#ece7dc" style={{ fontFamily: 'var(--font-display)' }}>
        {level}
      </text>
      <text x="120" y="176" textAnchor="middle" fontSize="13" fill="#c4beaf" style={{ fontFamily: 'var(--font-display)' }}>
        de {max}
      </text>
    </svg>
  );
};
