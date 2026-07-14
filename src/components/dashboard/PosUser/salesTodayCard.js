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
import { getTotalSaleLocationBarAction, totalSaleByDateAction } from 'redux/actions/pos_sale_actions';
import { getPosUserDashBoardCashInHandAction } from 'redux/actions/pos_session';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import Cards from '../../dynamicCards/index';
import salesIcon from '../../../assets/dashboardIcons/commission_sale.svg';
import cahinhandIcon from '../../../assets/dashboardIcons/money.svg';
import targetIcon from '../../../assets/dashboardIcons/target.svg';
import useCommonRef from 'pages/common/home/useCommonRef';
import CloseIcon from '@mui/icons-material/Close';
import { font14_500 } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';

const SalesToday = (props) => {
  // const {
  //   setModalTypeHandler,
  //   setLoaderStatusHandler,
  //   commoncookie
  // } = useContext(CreateNewButtonContext);
  // const dispatch = useDispatch();
  // const [date, setDate] = useState(new Date().getDate())
  // const [month, setMonth] = useState(new Date().getMonth() + 1);
  // const [year, setYear] = useState(new Date().getFullYear());
  // const [monthList, setMonthList] = useState([]);
  // const {
  //   posSaleReducer: { totalSaleByDate },
  //   posSessionReducer: { pos_userDashBoard_cashInHand }
  // } = useSelector((state) => state);

  // useEffect(() => {
  //   if(props.inView && props.isEnabled){
  //     if(typeof commoncookie !== 'undefined'){
  //       dispatch(totalSaleByDateAction({date, month, year}, setModalTypeHandler, setLoaderStatusHandler));
  //       let todayDate = new Date();
  //       let firstDay = todayDate.getMonth() <= 2 ? new Date(todayDate.getFullYear()-1, 3, 1) : new Date(todayDate.getFullYear(), 3, 1);
  //       let lastDay = todayDate.getMonth()  <= 2 ? new Date(todayDate.getFullYear(), 3, 0) : new Date(todayDate.getFullYear()+1, 3, 0);
   
  //       let data = {
  //        fromDate : moment(firstDay).format('YYYY-MM-DD'),
  //        toDate: moment(lastDay).format('YYYY-MM-DD'),
  //        employeeId : commoncookie
  //       }
  //       // {pos_userDashBoard_cashInHand.length === 0 &&
  //       // dispatch(getPosUserDashBoardCashInHandAction(data, setModalTypeHandler, setLoaderStatusHandler))};
  //     }

  //   }
  // }, [commoncookie, props.inView , props.isEnabled]);

  return (
    <div
      ref={(el) => {
        props.ref1(el);
        props.isVisibleRef.current = el
      }}
      style={{ width: '100%' }}
    >
      <DashboardTile
        {...props}
        title='Sales Today'
        icon={salesIcon}
        value={props?.data[0]?.total.toFixed(2).toLocaleString() || '0.00'}
        currencyIcon={true}
      />
    </div>
  );
};

export default useCommonRef(SalesToday);
