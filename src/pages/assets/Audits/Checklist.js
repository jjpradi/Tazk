import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Icon,
  IconButton,
  Radio,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {DataGrid} from '@mui/x-data-grid';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAssetGroupIdAction,
  getAssetTypeIdAction,
} from 'redux/actions/asset_actions';

import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import { createChecklistAction, updateChecklistAction } from 'redux/actions/audit_actions';
import { capitalize } from 'lodash';

const Checklist = (props) => {
  const { type, rowData } = props;
  const isEdit = type === 'edit';

  const {
    AssetReducers: {getAssetGroup, getAssetType},
  } = useSelector((state) => state);

  
      const [renewalsFiles, setRenewalsFiles] = useState({
          renewalsFiles : [],
          renewalsFilePreviews : []
      })

  const dispatch = useDispatch();


  useEffect(() => {
    const count = renewalsFiles?.renewalsFilePreviews?.length || 0
    setFormErrors((prev) => ({
      ...prev,
      files: count > 1 ? 'Only 1 file is allowed!' : null,
    }));
  }, [renewalsFiles.renewalsFilePreviews]);

  const [formData, setFormData] = useState({
    assetGroup: null,
    assetType: null,
    remarks : null,
    declaration : null,
    name : null,
    imageCount : null,
    required : false
  });

  const [formErrors, setFormErrors] = useState({
    assetGroup: null,
    assetType: null,
    message: null,
    name: null,
  });

    const requiredFields = [
        'assetGroup',
        'assetType',
        'message',
        'imageCount',
        'name',
  ];
  

  const [messages, setMessages] = useState([]);

  const [messageForm, setMessageForm] = useState({
    message: '',
    answer: 'yes',
  });

  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (name, value) => {
    const updatedValues = {
      ...formData,
      [name]: value,
    };

    if (name === "assetGroup") {
      updatedValues.assetType = null;
    }

    if (name === "imageCount" && (!value || value?.count === 0)) {
      updatedValues.required = false;
    }

    setFormData(updatedValues);

    if (requiredFields.includes(name) && (value === null || value === '')) {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: capitalize(name.replace(/_/g, ' ')) + ' is required',
          }));
        } else {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: null,
          }));
        }
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  let isValid = true;
  let formErrorsObj = { ...formErrors };

  requiredFields.forEach((key) => {
    if (key === 'message') {
      if (messages.length === 0) {
        isValid = false;
        formErrorsObj.message = 'At least one audit message is required';
      } else {
        formErrorsObj.message = null;
      }
      return;
    }
    const val = formData[key];
    if (val === null || val === undefined || val === 'null' || val === '') {
      isValid = false;
      formErrorsObj[key] = capitalize(key.replace(/_/g, ' ')) + ' is required';
    } else {
      formErrorsObj[key] = null;
    }
  });

  setFormErrors(formErrorsObj);

  if (isValid) {
    const payload = {
      asset_group_id: formData.assetGroup?.asset_group_id ?? null,
      asset_type_id: formData.assetType?.asset_type_id ?? null,
      self_audit_questions: messages,
      name: formData.name,
      required: formData.required ? 1 : 0,
      imageCount: formData.imageCount?.count ?? 0
    };

    const onSuccess = (response) => {
      if (response?.status === 200) {
        setFormData({
          assetGroup: null,
          assetType: null,
          remarks: '',
          declaration: null,
          name: '',
          imageCount: null,
          required: false,
        });
        setMessages([]);
        props.handleClose();
      }
    };

    if (isEdit && rowData?.id) {
      dispatch(updateChecklistAction(payload, rowData.id, onSuccess));
    } else {
      dispatch(createChecklistAction(payload, onSuccess));
    }
  }
};

  useEffect(() => {
    dispatch(getAssetGroupIdAction());
}, []);

useEffect(()=>{
    const data = {
    groupId : formData.assetGroup?.asset_group_id
  }
    dispatch(getAssetTypeIdAction(data));
},[formData.assetGroup])

// Edit mode: prefill asset group once group list is loaded
useEffect(() => {
  if (!isEdit || !rowData) return;
  const groups = getAssetGroup?.data || [];
  if (!groups.length) return;
  const matchedGroup = groups.find(
    (g) => Number(g.asset_group_id) === Number(rowData.asset_group_id)
  ) || null;
  setFormData((prev) => ({
    ...prev,
    name: rowData.checklist_name ?? '',
    imageCount: { key: Number(rowData.imageCount) || 0, count: Number(rowData.imageCount) || 0 },
    required: Number(rowData.required) === 1,
    assetGroup: matchedGroup
  }));
  try {
    const questions = typeof rowData.self_audit_questions === 'string'
      ? JSON.parse(rowData.self_audit_questions || '[]')
      : (Array.isArray(rowData.self_audit_questions) ? rowData.self_audit_questions : []);
    setMessages(questions);
  } catch (err) {
    setMessages([]);
  }
}, [isEdit, rowData, getAssetGroup?.data]);

