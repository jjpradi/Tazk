import React from 'react';
import {Grid, useTheme} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

const StatCard = ({ label, value, color }) => {
  const theme = useTheme();
  const bgColor = color || theme.palette.primary.main;
  return (
    <Card
      variant='outlined'
      sx={{
        padding: '12px 10px',
        width: '100%',
        borderRadius: '6px',
        textAlign: 'center',
        bgcolor: `${bgColor}14`,
        borderColor: `${bgColor}40`,
        borderWidth: 1,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: bgColor }}>
        {value}
      </Typography>
    </Card>
  );
};

export default function ProductTopCards({salesData}) {
  const theme = useTheme();

  if (!salesData) {
    return null;
  }

  const primary = theme.palette.primary.main;
  const warning = theme.palette.warning.main;
  const info = theme.palette.info.main;
  const error = theme.palette.error.main;
  const success = theme.palette.success.main;

  return (
    <Grid container spacing={2}>
      {salesData?.order_id && (
        <>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
            <StatCard label="SO Number" value={salesData?.so_number || '--'} color={primary} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
            <StatCard label="Ordered Quantity" value={salesData?.ordered_qty || 0} color={info} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
            <StatCard label="Total" value={`₹ ${salesData?.total?.toFixed(2) || '0.00'}`} color={success} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
            <StatCard label="Billed Quantity" value={salesData?.billed_qty || 0} color={warning} />
          </Grid>
        </>
      )}
      {(salesData.dc_id || salesData.sale_id) && (
        <>
          <Grid size={{ xs: 6, sm: salesData.dc_id ? 4 : 3, md: salesData.dc_id ? 4 : 3, lg: salesData.dc_id ? 4 : 3 }}>
            <StatCard
              label={salesData?.return_id ? 'Returned Quantity' : 'Ordered Quantity'}
              value={salesData?.return_id ? salesData?.return_quantity : salesData?.ordered_qty}
              color={info}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: salesData.dc_id ? 4 : 3, md: salesData.dc_id ? 4 : 3, lg: salesData.dc_id ? 4 : 3 }}>
            <StatCard
              label="Billed Quantity"
              value={salesData.dc_id ? salesData.sales_items.reduce((sum, item) => sum + (item.invoice_quantity ?? 0), 0) : salesData?.billed_qty || 0}
              color={warning}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: salesData.dc_id ? 4 : 3, md: salesData.dc_id ? 4 : 3, lg: salesData.dc_id ? 4 : 3 }}>
            <StatCard label="Due Days" value={salesData?.due_days || 0} color={primary} />
          </Grid>
          {salesData.sale_id && (
            <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
              <StatCard
                label="Due Amount"
                value={(salesData?.due_amount || 0) > 0 ? salesData?.due_amount : 0}
                color={error}
              />
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
}
