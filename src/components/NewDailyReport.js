import React, { useState, useEffect, useContext, useRef } from 'react';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
import MaterialTable from 'utils/SafeMaterialTable';
import _ from 'lodash';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  InputLabel,
  FormHelperText,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Card,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { fontWeight } from '@mui/system';
import moment from 'moment';
import { connect } from 'react-redux';
import CommonFilter from './pos/payment_section/CommonFilter';
import context from '../context/CreateNewButtonContext';
import CardContent from '@mui/material/CardContent';
import {
  getCompanyAdminId,
  listSalesDateAction,
  listdailyreportAction,
} from '../redux/actions/sales_actions';
import { useDispatch, useSelector } from 'react-redux';
import {
  listCashBoxDenominationAction,
  balanceenquiryOpeningclosing,
} from '../redux/actions/cash_box_actions';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { getDateFormat, commonDateFormat } from '../../src/utils/getTimeFormat';
import DailyReportFilter from '../pages/pointofsale/DailyReport/dailyReportFilter';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import Cookies from 'universal-cookie';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle } from 'utils/pageSize';
import {  listdailyReportStatusAction } from '../redux/actions/reports_actions';
import { fetchRechargeDailySummary } from '../redux/actions/recharge_actions';
import CommonToolTip from './ToolTip';
import LocationAlert from 'pages/assets/alert/LocationAlert';
import { roleType } from 'utils/roleType';

