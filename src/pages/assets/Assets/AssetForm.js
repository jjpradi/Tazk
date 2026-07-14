import React, { useState ,useContext,useEffect} from 'react';
import {Autocomplete, TextField, Card, Typography, Button, Grid, Checkbox, FormControlLabel, IconButton, Box, FormControl, FormLabel, RadioGroup, Radio} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useSelector,useDispatch } from 'react-redux';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import { listUserCreationAction } from 'redux/actions/userCreation_actions';
import { getEmpbasecompanyAction } from 'redux/actions/attendance_actions';
import{CreateAssetManagement,getAssetGroupIdAction,getAssetTypeIdAction,insertNewAssetTypeAction,getAssetCodeAction, ListAssets, ListAssetTimeline,
   getImageAction, getDynamicPropByAssetType,
   updateImageAction}from '../../../redux/actions/asset_actions';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Asset_Details from './AssetDetails';
import { useDropzone } from 'react-dropzone';
import UploadModern from 'components/FilePicker/UploadModern';
import  {createFilterOptions} from '@mui/material/Autocomplete';
import { ProperCaseFunc } from 'utils/properCase';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import { ValidationError } from 'yup';
import { updateAssetAction } from '../../../redux/actions/asset_actions';
import { formatDistanceToNowStrict } from 'date-fns';
import axios from 'axios';
// import { GET_TASK_PROJECTS } from 'redux/actionTypes';
import apiCalls from 'utils/apiCalls';
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { getsessionStorage } from 'pages/common/login/cookies';
import InsuranceForm from 'pages/assets/Insurance/InsuranceForm';
import dayjs from 'dayjs';
import { formatTime12Hour } from 'utils/pageSize';
import AssetWarranty from './AssetWarranty';
import ServiceDueForm from 'pages/assets/ServiceDue/ServiceDueForm';


const initialFormData = {
    name: '',
    cost: '',
    asset_group_id: '',
    asset_type: '',
    ownerName: '',
    assignedTo: '',
    asset_condition: 'New',
    location_id: '',
    status: 'Available',
    image: [],
    code:'',
    dynamicPropValues: [],

    // warranty
    warranty_seller : null,
    warranty_fromDate_Time:null,
    warranty_toDate_Time:null,
    warranty_Image: null,
    //insurance
    insurance_agent	:  null,
    insurance_startDateAndTime : null,
    insurance_endDateAndTime : null,
    insuranceImage : [],
    insurance_dynamicPropValues : [],
    //serviceDue
    service_provider : null,
    service_startDateAndTime : null,
    service_endDateAndTime : null,

};
 
 
 
const status = [
  { label: 'Available' },
  { label: 'Assigned' },
]
 
