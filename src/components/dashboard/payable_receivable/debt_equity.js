import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PaidIcon from '@mui/icons-material/Paid';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

export default function DebtEquity() {
  return (
    <Card sx={{ maxWidth: 170, backgroundColor: 'whitesmoke' }} align='center'>
      <CardContent sx={{ justifyContent: 'center' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 'bold', paddingLeft: 2 }} >Debt Equity</Typography>
        <hr />
        <PaidIcon color='primary' sx={{ fontSize: 75 }} />
        <Typography sx={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }} color="text.secondary" gutterBottom>
          1.11%
        </Typography>
      </CardContent>
    </Card>
  );
}

// Debt Equity = total debt / total equity