// Edit mode: prefill asset type once type list is loaded for the selected group
useEffect(() => {
  if (!isEdit || !rowData) return;
  const types = getAssetType?.data || [];
  if (!types.length) return;
  const matchedType = types.find(
    (t) => Number(t.asset_type_id) === Number(rowData.asset_type_id)
  ) || null;
  setFormData((prev) => ({ ...prev, assetType: matchedType }));
}, [isEdit, rowData, getAssetType?.data]);


const handleMessage = (e) => {
  const value = e.target.value;

  setMessageForm(prev => ({ ...prev, message: value }));

  if (value.trim() !== '') {
    setFormErrors(prev => ({ ...prev, message: null }));
  }
};

const attachmentsAllowed = [
  {key : 0,count : 0},
  {key : 1,count : 1},
  {key : 2,count : 2},
  {key : 3,count : 3},
  {key : 4,count : 4},
  {key : 5,count : 5},
]


  return (
    <div style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', overflowX: 'hidden' }}>
      <Grid p={5}>
        <Grid >
          <Typography style={{marginBottom:'10px'}}>Check List</Typography>

          <Grid pb={3}  container gap={3}>
            
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 4,
                xs: 4
              }}>
                  <TextField
                    fullWidth
                    variant="filled"
                    label="Checklist Name"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    error={Boolean(formErrors.name)}
                    helperText={formErrors.name || ''}
                  />
                </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 4,
                xs: 4
              }}>
              <Autocomplete
                options={getAssetGroup.data || []}
                fullWidth
                getOptionLabel={(option) => option?.asset_group || ''}
                value={formData.assetGroup}
                onChange={(event, value) => handleChange('assetGroup', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label='Asset Group'
                    variant='filled'
                    error={Boolean(formErrors.assetGroup)}
                    helperText={formErrors.assetGroup || ''}
                  />
                )}
              />
            </Grid>
            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 4,
                xs: 4
              }}>
              <Autocomplete
                options={getAssetType.data || []}
                fullWidth
                getOptionLabel={(option) => option?.asset_type || ''}
                value={formData.assetType}
                onChange={(event, value) => handleChange('assetType', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label='Asset Type'
                    variant='filled'
                    required
                    error={Boolean(formErrors.assetType)}
                    helperText={formErrors.assetType || ''}
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 8,
                md: 8,
                sm: 8,
                xs: 12
              }}>
              <AttachmentField
                asset='Renewals'
                previews={renewalsFiles.renewalsFilePreviews}
                setPreviews={setRenewalsFiles}
                status  = {6}
              />
              {/* <Typography>
                {'(Max 5 files allowed)'}
              </Typography> */}
            </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 4,
                xs: 4
              }}></Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 4,
                xs: 4
              }}>

              <Autocomplete
                options={attachmentsAllowed}
                fullWidth
                getOptionLabel={(option) => option.count.toString()}
                isOptionEqualToValue={(option, value) =>
                  option.key === value.key
                }
                value={formData.imageCount || null}
                onChange={(event, value) => handleChange('imageCount', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="No of Attachments Allowed"
                    variant="filled"
                    required
                    error={Boolean(formErrors.imageCount)}
                    helperText={
                      formErrors.imageCount ? 'Attachment Count is required' : ''
                    }
                  />
                )}
              />


              </Grid>

              <Grid
                size={{
                  lg: 3,
                  md: 3,
                  sm: 4,
                  xs: 4
                }}>
                    <FormControlLabel
                        control={<Checkbox
                                disabled={!formData.imageCount || formData.imageCount?.count === 0}
                                checked={Boolean(formData.required)}
                                onChange={(_e, checked) => handleChange('required', checked)}
                                />}
                        label='image attachment is required'
                    />
                    

                </Grid>



            <Grid
              mt={3}
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography mb={1}>Self Audit Questions</Typography>

              {/* Full Width Message Field */}
              <Grid container alignItems={'center'}>
                <Grid
                  size={{
                    lg: 8,
                    md: 8,
                    xs: 4,
                    sm: 8
                  }}>
                  <TextField
                    fullWidth
                    variant='filled'
                    label='Enter audit message'
                    required
                    value={messageForm.message}
                    onChange={(e) => handleMessage(e)}
                    error={Boolean(formErrors.message)}
                    helperText={formErrors.message || ''}
                  />
                </Grid>

                {/* Yes / No Radio Buttons */}
                <Grid>
                  <Grid container>
                    <Grid>
                      <label>
                        <Radio
                          type='radio'
                          value='yes'
                          disabled
                          checked={false}
                          onChange={(e) =>{}}
                           
                        />{' '}
                        Yes
                      </label>
                    </Grid>
                    <Grid>
                      <label>
                        <Radio
                          type='radio'
                          value='no'
                          disabled
                          checked={false}
                          onChange={(e) =>{}}
                        />{' '}
                        No
                      </label>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Add / Update Button */}
                <Grid ml={'20px'}>
                  <Tooltip
                    title={editIndex !== null ? 'Update' : 'Add'}
                    placement='top'
                  >
                    <IconButton
                      // variant='contained'

                      onClick={() => {
                        if (!messageForm.message.trim()) return;

                        if (editIndex !== null) {
                          // Editing existing row
                          const updated = [...messages];
                          updated[editIndex] = messageForm;
                          setMessages(updated);
                          setEditIndex(null);
                        } else {
                          // Add new
                          setMessages([...messages, messageForm]);
                        }

                        // Reset form
                        setMessageForm({message: '', answer: 'yes'});
                      }}
                    >
                      {editIndex !== null ? <DoneIcon /> : <AddIcon />}
                    </IconButton>
                  </Tooltip>
                </Grid>

                {/* List of Messages */}


              </Grid>
            </Grid>

                <Grid width={'100%'} mt={3}>
                  {messages.map((item, index) => (
                    <Grid
                      key={index}
                      container
                      justifyContent='space-between'
                      alignItems='center'
                      style={{
                        border: '1px solid #ddd',
                        padding: 10,
                        borderRadius: 6,
                        marginBottom: 10,
                      }}
                      // lg={12} md={8} xs={4} sm={8}
                    >
                      <Grid
                        size={{
                          lg: 4,
                          md: 4,
                          xs: 4,
                          sm: 8
                        }}>
                        <Typography>{item.message}</Typography>
                      </Grid>
                      {/* <Grid>
                        <Typography color='primary'>
                          Answer: {item.answer.toUpperCase()}
                        </Typography>
                      </Grid> */}

                      <Grid>
                  <Grid container>
                    <Grid>
                      <label>
                        <Radio
                          type='radio'
                          value='yes'
                          checked={false}
                           onChange={() => {}}
                        />{' '}
                        Yes
                      </label>
                    </Grid>
                    <Grid>
                      <label>
                        <Radio
                          type='radio'
                          value='no'
                          checked={false}
                           onChange={() => {}}
                        />{' '}
                        No
                      </label>
                    </Grid>
                  </Grid>
                </Grid>

                      <Grid pl={5} textAlign='right' size={4}>
                        <Grid display={'flex'} justifyContent='flex-start'>
                          <Tooltip title='Edit' placement='top'>
                            <IconButton
                              onClick={() => {
                                setEditIndex(index);
                                setMessageForm(messages[index]);
                              }}
                              style={{marginRight: 10}}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Delete' placement='top'>
                            <IconButton
                              style={{paddingLeft: '20px'}}
                              onClick={() => {
                                const updated = messages.filter(
                                  (_, i) => i !== index,
                                );
                                setMessages(updated);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>

                <Grid
                  size={{
                    lg: 4,
                    md: 4,
                    sm: 6,
                    xs: 6
                  }}>
                    <TextField
                    fullWidth
                    variant='filled'
                    rows={4}
                    label="Remarks"
                    disabled
                    value={formData.remarks || ''}
                    onChange={(event, value)=> handleChange('remarks',value)}
                    multiline
                    >

                    </TextField>
                </Grid>

                <Grid
                  size={{
                    lg: 12,
                    md: 12,
                    sm: 12,
                    xs: 12
                  }}>
                    <FormControlLabel
                        control={<Checkbox 
                                checked={false}          
                                onChange={() => {}} 
                                />}
                        label='I hereby declare that I have audited the specified asset as assigned. I confirm that the audit was conducted in accordance with the relevant standards and regulations.'
                    />
                    

                </Grid>
                  <Grid container gap={2} justifyContent={'center'}>
                <Grid>
                    <Button 
                    variant='contained'
                    onClick={props.handleClose}
                    color='error'
                    
                    >
                        Cancel
                    </Button>
                </Grid>
                <Grid>
                    <Button
                    variant='contained'
                    onClick={handleSubmit}

                    >
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </Grid>
                </Grid>

          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Checklist;
