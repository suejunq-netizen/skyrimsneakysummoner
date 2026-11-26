import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import {
  CheckCircle2,
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import { guidedSteps, locations, quests } from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import { VerificationSeal } from '../../components/VerificationSeal';
import type { LocationEntry, PhaseId } from '../../types/grimoire';

const PHASE_COLORS: Record<PhaseId, string> = {
  early: '#3a8b6c',
  mid: '#d4af37',
  late: '#6cb8c7',
  end: '#a57bd4',
};

const CATEGORIES = [
  'all',
  'Quest',
  'Masmorra',
  'Moradia',
  'Mestre/Treinador',
  'Standing Stone',
  'Santuario',
  'Loot-chave',
  'Perigo',
] as const;

export const InteractiveMapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  const activePhase = useGrimoireStore((s) => s.activePhase);
  const characterLevel = useGrimoireStore((s) => s.characterLevel);
  const completedGuidedSteps = useGrimoireStore((s) => s.completedGuidedSteps);
  const visitedLocationIds = useGrimoireStore((s) => s.visitedLocationIds);
  const toggleLocationVisited = useGrimoireStore((s) => s.toggleLocationVisited);

  const [phaseFilter, setPhaseFilter] = useState<'all' | PhaseId>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dlcFilter, setDlcFilter] = useState<string>('all');
  const [focusNextOnly, setFocusNextOnly] = useState(false);
  const [searchParams] = useSearchParams();
  const linkedLocation = locations.find((location) => location.id === searchParams.get('local'));
  const [selectedLoc, setSelectedLoc] = useState<LocationEntry | null>(linkedLocation ?? locations[0] ?? null);

  const nextStep = useMemo(
    () =>
      guidedSteps.find((s) => !completedGuidedSteps.includes(s.id)) ??
      guidedSteps[guidedSteps.length - 1],
    [completedGuidedSteps]
  );

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (focusNextOnly) {
        return loc.id === nextStep.location_id;
      }
      if (phaseFilter !== 'all' && loc.fase !== phaseFilter) return false;
      if (categoryFilter !== 'all' && !loc.categorias.includes(categoryFilter as never)) {
        return false;
      }
      if (dlcFilter !== 'all' && loc.dlc !== dlcFilter) return false;
      return true;
    });
  }, [focusNextOnly, nextStep.location_id, phaseFilter, categoryFilter, dlcFilter]);

  const unconfirmedLocations = useMemo(
    () => locations.filter((loc) => loc.coordenadas === null),
    []
  );

  // Initialize Leaflet CRS.Simple map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const bounds: L.LatLngBoundsExpression = [
      [0, 0],
      [900, 1200],
    ];
    const map = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 2,
      zoomSnap: 0.25,
      attributionControl: false,
    });

    L.imageOverlay('/assets/skyrim-stylized-map.svg', bounds).addTo(map);
    map.fitBounds(bounds);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!linkedLocation) return;
    setSelectedLoc(linkedLocation);
    if (linkedLocation.coordenadas) mapRef.current?.setView(linkedLocation.coordenadas, 0.5);
  }, [linkedLocation]);

  // Update markers & suggested phase polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (clusterLayerRef.current) {
      map.removeLayer(clusterLayerRef.current);
      clusterLayerRef.current = null;
    }
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 34,
    });

    for (const loc of filteredLocations) {
      if (!loc.coordenadas) continue;
      const visited = visitedLocationIds.includes(loc.id);
      const isNextFocus = loc.id === nextStep.location_id;
      const color = PHASE_COLORS[loc.fase];

      const icon = L.divIcon({
        className: 'grimorio-map-pin',
        html: `<div style="
          width: ${isNextFocus ? 22 : 16}px;
          height: ${isNextFocus ? 22 : 16}px;
          border-radius: 9999px;
          background: ${visited ? '#1e4d3b' : color};
          border: 2px solid ${isNextFocus ? '#ffffff' : '#11141a'};
          box-shadow: 0 0 ${isNextFocus ? '12px' : '6px'} ${color};
        "></div>`,
        iconSize: [isNextFocus ? 22 : 16, isNextFocus ? 22 : 16],
        iconAnchor: [isNextFocus ? 11 : 8, isNextFocus ? 11 : 8],
      });

      const marker = L.marker(loc.coordenadas, { icon });
      marker.bindTooltip(`${loc.nome} (${loc.fase.toUpperCase()})`, {
        direction: 'top',
        offset: [0, -8],
      });
      marker.on('click', () => {
        setSelectedLoc(loc);
      });
      clusterGroup.addLayer(marker);
    }

    clusterGroup.addTo(map);
    clusterLayerRef.current = clusterGroup;

    // Draw suggested polyline for the active/selected phase
    const routePhase = phaseFilter === 'all' ? activePhase : phaseFilter;
    const routePoints = guidedSteps
      .filter((s) => s.fase === routePhase && s.location_id)
      .map((s) => locations.find((l) => l.id === s.location_id)?.coordenadas)
      .filter((c): c is [number, number] => Array.isArray(c));

    if (routePoints.length >= 2) {
      const polyline = L.polyline(routePoints, {
        color: PHASE_COLORS[routePhase],
        weight: 2.5,
        dashArray: '6 6',
        opacity: 0.75,
      }).addTo(map);
      routeLayerRef.current = polyline;
    }

    if (focusNextOnly && nextStep.location_id) {
      const focusLoc = locations.find((l) => l.id === nextStep.location_id);
      if (focusLoc?.coordenadas) {
        map.setView(focusLoc.coordenadas, 0.5);
      }
    }
  }, [
    filteredLocations,
    visitedLocationIds,
    nextStep.location_id,
    focusNextOnly,
    phaseFilter,
    activePhase,
  ]);

  const linkedQuests = useMemo(() => {
    if (!selectedLoc) return [];
    return quests.filter(
      (q) => q.location_id === selectedLoc.id || selectedLoc.relacionado_a.includes(q.id)
    );
  }, [selectedLoc]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Mapa Interativo Próprio (Skyrim &amp; Solstheim)
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Cartografia estilizada ilustrativa baseada apenas em descrições relativas (nenhuma coordenada exata do jogo foi inventada).
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const nextFocus = !focusNextOnly;
              setFocusNextOnly(nextFocus);
              if (nextFocus && nextStep.location_id) {
                const focusLoc = locations.find((l) => l.id === nextStep.location_id);
                if (focusLoc) {
                  setSelectedLoc(focusLoc);
                }
              }
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold border transition-colors min-h-[42px] ${
              focusNextOnly
                ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)] text-[#11141a]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/50'
            }`}
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            <span>Onde focar agora</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
            {(
              [
                ['all', 'Todas Fases'],
                ['early', 'Early'],
                ['mid', 'Mid'],
                ['late', 'Late'],
              ] as const
            ).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                disabled={focusNextOnly}
                onClick={() => setPhaseFilter(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium min-h-[36px] disabled:opacity-40 ${
                  phaseFilter === val
                    ? 'bg-[var(--accent-gold)] text-[#11141a]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <select
            aria-label="Filtrar por categoria"
            value={categoryFilter}
            disabled={focusNextOnly}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)] min-h-[40px] disabled:opacity-40"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas Categorias' : cat}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por DLC"
            value={dlcFilter}
            disabled={focusNextOnly}
            onChange={(e) => setDlcFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs text-[var(--text-primary)] min-h-[40px] disabled:opacity-40"
          >
            <option value="all">Todas DLCs</option>
            <option value="Vanilla">Vanilla</option>
            <option value="Creation Club">Creation Club</option>
            <option value="Dawnguard">Dawnguard</option>
            <option value="Dragonborn">Dragonborn</option>
          </select>
        </div>

        {/* Phase Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3a8b6c]" /> Early (1–10)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" /> Mid (11–25)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6cb8c7]" /> Late (26–45)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e4d3b] border border-white/60" /> Visitado
          </span>
        </div>
      </section>

      {/* Map + Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[#0b1016]">
          <div ref={mapContainerRef} className="w-full h-[460px] sm:h-[560px]" />
        </div>

        <aside className="lg:col-span-4 space-y-4">
          {selectedLoc && (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {selectedLoc.regiao} · {selectedLoc.dlc} · PDF p. {selectedLoc.source_page}
                  </div>
                  <h2 className="font-display text-lg font-bold text-[var(--accent-gold)] mt-0.5">
                    {selectedLoc.nome}
                  </h2>
                </div>
                <VerificationSeal
                  needsVerification={selectedLoc.needs_verification || selectedLoc.coordenadas === null}
                  confidenceTier={selectedLoc.confidence_tier}
                  note={selectedLoc.game_version_note}
                />
              </div>

              {selectedLoc.nivel_minimo_zona && (
                <div
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                    characterLevel >= selectedLoc.nivel_minimo_zona
                      ? 'border-[var(--accent-emerald)]/45 bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)]'
                      : 'border-[var(--accent-crimson)]/45 bg-[var(--accent-crimson)]/10 text-[var(--accent-crimson)]'
                  }`}
                >
                  {characterLevel >= selectedLoc.nivel_minimo_zona
                    ? `Entrar agora (zona mín. Nv. ${selectedLoc.nivel_minimo_zona} · seu Nv. ${characterLevel})`
                    : `Deixar para depois — zona mín. Nv. ${selectedLoc.nivel_minimo_zona} (seu Nv. ${characterLevel})`}
                </div>
              )}

              <p className="text-sm text-[var(--text-secondary)]">{selectedLoc.descricao}</p>

              <div className="flex items-center justify-between text-xs border-y border-[var(--border-subtle)] py-2">
                <span className="flex items-center gap-1 text-[var(--text-muted)]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                  Perigo: <strong className="font-mono-nums text-[var(--text-primary)]">{selectedLoc.perigo}/5</strong>
                </span>
                <span className="text-[var(--text-muted)]">
                  Fase: <strong className="text-[var(--text-primary)]">{selectedLoc.fase.toUpperCase()}</strong>
                </span>
              </div>

              {selectedLoc.o_que_lootear.length > 0 && (
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-[var(--accent-ice)]">O que obter / lootear:</div>
                  <ul className="list-disc pl-4 text-[var(--text-secondary)] space-y-0.5">
                    {selectedLoc.o_que_lootear.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {linkedQuests.length > 0 && (
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-[var(--accent-gold)]">Quests ligadas:</div>
                  <ul className="list-disc pl-4 text-[var(--text-secondary)]">
                    {linkedQuests.map((q) => (
                      <li key={q.id}>
                        {q.nome_en} (Nv. {q.nivel_recomendado})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => toggleLocationVisited(selectedLoc.id)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold min-h-[42px] ${
                  visitedLocationIds.includes(selectedLoc.id)
                    ? 'border border-[var(--accent-emerald)] text-[var(--accent-emerald)] bg-[var(--accent-emerald)]/10'
                    : 'bg-[var(--accent-gold)] text-[#11141a]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {visitedLocationIds.includes(selectedLoc.id)
                    ? 'Local marcado como visitado'
                    : 'Marcar local como visitado'}
                </span>
              </button>

              {(selectedLoc.uesp_url || selectedLoc.mapgenie_url) && (
                <div className="flex flex-wrap gap-3 pt-1 text-xs">
                  {selectedLoc.uesp_url && (
                    <a
                      href={selectedLoc.uesp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--accent-ice)] hover:underline"
                    >
                      <span>Abrir na UESP</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {selectedLoc.mapgenie_url && (
                    <a
                      href={selectedLoc.mapgenie_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:underline"
                    >
                      <span>Link externo MapGenie</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Unconfirmed / Extraplanar Locations */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-3">
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-[var(--text-primary)]">
              <Compass className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
              <span>Locais sem Coordenada Confirmada</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Dimensões externas ou locais marcados como não confirmados no guia aparecem abaixo com o selo
              &ldquo;posição a confirmar&rdquo;.
            </p>
            <div className="space-y-1.5">
              {unconfirmedLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLoc(loc)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2 min-h-[40px] ${
                    selectedLoc?.id === loc.id
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-muted)]'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                    {loc.nome}
                  </span>
                  <VerificationSeal
                    needsVerification={loc.needs_verification}
                    confidenceTier={loc.confidence_tier}
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
