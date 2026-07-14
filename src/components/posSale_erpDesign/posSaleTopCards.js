import React, {useEffect, useState, useRef, useContext} from 'react';
import CardTemplate from './cardTemplate';
import {CardContent, Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useStyles from './cardStyles';

export default function PosSaleTopCards(props) {
  const c = useStyles();
  const [ value, setValue] = useState([]);
  useEffect(() => {
    
  },[props, props.length])

  return (
    <Grid container display='flex' flexDirection='row' spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 3,
          md: 3,
          lg: 3
        }}>
        <Box>
          <Card
            // className={c.green}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
          <Typography variant='body1' component='div' align='center'>
              Invoice Number
            </Typography>

            <Typography variant='h6' align='center'>
              {props.posSaleData?.invoice_number || 0}
            </Typography>
          </Card>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
          md: 3,
          lg: 3
        }}>
        <Box>
          <Card
            // className={c.green}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
            <Typography variant='body1' component='div' align='center'>
              Date & Time
            </Typography>

            <Typography variant='h6' align='center'>
            {props.posSaleData?.sale_time || ''}
            </Typography>
          </Card>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
          md: 3,
          lg: 3
        }}>
        <Box>
          <Card
            // className={c.yellow}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
            <Typography variant='body1' component='div' align='center'>
              Location
            </Typography>

            <Typography variant='h6' align='center'>
            {props.posSaleData?.location_name || ''}
            </Typography>
          </Card>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
          md: 3,
          lg: 3
        }}>
        <Box>
          <Card
            // className={c.red}
            variant='outlined'
            sx={{padding: '10px', width: '100%'}}
          >
            <Typography variant='body1' component='div' align='center'>
              Sold By
            </Typography>

            <Typography variant='h6' align='center'>
              
            {props.posSaleData?.companyFullName || ''}
            </Typography>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
}
