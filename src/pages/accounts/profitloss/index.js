import React, { useContext, useEffect, useState } from "react";
import { Container, Typography, Grid, Paper, Box, IconButton, Collapse,Link, Card } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import moment from 'moment';
import { getCurrentFinancialYear } from 'utils/getTimeFormat';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from "../../../context/CreateNewButtonContext";
import apiCalls from 'utils/apiCalls';
import CommonFilter from '../../../components/pos/payment_section/CommonFilter';
import {
  listProfitlossAction,
  listProfitlossdateAction,
  getlimitdatafromprofitloss,
  stocksProfitloss
} from '../../../redux/actions/profitloss_actions';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { useNavigate } from "react-router-dom";


const ProfitLoss = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const {
    setModalTypeHandler,
    setLoaderStatusHandler
} = useContext(CreateNewButtonContext);

  
  const [openingstocks, setOpeningstock] = useState(false)
  const [closingstocks, setClosingstock] = useState(false)
  const [directexpense, setDirectExpense] = useState(false)
  const [income, setIncome] = useState(false)
  const financialYear = getCurrentFinancialYear().format('DD-MMMM-YYYY');
  const [from, setFrom] = useState(new Date(getCurrentFinancialYear().fromDate));
  const [to, setTo] = useState(new Date(getCurrentFinancialYear().toDate))
  // const [ errormsg, setErrormsg] = useState({from: '',
  //   to: '',});
  const [errorname, setErrorname] = useState('')
  const [filterOpen, setFilteropen] = useState(false)
  const [fromTo, setFromTo] = useState({
    from : financialYear.fromDate,
    to : financialYear.toDate
  })

   const { profitlossReducer: { profitloss, stocks } } = useSelector((state) => state);
  

  useEffect(()=>{
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
      listProfitlossAction(
        moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        setModalTypeHandler,
        setLoaderStatusHandler,
      )),
      dispatch(stocksProfitloss(
        moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),
        moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
        setModalTypeHandler,
        setLoaderStatusHandler,
      )))
  },[])


  const expenses = () => {
    let total = 0;
    profitloss
      .filter((s) => s.accountTypeName === 'Expense/Cost')
      .forEach((d) => {
        total += +d.amount;
      });
    return total;
  };

  const revenue = () => {
    let total = 0;
    profitloss
      .filter((s) => s.accountTypeName === 'Revenue/Income' )
      .forEach((d) => {
        total += +d.amount;
      });

    return total;
  };

 // Extract values from profitloss reducer
const directIncome = profitloss
.filter((s) => s.accountGroupName === "Direct Income")
.reduce((sum, item) => sum + item.amount, 0); // Sum all Direct Income amounts

const indirectIncome = profitloss
.filter((s) => s.accountGroupName === "Indirect Income")
.reduce((sum, item) => sum + item.amount, 0);

const directExpenses = profitloss
.filter((s) => s.accountGroupName === "Direct Expenses")
.reduce((sum, item) => sum + item.amount, 0); // Sum all Direct Expenses amounts

// Extract values from stocks reducer
const openingTotal = stocks.find((s) => s.openingtotal !== undefined)?.openingtotal || 0;
const closingTotal = stocks.find((s) => s.closingtotal !== undefined)?.closingtotal || 0;

