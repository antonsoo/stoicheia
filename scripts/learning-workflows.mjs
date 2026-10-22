// biome-ignore-all lint/performance/useDomNodeTextContent: Checks visible learner state.
import assert from "node:assert/strict";
import { openLesson } from "./navigation.mjs";

export async function verifyLearning(page, viewport, accessible, audits) {
  await openLesson(page, 1);
  await page.locator('#step-list [data-step="1"]').click();
  await page.locator("#reading-mode").selectOption("greek");
  assert.equal(await page.locator("#current-passage .greek").isVisible(), true);
  assert.equal(await page.locator("#current-passage .latin").isHidden(), true);
  assert.equal(await page.locator("#current-passage .english").isHidden(), true);
  await page.locator("#reveal-translations").click();
  assert.equal(await page.locator("#current-passage .english").isVisible(), true);
  await page.locator("#next").click();
  assert.equal(await page.locator("#current-passage .english").isHidden(), true);
  await page.locator("#reading-mode").selectOption("latin");
  assert.equal(await page.locator("#current-passage .greek").isHidden(), true);
  assert.equal(await page.locator("#current-passage .latin").isVisible(), true);
  await accessible(page, "Latin-first reading", audits);
  await page.locator("#reading-mode").selectOption("parallel");

  const originalStep = await page.locator("#step-position").innerText();
  const opener = page.locator('#reason [data-foundation="p3"]');
  await opener.click();
  const ids = [
    "d15",
    "d16",
    "d20",
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "cn1",
    "cn2",
    "cn3",
    "cn4",
    "cn5",
  ];
  for (const id of ids) {
    if (viewport.width === 375) await page.locator("#foundation-select").selectOption(id);
    else await page.locator(`.foundation-nav [data-foundation="${id}"]`).click();
    assert.ok(await page.locator("#foundation-content [lang=grc]").last().innerText());
    assert.ok(await page.locator("#foundation-content [lang=la]").last().innerText());
    if (id === "d15") {
      const source = page.locator('#foundation-content [data-source="4"]');
      await source.click();
      await page.waitForFunction(() => {
        const image = document.querySelector("#source-image");
        return image.complete && image.naturalWidth > 0;
      });
      assert.equal(await page.locator("#source-title").innerText(), "Printed page 4");
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#foundation-dialog").evaluate((d) => d.open), true);
      assert.equal(await source.evaluate((b) => b === document.activeElement), true);
      const word = page.locator("#foundation-content .word").first();
      await word.click();
      await page.keyboard.press("Escape");
      assert.equal(await word.evaluate((b) => b === document.activeElement), true);
    }
    if (id === "d20")
      assert.match(await page.locator("#foundation-content").innerText(), /right edge.*clipped/);
    if (id === "cn4")
      assert.match(await page.locator("#foundation-content .eyebrow").innerText(), /VII/);
    if (id === "cn5")
      assert.match(
        await page.locator("#foundation-content [lang=grc]").last().innerText(),
        /\[ἐστιν\]/,
      );
  }
  await accessible(page, "foundations dialog with original texts", audits);
  if (viewport.width === 375) await page.locator("#foundation-select").selectOption("cn3");
  else await page.locator('.foundation-nav [data-foundation="cn3"]').click();
  await page.screenshot({ path: `docs/assets/foundations-${viewport.width}.png` });
  await page.keyboard.press("Escape");
  assert.equal(await opener.evaluate((b) => b === document.activeElement), true);
  assert.equal(await page.locator("#step-position").innerText(), originalStep);

  await page.locator("#open-practice").click();
  const answers = [
    0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 2, 1, 0, 1, 2, 0, 1, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2,
    1, 0, 2, 1, 1, 0, 2, 1,
  ];
  for (let i = 0; i < 40; i++) {
    assert.match(
      await page.locator("#practice-position").innerText(),
      new RegExp(`Reading ${i + 1} of 40`, "i"),
    );
    assert.ok(await page.locator("#practice-source mark").innerText());
    assert.equal(await page.locator("#practice-translation").isHidden(), true);
    await page
      .locator("#practice-options input")
      .nth((answers[i] + 1) % 3)
      .check();
    assert.equal(await page.locator("#practice-feedback").getAttribute("class"), "try-feedback");
    await page.locator("#practice-options input").nth(answers[i]).check();
    assert.equal(
      await page.locator("#practice-feedback").getAttribute("class"),
      "correct-feedback",
    );
    assert.equal(await page.locator("#practice-translation").isVisible(), true);
    assert.ok(await page.locator("#practice-feedback").innerText());
    if (i === 0) {
      await accessible(page, "reading practice with feedback", audits);
      await page.screenshot({ path: `docs/assets/reading-practice-${viewport.width}.png` });
    }
    if (i < 39) await page.locator("#practice-next").click();
  }
  assert.equal(await page.locator("#practice-next").isDisabled(), true);
  await page.locator("#practice-plate").click();
  assert.match(await page.locator("#book-label").innerText(), /Proposition 20/i);
  assert.equal(await page.locator("#step-position").innerText(), "Step 1 of 9");
  assert.equal(await page.locator("#practice-dialog").evaluate((d) => d.open), false);

  // The I.3 exercises refer to the proposition's statement rather than a step.
  // Returning there must move keyboard focus with the visible reading position.
  await openLesson(page, 3);
  await page.locator("#open-practice").click();
  await page.locator("#practice-plate").click();
  assert.equal(await page.locator("#full-reading").evaluate((d) => d.open), true);
  assert.equal(
    await page.locator(".statement").evaluate((s) => s === document.activeElement),
    true,
  );
  await page.locator("#full-reading > summary").click();
}
