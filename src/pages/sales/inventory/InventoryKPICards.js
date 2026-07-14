import React from 'react';
import { Box, Card, Grid, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import AttachMoneyIcon from '@mui/icons-material/CurrencyRupee';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';

const kpiCardSx = {
  p: 2,
  borderRadius: 2,
  bgcolor: '#F4F7FE',
  border: '1px solid #E8EDF5',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  transition: 'box-shadow 0.2s',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(10,143,220,0.10)',
  },
};

const iconBoxSx = (color) => ({
  width: 40,
  height: 40,
  borderRadius: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: color,
  flexShrink: 0,
});

function InventoryKPICards({ grandTotal = 0, totalAvailableQty = 0, totalProducts = 0 }) {
  const cards = [
    {
      label: 'Total Value',
      value: `\u20B9${Number(grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <AttachMoneyIcon sx={{ color: '#fff', fontSize: 22 }} />,
      iconBg: '#0A8FDC',
    },
    {
      label: 'Available Qty',
      value: Number(totalAvailableQty).toLocaleString('en-IN'),
      icon: <InventoryIcon sx={{ color: '#fff', fontSize: 22 }} />,
      iconBg: '#11C15B',
    },
    {
      label: 'Total Products',
      value: Number(totalProducts).toLocaleString('en-IN'),
      icon: <CategoryIcon sx={{ color: '#fff', fontSize: 22 }} />,
      iconBg: '#FF8B3E',
    },
  ];

  return (
    <Grid container spacing={1.5}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ lg: 4, md: 4, sm: 4, xs: 12 }}>
          <Card sx={kpiCardSx} elevation={0}>
            <Box sx={iconBoxSx(card.iconBg)}>
              {card.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>
                {card.label}
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2E3A59', lineHeight: 1.4 }}>
                {card.value}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default InventoryKPICards;
