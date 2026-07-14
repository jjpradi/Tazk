import React, {useState, useEffect, useRef} from 'react';
import CardTemplate from './cardTemplate';
import {Chip, Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useStyles from './cardStyles';
import { font14_500 } from 'utils/pageSize';

export default function PosSalePaymentMode(props) {
  const c = useStyles();

  useEffect(() => {

  },[props,props.posSaleData])

  const data =[
    {'type':'Cash','amount':1000},
    {'type':'Upi','amount':500},
    {'type':'Cheque','amount':700}
  ]

  return (
      <Box style={{}}>
          <Card variant='outlined' sx={{padding: '10px', width: '100%'}} >
              <Typography variant='body1' component='div' align='left'>
              {/* <Chip label="Payment Mode" style={{backgroundColor:'#427fbd' , color:'white'}} /> */}
              Payment Mode
              </Typography>
              {
                  props.posSaleData ? props.posSaleData.map((f , index) => (
                      <div style={{marginLeft:'60px'}} key={index}>
                          <ul>
                              <li >
                                  <Grid container spacing={2} style={{textAlign:'center'}}>
                                      <Grid
                                          style={{fontSize:font14_500.fontSize , fontWeight:font14_500.fontWeight}}
                                          size={{
                                              xs: 6,
                                              lg: 3
                                          }}>
                                      {f?.payment_type}
                                      </Grid>
                                  
                                      <Grid
                                          size={{
                                              xs: 6,
                                              lg: 3
                                          }}>
                                      -
                                      </Grid>
                                      <Grid
                                          size={{
                                              xs: 6,
                                              lg: 3
                                          }}>
                                          <Typography style={{fontSize:font14_500.fontSize , fontWeight:600}}>{f?.payment_amount}</Typography>
                                      </Grid>
                                  </Grid>
                              </li>
                          </ul>
                      </div>
                  )) : 
                  []
              }
              
              
          </Card>
      </Box>
  );
}
