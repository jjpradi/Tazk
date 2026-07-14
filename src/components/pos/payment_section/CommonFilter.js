import React, { useContext, useEffect, useState } from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  Autocomplete,
  InputAdornment,
  Stack,
  Tooltip,
  Grid,
  Badge,
  Box,
  Divider,
  Chip,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import _, { countBy } from 'lodash';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import CommonToolTip from 'components/ToolTip';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import context from '../../../context/CreateNewButtonContext';
import { useDispatch, useSelector } from 'react-redux';

import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { getEmpbasecompanyAction, getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee } from 'redux/actions/attendance_actions';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import { getLocationBaseEmpFilterAction } from '../../../redux/actions/attendance_actions';
import moment from 'moment';
import { getDateTimeFormat } from 'utils/getTimeFormat';
import dayjs from 'dayjs';
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
  // height: 550,
  marginTop: '10px',
  borderRadius: 5,
};

const button = {
  position: 'absolute',
  top: '86%',
  left: '37%',
};

function CommonFilter(props) {
  const dispatch = useDispatch()
  const [newValue, setNewValue] = useState('');
  const [formValue, setFormValue] = useState({});
  const [value, setValue] = React.useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');
  const {
    attendanceReducer: { get_empbasecompany, searchCompanyBasedEmployeeFilter, getCompanyBasedEmployeeFilter },
  } = useSelector((state) => state);
  const [userSelectError, setUserSelectError] = useState('');
  const { setLoaderStatusHandler, setModalTypeHandler, headerLocationId } =
    useContext(context);
  const leaveOptions = [
  { value: 'LEAVE', label: 'Leave' },
  { value: 'PERMISSION', label: 'Permission' },
  { value: 'ATTENDANCE_CORRECTION', label: 'Attendance Correction' },
  { value: 'HALFDAY', label: 'Half Day' }
];

const handleAssignChange = (e) => {
  console.log("lskj", e)
  const { name, value } = e.target;
  setFormValue(prev => ({ ...prev, [name]: value }));
  props.setMonthYear(prev => ({ ...prev, [name]: value }));
};

  const requestSearchEmployeeFilter = (val) => {

    setSearchValEmployeeFilter(val);
    dispatch(set_search_company_based_employee([]));

    if (!val) {
      return
    }

    let data = {

      searchString: val
    }



    dispatch(
      get_search_company_based_employee(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );



  };
  const handleChangeEmployeeName = (val) => {
    setValue(val)
    if (val?.length > 0) {
      setUserSelectError('');

    }

  }

  // const [date, setdate] = React.useState(new Date());
  // const [count,SetCount] =useState("");
  const { filter = { brand: null, category: null },
    setFilter = () => { } } = props;

  const {
    attendanceReducer: { getLocationBasedEmployee, searchLocationBasedEmployee }
  } = useSelector((state) => state);

  const brandSearch = (newvalue, name) => {
    setFilter({ ...filter, [name]: newvalue });
  };



  useEffect(() => {
    if(props.reportType === 'releivedEmp'){
      let data2 = {
        searchString: "",
        type:'releivedEmp'
      }
      dispatch(getEmpbasecompanyFilterAction(data2))

    }  
  }, [props.reportType]);

  useEffect(() => {
    if (props.shouldFetchData) {  
      const data1 = { searchString: "" };
      dispatch(getEmpbasecompanyFilterAction(data1));
    }
  }, [props.shouldFetchData]);



  // useEffect(() => {
  //   dispatch(getEmpbasecompanyAction())
  // }, [])



  // const clearButton = () => {

  //   // setFormValue({ brand: '', category: '', location_id: 'null', payment_type: '', max_price: '', min_price: '' })
  // }


  const clearButton = () => {

    const currentDate = new Date();
    props.setDate(currentDate);
    setNewValue('')
    // setFiltereddata([])
    // setAllData('')


  };

  const onKeyDown = (e) => {
    e.preventDefault();
  };

  const handleClearButtonClick = () => {
    props.clearButton();
    setValue([]);
  };

    const [rangeOption, setRangeOption] = useState(null);
  
    const rangeOptions = ['Weekly','Monthly','Quarterly','Half-Yearly','Yearly'];
  
    console.log(rangeOption,'rangeOption')

console.log("propdhg",props.stocklocation);

  return (
    <>
      {/* <div> */}
      {/* <Grid 
       justifyContent={"right"}
       display="flex"
       > */}
      {/* <IconButton
        id="fade-button"
        onClick={()=>props.handleClose(true)}
      > */}
      {/* <Badge color='secondary' badgeContent={props.count}> */}
      <Tooltip placement='top' title='Filter'>
        <IconButton>
          <FilterAlt sx={{ color: '#757575', fontSize: 25 }} onClick={() => props.handleClose(true,"close")} />
        </IconButton>
      </Tooltip>
      {/* </Badge> */}
      {/* </IconButton> */}
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false,"close")}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      >
        <Card sx={style}>
          <div style={{ marginLeft: "15px" }}>
            <IconButton aria-label="close" onClick={() => props.handleClose(false,"close")}>
              <CloseIcon />

            </IconButton>
          </div>

          <Grid container style={{ display: 'flex', flexDirection: 'row', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
            {props.PaymentReport && (
              <>
                 {props.type === 'report' && (
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <Autocomplete
                      options={rangeOptions}
                      value={props.dateRange === null ? props.dateRange : props.dateRange}
                      onChange={(event, newValue) => {
                        console.log(newValue, 'newValuesds');
                        setRangeOption(newValue);
  
                        if (newValue === 'Weekly') {
                          const startOfWeek = moment().startOf('week');
                          const endOfWeek = moment().endOf('week');
                          props.handleChange({
                            target: {
                              value: startOfWeek,
                              name: 'dateRange',
                              value1: endOfWeek,
                              value2: newValue
                            }
                          });
                        } else if (newValue === 'Monthly') {
                          const startOfMonth = moment().startOf('month');
                          const endOfMonth = moment().endOf('month');
                          props.handleChange({
                            target: {
                              value: startOfMonth,
                              name: 'dateRange',
                              value1: endOfMonth,
                              value2: newValue
                            }
                          });
                        } else if (newValue === 'Quarterly') {
                          const startOfQuarter = moment().subtract(2, 'months').startOf('month'); // 3 months including current
                          const endOfQuarter = moment().endOf('month');
                          props.handleChange({
                            target: {
                              value: startOfQuarter,
                              name: 'dateRange',
                              value1: endOfQuarter,
                              value2: newValue
                            }
                          });
                        } else if (newValue === 'Half-Yearly') {
                          const startOfHalfYear = moment().subtract(5, 'months').startOf('month'); // 6 months including current
                          const endOfHalfYear = moment().endOf('month');
                          props.handleChange({
                            target: {
                              value: startOfHalfYear,
                              name: 'dateRange',
                              value1: endOfHalfYear,
                              value2: newValue
                            }
                          });
                        } else if (newValue === 'Yearly') {
                          const startOfYear = moment().subtract(11, 'months').startOf('month'); // 12 months including current
                          const endOfYear = moment().endOf('month');
                          props.handleChange({
                            target: {
                              value: startOfYear,
                              name: 'dateRange',
                              value1: endOfYear,
                              value2: newValue
                            }
                          });
                        }
                      }}
  
                      renderInput={(params) => (
                        <TextField {...params} label="Select Range" fullWidth variant="outlined" />
                      )}
                    />
                  </Grid>)}

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture
                      name='from'
                      label='From Date'
                      inputVariant='outlined'
                      format='DD/MM/YYYY'
                      // error={error}
                       value={toMomentOrNull(props.from ? dayjs(props.from) : null)}
                                        onChange={(dates) => {
                                          handleChange({
                                            target: { value: dates ? getDateTimeFormat(dates.$d) : null, name: 'from' },
                                          })
                                        }
                                        }
                      // value={props.from}
                      // onChange={(date) =>
                      //   props.handleChange({
                      //     target: { value: date, name: 'from' },
                      //   })
                      // }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture={props.type !== "request" && props.type !== "profitLoss" ? true : false}
                      name='to'
                      label='To Date'
                      inputVariant='outlined'
                      //  format="DD/MM/yyyy"
                      format='DD/MM/YYYY'
                      value={toMomentOrNull(props.to)}
                      onChange={(date) =>
                        props.handleChange({
                          target: { value: date, name: 'to' },
                        })
                      }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            {props.fromDate && 
            <>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture
                      name='date'
                      label='Date'
                      inputVariant='outlined'
                      format='DD/MM/YYYY'
                      // error={error}
                      value={toMomentOrNull(props.date)}
                      onChange={(date) =>
                        props.handleChange({
                          target: { value: date, name: 'Date' },
                        })
                      }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>
            </>
            }
            {props.fromTo && (
              <>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture={props.type !== "request" && props.type !== "profitLoss" ? true : false}
                      name='from'
                      label='From Date'
                      inputVariant='outlined'
                      format='DD/MM/YYYY'
                      // error={error}
                      value={toMomentOrNull(props.from)}
                      onChange={(date) =>
                        props.handleChange({
                          target: { value: date, name: 'from' },
                        })
                      }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture={props.type !== "request" && props.type !== "profitLoss" && props.type !== 'scrapLotReport' ? true : false}
                      name='to'
                      label='To Date'
                      inputVariant='outlined'
                      //  format="DD/MM/yyyy"
                      format='DD/MM/YYYY'
                      value={toMomentOrNull(props.to)}
                      onChange={(date) =>
                        props.handleChange({
                          target: { value: date, name: 'to' },
                        })
                      }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>
                {
                  !props.noEmpFilter && 
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <FormControl fullWidth variant='filled'>
                      <CommonUserAutoComplete
                        searchVal={searchValEmployeeFilter}
                        requestSearch={requestSearchEmployeeFilter}
                        value={value}
                        // error={formErrors.empName}
                        setValue={handleChangeEmployeeName}
                        type={getCompanyBasedEmployeeFilter}
                        searchType={searchCompanyBasedEmployeeFilter}
                        selectedAll={selectedAll}
                        setSelectedAll={setSelectedAll}

                      />

                    </FormControl>
                  </Grid>
                }

                {props.type === 'request' && props.pageType !== 'cashinhand' && (
                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <Autocomplete
                      id="request-type-autocomplete"
                      options={leaveOptions}
                      getOptionLabel={(option) => option.label}
                      name="requestType"
                      value={leaveOptions.find(opt => opt.value === formValue.requestType) || null}
                      setValue={handleChangeEmployeeName}
                      onChange={(event, newValue) => {
                        handleAssignChange({
                          target: {
                            name: "requestType",
                            value: newValue ? newValue.value : ""
                          }
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Request Type"
                          fullWidth
                          variant="filled"
                        />
                      )}
                      ListboxProps={{ style: { maxHeight: "300px", overflowY: "auto" } }}
                    />
                  </Grid>)}

                {
                  props.locationFilter &&
                  <>
                    <Grid
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <FormControl fullWidth variant='filled'>
                        <InputLabel id='demo-multiple-name-label'>
                          Select Location
                        </InputLabel>
                        <Select
                          name='location'
                          multiple={props.stocklocation.length > 1}
                          value={
                            props.stocklocation.length === 1
                              ? [props.stocklocation[0].location_id]
                              : props.monthYear.location
                          }
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                overflowY: 'auto',
                              },
                            },
                          }}
                          onChange={(e) => {
                            props.onLocationchange(e)
                          }}
                          renderValue={(selected) => {
                            const selectedNames = selected.map((value) => {
                              const locate = props.stocklocation.find(
                                (emp) => emp.location_id === value
                              );
                              return locate ? locate.location_name : "All Locations"; 
                            });

                            let displayText = "";

                            // CASE 1: "All Locations" option selected (value === "")
                            if (selected.includes("")) {
                              displayText =
                                props.stocklocation.length > 1
                                  ? "All Locations"
                                  : props.stocklocation[0]?.location_name;
                            }
                            // CASE 2: Only ONE location selected
                            else if (selected.length === 1) {
                              displayText = selectedNames[0] || "";
                            }
                            // CASE 3: Two selected → show both
                            else if (selected.length === 2) {
                              displayText = selectedNames.join(", ");
                            }
                            // CASE 4: More than two → show first two + "..."
                            else {
                              displayText = `${selectedNames.slice(0, 2).join(", ")} ...`;
                            }

                          return (
                            <Stack gap={1} direction="row" flexWrap="wrap">
                              {selectedNames.length > 0 ? (
                                selectedNames.map((name, index) => (
                                  <Chip
                                    key={index}
                                    label={name}
                                    onDelete={() => {
                                      const updatedList = selected.filter((_, i) => i !== index);  // FIX
                                      props.handleChange({
                                        target: { name: "location", value: updatedList },
                                      });
                                    }}

                                    deleteIcon={
                                      <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                    }
                                  />
                                ))
                              ) : (
                                <Chip
                                  label="All Locations"
                                  onDelete={() => {
                                    props.handleChange({
                                      target: { name: "location", value: [] },
                                    });
                                  }}
                                  deleteIcon={
                                    <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                  }
                                />
                              )}
                            </Stack>
                          );
                          }}
                        >
                          {props.stocklocation.length > 1 && (
                            <MenuItem value=''>All Location</MenuItem>
                          )}
                          {props.stocklocation.map((m) => (
                            <MenuItem
                              key={m.location_id}
                              value={m.location_id}
                              disabled={props.monthYear.location.includes('')}
                            >
                              {m.location_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      display={'flex'}
                      size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                      }}>
                      <FormControl fullWidth variant='filled'>
                        <InputLabel id='demo-multiple-name-label'>
                          Select Department
                        </InputLabel>
                        <Select
                          sx={{ minHeight: '65px' }}
                          name='department'
                          multiple
                          value={props.monthYear.department}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 200,
                                overflowY: 'auto',
                              },
                            },
                          }}
                          onChange={(e) => {
                            console.log(e.target.value, 'etarget');
                            // props.onLocationchange(e)
                            props.handleChange({
                              target: { name: 'department', value: e.target.value },
                            });
                          }}
                          renderValue={(selected) => {
                            return (
                              <Stack gap={1} direction='row' flexWrap='wrap'>
                                {selected.includes('') ? (
                                  <Chip
                                    key=''
                                    label='All Department'
                                    onDelete={() => {
                                      // setSelectedDepartment([]);
                                      props.handleChange({
                                        target: { name: 'department', value: [] },
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
                                  />
                                ) : (
                                  selected.map((value) => {
                                    const locate = props.departmentList.find(
                                      (emp) => emp.department === value,
                                    );
                                    return (
                                      <Chip
                                        key={value}
                                        label={locate ? locate.department : ''}
                                        onDelete={() => {
                                          // setSelectedDepartment(
                                          //   selectedDepartment.filter(
                                          //     (item) => item !== value,
                                          //   ),
                                          // );
                                          props.handleChange({
                                            target: {
                                              name: 'department',
                                              value: props.monthYear.department.filter(
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
                          <MenuItem value=''>All Department</MenuItem>
                          {props.departmentList.map((m) => (
                            <MenuItem
                              key={m.department}
                              value={m.department}
                              disabled={props.monthYear.department.includes('')}
                            >
                              {m.department}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                }
              </>
            )}


            {

              props.locationOnlyFilter &&

              (
                <>

<Grid
  size={{
    lg: 12,
    md: 12,
    sm: 12,
    xs: 12
  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture={props.type !== 'ReleivingEmployee' ? true : false}
                      name='from'
                      label='From Date'
                      inputVariant='outlined'
                      format='DD/MM/YYYY'
                      // error={error}
                      value={toMomentOrNull(props.from)}
                      onChange={(date) =>
                        props.handleChange({
                          target: { value: date, name: 'from' },
                        })
                      }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      disableFuture={props.type !== "request" && props.type !== "profitLoss" && props.type !== 'ReleivingEmployee' ? true : false}
                      name='to'
                      label='To Date'
                      inputVariant='outlined'
                      //  format="DD/MM/yyyy"
                      format='DD/MM/YYYY'
                      value={toMomentOrNull(props.to)}
                      onChange={(date) =>
                        props.handleChange({
                          target: { value: date, name: 'to' },
                        })
                      }
                      fullWidth={true}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled', onKeyDown: onKeyDown } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                <FormControl fullWidth variant='filled' required>
                  <InputLabel id='demo-multiple-name-label'>
                    Select Location
                  </InputLabel>
                      <Select
                        name='location'
                          multiple={props.stocklocation.length > 1}
                          value={
                            props.stocklocation.length === 1
                              ? [props.stocklocation[0].location_id]
                              : props.monthYear.location
                          }
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                              overflowY: 'auto',
                            },
                          },
                        }}
                        onChange={(e) => {
                          props.onLocationchange(e)
                        }}
                        renderValue={(selected) => {
                          // Map selected IDs to their names
                          const selectedNames = selected.map((value) => {
                            const locate = props.stocklocation.find(
                              (emp) => emp.location_id === value
                            );
                            return locate ? locate.location_name : "All Locations"; 
                          });

                          let displayText = "";

                          // CASE 1: "All Locations" option selected (value === "")
                          if (selected.includes("")) {
                            displayText =
                              props.stocklocation.length > 1
                                ? "All Locations"
                                : props.stocklocation[0]?.location_name;
                          }
                          // CASE 2: Only ONE location selected
                          else if (selected.length === 1) {
                            displayText = selectedNames[0] || "";
                          }
                          // CASE 3: Two selected → show both
                          else if (selected.length === 2) {
                            displayText = selectedNames.join(", ");
                          }
                          // CASE 4: More than two → show first two + "..."
                          else {
                            displayText = `${selectedNames.slice(0, 2).join(", ")} ...`;
                          }

                          return (
                            <Stack gap={1} direction="row" flexWrap="wrap">
                              {selectedNames.length > 0 ? (
                                selectedNames.map((name, index) => (
                                  <Chip
                                    key={index}
                                    label={name}
                                    onDelete={() => {
                                      const updatedList = selected.filter((_, i) => i !== index);  // FIX
                                      props.handleChange({
                                        target: { name: "location", value: updatedList },
                                      });
                                    }}
                                    deleteIcon={
                                      <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                    }
                                  />
                                ))
                              ) : (
                                <Chip
                                  label="All Locations"
                                  onDelete={() => {
                                    props.handleChange({
                                      target: { name: "location", value: [] },
                                    });
                                  }}
                                  deleteIcon={
                                    <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                  }
                                />
                              )}
                            </Stack>
                          );

                        }}

                      >
                {props.stocklocation.length > 1 && (
                  <MenuItem value=''>All Location</MenuItem>
                )}
                    {props.stocklocation.map((m) => (
                      <MenuItem
                        key={m.location_id}
                        value={m.location_id}
                        disabled={props.monthYear.location.includes('')}
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
                  <FormControl fullWidth variant='filled'>
                    <CommonUserAutoComplete
                      searchVal={searchValEmployeeFilter}
                      requestSearch={requestSearchEmployeeFilter}
                      value={value}
                      // error={formErrors.empName}
                      setValue={handleChangeEmployeeName}
                      type={getCompanyBasedEmployeeFilter}
                      searchType={searchCompanyBasedEmployeeFilter}
                      selectedAll={selectedAll}
                      setSelectedAll={setSelectedAll}

                    />

                  </FormControl>
                </Grid>

                </>
              )

              
         

            }
            {
              props.userFilter && (
                <>


                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        // disablePast
                        name='month_year'
                        views={['month', 'year']}
                        format='MMMM/YYYY'
                        label={
                          <>
                            Year and Month
                            {/* <span style={{color: 'red'}}> * </span> */}
                          </>
                        }

                        value={toMomentOrNull(props.month_year)}
                        onChange={(dates) => {
                          props.handleChange({
                            target: { value: dates, name: 'month_year' },
                          });
                        }}
                        fullWidth={true}
                        slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid
                    size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                    }}>
                    <FormControl variant='outlined' fullWidth>

                      {/* <CommonUserAutoCompleteForSingleUser
                    searchVal={searchValEmployeeFilter}
                    setSearchValEmployeeFilter={setSearchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    setValue={handleChangeEmployeeName}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}

                    error={userSelectError}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}
                    labelName = "Select Employee"
               
                  /> */}

                      <CommonUserAutoComplete
                        searchVal={searchValEmployeeFilter}
                        requestSearch={requestSearchEmployeeFilter}
                        value={value}
                        // error={formErrors.empName}
                        setValue={handleChangeEmployeeName}
                        type={getCompanyBasedEmployeeFilter}
                        searchType={searchCompanyBasedEmployeeFilter}
                        selectedAll={selectedAll}
                        setSelectedAll={setSelectedAll}

                      />
                    </FormControl>
                  </Grid>
                </>
              )
            }


            {
              props.employeeOnlyFilter && (
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                <FormControl variant='outlined' fullWidth>


                  <CommonUserAutoComplete
                    searchVal={searchValEmployeeFilter}
                    requestSearch={requestSearchEmployeeFilter}
                    value={value}
                    // error={formErrors.empName}
                    setValue={handleChangeEmployeeName}
                    type={getCompanyBasedEmployeeFilter}
                    searchType={searchCompanyBasedEmployeeFilter}
                    selectedAll={selectedAll}
                    setSelectedAll={setSelectedAll}

                  />
                </FormControl>
              </Grid>
              )

            }
            {props.financialYear && (
              <>
                <Grid
                  style={{ margin: '20px 0px' }}
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  {props.fromTo && (
                    <Divider style={{ margin: '30px 0px' }}>
                      <Chip label='OR' />
                    </Divider>
                  )}
                  <Autocomplete
                    fullWidth
                    disablePortal
                    value={props.financialYearData.find(
                      (item) => item.from === props.from.getFullYear(),
                    )}
                    options={props.financialYearData}
                    getOptionLabel={(item) => `FY ${item.from}-${item.to}`}
                    ListboxProps={{
                      style: {
                        maxHeight: "170px",
                      },
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label='Choose FY' variant='filled' />
                    )}
                    onChange={(e, newValue) => {
                      let fromDate = new Date(newValue.from.toString(), 3, 1);
                      let toDate = new Date(newValue.to.toString(), 2, 31);
                      let fyData = {
                        from: fromDate,
                        to: toDate,
                      };
                      props.handleFY(fyData);
                    }}
                  />
                </Grid>
              </>
            )}



            {props.Datefilter && (
              <>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='Filter by date'
                      // format="yyyy/MM/DD"
                      format='DD/MM/YYYY'
                      value={toMomentOrNull(props.value)}
                      inputVariant='contained'
                      onChange={(e, v) => {
                        props.handleDateChange(e._d);
                      }}
                      slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            {props.catabrand && (
              <>
                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Autocomplete
                    fullWidth
                    disablePortal
                    id='combo-box-demo'
                    options={_.uniqBy(props.product, 'category')}
                    getOptionLabel={(option) => option.category}
                    onChange={(e, newvalue) =>
                      brandSearch(
                        newvalue !== null ? newvalue.category : null,
                        'category',
                      )
                    }
                    value={{
                      category: filter.category === null ? '' : filter.category,
                    }}
                    renderInput={(params) => (
                      <TextField
                        variant='filled'
                        {...params}
                        label='Category'
                        name='category'
                        style={{ backgroundColor: 'white', borderRadius: '5px' }}
                      />
                    )}
                  />
                </Grid>



                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Autocomplete
                    fullWidth
                    disablePortal
                    id='combo-box-demo'
                    // options={this.props.product.filter(d=>d.brand)}
                    options={_.uniqBy(props.product, 'brand')}
                    getOptionLabel={(option) => option.brand}
                    value={{ brand: filter.brand === null ? '' : filter.brand }}
                    onChange={(e, newvalue) =>
                      brandSearch(
                        newvalue !== null ? newvalue.brand : null,
                        'brand',
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        variant='filled'
                        {...params}
                        label='Brand'
                        name='brand'
                        style={{ backgroundColor: 'white', borderRadius: '5px' }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}


            {props.locat && (
              <>

                <Autocomplete
                  value={
                    _.uniqBy(props.stocklocation, 'location_name').filter(
                      (f) => f.location_id === formValue.location_id,
                    )?.[0] || {}
                  }
                  onChange={(event, newValue) => {
                    setFormValue({
                      ...formValue,
                      location_id:
                        newValue === null ? 'null' : newValue.location_id,
                    });
                  }}
                  disablePortal
                  name='location_id'
                  id='combo-box-demo'
                  options={_.uniqBy(props.stocklocation, 'location_name').map(
                    (f) => {
                      return f;
                    },
                  )}
                  getOptionLabel={(option) => option.location_name || ''}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Location'
                      variant='filled'
                      style={{ backgroundColor: 'white', borderRadius: '5px' }}
                    />
                  )}
                />




                <Grid>
                  <Autocomplete
                    value={
                      _.uniqBy(props.list_payment_type, 'payment_type').filter(
                        (f) => f.payment_type === formValue.payment_type,
                      )?.[0] || {}
                    }
                    onChange={(event, newValue) => {
                      setFormValue({
                        ...formValue,
                        payment_type:
                          newValue === null ? '' : newValue.payment_type,
                      });
                    }}
                    disablePortal
                    name='payment_mode'
                    id='combo-box-demo'
                    options={_.uniqBy(
                      props.list_payment_type,
                      'payment_type',
                    ).map((f) => {
                      return f;
                    })}
                    getOptionLabel={(option) => option.payment_type || ''}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='payment mode'
                        variant='filled'
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {props.Outstand && (
              <>
                <Autocomplete
                  disablePortal
                  fullWidth
                  id='combo-box-demo'
                  // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
                  // options={Array.from(
                  //   new Set(allData.map((a) => a.customerName))
                  // ).map((name) => {
                  //   return allData.find((a) => a.customerName === name);
                  // })}
                  options={_.uniqBy(props.allData, 'customerName')}
                  // options={allData.filter((d)=> d.customerName)}
                  getOptionLabel={(option) => option.customerName}
                  onChange={(e, newvalue) => props.partySearch(newvalue)}
                  value={{ customerName: props.party }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      label='User'
                      style={{ backgroundColor: 'white', borderRadius: '5px' }}
                    />
                  )}
                />

                <Autocomplete
                  disablePortal
                  fullWidth
                  id='combo-box-demo'
                  // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
                  // options={Array.from(
                  //   new Set(allData.map((a) => a.companyName))
                  // ).map((name) => {
                  //   return allData.find((a) => a.companyName === name );
                  // })}
                  //  options={allData.filter((d) =>d.companyName)}
                  options={_.uniqBy(props.allData, 'companyName')}
                  getOptionLabel={(option) => option.companyName}
                  onChange={(e, newvalue) => props.companySearch(newvalue)}
                  value={{ companyName: props.company }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      label='Party'
                      style={{ backgroundColor: 'white', borderRadius: '5px' }}
                    />
                  )}
                />


                <Autocomplete
                  disablePortal
                  fullWidth
                  id='combo-box-demo'
                  options={['All', '7 Days', '15 Days', '30 Days', '45 Days']}
                  //getOptionLabel={(option) => option.companyName}
                  onChange={(e, newvalue) => props.datewise(newvalue)}
                  value={props.datewisefilter}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      label='Due Days'
                      style={{ backgroundColor: 'white', borderRadius: '5px' }}
                    />
                  )}
                />


                <Autocomplete
                  disablePortal
                  fullWidth
                  id='combo-box-demo'
                  options={['Credit Days', 'Credit values']}
                  //getOptionLabel={(option) => option.companyName}
                  defaultValue={'Credit Days'}
                  onChange={(e, newvalue) => props.creditdatewise(newvalue)}
                  value={props.creditdatewisefilter}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant='filled'
                      label='Credit Days'
                      style={{ backgroundColor: 'white', borderRadius: '5px' }}
                    />
                  )}
                />

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <Stack spacing={3}>
                      <DatePicker
                        variant='outlined'
                        label='Filter Date'
                        format='DD/MM/YYYY'
                        // inputFormat="MM/dd/yyyy"
                        // inputFormat='DD/MM/yyyy'
                        value={toMomentOrNull(props.value)}
                        // onChange={handleChange}
                        onChange={(e, v) => {
                          props.setdatevalue(e);
                          // props.handleChange(e)
                        }}
                        slotProps={{ textField: { variant: 'filled' } }}
                      />
                    </Stack>
                  </LocalizationProvider>
                </Grid>

              </>
            )}

            {props.Allfil && (
              <>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                  <Autocomplete
                    // multiple
                    disablePortal
                    id='combo-box-demo'
                    fullWidth
                    // options={allData.filter((val,id,array) => array.indexOf(val) == id)}
                    // options={Array.from(
                    //   new Set(allData.map((a) => a.companyName))
                    // ).map((name) => {
                    //   return allData.find((a) => a.companyName === name );
                    // })}
                    options={props.filter_date.map((f) => f.first_name)}
                    onChange={(e, newValue) => setNewValue(newValue)}
                    value={newValue !== '' ? newValue || [] : []}
                    // value={{ companyName: party || '' }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant='filled'
                        label='All '
                      // style={{
                      //   backgroundColor: 'white',
                      //   borderRadius: '5px',

                      // }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}




            {/* <Box> */}
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container spacing={7} display='flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
                {/* <Box> */}
                <Grid>
                  <Button
                    onClick={handleClearButtonClick}
                    // sx={button}
                    variant='contained'
                    color='secondary'
                  >
                    Clear
                  </Button>
                  {/* </Box> */}
                </Grid>

                {/* <Grid size={{ xs: 3, sm: 6, md: 6, lg: 6 }}> */}
                <Grid>
                  <Button
                    onClick={() =>
                      props.ApplyButton(
                        value
                        // filter.brand,
                        // filter.category,
                        // newValue,
                        // formValue.location_id,
                        // formValue.payment_type,
                      )
                    }
                    // sx={button}
                    variant='contained'
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* </Box> */}

          {/* <Button onClick={()=>props.clearButton()} sx={button} variant="contained" color="secondary">
        Clear
      </Button>

          <Button onClick={()=>props.ApplyButton(filter.brand,filter.category,newValue,formValue.location_id,formValue.payment_type)} sx={button} variant="contained">
        Apply
      </Button> */}

          {/* <Button onClick={()=>props.ApplyButton()} sx={button} variant="contained">
        Apply
      </Button> */}
        </Card>
      </Modal>
      {/* </Grid> */}
      {/* </div>       */}
    </>
  );
}

export default CommonFilter;