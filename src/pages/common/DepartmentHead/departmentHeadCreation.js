

import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Button,
  TextField,
  Typography,
  Grid,

  Autocomplete,
  DialogActions,
  DialogContentText,
  DialogContent,
  Dialog,
} from '@mui/material';


import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';

import UnSavedChangesWarning from 'pages/common/unChangeswarning';

import CancelDialog from 'components/CancelDialog';
import { CreateDepartmentHead, ListDepartmentHead, ListDepartmentHeadById, deleteDepartmentHead, getDeptBaseEmpFilterAction, getRoleNameBasedOnEmployee, get_search_department_based_employee_for_department_head, setSearchDepartmentHeadState, set_search_department_based_employee_for_department_head, updateDepartmentHead } from 'redux/actions/departmentHead';
import { listDepartment } from 'redux/actions/shifts.actions';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';




export function DepartmentHeadNew(props) {



  const {
    UserCreationReducer: { departmentList },
    ShiftsReducer: { list_department },
    DepartmentHeadReducer: { getDepartmentHeadSearch, departmentHeadgetbyid, searchDepartmentBasedEmployee, getDepartmentBasedEmployeeFilterDepartmentHead
    },
    stockLocationReducer: { allliststocklocation },
  } = useSelector((state) => state);
  const [formValues, setFormValues] = useState({
    department_id: null,
    department: '',
    role_id: null,
    employee_id: null,
    role_name: null,
    location_ids: []
  });


  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);
  const dispatch = useDispatch();
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [dialog, setDialog] = useState(false);
  const [initialState, setInitialState] = useState({});
  const [form, setForm] = useState(false);
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);




  const [value, setValue] = React.useState([]);

  const [existedEmp, setExistedEmp] = React.useState([]);

  // console.log("asda",value)

  const [selectedDepartment, setSelectedDepartment] = useState(['']);


  const [searchValEmployeeFilter, setSearchValEmployeeFilter] = useState('');

  const [load, setLoad] = useState(false)

  const [userSelectError, setUserSelectError] = useState('');

  const [departmentError, setDepartmentError] = useState('');

  console.log("value", departmentError)

  console.log("formValue", formValues)
  

  useEffect(() => {
    const data ={
      searchString :''
     }
    !list_department.length && dispatch(listDepartment(data))
  }, [dispatch]);

  useEffect(() => {
    if (!allliststocklocation || allliststocklocation.length === 0) {
      dispatch(allListStockLocation(setModalTypeHandler, setLoaderStatusHandler));
    }
  }, [dispatch]);

  useEffect(() => {
    if (props.newDepartmentHead) {
      dispatch(
        ListDepartmentHead(
          setModalTypeHandler,
          setLoaderStatusHandler,
          {
            pageCount: 0,
            numPerPage: 20, // Adjust the number based on your needs
            searchString: '',
          }
        )
      );
    }
  }, [props.newDepartmentHead, dispatch]);

  // console.log("selectedDepartment", getDepartmentHeadSearch)

  useEffect(() => {


    setValue([])
    if (formValues.department_id) {

      setFormValues({ ...formValues, role_id: null, role_name: null })
      let data = {
        department: formValues.department ? [formValues.department] : '',

        searchString: ''
      };
      dispatch(getDeptBaseEmpFilterAction(data, (response) => {
        setLoad(true)
      }));
    }




  }, [formValues.department_id]);

  useEffect(() => {
    if (value?.employee_id) {
      dispatch(getRoleNameBasedOnEmployee(value.employee_id, (response) => {
        // console.log("response", response)
        setFormValues({ ...formValues, role_id: response[0].role_id, role_name: response[0].role_name })
        setUserSelectError('');
        setDepartmentError('');
      }));
    }
  }, [value?.employee_id, dispatch]);




  useEffect(() => {
    if (props.status === 'edit' && props.editData) {

      const { department_id, name, role_id, user_id, role_name, location_ids } = props.editData;

      let prefillLocationIds = [];
      if (Array.isArray(location_ids)) {
        prefillLocationIds = location_ids;
      } else if (typeof location_ids === 'string' && location_ids.length > 0) {
        prefillLocationIds = location_ids.split(',').map((v) => Number(v)).filter((v) => !isNaN(v));
      }

      // console.log("asdad",role_id,role_name)
      setFormValues({
        department_id: department_id,
        department: name,
        role_id: role_id,
        employee_id: user_id,
        role_name: role_name,
        location_ids: prefillLocationIds,
      });


    }
  }, [props.editData, props.status])



  useEffect(() => {

    if (props.status === 'edit' && props.editData && load) {
      let arr = []

      arr.push(props.editData.user_id)

      let filterData = getDepartmentBasedEmployeeFilterDepartmentHead.filter(e => arr.includes(e.employee_id))



      setValue(filterData[0])

    }


  }, [props.editData, props.status, load])










  const handleChangeEmployeeName = (val) => {
    setValue(val);

    setExistedEmp(val)
    if (val?.length > 0) {
      setUserSelectError('');

    }
  };


  const requestSearchEmployeeFilter = (val) => {

    let allDept = list_department.map((d) => d.department);
    setSearchValEmployeeFilter(val);
    dispatch(set_search_department_based_employee_for_department_head([]));

    if (!val) {
      return
    }

    let data = {
      department: formValues.department ? [formValues.department] : allDept,

      searchString: val
    };



    dispatch(
      get_search_department_based_employee_for_department_head(
        data,
        setModalTypeHandler,
        setLoaderStatusHandler,
      ),
    );


  };



  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState]);


  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
  };



  const handleChange = (event, newValue) => {

    setFormValues({
      ...formValues,
      department_id: newValue ? newValue.id : null,
      department: newValue ? newValue.department : '',
    });
    setDepartmentError(newValue ? '' : 'Department Name is required');
  };

  const handleSubmit = async () => {
    let isValid = true;
    if (!value || value?.length === 0 || value === null) {
      setUserSelectError('Employee is required');
      isValid = false;
    } else {
      setUserSelectError('');
    }
    if (!formValues.department_id || formValues.department_id === '') {
      setDepartmentError('Department Name is required');
      isValid = false;
    } else {
      setDepartmentError('');
    }

    const existingDepartmentHead = getDepartmentHeadSearch?.find(
      (head) =>
        head.department_id === formValues.department_id &&
        head.user_id === value.employee_id
    );

    if ( props.status !== 'edit' && existingDepartmentHead) {
      setUserSelectError('This Department Head is already assigned to this department.');
      isValid = false;
    }

    if (props.status === 'edit'&& existingDepartmentHead && value.employee_id !== formValues.employee_id) {
      setUserSelectError('This Department Head is already assigned to this department.');
      isValid = false;
    }

    if (!isValid ) {
      dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
      return;
    }

    const tempData = { ...formValues, employee_id: value.employee_id }

    if (props.status === 'edit' && Object.keys(props.editData).length > 0) {
      dispatch(
        updateDepartmentHead(
          props.editData.id,
          tempData,
          (response) => {

            if (response.affectedRows === 1) {

              const data = {
                pageCount: 0,
                numPerPage: 20,
                searchString: ''
              }
              dispatch(
                ListDepartmentHead(
                  setModalTypeHandler,
                  setLoaderStatusHandler, data),
              );


            }
          },
        ),
      );
      props.handleClose();
    } else {
      dispatch(
        CreateDepartmentHead(
          tempData,
          (response) => {

            if (response.affectedRows === 1) {

              const data = {
                pageCount: 0,
                numPerPage: 20,
                searchString: ''
              }
              dispatch(
                ListDepartmentHead(
                  setModalTypeHandler,
                  setLoaderStatusHandler, data),
              );


            }
          },
        ),
      );
      props.handleClose();
    }
  }


  return (
    <Dialog open={props.newDepartmentHead} onClose={() => {}} maxWidth='sm' fullWidth >
      <DialogContent>
        <DialogContentText>
        <Typography variant='h5' align='left'  font-weight='bold'>
          {props.status === 'edit' ? 'Update Department Head' : 'Create Department Head'}
        </Typography>

       
        </DialogContentText>
        </DialogContent>
      <Grid
        spacing={3}
       sx={{padding:'13px'}}
        container
        direction='row'

      >
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>


          <Autocomplete
            value={
              formValues.department
                ? list_department.find(f => f.id === formValues.department_id) || { department: formValues.department }
                : { department: '' }
            }

            name="department"
            onChange={handleChange}
            options={list_department}
            getOptionLabel={(option) => option.department || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}

            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                variant="filled"

                error={!!departmentError}
                helperText={departmentError}
                required
                name="department"
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
          <CommonUserAutoCompleteForSingleUser
            error={userSelectError}
            searchVal={searchValEmployeeFilter}
            setSearchValEmployeeFilter={setSearchValEmployeeFilter}
            requestSearch={requestSearchEmployeeFilter}
            value={value}
            setValue={handleChangeEmployeeName}
            type={getDepartmentBasedEmployeeFilterDepartmentHead}
            searchType={searchDepartmentBasedEmployee}
            labelName="Select Employee"
            isMandatory={true}
          />
        </Grid>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <TextField

            label="Role Name"
            variant="filled"
            value={formValues.role_name ? formValues.role_name : ''}
            disabled={!formValues.role_name}
            fullWidth
            InputLabelProps={{ shrink: !!formValues.role_name }}
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
            multiple
            disableCloseOnSelect
            options={allliststocklocation || []}
            value={(allliststocklocation || []).filter((loc) => formValues.location_ids.includes(loc.location_id))}
            onChange={(event, newValue) => {
              setFormValues({
                ...formValues,
                location_ids: newValue.map((loc) => loc.location_id)
              });
            }}
            getOptionLabel={(option) => option.location_name || ''}
            isOptionEqualToValue={(option, value) => option.location_id === value.location_id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Locations"
                variant="filled"
                placeholder="Select locations"
              />
            )}
          />
        </Grid>
        </Grid>
      <DialogActions>
        <Grid
          spacing={4}
          container={true}
          direction='row'
          gap='20px'
          display='flex'
          justifyContent='flex-end'
          padding='15px 15px'
        >
          <Grid>
            <Button
             onClick={() => props.handleClose()}
              style={{}}
              name='Cancel'
              variant='contained'
              color='secondary'
              size='medium'
              text='button'
              fullWidth={true}
              type='cancel'
            >
              Cancel
            </Button>
          </Grid>
          <Grid>
            <Button
              onClick={handleSubmit}
              style={{}}
              name='Submit'
              variant='contained'
              color='primary'
              size='medium'
              text='button'
              fullWidth={true}
              type='submit'
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
}
