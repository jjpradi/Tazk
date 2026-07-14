import React, { useState, useEffect, useContext, useRef } from 'react';
import { Grid, CardContent, Typography, Card } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CreateNewButtonContext from '../../../../context/CreateNewButtonContext';
import { getOutstandingReportAction } from 'redux/actions/salesMan_action';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import Cards from '../../../dynamicCards/index';
import totaloutstandingIcon from '../../../../assets/dashboardIcons/Union.svg';
import overdueIcon from '../../../../assets/dashboardIcons/overdues.svg';
import overdueIcon1 from '../../../../assets/dashboardIcons/overdue.svg';
import calenderIcon from '../../../../assets/dashboardIcons/calendarcopy.svg';
import statusIcon from '../../../../assets/dashboardIcons/payment-check.svg';
import apiCalls from 'utils/apiCalls';
import { headerStyle } from 'utils/pageSize';
import DashboardTile from 'components/DashboardTile';
import { getsessionStorage } from 'pages/common/login/cookies';

export default function OutstandingCard(props) {
  console.log('propsss',props)
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const storage = getsessionStorage()
  const [date, setDate] = useState(new Date().getDate());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthList, setMonthList] = useState([]);
  const {
    salesManReducer: { outstandingReport },
  } = useSelector((state) => state);
  const tempinitsform = useRef(null);
  const [status, setStatus] = useState('');
  const salesmanId = props.salesmanId ? props.salesmanId : storage?.employee_id
  
  useEffect(() => {
    dispatch(
      getOutstandingReportAction(
        salesmanId,
        headerLocationId,
        commoncookie,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
  }, []);

  const initsform = () => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie,
      headerLocationId,
      // dispatch(
      //   getOutstandingReportAction(
      //     commoncookie,
      //     headerLocationId,
      //     setModalTypeHandler,
      //     setLoaderStatusHandler,
      //   ),
      // )
    );
  };
console.log(props.salesmanId,"outstandingReport")
  tempinitsform.current = initsform;

  useEffect(() => {
    var totalAmount = outstandingReport.totalAmount;
    var receivedAmount = outstandingReport.receivedAmount;

    var collection = (receivedAmount / totalAmount) * 100;

    if (collection > '100') {
      setStatus('Excellent');
    } else if (collection >= '100') {
      setStatus('Good');
    } else if (collection >= '80') {
      setStatus('Attention Required');
    } else if (collection < '80') {
      setStatus('Alarming');
    }

    if(props.inView){
      tempinitsform.current();
    }
  }, [outstandingReport.totalAmount, outstandingReport.receivedAmount, props.inView]);

  const tobe_collected_overdue =
    outstandingReport.totalOverdue - outstandingReport.tobe_collected_today;
console.log(props.inView,"props.inView")
  return (
    <>
      {/* <Grid container> */}
        <Grid
          container
          direction='row'
          display='flex' 
          flexDirection='row'
          spacing={3}
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Grid
            size={{
              lg: 2.4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <DashboardTile
              icon={totaloutstandingIcon}
              value={
                outstandingReport.totalOutstanding === null || outstandingReport.totalOutstanding === undefined
                  ? '0'
                  : outstandingReport.totalOutstanding
              }
              title="Total Outstanding"
              fontSize={headerStyle.fontSize}
            />
          </Grid>

          <Grid
            size={{
              lg: 2.4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <DashboardTile
              icon={overdueIcon}
              value={outstandingReport.totalOverdue === null || outstandingReport.totalOverdue === undefined
                ? '0'
                : outstandingReport.totalOverdue}
              title="Total Overdue"
              fontSize={headerStyle.fontSize}
            />
          </Grid>

          <Grid
            size={{
              lg: 2.4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <DashboardTile
              icon={calenderIcon}
              value={outstandingReport.tobe_collected_today === null || outstandingReport.tobe_collected_today === undefined
                ? '0'
                : outstandingReport.tobe_collected_today}
              title="To be Collected Today"
              fontSize={headerStyle.fontSize}
            />
          </Grid>


          <Grid
            size={{
              lg: 2.4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            <DashboardTile
              icon={overdueIcon1}
              value={tobe_collected_overdue || 0}
              title="Overdue To be Collected"
              fontSize={headerStyle.fontSize}
            />
          </Grid>


          <Grid
            size={{
              lg: 2.4,
              md: 4,
              sm: 6,
              xs: 12
            }}>
            {/* <Card style={{minHeight:'100px', maxHeight:'100px', display:'flex', alignItems:'center', padding:'10px 0px 0px 10px', marginLeft:'10px',marginTop:'10px'}}>
            <Typography
              style={{fontSize:headerStyle.fontSize}} 
              gutterBottom
            >
            <Grid container paddingLeft={3}>
            <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}>
              <Grid>
                <img src={statusIcon} height={60} width={40} />
              </Grid>
            </Grid>
              <Grid size={{ xs: 10, sm: 10, md: 10, lg: 10 }}>
              <Grid style={{ paddingLeft: '22px', paddingTop: '10px' }}>
                <Typography
                  variant='h9'
                  component='h2'
                  color={
                    (status === 'Alarming' && 'red') ||
                    (status === 'Attention Required' && 'orangered') ||
                    (status === 'Good' && 'grey') ||
                    (status === 'Excellent' && 'green')
                  }
                >
                  {status === '' ? "-" : status}
                </Typography>
                <Typography
                  style={{fontSize:headerStyle.fontSize}} 
                  color='textSecondary'
                  gutterBottom
                >
                  Collection status
                </Typography>
              </Grid>
              </Grid>
            </Grid>
            </Typography>
            </Card> */}
            <DashboardTile
              icon={statusIcon}
              value={status}
              title="Collection status"
              fontSize={headerStyle.fontSize}
            />
          </Grid>
        </Grid>
      {/* </Grid> */}
    </>
  );
}
