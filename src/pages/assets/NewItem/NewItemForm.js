import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import { capitalize } from 'lodash';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import { getAllAssetAction } from 'redux/actions/asset_actions';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import { listUserCreationAction } from 'redux/actions/userCreation_actions';
import toMomentOrNull from '../../../utils/DateFixer';
import {
  createNewItem,
  getNewItemByAssetAction,
  updateNewItemAction,
} from '../../../redux/actions/newItem_actions';

const NewItemForm = (props) => {
  const dispatch = useDispatch();
  const didInitEdit = useRef(false);
  const assetId = props?.assetId;
  const {
    AssetReducers: { getAssetName },
    attendanceReducer: { get_empbasecompany },
    UserCreationReducer: { createUser },
    NewItemReducers: { newItemByAsset },
  } = useSelector((state) => state);

  const [attachments, setAttachments] = useState({
    renewalsFiles: [],
    renewalsFilePreviews: [],
    existingImageKey: [],
  });

  console.log("getAssetName", getAssetName);
  
  const [formData, setFormData] = useState({
    id: null,
    assetId: null,
    assetName: null,
    title: null,
    warrantyPeriod: null,
    oldAssetName: null,
    newAssetName: null,
    issuedDate: null,
    assignedTo: null,
    reasonForReplacement: null,
    issuedBy: null,
  });

  const [formErrors, setFormErrors] = useState({
    assetId: null,
    title: null,
    warrantyPeriod: null,
    oldAssetName: null,
    newAssetName: null,
    issuedDate: null,
    issuedBy: null,
    reasonForReplacement: null,
  });

  const requiredFields = [
    'assetId',
    'title',
    'oldAssetName',
    'newAssetName',
    'issuedDate',
    'issuedBy',
    'reasonForReplacement',
  ];

  const warrantyPeriodRegex = /^(\d+y)?\s*(\d+m)?$/;

  useEffect(() => {
    if (props.page !== 'asset') {
      dispatch(getAllAssetAction());
    }
    dispatch(getEmpbasecompanyAction());
    dispatch(listUserCreationAction());
  }, []);

  useEffect(() => {
    if (props.page === 'asset' && props.assetNamePreview) {
      setFormData((prev) => ({
        ...prev,
        assetId: props.assetNamePreview,
        assetName: props.assetNamePreview.Name || '',
        oldAssetName: prev.oldAssetName || props.assetNamePreview.Name || '',
      }));
    }
  }, [props.page, props.assetNamePreview]);

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
    const parsed = moment(value);
    if (!parsed.isValid() || parsed.year() <= 1900) return null;
    return parsed.format('YYYY-MM-DD');
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
        'Asset Group': data['Asset Group'] || data.asset_group || '',
        'Asset Type': data['Asset Type'] || data.asset_type || '',
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

    const assignedOption =
      get_empbasecompany?.find(
        (e) =>
          e.employee_id === data.assigned_to ||
          e.full_name === data.assigned_to_name ||
          e.full_name === data.assigned_to,
      ) || null;

    const issuedByOption =
      createUser?.find(
        (u) =>
          u.employee_id === data.issued_by ||
          (u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name) ===
            data.issued_by_name ||
          (u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name) ===
            data.issued_by,
      ) || null;

    setFormData((prev) => ({
      ...prev,
      id: data.id || data.new_item_id || null,
      assetId: assetOption || prev.assetId,
      assetName: assetOption?.Name || data.asset_name || prev.assetName,
      title: data.title ?? prev.title,
      warrantyPeriod: data.warranty_period ?? data.warrantyPeriod ?? prev.warrantyPeriod,
      oldAssetName: data.old_asset_name ?? data.oldAssetName ?? prev.oldAssetName,
      newAssetName: data.new_asset_name ?? data.newAssetName ?? prev.newAssetName,
      issuedDate:
        normalizeOptionalDate(data.issued_date ?? data.issuedDate) ?? prev.issuedDate,
      assignedTo: assignedOption || prev.assignedTo,
      reasonForReplacement:
        data.reason_for_replacement ??
        data.reasonForReplacement ??
        data.description ??
        prev.reasonForReplacement,
      issuedBy: data.full_name,
    }));

    if (Array.isArray(data.image) && data.image.length > 0) {
      const imageUrls = data.image.map((img) => img.imageUrl || img.url || img);
      setAttachments((prev) => ({
        ...prev,
        renewalsFilePreviews: imageUrls,
        renewalsFiles: prev.renewalsFiles || [],
      }));
    }

    didInitEdit.current = true;
  }, [props.editData, getAssetName, get_empbasecompany, createUser]);

  useEffect(() => {
    if (attachments.renewalsFilePreviews.length > 1) {
      setFormErrors((prev) => ({ ...prev, files: 'Only 1 File is allowed!' }));
    } else {
      setFormErrors((prev) => ({ ...prev, files: null }));
    }
  }, [attachments.renewalsFilePreviews]);

  const validateForm = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      (requiredFields.includes(name) && (value === null || value === '' || value === 'null')) ||
      (value && typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: capitalize(name.replace(/([A-Z])/g, ' $1').trim()) + ' is Required',
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'assetId') {
        const selectedName = value?.Name || '';
        updated.assetName = selectedName;
        updated.oldAssetName = selectedName;
      }
      return updated;
    });
    validateForm(name, value);
  };

  const handleDateChange = (date, field) => {
    if (!date) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: `${field === 'issuedDate' ? 'Issued Date' : field} is Required!`,
      }));
      setFormData((prev) => ({ ...prev, [field]: null }));
    } else {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
      setFormData((prev) => ({
        ...prev,
        [field]: moment(date).format('YYYY-MM-DD'),
      }));
    }
  };

  const fieldLabel = (key) => {
    switch (key) {
      case 'assetId':
        return 'Asset Name is Required!';
      case 'title':
        return 'Title is Required!';
      case 'oldAssetName':
        return 'Old Asset Name is Required!';
      case 'newAssetName':
        return 'New Asset Name is Required!';
      case 'issuedDate':
        return 'Issued Date is Required!';
      case 'issuedBy':
        return 'Issued By is Required!';
      case 'reasonForReplacement':
        return 'Reason is Required!';  
      default:
        return capitalize(key) + ' is Required';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let isValid = true;
    const formErrorsObj = { ...formErrors };

    if (attachments?.renewalsFiles?.length > 1) {
      isValid = false;
      formErrorsObj.files = 'Only 1 File is allowed!';
    }

    if (
      formData.warrantyPeriod &&
      !warrantyPeriodRegex.test(formData.warrantyPeriod)
    ) {
      isValid = false;
      formErrorsObj.warrantyPeriod = "Invalid format. Use e.g. '1y 6m', '2y', or '6m'";
    }

    requiredFields.forEach((key) => {
      if (
        formData[key] === null ||
        formData[key] === 'null' ||
        formData[key] === ''
      ) {
        isValid = false;
        formErrorsObj[key] = fieldLabel(key);
      }
    });

    setFormErrors(formErrorsObj);

    if (isValid) {

    const formValues = new FormData();

    let newItemFile = [];
    if (attachments.renewalsFiles?.length > 0) {
      attachments.renewalsFiles.forEach((file) => {
        formValues.append('renewalsFiles', file);
        newItemFile.push({ fileName: file.name, type: file.type });
      });
    } else if (attachments.existingImageKey?.length > 0) {
      newItemFile = attachments.existingImageKey.map((url) => ({
        fileName: url,
        type: 'existing',
      }));
    }

    if (formData.id) formValues.append('id', formData.id);
    formValues.append('image', JSON.stringify(newItemFile));
    formValues.append('asset_id', props.asset_id || formData.assetId?.asset_id || '');
    formValues.append('title', formData.title || '');
    formValues.append('warranty_period', formData.warrantyPeriod || '');
    formValues.append('old_asset_name', formData.oldAssetName || '');
    formValues.append('new_asset_name', formData.newAssetName || '');
    formValues.append('issued_date', formData.issuedDate || '');
    formValues.append('assigned_to', formData.assignedTo?.employee_id || '');
    formValues.append('reason_for_replacement', formData.reasonForReplacement || '');
    formValues.append('issued_by', formData.issuedBy?.employee_id || '');

    if (props.type === 'newItem') {
      props.handleNext(formValues);
    } else if (props.type === 'edit') {
      await dispatch(updateNewItemAction(formValues, props?.rowData?.id));
      props.handleCancel();
    } else {
      await dispatch(createNewItem(formValues));
      props.handleCancel();
    } }else {
        dispatch(
            OpenalertActions({
                msg: requiredFieldsAlertMessage,
                severity: 'warning',
            })
        )
    }
  };

  useEffect(() => {
    if (props.type === 'edit' && props?.rowData?.id) {
      dispatch(getNewItemByAssetAction(props.rowData.id));
    }
  }, [props.type, props?.rowData?.id, dispatch]);

  useEffect(() => {
    if (props.type !== 'edit') return;
    if (!newItemByAsset || newItemByAsset.length === 0) return;

    const record = newItemByAsset[0];
    if (!record) return;

    const assetObj = getAssetName?.find(
      (a) => a.asset_id === record.asset_id,
    );
    const assignedObj = get_empbasecompany?.find(
      (e) => e.employee_id === record.assigned_to,
    );
    const issuedByObj = createUser?.find(
      (u) => u.employee_id === record.issued_by,
    );

    setFormData((prev) => ({
      ...prev,
      id: record.id || prev.id,
      assetId: assetObj || prev.assetId,
      assetName: record.asset_name || assetObj?.Name || prev.assetName,
      title: record.title || '',
      warrantyPeriod: record.warranty_period || '',
      oldAssetName: record.old_asset_name || '',
      newAssetName: record.new_asset_name || '',
      issuedDate: normalizeOptionalDate(record.issued_date),
      assignedTo: assignedObj || prev.assignedTo,
      reasonForReplacement: record.description || '',
      issuedBy: record.full_name,
    }));

    setAttachments({
      renewalsFiles: [],
      renewalsFilePreviews: record.image?.map((img) => img.imageUrl) || [],
      existingImageKey: record.imageKey ? JSON.parse(record.imageKey) : [],
    });
  }, [
    props.type,
    props?.rowData?.id,
    newItemByAsset,
    getAssetName,
    get_empbasecompany,
    createUser,
  ]);

  const isLastVisibleTab =
    props?.tabItems?.findIndex((t) => t.id === props?.currentTabIndex) ===
    props?.tabItems?.length - 1;

  const employeeLabel = (option) => {
    if (!option) return '';
    if (typeof option === 'string') return option;
    if (option.full_name) return option.full_name;
    return option.last_name
      ? `${option.first_name || ''} ${option.last_name}`.trim()
      : option.first_name || '';
  };

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
        <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
          <Typography variant='h6' align='left' style={{ paddingBottom: '20px' }}>
            New Item / Replacement
          </Typography>
        </Grid>

        <Grid size={{ lg: 10, md: 10, sm: 10, xs: 10 }}>
          <Typography variant='h6'>Asset</Typography>
        </Grid>

        <Grid size={{ lg: 10, md: 10, sm: 10, xs: 10 }}>
          <Grid container spacing={3}>
            <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
              <Autocomplete
                options={getAssetName || []}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return typeof option === 'string'
                    ? option
                    : `${option.Code} - ${option.Name}`;
                }}
                renderOption={(rProps, option) => (
                  <li {...rProps}>
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
                    error={formErrors.assetId !== null}
                    helperText={formErrors.assetId === null ? '' : formErrors.assetId}
                  />
                )}
              />
            </Grid>

            {formData.assetId !== null && (
              <Grid size={{ lg: 6, md: 6, sm: 6, xs: 12 }}>
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
                      Location : {formData?.assetId?.Location || ''}
                    </Typography>
                    <Typography variant='h6'>
                      Assigned To : {formData?.assetId?.['Assigned To'] || ''}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid size={{ lg: 10, md: 10, sm: 10, xs: 10 }}>
          <Typography variant='h6'>Basics</Typography>
        </Grid>

        <Grid size={{ lg: 10, md: 10, sm: 10, xs: 10 }}>
          <Grid container spacing={3}>
            <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <TextField
                fullWidth
                required
                label='Title'
                variant='filled'
                value={formData.title || ''}
                onChange={(event) => handleChange('title', event.target.value)}
                error={formErrors.title !== null}
                helperText={formErrors.title === null ? '' : formErrors.title}
              />
            </Grid>

            <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <TextField
                fullWidth
                label='Warranty Period'
                variant='filled'
                value={formData.warrantyPeriod || ''}
                placeholder='E.g. 6m or 2y'
                onChange={(event) =>
                  handleChange('warrantyPeriod', event.target.value)
                }
                error={
                  formData.warrantyPeriod &&
                  !warrantyPeriodRegex.test(formData.warrantyPeriod)
                }
                helperText={
                  formData.warrantyPeriod &&
                  !warrantyPeriodRegex.test(formData.warrantyPeriod)
                    ? "Invalid format. Use e.g. '1y 6m', '2y', or '6m'"
                    : ''
                }
              />
            </Grid>

            <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <TextField
                fullWidth
                required
                label='Old Asset Name'
                variant='filled'
                value={formData.oldAssetName || ''}
                InputProps={{ readOnly: true }}
                onChange={(event) =>
                  handleChange('oldAssetName', event.target.value)
                }
                error={formErrors.oldAssetName !== null}
                helperText={
                  formErrors.oldAssetName === null ? '' : formErrors.oldAssetName
                }
              />
            </Grid>

            <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <TextField
                fullWidth
                required
                label='New Asset Name'
                variant='filled'
                value={formData.newAssetName || ''}
                onChange={(event) =>
                  handleChange('newAssetName', event.target.value)
                }
                error={formErrors.newAssetName !== null}
                helperText={
                  formErrors.newAssetName === null ? '' : formErrors.newAssetName
                }
              />
            </Grid>

            <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <LocalizationProvider dateAdapter={DateAdapter}>
                <DatePicker
                  label='Issued Date'
                  value={toMomentOrNull(formData.issuedDate)}
                  onChange={(date) => handleDateChange(date, 'issuedDate')}
                  views={['year', 'month', 'day']}
                  format='DD/MM/YYYY'
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: 'filled',
                      error: formErrors.issuedDate !== null,
                      helperText:
                        formErrors.issuedDate === null ? '' : formErrors.issuedDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <Autocomplete
                options={get_empbasecompany || []}
                getOptionLabel={employeeLabel}
                value={formData.assignedTo}
                onChange={(event, value) => handleChange('assignedTo', value)}
                isOptionEqualToValue={(option, value) =>
                  option?.employee_id === value?.employee_id
                }
                renderInput={(params) => (
                  <TextField {...params} label='Assigned To' variant='filled' />
                )}
              />
            </Grid> */}

            <Grid size={{ lg: 3, md: 4, sm: 4, xs: 12 }}>
              <Autocomplete
                options={createUser || []}
                getOptionLabel={employeeLabel}
                value={formData.issuedBy}
                onChange={(event, value) => handleChange('issuedBy', value)}
                isOptionEqualToValue={(option, value) =>
                  option?.employee_id === value?.employee_id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label='Issued By'
                    variant='filled'
                    error={formErrors.issuedBy !== null}
                    helperText={
                      formErrors.issuedBy === null ? '' : formErrors.issuedBy
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ lg: 8, md: 8, sm: 8, xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                label='Reason For Replacement'
                name='reasonForReplacement'
                variant='filled'
                rows={4}
                value={formData.reasonForReplacement || ''}
                error={Boolean(formErrors.reasonForReplacement)}
                helperText={
                      formErrors.reasonForReplacement === null ? '' : formErrors.reasonForReplacement
                    }
                onChange={(event) =>
                  handleChange('reasonForReplacement', event.target.value)
                }
              />
            </Grid>

            <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
              <AttachmentField
                asset='Renewals'
                inputId='file-newItem'
                previews={attachments.renewalsFilePreviews}
                setPreviews={setAttachments}
              />
              <Typography color='error'>
                {formErrors.files === null ? '' : formErrors.files}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {props.type === 'newItem' && (
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Grid container justifyContent='flex-end' spacing={2}>
              <Grid sx={{ display: 'flex', gap: 2 }}>
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

        {props.type !== 'newItem' && (
          <Grid size={{ lg: 12, md: 12, sm: 12, xs: 12 }}>
            <Grid container justifyContent='flex-end' spacing={2}>
              <Grid>
                <Button
                  variant='contained'
                  color='error'
                  onClick={() => props.handleCancel && props.handleCancel()}
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

NewItemForm.propTypes = {
  handleCancel: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleNext: PropTypes.func,
  handlePreviousOrCancel: PropTypes.func,
  assetNamePreview: PropTypes.object,
  editData: PropTypes.object,
  rowData: PropTypes.object,
  asset_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  page: PropTypes.string,
  type: PropTypes.string,
  form: PropTypes.string,
  tabItems: PropTypes.array,
  currentTabIndex: PropTypes.number,
};

export default NewItemForm;
