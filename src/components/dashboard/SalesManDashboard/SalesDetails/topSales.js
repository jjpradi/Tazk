import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Card, useMediaQuery, IconButton } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import { getSalesManSaleDetailsAction } from '../../../../redux/actions/salesMan_action';
import Cookies from 'universal-cookie';
import PeopleIcon from '@mui/icons-material/People';
import Cards from '../../../dynamicCards/index';
import currentsaleIcon from '../../../../assets/dashboardIcons/rupee.svg';
import targetsaleIcon from '../../../../assets/dashboardIcons/deadline.svg';
import customerIcon from '../../../../assets/dashboardIcons/icon_visits.png';
import custIcon from '../../../../assets/dashboardIcons/customer.svg'
import Smallcards from 'components/dynamicCards/smallcards';
import { color } from '@mui/system';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { cellStyle, dasboardPageSize, headerStyle } from 'utils/pageSize';
import { getsessionStorage } from 'pages/common/login/cookies';
import { commonDateFormat } from 'utils/getTimeFormat';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';

const TopSales = (props) => {
    const matches = useMediaQuery((theme) => theme.breakpoints.up('2560'))
    const {
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId
    } = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
    const [date, setDate] = useState(new Date().getDate());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [monthList, setMonthList] = useState([]);
    const [pollTimer, setPollTimer] = useState(null)

    // const cookies = new Cookies();
    // const empId = cookies.get('login')?.employee_id || '';
    let storage = getsessionStorage()
    const empId = storage?.employee_id || '';
    const [open, setOpen] = useState(true)
    const {
        salesManReducer: { salesManSaleDetails },
    } = useSelector((state) => state);

    useEffect(() => {
        if(props.mode === 'edit'){
            setOpen(false)
        }
        else{
            setOpen(true)
        }
    },[props.mode])

    //   useEffect(() => {
    //     // if(props.mode !== 'view'){
    //         if (props.inView && props.isEnabled && !salesManSaleDetails || salesManSaleDetails.length === 0) {
    //             // const timer = setTimeout(() => {
    //                 // if(_.isEmpty(salesManSaleDetails)){
    //                 // if(!Object.keys(salesManSaleDetails).length){ 
    //                     dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler));
    //                 // }
    //             // }, 5000);
    //             // return () => clearTimeout(timer);
    //         } 
    //     // }       

    //   }, [props.inView , props.isEnabled]);

    //   useEffect(() => {
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


    return (
        <Card 
        ref={(el) => {
            props.ref1(el)
            props.isVisibleRef.current = el
            }}
            
            sx={{height:'390px'}}
        >
            {/* <div ref={props.ref1} style={{width: '100%'}}> */}
            <Grid container>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    {/* <Grid container direction='row'>
                        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}> */}
                            {/* <Grid container bgcolor='white'>
                                <Grid size={{ xs: 10, sm: 11, md: 11, lg: 11.5 }}></Grid>
                                <Grid size={{ xs: 2, sm: 1, md: 1, lg: 0.5 }}> 
                                    {
                                        props.mode === 'edit' ?
                                        <IconButton
                                            aria-label='view code'
                                            onClick={() => props.setTopSalesCardClose(true)}
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
                                style={{ height: '390px',overflow:'auto', padding: '0px 15px' }}
                                options={{
                                    headerStyle: {
                                        fontSize: headerStyle.fontSize,
                                    },
                                    cellStyle: {
                                        fontSize: cellStyle.fontSize,

                                    },
                                    search: false,
                                    paging: false,
                                    exportButton: false,
                                    filtering: false,                                    
                                    // pageSize: dasboardPageSize,
                                    // maxBodyHeight: '400px',
                                    actionsColumnIndex: -1,
                                    rowStyle: (rowData, index) => ({
                                        backgroundColor: index % 2 === 0 ? '#f5feff' : '',
                                    }),
                                }}
                                actions={[
                                    {                                            
                                        icon: () => props.isEnabled ?  <props.VisibilityOffIcon /> : <props.VisibilityIcon /> ,
                                        // tooltip: 'Close',
                                        isFreeAction: true,
                                        hidden : open,
                                        // onClick: (event) => alert("You want to add a new row")
                                        onClick : () => props.setCardClose(),
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
                                        render: (rowData) => (rowData.invoice_amt.toFixed(2)),
                                    },
                                    {
                                        title: 'Days',
                                        field: 'days',
                                    },
                                ]}
                                data={props?.data[0]?.topSale || []}
                                title='Top 5 Sales'
                            />
                        {/* </Grid>
                    </Grid> */}
                </Grid>
            </Grid>
            {/* </div> */}
        </Card>
    );
};

export default useCommonRef(TopSales);

