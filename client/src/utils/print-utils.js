export function applySmartPageBreaks({
  pageHeightMm = 297,    // A4
  topBottomMarginMm = 24 // total (e.g., 12mm top + 12mm bottom)
} = {}) {
  const pxPerMm = window.devicePixelRatio ? (96 / 25.4) * window.devicePixelRatio : (96 / 25.4);
  const contentHeightPx = Math.floor((pageHeightMm - topBottomMarginMm) * pxPerMm);

  const keepers = Array.from(document.querySelectorAll('.keep'));
  if (!keepers.length) return;

  // Ensure we measure from the top
  window.scrollTo(0, 0);

  let pageTopPx = 0;
  let pageBottomPx = contentHeightPx;

  for (const el of keepers) {
    const rect = el.getBoundingClientRect();
    const elTop = rect.top + window.scrollY;
    const elBottom = rect.bottom + window.scrollY;

    // If this element would cross the current page bottom, force a page break before it
    if (elBottom > pageBottomPx) {
      const br = document.createElement('div');
      br.className = 'page-break';
      el.parentNode.insertBefore(br, el);

      // Advance the page window to start after the break
      pageTopPx = elTop;
      pageBottomPx = pageTopPx + contentHeightPx;
    }
  }
}