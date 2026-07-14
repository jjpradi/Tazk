import React, { useContext, useEffect } from 'react';
import CardTemplate from './cardTemplate';
import {Grid} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import useStyles from './cardStyles';
import { getsessionStorage } from 'pages/common/login/cookies';
import { useDispatch, useSelector } from 'react-redux';
import { topEmpByAttendanceAction } from 'redux/actions/payrollDashboard_actions';
import apiCalls from 'utils/apiCalls';
import { getCurrentShiftAction, getLogDetailsAction } from 'redux/actions/shifts.actions';
import { getCheckInOutAction } from 'redux/actions/attendance_actions';

export default function PayrollCards(props) {
    const { company_type,personId, employee_id } = props;
    const {
        PayrolldashboardReducers : {averageWorkHour,topEmpByAttendance},
        LoanReducer : {employeeLoansDueAmount}, ShiftsReducer: {currentShift, currentLogDetail}, attendanceReducer: {checkInOut}
      } = useSelector((state) => state);
 const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,} = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  console.log("hjgyu",employee_id)
  useEffect(() => {
    let data = {
      employee_id: employee_id
    }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(topEmpByAttendanceAction("contact")),
      // dispatch(getCurrentShiftAction(employee_id)),
      dispatch(getLogDetailsAction(data)),
      dispatch(getCheckInOutAction(employee_id))
    )
  }, [personId]);
  const storage = getsessionStorage()
  console.log(topEmpByAttendance?.company_rank,"TOP EMP ATTENDANCE",personId)
    let c = useStyles();

    const index = topEmpByAttendance?.company_rank?.filter(item => item?.person_id == personId);
    let value = index?.length > 0 ? index[0]?.company_rank : 0;
    
    console.log(value,"VALUE OF THE USER")
    
  return (
    <>
      <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          lg: 4,
          md: 4,
          sm: 4
        }}>
        <Box>
          <Card
            className={c.green}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography className = 'cardheadertitle' component='div' align='center'>
           Total Loan / Due
            </Typography>

            <Typography className='cardheadervalue' align='center'>
            {employeeLoansDueAmount?.TotalLoanAmount || 0} / {employeeLoansDueAmount?.LoanDueAmount || 0}
            </Typography>
          </Card>
        </Box>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 4,
          md: 4,
          sm: 4
        }}>
        <Box>
          <Card
            className={c.yellow}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography className = 'cardheadertitle' component='div' align='center'>
            Average Work Hours
            </Typography>

            <Typography className='cardheadervalue' align='center'>
              {averageWorkHour?.averageWorkHours || 0} Hours
            </Typography>
          </Card>
        </Box>
      </Grid>

      <Grid
        size={{
          xs: 12,
          lg: 4,
          md: 4,
          sm: 4
        }}>
        <Box>
          <Card
            className={c.red}
            variant='outlined'
            sx={{padding: '10px', width: '100%', borderRadius: 2}}
          >
            <Typography className = 'cardheadertitle' component='div' align='center'>
            Rank by Attendance
            </Typography>

            <Typography className='cardheadervalue' align='center'>
            {value}
            </Typography>
          </Card>
        </Box>
      </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 4,
            md: 4,
            sm: 4
          }}>
          <Box>
            <Card
              className={c.lav}
              variant='outlined'
              sx={{ padding: '10px', width: '100%', borderRadius: 2 }}
            >
              <Typography className='cardheadertitle' component='div' align='center'>
                Current Shift
              </Typography>

              <Typography className='cardheadervalue' align='center'>
                {currentLogDetail[0]?.shift_name || "Not Assigned"}
              </Typography>
            </Card>
          </Box>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 4,
            md: 4,
            sm: 4
          }}>
          <Box>
            <Card
              className={c.lightPink}
              variant='outlined'
              sx={{ padding: '10px', width: '100%', borderRadius: 2 }}
            >
              <Typography className='cardheadertitle' component='div' align='center'>
                Current shift status
              </Typography>

              <Typography className='cardheadervalue' align='center'>
                {currentLogDetail[0]?.startDate
                  ? (() => {
                    const d = new Date(currentLogDetail[0].startDate);

                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();

                    let hours = d.getHours();
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    const ampm = hours >= 12 ? 'pm' : 'am';

                    hours = hours % 12 || 12; 

                    return `${day}-${month}-${year} ${hours}.${minutes}${ampm}`;
                  })()
                  : "Not clockedIn"}
              </Typography>
            </Card>
          </Box>
        </Grid>
    </Grid>
    </>
  );
 }

