import React, {useEffect, useContext} from 'react';
import {Card, CardContent, Grid, Typography, TextField} from '@mui/material';
import {daysales} from '../../../redux/actions/sales_actions';
import {useDispatch, useSelector} from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import apiCalls from 'utils/apiCalls';

const DaySales = () => {
  const dispatch = useDispatch();

  const {
    salesReducer: {sales},
    salesReducer: {day_sales},
  } = useSelector((state) => state);
  const {setLoaderStatusHandler, setModalTypeHandler} = useContext(context);

  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(daysales(setModalTypeHandler, setLoaderStatusHandler))
    );
  }, []);


  return (
    <div style={{width: '100%', background: '', paddingBottom: 0}}>
      <Grid container direction='row'>
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <LocalizationProvider dateAdapter={DateAdapter}>
            <DatePicker
              name="from"
              label="From Date"
              inputVariant="outlined"
              inputFormat="DD/MM/yyyy"
              // error={error}
              // value={this.state.from === null ? this.state.from : this.state.from}
              //  onChange={(date) =>
              //    this.handleChange({
              //      target: { value: date, name: "from" },
              //    })
              //  }
              fullWidth={true}
              renderInput={(params) => <TextField {...params} fullWidth={true} />}
            />
          </LocalizationProvider>
        </Grid> */}

        {/* {day_sales.map((d, i) =>
          <Grid style={{ padding: 10, width: 350, height: 180 }}>
            <Card>
              <CardContent style={{ padding: '10px 10px 10px 10px' }}>
                <div style={{ display: 'flex' }}>
                  <Typography style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Day Sales</Typography>
                </div>
              </CardContent>
              <CardContent style={{ padding: '10px 10px 10px 10px' }}>
                <div style={{ display: 'flex' }}>
                  <Typography style={{}}> Customer ID: {d.customer_id} </Typography>
                </div>
                <div>
                  <Typography> sale_timer: {d.sale_time}</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        )} */}
        {day_sales
          .filter((d) => {
            const dateObj = new Date();
            let date = dateObj.getUTCDate().toString();
            let month = (dateObj.getUTCMonth() + 1).toString();
            let year = dateObj.getUTCFullYear().toString();
            if (month.length === 1) {
              month = `0${month}`;
            }
            const fullDate = `${year}-${month}-${date}`;
            const salesDate = d.sale_time.split(' ');
            if (salesDate[0] === fullDate) {
              return true;
            }
            return false;
          })
          .map((d, i) => (
            <Grid style={{padding: 10, width: 350, height: 180}} key={i}>
              <Card>
                <CardContent style={{padding: '10px 10px 10px 10px'}}>
                  <div style={{display: 'flex'}}>
                    <Typography
                      style={{fontSize: '1.2rem', fontWeight: 'bold'}}
                    >
                      Day Sales
                    </Typography>
                  </div>
                </CardContent>
                <CardContent style={{padding: '10px 10px 10px 10px'}}>
                  <div style={{display: 'flex'}}>
                    <Typography style={{}}>
                      {' '}
                      Customer ID: {d.customer_id}{' '}
                    </Typography>
                  </div>
                  <div>
                    <Typography> sale_timer: {d.sale_time}</Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </div>
  );
};

export default DaySales;
