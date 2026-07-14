import { Button, Card, Grid, TextField } from "@mui/material"
import PropTypes from "prop-types"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { OpenalertActions } from "redux/actions/alert_actions";
import { addNewSource, addNewStatus } from "redux/actions/leadManagement_actions"
import { requiredFieldsAlertMessage } from "utils/content";

function NewSource(props){

    const dispatch = useDispatch()

    const[newSource, setNewSource] = useState(null)
    const[newStatus, setNewStatus] = useState(null)
    const[error, setError] = useState(null)

    const handleSourceChange = (event) => {
        const { value } = event.target 
        if(value !== null && value !== ''){
            setNewSource(value)
            setError(null)
        }
        else{
            setNewSource(null)
            setError('Source is Required')
        }
    }

    const handleStatusChange = (event) => {
        const { value } = event.target 
        if(value !== null && value !== ''){
            setNewStatus(value)
            setError(null)
        }
        else{
            setNewStatus(null)
            setError('Stage is Required')
        }
    }

    const handleAddSource = async() => {
        if(newSource === null){
            setError('Source is Required')
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
        else{
            setError(null)
            await dispatch(addNewSource({sourceName: newSource}))
            props.closeDialog()
        }
    }

    const handleAddStatus = async() => {
        if(newStatus === null){
            setError('Stage is Required')
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
        }
        else{
            setError(null)
            await dispatch(addNewStatus({statusName: newStatus}))
            props.closeDialog()
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if(props.type === 'Lead Source'){
            handleAddSource()
        }
        else if(props.type === 'Lead Status' || props.type === 'Lead Stage'){
            handleAddStatus()
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
                    {
                        props.type === 'Lead Source' ?
                            <TextField
                                label='Source'
                                value={newSource}
                                required
                                variant="filled"
                                onChange={handleSourceChange}
                                fullWidth
                                error={error !== null}
                                helperText={error !== null ? error : ''}
                            />
                        : props.type === 'Lead Status' || props.type === 'Lead Stage' ?
                            <TextField
                                label='Stage'
                                value={newStatus}
                                required
                                variant="filled"
                                onChange={handleStatusChange}
                                fullWidth
                                error={error !== null}
                                helperText={error !== null ? error : ''}
                            />
                        : <></>
                    }
                    
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

NewSource.propTypes = {
    closeDialog: PropTypes.func,
    type: PropTypes.string
}

export default NewSource
