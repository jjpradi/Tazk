import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Card, IconButton } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import { getSalesManSaleDetailsAction } from '../../redux/actions/salesMan_action';
import Cookies from 'universal-cookie';
import PeopleIcon from '@mui/icons-material/People';
import http from '../../http-common'
import CloseIcon from '@mui/icons-material/Close';
import useCommonRef from 'pages/common/home/useCommonRef';
import { dasboardPageSize, headerStyle } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { commonDateFormat } from 'utils/getTimeFormat';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

const WidgetTopSales = (props) => {
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
    const [open, setOpen] = useState(true)
    const [pollTimer, setPollTimer] = useState(null)

    // const cookies = new Cookies();
    // const empId = cookies.get('login')?.employee_id || '';
    let storage = getsessionStorage()
    const empId = storage?.employee_id || '';
    const {
        salesManReducer: { salesManSaleDetails },
    } = useSelector((state) => state);
    // useEffect(() => {
    //     setTimeout(() => {
    //         props.setmounted(true);
    //     }, 10000)
    // }, [])

    // useEffect(() => {
    //     if(props.mode === 'edit'){
    //         setOpen(false)
    //     }
    //     else{
    //         setOpen(true)
    //     }
    // },[props.mode])

    // useEffect(() => {
    //     if (props.inView && props.isEnabled && !salesManSaleDetails || salesManSaleDetails.length === 0 ) {
    //         apiCalls(
    //             setModalTypeHandler,
    //             setLoaderStatusHandler,
    //             dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler))
    //           )
    //         //   let ApiCallProfit = http
    //         //   .get(
    //         //       `dashboard/profits/${headerLocationId}`,
    //         //   )
    //         //   .then((res) => setProfit(res.data));
    //     }
    // }, [props.inView,props.isEnabled , headerLocationId]);

    // useEffect(() => {
    //     if (props.inViewport === true) {
    //       setTimeout(() => {
    //         const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
    //         if (props.inViewport === false) {
    //           clearTimeout(timer);
    //         }
    //         dispatch(setDashboardPollingTimerIdsAction(timer));
    //         setPollTimer(timer );
    //       }, props.DASHBOARD_API_POLL_TIMING);
    
    //     } else {
    //       clearTimeout(pollTimer);
    //     }
    
    //     return () => clearTimeout(pollTimer);
        
    //   }, [props.inViewport]);
    
    //   const pollData = () => {
    //     if (!salesManSaleDetails || salesManSaleDetails.length === 0) {
    //         dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler));
    //     }
    //     props.pollServer();
    // };


    // useEffect(() => {
    //     let ApiCalllocation = http
    //         .get(
    //             `cashOutIn/location_filter/location_name/${headerLocationId}`,
    //         )
    //         .then((res) => setlocations_header(res.data));
    //     let ApiCallwidgets = http
    //         .get(
    //             `dashboard/widgets/${headerLocationId}`,
    //         )
    //         .then((res) => setWidge(res.data));
    //     let ApiCallProfit = http
    //         .get(
    //             `dashboard/profits/${headerLocationId}`,
    //         )
    //         .then((res) => setProfit(res.data));
    // }, [headerLocationId])

    const GrossProfit = () => {
        let gross = profit[0]?.salesamount - profit[0]?.purchaseamount
        return gross;
    }

    return (
        <>
            {/* <p>Location Name : {headerLocationId === 'null' ? 'All Locations' : locations_header[0]?.location_name} </p> */}
            {/* <Grid container>
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Grid container direction='row'>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
                        {/* <div ref={props.ref1} style={{width: '100%', height: '100%'}}> */}
                            <Card 
                            ref={(el) => {
                                props.ref1(el)
                                props.isVisibleRef.current = el
                              }}
                              style={{height:'100%' }}>
                              {/* <Grid container>
                                    <Grid size={{ xs: 10, sm: 11, md: 11, lg: 11 }}></Grid>
                                    <Grid size={{ xs: 2, sm: 1, md: 1, lg: 1 }}> 
                                        {
                                            props.mode === 'edit' ? 
                                            <IconButton
                                                aria-label='view code'
                                                onClick={() => props.setWidgetTopSalesCardClose(true)}
                                                size='large'
                                                >
                                                <CloseIcon />
                                            </IconButton>
                                            :
                                            ''
                                        }
                                    </Grid>
                                </Grid> */}
                                <MaterialTable
                                    style={{ height: '100%',overflow:'auto'}}
                                    options={{
                                        headerStyle: {
                                            fontSize: headerStyle.fontSize,
                                        },
                                        search: false,
                                        // paging: false,
                                        exportButton: false,                                                                      
                                        // pageSize: dasboardPageSize,
                                        paging : false,
                                        filtering: false,
                                        maxBodyHeight: '420px',
                                        actionsColumnIndex: -1,
                                        rowStyle: (rowData, index) => ({
                                            backgroundColor: index % 2 === 0 ? '#f5feff' : '',
                                        }),
                                    }}
                                    actions={[
                                        {                                            
                                            icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon />,
                                            // tooltip: 'Close',
                                            isFreeAction: true,
                                            hidden : open,
                                            // onClick: (event) => alert("You want to add a new row")
                                            onClick : () => props.setCardClose()
                                        }
                                    ]}
                                    columns={[
                                        {
                                            title: 'Customer Name',
                                            field: 'first_name',
                                        },
                                        {
                                            title: 'Invoice Date',
                                            field: 'invoice_date',
                                            render: (r) => (
                                                commonDateFormat(r.invoice_date)
                                            )
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
                                    data={props?.data[0]?.topSale || []}
                                    title={<h3 style={{fontSize:headerStyle.fontSize,fontWeight:headerStyle.fontWeight, padding : '7px', paddingBottom : '20px'}}>Top 3 Sales</h3>}
                                />
                            </Card>
                            {/* </div> */}
                    {/* </Grid>
                    </Grid>
                </Grid>
            </Grid> */}
        </>
    );
};

export default useCommonRef(WidgetTopSales);

