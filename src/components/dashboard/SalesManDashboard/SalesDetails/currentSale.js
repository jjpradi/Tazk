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
import { getsessionStorage } from 'pages/common/login/cookies';
import { setDashboardPollingTimerIdsAction } from 'redux/actions/dashboard_role_actions';
import { font14_500 } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

const CurrentSale = (props) => {
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
//     const {
//         salesManReducer: { salesManSaleDetails },
//     } = useSelector((state) => state);
// //    console.log(salesManSaleDetails,salesManSaleDetails?.length,'salesManSaleDetails');
   
//     useEffect(() => {
//         // if(props.mode === 'view'){
//             if (props.inView && props.isEnabled && !salesManSaleDetails || salesManSaleDetails.length === 0) {
//                 // if(!Object.keys(salesManSaleDetails).length){
//                     dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler));
//                 // }
//             }
//         // }
//         // else{
//         //     if(!Object.keys(salesManSaleDetails).length){
//         //         dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler));
//         //     }
//         // }

//       }, [props.inView , props.isEnabled]);

//       useEffect(() => {
//         if (props.inViewport === true) {
//           setTimeout(() => {
//             const timer = setInterval(() => pollData(), props.DASHBOARD_API_POLL_TIMING);
//             if (props.inViewport === false) {
//               clearTimeout(timer);
//             }
//             dispatch(setDashboardPollingTimerIdsAction(timer));
//             setPollTimer(timer );
//           }, props.DASHBOARD_API_POLL_TIMING);
    
//         } else {
//           clearTimeout(pollTimer);
//         }
    
//         return () => clearTimeout(pollTimer);
        
//       }, [props.inViewport]);
    
//       const pollData = () => {
//         if (!salesManSaleDetails || salesManSaleDetails.length === 0) {
//             dispatch(getSalesManSaleDetailsAction(empId, headerLocationId, { month, year }, setModalTypeHandler, setLoaderStatusHandler));
//         }
//         props.pollServer();
//     };


    return (
        <div 
            ref={(el) => {
                props.ref1(el)
                props.isVisibleRef.current = el
                }}
            style={{width: '100%'}}
        >
            <DashboardTile
                {...props}
                title='Current Sale'
                icon={currentsaleIcon}
                value={props?.data[0]?.totalSale.toFixed(2).toLocaleString() || '0.00'}
                currencyIcon={true}
            />
        </div>
    );
};

export default useCommonRef(CurrentSale);

