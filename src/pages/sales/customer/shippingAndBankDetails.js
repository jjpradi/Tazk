import React, {useState,  useContext, useEffect} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography} from '@mui/material';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {getLocationDataBasedOnPincode} from '../../../components/common';
import {Cities} from '../../../utils/cities';
import Autocomplete from '@mui/material/Autocomplete';
import _ from 'lodash';
import {Country} from '../../../components/Country_list';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,common_paddingB } from 'utils/pageSize';
import { object } from 'prop-types';
import BankDetailPopup from './bankdetailpopup';
import ShippingDetailPopup from './shippingdetailpopup';
import apiCalls from 'utils/apiCalls';
import { useDispatch } from 'react-redux';
import { shippingdelete } from 'redux/actions/customer_actions';
import context from '../../../context/CreateNewButtonContext';


 

function BankAndShipping(props) {

    const {
      commoncookie,
      setModalTypeHandler,
      setLoaderStatusHandler,
      headerLocationId,
    } = useContext(context);
  const [formValues, setFormValues] = useState({
    company_name: null,
    contactperson_name: null,
    contactperson_num: null,
    Gst: null,
    city: null,
    state: null,
    zip: null,
    country: 'India',
    latitude : null,
    longitude : null,
    address : null,
    area : null,
    first_name: null,
    gender: null,
    email: null,
    phone_number: null
  });

    const dispatch = useDispatch();

  const [bankvalues, setBankValues] = useState ({
    acc_number : null,
    bank_name : null,
    branch : null,
    ifsc_code : null,
    IsPrimary : null
  })

  const [status, setStatus ] = useState('create')

  const [formErrors, setFormErrors] = useState({
    company_name: null,
    contactperson_num: null,
    zip: null,
    state: null,
    city: null,
    address: null,
    area: null,
    first_name: null,
    gender: null,
    email: null,
    phone_number: null
  });
  const [primaryRadio, setPrimaryRadio] = useState(false)
  const [primaryErr, setPrimaryErr] = useState(false)
  const [primaryValue, setPrimaryValue] = useState()
  const [checkPrimary, setCheckPrimary] = useState(false)
  const [filterOpen, setFilteropen] = useState(false)
  const [shippingOpen, setShippingOpen] = useState(false)
  const [requiredFields] = useState([ 
    'company_name',
    'zip',
    'state',
    'city',
    'address',
    'area',
    'first_name',
    'gender',
    'email',
    'phone_number'
  ]);

   const [editShippingMode, setEditShippingMode] = useState(false);

  const setStateHandler = async (name, value) => {
    let formObj = {};

    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };
  };

  const validationZipHandler = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return;

    if (name === 'pin_code') {
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          ['pin_code']: "pin_code is required"
        })
      }
    }
    if (name === 'company_name') {
      if (value.length === 0) {
        setFormErrors({
          ...formErrors,
          ['company_name']: "company_name is required"
        })
      }
    }
  }
