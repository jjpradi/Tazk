import React, { useEffect, useRef, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
  Box, IconButton, Card,
  Grid
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import useCommonRef from 'pages/common/home/useCommonRef';
import { styled } from '@mui/system';
import { getTaskWorkLogAction } from 'redux/actions/payrollDashboard_actions';

const workLogCard = (props) => {
  const optionsRef = useRef(null);
  const dispatch = useDispatch();
  const [workLogs, setWorkLogs] = useState([]);
  const [headerDates, setHeaderDates] = useState([]);

  // useEffect(() => {
  //   const fetchWorkLogs = async () => {
  //     dispatch(getTaskWorkLogAction((result) => {
  //       setWorkLogs(result);
  //     }));
  //   };

  //   fetchWorkLogs();
  //   generateLast7Days();
  // }, [dispatch]);

  const taskWorkLog = useSelector((state) => state.PayrolldashboardReducers.taskWorkLog);

  useEffect(() => {
    if (props?.data[0]?.data) {
      setWorkLogs(props?.data[0]?.data || []);
    generateLast7Days();
    }
  }, [props?.data[0]?.data]);

  const generateLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(formatLogDate(date));
    }
    setHeaderDates(dates);
  };

  const formatLogDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const YellowCell = styled(TableCell)({
    backgroundColor: '#FFF9C4',
    fontWeight: 'bold',
  });

  const HeaderCell = styled(TableCell)({
    backgroundColor: '#BBDEFB',
    fontWeight: 'bold',
  });

  return (
    <Card
      ref={(el) => {
        props.ref1(el)
        props.isVisibleRef.current = el
      }}
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Grid 
        container
        display = 'flex'
        justifyContent = 'space-between'
        alignItems = 'center'
        style = {{
          padding : '18px',
          paddingTop : props.mode === 'edit' ? '3px' : '13px'
        }}
      >
        <Grid>
          <Typography className='dashboard-card-title' variant='h6'>
            Work Log
          </Typography>

        </Grid>

        <Grid>
          {
            props.mode === 'edit' ?
              <IconButton
                aria-label='view code'
                onClick={() => props.setCardClose()}
                size='large'
              >
                {props.isEnabled ? <props.VisibilityOffIcon /> : <props.VisibilityIcon />}
              </IconButton>
              :
              ''
          }
        </Grid>
      </Grid>
      <TableContainer component={Paper} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '200px' }}> Employee Name </TableCell>
              <YellowCell>Total Work Log</YellowCell>
              <HeaderCell colSpan={headerDates.length}>
                <Typography align="center">{new Date().toLocaleString('default', { month: 'long' })}, {new Date().getFullYear()}</Typography>
              </HeaderCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <YellowCell></YellowCell>
              {headerDates.map((date, index) => (
                <TableCell key={index} align="center">{new Date(date).toLocaleDateString('default', { day: 'numeric', weekday: 'short' })}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(props?.data[0]?.data || []).map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {row.full_name}
                  </Box>
                </TableCell>
                <YellowCell>{row.total_log_hours ? row.total_log_hours + 'h' : ''}</YellowCell>
                {headerDates.map((date, i) => {
                  const log = row.logs && row.logs.find(log => formatLogDate(new Date(log.log_date)) === date);
                  const logDate = log ? log.date_wise_log + 'h' : '';
                  return <TableCell key={i} align="center">{logDate}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default useCommonRef(workLogCard);
