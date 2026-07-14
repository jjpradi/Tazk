import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';

const CardTemplate = ({cardTitle, value, v1 = 'body1', v2 = 'h6'}) => {
  return (
    <Box  >
      <Card variant='outlined' sx={{width: '100%', borderRadius: 2 }}>
        {/* <CardContent> */}
        {/* <Typography variant='h6' component='div' align='left'>
          {cardTitle}
        </Typography> */}
        <Grid display={'flex'} alignItems={'center'} paddingLeft={'10px'}>
          <Typography variant='h6' component='div' align='left' fontSize='12px' fontWeight='bold'>
          {cardTitle}
        </Typography>
        <Typography variant='h7' align='left' sx={{ ml: 1 }}>
            - {value}
        </Typography>

        </Grid>
        {/* </CardContent> */}
      </Card>
    </Box>
  );
};

export default CardTemplate;
