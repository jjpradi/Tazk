import React, {useEffect, useState} from 'react';

import {Autocomplete, Button, Card, Grid, TextField, Typography} from '@mui/material';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';

import {capitalize} from 'lodash';
import {useDispatch, useSelector} from 'react-redux';
import {getAllAssetAction, getWarrantyByIdAction, insertAssetwarrantyAction, renewWarrantyAction} from 'redux/actions/asset_actions';
import moment from 'moment/moment';
import PropTypes from 'prop-types'

const AssetWarranty = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const dispatch = useDispatch();
  const {type} = props;
  const [required,setRequired] = useState(type === 'new' ? false : true)

 
  const [assetId, setAssetId] = useState(null)
  const [validRegex, setValidRegex] = useState({
    dateValid: false,
  });
  const [formData, setFormData] = useState({
    warranty_seller:  null,
    asset_name: null,
    warranty_fromDate_Time : null ,
    warranty_toDate_Time : null ,
    warranty_Image: null,
  });
  console.log(props.type === 'extend' && props.data,'dsds' )

  const [formErrors, setFormErrors] = useState({
    warranty_seller: null,
    asset_name:null,
    warranty_fromDate_Time : null ,
    warranty_toDate_Time : null ,
    warranty_Image: null,
  });

  const {
    AssetReducers : {
    getAssetName
    },
  
} = useSelector((state)=> state)

useEffect(() => {
  if(props?.type === 'extend') {
    const asset = getAssetName.find((e) => e.asset_id === props?.data.asset_id)
    const newFormData = {...formData, warranty_seller: props?.data.seller, asset_name : asset}
    setFormData(newFormData)
  }
  else if(props?.type === 'Renewals'){
    const asset = getAssetName.find((e) => e.asset_id == props?.data.asset_id)
    assetId !== props.data.asset_id && dispatch(getWarrantyByIdAction(props?.data.id, async(response) => {
      const res =  response[0]
      console.log(res, 'renewal')
      setFormData((prev) => ({
        ...prev,
        warranty_seller: res.seller,
        asset_name: asset,
        warranty_Image: res.image ? res.image.map((e => e.imageUrl)) : null
      }))
    }))
    setAssetId(props?.data.asset_id)
}
}, [props])


