import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const CardTemplate = ({cardTitle, value, v1 = 'body1', v2 = 'h6'}) => {
  return (
    <Box>
      <Card variant='outlined' sx={{width: '100%'}}>
        {/* <CardContent> */}
        <Typography variant={v1} component='div' align='center'>
          {cardTitle}
        </Typography>

        <Typography variant={v2} align='center'>
          {value}
        </Typography>
        {/* </CardContent> */}
      </Card>
    </Box>
  );
};

export default CardTemplate;
