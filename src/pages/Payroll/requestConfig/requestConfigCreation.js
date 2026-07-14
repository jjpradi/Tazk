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
  InputAdornment,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import context from '../../../context/CreateNewButtonContext';

import UnSavedChangesWarning from 'pages/common/unChangeswarning';

import CancelDialog from 'components/CancelDialog';
import {
  CreateDepartmentHead,
  ListDepartmentHead,
  ListDepartmentHeadById,
  deleteDepartmentHead,
  getDeptBaseEmpFilterAction,
  getRoleNameBasedOnEmployee,
  get_search_department_based_employee_for_department_head,
  setSearchDepartmentHeadState,
  set_search_department_based_employee_for_department_head,
  updateDepartmentHead,
} from 'redux/actions/departmentHead';
import { assignedDepartments, listDepartment } from 'redux/actions/shifts.actions';
import CommonUserAutoCompleteForSingleUser from 'utils/commonAutoCompleteForSingleUser';
import {
  createConfig,
  createPOSDiscountConfigAction,
  getCompanyBasedAdminManagerAction,
  getPOSDiscountByIdAction,
  getRequestConfig,
  getRequestType,
  getRequestTypeAction,
  get_search_company_based_admin_manager,
  set_search_company_based_admin_manager,
  updateConfig,
  updatePOSDiscountConfigAction,
} from 'redux/actions/requestConfig';
import CommonUserAutoComplete from 'utils/commonAutoCompleteForUser';
import { GET_COMPANY_BASED_ADMIN_MANAGER } from 'redux/actionTypes';
import _ from 'lodash';
import { createQuotationConfigAction, getQuotationAmountAndDiscountAction, updateQuotationConfigAction } from 'redux/actions/quotation_actions';
import { listPosSessionAction } from 'redux/actions/pos_session';
import PercentIcon from '@mui/icons-material/Percent';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

