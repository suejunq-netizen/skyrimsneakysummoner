import { LevelPlanPage } from './features/level-plan/LevelPlanPage';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ArmyAndMagickaPage } from './features/army/ArmyAndMagickaPage';
import { LevelBudgetPage } from './features/level-budget/LevelBudgetPage';
import { LoadoutAndHousesPage } from './features/loadout/LoadoutAndHousesPage';
import { InteractiveMapPage } from './features/map/InteractiveMapPage';
import { PerkTreePage } from './features/perks/PerkTreePage';
import { QuestTrackerPage } from './features/quests/QuestTrackerPage';
import { AboutPage } from './features/reference/AboutPage';
import { GlossaryPage } from './features/reference/GlossaryPage';
import { MythsPage } from './features/reference/MythsPage';
import { GuidedRoutePage } from './features/route/GuidedRoutePage';
import { HomeOverviewPage } from './features/route/HomeOverviewPage';
import { SpellbookPage } from './features/spells/SpellbookPage';

export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeOverviewPage />} />
        <Route path="/niveis" element={<LevelPlanPage />} />
        <Route path="/rota" element={<GuidedRoutePage />} />
        <Route path="/quests" element={<QuestTrackerPage />} />
        <Route path="/grimorio" element={<SpellbookPage />} />
        <Route path="/perks" element={<PerkTreePage />} />
        <Route path="/exercito" element={<ArmyAndMagickaPage />} />
        <Route path="/mapa" element={<InteractiveMapPage />} />
        <Route path="/equipamento" element={<LoadoutAndHousesPage />} />
        <Route path="/orcamento" element={<LevelBudgetPage />} />
        <Route path="/mitos" element={<MythsPage />} />
        <Route path="/glossario" element={<GlossaryPage />} />
        <Route path="/sobre" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
