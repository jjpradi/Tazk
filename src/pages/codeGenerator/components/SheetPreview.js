import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import LabelPreview from './LabelPreview';

const MM_TO_PX = 3.78;

// Track a ref'd element's width so we can auto-fit zoom to its container.
function useContainerWidth() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect?.width || 0;
      setW(cw);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

/**
 * Multi-label sheet/roll preview that mirrors what will actually print.
 *
 * Modes:
 *   - 'single' — one label
 *   - 'roll'   — vertical strip of labels (single-column thermal roll)
 *   - 'sheet'  — multi-column grid. For A4 templates the grid sits inside an
 *                A4-shaped page outline so the user sees the full sheet.
 *
 * If `mode` is omitted it auto-resolves from the template:
 *   paper_size starts with 'A4'              → 'sheet' (A4 page outline)
 *   cols_per_sheet > 1                       → 'sheet' (ribbon outline)
 *   paper_size starts with 'thermal'         → 'roll'
 *   else                                     → 'single'
 */
export default function SheetPreview({
  template, format = 'qrcode', sample = {}, mode: modeProp, zoom = 1, copies,
  fitToWidth = false, // when true, auto-scale so the page fits the container
  maxZoom = 4,        // upper bound when fitting
}) {
  const t = template || {};
  const [containerRef, containerW] = useContainerWidth();
  const isA4   = t.paper_size?.startsWith?.('A4');
  const cols   = Math.max(1, parseInt(t.cols_per_sheet, 10) || 1);
  const rows   = Math.max(1, parseInt(t.rows_per_sheet, 10) || 1);
  const isMulti = cols > 1;

  const mode = modeProp || (
    isA4   ? 'sheet'
  : isMulti ? 'sheet'
  : t.paper_size?.startsWith?.('thermal') ? 'roll'
  : 'single'
  );

  const baseLabelWmm = Number(t.width_mm) || 50;
  const baseGapXmm   = Number(t.gap_x_mm) || 0;
  const baseMlMm     = Number(t.margin_left_mm)  || 0;
  const baseMrMm     = Number(t.margin_right_mm) || 0;
  // Compute the page width in mm BEFORE zoom is applied so we can derive the
  // fit-to-width zoom factor.
  const pageWmmRaw = isA4 ? 210 : (cols > 1
    ? cols * baseLabelWmm + (cols - 1) * baseGapXmm + baseMlMm + baseMrMm
    : baseLabelWmm);

  // If fitToWidth, override the incoming zoom prop so the page fills the
  // container (with a small inset for borders / padding). Cap by maxZoom.
  const effectiveZoom = (() => {
    if (!fitToWidth || !containerW || pageWmmRaw <= 0) return zoom;
    const target = (containerW - 8) / (pageWmmRaw * MM_TO_PX);
    return Math.max(0.2, Math.min(maxZoom, target));
  })();
  const z = effectiveZoom;

  const labelWmm = Number(t.width_mm)  || 50;
  const labelHmm = Number(t.height_mm) || 25;
  const gapXmm   = Number(t.gap_x_mm)  || 0;
  const gapYmm   = Number(t.gap_y_mm)  || 0;
  const mtMm     = Number(t.margin_top_mm)    || 0;
  const mlMm     = Number(t.margin_left_mm)   || 0;
  const mrMm     = Number(t.margin_right_mm)  || 0;
  const mbMm     = Number(t.margin_bottom_mm) || 0;

  // Page geometry — A4 fixed; thermal ribbon = cols × labelW + gaps + margins.
  const pageWmm = isA4 ? 210 : (isMulti ? cols * labelWmm + (cols - 1) * gapXmm + mlMm + mrMm : labelWmm);
  const pageHmm = isA4 ? 297 : (mode === 'roll'
    ? (rows * labelHmm + (rows - 1) * gapYmm + mtMm + mbMm)
    : labelHmm);

  // Default copy count — show full sheet for A4, full ribbon row for thermal,
  // or 6 for a roll, or 1 for single.
  const fullSheet = cols * rows;
  const totalCount = (() => {
    if (copies && copies > 0) return copies;
    if (mode === 'sheet') return Math.min(fullSheet, isA4 ? fullSheet : cols);
    if (mode === 'roll')  return 6;
    return 1;
  })();

  const items = useMemo(() => Array.from({ length: totalCount }), [totalCount]);

  const labelWpx = labelWmm * MM_TO_PX * z;
  const labelHpx = labelHmm * MM_TO_PX * z;
  const pageWpx  = pageWmm  * MM_TO_PX * z;
  const pageHpx  = pageHmm  * MM_TO_PX * z;
  const gapXpx   = gapXmm   * MM_TO_PX * z;
  const gapYpx   = gapYmm   * MM_TO_PX * z;
  const mtPx     = mtMm     * MM_TO_PX * z;
  const mlPx     = mlMm     * MM_TO_PX * z;

  // Single label — just delegate to LabelPreview.
  if (mode === 'single') {
    return (
      <Box ref={containerRef} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <LabelPreview template={t} format={format} sample={sample} zoom={z} />
      </Box>
    );
  }

  const gridSx = mode === 'roll'
    ? { display: 'grid', gridTemplateColumns: `${labelWpx}px`, rowGap: `${gapYpx}px` }
    : { display: 'grid', gridTemplateColumns: `repeat(${cols}, ${labelWpx}px)`,
        columnGap: `${gapXpx}px`, rowGap: `${gapYpx}px` };

  // For A4 sheet: draw a paper outline with margin offsets.
  // For thermal multi-up ribbon: draw a single page outline.
  return (
    <Box ref={containerRef} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 0.5, width: '100%' }}>
      <Typography variant="caption" color="text.secondary">
        {isA4
          ? `A4 sheet — ${cols} × ${rows} = ${fullSheet} stickers (${labelWmm} × ${labelHmm} mm each)`
          : mode === 'sheet'
            ? `${cols}-up ribbon — ${pageWmm.toFixed(1)} × ${labelHmm} mm`
            : `Thermal roll — ${labelWmm} × ${labelHmm} mm × ${totalCount} labels`}
      </Typography>
      <Box
        sx={{
          width:  pageWpx,
          height: mode === 'roll' ? 'auto' : pageHpx,
          bgcolor: '#fff',
          border: isA4 ? '1px solid #b0bec5' : '1px dashed #b0bec5',
          boxShadow: isA4 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          paddingTop:    `${mtPx}px`,
          paddingLeft:   `${mlPx}px`,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <Box sx={gridSx}>
          {items.map((_, i) => (
            <Box key={i} sx={{ width: labelWpx, height: labelHpx }}>
              <LabelPreview template={t} format={format} sample={sample} zoom={zoom} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
