import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Autocomplete, Button, Card, FormControl, FormControlLabel, Grid, IconButton, Radio, RadioGroup, TextField, Tooltip, Typography } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listCustomerAction } from "redux/actions/customer_actions";
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment";
import MaterialTable, { MTableAction } from "utils/SafeMaterialTable";
import { headerStyle, cellStyle } from 'utils/pageSize';
import {Close, Edit} from '@mui/icons-material';
import { listUserCreationAction } from "redux/actions/userCreation_actions";
import { getsessionStorage } from "pages/common/login/cookies";
import { createQuotationAction, getConfigAmountDiscountAction, getQuotationConfigAction, getQuotationSequenceAction } from "redux/actions/quotation_actions";
import PropTypes from "prop-types";
import CreateNewButtonContext from "context/CreateNewButtonContext";
import { getLeadCustomersAction } from "redux/actions/leadManagement_actions";
import { Sales_Item_Taxes } from "pages/sales/sales/sale_status_list";
import { listProductAction } from "redux/actions/product_actions";
import { OpenalertActions } from "redux/actions/alert_actions";
import { requiredFieldsAlertMessage } from "utils/content";
import toMomentOrNull from 'utils/DateFixer';

function QuotationForm(props) {

  const storage = getsessionStorage()
  const dispatch = useDispatch()
  const {
    customerReducer: {customer},
    UserCreationReducer: {createUser},
    quotationReducer: {quotationSequence, quotationConfigAmountDiscount},
    leadManagementReducers : {getLeadsCustomers,allLeads},
    productReducer : { product }
  } = useSelector(state => state)
  const currentDate = new Date().toISOString().split('T')[0]
  const cancelActionRef = useRef(null)
  const bulkEditRef = useRef(null)
  const addActionRef = useRef(null)
  const {setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext)

  const[formValues, setFormValues] = useState({
    customer: null,
    quotationFor: null,
    reference: null,
    expiry: null,
    paymentTerms: null,
    deliveryTerms: null,
    quotationDate: currentDate,
    terms: null,
    products: [],
    contact: null,
    subTotal: 0,
    // discountType: 'percent'
  })
  const[formErrors, setFormErrors] = useState({
    customer: null,
    expiry: null,
    quotationDate: null,
    terms: null,
    products: null,
    contact: null
  })
  const requiredFields = ['customer', 'expiry', 'quotationDate', 'terms', 'products', 'contact']
  const expiryOptions = ['1 Week', '2 Weeks', '3 Weeks', '30 Days', '60 Days', '90 Days', '120 Days']
  const productColumns = [
    {
      title: 'Product', 
      field: 'product',
      render: (rowData) => {
        return rowData.product.name || ''
      },
      validate: (rowData) => (!rowData.product ? false : true),
      editComponent: (Props) => (
        // <TextField
        //   name="product"
        //   value={Props.value}
        //   variant='filled'
        //   label='Product'
        //   onChange={(e) => {
        //     Props.onRowDataChange({
        //       ...Props.rowData,
        //       product: e.target.value
        //     })
        //   }}
        // />
        (<Autocomplete
          options = {product}
          getOptionLabel = {(option) => option.name || ''}
          value = {Props.rowData.product || null}
          onChange = {(event, newValue) => {
            Props.onRowDataChange({
              ...Props.rowData,
              product : newValue
            })
          }}
          renderInput = {(params) => (
            <TextField 
              {...params}
              name = 'product'
              variant = 'filled'
              label = 'Product'
            />
          )}
        />)
      )
    }, 
    {
      title: 'Description', 
      field: 'description',
      validate: (rowData) => (!rowData.description ? false : true),
      editComponent: (Props) => (
        <TextField
          name="description"
          value={Props.value}
          variant='filled'
          label='Description'
          onChange={(e) => {
            Props.onRowDataChange({
              ...Props.rowData,
              description: e.target.value
            })
          }}
        />
      )
    }, 
    {
      title: 'Qty', 
      field: 'quantity',
      validate: (rowData) => (!rowData.quantity ? false : true),
      editComponent: (Props) => (
        <TextField
          name="quantity"
          value={Props.value}
          type='number'
          variant='filled'
          label='Quantity'
          onChange={(e) => {
            Props.onRowDataChange({
              ...Props.rowData,
              quantity: e.target.value
            })
          }}
        />
      )
    }, 
    {
      title: 'Price', 
      field: 'price',
      validate: (rowData) => (!rowData.price ? false : true),
      editComponent: (Props) => (
        <TextField
          name="price"
          value={Props.value}
          type='number'
          variant='filled'
          label='Price'
          onChange={(e) => {
            Props.onRowDataChange({
              ...Props.rowData,
              price: e.target.value
            })
          }}
        />
      )
    }, 
    {
      title: 'Discount Type',
      field: 'discountType',
      initialEditValue: 'percent',
      validate: (rowData) => (!rowData.discountType ? false : true),
      editComponent: ({value, onChange, rowData, onRowDataChange}) => (
        <>
          <FormControl>
            <RadioGroup
              row
              aria-labelledby='demo-row-radio-buttons-group-label'
              name='discountType'
              value={value || 'percent'}
              onChange={(e) => {
                const val = e.target.value
                onRowDataChange({
                  ...rowData,
                  discountType: val,
                  netPrice: calculateNetPrice(e, 'discountType',rowData),
                  total: calculateTotal(e, 'discountType', rowData)
                })
              }}
            >
              <FormControlLabel
                value='percent'
                control={<Radio />}
                label={<Typography variant='h1'>Perc %</Typography>}
              />
              <FormControlLabel
                value='flat'
                control={<Radio />}
                label={<Typography variant='h1'>Flat</Typography>}
              />
            </RadioGroup>
          </FormControl>
        </>
      )
    },
    {
      title: 'Discount', 
      field: 'discount',
      validate: (rowData) => (!rowData.discount ? false : true),
      editComponent: (Props) => (
        <TextField
          name="discount"
          value={Props.value}
          type='number'
          variant='filled'
          label='Discount'
          onChange={(e) => {
            Props.onRowDataChange({
              ...Props.rowData,
              discount: e.target.value,
              netPrice: calculateNetPrice(e, 'discount', Props.rowData),
              total: calculateTotal(e, 'discount', Props.rowData)
            })
          }}
        />
      )
    }, 
    {
      title: 'Net Price', 
      field: 'netPrice',
      validate: (rowData) => (!rowData.netPrice ? false : true),
      editComponent: (Props) => (
        <TextField
          name="netPrice"
          value={Props.value || ''}
          type='number'
          variant='filled'
          label='Net Price'
          onChange={(e) => {
            Props.onRowDataChange({
              ...Props.rowData,
              netPrice: e.target.value
            })
          }}
        />
      )
    }, 
    {
      title: 'Total', 
      field: 'total',
      validate: (rowData) => (!rowData.total ? false : true),
      editComponent: (Props) => (
        <TextField
          name="total"
          value={Props.value || ''}
          type='number'
          variant='filled'
          label='Total'
          onChange={(e) => {
            Props.onRowDataChange({
              ...Props.rowData,
              total: e.target.value
            })
          }}
        />
      )
    }
  ]

  useEffect(() => {
    const data = {
      searchString: "",
      type_details: "customer",
      type: 1,
      pageCount: 0,
      numPerPage: 15
  }
    dispatch(listCustomerAction())
    dispatch(listUserCreationAction())
    dispatch(getConfigAmountDiscountAction())
    dispatch(getQuotationSequenceAction(setModalTypeHandler, setLoaderStatusHandler))
    // dispatch(getLeadCustomersAction())
    dispatch(listProductAction())

    if(props?.type === 'details'){
      setFormValues((prevData)=> ({
          ...prevData,customer: props?.data?.customer_id
      }))
  }
  }, [])
  
  useEffect(() => {
    let subTotal = 0
    formValues.products.forEach((product) => {
      subTotal = subTotal + parseInt(product.total)
    })
    setFormValues((prev) => ({...prev, subTotal: subTotal}))
  }, [formValues.products])

  useEffect(() => {
    if(createUser.length > 0){
      const userEmployeeId = storage?.employee_id
      const user = createUser.find(d => d?.employee_id === userEmployeeId)
      setFormValues((prev) => ({...prev, contact: user?.employee_id}))
    }
  }, [createUser])

  const calculateTotal = (e, name, rowData) => {
    const discountType = name === 'discountType' ? e.target.value : rowData.discountType
    if(discountType === 'flat') {
      const discount = name === 'discountType' ? (rowData.discount || 0) : e.target.value 
      const netPrice = rowData.price - discount
      const total = netPrice * rowData.quantity
      return total.toFixed(2)
    }
    else {
      const discount = name === 'discountType' ? (rowData.discount || 0) : e.target.value 
      const discountPrice = (discount / 100) * rowData.price
      const netPrice = rowData.price - discountPrice
      const total = netPrice * rowData.quantity
      return total.toFixed(2)
    }
  }

  const calculateNetPrice = (e, name, rowData) => {
    const discountType = name === 'discountType' ? e.target.value : rowData.discountType
    if(discountType === 'flat') {
      const discount = name === 'discountType' ? (rowData.discount || 0) : e.target.value 
      const netPrice = rowData.price - discount
      return netPrice.toFixed(2)
    }
    else {
      const discount = name === 'discountType' ? (rowData.discount || 0) : e.target.value 
      const discountPrice = (discount / 100) * rowData.price
      const netPrice = rowData.price - discountPrice
      return netPrice.toFixed(2)
    }
  }

  const handleChange = (name, value) => {
    setFormValues((prev) => ({...prev, [name]: value}))
    if(requiredFields.includes(name)){
      if(value !== null && value !== ''){
        setFormErrors((prev) => ({...prev, [name]: null}))
      }
      else{
        setFormErrors((prev) => ({...prev, [name]: `${name} is Required`}))
      }
    }
  }

  const handleDateChange = (name, value) => {
    if(value === null){
        setFormValues({...formValues, [name]: null})
        setFormErrors({...formErrors, [name]: `Quotation Date is Required`})
    }
    else if(!value?._isValid){
        setFormValues({...formValues, [name]: null})
        setFormErrors({...formErrors, [name]: `Quotation Date is Invalid`})
    }
    else{
        setFormValues({...formValues, [name]: moment(value._d).format('YYYY-MM-DD')})
        setFormErrors({...formErrors, [name]: null})
    }
  }

  const handleSubmit = async(event) => {
    event.preventDefault()
    let isValid = true
    let formErrorsObj = {...formErrors}

    Object.keys(formValues).forEach((key) => {
      if(requiredFields.includes(key) && formValues[key] === null || formValues[key] === 'null' || formValues[key] === ''){
        isValid = false
        formErrorsObj[key] = `${key} is Required`
      }
      if(key === 'products' && formValues[key].length === 0){
        isValid = false
        formErrorsObj[key] = 'Products is Required'
      }
    })

    setFormErrors(formErrorsObj)

    if(isValid){
      let status = 'Approved'
      if(quotationConfigAmountDiscount.length > 0) {
        // For subTotal exceed
        if(quotationConfigAmountDiscount[0].maxQuotationAmount && parseInt(formValues.subTotal) > parseInt(quotationConfigAmountDiscount[0].maxQuotationAmount)){
          status = 'Waiting For Approval'
        }
        // For Discount exceed
        const isDiscountExceeded = formValues.products.some(product => parseInt(product.discount) > parseInt(quotationConfigAmountDiscount[0].maxProductDiscount))
        if(isDiscountExceeded){
           status = 'Waiting For Approval'
        }
      }
      let payload = {...formValues, products : formValues.products.map((e) => ({...e, product: e.product.name,item_id : e.product.item_id})), quotation_number: quotationSequence?.sequence, status: status}
      await dispatch(createQuotationAction(payload))
      props.handleClose()
    }
    else{
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
    }
  }

  // console.log(getLeadsCustomers,'getLeadsCustomers')

  return (
    <Card sx={{p: 3,overflow:'scroll'}}>
      <Grid container spacing={3}>

        <Grid
          sx={{pt: 3, pl: 4}}
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Typography>New Quotation - {quotationSequence?.sequence || ''}</Typography>
        </Grid>

        <Grid
          size={{
            lg: props.type === 'details' ? 0 : 10,
            md: props.type === 'details' ? 0 : 10,
            sm: props.type === 'details' ? 0 : 10,
            xs: props.type === 'details' ? 0 : 10
          }}>
          <Grid container spacing={3}>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 4,
                xs: 12
              }}>
              <Autocomplete
                value={
                  customer?.find((e) => formValues?.customer === e?.customer_id) || null
                }
                options={(customer || []).filter((option) => option.company_name)}
                getOptionLabel={(option) =>
                  option.company_name
                }
                disabled = {props.type === 'details'}
                
                onChange = {(event, newValue) => handleChange('customer', newValue.customer_id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    variant="filled"
                    required
                    fullWidth
                    error = {formErrors.customer !== null}
                    helperText = {formErrors.customer !== null ? 'Customer is Required' : ''}
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
                value = {formValues.quotationFor}
                onChange = {(event) => handleChange('quotationFor', event.target.value)}
                variant = 'filled'
                label = 'Subject'
                fullWidth
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
                value = {formValues.reference}
                onChange = {(event) => handleChange('reference', event.target.value)}
                variant = 'filled'
                label = 'Reference'
                fullWidth
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
                value = {formValues.expiry}
                options = {expiryOptions}
                onChange = {(event, newValue) => handleChange('expiry', newValue)}
                renderInput = {(params) => (
                  <TextField
                    {...params}
                    label = 'Expiry'
                    variant = 'filled'
                    required
                    fullWidth
                    error = {formErrors.expiry !== null}
                    helperText = {formErrors.expiry !== null ? 'Expiry is Required' : ''}
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
                value = {formValues.paymentTerms}
                onChange = {(event) => handleChange('paymentTerms', event.target.value)}
                variant = 'filled'
                label = 'Payment Terms'
                fullWidth
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
                value = {formValues.deliveryTerms}
                onChange = {(event) => handleChange('deliveryTerms', event.target.value)}
                variant = 'filled'
                label = 'Delivery Terms'
                fullWidth
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
                <DatePicker
                  label = 'Quotation Date'
                  format='DD/MM/YYYY'
                  value = {toMomentOrNull(formValues.quotationDate)}
                  onChange = {(event) => handleDateChange('quotationDate', event)}
                  slotProps={{ textField: { required: true, fullWidth: true, variant: 'filled', error: formErrors.quotationDate !== null, helperText: formErrors.quotationDate !== null ? formErrors.quotationDate : '' } }}
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
              <Autocomplete
                value = {createUser.find(e => formValues.contact === e?.employee_id) || ''}
                options = {createUser}
                getOptionLabel = {(option) => option.last_name ? `${option.first_name} ${option.last_name}` : option.first_name || ''}
                onChange = {(event, newValue) => handleChange('contact', newValue?.employee_id)}
                renderInput = {(params) => (
                  <TextField
                    {...params}
                    label = 'Contact'
                    variant = 'filled'
                    required
                    fullWidth
                    error = {formErrors.contact !== null}
                    helperText = {formErrors.contact !== null ? 'Contact is Required' : ''}
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
                value = {formValues.terms}
                onChange = {(event) => handleChange('terms', event.target.value)}
                variant = 'filled'
                label = 'Terms'
                fullWidth
                rows = {3}
                multiline
                required
                error = {formErrors.terms !== null}
                helperText = {formErrors.terms !== null ? 'Terms is Required' : ''}
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <MaterialTable
                columns={productColumns}
                data={formValues.products}
                title='Product List'
                options={{
                  headerStyle,
                  cellStyle,
                  showTitle: true,
                  actionsColumnIndex: -1
                }}
                components={{
                  Action: (props) => {
                    if(props.action.tooltip === 'Cancel'){
                      return(
                        <div ref={cancelActionRef} onClick={props.action.onClick}>
                          <Tooltip title='Cancel'>
                            <IconButton>
                              <Close />
                            </IconButton>
                          </Tooltip>
                        </div>
                      )
                    }
                    if(props.action.tooltip === 'Edit All'){
                      return(
                        <div ref={bulkEditRef} onClick={props.action.onClick}>
                          <Tooltip title='Edit All'>
                            <IconButton>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </div>
                      )
                    }
                    if(typeof props.action === typeof Function || props.action.tooltip !== 'Add'){
                      return <MTableAction {...props} />
                    }
                    else{
                      return(
                        <div ref={addActionRef} onClick={props.action.onClick}/>
                      )
                    }
                  }
                }}
                actions={[
                  {
                    icon: 'add',
                    tooltip: 'add',
                    isFreeAction: true,
                    onClick: () => {
                      addActionRef.current.click()
                    }
                  }
                ]}
                editable={{
                  onRowAdd: (newData) => 
                    new Promise((resolve, reject) => {
                      setTimeout(() => {
                        const sanitizedData = { ...newData };
                        delete sanitizedData['tableData'];
                  
                        const updatedData = {
                          ...sanitizedData,
                          sales_item_taxes: Sales_Item_Taxes(
                            props.product,
                            [{ item_id: sanitizedData.item_id }],
                            formValues.products,
                            sanitizedData.item_unit_price
                          ),
                        };
                  
                        setFormValues((prev) => ({
                          ...prev,
                          products: [...prev.products, updatedData],
                        }));
                  
                        setFormErrors((prev) => ({
                          ...prev,
                          products: null,
                        }));
                  
                        setTimeout(() => {
                          if (addActionRef.current) {
                            addActionRef.current.click();
                          }
                        }, 0);
                  
                        resolve();
                      }, 1000);
                    }),              
                  onRowUpdate: (newData, oldData) => new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataUpdate = [...formValues.products]
                      const index = oldData.tableData.id
                      dataUpdate[index] = newData
                      setFormValues((prev) => ({...prev, products: [...dataUpdate]}))
                      resolve()
                    }, 1000)
                  }),
                  onBulkUpdate: (changes) => new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const makeData = [...formValues.products]
                      Object.keys(changes).forEach((d) => {
                        makeData[d] = changes[d].newData
                      })
                      setFormValues((prev) => ({...prev, products: makeData}))
                      resolve()
                    }, 1000)
                  }),
                  onRowDelete: (oldData) => new Promise((resolve, reject) => {
                    setTimeout(() => {
                      const dataDelete = [...formValues.products]
                      const index = oldData.tableData.id
                      dataDelete.splice(index, 1)
                      setFormValues((prev) => ({...prev, products: [...dataDelete]}))
                      if(formValues.products.length === 0){
                        setFormErrors((prev) => ({...prev, products: 'Products is Required'}))
                      }
                      resolve()
                    }, 1000)
                  })
                }}
              />
              <Typography color='error'>{formErrors.products || ''}</Typography>
            </Grid>

            <Grid
              display='flex'
              justifyContent='center'
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography>
                {`Sub-Total = ${formValues.subTotal}`}
              </Typography>
            </Grid>

          </Grid>
        </Grid>

        <Grid
          size={{
            lg: props.type === 'details' ? 0 : 2,
            md: props.type === 'details' ? 0 : 2,
            sm: props.type === 'details' ? 0 : 2,
            xs: props.type === 'details' ? 0 : 2
          }}>
        </Grid>

        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <Grid container display='flex' justifyContent='flex-end' spacing={3}>
            <Grid>
              <Button variant = 'contained' color = 'error' onClick = {() => props.handleClose()}>Cancel</Button>
            </Grid>

            <Grid>
              <Button variant = 'contained' onClick={handleSubmit}>Submit</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}

QuotationForm.propTypes = {
  handleClose: PropTypes.func
}

export default QuotationForm
