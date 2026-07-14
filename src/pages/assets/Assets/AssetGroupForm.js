import { Button, Container, Grid, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { OpenalertActions } from "redux/actions/alert_actions"
import { createAssetGroup, getAssetGroupIdAction } from "redux/actions/asset_actions"
import { requiredFieldsAlertMessage } from "utils/content"

function AssetGroupForm(props) {

    const dispatch = useDispatch()

    const[values, setValues] = useState({
        groupName: null
    })

    const[errors, setErrors] = useState({
        groupName: null
    })

    const [pagination] = useState({
        searchString:'',
        pageCount : 0,
        numPerPage : 5
    })

    const handleChange = (val, name) => {
        if(val !== null && val !== ''){
            setValues({...values, [name]: val})
            setErrors({...errors, [name]: null})
        }
        else{
            setValues({...values, [name]: null})
            setErrors({...errors, [name]: 'Group Name is Required'})            
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let isValid = true
        let errorObj = {...errors}
        let required = ['groupName']

        await Object.keys(values).map((key, i) => {
            if(required.includes(key) && values[key] === null || values[key] === 'null' || values[key] === ''){
                isValid = false
                errorObj[key] = `${key} is Required!`
            }
            return null
        })

        setErrors(errorObj)

        if(isValid){
            await dispatch(createAssetGroup(values,()=>{
                 dispatch(getAssetGroupIdAction(pagination))
                props.setPagination({
                    searchString:'',
                })
            }))
            props.handleClose()
        }
        else {
            dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
        }
    }

    return (
        <>
            <Container sx={{p: 5}}>
                <Grid container spacing={5}>
                    <Grid
                        size={{
                            lg: 12,
                            md: 12,
                            sm: 12,
                            xs: 12
                        }}>
                        <Typography variant="h6" align='left'>Add Asset Group</Typography>
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
                            label='Asset Group'
                            variant="filled"
                            value={values.groupName}
                            onChange={(e) => handleChange(e.target.value, 'groupName')}
                            error={errors.groupName === null ? false : true}
                            helperText={errors.groupName === null ? '' : 'Group Name is Required'}
                        />
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
                                <Button variant='contained' onClick={() => props.handleClose()}>Cancel</Button>
                            </Grid>

                            <Grid>
                                <Button variant='contained' onClick={handleSubmit}>Add</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </>
    );

}

export default AssetGroupForm