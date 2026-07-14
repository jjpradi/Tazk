import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  Button,
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  Card,
  IconButton,
  Checkbox,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  RadioGroup,
  Radio,
  Chip,
  Stack,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { headerStyle, cellStyle } from 'utils/pageSize';
import {
  listSelectUserAction,
  createShiftscheduleAction,
  listScheduleAction,
  updateShiftscheduleAction,
  getSearchShiftlistAction,
  listEmployeeCategoryAction,
} from 'redux/actions/shifts.actions';
import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';
import { get_searchUserRoleAction } from 'redux/actions/role_actions';
import moment from 'moment';
import { capitalize } from 'lodash';
import {
  getCategoryBaseEmpAction,
  getCategoryBaseEmpFilterAction,
  get_search_category_based_employee,
  set_search_category_based_employee,
} from 'redux/actions/attendance_actions';
import CommonToolTip from 'components/ToolTip';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import InfoDialog from './dialog';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';
import {
  getSinglePageScrollLayoutSx,
  singlePageScrollContentSx,
} from 'utils/pageScrollLayout';

export default function ScheduleShift(props) {
  const tempEdit = useRef(null);
  const date = new Date();
  const dispatch = useDispatch();
  const firstDay = new Date(date.getFullYear(), date.getMonth());
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  const {
    ShiftsReducer: {
      userwiseselect,
      getschedule,
      search_shiftlist,
      list_department,
      getShiftList,
      employeeCategoryList,
    },
    roleReducer: { shift_role },
    attendanceReducer: {
      get_empbasecompany,
      getDeptBaseEmp,
      getCategoryBaseEmp,
      getDepartmentBasedEmployeeFilter,
      searchDepartmentBasedEmployee,
      getCategoryBasedEmployeeFilter,
      searchCategoryBasedEmployee,
    },
    stockLocationReducer: { stocklocation },
  } = useSelector((state) => state);

  const [value, setValue] = useState([]);

  const [formValues, setFormValues] = useState({
    month_year: null,
    overwrite: 0,
    renewal: '0',
    location: [''],
    employee: [''],
    month_date_wise: 'MONTH_WISE',
    startDate: null,
    endDate: null,
    shift_id: null,
  });

  const [role, setRole] = useState([]);
  const [department, setDepartment] = useState([]);
  const [category, setCategory] = useState(['AllCategory']);
  const [tableData, setTableData] = useState([]);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoData, setInfoData] = useState([]);
  const [autoRenewal, setAutoRenewal] = useState([]);
  const [autoRenewalShift, setAutoRenewalShift] = useState([]);
  const [alreadyInShift, setAlreadyInShift] = useState([]);

  const [formErrors, setFormErrors] = useState({
    month_year: '',
    location: null,
    employee: null,
    shift_id: null,
  });
  const [deleteEmp, setDeleteEmp] = useState([]);
  const [scheduledEmp, setScheduledEmp] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [selectedAll, setSelectedAll] = useState(false);
  const [allEmployeesSelected, setAllEmployeesSelected] = useState(true);
  const [load, setLoad] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conflictData, setConflictData] = useState(new Map());
  const processTimerRef = useRef(null);
  const [leftPage, setLeftPage] = useState(0);
  const LEFT_PAGE_SIZE = 100;

  // --- Initial data loading ---
  useEffect(() => {
    dispatch(listEmployeeCategoryAction({ type: 'LIST_CATEGORY' }, () => {}));
  }, []);

  useEffect(() => {
    const body = {
      searchString: '',
      employee_id: commoncookie,
      headerLocationId: headerLocationId,
      numPerPage: 20,
      pageCount: 0,
    };
    !shift_role.length &&
      dispatch(get_searchUserRoleAction(body, setModalTypeHandler, setLoaderStatusHandler));
    !stocklocation.length &&
      dispatch(listStockLocationAction(commoncookie, headerLocationId));
    !search_shiftlist.length &&
      dispatch(getSearchShiftlistAction(body, context.setModalTypeHandler, context.setLoaderStatusHandler));
  }, []);

  // --- Filter employees on category/department/role change ---
  useEffect(() => {
    if (employeeCategoryList.length > 0) {
      let allCategory = employeeCategoryList.map((d) => d.category_name);
      let data = {
        category:
          category.includes('AllCategory') || category.length === 0
            ? allCategory
            : category,
        searchString: '',
        department:
          department.length > 0
            ? department
            : list_department.map((d) => d.department),
        role: role,
      };
      dispatch(
        getCategoryBaseEmpFilterAction(data, () => {
          setLoad(true);
          setLeftPage(0);
        }),
      );
    }
  }, [category, employeeCategoryList, department, role]);

  // --- Edit mode: pre-fill form ---
  useEffect(() => {
    if (Object.keys(props.editData).length > 0) {
      let schedule = props.editData;
      let emp_data = getschedule.employeelist
        ?.filter((i) => i.schedule_id === props.editData.id)
        .map((i) => i.emp_id);

      setFormValues({
        ...formValues,
        shift_id: schedule.shift_id,
        month_year: moment(schedule.month_year),
        overwrite: schedule.overwrite,
        renewal: schedule.renewal,
        month_date_wise: schedule.month_date_wise,
        startDate: moment(schedule.startDate),
        endDate: moment(schedule.endDate),
        employee: emp_data,
      });
      setSelectedAll(false);
      setAllEmployeesSelected(false);
      setScheduledEmp(emp_data);
      setRole(schedule.role_type !== null ? JSON.parse(schedule.role_type) : []);
      setTableData(
        getschedule.employeelist
          ?.filter((i) => i.schedule_id === props.editData.id)
          .map((item) => ({
            ...item,
            employee_id: item.emp_id,
          })),
      );
    }
  }, [props.editData]);

  // --- Edit mode: set value from filter results ---
  useEffect(() => {
    if (Object.keys(props.editData).length > 0 && load) {
      let emp_data = getschedule.employeelist
        ?.filter((i) => i.schedule_id === props.editData.id)
        .map((i) => i.emp_id);
      let filterData = getCategoryBasedEmployeeFilter.filter((e) =>
        emp_data.includes(e.employee_id),
      );
      setValue(filterData);
    }
  }, [props.editData, load]);

  // --- Track deleted employees (edit mode) ---
  useEffect(() => {
    let a = scheduledEmp;
    let c = value.map((d) => d?.employee_id);
    let mismatchedValues = [];
    a?.forEach((element) => {
      if (!c?.includes(element)) {
        mismatchedValues.push(element);
      }
    });
    setDeleteEmp(mismatchedValues);
  }, [value]);

  // --- Auto-process: debounced conflict check ---
  useEffect(() => {
    if (processTimerRef.current) clearTimeout(processTimerRef.current);

    const empIds = value.map((d) => d.employee_id);
    if (!formValues.shift_id || empIds.length === 0 || !formValues.startDate || !formValues.endDate) {
      setTableData([]);
      setConflictData(new Map());
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    processTimerRef.current = setTimeout(() => {
      let allCategory = employeeCategoryList.map((d) => d.category_name);
      let body = {
        role_id: role,
        emp_id: empIds,
        department: department,
        category:
          category.includes('AllCategory') || category.length === 0
            ? allCategory
            : category,
        location: formValues.location.every((v) => v === '') ? 'null' : formValues.location,
        startDate: formValues.startDate?.format('YYYY-MM-DD'),
        endDate: formValues.endDate?.format('YYYY-MM-DD'),
        shiftId: formValues.shift_id,
      };

      dispatch(
        listSelectUserAction(body, setModalTypeHandler, setLoaderStatusHandler, (data) => {
          const cMap = new Map();
          data.forEach((d) => {
            cMap.set(d.employee_id, {
              alreadyInShift: d.alreadyInShift || [],
              autoRenewal: d.autoRenewal || [],
            });
          });
          setConflictData(cMap);
          setAlreadyInShift(
            data
              .filter((f) => f.alreadyInShift.length && f.alreadyInShift[0]?.shift_name !== 'GenralShift')
              .map((i) => i.employee_id),
          );
          setAutoRenewalShift(data.filter((f) => f.autoRenewal.length).map((i) => i.employee_id));
          setTableData(data);
          setIsProcessing(false);
        }),
      );
    }, 500);

    return () => {
      if (processTimerRef.current) clearTimeout(processTimerRef.current);
    };
  }, [value, formValues.shift_id, formValues.startDate, formValues.endDate]);

  const [requiredFields] = useState(['shift_id']);

  // --- Form handlers ---
  const handleChange = (e) => {
    let { name, value } = e.target;
    validationHandler(name, value);

    if (name === 'month_year') {
      const d = value.format('YYYY-MM-DD');
      const startDate = moment(d).startOf('month');
      const endDate = moment(d).endOf('month');
      setFormValues({ ...formValues, startDate, endDate, [name]: value });
      return;
    }

    if (name === 'startDate') {
      setFormValues({ ...formValues, month_year: value, endDate: null, [name]: value });
      return;
    }

    setFormValues({ ...formValues, [name]: value });
  };

  const Change = (e) => {
    setFormValues({ ...formValues, renewal: e.target.value });
  };

  const handleCheck = (e) => {
    const click = e.target.checked ? 1 : 0;
    setFormValues({ ...formValues, overwrite: click });
  };

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;
    if (name === 'month_year') {
      if (value._isValid) {
        setFormErrors({ ...formErrors, month_year: null, shift_id: null });
      } else {
        setFormErrors({
          ...formErrors,
          month_year: 'Month - Year is Required!',
          shift_id: 'shift id is Required!',
        });
      }
    }
  };

  const handleDateWise = (e) => {
    const { value } = e.target;
    setFormValues({ ...formValues, month_date_wise: value });
    if (value === 'MONTH_WISE') {
      setFormErrors({ ...formErrors, startDate: null, endDate: null });
    } else {
      setFormErrors({ ...formErrors, month_year: null });
    }
  };

  const endDateRange = () => {
    if (!formValues.startDate) return { minDate: undefined, maxDate: undefined };
    const d = formValues.startDate.format('YYYY-MM-DD');
    return {
      minDate: moment(d),
      maxDate: moment(d).endOf('month'),
    };
  };

  const handleKeyDown = (e) => {
    e.preventDefault();
  };

  // --- Employee search ---
  const requestSearch = (val) => {
    setSearchVal(val);
    setLeftPage(0);
    dispatch(set_search_category_based_employee([]));
    if (!val) return;
    let allCategory = employeeCategoryList.map((d) => d.category_name);
    let data = {
      category:
        category.includes('AllCategory') || category.length === 0
          ? allCategory
          : category,
      department:
        department.length > 0
          ? department
          : list_department.map((d) => d.department),
      role: role,
      searchString: val,
    };
    dispatch(get_search_category_based_employee(data, setModalTypeHandler, setLoaderStatusHandler));
  };

  const cancelSearch = () => {
    setSearchVal('');
    dispatch(set_search_category_based_employee([]));
    let allCategory = employeeCategoryList.map((d) => d.category_name);
    let data = {
      category:
        category.includes('AllCategory') || category.length === 0
          ? allCategory
          : category,
      department:
        department.length > 0
          ? department
          : list_department.map((d) => d.department),
      role: role,
      searchString: '',
    };
    dispatch(get_search_category_based_employee(data, setModalTypeHandler, setLoaderStatusHandler));
  };

  // --- Employee selection handlers ---
  const fullDisplayList = searchVal ? searchCategoryBasedEmployee : getCategoryBasedEmployeeFilter;
  const totalLeftPages = Math.ceil(fullDisplayList.length / LEFT_PAGE_SIZE);
  const displayList = fullDisplayList.slice(leftPage * LEFT_PAGE_SIZE, (leftPage + 1) * LEFT_PAGE_SIZE);

  const isEmployeeSelected = useCallback(
    (empId) => value.some((v) => v.employee_id === empId),
    [value],
  );

  const handleToggleEmployee = (emp) => {
    if (isEmployeeSelected(emp.employee_id)) {
      setValue(value.filter((v) => v.employee_id !== emp.employee_id));
      setSelectedAll(false);
      setAllEmployeesSelected(false);
    } else {
      setValue([...value, emp]);
      if (value.length + 1 === displayList.length) {
        setSelectedAll(true);
      }
    }
    if (formErrors.employee) {
      setFormErrors({ ...formErrors, employee: null });
    }
  };

  const handleToggleAll = () => {
    if (selectedAll) {
      setValue([]);
      setSelectedAll(false);
      setAllEmployeesSelected(false);
    } else {
      if (formValues.shift_id && formValues.startDate && formValues.endDate) {
        let allCategory = employeeCategoryList.map((d) => d.category_name);
        let data = {
          role: role,
          category:
            category.includes('AllCategory') || category.length === 0
              ? allCategory
              : category,
          department:
            department.length > 0
              ? department
              : list_department.map((d) => d.department),
          searchString: '',
        };
        dispatch(
          getCategoryBaseEmpAction(data, (res) => {
            setValue(res);
            setSelectedAll(true);
            setAllEmployeesSelected(true);
          }),
        );
      } else {
        setValue(displayList);
        setSelectedAll(true);
        setAllEmployeesSelected(true);
      }
    }
  };

  const handleDeselectFromTable = (empId) => {
    setValue(value.filter((v) => v.employee_id !== empId));
    setSelectedAll(false);
    setAllEmployeesSelected(false);
  };

  // --- Shift time conflict check ---
  function isTimeBetween(startTimeStr, endTimeStr, givenTimeStr) {
    const today = new Date();
    const startTime = new Date(today.toDateString() + ' ' + startTimeStr);
    const endTime = new Date(today.toDateString() + ' ' + endTimeStr);
    const givenTime = new Date(today.toDateString() + ' ' + givenTimeStr);
    if (endTime <= startTime) {
      return givenTime >= startTime || givenTime <= endTime;
    }
    return startTime <= givenTime && givenTime <= endTime;
  }

  // --- Submit ---
  const handleSubmit = async () => {
    let isValid = true;
    let formErrorsObj = { ...formErrors };

    Object.keys(formValues).forEach((key) => {
      if (requiredFields.includes(key) && formValues[key] === null) {
        isValid = false;
        
        if (key === 'shift_id') {
          formErrorsObj[key] = 'Shift id is Required!';
        } else {
          formErrorsObj[key] = capitalize(key) + ' is Required!';
        }
      }
      if (formValues.month_date_wise === 'MONTH_WISE') {
        if (!formValues.month_year) {
          isValid = false;
          formErrorsObj.month_year = capitalize('month year') + ' is Required!';
        }
      } else {
        if (!formValues.startDate) {
          isValid = false;
          formErrorsObj.startDate = capitalize('Start Date') + ' is Required!';
        }
        if (!formValues.endDate) {
          isValid = false;
          formErrorsObj.endDate = capitalize('End Date') + ' is Required!';
        }
      }
    });

    let shiftTimeConflict = false;
    for (let t of tableData) {
      const shift_ids =
        Array.isArray(t.alreadyInShift) && t.alreadyInShift.length > 0
          ? t.alreadyInShift[0].shift_id
          : null;
      const selectedShift = search_shiftlist.find((j) => j.id === formValues.shift_id);
      if (shift_ids) {
        let assignedShifts = search_shiftlist.filter(
          (j) => shift_ids.includes(j.id + '') && j.id !== formValues.shift_id,
        );
        for (let s of assignedShifts) {
          const startTimeStr = s.start_shift_time;
          const endTimeStr = s.end_shift_time;
          const givenStartTimeStr = selectedShift.start_shift_time;
          const givenEndTimeStr = selectedShift.end_shift_time;
          if (
            isTimeBetween(startTimeStr, endTimeStr, givenStartTimeStr) ||
            isTimeBetween(startTimeStr, endTimeStr, givenEndTimeStr)
          ) {
            shiftTimeConflict = true;
            break;
          }
        }
      }
    }

    if (shiftTimeConflict) {
      dispatch(
        OpenalertActions({
          msg: 'Shift start and end time should not conflict with already assigned shift',
          severity: 'warning',
        }),
      );
      return;
    }

    setFormErrors(formErrorsObj);
    const empIds = value.map((d) => d.employee_id);
    const tempData = {
      ...formValues,
      employee: empIds,
      deleteEmployee: deleteEmp,
      tableData,
      shift_id: formValues.shift_id,
      location: JSON.stringify(formValues?.location),
      role_type: JSON.stringify(role),
      month_year: formValues.month_year?.format('YYYY-MM-DD'),
      startDate: formValues.startDate?.format('YYYY-MM-DD'),
      endDate: formValues.endDate?.format('YYYY-MM-DD'),
      year: new Date(formValues.month_year).getFullYear(),
      month: new Date(formValues.month_year).getMonth() + 1,
    };

    if (isValid) {
      if (Object.keys(props.editData).length > 0) {
        dispatch(
          updateShiftscheduleAction(
            props.editData.id,
            tempData,
            setModalTypeHandler,
            setLoaderStatusHandler,
            (response) => {
              if (response === 200) {
                const temp = {
                  pageCount: props.pageCount,
                  numPerPage: props.numPerPage,
                  shift_name: props.selectedShift,
                };
                dispatch(
                  listScheduleAction(null, temp, setModalTypeHandler, setLoaderStatusHandler, () => {}),
                );
                props.handleClose(false);
              }
            },
          ),
        );
      } else {
        dispatch(
          createShiftscheduleAction(
            tempData,
            setModalTypeHandler,
            setLoaderStatusHandler,
            (response) => {
              if (response === 200) {
                const temp = {
                  pageCount: 0,
                  numPerPage: 20,
                  shift_name: props.selectedShift,
                };
                dispatch(
                  listScheduleAction(null, temp, setModalTypeHandler, setLoaderStatusHandler, () => {}),
                );
                props.handleClose(false);
              }
            },
          ),
        );
      }
    } else {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }));
    }
  };

  // --- Conflict helper ---
  const getConflictInfo = (empId) => {
    const info = conflictData.get(empId);
    if (!info) return null;
    const hasConflict =
      info.alreadyInShift.length > 0 &&
      info.alreadyInShift[0]?.shift_name !== 'GenralShift';
    const hasAutoRenewal = info.autoRenewal.length > 0;
    if (!hasConflict && !hasAutoRenewal) return null;
    return { hasConflict, hasAutoRenewal, info };
  };

  const pageLayoutSx = getSinglePageScrollLayoutSx(75);

  // ===================== RENDER =====================
  return (
    <Card sx={{ ...pageLayoutSx, p: 2.5 }}>
      {/* --- HEADER --- */}
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ lg: 6, md: 6, sm: 6, xs: 6 }}>
          <Typography variant="h6">
            Shift Name :{' '}
            {search_shiftlist.find((s) => s.id === formValues?.shift_id)?.shift_name}
          </Typography>
          {props.editData.id && (
            <Typography variant="caption" color="text.secondary">
              Editing Schedule #{props.editData.id}
            </Typography>
          )}
        </Grid>
        <Grid display="flex" justifyContent="flex-end" size={{ lg: 6, md: 6, sm: 6, xs: 6 }}>
          <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
            <CloseIcon />
          </IconButton>
        </Grid>
        <Grid size={12}>
          <Divider />
        </Grid>
      </Grid>

      {/* --- CONTENT --- */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', pt: 1, pr: 1, overflow: 'hidden' }}>
        {/* --- TOP SETTINGS BAR --- */}
        <Grid container spacing={1} alignItems="center">
          {/* Month/Date toggle */}
          <Grid size={{ lg: 2.5, md: 3, sm: 12 }}>
            <Typography variant="h6">Month - Year</Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={formValues.month_date_wise}
                name="month_date_wise"
                onChange={handleDateWise}
              >
                <FormControlLabel value="MONTH_WISE" control={<Radio />} label="Month Wise" />
                <FormControlLabel value="DATE_WISE" control={<Radio />} label="Date Wise" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Date pickers */}
          {formValues.month_date_wise === 'MONTH_WISE' ? (
            <Grid size={{ lg: 2, md: 2.5, sm: 12 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  disablePast
                  name="month_year"
                  views={['month', 'year']}
                  format="MMMM/YYYY"
                  label="Year and Month"
                  value={toMomentOrNull(formValues.month_year)}
                  onChange={(dates) => handleChange({ target: { value: dates, name: 'month_year' } })}
                  slotProps={{
                    textField: {
                      onKeyDown: handleKeyDown,
                      required: true,
                      fullWidth: true,
                      variant: 'filled',
                      size: 'small',
                      error: !!formErrors.month_year,
                      helperText: formErrors.month_year ?? '',
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          ) : (
            <>
              <Grid size={{ lg: 1.75, md: 2, sm: 6 }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label="Start Date"
                    name="startDate"
                    value={toMomentOrNull(formValues.startDate)}
                    format="DD/MM/YYYY"
                    disablePast
                    onChange={(dates) => handleChange({ target: { value: dates, name: 'startDate' } })}
                    slotProps={{
                      textField: {
                        variant: 'filled',
                        size: 'small',
                        fullWidth: true,
                        error: !!formErrors.startDate,
                        helperText: formErrors.startDate ?? '',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ lg: 1.75, md: 2, sm: 6 }}>
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <DatePicker
                    label="End Date"
                    name="endDate"
                    value={toMomentOrNull(formValues.endDate)}
                    format="DD/MM/YYYY"
                    disablePast
                    onChange={(dates) => handleChange({ target: { value: dates, name: 'endDate' } })}
                    {...endDateRange()}
                    slotProps={{
                      textField: {
                        variant: 'filled',
                        size: 'small',
                        fullWidth: true,
                        error: !!formErrors.endDate,
                        helperText: formErrors.endDate ?? '',
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}

          {/* Shift select */}
          <Grid size={{ lg: 2, md: 2.5, sm: 12 }}>
            <FormControl fullWidth variant="filled" size="small">
              <InputLabel>
                Shifts <span style={{ color: 'red' }}>*</span>
              </InputLabel>
              <Select
                value={formValues?.shift_id === null ? '' : formValues?.shift_id}
                name="shift_id"
                onChange={(e) => {
                  handleChange({ target: { value: e.target.value, name: 'shift_id' } });
                  setFormErrors((prev) => ({
                    ...prev,
                    shift_id: e.target.value ? null : 'shift_id is Required!',
                  }));
                }}
                error={!!formErrors.shift_id}
                MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } } }}
              >
                {search_shiftlist.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.shift_name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.shift_id && (
                <FormHelperText sx={{ color: 'red' }}>{formErrors.shift_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Overwrite + Renewal */}
          <Grid size="auto" sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  name="overwrite"
                  checked={formValues.overwrite !== 0}
                  onChange={handleCheck}
                  size="small"
                />
              }
              label="Overwrite"
            />
            {formValues.month_date_wise === 'MONTH_WISE' && (
              <FormControl component="fieldset" sx={{ ml: 1 }}>
                <RadioGroup row value={formValues.renewal} name="renewal" onChange={Change}>
                  <FormControlLabel value="0" control={<Radio size="small" />} label="Monthly" />
                  <FormControlLabel value="1" control={<Radio size="small" />} label="Auto Renew" />
                </RadioGroup>
              </FormControl>
            )}
          </Grid>

          {/* Submit */}
          <Grid size="grow" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Button
              onClick={handleSubmit}
              disabled={value.length === 0 || isProcessing}
              variant="contained"
              color="secondary"
              size="small"
            >
              Submit
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        {/* --- TWO-PANEL BODY --- */}
        <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 2, overflow: 'hidden' }}>
          {/* ===== LEFT PANEL: Filters + Employee Checklist ===== */}
          <Box
            sx={{
              width: '40%',
              minWidth: 350,
              maxWidth: 500,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #e0e0e0',
              pr: 2,
              minHeight: 0,
            }}
          >
            {/* Filters */}
            <Grid container spacing={1.5} sx={{ mb: 1.5, flexShrink: 0 }}>
              <Grid size={6}>
                <FormControl variant="filled" fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    multiple
                    value={category}
                    onChange={(e) => {
                      let { value } = e.target;
                      if (value.includes('AllCategory') && !category.includes('AllCategory')) {
                        value = ['AllCategory'];
                      } else if (category.includes('AllCategory') && value.length > 1) {
                        value = value.filter((v) => v !== 'AllCategory');
                      }
                      setCategory(value);
                      setSelectedAll(false);
                      setAllEmployeesSelected(false);
                    }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } } }}
                    renderValue={(selected) => (
                      <Stack gap={0.5} direction="row" flexWrap="wrap">
                        {selected.includes('AllCategory') ? (
                          <Chip
                            size="small"
                            label="All Category"
                            onDelete={() => setCategory([])}
                            deleteIcon={<CancelIcon onMouseDown={(e) => e.stopPropagation()} />}
                          />
                        ) : (
                          selected.map((val) => (
                            <Chip
                              size="small"
                              key={val}
                              label={val}
                              onDelete={() => {
                                setCategory(category.filter((item) => item !== val));
                                setValue([]);
                              }}
                              deleteIcon={<CancelIcon onMouseDown={(e) => e.stopPropagation()} />}
                            />
                          ))
                        )}
                      </Stack>
                    )}
                  >
                    <MenuItem value="AllCategory">All Category</MenuItem>
                    {employeeCategoryList?.map((m) => (
                      <MenuItem key={m.category_name} value={m.category_name}>
                        {m.category_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={6}>
                <FormControl variant="filled" fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    multiple
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } } }}
                    renderValue={(selected) => (
                      <Stack gap={0.5} direction="row" flexWrap="wrap">
                        {selected.map((val) => (
                          <Chip
                            size="small"
                            key={val}
                            label={val}
                            onDelete={() => setDepartment(department.filter((item) => item !== val))}
                            deleteIcon={<CancelIcon onMouseDown={(e) => e.stopPropagation()} />}
                          />
                        ))}
                      </Stack>
                    )}
                  >
                    {list_department?.map((m) => (
                      <MenuItem key={m.department} value={m.department}>
                        {m.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={6}>
                <FormControl variant="filled" fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    multiple
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } } }}
                    renderValue={(selected) => (
                      <Stack gap={0.5} direction="row" flexWrap="wrap">
                        {selected.map((val) => {
                          const r = shift_role.find((emp) => emp.role_id === val);
                          return (
                            <Chip
                              size="small"
                              key={val}
                              label={r ? r.role_name : ''}
                              onDelete={() => setRole(role.filter((item) => item !== val))}
                              deleteIcon={<CancelIcon onMouseDown={(e) => e.stopPropagation()} />}
                            />
                          );
                        })}
                      </Stack>
                    )}
                  >
                    {shift_role
                      ?.filter((m) => m.role_name !== 'Administrator' && m.role_name !== 'Front Desk')
                      .map((m) => (
                        <MenuItem key={m.employee_id} value={m.role_id}>
                          {m.role_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={6}>
                <FormControl variant="filled" fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    multiple
                    value={formValues.location}
                    onChange={(e) => {
                      const { value } = e.target;
                      setFormValues((prev) => ({
                        ...prev,
                        location: value.includes('') ? [''] : value,
                      }));
                      setFormErrors((prev) => ({ ...prev, location: null }));
                    }}
                    MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: 'auto' } } }}
                    renderValue={(selected) => (
                      <Stack gap={0.5} direction="row" flexWrap="wrap">
                        {selected.includes('') ? (
                          <Chip
                            size="small"
                            label="All Location"
                            onDelete={() =>
                              setFormValues((prev) => ({ ...prev, location: [] }))
                            }
                            deleteIcon={
                              <CommonToolTip title="Cancel">
                                <CancelIcon onMouseDown={(e) => e.stopPropagation()} />
                              </CommonToolTip>
                            }
                          />
                        ) : (
                          selected.map((val) => {
                            const loc = stocklocation.find((e) => e.location_id === val);
                            return (
                              <Chip
                                size="small"
                                key={val}
                                label={loc ? loc.location_name : ''}
                                onDelete={() =>
                                  setFormValues((prev) => ({
                                    ...prev,
                                    location: prev.location.filter((item) => item !== val),
                                  }))
                                }
                                deleteIcon={
                                  <CommonToolTip title="Cancel">
                                    <CancelIcon onMouseDown={(e) => e.stopPropagation()} />
                                  </CommonToolTip>
                                }
                              />
                            );
                          })
                        )}
                      </Stack>
                    )}
                  >
                    <MenuItem value="">All Location</MenuItem>
                    {stocklocation.map((m) => (
                      <MenuItem
                        key={m.location_id}
                        value={m.location_id}
                        disabled={formValues.location.includes('')}
                      >
                        {m.location_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Search */}
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search employee..."
              value={searchVal}
              onChange={(e) => requestSearch(e.target.value)}
              sx={{ mb: 1, flexShrink: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchVal ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={cancelSearch}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />

            {/* Employee table */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                minHeight: 0,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
                    <th style={{ ...thStyle, width: 40 }}>
                      <Checkbox
                        checked={selectedAll}
                        indeterminate={value.length > 0 && !selectedAll}
                        onChange={handleToggleAll}
                        size="small"
                      />
                    </th>
                    <th style={thStyle}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Employee ({fullDisplayList.length})</span>
                        {totalLeftPages > 1 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {leftPage * LEFT_PAGE_SIZE + 1}-{Math.min((leftPage + 1) * LEFT_PAGE_SIZE, fullDisplayList.length)}
                            </Typography>
                            <IconButton
                              size="small"
                              disabled={leftPage === 0}
                              onClick={() => setLeftPage(leftPage - 1)}
                              sx={{ p: 0.25 }}
                            >
                              <NavigateBeforeIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={leftPage >= totalLeftPages - 1}
                              onClick={() => setLeftPage(leftPage + 1)}
                              sx={{ p: 0.25 }}
                            >
                              <NavigateNextIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </th>
                    <th style={{ ...thStyle, width: 50 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    displayList.map((emp) => {
                      const checked = isEmployeeSelected(emp.employee_id);
                      const conflict = getConflictInfo(emp.employee_id);
                      return (
                        <tr
                          key={emp.employee_id}
                          onClick={() => handleToggleEmployee(emp)}
                          style={{
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            background: checked ? '#e3f2fd' : 'transparent',
                          }}
                        >
                          <td style={tdStyle}>
                            <Checkbox checked={checked} size="small" tabIndex={-1} />
                          </td>
                          <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                            <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                              {emp.first_name}
                              {emp.last_name ? ' ' + emp.last_name : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp.employeeId || emp.employee_code || ''}
                            </Typography>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            {conflict?.hasConflict && (
                              <Tooltip
                                title={`Already in: ${conflict.info.alreadyInShift.map((s) => s.shift_name).join(', ')}`}
                              >
                                <WarningAmberIcon fontSize="small" color="warning" />
                              </Tooltip>
                            )}
                            {conflict?.hasAutoRenewal && (
                              <Tooltip title="Auto-renewal shift active">
                                <AutorenewIcon fontSize="small" color="info" />
                              </Tooltip>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Box>

            {formErrors.employee && (
              <FormHelperText sx={{ color: 'red', px: 1 }}>Employee is required</FormHelperText>
            )}
          </Box>

          {/* ===== RIGHT PANEL: Selected Employees Table ===== */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexShrink: 0 }}>
              <Typography variant="h6">
                Selected Employees ({value.length})
              </Typography>
              {isProcessing && <CircularProgress size={16} />}
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                minHeight: 0,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                <thead>
                  <tr
                    style={{
                      position: 'sticky',
                      top: 0,
                      background: '#f5f5f5',
                      zIndex: 1,
                    }}
                  >
                    <th style={{ ...thStyle, width: 40 }}></th>
                    <th style={thStyle}>Employee</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {value.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        Select employees from the left panel
                      </td>
                    </tr>
                  ) : (
                    value.map((emp) => {
                      const conflict = getConflictInfo(emp.employee_id);
                      const empLocationNames = (emp.location_id || [])
                        .map((lid) => stocklocation.find((l) => l.location_id === lid)?.location_name)
                        .filter(Boolean)
                        .join(', ');
                      return (
                        <tr key={emp.employee_id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={tdStyle}>
                            <Checkbox
                              checked
                              size="small"
                              onChange={() => handleDeselectFromTable(emp.employee_id)}
                            />
                          </td>
                          <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                            <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                              {emp.first_name}
                              {emp.last_name ? ' ' + emp.last_name : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {emp.employeeId || emp.employee_code || ''}
                            </Typography>
                          </td>
                          <td style={tdStyle}>{emp.role_name || '-'}</td>
                          <td style={tdStyle}>{emp.department_name || '-'}</td>
                          <td style={tdStyle}>{empLocationNames || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Box>
          </Box>
        </Box>
      </Box>

      <InfoDialog
        open={infoOpen}
        handleClose={() => {
          setInfoData([]);
          setInfoOpen(false);
        }}
        data={infoData}
        autoRenewalData={autoRenewal}
        handleSubmit={() => {
          setInfoData([]);
          setInfoOpen(false);
        }}
      />
    </Card>
  );
}

const thStyle = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(0, 0, 0, 0.7)',
  textAlign: 'left',
  padding: '4px 12px',
  borderBottom: '2px solid #e0e0e0',
};

const tdStyle = {
  fontFamily: 'Poppins, sans-serif',
  fontSize: '12px',
  padding: '4px 12px',
};
