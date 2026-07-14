import { Autocomplete, Box, Button, Checkbox, Divider, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from "@mui/material"
import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAllAssetAction } from "redux/actions/asset_actions"
import { createAuditAction, sendReportNotificationAction } from "redux/actions/audit_actions"
import PropTypes from 'prop-types'
import AssetAttachment from "../../../pages/assets/Assets/AssetAttachment"
import { requiredFieldsAlertMessage } from "utils/content"
import { OpenalertActions } from "redux/actions/alert_actions"

function AssetAuditCheckList(props){

    const currentDate = new Date().toISOString().split('T')[0]
    const dispatch = useDispatch()
    const[auditImages, setAuditImages] = useState({
        auditImages: [],
        imagePreviews: []
    })
    const {
        AssetReducers: {
            getAssetName
        }
    } = useSelector((state) => state)

    const[formValues, setFormValues] = useState({
        assetName: null,
        reportRemarks: null,
        declaration: false,
        name :  props?.checklistName || null ,
        assetType : props?.assetType || null,
        assetGroup : props?.assetGroup || null
    })

    const[formErrors, setFormErrors] = useState({
        assetName: null,
        auditImages: null,
        reportRemarks: null,
        declaration: null

    })
    const [reportEnable, setReportEnable] = useState(false)
    const [checkList, setCheckList] = useState([])
    const[auditDate, setAuditDate] = useState(null)

    useEffect(() =>{
        dispatch(getAllAssetAction())
    }, [])

    useEffect(() => {
        if(formValues.checkList){
            let valid = false
            Object.keys(formValues.checkList).forEach((key) => {
                if(formValues.checkList[key] === 'No'){
                    valid = true
                }
            })
            setReportEnable(valid)
        }
    }, [formValues])

   // Replace the whole useEffect at AssetAuditCheckList.js that currently does setFormValues twice
useEffect(() => {
  setFormErrors({
    assetName: null,
    auditImages: null,
    reportRemarks: null,
    declaration: null,
  });

  setCheckList(props?.checkListFields ?? []);

  const selectedAsset =
    getAssetName?.find((asset) => asset.asset_id === props?.assetId) ?? null;

  const checkListValues0 = props?.checkListValues?.[0] ?? {};

  const dateInput = props?.auditDate ? props?.auditDate : currentDate;
  const formattedDates = moment(dateInput?._d ?? dateInput)?.format("DD/MM/YYYY");
  setAuditDate(formattedDates);

  setAuditImages((prev) => ({
    ...prev,
    imagePreviews: Array.isArray(props?.auditImages) ? props.auditImages : [],
  }));

  setFormValues((prev) => ({
    ...prev,
    assetName: selectedAsset,
    reportRemarks: props?.remarks ?? null,
    declaration: false,
    checkList: { ...checkListValues0 },

    // keep these in the same state update so they never get dropped
    name: props?.checklistName ?? null,
    assetGroup: props?.assetGroup ?? null,
    assetType: props?.assetType ?? null,
  }));
}, [
  props?.assetId,
  props?.remarks,
  props?.checkListFields,
  props?.checkListValues,
  props?.auditImages,
  props?.auditDate,
  props?.checklistName,
  props?.assetGroup,
  props?.assetType,
  getAssetName,
]);


    useEffect(() => {
        if(auditImages.imagePreviews.length > 0 && auditImages.imagePreviews.length <  props.imageCount &&  props.required == 1){
            setFormErrors({...formErrors, auditImages: `Alteast ${props.imageCount} Images are Required`})
        }
        else if ((auditImages.imagePreviews.length >=  props.imageCount) &&  props.required == 1 ){
            setFormErrors({...formErrors, auditImages: null})
        }
    }, [auditImages])

    const handleChange = (name, value) => {
        if(value !== null && value !== ''){
            setFormValues({...formValues, [name]: value})
            setFormErrors({...formErrors, [name]: null})
        }
        else{
            setFormValues({...formValues, [name]: null})
            setFormErrors({...formErrors, [name]: 'Asset Name is Required'})
        }
    }

    const handleCheckListChange = (name, value) => {
        setFormValues({
            ...formValues,
            checkList: {...formValues.checkList, [name]: value}
        })
        setFormErrors({
            ...formErrors,
            checkList: {...formErrors.checkList, [name]: null}
        })
        if(value === 'No'){
            setReportEnable(true)
        } else{
            setReportEnable(false)
        }
    }

    const handleClose = () =>{
        props?.handleClose()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        let isValid = true
        let errorObj = {...formErrors}
        
        if (!reportEnable && (!formValues.reportRemarks || formValues.reportRemarks.trim() === "")) {
            isValid = false
            errorObj.reportRemarks = "Remarks are required"
        } else {
            errorObj.reportRemarks = null
        }

        if (props.required == 1) {
            if (auditImages.imagePreviews.length === 0) {
                isValid = false
                errorObj.auditImages = "Audit Images are Required"
            } else if (auditImages.imagePreviews.length < props.imageCount) {
                isValid = false
                errorObj.auditImages = `At least ${props.imageCount} Images are Required`
            } else {
                errorObj.auditImages = null
            }
        } else {
            errorObj.auditImages = null
        }

        let checkListErrorObj = {}
        if (checkList && checkList.length > 0) {
            checkList.forEach((item) => {
                const value = formValues.checkList?.[item.name];
                if (value === null || value === undefined || value === "") {
                    isValid = false
                    checkListErrorObj[item.name] = `${item.name} is Required`
                }
            });
            errorObj.checkList = checkListErrorObj;
        }

        if (formValues.declaration === false) {
            isValid = false
            errorObj.declaration = "Please check the declaration"
        } else {
            errorObj.declaration = null
        }

        setFormErrors(errorObj)
        if(isValid){
            const formData = new FormData()
            let auditImage = []
            auditImages.auditImages.map((img) => {
                formData.append("auditImages", img)
                auditImage.push({
                    fileName: img.name,
                    type: img.type
                })
            })
            formData.append("asset_id", props.assetId)
            formData.append("checkList_id", props?.checkListId)
            formData.append("checkList_values", JSON.stringify(formValues.checkList))
            formData.append("audit_date", currentDate)
            formData.append("remarks", formValues.reportRemarks)
            formData.append("images", JSON.stringify(auditImage))
            
            await dispatch(createAuditAction(formData))
            if(props?.auditLog === 'audit'){
                props?.handleClose()
            }
            else{
                props?.setCheckListId()
            }
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

    const sendReport = async (event) => {
        event.preventDefault()
        const formData = new FormData()
        let payload = {
            asset_id: formValues.assetName.asset_id,
            checkList_id: props?.checkListId,
            checkList_values: formValues.checkList,
            images: [],
            audit_date: currentDate,
            remarks: formValues.reportRemarks
        }
        await dispatch(createAuditAction(payload))

        let payload2 = {
            body: formValues.reportRemarks,
            title: 'Audit Notification',
        }
        await dispatch(sendReportNotificationAction(payload2))
        props?.setCheckListId()
    }

    const reportRemarksHelperText = reportEnable ? 'Report is Required' : 'Please Enter Remarks'

    useEffect(() => {
        setFormValues(prev => ({
            ...prev,
            name: props?.checklistName,
            assetType : props?.assetType || null,
            assetGroup : props?.assetGroup || null
        }));
    }, [props]);

    console.log(props?.assetGroup,'asdkjjajhda')

    return (
        <Box sx={{p: 5}}>
            <Grid container spacing={4}>
                <Grid
                    size={{
                        lg: 8,
                        md: 8,
                        sm: 8,
                        xs: 12
                    }}>
                    <Typography variant='h3' sx={{ml: '55%'}}>AUDIT CHECKLIST</Typography>
                </Grid>

                <Grid
                    display='flex'
                    justifyContent='end'
                    size={{
                        lg: 4,
                        md: 4,
                        sm: 4,
                        xs: 12
                    }}>
                    <Typography variant='h4'>{`DATE: ${auditDate}`}</Typography>
                </Grid>

                {/* <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                    <Autocomplete
                        options={getAssetName}
                        value={formValues.assetName}
                        getOptionLabel={(option) => option.Name || ''}
                        onChange={(event, value) => handleChange('assetName', value)}
                        disabled={props?.status === 'Done'}
                        renderInput={(params) => (
                            <TextField 
                                {...params}
                                required
                                fullWidth
                                variant='filled'
                                label='Asset Name'
                                error={formErrors.assetName !== null}
                                helperText={formErrors.assetName === null ? '' : 'Asset Name is Required'}
                            />
                        )}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
                    <TextField 
                        value={formValues.assetName ? formValues.assetName.Code : ''}
                        label='Asset Code'
                        onChange={(e) => e.preventDefault()}
                        fullWidth
                        disabled={props?.status === 'Done'}
                        variant="filled"
                    />
                </Grid> */}

                  <Grid
                      size={{
                          lg: 4,
                          md: 4,
                          sm: 4,
                          xs: 4
                      }}>
              <TextField
                fullWidth
                variant="filled"
                label="Checklist Name"
                value={formValues.name || ''}
                disabled
                />
            </Grid>

        <Grid
            size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 4
            }}>

              <TextField
                fullWidth
                label='Asset Group'
                variant='filled'
                value={formValues.assetGroup || ''}
                disabled
              />
         
        </Grid>
        <Grid
            size={{
                lg: 4,
                md: 4,
                sm: 4,
                xs: 4
            }}>

              <TextField
                fullWidth
                label='Asset Type'
                variant='filled'
                value={formValues.assetType || ''}
                disabled
              />
         
        </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <AssetAttachment
                        asset = 'Audit'
                        previews = {auditImages.imagePreviews}
                        setPreviews = {setAuditImages}
                        status = {props?.status === 'Done' || props?.isAdmin ? 6 : 0}
                    />
                    <Typography color='error'>{formErrors.auditImages !== null ? formErrors.auditImages : ''}</Typography>
                </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container spacing={2} rowGap={2}>
                        {
                            checkList.length > 0 ? (
                                <>
                                    <Grid
                                        display='flex'
                                        justifyContent='center'
                                        size={{
                                            lg: 6,
                                            md: 6,
                                            sm: 6,
                                            xs: 6
                                        }}>
                                        <Typography variant="h4">Check List</Typography>
                                    </Grid>
                                    <Grid
                                        size={{
                                            lg: 6,
                                            md: 6,
                                            sm: 6,
                                            xs: 6
                                        }}>
                                        <Typography></Typography>
                                    </Grid>
                                    <Divider />
                                
                                    {
                                        checkList.map((list) => {
                                            return (
                                                <>
                                                    <Grid
                                                        display='flex'
                                                        alignItems='center'
                                                        size={{
                                                            lg: 6,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <Typography>{list.name}</Typography>
                                                    </Grid>
                                                    <Grid
                                                        size={{
                                                            lg: 6,
                                                            md: 6,
                                                            sm: 6,
                                                            xs: 6
                                                        }}>
                                                        <FormControl>
                                                            <RadioGroup row value={formValues?.checkList[list.name]} onChange={(event) => handleCheckListChange(list.name, event.target.value)}>
                                                                {
                                                                    list.options.map((option, index) => (
                                                                        <FormControlLabel key={index}
                                                                            disabled={props?.status === 'Done' || props?.isAdmin}
                                                                            control={<Radio />}
                                                                            value={option}
                                                                            label={option}
                                                                        />
                                                                    ))
                                                                }
                                                            </RadioGroup>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid
                                                        sx={12}
                                                        size={{
                                                            lg: 12,
                                                            md: 12,
                                                            sm: 12
                                                        }}>
                                                        <Typography variant='caption' color='error'>{formErrors.checkList ? formErrors.checkList[list.name] : ''}</Typography>
                                                        <Divider />
                                                    </Grid>
                                                </>
                                            );
                                        })
                                    }
                                </>
                            ) 
                            : null
                        } 
                    </Grid>
                </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <TextField
                        label={reportEnable ? 'Report' : 'Remarks'}
                        multiline
                        fullWidth
                        rows={4}
                        required={!reportEnable}
                        disabled={props?.status === 'Done' || props?.isAdmin}
                        onChange={(event) => handleChange('reportRemarks', event.target.value)}
                        value={formValues.reportRemarks || ''}
                        variant="filled"
                        error={formErrors.reportRemarks !== null}
                        helperText={formErrors.reportRemarks === null ? '' : reportRemarksHelperText}
                    />
                </Grid>

                { !reportEnable && props.status !== 'Done' && !props?.isAdmin &&
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <FormControlLabel
                            control={<Checkbox 
                                        value={formValues.declaration} 
                                        onChange={() => {
                                            setFormValues({...formValues, declaration: !formValues.declaration})
                                            setFormErrors({...formErrors, declaration: null})
                                        }}
                                    />}
                            label='I hereby declare that I have audited the specified asset as assigned. I confirm that the audit was conducted in accordance with the relevant standards and regulations'
                        />
                        <Typography variant='caption' color='error'>{formErrors.declaration ? formErrors.declaration : ''}</Typography>

                    </Grid>
                }

                {
                    props?.status !== 'Done' && !props?.isAdmin &&
                        <Grid
                            display='flex'
                            justifyContent='center'
                            size={{
                                lg: 12,
                                md: 12,
                                sm: 12,
                                xs: 12
                            }}>
                            {
                                reportEnable ? (
                                    <Button variant="contained" onClick={sendReport}>Report</Button>
                                ) : (
                                    <Button variant="contained" onClick={handleSubmit}>Done</Button>
                                )
                            }
                        </Grid>
                }

                {
                    props?.auditLog === 'audit' &&
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                    <Button variant="contained" onClick={handleClose} >Close</Button>
                </Grid>
                }

            </Grid>
        </Box>
    );

}

AssetAuditCheckList.propTypes = {
    checkListFields : PropTypes.object,
    assetId  : PropTypes.number,
    remarks : PropTypes.string,
    checkListValues : PropTypes.array,
    auditDate : PropTypes.string,
    auditImages : PropTypes.array,
    handleClose : PropTypes.func,
    auditLog : PropTypes.string,
    status : PropTypes.string,
    checkListId : PropTypes.number,
    setCheckListId : PropTypes.number,
    isAdmin : PropTypes.bool
}

export default AssetAuditCheckList