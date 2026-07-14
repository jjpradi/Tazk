import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable';
import { Autocomplete, Button, Card, Dialog, Grid, IconButton, TablePagination, TextField, Tooltip, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import CommonSearch from 'utils/commonSearch';
import AddIcon from '@mui/icons-material/Add';
import { maxBodyHeight, headerStyle, cellStyle } from 'utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import _, { capitalize } from 'lodash';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { BiometricAction, biometricRegistrationAction, getBioMetricAction, setBioMetricAction } from 'redux/actions/face_registration_action';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import DeviceLandingPage from '../configuration/DeviceLandingPage'
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';

const BiometricAttendance = () => {

    const { stockLocationReducer: { stocklocation },FaceRegistrationConfig : {getBiometricDetails}} = useSelector((state) => state)
       const { setModalTypeHandler, setLoaderStatusHandler, commoncookie, headerLocationId } = useContext(
            CreateNewButtonContext,
        );

    const dispatch = useDispatch()

    const [id,setId] = useState(null)
    const [data,setData] = useState()
    const [view,setView] = useState()
    const [formData,setFormData] = useState({
        serial :  null,
        location :null,
        device_name : null,
        is_same_device: null
    })


    const [formErrors,setFormErrors] = useState({
        serial :'',
        location : '',
        device_name : '',
        is_same_device: ''
    })

    const requiredFields = [
        'serial',
        'location',
        'device_name',
        'is_same_device'
    ]

    const [paginateData,setPaginateData] = useState({
        searchString : '',
        pageSize : 20,
        pageCount : 0
    })
    const [open,setOpen] = useState(false)

  const machine = [
    { id: 0, machineType: 'In/Out Different Machine' },
    { id: 1, machineType: 'In/Out Same Machine' }
  ]

    const handleEdit = (rowData) => {
      console.log('Editing Row:', rowData);
      const selectedDeviceCount = machine.find(
        option => option.id === rowData.is_same_device
      ) || null;
      console.log(selectedDeviceCount,"selectedDeviceCount")
      setFormData({
        serial: rowData.serial_number || null, 
        location: {location_name : rowData.location_name,location_id : rowData.location_id} || null,
        device_name: rowData.device_name || null,
        is_same_device: selectedDeviceCount
      });
      setOpen(true); 
      setId(rowData.id)
    };

    const handleView = (rowData) =>{
      setData(rowData)
      setView(true)
    }



    const handlePageChange =(page)=>{
        setPaginateData({...paginateData,pageCount : page})
    }

    const handleSizeChange =(size)=>{
        setPaginateData({...paginateData,pageSize:size})
    }

    const columns = [
     
        {
          field: 'serial_number',
          title: 'Serial Number'
        },
        {
          field: 'location_name',
          title: 'Device Location'
        },
        {
          field: 'port',
          title: 'Port'
        },
        {
          field: 'device_name',
          title: 'Device Name',
          render:(rowData)=>{
            return rowData.device_name ? rowData.device_name : '-'
          }
        },
        {
          field: 'is_same_device',
          title: 'Device',
          render: (rowData) => {
            const match = machine.find(m => m.id === rowData.is_same_device);
            return match ? match.machineType : '-';
          }
        },
        {
            field: 'action',
            title: 'Action',
            render: (rowData) => (
                <Tooltip title='Edit'>
                    <IconButton onClick={() => handleEdit(rowData)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )
        },
        {
            field: 'action',
            title: 'Detail',
            render: (rowData) => (
                <Tooltip title='Detail'>
                    <IconButton onClick={() => handleView(rowData)}>
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            )
        }
        
      ];

      const cancelSearch = () => {
        setPaginateData({...paginateData, searchString: ''});

        dispatch(
            getBioMetricAction({
                        data : [],
                        numRows: 0,
                    })
                )
                const payload ={
                    searchString : '',
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
                }
            dispatch(BiometricAction(payload))

      }

      const requestSearch = async(e) => {
        const val = e.target.value
        setPaginateData({...paginateData, searchString: val});

        console.log(val,'asdasdaA')

        dispatch(
            getBioMetricAction({
                        data : []
                    })
                )

        const payload ={
                    searchString : paginateData.searchString,
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
         }

        await  dispatch(setBioMetricAction(
                            payload,
                            setModalTypeHandler,
                            setLoaderStatusHandler
                        ))
      }

      const setStateHandler = (name, value) => {
        const updatedFormData = { ...formData };
        updatedFormData[name] = value || null; 
        setFormData(updatedFormData);
        validateForm(name, value);
      };
      
      const validateForm = (name, value) => {
        let errorMessage = null;
      
        // Check for required fields
        if (requiredFields.includes(name) && (!value || value === '')) {
          errorMessage = `${capitalize(name.replace(/_/g, ' '))} is required`;
        }
      
        // Additional validations for specific fields
        if (name === 'serial') {
          const serialExists = getBiometricDetails.data.some(
            (item) => item.serial_number === value && item.id !== id
          );
      
          if (serialExists) {
            errorMessage = 'Serial Number Already Exists';
          }
        }
      
        // if (name === 'location') {
        //   if (!value || !value.location_id) {
        //     errorMessage = 'Location is required';
        //   }
        // }
      
        // if (name === 'device_name') {
        //   if (!value || !value.device_name) {
        //     errorMessage = 'Device Name is required';
        //   }
        // }
      
        // Update form errors state
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          [name]: errorMessage,
        }));
      };
      
      
      

      useEffect(()=>{
        dispatch(listStockLocationAction(commoncookie, headerLocationId));
         const payload ={
                    searchString : paginateData.searchString,
                    numPerPage : paginateData.pageSize,
                    pageCount : paginateData.pageCount
         }
        dispatch(BiometricAction(payload))
        
      },[dispatch,paginateData.pageSize,paginateData.pageCount])

      const handleSubmit = async () => {
        let isValid = true;
        let formErrorObj = {};
      
        // Validate all required fields
        requiredFields.forEach((field) => {
          const value = formData[field];
          if (!value || (field === 'location' && !value.location_id)) {
            formErrorObj[field] = `${capitalize(field.replace(/_/g, ' '))} is required`;
            isValid = false;
          }
        });
      
        // Check for serial number errors explicitly
        if (formErrors.serial) {
          isValid = false;
          formErrorObj.serial = formErrors.serial;
        }
      
        // Update errors in the state
        setFormErrors(formErrorObj);
      
        if (isValid) {
          const payload = {
            serial_number: formData.serial,
            location_id: formData.location.location_id,
            device_name : formData.device_name,
            id: id || undefined, // Include ID only if editing
            is_same_device : formData.is_same_device.id
          };
      
          await dispatch(biometricRegistrationAction(payload));
          const fetchPayload = {
            searchString: paginateData.searchString,
            numPerPage: paginateData.pageSize,
            pageCount: paginateData.pageCount,
          };
          await dispatch(BiometricAction(fetchPayload));

          setFormData({...formData, serial:null, location:null, device_name:null})
          setFormErrors({...formErrors, serial:null, location:null, device_name:null})
          setId(null)

          setOpen(false); // Close the dialog after successful submission

        }
        else{
          dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
      };

      const handleCancel = ()=>{
        setFormData({...formData,serial:null, location:null, device_name: null})
        setFormErrors({...formErrors, serial:null, location:null, device_name: null})
        setId(null)
        setOpen(false)
      }
      

      console.log(stocklocation,'stocklocation',getBiometricDetails)

      console.log(id,'formerrrr')


  return (
    <div style={{
      padding: '0 10px',
      height: '95vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
      <Grid >
     { !view && <Card
sx={{
  boxShadow: 'none',
  border: 'none',
  // '& .MuiTablePagination-root': {
  //   borderTop: 'none',
  // },
}}
>
<MaterialTable
  columns={columns}
  style={{ height: 'calc(100vh - 80px)' }}
  data={Array.isArray(getBiometricDetails?.data) ? getBiometricDetails.data : []}
  title={'Device Configuration'}
  totalCount={getBiometricDetails.numRows}
  options={getStickyTableOptions({
    headerStyle,
    bodyOffset: 200,
    cellStyle,
    options:{
    actionsColumnIndex: -1,
    filtering: false,
    search: false,
    tableLayout: "auto",
    toolbar: true,
    paging: true,
    pageSize: paginateData.pageSize,
    pageSizeOptions: [20, 30, 50],
    maxBodyHeight: 'calc(100vh - 190px)',
    minBodyHeight: 'calc(100vh - 190px)',
    },
  })}
  // style={{
  //   boxShadow: 'none',
  //   border: 'none',
  // }}
  page={paginateData.pageCount || 0}
  onPageChange={(page) => {
    handlePageChange(page);
  }}
  onRowsPerPageChange={(size) => {
    handleSizeChange(size);
  }}
  components={{
    ...stickyTableComponents,
     Pagination: (props) => (
     <div
     style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "8px 16px",
      }}>
        <TablePagination
        {...props}
        count={getBiometricDetails.numRows} 
        page={paginateData.pageCount || 0}
        rowsPerPage={paginateData.pageSize || 20}
        rowsPerPageOptions={[20, 50, 100]}
        onPageChange={(event, newPage) => handlePageChange(newPage)}
        onRowsPerPageChange={(event) =>
        handleSizeChange(parseInt(event.target.value, 10))
      }
      labelRowsPerPage="Rows per page:" />
      </div>),
    Toolbar: (props) => (
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div style={{width: '100%'}}>
          <MTableToolbar {...props} />
        </div>
        <div>
          <CommonSearch
            searchVal={paginateData.searchString}
            cancelSearch={cancelSearch}
            requestSearch={requestSearch}
          />
        </div>
      </div>
    ),

  }}
  actions={[
    {
      icon: () => <AddIcon />,
      tooltip: 'Add',
      isFreeAction: true,
      onClick: () =>  setOpen(true),
    },
  ]}
/>
</Card>}
</Grid>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" >
<Grid container spacing={3} padding={5}>
  <Grid display={'flex'} justifyContent={'space-between'} size={12}>
    <Typography variant="h6" gutterBottom>
      Configure Device Attendance
    </Typography>
    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
      Note: Only ESSN & ZkTeco devices are allowed.
    </Typography>
  </Grid>

        <Grid size={12}>

          <TextField
            fullWidth
            label="Device Name"
            required
            variant="outlined"
            value={formData.device_name || ''}
            error={!!formErrors.device_name}
            helperText={formErrors.device_name}
            onBlur={() => validateForm('device_name', formData.device_name)}
            onChange={(e) => setStateHandler('device_name', e.target.value)}
          />
        </Grid>

        <Grid size={12}>

          <TextField
            fullWidth
            label="Serial Number"
            required
            variant="outlined"
            value={formData.serial || ''}
            onChange={(e) => setStateHandler('serial', e.target.value)}
            error={!!formErrors.serial}
            helperText={formErrors.serial}
          />
        </Grid>
        <Grid size={12}>
          <Autocomplete
            disablePortal={false}
            options={stocklocation}
            getOptionLabel={(option) => option.location_name || ''}
            value={formData.location}
            onChange={(event, newValue) => setStateHandler('location', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Device Location"
                required
                variant="outlined"
                error={!!formErrors.location}
                helperText={formErrors.location}
              />
            )}
            PaperProps={{
              style: {
                zIndex: 1301, // Higher than the default Dialog zIndex (1300)
              },
            }}
          />
        </Grid>

        <Grid size={12}>
          <Autocomplete
            disablePortal={false}
            options={machine}
            getOptionLabel={(option) => option.machineType || ''}
            value={formData.is_same_device}
            onChange={(event, newValue) => setStateHandler('is_same_device', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Biometric Config"
                required
                variant="outlined"
                error={!!formErrors.is_same_device}
                helperText={formErrors.is_same_device}
              />
            )}
            PaperProps={{
              style: {
                zIndex: 1301,
              },
            }}
          />
        </Grid>

  <Grid container justifyContent="flex-end" spacing={2} mt={'5px'}>
                                  <Grid>
                                      <Button variant='contained' color='error' onClick={handleCancel}>
                                          Cancel
                                      </Button>
                                  </Grid>
                                  <Grid>
                                      <Button variant='contained' onClick={handleSubmit} >
                                          Submit
                                      </Button>
                                  </Grid>
                              </Grid>
</Grid>
</Dialog>
      {view && <DeviceLandingPage handleClose={() => setView(false)} />}
    </div>
  );
}

export default BiometricAttendance
