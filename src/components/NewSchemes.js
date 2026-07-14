import React, {useState, useEffect, useRef, useContext} from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import _ from 'lodash';
import UnSavedChangesWarning from '../pages/common/unChangeswarning';
import CancelDialog from './CancelDialog';
// import {formLabelsTheme} from "./Asterisk";
import {
  Button,
  TextField,
  Typography,
  Grid,
  Autocomplete,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
  IconButton,
  Card,
  Box,
} from '@mui/material';
import {removeDuplicateObjectFromArray} from './common';
import {getTrimmedData} from './trimFunction/index';
import {getDateTime} from '../utils/getTimeFormat';
import moment from 'moment';
import AppHeader from '@crema/core/AppLayout/DefaultLayout/AppHeader';
import apiCalls from 'utils/apiCalls';
import { useDispatch, useSelector } from 'react-redux';
import { getInboxAction } from 'redux/actions/message_actions';
import context from '../context/CreateNewButtonContext'
import { listProductAction } from 'redux/actions/product_actions';
import { filterOptions } from 'utils/searchFunc';
import NewSchemeProductList from './NewSchemesProductList'
import { listVendorIdAndNameAction } from 'redux/actions/vendor_actions';
import {Add} from '@mui/icons-material';
import { schemesStatusAction } from 'redux/actions/schemes_actions';
import {ExistAlert} from 'redux/actions/load';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer';
// const ListItem = styled('li')(({ theme }) => ({
//     margin: theme.spacing(0.5),
//   }));

