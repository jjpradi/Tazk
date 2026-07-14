import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { listStockgroupDataAction } from '../../../redux/actions/sales_actions';
import context from '../../../context/CreateNewButtonContext';
import { Box, Card, Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import moment from 'moment';
import CommonFilter from 'components/pos/payment_section/CommonFilter';
import NoRecordFound from 'components/Layout/NoRecordFound';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { titleURL } from 'http-common';



export default function index(props) {
  const { filter_date } = props;


  const [isFilter, setIsFilter] = useState(false);
  const [filtereddata, setFiltereddata] = useState([]);
  const [filterOpen, handleFilter] = useState(false);
  const [date, setdate] = React.useState(new Date());
  const [newValue, setNewValue] = useState('');
  const [isApiFinished, setIsApiFinished] = useState(false);
  
  const dispatch = useDispatch();

  const {
    salesReducer: { stockgroup_data },
  } = useSelector((state) => state);
  const { setLoaderStatusHandler, setModalTypeHandler } = useContext(context);


  useEffect(() => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );

    let data = {
      date: convertedDate
    }
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listStockgroupDataAction(data, setModalTypeHandler, setLoaderStatusHandler))
    ).finally(() => setIsApiFinished(true));
  }, []);


  const handleDateChange = async (date) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );
    // await props.listSalesDateAction(convertedDate);
    setIsFilter(true);
  };

  const clearButton = () => {
    const currentDate = new Date();
    setdate(currentDate);
  };

  const ApplyButton = async (value1, value2, newValue, event) => {
    const dateVal = date;
    setdate(dateVal);
    let convertedDate = moment(dateVal, 'year', 'month', 'day').format(
      'yyyy-MM-DD',
    );

    let data = {
      date: convertedDate
    }
    
    apiCalls(
      setModalTypeHandler, 
      setLoaderStatusHandler,
      dispatch(listStockgroupDataAction(data, setModalTypeHandler, setLoaderStatusHandler))
    );
    handleFilter();
  }


  const sumData = () => {
    let oldData = stockgroup_data;
    let totalInwards = 0;

    oldData.forEach((d)=>{
      if(d.Inwards_Qty){
          totalInwards = totalInwards+d.Inwards_Qty
      }
  })
  return totalInwards
  }

 
  const inwardsprice = () => {
    let oldData = stockgroup_data;
    let inward_price = 0;

    oldData.forEach((d)=>{
      if(d.inwards_total){
          inward_price = inward_price+d.inwards_total
      }
  })
  return inward_price
  }


  const outqty = () => {
    let oldData = stockgroup_data;
    let salesoutqty = 0;

    oldData.forEach((d)=>{
      if(d.outwardsQty){
          salesoutqty = salesoutqty+d.outwardsQty
      }
  })
  return salesoutqty
  }

  const outprice = () => {
    let oldData = stockgroup_data;
    let salesoutprice = 0;

    oldData.forEach((d)=>{
      if(d.outwards_value){
          salesoutprice = salesoutprice+d.outwards_value
      }
  })
  return salesoutprice
  }

  const consump = () => {
    let oldData = stockgroup_data;
    let consumpData = 0;

    oldData.forEach((d)=>{
      if(d.consumptionName){
          consumpData = consumpData+d.consumptionName
      }
  })
  return consumpData
  }

  const grossprofit = () => {
    let oldData = stockgroup_data;
    let grosspro = 0;

    oldData.forEach((d)=>{
      if(d.profitMargin){
          grosspro = grosspro+d.profitMargin
      }
  })
  return grosspro
  }

  const closeqty = () => {
    let oldData = stockgroup_data;
    let closeDataqty = 0;

    oldData.forEach((d)=>{
      if(d.closing_Qty){
          closeDataqty = closeDataqty+d.closing_Qty
      }
  })
  return closeDataqty
  }

  const closeprice = () => {
    let oldData = stockgroup_data;
    let closeDataprice = 0;

    oldData.forEach((d)=>{
      if(d.closingBalance){
          closeDataprice = closeDataprice+d.closingBalance
      }
  })
  return closeDataprice
  }

  // listStockgroupDataAction
  return (
    <Grid container spacing={2} display='flex' alignItems='center'>
      <Helmet>
              <meta charSet="utf-8" />
              <title> {titleURL} | Stock Group </title>
    </Helmet>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', flex: 1 }}>Stock Group Summary</Typography>
          {[
            { label: 'Categories', value: stockgroup_data?.length || 0, color: '#2E3A59' },
            { label: 'Total Inward', value: Number(stockgroup_data?.reduce((s, r) => s + (r.totalInwardqty || 0), 0) || 0).toLocaleString('en-IN'), color: '#11C15B' },
            { label: 'Total Outward', value: Number(stockgroup_data?.reduce((s, r) => s + (r.total_sales_out || 0), 0) || 0).toLocaleString('en-IN'), color: '#d32f2f' },
          ].map(k => (
            <Box key={k.label} sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 80 }}>
              <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{k.label}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: k.color, lineHeight: 1.3 }}>{k.value}</Typography>
            </Box>
          ))}
        </Box>
      </Grid>
      <Grid
        display='flex'
        justifyContent='flex-end'
        size={{
          lg: 1,
          md: 1,
          sm: 1,
          xs: 2
        }}>
        <Tooltip title='Filter'>
          <IconButton>
            <CommonFilter
              Datefilter={true}
              filter_date={filter_date}
              handleDateChange={handleDateChange}
              newValue={newValue}
              value={date}
              handleClose={handleFilter}
              setNewValue={setNewValue}
              open={filterOpen}
              ApplyButton={ApplyButton}
              clearButton={clearButton}
              shouldFetchData={false}
            />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Card sx={{p:'20px', borderRadius: 1}}>
        <TableContainer>
        <Table border="1" cellPadding="0" cellSpacing="0">
          <TableBody>
