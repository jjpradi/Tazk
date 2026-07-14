import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import {capitalize} from 'lodash';
import moment from 'moment';
import {useDispatch, useSelector} from 'react-redux';
import {
  CreateServiceDue,
  GetMeterTypeAction,
  GetPriorityAction,
  getServiceDueByAssetAction,
  GetServiceTypeAction,
  updateServiceDueAction,
} from 'redux/actions/serviceDue_actions';
import {getAllAssetAction} from 'redux/actions/asset_actions';
import PropTypes from 'prop-types';
import {phoneValidation,emailValidation} from 'components/regexFunction';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import {OpenalertActions} from 'redux/actions/alert_actions';
import {requiredFieldsAlertMessage} from 'utils/content';
import { asstGeneralContactAction } from '../../../redux/actions/asset_actions';
import toMomentOrNull from '../../../utils/DateFixer';
import _ from 'lodash';

const ServiceDueForm = (props) => {
  console.log(props,"fgdfgd");
  
  const dispatch = useDispatch();
  const didInitEdit = useRef(false);
  const {
    AssetReducers: {getAssetName,get_asst_general},
    ServiceDueReducers: {serviceDueByAsset , getServiceDuePriority, getServiceType, getMeterType},
  } = useSelector((state) => state);
  console.log(serviceDueByAsset ,"dfgdgdf");
  

   const [renewalsFiles, setRenewalsFiles] = useState({
          renewalsFiles : [],
          renewalsFilePreviews : [],
          existingImageKey : []
      })

  const [formData, setFormData] = useState({
    id: null,
    assetName: null,
    title: null,
    priority: null,
    dueDate: null,
    description: null,
    amount: null,
    serviceType: null,
    serviceIntervalTime: null,
    serviceIntervalMeter: null,
    meterType: null,
    estimatedCost: null,
    warrantyExpiry: null,
    lastServiceDate: null,
    location_id: null,
    vendor_name: null,
    assetId: null,
    provider_contact: null,
    provider_email: null,
    provider_name: null,
    whatsApp_notification: null,
    sms_notification: null,
    email_notification: null,
    repeat : 0,
    asset_id : null,
    reminder : [],
  });

  const [formErrors, setFormErrors] = useState({
    // files : null,
    assetId: null,
    title: null,
    dueDate: null,
    serviceType: null,
    provider_contact: null,
    amount: null,
  });

  const requiredFields = ['assetId', 'title', 'dueDate', 'serviceType', 'amount'];

  useEffect(() => {
    if (formData.provider_name !== null || formData.provider_name !== '') {
      requiredFields.push('provider_contact');
    }
  }, [formData.provider_name]);

  const intervalRegex = /^(\d+y)?\s*(\d+m)?$/;

  const hoursRegex = /^\d+$/;

  useEffect(() => {
    if (props.page !== 'asset') {
      dispatch(getAllAssetAction());
    }
    dispatch(GetPriorityAction());
    dispatch(GetServiceTypeAction());
    dispatch(GetMeterTypeAction());
    if (props.page !== 'asset') {
      dispatch(asstGeneralContactAction())
    }
  }, []);

  useEffect(() => {
    if (props.page === 'asset' && props.assetNamePreview) {
      setFormData((prev) => ({
        ...prev,
        assetId: props.assetNamePreview,
        vendor_name: props.assetNamePreview['Asset Owner'] || '',
        location_id: props.assetNamePreview.Location || '',
        assetName: props.assetNamePreview.Name || '',
      }))
    }
  }, [props.page, props.assetNamePreview]);

  const toBool = (value) => {
    if (value === true) return true;
    if (value === false) return false;
    if (value === 1 || value === '1') return true;
    if (value === 0 || value === '0') return false;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  };

  const normalizeOptionalDate = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      value === 'null' ||
      value === '0000-00-00'
    ) {
      return null;
    }

    const parsedDate = moment(value);
    if (!parsedDate.isValid()) return null;

    if (parsedDate.year() <= 1900) return null;

    return parsedDate.format('YYYY-MM-DD');
  };

  const normalizeReminder = (raw) => {
    if (!raw) return [];
    let values = raw;
    if (typeof raw === 'string') {
      try {
        values = JSON.parse(raw);
      } catch (err) {
        values = raw.split(',').map((v) => v.trim());
      }
    }
    if (!Array.isArray(values)) values = [values];
    return values
      .map((value) => {
        if (value && typeof value === 'object' && value.reminder !== undefined) {
          return {reminder: String(value.reminder)};
        }
        return {reminder: String(value)};
      })
      .filter((item) => item.reminder && item.reminder !== 'null');
  };

  const getPriorityOption = (data) => {
    if (!data) return null;
    return getServiceDuePriority?.find(
      (p) =>
        p.id === data.priority_id ||
        p.id === data.priority ||
        p.priority_name === data.priority_name ||
        p.priority_name === data.priority,
    ) || null;
  };

  const getServiceTypeOption = (data) => {
    if (!data) return null;
    return getServiceType?.find(
      (p) =>
        p.id === data.service_type_id ||
        p.id === data.service_type ||
        p.service_type === data.service_type ||
        p.service_type === data.type,
    ) || null;
  };

  const getMeterTypeOption = (data) => {
    if (!data) return null;
    return getMeterType?.find(
      (p) =>
        p.id === data.meter_type_id ||
        p.id === data.meter_type ||
        p.meter_type === data.meter_type ||
        p.meter_type === data.meterType,
    ) || null;
  };

  const getProviderOption = (data) => {
    if (!data) return null;
    const providerName = data.provider_name || data.service_provider;
    if (!get_asst_general?.data?.length) {
      return providerName || null;
    }
    const match = get_asst_general.data.find(
      (p) =>
        p.id === data.provider_id ||
        p.id === data.provider_name_id ||
        p.name === providerName,
    );
    return match || providerName || null;
  };

  const getAssetOption = (data) => {
    if (props.page === 'asset' && props.assetNamePreview) return props.assetNamePreview;
    if (!data) return null;
    if (getAssetName?.length) {
      const byId = getAssetName.find(
        (a) => a.asset_id === data.asset_id || a.asset_id === data.assetId,
      );
      if (byId) return byId;
      const byCode = getAssetName.find((a) => a.Code === data.asset_code);
      if (byCode) return byCode;
    }
    if (data.asset_id || data.asset_code || data.asset_name) {
      return {
        asset_id: data.asset_id || data.assetId || null,
        Code: data.asset_code || data.Code || '',
        Name: data.asset_name || data.name || data.assetName || '',
        'Asset Owner': data.vendor_name || data['Asset Owner'] || '',
        Location: data.location || data.location_id || data.Location || '',
      };
    }
    return null;
  };

  
  useEffect(() => {
    if (!props.editData || didInitEdit.current) return;

    const data = props.editData;
    const assetOption = getAssetOption(data);
    const priorityOption = getPriorityOption(data);
    const serviceTypeOption = getServiceTypeOption(data);
    const meterTypeOption = getMeterTypeOption(data);
    const providerOption = getProviderOption(data);
    const reminder = normalizeReminder(
      data.reminder ?? data.renewal_reminder ?? data.reminder_days,
    );
     const generalConatct = get_asst_general?.data?.find((item) => item.id === data?.service_provider)


    setFormData((prev) => ({

      
      ...prev,
      id: data.id || data.service_due_id || null,
      assetId: data.asset_id || data.assetId || assetOption?.asset_id || prev.assetId, // Explicitly Asset ID
      assetName: assetOption?.Name || data.asset_name || data.Name || prev.assetName,
      vendor_name:
        assetOption?.['Asset Owner'] ||
        data.vendor_name ||
        data['Asset Owner'] ||
        prev.vendor_name,
      location_id:
        assetOption?.Location ||
        data.location ||
        data.location_id ||
        data.Location ||
        prev.location_id,
      title: data.title ?? data.service_title ?? prev.title,
      priority: priorityOption || prev.priority,
      dueDate: data.due_date ?? data.dueDate ?? prev.dueDate,
      description: data.description ?? prev.description,
      amount: data.amount ?? prev.amount,
      serviceType: serviceTypeOption || prev.serviceType,
      serviceIntervalTime: data.interval_time ?? data.service_interval_time ?? prev.serviceIntervalTime,
      serviceIntervalMeter: data.interval_meter ?? data.service_interval_meter ?? prev.serviceIntervalMeter,
      meterType: meterTypeOption || prev.meterType,
      estimatedCost: data.estimate_cost ?? data.estimated_cost ?? prev.estimatedCost,
      warrantyExpiry: normalizeOptionalDate(data.warranty_expiry) ?? prev.warrantyExpiry,
      lastServiceDate: normalizeOptionalDate(data.last_service_date) ?? prev.lastServiceDate,
      provider_name: generalConatct?.name,
      provider_contact: generalConatct?.contact,
      provider_email: generalConatct?.email,
      email_notification: toBool(data.email_notification),
      sms_notification: toBool(data.sms_notification),
      whatsApp_notification: toBool(data.whatsApp_notification ?? data.whatsapp_notification),
      repeat: toBool(data.repeat),
      reminder,
    }));

    if (Array.isArray(data.image) && data.image.length > 0) {
      const imageUrls = data.image.map((img) => img.imageUrl || img.url || img);
      setRenewalsFiles((prev) => ({
        ...prev,
        renewalsFilePreviews: imageUrls,
        renewalsFiles: prev.renewalsFiles || [],
      }));
    }

    didInitEdit.current = true;
  }, [
    props.editData,
    getServiceDuePriority,
    getServiceType,
    getMeterType,
    getAssetName,
    get_asst_general,
    props.page,
    props.assetNamePreview,
  ]);

    useEffect(() => {
        if(renewalsFiles.renewalsFilePreviews.length > 2) {
            setFormErrors({
                ...formErrors,
                files : 'Only 2 Files are allowed!'
            })
        }
        else {
            setFormErrors({
                ...formErrors,
                files : null
            })
        }
    }, [renewalsFiles.renewalsFilePreviews])


  useEffect(() => {
    if (getServiceDuePriority?.length && !formData.priority) {
      const mediumPriority = getServiceDuePriority.find(
        (p) => p.priority_name === 'MEDIUM',
      );
      setFormData((prev) => ({...prev, priority: mediumPriority}));
    }
  }, [getServiceDuePriority]);

  useEffect(() => {
    if (getMeterType?.length && !formData.meterType) {
      const kmMeter = getMeterType.find((p) => p.meter_type === 'KM');
      setFormData((prev) => ({...prev, meterType: kmMeter}));
    }
  }, [getMeterType]);

  const handleChange = (name, value) => {
    console.log(value ,"dfgdfgd");
    
    setFormData((prev) => {
      const updatedData = {...prev, [name]: value};
      if (name === 'assetId') {
        const selectAsset = getAssetName.find(
          (item) => item?.Code === value?.Code,
        );
        console.log(selectAsset,"dfsdgdf");
        
        // updatedData.assetId = value?.asset_id || null;
        updatedData.vendor_name = selectAsset ? selectAsset['Asset Owner'] : '';
        updatedData.location_id = selectAsset ? selectAsset.Location : '';
        updatedData.assetName = selectAsset ? selectAsset.Name : '';
      }
      return updatedData;
    });
    validateForm(name, value);
  };

  const validateForm = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      (requiredFields.includes(name) && value === null) ||
      value === 'null' ||
      value === '' ||
      (Object.keys(value) && value.value === null)
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name.replace(/_/g, '')) + ' is Required',
      });
    } else {
      setFormErrors({...formErrors, [name]: null});
    }
  };

  const handleDateChange = (date, field) => {
    if (!date) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: `${field === 'dueDate' ? 'Due Date' : ''} is Required!`,
      }));
      setFormData((prev) => ({
        ...prev,
        [field]: null,
      }));
    } else {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      setFormErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
      setFormData((prev) => ({
        ...prev,
        [field]: formattedDate,
      }));
    }
  };

  const serviceDueStartAndEndDate = (key) => {
    switch (key) {
      case 'dueDate':
        return 'Due Date is Required!';

      default:
        return capitalize(key) + ' is required';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    let formErrorsObj = {...formErrors};
    Object.keys(formData).forEach((key, i) => {
      if (renewalsFiles?.renewalsFiles?.length > 2) {
        isValid = false;
        formErrorsObj.files = 'Only 2 Files are allowed!';
      }

      if (key === 'serviceIntervalTime') {
        if (formData[key] && !intervalRegex.test(formData[key])) {
          isValid = false;
          formErrorsObj[key] =
            "Invalid format. Use e.g. '1y 6m', '2y', or '8m'";
        }
      }

      if (
        requiredFields.includes(key) &&
        (formData[key] === null ||
          formData[key] === 'null' ||
          formData[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = serviceDueStartAndEndDate(key);
      }

      if (key === 'amount' && (formData[key] === 0 || formData[key] === '0')) {
        isValid = false;
        formErrorsObj[key] = 'Amount cannot be 0!';
      }
      return null;
    });
   if (
      formData.provider_email &&
      !emailValidation(formData.provider_email)
    ) {
      isValid = false;
      formErrorsObj.provider_email = "Invalid Email Address!";
    }
    setFormErrors(formErrorsObj);

    if (isValid) {
      // const formValues = new FormData()
      // let serviceDueFile = []
      // renewalsFiles.renewalsFiles.map((file) => {
      //     formValues.append('renewalsFiles', file)
      //     serviceDueFile.push({
      //         fileName : file.name,
      //         type : file.type
      //     })
      // })
      // formValues.append('asset_id', formData.assetName.asset_id)
      // formValues.append('service_provider', formData.serviceProvider)
      // formValues.append('provider_contact', formData.providerContact)
      // formValues.append('start_date', formData.startDate)
      // formValues.append('end_date', formData.endDate)
      // formValues.append('image', JSON.stringify(serviceDueFile))
const formValues = new FormData();
// const finalAssetId =
//   typeof formData.assetId === "object"
//     ? formData.assetId?.asset_id
//     : formData.assetId || props.editData?.asset_id;
//   console.log(finalAssetId, "tehe")
//   console.log("assetId raw:", formData.assetId);
// console.log("finalAssetId:", finalAssetId);

      let renewfiles;
      let renewalsFile = []

      if (renewalsFiles.renewalsFiles?.length > 0) {
        renewalsFiles.renewalsFiles.map((file) => {
          formValues.append('renewalsFiles', file)
          renewfiles = file
          renewalsFile.push({
            fileName: file.name,
            type: file.type
          })
        })
      } else if (renewalsFiles.existingImageKey?.length > 0) {
        renewalsFile = renewalsFiles.existingImageKey.map((url) => ({
          fileName: url,
          type: 'existing'
        }))
      }

if (formData.id) {
      formValues.append("id", formData.id);
    }
formValues.append("image", JSON.stringify(renewalsFile));
formValues.append("asset_id", formData.assetId?.asset_id || "");
formValues.append("title", formData.title || "");
formValues.append("priority", formData.priority?.id || "");
formValues.append("due_date", formData.dueDate || "");
formValues.append("amount", formData.amount || "");
formValues.append("description", formData.description || "");
formValues.append("service_type", formData.serviceType?.id || "");
formValues.append("interval_time", formData.serviceIntervalTime || "");
formValues.append("interval_meter", formData.serviceIntervalMeter || "");
formValues.append("meter_type", formData.meterType?.id || "");
formValues.append("estimate_cost", formData.estimatedCost || "");
formValues.append("warranty_expiry", formData.warrantyExpiry || "");
formValues.append("last_service_date", formData.lastServiceDate || "");
formValues.append("whatsApp_notification", formData.whatsApp_notification ? 1 : 0);
formValues.append("sms_notification", formData.sms_notification ? 1 : 0);
formValues.append("email_notification", formData.email_notification ? 1 : 0);
formValues.append("repeat", formData.repeat ? 1 : 0);
formValues.append('reminder',  JSON.stringify(formData.reminder) || null)
formValues.append("provider_name", formData.provider_name?.id ? formData.provider_name?.id : formData.provider_name);
formValues.append("provider_email", formData.provider_email || "");
formValues.append("provider_contact", formData.provider_contact || "");


      if (props.type === 'service') {
        props.handleNext(formValues);
      } else if (props.type === 'edit') {
        await dispatch(updateServiceDueAction(formValues ,props?.rowData?.id));
        props.handleCancel();
      } else {
        await dispatch(CreateServiceDue(formValues));
        props.handleCancel();
      }
    } else {
      dispatch(
        OpenalertActions({
          msg: requiredFieldsAlertMessage,
          severity: 'warning',
        }),
      );
    }
  };

const reminderDaysBefore = [
    {reminder : '2'},
    {reminder : '5'},
    {reminder : '7'},
  ]
useEffect(() => {
  if (props.type === "edit") {
    dispatch(getServiceDueByAssetAction(props?.rowData?.id,{type: "Renew"}));
  }
}, [props.type, props?.rowData?.id, dispatch]);

useEffect(() => {
  if (props.type !== "edit") return;

  if (!serviceDueByAsset) return;

  const record = serviceDueByAsset[0]

  if (!record) return;

  const assetObj = getAssetName?.find(
    (a) => a.asset_id === record.asset_id
  );

  const priorityObj = getServiceDuePriority?.find(
    (p) => p.id === record.priority
  );

  const serviceTypeObj = getServiceType?.find(
    (t) => t.id === record.service_type
  );

  const meterTypeObj = getMeterType?.find(
    (m) => m.id === record.meter_type
  );
 const generalConatct = get_asst_general?.data?.find((item) => item.id === record?.service_provider)
 
  setFormData((prev) => ({
    ...prev,
    assetId: assetObj || null,
    assetName: record.name ? JSON.parse(record.name) : null,
    title: record.title || "",
    priority: priorityObj || null,
    dueDate: record.due_date || null,
    description: record.description || "",
    amount: record.amount || "",
    serviceType: serviceTypeObj || null,
    serviceIntervalTime: record.interval_time || "",
    serviceIntervalMeter: record.interval_meter || "",
    meterType: meterTypeObj || null,
    estimatedCost: record.estimate_cost || "",
      warrantyExpiry: normalizeOptionalDate(record.warranty_expiry),
      lastServiceDate: normalizeOptionalDate(record.last_service_date),
    provider_contact: generalConatct?.contact || "",
    provider_email: generalConatct?.email || "",
    provider_name:generalConatct?.name,
    reminder: record.reminder ? JSON.parse(record.reminder) : [],
    repeat: Boolean(record.repeat),
    email_notification: Boolean(record.email_notification),
    sms_notification: Boolean(record.sms_notification),
    whatsApp_notification: Boolean(record.whatsApp_notification),
  }))

  setRenewalsFiles({
    renewalsFiles : [],
     renewalsFilePreviews: record.image?.map(img => img.imageUrl) || [],
     existingImageKey : record.imageKey ? JSON.parse(record.imageKey) : []
  })
}, [
  props.type,
  props?.rowData?.id,
  serviceDueByAsset,
  getAssetName,
  getServiceDuePriority,
  getServiceType,
  getMeterType,
]);

      
useEffect(() => {
  if (
    formData.provider_name &&
    typeof formData.provider_name === 'object' &&
    (formData.provider_name?.contact || formData.provider_name?.email)
  ) {
    setFormData((prev) => ({
      ...prev,
      provider_contact: formData.provider_name?.contact || prev.provider_contact,
      provider_email: formData.provider_name?.email || prev.provider_email,
    }));
  }
}, [formData.provider_name])
const isLastVisibleTab =
  props?.tabItems?.findIndex((t) => t.id === props?.currentTabIndex) ===
  props?.tabItems?.length - 1;

  return (
    <Card
        sx={{
          p: 5,
          maxHeight: props.page === 'asset' ? 'none' : 'calc(100vh - 80px)',
          overflowY: props.page === 'asset' ? 'visible' : 'auto',
          overflowX: 'hidden',
        }}
      >
      <Grid container spacing={2}>
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
            New Service Due
          </Typography>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Typography variant='h6'>Asset</Typography>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 6,
                md: 6,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                options={getAssetName || []}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return typeof option === 'string'
                    ? option
                    : `${option.Code} - ${option.Name}`;
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    {`${option.Code} - ${option.Name} - ${option['Asset Owner']} - ${option.Location}`}
                  </li>
                )}
                 value={formData.assetId ?? null}
                onChange={(name, value) => handleChange('assetId', value)}
                isOptionEqualToValue={(option, value) =>
                  option?.asset_id === value?.asset_id
                }
                disabled={props.page === 'asset'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label='Asset Name'
                    variant='filled'
                    value={formData.assetId || ''}
                    error={formErrors.assetId !== null}
                    helperText={
                      formErrors.assetId === null ? '' : 'Asset Name is Required!'
                    }
                  />
                )}
              />
            </Grid>

            {formData.assetId !== null && (
              <>
                <Grid
                  size={{
                    lg: 6,
                    md: 6,
                    sm: 6,
                    xs: 12
                  }}>
                  <Box
                    display='flex'
                    flexDirection='row'
                    alignItems='flex-start'
                    p={2}
                    mt={2}
                    border='1px solid #ccc'
                    borderRadius={2}
                    bgcolor='#f9f9f9'
                  >
                    <Box display='flex' flexDirection='row' gap={4} ml={2}>
                      <Typography variant='h6'>
                        Asset Group : {formData?.assetId?.['Asset Group'] || ''}
                      </Typography>
                      <Typography variant='h6'>
                        Asset Type : {formData?.assetId?.['Asset Type'] || ''}
                      </Typography>
                      <Typography variant='h6'>
                        Asset Code : {formData?.assetId?.Code || ''}
                      </Typography>

                      <Typography variant='h6'>
                        Location : {formData?.assetId?.Location || formData.location_id || ''}
                        </Typography>
                        <Typography variant='h6'>
                          Assigned To : {formData.assetId?.['Assigned To']}
                         </Typography>
                    </Box>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Typography variant='h6'>Basics</Typography>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                required
                label='Title'
                variant='filled'
                value={formData.title || ''}
                onChange={(event) => handleChange('title', event.target.value)}
                error={formErrors.title !== null}
                helperText={
                  formErrors.title === null ? '' : 'Title is Required!'
                }
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Autocomplete
                options={getServiceDuePriority}
                getOptionLabel={(option) => option.priority_name || ''}
                value={formData.priority}
                onChange={(name, value) => handleChange('priority', value)}
                renderInput={(params) => (
                  <TextField {...params} label='Priority' variant='filled' />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='Due Date'
                  value={toMomentOrNull(formData.dueDate)}
                  minDate={moment()}
                  onChange={(date) => handleDateChange(date, 'dueDate')}
                  views={['year', 'month', 'day']}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', error: formErrors.dueDate !== null, helperText: formErrors.dueDate === null ? '' : formErrors.dueDate } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Amount'
                variant='filled'
                value={formData.amount || ''}
                type='number'
                required
                onChange={(event) => handleChange('amount', event.target.value)}
                error={formErrors.amount !== null || formData.amount === '0' || formData.amount === 0}
                helperText={
                  formData.amount === '0' || formData.amount === 0
                    ? 'Amount cannot be 0!'
                    : formErrors.amount === null ? '' : formErrors.amount
                }
              />
            </Grid>

            <Grid
              size={{
                lg: 8,
                md: 8,
                sm: 8,
                xs: 12
              }}>
              <TextField
                fullWidth
                multiline
                label='Description'
                name='description'
                variant='filled'
                rows={4}
                value={formData.description || ''}
                onChange={(event) =>
                  handleChange('description', event.target.value)
                }
              />
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
          </Grid>
        </Grid>

        <Grid
          size={{
            lg: 2,
            md: 2,
            sm: 2,
            xs: 2
          }}></Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Typography variant='h6'>Service Provider</Typography>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              {/* <TextField
                fullWidth
                label='Provider Name'
                variant='filled'
                value={formData.provider_name}
                onChange={(event) =>
                  handleChange('provider_name', event.target.value)
                }
              /> */}

              <Autocomplete
                fullWidth
                freeSolo
                options={get_asst_general.data || []}
                getOptionLabel={(option) =>
                  typeof option === 'string' ? option : option?.name || ''
                }
                value={formData.provider_name || null}
                onInputChange={(event, newInputValue, reason) => {
                                      if (reason === 'input') {
                                      handleChange('provider_name', newInputValue)
                                      }
                                  }}

                onChange={(event, newValue) => {
                  handleChange('provider_name', newValue)
                }}

                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Provider Name"
                    variant="filled"
                  />
                )}
              />

            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Provider Email'
                variant='filled'
                value={formData.provider_email || ''}
                onChange={(event) =>
                  handleChange('provider_email', event.target.value)
                }
               error={
                   formData.provider_email &&
                  !emailValidation(formData.provider_email)
                }
                helperText={
                  formData.provider_email &&
                  !emailValidation(formData.provider_email)
                    ? 'Invalid Email Address!'
                    : ''
                }
                
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Provider Contact'
                variant='filled'
                value={formData.provider_contact || ''}
                type='number'
                required = { (formData.provider_name && !formData.provider_contact) || 
                                    (formData.provider_contact && !phoneValidation(formData.provider_contact))}
                onChange={(event) =>
                  handleChange('provider_contact', event.target.value)
                }
                
                error={
                  (formData.provider_name && !formData.provider_contact) || 
                  (formData.provider_contact && !phoneValidation(formData.provider_contact))
                  }
                  helperText={
                      formData.provider_name && !formData.provider_contact
                      ? 'Provider contact is required'
                      : formData.provider_contact && !phoneValidation(formData.provider_contact)
                      ? 'Invalid Contact No!'
                      : ''
                  }
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Typography variant='h6'>Service Details</Typography>
        </Grid>

        <Grid
          size={{
            lg: 10,
            md: 10,
            sm: 10,
            xs: 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Autocomplete
                options={getServiceType}
                getOptionLabel={(option) => option.service_type || ''}
                value={formData.serviceType}
                onChange={(name, value) => handleChange('serviceType', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label='Service Type'
                    variant='filled'
                    error={formErrors.serviceType !== null}
                    helperText={
                      formErrors.serviceType === null
                        ? ''
                        : 'Service Type is Required!'
                    }
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Service Interval Time'
                variant='filled'
                value={formData.serviceIntervalTime  || ''}
                onChange={(event) =>
                  handleChange('serviceIntervalTime', event.target.value)
                }
                error={
                  formData.serviceIntervalTime &&
                  !intervalRegex.test(formData.serviceIntervalTime)
                }
                helperText={
                  formData.serviceIntervalTime &&
                  !intervalRegex.test(formData.serviceIntervalTime)
                    ? "Invalid format. Use e.g. '1y 6m', '2y', or '8m'"
                    : ''
                }
                placeholder='E.g. 1y 6m or 2y or 6m'
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <TextField
                fullWidth
                label='Estimated Cost'
                variant='filled'
                value={formData.estimatedCost || ''}
                type='number'
                onChange={(event) =>
                  handleChange('estimatedCost', event.target.value)
                }
              />
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='Warranty Expiry'
                  value={toMomentOrNull(formData.warrantyExpiry)}
                  onChange={(date) => handleDateChange(date, 'warrantyExpiry')}
                  views={['year', 'month', 'day']}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='Last Service Date'
                  value={toMomentOrNull(formData.lastServiceDate)}
                  onChange={(date) => handleDateChange(date, 'lastServiceDate')}
                  views={['year', 'month', 'day']}
                  format="DD/MM/YYYY"
                  slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
                />
              </LocalizationProvider>
            </Grid>

                                <Grid
                                size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 4,
                                  xs: 12}}>
                                    <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    fullWidth
                                    options={_.uniqBy(reminderDaysBefore, "reminder")}
                                    getOptionLabel={(option) => option?.reminder?.toString() || ""}
                                    value={Array.isArray(formData.reminder) ? formData.reminder : []}
                                    onChange={(event, newValue) => handleChange("reminder", newValue || [])}
                                    isOptionEqualToValue={(option, value) => option?.reminder === value?.reminder}
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
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                          }}>
                                        <FormControlLabel
                                            label = 'Repeat'
                                            control = {
                                                <Switch
                                                    checked = {formData.repeat}
                                                    onChange = {() => setFormData({...formData, repeat: !formData.repeat})}
                                                />
                                            }
                                        />
                                        </Grid>
          </Grid>
        </Grid>



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
              control={
                <Checkbox
                checked={formData.email_notification}
                onChange={(name, value) => handleChange('email_notification', value)}
                />
              }
              label='EMAIL'
              labelPlacement='end'
            />

          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sms_notification}
                onChange={(name, value) => handleChange('sms_notification', value)}
                />
              }
              label='SMS'
              labelPlacement='end'
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
              control={
                <Checkbox
                  checked={formData.whatsApp_notification}
                onChange={(name, value) => handleChange('whatsApp_notification', value)}
                />
              }
              label='Whatsapp'
              labelPlacement='end'
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

        {props.type === 'service' && (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container justifyContent='flex-end' spacing={2}>
              <Grid  sx={{ display: 'flex' , gap: 2 }}>
                <Button
                  variant='contained'
                  color={!props?.form ? 'error' : 'primary'}
                  onClick={props.handlePreviousOrCancel}
                >
                  {!props?.form ? 'Cancel' : 'Previous'}
                </Button>

               <Button onClick={handleSubmit} variant='contained'>
                {isLastVisibleTab ? 'Submit' : 'Next'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}

        {props.type !== 'service' && (
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container justifyContent='flex-end' spacing={2}>
              <Grid>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => props.handleCancel()}
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
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Card>
  );
};

ServiceDueForm.propTypes = {
  handleCancel: PropTypes.func,
  assetNamePreview: PropTypes.object,
  editData: PropTypes.object,
};

export default ServiceDueForm;

