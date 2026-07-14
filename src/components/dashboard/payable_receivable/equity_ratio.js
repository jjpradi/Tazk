import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PaidIcon from '@mui/icons-material/Paid';
import PieChartIcon from '@mui/icons-material/PieChart';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

export default function EquityRatio() {
  return (
    <Card sx={{ maxWidth: 170, backgroundColor: 'whitesmoke' }} align='center'>
      <CardContent>
        <Typography sx={{ fontSize: 18, fontWeight: 'bold' }} > Equity Ratio </Typography>
        <hr />
        <PieChartIcon color='success' sx={{ fontSize: 75 }} />
        <Typography sx={{ fontSize: 22, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
          76.40%
        </Typography>
      </CardContent>
    </Card>
  );
}


// Equity Ratio = total equity / total assets