<TableRow height="50">
  <td align="center" width="300" rowSpan="2"><h4 style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight }}>Particulars</h4></td>
  <td align="center" width="300" colSpan="2"><h4 style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight }}>Inwards</h4></td>
  <td align="center" width="300" colSpan="5"> <h4 style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight }}>Outwards</h4></td>
  <td align="center" width="300" colSpan="2"><h4 style={{fontSize:font14_500.fontSize , fontWeight :font14_500.fontWeight }}>Closing Balance</h4></td>
</TableRow>
<TableRow height="50">
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Quantity</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Value</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Quantity</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Value</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Consumption</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Profit</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>%</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Quantity</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>Value</td>
</TableRow>

{stockgroup_data.length > 0 ?  stockgroup_data.map((d) => {
  return(
    <TableRow key={d.item_id}>
    <td align="center" width="150" ><h4 style={{fontSize:font14_500.fontSize }}>{d.product_name}</h4></td>
    <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.Inwards_Qty}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.inwards_total}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.outwardsQty}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.outwards_value}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.consumptionName}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.profitMargin}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.percentage}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.closing_Qty}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{d.closingBalance}</td>

  </TableRow>

  );
}
) : 
<TableRow style={{height:"100px"}}>
<td align="center" width="150" colSpan="10" > {isApiFinished ? <NoRecordFound/> : ""} </td>
</TableRow>
}

<TableRow height="30" >
<td align="center" width="150" style={{fontWeight:headerStyle.fontWeight,fontSize:headerStyle.fontSize,}}>Grand Total</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{sumData()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{inwardsprice()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{outqty()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{outprice()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{consump()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{grossprofit()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}></td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{closeqty()}</td>
  <td align="center" width="150" style={{fontSize:font14_500.fontSize }}>{closeprice().toFixed(2)}</td>
</TableRow>
</TableBody>


</Table>
        </TableContainer>
        </Card>
      </Grid>
    </Grid>
  );
}