// Apply Gross Profit formula
const grossProfit = (directIncome + closingTotal) - (openingTotal + directExpenses);
const Profit = stocks.find((s) => s.netprofit !== undefined)?.netprofit || 0;
const netProfit = Profit + indirectIncome;
const Grossbf = stocks.find((s) => s.grossProfit !== undefined)?.grossProfit || 0;

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
    
  };

  const handleFilter = (data) => setFilteropen(data);
  
 const  ApplyButton = async () => {
  setFromTo((prev) => ({...prev, from : moment( from, 'year', 'month', 'day').format('DD-MMMM-YYYY'), to : moment( to, 'year', 'month', 'day').format('DD-MMMM-YYYY')}))
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(
    listProfitlossAction(
      moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
    )),
    dispatch(stocksProfitloss(
      moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(to, 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(from, 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
    )))
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
    dispatch(
    listProfitlossAction(
      moment(new Date(financialYear.fromDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(new Date(financialYear.toDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(new Date(financialYear.fromDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
    )),
    dispatch(stocksProfitloss(
      moment(new Date(financialYear.fromDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(new Date(financialYear.toDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      moment(new Date(financialYear.fromDate), 'year', 'month', 'day').format('yyyy-MM-DD'),
      setModalTypeHandler,
      setLoaderStatusHandler,
    )))
  setFilteropen(false)
};


  
  return (
    <div>
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%', overflow: 'auto' }}>
     <Helmet>
       <meta charSet="utf-8" />
       <title> {titleURL} | Profit & Loss </title>
     </Helmet>
   <Container maxWidth='500px' maxHeight='1000px' >
     {/* <Paper elevation={3} sx={{ p: 3, borderRadius: 2, border: "1px solid grey", boxShadow: 2 }}> */}
     <Typography
                   variant='h6'
                   align='left'
                   style={{paddingTop: '10px', paddingBottom: '10px'}}
                 >
                     {/* <Link href='/report' underline="hover">Home</Link> / Profit & Loss */}
                     <Box style={{ display: 'flex' }}>
                       <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
                       &nbsp;/&nbsp;Profit & Loss
                     </Box>
                 </Typography>
       <Typography variant="h5" align="center" gutterBottom>
         Profit & Loss
       </Typography>
       <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
         Basis: Accrual<br />As of {fromTo.from} to {fromTo.to}
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
           <Typography variant="h6">Profit & Loss</Typography>
           <hr />
 
            
           <Box ml={2}>
           <Box display="flex" alignItems="center" justifyContent="space-between" ml={2}>
             <Box display="flex" alignItems="center">
               <Typography variant="body2">Opening Stocks</Typography>
               <IconButton size="small" onClick={() => setOpeningstock(!openingstocks)} sx={{ ml: 1 }}>
                 {openingstocks ? <ExpandLess /> : <ExpandMore />}
               </IconButton>
             </Box>
             <Typography variant="body2">{stocks[0]?.openingtotal.toFixed(2)}</Typography>
           </Box>

           {stocks[1]?.openingstocks
             ?.filter((d) => d.totalvalues !== null) // Filter out null totalvalues
             .map((d, index) => (
               <Collapse key={index} in={openingstocks}>
                 <Box ml={4} color="textSecondary">
                   <Box display="flex" justifyContent="space-between">
                     <Typography variant="body2">{d.location_name || "Unknown Location"}</Typography>
                     <Typography variant="body2">{d.totalvalues.toFixed(2)}</Typography>
                   </Box>
                 </Box>
               </Collapse>
             ))}

           </Box>
           <Box ml={2}>
           <Box display="flex" alignItems="center" justifyContent="space-between" ml={2}>
             <Box display="flex" alignItems="center">
               <Typography variant="body2">Expenses</Typography>
               <IconButton size="small" onClick={() => setDirectExpense(!directexpense)} sx={{ ml: 1 }}>
                 {directexpense ? <ExpandLess /> : <ExpandMore />}
               </IconButton>
             </Box>
             <Typography variant="body2">{expenses().toFixed(2)}</Typography>
           </Box>

           {profitloss
             .filter((s) => s.accountTypeName === "Expense/Cost") // Filter only Expense/Cost
             .map((expense, index) => (
               <Collapse key={index} in={directexpense}>
                 <Box ml={4} color="textSecondary">
                   {expense.accname.map((acc, i) => ( // Iterate over accname array
                     (<Box key={i} display="flex" justifyContent="space-between">
                       <Typography variant="body2">{acc.name}</Typography>
                       <Typography variant="body2">{acc.amount.toFixed(2)}</Typography>
                     </Box>)
                   ))}
                 </Box>
               </Collapse>
             ))}


           </Box>
           <Typography variant="body2">GrossProfit c/o <span style={{ float: "right" }}>
             {grossProfit?.toFixed(2)}</span></Typography>
           <hr/>
           <Typography variant="body1" fontWeight="bold">TOTAL <span style={{ float: "right" }}>
             {(expenses()+openingTotal+grossProfit).toFixed(2)}</span></Typography>
           <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>Net Profit<span style={{ float: "right" }}>{netProfit.toFixed(2)}</span></Typography>
         </Grid>

         {/* Assets */}
         <Grid
           sx={{ padding: 2 }}
           size={{
             xs: 12,
             md: 6
           }}>
           <Typography variant="h6">Profit & Loss</Typography>
           <hr />
           
           <Box ml={2}>
           <Box display="flex" alignItems="center" justifyContent="space-between" ml={2}>
             <Box display="flex" alignItems="center">
               <Typography variant="body2">Closing Stocks</Typography>
               <IconButton size="small" onClick={() => setClosingstock(!closingstocks)} sx={{ ml: 1 }}>
                 {closingstocks ? <ExpandLess /> : <ExpandMore />}
               </IconButton>
             </Box>
             <Typography variant="body2">{stocks[2]?.closingtotal.toFixed(2)}</Typography>
           </Box>

           {stocks[3]?.closingstocks
             ?.filter((d) => d.totalvalues !== null) // Filter out null totalvalues
             .map((d, index) => (
               <Collapse key={index} in={closingstocks}>
                 <Box ml={4} color="textSecondary">
                   <Box display="flex" justifyContent="space-between">
                     <Typography variant="body2">{d.location_name || "Unknown Location"}</Typography>
                     <Typography variant="body2">{d.totalvalues.toFixed(2)}</Typography>
                   </Box>
                 </Box>
               </Collapse>
             ))}

           </Box>
           <Box ml={2} style={{paddingBottom:"15.5px"}}>
           <Box display="flex" alignItems="center" justifyContent="space-between" ml={2}>
             <Box display="flex" alignItems="center">
               <Typography variant="body2">Income</Typography>
               <IconButton size="small" onClick={() => setIncome(!income)} sx={{ ml: 1 }}>
                 {income ? <ExpandLess /> : <ExpandMore />}
               </IconButton>
             </Box>
             <Typography variant="body2">{revenue().toFixed(2)}</Typography>
           </Box>

           {profitloss
             .filter((s) => s.accountTypeName === "Revenue/Income") // Filter only Expense/Cost
             .map((expense, index) => (
               <Collapse key={index} in={income}>
                 <Box ml={4} color="textSecondary">
                   {expense.accname.map((acc, i) => ( // Iterate over accname array
                     (<Box key={i} display="flex" justifyContent="space-between">
                       <Typography variant="body2">{acc.name}</Typography>
                       <Typography variant="body2">{acc.amount.toFixed(2)}</Typography>
                     </Box>)
                   ))}
                 </Box>
               </Collapse>
             ))}


           </Box>
           
           <hr/>
           <Typography variant="body1" fontWeight="bold">TOTAL <span style={{ float: "right" }}>
             {(revenue()+closingTotal).toFixed(2)}</span></Typography>
           <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>Gross Profit b/f<span style={{ float: "right" }}>{Grossbf.toFixed(2)}</span></Typography>
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

export default ProfitLoss;
