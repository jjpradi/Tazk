import React from 'react';
import { Box } from '@mui/material';
import LabelPreview from './LabelPreview';

const MM_TO_PX = 3.78;

/**
 * Render N copies of a label according to the chosen layout mode.
 * Used both as the on-screen preview and as the off-screen target of
 * react-to-print.
 *
 * Props:
 *   template:   { width_mm, height_mm, margin_*_mm, gap_x_mm, gap_y_mm,
 *                 rows_per_sheet, cols_per_sheet, layout_json, ... }
 *   format:     'qrcode' | 'barcode'
 *   sample:     { code_value, display_name, ... }   (passed to LabelPreview)
 *   quantity:   number of copies to render
 *   mode:       'single' | 'sheet' | 'roll'
 *   zoom:       number (preview scaling; 1 = real size on screen at 96dpi)
 */
const PrintableLabels = React.forwardRef(function PrintableLabels(
  { template, format, sample, quantity = 1, mode = 'single', zoom = 1 }, ref,
) {
  const t = template || {};
  const labelW = (Number(t.width_mm)  || 50) * MM_TO_PX * zoom;
  const labelH = (Number(t.height_mm) || 25) * MM_TO_PX * zoom;
  const gapX  = (Number(t.gap_x_mm) || 0) * MM_TO_PX * zoom;
  const gapY  = (Number(t.gap_y_mm) || 0) * MM_TO_PX * zoom;
  const cols  = mode === 'sheet' ? Math.max(1, parseInt(t.cols_per_sheet, 10) || 1) : 1;
  const totalCount = mode === 'single' ? 1 : Math.max(1, quantity);

  const items = Array.from({ length: totalCount });

  const containerSx = (() => {
    if (mode === 'single') return { display: 'flex', justifyContent: 'center' };
    if (mode === 'roll') return {
      display: 'grid',
      gridTemplateColumns: `${labelW}px`,
      rowGap: `${gapY}px`,
      justifyContent: 'center',
    };
    // sheet
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${labelW}px)`,
      columnGap: `${gapX}px`,
      rowGap: `${gapY}px`,
      justifyContent: 'center',
    };
  })();

  return (
    <Box
      ref={ref}
      sx={{
        ...containerSx,
        // Hide on screen except inside the print dialog; the print stylesheet
        // (handled by react-to-print) flips this when printing.
      }}
      data-testid="printable-labels"
    >
      {items.map((_, i) => (
        <Box key={i} sx={{ width: labelW, height: labelH, breakInside: 'avoid' }}>
          <LabelPreview template={t} format={format} sample={sample} zoom={zoom} />
        </Box>
      ))}
    </Box>
  );
});

export default PrintableLabels;
