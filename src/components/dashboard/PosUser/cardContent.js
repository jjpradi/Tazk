import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Card, Stack } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalSaleLocationBarAction, totalSaleByDateAction } from 'redux/actions/pos_sale_actions';
import { getPosUserDashBoardCashInHandAction } from 'redux/actions/pos_session';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import Cards from '../../dynamicCards/index';
import salesIcon from '../../../assets/dashboardIcons/commission_sale.svg';
import cahinhandIcon from '../../../assets/dashboardIcons/money.svg';
import targetIcon from '../../../assets/dashboardIcons/target.svg';
import apiCalls from 'utils/apiCalls';

const CardDesign = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date().getDate())
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const {
    posSaleReducer: { totalSaleByDate },
    posSessionReducer: { pos_userDashBoard_cashInHand }
  } = useSelector((state) => state);

  useEffect(() => {
    if(props.inView){
      if(typeof commoncookie !== 'undefined'){
        let todayDate = new Date();
        let firstDay = todayDate.getMonth() <= 2 ? new Date(todayDate.getFullYear()-1, 3, 1) : new Date(todayDate.getFullYear(), 3, 1);
        let lastDay = todayDate.getMonth()  <= 2 ? new Date(todayDate.getFullYear(), 3, 0) : new Date(todayDate.getFullYear()+1, 3, 0);
        
        let data = {
          fromDate : moment(firstDay).format('YYYY-MM-DD'),
          toDate: moment(lastDay).format('YYYY-MM-DD'),
          employeeId : commoncookie
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(totalSaleByDateAction({date, month, year}, setModalTypeHandler, setLoaderStatusHandler)),
          dispatch(getPosUserDashBoardCashInHandAction(data, setModalTypeHandler, setLoaderStatusHandler))
        );
      }

    }
  }, [commoncookie, props.inView]);

  return (
    <>
      <Grid container>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            container
            direction='row'
          
          >
            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Card>
                <CardContent> */}
            <Cards>
              {/* <Typography
                variant='h9'
                gutterBottom
              > */}
                <Grid container paddingLeft={3}>
                  <Grid >
                    <img src={salesIcon} height={70} width={50} />
                  </Grid>
                  <Grid>
                  <Stack direction="row" alignItems="center" gap={1} pt= '10px' pl= '7px'>
                  <CurrencyRupeeIcon fontSize='inherit' />
                  <Typography component='h2'variant='h6'>
                      <span >{totalSaleByDate?.total === undefined? "0.00" : (totalSaleByDate?.total.toFixed(2)).toLocaleString()}</span>
                    </Typography>
                    </Stack>
                    <Typography color='textSecondary' variant='h9'> <span style={{ paddingLeft: '10px'}}>{"Today's Sales"}</span> </Typography>
                  </Grid>
                </Grid>
                {/* <AddchartIcon style={{paddingTop: '5px'}} color='primary' />{' '} */}
              {/* </Typography> */}
              {/* <Typography style={{marginBottom: 12}} color='textSecondary'>
                    <span style={{color: 'red', paddingBottom: '5px'}}>
                      <ArrowDownwardIcon style={{paddingTop: '8px'}} />
                      20.2%
                    </span>{' '}
                    from last month
                  </Typography> */}
            </Cards>
            {/* </CardContent>
              </Card>
            </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Card>
                <CardContent> */}
            <Cards>
              {/* <Typography
               variant='h9'
                gutterBottom
              > */}
                <Grid container paddingLeft={3}>
                  <Grid>
                    <img src={cahinhandIcon} height={70} width={50} />
                  </Grid>
                <Grid>
                <Stack direction="row" alignItems="center" gap={1} pt= '10px' pl= '7px'>
                  <CurrencyRupeeIcon fontSize='inherit' />
                  <Typography component='h2'variant='h6'>
                  <span >{pos_userDashBoard_cashInHand.toFixed(2)}</span>
                    </Typography>
                    </Stack>
                    <Typography variant='h9' color='textSecondary'>
                      <span style={{ paddingLeft: '10px' }}>
                        Cash in Hand
                      </span>
                    </Typography>
                  </Grid>
                </Grid>
                {/* <ImportExportIcon
                  style={{ paddingTop: '5px' }}
                  color='primary'
                /> */}

              {/* </Typography> */}

              {/* <Typography style={{marginBottom: 12}} color='textSecondary'>
                    <span style={{color: 'red'}}>
                      <ArrowDownwardIcon style={{paddingTop: '8px'}} />
                      220.74%
                    </span>{' '}
                    from last month
                  </Typography> */}
            </Cards>
            {/*  
                </CardContent>
              </Card>
            </Grid> */}

            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <Card>
              <CardContent> */}
            <Cards>
              {/* <Typography
                variant='h9'
                gutterBottom
              > */}
                {/* <ImportExportIcon
                  style={{ paddingTop: '5px' }}
                  color='primary'
                /> */}
                <Grid container paddingLeft={3}>
                  <Grid>
                    <img src={targetIcon} width={50} height={70} />
                  </Grid>
                <Grid>
                <Stack direction="row" alignItems="center" gap={1} pt= '10px' pl= '7px'>
                  <CurrencyRupeeIcon fontSize='inherit' />
                  <Typography component='h2'variant='h6'>
                  <span>0.00</span>
                    </Typography>
                    </Stack>
                    {/* <Typography  component='h2' variant='h6'>
                      <CurrencyRupeeIcon style={{ paddingTop: '10px' }} />
                      <span>00.00</span>
                    </Typography> */}
                    <Typography color='textSecondary'><span style={{ paddingLeft: '10px' }}>
                      Target vs Achievement
                    </span>
                    </Typography>
                  </Grid>
                </Grid>
              {/* </Typography> */}

              {/* <Typography style={{marginBottom: 12}} color='textSecondary'>
                    <span style={{color: 'red'}}>
                      <ArrowDownwardIcon style={{paddingTop: '8px'}} />
                      220.74%
                    </span>{' '}
                    from last month
                  </Typography> */}
              {/* </CardContent>
              </Card>
            </Grid> */}
            </Cards>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CardDesign;
