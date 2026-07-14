import React, {useState, useEffect, useContext} from 'react';
import {Card, CardContent, Grid, Typography} from '@mui/material';
import {cashInHand} from '../../../redux/actions/cash_box_actions';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import apiCalls from 'utils/apiCalls';

const CashInHand = () => {
  const dispatch = useDispatch();

  const {
    cashBoxReducer: {cashBox},
    cashBoxReducer: {cash_box_cashInHand},
  } = useSelector((state) => state);
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(context);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(cashInHand(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, [cashBox]);


  return (
    <div style={{width: '100%', background: '', paddingBottom: 0}}>
      <Grid container direction='row'>
        {cash_box_cashInHand.map((v, i) => (
          <Grid style={{padding: 10, width: 350, height: 180}}>
            <Card
              style={{
                background: '#2d2d2d',
                color: 'white',
                borderRadius: '10px 0px 10px 0px',
                boxShadow: 'green',
              }}
            >
              <CardContent style={{padding: '10px 10px 10px 10px'}}>
                <div style={{display: 'flex'}}>
                  <Typography style={{fontSize: '1.2rem', fontWeight: 'bold'}}>
                    Cash In Hand
                  </Typography>
                </div>
              </CardContent>
              <CardContent style={{padding: '10px 10px 10px 10px'}}>
                <div style={{color: 'green', alignSelf: 'right'}}>
                  <ShowChartIcon fontSize='large' />{' '}
                </div>
                <Typography style={{}}> Rs: {v.closing_balance} </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
export default CashInHand;
