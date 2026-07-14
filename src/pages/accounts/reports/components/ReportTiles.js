import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { fmtINR } from '../reportUtils';

/**
 * ReportTiles — Enterprise-grade summary KPI cards.
 *
 * @param {{ tiles: Array<{ label, value, description?, color?, icon?, format? }> }} props
 */
const ReportTiles = ({ tiles = [] }) => {
  if (!tiles.length) return null;

  const formatValue = (t) => {
    if (t.format === 'text' || typeof t.value === 'string') return t.value;
    if (t.format === 'count') return Number(t.value || 0).toLocaleString('en-IN');
    return fmtINR(t.value);
  };

  const getIcon = (t) => {
    if (t.icon) return t.icon;
    const label = (t.label || '').toLowerCase();
    if (label.includes('voucher') || label.includes('ledger')) return <ReceiptLongIcon sx={{ fontSize: 20 }} />;
    if (t.color === '#D32F2F' || t.color === '#d32f2f' || (Number(t.value) < 0 && t.format !== 'text')) return <TrendingDownIcon sx={{ fontSize: 20 }} />;
    if (t.color === '#2E7D32' || t.color === '#2e7d32') return <TrendingUpIcon sx={{ fontSize: 20 }} />;
    return <AccountBalanceIcon sx={{ fontSize: 20 }} />;
  };

  const getBgTint = (t) => {
    if (t.color === '#D32F2F' || t.color === '#d32f2f') return '#FDECEA';
    if (t.color === '#2E7D32' || t.color === '#2e7d32') return '#D9F5E5';
    return '#E1F5FE';
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
      {tiles.map((t, i) => (
        <Card
          key={i}
          sx={{
            flex: '1 1 180px',
            maxWidth: 240,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            '&:hover': {
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  mb: 0.75,
                }}
              >
                {t.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Roboto Mono", monospace',
                  fontSize: t.format === 'count' ? '1.25rem' : '1.1rem',
                  fontWeight: 700,
                  color: t.color || 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                {formatValue(t)}
                {t.suffix && (
                  <Typography component="span" sx={{ fontSize: 11, fontWeight: 500, ml: 0.5, color: 'text.secondary' }}>
                    {t.suffix}
                  </Typography>
                )}
              </Typography>
              {t.description && (
                <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.5, lineHeight: 1.3 }}>
                  {t.description}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: getBgTint(t),
                color: t.color || 'primary.main',
                flexShrink: 0,
                ml: 1,
              }}
            >
              {getIcon(t)}
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default ReportTiles;
