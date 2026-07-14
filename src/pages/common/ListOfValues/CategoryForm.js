import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { Button, Container, Grid, TextField, Typography } from "@mui/material"
import { addCategoryAction } from 'redux/actions/shifts.actions';
import { OpenalertActions } from 'redux/actions/alert_actions';
import { requiredFieldsAlertMessage } from 'utils/content';

const CategoryForm = (props) => {
    const dispatch = useDispatch()

    const { ShiftsReducer: { employeeCategoryList} } = useSelector((state) => state);

    const[values, setValues] = useState({
        Category: null
    })

    const[errors, setErrors] = useState({
        Category: null
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
        let required = ['Category']
   
        await Object.keys(values).forEach((key) => {
            if(required.includes(key) && values[key] === null || values[key] === 'null' || values[key] === ''){
                isValid = false
                errorObj[key] = `${key} is Required!`
            }
        })
        
        const categoryExists = employeeCategoryList.some(
            (category) =>
                category.category_name &&
                category.category_name.toLowerCase() === values.Category?.toLowerCase()
        );
    
        if (categoryExists) {
            isValid = false;
            errorObj.Category = `Category "${values.Category}" already exists!`;
        }
    
        setErrors(errorObj)

        if(isValid){
            await dispatch(addCategoryAction(values))
            props.handleClose()
        }
        else{
            dispatch(OpenalertActions({ msg: requiredFieldsAlertMessage, severity: 'warning' }))
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
                      <Typography variant="h6" align='left'>Add Category</Typography>
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
                          label='Category'
                          variant="filled"
                          value={values.Category}
                          onChange={(e) => handleChange(e.target.value, 'Category')}
                          error={!!errors.Category}
                          helperText={errors.Category || ''}
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

export default CategoryForm