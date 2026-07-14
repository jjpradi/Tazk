import { useEffect, useState} from 'react'
import {Autocomplete, TextField, Typography, Button, Grid, Checkbox, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, Container} from '@mui/material'
import { capitalize } from 'lodash';
import { useDispatch } from 'react-redux';
import { CreateScrapAssetAction } from 'redux/actions/asset_actions';
import moment from 'moment';
import PropTypes from 'prop-types'
import AssetAttachment from 'pages/assets/Assets/AssetAttachment';
import { requiredFieldsAlertMessage } from 'utils/content';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { getsessionStorage } from 'pages/common/login/cookies';

function ScrapAsset(props) {
    
    const{ createdAt, updatedAt, asset_id, assignedTo } = props.assetData
    const dispatch = useDispatch()
    const storage = getsessionStorage()
    const assignedUserName =
        props?.assetData?.['Assigned To'] ||
        props?.assetData?.assignedToName ||
        props?.assetData?.assigned_to_name ||
        props?.assetData?.full_name ||
        ''
    const isAssigned = Boolean(assignedTo || props?.assetData?.assigned_to || assignedUserName)
    const userDisplayName =
        isAssigned ? assignedUserName : 'Not Assigned'
    
    const [formValues, setFormValues] = useState({
        condition : null,
        scrap : true,
        reason : null,
        user : userDisplayName
    })
    
    const [formErrors, setFormErrors] = useState({
        condition : null,
        images : null,
        reason : null
    })
    
    const [openDialog, setOpenDialog] = useState(false)
    const [scrapAssetImages, setScrapAssetImages] = useState({
        scrapAssetImages : [],
        scrapAssetImagePreviews : []
    })
    

    useEffect(() => {
        if(scrapAssetImages.scrapAssetImagePreviews.length > 2){
            setFormErrors({
                ...formErrors,
                images : 'Only 2 Images are Required'
            })
        }
        else{
            setFormErrors({
                ...formErrors,
                images : null
            })
        }
    }, [scrapAssetImages.scrapAssetImagePreviews])

    const requiredFields = ['condition', 'images', 'reason']
    const currentCondition = ['New', 'Used', 'Damaged', 'Missing', 'Expired']

    const handleChange = (name, value) => {
        setFormValues({...formValues, [name] : value})
        validationHandler(name, value)
    }

    const validationHandler = (name, value) => {
        if(!Object.keys(formErrors).includes(name)) return

        if(requiredFields.includes(name) && (value === null || value === 'null' || value === ''  || Object.keys(value) && value.value === null)) {
            setFormErrors({
                ...formErrors,
                [name] : capitalize(name.replace(/_/g, ' ')) + ' is Required!'
            })
            return
        }
        setFormErrors({
            ...formErrors,
            [name] : null
        })
    }

    const handleScrapSubmit = (event) => {
        event.preventDefault()
        let isValid = true

        let formErrorsObj = {...formErrors}
        Object.keys(formValues).map((key, i) => {
            if(requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')) {
                isValid = false
                formErrorsObj[key] = capitalize(key) + ' is Required'
            }
            if(scrapAssetImages.scrapAssetImagePreviews.length === 0) {
                isValid = false
                formErrorsObj.images = 'Image is Required'
            }
            if(scrapAssetImages.scrapAssetImagePreviews.length > 2) {
                isValid = false
                formErrorsObj.images = 'Only 2 Images are Required'
            }
            if(scrapAssetImages.scrapAssetImagePreviews.length > 0 && scrapAssetImages.scrapAssetImagePreviews.length <= 2  && formValues.condition !== null ) {
                isValid = true
                formErrorsObj.images = null
            }
            return null
        })

        setFormErrors(formErrorsObj)

        if(isValid ){
            setOpenDialog(true)
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

    const handleConfirmSubmit = () => {
    const assignedToPayload = assignedTo || props?.assetData?.assignedTo || props?.assetData?.assigned_to || props?.assetData?.assigned_to_id || null
        const formData = new FormData()
        let scrapAssetImage = []
        scrapAssetImages.scrapAssetImages.map((img) => {
            formData.append('scrapAssetImages', img)
            scrapAssetImage.push({
                fileName : img.name,
                type : img.type
            })
        })
        formData.append('asset_id', asset_id)
        formData.append('asset_condition', formValues.condition)
        formData.append('assigned_to', assignedToPayload)
        formData.append('reason', formValues.reason)
        formData.append('images', JSON.stringify(scrapAssetImage))

        dispatch(CreateScrapAssetAction(formData))
        
        setOpenDialog(false)
        props.handleDetailClose(false)
    }

    return (
        <>
            <Container sx={{ p : 6 }}>
                <Typography variant='h6' align='left'>
                    Scrap Asset
                </Typography>

                <Grid container rowGap={5} sx={{mt:'2%'}}>
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Autocomplete
                            options = {currentCondition}
                            value = {formValues.condition}
                            onChange = {(name, value) => handleChange('condition', value)}                        
                            renderInput = {(params) => (
                                <TextField 
                                    {...params}
                                    required
                                    label = 'Condition'
                                    variant = 'filled'
                                    error = {formErrors.condition !== null}
                                    helperText = {formErrors.condition === null ? '' : formErrors.condition}
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
                            label = 'User'
                            variant = 'filled'
                            value = {formValues.user || userDisplayName}
                            onChange = {(event) => handleChange('user', event.target.value)}
                            InputProps={{ readOnly: isAssigned }}
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
                            label = 'Date & Time'
                            variant = 'filled'
                            value = {updatedAt ? moment(updatedAt).format('DD/MM/YYYY hh:mm A') : moment(createdAt).format('DD/MM/YYYY hh:mm A')}
                            onChange = {(e) => e.preventDefault()}
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
                            label = 'Reason'
                            variant = 'filled'
                            rows = {2}
                            value = {formValues.reason || ''}
                            onChange = {(event) => handleChange('reason', event.target.value)}
                            error = {formErrors.reason !== null}
                            helperText = {formErrors.reason === null ? '' : 'Reason is Required!'}
                        />
                    </Grid>

                    {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                        <FormControlLabel 
                            control = {
                                <Checkbox 
                                    defaultChecked 
                                    onChange={() => setFormValues({...formValues, scrap: !formValues.scrap})} 
                                />
                            }
                            label = 'Move to Scrap'
                            labelPlacement = 'start'
                        />
                    </Grid> */}

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <AssetAttachment 
                            asset = 'Scrap'
                            previews = {scrapAssetImages.scrapAssetImagePreviews} 
                            setPreviews = {setScrapAssetImages} 
                        />
                        <Typography color='error' variant='h6'>NOTE : Only 2 images are allowed</Typography>
                        <Typography color='error'>{formErrors.images !== null ? formErrors.images : ''}</Typography>
                    </Grid>

                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                            <Grid container gap={2} display='flex' justifyContent='end'>
                                <Grid>
                                    <Button 
                                        variant='contained' 
                                        color='error' 
                                        onClick={()=>props.closeDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                                <Grid>
                                    <Button 
                                        variant='contained' 
                                        onClick={handleScrapSubmit}
                                    >
                                        Send Request
                                    </Button>
                                </Grid>
                            </Grid>
                    </Grid>

                </Grid>
            </Container>
            <Dialog open={openDialog}>
                <DialogContent>
                    <DialogContentText>
                        Are you sure want to send the request?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>setOpenDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmSubmit}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

}

ScrapAsset.propTypes = {
    assetData : PropTypes.object,
    closeDialog : PropTypes.func,
    handleDetailClose : PropTypes.func
}

export default ScrapAsset
