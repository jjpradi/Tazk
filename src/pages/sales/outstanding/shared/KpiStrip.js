import React from 'react';
import { Box, Card, Typography, useTheme } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

/**
 * Renders the KPI item icon. Accepts:
 *  - string: legacy bitmap/SVG URL → <img>
 *  - function/component reference: MUI icon component → rendered with theme color
 *  - ReactNode: rendered as-is (caller controls everything)
 */
function renderKpiIcon(icon, color) {
  if (!icon) return null;
  if (typeof icon === 'string') {
    return <img src={icon} height={32} width={32} alt="" />;
  }
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof && !icon.props)) {
    const IconComp = icon;
    return <IconComp sx={{ fontSize: 32, color }} />;
  }
  return icon;
}

export default function KpiStrip({ items, iconColor }) {
  const theme = useTheme();
  const color = iconColor || theme.palette.primary.main;
  return (
    <Card sx={{ borderRadius: '2px', p: 1, height: 'auto' }}>
      <Box
        display="flex"
        justifyContent="space-evenly"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        height="100%"
      >
        {items.map((item, i) => (
          <Box
            key={`${item.label}-${i}`}
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ minWidth: 150 }}
          >
            {renderKpiIcon(item.icon, item.iconColor || color)}
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.15 }}>
                {item.prefix === '₹' && (
                  <CurrencyRupeeIcon sx={{ fontSize: '0.85em', verticalAlign: 'middle', mr: '2px' }} />
                )}
                {item.value}
                {item.suffix || ''}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.25, letterSpacing: 0.2 }}>
                {item.label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
