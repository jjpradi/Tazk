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
import {getLocBaseEmpAction, viewSelfieAttendanceImagesAction,getLocBaseEmpFilterAction, set_search_location_based_employee, get_search_location_based_employee} from 'redux/actions/attendance_actions';
import { GET_EMP_BASECOMPANY, LOCATION_BASE_DEP,LOCATION_BASE_DEP_FILTER } from 'redux/actionTypes';
import { capitalize } from 'lodash';
import CommonUserAutoComplete from '../../../utils/commonAutoCompleteForUser';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import apiCalls from 'utils/apiCalls';
import { listDepartment } from 'redux/actions/shifts.actions';
import toMomentOrNull from 'utils/DateFixer';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  height: 550,
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
  const {
    attendanceReducer: {selfie_images},
    attendanceReducer: {get_empbasecompany,getLocationBasedEmployee, searchLocationBasedEmployee},
    stockLocationReducer: {stocklocation},
    UserCreationReducer: {departmentList},
    ShiftsReducer: { list_department },
  } = useSelector((state) => state);



  const status = [
    {value: 'Rejected', label: 'Rejected'},
    {value: 'Waiting for approval', label: 'Waiting for approval'},
    {value: 'Approved', label: 'Approved'},
  ];
  const [isApiFinished, setIsApiFinished] = useState(false);
  const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
    CreateNewButtonContext,
  );  

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

 
  useEffect(() => {
    props.setValue([])
    if(props?.departmentListsArray.length > 0){
        if (props.formValues?.location?.length > 0 || props.formValues?.department?.length > 0) {
  
          let data = {
            ...props.formValues,
            searchString: '',
            department: props.formValues?.department.includes('') || props.formValues?.department.length === 0
              ? props.departmentListsArray.map((d) => d.department)
              : props.formValues?.department,
          }
          dispatch(getLocBaseEmpFilterAction(data, (res) => {
            if (res.data?.department) {
              dispatch({
                type: LOCATION_BASE_DEP,
                payload: res.data?.department,
              });
            }
            if (res.data?.employees) {
              // console.log(res?.data,'correction');
              dispatch({
                type: LOCATION_BASE_DEP_FILTER,
                payload: res.data?.employees,
              });
            }
          }))
        
      }
    }
    // console.log("props.departmentLists",props.departmentListsArray)

     

  }, [props.formValues?.location, props.formValues?.department,props?.departmentListsArray])

  

  const requestSearchEmployeeFilter = (val) => {

    // let allDept = list_department.map((d) => d.department);

    setSearchValEmployeeFilter(val);
    dispatch(set_search_location_based_employee([]));

    if (!val) {
      return
    }

    let data = {
      ...props.formValues,
      searchString: val,
      department: props.formValues?.department.includes('') || props.formValues?.department.length === 0
      ? props.departmentListsArray.map((d) => d.department)
      : props.formValues?.department,
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

  useEffect(() => {
    if (
      stocklocation.length === 1 &&
      (!props.formValues.location ||
        props.formValues.location.length === 0 ||
        props.formValues.location.includes(""))
    ) {
      props.setFormValues(prev => ({
        ...prev,
        location: [stocklocation[0].location_id],
      }));
    }
  }, [stocklocation]);



  const clearButton = async () => {
    const defaultLocation =
      stocklocation.length === 1
        ? [stocklocation[0].location_id]
        : [''];
    await props.setFormValues({
      empName: [''],
      location: defaultLocation,
      department:  [''],
      
      date: moment().format('YYYY-MM-DD'),
    });
    props.setButton()
    const data = {
      empName: [''],
      location: defaultLocation,
      department: 
      props.departmentListsArray.map((d) => d.department) || [''],
   
      date: moment().format('yyyy-MM-DD'),
      searchString: '',
    };
    await dispatch(viewSelfieAttendanceImagesAction(data));
    await props.handleClose();
  };
  // console.log('RTRTt', props.formValues);
  
  useEffect(()=>{
        let val = props.value.map((d)=> d.employee_id);  
        props.setFormValues({...props.formValues, empName: val})
  },[props.value])
  // console.log('props.value', props.value, props.formValues)
  return (
    <>
      <Badge
        color='secondary' //</>badgeContent={props.count}
      >
        <CommonToolTip title='filter'>
          <IconButton onClick={() => props.handleOpen(true)}>
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
                    disableFuture
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
                <FormControl fullWidth variant='filled'>
                  <InputLabel id='demo-multiple-name-label'>
                    Select Location
                  </InputLabel>
                  <Select
                    name='location'
                    multiple
                    value={props.formValues.location}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          overflowY: 'auto',
                        },
                      },
                    }}
                    // onChange={(e) => {
                    //   const { value } = e.target;
                    //   props.setFormValues((prevFormValues) => ({
                    //     ...prevFormValues,
                    //     location: value.includes('') ? [''] : value,
                    //   }));
                    // }}
                    onChange={(e) => {
                      const { value } = e.target;
                      if (stocklocation.length > 1) {
                        if (value.includes("")) {
                          props.setFormValues(prev => ({
                            ...prev,
                            location: [""]
                          }));
                        } else {
                          props.setFormValues(prev => ({
                            ...prev,
                            location: value.filter(v => v !== ""),
                          }));
                        }
                        return;
                      }

                      props.setFormValues(prev => ({
                        ...prev,
                        location: value.filter(v => v !== "")
                      }));
                    }}
                    required
                    fullWidth={true}
                       // renderValue={(selected) => {
                    //    if (selected.length === 0) return "";
                    //   const totalCount = selected.length;

                    //   if (selected.includes('')) {
                    //     // return <Chip label={`All Location`} />
                    //     // return 'All Location';
                    //     return <Chip
                    //       key=''
                    //       label='All Location'
                    //       onDelete={() => {
                    //         props.setFormValues((prevFormValues) => ({
                    //           ...prevFormValues,
                    //           location: [],
                    //         }));
                    //         handleChange({
                    //           target: {
                    //             name: 'location',
                    //             value: [],
                    //           },
                    //         });
                    //       }}
                    //       deleteIcon={
                    //         <CommonToolTip title='Cancel'>
                    //           {' '}
                    //           <CancelIcon
                    //             onMouseDown={(event) =>
                    //               event.stopPropagation()
                    //             }
                    //           />{' '}
                    //         </CommonToolTip>
                    //       }
                    //     />
                    //   } else if (totalCount === 1) {
                    //     const [singleLocation] = selected;
                    //     // console.log('SDSDSD',selected);
                    //     const locate = stocklocation.find((emp) => emp.location_id === singleLocation);

                    //     return <Chip
                    //       label={locate ? locate.location_name : ''}
                    //       onDelete={() => {
                    //         props.setFormValues((prevFormValues) => ({
                    //           ...prevFormValues,
                    //           location: [],
                    //         }));
                    //         handleChange({
                    //           target: {
                    //             name: 'location',
                    //             value: [],
                    //           },
                    //         });
                    //       }}
                    //       deleteIcon={
                    //         <CommonToolTip title='Cancel'>
                    //           <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                    //         </CommonToolTip>
                    //       }
                    //     />
                    //     // return locate ? locate.location_name : '';
                    //   } else {
                    //     const [firstLocation, ...remainingLocations] = selected;
                    //     const first = selected && selected[0] 

                    //     const firstLocate = stocklocation.find((emp) => emp.location_id === firstLocation);
                    //     const remainingCount = remainingLocations.length;
                    //     return (
                    //       <Stack gap={1} direction='row' flexWrap='wrap'>
                    //         <Chip
                    //           label={selected ? stocklocation.find(d=> d.location_id === first).location_name : ''}
                    //           onDelete={(d) => {
                    //             // console.log('fdfdf',d);
                    //             props.setFormValues((prevFormValues) => ({
                    //               ...prevFormValues,
                    //               location: selected.filter(d => d !== first),
                    //             }));
                    //             handleChange({
                    //               target: {
                    //                 name: 'location',
                    //                 value: selected.filter(d => d !== first),
                    //               },
                    //             });
                    //           }}
                    //           deleteIcon={
                    //             <CommonToolTip title='Cancel'>
                    //               <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                    //             </CommonToolTip>
                    //           }
                    //         />
                    //         <Chip label={`+${remainingCount}`} />
                    //       </Stack>
                    //     );
                    //   }
                    // }}
            
                    renderValue={(selected) => {
                      if (stocklocation.length === 1) {
                        return (
                          <Chip
                            label={stocklocation[0].location_name}
                            onDelete={() =>
                              props.setFormValues(prev => ({
                                ...prev,
                                location: [],
                              }))
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        );
                      }
                      if (selected.includes("")) {
                        return (
                          <Chip
                            label="All Locations"
                            onDelete={() =>
                              props.setFormValues(prev => ({
                                ...prev,
                                location: [],
                              }))
                            }
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        );
                      }

                      return (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((id) => {
                            const loc = stocklocation.find(l => l.location_id === id);
                            if (!loc) return null;

                            return (
                              <Chip
                                key={id}
                                label={loc.location_name}
                                onDelete={() =>
                                  props.setFormValues(prev => ({
                                    ...prev,
                                    location: prev.location.filter(x => x !== id),
                                  }))
                                }
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            );
                          })}
                        </Box>
                      );
                    }}
                  >
                {stocklocation.length > 1 && (
                  <MenuItem value=''>All Location</MenuItem>
                )}
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
                <FormControl fullWidth variant="filled">
                  <InputLabel id="demo-multiple-name-label">Select Department</InputLabel>
                  <Select
                    name="department"
                    multiple
                    value={props.formValues.department}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250,
                          overflowY: 'auto',
                        },
                      },
                    }}
                    onChange={(e) => {
                      const { value } = e.target;
                      props.setFormValues((prevFormValues) => ({
                        ...prevFormValues,
                        department: value.includes('') ? [''] : value,
                      }));
                    }}
                    required
                    fullWidth={true}
                    renderValue={(selected) => {
                      const totalCount = selected.length;

                      if (selected.includes('')) {
                        return (
                          <Chip
                            key=""
                            label="All Department"
                            onDelete={() => {
                              props.setFormValues((prevFormValues) => ({
                                ...prevFormValues,
                                department: [],
                              }));
                            }}
                            deleteIcon={
                              <CommonToolTip title="Cancel">
                                <CancelIcon
                                  onMouseDown={(event) => event.stopPropagation()}
                                />
                              </CommonToolTip>
                            }
                          />
                        );
                      } else if (totalCount === 1) {
                        const singleDepartment = selected[0];
                        const dept = departmentList.find(
                          (dept) => dept.name === singleDepartment
                        );
                        return (
                          <Chip
                            label={dept ? dept.name : ''}
                            onDelete={() => {
                              props.setFormValues((prevFormValues) => ({
                                ...prevFormValues,
                                department: [],
                              }));
                            }}
                            deleteIcon={
                              <CommonToolTip title="Cancel">
                                <CancelIcon
                                  onMouseDown={(event) => event.stopPropagation()}
                                />
                              </CommonToolTip>
                            }
                          />
                        );
                      } else {
                        const [firstDepartment, ...remainingDepartment] = selected;
                        const firstLocate = departmentList.find(
                          (dept) => dept.name === firstDepartment
                        );
                        const remainingCount = remainingDepartment.length;
                        return (
                          <Stack gap={1} direction="row" flexWrap="wrap">
                            <Chip
                              label={firstLocate ? firstLocate.name : ''}
                              onDelete={() => {
                                props.setFormValues((prevFormValues) => ({
                                  ...prevFormValues,
                                  department: selected.filter(
                                    (d) => d !== firstDepartment
                                  ),
                                }));
                              }}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon
                                    onMouseDown={(event) => event.stopPropagation()}
                                  />
                                </CommonToolTip>
                              }
                            />
                            <Chip label={`+${remainingCount}`} />
                          </Stack>
                        );
                      }
                    }}
                  >
                    <MenuItem value="">All Department</MenuItem>
                    {departmentList.map((m) => (
                      <MenuItem
                        key={m.name}
                        value={m.name}
                        disabled={props.formValues.department.includes('')}
                      >
                        {m.name}
                      </MenuItem>
                    ))}
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
                    reqType={'todayAttendance'}
                   
                  />
                </FormControl>
              {/* </div> */}
            </Grid>

            <Grid style={{display: 'flex', justifyContent: 'center', gap: '40px'}}>
              <Grid>
                <Button
                  fullWidth
                  onClick={() => clearButton()}
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
                  onClick={() => props.ApplyButton()}
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
