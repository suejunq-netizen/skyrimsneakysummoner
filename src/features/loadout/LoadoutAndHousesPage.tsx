import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Home, Shield, ShoppingBag } from 'lucide-react';
import { equipmentChecklist, houses, items, spells } from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { CalloutBox } from '../../components/CalloutBox';
import { VerificationSeal } from '../../components/VerificationSeal';
import type { PhaseId } from '../../types/grimoire';

export const LoadoutAndHousesPage: React.FC = () => {
  const collectedLootIds = useGrimoireStore((s) => s.collectedLootIds);
  const toggleLootCollected = useGrimoireStore((s) => s.toggleLootCollected);

  const [selectedSlotId, setSelectedSlotId] = useState<string>(equipmentChecklist[0]?.id ?? '');
  const [arsenalPhase, setArsenalPhase] = useState<'all' | PhaseId>('all');

  const selectedSlot = useMemo(
    () => equipmentChecklist.find((eq) => eq.id === selectedSlotId) ?? equipmentChecklist[0],
    [selectedSlotId]
  );

  const slotItems = useMemo(
    () => items.filter((it) => selectedSlot?.item_ids.includes(it.id)),
    [selectedSlot]
  );

  // Shopping list grouped by vendor / source
  const vendorGroups = useMemo(() => {
    const groups: Record<string, Array<{ id: string; nome: string; detail: string; fase: string }>> = {
      'Phinis Gestor (Colégio de Winterhold)': [],
      'Drevis Neloren (Colégio de Winterhold)': [],
      'Farengar Secret-Fire (Dragonsreach)': [],
      'Quests, Masmorras & Criação': [],
    };

    for (const sp of spells) {
      const target = sp.onde_obter.join(' ');
      if (target.includes('Phinis Gestor')) {
        groups['Phinis Gestor (Colégio de Winterhold)'].push({
          id: sp.id,
          nome: sp.nome,
          detail: `${sp.escola} · ${sp.pacote}${sp.estoque_minimo_nivel ? ` (Estoque completo Nv. ${sp.estoque_minimo_nivel}+)` : ''}`,
          fase: sp.estoque_minimo_nivel && sp.estoque_minimo_nivel >= 46 ? 'end' : 'mid',
        });
      } else if (target.includes('Drevis Neloren')) {
        groups['Drevis Neloren (Colégio de Winterhold)'].push({
          id: sp.id,
          nome: sp.nome,
          detail: `${sp.escola} · ${sp.pacote}`,
          fase: 'mid',
        });
      } else if (target.includes('Farengar')) {
        groups['Farengar Secret-Fire (Dragonsreach)'].push({
          id: sp.id,
          nome: sp.nome,
          detail: `${sp.escola} · ${sp.pacote}`,
          fase: 'early',
        });
      }
    }

    for (const it of items) {
      groups['Quests, Masmorras & Criação'].push({
        id: it.id,
        nome: it.nome,
        detail: it.como_obter,
        fase: it.fase,
      });
    }

    return groups;
  }, []);

  return (
    <div className="space-y-8">
      {/* 7-Slot Loadout */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Loadout de Equipamento (7 Slots) &amp; Planejador de Arsenal
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Tabela 2 do End-Game (Cap. 7.3, PDF p. 23): 4 peças com 25% Fortify Conjuration (Cabeça, Peito, Anel e Amuleto) zeram o custo da escola (100%).
            </p>
          </div>
          <span className="font-mono-nums text-xs text-[var(--accent-gold)]">
            {collectedLootIds.length} itens/feitiços obtidos
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 7 Interactive Slots */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {equipmentChecklist.map((eq) => {
              const active = eq.id === selectedSlot?.id;
              const anyOwned = eq.item_ids.some((iid) => collectedLootIds.includes(iid));
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setSelectedSlotId(eq.id)}
                  className={`text-left rounded-lg border p-3.5 transition-colors min-h-[82px] ${
                    active
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/12'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]/60 hover:border-[var(--accent-gold)]/45'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-display font-semibold text-[var(--accent-gold)]">
                      {eq.slot_label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <VerificationSeal
                        needsVerification={eq.needs_verification}
                        confidenceTier={eq.confidence_tier}
                        note={eq.game_version_note}
                      />
                      {anyOwned && (
                        <span className="text-[var(--accent-emerald)] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Obtido
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[var(--text-primary)] mt-1">
                    {eq.item_recomendado}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slot Details & Tradeoffs */}
          {selectedSlot && (
            <div className="lg:col-span-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-5 space-y-4">
              <div className="flex items-center gap-2 text-[var(--accent-gold)]">
                <Shield className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold">
                  Slot: {selectedSlot.slot_label}
                </h2>
              </div>

              <div>
                <div className="text-xs text-[var(--text-muted)]">Recomendação do Guia</div>
                <div className="text-base font-semibold text-[var(--text-primary)] mt-0.5">
                  {selectedSlot.item_recomendado}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {selectedSlot.encantamento_observacao}
                </p>
              </div>

              <div className="space-y-3 border-t border-[var(--border-subtle)] pt-3">
                {slotItems.map((it) => {
                  const owned = collectedLootIds.includes(it.id);
                  return (
                    <div
                      key={it.id}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-sm font-semibold">{it.nome}</span>
                          <VerificationSeal
                            needsVerification={it.needs_verification}
                            confidenceTier={it.confidence_tier}
                            note={it.game_version_note}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLootCollected(it.id)}
                          className={`rounded-md px-3 py-1 text-xs font-semibold min-h-[34px] ${
                            owned
                              ? 'border border-[var(--accent-emerald)] text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10'
                              : 'bg-[var(--accent-gold)] text-[#11141a]'
                          }`}
                        >
                          {owned ? 'Obtido' : 'Marcar obtido'}
                        </button>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        <strong>Como obter:</strong> {it.como_obter}
                      </p>
                      <p className="text-xs text-[var(--accent-ice)]">
                        <strong>Encantamento / Sinergia:</strong> {it.encantamento_sugerido}
                      </p>
                      {it.tradeoffs && (
                        <p className="text-xs text-[var(--accent-crimson)] flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            <strong>Trade-off:</strong> {it.tradeoffs}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Shopping List by Vendor / NPC */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--accent-gold)]" aria-hidden="true" />
            <h2 className="font-display text-xl font-bold">
              Planejador de Arsenal &amp; Lista de Compras por Vendedor
            </h2>
          </div>

          <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
            {(['all', 'early', 'mid', 'late', 'end'] as const).map((ph) => (
              <button
                key={ph}
                type="button"
                onClick={() => setArsenalPhase(ph)}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  arsenalPhase === ph
                    ? 'bg-[var(--accent-gold)] text-[#11141a]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {ph === 'all' ? 'Todas' : ph.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(vendorGroups).map(([vendor, entries]) => {
            const visible = entries.filter(
              (e) => arsenalPhase === 'all' || e.fase === arsenalPhase
            );
            if (visible.length === 0) return null;
            return (
              <div
                key={vendor}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-2.5"
              >
                <h3 className="font-display text-sm font-semibold text-[var(--accent-gold)]">
                  {vendor}
                </h3>
                <div className="space-y-1.5">
                  {visible.map((entry) => {
                    const checked = collectedLootIds.includes(entry.id);
                    return (
                      <label
                        key={entry.id}
                        className="flex items-start gap-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 cursor-pointer min-h-[42px]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLootCollected(entry.id)}
                          className="mt-1 h-4 w-4 accent-[var(--accent-gold)]"
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-medium ${
                              checked ? 'line-through text-[var(--text-muted)]' : ''
                            }`}
                          >
                            {entry.nome}
                          </div>
                          <div className="text-xs text-[var(--text-secondary)]">{entry.detail}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Free Houses (Cap. 3.7) */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-[var(--accent-emerald)]" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold">
            Moradias Gratuitas do Anniversary Edition (Cap. 3.7)
          </h2>
        </div>

        <CalloutBox tipo="Alerta de Bug" titulo="Bloodchill Manor: vá preparado" sourcePage={14}>
          Os anfitriões são vampiros. Antes de entrar: salve em slot separado, leve poções de cura e
          cura de doenças, invoque aliados antes de interagir e lute em corredores estreitos.
        </CalloutBox>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {houses.map((h) => (
            <div
              key={h.id}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] p-4 space-y-2.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[var(--accent-gold)]">
                  {h.nome}
                </h3>
                <span className="font-mono-nums text-xs text-[var(--text-muted)]">
                  Nv. {h.nivel_minimo}+
                </span>
              </div>
              <VerificationSeal
                needsVerification={h.needs_verification}
                confidenceTier={h.confidence_tier}
                note={h.game_version_note}
              />
              <div className="text-xs text-[var(--accent-ice)]">{h.localizacao}</div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-[var(--text-primary)]">Requisitos:</div>
                <ul className="list-disc pl-4 text-[var(--text-secondary)]">
                  {h.requisitos.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-[var(--accent-emerald)]">Benefícios:</div>
                <ul className="list-disc pl-4 text-[var(--text-secondary)]">
                  {h.beneficios.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs space-y-1">
                <div className="font-semibold text-[var(--accent-crimson)]">Riscos:</div>
                <ul className="list-disc pl-4 text-[var(--text-secondary)]">
                  {h.riscos.map((rk, i) => (
                    <li key={i}>{rk}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
