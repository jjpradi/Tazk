import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Box, Typography, Card, Grid } from '@mui/material';
import MaterialTable from 'utils/SafeMaterialTable';
import { headerStyle, cellStyle, maxHeight, pageSize } from '../../../utils/pageSize';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CustomerDetailPopup from 'pages/sales/customer/organizationpopup';
import { useDispatch, useSelector } from 'react-redux';
import AdditionalDetailsForm from './additionalDetailsForm'
import ShippingDetailForm from './shippingDetailForm';
import { customerDetailByIdAction, updateAdditionalContactAction, updateBankDetailsAction, updateShippingAddressAction } from 'redux/actions/customer_actions';
import BankDetailPopup from './bankDetailsForm';
 import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';

const Details = (props) => {
  const dispatch = useDispatch()
  const [tabIndex, setTabIndex] = useState(0);
  const [organizationOpen, setOrganizationOpen] = useState(false);
const [status, setStatus] = useState('');
const [editIdData, setEditIdData] = useState(null);
const [shippingOpen, setShippingOpen] = useState(false)
const [shipStatus, setShipStatus ] = useState('create')
const [filterOpen, setFilteropen] = useState(false)
const [organizationdata, setorganizationdata] = useState([]);
const {customerReducer: { selectCustomer, selectCustomerCount, customerDetailById }} = useSelector(state => state)
console.log(selectCustomer, selectCustomerCount, props.customer_id, customerDetailById, 'customerreducer')

const [formValues, setFormValues] = useState({  
    gender: null,
    first_name: null,
    phone_number: null,
    email: null,
    designation: null,
    last_name: null,});

    const [shippingFormValues, setShippingFormValues] = useState({
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

      const [bankvalues, setBankValues] = useState ({
          acc_number : null,
          bank_name : null,
          branch : null,
          ifsc_code : null,
          IsPrimary : null
        })

  const [requiredFields] = useState([ 
    'gender',
    'first_name',
    'email',
    'phone_number'
  ]);

  const [ShippingrequiredFields] = useState([ 
      'company_name',
      'zip',
      'state',
      'city',
      'address',
      'area'
    ]);

  const [formErrors, setFormErrors] = useState({
    first_name: null,
    phone_number: null,
    email: null,
    gender:null
  });

  const [shippingFormErrors, setShippingFormErrors] = useState({
      company_name: null,
      contactperson_num: null,
      zip: null,
      state: null,
      city: null,
      address: null,
      area: null
    });

    useEffect(()=> {
    dispatch(customerDetailByIdAction(props.customer_id))
    },[selectCustomer])

     const bankApply = (values) =>{
    console.log('valuessssss', values)
    setBankValues({ acc_number : null,
      bank_name : null,
      branch : null,
      ifsc_code : null,
      IsPrimary : null,
     })
     let data ={
      acc_number : bankvalues.acc_number,
      bank_name : bankvalues.bank_name,
      branch : bankvalues.branch,
      ifsc_code : bankvalues.ifsc_code,
      IsPrimary : bankvalues.IsPrimary === 'primary' ? 1 : 0,
      type: 'customer_id',
      id: props.customer_id
     }
     dispatch(updateBankDetailsAction(data))
    setFilteropen(false)

  }

const shippingApply = async(values) =>{
    console.log('shippingdatas', values)
    setShippingFormValues({ company_name: null,
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
        area : null})
    setShippingOpen(false)
  }

  const shippingFilter = (data) =>{
        setShippingOpen(data)
  }

const handleAddClick = () => {
  console.log(tabIndex,'tab1indexxx1')
  setStatus('add');
  if(tabIndex === 0){
    setShippingOpen(true)
  } else if(tabIndex === 1){
    setFilteropen(true)
  } else if(tabIndex === 2) {
  setOrganizationOpen(true);
  }
};

const handleClose = () => {
  setOrganizationOpen(false);
  setFormValues({  
    gender: null,
    first_name: null,
    phone_number: null,
    email: null,
    designation: null,
    last_name: null})
};

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  console.log('tabIndex',props.type)
  const tabLabels = ['Shipping Address', 'Bank Details', 'Additional Contacts'];

  const shippingColumns = [
    { title: 'Company Name', field: 'company_name' },
    { title: 'Address', field: 'address' },
    { title: 'Area', field: 'area' },
    { title: 'Pin Code', field: 'pin_code' },
    { title: 'City', field: 'city' },
    { title: 'State', field: 'state' },
    { title: 'Country', field: 'country' }
  ];

  const bankColumns = [
    { title: 'Account Number', field: 'acc_number' },
    { title: 'Bank Name', field: 'bank_name' },
    { title: 'Branch', field: 'branch' },
    { title: 'IFSC Code', field: 'ifsc_code' },
    { title: 'Primary', field: 'IsPrimary' }
  ];

  const additionalContact = [
    { title: 'First Name', field: 'first_name' },
    { title: 'Last Name', field: 'last_name' },
    { title: 'Gender', field: 'gender', render: (rowData) =>
    rowData.gender === 1 ? 'Male' :
    rowData.gender === 2 ? 'Female' :
    'Others'},
    { title: 'Designation', field: 'designation' },
    { title: 'Email', field: 'email' },
    { title: 'Phone Number', field: 'phone_number' }
  ];

  const getCurrentTabContent = () => {
    switch (tabIndex) {
      case 0:
        return { title: 'Shipping Address', columns: shippingColumns };
      case 1:
        return { title: 'Bank Details', columns: bankColumns };
      case 2:
        return { title: 'Additional Contacts', columns: additionalContact };
      default:
        return { title: '', columns: [] };
    }
  };

const emptyData = tabIndex === 0
  ? props?.customerDetailById[0]?.shipping_address || []
  : tabIndex === 1
    ? props?.customerDetailById[0]?.bank_details || []
    : props?.customerDetailById[0]?.additional_contacts || [];

  const addContact = props?.customerDetailById[0]?.additional_contacts
  const shipadd = props?.customerDetailById[0]?.shipping_address
  const bankdetails = props?.customerDetailById[0]?.bank_details
  const { title, columns } = getCurrentTabContent();
  console.log( props.customerDetailById, emptyData, bankdetails, shipadd, addContact, 'emptytytytyy')

  return (
    <>
      <Grid container>
       <Grid
         size={{
           lg: 2,
           md: 2,
           sm: 2,
           xs: 12
         }}>
        <Card
                  sx={{maxHeight: `calc(${maxHeight} - 41px)`, minHeight: `calc(${maxHeight} - 41px)`, borderRight: '1px solid #e0e0e0'}}>
                  <Tabs
                    orientation="vertical"
                    value={tabIndex}
                    onChange={handleChange}
                    variant="scrollable"
                    TabIndicatorProps={{ style: { display: 'none' } }}
                  >
                    {tabLabels.map((label, index) => (
                      <Tab
                        key={index}
                        label={label}
                        sx={{
                          alignItems: 'flex-start',
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          textTransform: 'capitalize',
                          px: 2,
                          borderRight: tabIndex === index ? '3px solid #0A8FDC' : '3px solid transparent',
                          backgroundColor: tabIndex === index ? 'rgba(10, 143, 220, 0.1)' : 'transparent',
                          color: tabIndex === index ? '#0A8FDC' : '#6B7280',
                          fontWeight: tabIndex === index ? 'bold' : 'normal',
                          borderRadius: 0,
                        }}
                      />
                    ))}
                  </Tabs>
                </Card>
       </Grid>
       <Grid
         marginLeft='10px'
         size={{
           lg: 9.8,
           md: 9.8,
           sm: 9,
           xs: 12
         }}>
        <Card sx={{ maxHeight: `calc(${maxHeight} - 41px)`, minHeight: `calc(${maxHeight} - 41px)` }}>
           <MaterialTable
          title={title}
          columns={columns}
          data={emptyData}
          options={getStickyTableOptions({
             cellStyle: cellStyle,
              headerStyle: headerStyle,
               bodyOffset: 200,
            options:{
               paging: true,
                    search: false,
                    exportButton: true,
                    maxBodyHeight: `calc(${maxHeight} - 160px)`,
                    minBodyHeight: `calc(${maxHeight} - 160px)`,
                    pageSize: pageSize,
                    pageSizeOptions: [20, 50, 100],
                   
                    tableLayout: "auto",
                    toolbar: true,
            },
          })}
                    actions={[
    {
      icon: () => <AddCircleOutlineIcon color="primary" />,
      tooltip: 'Add',
      isFreeAction: true,
      onClick: handleAddClick
    }
  ]}
          localization={{
            body: { emptyDataSourceMessage: 'No records to display' }
          }}
        />
        </Card>
       </Grid>
      </Grid>
      <AdditionalDetailsForm
      formValues={formValues}
      setFormValues={setFormValues}
      requiredFields={requiredFields}
      formErrors={formErrors}
      setFormErrors={setFormErrors}
        open={organizationOpen}
        setOrganizationOpen={setOrganizationOpen}
        handleClose={handleClose}
        ApplyButton={() => { }}
        status={status}
        setStatus={setStatus}
        edit_id_data={editIdData}
        type='custdetails'
        customerId={props.customer_id}
        customerDetailById={props.customerDetailById}
      />
      <ShippingDetailForm
        type={'bankdetail'}
        open={shippingOpen}
        ApplyButton={shippingApply}
        handleClose={shippingFilter}
        formValues={shippingFormValues}
        setFormValues={setShippingFormValues}
        formErrors={shippingFormErrors}
        setFormErrors={setShippingFormErrors}
        status={shipStatus}
        setStatus={setShipStatus}
        requiredFields={ShippingrequiredFields}
        customerId={props.customer_id}
        organizationdata={organizationdata}
        setorganizationdata={setorganizationdata}
      />
      <BankDetailPopup
        open={filterOpen}
        setFilteropen={setFilteropen}
        ApplyButton={bankApply}
        bankValues={bankvalues}
        setBankValues={setBankValues}
        status={status}
        setStatus={setStatus}
      />
    </>
  );
};

export default Details;

