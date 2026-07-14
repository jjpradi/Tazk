import React, { useContext, useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, Box, IconButton, Collapse,Link, Card } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import moment from 'moment';
import { getCurrentFinancialYear } from 'utils/getTimeFormat';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from "../../../context/CreateNewButtonContext";
import apiCalls from 'utils/apiCalls';
import {
  listBalancesheetAction,
  listBalancesheetdateAction,
  listBalancesheetAccountsAction,
  getlimitdatafrombalancesheet,
  listBalancesheetProfitAction
} from '../../../redux/actions/balancesheet_actions';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { useNavigate } from "react-router-dom";


const BalanceSheet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId
} = useContext(CreateNewButtonContext);

  const [gstOpen, setGstOpen] = useState(false);
  const [receivablegstOpen, setreceivableGstopen] = useState(false);
  const financialYear = getCurrentFinancialYear().format('DD-MMMM-YYYY');
  const [from, setFrom] = useState(new Date(getCurrentFinancialYear().fromDate));
  const [to, setTo] = useState(new Date(getCurrentFinancialYear().toDate))
  const [ errormsg, setErrormsg] = useState({from: '',
    to: '',});
  const [errorname, setErrorname] = useState('')
  const [filterOpen, setFilteropen] = useState(false)
  const [fromTo, setFromTo] = useState({
    from : financialYear.fromDate,
    to : financialYear.toDate
  })
   const { balancesheetReducer: { balancesheetaccounts, balanceprofit } } = useSelector((state) => state);
  
 

  useEffect(()=>{
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listBalancesheetAccountsAction(
        moment( from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment( to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        setModalTypeHandler,
        setLoaderStatusHandler,
      )),
      dispatch(listBalancesheetProfitAction(
        moment( from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment( to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        setModalTypeHandler,
        setLoaderStatusHandler,
      )),)
  },[])

  const AccountReceivable = () => {
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.parentAccountName === 'Sundry Debtors')
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const AccountPayable = () => {
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.parentAccountName === 'Sundry Creditors')
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const totalliabilities = () =>{
    let total = 0;
    balancesheetaccounts
    .filter((s) => s.accountTypeName === 'Liabilities' &&
    s.parentAccountName !== 'Sundry Creditors' && s.parentAccountName !== 'Duties & Taxes')
    .forEach((d) => {
      total += +d.amount;
    });
    return total;
  }

  const Equity = () => {
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountTypeName === 'Equity')
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const OtherAssets = () =>{
    let total = 0;
    balancesheetaccounts
    .filter((s) => s.accountTypeName === 'Assets' &&
    s.parentAccountName !== 'Sundry Debtors' && s.parentAccountName !== 'Loans & Advances (Asset)')
    .forEach((d) => {
      total += +d.amount;
    });
    return total;
  }

  const Profit = balanceprofit.find((s) => s.net_profit !== undefined)?.net_profit || 0;
  const closingstocks = balanceprofit.find((s) => s.closing_stocks !== undefined)?.closing_stocks || 0
  const IgstPayable = () =>{
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountName === "IGST Payable")
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const CgstPayable = () =>{
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountName === "CGST Payable")
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const SgstPayable = () =>{
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountName === "SGST Payable")
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const IgstReceivable = () =>{
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountName === "IGST Receivable")
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const CgstReceivable = () =>{
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountName === "CGST Receivable")
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const SgstReceivable = () =>{
    let total = 0;
    balancesheetaccounts
      .filter((s) => s.accountName === "SGST Receivable")
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

 const financialYearList = () => {
    let currentYear = new Date().getFullYear();
    let yearsLength = 10;
    let financialYearData = [];
    for (let i = 0; i < yearsLength; i++) {
      let next = currentYear + 1;
      let year = currentYear;
      financialYearData.push({from: year, to: next});
      currentYear--;
    }
    return financialYearData;
  };

  const handleFY = (fyData) => {
    handleChange({
      target: {value: {_d: fyData.from}, name: 'from'},
    });

  handleChange({
      target: {value: {_d: fyData.to}, name: 'to'},
    });
  };

   const handleChange = async (data) => {
    var date_val = data.target.value._d;
    

    await setErrorname({[data.target.name]: date_val})
    if(data.target.name === 'from'){
      await setFrom(date_val)
    }else{
      await setTo(date_val)
    }
    
    // await this.setState({[data.target.name]: date_val});

    // if (moment(from, 'year') <= moment(to, 'year')) {
    //   if (moment(from, 'month') <= moment(to, 'month')) {
    //     if (moment(from, 'day') <= moment(to, 'day')) {
    //       setErrormsg({from:'', to:''})
    //       // this.setState({errormsg: {from: '', to: ''}}); // balancesheet_data: filterData ,
    //     } else {
    //       setErrormsg('Invalid Date')
        
    //     }

    //   } else {
    //     setErrormsg('Invalid Date')
       
    //   }
    // } else {
    //   setErrormsg('Invalid Date')
      
    // }
  };

  const handleFilter = (data) => setFilteropen(data);
  
 const  ApplyButton = async () => {
  setFromTo((prev) => ({...prev, from : moment( from, 'year', 'month', 'day').format('DD-MMMM-YYYY'), to : moment( to, 'year', 'month', 'day').format('DD-MMMM-YYYY')}))
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(listBalancesheetAccountsAction(
      moment( from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment( to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
    )),
    dispatch(listBalancesheetProfitAction(
      moment( from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment( to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
    ))
  )
  setFilteropen(false)
};

const clearButton = async () => {
  setFromTo((prev) => ({...prev, from : financialYear.fromDate, to : financialYear.toDate}))
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), 3, 1);
  var lastDay = new Date(date.getFullYear() + 1, 2, 31);
  setFrom(new Date(financialYear.fromDate));
  setTo(new Date(financialYear.toDate))
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(listBalancesheetAccountsAction(
      moment(new Date(financialYear.fromDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(new Date(financialYear.toDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
  )),
  dispatch(listBalancesheetProfitAction(
    moment(new Date(financialYear.fromDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
    moment(new Date(financialYear.toDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
    setModalTypeHandler,
    setLoaderStatusHandler,
))
)
  setFilteropen(false)
};


  
  return (
    <div>
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%', overflow: 'auto' }}>
     <Helmet>
       <meta charSet="utf-8" />
       <title> {titleURL} | Balance Sheet </title>
     </Helmet>
   <Container maxWidth='500px' maxHeight='1000px' >
     {/* <Paper elevation={3} sx={{ p: 3, borderRadius: 2, border: "1px solid grey", boxShadow: 2 }}> */}
     <Typography
                   variant='h6'
                   align='left'
                   style={{paddingTop: '10px', paddingBottom: '10px'}}
                 >
                     {/* <Link href='/report' underline="hover">Home</Link> / Balance Sheet */}
                     <Box style={{ display: 'flex' }}>
                       <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
                       &nbsp;/&nbsp;Balance Sheet
                     </Box>
                 </Typography>
       <Typography variant="h5" align="center" gutterBottom>
         Balance Sheet
       </Typography>
       <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
         Basis: Accrual<br />As of {fromTo.from} to {fromTo.to}
         {/* {moment(fromdate, 'year', 'month', 'day').format(
                     'DD-MM-yyyy',
                   )}{' '}
                   to{' '}
                   {moment(todate, 'year', 'month', 'day').format(
                     'DD-MM-yyyy',
                   )} */}
       </Typography>
       <Grid
         display='flex'
         justifyContent='flex-end'
         style={{marginTop: '50px', paddingRight: '20px'}}
         size={{
           lg: 2,
           md: 2,
           xs: 2,
           sm: 2
         }}>  <CommonFilter
               financialYear={true}
               financialYearData={financialYearList()}
               handleFY={handleFY}
               fromTo={true}
               from={from}
               to={to}
               count={0}
               handleChange={handleChange}
               handleClose={handleFilter}
               open={filterOpen}
               ApplyButton={ApplyButton}
               clearButton={clearButton}
               locationFilter={false}
               shouldFetchData={true}
               type = 'profitLoss'
               noEmpFilter={true}
             /></Grid>
     
       <Grid container spacing={3} sx={{ mt: 2, border:"1px solid grey",padding: 2,marginLeft: '-12px'  }}>
         {/* Liabilities & Equities */}
         <Grid
           sx={{ borderRight: "1px solid grey", padding: 2 }}
           size={{
             xs: 12,
             md: 6
           }}>
           <Typography variant="h6">Liabilities & Equities</Typography>
           <hr />
           <Typography variant="h6">LIABILITIES</Typography><hr/>
           <Box ml={2}>
             <Typography variant="h6" fontWeight="bold">Current Liabilities</Typography>
             <Typography variant="body2" ml={2}>• Accounts Payable 
               <span style={{ float: "right" }}>{AccountPayable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography><br/>
             <Box display="flex" alignItems="center" ml={2}>
               <Typography variant="body2">Duties & Taxes</Typography>
               <IconButton size="small" onClick={() => setGstOpen(!gstOpen)}>
                 {gstOpen ? <ExpandLess /> : <ExpandMore />}
               </IconButton>
             </Box>
             <Collapse in={gstOpen} ml={4}>
               <Box ml={4} color="textSecondary">
                  {IgstPayable() > 0 && <Typography variant="body2">Output IGST <span style={{ float: "right" }}>{IgstPayable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>}
                  {CgstPayable() > 0 && <>
                 <Typography variant="body2">Output CGST <span style={{ float: "right" }}>{CgstPayable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
                 <Typography variant="body2">Output SGST <span style={{ float: "right" }}>{SgstPayable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography></>}
               </Box>
             </Collapse>
           </Box>
           <Typography variant="h6" fontWeight="bold">Total for GST Payable <span style={{ float: "right" }}>
           {(IgstPayable()+CgstPayable()+SgstPayable()).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
           <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>TOTAL LIABILITIES <span style={{ float: "right" }}>
             {(AccountPayable()+IgstPayable()+CgstPayable()+SgstPayable()+totalliabilities()).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
           <Typography variant="h6" sx={{ mt: 3 }}>EQUITIES</Typography><hr/>
           <Typography variant="h6" fontWeight="bold">TOTAL EQUITIES <span style={{ float: "right" }}>{Equity().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
           <Typography variant="h6" fontWeight="bold">{Profit > 0 ? 'Profit' : 'Loss'}<span style={{ float: "right" }}>{Profit.toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
           <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>TOTAL LIABILITIES & EQUITIES & Profit & Loss <span style={{ float: "right" }}>{(AccountPayable()+Equity()+totalliabilities()+IgstPayable()+CgstPayable()+SgstPayable()+Profit).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
          
         </Grid>

         {/* Assets */}
         <Grid
           sx={{ padding: 2 }}
           size={{
             xs: 12,
             md: 6
           }}>
           <Typography variant="h6">Assets</Typography>
           <hr />
           <Typography variant="h6">CURRENT ASSETS</Typography><hr/><br/>
           <Box ml={4}>
             <Typography variant="body2">• Accounts Receivable <span style={{ float: "right" }}>{AccountReceivable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
             <Typography variant="body2" sx={{ mt: 2 }}>Other Current Assets <span style={{ float: "right" }}>{OtherAssets().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
             
             <Box display="flex" alignItems="center" ml={2}>
               <Typography variant="body2">Loans & Advances (Asset)</Typography>
               <IconButton size="small" onClick={() => setreceivableGstopen(!receivablegstOpen)}>
                 {receivablegstOpen ? <ExpandLess /> : <ExpandMore />}
               </IconButton>
             </Box>
             <Collapse in={receivablegstOpen} ml={4}>
               <Box ml={4} color="textSecondary">
                  {IgstReceivable() > 0 && <Typography variant="body2">Input IGST <span style={{ float: "right" }}>{IgstReceivable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>}
                  {CgstReceivable() > 0 && <>
                 <Typography variant="body2">Input CGST <span style={{ float: "right" }}>{CgstReceivable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
                 <Typography variant="body2">Input SGST <span style={{ float: "right" }}>{SgstReceivable().toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography></>}
               </Box>
               {/* <Typography variant="h6" fontWeight="bold">Total for GST Payable <span style={{ float: "right" }}>
                 {(IgstReceivable()+CgstReceivable()+SgstReceivable()).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography> */}
             </Collapse>
             <Typography variant="h6" fontWeight="bold">Total for Input Tax Credits <span style={{ float: "right" }}>
               {(IgstReceivable()+CgstReceivable()+SgstReceivable()).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
           </Box><br/>
           <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>TOTAL CURRENT ASSETS <span style={{ float: "right" }}>
             {(AccountReceivable()+IgstReceivable()+CgstReceivable()+SgstReceivable()).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography><br/>
             <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>Closing Stocks<span style={{ float: "right" }}>
             {closingstocks.toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography><br/>
           <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>TOTAL ASSETS <span style={{ float: "right" }}>
             {(AccountReceivable()+OtherAssets()+IgstReceivable()+CgstReceivable()+SgstReceivable()+closingstocks).toLocaleString("en-US", {minimumFractionDigits: 2,maximumFractionDigits: 2})}</span></Typography>
         </Grid>
       </Grid>
       <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
         **Amount is displayed in your base currency <Box component="span" sx={{ backgroundColor: "#c8e6c9", px: 1, borderRadius: 1 }}>INR</Box>
       </Typography>
     {/* </Paper> */}
   </Container>
   </Card>
    </div>
  );
};

export default BalanceSheet;
