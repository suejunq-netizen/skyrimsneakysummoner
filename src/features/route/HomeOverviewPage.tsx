import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Flame,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  attributesPlan,
  combatAndLoops,
  phases,
  races,
  standingStones,
} from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { CalloutBox } from '../../components/CalloutBox';
import { JourneyDashboard } from './JourneyDashboard';

export const HomeOverviewPage: React.FC = () => {
  const selectedRace = useGrimoireStore((s) => s.selectedRace);
  const setSelectedRace = useGrimoireStore((s) => s.setSelectedRace);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-10"
    >
      <JourneyDashboard />

      {/* Regra de Ouro */}
      <CalloutBox tipo="Regra de Ouro" titulo="Regra de Ouro: Salve Muito" sourcePage={5}>
        Use <strong>salvamento manual</strong> em slots diferentes antes de cada quest importante
        (como <em>Blood on the Ice</em>, <em>In the Shadows</em> e <em>Dawnguard</em>) e antes de
        entrar em masmorras. Se algo travar ou der errado, você volta sem perder horas.
      </CalloutBox>

      {/* 4 Fases da Jornada */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
            01. As Quatro Fases da Jornada
          </h2>
          <Link to="/rota" className="text-sm text-[var(--accent-gold)] hover:underline">
            Ir para rota completa →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-[var(--accent-gold)]">
                  {phase.nome}
                </h3>
                <span className="text-xs font-mono-nums text-[var(--text-muted)]">
                  {phase.faixa_de_nivel} · PDF p. {phase.source_page}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{phase.narrativa_abertura}</p>
              <ul className="space-y-1 text-sm text-[var(--text-primary)] list-disc pl-5">
                {phase.objetivos.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Pilares de Sinergia (Cap. 2.2) */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">
          02. Anatomia e Sinergia da Build
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2">
            <Users className="w-5 h-5 text-[var(--accent-emerald)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold">Conjuração / Necromancia</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Twin Souls, Bone Colossus, Undying Ghost e Ancient Deathpriest erguem seu exército.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-purple)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold">Ilusão (Illusion)</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Muffle silencia passos, Fenrik&apos;s Welcome abre fechaduras e Quiet Casting silencia feitiços.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2">
            <Shield className="w-5 h-5 text-[var(--accent-ice)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold">Furtividade (Sneak)</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Muffled Movement, Stealth e Deadly Aim (3x de dano com arco) mantêm você oculto.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2">
            <Flame className="w-5 h-5 text-[var(--accent-gold)]" aria-hidden="true" />
            <h3 className="font-display text-base font-semibold">Arco + Invisibilidade</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Bow of Shadows lança 30 s de invisibilidade ao sacar (Bound Bow como alternativa vanilla).
            </p>
          </div>
        </div>
      </section>

      {/* Escolha de Raça + Atributos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">03. Escolha de Raça (Cap. 2.3)</h2>
            <span className="text-xs text-[var(--text-muted)]">PDF p. 7</span>
          </div>
          <div className="space-y-2.5">
            {races.map((race) => {
              const active = selectedRace === race.id;
              return (
                <button
                  key={race.id}
                  type="button"
                  onClick={() => setSelectedRace(race.id as 'breton' | 'altmer' | 'dunmer')}
                  className={`w-full text-left rounded-lg border p-3.5 transition-colors ${
                    active
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-muted)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-[var(--text-primary)]">
                      {race.nome}
                    </span>
                    <span className="text-xs font-medium text-[var(--accent-gold)]">
                      {active ? 'Selecionada' : 'Selecionar'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{race.bonus}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 italic">{race.justificativa}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">
              04. Distribuição de Atributos (Cap. 2.4)
            </h2>
            <span className="text-xs text-[var(--text-muted)]">PDF p. 7</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            A cada nível você ganha <strong className="font-mono-nums">+10</strong> em Magicka,
            Health ou Stamina. Stamina permanece em 0 de investimento.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                  <th className="py-2 pr-3">Nível</th>
                  <th className="py-2 pr-3">M:H:S</th>
                  <th className="py-2">Objetivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {attributesPlan.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-3 font-mono-nums font-medium whitespace-nowrap">
                      {row.faixa_de_nivel}
                    </td>
                    <td className="py-2.5 pr-3 font-mono-nums text-[var(--accent-gold)] whitespace-nowrap">
                      {row.proporcao_m_h_s}
                    </td>
                    <td className="py-2.5 text-[var(--text-secondary)]">{row.objetivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <h3 className="font-display text-sm font-semibold text-[var(--accent-ice)] mb-2">
              Standing Stones Recomendadas (Cap. 3.3)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {standingStones.map((st) => (
                <div
                  key={st.id}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-2.5"
                >
                  <div className="font-semibold text-[var(--text-primary)]">{st.nome}</div>
                  <div className="text-[var(--text-secondary)] mt-0.5">{st.efeito}</div>
                  <div className="text-[var(--text-muted)] mt-0.5">{st.local}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ciclo de Combate Rápido */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold">
            05. Ciclo de Combate Furtivo em Quatro Passos (Cap. 8.1)
          </h2>
          <span className="text-xs text-[var(--text-muted)]">PDF p. 24</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {combatAndLoops.combat_cycle.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4"
            >
              <div className="font-mono-nums text-xs text-[var(--accent-gold)]">
                Passo {c.passo}
              </div>
              <div className="font-display text-base font-semibold mt-1">{c.titulo}</div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{c.descricao}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