function NewSchemes(props) {
  const [formValues, setFormValues] = useState({
    scheme_name: null,
    doc_id: null,
    brand: null,
    products: [],
    fromDate: moment(),
    toDate: moment(),
    // target: null,
    // award: null,
    notes: null,
    description: null,
    target_status: 'total',
    supplier_id: null,
  });
  const [formErrors, setFormErrors] = useState({
    scheme_name: null,
    doc_id: null,
    brand: null,
    // products: null,
    fromDate: null,
    toDate: null,
    // target: null,
    // award: null,
    target_status: null,
    supplier_id: null,
  });
  const [requiredFields] = useState([
    'scheme_name',
    'doc_id',
    'brand',
    // 'products',
    'fromDate',
    'toDate',
    // 'target',
    // 'award',
    'target_status',
    'supplier_id',
  ]);
  const [status, setStatus] = useState('')
  const [regex] = useState({});
  const [Prompt, setDirty, setPristine] = UnSavedChangesWarning();
  const [initialState, setInitialState] = useState({});
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(false);
  const [checkVal, setCheckVal] = useState()
  const [productData, setProductData] = useState([])
  const tempinitsform = useRef(null);
  const tempinits = useRef(null);
  const tempempty = useRef(null);
  const {
    setModalStatusHandler,
    setModalTypeHandler,
    selectData,
    setselectData,
    setLoaderStatusHandler,
    locationId,
    headerLocationId,
    commoncookie,
  } = useContext(context);
  const dispatch = useDispatch();
  const { 
    productReducer: {product},vendorReducer: { vendorIdAndName: vendor },schemesReducer:{getSchemesStatus}
  } = useSelector((state) => state);


  const empty = () => {
    if (!_.isEmpty(props.edit_id_data)) {
      setFormValues(props.edit_id_data[0]);
      setInitialState(props.edit_id_data[0]);
      setStatus('edit')
    }
  };
  tempempty.current = empty;
  useEffect(() => {
    tempempty.current();
  }, [props.edit_id_data]);
  
  // const {
  //   setModalTypeHandler,
  //   setLoaderStatusHandler,} = useContext(context);

    useEffect(() => {
        if (!product.length) {
            dispatch(listProductAction(setModalTypeHandler, setLoaderStatusHandler));
        }
        apiCalls(
          setModalTypeHandler,
          setLoaderStatusHandler,
          dispatch(listVendorIdAndNameAction()),
        )
    }, [])

    useEffect (() => {
      if (selectData.NewVendor === true) {     
        const filter = [...vendor];
        const popc = filter[0]?.supplier_id;
        setStateHandler('supplier_id',  popc);
        setModalStatusHandler(false);
        setselectData('NewVendor', false);
      }
    },[selectData.NewVendor])

  const initsform = () => {
    setInitialState(formValues);
  };
  tempinitsform.current = initsform;
  useEffect(() => {
    tempinitsform.current();
  }, []);

  const inits = () => {
    if (JSON.stringify(initialState) !== JSON.stringify(formValues)) {
      setDirty();
      setForm(true);
    } else {
      setPristine();
      setForm(false);
    }
  };
  tempinits.current = inits;
  useEffect(() => {
    tempinits.current();
  }, [formValues, initialState]);

  const handleChange = async (e) => {
    let { name, value } = e.target;
    
    
    if(name !== '') {
      setStateHandler(name, value);
    }
  };

  const cancel = () => {
    setDialog(false);
  };

  const validClose = () => {
    setDialog(true);
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

  const validationHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (
      requiredFields.includes(name) &&
      (value === null ||
        // value === [] ||
        value === 'null' ||
        value === '' ||
        value === false ||
        
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      } else {
        setFormErrors({
          ...formErrors,
          [name]: null,
        });
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

  const handleChildStateChange = (newState) => {
    setFormValues((prev) => ({ ...prev, products : newState }));
  };


  const handleSubmit = async (event) => {

    event.preventDefault();
    let isValid = true;
    let formErrorsObj = {...formErrors};
    await Object.keys(formValues).map((key, i) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '')
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      else if(formValues.products.length === 0){
        isValid = false
        formErrorsObj.products = 'Select any one products!'
      }
      return null;
    });
    await setFormErrors(formErrorsObj);

    // API call..
    if (isValid) {
      props.handleSubmit(getTrimmedData(formValues));
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  };

  const updateProduct = () => {
    return props.edit_id_data[0].products.map((p, i) => {
      return product.filter((f) => {
        if (f.item_id === p.product_id) {
          return f;
        }
        return null;
      })[0];
    });
  };
  

  return (
    <div>
      <Card sx={{ p: '20px', width: '100%',  height: 'calc(100vh - 80px) !important', minHeight: '100%', overflow: 'auto' }}>
     {/* <AppHeader hidden={false} /> */}
     {Prompt}

     <Typography variant='h6' align='left' style={{paddingBottom: '20px'}}>
       {!_.isEmpty(props.edit_id_data)
         ? `Edit Scheme - ${props.edit_id_data[0].id}`
         : 'New Schemes'}
     </Typography>

     <Grid
       spacing={3}
       // justifyContent = 'center'
       // alignContent = 'center'
       // lg={12}
       // md={12}
       // sm={12}
       // xs={12}
       container
       direction='row'
       //
     >
       <Grid
         size={{
           lg: 12,
           md: 12,
           sm: 12,
           xs: 12
         }}>
       <Grid container spacing={3}>
       <Grid
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           required={true}
           style={{}}
           fullWidth={true}
           placeholder=' Enter Scheme Name'
           label='Scheme Name'
           name='scheme_name'
           value={
             formValues.scheme_name === null ? '' : formValues.scheme_name
           }
           color='primary'
           multiline={false}
           type='text'
           regex=''
           variant='filled'
           error={formErrors.scheme_name === null ? false : true}
           helperText={
             formErrors.scheme_name === null ? '' : 'Scheme Name is Required!'
           }
         />
       </Grid>
       <Grid
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           required={true}
           style={{}}
           fullWidth={true}
           placeholder=' Scheme ID'
           label='Scheme ID'
           name='doc_id'
           value={formValues.doc_id === null ? '' : formValues.doc_id}
           color='primary'
           multiline={false}
           type='text'
           regex={null}
           variant='filled'
           error={formErrors.doc_id === null ? false : true}
           helperText={formErrors.doc_id === null ? '' : 'Scheme ID is Required!'}
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
           id='combo-box-demo'
           name='supplier_id'
           required={true}
           value={!_.isEmpty(props.edit_data) ? vendor
             .find((d) => formValues.supplier_id === d.supplier_id ) || {company_name: ''} : formValues.supplier_id !== null ? vendor
             .find((d) => formValues.supplier_id === d.supplier_id ) || {company_name : ''} :{company_name:''}}
           onChange={(e,val)=>handleChange({target:{name :'supplier_id',value:val !== null ? val.supplier_id : null}})}
           // onBlur={handleBlur}
       
           // disabled={props.returnState}
           options={vendor
             .filter((d) => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name !== null)}
           getOptionLabel={(option) => option.company_name}
           renderInput={(params) => {
             const get = {...params};

             get.InputProps = {
               ...params.InputProps,
               startAdornment: (
                 <Tooltip title='Create New'>
                   <IconButton
                     size='small'
                     onClick={() => {
                       setModalStatusHandler(true);
                       setModalTypeHandler('NewVendor');
                     }}
                   >
                     <Add fontSize='small' />
                   </IconButton>
                 </Tooltip>
               ),
             };

             return (
               <TextField
                 {...get}
                 label='Vendor'
                 placeholder='Select Vendor'
                 error={formErrors.supplier_id}
                 helperText={formErrors.supplier_id === null ? '' : 'Vendor is Required!'}
                 fullWidth={true}
                 required={true}
                 variant='filled'
               />
             );
           }}
         />
       </Grid>

       {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
         <Autocomplete
           limitTags={2}
           fullWidth={true}
           defaultValue={
             !_.isEmpty(props.edit_id_data)
               ? product.filter(
                   (s) => s.brand === props.edit_id_data[0].brand,
                 )[0]
               : {}
           }
           id='multiple-limit-tags'
           options={removeDuplicateObjectFromArray(product, 'brand')}
           getOptionLabel={(option) => (option.brand ? option.brand : '')}
           onChange={(e, v, r) =>{
           if(v !== null){
             setFormValues({ ...formValues, brand: v?.brand })
             setFormErrors({...formErrors, brand: null})
           } 
           if(r == "clear"){
             setFormValues({ ...formValues, brand: null });
             validationHandler("brand", '');         
           }
           }
           }
           // error={formErrors.brand === false ? false : true}
           // helperText={formErrors.brand === null ? '' : formErrors.brand}
           renderInput={(params) => (
             <TextField
               {...params}
               variant='filled'
               required={true}
               label='Brand'
               // name='brand'
               placeholder='Choose the product'
               fullWidth={true}
               error={formErrors.brand === null ? false : true}
               helperText={formErrors.brand === null ? '' : formErrors.brand}
             />
           )}
         />
       </Grid> */}

       {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
         <Autocomplete
           multiple
           disabled={
             formValues.brand !== null && formValues.brand !== ''
               ? false
               : true
           }
           // value={formValues.products === null ? "" : formValues.products}
           // value={{brand:formValues.brand}}
           limitTags={2}
           // name='products'
           fullWidth={true}
           defaultValue={!_.isEmpty(props.edit_id_data) ? updateProduct() : []}
           id='multiple-limit-tags'
           options={product.filter((f) => {
             return f.brand === formValues.brand;
           })}
           getOptionLabel={(option) => option?.name}
           // filterOptions={filterOptions}
           onChange={(e, v) =>{
             if(v !== null && v.length > 0){
               setFormValues({
                 ...formValues,
                 products: v.map(i => ({ product_id: i.item_id })),
               })
             }
             // if(v.length === 0){
             //   setFormValues({...formValues,products: []})
             // }
           }}
           onBlur={handleChange}

           renderInput={(params) => (
             <TextField
               {...params}
               variant='filled'
               required={true}
               label='Products'
               // name='Products'
               placeholder='Products'
               fullWidth={true}
               error={formErrors.products === null ? false : true}
               helperText={
                 formErrors.products === null ? '' : formErrors.products
               }
             />
           )}
         />
       </Grid> */}

<Grid
 size={{
   lg: 3,
   md: 4,
   sm: 6,
   xs: 12
 }}>
         <Autocomplete
           value={formValues.brand === null ? '' : formValues.brand}
           name = 'brand'
           onChange={(e, v, r) =>{
             if(v !== null){
               setFormValues({ ...formValues, brand: v?.brand })
               setFormErrors({...formErrors, brand: null})
             } 
             if(r == "clear"){
               setFormValues({ ...formValues, brand: null });
               validationHandler("brand", '');         
             }
             }
           }
           
           id='free-solo-dialog-demo'
           options={_.uniqBy(product, 'brand')}
           getOptionLabel={(option) => {
             if (typeof option === 'string') {
               return option;
             }
             if (option.inputValue) {
               return option.inputValue;
             }
             return option.brand;
           }}
           selectOnFocus
           clearOnBlur
           handleHomeEndKeys
           freeSolo
           renderInput={(params) => (
             <TextField
               {...params}
               label='Brand'
               variant='filled'
               error={formErrors.brand === null ? false : true}
               helperText={formErrors.brand === null ? '' : formErrors.brand}
               required={true}
               name = 'brand'
             />
           )}
         />
       </Grid>

       <Grid
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <LocalizationProvider dateAdapter={DateAdapter}>
           <DatePicker
           // name='from'
             // // inputFormat='DD/MM/yyyy'
             slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
             label='From'
             value={toMomentOrNull(formValues.fromDate)}
             format="DD/MM/YYYY"
             onChange={(e) => {
               setStateHandler('fromDate', moment(e._d).format("YYYY-MM-DDTHH:mm:ss"));
             }}
             views={['year', 'month', 'day']}
           />
         </LocalizationProvider>
       </Grid>
       <Grid
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <LocalizationProvider dateAdapter={DateAdapter}>
           <DatePicker
           // name='to'
           // // inputFormat='DD/MM/yyyy'
             slotProps={{ textField: { fullWidth: true, variant: 'filled' } }}
             value={toMomentOrNull(formValues.toDate)}
             // inputFormat="DD/MM/yyyy"
             onChange={(e) => {
               setStateHandler('toDate',moment(e._d).format("YYYY-MM-DDTHH:mm:ss"));
             }}
             views={['year', 'month', 'day']}
             label='To'
           />
         </LocalizationProvider>
       </Grid>
       {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           required={true}
           style={{}}
           fullWidth={true}
           placeholder=' Enter Target'
           label='Enter target'
           name='target'
           value={formValues.target === null ? '' : formValues.target}
           color='primary'
           multiline={false}
           type='number'
           regex=''
           variant='filled'
           error={formErrors.target === null ? false : true}
           helperText={formErrors.target === null ? '' : formErrors.target}
         />
       </Grid> */}
       <Grid
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <FormControl component='fieldset' style={{paddingTop: '15px'}}>
           {/* <FormLabel component="legend">Gender</FormLabel> */}
           <RadioGroup
             row
             aria-label='customer'
             value={formValues.target_status}
             name='target_status'
             onChange={handleChange}
           >
             <FormControlLabel value='each' control={<Radio />} label='Each' />
             <FormControlLabel
               value='total'
               control={<Radio />}
               label='Total'
             />
           </RadioGroup>
         </FormControl>
       </Grid>
       {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           required={true}
           style={{}}
           fullWidth={true}
           placeholder=' Scheme Award'
           label='Scheme Award'
           name='award'
           value={formValues.award === null ? '' : formValues.award}
           color='primary'
           multiline={false}
           type='number'
           regex=''
           variant='filled'
           error={formErrors.award === null ? false : true}
           helperText={formErrors.award === null ? '' : formErrors.award}
         />
       </Grid> */}
       <Grid
         align='Left'
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           multiline={true}
           style={{}}
           fullWidth={true}
           placeholder=' Enter Notes'
           label='Enter Notes'
           name='notes'
           value={formValues.notes === null ? '' : formValues.notes}
           color='primary'
           type='text'
           regex=''
           variant='filled'
         />
       </Grid>
       <Grid
         size={{
           lg: 3,
           md: 4,
           sm: 6,
           xs: 12
         }}>
         <TextField
           onChange={handleChange}
           onBlur={handleChange}
           multiline={true}
           fullWidth={true}
           placeholder=' Enter Description'
           label='Enter Description'
           name='description'
           value={
             formValues.description === null ? '' : formValues.description
           }
           color='primary'
           type='text'
           regex=''
           variant='filled'
         />
       </Grid>
       

       {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
         <Autocomplete
           limitTags={2}
           fullWidth={true}
           // defaultValue={
           //   !_.isEmpty(props.edit_id_data)
           //     ? product.filter(
           //         (s) => s.brand === props.edit_id_data[0].brand,
           //       )[0]
           //     : product.filter(
           //       (s) => s.brand === props.edit_id_data[0].brand,
           //     )[0]
           // }
           defaultValue={
             Object.keys(props.edit_id_data).length
               ? product.filter(
                   (s) => s.brand === props.edit_id_data[0].brand,
                 )[0]
               : {}
           }
           // defaultValue={
           //   !_.isEmpty(formValues.brand)
           //     ? product.filter(
           //         (s) => s.brand === formValues.brand,
           //       )[0]
           //     : {}
           // }
           // value={!_.isEmpty(props.edit_id_data)
           //   ? product.filter(
           //       (s) => s.brand === props.edit_id_data[0].brand,
           //     )[0]
           //   : {}}
           id='multiple-limit-tags'
           // options={removeDuplicateObjectFromArray(product, 'brand')}
           options={_.uniqBy(product, 'brand')}
           getOptionLabel={(option) => (option.brand ? option.brand : '')}
           onChange={(e, v, r) =>{
           if(v !== null){
             setFormValues({ ...formValues, brand: v?.brand })
             setFormErrors({...formErrors, brand: null})
           } 
           if(r == "clear"){
             setFormValues({ ...formValues, brand: null });
             validationHandler("brand", '');         
           }
           }
           }
           // error={formErrors.brand === false ? false : true}
           // helperText={formErrors.brand === null ? '' : formErrors.brand}
           renderInput={(params) => (
             <TextField
               {...params}
               variant='filled'
               required={true}
               label='Brand'
               // name='brand'
               placeholder='Choose the product'
               fullWidth={true}
               error={formErrors.brand === null ? false : true}
               helperText={formErrors.brand === null ? '' : formErrors.brand}
             />
           )}
         />
       </Grid> */}


             <Grid
               size={{
                 lg: 12,
                 md: 12,
                 sm: 12,
                 xs: 12
               }}>
               <Box
                 sx={{
                   '& .MuiPaper-root, & .MuiBox-root, & .MuiTable-root, & .MuiGrid-root': {
                     border: 'none !important',
                     boxShadow: 'none !important',
                   },
                 }}
               >
         <NewSchemeProductList product={product} productList={formValues.products} brand={formValues.brand} onStateChange={handleChildStateChange} edit_id_data={props.edit_id_data} status={status}/>
         <Typography color = 'error' sx={{ fontSize: '12px' }}>{formErrors.products || ''}</Typography>
         </Box>
       </Grid>

       </Grid>
       </Grid>

       {/* <Grid size={{ xs: 2, sm: 2, md: 2, lg: 2 }}></Grid> */}

       <Grid
         size={{
           lg: 12,
           md: 12,
           sm: 12,
           xs: 12
         }}>
         <Grid
           spacing={7}
           // lg={12}
           // md={12}
           // sm={12}
           // xs={12}
           //
           container
           direction='row'
           display= 'flex'
           justifyContent= 'flex-end'
           paddingTop= '25px'
         >
           <Grid>
             {form === false ? (
               <Button
                 onClick={() => props.handleClose()}
                 style={{}}
                 name='Cancel'
                 variant='contained'
                 color='secondary'
                 size='medium'
                 text='button'
                 fullWidth={false}
                 type='cancel'
               >
                 Cancel
               </Button>
             ) : (
               <Button
                 onClick={() => validClose()}
                 style={{}}
                 name='Cancel'
                 variant='contained'
                 color='secondary'
                 size='medium'
                 text='button'
                 fullWidth={false}
                 type='cancel'
               >
                 Cancel
               </Button>
             )}
           </Grid>

           <Grid>
             <Button
               onClick={handleSubmit}
               style={{}}
               name='SUBMIT'
               variant='contained'
               color='primary'
               size='medium'
               text='button'
               fullWidth={false}
               type='submit'
             >
               Submit
             </Button>
           </Grid>
         </Grid>
       </Grid>
     </Grid>
     <CancelDialog
       handle={cancel}
       delete={dialog}
       close={props.handleClose}
     ></CancelDialog>
     </Card>
    </div>
  );
}
export default NewSchemes;
