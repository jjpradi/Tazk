import { Autocomplete, Button, Card, Chip, Dialog, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, Grid, InputAdornment, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import context from '../../../context/CreateNewButtonContext';
import CommonToolTip from 'components/ToolTip';
import CancelIcon from '@mui/icons-material/Cancel';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import { createIncentiveAction, updateAmountIncentiveAction, updateIncentiveAction } from 'redux/actions/incentiveProcess_action';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import NoRecordFound from 'components/Layout/NoRecordFound';

function ProcessingIncentive(props) {
  const date = new Date();
  const getCurrentMonth = date.getMonth() + 1; // current month - 1
  const currentDate = new Date();
  const [month, setMonth] = useState(getCurrentMonth);
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const previousYears = Array.from({ length: 10 }, (v, i) => currentYear - i - 1);
  const [selectedNames, setSelectedNames] = useState(['']);
  const [selectedlocate, setSelectedLocate] = useState(['']);
  const [progress, setProgress] = useState(0);
  const [linearLoading, setLinearloading] = useState(false);
  const [openDialoug, setopenDialoug] = useState(false);
  const [processField, setprocessField] = useState({
    empName: null,
    location: null,
    month: currentMonth, // Set the default value for the month field
    year: currentYear,
  });
  const {
    incentiveReducer: { processedincentive }, stockLocationReducer: { stocklocation }, attendanceReducer: { get_empbasecompany }
  } = useSelector((state) => state);

  useEffect(() => {
    let timer;
    if (linearLoading) {
      timer = setInterval(() => {
        setProgress((prevProgress) => (prevProgress >= 100 ? 100 : prevProgress + 10));
      }, 400);
    }
    return () => {
      clearInterval(timer);
    };
  }, [linearLoading]);

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setprocessField({ ...processField, [name]: value });
  };

  const monthNames = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' },
  ];
  useEffect(() => {
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie, headerLocationId,
      dispatch(getEmpbasecompanyAction()),
      dispatch(listStockLocationAction(commoncookie, headerLocationId)));
  }, []);
  const finalProcessIncentive = () => {
    const body = {
      month: processField.month,
      year: processField.year,
      employeeId: processField.empName?.includes('') || processField.empName === null ? get_empbasecompany?.map((v) => v.employee_id) : processField.empName,
      LocationId: processField.location?.includes('') || processField.location === null ? [] : processField.location,
    };
    apiCalls(
      dispatch(createIncentiveAction(body))
    )
  }

  const handleSubmit = () => {
    setLinearloading(true)
    setopenDialoug(true)
    apiCalls(
      dispatch(updateAmountIncentiveAction({ data: processedincentive }))
    );
    setTimeout(() => {
      setLinearloading(false)
      setopenDialoug(false)
      props.handleClose()
    }, 2000);
    //props.handleClose();
  }
  const handleDialougeClose = () => {
    setopenDialoug(false)
  }
  console.log(processedincentive, 'processIncentive');

  return (
    <div>
      <Card width='100%' elevation={3} style={{ padding: '10px', borderRadius: '5px' }}>
        <Grid
          container
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          spacing={5}
          padding={10}
        >

          <Grid >
            <Dialog open={openDialoug} onClose={handleDialougeClose}>
              <DialogTitle>{'Final Confirmation'}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                Processing Incentive for the Employees
                </DialogContentText>
                {linearLoading &&
                  <div>
                    <span>
                      <LinearProgress determinate value={progress}
                        sx={{
                          borderRadius: '0px',
                          height: '10px',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: '0px',
                            backgroundColor: '#4caf50',
                          },
                        }}
                      />
                    </span>
                    <span style={{
                      fontWeight: "bold", position: 'absolute',
                      top: '90%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '10px'
                    }}>
                      Processing Incentive… {`${Math.round(progress)}%`}
                    </span>
                  </div>
                }
              </DialogContent>
              </Dialog>
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>

            <FormControl sx={{ width: 200 }} variant='outlined'>
              <InputLabel>Select Month</InputLabel>
              <Select
                value={month}
                label='Select Month'
                onChange={handleChange}
                sx={{ height: '42px' }}
              >
                {monthNames.map((m) => {
                  return (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>

            <FormControl sx={{ width: 200 }} variant='outlined' >
              <InputLabel>Year</InputLabel>
              <Select
                value={processField.year || currentYear}
                name='year'
                onChange={handleChange}
                label='Year'
                required
                sx={{ height: '42px' }}
              >
                {previousYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
                <MenuItem value={currentYear}>{currentYear}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>
            <FormControl sx={{ width: 200 }} variant='outlined'>
              <InputLabel id='demo-multiple-name-label'>
                Select User <span style={{ color: 'red' }}>*</span>
              </InputLabel>
              <Select
                sx={{ minHeight: '25px' }}
                name='empName'
                label='Select Users'
                multiple
                value={selectedNames}
                onChange={(e) => {
                  const { value } = e.target;
                  setSelectedNames(value.includes('') ? [''] : value);
                  handleChange(e);
                }}
                required
                renderValue={(selected) => {
                  return (
                    <Stack gap={1} direction='row' flexWrap='wrap'>
                      {selected.includes('') ? (
                        <Chip
                          key=''
                          label='All Users'
                          onDelete={() => {
                            setSelectedNames([]);
                            handleChange({
                              target: { name: 'empName', value: [] },
                            });
                          }}
                          deleteIcon={
                            <CancelIcon
                              onMouseDown={(event) => event.stopPropagation()}
                            />
                          }
                          sx={{ fontSize: '0.8rem', height: '28px', borderRadius: '12px' }}
                        />
                      ) : (
                        selected.map((value) => {
                          const employee = get_empbasecompany.find(
                            (emp) => emp.employee_id === value,
                          );
                          return (
                            <Chip
                              key={value}
                              label={employee ? employee.first_name : ''}
                              onDelete={() => {
                                setSelectedNames(
                                  selectedNames.filter(
                                    (item) => item !== value,
                                  ),
                                );
                                handleChange({
                                  target: {
                                    name: 'empName',
                                    value: selectedNames.filter(
                                      (item) => item !== value,
                                    ),
                                  },
                                });
                              }}
                              deleteIcon={
                                <CommonToolTip title='Cancel'>
                                  <CancelIcon
                                    onMouseDown={(event) =>
                                      event.stopPropagation()
                                    }
                                  />
                                </CommonToolTip>
                              }
                              sx={{ fontSize: '0.8rem', height: '28px', borderRadius: '12px' }}
                            />
                          );
                        })
                      )}
                    </Stack>
                  );
                }}
              >
                <MenuItem value=''>All Users</MenuItem>
                {get_empbasecompany.map((m) => (
                  <MenuItem
                    key={m.employee_id}
                    value={m.employee_id}
                    disabled={selectedNames.includes('')}
                  >
                    {m.first_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 3,
              sm: 3,
              xs: 12
            }}>
            <FormControl sx={{ width: 200 }} variant='outlined'>
              <InputLabel id='demo-multiple-name-label'>
                Select Location <span style={{ color: 'red' }}>*</span>
              </InputLabel>
              <Select
                sx={{ minHeight: '35px' }}
                name='location'
                label='Select Location'
                required={true}
                multiple
                value={selectedlocate}
                onChange={(e) => {
                  const { value } = e.target;
                  setSelectedLocate(value.includes('') ? [''] : value);
                  handleChange(e);
                }}
                //error={formErrors.location !== null}
                //helperText={formErrors.empName}
                //input={<OutlinedInput label="Multiple Select" />}
                renderValue={(selected) => {
                  return (
                    <Stack gap={1} direction='row' flexWrap='wrap'>
                      {selected.includes('') ? (
                        <Chip
                          key=''
                          label='All Location'
                          onDelete={() => {
                            setSelectedLocate([]);
                            handleChange({
                              target: { name: 'location', value: [] },
                            });
                          }}
                          deleteIcon={
                            <CommonToolTip title='Cancel'>
                              <CancelIcon
                                onMouseDown={(event) =>
                                  event.stopPropagation()
                                }
                              />
                            </CommonToolTip>
                          }
                          sx={{ fontSize: '0.8rem', height: '28px', borderRadius: '12px' }}
                        />
                      ) : (
                        selected.map((value) => {
                          const locate = stocklocation.find(
                            (emp) => emp.location_id === value,
                          );
                          return (
                            <Chip
                              key={value}
                              label={locate ? locate.location_name : ''}
                              onDelete={() => {
                                setSelectedLocate(
                                  selectedlocate.filter(
                                    (item) => item !== value,
                                  ),
                                );
                                handleChange({
                                  target: {
                                    name: 'location',
                                    value: selectedlocate.filter(
                                      (item) => item !== value,
                                    ),
                                  },
                                });
                              }}
                              deleteIcon={
                                <CancelIcon
                                  onMouseDown={(event) =>
                                    event.stopPropagation()
                                  }
                                />
                              }
                            />
                          );
                        })
                      )}
                    </Stack>
                  );
                }}
              >
                <MenuItem value=''>All Location</MenuItem>
                {stocklocation.map((m) => (
                  <MenuItem
                    key={m.location_id}
                    value={m.location_id}
                    disabled={selectedlocate.includes('')}
                  >
                    {m.location_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Divider />
          </Grid>
          <Grid
            sx={{ display: 'flex', justifyContent: 'end' }}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Button variant="contained" onClick={finalProcessIncentive}>Process</Button>
          </Grid>
        </Grid>
      </Card>
      <br />
      <Card elevation={3} style={{ padding: '5px', borderRadius: '20px', backgroundColor: '#0a8fdc' }}>
        <Grid container style={{ display: 'flex' }}>
          <Grid
            style={{ display: 'flex', justifyContent: 'center' }}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}><Typography style={{ color: 'white' }}>Employee Name</Typography></Grid>
          <Grid
            style={{ display: 'flex', justifyContent: 'center' }}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 6
            }}><Typography style={{ color: 'white' }}>Amount</Typography></Grid>
        </Grid>
      </Card>
      <Card elevation={3} style={{ padding: '5px', borderRadius: '20px' }}>
        {processedincentive?.length && processedincentive.map((m, index) => (
          <div key={index}>
            <Grid container style={{ display: 'flex' }}>
              <Grid
                style={{ display: 'flex', justifyContent: 'center' }}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                {m.full_name}
              </Grid>
              <Grid
                style={{ display: 'flex', justifyContent: 'center' }}
                size={{
                  lg: 6,
                  md: 6,
                  sm: 6,
                  xs: 6
                }}>
                <TextField size="small" style={{ width: '100px' }}
                  value={m?.amount}
                  onChange={
                    (e) => {
                      dispatch(updateIncentiveAction({ index, amount: e.target.value }))
                    }
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CurrencyRupeeIcon /></InputAdornment>,
                    // Other InputProps settings as needed
                  }}
                />
              </Grid>
            </Grid>
            <Grid
              padding={3}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Divider />
            </Grid>

          </div>
        ))}
        {processedincentive?.length && <Grid
          padding={2}
          spacing={3}
          sx={{ display: 'flex', justifyContent: 'end' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Button variant="contained" color="secondary" sx={{ marginRight: '10px' }} onClick={() => props.handleClose()}>Back</Button>
          <Button variant="contained" color='primary' onClick={handleSubmit}>Submit</Button>
        </Grid>}
        {!processedincentive?.length && <Grid
          padding={2}
          spacing={3}
          sx={{ display: 'flex', justifyContent: 'end' }}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <NoRecordFound />
        </Grid>}
      </Card>
    </div>
  );
}

export default ProcessingIncentive