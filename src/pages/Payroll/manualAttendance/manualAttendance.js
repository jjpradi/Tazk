import React, { useContext, useEffect } from 'react';
import { manualCheckInAction, manualCheckOutAction } from 'redux/actions/attendance_actions';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { Avatar, Box, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Stack, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { getManualAttendanceEmpActions } from 'redux/actions/app_config_actions';
import { breakEndForManualAttAction, breakStartForManualAttAction } from 'redux/actions/shifts.actions';
import AvatarViewWrapper from 'utils/imgUpload';
import { AddCircleIcon } from 'pages/routesIcons';
import context from '../../../../src/context/CreateNewButtonContext';
import ManualCorrection from '../../Payroll/manualAttendance/manualCorrection';
import { createLeaveRequestAction, getLeaveTypeAction, listAllLeaveRequestAction, listprePermissionRequestAction } from 'redux/actions/leaveRequest_actions';
import moment from 'moment';
import dayjs from 'dayjs';
import CommonSearch from 'utils/commonSearch';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import apiCalls from 'utils/apiCalls';
import toMomentOrNull from '../../../utils/DateFixer';
import {
  getSinglePageScrollLayoutSx,
  singlePageScrollContentSx,
} from 'utils/pageScrollLayout';

import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';

const ManualAttendance = (props) => {

  const { appConfigReducer: { getManualAttEmp } , rbacReducer: {menuAccess}} = useSelector((state) => state);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [images, setImages] = useState([])
  const [checkInResults, setCheckInResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(moment());
  const [currentAction, setCurrentAction] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [correctionDialog, setcorrectionDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  const [state, setState] = useState({
    from: moment(),
    to: moment(),
  });
  const dispatch = useDispatch();
   const storage = getsessionStorage();
// console.log("searchVal",searchVal)
  const {
    commoncookie,
    headerLocationId,
    setModalStatusHandler,
    setLoaderStatusHandler, setModalTypeHandler } = useContext(context);

  const employeesData = getManualAttEmp || [];
  const employeeArray = employeesData.data;

  useEffect(() => {
    if (headerLocationId) {
      fetchEmployees();
    }
  }, [headerLocationId]);

  const fetchEmployees = async () => {
  await apiCalls(
       setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(getManualAttendanceEmpActions({ searchString: null, headerLocation: headerLocationId === "null" || !headerLocationId ? null : headerLocationId }))
    )
  };

    const selectedRole = storage.role_name
    useEffect(() => {
      if (!selectedRole) return;
       apiCalls(
               setModalTypeHandler,
               setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
    }, [selectedRole, dispatch]);

  const manualAttendanceCreate = storage.company_type === 5 ? UserRightsAuthorization(menuAccess[selectedRole], 'manual_attendance', 'can_create') : true;

  // const requestSearch = (e) => {
  //   setSearchVal(e.target.value);
  //   fetchEmployees(e.target.value);
  // };

  // Function to clear the search
  const cancelSearch = () => {
    setSearchVal('');
    fetchEmployees();
  };

  const requestSearch = async(e) => {
    setSearchVal(e.target.value);
    await apiCalls(
       setModalTypeHandler,
       setLoaderStatusHandler,
    dispatch(getManualAttendanceEmpActions({ searchString: e.target.value, headerLocation: headerLocationId === "null" || !headerLocationId ? null : headerLocationId }))
            );
  };

  const handleEmployeeSelect = (id) => {
  let updatedList = [];

  if (selectedEmployees.includes(id)) {
    updatedList = selectedEmployees.filter(empId => empId !== id);
  } else {
    updatedList = [...selectedEmployees, id];
  }

  setSelectedEmployees(updatedList);

  if (updatedList.length !== employeeArray.length) {
    setSelectAll(false);
  }

  if (updatedList.length === employeeArray.length) {
    setSelectAll(true);
  }
};


  const employeeMap = Array.isArray(employeeArray) && employeeArray.length > 0
    ? employeeArray.reduce((acc, employee) => {
      acc[employee.employee_id] = employee.full_name;
      return acc;
    }, {})
    : {};

   
  const handleCardClick = (employeeId) => {
    handleEmployeeSelect(employeeId);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogContent(null);
    setSearchVal('');
  };

  const openDialog = (title, content) => {
    setDialogTitle(title);
    setDialogContent(content);
    setDialogOpen(true);
  };

  const openCorrectionDialog = () => {
    setcorrectionDialog(true);
  };

  const handleOpenDialog = (action) => {
    setSelectedTime(moment())
    setCurrentAction(action);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
   
  
    switch (currentAction) {
      case "Check In":
        handleCheckIn();
        break;
      case "Break Start":
        handleBreakStart();
        break;
      case "Break End":
        handleBreakEnd();
        break;
      case "Check Out":
        handleCheckOut();
        break;
      default:
        console.log("Invalid action");
    }

    setOpen(false);
  };

  const finalTime = moment(selectedTime).format("YYYY-MM-DD HH:mm:ss");

 

  const handleCheckIn = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to check in.');
      return;
    }
    
    const payload = {
      type: 'manual_attendance',
      user_ids: selectedEmployees,
      user_img_url: null,
      start_time: finalTime || null
    };

    try {
      const response = await apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
         dispatch(manualCheckInAction(payload))
        );
      // const resultsArray = Array.isArray(response) ? response : [response];
      // setCheckInResults(resultsArray);
      // openDialog('Check-in Status', resultsArray.map(result => (
      //   <Box key={result.employee_id} mb={2}>
      //     <Typography>{`Employee Name: ${employeeMap[result.employee_id]}`}</Typography>
      //     <Typography>{`Status:   ${result.checkin}`}</Typography>
      //   </Box>
      // )));
      const flattenedResults = (Array.isArray(response) ? response : [response])
        .flatMap(res => res.value || []); // handle .value arrays safely

      openDialog(
        'Check-in Status',
        flattenedResults.map(result => (
          <Box key={result.employee_id} mb={2}>
            <Typography>{`Employee Name: ${employeeMap[result.employee_id] || 'Unknown'}`}</Typography>
             <Typography>{`Status:   ${result.checkin}`}</Typography>
          </Box>
        ))
      );
      setSelectedEmployees([]);
      setSelectAll(false);
      setSearchVal('');
      await fetchEmployees();
    } catch (error) {
       openDialog(
        'Error',
        <Typography color="error">
          {error?.response?.data?.message ||
            error?.message ||
            'Something went wrong while checking in. Please try again.'}
        </Typography>
      );

      setLoaderStatusHandler(false);
      
    }
  };

  const handleBreakStart = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to start break.');
      return;
    }
 

    const payload = {
      user_ids: selectedEmployees,
      breakType: null,
      start_location: null,
      breakStart_time:  finalTime || null
    };

    try {
      const response = await apiCalls (
         setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(breakStartForManualAttAction(payload))
      )
  
      // const resultsArray = Array.isArray(response) ? response : [response];
      // openDialog('Break Start Status', resultsArray.map(result => (
      //   <Box key={result.employee_id} mb={2}>
      //     <Typography>{`Employee Name: ${employeeMap[result.employee_id]}`}</Typography>
      //     <Typography>{`Status: ${result.info}`}</Typography>
      //   </Box>
      // )));
      const flattenedResults = (Array.isArray(response) ? response : [response])
        .flatMap(res => res.value || []); // handle .value arrays safely

      openDialog(
        'Break Start Status',
        flattenedResults.map(result => (
          <Box key={result.employee_id} mb={2}>
            <Typography>{`Employee Name: ${employeeMap[result.employee_id] || 'Unknown'}`}</Typography>
            <Typography>{`Status: ${result.info || result.response_message || 'No info'}`}</Typography>
          </Box>
        ))
      );
      setSelectedEmployees([]);
      setSearchVal('');
      setSelectAll(false);
    } catch (error) {
       openDialog(
      'Error',
      <Typography color="error">
        {error?.response?.data?.message ||
          error?.message ||
          'Something went wrong while starting the break. Please try again.'}
      </Typography>
    );

    setLoaderStatusHandler(false);
    }
  };

  const handleBreakEnd = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to break end.');
      return;
    }

    const payload = {
      user_ids: selectedEmployees,
      breakType: null,
      start_location: null,
      breakEnd_time:  finalTime || null
    };

    try {
      const response = await apiCalls( 
        setModalTypeHandler,
        setLoaderStatusHandler, 
        dispatch(breakEndForManualAttAction(payload))
      ) 
      // const resultsArray = Array.isArray(response) ? response : [response];
      // openDialog('Break End Status', resultsArray.map(result => (
      //   <Box key={result.employee_id} mb={2}>
      //     <Typography>{`Employee Name: ${employeeMap[result.employee_id]}`}</Typography>
      //     <Typography>{`Status: ${result.status}`}</Typography>
      //   </Box>
      // )));
      const flattenedResults = (Array.isArray(response) ? response : [response])
        .flatMap(res => res.value || []); // handle .value arrays safely

      openDialog(
        'Break End Status',
        flattenedResults.map(result => (
          <Box key={result.employee_id} mb={2}>
            <Typography>{`Employee Name: ${employeeMap[result.employee_id] || 'Unknown'}`}</Typography>
            <Typography>{`Status: ${result.info || result.response_message || 'No info'}`}</Typography>
          </Box>
        ))
      );
      setSelectedEmployees([]);
      setSearchVal('');
      setSelectAll(false);
    } catch (error) {
      openDialog(
      'Error',
      <Typography color="error">
        {error?.response?.data?.message ||
          error?.message ||
          'Something went wrong while ending the break. Please try again.'}
      </Typography>
    );

    setLoaderStatusHandler(false);
    }
  };

  const handleCheckOut = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to check Out.');
      return;
    }

   
    const payload = {
      type: 'manual_attendance',
      user_ids: selectedEmployees,
      user_img_url: null,
      end_time:  finalTime || null
    };

    try {
      const response = await apiCalls(
         setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(manualCheckOutAction(payload, setLoaderStatusHandler))
      )
      // const resultsArray = Array.isArray(response) ? response : [response];
      // openDialog('Check-out Status', resultsArray.map(result => (
      //   <Box key={result.employee_id} mb={2}>
      //     <Typography>{`Employee Name: ${employeeMap[result.employee_id]}`}</Typography>
      //     <Typography>{`Status:${result.response_message}`}</Typography>
      //   </Box>
      // )));
          const flattenedResults = (Array.isArray(response) ? response : [response])
        .flatMap(res => res.value || []); // handle .value arrays safely

      openDialog(
        'Check-out Status',
        flattenedResults.map(result => (
          <Box key={result.employee_id} mb={2}>
            <Typography>{`Employee Name: ${employeeMap[result.employee_id] || 'Unknown'}`}</Typography>
            <Typography>{`Status: ${result.info || result.response_message || 'No info'}`}</Typography>
          </Box>
        ))
      );
      setSelectedEmployees([]);
      setSearchVal('');
      setSelectAll(false);
      await fetchEmployees();
    } catch (error) {
       openDialog(
      'Error',
      <Typography color="error">
        {error?.response?.data?.message ||
          error?.message ||
          'Something went wrong while checking out. Please try again.'}
      </Typography>
    );

    setLoaderStatusHandler(false);
    }
  };

 const handleSelectAll = (event) => {
  const checked = event.target.checked;
  setSelectAll(checked);

  if (checked) {
    const allIds = employeeArray.map(emp => emp.employee_id);
    setSelectedEmployees(allIds);
  } else {
    setSelectedEmployees([]);
  }
};

  const handleChange = async (event) => {
    const date_val = event.target.value;
    await setState((prevState) => ({
      ...prevState,
      [event.target.name]: date_val,
    }));
  };

  const propsForNewDialog = {
    open: correctionDialog,
    correctionForm: {
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
      note: '',
    },
    handleClose: () => {
      setcorrectionDialog(false);
    }
  };

  const isSuperLarge = useMediaQuery('(min-width: 2800px)');
  const pageScrollLayoutSx = getSinglePageScrollLayoutSx(95);


  return (
     <Card
       sx={{
         ...pageScrollLayoutSx,
         p: 2,
         boxSizing: 'border-box',
         overflowX: 'hidden',
       }}
     >
      <Box display="flex" alignItems="center" justifyContent="space-between" flexDirection={{ xs: 'column', sm: 'row' }}>
        <Box display="flex" alignItems="center" sx={{ whiteSpace: 'nowrap' }} >
          <Typography className='page-title'>{'Manual Attendance'}</Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="flex-end" width="100%" flexWrap="wrap">
          <Box sx={{ marginRight: { xs: 0, sm: 2 }, marginBottom: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
            <CommonSearch
              searchVal={searchVal}
              requestSearch={requestSearch}
              cancelSearch={cancelSearch}
            />
          </Box>

          {employeeArray && employeeArray.length > 1 && (
            <Box display="flex" alignItems="center" sx={{ marginRight: { xs: 0, sm: 2 }, marginBottom: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
              <Typography variant="h6" sx={{ whiteSpace: 'nowrap', marginRight: 1 }}>
                Select All
              </Typography>
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAll}
                inputProps={{ 'aria-label': 'select all employees' }}
              />
            </Box>
          )}

          <Grid container spacing={2} justifyContent="flex-end" sx={{ width: { xs: '100%', sm: 'auto' }, marginBottom: { xs: 2, sm: 0, } }}>
            <Grid>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog("Check In")} fullWidth={true}>
                Check In
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog("Break Start")} fullWidth={true}>
                Break Start
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog("Break End")} fullWidth={true}>
                Break End
              </Button>
            </Grid>
            <Grid>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog("Check Out")} fullWidth={true}>
                Check Out
              </Button>
            </Grid>
            <Grid>
              <Stack>
                {manualAttendanceCreate && (
                  <Tooltip title="Attendance Correction">
                    <IconButton onClick={openCorrectionDialog}>
                      <AddCircleIcon color="primary" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>

      </Box>
      <ManualCorrection {...propsForNewDialog} handleChange={handleChange} from={state.from} to={state.to} />
      <Box sx={{ ...singlePageScrollContentSx, pt: 2, px: 1, pb: 0 }}>
      <Grid container spacing={5} alignContent="flex-start">
        {Array.isArray(employeeArray) && employeeArray.map((employee) => (
          <Grid
            key={employee.employee_id}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
              xl: isSuperLarge ? 2 : 3
            }}>
            <Card
              style={{
                padding: '10px',
                position: 'relative',
                border: selectedEmployees.includes(employee.employee_id) ? '2px solid #3f51b5' : 'none',
                backgroundColor: '#F4F7FE'
              }}
              onClick={() => handleCardClick(employee.employee_id)}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box mt={10} width="100%">
                  {selectedEmployees.includes(employee.employee_id) && (
                    <Checkbox
                      checked={selectedEmployees.includes(employee.employee_id)}
                      onChange={() => handleEmployeeSelect(employee.employee_id)}
                      style={{ position: 'absolute', top: 10, right: 10 }}
                    />

                  )}
                </Box>

                <AvatarViewWrapper
                >
                  <label htmlFor='icon-button-file'>
                    <Avatar
                      sx={{
                        width: { xs: 120, lg: 150 },
                        height: { xs: 120, lg: 150 },
                        cursor: 'pointer',
                      }}
                      src={employee.url}
                    />
                  </label>
                </AvatarViewWrapper>


                <br />
                <Typography fontWeight={600} textAlign="center" width="100%">
                  {employee.full_name}
                </Typography>

                <Box mt={5} width="100%">
                  {/* Role section with flex display */}
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" textAlign="left">
                      Employee Code:
                    </Typography>
                    <Box flex={1} display="flex" justifyContent="flex-end">
                      <Typography variant="subtitle1" fontWeight={500} textAlign="right">
                        {employee.employeeId}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" textAlign="left">
                      Check-In:
                    </Typography>
                    <Box flex={1} display="flex" justifyContent="flex-end">
                      <Typography variant="subtitle1" fontWeight={500} textAlign="center">
                        {employee.checkIn_time ?
                          new Date(employee.checkIn_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) :
                          '-'
                        }
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" textAlign="left">
                      Check-Out:
                    </Typography>
                    <Box flex={1} display="flex" justifyContent="flex-end">
                      <Typography variant="subtitle1" fontWeight={500} textAlign="center">
                        {employee.checkOut_time ?
                          new Date(employee.checkOut_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) :
                          '-'
                        }
                      </Typography>
                    </Box>
                  </Box>

                  {/* Department section with flex display */}
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" textAlign="left">
                      Department:
                    </Typography>
                    <Box flex={1} display="flex" justifyContent="flex-end">
                      <Typography variant="subtitle1" fontWeight={500} textAlign="center">
                        {employee.department}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" textAlign="left">
                      Designation:
                    </Typography>
                    <Box flex={1} display="flex" justifyContent="flex-end">
                      <Typography variant="subtitle1" fontWeight={500} textAlign="center">
                        {employee.designation}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {/* More Options Button */}
              {/* <IconButton style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                <MoreVertIcon />
              </IconButton> */}
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        PaperProps={{
          style: { width: '500px', maxHeight: '80%' },
        }}
      >
        <DialogTitle>
          <Typography variant="h3" fontWeight="bold">
            {dialogTitle}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {dialogContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>Select Time</DialogTitle>
        <DialogContent>

          <LocalizationProvider dateAdapter={DateAdapter}>
            <Grid container spacing={2} direction="row">
              <Grid
                size={{
                  xs: 12,
                  md: 12
                }}>
                <TimePicker
                  value={toMomentOrNull(selectedTime)}
                  onChange={(newValue) => setSelectedTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'dense',
                      inputProps: { readOnly: true },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ManualAttendance;
