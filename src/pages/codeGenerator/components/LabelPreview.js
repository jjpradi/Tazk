import React from 'react';
import { Box, Typography } from '@mui/material';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { mergeWithDefaults, isPositionedLayout, ELEMENT_KEYS } from '../shared/templateLayout';

const MM_TO_PX = 3.78;

// Resolve the human-readable text for an element.
function valueFor(key, sample) {
  switch (key) {
    case 'name':   return sample.display_name;
    case 'value':  return sample.code_value;
    case 'mrp':    return sample.mrp;
    case 'price':  return sample.price;
    case 'batch':  return sample.batch;
    case 'expiry': return sample.expiry;
    default: return null;
  }
}

function renderElement(key, cfg, sample, format, codeValue, zoom) {
  if (!cfg || cfg.show === false) return null;

  if (key === 'code' || key === 'code_secondary') {
    // Per-element format wins over the print-time format toggle. This lets a
    // single label carry both a QR (cfg.format='qrcode') and a barcode
    // (cfg.format='barcode') simultaneously.
    const effectiveFormat = cfg.format || format;
    const wPx = (cfg.w || 18) * MM_TO_PX * zoom;
    const hPx = (cfg.h || 18) * MM_TO_PX * zoom;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        {effectiveFormat === 'barcode' ? (
          <Barcode value={String(codeValue)} height={hPx * 0.92}
            width={Math.max(0.7, wPx / 80)} fontSize={9 * zoom} margin={0} displayValue={false} />
        ) : (
          <QRCode value={String(codeValue)} size={Math.min(wPx, hPx)} />
        )}
      </Box>
    );
  }

  if (key === 'logo') {
    if (!sample.logo_url) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <img src={sample.logo_url} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </Box>
    );
  }

  const v = valueFor(key, sample);
  if (v == null || v === '') return null;
  return (
    <Typography
      component="div"
      sx={{
        fontSize: `${(cfg.font_size || 8) * zoom}pt`,
        fontWeight: cfg.weight || 400,
        textAlign: cfg.align || 'center',
        lineHeight: 1.15,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: cfg.align === 'right' ? 'flex-end' : (cfg.align === 'left' ? 'flex-start' : 'center'),
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label ? `${cfg.label} ` : ''}{String(v)}
    </Typography>
  );
}

export default function LabelPreview({ template, format = 'qrcode', sample = {}, zoom = 1 }) {
  const t = template || {};
  const layout = mergeWithDefaults(t.layout_json);

  const w = (Number(t.width_mm) || 50) * MM_TO_PX * zoom;
  const h = (Number(t.height_mm) || 25) * MM_TO_PX * zoom;
  const padTop    = (Number(t.margin_top_mm)    || 0) * MM_TO_PX * zoom;
  const padBottom = (Number(t.margin_bottom_mm) || 0) * MM_TO_PX * zoom;
  const padLeft   = (Number(t.margin_left_mm)   || 0) * MM_TO_PX * zoom;
  const padRight  = (Number(t.margin_right_mm)  || 0) * MM_TO_PX * zoom;

  const codeValue = sample.code_value || 'PREVIEW001';
  const positioned = isPositionedLayout(layout);

  const containerSx = {
    width: w, height: h, bgcolor: '#fff', border: '1px dashed #cfd8dc',
    boxSizing: 'border-box', overflow: 'hidden', position: 'relative',
  };

  // ---- Positioned mode (Phase 4b) ----
  if (positioned) {
    return (
      <Box sx={containerSx}>
        {/* Padding zone is implicit — elements are placed in absolute coords
            relative to the label's top-left, in mm. */}
        {ELEMENT_KEYS.map((k) => {
          const cfg = layout[k];
          if (!cfg || cfg.show === false) return null;
          const x = (cfg.x || 0) * MM_TO_PX * zoom;
          const y = (cfg.y || 0) * MM_TO_PX * zoom;
          const ew = (cfg.w || 4) * MM_TO_PX * zoom;
          const eh = (cfg.h || 4) * MM_TO_PX * zoom;
          return (
            <Box
              key={k}
              sx={{
                position: 'absolute', left: x, top: y, width: ew, height: eh,
                overflow: 'hidden',
              }}
            >
              {renderElement(k, cfg, sample, format, codeValue, zoom)}
            </Box>
          );
        })}
      </Box>
    );
  }

  // ---- Fallback: stacked layout for templates without positions ----
  const codeSize = (Number(layout.code.size_mm) || (layout.code.w || 18)) * MM_TO_PX * zoom;
  return (
    <Box
      sx={{
        ...containerSx,
        paddingTop: `${padTop}px`,
        paddingBottom: `${padBottom}px`,
        paddingLeft: `${padLeft}px`,
        paddingRight: `${padRight}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {layout.logo.show && sample.logo_url ? (
        <img src={sample.logo_url} alt="logo"
          style={{ height: (layout.logo.height_mm || layout.logo.h || 6) * MM_TO_PX * zoom, objectFit: 'contain' }} />
      ) : null}
      {layout.code.show !== false ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {format === 'barcode' ? (
            <Barcode value={String(codeValue)} height={codeSize * 0.9}
              width={Math.max(0.8, codeSize / 60)} fontSize={9 * zoom} margin={0} displayValue={false} />
          ) : (
            <QRCode value={String(codeValue)} size={codeSize} />
          )}
        </Box>
      ) : null}
      {['name','value','batch'].map((k) => {
        const cfg = layout[k]; const v = valueFor(k, sample);
        if (!cfg || cfg.show === false || v == null || v === '') return null;
        return (
          <Typography key={k} component="div" sx={{
            fontSize: `${(cfg.font_size || 8) * zoom}pt`, fontWeight: cfg.weight || 400,
            textAlign: cfg.align || 'center', lineHeight: 1.15, width: '100%',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {cfg.label ? `${cfg.label} ` : ''}{String(v)}
          </Typography>
        );
      })}
      <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
        {['mrp','price'].map((k) => {
          const cfg = layout[k]; const v = valueFor(k, sample);
          if (!cfg || cfg.show === false || v == null || v === '') return null;
          return (
            <Typography key={k} component="div" sx={{
              fontSize: `${(cfg.font_size || 8) * zoom}pt`, fontWeight: cfg.weight || 400,
              textAlign: cfg.align || 'center', lineHeight: 1.15,
            }}>
              {cfg.label ? `${cfg.label} ` : ''}{String(v)}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
}
