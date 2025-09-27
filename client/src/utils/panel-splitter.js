export function splitPanelAcrossPages({
  selector = '.education-outcomes',   // the current light-blue panel wrapper
  pageHeightMm = 297,                 // A4 height
  marginTopMm = 12,
  marginBottomMm = 12
} = {}) {
  // Use CSS pixels; html2canvas works in CSS px (devicePixelRatio handled by its scale option)
  const PX_PER_MM = 96 / 25.4;
  const usablePx = (pageHeightMm - (marginTopMm + marginBottomMm)) * PX_PER_MM;

  const panels = Array.from(document.querySelectorAll(selector));
  if (!panels.length) return;

  // Ensure layout is settled
  window.scrollTo(0, 0);

  panels.forEach((panel) => {
    // Group content by top-level blocks; if there are bare text nodes, wrap them in <p>
    const blocks = [];
    Array.from(panel.childNodes).forEach((node) => {
      if (node.nodeType === 3 && node.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = node.textContent;
        blocks.push(p);
      } else if (node.nodeType === 1) {
        blocks.push(node);
      }
    });

    if (!blocks.length) return;

    // Build chunked panels
    const frag = document.createDocumentFragment();
    let chunk = makeChunk(panel);
    frag.appendChild(chunk);

    // Start-of-page and current page bottom window
    let pageTopPx = panel.getBoundingClientRect().top + window.scrollY;
    let pageBottomPx = pageTopPx + usablePx;

    // Move original children into chunks, starting fresh DOM for accurate measurement
    blocks.forEach((blk, i) => {
      chunk.appendChild(blk);
      // Measure after adding this block
      const rect = chunk.getBoundingClientRect();
      const chunkBottom = rect.bottom + window.scrollY;

      const wouldCross = chunkBottom > pageBottomPx;
      if (wouldCross) {
        // Remove the block we just added and start a new chunk on a new page
        chunk.removeChild(blk);

        const br = document.createElement('div');
        br.className = 'page-break';
        frag.appendChild(br);

        chunk = makeChunk(panel);
        frag.appendChild(chunk);
        chunk.appendChild(blk);

        // Advance page window
        pageTopPx = rect.top + window.scrollY; // approximate new page start
        pageBottomPx = pageTopPx + usablePx;
      }
    });

    // Replace original panel with the chunked version
    panel.replaceWith(frag);
  });

  function makeChunk(sourcePanel) {
    const chunk = document.createElement('div');
    // Keep a recognizable class for debugging; style via .flow-panel in CSS
    chunk.className = 'flow-panel';
    // Optional: copy border radius/padding if they differ (we already define in CSS)
    // Keep ARIA/role if needed
    if (sourcePanel.getAttribute('role')) {
      chunk.setAttribute('role', sourcePanel.getAttribute('role'));
    }
    return chunk;
  }
}