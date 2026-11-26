import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const ALL_ROUTES = [
  '/',
  '/rota',
  '/quests',
  '/grimorio',
  '/perks',
  '/exercito',
  '/mapa',
  '/equipamento',
  '/orcamento',
  '/mitos',
  '/glossario',
  '/sobre',
] as const;

async function openPreferencesModal(page: Page, isMobile: boolean) {
  const trigger = isMobile
    ? page.locator('nav[aria-label="Navegação rápida móvel"] button', { hasText: 'Ajustes' })
    : page.locator('aside button', { hasText: 'Preferências & Backup' });
  await trigger.click();
  await expect(page.getByRole('dialog', { name: /Preferências e backup/i })).toBeVisible();
}

test.describe('Grimório do Necromante Furtivo — E2E Suite', () => {
  test('1. navegação pelas 12 rotas sem erros de console/página e redirect de rota desconhecida', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    for (const route of ALL_ROUTES) {
      await page.goto(route);
      await expect(page.locator('#root')).not.toBeEmpty();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
    }

    await page.goto('/rota-inexistente-xyz');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: /O Grimório do Necromante Furtivo/i })).toBeVisible();

    expect(consoleErrors, `Console errors detected: ${consoleErrors.join('; ')}`).toEqual([]);
    expect(pageErrors, `Page errors detected: ${pageErrors.join('; ')}`).toEqual([]);
  });

  test('2. mapa interativo: SVG overlay, marcadores/clusters, filtros, clique no pino e aviso ilustrativo', async ({
    page,
  }) => {
    await page.goto('/mapa');

    await expect(page.getByText(/ilustrativa/i).first()).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible();

    const mapOverlay = page.locator('img.leaflet-image-layer');
    await expect(mapOverlay).toHaveAttribute('src', /skyrim-stylized-map\.svg/);
    await expect
      .poll(async () => mapOverlay.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);

    const visibleMapMarkers = page.locator('.leaflet-marker-pane .grimorio-map-pin, .leaflet-marker-pane .marker-cluster');
    await expect(visibleMapMarkers.first()).toBeVisible();
    const initialMarkerCount = await visibleMapMarkers.count();

    const detailTitle = page.locator('aside h2').first();
    const initialTitle = (await detailTitle.textContent())?.trim() ?? '';
    expect(initialTitle.length).toBeGreaterThan(0);

    // Filter to Late phase: marker count should change and pins become directly clickable
    await page.getByRole('button', { name: 'Late', exact: true }).click();
    await expect
      .poll(async () => page.locator('.leaflet-marker-pane .grimorio-map-pin, .leaflet-marker-pane .marker-cluster').count())
      .not.toBe(initialMarkerCount);

    // If any cluster remains, zoom/click cluster until pins appear, then click a pin
    const cluster = page.locator('.leaflet-marker-pane .marker-cluster').first();
    if ((await cluster.count()) > 0) {
      await cluster.click();
    }

    const pins = page.locator('.leaflet-marker-pane .grimorio-map-pin');
    await expect(pins.first()).toBeVisible();
    await pins.first().click();

    await expect(detailTitle).not.toHaveText(initialTitle);
  });

  test('3. alternância de tema escuro/claro e auditoria axe-core sem violações serious/critical', async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === 'mobile';
    await page.goto('/');

    // Default theme is dark
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);

    const darkResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const darkSevere = darkResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(
      darkSevere,
      `Dark theme axe violations: ${JSON.stringify(darkSevere.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.html) })))}`
    ).toEqual([]);

    // Toggle to light theme
    await openPreferencesModal(page, isMobile);
    await page.getByRole('button', { name: /Escuro \(Obsidiana\)/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
    await expect(page.getByRole('button', { name: /Claro \(Pergaminho\)/i })).toBeVisible();
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();

    const lightResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const lightSevere = lightResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(
      lightSevere,
      `Light theme axe violations: ${JSON.stringify(lightSevere.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.html) })))}`
    ).toEqual([]);
  });

  test('4. persistência em localStorage após reload + exportação e importação JSON', async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === 'mobile';

    // Complete first quest ("Unbound")
    await page.goto('/quests');
    const firstQuestCard = page.locator('article').filter({ hasText: 'Unbound (Helgen Escape)' });
    await firstQuestCard.getByRole('button', { name: 'Marcar concluída' }).click();
    await expect(firstQuestCard.getByRole('button', { name: 'Concluída' })).toBeVisible();

    // Unlock "Novice Conjuration" perk
    await page.goto('/perks');
    const noviceConjBtn = page.locator('button').filter({ hasText: 'Novice Conjuration' }).first();
    await noviceConjBtn.click();
    await expect(noviceConjBtn).toContainText('Ativo');

    // Reload and verify localStorage persistence
    await page.reload();
    await expect(
      page.locator('button').filter({ hasText: 'Novice Conjuration' }).first()
    ).toContainText('Ativo');

    await page.goto('/quests');
    await expect(
      page
        .locator('article')
        .filter({ hasText: 'Unbound (Helgen Escape)' })
        .getByRole('button', { name: 'Concluída' })
    ).toBeVisible();

    // Export JSON via Preferences modal
    await openPreferencesModal(page, isMobile);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exportar JSON' }).click();
    const download = await downloadPromise;
    const exportPath = path.join(testInfo.outputDir, 'exported-progress.json');
    await download.saveAs(exportPath);

    const exportedContent = JSON.parse(fs.readFileSync(exportPath, 'utf-8')) as {
      version: number;
      data: { completedQuests: string[]; purchasedPerks: Record<string, number> };
    };
    expect(exportedContent.data.completedQuests).toContain('quest_unbound');
    expect(exportedContent.data.purchasedPerks.perk_novice_conjuration).toBe(1);

    // Clear localStorage, reload, verify reset, then import exported JSON back
    await page.evaluate(() => localStorage.removeItem('grimorio-necromante-state-v1'));
    await page.reload();
    await expect(
      page
        .locator('article')
        .filter({ hasText: 'Unbound (Helgen Escape)' })
        .getByRole('button', { name: 'Marcar concluída' })
    ).toBeVisible();

    await openPreferencesModal(page, isMobile);
    await page.locator('input[type="file"][accept="application/json"]').setInputFiles(exportPath);
    await expect(page.getByText('Progresso importado com sucesso.')).toBeVisible();
    await page.getByRole('button', { name: 'Fechar', exact: true }).click();

    await expect(
      page
        .locator('article')
        .filter({ hasText: 'Unbound (Helgen Escape)' })
        .getByRole('button', { name: 'Concluída' })
    ).toBeVisible();

    await page.goto('/perks');
    await expect(
      page.locator('button').filter({ hasText: 'Novice Conjuration' }).first()
    ).toContainText('Ativo');
  });

  test('5. orçamento de nível: marcos Breton (~Nv. 9 e ~Nv. 31) e alerta pós-31 (32/40/46)', async ({
    page,
  }) => {
    await page.goto('/orcamento');

    const setRange = async (labelText: string, value: number) => {
      const slider = page.locator('label', { hasText: labelText }).locator('input[type="range"]');
      await slider.fill(String(value));
    };

    // Breton early_end: Conj 40, Ill 30, Sneak 30, Arch 30, Ench 20 -> buildOnlyLevel 9
    await setRange('Conjuration', 40);
    await setRange('Illusion', 30);
    await setRange('Sneak', 30);
    await setRange('Archery', 30);
    await setRange('Enchanting', 20);

    await expect(page.getByText('Nv. 9', { exact: true }).first()).toBeVisible();

    // Breton build_complete: Conj 100, Ill 75, Sneak 50, Arch 50, Ench 100 -> buildOnlyLevel 31
    await setRange('Nível atual do personagem', 31);
    await setRange('Conjuration', 100);
    await setRange('Illusion', 75);
    await setRange('Sneak', 50);
    await setRange('Archery', 50);
    await setRange('Enchanting', 100);

    await expect(page.getByText('Nv. 31', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('30 pts', { exact: true })).toBeVisible();
    await expect(
      page.getByText(/Núcleo da build fechado \(~Nv\. 31\).*Elite \(Nv\. 32\).*Ascendant \(Nv\. 40\).*Phinis Gestor \(Nv\. 46\+\)/)
    ).toBeVisible();
  });

  test('6. calculadora de Magicka: 4x25% = custo zero (0 Magicka) sem alerta de teto de 85%', async ({
    page,
  }) => {
    await page.goto('/exercito');

    // Uncheck Vokun (-20%) so only Necromancer's Amulet (-25%) + 3 other 25% pieces remain
    const vokunCheckbox = page
      .locator('label', { hasText: 'Máscara Vokun (-20%)' })
      .locator('input[type="checkbox"]');
    if (await vokunCheckbox.isChecked()) {
      await vokunCheckbox.uncheck();
    }

    const amuletCheckbox = page
      .locator('label', { hasText: "Necromancer's Amulet (-25%)" })
      .locator('input[type="checkbox"]');
    if (!(await amuletCheckbox.isChecked())) {
      await amuletCheckbox.check();
    }

    await page
      .locator('label', { hasText: 'Peito (Fortify Conjuration)' })
      .locator('input[type="range"]')
      .fill('25');
    await page
      .locator('label', { hasText: 'Slot extra / alternativo' })
      .locator('input[type="range"]')
      .fill('25');
    await page
      .locator('label', { hasText: 'Anel encantado' })
      .locator('input[type="range"]')
      .fill('25');

    await expect(page.getByText('100%', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('0 Magicka', { exact: true })).toBeVisible();
    await expect(page.getByText('Custo ZERO de Conjuration alcançado (100% sem desperdício).')).toBeVisible();
    await expect(page.locator('[role="alert"]', { hasText: /Excesso/ })).toHaveCount(0);
    await expect(page.locator('[role="alert"]', { hasText: /85%/ })).toHaveCount(0);
  });

  test('7. selos de verificação: "Verificar no jogo" e "Fonte secundária [B]"', async ({ page }) => {
    await page.goto('/grimorio');
    await expect(page.getByText(/Verificar no jogo/).first()).toBeVisible();

    await page.goto('/perks');
    await expect(page.getByText('Fonte secundária [B]').first()).toBeVisible();
  });

  test('8. PWA: manifest.webmanifest, registro de Service Worker e reload/navegação offline', async ({
    page,
    context,
  }) => {
    await page.goto('/');

    // Check manifest.webmanifest
    const manifestResponse = await page.request.get('/manifest.webmanifest');
    expect(manifestResponse.status()).toBe(200);
    const manifestJson = (await manifestResponse.json()) as {
      name: string;
      start_url: string;
      icons: Array<{ sizes: string; src: string }>;
    };
    expect(manifestJson.name).toContain('Grimório');
    expect(manifestJson.start_url).toBe('/');
    expect(manifestJson.icons.length).toBeGreaterThanOrEqual(2);

    // Wait for SW registration and active state
    await page.waitForFunction(() => 'serviceWorker' in navigator);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });

    // Reload once if controller isn't claimed yet so SW controls future navigations
    const hasController = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
    if (!hasController) {
      await page.reload();
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
      });
    }

    // Switch browser context offline and verify reload on '/' and navigation to '/quests'
    await context.setOffline(true);
    try {
      await page.reload();
      await expect(
        page.getByRole('heading', { name: /O Grimório do Necromante Furtivo/i })
      ).toBeVisible();

      await page.goto('/quests');
      await expect(page.getByRole('heading', { name: /Diário de Quests/i })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test('9. acessibilidade básica: navegação por teclado (Tab) e prefers-reduced-motion', async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name === 'mobile';
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const prefersReduced = await page.evaluate(
      () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    expect(prefersReduced).toBe(true);

    const transitionDuration = await page.evaluate(() => {
      const link = document.querySelector('a');
      return link ? getComputedStyle(link).transitionDuration : '';
    });
    expect(['0s', '0.00001s', '0.01ms']).toContain(transitionDuration);

    // Tab until a navigation link receives focus
    let focusedNavHref: string | null = null;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      focusedNavHref = await page.evaluate(() => {
        const el = document.activeElement;
        if (el && el.tagName === 'A' && el.closest('nav')) {
          return el.getAttribute('href');
        }
        return null;
      });
      if (focusedNavHref) break;
    }

    if (isMobile) {
      // On mobile, Tab may hit top bar buttons or bottom nav links; keep tabbing up to 15 more steps if needed
      if (!focusedNavHref) {
        for (let i = 0; i < 15; i++) {
          await page.keyboard.press('Tab');
          focusedNavHref = await page.evaluate(() => {
            const el = document.activeElement;
            if (el && el.tagName === 'A' && el.closest('nav')) {
              return el.getAttribute('href');
            }
            return null;
          });
          if (focusedNavHref) break;
        }
      }
    }

    expect(focusedNavHref).toBeTruthy();
  });
});
