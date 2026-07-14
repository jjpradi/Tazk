import {
  Autocomplete,
  Box,
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
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
} from '@mui/material';
import CancelDialog from 'components/CancelDialog';
import {getsessionStorage} from 'pages/common/login/cookies';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  checkDeleteAllowanceDeductionTypesAction,
  createAllowanceDeductionTypesAction,
  createSalaryStructureAction,
  deleteAllowanceDeductionTypesAction,
  getAllowanceType,
  getAppconfigPercentAction,
  getDeductionType,
  getPfEsiPtAction,
  getPtSlabsAction,
  getSalaryTemplateAllAction,
  getSalaryTemplateByIdAction,
  getStructureBasedTemplateAction,
  setSalaryTemplateByIdAction,
} from 'redux/actions/salary_actions';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import CancelIcon from '@mui/icons-material/Cancel';
import CommonToolTip from 'components/ToolTip';
import {getEmpbasecompanyAction} from 'redux/actions/attendance_actions';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {getDateFormat} from 'utils/getTimeFormat';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {capitalize} from 'lodash';
import {updateSalaryStructureAction} from '../../../redux/actions/salary_actions';
import AddIcon from '@mui/icons-material/Add';
import {GET_ALLOWANCE_TYPE, GET_DEDUCTION_TYPE} from 'redux/actionTypes';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CommonDialog from 'components/commonDialog';
import AlertDialog from '../../common/Dialog';
import IOSSwitch from 'utils/cssSwitch';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { maxBodyHeight, pageSize } from 'utils/pageSize';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';

