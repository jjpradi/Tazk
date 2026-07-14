import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { Button, Container, Grid, TextField, Typography } from "@mui/material"
import { addDepartmentAction } from 'redux/actions/shifts.actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

const DepartmentForm = (props) => {
    const dispatch = useDispatch()

    const[values, setValues] = useState({
        Department: null
    })

    const[errors, setErrors] = useState({
        Department: null
    })

    const handleChange = (val, name) => {
        if(val !== null && val !== ''){
            setValues({...values, [name]: val})
            setErrors({...errors, [name]: null})
        }
        else{
            setValues({...values, [name]: null})
            setErrors({...errors, [name]: 'Department is Required'})            
        }
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()

        let isValid = true
        let errorObj = {...errors}
        let required = ['Department']


        await Object.keys(values).map((key, i) => {
            if(required.includes(key) && values[key] === null || values[key] === 'null' || values[key] === ''){
                isValid = false
                errorObj[key] = `${key} is Required!`
            }
            return null
        })
        setErrors(errorObj)

        if(isValid){
            await dispatch(addDepartmentAction(values))
            props.handleClose()
            return
        }
        dispatch(OpenalertActions({ msg : requiredFieldsAlertMessage, severity : 'warning' }))
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
                      <Typography variant="h6" align='left'>Add Department</Typography>
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
                          label='Department'
                          variant="filled"
                          value={values.Department}
                          onChange={(e) => handleChange(e.target.value, 'Department')}
                          error={errors.Department === null ? false : true}
                          helperText={errors.Department === null ? '' : 'Department is Required'}
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
                              <Button variant='contained'onClick={() => props.handleClose()}>Cancel</Button>
                          </Grid>

                          <Grid>
                              <Button variant='contained'onClick={handleSubmit}>Add</Button>
                          </Grid>
                      </Grid>
                  </Grid>
              </Grid>
          </Container>
      </>
  );
}

export default DepartmentForm