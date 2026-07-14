import React, { useState } from 'react';
import { useDispatch } from "react-redux"
import { Button, Container, Grid, TextField, Typography } from "@mui/material"
import { addClaimsCategoryAction } from 'redux/actions/loan_actions';

const ClaimsForm = (props) => {
    const dispatch = useDispatch()

    const[values, setValues] = useState({
        claimsCategory: null
    })

    const[errors, setErrors] = useState({
        claimsCategory: null
    })

    const handleChange = (val, name) => {
        if(val !== null && val !== ''){
            setValues({...values, [name]: val})
            setErrors({...errors, [name]: null})
        }
        else{
            setValues({...values, [name]: null})
            setErrors({...errors, [name]: 'claimsCategory is Required'})            
        }
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()

        let isValid = true
        let errorObj = {...errors}
        let required = ['claimsCategory']

        await Object.keys(values).map((key, i) => {
            if(required.includes(key) && values[key] === null || values[key] === 'null' || values[key] === ''){
                isValid = false
                errorObj[key] = `${key} is Required!`
            }
            return null
        })
        setErrors(errorObj)

        if(isValid){
            await dispatch(addClaimsCategoryAction(values))
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
                      <Typography variant="h6" align='left'>Add ClaimsCategory</Typography>
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
                          label='claimsCategory'
                          variant="filled"
                          value={values.claimsCategory}
                          onChange={(e) => handleChange(e.target.value, 'claimsCategory')}
                          error={errors.claimsCategory === null ? false : true}
                          helperText={errors.claimsCategory === null ? '' : 'claimsCategory is Required'}
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

export default ClaimsForm