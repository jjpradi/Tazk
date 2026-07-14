import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { Button, Container, Grid, TextField, Typography } from "@mui/material"
import { addDesignationAction } from 'redux/actions/userCreation_actions';

const DesignationForm = (props) => {
    const dispatch = useDispatch()

    const[values, setValues] = useState({
        Designation: null
    })

    const[errors, setErrors] = useState({
        Designation: null
    })

    const handleChange = (val, name) => {
        if(val !== null && val !== ''){
            setValues({...values, [name]: val})
            setErrors({...errors, [name]: null})
        }
        else{
            setValues({...values, [name]: null})
            setErrors({...errors, [name]: 'Designation is Required'})            
        }
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()

        let isValid = true
        let errorObj = {...errors}
        let required = ['Designation']

        await Object.keys(values).map((key, i) => {
            if(required.includes(key) && values[key] === null || values[key] === 'null' || values[key] === ''){
                isValid = false
                errorObj[key] = `${key} is Required!`
            }
            return null
        })
        setErrors(errorObj)

        if(isValid){
            await dispatch(addDesignationAction(values))
            props.handleClose()
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
                      <Typography variant="h6" align='left'>Add Designation</Typography>
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
                          label='Designation'
                          variant="filled"
                          value={values.Designation}
                          onChange={(e) => handleChange(e.target.value, 'Designation')}
                          error={errors.Designation === null ? false : true}
                          helperText={errors.Designation === null ? '' : 'Designation is Required'}
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

export default DesignationForm