const asset_condition = [
  { label: 'New' },
  { label: 'Used' },
  { label: 'Damaged' },
  { label: 'Missing' },
  { label: 'Expired' }
]

 
const AssetManagement = (props) => {
  let user = getsessionStorage();
  const defaultEmployeeId = user.employee_id
  const fullName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name
  const [assetCode, setAssetCode] = useState(0); 
  const[image,setImage]=useState([]);
  const[insuranceImage, setInsuranceImage] = useState([])
  const [imageKey,setImageKey]=useState([]);
  const [formData, setFormData] = useState({...initialFormData, ownerName: user.employee_id});
  const [warranty_Image,setWarrantyImage] = useState()
  const [errors, setErrors] = useState({
    name: null,
    cost: null,
    asset_group_id: null,
    asset_type: null,
    ownerName: null,
    assignedTo: null,
    asset_condition: null,
    location_id: null,
    status: null,
    image: null,
    code:null,
    dynamicPropErrors: [],

    // warranty
    warranty_seller : null,
    warranty_fromDate_Time:null,
    warranty_toDate_Time:null,
    warranty_Image: null,
  });

  const[dynamicProp, setDynamicProp] = useState([])

  const[insuranceDynamicProp, setInsuranceDynamicProp] = useState([])

  const dispatch = useDispatch();

  const newDate = new Date()
  const currentDate = newDate.toISOString().split('T')[0]
  const hours = newDate.getHours().toString().padStart(2, '0');
  const minutes = newDate.getMinutes().toString().padStart(2, '0');
  const seconds = newDate.getSeconds().toString().padStart(2, '0');
  const time =`${hours}:${minutes}:${seconds}`;
  const currentTime = newDate

  const {
    stockLocationReducer: {allliststocklocation},
    UserCreationReducer: {createUser},
    attendanceReducer:{ get_empbasecompany },
    AssetReducers:{getAssetGroup, getAssetType,code,updateAsset,insertNewAssetType,getAssetCode,getImage, getDynamicPropByComp}, 
  } = useSelector((state)=> state)
 
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
    selectData, setselectData
  } = useContext(CreateNewButtonContext);
 
    useEffect(() => { (async () => {

      dispatch(allListStockLocation()),
      dispatch(getEmpbasecompanyAction()),
      dispatch(getAssetGroupIdAction()),
      dispatch(getAssetTypeIdAction()),
      dispatch(getAssetCodeAction(async (res) => {
        const assetCode = await res.assetCode
        setAssetCode(assetCode)
      })),
      dispatch(listUserCreationAction())
     
      })();
},[])
      
      getImage.map((e)=>{
        // console.log('imagesssss',e)
      })
      // console.log('get_taskProjects',getImage)
    
      useEffect(() => {
        let insuranceDynamicPropObj = {}
        
        insuranceDynamicProp.forEach((val) => {
          insuranceDynamicPropObj[val.name] = val.type === 'List' ? val.properties.default_value
                                                  : val.type === 'Date' && val.properties.date_default_value ? newDate
                                                  : val.type === 'Time' && val.properties.time_default_value ? newDate
                                                  : val.type === 'Date & Time' && val.properties.dateTime_default_value ? newDate
                                                  : val.type === 'CheckBox' ? false
                                                  : val.type === 'Radio' ? val.properties.options[0]
                                                  : val.null
        })

        setFormData((prevState) => ({
          ...prevState,
          insurance_dynamicPropValues: {...insuranceDynamicPropObj}
        }))
      }, [insuranceDynamicProp])


      useEffect(() => { (async () => {
        let propValue = []
        if(formData.asset_type !== ''){
          dispatch(getDynamicPropByAssetType({type: formData.asset_type}, async(res) => {
            const properties = await res
            const final = properties.map((prop) => ({
              ...prop,
              properties: JSON.parse(prop.properties)
            }))
            setDynamicProp(final)

            let dynamicPropValues = {};
            
            if(props.status === 'edit'){
              final.forEach(prop => {
                dynamicPropValues[prop.name] = props.assetData.properties[prop.name]
            });
            }
            else{
              final.forEach(prop => {
                dynamicPropValues[prop.name] =  prop.type === 'List' ?  prop.properties.default_value
                                                : prop.type === 'Date' && prop.properties.date_default_value ? newDate
                                                : prop.type === 'Time' && prop.properties.time_default_value ? newDate
                                                : prop.type === 'Date & Time' && prop.properties.dateTime_default_value ? newDate
                                                : prop.type === 'CheckBox' ? false
                                                : prop.type === 'Radio' ? prop.properties.options[0]
                                                : prop.properties.default_value;
            });
            }
            //  console.log('dynamicPropValues:', dynamicPropValues);
            //  console.log('assetData:', props.assetData); 
            final.map((prop) => {
              if(prop.properties?.required && prop.properties.required === true){
                setErrors((prevState) => ({
                  ...prevState,
                  dynamicPropErrors: {...prevState.dynamicPropErrors, [prop.name]: null}
                }))
              }
            })

            setFormData(prevState => ({
                ...prevState,
                dynamicPropValues: {...dynamicPropValues}
            }));
          }))
        }else{
          setDynamicProp([])
        }
      })();
}, [formData.asset_type])

      useEffect(()=>{ (async () => {
        let editData = {...props.assetData}
        delete editData.asset_group
        delete editData.properties
          if(props.status==='edit'){
            dispatch(getImageAction({asset_id: props.assetData.asset_id}, async(res)=>{
              const imageKey=await res.image
              setImageKey(imageKey)
            }
          ))
            setFormData({...editData, asset_type: props.assetData.asset_type_id, dynamicPropValues: props.assetData.properties})
            props.assetData.image.map((img)=>{
              setImage((prev)=>[...prev , img.imageUrl])
            })
          }
      })();
}, [props.status])

        // useEffect(() => {
        //   if (getImage.length > 0) {
        //     const imageUrls = getImage.map(img => img.imageUrl);
        //     setImage(imageUrls);
        //   }
        // }, [getImage]);

        useEffect(() => {
          let keys= []
          if (getImage.length > 0) {
            getImage.forEach(item => {
              try {
                let parsedImage = JSON.parse(item.image);
                keys.push(parsedImage);
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            });
          }
          setImageKey(...keys);
        }, [getImage])
      

    const [value, setValue] = React.useState([]);
    const[newTimelineList, setNewTimelineList] = useState([])
    const filter = createFilterOptions();
 
  const handleChange = async(field, value) => {
    const updatedErrors = { ...errors };
    delete updatedErrors[field];
    setErrors(updatedErrors);
 
    if (field === 'image') {
      // setImageUrls(value);
      handleImageChange(value);
      } 
    else if(field === 'assignedTo'){
      setFormData({
        ...formData,
        [field]: value !== '' ? value : '',
        status: value !== '' ? 'Assigned' : 'Available'
      })
    }
    else {
      if(value !== null && value !== '') {
        await setFormData({ ...formData, [field]: value });
        setErrors({...errors, [field] : null})
      }
      else {
        await setFormData({ ...formData, [field]: null });
        setErrors({...errors, [field] : `${field} is Required`})
      }
    }
      
     
  };
//  console.log("image", image)
//  console.log("insuranceImage1", insuranceImage)
 
  const handleBlur = (field) => {
    const value = formData[field];
 
    if (!value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: `${field} is required`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  };
 
 
  const handleImageChange = (image) => {
    if (image.length === 0) {
      setErrors({ ...errors, image: 'Please select at least one image.' });
    } else if (image.length > 6) {
      setErrors({ ...errors, image:' images' });
    } else {
      setErrors({ ...errors, image: null });
    }
  };



  const handleImageDelete = (index) => {
    if (props.assetData) {
        const updatedImages = [...image];
        updatedImages.splice(index, 1);
        setImage(updatedImages);

        const updatedImageKeys = [...imageKey]
        updatedImageKeys.splice(index, 1)
        setImageKey(updatedImageKeys)
        // dispatch(updateImageAction({ index: index, asset_id: props.assetData.asset_id }));
    } else {
        console.error('Asset data is undefined');
    }
  };

  const handlePropWarrantyChange = async (name,value)=>{
    if(name === 'warranty_fromTime' || name === 'warranty_toTime'){
      if(!value) {
        setFormData((prev) => ({...prev, [name] : null}))
      }
      else {
        const formattedDate = moment(value).format('YYYY-MM-DD HH:mm')
        setFormData((prev) => ({ ...prev, [name] : formattedDate }))
      }
    }
    else{
      await handleChange(name,value)
    }
  }

  const handlePropWarrantyImageChange = async (name,value) =>{
    if(name === 'warranty'){
      await setWarrantyImage(value)
    }
  }
  

  const handlePropValueChange = async (name, value) => {
    if(name === 'insurance_startDateAndTime' || name === 'insurance_endDateAndTime' || name === 'service_startDateAndTime' || name === 'service_endDateAndTime') {
      if(!value) {
        setFormData((prev) => ({...prev, [name] : null}))
      }
      else {
        const formattedDate = moment(value).format('YYYY-MM-DD HH:mm')
        setFormData((prev) => ({ ...prev, [name] : formattedDate }))
      }
    }
    else{
      await handleChange(name, value)
    }
  }

  const handlePropsChange = async (name, value, required) => {
      if(required){
        if(value !== null && value !== '' && value !== undefined){
          setFormData({
            ...formData,
            insurance_dynamicPropValues: {...formData.insurance_dynamicPropValues, [name]: value}
          })
          setErrors({
            ...errors,
            insurance_dynamicPropErrors: {...errors.insurance_dynamicPropErrors, [name]: null}
          })
        } else{
          setFormData({
            ...formData,
            insurance_dynamicPropValues: {...formData.insurance_dynamicPropValues, [name]: null}
          })
          setErrors({
            ...errors,
            insurance_dynamicPropErrors: {...errors.insurance_dynamicPropErrors, [name]: `${name} is Required`}
          })
        }
      } else{
        setFormData({
          ...formData,
          insurance_dynamicPropValues: {...formData.insurance_dynamicPropValues, [name]: value ? value : null}
        })
        setErrors({
          ...errors,
          insurance_dynamicPropErrors: {...errors.insurance_dynamicPropErrors, [name]: null}
        })
      }
  }


  const handlePropImageChange = async (name, value) => {
    if(name === 'insuranceImage'){
      await setInsuranceImage(value)
    }
    else if (name === 'asset') {
      await setImage(value);
    }
  }
  console.log('insuranceImage', insuranceImage)

  const handlePropValidate = async (value) => {
    await setInsuranceDynamicProp([...insuranceDynamicProp, value])
    console.log('qe', value)
  }

  
  const getImageDataFromURL = async (imageUrl) => {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageData = Buffer.from(response.data, 'binary').toString('base64');
      return imageData;
    } catch (error) {
      console.error('Error fetching image data:', error);
      throw error;
    }
  };
  const handleDynamicPropChange = (name, value, required) => {
    if(required){
      if(value !== null && value !== '' && value !== undefined){
        setFormData({
          ...formData,
          dynamicPropValues: {...formData.dynamicPropValues, [name]: value}
        })
        setErrors({
          ...errors,
          dynamicPropErrors: {...errors.dynamicPropErrors, [name]: null}
        })
      } else{
        setFormData({
          ...formData,
          dynamicPropValues: {...formData.dynamicPropValues, [name]: null}
        })
        setErrors({
          ...errors,
          dynamicPropErrors: {...errors.dynamicPropErrors, [name]: `${name} is Required`}
        })
      }
    } else{
      setFormData({
        ...formData,
        dynamicPropValues: {...formData.dynamicPropValues, [name]: value ? value : null}
      })
      setErrors({
        ...errors,
        dynamicPropErrors: {...errors.dynamicPropErrors, [name]: null}
      })
    }
    
  }
  
  if(!formData.status ||  formData.status === '' ||  formData.status === null){
    console.log('status')
  }
  else{
    console.log('asasasasasasas')
  }

  
  useEffect(() => {
    if(image.length > 6){
        setErrors({
            ...errors,
            image: 'You can only upload up to 6 images'
        })
    }
    else{
      setErrors({
            ...errors,
            image: null
        })
    }
}, [image])
  
  const handleSubmit = async(event) => {
    event.preventDefault();
    const validationErrors = {};

 
    if (formData.cost === '') {
        validationErrors.cost = 'Cost is required';
    }
    if (formData.name === '') {
        validationErrors.name = 'Name is required';
    }
    if (formData.asset_group_id === '') {
        validationErrors.asset_group_id = 'Asset Group is required';
    }
    if (formData.asset_type === '') {
        validationErrors.asset_type = 'Asset Type is required';
    }
    if (formData.ownerName === '' || formData.ownerName === null) {
        validationErrors.ownerName = 'Owner Name is required';
    }
    if (formData.asset_condition === '') {
        validationErrors.asset_condition = 'Condition is required';
    }
    if (formData.location_id === '') {
        validationErrors.location_id = 'Location is required';
    }
    if (formData.status === '') {
        validationErrors.status = 'Status is required';
    }
    if (image.length === 0 ){
      validationErrors.image = 'Image is Required'
    } 
    if (image.length > 6) {
      validationErrors.image = 'You can only upload up to 6 images';
    } 

    if(dynamicProp.length === 0){
      validationErrors.dynamicPropErrors = {}
    } else if(dynamicProp.length > 0 ){
      let dynamicPropError = {}
      dynamicProp.map((prop) => {
        if(prop.properties?.required && prop.properties.required === true && (formData.dynamicPropValues[prop.name] === null || formData.dynamicPropValues[prop.name] === 'null' || formData.dynamicPropValues[prop.name] === '')){
          dynamicPropError[prop.name] = `${prop.name} is Required`
        }
        else{
          dynamicPropError[prop.name] = null
        }
      })
      validationErrors.dynamicPropErrors = {...dynamicPropError}
    }

    
    

    //Insurance
    if(insuranceDynamicProp.length === 0){
      validationErrors.insurance_dynamicPropErrors = {}
    } else if(insuranceDynamicProp.length > 0 ){
      let insuranceDynamicPropError = {}
      insuranceDynamicProp.map((prop) => {
        if(prop.properties?.required && prop.properties.required === true && (formData.insurance_dynamicPropValues[prop.name] === null || formData.insurance_dynamicPropValues[prop.name] === 'null' || formData.insurance_dynamicPropValues[prop.name] === '')){
          insuranceDynamicPropError[prop.name] = `${prop.name} is Required`
        }
        else{
          insuranceDynamicPropError[prop.name] = null
        }
      })
      validationErrors.insurance_dynamicPropErrors = {...insuranceDynamicPropError}
    }
 

    // timeline
   
 
    let timeline_message = [];

if (props.assetData) {
    if (formData?.cost && formData.cost !== props.assetData.cost) {
        let message = `Cost changed from ${props.assetData.cost} to ${formData.cost}. `;
        timeline_message.push(message);
    }

    const newLocationArray = allliststocklocation.filter(location => location.location_id === formData.location_id);
    const oldLocationArray = allliststocklocation.filter(location => location.location_id === props.assetData.location_id);
    if (formData?.location_id && formData.location_id !== props.assetData.location_id) {
        try {
            const oldLocationName = oldLocationArray.length > 0 ? oldLocationArray[0].location_name : props.assetData.location_id;
            const newLocationName = newLocationArray.length > 0 ? newLocationArray[0].location_name : formData.location_id;
            let message = `Location changed from ${oldLocationName} to ${newLocationName}. `;
            timeline_message.push(message);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    if (formData?.status && formData.status !== props.assetData.status) {
        let message = `Status changed from ${props.assetData.status} to ${formData.status}. `;
        timeline_message.push(message);
    }

    if (formData?.asset_condition && formData.asset_condition !== props.assetData.asset_condition) {
        let message = `Asset condition changed from ${props.assetData.asset_condition} to ${formData.asset_condition}. `;
        timeline_message.push(message);
    }

    if (formData?.asset_group_id && formData.asset_group_id !== props.assetData.asset_group_id) {
        let message = `Asset group ID changed from ${props.assetData.asset_group} to ${getAssetGroup
            .filter(e => e.asset_group_id === formData.asset_group_id)
            .map(e => e.asset_group)}. `;
        timeline_message.push(message);
    }

    if (formData?.assignedTo && formData.assignedTo !== props.assetData.assignedTo) {
        
            const old = get_empbasecompany.filter(employee => employee.employee_id === props.assetData.assignedTo);
            const newwww = get_empbasecompany.filter(employee => employee.employee_id === formData.assignedTo);
            const oldEmployeeName = old.length > 0 ? old[0].full_name : props.assetData.assignedTo;
            const newEmployeeName = newwww.length > 0 ? newwww[0].full_name : formData.assignedTo;
            let message = `AssignedTo changed from ${oldEmployeeName} to ${newEmployeeName}. `;
            timeline_message.push(message);
       
    }

    if (formData?.asset_type && formData.asset_type !== props.assetData.asset_type_id) {
        let message = `Asset type changed from ${props.assetData.asset_type} to ${getAssetType
            .filter(e => e.asset_type_id === formData.asset_type)
            .map(e => e.asset_type)
            }. `;
        timeline_message.push(message);
    }

    if (formData?.name && formData.name !== props.assetData.name) {
        let message = `Name changed from ${props.assetData.name} to ${formData.name}. `;
        timeline_message.push(message);
    }
    
    if (image !== props.assetData.image && timeline_message.length === 0) {
      let message = `Image Updated`;
      timeline_message.push(message);
  }


console.log(timeline_message);
   
    if ( formData?.asset_type && formData.asset_type !== props.assetData.asset_type_id) {
      let message =`Asset type changed from ${props.assetData.asset_type} to ${ getAssetType
        .filter(e => e.asset_type_id === formData.asset_type)
        .map(e => e.asset_type)
      }. `
        timeline_message.push(message);
    }
   
    if (formData?.name && formData.name !== props.assetData.name) {
      let message = `Name changed from ${props.assetData.name} to ${formData.name}. `
        timeline_message.push(message);
    }

    if(image !== props.assetData.image){
      let message = `Image Updated`
      timeline_message.push(message)
    }
  }


  const allValidationErrors = {
    ...validationErrors
  
};
  

    if (Object.keys(allValidationErrors).length > 2) {
        setErrors({ ...allValidationErrors });
    } else {
      console.log(formData?.warranty_fromTime)
        const allData={
          name: formData.name,
          cost: formData.cost,
          asset_group_id: formData.asset_group_id,
          asset_type: formData.asset_type,
          assetOwner: formData.ownerName,
          assignedTo: formData.assignedTo === '' ? null : formData.assignedTo,
          asset_condition: formData.asset_condition,
          location_id: formData.location_id,
          status: formData.status,
          imageKey: imageKey,
          // code: getAssetCode.assetCode,
          // image:  image,
          code: formData.code === '' ? getAssetCode.assetCode : formData.code,
          image: image,
          timeline_message:timeline_message,
          properties: formData.dynamicPropValues,

          // warranty

          warranty_seller : formData.warranty_seller,
          warranty_fromDate_Time: formData.warranty_fromDate_Time ,
          warranty_toDate_Time: formData?.warranty_toDate_Time,
          warranty_Image: warranty_Image,
          //insurance
          insurance_agent : formData.insurance_agent,
          insurance_startDateAndTime : formData.insurance_startDateAndTime ? formData.insurance_startDateAndTime : null,
          insurance_endDateAndTime : formData.insurance_endDateAndTime ? formData.insurance_endDateAndTime : null,
          insuranceImage : insuranceImage,
          insurance_properties : formData.insurance_dynamicPropValues,
          insurance_dynamicFields : insuranceDynamicProp,
          //serviceDue
          service_provider : formData.service_provider,
          service_startDateAndTime : formData.service_startDateAndTime ? formData.service_startDateAndTime : null,
          service_endDateAndTime : formData.service_endDateAndTime ? formData.service_endDateAndTime : null,
        }              
        if(props.status==='edit'){
          console.log('edit post data', allData)
          dispatch(updateAssetAction({...allData, asset_id: props.assetData.asset_id}, (res) => {
            const response =  res;
            ListAssetTimeline()
          }))
          .then(()=>{
            ListAssetTimeline()
            
          })
          props.handleDetailClose()        
         
        }else{
        await dispatch(CreateAssetManagement(allData))
        props.handleFormClose()
      }
      
        setFormData({
            // cost: ''
            ...initialFormData,
            image: []
        });
        // setErrors({});
        setImage([]);
        props.handleFormClose()
    }
    
  };
  console.log('formData', formData)
const ERROR_MESSAGES = {
  // assignedTo: 'Assigned To is required',
  asset_type: 'Asset Type is required',
  asset_group_id: 'Asset Group is required',
  name: 'Name is required',
  asset_condition: 'Condition is required',
  location_id: 'Location is required',
  status: 'Status is required',
  cost: 'Cost is required',
  // image: 'Image is Required'
};

console.log("ewfcdwewedweeeweee", formData.asset_group_id)
console.log(getAssetGroup,'getAssetGroup')

useEffect(()=>{
  const data = {
    groupId : formData.asset_group_id
  }
  dispatch(getAssetTypeIdAction(data))
},[formData.asset_group_id])

  return (
    <>
      <Card sx={{p: 3}}>
        <Grid
          container
          spacing={2}
          // direction='row'
        >
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container display='flex' justifyContent='space-between'>
              <Grid display='flex' justifyContent='space-around' alignItems='center'>
                <Typography variant='h6' align='left' pl='5px'>
                  {props.status === 'edit' ? 'Edit Asset' : 'Asset Creation'}
                </Typography>

                <Typography variant='h6' align='left' pl='5px'>
                  {` | Code: ${props.status === 'edit' ? formData.code : getAssetCode.assetCode || ''}`}
                </Typography>
              </Grid>
              <Grid>
                <Grid container justifyContent='flex-end' spacing={2}>
                  <Grid>
                    <Button
                      onClick={() => props.handleFormClose(null)}
                      variant='contained'
                      color='error'
                    >
                      Cancel
                    </Button>
                  </Grid>

                  <Grid>
                    <Button
                      onClick={handleSubmit}
                      variant='contained'
                      // style={{ marginTop: '20px' }}
                    >
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
 
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              value={
                formData.asset_group_id
                  ? getAssetGroup?.data.find(
                      (e) => e.asset_group_id === formData.asset_group_id,
                    )
                  : null
              }
              disablePortal
              onChange={(event, value) => {
                handleChange(
                  'asset_group_id',
                  value ? value.asset_group_id : null,
                );
              }}
              // options={['Option 1', 'Option 2', 'Option 3']}
              options={getAssetGroup?.data}
              getOptionLabel={(option) => option.asset_group || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Asset Group'
                  variant='filled'
                  onBlur={() => handleBlur('asset_group_id')}
                  error={Boolean(errors.asset_group_id)}
                  // helperText={errors.asset_group_id}
                  helperText={
                    errors.asset_group_id && (
                      <Typography variant='body2' color='error'>
                        {ERROR_MESSAGES.asset_group_id}
                      </Typography>
                    )
                  }
                  required={true}
                />
              )}
            />
            {/* {errors.asset_group_id && (
                            <div style={{ color: 'red' }}>{errors.asset_group_id}</div>
                        )} */}
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              value={
                formData.asset_type
                  ? getAssetType?.data.find(
                      (e) => e.asset_type_id === formData.asset_type,
                    )
                  : null
              }
              fullWidth
              name='asset_type'
              disablePortal
              options={getAssetType?.data}
              onChange={async (event, newValue) => {
                if (newValue !== null) {
                  setFormData({
                    ...formData,
                    asset_type: newValue.asset_type_id,
                  });
                  setErrors({...errors, asset_type: null});
                } else {
                  setFormData({...formData, asset_type: ''});
                  setErrors({...errors, asset_type: 'Asset Type is Required'});
                }
                if (
                  newValue !== null &&
                  !getAssetType?.data.some(
                    (option) => option.asset_type_id === newValue.asset_type_id,
                  )
                ) {
                  try {
                    dispatch(insertNewAssetTypeAction(newValue));
                    dispatch(getAssetTypeIdAction());
                  } catch (error) {
                    console.log('');
                  }
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const {inputValue} = params;
                let input = ProperCaseFunc(inputValue);
                const isExisting = options.some(
                  (option) => input === option.category,
                );
                if (input !== '' && !isExisting) {
                  filtered.push({
                    inputValue,
                    asset_type: `${input}`,
                  });
                }
                if (value.length) {
                  value.forEach((data) => {
                    filtered.push({
                      inputValue: data,
                      asset_type: data,
                    });
                  });
                }
                return filtered;
              }}
              getOptionLabel={(option) => {
                if (option === 'string') {
                  return option;
                }
                if (option.inputValue) {
                  return option.asset_type;
                }
                return option.asset_type;
              }}
              // getOptionLabel={(option) => option}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Asset Type'
                  variant='filled'
                  required
                  onBlur={() => handleBlur('asset_type')}
                  error={Boolean(errors.asset_type)}
                  // helperText={errors.asset_type}
                  helperText={
                    errors.asset_type && (
                      <Typography variant='body2' color='error'>
                        {ERROR_MESSAGES.asset_type}
                      </Typography>
                    )
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
              value={formData.name}
              fullWidth
              variant='filled'
              disablePortal
              onChange={(event) => handleChange('name', event.target.value)}
              onBlur={() => handleBlur('name')}
              error={Boolean(errors.name)}
              // helperText={errors.name}
              helperText={
                errors.name && (
                  <Typography variant='body2' color='error'>
                    {ERROR_MESSAGES.name}
                  </Typography>
                )
              }
              label='Name'
              // type='number'
              required={true}
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
              fullWidth
              defaultValue={user}
              value={formData.ownerName ? createUser.find((e) => e.employee_id === formData.ownerName) : null}
              options={createUser}
              getOptionLabel={(option) => option.last_name ? option.first_name + option.last_name : option.first_name}
              onChange={(event, value) => {
                if(value === null){
                  handleChange('ownerName', '')
                }
                else{
                  handleChange('ownerName', value.employee_id)
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params}
                  required
                  label="Asset Owner"
                  variant='filled'
                  error={errors.ownerName === null ? false : true}
                  helperText={errors.ownerName === null ? '' : "Asset Owner is Required"}
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
            <Autocomplete
              value={
                formData.asset_condition
                  ? asset_condition.find(
                      (e) => e.label === formData.asset_condition,
                    )
                  : null
              }
              disablePortal
              onChange={(event, value) => {
                handleChange('asset_condition', value ? value.label : null);
              }}
              // options={['Option 1', 'Option 2', 'Option 3']}
              options={asset_condition}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Condition'
                  variant='filled'
                  onBlur={() => handleBlur('asset_condition')}
                  error={Boolean(errors.asset_condition)}
                  // helperText={errors.asset_condition}
                  helperText={
                    errors.asset_condition && (
                      <Typography variant='body2' color='error'>
                        {ERROR_MESSAGES.asset_condition}
                      </Typography>
                    )
                  }
                  required={true}
                />
              )}
            />
            {/* {errors.asset_condition && (
                            <div style={{ color: 'red' }}>{errors.asset_condition}</div>
                        )} */}
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              value={
                formData.status
                  ? status.find((e) => e.label === formData.status)
                  : null
              }
              disablePortal
              onChange={(event, value) => {
                handleChange('status', value ? value.label : null);
              }}
              // options={['Option 1', 'Option 2', 'Option 3']}
              options={status}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Status'
                  variant='filled'
                  onBlur={() => handleBlur('status')}
                  error={Boolean(errors.status)}
                  helperText={
                    errors.status && (
                      <Typography variant='body2' color='error'>
                        {ERROR_MESSAGES.status}
                      </Typography>
                    )
                  }
                  required={true}
                />
              )}
            />
            {/* {errors.status && (
                            <div style={{ color: 'red' }}>{errors.status}</div>
                        )} */}
          </Grid>
          
          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              value={
                formData.location_id
                  ? allliststocklocation.find(
                      (e) => e.location_id === formData.location_id,
                    )
                  : null
              }
              disablePortal
              onChange={(event, value) => {
                handleChange('location_id', value ? value.location_id : null);
              }}
              // options={['Option 1', 'Option 2', 'Option 3']}
              options={allliststocklocation}
              getOptionLabel={(option) => option.location_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Location'
                  variant='filled'
                  onBlur={() => handleBlur('location_id')}
                  error={Boolean(errors.location_id)}
                  // helperText={errors.location_id}
                  helperText={
                    errors.location_id && (
                      <Typography variant='body2' color='error'>
                        {ERROR_MESSAGES.location_id}
                      </Typography>
                    )
                  }
                  required={true}
                />
              )}
            />
            {/* {errors.location_id && (
                            <div style={{ color: 'red' }}>{errors.location_id}</div>
                        )} */}
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <TextField
              value={formData.cost}
              fullWidth
              variant='filled'
              disablePortal
              onChange={(event) => handleChange('cost', event.target.value)}
              onBlur={() => handleBlur('cost')}
              error={Boolean(errors.cost)}
              // helperText={errors.cost}
              helperText={
                errors.cost && (
                  <Typography variant='body2' color='error'>
                    {ERROR_MESSAGES.cost}
                  </Typography>
                )
              }
              label='Cost'
              type='number'
              required={true}
            />
            {/* {errors.cost && (
                                <div style={{ color: 'red' }}>{errors.cost}</div>
                            )} */}
          </Grid>

          <Grid
            size={{
              lg: 3,
              md: 4,
              sm: 4,
              xs: 12
            }}>
            <Autocomplete
              value={
                formData.assignedTo
                  ? get_empbasecompany.find(
                      (e) => e.employee_id === formData.assignedTo,
                    )
                  : null
              }
              disablePortal
              fullWidth
              onChange={(event, value) => {
                if (value === null) {
                  handleChange('assignedTo', '');
                } else {
                  handleChange('assignedTo', value ? value.employee_id : '');
                }
              }}
              // options={['Option 1', 'Option 2', 'Option 3']}
              options={get_empbasecompany}
              getOptionLabel={(option) => option.full_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Assigned To'
                  variant='filled'
                  // onBlur={() => handleBlur('assignedTo')}
                  error={Boolean(errors.assignedTo)}
                  // helperText={errors.assignedTo}
                  // helperText={errors.assignedTo && <Typography variant="body2" color="error">{ERROR_MESSAGES.assignedTo}</Typography>}
                  // required={true}
                />
              )}
            />
          </Grid>

          {dynamicProp.length > 0
            ? dynamicProp.map((prop) => {
                return prop.type === 'List' ? (
                  <>
                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                      }}>
                      <Autocomplete
                        options={prop.properties.options}
                        value={formData.dynamicPropValues[prop.name] || ''}
                        onChange={(event, value) =>
                          handleDynamicPropChange(
                            prop.name,
                            value,
                            prop.properties.required,
                          )
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required={prop.properties.required}
                            label={prop.name}
                            variant='filled'
                            onBlur={() => handleBlur(prop.name)}
                            error={
                              errors?.dynamicPropErrors[prop.name] &&
                              errors.dynamicPropErrors[prop.name] !== null
                                ? true
                                : false
                            }
                            helperText={
                              errors?.dynamicPropErrors[prop.name] &&
                              errors.dynamicPropErrors[prop.name] !== null
                                ? errors.dynamicPropErrors[prop.name]
                                : ''
                            }
                          />
                        )}
                      />
                    </Grid>
                  </>
                ) : prop.type === 'Text Field' ? (
                  <>
                    <Grid
                      size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                      }}>
                      <TextField
                        required={prop.properties.required}
                        value={formData.dynamicPropValues[prop.name] || ''}
                        label={prop.name}
                        fullWidth
                        variant='filled'
                        onBlur={() => handleBlur(prop.name)}
                        onChange={(event) => handleDynamicPropChange(prop.name, event.target.value, prop.properties.required)}
                        error={errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? true : false}
                        helperText={errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? errors.dynamicPropErrors[prop.name] : ''}
                      />
                    </Grid>
                  </>
                ) : prop.type === 'Date' ?
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DatePicker 
                        label={prop.name}
                        value={formData.dynamicPropValues[prop.name] ? moment(formData.dynamicPropValues[prop.name]) : null}
                        required={prop.properties.required}
                        onChange={(e) => {
                          if(e?._d){
                            handleDynamicPropChange(prop.name, moment(e._d).format(prop.properties.dateFormat), prop.properties.required)
                          }
                          else{
                            handleDynamicPropChange(prop.name, null, prop.properties.required)
                          }
                        }}
                        slotProps={{ textField: { fullWidth: true, variant: 'filled', required: prop.properties.required, error: errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? true : false, helperText: errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? errors.dynamicPropErrors[prop.name] : '' } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
                : prop.type === 'CheckBox' ? (
                  <>
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
                            checked={formData.dynamicPropValues[prop.name]}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                dynamicPropValues: {
                                  ...formData.dynamicPropValues,
                                  [prop.name]:
                                    !formData.dynamicPropValues[prop.name],
                                },
                              })
                            }
                          />
                        }
                        label={prop.name}
                      />
                    </Grid>
                  </>
                ) : prop.type === 'Radio' ? (
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <FormControl>
                      <FormLabel>{prop.name}</FormLabel>
                      <RadioGroup
                        value={formData.dynamicPropValues[prop.name]}
                        onChange={(event) =>
                          handleDynamicPropChange(
                            prop.name,
                            event.target.value,
                            false,
                          )
                        }
                      >
                        {prop.properties.options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </>
                ) : prop.type === 'Text Area' ? 
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <TextField 
                      fullWidth
                      required={prop.properties.required}
                      value={formData.dynamicPropValues[prop.name] || ''}
                      label={prop.name}
                      variant='filled'
                      multiline={true}
                      onBlur={() => handleBlur(prop.name)}
                      onChange={(event) => handleDynamicPropChange(prop.name, event.target.value, prop.properties.required)}
                      error={errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? true : false}
                      helperText={errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? errors.dynamicPropErrors[prop.name] : ''}
                    />
                  </Grid>

                </>
                : prop.type === 'Time' ? 
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                        <TimePicker 
                          label={prop.name}
                          value={formData.dynamicPropValues[prop.name] ? moment(formData.dynamicPropValues[prop.name]) : null}
                          onChange={(e) => {
                            if(e?._d){
                              handleDynamicPropChange(prop.name, moment(e._d).format(prop.properties.timeFormat), prop.properties.required)
                            }
                            else{
                              handleDynamicPropChange(prop.name, null, prop.properties.required)
                            }
                          }}
                          slotProps={{ textField: { required: prop.properties.required, variant: 'filled', fullWidth: true, error: errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? true : false, helperText: errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? errors.dynamicPropErrors[prop.name] : '' } }}
                        />
                    </LocalizationProvider>
                  </Grid>
                </>
                :prop.type === 'Date & Time' ?
                <>
                  <Grid
                    size={{
                      lg: 3,
                      md: 4,
                      sm: 4,
                      xs: 12
                    }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                      <DateTimePicker 
                      label={prop.name}
                      value={formData.dynamicPropValues[prop.name] ? moment(formData.dynamicPropValues[prop.name]) : null}
                      onChange={(e) => {
                        if(e?._d){
                          handleDynamicPropChange(prop.name, moment(e._d).format(prop.properties.dateTimeFormat), prop.properties.required)
                        }
                        else{
                          handleDynamicPropChange(prop.name, null, prop.properties.required)
                        }
                      }}
                      slotProps={{ textField: { required: prop.properties.required, variant: 'filled', fullWidth: true, error: errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? true : false, helperText: errors?.dynamicPropErrors[prop.name] && errors.dynamicPropErrors[prop.name] !== null ? errors.dynamicPropErrors[prop.name] : '' } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </>
                : null;
              })
            : null}

          <Grid
            sx={{mt: 2, p: 5}}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <div onChange={handleImageChange}>
              <AttachmentField
                Asset='asset'
                previews={image}
                setPreviews={setImage}
                handleImageDelete={handleImageDelete}
              />
              <Typography color='error'>
                {errors.image === null ? '' : errors.image}
                {/* {image.length > 6 ? 'Maximum 6 images allowed.' : ''} */}
              </Typography>
            </div>
          </Grid>

          {
            props.status !== 'edit' && 

            <>
          
            <AssetWarranty
              type='new'
              valueChange={handlePropWarrantyChange}
              imageChange={handlePropWarrantyImageChange}
        
            />
          
        
          <InsuranceForm 
            type='assetInsuranceNewForm' 
            valueChange={handlePropValueChange} 
            propChange = {handlePropValidate}
            imageChange={(value) => handlePropImageChange('insuranceImage', value)} 
            valuePropsChange = {handlePropsChange}
            formData={formData} 
           />
          
           <ServiceDueForm
              type = 'assetServiceDueNewForm'
              valueChange={handlePropValueChange}
            />
</>
}
          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Grid container justifyContent='flex-end' spacing={2}>
              <Grid>
                <Button
                  type='cancel'
                  style={{marginTop: '20px'}}
                  onClick={() => props.handleFormClose(null)}
                  variant='contained'
                  color='secondary'
                  align='center'
                >
                  cancel
                </Button>
              </Grid>

              <Grid>
                <Button
                  type='submit'
                  onClick={handleSubmit}
                  style={{marginTop: '20px'}}
                  color='primary'
                  variant='contained'
                  align='right'
                  // style={{ marginTop: '20px' }}
                >
                  submit
                </Button>
              </Grid>
            </Grid>
          </Grid> */}
        </Grid>
      </Card>
    </>
  );
};


export default AssetManagement;
