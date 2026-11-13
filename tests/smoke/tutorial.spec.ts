// Escenarios de las specs que se verifican aquí (openspec/specs/):
// tutorial › Nivel Primeros pasos: "Se gana siguiendo el guion" y "Sin puntaje" → "recorre el tutorial".
// tutorial › Viñetas paso a paso: "Paso Hacer" y "Paso Ver" → "recorre el tutorial" (lo de fuera del hueco no responde).
// tutorial › Final del tutorial: "Terminar" → "recorre el tutorial".
// tutorial › Viñetas accesibles: "Solo teclado" → "solo con teclado".
// tutorial › Saltar el tutorial: "Saltar" y title-screens › Elige tu dificultad: "Primera vez" → "entrada y saltar".
import { expect, test, type Page } from '@playwright/test';
import { currentPart, TUTORIAL, type Expect, type TutorialState } from '../../src/tutorial';

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const list: string[] = [];
  errors.set(page, list);
  page.on('pageerror', (e) => list.push(e.message));
});
test.afterEach(async ({ page }) => expect(errors.get(page)).toEqual([]));

const tutorialOf = (page: Page) =>
  page.evaluate(() => (window as unknown as { store: { getState(): { ui: { tutorial?: TutorialState | null } } } }).store.getState().ui.tutorial ?? null);

/** Lo que se toca en la interfaz para cumplir una parte del guion. */
function selectorFor(e: Expect): string {
  switch (e.type) {
    case 'next':
      return '.coach__next';
    case 'select':
      return `#dock .card--${e.species}`;
    case 'openCard':
      return '#card-btn';
    case 'closeSheet':
      return '#sheet .btn--wide[data-action="close"]';
    case 'tapTile':
      return `#overlay .cell[data-x="${e.x}"][data-y="${e.y}"]`;
    case 'openRecruit':
      return '#dock .card--recruit';
    case 'recruit':
      return `#sheet [data-action="recruit"][data-species="${e.species}"]`;
    case 'chooseSpell':
      return `#sheet [data-spell="${e.spell}"]`;
    case 'endMonth':
      return '#dock .end';
    case 'closeStory':
      return '#story .story__btn--primary';
  }
}

async function noScroll(page: Page) {
  const v = await page.evaluate(() => ({ scrollY: window.scrollY, overflow: document.documentElement.scrollHeight - window.innerHeight }));
  expect(v).toEqual({ scrollY: 0, overflow: 0 });
}

