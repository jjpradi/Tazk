import { Card, CardContent, CardActions, Box, Avatar, Grid, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, DialogContent, DialogTitle, TextField, Autocomplete, RadioGroup, FormLabel, FormControl, FormControlLabel, Radio, MenuItem, Switch, InputAdornment } from "@mui/material";
import { Button } from "@mui/material";
import { Divider, Tabs, Tab, Typography, Badge } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import EditIcon from '@mui/icons-material/Edit';
import { maxBodyHeight, maxHeight } from "utils/pageSize";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrimaryContact from "./primaryContact";
import IncomeExpenseCard from "./incomeExpenseCard";
import TimeLine from "../../../src/components/customer_erpDesign/timeLine"
import AvatarViewWrapper from "utils/imgUpload";
import { useDispatch, useSelector } from "react-redux";
import { additionalContactsAction, additionalShippingAddressAction, customerAddressUpdateAction, customerDetailByIdAction, customerGstUpdateAction, customerPortalUpdateAction, EditAdditionalShippingAddressAction, listCustomerAction, updateShippingDetailAction } from "redux/actions/customer_actions";
import CustomerDetailPopup from "pages/sales/customer/organizationpopup";
import AddIcon from '@mui/icons-material/Add';
import ShippingDetailPopup from "pages/sales/customer/shippingdetailpopup";
import BankDetailPopup from "pages/sales/customer/bankdetailpopup";
import PersonIcon from "@mui/icons-material/Person";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { AppScrollbar } from "@crema";
import BillsRow from "./billsRow";
import CustomerTopCards from "./customerTopOrders";
import { getsessionStorage } from "pages/common/login/cookies";
import { editShippingAddressForVendorAction, shippingAddressForVendorAction,updateVendorAction } from "redux/actions/vendor_actions";
import vendorReducer from "redux/reducers/vendor_reducers";
import apiCalls from 'utils/apiCalls';
import { getLocationDataBasedOnPincode } from "components/common";
import { Cities } from "utils/cities";
import { useCustomFetch } from "utils/useCustomFetch";
import API_URLS from "utils/customFetchApiUrls";
import { CollectionsOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { getprefixAction } from "redux/actions/app_config_actions";
import { gstValidation, PWDRequisite } from "components/regexFunction";
import _ from "lodash";
import { getCustomerErpDetails } from "redux/actions/erpDetails_actions";
import { useLocation } from 'react-router-dom';

  const OverviewForAllCustType = ({ customerData, func1, contactType, customerErpDetails, handleImage, index,customer_data,checkType, srcImage,handleBackButtonClick,setEditfind,rowPopupClose, isEnabled, imageStatus, customerType, customer_id, handesetSaveTrue ,getInputProps,getRootProps,matches}) => {
      const {
    setLoaderStatusHandler,
    setModalStatusHandler,
    setselectData,
    setModalTypeHandler,
    commoncookie,
    headerLocationId,} = useContext(CreateNewButtonContext);
    const dispatch = useDispatch();
        const { pathname } = useLocation()
console.log("customerkjshikfd",customerData,contactType,customerErpDetails)
    const { customerReducer: customerDetailById, additionalShippingAddress,
        appConfigReducer : {getprefix_data},
            vendorReducer : vendor_id_data
     } = useSelector((state) => state);
    const storage = getsessionStorage()
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ shippingDialogOpen, setShippingDialogOpen ] = useState(false)
    const [ shippingOpen, setShippingOpen ] = useState(false)
    const [ status, setStatus ] = useState('create')
    const [ customerId, setCustomerId ] = useState()
    const [supplierId, setSupplierId] = useState();
    const [edit_id_data, setedit_id_data] = useState()
    const [isEdit ,setIsEdit]=useState(false)
    const [shippingIsEdit ,setShippingIsEdit]=useState(false)
    const [editShippingData, setEditShippingData] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editShippingMode, setEditShippingMode] = useState(false);
    const [shipformValues, setShipFormValues] = useState({
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
    area : null
  });

  const [shipformErrors, setShipFormErrors] = useState({
      company_name: null,
      zip: null,
      state: null,
      city: null,
      address: null,
      area: null
    });

    const [shiprequiredFields] = useState([ 
        'company_name',
        'zip',
        'state',
        'city',
        'address',
        'area'
      ]);


    useEffect(() => {
        const customerData = customerDetailById?.customerDetailById?.[0];
        const supplierData = customerDetailById?.customer_paginate?.[0];
    
        if (customerData?.customer_id) {
            setCustomerId(customerData.customer_id);
            setSupplierId(null);
            console.log("Customer ID set:", customerData.customer_id);
        } else if (supplierData?.supplier_id) {
            setSupplierId(supplierData.supplier_id);
            setCustomerId(null);
            console.log("Supplier ID set:", supplierData.supplier_id);
        }
    }, [customerDetailById]);
    
    console.log(customerDetailById?.customerDetailById[ 0 ]?.customer_id, "customerDetailById")

    const handleClosePopup = () => {
        setDialogOpen(!dialogOpen);
    };

    const handleClose = () => {
        setShippingDialogOpen(!shippingDialogOpen)
        setFormErrors({
            zip: null,
            state: null,
            city: null,
            address: null,
            area: null,
            company_name : null
        })
    }

    const handleApplyChanges = () => {
        setDialogOpen(false);
        dispatch(additionalContactsAction())
    };

    useEffect(() => {
        if (shippingIsEdit && editShippingData) {
          setFormValues({
            address: editShippingData?.address || "",
            area: editShippingData?.area || "",
            latitude: editShippingData?.latitude || "",
            longitude: editShippingData?.longitude || "",
            zip: editShippingData?.pin_code || "",
            city: editShippingData?.city || "",
            state: editShippingData?.state || "",
            country: editShippingData?.country || "India",
            company_name : editShippingData?.company_name || ''
          });
        }
      }, [shippingIsEdit, editShippingData]);


      const handleShipping = () => {
        rowPopupClose();
        setLoaderStatusHandler(false);
        setEditfind(false);
        setShippingIsEdit(false);
        setEditShippingData(null);
        handleBackButtonClick();
      };
      const resolvedType = contactType || (typeof checkType === "function" ? checkType() : "Customer");
      const storeCustomer = customerDetailById?.customerDetailById?.[0];
     const currentRecord = resolvedType === "Customer" ? (storeCustomer || customerData) : customerData;

    // const shippingApply = async() => {
    //     setShippingOpen(false)
    //     const isCustomer = Boolean(customerId);
    //     const isSupplier = Boolean(supplierId);
    //     const isEditing = shippingIsEdit && editShippingData?.shipping_id;
    //      const payload = {
    //           address: formValues.address,
    //           area: formValues.area,
    //           latitude: formValues.latitude,
    //           longitude: formValues.longitude,
    //           pincode: formValues.zip,
    //           city: formValues.city,
    //           state: formValues.state,
    //           country: formValues.country,
    //           type: isCustomer ? "customer_id" : "supplier_id",
    //             ...(isCustomer && { customer_id: customerId }),
    //             ...(isSupplier && { supplier_id: supplierId }),
    //             ...(isEditing && { shipping_id: editShippingData.shipping_id }),
    //           company_name  : formValues.company_name
    //         };
    //         setLoaderStatusHandler(true);

    //         try{
    //         if (isEditing ) {
    //             console.log("Dispatching edit with ID", editShippingData.shipping_id);
    //             if (payload.type === "supplier_id") {
    //                 await dispatch(editShippingAddressForVendorAction(editShippingData.shipping_id, payload));
    //             } else {
    //                 await dispatch(EditAdditionalShippingAddressAction(editShippingData.shipping_id, payload));
    //             }
    //         } else {
    //             console.log("Dispatching new address creation");
    //             if (payload.type === "supplier_id") {
    //                 await dispatch(shippingAddressForVendorAction(payload));
    //             } else {
    //                 await dispatch(additionalShippingAddressAction(payload));
    //             }
    //         }
            
    //         if (typeof handleShipping === 'function') {
    //             handleShipping();
    //         }
    //     }finally{
    //         setLoaderStatusHandler(false);
    //     }
            
    // }

      const shippingApply = async(values) =>{
       
        console.log('shippingdatas', values, shipformValues)
        const indexToUpdate = values?.tableData?.index;
    
        let payload = {};
      
        if (editShippingMode === "EditShipping") {
          const updatedShipping = {
            ...values,
            customer_id: shipformValues?.customer_id,
            mode: editShippingMode,
            isPrimary: !shipformValues.shipping_id ? false : true,
          };
      
          console.log("Payload for updateShippingDetailAction (EDIT):", updatedShipping);
      
          payload = updatedShipping;
      
        } else {
          payload = {
            ...values,
            customer_id: shipformValues?.customer_id,
            mode: "create"
          };
      
          console.log("Payload for updateShippingDetailAction (CREATE):", payload);
        }
        // let ID_data = props.edit_id_data;
        // var value = ID_data;
        // setShippingData(value.shipping_address);
        // props.setShippingData([...props.shippingData, values]);
        setShipFormValues((prev) => ({ ...prev, company_name: null,
          contactperson_name: null,
          contactperson_num: null,
          Gst: null,
          city: null,
          state: null,
          pin_code: null,
          country: 'India',
          latitude : null,
          longitude: null
        }))
        const payloadd = { ...values,  customer_id: shipformValues?.customer_id };
          console.log("Payload for updateShippingDetailAction:", payloadd);
        
        setShippingOpen(false)
             apiCalls(
                setModalTypeHandler,
                setLoaderStatusHandler,
                dispatch(updateShippingDetailAction(payload,() => {
                  dispatch(listCustomerAction(setModalTypeHandler, setLoaderStatusHandler))
                }),
             ))
       
      }

    const handleOpenDialog = () => {
        setOpenDialog(true);
      };
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
      };

    const handleEditShipping = (address, shippingList) => {
    console.log('Editing shipping address:', address);
  console.log('Full shipping list:', shippingList);
    setShipFormValues({
      ...address,
      isPrimary: !address.shipping_id ? false : false,
      Gst : address.tax_id || address.Gst,
      contactperson_num : address.contactperson_num || address.phone_number,
      contact_person_name : address.contact_person_name || address.first_name,
    //   tableData: { index: index },
      fullList: shippingList
    });
    setEditShippingMode('EditShipping');
    setShippingOpen(true);
  };

    const shippingFilter = (data) =>{
    setShippingOpen(data)
  }

    const handleshippingEditSubmit =(data) =>{
    console.log('dataaaaediyg', data);
    data.pin_code = data.zip
    let index_value = data?.tableData.index;
    console.log('index_value', index_value)
    // let updated = [...props.shippingData]; // Clone before edit
    console.log(updated, "klaaaaaaa")
    if (index_value !== undefined && updated[index_value]) {
      updated[index_value] = data;
    }

    // props.setShippingData(updated);
    setShippingOpen(false);
   }

   
     const textRef = useRef(null);
     const customFetch = useCustomFetch()
   const [rowData,setRowData] =  useState()
   const [open,setOpen] =  useState(false)
   const [portal,setPortalEdit] =  useState(false)
   const [tax,setTaxEdit] =  useState(false)
   const [editFormData,setEditFormData] =  useState({
    address : null,
    area : null,
    zip : null,
    city : null,
    state : null,
    gst_type : null,
    gstNumber : null,
    gst : 0,
    username : null,
    password : null,
   })
   const [formErrors,setFormErrors] =  useState({
    address : null,
    area : null,
    zip : null,
    city : null,
    state : null,
    gst_type : null,
    gstNumber : null,
    username : null,
    password : null,
   })

   const [gst,setGst] = useState(false)
   const [gstTypes,setGstTypes] = useState([])

    const [appAccess,setAppAccess] = useState(false)
    const [webAccess,setWebAccess] = useState(false)
    const [pwdRequiste, setPWDRquisite] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [concate, setconcate] = useState('')
    const [userName, setUserName] = useState(null)

    const [checks, setChecks] = useState({
        capsLetterCheck: false,
        numberCheck: false,
        removeSpace: true,
        pwdLengthCheck: false,
        specialCharCheck: false,
    });       

