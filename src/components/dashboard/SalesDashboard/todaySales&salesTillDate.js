import React, {useState, useEffect, useContext} from 'react';
import {
  Grid,
  Card,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReactApexChart from 'react-apexcharts';
import {useDispatch, useSelector} from 'react-redux';
import {getTotalSaleLocationBarAction, totalSaleByMonthAction,lastTenDaysSalesAction,salesTillDateRecordAction,totalSaleByDateAction} from 'redux/actions/pos_sale_actions';
import _ from 'lodash';
import {clientwebsocket } from '../../../http-common'
import { listInventoryByIdAction } from '../../../redux/actions/inventory_actions';
import apiCalls from 'utils/apiCalls';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
const style = {
  width: '100%',
  maxWidth: 360,
  bgcolor: 'background.paper',
};



const TodaySales = (props) => {
  const date = new Date();
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    setModalStatusHandler,
  } = useContext(CreateNewButtonContext);

  const dispatch = useDispatch();

  // const [date, setDate] = useState(new Date().getDate())
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const [pollTimer, setPollTimer] = useState(null)

  const [state, setState] = useState({
    monthVal: '',
    selectedMonth: '',
  });

  // const {
  //   posSaleReducer: {totalSaleByMonth,totalSaleLocationBar,lastTenDaysSales,salesTillDateRecord,totalSaleByDate},
  // } = useSelector((state) => state);
const lastTenDaysSales = props.data.length > 0 ? props.data[0] : {}
  

  const data = {
    product_name: '',
    brand: '',
    category: '',
    gb:'',
    max_price: '',
    min_price: '',
    location_id: headerLocationId,
    user_id: commoncookie,
    pageCount: 0,
    numPerPage:10,
  };

  

  const handleChange = (val) => {
    const tempMonth = _.find(monthList, ['month', val]).month;
    const tempYear = _.find(monthList, ['month', val]).year;
    const currentDate = new Date();
    const date = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Note: Month index starts from 0
    const year = currentDate.getFullYear();
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      // dispatch(getTotalSaleLocationBarAction(tempMonth, tempYear, setModalTypeHandler, setLoaderStatusHandler)),
      // dispatch(totalSaleByMonthAction({month:tempMonth, year:tempYear},commoncookie, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(lastTenDaysSalesAction({month})),
    );
  };

  const generateLastTwelveMonth = () => {
    let tempArr = [];
    let monthName = new Array(
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    );
    let d = new Date();
    d.setDate(1);
    for (let i = 0; i <= 11; i++) {
      let tempObj = {};
      tempObj.name = monthName[d.getMonth()] + ' ' + d.getFullYear();
      tempObj.month = d.getMonth() + 1;
      tempObj.year = d.getFullYear();
      tempArr.push(tempObj);
      d.setMonth(d.getMonth() - 1);
    }
    setMonthList(tempArr);
  };

  const months = [
    {name: 'January', value: '01'},
    {name: 'February', value: '02'},
    {name: 'March', value: '03'},
    {name: 'April', value: '04'},
    {name: 'May', value: '05'},
    {name: 'June', value: '06'},
    {name: 'July', value: '07'},
    {name: 'August', value: '08'},
    {name: 'September', value: '09'},
    {name: 'October', value: '10'},
    {name: 'November', value: '11'},
    {name: 'December', value: '12'},
  ];

  const monthFilter = (month) => {
    if (month !== state.monthVal) {
      const data = {
        month: month
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(lastTenDaysSalesAction(data)),
      );
    }
  };


const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

const salesMap = {};
(lastTenDaysSales?.lastTenDaysSales || []).forEach(item => {
  const [day, month, year] = item.date.split('/').map(Number);
  if (month === currentMonth && year === currentYear) {
    salesMap[day] = item.totalSale;
  }
});

const chartCategories = [];
const chartData = [];
const chartColors = [];

for (let day = 1; day <= daysInMonth; day++) {
  chartCategories.push(day);
  const sale = salesMap[day] || 0;
  chartData.push(sale);

  chartColors.push(day === today.getDate() ? '#4CAF50' : '#FF8C66');
}


  return (
    // <div ref={props.ref1} style={{width: '100%'}}>
    // </div>
    <Card 
    ref={(el) => {
      props.ref1(el)
      props.isVisibleRef.current = el
    }}
    variant='outlined' 
    sx={{width: '100%',height:'100%'}}>
      {/* top container */}
      {/* total sales  */}
      <Grid container 
        style={{
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          padding : '18px', 
          paddingTop : props.mode === 'edit' ? '3px' : '13px'
        }}
      >
    <Grid
      size={{
        lg: 11,
        md: 11,
        sm: 11,
        xs: 11
      }}>
      <Stack display='flex' direction='row'>
      <Stack display='flex' direction='row' gap={1} pr='10px'>
        <Typography align='left' variant='h6' style={{ fontFamily: 'Poppins,sans-serif' }}>
          {`Today's Sales -`}
        </Typography>
        <Typography className='dashboard-card-title' align='left' variant='h6'>
          {`Rs.${lastTenDaysSales?.todaySale?.total === undefined || null ? "0.00" : (lastTenDaysSales?.todaySale?.total)}`}
        </Typography>
      </Stack>

      <Stack display='flex' direction='row' gap={1}>
        <Typography align='left' variant='h6' style={{ fontFamily: 'Poppins,sans-serif' }}>
          {'Current Month Sale -'}
        </Typography>
        <Typography className='dashboard-card-title' align='left' variant='h6'>
          {`Rs.${lastTenDaysSales?.tillDateSales?.total === undefined || lastTenDaysSales?.tillDateSales?.total === null ? "0.00" : (lastTenDaysSales?.tillDateSales?.total?.toFixed(2))}` || "0.00"}
        </Typography>
      </Stack>
      </Stack>
    </Grid>

        <Grid
          sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}
          size={{
            lg: 1,
            md: 1,
            sm: 1,
            xs: 1
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
      <Grid style={{paddingLeft : '15px'}}>
        <div id='chart'>
        <ReactApexChart
          options={{
            chart: {
              toolbar: { show: false },
              type: 'bar',
              height: 280,
              stacked: true,
            },
            dataLabels: {
              enabled: true,
              style: {
                fontSize: "11px",
                colors: [ "#000000" ],
              },
            },
            plotOptions: {
              bar: {
                horizontal: false,
                distributed: true,
                columnWidth: '115%'
              },
            },
            colors: chartColors,
            stroke: {
              width: 1,
              colors: [ '#fff' ],
            },
            xaxis: {
              categories: chartCategories,
            },
            yaxis: {
              title: { text: undefined },
            },
            tooltip: {
              y: {
                formatter: (val) => 'Rs.' + val,
              },
            },
            fill: { opacity: 1 },
            legend: { show: false },
          }}
          series={[
            {
              name: 'Total Sales',
              data: chartData,
            },
          ]}
          type='bar'
          height={330}
        />
        </div>
      </Grid>
    </Card>
  );
};

export default useCommonRef(TodaySales);