export function RequestConfigNew(props) {

  const {
    ShiftsReducer: { list_department,assigned_departments },
    RequestConfigReducer: {
      requestConfigSearch,
      requestCount,
      searchcompanyBasedAdminManager,
      getcompanyBasedAdminManager,
      getRequestType
    },
    DepartmentHeadReducer: { getDepartmentHeadSearch, departmentHeadgetbyid, searchDepartmentBasedEmployee, getDepartmentBasedEmployeeFilterDepartmentHead
    },
    posSessionReducer: { pos_session }
  } = useSelector((state) => state);

  const [formValues, setFormValues] = useState({
    approver: [],
    verifier: [],
    department_id: null,
    department: '',
    request_type_ids: [],
    quotationAmount : null,
    productDiscount : null,
    posSession: null,
    posDiscountAllowed: null,
    allowPriceChange: false
  });

  const [formErrors, setFormErrors] = useState({
    quotationAmount : null,
    productDiscount : null,
    posSession: null,
    posDiscountAllowed: null
  })

  // console.log("asdsa",props.editData)
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

  const [valueForApprover, setValueForApprover] = React.useState([]);

  const [valueForVerifier, setValueForVerifier] = React.useState([]);

  const [searchValEmployeeFilterApprover, setSearchValEmployeeFilterApprover] =
    useState('');
  const [searchValEmployeeFilterVerifier, setSearchValEmployeeFilterVerifier] =
    useState('');

  const [load, setLoad] = useState(false);

  const [verifierSelectError, setVerifierSelectError] = useState('');
  const [approverSelectError, setApproverSelectError] = useState('');
    const [expanded, setExpanded] = useState(false);

  // console.log('verifierSelectError', verifierSelectError);
  // console.log('approverSelectError', approverSelectError);

  const [selectedAll, setSelectedAll] = useState(false);

  const [departmentError, setDepartmentError] = useState('');

  const [requestTypeError, setRequestTypeError] = useState('');
  // console.log("value", departmentError)

  const [quoteId, setQuoteId] = useState('')
  const [posDiscountConfigId, setPosDiscountConfigId] = useState('')

  useEffect(() => {
    // const data ={
    //   searchString :''
    //  }
    // !list_department.length && dispatch(listDepartment(data))
    dispatch(assignedDepartments((res)=>{
          // console.log("sdfsdf",res)
    }))

    dispatch(getRequestTypeAction())
    dispatch(listPosSessionAction(commoncookie, headerLocationId, setModalTypeHandler, setLoaderStatusHandler))
  }, [dispatch]);

  useEffect(() => {

    setValueForVerifier([])
    setValueForApprover([])
    if (formValues.department_id) {


      let data = {
        department: formValues.department ? [formValues.department] : '',

        searchString: ''
      };
      dispatch(getDeptBaseEmpFilterAction(data, (response) => {
        setLoad(true)
      }));
    }




  }, [formValues.department_id]);



  useEffect(() => { (async () => {
    if (props.status === 'edit' && props.editData && props.requestType !== '') {
      if(props.requestType === 'Quotation') {// request type check
        dispatch(getQuotationAmountAndDiscountAction(props.editData.id, async(response) => {
          const res = await response[0]
          setFormValues((prevValues) => ({
            ...prevValues,
            request_type_ids: props.editData.request_type_ids || [],
            department_id: props.editData.department_id,
            department: props.editData.department_name,
            quotationAmount : res.maxQuotationAmount,
            productDiscount : res.maxProductDiscount
          }))
          setQuoteId(res.quote_config_id)
        }))

      }
      else if(props.requestType === 'POS Discount' && pos_session.length > 0){
        dispatch(getPOSDiscountByIdAction(props.editData.id, async(response) => {
          const res = await response[0]
          const posSession = pos_session.find(e => e.posId === res.pos_session_id)
          setFormValues((prev) => ({
            ...prev,
            request_type_ids: props.editData.request_type_ids || [],
            department_id: props.editData.department_id,
            department: props.editData.department_name,
            allowPriceChange: res.allow_price_change,
            posSession: posSession,
            posDiscountAllowed: res.max_discount_percent
          }))
          setPosDiscountConfigId(res.discount_config_id)
        }))
      }
      else {
        setFormValues((prevValues) => ({
          ...prevValues,
          request_type_ids: props.editData.request_type_ids || [],
          department_id: props.editData.department_id,
          department: props.editData.department_name,

        }));
      }
    }
  })();
}, [props.editData, props.status, props.requestType, pos_session]);

  useEffect(() => {

    if (props.status === 'edit' && props.editData && load) {

      // console.log("sdfsf",props.editData )

      let filterDataForApprover = getDepartmentBasedEmployeeFilterDepartmentHead.filter((e) =>
        props.editData?.approver?.some((d) => d.employee_id === e.employee_id),
      );
      let filterDataForVerifier = getDepartmentBasedEmployeeFilterDepartmentHead.filter((e) =>
        props.editData?.verifier?.some((d) => d.employee_id === e.employee_id),
      );

      // console.log("filterDataForApprover",filterDataForApprover,filterDataForVerifier)

      setValueForVerifier(filterDataForVerifier[0]);

      setValueForApprover(filterDataForApprover);
    }
  }, [props.editData, props.status, load]);

  const handleChangeEmployeeNameVerifier = (val) => {
    setValueForVerifier(val);
    // console.log("val",val)
    if (val) {
      setVerifierSelectError('');
    }
  };
  // console.log("sdfsd",assigned_departments)

  const handleChange = (event, newValue) => {

    setFormValues({
      ...formValues,
      department_id: newValue ? newValue.id : null,
      department: newValue ? newValue.department : '',
    });
    setDepartmentError(newValue ? '' : 'Department Name is required');
  };

  const handleQutationAmountAndDiscount = (name, value) => {
    setFormValues((prev => ({...prev, [name] : value})))
    setFormErrors({
      quotationAmount : null,
      productDiscount : null
    })
  }

  const handleChangeEmployeeNameApprover = (val) => {
    setValueForApprover(val);
    if (val?.length > 0) {
      setApproverSelectError('');
    }
  };

  const requestSearchEmployeeFilterApprover = (val) => {


    let allDept = assigned_departments.map((d) => d.department);
    setSearchValEmployeeFilterApprover(val);
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
  const requestSearchEmployeeFilterVerifier = (val) => {



    let allDept = assigned_departments.map((d) => d.department);
    setSearchValEmployeeFilterVerifier(val);
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

  const isQuotationSelected = formValues.request_type_ids.some(
    (type) => type.request_type_name === 'Quotation Approval'
  )

  const isPOSDiscountSelected = formValues.request_type_ids.some((type) => type.request_type_name === 'POS Discount')

  const handleSubmit = async () => {
    let isValid = true;

    if(isQuotationSelected){
      if(formValues.productDiscount !== null && formValues.productDiscount !== 'null' && formValues.productDiscount !== '' || 
        formValues.quotationAmount !== null && formValues.quotationAmount !== 'null' && formValues.quotationAmount !== '') {
          setFormErrors({...formErrors, productDiscount : null, quotationAmount : null})
        }
        else{
        isValid = false
        setFormErrors({...formErrors, productDiscount : 'Product Discount is Required', quotationAmount : 'Quotation Amount is Required'})
      }
    }

    if(isPOSDiscountSelected){
      if(formValues.posSession === null || formValues.posSession === 'null' || formValues.posSession === ''){
        isValid = false
        setFormErrors((prev) => ({ ...prev, posSession: 'Sale Counter is Required' }))
      }
      
      if(formValues.posDiscountAllowed === null || formValues.posDiscountAllowed === 'null' || formValues.posDiscountAllowed === ''){
        isValid = false
        setFormErrors((prev) => ({ ...prev, posDiscountAllowed: 'Discount is Required' }))
      }
      else{
        const discountRegex = /^(100|[1-9]?[0-9])$/
        const validRegex = discountRegex.test(formValues.posDiscountAllowed)
        if(!validRegex){
          isValid = false
          setFormErrors((prev) => ({ ...prev, posDiscountAllowed: 'Invalid Discount Value' }))
        }
      }

    }

    // console.log("sdad",valueForApprover)

    if (!formValues.department_id || formValues.department_id === '') {
      setDepartmentError('Department Name is required');
      isValid = false;
    } else {
      setDepartmentError('');
    }

    if (!formValues.request_type_ids || formValues.request_type_ids?.length === 0 || formValues.request_type_ids === null ||

      formValues.request_type_ids === undefined
    ) {
      setRequestTypeError('Request Type is required');
      isValid = false;
    } else {
      setRequestTypeError('');
    }


    if (
      !valueForApprover ||
      valueForApprover?.length === 0 ||
      valueForApprover === null ||
      valueForApprover === undefined
    ) {
      setApproverSelectError('Approver is required');
      isValid = false;
    } else {
      setApproverSelectError('');
    }




    if (!isValid) {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return;
    }

    const normalizedApprover = (valueForApprover || []).map((user) => ({
      ...user,
      resolver_type:
        user?.resolver_type === 'REPORTING_MANAGER'
          ? 'REPORTING_MANAGER'
          : 'EMPLOYEE',
    }));

    const normalizedVerifier =
      valueForVerifier?.employee_id
        ? [
            {
              ...valueForVerifier,
              resolver_type:
                valueForVerifier?.resolver_type === 'REPORTING_MANAGER'
                  ? 'REPORTING_MANAGER'
                  : 'EMPLOYEE',
            },
          ]
        : [];

    const tempData = {
      ...formValues,
      approver: normalizedApprover,
      verifier: normalizedVerifier,
    };

    // console.log("formValues",tempData)

    if (Object.keys(props.editData).length > 0) {
      dispatch(
        updateConfig(props.editData.id, tempData, (response) => {
          if (response[0].affectedRows === 1) {
            if(isQuotationSelected) {
              const payload = {
                maxQuotationAmount : formValues.quotationAmount,
                maxProductDiscount : formValues.productDiscount,
                approver_mapping : response[0]?.insertId,
                verifier_mapping : response[1]?.insertId || null
              }
              dispatch(updateQuotationConfigAction(payload, quoteId))
            }
            if(isPOSDiscountSelected) {
              const payload = {
                pos_session_id: formValues.posSession.posId,
                max_discount_percent: parseInt(formValues.posDiscountAllowed),
                allow_price_change: formValues.allowPriceChange ? 1 : 0,
                request_config_id: response[0].requestConfigId,
                approver_mapping : response[1]?.insertId,
                verifier_mapping : response[2]?.insertId || null,
              }
              dispatch(updatePOSDiscountConfigAction(payload, posDiscountConfigId))
            }
            const data = {
              pageCount: 0,
              numPerPage: 20,
              searchString: '',
            };
            dispatch(
              getRequestConfig(setModalTypeHandler, setLoaderStatusHandler, data),
            );
          }
        }),
      );
      props.handleClose();
    }

    else {

      dispatch(
        createConfig(tempData, (response) => {
          // console.log("response",response)
          if (response[1].affectedRows === 1) {
            if(isQuotationSelected) {
              const payload = {
                maxQuotationAmount : formValues.quotationAmount,
                maxProductDiscount : formValues.productDiscount,
                request_config_id: response[0].requestConfigId,
              }
              dispatch(createQuotationConfigAction(payload))
            }
            if(isPOSDiscountSelected){
              const payload = {
                pos_session_id: formValues.posSession.posId,
                max_discount_percent: parseInt(formValues.posDiscountAllowed),
                allow_price_change: formValues.allowPriceChange ? 1 : 0,
                request_config_id: response[0].requestConfigId
              }
              dispatch(createPOSDiscountConfigAction(payload))
            }
            const data = {
              pageCount: 0,
              numPerPage: 20,
              searchString: '',
            };
            dispatch(
              getRequestConfig(setModalTypeHandler, setLoaderStatusHandler, data),
            );
          }
        }),
      );

    }

    props.handleClose();
    // }
  };

  

  // console.log("formValues",formValues)

  return (
    <Dialog
      open={props.newRequestConfig}
      onClose={() => { }}
      maxWidth='sm'
      fullWidth
    >
      <DialogContent>
        <DialogContentText>
          <Typography className='page-title' variant='h5' align='left'>
            {props.status === 'edit' ? 'Update Approvals' : 'Create Approvals'}
          </Typography>
        </DialogContentText>
      </DialogContent>
      <Grid spacing={3} sx={{ padding: '13px' }} container direction='row'>

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
                ? assigned_departments.find(f => f.id === formValues.department_id) || { department: formValues.department }
                : { department: '' }
            }

            name="department"
            onChange={handleChange}
            options={assigned_departments}
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

          <Autocomplete
            multiple
            limitTags={2}
            value={
              formValues.request_type_ids.length > 0 ? formValues.request_type_ids : []
            }
            name="Request Type"
            onChange={(event, newValue) => {
              // console.log("newValue", newValue)
              setFormValues({
                ...formValues,
                request_type_ids: newValue?.map((d) => {
                  return {
                    request_type_id: d.request_type_id,
                    request_type_name: d.request_type_name,
                  };
                }),
              });
              setRequestTypeError(newValue.length ? '' : 'Request Type is required');

            }}
            id="multiple-limit-tags"
            options={_.uniqBy(getRequestType, 'request_type_name').filter(
              (d) =>
                !formValues.request_type_ids.some(
                  (f) => d.request_type_name === f.request_type_name
                )
            )}
            getOptionLabel={(option) => option.request_type_name || ''}
            isOptionEqualToValue={(option, value) => option.request_type_id === value.request_type_id}
            sx={{
              "& .MuiInputBase-root": {
                paddingTop: "8px !important",
                paddingBottom: "8px !important",
                flexWrap: expanded ? "wrap" : "nowrap",
                alignItems: expanded ? "flex-start" : "center",
                minHeight: expanded ? "80px" : "48px",
              },
            }}

            renderTags={(value, getTagProps) => {
              if (!expanded && value.length > 3) {
                return (
                  <>
                    {value.slice(0, 2).map((option, index) => (
                      <Chip {...getTagProps({ index })} label={option.request_type_name} />
                    ))}
                    <Chip
                      label={`+${value.length - 2}`}
                      onClick={() => setExpanded(true)}
                      sx={{ cursor: "pointer", background: "#eee" }}
                    />
                  </>
                );
              }

              return value.map((option, index) => (
                <Chip {...getTagProps({ index })} label={option.request_type_name} />
              ));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Request Type"
                variant="filled"
                error={!!requestTypeError}
                helperText={requestTypeError}
                required
                name="Request Type"
              />
            )}
          />

        </Grid>
        
        {
          isQuotationSelected && (
            <>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <TextField 
            fullWidth
            variant = 'filled'
            label = 'Quotation Amount Greater Than'
            type = 'number'
            value = {formValues.quotationAmount || ''}
            onChange = {(event) => handleQutationAmountAndDiscount('quotationAmount', event.target.value)}
            error = {formErrors.quotationAmount !== null}
            helperText = {formErrors.quotationAmount || ''}
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
            fullWidth
            variant = 'filled'
            label = 'Product Discount Greater Than'
            type = 'number'
            value = {formValues.productDiscount || ''}
            onChange = {(event) => handleQutationAmountAndDiscount('productDiscount', event.target.value)}
            error = {formErrors.productDiscount !== null}
            helperText = {formErrors.productDiscount || ''}
          />
        </Grid>
        </>
          )
        }

        {
          isPOSDiscountSelected &&
          <>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Autocomplete
                value = {formValues.posSession}
                options = {pos_session}
                getOptionLabel = {(option) => `${option.posName} - ${option.location_name}`}
                onChange = {(event, newValue) => {
                  setFormValues((prev) => ({ ...prev, posSession: newValue }))
                  if(newValue === null || newValue === ''){
                    setFormErrors((prev) => ({ ...prev, posSession: 'Sale Counter is Required' }))
                  }
                  else{
                    setFormErrors((prev) => ({ ...prev, posSession: null }))
                  }
                }}
                renderInput = {(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    variant = 'filled'
                    label = 'Sale Counter'
                    error = {formErrors.posSession !== null}
                    helperText = {formErrors.posSession}
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
  <TextField
    variant="filled"
    fullWidth
    required
    label="Maximum Discount Allowed (in Percentage)"
    type="number"
    inputProps={{ min: 0, max: 100 }}
    value={formValues.posDiscountAllowed || ''}
    onChange={(event) => {
      const value = event.target.value;

      // Allow only digits and prevent input over 100
      const numericValue = value === '' ? '' : Number(value);
      if (value === '' || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100)) {
        setFormValues((prev) => ({ ...prev, posDiscountAllowed: value }));

        if (value === '') {
          setFormErrors((prev) => ({
            ...prev,
            posDiscountAllowed: 'Discount is required',
          }));
        } else {
          setFormErrors((prev) => ({ ...prev, posDiscountAllowed: null }));
        }
      }
    }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <PercentIcon />
        </InputAdornment>
      ),
    }}
    error={formErrors.posDiscountAllowed !== null}
    helperText={formErrors.posDiscountAllowed}
  />
</Grid>


            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <FormControlLabel
                label = 'Allow Price Change'
                control = {
                  <Switch
                    checked = {formValues.allowPriceChange}
                    onChange = {() => setFormValues((prev) => ({ ...prev, allowPriceChange: !prev.allowPriceChange }))}
                  />
                }
              />
            </Grid>
          </>
        }

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <CommonUserAutoComplete
            error={approverSelectError}
            searchVal={searchValEmployeeFilterApprover}
            requestSearch={requestSearchEmployeeFilterApprover}
            value={valueForApprover}
            setValue={handleChangeEmployeeNameApprover}
            type={getDepartmentBasedEmployeeFilterDepartmentHead}
            searchType={searchDepartmentBasedEmployee}
            labelName='Select Approver'
            pageType='approvals'
            selectedAll={selectedAll}
            setSelectedAll={setSelectedAll}
            isMandatory={true}
            required={true}
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
            error={verifierSelectError}
            searchVal={searchValEmployeeFilterVerifier}
            setSearchValEmployeeFilter={setSearchValEmployeeFilterVerifier}
            requestSearch={requestSearchEmployeeFilterVerifier}
            value={valueForVerifier}
            setValue={handleChangeEmployeeNameVerifier}
            type={getDepartmentBasedEmployeeFilterDepartmentHead}
            searchType={searchDepartmentBasedEmployee}
            labelName='Select Verifier'
            pageType='approvals'
          // isMandatory={true}
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
