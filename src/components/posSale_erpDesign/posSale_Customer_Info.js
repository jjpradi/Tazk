import React, {useEffect, useState, useRef, useContext} from 'react';
import CardTemplate from './cardTemplate';
import {Chip, Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useStyles from './cardStyles';

export default function PosSaleCustomerInfo(props) {
  const c = useStyles();
  useEffect(() => {
    setValue(props.posSaleData)
},[props, props.length])
const [value, setValue] = useState([])
  const data =[
    {'count':1,'value':2000,'amount':2000},
    {'count':2,'value':500,'amount':1000},
    {'count':3,'value':100,'amount':300}
  ]
  return (
    <>
          <div style={{ minHeight: 20 }}>
              <Box style={{ minWidth: 175, }}>
                  <Card
                      variant='outlined'
                      sx={{ padding: '10px', minHeight: '120px', backgroundColor: '#fcfffe' }}
                  >
                      <Card style={{ height: '35px', backgroundColor: '#dedede', padding: '0px 0px 0px 0px' }}>
                          <Typography style={{ color: 'black', width: '100%', padding: '0.5em 0em 0em 1em' }}>Customer Info</Typography>
                      </Card>
                      <Typography variant='body1' style={{ fontWeight: '500' }}>
                          {/* <Chip label="Customer Info" style={{backgroundColor:'#427fbd' , color:'white' , width:'100%'}} /> */}
                      </Typography><br />
                      <Typography variant='body1'>
                          Name : <span style={{ fontWeight: '600' }}>{props.posSaleData?.customer_name || ''}</span>
                      </Typography>
                  </Card>
              </Box>
          </div>
          <div style={{ minHeight: 20, marginTop: '10px' }}>
              <Box sx={{ minWidth: 175, }}>
                  <Card
                      variant='outlined'
                      sx={{ padding: '10px', minHeight: '140px' }}
                  >
                      <Card style={{ height: '35px', backgroundColor: '#dedede', padding: '0px 0px 0px 0px' }}>
                          <Typography style={{ color: 'black', width: '100%', padding: '0.5em 0em 0em 1em' }}>Contact : {props.posSaleData?.phone_number || ''} </Typography>
                      </Card>
                      <Typography variant='body1'>
                          {/* <Chip label={"Contact :"+ " " +props.posSaleData?.phone_number || '' }style={{backgroundColor:'#427fbd' , color:'white'}} /> */}
                      </Typography><br />
                      <Typography variant='body1'>

                          Address : <span style={{ fontWeight: '600' }}>{props.posSaleData?.address || ''}</span>
                      </Typography>
                  </Card>
              </Box>
          </div>
          <div style={{ minHeight: 20, marginTop: '10px' }}>
              <Box sx={{ minWidth: 175, }}>
                  <Card
                      variant='outlined'
                      sx={{ padding: '10px', minHeight: '120px' }}
                  >
                      <Card style={{ height: '35px', backgroundColor: '#dedede', padding: '0px 0px 0px 0px' }}>
                          <Typography style={{ color: 'black', width: '100%', padding: '0.5em 0em 0em 1em' }}>Product Info</Typography>
                      </Card>
                      <Typography variant='body1'>
                          {/* <Chip label="Product Info" style={{ backgroundColor: '#427fbd', color: 'white' }} /> */}
                          <span style={{ fontWeight: '600' }}>{props.posSaleData?.productInfo || ''}</span>
                      </Typography> <br />
                      <Typography variant='body1'>
                          Reference Name: <span style={{ fontWeight: '600' }}>{props.posSaleData?.reference || ''}</span>
                      </Typography>
                  </Card>
              </Box>
          </div>
          <div style={{ minHeight: 20, marginTop: '10px' }}>
              <Box sx={{ minWidth: 175, }}>
                  <Card
                      variant='outlined'
                      sx={{ padding: '10px', minHeight: '120px' }}
                  >
                      <Card style={{ height: '35px', backgroundColor: '#dedede', padding: '0px 0px 0px 0px' }}>
                          <Typography style={{ color: 'black', width: '100%', padding: '0.5em 0em 0em 1em' }}>Type</Typography>
                      </Card>
                      <Typography variant='body1'>
                          {/* <Chip label="Type :" style={{backgroundColor:'#427fbd' , color:'white'}} /> */}

                          <span style={{ fontWeight: '500' }}>
                              {props.posSaleData?.type || ''}
                          </span>
                      </Typography>
                  </Card>
              </Box>
          </div>
</>
  );
}
