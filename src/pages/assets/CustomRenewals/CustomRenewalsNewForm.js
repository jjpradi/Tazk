import { Autocomplete, Button, Card, Checkbox, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { Box, Grid } from "@mui/system";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdapterMoment as DateAdapter } from '@mui/x-date-pickers/AdapterMoment';
import AttachmentField from "pages/common/Timesheet/Attachment";
import { emailValidation, phoneValidation } from "components/regexFunction";
import toMomentOrNull from "utils/DateFixer";
import _ from "lodash";
import moment from "moment";
import { getAllAssetAction } from 'redux/actions/asset_actions'
import { asstGeneralContactAction } from '../../../redux/actions/asset_actions'
import { GetFrequencyTypeAction } from 'redux/actions/insurance_actions'
import { createCustomRenewalsAction , getCustomRenewalsByIdAction ,updateCustomRenewalsAction, renewCustomRenewalsAction} from 'redux/actions/renewals_actions'


export default function CustomRenewalsNewForm(props) {

    const {
        AssetReducers: { getAssetName, get_asst_general },
        InsuranceReducers: { getFrequencyType },
        RenewalsReducers : { getCustomRenewalsById }
    } = useSelector((state) => state)

    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        renewalType: null,
        assetName: null,
        policyNo: null,
        assetType: null,
        sumInsured: null,
        annualPremium: null,
        frequency: {
            id: 1,
            frequency_type: "MONTHLY"
        },
        reminder: [],
        notes: '',
        amount: null,
        sms_notification: null,
        email_notification: null,
        whatsApp_notification: null,
        repeat: null,
        serviceProvider: null,
        providerContact: null,
        startDate: null,
        endDate: null,
        providerEmail: null,
        title: null,
    })

    const [formErrors, setFormErrors] = useState({
        renewalType: null,
        assetName: null,
        policyNo: null,
        assetType: null,
        sumInsured: null,
        annualPremium: null,
        frequency: null,
        reminder: null,
        notes: null,
        amount: null,
        sms_notification: null,
        email_notification: null,
        whatsApp_notification: null,
        repeat: null,
        serviceProvider: null,
        providerContact: null,
        startDate: null,
        endDate: null,
        providerEmail: null,
        title: null,
        files: null
    })
    const handleEmailSmsChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const requiredFields = [
        'title',
        'startDate',
        'endDate',
        'assetName',
        'renewalType'
    ]

    const requiredFieldsWithName = [
        ...requiredFields,
        ...(formData.serviceProvider ? ['serviceProvider'] : []),

    ]

    const handleChange = (name, value) => {
        setFormData((prevData) => {
            const newFormData = { ...prevData, [name]: value || null }
            validateForm(name, value)
            return newFormData
        })
    }
    const [renewalsFiles, setRenewalsFiles] = useState({
        renewalsFiles: [],
        renewalsFilePreviews: [] ,
        existingImageKey : []
    })

    const validateForm = (name, value) => {
        if (requiredFieldsWithName.includes(name) && (value === null || value === '')) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: `${name} is Required`
            }))
        } else if (name === 'amount' && value !== null && value !== '' && Number(value) === 0) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: 'Amount cannot be 0!'
            }))
        } else {
            setFormErrors((prev) => ({
                ...prev,
                [name]: null
            }))
        }

    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let isValid = true
        let formErrObj = { ...formErrors }
        const formValues = new FormData()

        requiredFieldsWithName.forEach((key) => {
            if (!formData[key]) {
                isValid = false
                formErrObj[key] = `${key} is required`
            } else {
                formErrObj[key] = null
            }
        })

        if (formData.amount !== null && formData.amount !== '' && Number(formData.amount) === 0) {
            isValid = false
            formErrObj.amount = 'Amount cannot be 0!'
        }

        if (formData.providerEmail && !emailValidation(formData.providerEmail)) {
            isValid = false
            formErrObj.providerEmail = "Invalid Email Address!"
        }

        setFormErrors(formErrObj)

        if (!isValid) return

        formValues.append("renewal_type", formData.renewalType)
        formValues.append("asset_id", formData.assetName?.asset_id)
        formValues.append("email_notification", formData.email_notification ? 1 : 0)
        formValues.append("sms_notification", formData.sms_notification ? 1 : 0)
        formValues.append("whatsApp_notification", formData.whatsApp_notification ? 1 : 0)
        formValues.append("serviceProvider", formData.serviceProvider?.id ? formData.serviceProvider.id : formData.serviceProvider?.name ? formData.serviceProvider.name : formData.serviceProvider ? formData.serviceProvider : "")
        formValues.append("providerContact", formData.providerContact || "")
        formValues.append("providerEmail", formData.providerEmail || "")

        formValues.append("startDate", moment(formData.startDate).format("YYYY-MM-DD"))
        formValues.append("endDate", moment(formData.endDate).format("YYYY-MM-DD"))

        formValues.append("repeat", formData.repeat ? 1 : 0)
        formValues.append("reminder", JSON.stringify(formData.reminder) || "")
        formValues.append("frequency", formData.frequency?.id)
        formValues.append("title", formData.title)
        formValues.append("amount", formData.amount)
        formValues.append("annual_premium", formData.annualPremium)
        formValues.append("policy_no", formData.policyNo)
        formValues.append("notes", formData.notes)

        let renewalsFile = []
        if (renewalsFiles.existingImageKey?.length > 0) {
            renewalsFile = renewalsFiles.existingImageKey.map((url) => ({
                fileName: url,
                type: 'existing'
            }))
        }
        if (renewalsFiles.renewalsFiles?.length > 0) {
            renewalsFiles.renewalsFiles.forEach((file) => {
                formValues.append('renewalsFiles', file)
                renewalsFile.push({
                    fileName: file.name,
                    type: file.type
                })
            })
        }
        formValues.append("image", JSON.stringify(renewalsFile))

        if (props.type === 'new') {
            await dispatch(createCustomRenewalsAction(formValues))
            props.handleClose()
        } else if (props.type === 'Renew') {
            await dispatch(renewCustomRenewalsAction(formValues, props?.rowData?.id))
            if (props.handleSubmitClose) {
                props.handleSubmitClose()
            } else {
                props.handleClose()
            }
        } else {
            await dispatch(updateCustomRenewalsAction(formValues ,props?.rowData?.id))
            props.handleClose()
        }
    }
    const reminderDaysBefore = [
        { reminder: '2' },
        { reminder: '5' },
        { reminder: '7' },
    ]

    useEffect(() => {
        dispatch(getAllAssetAction())
        dispatch(asstGeneralContactAction())
        dispatch(GetFrequencyTypeAction())

    }, [])

    useEffect(() => {
        if (formData.serviceProvider !== null && formData.serviceProvider !== "") {
            setFormData((prev) => ({
                ...prev,
                providerContact: formData.serviceProvider?.contact || "",
                providerEmail: formData.serviceProvider?.email || ""
            }))
        }
    }, [formData.serviceProvider?.id])

    useEffect(() => {
        if ((props.type === 'edit' || props.type === 'Renew') && props.rowData?.id) {
            dispatch(getCustomRenewalsByIdAction(props.rowData.id))
        }
    }, [props.type, props.rowData?.id])

    useEffect(() => {
        if ((props.type !== 'edit' && props.type !== 'Renew') || !getCustomRenewalsById) return;

        const record = getCustomRenewalsById?.data?.[0]

        const assetName = getAssetName?.find((a) => a.asset_id === record?.asset_id)

        const frequency = getFrequencyType?.find((a) => a.id === record?.frequency)

        const generalConatct = get_asst_general?.data?.find((item) => Number(item.id === Number(record?.serviceProvider)))
        
        setFormData((prev) => ({
            ...prev,
            renewalType: record?.renewal_type || '',
            assetName: assetName || null,
            policyNo: record?.policy_no || '',
            annualPremium: record?.annual_premium || '',
            amount: record?.amount || '',
            frequency: frequency || null, 
            reminder: record?.reminder ? JSON.parse(record?.reminder) : [],
            notes: record?.notes || '',
            sms_notification: record?.sms_notification || '',
            email_notification: record?.email_notification || '',
            whatsApp_notification: record?.whatsApp_notification || '',
            repeat: record?.repeat || '',
            serviceProvider: generalConatct?.name || '',
            providerContact: generalConatct?.contact || '',
            providerEmail: generalConatct?.email || '',
            startDate: record?.startDate ? moment(record?.startDate) : null,
            endDate: record?.endDate ? moment(record?.endDate) : null,
            title: record?.title || '',
        }));
        setRenewalsFiles({
            renewalsFiles: [],
            renewalsFilePreviews: record?.image?.map(img => img.imageUrl) || [],
            existingImageKey : record?.imageKeys ? JSON.parse( record?.imageKeys) : []

        })

    }, [props.type, getCustomRenewalsById]);

    return (

        <div style={{
      padding: '0 10px',
      height: '90vh',
      overflowY: 'auto',
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',  
    }}
    className="hide-scrollbar"
  >
    <style>
      {`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}
    </style>
            <Grid container width={'100%'} spacing={2}>
                <Grid
                    size={{
                        lg: 10,
                        md: 10,
                        sm: 10,
                        xs: 10
                    }}>
                    <Grid container display='flex' justifyContent='space-between'>
                        <Typography variant="h3" fontWeight="600" mb={3}>
                            Custom Renewals
                        </Typography>
                    </Grid>
                </Grid>
                <Grid
                    size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}
                >
                    <TextField
                        required
                        fullWidth
                        label='Renewal Type'
                        variant='filled'
                        value={formData.renewalType || ''}
                        disabled = {props.type === 'edit' || props.type === 'Renew'}
                        onChange={(event) => handleChange('renewalType', event.target.value)}
                        error={formErrors.renewalType !== null}
                        helperText={formErrors.renewalType === null ? '' : 'Renewal Type is Required!'}
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
                        options={getAssetName || []}
                        getOptionLabel={(option) => {
                            if (!option) return ''
                            return typeof option === 'string' ? option : `${option.Name} - ${option.Code}`
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                {`${option.Name} - ${option.Code} - ${option['Asset Owner']} - ${option.Location}`}
                            </li>
                        )}
                        value={formData.assetName || ''}
                        onChange={(event, value) => handleChange('assetName', value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label='Asset Name'
                                variant='filled'
                                error={formErrors.assetName !== null}
                                helperText={formErrors.assetName === null ? '' : 'Asset Name is Required!'}
                            />
                        )}
                    />
                </Grid>
                {formData.assetName?.asset_id !== null && formData.assetName?.asset_id !== undefined && (
                    <>
                        <Grid
                            size={{
                                lg: 6,
                                md: 6,
                                sm: 6,
                                xs: 12
                            }}>
                            <Box
                                display='flex'
                                flexDirection='row'
                                alignItems='flex-start'
                                p={2}
                                mt={2}
                                border='1px solid #ccc'
                                borderRadius={2}
                                bgcolor='#f9f9f9'
                            >
                                <Box display='flex' flexDirection='row' gap={4} ml={2}>
                                    <Typography variant='h6'>
                                        Asset Code : {formData.assetName?.Code}
                                    </Typography>

                                    <Typography variant='h6'>
                                        Asset Group : {formData?.assetName?.['Asset Group']}
                                    </Typography>

                                    <Typography variant='h6'>
                                        Asset Type : {formData?.assetName?.['Asset Type']}
                                    </Typography>

                                    <Typography variant='h6'>
                                        Location : {formData.assetName?.Location}
                                    </Typography>

                                    <Typography variant='h6'>
                                              Assigned To : {formData.assetName?.['Assigned To']}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </>
                )}
                <Grid
                    size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <Autocomplete
                        fullWidth
                        freeSolo
                        options={get_asst_general?.data || []}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option?.name || ''
                        }
                        value={formData.serviceProvider || null}
                        onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'input') {
                                handleChange('serviceProvider', { name : newInputValue});
                            }
                        }}

                        onChange={(event, newValue) => {
                           
                                handleChange('serviceProvider' , newValue)
                            

                        }}

                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Service provider"
                                variant="filled"
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
                        fullWidth
                        label='Provider Email'
                        variant='filled'
                        value={formData.providerEmail || ''}
                        onChange={(event) =>
                            handleChange('providerEmail', event.target.value)
                        }
                        error={formData.providerEmail && !emailValidation(formData.providerEmail)
                        }
                        helperText={
                            formData.providerEmail && !emailValidation(formData.providerEmail)
                                ? 'Invalid Email Address!'
                                : ''
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
                    <TextField
                        fullWidth
                        label='Provider Contact'
                        variant='filled'
                        type='number'
                        value={formData.providerContact || ''}
                        onChange={(event) => handleChange('providerContact', event.target.value)}

                        required={(formData.serviceProvider && !formData.providerContact) ||
                            (formData.providerContact && !phoneValidation(formData.providerContact))}

                        error={
                            (formData.serviceProvider && !formData.providerContact) ||
                            (formData.providerContact && !phoneValidation(formData.providerContact))
                        }
                        helperText={
                            formData.serviceProvider && !formData.providerContact
                                ? 'Provider contact is required'
                                : formData.providerContact && !phoneValidation(formData.providerContact)
                                    ? 'Invalid Contact No!'
                                    : ''
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
                    <Autocomplete
                        options={getFrequencyType || []}
                        getOptionLabel={(option) => option?.frequency_type || ''}
                        value={formData.frequency || getFrequencyType?.find(f => f.frequency_type === "MONTHLY") || null}
                        onChange={(e, value) => handleChange('frequency', value)}
                        isOptionEqualToValue={(opt, val) => opt.id === val.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Premium Frequency"
                                variant="filled"
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
                    <LocalizationProvider dateAdapter={DateAdapter}>
                        <DatePicker
                            fullWidth
                            label='Start Date'
                            value={toMomentOrNull(formData.startDate)}
                            onChange={(date) => handleChange('startDate', date)}
                            views={['year', 'month', 'day']}
                            format="DD/MM/YYYY"
                            shouldDisableDate={(date) =>
                                formData.endDate &&
                                moment(date).isAfter(moment(formData.endDate), "day")
                            }
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    variant: "filled",
                                    error: Boolean(formErrors.startDate),
                                    helperText: formErrors.startDate
                                }
                            }}
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
                        <DatePicker
                            fullWidth
                            label='End Date'
                            value={toMomentOrNull(formData.endDate)}
                            onChange={(date) => handleChange('endDate', date)}
                            views={['year', 'month', 'day']}
                            format="DD/MM/YYYY"
                            shouldDisableDate={(date) =>
                                formData.startDate &&
                                moment(date).isBefore(moment(formData.startDate), "day")
                            }
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    variant: "filled",
                                    error: Boolean(formErrors.endDate),
                                    helperText: formErrors.endDate
                                }
                            }} />
                    </LocalizationProvider>
                </Grid>
                <Grid
                    size={{
                        lg: 3,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <TextField
                        fullWidth
                        required
                        label='Title'
                        variant='filled'
                        value={formData.title || ''}
                        onChange={(event) =>
                            handleChange('title', event.target.value)
                        }
                        error={formErrors.title !== null}
                        helperText={formErrors.title === null ? '' : 'Title is Required!'}
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
                        fullWidth
                        label='Amount'
                        variant='filled'
                        value={formData.amount || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            handleChange('amount', value)
                        }}
                        slotProps={{
                            htmlInput: {
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }
                        }}
                        error={formErrors.amount !== null}
                        helperText={formErrors.amount === null ? '' : formErrors.amount}
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
                        fullWidth
                        label='Annual Premium'
                        variant='filled'
                        value={formData.annualPremium || ''}
                        onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "")
                            handleChange('annualPremium', value)
                        }}
                        error={formErrors.annualPremium !== null}
                        helperText={formErrors.annualPremium === null ? '' : 'Annual Premium is Required!'}
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
                        fullWidth
                        label='Policy No'
                        variant='filled'
                        value={formData.policyNo || ''}
                        onChange={(event) =>
                            handleChange('policyNo', event.target.value)
                        }
                        error={formErrors.policyNo !== null}
                        helperText={formErrors.policyNo === null ? '' : 'Policy No is Required!'}
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
                    multiple
                    disableCloseOnSelect
                    fullWidth
                    options={_.uniqBy(reminderDaysBefore, "reminder")}
                    getOptionLabel={(option) => option?.reminder?.toString() || ""}
                    value={Array.isArray(formData.reminder) ? formData.reminder : []}
                    onChange={(event, newValue) =>
                     handleChange("reminder", newValue || [])
                    }
                    isOptionEqualToValue={(option, value) =>
                     option?.reminder === value?.reminder
                    }
                   renderInput={(params) => (
                     <TextField
                      {...params}
                      label="Send Reminder Before"
                      variant="filled"
                      />)}/>
                      </Grid>

                <Grid
                    size={{
                        lg: 6,
                        md: 8,
                        sm: 8,
                        xs: 12
                    }}>
                    <TextField
                        fullWidth
                        multiline
                        label='Notes'
                        name='notes'
                        variant='filled'
                        rows={4}
                        value={formData.notes || ''}
                        onChange={(event) => handleChange('notes', event.target.value)}
                    />
                </Grid>

                <Grid
                    size={{
                        lg: 4,
                        md: 6,
                        sm: 6,
                        xs: 12
                    }}>
                    <FormControlLabel
                        label='Repeat'
                        control={
                            <Switch
                                checked={formData.repeat}
                                onChange={() => setFormData({ ...formData, repeat: !formData.repeat })}
                            />
                        }
                    />
                </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container>
                        <Grid
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            <Typography>Send Reminders Through : </Typography>
                        </Grid>

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
                                        checked={formData.email_notification}
                                        onChange={(e) => handleEmailSmsChange('email_notification', e.target.checked)}
                                    />
                                }
                                label='EMAIL'
                                labelPlacement='end'
                            />
                        </Grid>

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
                                        checked={formData.sms_notification}
                                        onChange={(e) => handleEmailSmsChange('sms_notification', e.target.checked)}
                                    />
                                }
                                label='SMS'
                                labelPlacement='end'
                            />
                        </Grid>

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
                                        checked={formData.whatsApp_notification}
                                        onChange={(e) => handleEmailSmsChange('whatsApp_notification', e.target.checked)}
                                    />
                                }
                                label='Whatsapp'
                                labelPlacement='end'
                            />
                        </Grid>
                    </Grid>
                </Grid>


                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <AttachmentField
                        asset='Renewals'
                        previews={renewalsFiles.renewalsFilePreviews}
                        setPreviews={setRenewalsFiles}
                    />
                    <Typography color='error'>
                        {formErrors.files === null ? '' : formErrors.files}
                    </Typography>
                </Grid>

                <Grid container justifyContent='flex-end' spacing={2}>
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
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={handleSubmit}
                        >
                            {props.type === 'Renew' ? 'Renew' : 'Submit'}
                        </Button>
                    </Grid>



                </Grid>


            </Grid>

        </div>

    )

}
