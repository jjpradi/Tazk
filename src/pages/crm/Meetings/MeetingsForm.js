import React, { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
  Button,
  Card,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DataAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { getsessionStorage } from 'pages/common/login/cookies'
import { CreateMeetings } from 'redux/actions/meetings_actions'
import { listUserCreationAction } from 'redux/actions/userCreation_actions'
import { getLeadCompanyNameAction } from 'redux/actions/calls_actions'
import { getAllLeadsAction } from 'redux/actions/leadManagement_actions'
import { OpenalertActions } from 'redux/actions/alert_actions'
import { requiredFieldsAlertMessage } from 'utils/content'

const MeetingsForm = (props) => {
  const dispatch = useDispatch()

  const {
    UserCreationReducer: { createUser },
    CallsReducers: { leadCompanyNameList },
    leadManagementReducers: { allLeads },
  } = useSelector((state) => state)

  const user = getsessionStorage()

  const [formData, setFormData] = useState({
    meeting_name: '',
    meeting_subject: '',
    meeting_fromDateTime: null,
    meeting_durationHours: 1,
    meeting_host: null,
    meeting_participants: [],
    meeting_relatdTo: 'Lead',
    meeting_lead: null,
    meeting_repeat: false,
    meeting_description: '',
    meeting_repeatDuration: null,
    meeting_repeatDate: null,
  })

  const [formErrors, setFormErrors] = useState({
    meeting_name: null,
    meeting_subject: null,
    meeting_fromDateTime: null,
    meeting_durationHours: null,
    meeting_host: null,
    meeting_participants: null,
    meeting_relatdTo: null,
    meeting_lead: null,
    meeting_description: null,
    meeting_repeatDuration: null,
    meeting_repeatDate: null,
  })

  useEffect(() => {
    dispatch(listUserCreationAction())
    dispatch(getLeadCompanyNameAction())
    dispatch(getAllLeadsAction())
  }, [dispatch])

  const getEmployeeLabel = (option) => {
    if (!option) return ''
    if (typeof option === 'string') return option
    const firstName = option.first_name || ''
    const lastName = option.last_name || ''
    return [firstName, lastName].filter(Boolean).join(' ').trim()
  }

  const leadOptions = useMemo(() => {
    if (!Array.isArray(allLeads)) return []

    return allLeads.map((item) => {
      const leadName = item['Lead Name'] || item.lead_name || `Lead ${item.lead_id}`
      const contactName = [item.customerFirstName, item.customerLastName]
        .filter((value) => value && value !== 'null')
        .join(' ')
        .trim()

      return {
        value: item.lead_id,
        leadName,
        label: contactName ? `${leadName} - ${contactName}` : leadName,
      }
    })
  }, [allLeads])

  useEffect(() => {
    if (!Array.isArray(createUser) || createUser.length === 0) return

    const userObj = createUser.find((employee) => Number(employee.employee_id) === Number(user?.employee_id))
    if (userObj) {
      setFormData((prev) => ({ ...prev, meeting_host: prev.meeting_host || userObj }))
    }
  }, [createUser, user?.employee_id])

  useEffect(() => {
    if (!props?.data) return

    const matchedLead =
      leadOptions.find((lead) => Number(lead.value) === Number(props?.data?.lead_id)) ||
      leadOptions.find((lead) => lead.leadName === props?.data?.['Lead Name']) ||
      (props?.data?.lead_id
        ? {
            value: props.data.lead_id,
            leadName: props?.data?.['Lead Name'] || `Lead ${props.data.lead_id}`,
            label: props?.data?.['Lead Name'] || `Lead ${props.data.lead_id}`,
          }
        : null)

    setFormData((prev) => ({
      ...prev,
      meeting_lead: matchedLead,
      meeting_relatdTo: 'Lead',
    }))
  }, [leadOptions, props?.data])

  const participantOptions = useMemo(() => {
    const employees = Array.isArray(createUser)
      ? createUser.map((employee) => ({
          ...employee,
          participant_type: 'employee',
          participant_key: `emp_${employee.employee_id}`,
        }))
      : []

    const customers = Array.isArray(leadCompanyNameList)
      ? leadCompanyNameList.map((customer, index) => ({
          ...customer,
          participant_type: 'customer',
          participant_key: `cust_${customer.customer_id || customer.person_id || index}`,
        }))
      : []

    return [...employees, ...customers]
  }, [createUser, leadCompanyNameList])

  const getParticipantLabel = (option) => {
    if (!option) return ''
    if (typeof option === 'string') return option

    if (option.participant_type === 'employee') {
      const fullName = getEmployeeLabel(option)
      return option.employee_code ? `${fullName} - ${option.employee_code}` : fullName
    }

    const participantName = [option.first_name, option.last_name].filter(Boolean).join(' ').trim()
    if (participantName && option.company_name) return `${participantName} - ${option.company_name}`
    return participantName || option.company_name || ''
  }

  const formatParticipantForSave = (participant) => {
    if (!participant) return null
    if (typeof participant === 'string') {
      const trimmedValue = participant.trim()
      return trimmedValue || null
    }

    if (participant.participant_type === 'employee') {
      const name = getEmployeeLabel(participant)
      return name || null
    }

    return getParticipantLabel(participant) || null
  }

  const isSameEmployeeOption = (option, value) => option?.employee_id === value?.employee_id

  const isSameParticipantOption = (option, value) => {
    if (!option || !value) return false
    if (typeof option === 'string' || typeof value === 'string') return option === value

    if (option.participant_key && value.participant_key) {
      return option.participant_key === value.participant_key
    }

    return getParticipantLabel(option) === getParticipantLabel(value)
  }

  const getRequiredFields = () => {
    const required = [
      'meeting_lead',
      'meeting_subject',
      'meeting_name',
      'meeting_fromDateTime',
      'meeting_durationHours',
      'meeting_host',
      'meeting_participants',
      'meeting_relatdTo',
      'meeting_description',
    ]

    if (formData.meeting_repeat) {
      required.push('meeting_repeatDuration', 'meeting_repeatDate')
    }

    return required
  }

  const isEmptyFieldValue = (value) => {
    if (Array.isArray(value)) return value.length === 0
    return value === null || value === undefined || value === '' || value === 'null'
  }

  const getFieldErrorMessage = (fieldName) => {
    switch (fieldName) {
      case 'meeting_lead':
        return 'Lead Name is Required'
      case 'meeting_subject':
        return 'Meeting Subject is Required'
      case 'meeting_name':
        return 'Agenda of Meeting is Required'
      case 'meeting_fromDateTime':
        return 'Meeting At is Required'
      case 'meeting_durationHours':
        return 'Duration (Hours) is Required'
      case 'meeting_host':
        return 'Meeting Host is Required'
      case 'meeting_participants':
        return 'At least one participant is required'
      case 'meeting_relatdTo':
        return 'Related To is Required'
      case 'meeting_description':
        return 'Notes is Required'
      case 'meeting_repeatDuration':
        return 'Repeat Duration is Required'
      case 'meeting_repeatDate':
        return 'Repeat Date is Required'
      default:
        return 'This field is required'
    }
  }

  const validateFormField = (name, value) => {
    if (!Object.keys(formErrors).includes(name)) return

    const requiredFields = getRequiredFields()
    const shouldValidate = requiredFields.includes(name)
    const isEmpty = isEmptyFieldValue(value)

    if (name === 'meeting_durationHours' && !isEmpty) {
      const durationHours = Number(value)
      if (!Number.isFinite(durationHours) || durationHours <= 0) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: 'Duration (Hours) must be greater than 0',
        }))
        return
      }
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: shouldValidate && isEmpty ? getFieldErrorMessage(name) : null,
    }))
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    validateFormField(name, value)
  }

  const computedMeetingEnd = useMemo(() => {
    if (!formData.meeting_fromDateTime) return null

    const durationHours = Number(formData.meeting_durationHours)
    if (!Number.isFinite(durationHours) || durationHours <= 0) return null

    return moment(formData.meeting_fromDateTime, 'YYYY-MM-DD HH:mm')
      .add(durationHours, 'hours')
      .format('YYYY-MM-DD HH:mm')
  }, [formData.meeting_durationHours, formData.meeting_fromDateTime])

  const meetingRelatedTo = [{ label: 'Lead' }, { label: 'Contact' }, { label: 'Others' }]

  const handleSubmit = async (event) => {
    event.preventDefault()

    const requiredFields = getRequiredFields()
    const validationErrors = { ...formErrors }
    let hasError = false

    requiredFields.forEach((fieldName) => {
      if (isEmptyFieldValue(formData[fieldName])) {
        validationErrors[fieldName] = getFieldErrorMessage(fieldName)
        hasError = true
      } else {
        validationErrors[fieldName] = null
      }
    })

    const durationHours = Number(formData.meeting_durationHours)
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      validationErrors.meeting_durationHours = 'Duration (Hours) must be greater than 0'
      hasError = true
    }

    if (!computedMeetingEnd) {
      validationErrors.meeting_fromDateTime = 'Meeting At and Duration are required'
      hasError = true
    }

    setFormErrors(validationErrors)
    if (hasError) {
      dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
      return
    }

    const participants = formData.meeting_participants
      .map((participant) => formatParticipantForSave(participant))
      .filter(Boolean)
      .join(', ')

    const payload = {
      name: formData.meeting_name,
      subject: formData.meeting_subject,
      from_dateTime: formData.meeting_fromDateTime,
      to_dateTime: computedMeetingEnd,
      host: formData.meeting_host.employee_id,
      participants,
      relatedTo: formData.meeting_relatdTo,
      lead_id: props?.type === 'edit' ? props?.data?.lead_id : formData.meeting_lead?.value,
      description: formData.meeting_description,
      repeat: formData.meeting_repeat ? 1 : 0,
      duration: formData.meeting_repeat ? formData.meeting_repeatDuration : null,
      repeatDate: formData.meeting_repeat ? formData.meeting_repeatDate : null,
    }

    await dispatch(CreateMeetings(payload))
    props.handleClose()
  }

  return (
    <Card
      sx={{
        p: { xs: 2, md: 4 },
        width: '100%',
        maxWidth: { xs: '100%', md: 1200 },
        maxHeight: '85vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <Typography variant='h6'>Meetings</Typography>
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <Autocomplete
            disabled={props.type === 'edit'}
            options={leadOptions}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || '')}
            isOptionEqualToValue={(option, value) => option?.value === value?.value}
            value={formData.meeting_lead}
            onChange={(event, value) => handleChange('meeting_lead', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label='Lead Name'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                error={formErrors.meeting_lead !== null}
                helperText={formErrors.meeting_lead || ''}
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
          <TextField
            fullWidth
            required
            label='Meeting Subject'
            name='meeting_subject'
            variant='filled'
            InputLabelProps={{ shrink: true }}
            value={formData.meeting_subject}
            onChange={(event) => handleChange('meeting_subject', event.target.value)}
            error={formErrors.meeting_subject !== null}
            helperText={formErrors.meeting_subject || ''}
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
            fullWidth
            required
            label='Agenda of Meeting'
            name='meeting_name'
            variant='filled'
            InputLabelProps={{ shrink: true }}
            value={formData.meeting_name}
            onChange={(event) => handleChange('meeting_name', event.target.value)}
            error={formErrors.meeting_name !== null}
            helperText={formErrors.meeting_name || ''}
          />
        </Grid>

        <Grid
          size={{
            lg: 3,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <LocalizationProvider dateAdapter={DataAdapter}>
            <DateTimePicker
              label='Meeting At'
              format='DD/MM/YYYY hh:mm A'
              value={formData.meeting_fromDateTime ? moment(formData.meeting_fromDateTime) : null}
              onChange={(dateValue) => {
                if (!dateValue) {
                  handleChange('meeting_fromDateTime', null)
                  return
                }
                handleChange('meeting_fromDateTime', moment(dateValue).format('YYYY-MM-DD HH:mm'))
              }}
              views={['year', 'month', 'day']}
              slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', InputLabelProps: { shrink: true }, error: formErrors.meeting_fromDateTime !== null, helperText: formErrors.meeting_fromDateTime || '' } }}
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
          <TextField
            fullWidth
            required
            type='number'
            label='Duration (Hours)'
            name='meeting_durationHours'
            variant='filled'
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 0.5, step: 0.5 }}
            value={formData.meeting_durationHours}
            onChange={(event) => handleChange('meeting_durationHours', event.target.value)}
            error={formErrors.meeting_durationHours !== null}
            helperText={
              formErrors.meeting_durationHours ||
              (computedMeetingEnd
                ? `Ends at ${moment(computedMeetingEnd, 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY hh:mm A')}`
                : '')
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
          <Autocomplete
            disablePortal
            options={Array.isArray(createUser) ? createUser : []}
            getOptionLabel={(option) => getEmployeeLabel(option)}
            isOptionEqualToValue={isSameEmployeeOption}
            value={formData.meeting_host}
            onChange={(event, value) => handleChange('meeting_host', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label='Meeting Host'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                error={formErrors.meeting_host !== null}
                helperText={formErrors.meeting_host || ''}
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
          <Autocomplete
            disablePortal
            multiple
            freeSolo
            filterSelectedOptions
            options={participantOptions}
            getOptionLabel={(option) => getParticipantLabel(option)}
            isOptionEqualToValue={isSameParticipantOption}
            value={Array.isArray(formData.meeting_participants) ? formData.meeting_participants : []}
            onChange={(event, value) => handleChange('meeting_participants', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label='Meeting Participants'
                placeholder='Employees or external participants'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                error={formErrors.meeting_participants !== null}
                helperText={formErrors.meeting_participants || ''}
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
          <Autocomplete
            disablePortal
            options={meetingRelatedTo}
            value={meetingRelatedTo.find((item) => item.label === formData.meeting_relatdTo) || null}
            onChange={(event, value) => handleChange('meeting_relatdTo', value ? value.label : null)}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label='Related To'
                variant='filled'
                InputLabelProps={{ shrink: true }}
                error={formErrors.meeting_relatdTo !== null}
                helperText={formErrors.meeting_relatdTo || ''}
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
          <TextField
            fullWidth
            required
            multiline
            minRows={5}
            label='Notes'
            name='meeting_description'
            variant='filled'
            InputLabelProps={{ shrink: true }}
            value={formData.meeting_description}
            onChange={(event) => handleChange('meeting_description', event.target.value)}
            error={formErrors.meeting_description !== null}
            helperText={formErrors.meeting_description || ''}
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
            label='Repeat'
            control={
              <Switch
                checked={formData.meeting_repeat}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    meeting_repeat: !prev.meeting_repeat,
                  }))
                }
              />
            }
          />
        </Grid>

        {formData.meeting_repeat && (
          <>
            <Grid
              size={{
                lg: 3,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <LocalizationProvider dateAdapter={DataAdapter}>
                <DateTimePicker
                  label='Repeat Date'
                  format='DD/MM/YYYY hh:mm A'
                  value={formData.meeting_repeatDate ? moment(formData.meeting_repeatDate) : null}
                  onChange={(dateValue) => {
                    if (!dateValue) {
                      handleChange('meeting_repeatDate', null)
                      return
                    }
                    handleChange('meeting_repeatDate', moment(dateValue).format('YYYY-MM-DD HH:mm'))
                  }}
                  shouldDisableDate={(date) => {
                    const startDate = formData.meeting_fromDateTime
                      ? moment(formData.meeting_fromDateTime, 'YYYY-MM-DD HH:mm').startOf('day')
                      : null
                    const endDate = computedMeetingEnd
                      ? moment(computedMeetingEnd, 'YYYY-MM-DD HH:mm').startOf('day')
                      : null
                    const currentDate = moment(date).startOf('day')

                    if (startDate && currentDate.isSame(startDate, 'day')) return true
                    if (endDate && (currentDate.isBefore(endDate, 'day') || currentDate.isSame(endDate, 'day'))) return true
                    return false
                  }}
                  slotProps={{ textField: { fullWidth: true, required: true, variant: 'filled', InputLabelProps: { shrink: true }, onKeyDown: (event) => event.preventDefault(), error: formErrors.meeting_repeatDate !== null, helperText: formErrors.meeting_repeatDate || '' } }}
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
              <Autocomplete
                options={['Daily', 'Every Week', 'Every Month', 'Every Year']}
                value={formData.meeting_repeatDuration}
                onChange={(event, value) => handleChange('meeting_repeatDuration', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label='Repeat Duration'
                    variant='filled'
                    InputLabelProps={{ shrink: true }}
                    error={formErrors.meeting_repeatDuration !== null}
                    helperText={formErrors.meeting_repeatDuration || ''}
                  />
                )}
              />
            </Grid>
          </>
        )}

        <Grid size={12}>
          <Grid container justifyContent='flex-end' spacing={2}>
            <Grid>
              <Button variant='contained' color='error' onClick={() => props.handleClose()}>
                Cancel
              </Button>
            </Grid>

            <Grid>
              <Button variant='contained' color='primary' onClick={handleSubmit}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}

MeetingsForm.propTypes = {
  handleClose: PropTypes.func,
  data: PropTypes.object,
  type: PropTypes.string,
}

export default MeetingsForm