const handleEdit = (e, record) => {
  e?.stopPropagation?.();
  if (!record) return;

  setRowData(record);
  setOpen(true);

  setFormErrors((prev) => ({
    ...prev,
    zip: null,
    state: null,
    city: null,
    address: null,
    area: null,
  }));

  setEditFormData({
    address: record?.address ?? "",
    area: record?.area ?? "",
    zip: record?.zip ?? "",
    city: record?.city ?? record?.peopleCity ?? "",
    state: record?.state ? {state: record.state} : null,
    gst_type: record?.gst_type ?? null,
    gstNumber: record?.tax_id ?? null,
    gst: record?.gst ? Number(record.gst) : 0,
    username: record?.username ?? null,
    password: record?.password ?? null,
  });
  console.log(record, "54rgdgdf");

}

   const handleTaxEdit = async(e,rowData)=>{
        const data = await customFetch(API_URLS.GET_GST_TYPES, 'GET');
    //    console.log(data?.data, 'data123');
          setGstTypes(data?.data)
    e.stopPropagation()
    setRowData(rowData)
    rowData?.gst == '0' ? setGst(false) : setGst(true)

    setEditFormData((prev)=>({...prev,gstNumber : rowData.tax_id || '',gst_type : rowData.gst_type || '' }))
    setTaxEdit(true)
    console.log(rowData,'dsfjhsdfjhjdsf')
   }

   const handlePortalEdit = (e,rowData)=>{
    dispatch(getprefixAction())
    e.stopPropagation()
    setRowData(rowData)
    setAppAccess(rowData?.app_access)
    setWebAccess(rowData?.customer_web_access)
    setEditFormData((prev)=>({
        ...prev,
        phone_number: rowData.phone_number || '',
        username: storage.company_type === 3
            ? rowData.phone_number
            : rowData.username || '',
        password: storage.company_type === 3
            ? rowData.phone_number
            : rowData.password || '' }))
    setPortalEdit(true)
       console.log(rowData, 'dsfjhsdfjhjdsf')
   }

      useEffect(() => {
          if (storage.company_type === 3 && (appAccess || webAccess)) {
              setEditFormData(prev => ({
                  ...prev,
                  username: prev.phone_number,
                  password: prev.phone_number
              }))
          }
      }, [editFormData.phone_number])

   console.log(editFormData,'dshgjd222s876876')

   const handleChange = async(name,value)=>{
    let updatedFormData = {...editFormData, [name] : value}
    setEditFormData(updatedFormData)

   if (name === 'zip') {
       value = value.replace(/\D/g, '');
       setEditFormData(prev => ({ ...prev, zip: value }));
       if (value.length < 6) {
         setFormErrors(prev => ({
           ...prev,
           zip: "Pincode maximum length is 6 digits"
         }));
         return; 
       }
       else if(name === 'gstNumber'){
        if (gstValidation(value) !== true) {
              setValidRegex({ ...validRegex, tax_id: false });
              setFormErrors({
                ...formErrors,
                [name]: 'GST Number is Invalid!',
              });
            }
       }
       else {
         setFormErrors(prev => ({
           ...prev,
           zip: null
         }));
       }
       if (/^[1-9][0-9]{5}$/.test(value)) {
         const locationData = await getLocationDataBasedOnPincode(value);
   
         if (locationData && locationData.district && locationData.state) {
           textRef.current?.focus?.();
           setEditFormData(prev => ({
             ...prev,
             city: locationData.district,
             state: {state : locationData.state}
           }));
           setFormErrors(prev => ({
             ...prev,
             city: null,
             state: null
           }));
         } else {
           setFormErrors(prev => ({
             ...prev,
             zip: "Pincode Not Found"
           }));
         }
       }
   
       return;
     }
   }

   const handleSubmit = async () => {
  const nextAddress = {
    address: editFormData.address,
    area: editFormData.area,
    zip: editFormData.zip,
    city: editFormData.city,
    state: editFormData.state?.state,
    country: "India",
  };

  if (resolvedType === "Supplier") {
    const supplier_id = rowData?.supplier_id || currentRecord?.supplier_id;
    if (!supplier_id) return;
    await dispatch(
      updateVendorAction(
        supplier_id,
        { ...currentRecord, ...nextAddress }, 
        setModalTypeHandler,
        setLoaderStatusHandler,
        () => {}
      )
    );
    await dispatch(getCustomerErpDetails(supplier_id, "Supplier", setLoaderStatusHandler));
  } else {
    const customer_id = rowData?.customer_id || currentRecord?.customer_id;
    if (!customer_id) return;

    await dispatch(customerAddressUpdateAction({ customer_id, ...nextAddress }));
    await dispatch(customerDetailByIdAction(customer_id));
    await dispatch(getCustomerErpDetails(customer_id, "Customer", setLoaderStatusHandler));
  }

  setOpen(false);
};
const validateTaxForm = () => {
    if (!gst) return true;
    const nextErrors = {
      gstNumber: !editFormData.gstNumber
        ? 'GST Number is required'
        : gstValidation(editFormData.gstNumber) !== true
          ? 'Invalid GST Number'
          : null,
      gst_type: editFormData.gst_type ? null : 'GST Treatment is required',
    };
    setFormErrors(prev => ({ ...prev, ...nextErrors }));
    return !nextErrors.gstNumber && !nextErrors.gst_type;
   };

   const handleTaxSubmit = async()=>{
    if (!validateTaxForm()) {
      return;
    }

    const payload = {
        customer_id : rowData.customer_id,
        gst : editFormData.gst,
        gst_number :  editFormData.gstNumber,
        gst_type :  editFormData.gst_type
    }
    await dispatch(customerGstUpdateAction(payload))
    setTaxEdit(false)
   }
   const handlePortalSubmit = ()=>{
    const payload = {
        customer_id : rowData.customer_id,
        app_access : appAccess ? 1 : 0,
        customer_web_access : webAccess ? 1 : 0,
        username : editFormData.username,
        password : editFormData.password, 
    }
    dispatch(customerPortalUpdateAction(payload))
    setPortalEdit(false)
   }

  const GST = (e) => {
    let { value } = e.target;
    const isGst = value === 'true'
    setGst(isGst)
    setEditFormData({
      ...editFormData,
      gst: isGst ? 1 : 0,
      ...(isGst ? {} : { gstNumber: null, gst_type: null })
    })
    if (!isGst) {
      setFormErrors(prev => ({ ...prev, gstNumber: null, gst_type: null }));
    }
    
    // setyes(value === 'true' ? 1 : 0);
  }

  
        const appAccessFunc = (e,name)=>{
          
          if(name === 'web'){
            setWebAccess(e.target.checked)
          }
          else if(name === 'app'){
            setAppAccess(e.target.checked)
          }

          if(e.target.checked === false){
            setEditFormData((prev) => ({ ...prev, username: null, password: null }));
            setconcate('')
          }
        }