const onKeyDown = (e) => {
  e.preventDefault();
};

  const handleChange = (name, value) => {
    
    setFormData({
      ...formData,
      [name]: value,
    });
    validateForm(name, value);
    if (props?.type === 'new') {
      props?.valueChange(name, value);
    }
  };

  const validateForm = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (requiredFields.includes(name) && (value === null || value === '')) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name.replace(/_/g, '')) + 'is required',
      });
    } else if (name === 'date') {
      if (value !== '') {
        const y = value.split('-');

        const dString = `${parseInt(y[0])}-${y[1]}-${y[2]}`;

        if (!moment(dString, moment.ISO_8601).isValid()) {
          setValidRegex({...validRegex, dateValid: false});
          setFormErrors({
            ...formErrors,
            [name]: 'Date is Invalid!',
          });
        } else {
          setFormErrors({
            ...formErrors,
            [name]: null,
          });
        }
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  useEffect(() => {
    if (uploadedFiles.length > 1) {
      setFormErrors({
        ...formErrors,
        warranty_Image: 'Only a Image is Required',
      });
    } else {
      setFormErrors({
        ...formErrors,
        warranty_Image: null,
      });
    }

    if (props?.type === 'new') {
      props?.imageChange('warranty', uploadedFiles);
    }
  }, [uploadedFiles]);

  useEffect(() => {
    dispatch(getAllAssetAction())
  }, []);


  //   requiredFields.forEach(
  //     (key) => {
  //       if (uploadedFiles.length > 0 && uploadedFiles.length <= 2) {
  //         isValid = true;
  //         formErrorsObj.warranty_Image = null;
  //       }
  //       if (formData[key] === null || formData[key] === 'null' || formData[key] === '') {
  //         isValid = false;
  //         formErrorsObj[key] = capitalize(key) + ' is required';
  //       }
  //       if (uploadedFiles.length === 0) {
  //         isValid = false;
  //         formErrorsObj.warranty_Image = 'Image is Required';
  //       }
  //       if (uploadedFiles.length > 2) {
  //         isValid = false;
  //         formErrorsObj.warranty_Image = 'Only 2 Images are Required';
  //       }
       
  //       return null;
  //     },
  //     [uploadedFiles],
  //   );

  //   console.log(isValid,'validdddd')


      
   
  //      await dispatch(
  //         insertAssetwarrantyAction(data, (res) => {
  //           if (res.status === 200) {
  //             dispatch(listwarrantyAction)
  //           }
  //         }),
  //       ),


  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    requiredFields.forEach((key) => {
      if (formData[key] === null || formData[key] === 'null' || formData[key] === '') {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is required';
      } else {
        formErrorsObj[key] = null;
      }
    });

    if (uploadedFiles.length === 0) {
      isValid = false;
      formErrorsObj.warranty_Image = 'Image is Required';
    } else if (uploadedFiles.length > 2) {
      isValid = false;
      formErrorsObj.warranty_Image = 'Only 2 Images are Required';
    } else {
      formErrorsObj.warranty_Image = null;
    }
  
    setFormErrors(formErrorsObj);
  
    if (isValid) {
      const data = {
        warranty_seller: formData.warranty_seller,
        warranty_fromDate_Time: formData.warranty_fromDate_Time ? moment(formData.warranty_fromDate_Time).format('YYYY-MM-DD HH:mm') : null,
        warranty_toDate_Time: formData.warranty_toDate_Time ? moment(formData.warranty_toDate_Time).format('YYYY-MM-DD HH:mm') : null,
        warranty_Image: uploadedFiles,
        asset_id: formData.asset_name?.asset_id,
        type: props?.type
      };
      if(props.type === 'Renewals'){
        await dispatch(renewWarrantyAction(data, props.data.id))
      }
      else{
        await dispatch(
          insertAssetwarrantyAction(data, (res) => {
            if (res.status === 200) {
              dispatch(listwarrantyAction());
            }
          })
        );
      }
  
      props.handleClose();
    }
  };
  

  const requiredFields = [
    'warranty_seller',
    'warranty_fromDate_Time',
    'warranty_toDate_Time',
    'asset_name'
  ];


  return (
    <Card sx={{p: 3}}>
      <Grid container spacing={2}>
      <Grid
        size={{
          lg: 12,
          md: 12,
          sm: 12,
          xs: 12
        }}>
        <Typography variant='h6' align='left' style={{paddingBottom: '10px'}}>
          Asset Warranty
        </Typography>
        </Grid>

        

          { type !== 'new' &&
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
          <Autocomplete
            disablePortal
            options={getAssetName}
            getOptionLabel={(option) => option.Name || ''}
            value={formData.asset_name}
            onChange={(name, value) => handleChange('asset_name', value)}
            renderInput={(params) => (
              <TextField {...params}
                label='Asset Name'
                required={required}
                variant='filled'
                error={formErrors.asset_name !== null}
                helperText={formErrors.asset_name === null ? '' : 'Asset Name is required'}
              />
            )}
          />
          </Grid>

}

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <TextField
              fullWidth
              value={formData.warranty_seller || ''}
              required = {required}
              label='Authorized Service Provider'
              name='warranty_seller'
              variant='filled'
              onChange={(e) => handleChange('warranty_seller', e.target.value)}
              error={formErrors.warranty_seller !== null}
              helperText={
                formErrors.warranty_seller ? 'Authorized Service Provider is Required' : ''
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
              <DateTimePicker
                slotProps={{
                  textField: {
                    variant: 'filled',
                    fullWidth: true,
                    required: required,
                    onKeyDown: onKeyDown,
                    error: formErrors.warranty_fromDate_Time !== null,
                    helperText: formErrors.warranty_fromDate_Time === null ? '' : 'Start Date And Time is Required',
                  },
                }}
                label='Start Date & Time'
                value={formData.warranty_fromDate_Time}
                onChange={(val) => {
                  if(!val) {
                    setFormErrors((prev) => ({...prev, warranty_fromDate_Time : 'Start Date And Time is Required'}))
                    setFormData((prev) => ({...prev, warranty_fromDate_Time : null}))
                  }
                  else{
                    setFormErrors((prev) => ({ ...prev, warranty_fromDate_Time: null }));
                    setFormData((prev) => ({ ...prev, warranty_fromDate_Time: val }));
                    if(props?.type === 'new') {
                      props?.valueChange('warranty_fromDate_Time', val)
                  }
                }
                }}
                format='DD/MM/YYYY hh:mm A'
                
                
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
              <DateTimePicker
                slotProps={{
                  textField: {
                    variant: 'filled',
                    fullWidth: true,
                    required: required,
                    onKeyDown: onKeyDown,
                    error: formErrors.warranty_toDate_Time !== null,
                    helperText: formErrors.warranty_toDate_Time === null ? '' : 'End Date And Time is Required',
                  },
                }}
                name='End Date & Time'
                label='End Date & Time'
                value={formData.warranty_toDate_Time}
                onChange={(val) => {
                  if(!val) {
                    setFormErrors((prev) => ({...prev, warranty_toDate_Time : 'End Date And Time is Required'}))
                    setFormData((prev) => ({...prev, warranty_toDate_Time : null}))
                  }
                  else{
                    setFormErrors((prev) => ({ ...prev, warranty_toDate_Time: null }));
                    setFormData((prev) => ({ ...prev, warranty_toDate_Time: val }));
                    if(props?.type === 'new') {
                      props?.valueChange('warranty_toDate_Time', val)
                  }
                  }
                }}
                format='DD/MM/YYYY hh:mm A'
              />
            </LocalizationProvider>
          </Grid>


          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <AttachmentField
              warranty='warranty'
              previews={uploadedFiles}
              setPreviews={setUploadedFiles}
            />
            <Typography color='error'>
              {formErrors.warranty_Image !== null
                ? formErrors.warranty_Image
                : ''}
            </Typography>
          </Grid>

          {(props.type == 'extend' || props.type == 'add' || props.type === 'Renewals')  && (
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container gap={2} display='flex' justifyContent='end'spacing={2}>
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
                  <Button variant='contained' onClick={handleSubmit}>
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

AssetWarranty.propTypes = {
  type : PropTypes.string,
  data : PropTypes.string,
  valueChange : PropTypes.func,
  imageChange : PropTypes.func,
  handleClose : PropTypes.func
}

export default AssetWarranty;
