import React, {useEffect, useContext} from 'react';
import {Card, CardContent, Grid, Typography} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import {listpayinoutdata} from '../../../redux/actions/cashOutIn_actions';
import apiCalls from 'utils/apiCalls';

const Payin = () => {
  const dispatch = useDispatch();

  const {
    CashOutInReducer: {cashPayinOut},
  } = useSelector((state) => state);
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(context);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listpayinoutdata(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, []);


  return (
    <div style={{width: '100%', background: '', paddingBottom: 0}}>
      <Grid
        container
        direction='row'
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        {cashPayinOut.map((d, i) => {
          <Grid style={{padding: 10}}>
            <Card>
              <CardContent style={{padding: '10px 10px 10px 10px'}}>
                <div style={{display: 'flex'}}>
                  <Typography style={{fontSize: '1.2rem', fontWeight: 'bold'}}>
                    Pay In Out
                  </Typography>
                </div>
              </CardContent>
              <CardContent style={{padding: '10px 10px 10px 10px'}}>
                <div style={{display: 'flex'}}>
                  <Typography> Cash Type: {d.cash_type} </Typography>
                </div>
                <div>
                  <Typography> Amount: {d.amount}</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>;
        })}
      </Grid>
    </div>
  );
};

export default Payin;
