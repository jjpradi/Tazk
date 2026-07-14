import React, { useContext, useEffect, useRef, useState } from 'react'
import UnSavedChangesWarning from 'pages/common/unChangeswarning'
import { Autocomplete, Box, Card, ClickAwayListener, FormControl, FormHelperText, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material'
import { maxHeight } from 'utils/pageSize'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import CloseIcon from '@mui/icons-material/Close'
import { useDispatch, useSelector } from 'react-redux'
import AddIcon from '@mui/icons-material/Add'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import apiCalls from 'utils/apiCalls'
import { listVendorIdAndNameAction, vendorPriceListDropDownAction } from 'redux/actions/vendor_actions'
import { listProductActionByType } from 'redux/actions/product_actions'
import { GetTdsTaxes } from 'redux/actions/purchase_actions'
import { creditDebitNoteSeq } from 'redux/actions/sales_actions'
import toMomentOrNull from 'utils/DateFixer';

const NewPurchaseForm = (props) => {

    const [Prompt, setDirty, setPristine] = UnSavedChangesWarning()
    const [regex] = useState({})
    const dispatch = useDispatch()

    const {
        setModalStatusHandler,
        setModalTypeHandler,
        setLoaderStatusHandler,
        headerLocationId,
        commoncookie
    } = useContext(CreateNewButtonContext)

    const [formValues, setformValues] = useState({
        po_number : '',
        receiving_time : moment(),
        supplier_id : '',
        location_id : '',
        reference : '',
        comment : '',
        invoice_number : '',
        payment_type : '',
        note : '',
        tax_types : '0',
        tcs : '',
        tds : '',
        tcs_percent : '0%',
        tds_percent : '',
        tds_value : null
    })

    const [formErrors, setFormErrors] = useState({
        supplier_id : null,
        location_id : null,
        invoice_number : null
    })

    const [checkerror, setcheckerror] = useState({
        supplier_id : false,
        location_id : false,
        invoice_number : false
    })

    const {
        vendorReducer : { vendorIdAndName : vendor, vendorPriceListDropDown },
        purchasesReducer : { tds_taxrate }
    } = useSelector((state) => state)

    const [requiredFields] = useState(['supplier_id', 'location_id', 'invoice_number'])
    const [editDate, setEditDate] = useState(false)
    const [hoverDate, setHoverDate] = useState(false)
    const [vendorId, setVendorId] = useState('')
    const [poOption, setPoOption] = useState('2')
    const [itemsData, setitemsData] = useState([])
    const [posSeq, setposSeq] = useState(false)

    const setStateHandler = async (name, value) => {
        let formObj = {}

        formObj = {
            ...formValues,
            [name] : value === '' ? null : value
        }

        await setformValues((prev) => ({...prev, ...formObj}))
        validationHandler(name, value)
    }

    const validationHandler = (name, value) => {
        if (!Object.keys(formErrors).includes(name)) return

        if (requiredFields.includes(name) && (value === null || value === 'null' || value === '' || value === false || value === 'undefined' || (Object.keys(value) && value.value === null))) {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name) + ' is Required!'
            })
        } 
        else if (regex[name]) {
            if (!regex[name].test(value)) {
                setFormErrors({
                    ...formErrors,
                    [name] : capitalize(name) + ' is Invalid!'
                })
            } 
            else {
                setFormErrors({
                    ...formErrors,
                    [name] : null
                })
            }
        } 
        else {
            setFormErrors({
                ...formErrors,
                [name] : null
            })
        }
    }

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setformValues({...formValues, [name] : value})

        if (!value) {
            setcheckerror({...checkerror, [name] : true})
        } 
        else {
            setcheckerror({...checkerror, [name] : false})
        }

        setStateHandler(name, value)

        if(name === 'tds_percent') {
            setformValues((prev) => ({...prev, tds_percent : (value?.tds_rate || 0), tds_value : value}))
        }
    }

    const handleBlur = (e) => {
        const {name, value} = e.target
        if (!value) {
            setcheckerror({...checkerror, [name] : true})
        }
    }

    useEffect(() => {
        if (props.pageType === '/sales/bills') {
            setPoOption('2')
        }
        else {
            setPoOption('1')
        }
    }, [props.pageType])

    useEffect(() => {
        if (itemsData.length > 0 && oldPurchaseStatus === '2' && poOption === '1') {
            setProductResetDialog(true)
        }
    }, [poOption])

    useEffect(() => {
        let type = 'debit'
        let productType = 'purchase'
        apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler,
            !vendor.length && dispatch(listVendorIdAndNameAction()),
            dispatch(listProductActionByType(productType)),
            !vendorPriceListDropDown.length && dispatch(vendorPriceListDropDownAction()),
            !tds_taxrate?.length && dispatch(GetTdsTaxes('list','null')),
            dispatch(creditDebitNoteSeq(type))
        )
    }, [])

    useEffect(() => {
        if(props.type === 'returnFromPurchase') {
            const po = props.stocklocation.find((d) => d.location_id === formValues.location_id) || {}
            if (props.status !== 'edit' && props.status !== 'New') {
                const po_number = po.sequence_pattern || ''
                setposSeq(po)
                setformValues({...formValues, po_number})
            }

            let email = props.appConfigData ? props.appConfigData?.companyEmail : ''

            if(Object.keys(po).length){
                let locationData = {
                    companyAddress : po.address,
                    companyEmail : po.email?? email,
                    companyMobile : po.phone_number,
                    state : po.state
                }
                props.setAppconfigData(locationData)
            }
        }
    },[formValues.location_id])

  return (
      <>
          {Prompt}
          <Card
              sx={{
                  p : 5,
                  minHeight : maxHeight,
                  maxHeight : maxHeight,
                  width : '100%',
                  overflow : 'auto'
              }}
          >
              <Grid container spacing={3}>
                  <Grid
                      size={{
                          lg: 10,
                          md: 10,
                          sm: 10,
                          xs: 10
                      }}>
                      <Grid container spacing={3}>
                          <Grid
                              size={{
                                  lg: 9,
                                  md: 9,
                                  sm: 6,
                                  xs: 6
                              }}>
                              {
                                  props.type === 'returnFromPurchase' &&
                                  <Typography variant='h6'>
                                      {
                                          props.returnState
                                          ? 'Purchase Return'
                                          : props.isPrint
                                          ? 'View Purchase Order'
                                          : props.status === 'edit'
                                          ? 'Receiving Purchase Order'
                                          : 'New Purchase Order'
                                      }{' '}
                                      -{' '}

                                      <span>
                                          {formValues.po_number}
                                      </span>
                                  </Typography>
                              }
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 3,
                                  sm: 3,
                                  xs: 3
                              }}>
                              {
                                  editDate && props.status !== 'edit' ? (
                                      <ClickAwayListener onClickAway={() => {setEditDate(false); setHoverDate(false)}}>
                                          <Box>
                                              <LocalizationProvider dateAdapter={DateAdapter}>
                                                  <DatePicker
                                                      disableFuture
                                                      fullWidth
                                                      name="receiving_time"
                                                      label="Receiving Date"
                                                      value={toMomentOrNull(formValues.receiving_time)}
                                                      format='DD/MM/YYYY'
                                                      onChange={(date) =>
                                                          handleChange({
                                                              target: { value : date, name : 'receiving_time' }
                                                          })
                                                      }
                                                      slotProps={{ textField: { fullWidth: true, variant: "filled" } }}
                                                  />
                                                </LocalizationProvider>
                                          </Box>
                                      </ClickAwayListener>
                                  ) : (
                                      <Box
                                          onClick={() => setEditDate(true)}
                                          onMouseEnter={() => setHoverDate(true)}
                                          onMouseLeave={() => setHoverDate(false)}
                                          sx={{
                                              display : 'inline-block',
                                              cursor : 'pointer',
                                              padding : '4px 8px',
                                              borderRadius : hoverDate && !props.returnState && props.status !== 'edit' ? '6px' : '0px',
                                              border : hoverDate && !props.returnState && props.status !== 'edit' ? '1px solid #ccc' : 'none',
                                              backgroundColor : hoverDate && !props.returnState && props.status !== 'edit' ? '#fff' : 'transparent',
                                              transition : 'all 0.2s ease-in-out',
                                          }}
                                      >
                                          <Typography
                                              variant='h6'
                                              onClick={() => setEditDate(true)}
                                          >
                                              {'Receiving Date'} : {moment(formValues.receiving_time).format('DD/MM/YYYY')}
                                          </Typography>
                                      </Box>
                                  )
                              }
                          </Grid>
                      </Grid>
                  </Grid>

                  <Grid
                      display='flex'
                      justifyContent='flex-end'
                      sx={{ marginTop : '-5px' }}
                      size={{
                          lg: 2,
                          md: 2,
                          sm: 2,
                          xs: 2
                      }}>
                      <Tooltip title='Close'>
                          <IconButton onClick={props.handleClose}>
                              <CloseIcon />
                          </IconButton>
                      </Tooltip>
                  </Grid>

                  <Grid
                      size={{
                          lg: 10,
                          md: 10,
                          sm: 10,
                          xs: 10
                      }}>
                      <Grid container spacing={3}>
                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 6,
                                  xs: 12
                              }}>
                              <Autocomplete
                                  id='combo-box-demo'
                                  name='supplier_id'
                                  value={
                                      !_.isEmpty(props.edit_data) ? vendor
                                      .find((d) => formValues.supplier_id === d.supplier_id) || { company_name : '' } : formValues.supplier_id !== null ? vendor
                                      .find((d) => formValues.supplier_id === d.supplier_id) || { company_name : '' } : { company_name : '' }
                                  }
                                  onChange={(e, val) => {
                                      setVendorId(val.supplier_id)
                                      handleChange({ target : { name: 'supplier_id', value : val !== null ? val.supplier_id : null } })
                                  }}
                                  onBlur={handleBlur}
                                  disabled={props.returnState}
                                  options={vendor.filter((d) => d.company_name && d.supplier_id && d.supplier_id !== null && d.company_name !== null)}
                                  getOptionLabel={(option) => option.company_name}
                                  renderInput={(params) => {
                                      const get = { ...params }
                                      get.InputProps = {
                                          ...params.InputProps,
                                          startAdornment : (
                                              <Tooltip title='Create New'>
                                                  <IconButton
                                                      size='small'
                                                      onClick={() => {
                                                          setModalStatusHandler(true)
                                                          setModalTypeHandler('NewVendor')
                                                      }}
                                                  >
                                                      <AddIcon fontSize='small' />
                                                  </IconButton>
                                              </Tooltip>
                                          )
                                      }
                                      return (
                                          <TextField
                                              {...get}
                                              fullWidth
                                              required
                                              label='Vendor'
                                              variant='filled'
                                              error={checkerror.supplier_id}
                                          />
                                      )
                                  }}
                              />
                          </Grid>

                          <Grid
                              size={{
                                  lg: 3,
                                  md: 4,
                                  sm: 6,
                                  xs: 12
                              }}>
                              <FormControl
                                  fullWidth
                                  required
                                  variant='filled'
                                  error={checkerror.location_id}
                              >
                                  <InputLabel id='demo-simple-select-label'>Location</InputLabel>
                                  <Select
                                      name='location_id'
                                      label='Location'
                                      labelId='demo-simple-select-label'
                                      id='demo-simple-select'
                                      value={formValues.location_id}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      disabled={formValues.receive_goods === 'received'}
                                  >
                                      {
                                          props.stocklocation.filter((d) => {
                                              if (headerLocationId === 'null') return true
                                              else return headerLocationId === d.location_id
                                          }).map(
                                              (d) =>
                                              d.location_type_name !== "Scrap"  && (
                                                  <MenuItem value={d.location_id} key={d.location_id}>
                                                      {d.location_name}
                                                  </MenuItem>
                                              )
                                          )
                                      }
                                  </Select>

                                  <FormHelperText>
                                      {checkerror.location_id ? 'Location is required!' : ''}
                                  </FormHelperText>
                              </FormControl>
                          </Grid>

                      </Grid>
                  </Grid>

              </Grid>
          </Card>
      </>
  );
}

export default NewPurchaseForm
