export async function openLesson(page, proposition) {
  if (await page.locator("#lesson-select").isVisible())
    await page.locator("#lesson-select").selectOption(String(proposition));
  else await page.locator(`.lesson-tab[data-lesson="${proposition}"]`).click();
}
