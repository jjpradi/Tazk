import React, {useState, useEffect, useRef, useContext} from 'react';
import CardTemplate from './cardTemplate';
import {Chip, Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import context from '../../context/CreateNewButtonContext';
import useStyles from './cardStyles';
import {useDispatch, useSelector} from 'react-redux';
import { listCashBoxDenominationAction} from '../../redux/actions/cash_box_actions';
import apiCalls from 'utils/apiCalls';
import { font14_500 } from 'utils/pageSize';

export default function PosSaleDenominationChange(props) {
  const c = useStyles();
  const dispatch = useDispatch();

  useEffect(() => {
    
},[props, props.posSaleData])
  const tempinitsform = useRef(null);
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
  } = useContext(context);
  const { cashBoxReducer: {cash_box_denomination} } = useSelector((store) => store);
  const initsform = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listCashBoxDenominationAction())
    );
  };

  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);


  return (
    <Box style={{}}>
      <Card variant='outlined' sx={{padding: '10px', width: '100%'}} >
          <Typography variant='body1' component='div' align='left'>
          {/* <Chip label="Change Issued" style={{backgroundColor:'#427fbd' , color:'white'}} /> */}
          Change Issued
              <span style={{fontSize:font14_500.fontSize , fontWeight:600 }} > : {typeof props.posSaleData !== 'undefined' ? props.posSaleData : ''}</span>
          </Typography>
          {props.cash_denomination_details.change.map((i, ind) => (
            <Typography variant='body1' component='div' align='left' key={ind}>
            <span style={{color:'gray'}}>({i.type}) </span> 
            {i.denomination}
            {' '} * {' '}
            {i.count}
          </Typography>
          ))}
          {
              typeof props.posSaleData !== 'undefined' && props.posSaleData !== null && props.posSaleData?.length
                  ? props.posSaleData?.slice(0, 5).map((summary) => {
                      let denomination = cash_box_denomination?.filter(
                        (f) => f.id === summary.denomination_dtl_id,
                      )[0]?.denomination;
                     (
                 
                  <Grid container spacing={2} style={{textAlign:'center'}}>
                      <Grid
                        size={{
                          xs: 6,
                          lg: 2
                        }}>
                      {denomination}
                      </Grid>
                  
                      <Grid
                        size={{
                          xs: 6,
                          lg: 2
                        }}>
                       *
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          lg: 2
                        }}>
                       {summary.current_balance_count}
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          lg: 2
                        }}>
                      -
                      </Grid>
                      <Grid
                        size={{
                          xs: 6,
                          lg: 4
                        }}>
                          {summary.current_balance_count * denomination}
                      </Grid>
                  </Grid>
                         
                      );
                  })
                  :<></>
          }
          
          
          
          
      </Card>
    </Box>
  );
}