console.log('filteropen', filterOpen)

  const bankApply = (values) =>{
    console.log('valuessssss', values)
    props.setBankData([...props.bankData, values]);
    setBankValues({ acc_number : null,
      bank_name : null,
      branch : null,
      ifsc_code : null,
      IsPrimary : null })
    // if(values.primary === 'true'){
    //   props.setBankData([...props.bankData, IsPrimary = "primary"]);
    // }
    setFilteropen(false)
  }
  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const shippingApply = async(values) =>{
   
    console.log('shippingdatas', values)

    props.setShippingData([...props.shippingData, values]);
    setFormValues({ company_name: null,
      contactperson_name: null,
      contactperson_num: null,
      Gst: null,
      city: null,
      state: null,
      pin_code: null,
      country: 'India',
      latitude : null,
      longitude : null})
     
    setShippingOpen(false)
    
  }
  const handleFilter = (data) => {
    console.log('dataaaa', data)
    setFilteropen(data)
   
  };
  const shippingFilter = (data) =>{
        setShippingOpen(data)
  }

  useEffect(() => {
    if(shippingOpen === false) {
    setFormErrors({
    company_name: null,
    contactperson_num: null,
    zip: null,
    state: null,
    city: null,
    address: null,
    area: null,
    first_name: null,
    gender: null,
    email: null,
    phone_number: null
  })
    }
  }, [shippingOpen])

  const handleEdit = (data) =>{
    console.log('dataaaaaaaaaaaa', data)
    setStatus('edit')
    setBankValues(data);
    setFilteropen(true);
  }

  const handleshipppingEdit = (data) =>{
    console.log('dataaaaaaaaaaaa', data)
    setStatus('edit')
    setFormValues(data)
    setShippingOpen(true);
    setEditShippingMode('EditShipping');
  }


 const handleEditSubmit =(data) =>{
  console.log('dataaaaediyg', data);
  let index_value = data.tableData.index;
  console.log('index_value', index_value)
  let value = props.bankData
  value[index_value] = data
  props.setBankData(value);
  setFilteropen(false)
 }

 const handleshippingEditSubmit =(data) =>{ 
  data.pin_code = data.zip
  let index_value = data.shipping_id;
  console.log('index_value', index_value)
  const updatedShippingData = [...props.shippingData];
  // updatedShippingData[index_value] = data;
  const index = updatedShippingData.findIndex(
    (item) => item.shipping_id === data.shipping_id
  );
  updatedShippingData[index] = data;
  props.setShippingData(updatedShippingData);
  setShippingOpen(false)
  setFormValues({ company_name: null,
    contactperson_name: null,
    contactperson_num: null,
    Gst: null,
    city: null,
    state: null,
    pin_code: null,
    country: 'India',
    latitude : null,
    longitude : null})
    setEditShippingMode('')
 }
 const handleDelete = (id) =>{
   console.log('iddddd', id);
   let value = props.bankData;
   console.log('hjjjjjjjjj', value)
   let val = value.filter((d,i) => { return id != i })
   props.setBankData(val);
  //  console.log('valllllllllllllllllll', val)
  //  let val = value.filter((d) => d)
   
 }

 const handleshippingDelete = (id, shipping_id) =>{
  console.log('iddddd', shipping_id);
  let value = props.shippingData;
  let val = value.filter((d,i) => { return id != i })
  props.setShippingData(val);
  apiCalls(
    setModalTypeHandler,
    setLoaderStatusHandler,
    dispatch(shippingdelete(shipping_id)) 
       );
     
 //  console.log('valllllllllllllllllll', val)
 //  let val = value.filter((d) => d)
  
}


  console.log('bankdetail', bankvalues)
  console.log('bankdatasss', formValues)
  console.log('forerrorssss', formErrors)

  // const onChange = async (e) => {
  //   let { name, value } = e.target;
  //   setValues(name, value);
   
  // }
  // const setValues = async (name, value) => {
  //   let formObj = {};
  //  console.log('nameeee', name, value)
  //   formObj = {
  //     ...formValues,
  //     [name]: value === '' ? null : value,
  //   };

  //   await setBankValues(formObj);
 
  // };

  const handlePincode = async (e, rowData, onRowDataChange) => {
    let {name, value} = e.target;
    setStateHandler(name, value);

    if (value.length === 6) {
      const locationData = await getLocationDataBasedOnPincode(value);
      if(locationData!==undefined){
        const {district, state, country} = locationData;
        if (district && state) {
          // textRef.current.focus();
          setFormValues({
            ...formValues,
            pin_code: value,
            city: district,
            state,
           
          });
      }else{

        setFormErrors({
          ...formErrors,
          pin_code: "Pincode Not Found",
        });

      }
      
        // setFormValues({ ...formValues, zip: value, city, state });
        rowData.city = district;
        rowData.state = state;
        rowData.country = country;
        onRowDataChange(rowData);
      }
    }
  };


  return (
    <>
      <div style={{width: '100%', margin: '10px 0'}}>
        <MaterialTable
          // editable={{
          //   onRowAdd: (newData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         /* setData([...data, newData]); */
          //         //   let isvalid = false;
          //         //   const error = this.state.checkerror;
          //         //   for (let d of ["gender", "first_name", "phone_number", "email", "designation"]) {
          //         //     // ,'bar_val'
          //         //     if (!newData[d]) {
          //         //       error[d] = true;
          //         //       isvalid = true;
          //         //     }
          //         //   }
          //         //   if (isvalid) {
          //         //     this.setState({ checkerror: error });
          //         //     return reject();
          //         //   }
          //         //   this.setState({
          //         //     checkerror: {
          //         //       gender: false,
          //         //     },
          //         //     add_click: false,
          //         //   });
          //         //   // newData.gender = newData.gender === 1 ? 'Male': newData.gender === 2 ? 'Female' : 'Others'
          //         if(Object.values(newData).length === 0 ){
          //           reject()
          //           return
          //         }
          //         props.setShippingData([...props.shippingData, newData]);
          //         resolve();
          //       }, 1000);
          //     }),
          //   onRowUpdate: (newData, oldData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         const dataUpdate = [...props.shippingData];
          //         const index = oldData.tableData.id;
          //         // oldData.gender = oldData.gender === 1 ? 'Male': oldData.gender === 2 ? 'Female' : 'Others'
          //         dataUpdate[index] = newData;
          //         props.setShippingData([...dataUpdate]);
          //         resolve();
          //       }, 1000);
          //     }),
          //   [props.status === 'edit' ? 'aaa' : 'onRowDelete']: (oldData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         const dataDelete = [...props.shippingData];
          //         const index = oldData.tableData.id;
          //         dataDelete.splice(index, 1);
          //         props.setShippingData([...dataDelete]);

          //         resolve();
          //       }, 1000);
          //     }),
          // }}
          options={{
            headerStyle,
            cellStyle,
            exportButton: true,
            // filtering: false,
            // maxBodyHeight: maxBodyHeight,
            // pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            actionsColumnIndex: -1,
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'ShippingAddress'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'ShippingAddress'),
              },
            ],
          }}
          actions={[
            {
              icon: () => (
                <div style={{display: 'flex'}}>
                  <ShippingDetailPopup
                    type = {'bankdetail'}
                    open={shippingOpen}
                    ApplyButton={shippingApply}
                    handleClose={shippingFilter}
                    // onChangeVal = {onChange}
                    formValues = {formValues}
                    setFormValues = {setFormValues}
                    formErrors = {formErrors}
                    setFormErrors = {setFormErrors}
                    status = {status}
                    handleEdit = {handleshippingEditSubmit}
                    setStatus = {setStatus}
                    requiredFields = {requiredFields}
                    editshippingAddress={editShippingMode}
                    detailFrom='customer'
                    organizationdata={props.organizationdata}
                    setorganizationdata={props.setorganizationdata}
                  />
                </div>
              ),
              tooltip: 'Add',
              isFreeAction: true,
            },
            (rowData) => ({
              icon: 'edit',
              tooltip: 'edit',
              position: 'row',
              // hidden: this.props.IconHidden ? true : false,
              onClick: (event, rowData) =>{
                handleshipppingEdit(rowData)
              }
              //   this.handleEdit(rowData.sale_id),
              // disabled:  rowData.sale_status === 7? true : rowData?.creditReturn > 0 || rowData.dc_invoice !==null ? true :
              // rowData.sale_status === 6 ? rowData.dc_number !== null ? false : true : false 
              
            }),
            (rowData) => ({
              icon: 'delete',
              tooltip: 'delete',
              position: 'row',
              // hidden: this.props.IconHidden ? true : false,
              onClick: (event, rowData) =>{
                // console.log('rowdataaa', rowData);
                handleshippingDelete(rowData.tableData.index, rowData.shipping_id)
              }
              //   this.handleEdit(rowData.sale_id),
              // disabled:  rowData.sale_status === 7? true : rowData?.creditReturn > 0 || rowData.dc_invoice !==null ? true :
              // rowData.sale_status === 6 ? rowData.dc_number !== null ? false : true : false 
              
            }),
           
            ]}
          columns={[
            {
              field: 'company_name',
              title: 'Company Name',
              editComponent: (props) => (
                <TextField
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='company_name'
                  label='companyname'
                  value={props.value || ''}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'address',
              title: 'Address',
              editComponent: (props) => (
                <TextField
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='address'
                  label='Address'
                  value={props.value || ''}
                  //   error={
                  //     !props.value ? this.state.checkerror.first_name : false
                  //   }
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'area',
              title: 'Area',
              editComponent: (props) => (
                <TextField
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='area'
                  label='Area'
                  value={props.value || ''}
                  //   error={
                  //     !props.value ? this.state.checkerror.first_name : false
                  //   }
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            // {
            //   field: 'latitude',
            //   title: 'Latitude',
            //   editComponent: (props) => (
            //     <TextField
            //       id='standard-basic1'
            //       rows={2}
            //       variant='filled'
            //       name='latitude'
            //       label='Latitude'
            //       value={props.value || ''}
            //       //   error={
            //       //     !props.value ? this.state.checkerror.first_name : false
            //       //   }
            //       onChange={(e) => {
            //         props.onChange(e.target.value);
            //       }}
            //     />
            //   ),
            // },
            // {
            //   field: 'longitude',
            //   title: 'Longitude',
            //   editComponent: (props) => (
            //     <TextField
            //       id='standard-basic1'
            //       rows={2}
            //       variant='filled'
            //       name='longitude'
            //       label='Longitude'
            //       value={props.value || ''}
            //       //   error={
            //       //     !props.value ? this.state.checkerror.first_name : false
            //       //   }
            //       onChange={(e) => {
            //         props.onChange(e.target.value);
            //       }}
            //     />
            //   ),
            // },
            {
              field: 'pin_code',
              title: 'Pin Code',
              editComponent: ({value, rowData, onChange, onRowDataChange}) => (
                <TextField
                  id='standard-basic1'
                  rows={2}
                  required={true}
                  variant='filled'
                  name='pin_code'
                  regex=''
                  type="number"
                  label='Pin Code'
                  inputProps={{maxLength: 6}}
                  value={value}
                  // {...(props.value?.length < 6 && {
                  //   error: true,
                  //   helperText: 'Enter a valid Pincode',
                  // })}
                  //   error={
                  //     !props.value ? this.state.checkerror.first_name : false
                  //   }
                  onChange={(e) => {
                    handlePincode(e, rowData, onRowDataChange);
                    return onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'city',
              title: 'City',
              editComponent: (props) => (
                (<Autocomplete
                  fullWidth={true}
                  value={{
                    name: formValues.city === null ? '' : formValues.city,
                  }}
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
                      error={formErrors.city === null ? false : true}
                      helperText={
                        formErrors.city === null ? '' : formErrors.city
                      }
                      required={true}
                    />
                  )}
                />)
                // <TextField
                //   id="city-field"
                //   rows={2}
                //   variant='standard'
                //   name="city"
                //   label="City"
                //   value={props.value || ''}
                //   //   error={
                //   //     !props.value ? this.state.checkerror.first_name : false
                //   //   }
                //   onChange={(e) => {
                //     props.onChange(e.target.value);
                //   }}
                // />
              ),
            },

            {
              field: 'state',
              title: 'State',
              editComponent: (props) => (
                (<Autocomplete
                  fullWidth={true}
                  name='state'
                  // defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m => m.state) : ""}`}
                  value={{
                    state: formValues.state === null ? '' : formValues.state,
                  }}
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
                      error={formErrors.state === null ? false : true}
                      helperText={
                        formErrors.state === null ? '' : formErrors.state
                      }
                      required={true}
                    />
                  )}
                />)
                // <TextField
                //   id="state-field"
                //   rows={2}
                //   variant='standard'
                //   name="state"
                //   label="State"
                //   value={props.value || ''}
                //   //   error={
                //   //     !props.value ? this.state.checkerror.first_name : false
                //   //   }
                //   onChange={(e) => {
                //     props.onChange(e.target.value);
                //   }}
                // />
              ),
            },

            {
              field: 'country',
              title: 'Country',
              editComponent: (props) => (
                (<Autocomplete
                  fullWidth={true}
                  name='country'
                  //  defaultValue={`${props.edit_id_data ? props.edit_id_data.map(m =>m.country) : ""}`}
                  //defaultValue
                  value={{name: formValues.country}}
                  options={Country}
                  getOptionLabel={(options) => options.name}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      setFormValues({
                        ...formValues,
                        country: newValue.name,
                      });
                    }
                  }}
                  autoHighlight={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Country'
                      variant='filled'
                      //error = { formErrors.country === null ? false : true } helperText = { formErrors.country === null ? '' : formErrors.country } required={true}
                    />
                  )}
                />)

                // <TextField
                //   id="country-field"
                //   rows={2}
                //   variant='standard'
                //   name="country"
                //   label="Country"
                //   value={props.value || ''}
                //   //   error={
                //   //     !props.value ? this.state.checkerror.first_name : false
                //   //   }
                //   onChange={(e) => {
                //     props.onChange(e.target.value);
                //   }}
                // />
              ),
            },
          ]}
          data={props.shippingData}
          title={<Typography variant='h6'>Shipping Address</Typography>}
        />
      </div>
      <div style={{width: '100%', margin: '20px 0px'}}>
        <MaterialTable
        
          // editable={{
          //   // isDeletable : () =>props.status === 'edit' ? false : true ,
          //   onRowAdd: (newData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         /* setData([...data, newData]); */
          //         // let isvalid = false;
          //         // const error = this.state.checkerror;
          //         // for (let d of ["acc_number", "bank_name", "branch", "ifsc_code"]) {
          //         //   // ,'bar_val'
          //         //   if (!newData[d]) {
          //         //     error[d] = true;
          //         //     isvalid = true;
          //         //   }
          //         // }
          //         // if (isvalid) {
          //         //   this.setState({ checkerror: error });
          //         //   return reject();
          //         // }
          //         // this.setState({
          //         //   checkerror: {
          //         //     gender: false,
          //         //   },
          //         //   add_click: false,
          //         // });
          //         // // newData.gender = newData.gender === 1 ? 'Male': newData.gender === 2 ? 'Female' : 'Others'
          //         if(Object.values(newData).length === 0 ){
          //           reject()
          //           return
          //         }

          //         var primaryArr = []
          //         if(newData.IsPrimary === 'primary'){
          //           const data = [...props.bankData]
          //           data.map((d) => {
          //             delete d.IsPrimary
          //             primaryArr.push(d)
          //           })
          //         }

          //         const finalData = [...primaryArr,newData]
                  
          //         if(newData.IsPrimary === 'primary'){
          //           props.setBankData(finalData)
          //         }
          //         else{                    
          //           props.setBankData([...props.bankData, newData]);
          //         }

          //         resolve();
          //       }, 1000);
          //     }),
          //   onRowUpdate: (newData, oldData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         const dataUpdate = [...props.bankData];
          //         const index = oldData.tableData.id;
          //         // oldData.gender = oldData.gender === 1 ? 'Male': oldData.gender === 2 ? 'Female' : 'Others'

          //         // var primaryArr = []
          //         if(newData.IsPrimary === 'primary'){
          //           dataUpdate.map((d) => {
          //             delete d.IsPrimary
          //             // primaryArr.push(d)
          //           })
          //         }

          //         dataUpdate[index] = newData;
          //         props.setBankData([...dataUpdate]);
          //         resolve();
          //       }, 1000);
          //     }),
              
             
          //   [props.status === 'edit' ? 'aaa' : 'onRowDelete']: (oldData) =>
          //     new Promise((resolve, reject) => {
          //       setTimeout(() => {
          //         const dataDelete = [...props.bankData];
          //         const index = oldData.tableData.id;

          //         // if(oldData.primary === 'primary'){
          //         //   const newArr = [dataDelete.map((v) => ({...v, primary : 'primary'}))[0], ...dataDelete]
          //         //   if(newArr.length > 0){
          //         //     newArr.splice(index + 1, 1);
          //         //     newArr.splice(1, 1);
          //         //   }
          //         //   else{
          //         //     newArr.splice(0, 1);
          //         //   }
          //         //   props.setBankData([...newArr]);
          //         // }
          //         // else{
          //         //   dataDelete.splice(index, 1);
          //         //   props.setBankData([...dataDelete]);
          //         // }

          //         if(oldData.IsPrimary === 'primary'){
          //           dataDelete.splice(index, 1);
          //           if(dataDelete.length > 0){
          //             dataDelete[0].IsPrimary = 'primary'
          //           }
          //         }
          //         else{
          //           dataDelete.splice(index, 1);
          //         }

          //         props.setBankData([...dataDelete]);

          //         resolve();
          //       }, 1000);
          //     }),
          // }}
          options={{
            headerStyle: {
              fontSize: 14,
            },
            exportButton: true,
            // filtering: false,
            // maxBodyHeight: maxBodyHeight,
            // pageSize: 20,
            pageSizeOptions: [20, 50, 100],
            actionsColumnIndex: -1,
            exportMenu: [
              {
                label: 'Export PDF',
                exportFunc: (cols, datas) =>
                  ExportPdf(cols, datas, 'BankDetails'),
              },
              {
                label: 'Export CSV',
                exportFunc: (cols, datas) =>
                  ExportCsv(cols, datas, 'BankDetails'),
              },
            ],
          }}
          actions={[
            {
              icon: () => (
                <div style={{display: 'flex'}}>
                  <BankDetailPopup
                    open={filterOpen}
                    ApplyButton={bankApply}
                    handleClose={handleFilter}
                    // onChangeVal = {onChange}
                    bankValues = {bankvalues}
                    setBankValues = {setBankValues}
                    status = {status}
                    handleEdit = {handleEditSubmit}
                    setStatus = {setStatus}
                    
                  />
                </div>
              ),
              tooltip: 'Add',
              isFreeAction: true,
            },
            (rowData) => ({
              icon: 'edit',
              tooltip: 'edit',
              position: 'row',
              // hidden: this.props.IconHidden ? true : false,
              onClick: (event, rowData) =>{
                handleEdit(rowData)
              }
              //   this.handleEdit(rowData.sale_id),
              // disabled:  rowData.sale_status === 7? true : rowData?.creditReturn > 0 || rowData.dc_invoice !==null ? true :
              // rowData.sale_status === 6 ? rowData.dc_number !== null ? false : true : false 
              
            }),
            (rowData) => ({
              icon: 'delete',
              tooltip: 'delete',
              position: 'row',
              // hidden: this.props.IconHidden ? true : false,
              onClick: (event, rowData) =>{
                handleDelete(rowData.tableData.index)
              }
              //   this.handleEdit(rowData.sale_id),
              // disabled:  rowData.sale_status === 7? true : rowData?.creditReturn > 0 || rowData.dc_invoice !==null ? true :
              // rowData.sale_status === 6 ? rowData.dc_number !== null ? false : true : false 
              
            }),
           
            ]}
          columns={[
            {
              field: 'acc_number',
              title: 'Account Number',
              editComponent: (props) => (
                <TextField
                sx={{paddingBottom : common_paddingB.paddingBottom}}
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='acc_number'
                  label='Account Number'
                  value={props.value || ''}
                  //   error={
                  //     !props.value ? this.state.checkerror.first_name : false
                  //   }
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'bank_name',
              title: 'Bank Name',
              editComponent: (props) => (
                <TextField
                sx={{paddingBottom : common_paddingB.paddingBottom}}
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='bank_name'
                  label='Bank Name'
                  value={props.value || ''}
                  //   error={
                  //     !props.value ? this.state.checkerror.first_name : false
                  //   }
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'branch',
              title: 'Branch',
              editComponent: (props) => (
                <TextField
                sx={{paddingBottom : common_paddingB.paddingBottom}}
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='branch'
                  label='Branch'
                  value={props.value || ''}
                  //   error={
                  //     !props.value ? this.state.checkerror.first_name : false
                  //   }
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'ifsc_code',
              title: 'IFSC Code',
              editComponent: (props) => (
                <TextField
                  id='standard-basic1'
                  rows={2}
                  variant='filled'
                  name='ifsc_code'
                  label='IFSC Code'
                  value={props.value || ''}
                  sx={{paddingBottom : common_paddingB.paddingBottom}}
                  // error={
                  //   !props.value ? this.state.checkerror.first_name : false
                  // }
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                />
              ),
            },
            {
              field: 'IsPrimary',
              title: 'Primary',
              editComponent: (props) => (
                <FormControl>
                  {/* <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel> */}
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    // defaultValue="female"
                    name="IsPrimary"
                    value={ props.value || '' }
                    onChange={(e) => {
                      props.onChange(e.target.value) 
                    }}
                  >
                    <FormControlLabel value="primary" control={<Radio/>} />
                    {/* <FormControlLabel value="male" control={<Radio />} label="Male" />
                    <FormControlLabel value="other" control={<Radio />} label="Other" /> */}
                  </RadioGroup>
                </FormControl>
              ),
            },
          ]}
          data={props.bankData}
          title={<Typography variant='h6'>Bank Details</Typography>}
        />
      </div>
    </>
  );
}
export default BankAndShipping;

