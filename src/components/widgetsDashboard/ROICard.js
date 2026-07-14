import React, { useState, useEffect, useContext } from 'react';
import { Grid, CardContent, Typography, Card, IconButton } from '@mui/material';
import AddchartIcon from '@mui/icons-material/Addchart';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PercentIcon from '@mui/icons-material/Percent';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import MaterialTable from 'utils/SafeMaterialTable';
import { getSalesManSaleDetailsAction } from '../../redux/actions/salesMan_action';
import Cookies from 'universal-cookie';
import PeopleIcon from '@mui/icons-material/People';
import http from '../../http-common'
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import rupeeIcon from '../../assets/dashboardIcons/rupe(2).svg';
import percentImg from '../../assets/dashboardIcons/percentimg1.jpg';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { font14_500 } from 'utils/pageSize';
import Cards from 'components/dynamicCards';
import DashboardTile from 'components/DashboardTile';

const RoiCard = (props) => {
    // const {
    //     setModalTypeHandler,
    //     setLoaderStatusHandler,
    //     headerLocationId,
    // } = useContext(CreateNewButtonContext);
    // const dispatch = useDispatch();
    // const [date, setDate] = useState(new Date().getDate());
    // const [month, setMonth] = useState(new Date().getMonth() + 1);
    // const [year, setYear] = useState(new Date().getFullYear());
    // const [monthList, setMonthList] = useState([]);
    // const [locations_header, setlocations_header] = useState([])
    // const [widge, setWidge] = useState([])
    // const [profit, setProfit] = useState([])
    // const [pollTimer, setPollTimer] = useState(null)

    // const cookies = new Cookies();
    // const empId = cookies.get('login')?.employee_id || '';
    // let storage = getsessionStorage()
    // const empId = storage?.employee_id || '';
    // const {
    //     salesManReducer: { salesManSaleDetails },
    // } = useSelector((state) => state);

    // useEffect(() => {
    //     if (props.inView && props.isEnabled) {
    //         // apiCalls(
    //         //     setModalTypeHandler,
    //         //     setLoaderStatusHandler,
    //         //     dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler)),
    //         //   )
    //         let ApiCallwidgets = http
    //             .get(
    //                 `dashboard/widgets/roi/${headerLocationId}`,
    //             )
    //             .then((res) => setWidge(res.data));
    //         // let ApiCallProfit = http
    //         // .get(
    //         //     `dashboard/profits/${headerLocationId}`,
    //         // )
    //         // .then((res) => setProfit(res.data));
    //     }
    // }, [props.inView, props.isEnabled , headerLocationId]);

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
    //     let ApiCallwidgets = http
    //             .get(
    //                 `dashboard/widgets/roi/${headerLocationId}`,
    //             )
    //             .then((res) => setWidge(res.data));
    //   }

    // // useEffect(() => {
    // //     let ApiCalllocation = http
    // //         .get(
    // //             `cashOutIn/location_filter/location_name/${headerLocationId}`,
    // //         )
    // //         .then((res) => setlocations_header(res.data));
    // //     let ApiCallwidgets = http
    // //         .get(
    // //             `dashboard/widgets/${headerLocationId}`,
    // //         )
    // //         .then((res) => setWidge(res.data));
    // //     let ApiCallProfit = http
    // //         .get(
    // //             `dashboard/profits/${headerLocationId}`,
    // //         )
    // //         .then((res) => setProfit(res.data));
    // // }, [headerLocationId])

    // const GrossProfit = () => {
    //     let gross = profit[0]?.salesamount - profit[0]?.purchaseamount
    //     return gross;
    // }

    // const finalData = isNaN(widge[0]?.roi) || widge[0]?.roi === null ? 0 : widge[0]?.roi

    return (
        <div
            ref={(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
            }}
            style={{ width: '100%' }}
        >
            <DashboardTile
                {...props}
                title='ROI'
                icon={percentImg}
                value={`${props?.data[0]?.roi || 0} %`}
                currencyIcon={false}
            />
        </div>
    );
};

export default useCommonRef(RoiCard);
