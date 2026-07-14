import {
  Grid,
  TextField,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Card,
  Dialog,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Switch,
} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import {
  createRentalTenantAction,
  getRentalTenantByIdAction,
  updateRentalTenantAction,
  resetRentalTenantByIdAction,
} from 'redux/actions/asset_actions';
import {useDispatch, useSelector} from 'react-redux';
import { maxBodyHeight, maxHeight } from 'utils/pageSize';
import {emailValidation, passwordValidation, phoneValidation} from 'components/regexFunction';
import { capitalize } from 'lodash';
import { getAllAssetAction } from "redux/actions/asset_actions";
import AttachmentField from 'pages/common/Timesheet/Attachment';
import _ from "lodash";
import toMomentOrNull from 'utils/DateFixer';

const RentalAndTenantForm = (props) => {
  const dispatch = useDispatch();

  const {
          AssetReducers: {getAssetName, rental_tenant_by_id}
      } = useSelector((state) => state)

  const isEdit = props.type === 'edit';
  const editId = props.rowData?.id;

  const [formValues, setFormValues] = useState({
    type: null,
    name: null,
    phone: null,
    email: null,
    asset: null,
    location: null,
    rent: null,
    deposit: null,
    billing_cycle: {
      id : 1,
      type : 'MONTHLY'
    },
    billing_day_of_month: null,
    escalation_rate: null,
    startDate: null,
    endDate: null,
    reminder: [],
    note: null,
    sms_notification :  false,
    email_notification : false,
    whatsApp_notification : false,
    repeat : false,
  });

  const hasPrefilledRef = useRef(false);

  const [formErrors, setFormErrors] = useState({
    type: null,
    name: null,
    phone: null,
    email: null,
    asset: null,
    location: null,
    rent: null,
    deposit: null,
    billing_cycle: null,
    billing_day_of_month: null,
    escalation_rate: null,
    startDate: null,
    endDate: null,
    reminder: null,
    note: null,
    sms_notification :  null,
    email_notification : null,
    whatsApp_notification : null,
    files : null
  });

  let requiredFields = [
    'type',
    'name',
    'phone',
    'asset',
    'rent',
    'startDate',
    'endDate',
  ];

  const types = [
    {id: 1, type: 'Rental'},
    {id: 2, type: 'Tenant'},
  ];

  const billingCycle = [
    {id : 1 ,type : 'MONTHLY'},
    {id : 2 ,type : 'QUARTERLY'},
    {id : 3 ,type : 'HALF YEARLY'},
    {id : 4 ,type : 'YEARLY'}
  ]

  
  const [renewalsFiles, setRenewalsFiles] = useState({
        renewalsFiles : [],
        renewalsFilePreviews : []
    })

  const [validRegex, setValidRegex] = useState({
    email: false,
    phone: false,
  });

  const handleChange = (name, value) => {
    setFormValues((prevData) => {
      // Use ?? so numeric 0 and empty arrays are preserved
      const nextValue = value === undefined ? null : value;
      const newFormData = {...prevData, [name]: nextValue};
      validateForm(name, value);
      return newFormData;
    });
  };

  const validateForm = (name, value) => {
    if (requiredFields.includes(name) && (value === null || value === '')) {
      setFormErrors((prevErr) => ({
        ...prevErr,
        [name]: `${name} is Required`,
      }));
    } 
    
     else if (name === 'email') {
    if (emailValidation(value) !== true) {
      setValidRegex({...validRegex, email: false});
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Invalid!',
      });
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      setValidRegex({...validRegex, email: true});
    }
  } else if (name === 'phone') {
  if (phoneValidation(value) !== true) {
    setValidRegex({...validRegex, phone: false});
    setFormErrors({
      ...formErrors,
      [name]: capitalize(name) + ' is Invalid!',
    });
  } else {
    setFormErrors({
      ...formErrors,
      [name]: null,
    });
    setValidRegex({...validRegex, phone: true});
  }
}
    else {
      setFormErrors((prevErr) => ({
        ...prevErr,
        [name]: null,
      }));
    }

    if (name === 'date' && value !== null) {
      if (!moment(value, moment.ISO_8601).isValid()) {
        setValidRegex({...validRegex, dateValid: false});
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: 'Date is Invalid!',
        }));
      } else {
        setValidRegex({...validRegex, dateValid: true});
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: null,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    let formErrObj = {...formErrors};

    const existingFileCount = (renewalsFiles?.renewalsFilePreviews || [])
      .filter((p) => p && typeof p === 'object' && p.type === 'existing').length;
    const newFileCount = (renewalsFiles?.renewalsFiles || []).length;
    if (existingFileCount + newFileCount > 1) {
      isValid = false;
      formErrObj.files = 'Only 1 file is allowed!';
    } else {
      formErrObj.files = null;
    }

    requiredFields.forEach((key) => {
      if (
        formValues[key] === null ||
        formValues[key] === undefined ||
        formValues[key] === 'null' ||
        formValues[key] === ''
      ) {
        isValid = false;
        formErrObj[key] = `${key} is required`;
      } else {
        formErrObj[key] = null;
      }
    });

    // Email / phone format: if user entered something, it must be valid
    if (formValues.email && emailValidation(formValues.email) !== true) {
      isValid = false;
      formErrObj.email = 'Email is Invalid!';
    }
    if (formValues.phone && phoneValidation(formValues.phone) !== true) {
      isValid = false;
      formErrObj.phone = 'Phone is Invalid!';
    }

    // Date order: end must be >= start
    if (formValues.startDate && formValues.endDate &&
        moment(formValues.endDate).isBefore(moment(formValues.startDate))) {
      isValid = false;
      formErrObj.endDate = 'End Date must be after Start Date';
    }

    // billing_day_of_month: 1..31 if provided
    if (formValues.billing_day_of_month !== null && formValues.billing_day_of_month !== '' && formValues.billing_day_of_month !== undefined) {
      const day = Number(formValues.billing_day_of_month);
      if (!Number.isInteger(day) || day < 1 || day > 31) {
        isValid = false;
        formErrObj.billing_day_of_month = 'Billing day must be between 1 and 31';
      }
    }

    // escalation_rate: 0..100, decimals allowed
    if (formValues.escalation_rate !== null && formValues.escalation_rate !== '' && formValues.escalation_rate !== undefined) {
      const rate = Number(formValues.escalation_rate);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        isValid = false;
        formErrObj.escalation_rate = 'Escalation rate must be between 0 and 100';
      }
    }

    // monthly_rent must be > 0
    if (formValues.rent !== null && formValues.rent !== '' && formValues.rent !== undefined) {
      const rent = Number(formValues.rent);
      if (Number.isNaN(rent) || rent <= 0) {
        isValid = false;
        formErrObj.rent = 'Monthly rent must be greater than 0';
      }
    }

    // security_deposit must be >= 0 if given
    if (formValues.deposit !== null && formValues.deposit !== '' && formValues.deposit !== undefined) {
      const dep = Number(formValues.deposit);
      if (Number.isNaN(dep) || dep < 0) {
        isValid = false;
        formErrObj.deposit = 'Security deposit cannot be negative';
      }
    }

    setFormErrors(formErrObj);

    if (isValid) {
      const formData = new FormData();


      let renewalsFile = [];

      if (isEdit) {
        (renewalsFiles?.renewalsFilePreviews || []).forEach((preview) => {
          if (preview && typeof preview === 'object' && preview.type === 'existing' && preview.name) {
            renewalsFile.push({
              fileName: preview.name,
              type: 'existing',
            });
          }
        });
      }

      (renewalsFiles?.renewalsFiles || []).forEach((file) => {
        formData.append("renewalsFiles", file);
        renewalsFile.push({
          fileName: file.name,
          type: file.type,
        });
      });
      // files / images
      formData.append("image", JSON.stringify(renewalsFile));

      // basic fields
      formData.append("type", formValues.type?.type || "");
      formData.append("name", formValues.name || "");
      formData.append("phone", formValues.phone || "");
      formData.append("email", formValues.email || "");
      formData.append("asset", formValues.asset?.asset_id || "");
      formData.append("location", formValues.location || "");
      formData.append("monthly_rent", formValues.rent || "");
      formData.append("security_deposit", formValues.deposit || "");
      formData.append("billing_cycle", formValues.billing_cycle?.type || "");
      formData.append("billing_day_of_month", formValues.billing_day_of_month || "");
      formData.append("escalation_rate", formValues.escalation_rate || "");
      formData.append("startDate", formValues.startDate || "");
      formData.append("endDate", formValues.endDate || "");
      formData.append("notes", formValues.note || "");

      const reminderList = Array.isArray(formValues.reminder)
        ? formValues.reminder
            .map((item) => Number(item?.reminder ?? item))
            .filter((n) => !Number.isNaN(n))
        : [];
      formData.append('reminder', JSON.stringify(reminderList));

      // notifications
      formData.append("sms_notification", formValues.sms_notification ? 1 : 0);
      formData.append("email_notification", formValues.email_notification ? 1 : 0);
      formData.append("whatsApp_notification", formValues.whatsApp_notification ? 1 : 0);
      formData.append("repeat", formValues.repeat ? 1 : 0);


      const result = isEdit
        ? await dispatch(updateRentalTenantAction(formData, editId))
        : await dispatch(createRentalTenantAction(formData));
      if (result === 'API_FINISHED_ERROR') return;
      if (props.onSuccess) {
        await props.onSuccess();
      } else {
        props.handleClose();
      }
    }
  };

    const handleEmailSmsChange = (name, value) => {
        setFormValues((prev) => ({...prev, [name] : value}))
    }

        useEffect(() => { (async () => {
            await dispatch(getAllAssetAction())
        })();
}, [])

    useEffect(() => {
        if (isEdit && editId) {
            dispatch(getRentalTenantByIdAction(editId));
        }
        return () => {
            dispatch(resetRentalTenantByIdAction());
            hasPrefilledRef.current = false;
        };
    }, [isEdit, editId]);

    useEffect(() => {
        if (!isEdit) return;
        if (hasPrefilledRef.current) return;
        const record = rental_tenant_by_id?.data;
        if (!record) return;
        if (!getAssetName || getAssetName.length === 0) return;

        const matchedType = types.find((t) => t.type === record.type) || null;
        const matchedBilling = billingCycle.find((b) => b.type === record.billing_cycle) || null;
        const matchedAsset = (getAssetName || []).find((a) => String(a.asset_id) === String(record.asset)) || null;

        setFormValues({
            type: matchedType,
            name: record.name ?? null,
            phone: record.phone ?? null,
            email: record.email ?? null,
            asset: matchedAsset,
            location: record.location ?? null,
            rent: record.monthly_rent ?? null,
            deposit: record.security_deposit ?? null,
            billing_cycle: matchedBilling,
            billing_day_of_month: record.billing_day_of_month ?? null,
            escalation_rate: record.escalation_rate ?? null,
            startDate: record.startDate ? moment(record.startDate).format('YYYY-MM-DD') : null,
            endDate: record.endDate ? moment(record.endDate).format('YYYY-MM-DD') : null,
            reminder: parseReminderValue(record.reminder),
            note: record.notes ?? null,
            sms_notification: Number(record.sms_notification) === 1,
            email_notification: Number(record.email_notification) === 1,
            whatsApp_notification: Number(record.whatsApp_notification) === 1,
            repeat: Number(record.repeat) === 1,
        });

        const existingImages = Array.isArray(record.image) ? record.image : [];
        setRenewalsFiles({
            renewalsFiles: [],
            renewalsFilePreviews: existingImages.map((img) => ({
                url: img.imageUrl,
                name: img.fileName,
                type: 'existing',
            })),
        });
        hasPrefilledRef.current = true;
    }, [rental_tenant_by_id, isEdit, getAssetName]);

        
    const reminderDaysBefore = [
    {reminder : '2'},
    {reminder : '5'},
    {reminder : '7'},
  ]

  const parseReminderValue = (raw) => {
    if (raw == null || raw === '') return [];
    let parsedNumbers = [];
    if (Array.isArray(raw)) {
      parsedNumbers = raw;
    } else if (typeof raw === 'number') {
      parsedNumbers = [raw];
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) parsedNumbers = parsed;
        else if (typeof parsed === 'number') parsedNumbers = [parsed];
      } catch (e) {
        const num = Number(raw);
        if (!Number.isNaN(num)) parsedNumbers = [num];
      }
    }
    return parsedNumbers
      .map((n) => reminderDaysBefore.find((r) => r.reminder?.toString() === String(n)))
      .filter(Boolean);
  };

      useEffect(() => {
        if(renewalsFiles.renewalsFilePreviews.length > 1) {
            setFormErrors({
                ...formErrors,
                files : 'Only 1 Files are allowed!'
            })
        }
        else {
            setFormErrors({
                ...formErrors,
                files : null
            })
        }
    }, [renewalsFiles.renewalsFilePreviews])

  return (
    <div>
      <Card sx={{pt: 3, p: 5, minHeight : 'calc(100vh - 80px)' ,overflow:'auto', maxHeight : 'calc(100vh - 80px)'}}>
        <Typography sx={{pt: 3, pb: 3}}>{isEdit ? 'Edit Rental/Tenant' : 'New Rental/Tenant'}</Typography>
        <Grid container spacing={5} sx={{pb: 3}}>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              // disablePortal
              options={types || []}
              getOptionLabel={(option) => option.type}
              value={formValues.type || null}
              onChange={(e, newValue) => handleChange('type', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label={'Select Type'}
                  required
                  variant='filled'
                  error={formErrors.type !== null}
                  helperText={formErrors.type !== null ? 'Type is required ' 
                    : ''
                  }
                />
              )}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={`${formValues.type?.type === 'Rental' ? 'Landlord Name' : 'Tenant Name'}`}
              fullWidth
              name='name'
              variant='filled'
              required
              onChange={(e) => handleChange('name', e.target.value)}
              value={formValues.name ?? ''}
              InputLabelProps={{ shrink: Boolean(formValues.name) }}
              error={formErrors.name !== null}
              helperText={formErrors.name !== null ? `${formValues.type?.type === 'Rental' ? 'Landlord Name is required' : 'Tenant Name is required'}` : ''}
            />
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Phone number'}
              fullWidth
              type='text'
              name='phone'
              variant='filled'
              required
              inputProps={{ maxLength: 10 }}
              onChange={(e) => handleChange('phone', e.target.value)}
              value={formValues.phone ?? ''}
              InputLabelProps={{ shrink: Boolean(formValues.phone) }}
              error={formErrors.phone !== null}
              // helperText={formErrors.phone || ''}
              helperText={formErrors.phone !== null ? 'Phone number is required ' : ''}

            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Email'}
              fullWidth
              name='email'
              variant='filled'
              onChange={(e) => handleChange('email', e.target.value)}
              value={formValues.email ?? ''}
              InputLabelProps={{ shrink: Boolean(formValues.email) }}
            />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
            <TextField
              label={'Asset / Property'}
              fullWidth
              name='asset'
              variant='filled'
              required
              onChange={(e) => handleChange('asset', e.target.value)}
              value={formValues.asset}
              error={formErrors.asset !== null}
              helperText={formErrors.asset !== null ? 'Asset / Property is required ' : ''}
            />
          </Grid> */}

               <Grid
                 size={{
                   lg: 4,
                   md: 6,
                   sm: 6,
                   xs: 12
                 }}>
                            <Autocomplete
                                value={formValues.asset}
                                options={getAssetName || []}
                                getOptionLabel={(option) => {
                                    if (!option) return ''
                                    return typeof option === 'string' ? option : `${option.Name} - ${option.Code}`
                                }}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        {`${option.Name} - ${option.Code} - ${option['Asset Owner']} - ${option.Location}`}
                                    </li>
                                )}
                                onChange={(event, newValue) => handleChange('asset', newValue)}
                                isOptionEqualToValue={(option, value) => option?.asset_id === value?.asset_id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant='filled'
                                        label='Asset Name'
                                        required
                                        fullWidth
                                            error={formErrors.asset !== null}
                                             helperText={formErrors.asset !== null ? 'Asset / Property is required ' : ''}
                                    />
                                )}
                            />
                        </Grid>

          {formValues.asset?.asset_id && (
              <Grid
                  size={{
                      lg: 12,
                      md: 12,
                      sm: 12,
                      xs: 12
                  }}>
                  <Box
                      display='flex'
                      flexDirection='row'
                      alignItems='flex-start'
                      p={2}
                      mt={1}
                      border='1px solid #ccc'
                      borderRadius={2}
                      bgcolor='#f9f9f9'
                      flexWrap='wrap'
                  >
                      <Box display='flex' flexDirection='row' gap={4} ml={2} flexWrap='wrap'>
                          <Typography variant='h6'>
                              Asset Code : {formValues.asset?.Code}
                          </Typography>
                          <Typography variant='h6'>
                              Asset Group : {formValues.asset?.['Asset Group']}
                          </Typography>
                          <Typography variant='h6'>
                              Asset Type : {formValues.asset?.['Asset Type']}
                          </Typography>
                          <Typography variant='h6'>
                              Location : {formValues.asset?.Location}
                          </Typography>
                          <Typography variant='h6'>
                              Assigned To : {formValues.asset?.['Assigned To'] || '-'}
                          </Typography>
                      </Box>
                  </Box>
              </Grid>
          )}

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Location / City'}
              fullWidth
              name='location'
              variant='filled'
              onChange={(e) => handleChange('location', e.target.value)}
              value={formValues.location ?? ''}
              InputLabelProps={{ shrink: Boolean(formValues.location) }}
            />
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Monthly rent (₹)'}
              fullWidth
              type='number'
              name='rent'
              variant='filled'
              required
              onChange={(e) => handleChange('rent', e.target.value)}
              value={formValues.rent ?? ''}
              InputLabelProps={{ shrink: formValues.rent !== null && formValues.rent !== '' }}
              error={formErrors.rent !== null}
              helperText={formErrors.rent !== null ? 'Monthly rent (₹) is required ' : ''}
            />
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Security deposit(₹)'}
              fullWidth
              type='number'
              name='deposit'
              variant='filled'
              onChange={(e) => handleChange('deposit', e.target.value)}
              value={formValues.deposit ?? ''}
              InputLabelProps={{ shrink: formValues.deposit !== null && formValues.deposit !== '' }}
              error={Boolean(formErrors.deposit)}
              helperText={formErrors.deposit || ''}
            />
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Autocomplete
              options={billingCycle || []}
              getOptionLabel={(option) => option.type}
              value = {formValues.billing_cycle || null}
              onChange={(e,newValue) => handleChange('billing_cycle' , newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  label={'Billing Cycle'}
                  variant='filled'
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Billing day of month'}
              fullWidth
              type='number'
              name='billing_day_of_month'
              variant='filled'
              inputProps={{ min: 1, max: 31 }}
              onChange={(e) =>
                handleChange('billing_day_of_month', e.target.value)
              }
              value={formValues.billing_day_of_month ?? ''}
              InputLabelProps={{ shrink: formValues.billing_day_of_month !== null && formValues.billing_day_of_month !== '' }}
              error={Boolean(formErrors.billing_day_of_month)}
              helperText={formErrors.billing_day_of_month || ''}
            />
          </Grid>
          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Escalation Rate (% per year)'}
              fullWidth
              type='number'
              name='escalation_rate'
              variant='filled'
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleChange('escalation_rate', '');
                  return;
                }
                const num = Number(value);
                if (!Number.isNaN(num) && num >= 0 && num <= 100) {
                  handleChange('escalation_rate', value);
                }
              }}
              value={formValues.escalation_rate ?? ''}
              InputLabelProps={{ shrink: formValues.escalation_rate !== null && formValues.escalation_rate !== '' }}
              error={formErrors.escalation_rate !== null && formErrors.escalation_rate !== undefined}
              helperText={formErrors.escalation_rate || ''}
            />
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='Start Date'
                value={toMomentOrNull(formValues.startDate)}
                onChange={(date) =>
                  handleChange('startDate', moment(date).format('YYYY-MM-DD'))
                }
                views={['year', 'month', 'day']}
                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: true, error: formErrors.startDate !== null, helperText: formErrors.startDate !== null ? 'Start Date is required ' : '' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                label='End Date'
                value={toMomentOrNull(formValues.endDate)}
                onChange={(date) =>
                  handleChange('endDate', moment(date).format('YYYY-MM-DD'))
                }
                views={['year', 'month', 'day']}
                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: true, error: formErrors.endDate !== null, helperText: formErrors.endDate !== null ? 'End Date is required ' : '' } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid
          size={{lg: 4,md: 6,sm: 6,xs: 12,}}>
            <Autocomplete
            multiple
            fullWidth
            options={_.uniqBy(reminderDaysBefore, 'reminder')}
            getOptionLabel={(option) => option?.reminder?.toString() || ''}
            isOptionEqualToValue={(option, value) => option?.reminder?.toString() === value?.reminder?.toString()}
            value={Array.isArray(formValues.reminder) ? formValues.reminder : []}
            onChange={(event, newValue) => handleChange('reminder', newValue || [])}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Send Reminder Before"
                variant="filled"
              />
            )}/>
            </Grid>

                  <Grid
                    size={{
                      lg: 4,
                      md: 6,
                      sm: 6,
                      xs: 12
                    }}>
                    <FormControlLabel
                        label = 'Repeat'
                        control = {
                            <Switch
                                checked = {formValues.repeat}
                                onChange = {() => setFormValues({...formValues, repeat: !formValues.repeat})}
                            />
                        }
                    />
                    </Grid>

          <Grid
            size={{
              lg: 4,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <TextField
              label={'Note'}
              multiline
              rows={6}
              fullWidth
              name='note'
              variant='filled'
              onChange={(e) => handleChange('note', e.target.value)}
              value={formValues.note ?? ''}
              InputLabelProps={{ shrink: Boolean(formValues.note) }}
            />
          </Grid>

           <Grid
             size={{
               lg: 12,
               md: 12,
               sm: 12,
               xs: 12
             }}>
                                  <Grid container>
                                    <Grid
                                      size={{
                                        lg: 12,
                                        md: 12,
                                        sm: 12,
                                        xs: 12
                                      }}>
                                                            <Typography>Send Reminders Through : </Typography>
                                                            </Grid>
                                    
                                      <Grid
                                        size={{
                                          lg: 3,
                                          md: 4,
                                          sm: 4,
                                          xs: 12
                                        }}>
                                          <FormControlLabel 
                                              control = {
                                                  <Checkbox 
                                                      checked = {formValues.email_notification}
                                                      onChange = {(e) => handleEmailSmsChange('email_notification', e.target.checked)}
                                                  />
                                              }
                                              label = 'EMAIL'
                                              labelPlacement = 'end'
                                          />
                                          {/* {
                                              formErrors.formValues !== null &&  (
                                                  <FormHelperText sx={{ color : '#d32f2f' }}>
                                                      EMAIL is Required!
                                                  </FormHelperText>
                                              )
                                          } */}
                                      </Grid>
          
                                      <Grid
                                        size={{
                                          lg: 3,
                                          md: 4,
                                          sm: 4,
                                          xs: 12
                                        }}>
                                          <FormControlLabel 
                                              control = {
                                                  <Checkbox 
                                                      checked = {formValues.sms_notification}
                                                      onChange = {(e) => handleEmailSmsChange('sms_notification', e.target.checked)}
                                                  />
                                              }
                                              label = 'SMS'
                                              labelPlacement = 'end'
                                          />
                                          {/* {
                                              formErrors.sms_notification !== null && (
                                                  <FormHelperText sx={{ color : '#d32f2f' }}>
                                                      SMS is Required!
                                                  </FormHelperText>
                                              )
                                          } */}
                                      </Grid>

                                      <Grid
                                        size={{
                                          lg: 3,
                                          md: 4,
                                          sm: 4,
                                          xs: 12
                                        }}>
                                          <FormControlLabel 
                                              control = {
                                                  <Checkbox 
                                                      checked = {formValues.whatsApp_notification}
                                                      onChange = {(e) => handleEmailSmsChange('whatsApp_notification', e.target.checked)}
                                                  />
                                              }
                                              label = 'Whatsapp'
                                              labelPlacement = 'end'
                                          />
                                          {/* {
                                              formErrors.whatsApp_notification !== null && (
                                                  <FormHelperText sx={{ color : '#d32f2f' }}>
                                                      Whatsapp is Required!
                                                  </FormHelperText>
                                              )
                                          } */}
                                      </Grid>
                                  </Grid>
                              </Grid>


             <Grid
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
               <AttachmentField 
                asset='Renewals'
                previews={renewalsFiles.renewalsFilePreviews}
                setPreviews={setRenewalsFiles}
                />
              <Typography color='error'>
                {formErrors.files === null ? '' : formErrors.files}
              </Typography>
            </Grid>

          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container justifyContent='flex-end' spacing={2} mb={2}>
              <Grid>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => props.handleClose()}
                >
                  Cancel
                </Button>
              </Grid>

              <Grid>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
};

export default RentalAndTenantForm;
