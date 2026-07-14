import React, {useContext, useEffect, useState} from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Badge,
  Grid,
  Slider,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import {FilterAlt} from '@mui/icons-material';
import _, {countBy} from 'lodash';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {getDateFormat} from 'utils/getTimeFormat';
import {useDispatch, useSelector} from 'react-redux';
import CommonToolTip from 'components/ToolTip';
import CancelIcon from '@mui/icons-material/Cancel';
import moment from 'moment';
import {getLocBaseEmpAction, viewSelfieAttendanceImagesAction,getLocBaseEmpFilterAction, set_search_location_based_employee, get_search_location_based_employee, getEmpbasecompanyAction} from 'redux/actions/attendance_actions';
import { GET_EMP_BASECOMPANY, LOCATION_BASE_DEP,LOCATION_BASE_DEP_FILTER } from 'redux/actionTypes';
import { capitalize } from 'lodash';
import CommonUserAutoComplete from '../../../utils/commonAutoCompleteForUser';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { departmentListAction } from 'redux/actions/userCreation_actions';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import apiCalls from 'utils/apiCalls';
import toMomentOrNull from 'utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,

  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

const FilterLoan = (props) => {
  const dispatch = useDispatch();
  const [location, setLocation] = useState()
  console.log(props.formValues?.location,'Location');
  const {
    attendanceReducer: {selfie_images},
    attendanceReducer: {get_empbasecompany,getLocationBasedEmployee, searchLocationBasedEmployee},
    stockLocationReducer: {stocklocation},
    UserCreationReducer: {departmentList},
  } = useSelector((state) => state);

  const status = [
    {value: 'Rejected', label: 'Rejected'},
    {value: 'Waiting for approval', label: 'Waiting for approval'},
    {value: 'Approved', label: 'Approved'},
  ];

  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
    CreateNewButtonContext,
  );

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  useEffect (() => {
    props.setValue([])

    if(props.formValues?.location?.length > 0 || props.formValues?.department?.length > 0) {

        
      let data = {
        ...props.formValues,
        searchString:''
       }
          dispatch(getLocBaseEmpFilterAction(data,(res)=> { 
            if(res.data?.department) {
            dispatch({
              type: LOCATION_BASE_DEP,
              payload: res.data?.department,
            });
           }
             if(res.data?.employees){
              console.log(res?.data,'correction');
              dispatch({
                type: LOCATION_BASE_DEP_FILTER,
                payload:  res.data?.employees,
              });
            }
          }))
        }

  },[props.formValues?.location,props.formValues?.department])

  useEffect(() => {

    dispatch(getEmpbasecompanyAction())
    dispatch(departmentListAction((res)=>{
        
    })),
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      commoncookie, headerLocationId,
      dispatch(listStockLocationAction(commoncookie, headerLocationId)),
      // dispatch(AttendanceProcessAction(data))
    );
    // setValue(get_empbasecompany)
  }, []);

  const requestSearchEmployeeFilter = (val) => {

    // let allDept = list_department.map((d) => d.department);

    setSearchValEmployeeFilter(val);
    dispatch(set_search_location_based_employee([]));

    if (!val) {
      return
    }

    let data = {
      ...props.formValues,
      searchString: val
    }



    dispatch(
      get_search_location_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );
    // }
    // }),
    // );

  };


  const handleChange = (event) => {
    const {value, name} = event.target;

    // props.filterHandler(name,value)
  };

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  // const clearButton = async() => {
  //   await props.setFormValues({
  //     employee_id: [''],
  //     location: [''],
  //     department: [''],
  //     date: moment().format('YYYY-MM-DD'),
  //   });
  //   const data = {
  //     employee_id: [''],
  //     location: [''],
  //     department: [''],
  //     date: moment().format('yyyy-MM-DD'),
  //   };
  //   await dispatch(viewSelfieAttendanceImagesAction(data));
  //   await props.handleClose();
  // };
  console.log('RTRTt', props.formValues);

  return (
    <>
      <Badge
        color='secondary' //</>badgeContent={props.count}
      >
        <CommonToolTip title='filter'>
          <IconButton onClick={() => props.handleOpen()}>
            <FilterAlt sx={{color: 'rgb(107, 114, 128)'}} />
          </IconButton>
        </CommonToolTip>
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose()}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='left'
      >
        <Card sx={style}>
          <div style={{marginLeft: '17.2pc'}}>
            <IconButton aria-label='close' onClick={() => props.handleClose()}>
              <CloseIcon />
            </IconButton>
          </div>
          <Grid
            container
            spacing={8}
            display='flex'
            justifyContent='center'
            direction={'row'}
          >
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Stack
                direction='row'
                display='flex'
                alignItems='center'
                gap={1}
                sx={{m: 1}}
              >
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    // disableFuture
                    name='from'
                    label='From Date'
                    inputVariant='outlined'
                    format='DD/MM/YYYY'                    
                    value={toMomentOrNull(props.formValues.date)}
                    required={true}
                    onChange={(date) =>
                      props.setFormValues((prevFormValues) => ({
                        ...prevFormValues,
                        date: date,
                      }))
                    }
                    views={['year', 'month', 'day']}
                    fullWidth={true}
                    slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                  />
                </LocalizationProvider>
              </Stack>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <div
                style={{
                  minHeight: '50px',
                  maxHeight: '60px',
                }}
              >
                <FormControl fullWidth variant='filled' required>
                  <InputLabel id='demo-multiple-name-label'>
                    Select Location
                  </InputLabel>

                  <Select
                    name='location'
                    multiple
                    // sx={{ height: '55px' }}
                    value={props.formValues.location}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          overflowY: 'auto',
                        },
                      },
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      props.setFormValues((prevMonthYear) => ({
                        ...prevMonthYear,
                        location: value.includes('') ? [''] : value,
                      }));
                      // setFormErrors((prevFormErrors) => ({
                      //   ...prevFormErrors,
                      //   location: null,
                      // }));
                    }}
                    // error={formErrors.location === null ? false : true}
                    // helperText={
                    //   formErrors.location === null ? '' : 'Location is Required!'
                    // }
                    renderValue={(selected) => {
                      let displayText = '';

                      if (selected.includes('')) {
                        displayText = 'All Locations';
                      } else if (selected.length <= 2) {
                        displayText = selected
                          .map((value) => {
                            const locate = stocklocation.find(
                              (emp) => emp.location_id === value,
                            );
                            return locate ? locate.location_name : '';
                          })
                          .join(', ');
                      } else {
                        const firstTwoLocations = selected
                          .slice(0, 2)
                          .map((value) => {
                            const locate = stocklocation.find(
                              (emp) => emp.location_id === value,
                            );
                            return locate ? locate.location_name : '';
                          })
                          .join(', ');

                        displayText = `${firstTwoLocations} ...`;
                      }

                      return (
                        <Stack gap={1} direction='row' flexWrap='wrap'>
                          <Chip
                            title={displayText === "All Locations" ? displayText : selected.map((value) => {
                              const locate = stocklocation.find(
                                (emp) => emp.location_id === value,
                              );
                              return locate ? locate.location_name : '';
                            })
                              .join(', ')}
                            label={displayText}
                            onDelete={() => {
                              props.setFormValues((prevMonthYear) => ({
                                ...prevMonthYear,
                                location: [],
                              }));
                              handleChange({
                                target: { name: 'location', value: [] },
                              });
                            }}
                            deleteIcon={
                              <CancelIcon
                                onMouseDown={(event) => event.stopPropagation()}
                              />
                            }
                          />
                        </Stack>
                      );
                    }}
                  >
                    <MenuItem value=''>All Location</MenuItem>
                    {stocklocation.map((m) => (
                      <MenuItem
                        key={m.location_id}
                        value={m.location_id}
                        disabled={props.formValues.location.includes('')}
                      >
                        {m.location_name}
                      </MenuItem>
                    ))}
                  </Select>

                  {/* {formErrors.location !== null && (
                    <FormHelperText sx={{ color: 'red' }}>
                      Location is Required!
                    </FormHelperText>
                  )} */}
                </FormControl>
              </div>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <div
                style={{
                  minHeight: '50px',
                  maxHeight: '60px',
                }}
              >
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-multiple-name-label'>
                    Select Department
                  </InputLabel>
                  {/* <Select
                    name='department'
                    multiple
                    value={props.formValues.department}
                    onChange={(e) => {
                      const {value} = e.target;
                      props.setFormValues((prevFormValues) => ({
                        ...prevFormValues,
                        department: value.includes('') ? [''] : value,
                      }));

                      // Clear the error for the 'location' field when a value is selected
                    }}
                    required
                    fullWidth={true}
                    renderValue={(selected) => {
                      return (
                        <Stack gap={1} direction='row' flexWrap='wrap'>
                          {selected.includes('') ? (
                            <Chip
                              key=''
                              label='All Department'
                              onDelete={() => {
                                props.setFormValues((prevFormValues) => ({
                                  ...prevFormValues,
                                  department: [],
                                }));
                                handleChange({
                                  target: {
                                    name: 'department',
                                    value: [],
                                  },
                                });
                              }}
                              deleteIcon={
                                <CommonToolTip title='Cancel'>
                                  {' '}
                                  <CancelIcon
                                    onMouseDown={(event) =>
                                      event.stopPropagation()
                                    }
                                  />{' '}
                                </CommonToolTip>
                              }
                            />
                          ) : (
                            selected.map((value) => {
                              const dep = departmentList.find(
                                (d) => d.department === value,
                              );
                              return (
                                <Chip
                                  key={value}
                                  label={dep ? dep.department : ''}
                                  onDelete={() => {
                                    props.setFormValues((prevFormValues) => ({
                                      ...prevFormValues,
                                      department:
                                        props.formValues.department.filter(
                                          (item) => item !== value,
                                        ),
                                    }));
                                    handleChange({
                                      target: {
                                        name: 'department',
                                        value:
                                          props.formValues.department.filter(
                                            (item) => item !== value,
                                          ),
                                      },
                                    }); // Update the form value for location when a specific option is cleared
                                  }}
                                  deleteIcon={
                                    <CommonToolTip title='Cancel'>
                                      {' '}
                                      <CancelIcon
                                        onMouseDown={(event) =>
                                          event.stopPropagation()
                                        }
                                      />{' '}
                                    </CommonToolTip>
                                  }
                                />
                              );
                            })
                          )}
                        </Stack>
                      );
                    }}
                  >
                    <MenuItem value=''>All Department</MenuItem>
                    {departmentList.map((m) => (
                      <MenuItem
                        key={m.department}
                        value={m.department}
                        disabled={props.formValues.department.includes('')}
                      >
                        {m.department}
                      </MenuItem>
                    ))}
                  </Select> */}
                  <Select
                    name='department'
                    multiple
                    value={props.formValues.department}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                          overflowY: 'auto',
                        },
                      },
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      props.setFormValues((prevFormValues) => ({
                        ...prevFormValues,
                        department: value.includes('') ? [''] : value.filter((v) => v !== ''),
                      }));
                    }}
                    required
                    fullWidth={true}
                    renderValue={(selected) => {
                      if (selected.includes('')) {
                        return (
                          <Chip
                            key=''
                            label='All Department'
                            onDelete={() => {
                              props.setFormValues((prevFormValues) => ({
                                ...prevFormValues,
                                department: [],
                              }));
                            }}
                            deleteIcon={
                              <CommonToolTip title="Cancel">
                                <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                              </CommonToolTip>
                            }
                          />
                        );
                      } else {
                        return selected.map((value) => {
                          const dept = departmentList.find((dept) => dept.name === value);
                          return (
                            <Chip
                              key={value}
                              label={dept ? dept.name : ''}
                              onDelete={() => {
                                props.setFormValues((prevFormValues) => ({
                                  ...prevFormValues,
                                  department: selected.filter((d) => d !== value),
                                }));
                              }}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                </CommonToolTip>
                              }
                            />
                          );
                        });
                      }
                    }}
                  >
                    <MenuItem value="">All Department</MenuItem>
                    {departmentList && departmentList.length > 0 ? (
                      departmentList.map((m) => (
                        <MenuItem key={m.name} value={m.name}>
                          {m.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No departments available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </div>
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              {/* <div
                style={{
                  minHeight: '50px',
                  maxHeight: '60px',
                }}
              > */}
                <FormControl fullWidth variant='filled'>
                  <CommonUserAutoComplete
                    searchVal={searchValEmployeeFilter}

                    requestSearch={requestSearchEmployeeFilter}
                    value={props.value}
                    setValue={props.setValue}
                    type={getLocationBasedEmployee}
                    searchType={searchLocationBasedEmployee}
                    selectedAll={props.selectedAll}
                    setSelectedAll={props.setSelectedAll}
                    error={props?.formErrors?.empName}
                    isMandatory={true}
                    
                  />
                </FormControl>
              {/* </div> */}
            </Grid>

            <Grid style={{display: 'flex', justifyContent: 'center', gap: '40px'}}>
              <Grid>
                <Button
                  fullWidth
                  onClick={(e) => props.ClearButton(e)}
                  // sx={button}
                  variant='contained'
                  color='warning'
                >
                  Clear
                </Button>
              </Grid>
              <Grid>
                <Button
                  fullWidth
                  onClick={(e) => props.ApplyButton(e)}
                  // sx={button}
                  variant='contained'
                >
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Modal>
    </>
  );
};

export default FilterLoan;
