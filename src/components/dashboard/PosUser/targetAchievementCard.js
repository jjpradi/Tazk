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

const TargetAchievement = (props) => {
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date().getDate())
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const {
    posSaleReducer: { totalSaleByDate },
    posSessionReducer: { pos_userDashBoard_cashInHand }
  } = useSelector((state) => state);


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
        title='Target vs Achievement'
        icon={targetIcon}
        value={'0.00'}
        currencyIcon={true}
      />
                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} width='100%'>
                        <Grid
                        container
                        direction='row'
                        >
                        </Grid>

                    <Card style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <CardContent style={{  display: "contents", justifyContent: "center", flexDirection: "column" }}>
                            <Grid container display='flex' flexDirection='row' marginLeft='10px'>
                                <Grid size={{ lg: 2 }}>
                                <img src={targetIcon} height={60} width={40} />
                                </Grid>
                                <Grid size={{ lg: 8 }} padding='5px 0px 0px 10px'>
                                    <Typography className='dashboard-chart-content' style={{ fontSize: font14_500.fontSize, fontWeight: font14_500.fontWeight }} >
                                        <CurrencyRupeeIcon style={{ paddingTop: '10px' }} />
                                        <span >
                                        0.00
                                        </span>
                                    </Typography>
                                    <Typography className='dashboard-chart-content' color='textSecondary' style={{ paddingLeft: '10px' }}> <span >Target vs Achievement</span></Typography>
                                </Grid>
                                <Grid size={{ lg: 2 }}>
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
                        </CardContent>
                    </Card>
                    </Grid> */}

    </div>
  );
};

export default useCommonRef(TargetAchievement);
