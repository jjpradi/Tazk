import React from 'react';
import {Grid, useTheme} from '@mui/material';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

const StatCard = ({ label, value, color }) => {
  const theme = useTheme();
  const bgColor = color || theme.palette.primary.main;
  return (
    <Card
      variant='outlined'
      sx={{
        padding: '12px 10px', width: '100%', borderRadius: '6px', textAlign: 'center',
        bgcolor: `${bgColor}14`, borderColor: `${bgColor}40`, borderWidth: 1,
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: bgColor }}>{value}</Typography>
    </Card>
  );
};

export default function ProductTopCards({recevingData}) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const warning = theme.palette.warning.main;
  const info = theme.palette.info.main;
  const error = theme.palette.error.main;
  const success = theme.palette.success.main;

  return (
    <Grid container spacing={2}>
      {recevingData?.type === 'po' && (
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
          <StatCard label="PO Number" value={recevingData?.po_number || ''} color={primary} />
        </Grid>
      )}
      <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
        <StatCard label="Ordered Qty" value={recevingData?.ordered_qty || 0} color={info} />
      </Grid>
      {recevingData?.type === 'po' && (
        <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
          <StatCard label="Total" value={`₹ ${recevingData?.total?.toFixed(2) || '0.00'}`} color={success} />
        </Grid>
      )}
      <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
        <StatCard label="Billed Qty" value={recevingData?.delivered_qty || 0} color={warning} />
      </Grid>
      {recevingData?.type === 'bills' && (
        <>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
            <StatCard label="Due Days" value={recevingData?.due_days || 0} color={primary} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 3 }}>
            <StatCard label="Due Amount" value={recevingData?.due_amount || 0} color={error} />
          </Grid>
        </>
      )}
    </Grid>
  );
}