/** Comprueba el globo del paso: texto, contador, que no tape el hueco y botones ≥ 44 px. */
async function checkBubble(page: Page, t: TutorialState) {
  const part = currentPart(t)!;
  const bubble = page.locator('.coach__bubble');
  await expect(bubble).toBeVisible();
  await expect(page.locator('.coach__text')).toHaveText(part.text);
  await expect(page.locator('.coach__count')).toHaveText(`Paso ${t.step + 1} de ${TUTORIAL.length}`);
  const b = (await bubble.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.y).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(vp.width + 1);
  expect(b.y + b.height).toBeLessThanOrEqual(vp.height + 1);
  for (const btn of await bubble.locator('button:visible').all()) expect((await btn.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.locator('.coach__text').evaluate((n) => parseFloat(getComputedStyle(n).fontSize))).toBeGreaterThanOrEqual(16);
}

test('recorre el tutorial: cada paso con su globo, lo demás no responde y termina en «¡Ya sabes jugar!»', async ({ page }, info) => {
  test.setTimeout(240_000);
  const size = ['vertical-390x844', 'horizontal-844x390'].includes(info.project.name) ? info.project.name : null;
  const shot = (name: string) => (size ? page.screenshot({ path: `docs/screenshots/046-${name}-${size}.png` }) : undefined);
  await page.goto('/?nivel=tutorial');
  await expect(page.locator('#game canvas')).toBeVisible();
  // Paso «Ver»: el Árbol Ancestral; el tablero y el dock no responden.
  await expect(page.locator('.coach__next')).toBeFocused();
  await checkBubble(page, { step: 0, part: 0 });
  await page.waitForTimeout(600);
  await shot('paso-ver');
  await page.locator('.cell[data-x="3"][data-y="0"]').click({ force: true });
  await page.locator('#dock .card--champi').click({ force: true });
  expect(await tutorialOf(page)).toEqual({ step: 0, part: 0 });
  await expect(page.locator('#notice')).not.toContainText('Bruno');

  for (let guard = 0; guard < 200; guard++) {
    const t = await tutorialOf(page);
    if (!t) break;
    const part = currentPart(t)!;
    if (part.expect.type !== 'closeStory') await checkBubble(page, t);
    const id = TUTORIAL[t.step]!.id;
    // Capturas de un paso «Hacer» (en el dock), la ficha, reclutar y la ★.
    if (part.expect.type === 'select' && id === 'bruno') { await page.waitForTimeout(400); await shot('paso-hacer'); }
    if (part.expect.type === 'closeSheet') { await page.waitForTimeout(500); await shot('ficha'); }
    if (part.expect.type === 'recruit' && id === 'chispa') { await page.waitForTimeout(500); await shot('reclutar'); }
    if (id === 'star') { await page.waitForTimeout(400); await shot('estrella'); }
    // Sin `force`: el toque tiene que llegar al objetivo a través del hueco.
    await page.locator(selectorFor(part.expect)).click();
    await expect.poll(() => tutorialOf(page)).not.toEqual(t);
  }
  // Final: sin puntaje ni ranking, con «Jugar Brote» y «Volver a la portada».
  const card = page.locator('#story [role="dialog"]');
  await expect(card).toContainText('¡Ya sabes jugar!');
  await expect(card.locator('.score__total, .story__ranking')).toHaveCount(0);
  await expect(page.locator('.coach')).toBeHidden();
  await expect(card.getByRole('button', { name: 'Jugar Brote' })).toBeFocused();
  await shot('final');
  await noScroll(page);
  await card.getByRole('button', { name: 'Jugar Brote' }).click();
  await expect(card).toHaveCount(0);
  await expect(page.locator('.hud__season')).toHaveAttribute('aria-label', 'Primavera · Brote');
  await expect(page.locator('.coach')).toBeHidden();
});

test('solo con teclado: Tab se queda en el objetivo y el globo, Enter avanza y Esc no salta', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio-1280x800', 'teclado en escritorio');
  test.setTimeout(240_000);
  await page.goto('/?nivel=tutorial');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await tutorialOf(page)).toEqual({ step: 0, part: 0 });
  await expect(page.locator('.coach__bubble')).toBeVisible();
  for (let guard = 0; guard < 200; guard++) {
    const t = await tutorialOf(page);
    if (!t) break;
    const part = currentPart(t)!;
    const target = page.locator(selectorFor(part.expect));
    if (part.expect.type !== 'closeStory' && part.expect.type !== 'closeSheet') await expect(target).toBeFocused();
    if (part.expect.type === 'closeSheet') {
      // En la ficha, el foco va a «Entendido».
      await expect(target).toBeFocused();
    }
    if (part.expect.type !== 'closeStory') {
      // Tab da la vuelta sin salir del objetivo y el globo.
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        const inside = await page.evaluate(() => {
          const a = document.activeElement;
          return Boolean(a?.closest('.coach__bubble') || a?.matches('.cell, .card, .end, #card-btn, #sheet button'));
        });
        expect(inside).toBe(true);
      }
      await target.focus();
    }
    await page.keyboard.press('Enter');
    await expect.poll(() => tutorialOf(page)).not.toEqual(t);
  }
  await expect(page.locator('#story [role="dialog"]')).toContainText('¡Ya sabes jugar!');
});

test('entrada y saltar: «Primeros pasos» primero y recomendado; al saltarlo vuelve a los niveles con el foco en Brote', async ({ page }, info) => {
  const size = ['vertical-390x844', 'horizontal-844x390'].includes(info.project.name) ? info.project.name : null;
  const screen = page.locator('#screen');
  await page.goto('/');
  await page.getByRole('button', { name: 'Nueva partida' }).click();
  await expect(screen.locator('.level')).toHaveCount(4);
  await expect(screen.locator('.level').first()).toHaveAttribute('data-level', 'tutorial');
  await expect(screen.locator('[data-level="tutorial"]')).toBeFocused();
  await expect(screen.locator('[data-level="tutorial"]')).toContainText('Recomendado');
  await expect(screen.locator('[data-level="tutorial"]')).not.toContainText('Puntaje');
  for (const b of await screen.locator('.level').all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await noScroll(page);
  if (size) await page.screenshot({ path: `docs/screenshots/046-elegir-nivel-${size}.png` });
  // Primera vez: la intro de siempre y después el primer paso.
  await screen.locator('[data-level="tutorial"]').click();
  const card = page.locator('#story [role="dialog"]');
  await expect(card).toContainText('El bosque se apaga');
  await expect(page.locator('.coach')).toBeHidden();
  await card.getByRole('button', { name: 'Saltar' }).click();
  await expect(page.locator('.coach__bubble')).toBeVisible();
  // Saltar pide confirmar en el mismo globo.
  await page.locator('.coach__skip').click();
  await expect(page.locator('.coach__ask')).toHaveText('¿Saltar el tutorial?');
  await page.getByRole('button', { name: 'No, seguir' }).click();
  await expect(page.locator('.coach__ask')).toBeHidden();
  await page.locator('.coach__skip').click();
  if (size) await page.screenshot({ path: `docs/screenshots/046-saltar-${size}.png` });
  await page.getByRole('button', { name: 'Sí, saltar' }).click();
  await expect(screen.locator('.level')).toHaveCount(4);
  await expect(screen.locator('[data-level="brote"]')).toBeFocused();
  await expect(screen.locator('[data-level="tutorial"]')).not.toContainText('Recomendado');
  // Brote ya no repite la intro.
  await screen.locator('[data-level="brote"]').click();
  await expect(card).toHaveCount(0);
  await expect(page.locator('.coach')).toBeHidden();
});
