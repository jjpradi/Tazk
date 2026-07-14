import { AppBar, Box, Button, Card, Grid, IconButton, Tab, Tabs, TextField, Typography } from '@mui/material'
import { emailValidation, phoneValidation } from 'components/regexFunction'
import { capitalize } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { createAsstGeneralAction, updateAssetGeneralContact } from 'redux/actions/asset_actions'
import PersonIcon from '@mui/icons-material/Person';

const AssetGeneralForm = (props) => {


  const dispatch = useDispatch()

  const [formData,setFormData] = useState({
    name : null,
    email : null,
    contact : null
  })

  const [formErrors,setFormErrors] = useState({
    name : null,
    email : null,
    contact : null
  })

  const requiredFields =[
    "name",
    "email",
    "contact"
  ]
const handleChange = (name, value) => {

  // update form data
  setFormData(prev => ({ ...prev, [name]: value }));

  // prepare updated errors
  setFormErrors(prevErrors => {
    let newErrors = { ...prevErrors };

    // 1. Required field validation
    if (requiredFields.includes(name) && (!value || value === "")) {
      newErrors[name] = `${capitalize(name.replace(/_/g, " "))} is required!`;
    } 
    else if (name === "email") {
      // 2. Email validation
      if (!value) {
        newErrors[name] = "Email is required!";
      } else if (!emailValidation(value)) {
        newErrors[name] = "Invalid email format!";
      } else {
        newErrors[name] = null;
      }
    }
    else if (name === "contact") {
      // 2. Email validation
      if (!value) {
        newErrors[name] = "Contact is required!";
      } else if (!phoneValidation(value)) {
        newErrors[name] = "Invalid Contact format!";
      } else {
        newErrors[name] = null;
      }
    }
    else {
      // clear other field errors
      newErrors[name] = null;
    }

    return newErrors;
  });
};

const handleSubmit = async(e)=>{
  e.preventDefault()

  let isValid =  true

  let formErrObj = {...formErrors}

  requiredFields.forEach((key) => {
    if(formData[key] === null || formData[key] === "" || formData[key] === "null"){
      isValid = false
      formErrObj[key] = `${capitalize(key.replace(/_/g, " "))} is required!`;
    }
    else if(formErrObj[key] !== null){
      isValid = false
    }
    else{
      formErrObj[key] = null
    }
  })

  setFormErrors(formErrObj);

    if(isValid){
      const data = {
        name : formData.name,
        email : formData.email,
        contact : formData.contact,
      }

      if(props.type === 'edit'){
        await dispatch(updateAssetGeneralContact(data, props.rowData.id))
        props.handleClose()
      }else{
       const res = await dispatch(createAsstGeneralAction(data))
        if (res?.status === 200 && (res?.data?.message !== "Phone Number Already Exists" && res?.data?.message !== "Email Address Already Exists")) {
          props.handleClose()
        }
      }
      
    }

}

  useEffect(() => {
    if(props.type !== 'edit' || !props.rowData) return
    setFormData((prev) => ({
      ...prev,
      name: props.rowData.name,
      email: props.rowData.email,
      contact: props.rowData.contact
    }))
  }, [props.type])

  return (
    <div>
      <Box p={3}>



        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
                  <Typography variant='h6' align='left' style={{paddingBottom: '20px'}} fontFamily="sans-serif" fontSize="13px" fontWeight="600" color='rgba(0, 0, 0, 0.7)' >
                       { props.type === "edit" ? 'Edit Contact' : 'New Contact'}
                  </Typography>
                </Grid>

  <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
    
    <AppBar position="static">
    <Tabs
      indicatorColor="secondary"
      textColor="inherit"
      variant="fullWidth"
      aria-label="full width tabs example"
    >
      <Tab label="General" />
    </Tabs>
    </AppBar>

    </Box>
        <Card sx={{borderRadius: "0px", p: '20px', mr:"5px", ml:"5px",height: 'calc(100vh - 200px)', overflow: 'hidden'}}>
          <Tabs value={"general"} >
          <Tab
            value="general"
            label={
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <PersonIcon />
                General
              </Box>
            }
          />
        </Tabs>
          <Grid container m={2} gap={2}>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 3,
                xs: 12
              }}>
                            <TextField
                              fullWidth
                              label='Name'
                              required
                              variant='filled'
                              value={formData.name || ''}
                              onChange={(e) => handleChange('name', e.target.value)}
                              error={formErrors.name !== null}
                              helperText={formErrors.name}
                            />
                          </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 3,
                xs: 12
              }}>
                            <TextField
                              fullWidth
                              label='Email'
                              required
                              variant='filled'
                              value={formData.email || ''}
                              onChange={(e) => handleChange('email', e.target.value)}
                              error={formErrors.email !== null}
                              helperText={formErrors.email}
                            />
                          </Grid>

            <Grid
              size={{
                lg: 3,
                md: 3,
                sm: 3,
                xs: 12
              }}>
                            <TextField
                              fullWidth
                              label='Contact'
                              required
                              type='number'
                              variant='filled'
                              value={formData.contact || ''}
                              onChange={(e) => handleChange('contact', e.target.value)}
                              error={formErrors.contact !== null}
                              helperText={formErrors.contact}
                            />
                          </Grid>

              <Grid
                mr={5}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
          <Grid container justifyContent='flex-end'  spacing={2}>
            <Grid>
              <Button
                variant = 'contained'
                color = 'error'
                onClick = {() => props.handleClose()}
              >
                Cancel
              </Button>
            </Grid>

            <Grid>
              <Button
                variant = 'contained'
                color = 'primary'
                onClick = {handleSubmit}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </Grid>

          </Grid>
          </Card>
      </Box>
    </div>
  );
}

export default AssetGeneralForm