function NewDailyReport(props) {
  const dispatch = useDispatch();

  const {
    cashBoxReducer: { cash_box_denomination, cashboxopeningclosing, cashboxreceiptentry, cashboxpaymententry ,locationcashbox},
  } = useSelector((store) => store);
  const rechargeDailySummary = useSelector((s) => s.rechargeReducer?.dailySummary);

  //cashboxopeningclosing,cash_box_denomination
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [openDenomination, setOpenDenomination] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [payInData, setPayInData] = useState([]);
  const [payOutData, setPayOutData] = useState([]);
  const [contra, setContra] = useState([]);
  const [contraData, setContraData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  
  const [currentTarget, setCurrentTarget] = useState(null);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempedits = useRef(null);
  const contradetails = props.cashoutincontra_all;
  const bankopeningclosing = props.bankopeningclosing
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  // var date = getDateFormat(new Date());
  let role_name = storage?.role_name || '';
  let emp_id = storage?.employee_id || ''

  const {
    salesReducer: { sales },
  } = useSelector((state) => state);
  const [isFilter, setIsFilter] = useState(false);
  const [filtereddata, setFiltereddata] = useState([]);
  const [filterOpen, handleFilter] = useState(false);
  const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,
  } = useContext(context);
  const [date, setdate] = React.useState(moment());
  const [formValue, setFormValue] = useState({cash_box_id:null});
  const [count, setCount] = useState(0);
  const [newValue, setNewValue] = useState('');


  const initsform = () => {
    
    apiCalls(
    setLoaderStatusHandler,
    setModalStatusHandler,
      dispatch(listCashBoxDenominationAction()),
      // dispatch( getCompanyAdminId(setModalStatusHandler,setLoaderStatusHandler))
    )
  };

  tempinitsform.current = initsform;
  useEffect(()=>{
    if(props.cash_box_status.length>0){
    let statusdata = {
      // date: this.state.date,
      // cash_box_id: this.state.cash_box_id
      location_id:headerLocationId,
      cashbox_id: props.cash_box_status[0]?.cashBox,
    }

    dispatch( listdailyReportStatusAction(statusdata,setModalStatusHandler,setLoaderStatusHandler))
  }
  }, [props.cash_box_status])
  useEffect(() => {
    tempinitsform.current();
  }, []);
  useEffect(() => {
    if (headerLocationId && headerLocationId !== 'null' && date) {
      dispatch(fetchRechargeDailySummary({
        header_location_id: headerLocationId,
        date: moment(date).format('YYYY-MM-DD'),
      }));
    }
  }, [dispatch, headerLocationId, date]);

  useEffect(() => {
    if (props.cashOutIn_payment_type) {
      const payInDatas = props.cashOutIn_payment_type.IN?.map((a) => {
        return a;
      });
      const payOutDatas = props.cashOutIn_payment_type.OUT?.map((b) => {
        return b;
      });
      const contra = props.cashOutIn_payment_type.contra?.map((c) => {
        return c;
      });
      setPayInData(payInDatas);
      setPayOutData(payOutDatas);
      setContra(contra);
    }
  }, [props.cashOutIn_payment_type]);


  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  //   useEffect(()=>{
  //     const dateVal = date;
  //     setdate(dateVal);
  //     let convertedDate = moment(dateVal, "year", "month", "day").format(
  //       "yyyy-MM-DD"
  //     );
  //     props.listdailyreportAction(convertedDate, commoncookie, headerLocationId,()=> {});
  // },[headerLocationId])

  const handleDateChange = async (date) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    // await props.listSalesDateAction(convertedDate);
    setIsFilter(true);
  };

  const totalAmount = () => {
    let total = 0;
    total = locationcashbox.reduce(
      (acc, curr) =>
        acc +
        +curr.current_balance_count *
        cash_box_denomination.filter(
          (f) => f.id === curr.denomination_dtl_id,
        )[0]?.denomination,
      0,
    );

    return total;
  };

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   let isValid = true;
  //   let formErrorsObj = { ...formErrors };
  //   await Object.keys(formValues).map((key, i) => {
  //     if (
  //       requiredFields.includes(key) &&
  //       (formValues[key] === null || formValues[key] === "")
  //     ) {
  //       isValid = false;
  //       formErrorsObj[key] = capitalize(key) + " is Required!";
  //      }
  //      else if (

  //        formValues.taken_amount_val !== formValues.given_amount_val
  //      ) {
  //        isValid = false;
  //        formErrorsObj['taken_amount_val'] = "Amount is not Equal!";
  //        formErrorsObj['given_amount_val'] = "Amount is not Equal!";
  //      }
  //     else if (regex[key]) {
  //       if (!regex[key].test(formValues[key])) {
  //         isValid = false;
  //         formErrorsObj[key] = capitalize(key) + " is Invalid!";
  //       }
  //     }
  //     return null;
  //   });
  //   await setFormErrors(formErrorsObj);

  //   // alert("Is Form Valid - " + isValid);
  //   const emptyState = (status)=>{
  //     if(status) setFormValues(initialState)
  //   }
  //   // API call..
  //   if(isValid) props.handleSubmit(formValues,emptyState);
  // };

  const posSaleTotal = props.pos_sales_report?.map((f) => {
    return f.payment_type_amount;
  });
  const payInTotal = payInData?.map((f) => {
    return f.amount;
  });
  const payOutTotal = payOutData?.map((f) => {
    return f.amount;
  });
  const contraTotal = contra?.map((f) => {
    return f.amount;
  });


  const cashDenomination = () => {
    const test =
      props.cashDenomination.length !== 0
        ? props.cashDenomination.slice(0, 5).map((summary) => {
          let denomination = cash_box_denomination.filter(
            (f) => f.id === summary.denomination_dtl_id,
          )[0]?.denomination;
          return summary.current_balance_count * denomination;
        })
        : [];
    return test;
  };
  const sum = (a) => {
    const add = a?.reduce((a, b) => a + b, 0);
    return add;
  };

  const handleOpen = () => {
    setOpen(true);
  };
  const filterchange = () =>{
    // if(headerLocationId === 'null'){
    //   setOpenAlert(true)
    // }else {
      props.setOpen(true)
    // }
  }
  return (
    <>
      {Prompt}
      {props.open === true && <DailyReportFilter open={props.open} setClose={props.setClose} setOpen={props.setOpen} date={props.from} cash_box_id ={props.cash_box_id} cash_box_name = {props.cash_box_name} cash_box_ledger_id ={props.cash_box_ledger_id} handleClose={props.handleClose} ApplyButton={props.ApplyButton}
        cash_box_adjustment_list={props.cash_box_adjustment_list} headerLocationId = {headerLocationId}/>}
        <Box sx={{ 
        maxHeight: 'calc(100vh - 120px)',
        height: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        paddingRight: '10px'
      }}>
      <Grid
        container
        display='flex'
        sx={{
          padding: '0px 0px 20px 0px',
        }}
      >
        <Grid
          size={{
            lg: 9,
            xs: 9,
            md: 9,
            sm: 9
          }}>
          {/* <Typography variant="h5" align="center" style={{paddingBottom:20, fontWeight:"bold"}}> */}
          <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            Daily Report - <span>{props.get_daily_report_status.length > 0 ? props.get_daily_report_status[0]?.status:'Status'}</span>
          </Typography>
        </Grid>
        <Grid
          display='flex'
          justifyContent='flex-end'
          style={{}}
          size={{
            lg: 3,
            xs: 3,
            md: 3,
            sm: 3
          }}>
          <CommonToolTip title = 'Filter'>
          <IconButton onClick={()=> filterchange()}>
            <FilterAltIcon
              alignItem='center'
              style={{ color: 'gray' }}
            />
          </IconButton>
          </CommonToolTip>
        </Grid>
      </Grid>
      {/* actions={[
              {
                icon: () => <div style={{ display: 'flex' }}>
                 <CommonFilter fromTo={true} from={this.state.from} to={this.state.to} count={this.state.count} handleChange={this.handleChange} handleClose={this.handleFilter} open={this.state.filterOpen} ApplyButton={this.ApplyButton} />
                </div>,
                tooltip: 'Filter',
                isFreeAction: true,
              },
            
            ]} */}
      <Grid container spacing={3} display='flex' flexDirection='row' style={{ textAlign:"center", marginBottom: 15 }}>
        {/* <Grid size={{ xs: 3, sm: 3, md: 4, lg: 1 }} align="right" item >
        <Tooltip title= 'Filter'>
          <IconButton>
          <CommonFilter Datefilter={true} count={count} handleDateChange={handleDateChange} newValue={newValue} value={date} handleClose={handleFilter} setNewValue={setNewValue} open={filterOpen} ApplyButton={ApplyButton}/>
          </IconButton>
          </Tooltip>
        </Grid> */}

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Typography
            variant='h9'
            gutterBottom
            style={{  }}
          >
            Opening Balance :{' '}
            <span style={{ fontWeight: 'bold' }}>
              {/* {bankopeningclosing.length > 0 && bankopeningclosing[0]?.balance !== null? bankopeningclosing[0]?.balance.toFixed(2) : ''} */}
              {/* {props.locationcashbox.length > 0 && props.locationcashbox[0]?.opening_balance !== null ? props.locationcashbox[0]?.opening_balance.toFixed(2) : ''} */}
              {cashboxopeningclosing[0]?.openingbalance?.toFixed(2) || 0}
            </span>
          </Typography>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Typography
            variant='h9'
            gutterBottom
            style={{  }}
          >
            Location Name :{' '}
            <span style={{ fontWeight: 'bold' }}>
              {props.location_name.length < 2
                ? props.location_name[0]?.location_name
                : 'All-Location'}
              {/* {props.cashDenomination.length > 0 ? props.cashDenomination[0]?.location_name : ''} */}
            </span>
          </Typography>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Typography
            variant='h9'
            gutterBottom
            style={{  }}
          >
            Date :{' '}
            <span style={{ fontWeight: 'bold' }}>
              {commonDateFormat(props.from)}
              {/* {props.cashDenomination.length > 0 ? props.cashDenomination[0]?.closing_date : ''} */}
            </span>
          </Typography>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Typography
            variant='h9'
            gutterBottom
            style={{  }}
          >
            Closing Balance :{' '}
            <span style={{ fontWeight: 'bold' }}>
              {/* {bankopeningclosing.length > 0 && bankopeningclosing[0]?.closing[0].closingbalance !== null? bankopeningclosing.map((d)=> d.closing.map((f)=>f.closingbalance.toFixed(2))) : ''} */}
              {/* {props.locationcashbox.length > 0 && props.locationcashbox[0]?.closing_balance !== null ? props.locationcashbox[0]?.closing_balance.toFixed(2) : ''} */}
              {cashboxopeningclosing[0]?.closingbalance?.toFixed(2) || 0}
            </span>
          </Typography>
        </Grid>
      </Grid>
      {/* <Grid size={{ xs: 3, sm: 3, md: 4, lg: 1 }} align="right" item >
        <Tooltip title= 'Filter'>
          <IconButton>
          <CommonFilter Datefilter={true} count={count} handleDateChange={handleDateChange} newValue={newValue} value={date} handleClose={handleFilter} setNewValue={setNewValue} open={filterOpen} ApplyButton={ApplyButton}/>
          </IconButton>
          </Tooltip>
        </Grid> */}
      <Grid spacing={3} container direction='row'>
        <Grid
          size={{
            lg: 3,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Card style={{ padding: '20px 10px 5px 10px', borderRadius:'5px' }}>
            <Typography variant='h5' align='center' style={{ paddingBottom: 20 ,  borderRadius:'5px'}}>
              <Grid container direction={'row'}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>  Pos Sale</Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>   {sum(posSaleTotal).toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Typography>
            {props.pos_sales_report.map((f) => (
              <Grid container direction={'row'} style={{ textAlign: 'center' }} key={f.payment_type}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
               <Typography variant = 'h5'>   {f.payment_type === 'NEFT / RTGS / IMPS (INR)' ? 'Online Trans' : f.payment_type === 'Cash (INR)'? 'Cash': f.payment_type === 'Card (INR)'? 'Card' : f.payment_type }
               </Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>  {f.payment_type_amount.toFixed(2)} </Typography>
                </Grid>
              </Grid>
            ))}
          </Card>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Card style={{ padding: '20px 10px 5px 10px' , borderRadius:'5px'}}>
            <Typography variant='h5' align='center' style={{ paddingBottom: 20 }}>
              <Grid container direction={'row'}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>  Pay In</Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>  {sum(payInTotal).toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Typography>
            {payInData?.map((b,i) => (
              <Grid container direction={'row'} style={{ textAlign: 'center' }} key={i}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'> 
                  {b.name ? 'Cash' :b.payment_type === null ? 'Bank': b.payment_type}</Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'> {b.amount.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            ))}
          </Card>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Card style={{ padding: '20px 10px 5px 10px', borderRadius:'5px' }}>
            <Typography variant='h5' align='center' style={{ paddingBottom: 20 }}>
              <Grid container direction={'row'}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  Pay Out
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  {sum(payOutTotal).toFixed(2)}
                </Grid>
              </Grid>
            </Typography>
            {payOutData?.map((b,i) => (
              <Grid container direction={'row'} style={{ textAlign: 'center' }} key={i}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>  {b.name ? 'Cash' :b.payment_type === null ? 'Bank': b.payment_type}</Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>    {b.amount.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            ))}
          </Card>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Card style={{ padding: '20px 10px 5px 10px' , borderRadius:'5px'}}>
            <Typography variant='h5' align='center' style={{ paddingBottom: 20 }}>
              <Grid container direction={'row'}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  Contra
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                {sum(contraTotal)?.toFixed(2)}
                </Grid>
              </Grid>
            </Typography>
            {contra?.map((b, i) => (
              <Grid container direction={'row'} style={{ textAlign: 'center' }} key={i}>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'> {b.name ? 'Cash' : b.payment_type === null ? 'Bank': b.payment_type}
                </Typography>
                </Grid>
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                  -
                </Grid>
                
                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 4,
                    xs: 4
                  }}>
                <Typography variant = 'h5'>  {b.amount.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            ))}
          </Card>
        </Grid>

        {/* ---- Recharge bucket (sales + wallet loads for the day) ---- */}
        <Grid
          size={{
            lg: 3,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Card style={{ padding: '20px 10px 5px 10px', borderRadius: '5px' }}>
            <Typography variant='h5' align='center' style={{ paddingBottom: 20 }}>
              <Grid container direction={'row'}>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                  <Typography variant='h5'>Recharge</Typography>
                </Grid>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>-</Grid>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                  <Typography variant='h5'>
                    {(
                      Number(rechargeDailySummary?.recharge_sales?.total || 0) -
                      Number(rechargeDailySummary?.wallet_loads?.total || 0)
                    ).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </Typography>

            {/* Sales inflows */}
            <Grid container direction='row' style={{ textAlign: 'center', backgroundColor: 'rgba(46,125,50,0.06)', borderRadius: 4 }}>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                <Typography variant='h5' style={{ color: '#2E7D32', fontWeight: 600 }}>Sales</Typography>
              </Grid>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>-</Grid>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                <Typography variant='h5' style={{ color: '#2E7D32', fontWeight: 600 }}>
                  +{Number(rechargeDailySummary?.recharge_sales?.total || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            {(rechargeDailySummary?.recharge_sales?.by_payment || []).map((p, i) => (
              <Grid container direction='row' style={{ textAlign: 'center' }} key={`rs-${i}`}>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                  <Typography variant='h5'>{p.payment_type}</Typography>
                </Grid>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>-</Grid>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                  <Typography variant='h5'>{Number(p.amount).toFixed(2)}</Typography>
                </Grid>
              </Grid>
            ))}

            {/* Wallet-load outflows */}
            <Grid container direction='row' style={{ textAlign: 'center', backgroundColor: 'rgba(198,40,40,0.06)', borderRadius: 4, marginTop: 8 }}>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                <Typography variant='h5' style={{ color: '#C62828', fontWeight: 600 }}>Loads</Typography>
              </Grid>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>-</Grid>
              <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                <Typography variant='h5' style={{ color: '#C62828', fontWeight: 600 }}>
                  -{Number(rechargeDailySummary?.wallet_loads?.total || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            {(rechargeDailySummary?.wallet_loads?.by_payment || []).map((p, i) => (
              <Grid container direction='row' style={{ textAlign: 'center' }} key={`wl-${i}`}>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                  <Typography variant='h5'>{p.payment_type}</Typography>
                </Grid>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>-</Grid>
                <Grid size={{ lg: 4, md: 4, sm: 4, xs: 4 }}>
                  <Typography variant='h5'>{Number(p.amount).toFixed(2)}</Typography>
                </Grid>
              </Grid>
            ))}
          </Card>
        </Grid>

      {props.sales_daily_report !== undefined && props.sales_daily_report?.length > 0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              paging: false,
              search:false,
              // exportMenu: [
              //   {
              //     label: 'Export PDF',
              //     exportFunc: (cols, datas) =>
              //       ExportPdf(
              //         cols, datas,
              //         'DailyReportSalesData',
              //       )

              //   },

              //   {
              //     label: 'Export CSV',
              //     exportFunc: (cols, datas) => {

              //       ExportCsv(
              //         cols, datas,
              //         'DailyReportSalesData',
              //       );

              //     }
              //   },
              // ],
            }}
            columns={[
              { title: 'Date', field: 'payment_date' },
              { title: 'Invoice Number', field: 'invoice_number' },
              { title: 'Note', field: 'note' },
              { title: 'Payment Mode', field: 'payment_type' },
              { title: 'Location Name', field: 'location_name' },
              {
                title: 'Amount',
                field: 'total',
                render: (rowData) => (
                  // <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  (<div>
                    {rowData.total.toFixed(2)}{' '}
                  </div>)
                ),
              },

              // { title: 'Bank Name', field: 'bankName' },
            ]}
            data={props.sales_daily_report}
            title={<Typography variant='h6'>Sale</Typography>}
          />
        </Grid>
      }
        {props.purchase_daily_report !== undefined && props.purchase_daily_report?.length > 0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              paging: false,
              search:false,
              // exportMenu: [
              //   {
              //     label: 'Export PDF',
              //     exportFunc: (cols, datas) =>
              //       ExportPdf(
              //         cols, datas,
              //         'DailyReportSalesData',
              //       )

              //   },

              //   {
              //     label: 'Export CSV',
              //     exportFunc: (cols, datas) => {

              //       ExportCsv(
              //         cols, datas,
              //         'DailyReportSalesData',
              //       );

              //     }
              //   },
              // ],
            }}
            columns={[
              { title: 'Date', field: 'receiving_date' },
              { title: 'Invoice Number', field: 'invoice_number' },
              { title: 'Note', field: 'note' },
              { title: 'Payment Mode', field: 'payment_type' },
              { title: 'Location Name', field: 'location_name' },
              {
                title: 'Amount',
                field: 'total',
                render: (rowData) => (
                  // <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  (<div>
                    {rowData.total.toFixed(2)}{' '}
                  </div>)
                ),
              },

              // { title: 'Bank Name', field: 'bankName' },
            ]}
            data={props.purchase_daily_report}
            title={<Typography variant='h6'>Purchase</Typography>}
          />
        </Grid>
      }
          {props.transferreceiver_dailyreport !== undefined && props.transferreceiver_dailyreport.filter((d)=>d.status === 'initiated')?.length > 0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              paging: false,
              search:false,
            }}
            columns={[
              { title: 'Date', field: 'initiated_date' },
              { title: 'Source Location', field: 'source_location' },
              { title: 'Destination Location', field: 'destination_location' },
              { title: 'Status', field: 'status' },
                   // { title: 'Bank Name', field: 'bankName' },
            ]}
            data={props.transferreceiver_dailyreport.filter((d)=> d.status === 'initiated')}
            title={<Typography variant='h6'>Transfer</Typography>}
          />
        </Grid>
      }
          {props.transferreceiver_dailyreport !== undefined && props.transferreceiver_dailyreport.filter((d) => d.status === 'received')?.length > 0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              paging: false,
              search:false,
            }}
            columns={[
              { title: 'Date', field: 'initiated_date' },
              { title: 'Source Location', field: 'source_location' },
              { title: 'Destination Location', field: 'destination_location' },
              { title: 'Status', field: 'status' },
                   // { title: 'Bank Name', field: 'bankName' },
            ]}
            data={props.transferreceiver_dailyreport.filter((d)=> d.status === 'received')}
            title={<Typography variant='h6'>Receiver</Typography>}
          />
        </Grid>
      }
      {props.cashOutIn_daily_report !== undefined && props.cashOutIn_daily_report.IN?.length >0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              headerStyle,
              cellStyle,
              paging: false,
              search:false,
              // exportMenu: [
              //   {
              //     label: 'Export PDF',
              //     exportFunc: (cols, datas) =>
              //       ExportPdf(
              //         cols, datas,
              //         'PayinData',
              //       )

              //   },

              //   {
              //     label: 'Export CSV',
              //     exportFunc: (cols, datas) => {

              //       ExportCsv(
              //         cols, datas,
              //         'PayinData',
              //       );

              //     }
              //   },
              // ],
            }}
            columns={[
              { title: 'Date', field: 'date' },
              { title: 'Ledger', field: 'ledger_name' },
              { title: 'Particular', field: 'ifsc_code' },
              { title: 'Payment Mode', field: 'paymentType' },
              { title: 'Location', field: 'location_name' },
              {
                title: 'Amount',
                field: 'amount',
                render: (rowData) => (
                  <div>
                  {/* <div style={{ display: 'flex', justifyContent: 'flex-end' }}> */}
                    {rowData.amount.toFixed(2)}{' '}
                  </div>
                ),
              },
            ]}
            data={props.cashOutIn_daily_report.IN.map((f) => {
              return {
                ...f,
                paymentType: f.paymentType ? f.paymentType : 'Cash',
              };
            })}
            title={<Typography variant='h6' >Payin</Typography>}
          />
        </Grid>
      }
       {props.cashbox_adjustment !== undefined && props.cashbox_adjustment?.length >0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
              options={{
                headerStyle,
                cellStyle,
              paging: false,
              search:false,
            }}
            columns={[
              { title: 'Date', field: 'transactionDate', render : (rowData)=>{
                return moment(rowData.transactionDate).format('DD/MM/YYYY hh:mm A')

              }},
              { title: 'CashBox Name', field: 'cashbox' },
              { title: 'Location Name', field: 'location_name' },
              { title: 'Amount', field: 'amount' }
            ]}
            data={props.cashbox_adjustment}
            title={<Typography variant='h6'>CashBox Adjustmen</Typography>}
          />
        </Grid>
        }
      {props.cashOutIn_daily_report !== undefined && props.cashOutIn_daily_report.OUT?.length >0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
              options={{
              headerStyle,
              cellStyle,
              paging: false,
              search:false,
              // exportMenu: [
              //   {
              //     label: 'Export PDF',
              //     exportFunc: (cols, datas) =>
              //       ExportPdf(
              //         cols, datas,
              //         'PayoutData',
              //       )

              //   },

              //   {
              //     label: 'Export CSV',
              //     exportFunc: (cols, datas) => {

              //       ExportCsv(
              //         cols, datas,
              //         'PayoutData',
              //       );

              //     }
              //   },
              // ],
            }}
            columns={[
              // { title: 'Date', field: 'date' },
              { title: 'Date', field: 'date', render : (rowData)=>{
                return moment(rowData.date).format('DD/MM/YYYY')

              }},
              { title: 'Ledger', field: 'ledger_name' },
              { title: 'Particular', field: 'ifsc_code' },
              { title: 'Payment Mode', field: 'paymentType' },
              { title: 'Location', field: 'location_name' },
              {
                title: 'Amount',
                field: 'amount',
                render: (rowData) => (
                  <div>
                    {rowData.amount.toFixed(2)}{' '}
                  </div>
                ),
              },
              // { title: 'Bank Name', field: 'bankName' },
            ]}
            data={props.cashOutIn_daily_report.OUT.map((f) => {
              return {
                ...f,
                paymentType: f.paymentType ? f.paymentType : 'Cash',
              };
            })}
            title={<Typography variant='h6'>Payout</Typography>}
          />
        </Grid>
        }
        {
          contradetails !== undefined &&  contradetails?.length > 0 &&
        
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              paging: false,
              search: false,
              // exportMenu: [
              //   {
              //     label: 'Export PDF',
              //     exportFunc: (cols, datas) =>
              //       ExportPdf(
              //         cols, datas,
              //         'ContraData',
              //       )

              //   },
              //   {
              //     label: 'Export CSV',
              //     exportFunc: (cols, datas) => {

              //       ExportCsv(
              //         cols, datas,
              //         'ContraData',
              //       );

              //     }
              //   },
              // ],
            }}
            columns={[
              { title: 'Bank Name', field: 'bankName' },
              { title: 'Account Number', field: 'accountNumber' },
              { title: 'IFSC Code', field: 'ifsc_code' },
              { title: 'Branch', field: 'branchName' },
              { title: 'Address', field: 'address' },
              { title: 'Amount', field: 'amount' , 
              render: (rowData) => (
                <div>
                  {rowData.amount.toFixed(2)}{' '}
                </div>
              ), },
              { title: 'Cash Type', field: 'cash_type' },
            ]}
            data={contradetails ? contradetails : []}
            title={<Typography variant='h6'>Contra</Typography>}
          />
        </Grid>
         } 
         {cashboxpaymententry !== undefined && cashboxpaymententry.length > 0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
              options={{
              headerStyle,
              cellStyle,
              paging: false,
              search: false,
            }}
            columns={[
              { title: 'Transaction Date', field: 'transactionDate', render : (rowData)=>{
                return moment(rowData.transactionDate).format('DD/MM/YYYY hh:mm A') }
              },
              {title : 'Vendor Name' , field : 'company_name'},
              {title : 'Invoice Number' , field : 'invoice_number'},
              { title: 'Location', field: 'location_name' },
              { title: 'Amount', field: 'amount' ,
              render: (rowData) => (
                <div>
                  {rowData.amount?.toFixed(2)}{' '}
                </div>
              ), },
            ]}
            data={cashboxpaymententry}
            title={<Typography variant='h6'>Payment Entry</Typography>}
          />
        </Grid>
         }
        {cashboxreceiptentry !== undefined && cashboxreceiptentry?.length > 0 &&
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <MaterialTable
            options={{
              paging: false,
              search: false,
            }}
            columns={[
              { title: 'Transaction Date', field: 'transactionDate',render:(rowData)=>{
                return moment(rowData.transactionDate).format('DD/MM/YYYY hh:mm A')
              } },
              {title : 'Customer Name' , field : 'company_name'},
              {title : 'Invoice Number' , field : 'invoice_number'},
              { title: 'Location', field: 'location_name' },
              { title: 'Amount', field: 'amount',
              render: (rowData) => (
                <div>
                  {rowData.amount.toFixed(2)}{' '}
                </div>
              ), },
            ]}
            data={cashboxreceiptentry}
            title={<Typography variant='h6'>Receipt Entry</Typography>}
          />
        </Grid>
        }
     <Grid
       size={{
         xs: 12,
         sm: 12,
         md: 12,
         lg: 12
       }}>
          <Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px', marginLeft: '15px' }}>
            Cash Denomination
          </Typography>
          <Grid container direction='row' spacing={2}>
            <Grid
              size={{
                xs: 6,
                sm: 6,
                md: 6,
                lg: 6
              }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 200 }} aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Denomination</TableCell>
                      <TableCell align='right'>Count</TableCell>
                      <TableCell textAlign='left'>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locationcashbox?.slice(0, 5)?.map((summary) => {
                      let denomination = cash_box_denomination.filter(
                        (f) =>  f.id === summary.denomination_dtl_id,
                      )[0]?.denomination;
                      
                      return (
                        <TableRow
                          key={summary.denomination_dtl_id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell component='th' scope='row'>
                            {denomination}
                          </TableCell>
                          <TableCell align='right'>
                            {summary.current_balance_count}
                          </TableCell>
                          <TableCell textAlign='right'>
                            {(summary.current_balance_count * denomination).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid
              size={{
                xs: 6,
                sm: 6,
                md: 6,
                lg: 6
              }}>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 200 }} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Denomination</TableCell>
                      <TableCell textAlign='left'>Count</TableCell>
                      <TableCell textAlign='left'>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {locationcashbox.slice(5, 10).map((summary) => {
                      let denomination = cash_box_denomination.filter(
                        (f) => f.id === summary.denomination_dtl_id,
                      )[0]?.denomination;
                      return (
                        <TableRow
                          key={summary.denomination_dtl_id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell component='th' scope='row'>
                            {denomination}
                          </TableCell>
                          <TableCell align='right'>
                            {summary.current_balance_count}
                          </TableCell>
                          <TableCell textAlign='right'>
                            {(summary.current_balance_count * denomination).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
     
        <br />
        <Grid container direction='row' style={{ paddingBottom: '10px' }}>
          <Grid
            size={{
              xs: 6,
              sm: 6,
              md: 6,
              lg: 12
            }}>
            <Typography
              variant='h6'
              gutterBottom
              style={{ padding: '10px 0px 0px 20px' }}
            >
              Total : {totalAmount().toFixed(2)}
            </Typography>
          </Grid>
        </Grid>


        <Grid
          spacing={0}
          container={true}
          direction='row'
          display='flex'
          justifyContent='flex-end'
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid
            display='flex'
            justifyContent='flex-end'
            size={{
              lg: 2,
              md: 3,
              sm: 6,
              xs: 6
            }}>
          {/* && role_name !=='Administrator' */}
          {locationcashbox.length > 0 && !roleType.includes(role_name)  &&
          <Button
            onClick={() => props.Notificationsend(emp_id) }
            style={{}}
            name='SUBMIT'
            disabled= {(props.get_daily_report_status[0]?.status !== 'Pending' && headerLocationId !=='null') ? false:true}
            variant='contained'
            color='primary'
            size='medium'
            text='button'
            fullWidth={false}
            type='submit'
          >
          SUBMIT APPROVAL
          </Button>
           }
            {locationcashbox.length > 0 && props.get_daily_report_status[0]?.status === 'Pending' && roleType.includes(role_name) &&
          <Button
           onClick={() => props.AdminApproval()}
            style={{}}
            disabled= {props.get_daily_report_status[0]?.status === 'Approved' ? true:false}
            name='SUBMIT'
            variant='contained'
            color='primary'
            size='medium'
            text='button'
            fullWidth={false}
            type='submit'
          >
          Approved
          </Button>
           }

        </Grid>
        </Grid>
        </Grid>
        </Box>
      <CancelDialog
        handle={cancel}
        delete={dialog}
        close={props.handleClose}
      ></CancelDialog>
      <LocationAlert open={openAlert} onClose={ ()=> setOpenAlert(false)}/>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    filter_date: state.salesReducer.list_sale_filter_date || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listSalesDateAction: (date, employee_id, headerLocationId, res) => {
      dispatch(listSalesDateAction(date, employee_id, headerLocationId, res));
    },
    // listdailyreportAction: (date, employee_id, headerLocationId,res) => {
    //   dispatch(listdailyreportAction(date, employee_id,headerLocationId,res ));
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewDailyReport);

