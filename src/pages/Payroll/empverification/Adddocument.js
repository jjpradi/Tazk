import React, { useEffect, useRef, useState } from 'react';
import { Grid, TextField, IconButton, Select, FormControl, InputLabel, MenuItem, Paper, List, ListItem, ListItemText, Box, Autocomplete, Button } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CSVReader from 'react-csv-reader';
import AddIcon from '@mui/icons-material/Add';
import AttachmentMenu from './Attachementtype';
import {useReducer} from 'react';
import AttchmentModel from './AttachmentModal';
import {useCustomFetch} from 'utils/useCustomFetch';
import Typography from '@mui/material/Typography';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import toMomentOrNull from 'utils/DateFixer';

function reducer(state, action) {
  const {type, payload} = action;
  if (type === 'PHOTO') {
    return {
      ...state,
      PHOTO: payload,
    };
  }
  if (type === 'DOCUMENT') {
    return {
      ...state,
      DOCUMENT: payload,
    };
  }
  if (type === 'CONTACT') {
    return {
      ...state,
      CONTACT: payload,
    };
  }
  if (type === 'LOCATION') {
    return {
      ...state,
      LOCATION: payload,
    };
  }
  if(type === 'RESET'){
    return {
      PHOTO: [],
      DOCUMENT: [],
      LOCATION: {
        lat: '',
        lng: '',
      },
      CONTACT: [],
    };
  }
  throw Error('Unknown action.');
}

const initialState = {
  PHOTO: [],
  DOCUMENT: [],
  // LOCATION: {
  //   lat: '',
  //   lng: '',
  // },
  // CONTACT: [],
};

