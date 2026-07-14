import React, {useState, useEffect, useContext} from 'react';
import {Grid, CardContent, Typography, Card} from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import { getSalesManSaleDetailsAction } from '../../redux/actions/salesMan_action';
import Cookies from 'universal-cookie';
import PeopleIcon from '@mui/icons-material/People';
import http from '../../http-common'
import saleIcon from '../../assets/dashboardIcons/commission_sale.svg';
import growthIcon from '../../assets/dashboardIcons/growth.svg';
import rupeeIcon from '../../assets/dashboardIcons/rupe(2).svg';
import growthIcon1 from '../../assets/dashboardIcons/growth_icon.svg';
import apiCalls from 'utils/apiCalls';
import TotalReceivables from 'components/dashboard/payable_receivable/totalReceivables';
import TodaySales from 'components/dashboard/SalesDashboard/todaySales&salesTillDate';
import { useInView } from 'react-intersection-observer';
import AvailStock from 'pages/sales/inventoryMD/AvailStock';
import { getsessionStorage } from 'pages/common/login/cookies';
import { font14_500, headerStyle } from 'utils/pageSize';
import { widgetsDetailsAction } from 'redux/actions/dashboard_role_actions';

const WidgetsDetails = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const [locations_header, setlocations_header] = useState([])
  const [widge, setWidge] = useState([])
  const [profit, setProfit] = useState([])
  // const cookies = new Cookies();
  let storage = getsessionStorage()
  const empId = storage?.employee_id || '';
  const {
    salesManReducer: {salesManSaleDetails},
  } = useSelector((state) => state);

  const { TotAccReducer: { payable_receivable, aging_receivable, aging_payable }} = useSelector(state => state);
  const {DashboardRoleReducer:{widgetsdetails}} = useSelector(state => state)
  const {ref, inView, entry} = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    if(props.inView){
      if (!salesManSaleDetails || salesManSaleDetails.length === 0) {
        dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler));
      }
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(widgetsDetailsAction(setModalTypeHandler, setLoaderStatusHandler))
      );
      let ApiCallProfit = http
      .get(
        `dashboard/profits/${headerLocationId}`,
      )
      .then((res) => setProfit( res.data ));
    }
  }, [props.inView, headerLocationId]);
  // useEffect(()=>{
  //   let ApiCalllocation = http
  //     .get(
  //       `cashOutIn/location_filter/location_name/${headerLocationId}`,
  //     )
  //     .then((res) => setlocations_header( res.data ));
  //     let ApiCallwidgets = http
  //     .get(
  //       `dashboard/widgets/${headerLocationId}`,
  //     )
  //     .then((res) => setWidge( res.data ));
  //     let ApiCallProfit = http
  //     .get(
  //       `dashboard/profits/${headerLocationId}`,
  //     )
  //     .then((res) => setProfit( res.data ));
  // },[headerLocationId])

const GrossProfit = () =>{
  let gross = profit[0]?.salesamount - profit[0]?.purchaseamount
  return gross;
}

const profitCal =  profit[0]?.salesamount - profit[0]?.purchaseamount

//const netProfit = profitCal - profit[0]?.indirectexpenses 

