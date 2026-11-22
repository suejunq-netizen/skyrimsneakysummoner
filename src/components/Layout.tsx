import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookMarked,
  BookOpen,
  Compass,
  Download,
  Gauge,
  GitFork,
  HelpCircle,
  Info,
  Map as MapIcon,
  Menu,
  Moon,
  ScrollText,
  Search,
  Shield,
  SlidersHorizontal,
  Snowflake,
  Sun,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGrimoireStore } from '../store/useGrimoireStore';
import { AmbientParticles } from './AmbientParticles';
import { GlobalSearchModal } from './GlobalSearchModal';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallButton } from './PWAInstallButton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const theme = useGrimoireStore((s) => s.theme);
  const toggleTheme = useGrimoireStore((s) => s.toggleTheme);
  const language = useGrimoireStore((s) => s.language);
  const setLanguage = useGrimoireStore((s) => s.setLanguage);
  const fontScale = useGrimoireStore((s) => s.fontScale);
  const setFontScale = useGrimoireStore((s) => s.setFontScale);
  const ambientParticles = useGrimoireStore((s) => s.ambientParticles);
  const setAmbientParticles = useGrimoireStore((s) => s.setAmbientParticles);
  const secondScreenMode = useGrimoireStore((s) => s.secondScreenMode);
  const setSecondScreenMode = useGrimoireStore((s) => s.setSecondScreenMode);
  const characterLevel = useGrimoireStore((s) => s.characterLevel);
  const completedGuidedSteps = useGrimoireStore((s) => s.completedGuidedSteps);
  const exportProgress = useGrimoireStore((s) => s.exportProgress);
  const importProgress = useGrimoireStore((s) => s.importProgress);

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const scaleValue = fontScale === 'xlarge' ? '1.18' : fontScale === 'large' ? '1.08' : '1';
    root.style.setProperty('--base-font-scale', scaleValue);
  }, [fontScale]);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems = [
    { to: '/rota', label: t('nav.route'), Icon: Compass },
    { to: '/quests', label: t('nav.quests'), Icon: ScrollText },
    { to: '/grimorio', label: t('nav.spells'), Icon: BookOpen },
    { to: '/perks', label: t('nav.perks'), Icon: GitFork },
    { to: '/exercito', label: t('nav.army'), Icon: Users },
    { to: '/mapa', label: t('nav.map'), Icon: MapIcon },
    { to: '/equipamento', label: t('nav.equipment'), Icon: Shield },
    { to: '/orcamento', label: t('nav.budget'), Icon: Gauge },
    { to: '/mitos', label: t('nav.myths'), Icon: HelpCircle },
    { to: '/glossario', label: t('nav.glossary'), Icon: BookMarked },
    { to: '/sobre', label: t('nav.about'), Icon: Info },
  ];

  const handleExport = () => {
    const data = exportProgress();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grimorio-progresso-lvl${characterLevel}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importProgress(String(reader.result ?? ''));
      setImportMessage(
        res.ok ? 'Progresso importado com sucesso.' : res.error ?? 'Falha na importação.'
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeNav = navItems.find((item) => location.pathname === item.to);

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <AmbientParticles />

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] z-30">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
          <Link
            to="/"
            className="block font-display text-base font-bold tracking-wide text-[var(--accent-gold)] whitespace-nowrap"
          >
            {t('appTitle')}
          </Link>
          <p className="mt-0.5 text-xs text-[var(--text-muted)] font-mono-nums">
            Nível {characterLevel} · {completedGuidedSteps.length}/14 passos
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Navegação principal">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)] border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          <button
            type="button"
            onClick={() => setPrefsOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-gold)]/50 transition-colors min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-gold)]" aria-hidden="true" />
              Preferências &amp; Backup
            </span>
            <span className="font-mono-nums text-[var(--text-muted)]">
              {theme === 'dark' ? 'Escuro' : 'Claro'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Clean Top Bar Contract: Brand/Context — Search — Primary Action */}
        <header className="sticky top-0 z-20 h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-sm px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-display text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate">
              {activeNav ? activeNav.label : t('appTitle')}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap min-h-[40px]"
              aria-label="Buscar no grimório (Ctrl+K)"
            >
              <Search className="w-4 h-4 text-[var(--accent-gold)]" aria-hidden="true" />
              <span className="hidden sm:inline">{t('actions.search')}</span>
              <kbd className="hidden md:inline font-mono-nums text-[10px] text-[var(--text-muted)]">
                Ctrl+K
              </kbd>
            </button>
            <PWAInstallButton />
          </div>
        </header>

        <main
          className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10 ${
            secondScreenMode ? 'max-w-2xl' : 'max-w-6xl'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Second-Screen Thumb Zone, <= 64px height) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md grid grid-cols-5 items-center"
        aria-label="Navegação rápida móvel"
      >
        {[
          { to: '/rota', label: 'Rota', Icon: Compass },
          { to: '/quests', label: 'Quests', Icon: ScrollText },
          { to: '/mapa', label: 'Mapa', Icon: MapIcon },
          { to: '/exercito', label: 'Exército', Icon: Users },
        ].map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium transition-colors ${
                isActive ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setPrefsOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] text-[11px] font-medium text-[var(--text-muted)]"
        >
          <SlidersHorizontal className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Mobile Full Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/65"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col h-full z-10">
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="font-display text-sm font-bold text-[var(--accent-gold)]"
              >
                {t('appTitle')}
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--text-muted)]"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium min-h-[44px] ${
                      isActive
                        ? 'bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]'
                        : 'text-[var(--text-secondary)]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Preferences & JSON Backup Modal */}
      {prefsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Preferências e backup do progresso"
          onClick={() => setPrefsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[var(--accent-gold)]">
                Preferências &amp; Progresso Portátil
              </h2>
              <button
                type="button"
                onClick={() => setPrefsOpen(false)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Tema visual</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2 text-xs font-medium min-h-[40px]"
                >
                  {theme === 'dark' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[var(--accent-gold)]" /> Escuro (Obsidiana)
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[var(--accent-gold)]" /> Claro (Pergaminho)
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Idioma da interface</span>
                <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
                  {(['pt-BR', 'en'] as const).map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => setLanguage(lng)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        language === lng
                          ? 'bg-[var(--accent-gold)] text-[#11141a]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {lng === 'pt-BR' ? 'PT-BR' : 'EN'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Tamanho da fonte</span>
                <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
                  {(
                    [
                      ['normal', 'Padrão'],
                      ['large', 'Grande'],
                      ['xlarge', 'Extra'],
                    ] as const
                  ).map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFontScale(val)}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        fontScale === val
                          ? 'bg-[var(--accent-gold)] text-[#11141a]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Snowflake className="w-3.5 h-3.5 text-[var(--accent-ice)]" />
                  Partículas sutis de neve
                </span>
                <button
                  type="button"
                  onClick={() => setAmbientParticles(!ambientParticles)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium min-h-[38px] ${
                    ambientParticles
                      ? 'border-[var(--accent-ice)] bg-[var(--accent-ice)]/15 text-[var(--accent-ice)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {ambientParticles ? 'Ativo' : 'Desligado'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Layout segunda tela (compacto)</span>
                <button
                  type="button"
                  onClick={() => setSecondScreenMode(!secondScreenMode)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium min-h-[38px] ${
                    secondScreenMode
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {secondScreenMode ? 'Ativo' : 'Padrão'}
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
              <p className="text-xs text-[var(--text-muted)]">
                O progresso fica salvo automaticamente no navegador (localStorage). Exporte para levar ao celular ou outro dispositivo:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2.5 text-xs font-medium hover:border-[var(--accent-gold)]/50 min-h-[44px]"
                >
                  <Download className="w-4 h-4 text-[var(--accent-gold)]" />
                  Exportar JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-muted)] px-3 py-2.5 text-xs font-medium hover:border-[var(--accent-gold)]/50 min-h-[44px]"
                >
                  <Upload className="w-4 h-4 text-[var(--accent-ice)]" />
                  Importar JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
              {importMessage && (
                <p className="text-xs text-[var(--accent-emerald)]">{importMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <OfflineIndicator />
    </div>
  );
};
