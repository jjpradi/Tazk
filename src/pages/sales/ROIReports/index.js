import * as React from 'react';
import { useState, useMemo } from 'react';
import { Box, Card, Chip, Dialog, Fade, Grid, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { CurrencyRupeeIcon } from 'pages/routesIcons';
import billIcons from '../../../assets/icon/invoice-svgrepo-com.svg';
import clientIcon from '../../../assets/icon/clientWiseProfitSVG.svg';
import brandprofitIcon from '../../../assets/icon/brandEiseProfitsSVG.svg';
import categoriesProfitIcon2 from '../../../assets/icon/categories (1).png';
import productProfitIcon from '../../../assets/icon/product-profit-margin.png';
import productProfitIcon1 from '../../../assets/icon/sales.png';
import productProfitIcon2 from '../../../assets/icon/high-value.png';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { get_searchProfitWiseReportAction, getProfitWiseReportAction } from 'redux/actions/sales_actions';
import { useContext } from 'react';
import context from '../../../context/CreateNewButtonContext';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import { FilterAlt } from '@mui/icons-material';
import CommonSearch from 'utils/commonSearch';
import moment from 'moment';
import HomeIcon from '@mui/icons-material/Home';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import ShareIcon from '@mui/icons-material/Share';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import { useNavigate } from 'react-router-dom';
const ProfitWiseReport = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const {
    salesReducer: {profitWiseReport, profitWiseReportCount, currentMonthProfit, currentFinancialYearProfit, highestProductProfit, lowestProductProfit, highestCategoryProfit, lowestCategoryProfit}
} = useSelector((state) => state);

let date = new Date();
    let firstDay = date.getMonth() <= 2 ? new Date(date.getFullYear()-1, 3, 1) : new Date(date.getFullYear(), 3, 1);
    let lastDay = new Date();

  const [selectedReport, setselectedReport] = useState('byBill');
  const [filterOpen, setfilterOpen] = useState(false)
  const [searchString, setsearchString] = useState('')
  const [filterData, setFilterData] = useState({
    from: firstDay,
    to: lastDay,
    dateRange : null
  })
  const [filterDataError, setFilterError] = useState({
    from: firstDay,
    to: lastDay
  })
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [scheduleOpen,setScheduleOpen] =  useState(false)
  const [shareOpen,setShareOpen]= useState(false)
  


  const columns = useMemo(() => {
    return selectedReport === "byBill"
      ? [
          { field: 'invoice_number', headerName: 'Invoice Number', flex: 1 ,type:"string" },
          { field: 'invoice_date', headerName: 'Invoice Date', flex: 1 ,type:"string" },
          { field: 'company_name', headerName: 'Customer Name', flex: 2,type:"string" },
          { field: 'buying_price', headerName: 'Buying Cost', type: 'number', flex: 1 },
          { field: 'selling_price', headerName: 'Selling Price', type: 'number', flex: 1 },
          { field: 'totalProfit', headerName: 'Total Profit', type: 'number', flex: 1 },
          { field: 'profit_percentage', headerName: 'Profit %', type: 'number', flex: 1 }
        ]
      : selectedReport === "byParty" ? [
          { field: 'company_name', headerName: 'Party Name', flex: 1.5 ,type:"string" },
          { field: 'buying_price', headerName: 'Buying Cost', type: 'number', flex: 1 },
          { field: 'selling_price', headerName: 'Selling Price', type: 'number', flex: 1 },
          { field: 'totalProfit', headerName: 'Total Profit', type: 'number', flex: 1 },
          { field: 'profit_percentage', headerName: 'Profit %', type: 'number', flex: 1 }
        ] 
      : selectedReport === "byBrand" ? [
          { field: 'brand', headerName: 'Brand Name', flex: 1.5 ,type:"string" },
          { field: 'buying_price', headerName: 'Buying Cost', type: 'number', flex: 1 },
          { field: 'selling_price', headerName: 'Selling Price', type: 'number', flex: 1 },
          { field: 'totalProfit', headerName: 'Total Profit', type: 'number', flex: 1 },
          { field: 'profit_percentage', headerName: 'Profit %', type: 'number', flex: 1 }
        ] 
      : selectedReport === "byCategory" ? [
          { field: 'category', headerName: 'Category Name', flex: 1.5,type:"string" },
          { field: 'buying_price', headerName: 'Buying Cost', type: 'number', flex: 1 },
          { field: 'selling_price', headerName: 'Selling Price', type: 'number', flex: 1 },
          { field: 'totalProfit', headerName: 'Total Profit', type: 'number', flex: 1 },
          { field: 'profit_percentage', headerName: 'Profit %', type: 'number', flex: 1 }
        ] 
      : [
          { field: 'product_name', headerName: 'Product Name', flex: 1.5 ,type:"string" },
          { field: 'buying_price', headerName: 'Buying Cost', type: 'number', flex: 1 },
          { field: 'selling_price', headerName: 'Selling Price', type: 'number', flex: 1 },
          { field: 'totalProfit', headerName: 'Total Profit', type: 'number', flex: 1 },
          { field: 'profit_percentage', headerName: 'Profit %', type: 'number', flex: 1 }
        ];
  }, [selectedReport]);


const [Schedulecolumns,setSchedulecolumns] =  useState()

  useEffect(() => {
    const data = {
      brand: '',
      category: '',
      location_id: headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: commoncookie,
      pageCount: page, 
      numPerPage:  pageSize,
      type: selectedReport,
      searchString: searchString
    };
    dispatch(getProfitWiseReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
  }, [selectedReport, page, pageSize])
  
  const handleFilterClose = () => {
    setfilterOpen(false)
  }

 const handleFilterChange = (data) =>{
   // console.log('sdsadfasef',date_val, data.target.name)
   if(data.target.name === 'dateRange'){
     var date_val = data.target.value;
      var date_val1 = data.target.value1;
      var date_val2 = data.target.value2;
      console.log(date_val,'date_val1',date_val1)
       setFilterData({
        ...filterData,
        from: date_val,
        to: date_val1,
        dateRange: date_val2
      });

      
    }
    else{
    let date_val = data?.target?.value?._d;
    setFilterData({ ...filterData, [data.target.name]: date_val });
    }
    // console.log('sdfsdgdfgre',filterData.from)
    if (moment(filterData.from, 'year') <= moment(filterData.to, 'year')) {
      if (moment(filterData.from, 'month') <= moment(filterData.to, 'month')) {
        if (moment(filterData.from, 'day') <= moment(filterData.to, 'day')) {
          setFilterError({ ...filterDataError, from: '', to: '' });
        } else {
          setFilterError({ ...filterDataError, [data.target.name]: 'Invalid Date 1' });
        }
      } else {
        setFilterError({ ...filterDataError, [data.target.name]: 'Invalid Date 2' });
      }
    } else {
      setFilterError({ ...filterDataError, [data.target.name]: 'Invalid Date 3' });
    }
  }

  const handleFilterApply = () => {
    const data = {
      brand: '',
      category: '',
      location_id: headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: moment(filterData.from).format('YYYY/MM/DD') ,
      to: moment(filterData.to).format('YYYY/MM/DD'),
      user_id: commoncookie,
      pageCount: page, 
      numPerPage:  pageSize,
      type: selectedReport,
      searchString: searchString
    };
    dispatch(getProfitWiseReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
    setfilterOpen(false)

  }

  const handleClear = () =>{
    const data = {
      brand: '',
      category: '',
      location_id: headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null ,
      to: null,
      user_id: commoncookie,
      pageCount: page, 
      numPerPage:  pageSize,
      type: selectedReport,
      searchString: searchString
    };
    dispatch(getProfitWiseReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
    setFilterData({ ...filterData,
      from: firstDay,
      to: lastDay,
      dateRange : null
    });
    setfilterOpen(false)
  }

  const requestSearch = (e) => {
    let val = e.target.value;
     setsearchString(val)
     if(val.length >=3 || val.length ===0) {
       setPage(0)
     }
    const data = {
      brand: '',
      category: '',
      location_id: headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: commoncookie,
      pageCount: page, 
      numPerPage:  pageSize,
      type: selectedReport,
      searchString: val
    };
    dispatch(get_searchProfitWiseReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
  
  };

  const cancelSearch = () => {
     setsearchString('')
    setPage(0)
    const data = {
      brand: '',
      category: '',
      location_id: headerLocationId,
      max_price: '',
      min_price: '',
      payment_type: '',
      from: null,
      to: null,
      user_id: commoncookie,
      pageCount: page, 
      numPerPage:  pageSize,
      type: selectedReport,
      searchString: ''
    };
    dispatch(getProfitWiseReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
  
  };

  const handlePageChange = (page) => {
     setPage(page)
  }

  const handlePageSizeChange = (pageSize) => {
    setPageSize(pageSize)
 }

console.log("profitWiseReport",selectedReport);


useEffect(()=>{
  

    if(selectedReport === 'byBill'){
     return setSchedulecolumns(
        [
          { name: 'Invoice Number', key: 'invoice_number' },
          { name: 'Invoice Date', key: 'invoice_date' },
          { name: 'Customer Name', key: 'company_name' },
          { name: 'Buying Cost', key: 'buying_price' },
          { name: 'Selling Price', key: 'selling_price' },
          { name: 'Total Profit', key: 'totalProfit' },
          { name: 'Profit %', key: 'profit_percentage' }
        ]

      )
    }

    else if(selectedReport === 'byParty'){
      return setSchedulecolumns([
        { name: 'Party Name', key: 'company_name' },
        { name: 'Buying Cost', key: 'buying_price' },
        { name: 'Selling Price', key: 'selling_price' },
        { name: 'Total Profit', key: 'totalProfit' },
        { name: 'Profit %', key: 'profit_percentage' }
      ])
    }

    else if(selectedReport === 'byBrand'){
     return setSchedulecolumns([
        { name: 'Brand Name', key: 'brand' },
        { name: 'Buying Cost', key: 'buying_price' },
        { name: 'Selling Price', key: 'selling_price' },
        { name: 'Total Profit', key: 'totalProfit' },
        { name: 'Profit %', key: 'profit_percentage' }
      ])
    }

    else if(selectedReport === 'byCategory'){
     return setSchedulecolumns([
        { name: 'Category Name', key: 'category' },
        { name: 'Buying Cost', key: 'buying_price' },
        { name: 'Selling Price', key: 'selling_price' },
        { name: 'Total Profit', key: 'totalProfit' },
        { name: 'Profit %', key: 'profit_percentage' }
      ])

    }

    else{
     return setSchedulecolumns([
          { name: 'Product Name', key: 'product_name' },
          { name: 'Buying Cost', key: 'buying_price' },
          { name: 'Selling Price', key: 'selling_price' },
          { name: 'Total Profit', key: 'totalProfit' },
          { name: 'Profit %', key: 'profit_percentage' }
        ]
        )
    }

  
},[selectedReport])

console.log(filterData,'filterDatafff')

  return (
    <div>
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%',pb:'0px', overflow: 'auto', '&::-webkit-scrollbar': {
     width: 0,
     height: 0,
   },
   '&::-webkit-scrollbar-thumb': {
     backgroundColor: 'transparent',
   }, }}>
     <Helmet>
       <meta charSet="utf-8" />
       <title> {titleURL} | Profit Wise </title>
     </Helmet>
   <Grid container spacing={3}>
     <Grid size={12}>
       <Typography variant="h6" style={{ padding: '10px 0' }}>
         {/* <Link href="/report" underline="hover">
   <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
         Home 
         </Link>
          / Profit Wise Report */}
         <Box style={{ display: 'flex' }}>
           <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>
             <HomeIcon sx={{mr: 0.5}} fontSize='inherit' />
             Home
           </Box>
           &nbsp;/&nbsp;Profit Wise Report
         </Box>
       </Typography>
     </Grid>

     {/* Report Cards */}
     {[{ icon: billIcons, label: 'Current Month Profit', value: currentMonthProfit }, 
       { icon: clientIcon, label: 'Current Year Profit', value: currentFinancialYearProfit },
       { icon: brandprofitIcon, label: 'Highest By Product', value: highestProductProfit },
       { icon: categoriesProfitIcon2, label: 'Lowest By Product', value: lowestProductProfit },
       { icon: productProfitIcon2, label: 'Highest By Category', value: highestCategoryProfit },
       { icon: productProfitIcon2, label: 'Lowest By Category', value: lowestCategoryProfit }]
       .map((item, index) => (
         <Grid
           key={index}
           size={{
             lg: 2,
             md: 2,
             sm: 2,
             xs: 6
           }}>
           <Card sx={{ 
         borderRadius: '5px', 
         padding: '10px', 
         display: 'flex', 
         alignItems: 'center',
         boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
         transition: 'all 0.3s ease-in-out',
         '&:hover': { 
           boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)'
         }
       }}
       >
             {/* <img src={item.icon} height={60} width={40} alt={item.label} /> */}
             <Box pl={2}>
               <Stack direction="row" alignItems="center">
                 <CurrencyRupeeIcon sx={{ fontSize: 16 }} /> {` ${item.value}`}
               </Stack>
               <Typography variant="body2" color="textSecondary" sx={{ pl: 4 }}>{item.label}</Typography>
             </Box>
           </Card>
         </Grid>
       ))}

     {/* Chips Section */}
     {/* <Card sx={{ pt: '20px', width: '100%',mt: '30px',mx: 4, alignItems:"center" }}> */}
     <Grid
       display="flex"
       justifyContent="space-between"
       alignItems="center"
       size={{
         lg: 12,
         md: 12,
         sm: 12,
         xs: 12
       }}>
 {/* Chips Section (Aligned Left) */}
 <Box sx={{ display: 'flex', gap: 1, py: 1, mx: 2 }}>
   {['byBill', 'byParty', 'byBrand', 'byCategory', 'byProduct'].map((report, index) => {
     const formattedLabel = report.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (char) => char.toUpperCase());
     return (
       <Chip
         key={index}
         label={formattedLabel}
         clickable
         color={selectedReport === report ? 'primary' : 'default'}
         onClick={() => setselectedReport(report)}
         sx={{
           boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',  
           transition: 'all 0.3s ease-in-out',
           '&:hover': {
             boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)' 
           },
           mr: '10px',
         }}
       />
     );
   })}
 </Box>

 {/* Search & Filter (Aligned Right) */}
 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto', pr: 2 }}>
   <Tooltip title="Filter" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
     <IconButton>
       <CommonFilter
         PaymentReport={true}
         open={filterOpen}
         from={filterData.from}
         to={filterData.to}
         dateRange={filterData.dateRange}
         handleClose={setfilterOpen}
         handleChange={handleFilterChange}
         ApplyButton={handleFilterApply}
         clearButton = {handleClear}
         shouldFetchData={true}
         type = {'report'}
       />
     </IconButton>
   </Tooltip>

   <Tooltip title="Filter" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
     <IconButton 
       onClick={()=> setScheduleOpen(true)}
     >
       <ScheduleIcon/>
     </IconButton>
   </Tooltip>

   <Tooltip title="Filter" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} placement="top">
     <IconButton 
       onClick={()=> setShareOpen(true)}
     >
       <ShareIcon/>
     </IconButton>
   </Tooltip>
   
   <CommonSearch
     searchVal={searchString}
     cancelSearch={cancelSearch}
     requestSearch={requestSearch}
   />
 </Box>
