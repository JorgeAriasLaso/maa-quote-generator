export function paginateOutcomesByCount({
  wrapperSel = '.education-outcomes',     // wrapper of the current big blue panel
  itemSel = '.outcome-item',              // each logical bullet/paragraph inside
  perCard = 6,                            // tweak to fit your layout (try 5–7)
  titleSel = '.section-title',            // optional: selector for the panel title inside wrapper
  insertContinued = true
} = {}) {
  const wrap = document.querySelector(wrapperSel);
  if (!wrap) return;

  const items = Array.from(wrap.querySelectorAll(itemSel));
  if (!items.length) return;

  // Capture/clone the existing title if present
  let titleHTML = '';
  const titleEl = wrap.querySelector(titleSel);
  if (titleEl) titleHTML = titleEl.outerHTML;

  const frag = document.createDocumentFragment();

  for (let i = 0; i < items.length; i += perCard) {
    const card = document.createElement('div');
    card.className = 'outcome-card';

    if (titleHTML) {
      card.insertAdjacentHTML('afterbegin', titleHTML);
      if (insertContinued && i > 0) {
        const cont = document.createElement('div');
        cont.className = 'continued';
        cont.textContent = '(continued)';
        card.appendChild(cont);
      }
    }

    // Make a list/container for this batch
    const list = document.createElement('div');
    list.className = 'outcome-list';
    items.slice(i, i + perCard).forEach(el => list.appendChild(el));
    card.appendChild(list);

    frag.appendChild(card);

    // Put a hard page break between cards (except after the last one)
    if (i + perCard < items.length) {
      const br = document.createElement('div');
      br.className = 'page-break';
      frag.appendChild(br);
    }
  }

  // Replace the original big panel with the paginated cards
  wrap.replaceWith(frag);
}