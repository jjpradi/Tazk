import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Autocomplete, Button, Card, Checkbox, FormControlLabel, Grid, Radio, RadioGroup, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { useState, useEffect } from "react"
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { listUserCreationAction } from "redux/actions/userCreation_actions";
import { getAllAssetAction } from "redux/actions/asset_actions";
import { createAuditCheckList, getChecklistAction, updateAuditsAction, getAuditsByIdAction } from "redux/actions/audit_actions";
import PropTypes from 'prop-types'
import { maxHeight } from "utils/pageSize";
import { OpenalertActions } from "redux/actions/alert_actions";
import { requiredFieldsAlertMessage } from "utils/content";
import AttachmentField from "../../common/Timesheet/Attachment";
import toMomentOrNull from 'utils/DateFixer';

function AuditCheckListCreationForm(props){

    const {
        UserCreationReducer: {createUser},
        AssetReducers: {getAssetName},
        Audits : {getChecklist, getAuditsById}
    } = useSelector((state) => state)

    const dispatch = useDispatch()
    const [formValues, setFormValues] = useState({
        assetName: null,
        assetOwner: null,
        auditDate: null,
        repeat: false,
        repeatDuration: null,
        checklist: null,
        title: null,
        priority: null,
        assignTo: null, 
        email_notification: null,
        sms_notification: null,
        whatsApp_notification: null,
    })
    
    const [formErrors, setFormErrors] = useState({
        auditDate: null,
        repeatDuration: null,
        checklist: null,
        title: null,
        assetName: null,
        assignTo: null,   
    })

    

const parseQuestions = (str) => {
  if (Array.isArray(str)) {
    return str.map((item) => ({
      message: item?.message || "",
      answer: item?.answer || ""
    }));
  }
  if (!str) return [];
  try {
    const parsed = JSON.parse(str); // valid JSON now

    // parsed = [{ message: "...", answer: "..."}, ...]

    return parsed.map(item => ({
      message: item?.message || "",
      answer: item?.answer || ""
    }));
  } catch (err) {
    return [];
  }
};

    const priorityOptions = [
        {id :1,priority : 'HIGH'},
        {id :2,priority : 'MEDIUM'},
        {id :3,priority : 'LOW'},
    ]

    const getEditRecord = (payload) => {
        if (!payload) return null
        if (Array.isArray(payload?.data)) return payload.data[0] || null
        if (Array.isArray(payload)) return payload[0] || null
        if (typeof payload === 'object') return payload
        return null
    }


const handleValueChange = (name, value) => {
  if (value !== "" && value !== null) {
    let updatedValues = { ...formValues, [name]: value };
    let updatedErrors = { ...formErrors, [name]: null };

    if (name === "assetName") {
      const assignedUser = assignToOptions.find((u) => String(u?.full_name || [u?.first_name, u?.last_name].filter(Boolean).join(' ')).trim().toLowerCase() === String(value?.['Assigned To'] || '').trim().toLowerCase());
      updatedValues = {
        ...updatedValues,
        checklist: null,
        questions: [],
        required: null,
        imageCount: null,
        assignTo: assignedUser?.employee_id ?? null,
      };
      updatedErrors = { ...updatedErrors, assignTo: null, checklist: null };
    }
    if (name === "checklist") {
      const questions = value?.self_audit_questions
        ? parseQuestions(value.self_audit_questions)
        : [];
        const required = value?.required || null
        const imageCount = value?.imageCount || null

      updatedValues = {
        ...updatedValues,
        questions,
        required,
        imageCount
      };
    }

    setFormValues(updatedValues);
    setFormErrors(updatedErrors);
  } 
  else {
    setFormValues({ ...formValues, [name]: null });
    setFormErrors({ ...formErrors, [name]: `${name} is Required` });
  }
};


    const handleDateChange = (name, value) => {
        if(value === null){
            setFormValues({...formValues, [name]: null})
            setFormErrors({...formErrors, [name]: `Audit Date is Required`})
        }
        else if(!value?._isValid){
            setFormValues({...formValues, [name]: null})
            setFormErrors({...formErrors, [name]: `Audit Date is Invalid`})
        }
        else{
            setFormValues({...formValues, [name]: moment(value._d).format('YYYY-MM-DD')})
            setFormErrors({...formErrors, [name]: null})
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let formErrorsObj = {...formErrors}
        let requiredFields

        if(formValues.repeat){
            requiredFields = ['assetName', 'auditDate', 'repeatDuration', 'title']
        } else{
            requiredFields = ['assetName', 'auditDate', 'checklist','assignTo','title']
        }

         Object.keys(formValues).forEach((key) => {
            if(requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                isValid = false
                if(key === 'auditDate'){
                    formErrorsObj[key] = 'Audit Date is Required'
                }
                else{
                    formErrorsObj[key] = `${key} is Required`
                }
            }
        })

        setFormErrors(formErrorsObj)

        if(isValid){
            let payload = {
                asset_id: formValues.assetName.asset_id,
                auditDate: formValues.auditDate,
                assignTo: formValues.assignTo,
                repeat: formValues.repeat,
                repeatDuration: formValues.repeat ? formValues.repeatDuration : null,
                checklist : formValues?.questions,
                checklist_template_id : formValues?.checklist?.id || getChecklist[0]?.id || null,
                title : formValues.title,
                priority :  formValues.priority?.priority || null,
                whatsApp_notification : formValues.whatsApp_notification ? 1 : 0,
                sms_notification : formValues.sms_notification ? 1 : 0,
                email_notification : formValues.email_notification ? 1 : 0
            }

            if(props.type === 'new'){
                await dispatch(createAuditCheckList(payload))
                props?.handleClose()
                
                
            }else{
                await dispatch(updateAuditsAction(payload, props?.rowData?.checkList_id))
                props?.handleClose() 
            }
         
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }
    
    const assignToOptions = (createUser || []).filter((u) => {
        const role = (u?.role_name || u?.role || '').toLowerCase();
        const isAdmin = role.includes('admin');
        const hasEmpId = u?.employee_id !== null && u?.employee_id !== undefined && u?.employee_id !== '';
     return hasEmpId && !isAdmin;
   });



    useEffect(()=>{
        if( formValues.assetName !== null &&  formValues?.assetName[`Asset Group`] !== null && formValues?.assetName[`Asset Group`] !== undefined){
            const payload = {
               assetGroup :  formValues?.assetName[`Asset Group`],
               assetType :  formValues?.assetName[`Asset Type`],
            }
            dispatch(getChecklistAction(payload))
        }
    },[formValues.assetName?.['Asset Group'], formValues.assetName?.['Asset Type']])

    useEffect(() => {
        dispatch(listUserCreationAction())
        dispatch(getAllAssetAction())
    }, [])

    useEffect(() => {
        if(props?.type === 'detail' && createUser?.length > 0) {  
        const assignedEmployee = createUser.find((u) => {
            const fullName = [u?.first_name, u?.last_name]
                .filter(Boolean)
                .join(' ')
                .trim()
                .toLowerCase()
            return fullName === props?.assetData?.["Assigned To"]?.trim().toLowerCase()
        })

        setFormValues((prev) => ({
            ...prev,
            assetName: props?.assetData,
            assignTo: assignedEmployee?.employee_id ?? null 
        }))
    }
    }, [props, createUser])

    useEffect(() => {
        if (props?.type !== 'edit' || !props?.rowData?.checkList_id) return;
        dispatch(getAuditsByIdAction(props?.rowData?.checkList_id))
    }, [dispatch, props?.type, props?.rowData?.checkList_id])

    useEffect(() => {
        setFormValues((prev) => {
            if (prev.assetName !== null) {
                const ownerDetails = createUser.find((e) => e.employee_id === prev.assetName.asset_owner)
                const fullName = ownerDetails
                    ? ownerDetails.last_name
                        ? `${ownerDetails.first_name} ${ownerDetails.last_name}`
                        : ownerDetails.first_name
                    : null
                return {...prev, assetOwner: fullName}
            }
            return {...prev, assetOwner: null}
        })
    }, [createUser, formValues.assetName])

    useEffect(() => {
        if (props.type !== 'edit') return;
        const record = (Array.isArray(getAuditsById?.data) && getAuditsById.data[0]) || 
                       (Array.isArray(getAuditsById) && getAuditsById[0]) || null;
        if(!record) return;
        if (!Array.isArray(getAssetName) || getAssetName.length === 0) return;       
         //const assetId = record?.asset_id
        // const assetName = getAssetName?.find((a) => a.asset_id === assetId)  ? `${getAssetName[0].Name} ${getAssetName[0].Code}` : ''
        //const assetName = getAssetName?.find((a) => a.asset_id == record?.asset_id)
        const recordAssetId =
    record?.asset_id ?? record?.asset ?? record?.assetId ?? null;
  const assetName =
    getAssetName.find(
      (a) => String(a?.asset_id).trim() === String(recordAssetId).trim()
    ) || null;
        const selectedPriority = priorityOptions.find(
            (p) => String(p.priority).toLowerCase() === String(record?.priority || record?.priority_name || '').toLowerCase()
        ) || null

        const questions = parseQuestions(
            record?.questions ||
            record?.self_audit_questions ||
            record?.checklist_questions
        )

        const selectedChecklist = record?.checklist_template_id
            ? {
                id: record.checklist_template_id,
                checklist_name: record?.checklist_name || '',
                self_audit_questions: record?.self_audit_questions || JSON.stringify(questions),
                required: record?.required || null,
                imageCount: record?.imageCount || null,
            }
            : null;
        const fullNameFromRecord = [record?.first_name, record?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim()
            .toLowerCase();

        const assignedToIdByName = assignToOptions.find((u) => {
            const n = [u?.first_name, u?.last_name]
                .filter(Boolean)
                .join(" ")
                .trim()
                .toLowerCase();
            return n === fullNameFromRecord;
        })?.employee_id ?? null;

        const assignedTo =
            record?.assignTo ??
            record?.assign_to ??
            record?.assigned_to ??
            record?.employee_id ??
            assignedToIdByName ??
            null;

        setFormValues((prev) => ({
            ...prev,
            assetName,
            auditDate: record?.auditDate || record?.audit_date || '',
            assignTo: assignedTo,
            repeat: Boolean(record?.repeat),
            repeatDuration: record?.repeat
                ? (record?.repeatDuration || record?.repeat_duration || '')
                : '',
            checklist: selectedChecklist || record?.checklist_name,
            questions,
            title: record?.title || '',
            priority: selectedPriority,
            required: selectedChecklist?.required || null,
            imageCount: selectedChecklist?.imageCount || null,
            whatsApp_notification: Boolean(record?.whatsApp_notification),
            sms_notification: Boolean(record?.sms_notification),
            email_notification: Boolean(record?.email_notification),
        }));
    }, [props.type, getAuditsById,getAssetName]);
    


    return (
        <Card 
            sx = {{
                p : 5,
                minHeight : props?.type === 'detail' ? '' : maxHeight,
                maxHeight : props?.type === 'detail' ? '' : maxHeight,
                overflowY: props?.type === 'detail' ? 'visible' : 'auto',
            }}
        >
            <Grid container spacing={3}>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container display='flex' justifyContent='space-between'>
                        <Grid>
                            <Typography variant='h6' align='left' style={{ paddingBottom : '20px' }}>
                                Audits
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                
                <Grid
                    size={{
                        lg: props?.type === 'detail' ? 12 : 10,
                        md: props?.type === 'detail' ? 12 : 10,
                        sm: props?.type === 'detail' ? 12 : 10,
                        xs: props?.type === 'detail' ? 12 : 10
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
                                options={getAssetName}
                                getOptionLabel={(option) => {
                                    if (!option) return ''
                                    return typeof option === 'string' ? option : `${option.Name} - ${option.Code}`
                                }}
                                renderOption={(props, option) => (
                                    <li {...props}>
                                        {`${option.Name} - ${option.Code} - ${option['Asset Owner']} - ${option.Location}`}
                                    </li>
                                )}
                                value={formValues.assetName || ''}
                                 disabled={props?.type === 'detail'}
                                onChange={(event, value) => handleValueChange('assetName', value)}
                                isOptionEqualToValue={(option, value) => option?.asset_id === value?.asset_id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant='filled'
                                        label='Asset Name'
                                        required
                                        fullWidth
                                        error={formErrors.assetName !== null}
                                        helperText={formErrors.assetName === null ? '' : 'Asset Name is Required'}
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
                                variant='filled'
                                label='title'
                                required
                                value={formValues.title || ''}
                                error={formErrors.title !== null}
                                  onChange={(e) => handleValueChange('title', e.target.value)}
                                helperText={formErrors.title === null ? '' : 'Title is Required'}
                            />
                        </Grid>
            {formValues.assetName?.asset_id !== null && formValues.assetName?.asset_id !== undefined && (
                <>
                        <Grid
                            size={{
                                lg: 3,
                                md: 4,
                                sm: 4,
                                xs: 12
                            }}>
                            <TextField
                                fullWidth
                                variant='filled'
                                label='Asset Code'
                                value={formValues.assetName?.Code}
                                disabled
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
                                variant='filled'
                                label='Asset Type'
                                fullWidth
                                value={formValues?.assetName?.['Asset Type'] || ""}
                                disabled
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
                                variant='filled'
                                label='Asset Group'
                                fullWidth
                                value={formValues?.assetName?.['Asset Group']}
                                disabled
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
                                variant='filled'
                                label='Asset Owner'
                                fullWidth
                                value={formValues?.assetName?.['Asset Owner']}
                                disabled
                            />
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
                        options={assignToOptions}
                        fullWidth
                        getOptionLabel={(option) => {const name = [option?.first_name, option?.last_name].filter(Boolean).join(' ');
                        return `${name} (${option?.employee_code})`;
                        }}
                        value={formValues.assignTo? assignToOptions.find((u) => String(u.employee_id) === String(formValues.assignTo)) || null: null}
                        onChange={(event, value) => handleValueChange('assignTo', value?.employee_id ?? null)}
                        isOptionEqualToValue={(option, value) =>String(option?.employee_id) === String(value?.employee_id)}
                        renderInput={(params) => (
                        <TextField
                        {...params}
                        variant="filled"
                        label="Assigned To"
                        required
                        error={Boolean(formErrors.assignTo)}
                        helperText={formErrors.assignTo || ''}
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
                                    label='Audit Date'
                                    value={toMomentOrNull(formValues.auditDate)}
                                    onChange={(e) => handleDateChange('auditDate', e)}
                                    views={['year', 'month', 'day']}
                                    format="DD/MM/YYYY"
                                    slotProps={{ textField: { required: true, fullWidth: true, variant: 'filled', error: formErrors.auditDate !== null, helperText: formErrors.auditDate === null ? '' : formErrors.auditDate } }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid
                            size={{
                                lg: 3,
                                md: 3,
                                sm: 4,
                                xs: 4
                            }}>
                                      <Autocomplete
                                        options={getChecklist || []}
                                        fullWidth
                                        getOptionLabel={(option) => option?.checklist_name || ''}
                                        value={formValues.checklist}
                                        isOptionEqualToValue={(option, value) => String(option?.id) === String(value?.id)}
                                        onChange={(event, value) => handleValueChange('checklist', value)}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            fullWidth
                                            required
                                            label='Select Checklist'
                                            variant='filled'
                                            error={Boolean(formErrors.checklist)}
                                            helperText={formErrors.checklist || ''}
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
                             <Autocomplete
                                        options={priorityOptions || []}
                                        fullWidth
                                        getOptionLabel={(option) => option?.priority || ''}
                                        value={formValues.priority}
                                        onChange={(event, value) => handleValueChange('priority', value)}
                                        renderInput={(params) => (
                                          <TextField
                                            {...params}
                                            fullWidth
                                            label='Priority'
                                            variant='filled'
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
                            <FormControlLabel
                                label='Repeat'
                                control={
                                    <Switch
                                        checked={formValues.repeat}
                                        onChange={() => setFormValues({...formValues, repeat: !formValues.repeat})}
                                    />
                                }
                            />
                        </Grid>
                
                        { formValues.repeat &&
                            <Grid
                                size={{
                                    lg: 3,
                                    md: 4,
                                    sm: 4,
                                    xs: 12
                                }}>
                                {/* Frequence */}
                                <Autocomplete
                                    options={['Every Week', 'Every Month', 'Every Year']}
                                    value={formValues.repeatDuration}
                                    onChange={(event, value) => handleValueChange('repeatDuration', value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            fullWidth
                                            variant='filled'
                                            label='Duration'
                                            error={formErrors.repeatDuration !== null}
                                            helperText={formErrors.repeatDuration === null ? '' : 'Duration is Required'}
                                        />
                                    )}
                                />
                            </Grid>
                        }

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
                                        checked={Boolean(formValues.email_notification)}
                                        onChange={(_e, checked) => setFormValues(prev => ({...prev, email_notification: checked}))}
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
                                          checked={Boolean(formValues.sms_notification)}
                                        onChange={(_e, checked) => setFormValues(prev => ({...prev, sms_notification: checked}))}
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
                                          checked={Boolean(formValues.whatsApp_notification)}
                                        onChange={(_e, checked) => setFormValues(prev => ({...prev, whatsApp_notification: checked}))}
                                        />
                                      }
                                      label='Whatsapp'
                                      labelPlacement='end'
                                    />
                                </Grid>
                                </Grid>
                    </Grid>

                      {formValues?.questions?.length > 0 && 
                      <>
            <Table style={{marginTop : '10px'}}>
  <TableHead>
    <TableRow>
      <TableCell>Checklist</TableCell>
      <TableCell>Status</TableCell>
    </TableRow>
  </TableHead>

  <TableBody>
    {formValues?.questions?.map((row, index) => (
      <TableRow key={index}>
        <TableCell>{row.message}</TableCell>

        <TableCell>
          <RadioGroup
            row
            value={row.answer}
            onChange={(e) => {
              const updated = [...formValues.questions];
              updated[index].answer = e.target.value;

              setFormValues(prev => ({
                ...prev,
                questions: updated
              }));
            }}
          >
            <FormControlLabel value="yes" control={<Radio disabled />} label="Yes" />
            <FormControlLabel value="no" control={<Radio disabled />} label="No" />
          </RadioGroup>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
            <Grid mt={5}>
                <AttachmentField
                asset='Renewals'
                status  = {6}
              />
              </Grid>

              <Typography pt={3} color={'grey'}>{formValues?.imageCount !== 0  ? `Maximum ${formValues?.imageCount} Allowed ${formValues?.required === 1 ? '(required)' : ''}` : '' }</Typography>

</>

}

                <Grid>
                    <Grid container mt={3} width={'100%'} spacing={2} display='flex' justifyContent='flex-end'>
                        <Grid>
                            <Button
                                variant='contained'
                                color='error'
                                onClick={() => props?.handleClose(false)}
                            >Cancel</Button>
                        </Grid>

                        <Grid>
                            <Button
                                variant='contained'
                                onClick={handleSubmit}
                                // disabled = {formValues.assetName[`Assigned To`] ? false :  true}
                            >Create Audit</Button>
                        </Grid>

                    </Grid>
                </Grid>
                </Grid>

            </Grid>
        </Card>
    );

}

AuditCheckListCreationForm.propTypes = {
    type : PropTypes.string,
    assetData : PropTypes.object,
    handleClose : PropTypes.func
}

export default AuditCheckListCreationForm