function NewSalaryStructure(props) {
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const {
    SalaryReducers: {AllowanceType, deductionType, salaryTemplateList, getTemplateById, structureBasedTemplate, salaryPercent, pfesipt, ptslabs},
    attendanceReducer: {get_empbasecompany},
    // appConfigReducer: { app_config_data}
  } = useSelector((state) => state);
  const [selectedAllowanceNames, setSelectedAllowanceNames] = useState(['']);
  const [selectedDeductionNames, setSelectedDeductionNames] = useState(['']);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [summarySource, setSummarySource] = useState('grossAmount');
  const [fromdate, setFromdate] = useState('');
  const [todate, setTodate] = useState('');
  const [otType, setOtType] = useState('');
  const [formValues, setFormValues] = useState({
    code: null,
    name: null,
    fromDate: null,
    toDate: null,
    grossAmount: null,
    monthly_ctc: null,
    ctc: null,
    net_pay: null,
    grossAutoCalculation: false,
    allowanceAmounts: [],
    deductionAmounts: [],
    salary_template_id: null,
    salary_template_name: null
  });
  // console.log("djfg", formValues, salaryTemplateList)
  const [formErrors, setFormErrors] = useState({
    code: null,
    name: null,
    fromDate: null,
    toDate: null,
    grossAmount: null,
    monthly_ctc: null,
    ctc: null,
    net_pay: null,
    allowanceAmounts: [],
    deductionAmounts: [],
    salary_template_id: null,
    salary_template_name: null
  });

  const [ot, setOt] = useState(false);
  const [allowanceItemAdded, setAllowanceItemAdded] = useState([]);
  const [deductionsItemAdded, setDeductionsItemAdded] = useState([]);
  const [itemSelected, setItemSelected] = useState({name: null, value: null});
  const [changedForm, setChangedForm] = useState(false);
  const [createType, setCreateType] = useState({
    open: null,
    name: null,
    code: null,
  });
  const [deleteType, setDeleteType] = useState({
    open: null,
    id: null,
  });
  const isSalaryPercentAutoEnabled =
    Array.isArray(salaryPercent) && salaryPercent.length > 0 && salaryPercent[0]?.value === '1';

  useEffect(() => {
    if (props.status === 'edit' && props.edit_data) {
      // console.log('Fdfdfd', props.edit_data);

      const allwList = AllowanceType.map((i) => ({
        ...i,
        amount: props.edit_data[i.allowance_code],
        amount_type: props.edit_data[`${i.allowance_code}_amount_type`],
      })).filter((i) => i.amount !== null && i.amount !== undefined && i.amount !== '');

      const dedList = deductionType
        .map((i) => ({...i, amount: props.edit_data[i.deduction_code]}))
        .filter((i) => i.amount !== null && i.amount !== undefined && i.amount !== '');

      // console.log('ooooo', allwList, dedList);

      setAllowanceItemAdded(allwList.map(i => i.id))
      setDeductionsItemAdded(dedList.map(i => i.id))

      setFormValues({
        ...formValues,
        code: props.edit_data.code,
        name: props.edit_data.name,
        grossAmount: props.edit_data.grossAmount ?? null,
        monthly_ctc:
          props.edit_data.monthly_ctc ??
          props.edit_data.grossAmount ??
          null,
        ctc:
          props.edit_data.ctc ??
          (props.edit_data.grossAmount ? (Number(props.edit_data.grossAmount) * 12).toString() : null),
        net_pay:
          props.edit_data.net_pay ??
          props.edit_data.grossAmount ??
          null,
        grossAutoCalculation:
          isSalaryPercentAutoEnabled && props.edit_data.auto_calculation === 1 ? true : false,
        salary_template_id: props.edit_data.template_id,
        salary_template_name: props.edit_data.template_name,
        allowanceAmounts: allwList,
        deductionAmounts: dedList,
      });

      if (props.edit_data.net_pay) {
        setSummarySource('net_pay');
      } else if (props.edit_data.ctc) {
        setSummarySource('ctc');
      } else if (props.edit_data.monthly_ctc) {
        setSummarySource('monthly_ctc');
      } else {
        setSummarySource('grossAmount');
      }

      const isOtExists = allwList.find((i) => i.allowance_code === 'OT');

      // console.log('poiuyydd', allwList, isOtExists);
      
      if (isOtExists) {
        setOtType(isOtExists.amount_type);
        const shouldSetOt = isOtExists.amount_type === "FROM_BASIC" || (isOtExists.amount_type === "FLAT" && isOtExists.amount !== 0);
  
        setOt(shouldSetOt);
      } else {
        setOt(false);
        setOtType('');
      }
    }
    // handleOt(props.ot)
  }, [props.status, props.edit_data, AllowanceType, deductionType, props.ot, isSalaryPercentAutoEnabled]);

  const [requiredFields] = useState(['code', 'name', 'basicPay']);

  const currentDate = getDateFormat(new Date());
  const [dialog, setDialog] = useState(false);
  const storage = getsessionStorage();
  const cancel = () => {
    setDialog(false);
  };

  const validCloseDialog = () => {
    setDialog(true);
  };
  const dispatch = useDispatch();

  useEffect(() => {
    let body = {
          pageCount: 0,
          numPerPage: pageSize,
          searchString: '',
          employeeId: commoncookie,
          headerLocationId: headerLocationId
        }
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getAllowanceType(storage.company_id)),
      dispatch(getDeductionType(storage.company_id)),
      // dispatch(getEmpbasecompanyAction()),
      dispatch(getSalaryTemplateAllAction(body)),
      dispatch(getAppconfigPercentAction()),
      dispatch(getPfEsiPtAction()),
      dispatch(getPtSlabsAction()),
      dispatch(setSalaryTemplateByIdAction([]))
      // dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler, (response) => {
      //   response.map((res) => {
      //     if(res.key_name === 'company.overtimeAllowance'){
      //       console.log("company.overtime", res.value)
      //       handleOt(res.value)
      //     }
      //   })
      // }))
    );
  }, []);

  const handleChange = (event, value, type) => {
    setChangedForm(true);
    setFormValues({
      ...formValues,
      [type]: value,
    });
    validationHandler(type, value);
  };

  const validationHandler = (name, value) => {
    setChangedForm(true);
    if (!Object.keys(formErrors).includes(name)) return;

    // if (['code', 'name', 'basicPay'].includes(name) && value.length > 0) {
    //   setFormErrors({
    //     ...formErrors,
    //     [name]: null,
    //   });
    //   return;
    // }

    if (requiredFields.includes(name) && !value) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });

      return;
    }
  };

  console.log('otType', otType)

  const handleAllowanceDeduction = (
    value,
    id,
    code,
    name,
    amount_type = null,
  ) => {
    setFormValues((prev) => {
      // allowance
      setChangedForm(true);
      if (name === 'allowance') {
        const isIdExists = prev.allowanceAmounts.find((i) => i.id === id);
        let all = [...prev.allowanceAmounts];
        if (isIdExists) {
          // console.log('sdfdsfs2');
          all = all.map((i) => {
            if (i.id === id) {
              i.amount = value === '' ? value : parseInt(value).toString();
              i.amount_type = code === 'OT' ? amount_type : null;
            }
            return i;
          });
        } else {
          all.push({
            id,
            amount: value === '' ? value : parseInt(value).toString(),
            allowance_code: code,
            amount_type: code === 'OT' ? amount_type : null,
          });
        }
        return {
          ...prev,
          allowanceAmounts: all,
        };
      } else {
        // deduction
        setChangedForm(true);
        const isIdExists = prev.deductionAmounts.find((i) => i.id === id);
        let all = [...prev.deductionAmounts];
        if (isIdExists) {
          all = all.map((i) => {
            if (i.id === id) {
              i.amount = value === '' ? value : parseInt(value).toString();
            }
            return i;
          });
        } else {
          all.push({
            id,
            amount: value === '' ? value : parseInt(value).toString(),
            deduction_code: code,
          });
        }
        return {
          ...prev,
          deductionAmounts: all,
        };
      }
    });
    setFormErrors({
      ...formErrors,
      [code]: null,
    })
    // if (code === 'BASIC') {
    //   validationHandler('basicPay', parseInt(value).toString());
    // }
  };
  // Inside your component where you handle the form submission
  const handleSubmit = async () => {
    setChangedForm(true);
    let isValid = true;
    let formErrorsObj = { ...formErrors };

    if (!formValues.grossAmount) {
      isValid = false;
      formErrorsObj.grossAmount = 'Amount is required';
    } else {
      formErrorsObj.grossAmount = null;
    }
  
    if (!formValues.name) {
      isValid = false;
      formErrorsObj.name = 'Salary Structure Name is required';
    } else {
      formErrorsObj.name = null;
    }

    if (!formValues.salary_template_id) {
      isValid = false;
      formErrorsObj.salary_template_id = 'Template Name is required';
    } else {
      formErrorsObj.salary_template_id = null;
    }
  
    const basicAllowance = formValues.allowanceAmounts.find(
      (i) => i.allowance_code === 'BASIC'
    );
    if (!basicAllowance || !basicAllowance.amount) {
      isValid = false;
      formErrorsObj.BASIC = 'Basic Pay is required';
    } else {
      formErrorsObj.BASIC = null;
    }
  
    formValues.allowanceAmounts.forEach((i) => {
      if (i.allowance_code !== 'BASIC' && !i.amount && i.allowance_code !== 'OT') {
        isValid = false;
        formErrorsObj[i.allowance_code] = 'Amount is Required';
      }
      if (i.allowance_code === 'OT' && ot && otType === 'FLAT' && !i.amount) {
        isValid = false;
        formErrorsObj[i.allowance_code] = 'Amount is Required';
      }
    });
  
    formValues.deductionAmounts.forEach((i) => {
      if (!i.amount) {
        isValid = false;
        formErrorsObj[i.deduction_code] = 'Amount is Required';
      }
    });

    setFormErrors(formErrorsObj);

    if (!isValid) {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return;
    }

    const payload = {
      ...formValues,
      auto_calculation: formValues.grossAutoCalculation === true ? 1 : 0,
    };

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(createSalaryStructureAction(payload, async (response) => {
        const res = await response
        if(res.data.status !== 'Structure Name already exists!' && res.status === 200) {
          props.handleClose();
        }
      })),
    );
    if (props.setSearchString) {
      props.setSearchString('');
    }
  };

  const handleUpdate = async () => {
    setChangedForm(true);
    let isValid = true;
    let formErrorsObj = {...formErrors};

    if (!formValues.grossAmount) {
      isValid = false;
      formErrorsObj.grossAmount = 'Amount is required';
    } else {
      formErrorsObj.grossAmount = null;
    }

    Object.keys(formValues).map((key, i) => {
      if (requiredFields.includes(key) && !formValues[key]) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      }
      return null;
    });

    const isExists = formValues.allowanceAmounts.find(
      (i) => i.allowance_code === 'BASIC',
    );
    isValid = isExists ? isExists.amount ? true : false : false;
    formErrorsObj['BASIC'] = isExists ? isExists.amount ? null : 'Basic Pay is required' : 'Basic Pay is required';

    formValues.allowanceAmounts.forEach(i => {
      if(!i.amount && i.allowance_code !== 'OT'){
        isValid = false
        formErrorsObj[i.allowance_code] = 'Amount is Required';
      }

      if(i.allowance_code === 'OT'){
        if(ot && otType === 'FLAT' && !i.amount){
          isValid = false
          formErrorsObj[i.allowance_code] = 'Amount is Required';
        }
      }
    })

    formValues.deductionAmounts.forEach(i => {
      if(!i.amount){
        isValid = false
        formErrorsObj[i.deduction_code] = 'Amount is Required';
      }
    })

    setFormErrors(formErrorsObj);

    if (!isValid) {
      return;
    }

    const payload = {
      ...formValues,
      auto_calculation: formValues.grossAutoCalculation === true ? 1 : 0,
    };

    await apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateSalaryStructureAction(props.edit_data.id, payload, async (response) => {
        const res = await response
        if(res.data.status !== 'Structure Name already exists!' && res.status === 200) {
          props.handleClose();
        }
      })),
    );
    if (props.setSearchString) {
      props.setSearchString('');
    }
  };

  const renderAllowanceTextFields = () => {
    const comp = formValues.allowanceAmounts
      .filter((i) => !['INC', 'OT', 'BASIC'].includes(i.allowance_code))
      .map((v) => (
        <Grid key={v.id} sx={{width: '100%', display: 'flex', gap: '10px'}}>
          <TextField
            id={`allowance-${v.id}`}
            label={`${v.allowance_name} Amount`}
            name={`allowance-${v.id}-amount`}
            value={
              formValues.allowanceAmounts.find((i) => i.allowance_code === v.allowance_code)?.amount 
              ? formValues.allowanceAmounts.find( (i) => i.allowance_code === v.allowance_code ).amount
              : " "
            }
            type='number'
            variant='filled'
            // defaultValue={" "}
            required={v.allowance_code === 'BASIC'}
            onChange={(event) => {
              const { value } = event.target
              if(value === '' || isNumber(value)){
                handleAllowanceDeduction(
                  value,
                  v.id,
                  v.allowance_code,
                  'allowance',
                )
              }
            }
            }
            error={!!formErrors[v.allowance_code]}
            helperText={formErrors[v.allowance_code] }
          />
          <TextField label={`Code`} value={v.allowance_code} variant='filled' />
          <IconButton
            onClick={() => {
              handleRemoveItems(v.id, 'allowance', v.allowance_code);
            }}
          >
            <CancelIcon />
          </IconButton>
        </Grid>
      ));

    return comp;
  };
  const renderDeductionTextFields = () => {
    return formValues.deductionAmounts.map((v) => (
      <Grid key={v.id} sx={{width: '100%', display: 'flex', gap: '10px'}}>
        <TextField
          id={`deduction-${v.id}`}
          label={`${v.deduction_name} Amount`}
          value={
            formValues.deductionAmounts.find((i) => i.deduction_code === v.deduction_code)?.amount 
            ? formValues.deductionAmounts.find((i) => i.deduction_code === v.deduction_code).amount
            : " "
          }
          name={`deduction-${v.id}-amount`}
          style={{textTransform:'capitalize'}}
          type='number'
          variant='filled'
          onChange={(event) => {
            const { value } = event.target
            if(value === '' || isNumber(value)){
              handleAllowanceDeduction(
                event.target.value,
                v.id,
                v.deduction_code,
                'deduction',
              )
            }
          }}
          error={!!formErrors[v.deduction_code]}
          helperText={formErrors[v.deduction_code] }
        />
        <TextField label={`Code`} value={v.deduction_code} variant='filled' />
        <IconButton
          onClick={() => {
            handleRemoveItems(v.id, 'deduction', v.deduction_code);
          }}
        >
          <CancelIcon />
        </IconButton>
      </Grid>
    ));
  };

  const handleAddItem = (e) => {
    // console.log(itemSelected);
    setChangedForm(true);
    if (!itemSelected.value) return;

    if(itemSelected.name === 'allowance'){
      setAllowanceItemAdded((prev) => {
        prev.push(itemSelected.value);
        return prev;
      });
    }else{
      setDeductionsItemAdded((prev) => {
        prev.push(itemSelected.value);
        return prev;
      });
    }

    setItemSelected({name: null, value: null});
    setFormValues((prev) => {
      if (itemSelected.name === 'allowance') {
        const allowanceSelected = AllowanceType.find(
          (i) => i.id === itemSelected.value,
        );
        prev.allowanceAmounts.push({...allowanceSelected});
        return prev;
      } else {
        const deductionSelected = deductionType.find(
          (i) => i.id === itemSelected.value,
        );
        prev.deductionAmounts.push({...deductionSelected});
        return prev;
      }
    });
  };

  const handleRemoveItems = (id, type, code) => {
    setChangedForm(true);
    if(type === 'allowance'){
      setAllowanceItemAdded((prev) => {
        return prev.filter((i) => i !== id);
      });
    }else{
      setDeductionsItemAdded((prev) => {
        return prev.filter((i) => i !== id);
      });
    }

    setFormErrors({
      ...formErrors,
      [code]: null
    })
 
    setFormValues((prev) => {
      if (type === 'allowance') {
        const all = prev.allowanceAmounts.filter((i) => i.id !== id);
        prev.allowanceAmounts = all;
        return prev;
      } else {
        const all = prev.deductionAmounts.filter((i) => i.id !== id);
        prev.deductionAmounts = all;
        return prev;
      }
    });
  };

  const handleCreateType = () => {
    // console.log(createType);

    dispatch(
      createAllowanceDeductionTypesAction(createType, (data) => {
        // console.log('ddsdeeeeee', data);
        if (createType.open === 'allowance') {
          dispatch({
            type: GET_ALLOWANCE_TYPE,
            payload: [...AllowanceType, data],
          });
          dispatch(getAllowanceType(storage.company_id))
        } else {
          dispatch({
            type: GET_DEDUCTION_TYPE,
            payload: [...deductionType, data],
          });
        dispatch(getDeductionType(storage.company_id))
        }
        setCreateType({open: null, name: null, code: null});
      }),
    );
    // setCreateLedgerText('');
    // setLedgerCreateOpen(false);
  };

  const checkDeleteType = (e, type, id) => {
    e.stopPropagation();

    // console.log({type, id});

    dispatch(
      checkDeleteAllowanceDeductionTypesAction({type, id}, (data) => {
        setDeleteType({open: true, id, type});
      }),
    );
  };

  const handleDeleteType = (id) => {
    // console.log('ffdfd', id);
    dispatch(
      deleteAllowanceDeductionTypesAction(deleteType, (data) => {
        if (deleteType.type === 'allowance') {
          dispatch({
            type: GET_ALLOWANCE_TYPE,
            payload: AllowanceType.filter((i) => i.id !== id),
          });
        } else {
          dispatch({
            type: GET_DEDUCTION_TYPE,
            payload: deductionType.filter((i) => i.id !== id),
          });
        }
        setDeleteType({open: false, id: null, type: null});
      }),
    );
  };

  const handleOt = async (val) => {
    // let isChecked = val === "true" ? true : false
    await setOt(val);
    // setOtType('FLAT');
    if (!val) {
      const allwList = AllowanceType.map((i) => ({
        ...i,
        amount: props.edit_data[i.allowance_code],
        amount_type: props.edit_data[`${i.allowance_code}_amount_type`],
      })).filter((i) => i.allowance_code === 'OT' || i.amount);
    
      const flat = allwList.find((i) => i.allowance_code === 'OT');

if (flat) {
  handleAllowanceDeduction(
    '',
    flat.id,
    flat.allowance_code
  );
} else {
}
    }
  };

  const salaryTemplateChange = (event, newValue) => {
    if (newValue) {
      const isTemplateChanged =
        formValues.salary_template_id !== null &&
        formValues.salary_template_id !== newValue.id;

      const allowanceAmounts = [];
      const deductionAmounts = [];

      AllowanceType.forEach(allowance => {
        const code = allowance.allowance_code;
        if (newValue.hasOwnProperty(code) && newValue[code] !== null) {
          allowanceAmounts.push({
            id: allowance.id,
            allowance_name: allowance.allowance_name,
            allowance_code: code,
            amount: newValue[code],
            amount_type: newValue[`${code}_amount_type`] || null,
            isTaxable: allowance.isTaxable,
            isPF: allowance.isPF,
            isESI: allowance.isESI,
            rule: allowance.rule
          });

          setAllowanceItemAdded(prev => [...prev, allowance.id]);
        }
      });

      deductionType.forEach(deduction => {
        const code = deduction.deduction_code;
        if (newValue.hasOwnProperty(code) && newValue[code] !== null) {
          deductionAmounts.push({
            id: deduction.id,
            deduction_name: deduction.deduction_name,
            deduction_code: code,
            amount: newValue[code],
            amount_type: newValue[`${code}_amount_type`] || 'FLAT'
          });

          setDeductionsItemAdded(prev => [...prev, deduction.id]);
        }
      });

      const otAllowance = allowanceAmounts.find(a => a.allowance_code === 'OT');
      if (otAllowance) {
        setOt(true);
        setOtType(otAllowance.amount_type || 'FLAT');
      } else {
        setOt(false);
        setOtType('');
      }

      setFormValues({
        ...formValues,
        salary_template_id: newValue.id,
        salary_template_name: newValue.name,
        grossAmount: isTemplateChanged ? '' : formValues.grossAmount,
        monthly_ctc: isTemplateChanged ? '' : formValues.monthly_ctc,
        ctc: isTemplateChanged ? '' : formValues.ctc,
        net_pay: isTemplateChanged ? '' : formValues.net_pay,
        grossAutoCalculation: isTemplateChanged ? false : formValues.grossAutoCalculation,
        allowanceAmounts: isTemplateChanged ? [] : allowanceAmounts,
        deductionAmounts: isTemplateChanged ? [] : deductionAmounts
      });

      if (isTemplateChanged) {
        setAllowanceItemAdded([]);
        setDeductionsItemAdded([]);
        setSummarySource('grossAmount');
      }

      setFormErrors({
        ...formErrors,
        salary_template_id: null
      });
    } else {
      setFormValues({
        ...formValues,
        salary_template_id: null,
        salary_template_name: null,
        grossAmount: '',
        monthly_ctc: '',
        ctc: '',
        net_pay: '',
        grossAutoCalculation: false,
        allowanceAmounts: [],
        deductionAmounts: []
      });

      setAllowanceItemAdded([]);
      setDeductionsItemAdded([]);
      setOt(false);
      setOtType('');
      setSummarySource('grossAmount');
    }
  };

  useEffect(() => {
    if(props.type === 'contactStructure') {
      setFormValues((prev) => ({
        ...prev,
        salary_template_id: props.templateId
      }))
      dispatch(getStructureBasedTemplateAction({ id: props.templateId }));
    }
  }, [props.type])

  useEffect(() => {
    if(formValues.salary_template_id !== null) {
      const tempId = formValues.salary_template_id
      dispatch(getSalaryTemplateByIdAction(tempId))
    }
    else {
      dispatch(setSalaryTemplateByIdAction([]))
    }
  }, [formValues.salary_template_id])

  const formatAmount = (amount) => {
    if (amount === '' || amount === null || amount === undefined) return '';
    const num = Number(amount);
    if (Number.isNaN(num)) return '';
    return Math.round(num).toString();
  };

  const calculatePercentAmount = (grossAmount, percentage) => {
    const gross = Number(grossAmount);
    const percent = Number(percentage);

    if (!gross || !percent) {
      return '';
    }

    return formatAmount((gross * percent) / 100);
  };

  const getAllowancePercentage = (allowanceCode) => {
    return AllowanceType.find((item) => item.allowance_code === allowanceCode)?.percentage;
  };

  const getDeductionPercentage = (deductionCode) => {
    return deductionType.find((item) => item.deduction_code === deductionCode)?.percentage;
  };

  const getTemplateDeductionCodes = () => {
    return (getTemplateById?.deduction || []).map((item) => item.deduction_code);
  };

  const getPfEligibleAllowanceCodes = () => {
    return [
      ...(getTemplateById?.basics || []),
      ...(getTemplateById?.allowance || []),
    ]
      .filter((item) => Number(item?.isPF) === 1)
      .map((item) => item.allowance_code);
  };

  const getEsiEligibleAllowanceCodes = () => {
    return [
      ...(getTemplateById?.basics || []),
      ...(getTemplateById?.allowance || []),
    ]
      .filter((item) => Number(item?.isESI) === 1)
      .map((item) => item.allowance_code);
  };

  const calculatePfAmount = (allowanceAmounts = []) => {
    const pfList = Array.isArray(pfesipt?.pf) ? pfesipt.pf : [];
    const activePf = pfList.length > 0 ? pfList[0] : null;
    const templateDeductionCodes = getTemplateDeductionCodes();

    if (activePf?.pf_enabled !== 1 || !templateDeductionCodes.includes('EPF')) {
      return 0;
    }

    const pfRate = Number(activePf.rate_category);
    const wageCeiling = Number(activePf.wage_ceiling) || 15000;
    const pfEligibleCodes = getPfEligibleAllowanceCodes();

    const pfBasisAmount = allowanceAmounts.reduce((sum, item) => {
      if (!pfEligibleCodes.includes(item?.allowance_code)) {
        return sum;
      }

      const amount = Number(item?.amount);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

    const pfWage = pfBasisAmount > wageCeiling ? wageCeiling : pfBasisAmount;
    return Number.isNaN(pfRate) ? 0 : (pfWage * pfRate) / 100;
  };

  const calculateEsiAmount = (grossAmount, allowanceAmounts = [], rateKey = 'employee_rate') => {
    const gross = Number(grossAmount);
    const esiList = Array.isArray(pfesipt?.esi) ? pfesipt.esi : [];
    const activeEsi = esiList.length > 0 ? esiList[0] : null;
    const templateDeductionCodes = getTemplateDeductionCodes();

    if (
      !grossAmount ||
      Number.isNaN(gross) ||
      activeEsi?.esi_enabled !== 1 ||
      !templateDeductionCodes.includes('ESI')
    ) {
      return 0;
    }

    const wageCeiling = Number(activeEsi.wage_ceiling) || 21000;
    const esiRate = Number(activeEsi[rateKey]);
    const esiEligibleCodes = getEsiEligibleAllowanceCodes();
    const esiBasisAmount = allowanceAmounts.length > 0
      ? allowanceAmounts.reduce((sum, item) => {
          if (!esiEligibleCodes.includes(item?.allowance_code)) {
            return sum;
          }

          const amount = Number(item?.amount);
          return sum + (Number.isNaN(amount) ? 0 : amount);
        }, 0)
      : gross;

    if (esiBasisAmount > wageCeiling || Number.isNaN(esiRate)) {
      return 0;
    }

    return (esiBasisAmount * esiRate) / 100;
  };

  const calculatePtAmount = (grossAmount) => {
    const gross = Number(grossAmount);
    const halfYearGross = gross * 6;
    const ptList = Array.isArray(pfesipt?.pt) ? pfesipt.pt : [];
    const activePt = ptList.length > 0 ? ptList[0] : null;
    const templateDeductionCodes = getTemplateDeductionCodes();

    if (
      !grossAmount ||
      Number.isNaN(gross) ||
      activePt?.pt_enabled !== 1 ||
      !templateDeductionCodes.includes('PT')
    ) {
      return 0;
    }

    const matchedSlab = (Array.isArray(ptslabs) ? ptslabs : []).find((slab) => {
      const incomeFrom = Number(slab?.income_from) || 0;
      const incomeTo = Number(slab?.income_to);

      if (Number.isNaN(incomeTo) || incomeTo === 0) {
        return halfYearGross >= incomeFrom;
      }

      return halfYearGross >= incomeFrom && halfYearGross <= incomeTo;
    });

    return matchedSlab ? (Number(matchedSlab.tax_half_year) || 0) / 6 : 0;
  };

  const calculateNetPay = (grossAmount, deductionAmounts = [], allowanceAmounts = []) => {
    const gross = Number(grossAmount);

    if (!grossAmount || Number.isNaN(gross)) {
      return '';
    }

    const pfAmount = calculatePfAmount(allowanceAmounts);
    const esiAmount = calculateEsiAmount(grossAmount, allowanceAmounts, 'employee_rate');
    const ptAmount = calculatePtAmount(grossAmount);

    if (pfAmount > 0 || esiAmount > 0 || ptAmount > 0) {
      return formatAmount(gross - pfAmount - esiAmount - ptAmount);
    }

    const totalDeductions = deductionAmounts.reduce((sum, item) => {
      const amount = Number(item?.amount);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

    return formatAmount(gross - totalDeductions);
  };

  const calculatePfAmountFromGross = (grossAmount) => {
    const {allowanceAmounts} = buildCalculatedAmounts(
      grossAmount,
      formValues.allowanceAmounts,
      formValues.deductionAmounts,
    );

    return formatAmount(calculatePfAmount(allowanceAmounts));
  };

  const calculatePfAmountFromMonthlyCtc = (monthlyCtcValue) => {
    const monthlyCtc = Number(monthlyCtcValue);

    if (!monthlyCtcValue || Number.isNaN(monthlyCtc)) {
      return 0;
    }

    const pfList = Array.isArray(pfesipt?.pf) ? pfesipt.pf : [];
    const activePf = pfList.length > 0 ? pfList[0] : null;

    if (activePf?.pf_enabled !== 1) {
      return 0;
    }

    const pfRate = Number(activePf.rate_category);
    const wageCeiling = Number(activePf.wage_ceiling) || 15000;
    const pfWage = monthlyCtc > wageCeiling ? wageCeiling : monthlyCtc;

    return Number.isNaN(pfRate) ? 0 : (pfWage * pfRate) / 100;
  };

  const calculateEsiAmountFromGross = (grossAmount) => {
    const {allowanceAmounts} = buildCalculatedAmounts(
      grossAmount,
      formValues.allowanceAmounts,
      formValues.deductionAmounts,
    );

    return formatAmount(calculateEsiAmount(grossAmount, allowanceAmounts, 'employee_rate'));
  };

  const calculateEmployerEsiAmountFromGross = (grossAmount) => {
    const {allowanceAmounts} = buildCalculatedAmounts(
      grossAmount,
      formValues.allowanceAmounts,
      formValues.deductionAmounts,
    );

    return formatAmount(calculateEsiAmount(grossAmount, allowanceAmounts, 'employer_rate'));
  };

  const calculatePtAmountFromGross = (grossAmount) => {
    return formatAmount(calculatePtAmount(grossAmount));
  };

  const deriveGrossFromMonthlyCtc = (monthlyCtcValue) => {
    const monthlyCtc = Number(monthlyCtcValue);

    if (!monthlyCtcValue || Number.isNaN(monthlyCtc)) {
      return '';
    }

    let grossAmount = monthlyCtc;

    for (let i = 0; i < 8; i += 1) {
      const pfAmount = Number(calculatePfAmountFromGross(grossAmount)) || 0;
      const employerEsiAmount = Number(calculateEmployerEsiAmountFromGross(grossAmount)) || 0;
      const ptAmount = Number(calculatePtAmountFromGross(grossAmount)) || 0;
      grossAmount = monthlyCtc - pfAmount - employerEsiAmount - ptAmount;
    }

    return formatAmount(grossAmount);
  };

  const deriveGrossFromNetPay = (netPayValue) => {
    const netPay = Number(netPayValue);

    if (!netPayValue || Number.isNaN(netPay)) {
      return '';
    }

    let grossAmount = netPay;

    for (let i = 0; i < 8; i += 1) {
      const pfAmount = Number(calculatePfAmountFromGross(grossAmount)) || 0;
      const esiAmount = Number(calculateEsiAmountFromGross(grossAmount)) || 0;
      const ptAmount = Number(calculatePtAmountFromGross(grossAmount)) || 0;
      grossAmount = netPay + pfAmount + esiAmount + ptAmount;
    }

    return formatAmount(grossAmount);
  };

  const deriveGrossFromSummaryFields = (values, preferredSource = 'grossAmount') => {
    if (preferredSource === 'monthly_ctc' && values.monthly_ctc) {
      return deriveGrossFromMonthlyCtc(values.monthly_ctc);
    }

    if (preferredSource === 'ctc' && values.ctc) {
      return deriveGrossFromMonthlyCtc(formatAmount(Number(values.ctc) / 12));
    }

    if (preferredSource === 'net_pay' && values.net_pay) {
      return deriveGrossFromNetPay(values.net_pay);
    }

    if (preferredSource === 'grossAmount' && values.grossAmount) {
      return values.grossAmount;
    }

    if (values.monthly_ctc) {
      return deriveGrossFromMonthlyCtc(values.monthly_ctc);
    }

    if (values.ctc) {
      return deriveGrossFromMonthlyCtc(formatAmount(Number(values.ctc) / 12));
    }

    if (values.net_pay) {
      return deriveGrossFromNetPay(values.net_pay);
    }

    return values.grossAmount || '';
  };

  const buildCalculatedAmounts = (grossAmount, prevAllowanceAmounts = [], prevDeductionAmounts = []) => {
    const gross = Number(grossAmount);

    if (!grossAmount || Number.isNaN(gross)) {
      return {
        allowanceAmounts: prevAllowanceAmounts,
        deductionAmounts: prevDeductionAmounts,
      };
    }

    const existingAllowanceMap = new Map(prevAllowanceAmounts.map((item) => [item.id, item]));
    const existingDeductionMap = new Map(prevDeductionAmounts.map((item) => [item.id, item]));
    const nextAllowanceMap = new Map();
    const nextDeductionMap = new Map(existingDeductionMap);

    (getTemplateById?.basics || []).forEach((item) => {
      const amount = calculatePercentAmount(grossAmount, getAllowancePercentage(item.allowance_code));

      nextAllowanceMap.set(item.basic_id, {
        ...(existingAllowanceMap.get(item.basic_id) || {}),
        id: item.basic_id,
        amount: amount || '',
        allowance_code: item.allowance_code,
        amount_type: null,
      });
    });

    (getTemplateById?.allowance || []).forEach((item) => {
      const amount = calculatePercentAmount(grossAmount, getAllowancePercentage(item.allowance_code));

      nextAllowanceMap.set(item.allowance_id, {
        ...(existingAllowanceMap.get(item.allowance_id) || {}),
        id: item.allowance_id,
        amount: amount || '',
        allowance_code: item.allowance_code,
        amount_type: null,
      });
    });

    const calculatedAllowanceAmounts = Array.from(nextAllowanceMap.values());
    const calculatedPfAmount = formatAmount(calculatePfAmount(calculatedAllowanceAmounts));
    const calculatedEsiAmount = formatAmount(
      calculateEsiAmount(grossAmount, calculatedAllowanceAmounts, 'employee_rate'),
    );
    const calculatedPtAmount = formatAmount(calculatePtAmount(grossAmount));

    (getTemplateById?.deduction || []).forEach((item) => {
      const amount = item.deduction_code === 'EPF'
        ? calculatedPfAmount
        : item.deduction_code === 'ESI'
        ? calculatedEsiAmount
        : item.deduction_code === 'PT'
        ? calculatedPtAmount
        : calculatePercentAmount(grossAmount, getDeductionPercentage(item.deduction_code));

      nextDeductionMap.set(item.deduction_id, {
        ...(existingDeductionMap.get(item.deduction_id) || {}),
        id: item.deduction_id,
        amount: amount || '',
        deduction_code: item.deduction_code,
      });
    });

    return {
      allowanceAmounts: Array.from(nextAllowanceMap.values()),
      deductionAmounts: Array.from(nextDeductionMap.values()),
    };
  };

  const applyAutoCalculatedAmounts = (grossAmount) => {
    setFormValues((prev) => {
      const {allowanceAmounts, deductionAmounts} = buildCalculatedAmounts(
        grossAmount,
        prev.allowanceAmounts,
        prev.deductionAmounts,
      );

      return {
        ...prev,
        allowanceAmounts,
        deductionAmounts,
      };
    });
  };

  useEffect(() => {
    if (!formValues.grossAutoCalculation) {
      return;
    }

    if (!formValues.grossAmount) {
      return;
    }

    applyAutoCalculatedAmounts(formValues.grossAmount);
  }, [
    formValues.grossAutoCalculation,
    formValues.grossAmount,
    AllowanceType,
    deductionType,
    getTemplateById,
  ]);

  useEffect(() => {
    if (!formValues.grossAutoCalculation) {
      return;
    }

    if (!formValues.grossAmount) {
      return;
    }

    setFormValues((prev) => {
      const pfAmount = Number(calculatePfAmount(prev.allowanceAmounts)) || 0;
      const employerEsiAmount = Number(
        calculateEsiAmount(prev.grossAmount, prev.allowanceAmounts, 'employer_rate'),
      ) || 0;
      const ptAmount = Number(calculatePtAmount(prev.grossAmount)) || 0;
      const calculatedMonthlyCtc = prev.grossAmount
        ? formatAmount(Number(prev.grossAmount) + pfAmount + employerEsiAmount + ptAmount)
        : '';
      const monthly_ctc =
        summarySource === 'monthly_ctc'
          ? prev.monthly_ctc || ''
          : summarySource === 'ctc'
          ? (prev.ctc ? formatAmount(Number(prev.ctc) / 12) : '')
          : calculatedMonthlyCtc;
      const ctc = summarySource === 'ctc'
        ? prev.ctc || ''
        : monthly_ctc
        ? formatAmount(Number(monthly_ctc) * 12)
        : '';
      const net_pay = calculateNetPay(
        prev.grossAmount,
        prev.deductionAmounts,
        prev.allowanceAmounts,
      );

      if (
        prev.monthly_ctc === monthly_ctc &&
        prev.ctc === ctc &&
        prev.net_pay === net_pay
      ) {
        return prev;
      }

      return {
        ...prev,
        monthly_ctc,
        ctc,
        net_pay,
      };
    });
  }, [formValues.grossAutoCalculation, formValues.grossAmount, formValues.deductionAmounts, formValues.allowanceAmounts, pfesipt, summarySource]);

  const handleAmountChange = (value, item, index) => {
    if (isAutoCalculatedFieldLock) {
      return;
    }

    if(formValues.allowanceAmounts.find(d => d.id === item.basic_id)) {
      const updatedAmount = formValues.allowanceAmounts.map((d => {
        if(d.id === item.basic_id) {
          return {
            id: item.basic_id,
            amount: value,
            allowance_code: item.allowance_code,
            amount_type: null
          }
        }
        else {
          return d
        }
      }))
      setFormValues((prev) => ({
        ...prev,
        allowanceAmounts: updatedAmount
      }))
    }
    else {
      const updatedAmount = [...formValues.allowanceAmounts]
      updatedAmount.push({
        id: item.basic_id,
        amount: value,
        allowance_code: item.allowance_code,
        amount_type: null
      })
      setFormValues((prev) => ({
        ...prev,
        allowanceAmounts: updatedAmount
      }))
    }
  }

  const handleAllowanceChange = (value, item, index) => {
    if (isAutoCalculatedFieldLock) {
      return;
    }

    if(formValues.allowanceAmounts.find(d => d.id === item.allowance_id)) {
      const updatedAllowanceAmount = formValues.allowanceAmounts.map((d => {
        if(d.id === item.allowance_id) {
          return {
            id: item.allowance_id,
            amount: value,
            allowance_code: item.allowance_code,
            amount_type: null
          }
        }
        else {
          return d
        }
      }))
      setFormValues((prev) => ({
        ...prev,
        allowanceAmounts: updatedAllowanceAmount
      }))
    }
    else {
      const updatedAllowanceAmount = [...formValues.allowanceAmounts]
      updatedAllowanceAmount.push({
        id: item.allowance_id,
        amount: value,
        allowance_code: item.allowance_code,
        amount_type: null
      })
      setFormValues((prev) => ({
        ...prev,
        allowanceAmounts: updatedAllowanceAmount
      }))
    }
  }

  const handleDeductionChange = (value, item, index) => {
    if (isAutoCalculatedFieldLock) {
      return;
    }

    const updatedDeductionAmount = [...formValues.deductionAmounts]
    updatedDeductionAmount[index] = {
      id: item.deduction_id,
      amount: value,
      deduction_code: item.deduction_code,
    }
    setFormValues((prev) => ({
      ...prev,
      deductionAmounts: updatedDeductionAmount
    }))
  }

  const handleGrossAmountChange = (name, value) => {
    setChangedForm(true);
    setSummarySource(name);
    if (!formValues.grossAutoCalculation) {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
      return;
    }

    let derivedGrossAmount = value;
    let derivedMonthlyCtc = value;

    if (name === 'monthly_ctc') {
      derivedGrossAmount = deriveGrossFromMonthlyCtc(value);
    } else if (name === 'ctc') {
      derivedMonthlyCtc = value === '' ? '' : formatAmount(Number(value) / 12);
      derivedGrossAmount = value === '' ? '' : deriveGrossFromMonthlyCtc(derivedMonthlyCtc);
    } else if (name === 'net_pay') {
      derivedGrossAmount = deriveGrossFromNetPay(value);
    }

    setFormValues((prev) => ({
      ...prev,
      grossAmount: derivedGrossAmount,
      monthly_ctc:
        name === 'monthly_ctc'
          ? value
          : name === 'ctc'
          ? derivedMonthlyCtc
          : derivedGrossAmount,
      ctc: name === 'ctc' ? value : derivedGrossAmount === '' ? '' : formatAmount(Number(derivedGrossAmount) * 12),
      net_pay: name === 'net_pay' ? value : prev.net_pay,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  }

  const handleCheckboxChange = (event) => {
    const {name, checked} = event.target;

    setFormValues((prev) => {
      if (name === 'grossAutoCalculation' && !checked) {
        setSummarySource('grossAmount');
        return {
          ...prev,
          [name]: checked,
          grossAmount: '',
          monthly_ctc: '',
          ctc: '',
          net_pay: '',
          allowanceAmounts: [],
          deductionAmounts: [],
        };
      }

      if (name === 'grossAutoCalculation' && checked) {
        const preferredSource = prev.net_pay
          ? 'net_pay'
          : prev.ctc
          ? 'ctc'
          : prev.monthly_ctc
          ? 'monthly_ctc'
          : 'grossAmount';

        if (prev.net_pay) {
          setSummarySource('net_pay');
        } else if (prev.ctc) {
          setSummarySource('ctc');
        } else if (prev.monthly_ctc) {
          setSummarySource('monthly_ctc');
        } else {
          setSummarySource('grossAmount');
        }

        const derivedGrossAmount = deriveGrossFromSummaryFields(prev, preferredSource);

        return {
          ...prev,
          [name]: checked,
          grossAmount: derivedGrossAmount,
          monthly_ctc: prev.monthly_ctc || derivedGrossAmount,
          ctc: prev.ctc || (derivedGrossAmount ? formatAmount(Number(derivedGrossAmount) * 12) : ''),
          net_pay: prev.net_pay,
        };
      }

      return {
        ...prev,
        [name]: checked,
      };
    });

    if (name === 'grossAutoCalculation' && checked) {
      const preferredSource = formValues.net_pay
        ? 'net_pay'
        : formValues.ctc
        ? 'ctc'
        : formValues.monthly_ctc
        ? 'monthly_ctc'
        : 'grossAmount';
      const derivedGrossAmount = deriveGrossFromSummaryFields(formValues, preferredSource);
      if (derivedGrossAmount) {
        applyAutoCalculatedAmounts(derivedGrossAmount);
      }
    }
  };

  const clubAllowance = [...(getTemplateById?.basics || []), ...(getTemplateById?.allowance || [])]
  const disbleAllowance = (typeof formValues?.name === 'object' && formValues.name !== null) || clubAllowance.length === formValues.allowanceAmounts.length
  const disbleDeductions = (typeof formValues?.name === 'object' && formValues.name !== null) ||  getTemplateById.deduction?.length === formValues.deductionAmounts.length

  const disbleEditAllowance = formValues.allowanceAmounts.some((item) => {
    return (item.amount === '' || item.amount === null)
  })
  const disbleEditDeduction = formValues.deductionAmounts.some((item) => {
    return (item.amount === '' || item.amount === null)
  })

  console.log(formValues, 'tnbhythh')
  const autoCalculationDisable = salaryPercent.length > 0 && salaryPercent[0]?.value === '0'
  const isAutoCalculatedFieldLock =
    salaryPercent.length > 0 &&
    salaryPercent[0]?.value === '1' &&
    formValues.grossAutoCalculation;
  // console.log('allvalue', {formValues, formErrors, itemSelected, allowanceItemAdded, deductionsItemAdded});
  return (
    <div>
      <Card
    width="100%"
    elevation={3}
    style={{ padding: '10px'}}
    sx={{
      height: 'calc(100vh - 80px)',
      bgcolor: '#f8fafc',
      borderRadius: 3,
      overflow: 'auto',
      pb: 10,
    }}
  >


        <Typography
          className='page-title'
        >
          {props.status === 'edit'
            ? 'Edit Salary Structure'
            : 'New Salary Structure'}
        </Typography>
        <Grid
          container
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          spacing={5}
          padding={{xs: 3, md: 4}}
        >
          <Grid size={{ lg: 11, md: 11, sm: 12, xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: {xs: 2, md: 3},
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
            <Grid container spacing={3}>
              {
                  props.type !== 'contactStructure' &&
                  <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
                  <Autocomplete
                    options={salaryTemplateList}
                    getOptionLabel={(option) => option.name || 'N/A'}
                    value={
                      salaryTemplateList.find(
                        (item) => item.id === formValues.salary_template_id
                      ) || null
                    }
                    onChange={salaryTemplateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Template"
                        variant="filled"
                        fullWidth
                        required
                        error={formErrors.salary_template_id !== null}
                        helperText={formErrors.salary_template_id || ''}
                      />
                    )}
                  />
                </Grid>
              }

              <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
                {
                  props.type === 'contactStructure' ? (
                  <Autocomplete
                    freeSolo
                    options={structureBasedTemplate || []}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") return option;
                      return option?.name || "";
                    }}
                    value={formValues.name || ''}
                    onChange={(event, newValue) => {
                      handleChange(event, newValue, 'name');
                    }}
                    onInputChange={(event, newInputValue) => {
                      handleChange(event, newInputValue, 'name');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Salary Structure Name"
                        variant="filled"
                        required
                        placeholder="eg: EXECUTIVE-2024"
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                      />
                    )}
                  /> 
                  ): (
                    <TextField
                      fullWidth={true}
                      id='outlined-name'
                      label='Salary Structure Name'
                      value={formValues.name}
                      name='name'
                      type={'text'}
                      variant='filled'
                      required
                      placeholder='eg: EXECUTIVE-2024'
                      onChange={(event, value) =>
                        handleChange(event, event.target.value, 'name')
                      }
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  )
                }
              </Grid>

              {
                getTemplateById?.basics?.length > 0 &&
                (typeof formValues.name === 'string' || formValues.name === null) &&
                <>
                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        px: {xs: 2.5, md: 3},
                        py: 2,
                        borderRadius: 3,
                        bgcolor: '#f8fbff',
                        border: '1px solid',
                        borderColor: '#d9e6f2',
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.25 }}>
                      Pay Details
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Review gross amount and base pay before entering earnings and deductions.
                    </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: {xs: 2.5, md: 3},
                        borderRadius: 4,
                        bgcolor: '#ffffff',
                        border: '1px solid',
                        borderColor: '#dbe4f0',
                        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                      }}
                    >
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2.5} alignItems="center">
                          <Grid size={{ lg: 2.5, md: 3, sm: 4, xs: 12 }}>
                            <Box>
                              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                Gross
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                Monthly gross salary
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ lg: 4.5, md: 5, sm: 8, xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Gross Amount"
                              type="number"
                              value={formValues.grossAmount || ''}
                              variant="filled"
                              size="small"
                              name='grossAmount'
                              required
                              error={!!formErrors.grossAmount}
                              helperText={formErrors.grossAmount}
                              onChange={(e) => handleGrossAmountChange('grossAmount', e.target.value)}
                              slotProps={{
                                input: {
                                  startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                },
                              }}
                              sx={{
                                '& .MuiFilledInput-root': {
                                  borderRadius: 2.5,
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #e5eaf1',
                                },
                              }}
                            />
                          </Grid>

                          <Grid size={{ lg: 5, md: 4, sm: 12, xs: 12 }}>
                            <Box
                              sx={{
                                px: 2,
                                py: 1.25,
                                borderRadius: 3,
                                bgcolor: '#f8fbff',
                                border: '1px solid',
                                borderColor: '#d9e6f2',
                                minHeight: 64,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <FormControlLabel
                                sx={{
                                  ml: 0,
                                  mr: 0,
                                  width: '100%',
                                  justifyContent: 'space-between',
                                }}
                                control={
                                  <Checkbox
                                    name="grossAutoCalculation"
                                    checked={formValues.grossAutoCalculation}
                                    onChange={handleCheckboxChange}
                                    disabled={autoCalculationDisable}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                      Auto calculation
                                    </Typography>
                                    <Typography variant='caption' color='text.secondary'>
                                      Use percentage-based auto fill
                                    </Typography>
                                  </Box>
                                }
                                labelPlacement='start'
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2.5} alignItems="center">
                          <Grid size={{ lg: 2.5, md: 3, sm: 4, xs: 12 }}>
                            <Box>
                              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                Monthly CTC
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                Monthly cost to company
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ lg: 4.5, md: 5, sm: 8, xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Monthly CTC"
                              type="number"
                              value={formValues.monthly_ctc || ''}
                              variant="filled"
                              size="small"
                              name='monthly_ctc'
                              onChange={(e) => handleGrossAmountChange('monthly_ctc', e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiFilledInput-root': {
                                  borderRadius: 2.5,
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #e5eaf1',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2.5} alignItems="center">
                          <Grid size={{ lg: 2.5, md: 3, sm: 4, xs: 12 }}>
                            <Box>
                              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                Yearly CTC
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                Annual cost to company
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ lg: 4.5, md: 5, sm: 8, xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Yearly CTC"
                              type="number"
                              value={formValues.ctc || ''}
                              variant="filled"
                              size="small"
                              name='ctc'
                              error={!!formErrors.ctc}
                              helperText={formErrors.ctc}
                              onChange={(e) => handleGrossAmountChange('ctc', e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiFilledInput-root': {
                                  borderRadius: 2.5,
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #e5eaf1',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Grid container spacing={2.5} alignItems="center">
                          <Grid size={{ lg: 2.5, md: 3, sm: 4, xs: 12 }}>
                            <Box>
                              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                Netpay
                              </Typography>
                              <Typography variant='body2' color='text.secondary'>
                                Final take-home amount
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={{ lg: 4.5, md: 5, sm: 8, xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Netpay"
                              type="number"
                              value={formValues.net_pay || ''}
                              variant="filled"
                              size="small"
                              name='net_pay'
                              error={!!formErrors.net_pay}
                              helperText={formErrors.net_pay}
                              onChange={(e) => handleGrossAmountChange('net_pay', e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                              }}
                              sx={{
                                '& .MuiFilledInput-root': {
                                  borderRadius: 2.5,
                                  bgcolor: '#f8fafc',
                                  border: '1px solid #e5eaf1',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                    </Grid>

                  {getTemplateById?.basics?.map((item, index) => (
                    <Grid
                      container
                      spacing={2.5}
                      alignItems="center"
                      key={index}
                      sx={{
                        mt: index === 0 ? 2.5 : 1.5,
                        pt: 1.5,
                        borderTop: '1px dashed',
                        borderColor: '#e7ebf0',
                      }}
                    >
                      <Grid size={{ lg: 2.5, md: 3, sm: 4, xs: 12 }}>
                        <Box>
                          <Typography variant='h6' sx={{ fontWeight: 700 }}>
                            {item.allowance_code}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Basic pay component
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ lg: 4.5, md: 5, sm: 8, xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Basic Amount"
                          type="number"
                          value={formValues.allowanceAmounts.find(i => i.id === item.basic_id)?.amount || ''}
                          variant="filled"
                          size="small"
                          required
                          disabled={isAutoCalculatedFieldLock}
                          onChange={(e) => handleAmountChange(e.target.value, item, index)}
                          slotProps={{
                            input: {
                              startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                            },
                          }}
                          sx={{
                            '& .MuiFilledInput-root': {
                              borderRadius: 2.5,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e5eaf1',
                              '&.Mui-disabled': {
                                bgcolor: '#fff',
                                border: '1px solid #e5eaf1',
                              },
                            },
                            '& .MuiFilledInput-input.Mui-disabled': {
                              WebkitTextFillColor: '#64748b',
                            },
                            '& .MuiInputLabel-root.Mui-disabled': {
                              color: '#94a3b8',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                  </Paper>
                  </Grid>
                </>
              }

              {
                (getTemplateById?.allowance?.length > 0 ||
                getTemplateById?.deduction?.length > 0) &&
                (typeof formValues.name === 'string' || formValues.name === null) && (
                  <Grid container spacing={3} sx={{mt: 0.5}}>
                      {
                        getTemplateById?.allowance?.length > 0 && (
                          <>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 0,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: '#dbe4f0',
                                height: '100%',
                                overflow: 'hidden',
                                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                              }}
                            >
                            <Box
                              sx={{
                                px: 2.5,
                                py: 2,
                                borderBottom: '1px solid #e9eef5',
                                bgcolor: '#fbfcfe',
                              }}
                            >
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 0.25 }}>
                                Earnings
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Review and enter earning amounts for this salary structure.
                              </Typography>
                            </Box>

                              <TableContainer sx={{ maxHeight: 520 }}>
                              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f4f7fb' }}>
                                    <TableCell sx={{ width: '40%', borderBottom: '1px solid #e7ebf0' }}><Typography variant='body2' sx={{ fontWeight: 700, color: '#44546a' }}>Name</Typography></TableCell>
                                    <TableCell sx={{ width: '20%', borderBottom: '1px solid #e7ebf0' }}><Typography variant='body2' sx={{ fontWeight: 700, color: '#44546a' }}>Code</Typography></TableCell>
                                    <TableCell align="right" sx={{ width: '40%', borderBottom: '1px solid #e7ebf0' }}><Typography variant='body2' sx={{ fontWeight: 700, color: '#44546a' }}>Amount <span style={{ color: '#fe3f3c' }}>*</span></Typography></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {
                                    getTemplateById.allowance.map((item, index) => (
                                    <TableRow
                                      key={index}
                                      hover
                                      sx={{
                                        '&:nth-of-type(even)': {
                                          bgcolor: '#fcfdff',
                                        },
                                        '& td': {
                                          borderBottom: '1px solid #edf2f7',
                                        },
                                      }}
                                    >
                                      <TableCell>
                                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                          {item.allowance_name}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: 'inline-flex',
                                            px: 1.25,
                                            py: 0.5,
                                            borderRadius: 5,
                                            bgcolor: '#f1f5f9',
                                            color: '#334155',
                                            fontSize: 13,
                                            fontWeight: 700,
                                          }}
                                        >
                                          {item.allowance_code}
                                        </Box>
                                      </TableCell>
                                      <TableCell align="right">
                                        <TextField
                                          type="number"
                                          variant="outlined"
                                          size="small"
                                          fullWidth
                                          placeholder="Enter amount"
                                          disabled={isAutoCalculatedFieldLock}
                                          InputProps={{
                                            startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                          }}
                                          sx={{
                                            maxWidth: 220,
                                            ml: 'auto',
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: 2.5,
                                              bgcolor: '#fff',
                                            },
                                          }}
                                          value={formValues.allowanceAmounts.find(i => i.id === item.allowance_id)?.amount || ''}
                                          onChange={(e) => handleAllowanceChange(e.target.value, item, index)}
                                        />
                                      </TableCell>
                                    </TableRow>
                                    ))
                                  }
                                </TableBody>
                              </Table>
                              </TableContainer>
                              </Paper>
                    </Grid>
                          </>
                        )
                      }

                      {
                        getTemplateById?.deduction?.length > 0 && (
                          <>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 0,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: '#dbe4f0',
                                height: '100%',
                                overflow: 'hidden',
                                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
                              }}
                            >
                            <Box
                              sx={{
                                px: 2.5,
                                py: 2,
                                borderBottom: '1px solid #e9eef5',
                                bgcolor: '#fbfcfe',
                              }}
                            >
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 0.25 }}>
                                Deductions
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Review and enter deduction amounts applicable to this structure.
                              </Typography>
                            </Box>

                              <TableContainer sx={{ maxHeight: 520 }}>
                              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f4f7fb' }}>
                                    <TableCell sx={{ width: '40%', borderBottom: '1px solid #e7ebf0' }}><Typography variant='body2' sx={{ fontWeight: 700, color: '#44546a' }}>Name</Typography></TableCell>
                                    <TableCell sx={{ width: '20%', borderBottom: '1px solid #e7ebf0' }}><Typography variant='body2' sx={{ fontWeight: 700, color: '#44546a' }}>Code</Typography></TableCell>
                                    <TableCell align="right" sx={{ width: '40%', borderBottom: '1px solid #e7ebf0' }}><Typography variant='body2' sx={{ fontWeight: 700, color: '#44546a' }}>Amount <span style={{ color: '#fe3f3c' }}>*</span></Typography></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {
                                    getTemplateById.deduction.map((item, index) => (
                                      <TableRow
                                        key={index}
                                        hover
                                        sx={{
                                          '&:nth-of-type(even)': {
                                            bgcolor: '#fcfdff',
                                          },
                                          '& td': {
                                            borderBottom: '1px solid #edf2f7',
                                          },
                                        }}
                                      >
                                        <TableCell>
                                          <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                            {item.deduction_name}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Box
                                            sx={{
                                              display: 'inline-flex',
                                              px: 1.25,
                                              py: 0.5,
                                              borderRadius: 5,
                                              bgcolor: '#f1f5f9',
                                              color: '#334155',
                                              fontSize: 13,
                                              fontWeight: 700,
                                            }}
                                          >
                                            {item.deduction_code}
                                          </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                          <TextField
                                            type="number"
                                            variant="outlined"
                                          size="small"
                                          fullWidth
                                          placeholder="Enter amount"
                                          disabled={isAutoCalculatedFieldLock}
                                          InputProps={{
                                            readOnly: isAutoCalculatedFieldLock || (formValues.grossAutoCalculation && ['EPF', 'ESI', 'PT'].includes(item.deduction_code)),
                                            startAdornment: <InputAdornment position="start">Rs</InputAdornment>,
                                          }}
                                          sx={{
                                            maxWidth: 220,
                                            ml: 'auto',
                                              '& .MuiOutlinedInput-root': {
                                                borderRadius: 2.5,
                                                bgcolor: '#fff',
                                              },
                                            }}
                                            value={formValues.deductionAmounts[index]?.amount ?? ''}
                                            onChange={(e) => handleDeductionChange(e.target.value, item, index)}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  }
                                </TableBody>
                              </Table>
                              </TableContainer>
                              </Paper>
                    </Grid>
                          </>
                        )
                      }

                  </Grid>
                )
              }

              {/* {AllowanceType.filter((i) =>
              ['BASIC'].includes(i.allowance_code),
              ).map((v) => (
                <Grid key={v.id} item={true} lg={4} md={4} sm={4} xs={12}>
                  <TextField
                    fullWidth={true}
                    onWheel={ (e) => e.target.blur()}
                    id={`allowance-${v.id}`}
                    label={`${v.allowance_name} Amount`}
                    name={`allowance-${v.id}-amount`}
                    value={
                      formValues.allowanceAmounts.find((i) => i.allowance_code === v.allowance_code,)?.amount
                      ? formValues.allowanceAmounts.find((i) => i.allowance_code === v.allowance_code,)?.amount
                      : " "
                    }
                    type='number'
                    variant='filled'
                    required={v.allowance_code === 'BASIC'}
                    onChange={(event) => {
                      const { value } = event.target
                      if(value === '' || isNumber(value)){
                        // Add incentive as mandatory for every salary structure
                        // const inc = AllowanceType.find( (i) => i.allowance_code === 'INC' );
                        // if(inc){
                        //   handleAllowanceDeduction(
                        //     0,
                        //     inc.id,
                        //     inc.allowance_code,
                        //     'allowance',
                        //   )
                        // }

                          handleAllowanceDeduction(
                            value,
                            v.id,
                            v.allowance_code,
                            'allowance',
                          )

                        
                        
                      }
                    }}
                    error={
                      v.allowance_code === 'BASIC' &&
                      formErrors.BASIC &&
                      formErrors.BASIC
                    }
                    helperText={
                      v.allowance_code === 'BASIC' &&
                      formErrors.BASIC &&
                      formErrors.BASIC
                    }
                  />
                </Grid>
              ))} */}

              {/* {AllowanceType.filter((i) => ['OT'].includes(i.allowance_code)).map(
                (v) => ot && (
                  <React.Fragment key={v.id}>
                    <Grid lg={6} md={6} sm={6} xs={12} item>
                      <Box width='100%' display='flex' flexDirection='row' alignItems='center' justifyContent='space-between'>
                        
                      <FormControl>
                        <FormLabel id='demo-radio-buttons-group-label'>
                          OT amount per hour
                        </FormLabel>

                          <RadioGroup
                            row
                            value={otType}
                            name='ot_type'
                            onChange={(e) => {
                              setOtType(e.target.value);
                              if (e.target.value === 'FROM_BASIC') {
                                handleAllowanceDeduction(
                                  '',
                                  v.id,
                                  v.allowance_code,
                                  'allowance',
                                  e.target.value,
                                );
                              }
                              }}
                          >
                            <FormControlLabel
                              value='FROM_BASIC'
                              label='From basic'
                              control={<Radio />}
                            />
                            <FormControlLabel
                              value='FLAT'
                              label='Flat'
                              control={<Radio />}
                            />
                          </RadioGroup>
                        </FormControl>
                        </Box>
                      </Grid>
                      <Grid
                        size={{
                          lg: 4,
                          md: 4,
                          sm: 6,
                          xs: 12
                        }}>
                        <TextField
                          onChange={(event) => {
                            const { value } = event.target;
                            if (value === '' || (isNumber(value) && parseFloat(value) > 0)) {
                              handleAllowanceDeduction(
                                value,
                                v.id,
                                v.allowance_code,
                                'allowance',
                                'FLAT'
                              );
                            }
                          }}
                          fullWidth
                          onWheel={(e) => e.target.blur()}
                          placeholder='OT amount'
                          label='OT amount'
                          name='ot_amount'
                          value={
                            formValues.allowanceAmounts.find((i) => i.allowance_code === v.allowance_code)
                              ?.amount
                              ? formValues.allowanceAmounts.find((i) => i.allowance_code === v.allowance_code)
                                ?.amount
                              : ' '
                          }
                          disabled={otType === 'FROM_BASIC' ? true : false}
                          color='primary'
                          type='number'
                          variant='filled'
                          error={!!formErrors[v.allowance_code]}
                          helperText={formErrors[v.allowance_code]}
                        />
                      </Grid>

                  </React.Fragment>
                ),
              )} */}
                
              {/* <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item md={6} xs={6}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant='h6' gutterBottom>
                          Earnings Types
                        </Typography>
                      </Grid>
                      {renderAllowanceTextFields()}
                      <Grid sx={{display: 'flex', width: '100%', gap: '20px'}} item xs={12}>
                        <Autocomplete
                          sx={{width: '300px'}}
                          variant='filled'
                          name='allowance'
                          label='Add Earnings'
                          placeholder='Add Earnings'
                          value={
                            AllowanceType.find(
                              (i) =>
                                i.id === itemSelected.value &&
                                itemSelected.name === 'allowance',
                            ) ?? {
                              allowance_name: '',
                            }
                          }
                          id='multiple-limit-tags'
                          options={AllowanceType.filter(
                            (i) =>
                              !allowanceItemAdded.includes(i.id) &&
                              !['INC', 'OT', 'BASIC'].includes(i.allowance_code),
                          )}
                          getOptionLabel={(option) => option?.allowance_name}
                          onChange={(e, c) => {
                            setItemSelected({name: 'allowance', value: c ? c.id : null});
                          }}
                          renderInput={(params) => {
                            const get = {...params};
                            get.InputProps = {
                              ...params.InputProps,
                              startAdornment: (
                                <Tooltip title='Create New'>
                                  <IconButton
                                    size='small'
                                    onClick={() => {
                                      setCreateType({
                                        open: 'allowance',
                                        name: null,
                                        code: null,
                                      });
                                    }}
                                  >
                                    <AddIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              ),
                            };

                              return (
                                <TextField {...get} label='Earnings Types' variant='filled' />
                              );
                            }}
                            renderOption={(props, option) => {
                              return (
                                <Grid
                                  sx={[
                                    {
                                      '& .del': {
                                        visibility: 'hidden',
                                        opacity: 0,
                                        transition:
                                          'visibility 0.2s linear,opacity 0.2s linear',
                                      },
                                      '&:hover': {
                                        '& .del': {
                                          visibility: 'visible',
                                          opacity: 1,
                                        },
                                      },
                                    },
                                  ]}
                                  container
                                  {...props}
                                  display='flex'
                                  justifyContent='space-between'
                                  spacing={2}
                                >
                                  <Grid style={{flexGrow: 1}}>
                                    <Typography>{option.allowance_name} </Typography>
                                  </Grid>
                                  <Grid className='del'>
                                    <IconButton
                                      onClick={(e) => {
                                        checkDeleteType(e, 'allowance', option.id);
                                      }}
                                    >
                                      <DeleteOutlineIcon style={{color: 'grey'}} />
                                    </IconButton>
            </Grid>
            </Paper>
          </Grid>
                              );
                            }}
                          />
                          <Button color='primary' variant='contained' onClick={handleAddItem}>
                            <AddIcon /> Add Earnings
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid
                      size={{
                        md: 6,
                        xs: 6
                      }}>
                      <Grid container spacing={3}>
                        <Grid size={12}>
                          <Typography variant='h6' gutterBottom>
                            Deduction Types
                          </Typography>
                        </Grid>
                        {renderDeductionTextFields()}
                        <Grid sx={{display: 'flex', width: '100%', gap: '20px'}} size={12}>
                          <Autocomplete
                            sx={{width: '300px'}}
                            variant='filled'
                            name='allowance'
                            label='Add Deductions'
                            placeholder='Add Deductions'
                            value={
                              deductionType.find(
                                (i) =>
                                  i.id === itemSelected.value &&
                                  itemSelected.name === 'deduction',
                              ) ?? {
                                deduction_name: '',
                              }
                            }
                            id='multiple-limit-tags'
                            options={deductionType.filter((i) => !deductionsItemAdded.includes(i.id))}
                            getOptionLabel={(option) => option?.deduction_name}
                            onChange={(e, c) => {
                              setItemSelected({name: 'deduction', value: c ? c.id : null});
                            }}
                            renderInput={(params) => {
                              const get = {...params};
                              get.InputProps = {
                                ...params.InputProps,
                                startAdornment: (
                                  <Tooltip title='Create New'>
                                    <IconButton
                                      size='small'
                                      onClick={() => {
                                        setCreateType({
                                          open: 'deduction',
                                          name: null,
                                          code: null,
                                        });
                                      }}
                                    >
                                      <AddIcon fontSize='small' />
                                    </IconButton>
                                  </Tooltip>
                                ),
                              };

                              return (
                                <TextField
                                  {...get}
                                  label='Deduction Types'
                                  variant='filled'
                                />
                              );
                            }}
                            renderOption={(props, option) => {
                              return (
                                <Grid
                                  sx={[
                                    {
                                      '& .del': {
                                        visibility: 'hidden',
                                        opacity: 0,
                                        transition:
                                          'visibility 0.2s linear,opacity 0.2s linear',
                                      },
                                      '&:hover': {
                                        '& .del': {
                                          visibility: 'visible',
                                          opacity: 1,
                                        },
                                      },
                                    },
                                  ]}
                                  container
                                  {...props}
                                  display='flex'
                                  justifyContent='space-between'
                                  spacing={2}
                                >
                                  <Grid style={{flexGrow: 1}}>
                                    <Typography>{option.deduction_name} </Typography>
                                  </Grid>
                                  <Grid className='del'>
                                    <IconButton
                                      onClick={(e) => {
                                        checkDeleteType(e, 'deduction', option.id);
                                      }}
                                    >
                                      <DeleteOutlineIcon style={{color: 'grey'}} />
                                    </IconButton>
                                  </Grid>
                                </Grid>
                              );
                            }}
                          />
                          <Button color='primary' variant='contained' onClick={handleAddItem}>
                            <AddIcon /> Add Deductions
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                </Grid>
              </Grid> */}

                <Grid
                  hidden
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 6,
                    xs: 12
                  }}>
                  <Box display='flex' justifyContent='flex-start'>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker
                        label='FromDate'
                        name='date'
                        value={toMomentOrNull(formValues.fromDate)}
                        format='DD/MM/YYYY'
                        inputVariant='contained'
                        required
                        disableFuture
                        onChange={(e, v) => {
                          handleChange(
                            e,
                            moment(e._d).format('YYYY-MM-DD'),
                            'fromDate',
                          );
                        }}
                        slotProps={{ textField: { variant: 'filled', fullWidth: true, error: !!formErrors.fromDate, helperText: formErrors.fromDate } }}
                      />
                    </LocalizationProvider>
                  </Box>
                </Grid>

              </Grid>
            </Paper>
            {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
              <TextField
              fullWidth={true}
                id='outlined-name'
                label='Salary Structure Code'
                value={formValues.code}
                name='ageing'
                type={'text'}
                required
                variant='filled'
                placeholder='eg: EXE-24'
                onChange={(event, value) =>
                  handleChange(event, event.target.value, 'code')
                }
                error={!!formErrors.code}
                helperText={formErrors.code}
              />
            </Grid> */}
          </Grid>

        <Grid
          container
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'end'}
          spacing={2}
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            mt: 3,
            py: 2,
            px: 1,
            bgcolor: 'rgba(248, 250, 252, 0.96)',
            borderTop: '1px solid #dbe4f0',
          }}
        >
          <Grid item>
            <Button
              color='secondary'
              variant='contained'
              onClick={validCloseDialog}
            >
              Back
            </Button>
          </Grid>
          {props.status === 'edit' ? (
            <Grid item>
              <Button
                color='primary'
                variant='contained'
                onClick={handleUpdate}
                disabled={disbleEditAllowance || disbleEditDeduction}
              >
                update
              </Button>
            </Grid>
          ) : props.type === 'contactStructure' ? (
            <Grid item>
              <Button
                color='primary'
                variant='contained'
                onClick={() => props.handleSave(formValues)}
                disabled={!disbleAllowance || !disbleDeductions || formValues.name === null}
              >
                Add
              </Button>
            </Grid>
          ): (
            <Grid item>
              <Button
                color='primary'
                variant='contained'
                onClick={handleSubmit}
                disabled={!disbleAllowance || !disbleDeductions}
              >
                Create
              </Button>
            </Grid>
          )}
        </Grid>
        <CancelDialog
          handle={cancel}
          delete={dialog}
          close={props.handleClose}
        ></CancelDialog>

          <AlertDialog
            delete={deleteType.open}
            handleClose={() => setDeleteType({open: false, id: null, type: null})}
            handleDelete={handleDeleteType}
            id={deleteType.id}
          />
        </Grid>
        </Card>
      <Dialog
        open={!!createType.open}
        onClose={() => setCreateType({open: null, name: null, code: null})}
      >
        <DialogTitle>
          {createType.open === 'allowance'
            ? 'Create Earnings Type'
            : 'Create Deductions Type'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label={
              createType.open === 'allowance'
                ? 'Earnings Name'
                : 'Deductions Name'
            }
            type='text'
            fullWidth
            variant='filled'
            value={createType.name}
            onChange={(e) =>
              setCreateType((prev) => {
                return {
                  ...prev,
                  name: e.target.value,
                };
              })
            }
          />
          <TextField
            autoFocus
            margin='dense'
            label='Code'
            type='text'
            fullWidth
            variant='filled'
            value={createType.code}
            onChange={(e) =>
              setCreateType((prev) => {
                return {
                  ...prev,
                  code: e.target.value.toUpperCase(),
                };
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => setCreateType({open: null, name: null, code: null})}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleCreateType}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


function isNumber(str) {
  if (typeof str != "string") return false
  return !isNaN(str) && !isNaN(parseFloat(str))
}

export default NewSalaryStructure;
