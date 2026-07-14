import React, {useRef, useEffect, useState, useContext} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Summary from 'components/pos/session/SummaryTabs';
import {
  Tabs,
  Box,
  Tab,
  Typography,
  Card,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import Table from 'components/pos/session/Table';
import PSummaryTable from 'components/pos/session/PaymentSummary/Table';
import {
  listPosSessionAction,
  UpdataPosSessionAction,
  PosLastSyncUpdate,
  PosGetByIdAction,
} from '../../../redux/actions/pos_session';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DB from '../../../db';
import context from '../../../context/CreateNewButtonContext';
import CashBoxSummary from 'components/pos/session/cashBoxSummary';
import {
    listCashBoxSummary,
    listCashBoxDenominationAction,
    // listSessionBasedCashBoxSummary,
  } from '../../../redux/actions/cash_box_actions';
import apiCalls from 'utils/apiCalls';
import { font14_500, headerStyle } from 'utils/pageSize';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
       {value === index && <Box>{children}</Box>}
    </div>
  );
}

const PosSummary = (props) => {
  const [value, setValue] = useState(0);
  const [offlineData, setofflineData] = useState({});
  const [Tdata, setTdata] = useState([]);
  const [PSData, setPSData] = useState([]);
  const [index, setIndex] = useState(0);
  const [pollTimer, setPollTimer] = useState(null)
  var db = new DB('pos_session');
  const dispatch = useDispatch();
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    allData,
    headerLocationId,
    commoncookie,
  } = useContext(context);
  const {
    posSessionReducer: {pos_session},
    posCreationReducer: {pos_creation},
    UserCreationReducer: {all_user_location},
  } = useSelector((state) => state);

  // useEffect(() => {
  //   if(props.inView && props.isEnabled){
  //     if(typeof commoncookie !== 'undefined'){
  //       apiCalls(
  //         setModalTypeHandler,
  //         setLoaderStatusHandler,
  //         dispatch(
  //           listPosSessionAction(
  //             commoncookie,
  //             headerLocationId,
  //             setModalTypeHandler,
  //             setLoaderStatusHandler,
  //           ),
  //         )
  //       );
  //     }
  //   }
  // } ,[commoncookie, props.inView , props.isEnabled])

  // useEffect(() => {
  //   if (props.inViewport === true) {
  //     setTimeout(() => {
  //       const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
  //       if (props.inViewport === false) {
  //         clearTimeout(timer);
  //       }
  //       dispatch(setDashboardPollingTimerIdsAction(timer));
  //       setPollTimer(timer );
  //     }, props.DASHBOARD_API_POLL_TIMING);

  //   } else {
  //     clearTimeout(pollTimer);
  //   }

  //   return () => clearTimeout(pollTimer);
    
  // }, [props.inViewport]);

  // const pollData = () => {
  //   if(typeof commoncookie !== 'undefined'){
  //     props.pollServer(
  //       dispatch(
  //         listPosSessionAction(
  //           commoncookie,
  //           headerLocationId,
  //           setModalTypeHandler,
  //           setLoaderStatusHandler,
  //         ),
  //       )
  //     );
  //   }
  // }
  
    
  // }, [commoncookie, props.inView]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const obj = [];
    props?.data.forEach((d) => {
      const sales_data = d.sales_data || [];
      const balance = sales_data?.reduce((acc, obj) => acc + +obj.amount, 0);
      obj.push({
        balance,
        data: sales_data,
        posName: d.posName,
        location_name: d.location_name,
        sessionSalesAmount: d.sessionSalesAmount,
        posId: d.posId,
        active: d.active,
        id: d.id,
        cashBox:d.cashBox
      });
    });
    setofflineData(obj);
  }, [props?.data]);

  useEffect(() => {
    check(0);
  }, [offlineData]);

