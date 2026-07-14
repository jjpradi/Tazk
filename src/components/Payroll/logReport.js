import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useCommonRef from 'pages/common/home/useCommonRef';
import { getTaskLogReportAction } from 'redux/actions/payrollDashboard_actions';
import { Box, Card, Collapse, Table, TableCell, TableHead, TableRow, Typography, TableBody, IconButton, TableContainer, Paper, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const LogReportCard = (props) => {
  const optionsRef = useRef(null);
  const dispatch = useDispatch();
  const [expandedRow, setExpandedRow] = useState(null);

  // useEffect(() => {
  //   dispatch(getTaskLogReportAction(() => { }));
  // }, [dispatch]);

  const {
    PayrolldashboardReducers: { taskLogReport },
  } = useSelector((state) => state);

  const handleRowClick = (emp_id) => {
    setExpandedRow((prev) => (prev === emp_id ? null : emp_id));
  };

  const transformedData = (props?.data[0]?.data ?? []).map((emp) => ({
    emp_id: emp.emp_id,
    full_name: emp.full_name,
    logs: emp.logs || [],
    firstLog: emp.logs && emp.logs.length > 0 ? emp.logs[0] : [],
  })) || [];

  return (
    <div>
      <Card
        ref={(el) => {
          props.ref1(el);
          props.isVisibleRef.current = el;
        }}
        sx={{ width: '100%', height: '390px', display: 'flex', flexDirection: 'column' }}>
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
                Log Report
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
          <TableContainer component={Paper} style={{ overflow: 'auto', flexGrow: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sortDirection={false}>Employee</TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Estimation Hours</TableCell>
                  <TableCell>Logged Hours</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Total Points</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {transformedData.map((row) => (
                  <React.Fragment key={row.emp_id}>
                    <TableRow
                      hover
                      onClick={() => handleRowClick(row.emp_id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: expandedRow === row.emp_id ? '#f5f5f5' : '#fff',
                      }}
                    >
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.firstLog.task_name || '-'}</TableCell>
                      <TableCell>{row.firstLog.total_hours ? row.firstLog.total_hours + 'h' : '-'}</TableCell>
                      <TableCell>{row.firstLog.estimation ? row.firstLog.estimation : '-'}</TableCell>
                      <TableCell>{row.firstLog.today_logged_hours ? row.firstLog.today_logged_hours + 'h' : '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          {expandedRow === row.emp_id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    {expandedRow === row.emp_id && row.logs.slice(1).map((log, index) => (
                      <TableRow key={index} style={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell />
                        <TableCell>{log.task_name || '-'}</TableCell>
                        <TableCell>{log.total_hours + 'h' || '-'}</TableCell>
                        <TableCell>{log.estimation || '-'}</TableCell>
                        <TableCell>{log.today_logged_hours + 'h' || '-'}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell />
                      </TableRow>
                    ))}
                    {expandedRow === row.emp_id && row.logs.length <= 1 && (
                      <TableRow sx={{ alignItems: 'center' }}>
                        <TableCell colSpan={8}>No logs available</TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      </Card>
    </div>
  );
};

export default useCommonRef(LogReportCard);