const AddAccountComponent = ({ onAddAccount, onCancel, selectedLedgerName, ledgerData, onexistUpdate, existsdata, showGrid, index, showdialog, handlesubmit, sendFileMessageHelper, empVerificationDetail}) => {
  const [accountData, setAccountData] = useState({
    name: '',
    // debit: '',
    // credit: '',
    // accountGroup: '',
    // parentAccountId: null,
    expiry_date: null,
    dl_number : null,
    latitude :null,
    longitude : null,
    reason : null
   });

   const [formValue, setFormValue] = useState([
    {
    name : '', reason : ''
   },
  ])
  const textRef = useRef(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [ledgerNameExists, setLedgerNameExists] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const ledgerNameInputRef = useRef(null);
  const [file, setFile] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [uploadType, setUploadType] = React.useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [attachment, attachmentDispatch] = useReducer(reducer, initialState);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const customFetch = useCustomFetch();
  const [senduploadFile, setSenduploadFile] = useState();
  const [sendfileType, setSendfileType] = useState();

  console.log('uploadedFiles', uploadedFiles, attachment, senduploadFile, sendfileType);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  console.log('accountdata', accountData)
  useEffect(() => {
    if (empVerificationDetail.length > 0) {
      if(index !== 5 && index !== 10){
        console.log('evvvvvvvvvvvvvvvvvvvvv')
      setAccountData({...accountData, name : empVerificationDetail[0]?.name, 
      reason : empVerificationDetail[0].reason, latitude : empVerificationDetail[0].latitude, 
      dl_number : empVerificationDetail[0].dl_number, longitude : empVerificationDetail[0].longitude,
      expiry_date : empVerificationDetail[0].expiry_date, id :empVerificationDetail[0]?.id })
      }else{
        console.log('eventtttttttt', empVerificationDetail)
        setFormValue([...empVerificationDetail])
      }
    }
    else{
      setAccountData({...accountData, name : '',  reason : '', latitude : '', 
      dl_number : '', longitude : '',
      expiry_date : ''})
    }
   
  }, [empVerificationDetail]);

  const handleChange = (field, value) => {
    let existsInPendingChanges = false;

    if (field === 'name') {
      existsInPendingChanges = pendingChanges.some((change) => change.name === value);
    }

    const existsInLedgerData = ledgerData.some((ledger) => ledger.accountName === value);

    const ledgerNameExists = existsInPendingChanges || existsInLedgerData;
    setLedgerNameExists(ledgerNameExists);

    setAccountData((prevData) => ({
      ...prevData,
      [field]: value,
      [field === 'debit' ? 'credit' : 'debit']: '',
    }));
  };

  const handlegroupChange = (field, value) => {
    // const selectedAccountGroup = selectedLedgerName.find(s => s.accountledger_id === value);

    setAccountData(prevData => ({
      ...prevData,
      [field]: value,
      // parentAccountId: selectedAccountGroup?.accountgroupId,
    }));
  };

  const handleEventChange = (index, field, value) => {
    const updatedEvents = [...formValue];
    updatedEvents[index][field] = value;
    setFormValue(updatedEvents);

        // Validate the Event Name and Event Date fields
        // if (!value) {
        //   setFormErrors({
        //     ...formErrors,
        //     [index]: 'This field is required',
        //   });
        // } else {
        //   const updatedFormErrors = { ...formErrors };
        //   delete updatedFormErrors[index];
        //   setFormErrors(updatedFormErrors);
        // }
  };

console.log('indexxxxxxxxxxx', index)

const   onDelete = (index) => {
  console.log('ondeleteeeeee', index)
  const obj = formValue.filter(d => d !== formValue[index]);
  setFormValue(obj)
}
  const handleAddAccount = (formindex) => {
   
    console.log('ssssssssssssssss', accountData.name,accountData.expiry_date,accountData.dl_number )
    console.log('acccccc', senduploadFile, index, sendfileType, empVerificationDetail)
    if (!empVerificationDetail.length) {
      if ((index === 0) || (index === 1) || (index === 2) || (index === 3)) {
        console.log('indexunder')

        if ((accountData.name === '') || (senduploadFile === undefined)) {
          console.log('gggggg')
          return;
        }
      }
      if (index === 4) {
        if ((accountData.name === '') || (accountData.dl_number === '') || (accountData.expiry_date === '')|| (senduploadFile === undefined)) {
          return;
        }
      }
      if ((index === 6) || (index === 7) || (index === 8) || (index === 9)) {
        if (accountData.name === '') {
          return
        }
      }
      if ((index === 5) || (index === 10)) {
        if (formValue[0].name === '') {
          return
        }
      }
    }
   
   

    // let data = {
    //   name : accountData.name,
    //   file : file,
    //   index_value : index,
    // }
    //handlesubmit(data)
    console.log('sendfileType', sendfileType, senduploadFile, accountData, index)
    if(index !== 5 && index !== 10){
     if (senduploadFile === 'PHOTO') {
      sendFileMessageHelper(sendfileType, senduploadFile, accountData, index);
    } else {
      // IF multiple document selected. Send each doc as individual message
      if(sendfileType !== undefined){
        console.log('undefineddd')
       for (const single_file of sendfileType) {
        sendFileMessageHelper([single_file], senduploadFile, accountData, index);
      }
      }else{
        console.log('jjjjjjjjjj')
        sendFileMessageHelper(sendfileType, senduploadFile, accountData, index);
      }
    }
  }else{
    console.log('indexxxxx', index, formValue)
    sendFileMessageHelper(undefined, undefined, formValue, index, formindex)
    // if (senduploadFile === 'PHOTO') {
    //   sendFileMessageHelper(sendfileType, senduploadFile, formValue, index);
    // } else {
    //   // IF multiple document selected. Send each doc as individual message
    //   for (const single_file of sendfileType) {
    //     sendFileMessageHelper([single_file], senduploadFile, formValue, index);
    //   }
    // }
  }
 
  };
  console.log('filetypeeeee', sendfileType, senduploadFile, sendfileType !== undefined && sendfileType[0].path)

  const handlePendingChange = (index, field, value) => {
    const updatedPendingChanges = [...pendingChanges];
    const change = updatedPendingChanges[index];

    if (field === 'debit') {
      change.credit = '';
    } else if (field === 'credit') {
      change.debit = '';
    }

    change[field] = value;
    setPendingChanges(updatedPendingChanges);
    onAddAccount(updatedPendingChanges);
  };



  const handleSave = (index) => {
    const updatedPendingChanges = [...pendingChanges];

    updatedPendingChanges[index].editMode = false;

    setPendingChanges(updatedPendingChanges);
    onAddAccount(updatedPendingChanges);
  };

  const handleEdit = (index) => {
    const updatedPendingChanges = [...pendingChanges];
    updatedPendingChanges[index].editMode = true;
    setPendingChanges(updatedPendingChanges);
  };


  const handleDelete = (indexToDelete) => {
    const updatedPendingChanges = [...pendingChanges];
    updatedPendingChanges.splice(indexToDelete, 1);
    setPendingChanges(updatedPendingChanges);
    onAddAccount(updatedPendingChanges);
  };

  const handleFile = (event) => {
    console.log('NewFileee', event.target.files[0])
    setFile(event.target.files[0])
  }
 
  const sendFileMessage = async (fileMessage, uploadType) => {
    console.log('uploadddd',fileMessage, uploadType )
    setSendfileType(fileMessage);
    setSenduploadFile(uploadType)
    // if (uploadType === 'PHOTO') {
    //   sendFileMessageHelper(fileMessage, uploadType, accountData.name, index);
    // } else {
    //   // IF multiple document selected. Send each doc as individual message
    //   for (const single_file of fileMessage) {
    //     sendFileMessageHelper([single_file], uploadType,accountData.name, index);
    //   }
    // }
  };
  const addEvent = () => {
    setFormValue([...formValue, { name: '', reason: '' }]);
  };

console.log('fileeee', formValue)
  return (
    <>
      {
       ( index === 5 || index === 10)  && 
        <Button style={{ margin: '1rem' }} onClick={addEvent}>
        + Add
       </Button>
      }
      { (index !== 5 && index !== 10) ?
      <Grid container spacing={2} alignItems="flex" textAlign={"center"} marginTop='10px' >

  <Grid
    margin={2}
    size={{
      lg: 2.5,
      md: 2.5,
      xs: 3
    }}>
          <FormControl
            fullWidth
            required={true}
          >
            <InputLabel>Name</InputLabel>
            <Select
              style={{ textAlign: 'left'}}
              name='name'
              label='name'
              onChange={(e) => handlegroupChange('name', e.target.value)}
              value={
                accountData.name
              }
            >
              {selectedLedgerName.map((s) => (
                <MenuItem value={s.name} key={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>{
        ((index !== 5) && index !== 6)&&
        <Grid
          size={{
            lg: 2,
            md: 2,
            xs: 3
          }}>
          
                  <Box
            sx={{
              mr: 2,
            }}
          >
            <IconButton
              // {...getRootProps({
              //   className: clsx('dropzone'),
              // })}
              style={{height: 40, width: 40}}
              size='large'
              onClick={(e) => {
                accountData.name === '' ? alert('Please Select  Name'):
                handleClick(e);
              }}
            >
              {/* <input {...getInputProps()} /> */}
              <AddIcon
                style={{
                  color: '#0A8FDC',
                  transform: anchorEl ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'all 0.2s linear',
                }}
              />  </IconButton> {sendfileType === undefined ?
              ( empVerificationDetail.length > 0 && <Typography variant="subtitle2" gutterBottom>
             {empVerificationDetail[0]?.file_path?.slice(0, 10)}</Typography> ) : <Typography variant="subtitle2" gutterBottom>{`${sendfileType[0]?.path?.slice(0,10)}`}</Typography>}
            
          </Box>             
        </Grid>}
        {index === 9 && <>
          <Grid
            margin={2}
            size={{
              lg: 2.5,
              md: 2.5,
              xs: 3
            }}>
          <TextField
            inputRef={textRef}
            fullWidth={true}
       
            name='latitude'
            label='Latitude'
            placeholder='Latitude'
            type='text'
            value={
              accountData.latitude === null ? '' : accountData.latitude
            }
            // variant='filled'
            // required={formValues.role_name !== 'Salesman' ? false : true}
            onChange={(e) => handlegroupChange('latitude', e.target.value)}
            // onBlur={handleChange}
            // error={formErrors.Lat === null ? false : true}
            // helperText={
            //   formErrors.Lat === null ? '' : formErrors.Lat
            // }
          />
        </Grid>
        <Grid
          margin={2}
          size={{
            lg: 2.5,
            md: 2.5,
            xs: 3
          }}>
          <TextField
            inputRef={textRef}
            fullWidth={true}  
            name='longitude'
            label='Logitude'
            placeholder='Longitude'
            type='text'
            value={
              accountData.longitude === null ? '' : accountData.longitude
            }
            // variant='filled'
            // required={formValues.role_name !== 'Salesman' ? false : true}
            onChange={(e) => handlegroupChange('longitude', e.target.value)}
            // onBlur={handleChange}
            // error={formErrors.long === null ? false : true}
            // helperText={
            //   formErrors.long === null ? '' : formErrors.long
            // }
          />
        </Grid>
        </>}
        {index === 4 ? <>
          <Grid
            margin={2}
            size={{
              lg: 2.5,
              md: 2.5,
              xs: 3
            }}>
          <TextField
            inputRef={textRef}
            fullWidth={true}
       
            name='dl_number'
            label='Driving License Number'
            placeholder='DLNumber'
            type='text'
            value={
              accountData.dl_number === null ? '' : accountData.dl_number
            }
            // variant='filled'
            // required={formValues.role_name !== 'Salesman' ? false : true}
            onChange={(e) => handlegroupChange('dl_number', e.target.value)}
            // onBlur={handleChange}
            // error={formErrors.dl_number === null ? false : true}
            // helperText={
            //   formErrors.dl_number === null ? '' : formErrors.dl_number
            // }
          />
        </Grid>
        <Grid
          margin={2}
          size={{
            lg: 2.5,
            md: 2.5,
            xs: 3
          }}>
        <LocalizationProvider dateAdapter={DateAdapter}>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
                value={toMomentOrNull(accountData.expiry_date)}
                format='DD/MM/YYYY'
                //onChange={handleChange}
                onChange={(e) => handlegroupChange('expiry_date', moment(e._d).format('YYYY-MM-DD'))} //setFormValues({...formValues,sale_time:e.target.value});
                label='Expiry Date'
               
              />
            </LocalizationProvider>
        </Grid>
        </>
        :
         <Grid
           margin={2}
           size={{
             lg: 2.5,
             md: 2.5,
             xs: 3
           }}>
          <TextField
            inputRef={textRef}
            fullWidth={true}
       
            name='reason'
            label='Reason if any'
            placeholder='Reason if any'
            type='text'
            value={
              accountData.reason === null ? '' : accountData.reason
            }
            // variant='filled'
            // required={formValues.role_name !== 'Salesman' ? false : true}
            onChange={(e) => handlegroupChange('reason', e.target.value)}
            // onBlur={handleChange}
            // error={formErrors.dl_number === null ? false : true}
            // helperText={
            //   formErrors.dl_number === null ? '' : formErrors.dl_number
            // }
          />
        </Grid>}  
        <Grid
          sx={{ textAlign: 'center' }}
          size={{
            lg: 2,
            md: 2,
            xs: 3
          }}>
          <IconButton onClick={onCancel} disabled={true}>
            <CancelIcon sx={{ color: 'red' }} />
          </IconButton>
          <IconButton onClick={handleAddAccount} >
            <CheckCircleIcon sx={{ color: 'green' }} />
          </IconButton>
        </Grid>
        
      </Grid> 

          : 
          formValue?.map((d, index) => (

            <Grid container spacing={3} alignItems="flex" textAlign={"center"}  marginTop='10px'>

  <Grid
    margin={2}
    size={{
      lg: 2.5,
      md: 2.5,
      xs: 3
    }}>
                <FormControl
                  fullWidth
                  required={true}
                >
                  <InputLabel>Name</InputLabel>
                  <Select
                    style={{textAlign:'left'}}
                    name='name'
                    label='name'
                    onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                    value={
                     d.name
                    }
                  >
                    {selectedLedgerName.map((s) => (
                      <MenuItem value={s.name} key={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
             
              <Grid
                margin={2}
                size={{
                  lg: 2.5,
                  md: 2.5,
                  xs: 3
                }}>
                <TextField
                  inputRef={textRef}
                  fullWidth={true}

                  name='reason'
                  label='Reason if any'
                  placeholder='Reason if any'
                  type='text'
                  value={
                    d.reason === null ? '' : d.reason
                  }
                  // variant='filled'
                  // required={formValues.role_name !== 'Salesman' ? false : true}
                  onChange={(e) => handleEventChange(index, 'reason', e.target.value)}
                // onBlur={handleChange}
                // error={formErrors.dl_number === null ? false : true}
                // helperText={
                //   formErrors.dl_number === null ? '' : formErrors.dl_number
                // }
                />
              </Grid>
              <Grid
                sx={{ textAlign: 'center' }}
                size={{
                  lg: 2,
                  md: 2,
                  xs: 3
                }}>
                <IconButton onClick={() =>{onDelete(index)}} >
                  <CancelIcon sx={{ color: 'red' }} />
                </IconButton>
                <IconButton onClick={()=> {handleAddAccount(index)}}  >
                  <CheckCircleIcon sx={{ color: 'green' }} />
                </IconButton>
              </Grid>

            </Grid>
          ))
       }
      <AttachmentMenu
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          uploadType={uploadType}
          setUploadType={setUploadType}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
        />
      <AttchmentModel
        anchorEl={anchorEl}
        attachment={attachment}
        attachmentDispatch={attachmentDispatch}
        setAnchorEl={setAnchorEl}
        uploadType={uploadType}
        setUploadType={setUploadType}
        setUploadedFiles={setUploadedFiles}
        uploadedFiles={uploadedFiles}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        attachmentFunctions={{
          PHOTO: sendFileMessage,
          DOCUMENT: sendFileMessage,
          // LOCATION: sendLocationMessage,
          // CONTACT: sendContactsMessage,
        }}
      />
    </>
  );
};

export default AddAccountComponent;