// console.log(props.data, 'dashboardCards')
  const check = async (i) => {

    const marr = [];
    const mobj = {};
    const varr = [];

    const {paymentModes} = (await db.getAllCheckouts(1)) || {};
    // console.log(paymentModes,"paymentModes");
    
    const modes = paymentModes
      ? paymentModes.map((d) => `${d.paymentName} (INR)`)
      : [];

    const arr = offlineData[i]?.data?.map((d, i) => {
      const {
        customer_name,
        sales_payment,
        sales_items,
        invoice_number,
        amount,
      } = d;
      sales_payment.forEach((nd) => {
        let cash_adjustment =
          nd.cash_adjustment !== '' ? nd.cash_adjustment : 0;
        mobj[nd.payment_type] = mobj[nd.payment_type]
          ? (mobj[nd.payment_type] =
              mobj[nd.payment_type] + nd.payment_amount - cash_adjustment)
          : nd.payment_amount - cash_adjustment;
      });

      return {
        sales_order: i + 1,
        customer_name,
        sales_payment,
        amount,
        invoice_number,
        total_products: sales_items.length,
        sales_items,
      };
    });

    for (let key in mobj) {
      const newobj = {};
      newobj.payment_type = key;
      newobj.payment_amount = mobj[key];
      marr.push(newobj);
      varr.push(key);
    }

    const filmodes = modes.filter((item) => !varr.includes(item));

    filmodes.forEach((dd) => {
      const newobj = {};
      newobj.payment_type = dd;
      newobj.payment_amount = 0;
      marr.push(newobj);
    });
    setPSData(marr);
    setTdata(arr);
    
    if(offlineData.length > 0) {

      
      dispatch(listCashBoxSummary(offlineData[index]?.cashBox))
      dispatch(listCashBoxDenominationAction())
      
    }

  };

  useEffect(() => {
    check(index);
  }, [index]);
// console.log(offlineData,"offlineData");

  return (
    // <div ref={props.ref1} style={{width: '100%'}}>
    // </div>
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    style={{padding: '20px', width: '100%',height:'100%'}}>
      <Box>
        {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}> */}
        <Grid container>
          <Grid
            size={{
              xs: 10,
              md: 11,
              lg: 11.7,
              sm: 11
            }}>
            <Grid
              style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px'}}
            >
              <Grid>
                <Typography
                  style={{ fontSize: headerStyle.fontSize}}
              color='textSecondary'
              gutterBottom
            >
              Pos Name
            </Typography>
            <Typography variant='h6' component='h2'>
              {offlineData[index]?.posName}
            </Typography>
          </Grid>

          <Grid>
            <Typography
              style={{ fontSize: headerStyle.fontSize }}
              color='textSecondary'
              gutterBottom
            >
              Location Name
            </Typography>
            <Typography variant='h6' component='h2'>
              {offlineData[index]?.location_name}
            </Typography>
          </Grid>
          <Grid>
            <Typography
              style={{ fontSize: headerStyle.fontSize}}
              color='textSecondary'
              gutterBottom
            >
              Total Rs.
            </Typography>
            <Typography variant='h6' component='h2'>
              {offlineData[index]?.sessionSalesAmount?.toFixed(2) || '0.00'}
            </Typography>
          </Grid>

              <Grid>
                <Tooltip title='Previous'>
                  <IconButton
                    color='primary'
                    disabled={index === 0}
                    component='span'
                    onClick={() => setIndex(index - 1)}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title='Next'>
                  <IconButton
                    color='primary'
                    disabled={offlineData.length - 1 === index}
                    component='span'
                    onClick={() => setIndex(index + 1)}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
            size={{
              xs: 2,
              md: 1,
              sm: 1,
              lg: 0.3
            }}>
            {
              props.mode === 'edit' ? 
              <IconButton
                  aria-label='view code'
                  onClick={() => props.setCardClose()}
                  size='large'
                >
                 {props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />} 
              </IconButton>
              :
              ''
            }
          </Grid>
        </Grid>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='basic tabs example'
          style={{backgroundColor:'#f3f3f3' , fontSize:headerStyle.fontSize}}
          variant="fullWidth"
        >
          <Tab style={{fontSize: headerStyle.fontSize}} label='Payment Summary' {...a11yProps(0)} />
          <Tab style={{fontSize: headerStyle.fontSize}} label='Order Summary' {...a11yProps(1)} />
          <Tab style={{fontSize: headerStyle.fontSize}} label='CashBox Summary' {...a11yProps(2)} />
        </Tabs>
        {/* </Box> */}
        <TabPanel value={value} index={0}>
          <PSummaryTable PSData={PSData} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Table Tdata={Tdata} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <CashBoxSummary
            posId={offlineData[index]?.posId}
            s_id={offlineData[index]?.id}
            active={offlineData[index]?.active}
          />
        </TabPanel>
      </Box>
    </Card>
  );
};

export default useCommonRef(PosSummary);
