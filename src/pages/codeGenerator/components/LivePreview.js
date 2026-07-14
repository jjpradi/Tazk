import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';

/**
 * Single-label preview. Renders a minimal label card with the encoded
 * code value + display name. Phase 1 = single-mode only; A4-grid and
 * thermal-roll modes come in Phase 6.
 *
 * Props:
 *   value:        the actual string encoded into the symbology
 *   format:       'qrcode' | 'barcode'
 *   displayName:  optional text shown beneath the code
 *   subtext:      optional secondary line (e.g. price)
 */
export default function LivePreview({ value, format, displayName, subtext }) {
  const empty = !value || !String(value).trim();
  return (
    <Card
      sx={{
        p: 2,
        textAlign: 'center',
        border: '1px dashed #cfd8dc',
        boxShadow: 'none',
        bgcolor: '#fafafa',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {empty ? (
        <Typography variant="caption" color="text.disabled">
          Live preview — fill the form to see the code render here.
        </Typography>
      ) : (
        <>
          <Box sx={{ p: 1, bgcolor: '#fff', display: 'inline-block' }}>
            {format === 'barcode' ? (
              <Barcode value={String(value)} height={56} width={1.4} fontSize={12} margin={4} />
            ) : (
              <QRCode value={String(value)} size={140} />
            )}
          </Box>
          {displayName ? (
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </Typography>
          ) : null}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, wordBreak: 'break-all', maxWidth: 220 }}>
            {String(value).length > 40 ? `${String(value).slice(0, 40)}…` : String(value)}
          </Typography>
          {subtext ? (
            <Typography variant="caption" color="text.secondary">{subtext}</Typography>
          ) : null}
        </>
      )}
    </Card>
  );
}