const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

    const handleOnFocus = () => {
    setPWDRquisite(true);
  };

  const handleOnBlur = () => {
    setPWDRquisite(false);
  };

    const handleOnKeyUp = (e) => {
    const {value} = e.target;
    const capsLetterCheck = /[A-Z]/.test(value);
    const numberCheck = /[0-9]/.test(value);
    const pwdLengthCheck = value.length >= 6;
    const specialCharCheck = /[!@#$%^&*]/.test(value);
    const removeSpace = /\s/g.test(value);
    setChecks({
      capsLetterCheck,
      numberCheck,
      pwdLengthCheck,
      removeSpace,
      specialCharCheck,
    });
    if(pwdLengthCheck && !removeSpace){
      setPWDRquisite(false)
    }
    else{
    setPWDRquisite(true)
    }
  };

console.log(customerData,"dataaaaa")
    return (
        <Card sx={{
            maxWidth: "100%", padding: "16px", borderRadius: "12px", height: 'calc(100vh - 136px)', overflowY: 'scroll',
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
                display: "none",
            },
        }}>
            <CardContent sx={{  position: "relative" }}>
               
         <br></br>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "320px 1px 1fr",
                        gap: "16px",
                        alignItems: "start",
                        overflow: "hidden"
                    }}
                >

                    {/* Left Section */}
                    <Box sx={{ maxWidth: '320px', width: '100%'  }}>
                        <Box>
                        <Grid container spacing={2}>

                            <Grid
                                onClick={() => { handesetSaveTrue }}
                                sx={{display: 'flex', justifyContent: 'center', paddingBottom: '5px' }}
                                size={{
                                    lg: 4,
                                    md: 4,
                                    sm: 12,
                                    xs: 12
                                }}>
                                <AvatarViewWrapper {...getRootProps({ className: 'dropzone' })}>
                                    <input {...getInputProps()} />
                                    <label htmlFor='icon-button-file'>
                                        <Avatar
                                            sx={{
                                                width: { xs: 110, lg: 70 },
                                                height: { xs: 110, lg: 70 },
                                                cursor: 'pointer',
                                                border: '3px solid white',
                                                boxShadow: 2
                                            }}
                                            src={(checkType() === 'Customer' || checkType() === 'Possalecustomer') && srcImage[customer_data[index]?.customer_id]
                                                ? srcImage[customer_data[index]?.customer_id]
                                                : imageStatus
                                                    ? customerData?.image
                                                    : ''}
                                        >
                                            {!(checkType() === 'Customer' || checkType() === 'Possalecustomer') && !srcImage?.image  &&
                                                !imageStatus && !customerData?.image ? (
                                                <PersonIcon sx={{ fontSize: 40, color: 'gray' }} />
                                            ) : null}
                                        </Avatar>
                                        <Box className='edit-icon'>
                                            <EditIcon />
                                        </Box>
                                    </label>
                                </AvatarViewWrapper>
                            </Grid>
                            {isEnabled ? (
                                 <Grid sx={{ display: 'flex', justifyContent: 'flex-end' }} size={12}>
                                    <Button
                                        variant='outlined'
                                        sx={{ height: '1.5rem', ':hover': { bgcolor: '#0A8FDC', color: 'white' } }}
                                        onClick={handleImage}
                                    >
                                        Save
                                    </Button>
                                </Grid>
                            ) : null}
                            <Grid
                                sx={{display: 'flex',justifyContent:{xs:'center',sm:'center',md: 'flex-start' } , alignItems: 'center'}}
                                size={{
                                    lg: 7,
                                    md: 8,
                                    sm: 12,
                                    xs: 12
                                }}>
                            <Typography sx={{fontSize:'12px', fontWeight: "bold" }}>
                                {customerType === 0 ? customerData?.first_name || "-" : customerData?.company_name || "-"}
                            </Typography>
                            </Grid>
                            </Grid>
                        </Box>
                            
                        <Accordion defaultExpanded elevation={0} square disableGutters
                            sx={{
                                marginBottom: 2,
                                marginTop: 5
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                                backgroundColor: 'transparent',
                                paddingY: 0,
                                minHeight: 'unset',
                                '&.MuiAccordionSummary-root': {
                                    minHeight: 'unset'
                                },
                                '& .MuiAccordionSummary-content': {
                                    margin: 0
                                }
                            }} onClick={(e) => e.stopPropagation()}>
                                <Grid container alignItems="center" justifyContent="space-between">
                                <Grid display="flex" alignItems="center">
                                    <Typography sx={{fontSize:'12px', fontWeight: 'bold' }}>Basic Details</Typography>
                                     {/* <IconButton onClick={() => handleEditShipping(customerData,customerData.shipping_address)}>
                                          <EditIcon />
                                      </IconButton> */}
                                </Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingTop: 2 }}>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Phone Number:
                                    </Box>
                                    {customerData?.phone_number || "-"}
                                </Typography>

                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Email:
                                    </Box>
                                    {customerData?.email || "-"}
                                </Typography>

                            </AccordionDetails>
                        </Accordion>

                        <Accordion defaultExpanded elevation={0} square disableGutters
                            sx={{
                                marginBottom: 2,
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                                backgroundColor: 'transparent',
                                paddingY: 0,
                                minHeight: 'unset',
                                '&.MuiAccordionSummary-root': {
                                    minHeight: 'unset'
                                },
                                '& .MuiAccordionSummary-content': {
                                    margin: 0
                                }
                            }} onClick={(e) => e.stopPropagation()}>
                                <Grid container display="flex" justifyContent="space-between">
                                    <Grid><Typography sx={{fontSize:'12px', fontWeight: 'bold' }}>Contact Details</Typography></Grid>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingTop: 2 }}>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        First Name:
                                    </Box>
                                    {customerData?.first_name || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Gender:
                                    </Box>
                                    {customerData?.gender === 1 ? "Male" : customerData?.gender === 2 ? "Female" : customerData?.gender === 3 ? "Others" : "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Designation:
                                    </Box>
                                    {customerData?.designation || "-"}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion defaultExpanded elevation={0} square disableGutters 
                            sx={{
                                marginBottom: 2,
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                                backgroundColor: 'transparent',
                                paddingY: 0,
                                minHeight: 'unset',
                                '&.MuiAccordionSummary-root': {
                                    minHeight: 'unset'
                                },
                                '& .MuiAccordionSummary-content': {
                                    margin: 0
                                }
                            }} onClick={(e) => e.stopPropagation()}>
                                <Grid container display="flex" alignItems='center' justifyContent="space-between">
                                    <Grid><Typography sx={{fontSize:'12px', fontWeight: 'bold' }}>Address</Typography></Grid>
                                    {pathname !== '/apps/CustomerGeneralInfo' && (
                                    <IconButton onClick={(e) => handleEdit(e, currentRecord)}>
                                        <EditIcon />
                                    </IconButton>
                                    )}
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingTop: 2 }}>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Address:
                                    </Box>
                                    {customerData?.address || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Area:
                                    </Box>
                                    {customerData?.area || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Pincode:
                                    </Box>
                                    {customerData?.zip || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        City:
                                    </Box>
                                    {customerData?.city || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        State:
                                    </Box>
                                    {customerData?.state || "-"}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion defaultExpanded elevation={0} square disableGutters 
                            sx={{
                                marginBottom: 2
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                                backgroundColor: 'transparent',
                                paddingY: 0,
                                minHeight: 'unset',
                                '&.MuiAccordionSummary-root': {
                                    minHeight: 'unset'
                                },
                                '& .MuiAccordionSummary-content': {
                                    margin: 0
                                }
                            }} onClick={(e) => e.stopPropagation()}>
                                <Grid container display="flex" justifyContent="space-between">
                                    <Grid><Typography sx={{fontSize:'12px', fontWeight: 'bold' }}>Tax Details</Typography></Grid>
                                    {pathname !== '/apps/CustomerGeneralInfo' && (
                                    <IconButton onClick={(e) => handleTaxEdit(e,customerData)}>
                                        <EditIcon />
                                    </IconButton>
                                    )}
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingTop: 2 }}>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Registered in GST:
                                    </Box>
                                    {customerData?.gst == 1 ? "Enabled" : customerData?.gst === 0 ? "Disabled" : "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        GST Number:
                                    </Box>
                                    {customerData?.gst == 1 ? customerData?.tax_id || "-" : "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        GST Treatment:
                                    </Box>
                                    {customerData?.gst == 1 ? customerData?.gst_name : "-"}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        {customerType !== 0
                            // && storage.company_type !== 2
                            ? <Accordion defaultExpanded elevation={0} square disableGutters
                                sx={{
                                    marginBottom: 2,
                                }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                                    backgroundColor: 'transparent',
                                    paddingY: 0,
                                    minHeight: 'unset',
                                    '&.MuiAccordionSummary-root': {
                                        minHeight: 'unset'
                                    },
                                    '& .MuiAccordionSummary-content': {
                                        margin: 0
                                    }
                                }} onClick={(e) => e.stopPropagation()}>
                                <Grid container display="flex" justifyContent="space-between">
                                    <Grid><Typography sx={{fontSize:'12px', fontWeight: 'bold' }}>Portal Access</Typography></Grid>
                                    {pathname !== '/apps/CustomerGeneralInfo' && (
                                    <IconButton onClick={(e) => handlePortalEdit(e,customerData)}>
                                        <EditIcon />
                                    </IconButton>
                                    )}
                                </Grid>
                            </AccordionSummary>
                                <AccordionDetails sx={{ paddingTop: 2 }}>
                                    <Typography className='contactscontent'>
                                        <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                            App Access:
                                        </Box>
                                        {customerData?.app_access == 1 ? "Enabled" : customerData?.app_access == 0 ? "Disabled" : "-"}
                                    </Typography>
                                    <Typography className='contactscontent'>
                                        <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                            Web Access:
                                        </Box>
                                        {customerData?.customer_web_access == 1 ? "Enabled" : customerData?.customer_web_access == 0 ? "Disabled" : "-"}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion> : ""}

                        <Accordion defaultExpanded elevation={0} square disableGutters
                            sx={{
                                marginBottom: 2,
                            }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                                backgroundColor: 'transparent',
                                paddingY: 0,
                                minHeight: 'unset',
                                '&.MuiAccordionSummary-root': {
                                    minHeight: 'unset'
                                },
                                '& .MuiAccordionSummary-content': {
                                    margin: 0
                                }
                            }}>
                                <Typography sx={{fontSize:'12px', fontWeight: 'bold' }}>Other Details</Typography>
                            </AccordionSummary>
                            {/* <AccordionDetails sx={{ paddingTop: 2 }}>
                                <Typography className='contactscontent'>Discount Type : {customerData?.discount_name || "-"}</Typography>
                                <Typography className='contactscontent'>Credit Days : {customerData?.credit_days}</Typography>
                                <Typography className='contactscontent'>Credit Value: {customerData?.credit_value}</Typography>
                                <Typography className='contactscontent'>TCS : {customerData?.tcs === 1 ? "Enabled" : customerData?.tcs === 0 ? "Disabled" : "-"}</Typography>
                                <Typography className='contactscontent'>Price List : {customerData?.price_list_name || "-"}</Typography>
                            </AccordionDetails> */}
                            <AccordionDetails sx={{ paddingTop: 2 }}>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Discount Type :
                                    </Box>
                                    {customerData?.discount_name || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Credit Days :
                                    </Box>
                                    {customerData?.credit_days || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Credit Value:
                                    </Box>
                                    {customerData?.credit_value || "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        TCS:
                                    </Box>
                                    {customerData?.tcs === 1 ? "Enabled" : customerData?.tcs === 0 ? "Disabled" : "-"}
                                </Typography>
                                <Typography className='contactscontent'>
                                    <Box component="span" sx={{ fontWeight: 'bold', marginRight: 1 }}>
                                        Price List:
                                    </Box>
                                    {customerData?.price_list_name || "-"}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        {/* {customerType !== 0 ? <Accordion defaultExpanded elevation={0} square>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'transparent' }}  disableGutters onClick={(e) => e.stopPropagation()}>
                                <Grid container display="flex" justifyContent="space-between">
                                    <Grid><Typography sx={{ fontWeight: 'bold' }}>Additional Contact</Typography></Grid>
                                    <Grid>
                                        <CustomerDetailPopup
                                            customerId={customerId}
                                            supplierId={customerData?.supplier_id}
                                            open={dialogOpen}
                                            handleClose={handleClosePopup}
                                            status={status}
                                            setStatus={setStatus}
                                            isEdit={isEdit}
                                            setIsEdit={setIsEdit}
                                            edit_id_data={edit_id_data}
                                            func1={func1}
                                        />
                                    </Grid>
                                    
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                 {customerData?.additional_contacts?.map((contact, index) => (
                                    <Grid container key={index} alignItems="center" justifyContent="space-between">
                                    <Grid size={10}>
                                        <Typography className='contactscontent'>Name: {contact?.first_name || "-"}</Typography>
                                        <Typography className='contactscontent'>Phone Number: {contact?.phone_number || "-"}</Typography>
                                        <Typography className='contactscontent'>Email: {contact?.email || "-"}</Typography>
                                        <Typography className='contactscontent'>Designation: {contact?.designation || "-"}</Typography>
                                        {/* <Typography className='contactscontent'>Gender: {contact?.gender || "-"}</Typography> */}
                                    {/* </Grid>
                                    <Grid size={2} textAlign="right">
                                        <IconButton onClick={() => {setIsEdit(true);
                                                                    setedit_id_data(contact);
                                                                    setDialogOpen(true);}}>
                                            <EditIcon />
                                        </IconButton>
                                    </Grid> */}
                                {/* </Grid> */}
                            {/* ))} */}
                            {/* </AccordionDetails> */}

                        {/* </Accordion> : ''}  */}


                         {/* {customerType !== 0 ? <Accordion defaultExpanded elevation={0} square> */}
                            {/* <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'transparent' }}>
                                <Grid container display="flex" justifyContent="space-between">
                                    <Grid><Typography sx={{ fontWeight: 'bold' }}>Address</Typography></Grid>
                                    
                                        <Grid>
                                            <ShippingDetailPopup
                                                // customerId={customerId}
                                                shippingId={customerData?.shipping_address?.[0]?.shipping_id}
                                                supplierId={customerData?.supplier_id}
                                                open={shippingDialogOpen}
                                                ApplyButton={shippingApply}
                                                handleClose={handleClose}
                                                formValues={formValues}
                                                setFormValues={setFormValues}
                                                formErrors={formErrors}
                                                setFormErrors={setFormErrors}
                                                status={status}
                                                handleEdit={null}
                                                setStatus={setStatus}
                                                requiredFields={requiredFields}
                                                type={"overview"}
                                                isEditMode={shippingIsEdit}
                                                handleShipping={handleShipping}
                                            /></Grid>
                                </Grid>
                            </AccordionSummary> */}
                            {/* <AccordionDetails>
                            {customerData?.shipping_address?.map((shipping, index) => (
                                    <Grid container key={index} alignItems="center" justifyContent="space-between">
                                        <Grid size={10}>
                                <Typography className='contactscontent'>Address: {shipping?.address || "-"}</Typography>
                                <Typography className='contactscontent'>City: {shipping?.city || "-"}</Typography>
                                <Typography className='contactscontent'>State: {shipping?.state || "-"}</Typography>
                                </Grid>
                                <Grid size={2} textAlign="right">
                                        <IconButton onClick={() => {
                                            setShippingIsEdit(true);
                                            setEditShippingData(shipping);
                                            setFormValues({
                                            address: shipping?.address || "",
                                            area: shipping?.area || "",
                                            latitude: shipping?.latitude || "",
                                            longitude: shipping?.longitude || "",
                                            zip: shipping?.pin_code || "",
                                            city: shipping?.city || "",
                                            state: shipping?.state || "",
                                            country: shipping?.country || "India",
                                            company_name : shipping?.company_name || ""
                                            });
                                            setShippingDialogOpen(true);
                                            setStatus('')
                                        }}>
                                            <EditIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            </AccordionDetails> */}
                        {/* </Accordion>  : ''} */}

                        {shippingOpen && <ShippingDetailPopup
                                                  type="bankdetail"
                                                  open={shippingOpen}
                                                  ApplyButton={shippingApply}
                                                  handleClose={shippingFilter}
                                                  formValues={shipformValues}
                                                  setFormValues={setShipFormValues}
                                                  formErrors={shipformErrors}
                                                  setFormErrors={setShipFormErrors}
                                                  status={status}
                                                  handleEdit={handleshippingEditSubmit}
                                                  setStatus={setStatus}
                                                  requiredFields={shiprequiredFields}
                                                  editshippingAddress={editShippingMode}
                                                  customerId={customerId}
                                                //   shippingData={props.shippingData}   
                                                //   setShippingData={props.setShippingData}
                                                  isEdit={isEdit}
                                                  customerData={customerData}
                                                />}

                    </Box>

                    {/* Separator */}
                    <Divider orientation="vertical" flexItem />

                    {/* Right Section */}
                    <Box sx={{ width: '100%'}}>
                        <Grid container>
                            <Grid size={12}>
                                { (customerType !== 3 && customerType !== 0 && storage.company_type !== 10) && (
                                    <>
                                        <CustomerTopCards
                                            customer_erp_details={customerErpDetails}
                                            matches={matches}
                                            customerType={customerType}
                                        />

                                        <div style={{ marginTop: 20 }}>
                                            <BillsRow
                                                customer_erp_details={customerErpDetails}
                                                customerType={customerType}
                                            />
                                        </div>
                                    </>
                                )}
                                <br></br>
                            {customerType === 2 ? (
                            <>
                                <Typography fontSize='12px' fontWeight='bold'>Purchase</Typography>
                                <IncomeExpenseCard customerData={customerData} customer_id={customer_id} customerType={customerType} supplier_id={supplierId}/>
                            </>
                        ) : customerType !== 0 ? (
                            <>
                                <Typography fontSize='12px' fontWeight='bold'>Sale</Typography>
                                <IncomeExpenseCard customerData={customerData} customer_id={customer_id} customerType={customerType} />
                            </>
                        ): null}
                            </Grid>
                            {/* {customerErpDetails?.timeLine_data?.length > 0 && ( */}
                                <>
                                { customerType !== 0 ? (
                                <Grid size={12}>
                                    <Divider orientation="horizontal" />
                                </Grid>
                                ):null}
                                
                                <Grid size={12}>
                                    <TimeLine customer_erp_details={customerErpDetails} contactType={contactType} />
                                </Grid>
                                </>
                            {/* )} */}
                        </Grid>
                        

                    </Box>
                </Box>
                {/* </Box> */}
            </CardContent>
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                 <DialogTitle>Edit Address</DialogTitle>

                 <DialogContent>
                     <Grid container spacing={2}>
                     <Grid
                         size={{
                             lg: 6,
                             md: 6,
                             sm: 12,
                             xs: 12
                         }}>
                         <TextField
                         fullWidth
                         variant="filled"
                         name="address"
                         label="Address"
                         value={editFormData.address}
                         onChange={(e) => handleChange('address', e.target.value)}
                         />
                     </Grid>

                     <Grid
                         size={{
                             lg: 6,
                             md: 6,
                             sm: 12,
                             xs: 12
                         }}>
                         <TextField
                         fullWidth
                         variant="filled"
                         name="area"
                         label="Area"
                         value={editFormData.area}
                         onChange={(e) => handleChange('area', e.target.value)}
                         />
                     </Grid>

                     <Grid
                         size={{
                             lg: 6,
                             md: 6,
                             sm: 12,
                             xs: 12
                         }}>
                         <TextField
                         fullWidth
                         variant="filled"
                         label="Pin Code"
                         value={editFormData.zip}
                         onChange={(e) => handleChange('zip', e.target.value)}
                         onWheel={ (e) => e.target.blur()}
                         placeholder='PinCode'
                         name='zip'
                         color='primary'
                         required
                         type='text'
                         inputProps={{
                         inputMode: 'numeric',       // brings up numeric keypad on mobile
                         pattern: '[0-9]*',          // restricts to digits
                         maxLength: 6                // actually enforces character limit
                       }}
                     regex=''
                     error={formErrors.zip === null ? false : true}
                     helperText={formErrors.zip === null ? '' : formErrors.zip}
                         />
                     </Grid>

                     <Grid
                         size={{
                             lg: 6,
                             md: 6,
                             sm: 12,
                             xs: 12
                         }}>
                         <TextField
                         fullWidth
                         variant="filled"
                         name="city"
                         label="City"
                         value={editFormData.city}
                         required
                         onChange={(e) => handleChange('city', e.target.value)}
                         error={formErrors.city === null ? false : true}
                         helperText={formErrors.city === null ? '' : formErrors.city}
                         />
                     </Grid>
                     <Grid
                         size={{
                             lg: 6,
                             md: 6,
                             sm: 12,
                             xs: 12
                         }}>
                     <Autocomplete
                         fullWidth={true}
                         name='state'
                         value={{state: !editFormData.state?.state  ? '' : editFormData.state?.state}}
                         options={_.uniqBy(Cities, 'state')}
                         getOptionLabel={(options) => options.state}
                         onChange={(event,value)=>handleChange('state',value)}
                         autoHighlight={true}
                         renderInput={(params) => (
                             <TextField
                             {...params}
                             label='State'
                             variant='filled'
                             error={formErrors.state === null ? false : true} 
                             helperText={formErrors.state === null ? '' : formErrors.state}
                             required={true}
                             />
                         )}
                         />
                         </Grid>

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
                                                 variant = 'contained'
                                                 color = 'error'
                                                 onClick = {() => setOpen(false)}
                                             >
                                                 Cancel
                                             </Button>
                                         </Grid>
                     
                                         <Grid>
                                             <Button
                                                 variant = 'contained'
                                                 color = 'primary'
                                                 onClick = {handleSubmit}
                                             >
                                                 Submit
                                             </Button>
                                         </Grid>
                                   
                     
                                     </Grid>
                                 </Grid>
                     </Grid>
                 </DialogContent>
             </Dialog>
            <Dialog open={tax} onClose={() => setTaxEdit(false)} fullWidth  maxWidth="md" >
                 <DialogTitle>Edit Tax Details</DialogTitle>

                 <>
                 <Grid container gap={3} p={3}>
                       <Grid
                           size={{
                               lg: 12,
                               md: 12,
                               sm: 6,
                               xs: 12
                           }}>
                         <FormControl>
                           <FormLabel id='demo-radio-buttons-group-label'>
                             Registered in GST
                           </FormLabel>

                           <RadioGroup
                             row
                             aria-label='customer'
                             value={gst ? 'true' : 'false'}
                             name='customer_type'
                             onChange={GST}
                           >
                             <FormControlLabel
                               value='true'
                               label='Yes'
                               control={<Radio />}
                             />
                             <FormControlLabel
                               value='false'
                               label='No'
                               control={<Radio />}
                             />
                           </RadioGroup>
                         </FormControl>
                       </Grid>
                
                       
                         
                           <Grid
                               size={{
                                   lg: 5,
                                   md: 5,
                                   sm: 5,
                                   xs: 12
                               }}>
                             <TextField
                               onChange={(e)=>handleChange('gstNumber',e.target.value.toUpperCase())}
                               style={{}}
                               fullWidth={true}
                               placeholder='Gst Number'
                               label='Gst Number '
                               name='tax_id'
                               value={editFormData.gstNumber === null ? '' : editFormData.gstNumber}
                               required={gst}
                               disabled={!gst}
                               color='primary'
                               type='text'
                               variant='filled'
                               error={formErrors.gstNumber === null ? false : true}
                               helperText={formErrors.gstNumber === null ? '' : formErrors.gstNumber}
                               inputProps={{ maxLength: 15 }}
                             />
                           </Grid>
                         
                       

                       {
                         !gst ? (
                           <Grid
                               size={{
                                   lg: 5,
                                   md: 5,
                                   sm: 5,
                                   xs: 12
                               }}>
                             <Autocomplete
                               options={gstTypes}
                               getOptionLabel={(option) => option.name}
                               isOptionEqualToValue={(option, value) => option.id === value.id}
                               value={gstTypes?.find((type) => type.id === editFormData.gst_type) || null}
                               onChange={(event, newValue) => {
                                 handleChange('gst_type', newValue ? newValue.id : "");
                                 }}
                              disabled={!gst}
                               renderInput={(params) => (
                                 <TextField
                                   {...params}
                                    label="Select a GST treatment"
                                    variant="filled"
                                    required={gst}
                                    fullWidth
                                    error={!!formErrors.gst_type}
                                    helperText={formErrors.gst_type || ""}
                                  />
                                )}
                               renderOption={(props, option) => (
                                 <MenuItem {...props} key={option.id} value={option.id}>
                                   <div>
                                     <strong style={{ fontSize: '20px', color: "black" }}>{option.name}</strong>
                                     <br />
                                     <small style={{ fontSize: '14px', color: "gray" }}>{option.description}</small>
                                   </div>
                                 </MenuItem>
                               )}
                             />
                           </Grid> 
                         ) : ( 
                           <Grid
                               size={{
                                   lg: 5,
                                   md: 5,
                                   sm: 5,
                                   xs: 12
                               }}> 
                             <Autocomplete
                               options={gstTypes}
                               getOptionLabel={(option) => option.name}
                               isOptionEqualToValue={(option, value) => option.id === value}
                               value={gstTypes?.find((type) => type.id === editFormData.gst_type) || null}
                               onChange={(event, newValue) => {
                                 handleChange('gst_type', newValue ? newValue.id : "");
                                 }}
                               disabled={gst === 'false' ? true : false}
                               renderInput={(params) => (
                                   <TextField 
                                     {...params} 
                                    label="Select a GST treatment" 
                                     variant="filled" 
                                     fullWidth  
                                     required={gst}
                             
                                     error={!!formErrors.gst_type}
                                     helperText={formErrors.gst_type || ''}
                                  />
                                )}
                               renderOption={(props, option) => (
                                 <MenuItem {...props} key={option.id} value={option.id}>
                                     <div>
                                     <strong className='cardheadervalue'>{option.name}</strong>
                                     <br />
                                     <small style={{ fontWeight: "5",fontSize:'11px', color: "gray" }}>{option.description}</small>
                                   </div>
                                 </MenuItem>
                               )}
                             />
                         </Grid>
                         )
                       }

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
                                         variant = 'contained'
                                         color = 'error'
                                         onClick = {() => setTaxEdit(false)}
                                     >
                                         Cancel
                                     </Button>
                                 </Grid>
             
                                 <Grid>
                                     <Button
                                         variant = 'contained'
                                         color = 'primary'
                                         onClick = {handleTaxSubmit}
                                     >
                                         Submit
                                     </Button>
                                 </Grid>
                         
             
                             </Grid>
                         </Grid>
                       </Grid>
                   </>
             </Dialog>
            <Dialog open={portal} onClose={() => setPortalEdit(false)} fullWidth  maxWidth="md">
                <DialogContent>
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
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                      <Typography variant='h6'>Portal Access</Typography>
                                    </Grid>
                    
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={appAccess }
                                      onChange={(e) => appAccessFunc(e,'app')}
                                    />
                                  }
                                  label='App Access'
                                />
                              </Grid>
                    
                                <Grid
                                    size={{
                                        lg: 3,
                                        md: 4,
                                        sm: 6,
                                        xs: 12
                                    }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={webAccess }
                                      onChange={(e) => appAccessFunc(e,'web')}
                                    />
                                  }
                                  label='Web Access'
                                />
                              </Grid>
                    
                              {(appAccess == true || webAccess == true) && <>
                              <Grid
                                  size={{
                                      lg: 3,
                                      md: 4,
                                      sm: 6,
                                      xs: 12
                                  }}>
                                      <TextField
                                          inputRef={textRef}
                                          fullWidth={true}
                                          name='username'
                                          label='User Name'
                                          autoComplete='off'
                                          placeholder='User Name'
                                          type='text'
                                          // value={formValues.username
                                          //       ? formValues.username.includes('.')
                                          //         ? formValues.username.split('.')[1] || ''
                                          //         : formValues.username
                                          //       : ''
                                          // }
                                          value={
                                            storage.company_type === 3 && (appAccess == true || webAccess == true)
                                              ? editFormData.phone_number || ''
                                              : editFormData.username?.includes('.')
                                                ? editFormData.username.split('.')[1] || ''
                                                : editFormData.username || ''
                                             
                                          }
                                          InputProps={{
                                            startAdornment: <InputAdornment position="start">{getprefix_data[0]?.value + "."}</InputAdornment>,
                                          }}
                                          variant='filled'
                                          required={ appAccess || webAccess}
                                          onChange={(e)=>handleChange('username',e.target.value)}
                                          onBlur={(e)=>handleChange('username',e.target.value)}
                                          error={storage?.company_type !== 3 ? formErrors.username : false}
                                          helperText={storage?.company_type !== 3 ? formErrors.username === null ? <div style={{ color: "green" }}>{concate}</div> : formErrors.username : ""}
                                          disabled={
                                            storage.company_type === 3  && !!editFormData.phone_number
                                          }
                                        />
                                      </Grid>
                                    
                    
                                    { <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 12
                                        }}>
                                        <form>
                                          <TextField
                                            onChange={(e)=>handleChange('password',e.target.value)}
                                            onFocus={handleOnFocus}
                                            onBlur={handleOnBlur}
                                            onKeyUp={handleOnKeyUp}
                                            fullWidth={true}
                                            placeholder='Password'
                                            label='Password'
                                            name='password'
                                            // value={
                                            //   formValues.password || ''
                                            // }
                                            value={
                                                (appAccess == true || webAccess == true)
                                                    ? (storage.company_type === 3
                                                        ? editFormData.phone_number || ''
                                                        : editFormData.password || '')
                                                    : ''
                                            }
                                            color='primary'
                                            type={showPassword ? 'text' : 'password'}
                                            required = {appAccess || webAccess}
                                            variant='filled'
                                            // error={!!formErrors.password}
                                            // helperText={formErrors.password || ''}
                                            error={
                                              !!formErrors.password &&
                                              !(storage?.company_type === 3)
                                            }
                                            helperText={
                                              storage?.company_type === 3
                                                ? ''
                                                : formErrors.password || ''
                                            }
                                            
                                            disabled={
                                              storage.company_type === 3 &&  !!editFormData.phone_number
                                            }
                                            autoComplete='off'
                                            InputProps={{
                                              endAdornment: (
                                                <InputAdornment position="end">
                                                  <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                  >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                  </IconButton>
                                                </InputAdornment>
                                              ),
                                            }}


                                            // disabled={storage.company_type === 12 && !!formValues.phone_number}
                                          />
                                          
                                             {pwdRequiste && (
                                            <PWDRequisite
                                                pwdLengthFlag={checks.pwdLengthCheck ? 'valid' : 'invalid'}
                                                removeSpace={checks.removeSpace ? 'invalid' : 'valid'}
                                            />
                                            )}
                                          {/* {pwdRequiste && (
                                            <PWDRequisite
                                              pwdLengthFlag={checks.pwdLengthCheck ? 'valid' : 'invalid'}
                                              removeSpace={checks.removeSpace ? 'invalid' : 'valid'}
                                            />
                                          )} */}
                                        </form>
                                      </Grid>}
                                      </>}
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
                                        variant = 'contained'
                                        color = 'error'
                                        onClick = {() => setPortalEdit(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
            
                                <Grid>
                                    <Button
                                        variant = 'contained'
                                        color = 'primary'
                                        onClick = {handlePortalSubmit}
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                        
            
                            </Grid>
                        </Grid>
                                  </Grid>
                                </Grid>
                </DialogContent>
            </Dialog>
        </Card>
    );
};




export default OverviewForAllCustType
