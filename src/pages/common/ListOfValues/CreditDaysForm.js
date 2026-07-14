import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import { capitalize } from "lodash";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { OpenalertActions } from "redux/actions/alert_actions";
import { createCreditDaysLovAction } from "redux/actions/termsConditions_actions";
import { requiredFieldsAlertMessage } from "utils/content";

function CreditDaysForm(props){

    const dispatch = useDispatch()

    const [formValues, setFormValues] = useState({
        name : null,
        days : null
    })
    const [formErrors, setFormErrors] = useState({
        name : null,
        days : null
    })
    const requiredFields = ['name', 'days']

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }))

        if(requiredFields.includes(name) && (value === null || value === '')){
            setFormErrors((prev) => ({ ...prev, [name]: capitalize(name.replace(/_/g, '')) + ' is Required' }))
        }
        else{
            setFormErrors((prev) => ({ ...prev, [name]: null }))
        }
    }

    const handleSubmit = async(event) => {
        event.preventDefault()

        let formErrorObj = {...formErrors}
        let isValid = true

        Object.keys(formValues).map((key) => {
            if(requiredFields.includes(key) && (formValues[key] === null || formValues[key] === 'null' || formValues[key] === '')){
                isValid = false
                formErrorObj.key = capitalize(key.replace(/_/g, '')) + ' is Required'
            }
        })

        if(isValid){
            const payload = {
                creditDaysName: formValues.name,
                creditDays: formValues.days
            }
            await dispatch(createCreditDaysLovAction(payload))
            props.handleClose()
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
    }

    return (
        <Container sx={{ p: 5 }}>
            <Grid container spacing = {5}>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Typography variant = 'h6' align = 'left'>
                        Add Credit Days
                    </Typography>
                </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <TextField
                        required
                        fullWidth
                        label = 'Days'
                        variant = 'filled'
                        value = {formValues.days}
                        onChange = {(event) => handleChange('days', event.target.value)}
                        error = {formErrors.days !== null}
                        helperText = {formErrors.days ? 'Credit Days is Required' : ''}
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
                        required
                        fullWidth
                        label = 'Name'
                        variant = 'filled'
                        value = {formValues.name}
                        onChange = {(event) => handleChange('name', event.target.value)}
                        error = {formErrors.name !== null}
                        helperText = {formErrors.name ? 'Credit Day Name is Required' : ''}
                    />
                </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container spacing = {2} display = 'flex' justifyContent = 'flex-end'>
                        <Grid>
                            <Button variant = 'contained' color = 'error' onClick = {() => props.handleClose()}>
                                Cancel
                            </Button>
                        </Grid>

                        <Grid>
                            <Button variant = 'contained' onClick = {handleSubmit}>
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
}

export default CreditDaysForm