import {
  Autocomplete,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import CommonToolTip from 'components/ToolTip';
import { Form, FormikProvider, useFormik } from 'formik';
import LeaveReport from 'pages/Payroll/LeaveReport';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmpbasecompanyAction , getEmpbasecompanyFilterAction, get_search_company_based_employee, set_search_company_based_employee} from 'redux/actions/attendance_actions';
import { createAnnouncement, updateAnnouncement } from 'redux/actions/payrollDashboard_actions';
import { listDepartment } from 'redux/actions/shifts.actions';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { commonDateFormat, getDateTimeFormat } from 'utils/getTimeFormat';
import * as Yup from 'yup';
import CancelIcon from '@mui/icons-material/Cancel';
import { CreateNotificationAction, getNotificationTokenAction } from 'redux/actions/notification_actions';
import moment from 'moment';

import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { GET_EMP_BASECOMPANY_FILTER } from 'redux/actionTypes';
import context from '../../../context/CreateNewButtonContext';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { maxHeight } from 'utils/pageSize';

export default function FormCreation(props) {
  const { handleCloseForm, editData, mode } = props;
  const [showMoreModalOpen, setShowMoreModalOpen] = useState({
    users: false,
    location: false,
    department: false,
  }); const [selectedEmployeesForModal, setSelectedEmployeesForModal] = useState({ users: [], location: [], department: [] });
  const [showAllLocationsInDropdown, setShowAllLocationsInDropdown] = useState(false);

  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  // const [option,setOption] = useState(false)

  const [selectedAll, setSelectedAll] = useState(false);

  const [userSelectError, setUserSelectError] = useState('');

  // console.log('showMoreModalOpen', editData);
  console.log("userSelectError",userSelectError)

  const dispatch = useDispatch();

  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

  useEffect(() => {
    const data ={
      searchString :''
     }
    dispatch(listDepartment(data));
    dispatch(allListStockLocation());
    let data1 = {
      searchString:""
    }
    dispatch(getEmpbasecompanyFilterAction(data1,(res)=>{
      console.log("resss",res)
      dispatch({
        type: GET_EMP_BASECOMPANY_FILTER,
        payload: res,
      });
    }))
  }, []);
  const {
    ShiftsReducer: { list_department },
    stockLocationReducer: { allliststocklocation },
    attendanceReducer: { get_empbasecompany ,searchCompanyBasedEmployeeFilter,getCompanyBasedEmployeeFilter },
  } = useSelector((state) => state);

  const shouldShowAllLocationsInDropdown =
    showAllLocationsInDropdown || allliststocklocation?.length <= 1;  
  const [value, setValue] = React.useState([]);

  console.log("sdfsdf",value)

  useEffect(() => {
    // console.log("dfgdgdg")
    if(mode=== 'edit'){
     if(editData?.users?.length > 0) {
      console.log("editData.users",editData.users)
      const temp = getCompanyBasedEmployeeFilter.filter((employee) => editData.users.includes(employee.employee_id));
    
      console.log("temp",temp)
       setValue(temp)
     }
    }
   }, [mode,editData]);

//   useEffect(() => {
//     // Only set the initial value if it's not already set or if it's an edit mode and editData.users is available
//     if (!value.length && mode === 'edit' && editData?.users?.length > 0) {
//         let filterResult = getCompanyBasedEmployeeFilter?.filter((i) => editData?.users?.some((item) => i.employee_id === item))
//         setValue(filterResult)
//     }
// }, [mode, editData, value, getCompanyBasedEmployeeFilter]);






  const handleChangeEmployeeName = (val) => {
  setValue(val);
  setUserSelectError('');   // ✅ clear error immediately
  formik.setFieldValue('users', val);
};


const requestSearchEmployeeFilter = (val) => {

  // let allDept = list_department.map((d) => d.department);

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
  // }
  // }),
  // );

};


  const validationSchema = Yup.object().shape({
    department: Yup.array()
  .min(1, 'Department is Required!')
  .required('Department is Required!'),



    location: Yup.array()
      .notOneOf([''], 'Location is Required!')
      .min(1, 'Location is Required!')
      .required('Location is Required!'),

    users: Yup.array()
  .min(1, 'Employee is Required!')
  .required('Employee is Required!'),
  
    expiry: Yup.number()
      .min(1, 'Must be greater than 0!')
      .max(90, 'Must be lesser than or equal to 90!')
      .required('Expiry is Required!'),

    announcement: Yup.string()
      .min(2, 'Too Short!')
      .max(500, 'Too Long!')
      .required('Announcement is Required!'),
  });

  
  const formik = useFormik({
    
    
    initialValues: {
     
      department: mode === 'edit' ? editData.department : [],
      location: mode === 'edit' ? editData.location : [],
      users: mode === 'edit' ? editData.users : [''],
      expiry: mode === 'edit' ? editData.expiry : '',
      announcement: mode === 'edit' ? editData.announcement : '',
    },
    

    
    validationSchema: validationSchema,

    onSubmit: () => {

      if (!value || value.length === 0) {
    setUserSelectError('Employee is required');
    return; 
  }
      
      if (selectedAll) {

    

        dispatch(getEmpbasecompanyAction({} ,(res)=>{
          if (res) {
            processFunction(res)
          }
        }))
       
      }
  
      else {
  
        processFunction(value)
      }
    },
  });


  const processFunction = async(value) => {

  

    let values = { ...formik.values };
    let empId =   value.map((d)=> d.employee_id);
    let locationId = values.location.every((value) => value === '')
      ? allliststocklocation.map((l) => l.location_id)
      : values.location;
    let departMent = values.department.every((value) => value === '')
      ? list_department.map((d) => d.department)
      : values.department;
    
    // let today = moment();
    // let futureDate = today.add(values.expiry, 'days').format('YYYY-MM-DD');

    let payload = {
      department: JSON.stringify(departMent),
      location: JSON.stringify(locationId),
      users: JSON.stringify(empId),
      expiry: values.expiry,
      announcement: values.announcement,
      // expiry_date: futureDate
    };

    if (mode === 'add') {
      await dispatch(createAnnouncement(payload,async (response) => {
        if (response.status === 'SUCCESS') {
          console.log('sent-announcement-notification');
          let type = 'Announcement Notification'
          let content = values.announcement 
  
          let data = {
            type,
            content
          }
        //  await dispatch(
        //     getNotificationTokenAction(data,async (res) => {
        //       if (res?.status === 200) {
        //         await dispatch(
        //           CreateNotificationAction({
        //             content_body: values.announcement,
        //             title: res?.data?.title,
        //             time: getDateTimeFormat(new Date()),
        //             active: '1',
        //           }),
        //         );
        //       }
        //     }),
        //   );
        }
      })).then(() => handleCloseForm());
    } else {
      await dispatch(updateAnnouncement(payload, editData.id)).then(() => handleCloseForm());
    }
  }

  const handleShowMoreClick = (name) => {
    setShowMoreModalOpen((prev) => ({
      ...prev,
      [name]: true,
    }));
    setSelectedEmployeesForModal((prev) => ({
      ...prev,
      [name]: values[name],
    }));
  };


  const {
    errors,
    touched,
    handleSubmit,
    values,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm
  } = formik;



  return (
    <Card
      sx={{ height: 'calc(100vh - 80px)' }}
    >
      <FormikProvider value={formik}>
        <Form autoComplete='off' noValidate onSubmit={handleSubmit}>
          <Grid
            container
            display='flex'
            flexDirection='row'
            spacing={2}
            padding='20px'
          >
            <Grid
              size={{
                lg: 10,
                md: 10,
                sm: 10,
                xs: 10
              }}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    xs: 12
                  }}>
                  <FormControl
                    variant="filled"
                    fullWidth
                    error={touched.department && Boolean(errors.department)}
                  >
                    <InputLabel id='demo-multiple-name-label'>
                      Select Department<span style={{ color: 'red' }}> * </span>
                    </InputLabel>
                    <Select
                      name='department'
                      multiple
                      value={values.department} // Assuming formValues is the state for your form
                      onChange={(e) => {
                        const { value } = e.target;
                        console.log('FDFFFf', value.includes('') ? [''] : value, value);

                        setFieldValue('department', value.includes('') ? [''] : value);
                        // Clear error for employee field when 'All Users' is selected

                        // Open modal if more than one item is selected and "All Users" is not selected
                        if (value.length > 1 && !value.includes('')) {
                          handleShowMoreClick('department');
                        }
                      }}
                      fullWidth
                      renderValue={(selected) => {
                        if (selected.length === 0) return '';

                        // All Departments selected via empty string
                        if (selected.includes('')) {
                          return (
                            <Chip
                              label="All Department"
                              onDelete={() => setFieldValue('department', [])}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                </CommonToolTip>
                              }
                            />
                          );
                        }

                        // All departments selected manually
                        if (selected.length === list_department.length) {
                          return (
                            <Chip
                              label="All Department"
                              onDelete={() => setFieldValue('department', [])}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                </CommonToolTip>
                              }
                            />
                          );
                        }

                        if (selected.length === 1) {
                          const dep = list_department.find(
                            (d) => d.department === selected[0]
                          );

                          return (
                            <Chip
                              label={dep?.department || selected[0]}
                              onDelete={() => setFieldValue('department', [])}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon onMouseDown={(event) => event.stopPropagation()} />
                                </CommonToolTip>
                              }
                            />
                          );
                        }

                        // Multiple selections → show comma-separated string
                        const selectedDepartment = selected
                          .map((value) => {
                            const department = list_department.find((dep) => dep.department === value);
                            return department ? department.department : '';
                          })
                          .join(', ');

                        return selectedDepartment;
                      }}

                    >
                      <MenuItem value=''>All Department</MenuItem>
                      {list_department.slice(0, 1).map((m) => (
                        <MenuItem
                          key={m.department}
                          value={m.department}
                          disabled={values?.department?.includes('')}
                        >
                          {m.department}
                        </MenuItem>
                      ))}
                      {values?.department?.includes('') ? (
                        <MenuItem disabled>
                          <Button
                            size='small'
                            variant='text'
                            fullWidth
                            disabled
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              color: 'rgba(0, 0, 0, 0.5)',
                            }}
                          >
                            Show More
                          </Button>
                        </MenuItem>
                      ) : (
                        <MenuItem onClick={() => handleShowMoreClick('department')}>
                          <Button size='small' variant='text' fullWidth>
                            Show More
                          </Button>
                        </MenuItem>
                      )}
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>
                      {touched[`department`] && errors[`department`]}
                    </FormHelperText>
                  </FormControl>
                  <Dialog
                    open={showMoreModalOpen.department}
                    onClose={() => setShowMoreModalOpen(false)}
                  >
                    <DialogTitle>Select department</DialogTitle>
                    <DialogContent>
                      {list_department.map((department) => (
                        <FormControlLabel
                          key={department.location_id}
                          control={
                            <Checkbox
                              checked={selectedEmployeesForModal.department.includes(department.department)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedEmployeesForModal((prevSelected) => ({
                                  ...prevSelected,
                                  department: checked
                                    ? [...prevSelected.department, department.department] // Add user if checked
                                    : prevSelected.department.filter(id => id !== department.department), // Remove user if unchecked
                                }));
                              }}
                            />
                          }
                          label={department.department}
                        />

                      ))}
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setShowMoreModalOpen(false)}
                        color='primary'
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setFieldValue('department', selectedEmployeesForModal.department);
                          setShowMoreModalOpen((prevState) => ({
                            ...prevState,
                            department: false
                          }));
                        }}
                        color='primary'
                      >
                        OK
                      </Button>
                    </DialogActions>
                  </Dialog>

                </Grid>
                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    xs: 12
                  }}>
                  <FormControl
                    variant="filled"
                    fullWidth
                    error={touched.location && Boolean(errors.location)}
                  >
                    <InputLabel id="demo-multiple-name-label">
                      Select Location<span style={{ color: 'red' }}> * </span>
                    </InputLabel>

                    <Select
                      name="location"
                      multiple
                      value={values.location}
                      style={{ textTransform: 'capitalize' }}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFieldValue('location', value.includes('') ? [''] : value);
                      }}
                      fullWidth
                      required
                      renderValue={(selected) => {
                        if (selected.length === 0) return '';

                        if (selected.includes('')) {
                          return (
                            <Chip
                              label="All Locations"
                              onDelete={() => setFieldValue('location', [])}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon onMouseDown={(e) => e.stopPropagation()} />
                                </CommonToolTip>
                              }
                            />
                          );
                        }

                        if (selected.length === 1) {
                          const loc = allliststocklocation.find(
                            (l) => l.location_id === selected[0]
                          );
                          return (
                            <Chip
                              label={loc?.location_name}
                              onDelete={() => setFieldValue('location', [])}
                              deleteIcon={
                                <CommonToolTip title="Cancel">
                                  <CancelIcon onMouseDown={(e) => e.stopPropagation()} />
                                </CommonToolTip>
                              }
                            />
                          );
                        }

                        return selected
                          .map(
                            (v) =>
                              allliststocklocation.find((l) => l.location_id === v)
                                ?.location_name
                          )
                          .join(', ');
                      }}
                    >
                        <MenuItem value="">All Locations</MenuItem>

                      {(shouldShowAllLocationsInDropdown
                        ? allliststocklocation
                        : allliststocklocation.slice(0, 1)
                      ).map((m) => (
                        <MenuItem
                          key={m.location_id}
                          value={m.location_id}
                          disabled={values?.location?.includes('')}
                        >
                          {m.location_name}
                        </MenuItem>
                      ))}

                      {allliststocklocation?.length > 1 &&
                      !shouldShowAllLocationsInDropdown &&
                      !values?.location?.includes('') && (
                      <MenuItem
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowAllLocationsInDropdown(true);
                        }}
                      >
                        <Button
                          size="small"
                          variant="text"
                          fullWidth
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAllLocationsInDropdown(true);
                          }}
                        >
                          Show More
                        </Button>
                      </MenuItem>
                      )}
                    </Select>

                    <FormHelperText>
                      {touched.location && errors.location}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    lg: 3,
                    md: 4,
                    xs: 12
                  }}>
                  <FormControl variant='filled' fullWidth>
                    <CommonUserAutoComplete
                      searchVal={searchValEmployeeFilter}


                      requestSearch={requestSearchEmployeeFilter}
                      value={value}
                      setValue={handleChangeEmployeeName}
                      type={getCompanyBasedEmployeeFilter}
                      searchType={searchCompanyBasedEmployeeFilter}

                      error={userSelectError}
                      selectedAll={selectedAll}
                      setSelectedAll={setSelectedAll}
                      isMandatory={true}
                    />
                  </FormControl>
              
                </Grid>
                <Grid
                  sx={{ mt:'6px'}}
                  size={{
                    lg: 3,
                    md: 4,
                    xs: 12
                  }}>
                  <TextField
                    label='Days'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    onWheel={ (e) => e.target.blur()}
                    required
                    placeholder='Days'
                    name='expiry'
                    value={values.expiry}
                    color='primary'
                    type='number'
                    variant='outlined'
                    error={touched[`expiry`] && Boolean(errors[`expiry`])}
                    helperText={touched[`expiry`] && errors[`expiry`]}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 12,
                    xs: 12
                  }}>
                  <TextField
                    label='Announcement'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    required
                    placeholder='Announcement'
                    name='announcement'
                    value={values.announcement || ''}
                    color='primary'
                    type='text'
                    variant='outlined'
                    error={
                      touched[`announcement`] && Boolean(errors[`announcement`])
                    }
                    helperText={touched[`announcement`] && errors[`announcement`]}
                    inputProps={{
                      style: {
                        height: '200px',
                        padding: '0 14px',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
            container
            spacing={2}
            pt='20px'
            display='flex'
            flexDirection='row'
            justifyContent='flex-end'
          >
            <Grid className='btn_submit'>
              <Button
                variant='contained'
                color='primary'
                  onClick={async () => {

                    let hasError = false;

                    if (!value || value.length === 0) {
                      setUserSelectError('Employee is required');
                      hasError = true;
                    } else {
                      setUserSelectError('');
                    }

                    const validationErrors = await formik.validateForm();

                    if (Object.keys(validationErrors).length > 0) {
                      formik.setTouched(
                        Object.keys(validationErrors).reduce((acc, key) => {
                          acc[key] = true;
                          return acc;
                        }, {}),
                        true
                      );
                      hasError = true;
                    }

                    if (hasError) {
                      dispatch(
                        OpenalertActions({
                          msg: requiredFieldsAlertMessage,
                          severity: 'warning',
                        })
                      );
                      return;
                    }

                    // ✅ submit only if no errors
                    formik.handleSubmit();
                  }}

              >
                {mode === 'add' ? 'Submit' : 'Update'}
              </Button>
            </Grid>
            <Grid className='btn_reject'>
              <Button
                variant='contained'
                color='secondary'
                onClick={handleCloseForm}
              >
                Close
              </Button>
            </Grid>
          </Grid>
          </Grid>
          
        </Form>
      </FormikProvider>
    </Card>
  );
}