// const Roi = netProfit / widge[0]?.cost_price * 100
console.log('widgetdetails', widgetsdetails)

  const Grossprofit = widgetsdetails[0]?.purchase_total - widgetsdetails[0]?.sales_total;
  const Income = widgetsdetails[0]?.indirect_Income + widgetsdetails[0]?.sales_total;
  const Expenses = widgetsdetails[0]?.purchase_total + widgetsdetails[0]?.indirect_Expence;
  const Netprofit = Income - Expenses;
  const ROI = (Netprofit / widgetsdetails[0]?.purchase_total === null ? 0 : widgetsdetails[0]?.purchase_total) * 100

  return (
    <>
      {/* <p><span style={{fontWeight:600}}>Location Name</span> : {headerLocationId === 'null'?'All Locations' : locations_header[0]?.location_name}</p> */}
      <Grid
      container
      direction='row'
      spacing={3}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Card >
            <CardContent>
            <Grid container display='flex' flexDirection='row' >
            <Grid size={{
              lg: 2
            }}>
              <img src={saleIcon} height={60} width={50} />
            </Grid>
            <Grid paddingLeft={5}>            
              <Typography  >
                <CurrencyRupeeIcon style={{paddingTop: '10px'}} />
                <span style={{paddingLeft: '3px' ,fontSize:headerStyle.fontSize}}>{ widgetsdetails[0]?.sales_total === null ? 0 : widgetsdetails[0]?.sales_total }</span>
              </Typography>
              <Typography
               variant='h9'
                color='textSecondary'
                gutterBottom
              >
                {/* <AddchartIcon style={{paddingTop: '5px'}} color='primary' />{' '} */}
                <span style={{paddingLeft: '10px',fontSize:headerStyle.fontSize}}>Sale</span>
              </Typography>
              </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Card >
            <CardContent>
              <Grid container display='flex' flexDirection='row' >
                <Grid size={{
                  lg: 2
                }}>
                <img src={growthIcon} height={60} width={50} />
                </Grid>
                <Grid paddingLeft={5}>
                <Typography variant='h3' component='h2'>
                <CurrencyRupeeIcon style={{paddingTop: '10px'}} />
                    <span style={{ paddingLeft: '3px' ,fontSize:font14_500.fontSize }}>{Grossprofit === null ? 0 : Grossprofit}</span>
              </Typography>
              <Typography
                variant='h9'
                color='textSecondary'
                gutterBottom
              >
                {/* <ImportExportIcon style={{paddingTop: '5px'}} color='primary' /> */}
                <span style={{paddingLeft: '10px' ,fontSize:headerStyle.fontSize}}>Gross Profit</span>
              </Typography>
                </Grid>
              </Grid>
            
             
              {/* <Typography style={{marginBottom: 12}} color='textSecondary'>
                    <span style={{color: 'red'}}>
                      <ArrowDownwardIcon style={{paddingTop: '8px'}} />
                      214.74%
                    </span>{' '}
                    from last month
                  </Typography> */}
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Card >
            <CardContent>
              <Grid container display='flex' flexDirection='row'>
              <Grid size={{
                lg: 2
              }}>
              <img src={rupeeIcon} height={60} width={50} />
              </Grid>
              <Grid paddingLeft={5}>
              <Typography variant='h3' component='h2'>
                <CurrencyRupeeIcon style={{paddingTop: '10px'}} />
                <span style={{paddingLeft: '3px', fontSize:font14_500.fontSize}}>{ROI === null ? 0 : ROI.toFixed(2)}</span>
              </Typography>
              <Typography
               variant='h9'
                color='textSecondary'
                gutterBottom
              >
                <span style={{paddingLeft: '10px', fontSize:headerStyle.fontSize}}>ROI</span>
              </Typography>
              </Grid>
              </Grid>
              
            
              {/* <Typography style={{marginBottom: 12}} color='textSecondary'>
                    <span style={{color: 'red'}}>
                      <ArrowDownwardIcon style={{paddingTop: '8px'}} />
                      214.74%
                    </span>{' '}
                    from last month
                  </Typography> */}
            </CardContent>
          </Card>
        </Grid>
        <Grid
          size={{
            lg: 3,
            md: 3,
            sm: 6,
            xs: 12
          }}>
          <Card >
            <CardContent>
              <Grid container display='flex' flexDirection='row'>
                <Grid size={{
                  lg: 2
                }}>
                <img src={growthIcon1} height={60} width={40} />
                </Grid>
                <Grid paddingLeft={5}>
                <Typography variant='h3' component='h2'>
                <CurrencyRupeeIcon style={{paddingTop: '10px'}} />
                <span style={{paddingLeft: '3px',fontSize:font14_500.fontSize}}>{Netprofit === null ? 0 : Netprofit}</span>
              </Typography>
              <Typography
               variant='h9'
                color='textSecondary'
                gutterBottom
              >
                {/* <ImportExportIcon style={{paddingTop: '5px'}} color='primary' /> */}
                <span style={{paddingLeft: '10px' , fontSize:headerStyle.fontSize}}>Net Profit</span>
              </Typography>
                </Grid>
              </Grid>
             
              
              {/* <Typography style={{marginBottom: 12}} color='textSecondary'>
                    <span style={{color: 'red'}}>
                      <ArrowDownwardIcon style={{paddingTop: '8px'}} />
                      220.74%
                    </span>{' '}
                    from last month
                  </Typography> */}
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}
              item
            >
<TotalReceivables data={payable_receivable}/>
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <AvailStock />
            </Grid> */}
            {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}  item>
        <TodaySales inView={inView}/>
      </Grid> */}
   
              {/* <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
        <MaterialTable
          style={{ padding: '0px 20px 20px 20px', minHeight:'400px',}}
          options={{
            headerStyle: {
              fontSize: 15,
            },
            search: false,
            paging: false,
            exportButton: false,
            // maxBodyHeight: '30vh',
            filtering: false,
            actionsColumnIndex: -1,
            rowStyle: (rowData, index) => ({
              backgroundColor: index % 2 === 0 ? '#f5feff' : '',
            }),
          }}

          // aa
          columns={[
            {
              title: 'Customer Name',
              field: 'customer_name',
            },
            {
              title: 'Invoice Date',
              field: 'invoice_date',
              type: 'date',
            },
            {
              title: 'Invoice Amount',
              field: 'invoice_amt',
            },
            {
              title: 'Days',
              field: 'days',
            },
          ]}
          data={salesManSaleDetails.topSale}
          title={<Typography fontSize='1.5rem' variant='h6'>Top 3 Sales</Typography>}
        />
      </Grid> */}
    </Grid>
    </>
  );
};

export default WidgetsDetails;

