import React, { useContext, useEffect, useState } from 'react'
import { Autocomplete, Button, Card, Checkbox, Divider, FormControl, FormControlLabel, Grid, IconButton, Radio, RadioGroup, TextField, Tooltip, Typography ,Fade, Dialog} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { createAccountAction, getLeadManagementFieldsAction } from 'redux/actions/leadManagement_actions'
import { Country } from 'components/Country_list'
import _ from 'lodash'
import { Cities } from 'utils/cities'
import { getLocationDataBasedOnPincode } from 'components/common'
import { emailValidation, phoneValidation } from 'components/regexFunction'
import { DatePicker, DateTimePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import AttachmentField from 'pages/common/Timesheet/Attachment'
import PropTypes from 'prop-types'
import DeleteIcon from '@mui/icons-material/Delete'
import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import {maxBodyHeight, headerStyle, cellStyle} from 'utils/pageSize';
import AddIcon from '@mui/icons-material/Add';
import AdditionalContacts from './AdditionalContacts'
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';
import toMomentOrNull from 'utils/DateFixer'



const AccountLeadsForm = (props) => {

    const { type, handleClose, data } = props

    const newDate = moment()

    const dispatch = useDispatch()

    const {
        setModalTypeHandler,
        setLoaderStatusHandler
    } = useContext(CreateNewButtonContext)

    const {
        leadManagementReducers : { leadManagementFields }
    } = useSelector((state) => state)

    const [formValues, setFormValues] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [requiredFields, setRequiredFields] = useState([])
    const [addContact, setAddContact] = useState([])
    const [add,setAdd] = useState(false)


    useEffect(() => { (async () => {
        await dispatch(getLeadManagementFieldsAction(setModalTypeHandler, setLoaderStatusHandler))
    })();
}, [])

    useEffect(() => {
        const formValuesObj = {}
        const formErrorObj = {}
        const requiredFieldsObj = []

        if(type === 'create') {
            leadManagementFields.filter((field) => field.flag !== 'leads').forEach((field) => {
                switch(field.inputType) {
                    case 'List' :
                        if(field.labelName === 'Country') {
                            formValuesObj[field.labelName] = Country.find((e) => e.name === field.defaultValue)
                        }
                        else {
                            formValuesObj[field.labelName] = field.defaultValue
                        }
                        break
                    case 'Checkbox' :
                        formValuesObj[field.labelName] = false
                        break
                    case 'Attachment' :
                        formValuesObj[field.labelName] = []
                        break
                    case 'Date' :
                    case 'Time' :
                    case 'Date & Time' :
                        formValuesObj[field.labelName] = newDate
                        break
                    default :
                        formValuesObj[field.labelName] = field.defaultValue
                        break
                }

                if(field.required === 1) {
                    formErrorObj[field.labelName] = null
                    requiredFieldsObj.push(field.labelName)
                }
            })
        }
        setFormValues({...formValuesObj})
        setFormErrors({...formErrorObj})
        setRequiredFields([...requiredFieldsObj])
    }, [leadManagementFields])


    const handleDeleteOpen = (rowData) => {
        setAddContact((prevContacts) => prevContacts.filter(contact => contact.id !== rowData.id));
    };

    const handleOpen = ()=>{
        setAdd(true)
    }

    const addContactData =(data)=>{
        const newContact = { ...data, id: Date.now() };
        setAddContact((prevContacts) => [...prevContacts, newContact])
    }

    const handleExit =()=>{
        setAdd(false)
    }


    const columns = [
        
        {
          field: 'firstName',
          title: 'First Name'
        },
        {
          field: 'lastName',
          title: 'Last Name ',
          render :(rowData)=>{
            return rowData.lastName === ' ' || null || 'null' ? '-' : rowData.lastName
          }
        },
        {
          field: 'gender',
          title: 'Gender',
        },
        {
          field: 'designation',
          title: 'Designation',
          render :(rowData)=>{
            return rowData.designation === ' ' || null || 'null' ? '-' : rowData.designation
          }
          
        },
        {
          field: 'email',
          title: 'Email'
        },
        {
          field: 'phoneNumber',
          title: 'Phone Number'
        }
        ,
        {
            title: 'Action',
          render:(rowData)=>(
            <>
                <Grid>
                    <Tooltip
                        title = 'Delete'
                        TransitionComponent={Fade}
                        TransitionProps={{timeout:600}}
                        placement='top'
                    />
                     <IconButton onClick={()=>{handleDeleteOpen(rowData)}} >
                       <DeleteIcon/>
                       </IconButton>
                </Grid>
            </>
          )
        }
      ];

    const getAutoCompleteOptions = (name, options) => {
        switch(name) {
            case 'State' :
                return _.uniqBy(Cities, 'state')
            case 'City' :
                return [...Cities]
            case 'Country' :
                return Country
            default :
                return options
        }
    }

    const getAutoCompleteOptionLabel = (name, option) => {
        switch(name) {
            case 'State' :
                return option.state || ''
            case 'City' :
                return option.name || ''
            case 'Country' :
                return option.name || ''
            default : 
                return option || ''
        }
    }

    const handleChange = async (name, value, required) => {
        setFormValues((prev) => ({...prev, [name] : value}))

        if(name === 'Pincode') {
            if(value.length === 6) {
                const locationData = await getLocationDataBasedOnPincode(value)
                if(locationData !== undefined) {
                    const { district, state } = locationData
                    if(district && state) {
                        setFormValues((prev) => ({...prev, [name] : value, ['State'] : {state : state}, ['City'] : {name : district}}))
                        setFormErrors((prev) => ({...prev, [name] : null, ['State'] : null, ['City'] : null}))
                    }
                }
                else {
                    setFormErrors((prev) => ({...prev, [name] : 'Pincode Not Found'}))
                }
            }
            else {
                setFormErrors((prev) => ({...prev, [name] : 'Invalid Pincode'}))
            }
        }

        if (required || name === 'Email' || name === 'Company Email') {
            validationHandler(name, value)
        }
    }

    const validationHandler = (name, value) => {
        if (!value) {
          setFormErrors((prev) => ({
            ...prev,
            [name]: `${name} is Required`,
          }));
        } else {
          switch (name) {
            case 'Phone Number':
            case 'Mobile':
            case 'Contact Person Phone Number':
                setFormErrors((prev) => ({
                ...prev,
                [name]: phoneValidation(value) ? null : `${name} is Invalid`,
              }));
              break;
            case 'Company Phone Number':
              setFormErrors((prev) => ({
                ...prev,
                [name]: phoneValidation(value) ? null : `${name} is Invalid`,
              }));
              break;
      
            case 'Email':
            case 'Company Email':
              setFormErrors((prev) => ({
                ...prev,
                [name]: emailValidation(value) ? null : `${name} is Invalid`,
              }));
              break;
      
            default:
              setFormErrors((prev) => ({ ...prev, [name]: null }));
              break;
          }
        }
      };

    const handleSubmit = async (event) => {
        event.preventDefault()
        let isValid = true
        let formErrorObj = {}

        
        Object.keys(formValues).map((key) => {
            if(requiredFields.includes(key) && formValues[key] === null || formValues[key] === 'null' || formValues[key] === '' || formValues[key]?.length === 0) {
                isValid = false
                formErrorObj[key] = `${key} is Required`
                return null
            }
        })

            Object.keys(formErrors).forEach((key) => {
                if (key === 'Contact Person Phone Number' && formErrors[key] != null) {
                    isValid = false
                    formErrorObj[key] = `${key} is invalid`
                }
            })
        setFormErrors(formErrorObj)

        if(isValid) {
            let payload = {}
            leadManagementFields.forEach((field) => {
                if(field.labelName === 'City') {
                    payload[field.labelName] = formValues[field.labelName]?.name
                }
                else if(field.labelName === 'Country') {
                    payload[field.labelName] = formValues[field.labelName]?.name
                }
                else if(field.labelName === 'State') {
                    payload[field.labelName] = formValues[field.labelName]?.state
                }
                else if(field.labelName === 'Gender') {
                    payload[field.labelName] = formValues[field.labelName] === 'Male' ? 1 : formValues[field.labelName] === 'Female' ? 2 : 0
                }
                else {
                    payload[field.labelName] = formValues[field.labelName]
                }
            })

            payload.additionalContact = addContact

            if(type === 'create') {
                await dispatch(createAccountAction(payload))
                handleClose()
            }
        }
        else{
          dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

    const renderSection = (fields, title) => {
        console.log(fields, title,'klkjj');
        
        return (
            <>
                {
                    title !== 'Accounts' &&
                    <Grid
                        sx={{ mt : 4 }}
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Divider />
                        <Typography variant='h6' sx={{ mt : 4 }}>
                            {title}
                        </Typography>
                    </Grid>
                }
                {
                    fields.map((field, index) => (
                        <React.Fragment key = {field.component_id}>
                            {
                                field.inputType === 'TextField' || field.inputType === 'Text Field' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <TextField 
                                            fullWidth
                                            variant = 'filled'
                                            required = {field.required === 1}
                                            label = {field.labelName}
                                            type={field.variant === 'number' ? 'text' : field.variant} // I added this bcoz below onchange validation condition works only on text//
                                            value = {formValues[field.labelName] || ''}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                if (field.variant === 'number') {
                                                    if (/^[0-9]*$/.test(value)) { 
                                                        handleChange(field.labelName, value, field.required);
                                                    }
                                                } else {
                                                    handleChange(field.labelName, value, field.required);
                                                }
                                            }}
                                            error={formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined}
                                            helperText={formErrors[field.labelName] ? formErrors[field.labelName] : ''}
                                        />
                                    </Grid>
                                ) :

                                field.inputType === 'TextArea' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <TextField 
                                            fullWidth
                                            multiple
                                            rows = {3}
                                            variant = 'filled'
                                            required = {field.required === 1}
                                            label = {field.labelName}
                                            value = {formValues[field.labelName] || ''}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                if (['Phone Number', 'Mobile', 'Contact Person Phone Number', 'Company Phone Number'].includes(field.labelName)) {
                                                    if (/^[0-9]*$/.test(value)) { 
                                                        console.log('sss');
                                                        handleChange(field.labelName, value, field.required);
                                                    }else{
                                                        null
                                                    }
                                                } else {
                                                    handleChange(field.labelName, value, field.required);
                                                }
                                            }}
                                            error = {formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined}
                                            helperText = {formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                        />
                                    </Grid>
                                ) :

                                field.inputType === 'List' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <Autocomplete 
                                            options = {getAutoCompleteOptions(field.labelName, field.options)}
                                            getOptionLabel = {(option) => getAutoCompleteOptionLabel(field.labelName, option)}
                                            value = {formValues[field.labelName] || ''}
                                            onChange = {(event, value) => handleChange(field.labelName, value, field.required)}
                                            renderInput = {(params) => (
                                                <TextField 
                                                    {...params}
                                                    fullWidth
                                                    variant = 'filled'
                                                    required = {field.required === 1}
                                                    label = {field.labelName}
                                                    error = {formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined}
                                                    helperText = {formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                                />
                                            )}
                                        />
                                    </Grid>
                                ) :

                                field.inputType === 'Date' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <LocalizationProvider dateAdapter={DateAdapter}>
                                            <DatePicker 
                                                label = {field.labelName}
                                                format='DD/MM/YYYY'
                                                value = {toMomentOrNull(formValues[field.labelName])}
                                                onChange = {(e) => {
                                                    if(e?._d) {
                                                        handleChange(field.labelName, moment(e._d).format(field.dateTimeFormat), field.required)
                                                    }
                                                    else {
                                                        handleChange(field.labelName, null, field.required)
                                                    }
                                                }}
                                                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: field.required === 1, error: formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                ) :

                                field.inputType === 'Time' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <LocalizationProvider dateAdapter={DateAdapter}>
                                            <TimePicker 
                                                label = {field.labelName}
                                                value = {formValues[field.labelName] ? toMomentOrNull(formValues[field.labelName]) : null}
                                                onChange = {(e) => {
                                                    if(e?._d) {
                                                        handleChange(field.labelName, moment(e._d).format(field.dateTimeFormat), field.required)
                                                    }
                                                    else {
                                                        handleChange(field.labelName, null, field.required)
                                                    }
                                                }}
                                                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: field.required === 1, error: formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                ) : 

                                field.inputType === 'Date & Time' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <LocalizationProvider dateAdapter={DateAdapter}>
                                            <DateTimePicker 
                                                label = {field.labelName}
                                                format='DD/MM/YYYY hh:mm a'
                                                value = {formValues[field.labelName] ? moment(formValues[field.labelName]) : null}
                                                onChange = {(e) => {
                                                    if(e?._d) {
                                                        handleChange(field.labelName, moment(e._d).format('YYYY-MM-DD HH:mm'), field.required)
                                                    }
                                                    else {
                                                        handleChange(field.labelName, null, field.required)
                                                    }
                                                }}
                                                slotProps={{ textField: { fullWidth: true, variant: 'filled', required: field.required === 1, onKeyDown: (e) => e.preventDefault(), error: formErrors[field.labelName] !== null && formErrors[field.labelName] !== undefined, helperText: formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : '' } }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                ) :

                                field.inputType === 'Radio' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <Grid container>
                                            <Grid
                                                size={{
                                                    lg: 6,
                                                    md: 6,
                                                    sm: 6,
                                                    xs: 6
                                                }}>
                                                <Typography>
                                                    {field.labelName}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                size={{
                                                    lg: 6,
                                                    md: 6,
                                                    sm: 6,
                                                    xs: 6
                                                }}>
                                                <FormControl>
                                                    <RadioGroup
                                                        value = {formValues[field.labelName] || ''}
                                                        onChange = {(event) => handleChange(field.labelName, event.target.value, field.required)}
                                                    >
                                                        {
                                                            field.options.map((option, index) => (
                                                                <FormControlLabel 
                                                                    key = {index}
                                                                    control = {<Radio />}
                                                                    label = {option}
                                                                />
                                                            ))
                                                        }
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>
                                            <Grid
                                                size={{
                                                    lg: 12,
                                                    md: 12,
                                                    sm: 12,
                                                    xs: 12
                                                }}>
                                                <Typography variant='caption' color='error'>
                                                    {formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                ) :

                                field.inputType === 'Checkbox' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 3,
                                            md: 4,
                                            sm: 4,
                                            xs: 4
                                        }}>
                                        <FormControlLabel 
                                            control = {
                                                <Checkbox 
                                                    checked = {formValues[field.labelName]}
                                                    onChange = {() => setFormValues((prev) => ({...prev, [field.labelName] : !formValues[field.labelName]}))}
                                                />
                                            }
                                            label = {field.labelName}
                                        />
                                    </Grid>
                                ) :

                                field.inputType === 'Attachment' && field.isActive === 1 ? (
                                    <Grid
                                        size={{
                                            lg: 12,
                                            md: 12,
                                            sm: 12,
                                            xs: 12
                                        }}>
                                        <AttachmentField 
                                            asset = {title}
                                            labelName = {field.labelName}
                                            previews = {formValues[field.labelName]}
                                            setPreviews = {setFormValues}
                                        />
                                        <Typography variant='caption' color='error'>
                                            {formErrors[field.labelName] && formErrors[field.labelName] !== null ? formErrors[field.labelName] : ''}
                                        </Typography>
                                    </Grid>
                                ) : null
                            }
                        </React.Fragment>
                    ))
                }
            </>
        );
    }

    const accountsFields = leadManagementFields.filter(field => field.flag === 'accounts' && field.isActive === 1 && field.labelName !== 'Select Account')
    const primaryContactFields = leadManagementFields.filter(field => field.flag === 'primaryContact' && field.isActive === 1)
    const phoneValidation = (value) => {
        const phoneRegex =/^[6-9]\d{9}$/;
        return !(!value || phoneRegex.test(value) === false); // Only numeric values
    };
    
  return (
      <>
          <Card sx={{ p : 5 }}>
              <Grid container spacing={3}>
                  <Grid
                      size={{
                          lg: 12,
                          md: 12,
                          sm: 12,
                          xs: 12
                      }}>
                      <Grid container display='flex' justifyContent='space-between'>
                          <Grid display='flex' alignItems='center'>
                              <Typography variant='h6'>Account Creation</Typography>
                          </Grid>

                          <Grid>
                              <Grid container justifyContent='flex-end' spacing={2}>
                                  <Grid>
                                      <Button
                                          variant = 'contained'
                                          color = 'error'
                                          onClick = {() => handleClose()}
                                      >
                                          Cancel
                                      </Button>
                                  </Grid>

                                  <Grid>
                                      <Button
                                          variant = 'contained'
                                          onClick = {handleSubmit}
                                      >
                                          Submit
                                      </Button>
                                  </Grid>
                              </Grid>
                          </Grid>
                      </Grid>
                  </Grid>

                  <Grid
                      size={{
                          lg: 10,
                          md: 10,
                          sm: 10,
                          xs: 10
                      }}>
                      <Grid container spacing={3}>
                          {accountsFields.length > 0 && renderSection(accountsFields, 'Accounts')}
                          {primaryContactFields.length > 0 && renderSection(primaryContactFields, 'Primary Contact')}
                          
                          <Grid
                              size={{
                                  lg: 12,
                                  md: 12,
                                  sm: 12,
                                  xs: 12
                              }}>
                              <MaterialTable
                                  columns={columns}
                                  data={addContact}
                                  title={'Additional Contacts'}
                                  totalCount={addContact?.length}
                                  options={{
                                  actionsColumnIndex: -1,
                                  filtering: false,
                                  search: false,
                                  paging: true,
                                  pageSize: 5,
                                  pageSizeOptions: [5,10,20],
                                  maxBodyHeight: maxBodyHeight,
                                  overflowY:'visible',
                                  headerStyle,
                                  cellStyle
                                  }}
                                  // onPageChange={(page) => {
                                  //   handlePageChange(page);
                                  // }}
                                  // onRowsPerPageChange={(size) => {
                                  //   handleSizeChange(size);
                                  // }}
                                  components={{
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
                                          {/* <CommonSearch
                                          searchVal={paginateData.searchString}
                                          cancelSearch={cancelSearch}
                                          requestSearch={requestSearch}
                                          /> */}
                                      </div>
                                      </div>
                                  ),
                                  }}
                                  actions={[
                                  {
                                      icon: () => <AddIcon />,
                                      tooltip: 'Add Contact',
                                      isFreeAction: true,
                                      onClick: () => handleOpen(),
                                  },
                                  ]}
                              />
                          </Grid>
                      </Grid>
                  </Grid>
              </Grid>
          </Card>
          <Dialog open={add}>
                      <AdditionalContacts addContactData={addContactData} handleClose = {handleExit} />
              </Dialog>
      </>
  );
}

AccountLeadsForm.propTypes = {
    type : PropTypes.string,
    handleClose : PropTypes.func,
    data : PropTypes.array
}

export default AccountLeadsForm
