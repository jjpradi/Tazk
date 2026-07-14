import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { ELEMENT_KEYS, ELEMENT_LABELS } from '../shared/templateLayout';

// Canvas grid: 1 grid column = 1 mm. rowHeight in pixels at the chosen zoom.
const MM_TO_PX = 3.78;

function ElementContent({ k, cfg, sample, format, codeValue, zoom }) {
  if (k === 'code' || k === 'code_secondary') {
    const effectiveFormat = cfg.format || format;
    const wPx = (cfg.w || 18) * MM_TO_PX * zoom;
    const hPx = (cfg.h || 18) * MM_TO_PX * zoom;
    return effectiveFormat === 'barcode'
      ? <Barcode value={String(codeValue)} height={hPx * 0.92}
          width={Math.max(0.7, wPx / 80)} margin={0} displayValue={false} />
      : <QRCode value={String(codeValue)} size={Math.min(wPx, hPx)} />;
  }
  if (k === 'logo') {
    return sample.logo_url
      ? <img src={sample.logo_url} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      : <Typography variant="caption" color="text.disabled">[logo]</Typography>;
  }
  const text = (() => {
    switch (k) {
      case 'name':   return sample.display_name || ELEMENT_LABELS[k].label;
      case 'value':  return codeValue;
      case 'mrp':    return `${cfg.label || ''} ${sample.mrp || '999'}`;
      case 'price':  return `${cfg.label || ''} ${sample.price || '849'}`;
      case 'batch':  return `${cfg.label || ''} ${sample.batch || 'B-1'}`;
      case 'expiry': return `${cfg.label || ''} ${sample.expiry || '12/27'}`;
      default: return '';
    }
  })();
  return (
    <Typography component="div" sx={{
      fontSize: `${(cfg.font_size || 8) * zoom}pt`, fontWeight: cfg.weight || 400,
      textAlign: cfg.align || 'center', lineHeight: 1.15, width: '100%', height: '100%',
      display: 'flex', alignItems: 'center',
      justifyContent: cfg.align === 'right' ? 'flex-end' : (cfg.align === 'left' ? 'flex-start' : 'center'),
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {text}
    </Typography>
  );
}

/**
 * Visual canvas where users drag/resize label elements at mm precision.
 *
 * Props:
 *   layout:      { [key]: { show, x, y, w, h, ... } }   — mm coordinates
 *   widthMm:     label width
 *   heightMm:    label height
 *   format:      'qrcode' | 'barcode'
 *   sample:      sample data for display text
 *   selectedKey: which element is currently selected
 *   onSelect:    (key) => void
 *   onLayoutChange:  (newLayout) => void  — full updated layout
 *   zoom:        canvas magnification (1 = real size at 96dpi)
 */
export default function LabelDesignerCanvas({
  layout, widthMm, heightMm, format = 'qrcode', sample = {},
  selectedKey, onSelect, onLayoutChange, zoom = 3,
}) {
  const codeValue = sample.code_value || 'PREVIEW001';
  const w = (Number(widthMm) || 50);
  const h = (Number(heightMm) || 25);

  // react-grid-layout expects items in {i, x, y, w, h} integer mm units.
  const visibleKeys = ELEMENT_KEYS.filter((k) => layout[k] && layout[k].show !== false);
  const rglItems = useMemo(() => visibleKeys.map((k) => ({
    i: k,
    x: Math.max(0, Math.round(layout[k].x ?? 0)),
    y: Math.max(0, Math.round(layout[k].y ?? 0)),
    w: Math.max(1, Math.round(layout[k].w ?? 4)),
    h: Math.max(1, Math.round(layout[k].h ?? 4)),
  })), [visibleKeys, layout]);

  const rowHeightPx = MM_TO_PX * zoom;
  const colWidthPx  = MM_TO_PX * zoom;
  const canvasWidthPx = w * colWidthPx;
  const canvasHeightPx = h * rowHeightPx;

  const handleLayoutChange = (next) => {
    if (!onLayoutChange) return;
    const updated = { ...layout };
    next.forEach((it) => {
      if (!updated[it.i]) return;
      updated[it.i] = { ...updated[it.i], x: it.x, y: it.y, w: it.w, h: it.h };
    });
    onLayoutChange(updated);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: canvasWidthPx,
        height: canvasHeightPx,
        bgcolor: '#fff',
        border: '1px dashed #cfd8dc',
        // Subtle grid background to communicate "this is mm-paper".
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: `${colWidthPx}px ${rowHeightPx}px`,
        overflow: 'hidden',
      }}
    >
      <GridLayout
        className="layout"
        layout={rglItems}
        cols={w}
        rowHeight={rowHeightPx}
        width={canvasWidthPx}
        margin={[0, 0]}
        containerPadding={[0, 0]}
        compactType={null}
        preventCollision={false}
        allowOverlap
        isBounded
        onLayoutChange={handleLayoutChange}
        // Disable RGL's transitions so dragging feels immediate.
        useCSSTransforms
      >
        {visibleKeys.map((k) => {
          const isSelected = selectedKey === k;
          return (
            <div
              key={k}
              onMouseDown={() => onSelect && onSelect(k)}
              style={{
                outline: isSelected ? '2px solid #1976d2' : '1px solid rgba(25,118,210,0.18)',
                outlineOffset: '-1px',
                background: isSelected ? 'rgba(25,118,210,0.06)' : 'transparent',
                cursor: 'move',
                boxSizing: 'border-box',
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <ElementContent k={k} cfg={layout[k]} sample={sample} format={format} codeValue={codeValue} zoom={zoom * 0.7} />
            </div>
          );
        })}
      </GridLayout>
    </Box>
  );
}
