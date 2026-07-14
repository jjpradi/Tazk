import {
  Autocomplete,
  Box,
  Button,
  Card,
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
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CancelDialog from 'components/CancelDialog';
import {getsessionStorage} from 'pages/common/login/cookies';
import React, {useContext, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  checkDeleteAllowanceDeductionTypesAction,
  createAllowanceDeductionTypesAction,
  createTemplateStructureAction,
  deleteAllowanceDeductionTypesAction,
  getAllowanceType,
  getDeductionType,
  updateTemplateStructureAction,
} from 'redux/actions/salary_actions';
import apiCalls from 'utils/apiCalls';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import CancelIcon from '@mui/icons-material/Cancel';
import CommonToolTip from 'components/ToolTip';
import {getEmpbasecompanyAction} from 'redux/actions/attendance_actions';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {getDateFormat} from 'utils/getTimeFormat';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {capitalize} from 'lodash';
import {updateSalaryStructureAction} from '../../../redux/actions/salary_actions';
import AddIcon from '@mui/icons-material/Add';
import {GET_ALLOWANCE_TYPE, GET_DEDUCTION_TYPE} from 'redux/actionTypes';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonDialog from 'components/commonDialog';
import AlertDialog from '../../common/Dialog';
import IOSSwitch from 'utils/cssSwitch';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { maxBodyHeight } from 'utils/pageSize';
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
    SalaryReducers: {AllowanceType, deductionType},
    attendanceReducer: {get_empbasecompany},
  } = useSelector((state) => state);
  const [selectedAllowanceNames, setSelectedAllowanceNames] = useState(['']);
  const [selectedDeductionNames, setSelectedDeductionNames] = useState(['']);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fromdate, setFromdate] = useState('');
  const [todate, setTodate] = useState('');
  const [otType, setOtType] = useState('');
  const [formValues, setFormValues] = useState({
    code: null,
    name: null,
    fromDate: null,
    toDate: null,
    allowanceAmounts: [],
    deductionAmounts: [],
  });

  const [formErrors, setFormErrors] = useState({
    code: null,
    name: null,
    fromDate: null,
    toDate: null,
    allowanceAmounts: [],
    deductionAmounts: [],
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
  useEffect(() => {
    if (props.status === 'edit') {
      // const allwList = AllowanceType.map((i) => ({
      //   ...i,
      //   amount: props.edit_data[i.allowance_code],
      //   amount_type: props.edit_data[`${i.allowance_code}_amount_type`],
      // })).filter((i) => i.amount);

      // const dedList = deductionType
      //   .map((i) => ({...i, amount: props.edit_data[i.deduction_code]}))
      //   .filter((i) => i.amount);

      // setAllowanceItemAdded(allwList.map(i => i.id))
      // setDeductionsItemAdded(dedList.map(i => i.id))

      setFormValues({
        ...formValues,
        // code: props.edit_data.code,
        name: props.edit_data.name,
        allowanceAmounts: props.edit_data.allowanceAmounts || [],
        deductionAmounts: props.edit_data.deductionAmounts || [],
      });

      // const isOtExists = allwList.find((i) => i.allowance_code === 'OT');
      
      // if (isOtExists) {
      //   setOtType(isOtExists.amount_type);
      //   const shouldSetOt = isOtExists.amount_type === "FROM_BASIC" || (isOtExists.amount_type === "FLAT" && isOtExists.amount !== 0);
  
      //   setOt(shouldSetOt);
      // }
    }
  }, [props.status]);

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
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(getAllowanceType(storage.company_id)),
      dispatch(getDeductionType(storage.company_id)),
      // dispatch(getEmpbasecompanyAction()),
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

    if (['code', 'name', 'basicPay'].includes(name) && value.length > 0) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      return;
    }

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
      setChangedForm(true);
      if (name === 'allowance') {
        const isIdExists = prev.allowanceAmounts.find((i) => i.id === id);
        let all = [...prev.allowanceAmounts];
        if (isIdExists) {
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
  };
  const handleSubmit = async () => {
    setChangedForm(true);
    let isValid = true;
    let formErrorsObj = { ...formErrors };
  
    if (!formValues.name) {
      isValid = false;
      formErrorsObj.name = 'Salary Structure Name is required';
    } else {
      formErrorsObj.name = null;
    }
  
    const basicAllowance = formValues.allowanceAmounts.find(
      (i) => i.allowance_code === 'BASIC'
    );

    const duplicateAllowance = formValues.allowanceAmounts.filter(
      (item, index, arr) =>
        arr.findIndex((v) => v.allowance_code === item.allowance_code) !== index,
    );
    const duplicateDeduction = formValues.deductionAmounts.filter(
      (item, index, arr) =>
        arr.findIndex((v) => v.deduction_code === item.deduction_code) !== index,
    );

    if (duplicateAllowance.length > 0) {
      isValid = false;
      duplicateAllowance.forEach((item) => {
        formErrorsObj[item.allowance_code] = 'Duplicate earning not allowed';
      });
    }
    if (duplicateDeduction.length > 0) {
      isValid = false;
      duplicateDeduction.forEach((item) => {
        formErrorsObj[item.deduction_code] = 'Duplicate deduction not allowed';
      });
    }

    setFormErrors(formErrorsObj);

    if (!isValid) {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return;
    }

    if(props.status === 'edit') {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        await dispatch(updateTemplateStructureAction(formValues, props.edit_data.id, async (response) => {
          const res = await response
          if(res.data.status !== 'Template Name already exists!' && res.status === 200) {
            props.handleClose();
          }
        })),
      )
    }
    else {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        await dispatch(createTemplateStructureAction(formValues, async (response) => {
          const res = await response
          if(res.data.status !== 'Template Name already exists!' && res.status === 200) {
            props.handleClose();
          }
        })),
      );
    }
    if (props.setSearchString) {
      props.setSearchString('');
    }
  };

  const handleUpdate = () => {
    setChangedForm(true);
    let isValid = true;
    let formErrorsObj = {...formErrors};

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

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(updateSalaryStructureAction(props.edit_data.id, formValues)),
    );
    if (props.setSearchString) {
      props.setSearchString('');
    }
    props.handleClose();
  };

  const renderAllowanceTextFields = () => {
    console.log("hjgd", formValues, formValues.allowanceAmounts)
    const comp = formValues.allowanceAmounts
      .filter((i) => !['INC', 'OT', 'BASIC'].includes(i.allowance_code))
      .map((v) => (
        <Box
          key={v.id}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            border: '1px solid #e7ebf0',
            bgcolor: '#fff',
          }}
        >
          <Box>
            <Typography variant='body1' sx={{fontWeight: 600}}>
              {v.allowance_name}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Code: {v.allowance_code}
            </Typography>
          </Box>
          <CommonToolTip title='Remove'>
            <IconButton
              color='error'
              onClick={() => {
                handleRemoveItems(v.id, 'allowance', v.allowance_code);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </CommonToolTip>
        </Box>
      ));

    return comp;
  };
  const renderDeductionTextFields = () => {
    return formValues.deductionAmounts.map((v) => (
      <Box
        key={v.id}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 2,
          py: 1.5,
          borderRadius: 2,
          border: '1px solid #e7ebf0',
          bgcolor: '#fff',
        }}
      >
        <Box>
          <Typography variant='body1' sx={{fontWeight: 600}}>
            {v.deduction_name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Code: {v.deduction_code}
          </Typography>
        </Box>
        <CommonToolTip title='Remove'>
          <IconButton
            color='error'
            onClick={() => {
              handleRemoveItems(v.id, 'deduction', v.deduction_code);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </CommonToolTip>
      </Box>
    ));
  };

  const handleAddItem = (type) => {
    setChangedForm(true);
    if (!itemSelected.value || itemSelected.name !== type) return;

    if(type === 'allowance'){
      if (allowanceItemAdded.includes(itemSelected.value)) {
        dispatch(OpenalertActions({ msg: 'Earning already added to this template', severity: 'warning' }));
        return;
      }
      setAllowanceItemAdded((prev) => {
        prev.push(itemSelected.value);
        return prev;
      });
    }else{
      if (deductionsItemAdded.includes(itemSelected.value)) {
        dispatch(OpenalertActions({ msg: 'Deduction already added to this template', severity: 'warning' }));
        return;
      }
      setDeductionsItemAdded((prev) => {
        prev.push(itemSelected.value);
        return prev;
      });
    }

    setItemSelected({name: null, value: null});
    setFormValues((prev) => {
      if (type === 'allowance') {
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

    dispatch(
      createAllowanceDeductionTypesAction(createType, (data) => {
        if (createType.open === 'allowance') {
          dispatch({
            type: GET_ALLOWANCE_TYPE,
            payload: [...AllowanceType, data],
          });
          dispatch(getAllowanceType(storage.company_id))
          setItemSelected({name: 'allowance', value: data ? data.id : null});
        } else {
          dispatch({
            type: GET_DEDUCTION_TYPE,
            payload: [...deductionType, data],
          });
        dispatch(getDeductionType(storage.company_id))
        setItemSelected({name: 'deduction', value: data ? data.id : null});
        }
        setCreateType({open: null, name: null, code: null});
      }),
    );
  };

  const checkDeleteType = (e, type, id) => {
    e.stopPropagation();

    dispatch(
      checkDeleteAllowanceDeductionTypesAction({type, id}, (data) => {
        setDeleteType({open: true, id, type});
      }),
    );
  };

  const handleDeleteType = (id) => {
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

  console.log('formValues.allowanceAmounts', formValues, formErrors, ot, otType);
  
  return (
    <div>
    <Card
  width="100%"
  elevation={3}
  style={{ padding: '10px' }}
  sx={{
    height: 'calc(100vh - 80px)',
    bgcolor: '#f6f8fb',
    borderRadius: 3,
    overflow: 'auto',
  }}
>


        <Typography
          className='page-title'
          sx={{px: 2, pt: 1}}
        >
          {props.status === 'edit'
            ? 'Edit Template Structure'
            : 'New Template Structure'}
        </Typography>
        <Grid
          container
          display={'flex'}
          flexDirection={'row'}
          alignItems={'center'}
          spacing={4}
          padding={{xs: 2, md: 4}}
        >
          <Grid size={{ lg: 11, md: 11, sm: 12, xs: 12 }}>
            <Box
              sx={{
                p: {xs: 2, md: 3},
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid #e7ebf0',
                mb: 3,
              }}
            >
              <Typography variant='h6' sx={{fontWeight: 700, mb: 0.5}}>
                Template Details
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{mb: 2}}>
                Create a salary template by choosing the earnings and deduction components your team uses most often.
              </Typography>

              <Grid container spacing={3} alignItems='flex-start'>
                <Grid size={{ lg: 6, md: 6, sm: 12, xs: 12 }}>
                  <TextField
                    fullWidth={true}
                    id='outlined-name'
                    label='Salary Template Name'
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
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                    <Chip
                      color='primary'
                      variant='outlined'
                      label={`Earnings Selected: ${formValues.allowanceAmounts.filter((i) => !['INC', 'OT', 'BASIC'].includes(i.allowance_code)).length}`}
                    />
                    <Chip
                      color='primary'
                      variant='outlined'
                      label={`Deductions Selected: ${formValues.deductionAmounts.length}`}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Grid container spacing={3}>

              {/* {AllowanceType.filter((i) =>
                ['BASIC'].includes(i.allowance_code),
              ).map((v) => (
                <Grid key={v.id} item={true} lg={4} md={4} sm={4} xs={12}>
                  <TextField
                    fullWidth={true}
                    onWheel={(e) => e.target.blur()}
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
                    onChange={(event) => {
                      const { value } = event.target
                      if (value === '' || isNumber(value)) {

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

             {AllowanceType.filter((i) => ['OT'].includes(i.allowance_code)).map(
                (v) => ot && (
                  <React.Fragment key={v.id}>
                    <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
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
                    <Grid size={{ lg: 4, md: 4, sm: 6, xs: 12 }}>
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
              )}
                
              <Grid size={{xs: 12}}>
                <Grid container spacing={3}>
                  <Grid size={{md: 6, xs: 6}}>
                    <Box
                      sx={{
                        p: {xs: 2, md: 2.5},
                        borderRadius: 3,
                        bgcolor: '#fff',
                        border: '1px solid #e7ebf0',
                        height: '100%',
                      }}
                    >
                    <Grid container spacing={2.5}>
                      <Grid size={{xs: 12}}>
                        <Typography variant='h6' gutterBottom sx={{fontWeight: 700}}>
                          Earnings Types
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Add the earning components to include in this template.
                        </Typography>
                      </Grid>
                      <Grid size={{xs: 12}}>
                        <Box sx={{display: 'flex', width: '100%', gap: 2, alignItems: 'stretch'}}>
                        <Autocomplete
                          sx={{flex: 1}}
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
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 2,
                                    '& .del': {
                                      visibility: 'hidden',
                                      opacity: 0,
                                      transition:
                                        'visibility 0.2s linear,opacity 0.2s linear',
                                    },
                                    '& .meta': {
                                      color: 'text.secondary',
                                    },
                                    '&:hover': {
                                      bgcolor: '#f5f7fb',
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
                                <Grid item style={{flexGrow: 1}}>
                                  <Typography sx={{fontWeight: 600}}>
                                    {option.allowance_name}
                                  </Typography>
                                  <Typography variant='caption' className='meta'>
                                    Code: {option.allowance_code}
                                  </Typography>
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
                              </Grid>
                            );
                          }}
                        />
                        <Button
                          color='primary'
                          variant='contained'
                          onClick={() => handleAddItem('allowance')}
                          sx={{minWidth: 56, borderRadius: 2}}
                        >
                          <AddIcon />
                        </Button>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12}}>
                        <Stack spacing={1.5}>
                          {renderAllowanceTextFields()}
                          {formValues.allowanceAmounts.filter((i) => !['INC', 'OT', 'BASIC'].includes(i.allowance_code)).length === 0 && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px dashed #c9d3df',
                                color: 'text.secondary',
                                textAlign: 'center',
                                bgcolor: '#fbfcfe',
                              }}
                            >
                              No earnings selected yet.
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                    </Box>
                  </Grid>

                  <Grid size={{md: 6, xs: 6}}>
                    <Box
                      sx={{
                        p: {xs: 2, md: 2.5},
                        borderRadius: 3,
                        bgcolor: '#fff',
                        border: '1px solid #e7ebf0',
                        height: '100%',
                      }}
                    >
                    <Grid container spacing={2.5}>
                      <Grid size={{xs: 12}}>
                        <Typography variant='h6' gutterBottom sx={{fontWeight: 700}}>
                          Deduction Types
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Choose the deduction components that should be part of this template.
                        </Typography>
                      </Grid>
                      <Grid size={{xs: 12}}>
                        <Box sx={{display: 'flex', width: '100%', gap: 2, alignItems: 'stretch'}}>
                        <Autocomplete
                          sx={{flex: 1}}
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
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 2,
                                    '& .del': {
                                      visibility: 'hidden',
                                      opacity: 0,
                                      transition:
                                        'visibility 0.2s linear,opacity 0.2s linear',
                                    },
                                    '& .meta': {
                                      color: 'text.secondary',
                                    },
                                    '&:hover': {
                                      bgcolor: '#f5f7fb',
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
                                <Grid item style={{flexGrow: 1}}>
                                  <Typography sx={{fontWeight: 600}}>
                                    {option.deduction_name}
                                  </Typography>
                                  <Typography variant='caption' className='meta'>
                                    Code: {option.deduction_code}
                                  </Typography>
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
                        <Button
                          color='primary'
                          variant='contained'
                          onClick={() => handleAddItem('deduction')}
                          sx={{minWidth: 56, borderRadius: 2}}
                        >
                          <AddIcon />
                        </Button>
                        </Box>
                      </Grid>
                      <Grid size={{xs: 12}}>
                        <Stack spacing={1.5}>
                          {renderDeductionTextFields()}
                          {formValues.deductionAmounts.length === 0 && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px dashed #c9d3df',
                                color: 'text.secondary',
                                textAlign: 'center',
                                bgcolor: '#fbfcfe',
                              }}
                            >
                              No deductions selected yet.
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                    </Box>
                  </Grid>

                </Grid>
              </Grid>

              <Grid ize={{ lg: 4, md: 4, sm: 6, xs: 12 }} hidden>
                <Box display='flex' justifyContent='flex-start'>
                  <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                      label='FromDate'
                      name='date'
                      value={toMomentOrNull(formValues.fromDate)}
                      format='DD/MM/YYYY'
                      required
                      disableFuture
                      onChange={(e, v) => {
                        handleChange(
                          e,
                          moment(e._d).format('YYYY-MM-DD'),
                          'fromDate',
                        );
                      }}
                      slotProps={{
                        textField: {
                          variant: 'filled',
                          fullWidth: true,
                          error: !!formErrors.fromDate,
                          helperText: formErrors.fromDate,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>

            </Grid>
          </Grid>
        </Grid>

        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            px: {xs: 2, md: 4},
            py: 2,
            mt: 1,
            bgcolor: 'rgba(246,248,251,0.92)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid #e7ebf0',
          }}
        >
          <Grid
            container
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'end'}
            spacing={2}
          >
            <Grid item>
              <Button
                color='secondary'
                variant='contained'
                onClick={validCloseDialog}
                sx={{borderRadius: 2, px: 3}}
              >
                Back
              </Button>
            </Grid>
            {props.status === 'edit' ? (
              <Grid item>
                <Button
                  color='primary'
                  variant='contained'
                  onClick={handleSubmit}
                  sx={{borderRadius: 2, px: 3}}
                >
                  Update
                </Button>
              </Grid>
            ) : (
              <Grid item>
                <Button
                  color='primary'
                  variant='contained'
                  onClick={handleSubmit}
                  sx={{borderRadius: 2, px: 3}}
                >
                  Create
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
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
