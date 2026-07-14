import { Button, Card, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { OpenalertActions } from "redux/actions/alert_actions";
import { addComplianceAction } from "redux/actions/compliances_actions";
import { requiredFieldsAlertMessage } from "utils/content";

function NewCompliance(props){

    const dispatch = useDispatch()

    const [compliance, setCompliance] = useState(null)
    const [error, setError] = useState(null)

    const handleStatusChange = (event) => {
        const value = event.target.value

        if(value !== null && value !== ''){
            setCompliance(value)
            setError(null)
        }
        else{
            setCompliance(null)
            setError('Compliance is Required!')
        }
    }

    const handleSubmit = async(event) => {
        event.preventDefault()

        if(compliance !== null && compliance !== ''){
            await dispatch(addComplianceAction({name: compliance}))
            props.closeDialog()
        }
        else{
            setError('Compliance is Required!')
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

    return (
        <Card sx={{p: 4}}>
            <Grid container spacing={2}>
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Typography>New Compliance</Typography>
                </Grid>
                
                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <TextField
                        label='Compliance'
                        value={compliance}
                        required
                        variant="filled"
                        onChange={handleStatusChange}
                        fullWidth
                        error={error !== null}
                        helperText={error !== null ? error : ''}
                    />
                    
                </Grid>

                <Grid
                    size={{
                        lg: 12,
                        md: 12,
                        sm: 12,
                        xs: 12
                    }}>
                    <Grid container display='flex' justifyContent='flex-end' spacing={2}>
                        <Grid>
                            <Button variant="contained" color="error" onClick={() => props.closeDialog()}>Cancel</Button>
                        </Grid>

                        <Grid>
                            <Button variant="contained" onClick={handleSubmit}>Add</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Card>
    );
}

export default NewCompliance