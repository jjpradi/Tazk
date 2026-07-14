import React, {useState, useEffect, useRef, useContext} from 'react';
import {Grid} from '@mui/material';
import {Button} from '@mui/material';
import {TextField} from '@mui/material';
import {listUserCreationAction} from 'redux/actions/userCreation_actions';
import {useSelector, useDispatch} from 'react-redux';
import userCreation_services from 'services/userCreation_services';
import {setDate} from 'date-fns';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import {spacing} from '@mui/system';
import {updateUsercreationallAction} from 'redux/actions/userCreation_actions';
import {green} from '@mui/material/colors';
import {Autocomplete} from '@mui/material';
import {Padding} from '@mui/icons-material';
import {emailValidation, passwordValidation, phoneValidation} from 'components/regexFunction';
import { Cities } from 'utils/cities';
import { getLocationDataBasedOnPincode } from 'components/common';
import {base_url} from '../../../../../../http-common';
import {Close, FileUpload} from '@mui/icons-material'
import _ from 'lodash';
import apiCalls from 'utils/apiCalls';


function MyAccount(props) {
  const textRef = useRef(null);
  const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(CreateNewButtonContext);

  const [imgName, setImgName] = useState('');
  const [imgType, setImgType] = useState(null);
  const [imageStatus, setimageStatus] = useState(false);
  const dispatch = useDispatch();
  const userCreation = useSelector(
    (state) => state.UserCreationReducer.createUser,
  );
  useEffect(() => {
    dispatch(listUserCreationAction());
  }, []);
  useEffect(() => {
    const Detail = userCreation.find((emp) => {
      return emp.employee_id === commoncookie;
    });
    if (Detail !== undefined) {
      setFormValues(
        Detail,
        // {
        // first_name:Detail.first_name,
        // last_name:Detail.last_name,
        // phone_number:Detail.phone_number,
        // email:Detail.email,
        // alternate_phone_number:Detail.alternate_phone_number,
        // address:Detail.address,
        // area:Detail.area,
        // zip:Detail.zip,
        // person_id:Detail.person_id

        //}
      );
      setImgName('Images')
  // setImgName( Detail?.pic_filename.split('/')[2].slice(0, 10) + '...');
  setimageStatus(true)
    }
  }, [userCreation.length]);
  const sample = (value) => {};
//---
const validationHandler = (name, value) => {

  if (!Object.keys(formErrors).includes(name)) return;

  if (name === 'location_id' && value.length > 0) {
    setFormErrors({
      ...formErrors,
      ['location_id']: null,
    });
  }
  if (name === 'location_id' && value.length === 0) {
    setFormErrors({
      ...formErrors,
      ['location_id']: capitalize('location_id') + ' is Required!',
    });
    return;
  }

  if (
         requiredFields.includes(name) &&
        (value === null ||
          value === 'null' ||
          value === '' ||
          value === false ||
          (Object.keys(value) && value.value === null))
      
  ) {
    setFormErrors({
      ...formErrors,
      [name]: capitalize(name) + ' is Required!',
    });
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
  } else if (name === 'phone_number') {
    if (phoneValidation(value) !== true) {
      setValidRegex({...validRegex, phone_number: false});
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Invalid!',
      });
    } else if (
      formValues.alternate_phone_number !== null &&
      formValues.alternate_phone_number !== '' &&
      formValues.alternate_phone_number === value
    ) {
      setValidRegex({...validRegex, phone_number: false});
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Should be unique',
      });
    } else if (
      formValues.alternate_phone_number !== value &&
      formValues.alternate_phone_number !== null &&
      formValues.alternate_phone_number !== ''
    ) {
      if (phoneValidation(formValues.alternate_phone_number) === false) {
        setUnValidRegex({...unvalidRegex, alternate_phone_number: false});

        setFormErrors({
          ...formErrors,
          ['alternate_phone_number']:
            capitalize('alternate_phone_number') + ' is Invalid!',
          phone_number: null,
        });
      } else {
        setUnValidRegex({...unvalidRegex, alternate_phone_number: true});
        setFormErrors({
          ...formErrors,
          ['alternate_phone_number']: null,
          phone_number: null,
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      setValidRegex({...validRegex, phone_number: true});
    }
  } else if (name === 'alternate_phone_number') {
    if (value !== '') {
      if (phoneValidation(value) !== true) {
        setUnValidRegex({...unvalidRegex, alternate_phone_number: false});
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else if (
        formValues.phone_number !== null &&
        formValues.phone_number !== '' &&
        formValues.phone_number === value
      ) {
        setUnValidRegex({...unvalidRegex, alternate_phone_number: false});
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Should be unique',
        });
      } else if (
        formValues.phone_number !== value &&
        formValues.phone_number !== null &&
        formValues.phone_number !== ''
      ) {
        if (phoneValidation(formValues.phone_number) === false) {
          setValidRegex({...validRegex, phone_number: false});

          setFormErrors({
            ...formErrors,
            ['phone_number']: capitalize('phone_number') + ' is Invalid!',
            alternate_phone_number: null,
          });
        } else {
          setValidRegex({...validRegex, phone_number: true});
          setFormErrors({
            ...formErrors,
            ['alternate_phone_number']: null,
            phone_number: null,
          });
        }
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setUnValidRegex({...unvalidRegex, alternate_phone_number: true});
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      // setUnValidRegex({...unvalidRegex, alternate_phone_number:true})
    }
  } else if (name === 'password') {
    if (props.status !== 'edit') {
      if (passwordValidation(value) !== false) {
        setValidRegex({...validRegex, password: true});
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
        setValidRegex({...validRegex, password: false});
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
      seteditValidRegex({...editvalidRegex, password: false});
    }
  } else {
    setFormErrors({
      ...formErrors,
      [name]: null,
    });
  }
};



  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const update = async () => {
    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        key === 'phone_number' &&
        phoneValidation(formValues['phone_number']) === false
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' invalid!';
      } else if (
        key === 'email' &&
        emailValidation(formValues['email']) === false
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' invalid!';
      } else if (
        key === 'alternate_phone_number' &&
        formValues[key] !== null &&
        phoneValidation(formValues['alternate_phone_number']) === false
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' invalid!';
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    if (isValid) {
      apiCalls(
        setModalTypeHandler,
        setLoaderStatusHandler,
        dispatch(
          updateUsercreationallAction(
            formValues.person_id,
            formValues,
            setModalTypeHandler,
            setLoaderStatusHandler,
            sample,
          ),
        )
      )
    }
  };

  const uploadedImage = React.useRef(null);
  const imageUploader = React.useRef(null);
  // const [data,setdata]=useState([]);

  const [validRegex, setValidRegex] = useState({
    email: false,
    phone_number: false,
    password: false,
  });

  const [editvalidRegex, seteditValidRegex] = useState({
    email: false,
    phone_number: false,
  });

  const [unvalidRegex, setUnValidRegex] = useState({
    alternate_phone_number: true,
  });

  const [formValues, setFormValues] = useState({
    first_name: null,
    last_name: null,
    gender: null,
    phone_number: null,
    alternate_phone_number: null,
    designation: null,
    email: null,
    address: null,
    area: null,
    zip: null,
    person_id: null,
    city: null,
    state: null,
    pic_filename: null,
  });
  // const [] = useState({
  //   first_name: null,
  //   gender: null,
  //   phone_number: null,
  //   alternate_phone_number: null,
  //   designation: null,
  //   email: null,
  //   address: null,
  //   area: null,
  //   zip: null,
  //   city: null,
  //   state: null,
  // });
  const [requiredFields] = useState([
    'first_name',
    'gender',
    'phone_number',
    'email',
    'address',
    'area',
    'zip',
    'state',
    'city',
    'username',
    'password',
    'role_id',
    'location_id',
  ]);
  const [formErrors, setFormErrors] = useState({
    first_name: null,
    gender: null,
    phone_number: null,
    alternate_phone_number: null,
    designation: null,
    email: null,
    address: null,
    area: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    username: null,
    password: null,
    role_id: null,
    location_id: null,
  });
  const [required] = useState([
    'first_name',
    'phone_number',
    'address',
    'email',
    'zip',
  ]);

  const handleChange = async (e) => {
    let {name, value} = e.target;
    setStateHandler(name, value);    
    if (name === 'zip') {
      // if (value.length === 6) 
      //{
      //   const locationData = await getLocationDataBasedOnPincode(value);
      //   const {county, state} = locationData;
      //   if (county && state) {
      //     textRef.current.focus();
      //     setFormValues({...formValues, zip: value, city: county, state});
      //   }
      // }
    }
  };
  

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };

    await setFormValues(formObj);
     validationHandler(name, value);
  };
  const handleImageUpload = (e) => {
    const [file] = e.target.files;
    if (file) {
      const reader = new FileReader();
      const {current} = uploadedImage;
      current.file = file;
      reader.onload = (e) => {
        current.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  function encodeImageFileAsURL(element) {
    var file = element.target.files[0];
    // var name = element.target.files[0].name;
    if (file) {
      if (imgName !== file.name) {
        setImgName(file.name);
        setImgType(file.type);
      }
    }
    setFormValues({...formValues, pic_filename: element.target.files[0]});
    var reader = new FileReader();
    reader.onloadend = function () {
      setFormValues({...formValues, pic_filename: reader.result});
      setimageStatus(false);
    };
    reader.readAsDataURL(file);
  }
  function deleteFile(e) {
    setFormValues({...formValues, pic_filename: null});
    setImgName('');
    setImgType(null);
  }
  



  return (
    <div>
      <h1>My Profile</h1>
      <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderSpacing:"10px"
    }}
  >
      <label htmlFor='contained-button-file'>
          <input
            style={{display: 'none'}}
            accept='image/*'
            id='contained-button-file'
            type='file'
            name='pic_filename'
            onChange={encodeImageFileAsURL}
            // onChange = {handleChange}
          />
          <Button
            style={{}}
            variant='contained'
            color='primary'
            component='span'
            required={true}
          >
            {imgName === '' ? 'Image Upload' : imgName}
            <FileUpload />
          </Button>
        </label>
        {imgName === '' ? (
          ''
        ) : (
          <>
            <span>
              <img
                style={{width: '60px', height: '60px'}}
                src={
                  imageStatus
                    ? `${base_url}${formValues.pic_filename}`
                    : formValues.pic_filename
                }
                alt=''
              />
            </span>
            <Close onClick={deleteFile} />
          </>
        )}

        <div style={{color: 'red', fontSize: '15px'}}>
          {imgType === null ||
          imgType === 'image/jpeg' ||
          imgType === 'image/png'
            ? ''
            : 'Invalid Image Format'}
        </div>
    {/* <input
      type="file"
      accept="image/*"
      onChange={encodeImageFileAsURL}
      ref={imageUploader}
      style={{
        display: "none"
      }}
    />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderSpacing: '10px',
      }}
    >
      <input
        type='file'
        accept='image/*'
        onChange={handleImageUpload}
        ref={imageUploader}
        style={{
          display: 'none',
        }}
      />
      <div
        style={{
          height: '80px',
          width: '80px',
          border: '1px dashed black',
        }}
        onClick={() => imageUploader.current.click()}
      >
        <img
          ref={uploadedImage}
          style={{
            width: '100%',
            height: '100%',
            position: 'acsolute',
          }}
        />
      </div>
      <h6> Click to upload Image </h6>
    </div>
    {/* <div
    <h6> Click to upload Image </h6> */}
    </div>
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
          > */}
      <br /><br />
      <Grid spacing={3} container direction='row'>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
               onChange={handleChange}
               onBlur={handleChange}
               required={true}
               fullWidth={true}
               placeholder='First Name'
               name='first_name'
               value={formValues.first_name === null ? '' : formValues.first_name}
               color='primary'
               type='text'
               regex=''
               variant='filled'
               error={formErrors.first_name === null ? false : true}
               helperText={
                 formErrors.first_name === null ? '' : formErrors.first_name
               }
             />
           </Grid>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
               onChange={handleChange}
               onBlur={handleChange}
               fullWidth={true}
               style={{}}
               placeholder='Last Name'
               name='last_name'
               value={formValues.last_name === null ? '' : formValues.last_name}
               color='primary'
               type='text'
               regex=''
               variant='filled'
               // error={formErrors.last_name === null ? false : true}
               // helperText={
               //   formErrors.last_name === null ? '' : formErrors.last_name
               // }
             />
           </Grid>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
               onChange={handleChange}
               onBlur={handleChange}
               fullWidth={true}
               onWheel={ (e) => e.target.blur()}
               required={true}
               style={{}}
               placeholder='Phone Number'
               name='phone_number'
               value={
                 formValues.phone_number === null ? '' : formValues.phone_number
               }
               color='primary'
               type='number'
               variant='filled'
               error={formErrors.phone_number === null ? false : true}
               helperText={
                 formErrors.phone_number === null ? '' : formErrors.phone_number
               }
             />
           </Grid>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
               style={{}}
               fullWidth={true}
               onWheel={ (e) => e.target.blur()}
               onChange={handleChange}
               onBlur={handleChange}
               placeholder='Office Phone Number'
               name='alternate_phone_number'
               value={
                 formValues.alternate_phone_number === null
                   ? ''
                   : formValues.alternate_phone_number
               }
               color='primary'
               type='number'
               variant='filled'
               error={formErrors.alternate_phone_number === null ? false : true}
               helperText={
                 formErrors.alternate_phone_number === null
                   ? ''
                   : formErrors.alternate_phone_number
               }
             />
           </Grid>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
             fullWidth={true}
               required={true}
               onChange={handleChange}
               onBlur={handleChange}
               style={{}}
               placeholder='Email'
               name='email'
               value={formValues.email === null ? '' : formValues.email}
               color='primary'
               type='email'
               variant='filled'
               error={formErrors.email === null ? false : true}
               helperText={formErrors.email === null ? '' : formErrors.email}
             />
           </Grid>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
             fullWidth={true}
               name='address'
               value={formValues.address === null ? '' : formValues.address}
               onChange={handleChange}
               onBlur={handleChange}
               multiline={true}
               placeholder='Address'
               rows={1}
               variant='filled'
               required={true}
               error={formErrors.address === null ? false : true}
               helperText={formErrors.address === null ? '' : formErrors.address}
             />
           </Grid>
           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 8,
               xs: 12
             }}>
             <TextField
               onChange={handleChange}
               onBlur={handleChange}
               fullWidth={true}
               name='area'
               multiline={true}
               placeholder='Area'
               rows={1}
               value={formValues.area === null ? '' : formValues.area}
               variant='filled'
               required={true}
               error={formErrors.area === null ? false : true}
               helperText={formErrors.area === null ? '' : formErrors.area}
             />
           </Grid>

           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 8,
               xs: 12
             }}>
               <Autocomplete
                  fullWidth={true}
                 value={{name: formValues.city === null ? '' : formValues.city}}
                 name='city'
                 onChange={(e, val) =>
                   val !== null
                     ? setFormValues({
                         ...formValues,
                         city: val.name,
                         state: val.state,
                       })
                     : ''
                 }
                 id='free-solo-dialog-demo'
                 options={[...Cities]}
                 getOptionLabel={(city) => city.name}
                 selectOnFocus
                 clearOnBlur
                 handleHomeEndKeys
                 freeSolo
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     label='city'
                     variant='filled'
                     // error={formErrors.city === null ? false : true} helperText={formErrors.city === null ? '' : formErrors.city}
                     required={true}
                   />
                 )}
               />
             </Grid>

             <Grid
               value='one'
               size={{
                 lg: 4,
                 md: 4,
                 sm: 6,
                 xs: 12
               }}>
               <Autocomplete
                  fullWidth={true}
                 name='state'
                 // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.state) : ""}`}
                 value={{state: formValues.state === null ? '' : formValues.state}}
                 options={_.uniqBy(Cities, 'state')}
                 getOptionLabel={(options) => options.state}
                 onChange={(e, v) =>
                   v !== null
                     ? setFormValues({
                         ...formValues,
                         state: v.state,
                         city: '',
                       })
                     : ''
                 }
                 autoHighlight={true}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     label='State'
                     variant='filled'
                     // error={formErrors.state === null ? false : true} helperText={formErrors.state === null ? '' : formErrors.state}
                     required={true}
                   />
                 )}
               />
             </Grid>


           <Grid
             size={{
               lg: 4,
               md: 4,
               sm: 6,
               xs: 12
             }}>
             <TextField
               fullWidth={true}
               onWheel={ (e) => e.target.blur()}
               required={true}
               onChange={handleChange}
               onBlur={handleChange}
               placeholder='PinCode'
               name='zip'
               value={formValues.zip === null ? '' : formValues.zip}
               color='primary'
               type='number'
               regex=''
               variant='filled'
               error={formErrors.zip === null ? false : true}
               helperText={formErrors.zip === null ? '' : formErrors.zip}
             />
           </Grid>
           {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
             <Autocomplete
                 name='state'
                 value={formValues.state === null ? '' : formValues.state}
                 options={_.uniqBy(Cities, 'state')}
                 getOptionLabel={(options) => options.state}
                 onChange={(e, v) =>
                   v !== null
                     ? setFormValues({
                         ...formValues,
                         state: v.state,
                         city: '',
                       })
                     : ''
                 }
                 autoHighlight={true}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     label='State'
                     variant='outlined'
                     // error={formErrors.state === null ? false : true}
                     // helperText={formErrors.state === null ? '' : formErrors.state}
                     // required={true}
                   />
                 )}
               />
     </Grid> */}
         </Grid>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          marginTop: 30,
        }}
      >
        <Button
          onClick={update}
          variant='contained'
          color='primary'
          size='medium'
          text='button'
        >
          Update
        </Button>
      </div>
    </div>
  );
}
export default MyAccount;