</Grid>

     <Grid size={12}>
       {/* <Card> */}
    <Box
      sx={{
        width: '100%',
        height: 'calc(100% - 10px)',
        overflow: 'hidden',
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#F4F7FE',
          borderRadius: '4px',
          padding: '8px',
          height: 'calc(100vh - 330px)', width: '100%' 
        }}
      >
         <DataGrid 
         rows={profitWiseReport}
         columns={columns}  
         // autoHeight 
         
         
         rowCount={profitWiseReportCount}
         
         paginationMode='server'
         pageSizeOptions={[20,50,100]}
         
         
         // paginationMode='server'
         // density='compact'
         disableRowSelectionOnClick paginationModel={{ page: page, pageSize: pageSize }} onPaginationModelChange={(model) => { if (model.page !== page) { ((page) => handlePageChange(page))(model.page); } if (model.pageSize !== pageSize) { ((size) => handlePageSizeChange(size))(model.pageSize); } }} 
         // sx={{
         //   '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': { width: 10 },
         //   '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
         //     backgroundColor: '#B2B2B2',
         //     borderRadius: 2,
         //     border: '2px solid white',
         //   },
         //   '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover': {
         //     background: '#999',
         //   },
         //   '& .MuiDataGrid-columnHeaders': {
         //   fontFamily: 'Poppins',
         //   fontSize: '12px',
         //   fontWeight: '600',
         //   color: 'rgba(0, 0, 0, 0.7)',
         // },
         // }}
         />
          </Box>
         </Box>
       {/* </Card> */}
     </Grid>
     {/* </Card> */}

           <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)}>
             <CommonSchedule
               report_name="Profit Wise Report"
               handleClose={() => setScheduleOpen(false)}
               open={scheduleOpen}
               columns={Schedulecolumns}
             />
           </Dialog>

                   <Dialog open={shareOpen}>
                       <ShareReport
                       report_name  = {'Profit Wise Report'}
                       handleClose = {()=> setShareOpen(false)}
                       open={shareOpen}
                       columns = {Schedulecolumns}
                       data = {profitWiseReport}
                       fromDate = {moment(filterData.from, 'year', 'month', 'day').format('yyyy-MM-DD')}
                       toDate = {moment(filterData.to, 'year', 'month', 'day').format('yyyy-MM-DD')}
                     />
                     </Dialog>

   </Grid>
   </Card>
    </div>
  );
};

export default ProfitWiseReport;
