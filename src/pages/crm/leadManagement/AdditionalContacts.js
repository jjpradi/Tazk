import { Card, Grid, TextField, Typography, Container, Autocomplete, Button } from '@mui/material';
import React, { useState } from 'react';
import { maxBodyHeight } from 'utils/pageSize';
import { capitalize } from 'lodash';
import { emailValidation, phoneValidation } from 'components/regexFunction'

const AdditionalContacts = (props) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    designation: '',
    email: '',
    phoneNumber: '',
  });

  const [formErrors, setFormErrors] = useState({
    firstName: null,
    lastName: null,
    gender: null,
    designation: null,
    email: null,
    phoneNumber: null,
  });

  const genderOptions = ['Male', 'Female', 'Others'];

  const requiredFields = [
    'firstName',
    'gender',
    // 'email',
    'phoneNumber',
  ];

  const validateForm = (name, value) => {
    if (requiredFields.includes(name) && !value) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: `${capitalize(name)} is required`,
      }));
    } else {
      let errorMessage = null;
  
      switch (name) {
        case 'phoneNumber':
          if (!phoneValidation(value)) {
            errorMessage = `${capitalize(name)} is invalid`;
          }
          break;
  
        case 'email':
          if (!emailValidation(value)) {
            errorMessage = `${capitalize(name)} is invalid`;
          }
          break;
  
        default:
          errorMessage = null;
          break;
      }
  
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMessage,
      }));
    }
  };

  const setStateHandler = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || '',
    }));
    validateForm(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        isValid = false;
        formErrorsObj[field] = capitalize(field) + ' is required';
      } else {
        formErrorsObj[field] = null;
      }
    });

    setFormErrors(formErrorsObj);

    if (isValid) {
      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender === 'Male' ? 1 : formData.gender === 'Female' ? 2 : 0,
        designation: formData.designation,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      props?.addContactData(data);
      props?.handleClose();
    }
  };

  return (
    <Container>
      <Card>
        <Container sx={{ p: 3 }}>
          <Typography sx={{ pb: 4 }}>Additional Contacts</Typography>

          <Grid container spacing={5}>
            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                value={formData.firstName}
                required
                label="First Name"
                name="firstName"
                variant="filled"
                onChange={(e) => setStateHandler('firstName', e.target.value)}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                value={formData.lastName}
                label="Last Name"
                name="lastName"
                variant="filled"
                onChange={(e) => setStateHandler('lastName', e.target.value)}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <Autocomplete
                disablePortal
                options={genderOptions}
                value={formData.gender}
                onChange={(event, newValue) => setStateHandler('gender', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Gender"
                    required
                    variant="filled"
                    error={!!formErrors.gender}
                    helperText={formErrors.gender}
                  />
                )}
              />
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                value={formData.designation}
                label="Designation"
                name="designation"
                variant="filled"
                onChange={(e) => setStateHandler('designation', e.target.value)}
                error={!!formErrors.designation}
                helperText={formErrors.designation}
              />
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                value={formData.email}
                // required
                label="Email"
                name="email"
                variant="filled"
                onChange={(e) => setStateHandler('email', e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>

            <Grid
              size={{
                lg: 4,
                md: 4,
                sm: 6,
                xs: 12
              }}>
              <TextField
                fullWidth
                value={formData.phoneNumber}
                required
                label="Phone Number"
                name="phoneNumber"
                variant="filled"
                onChange={(e) => setStateHandler('phoneNumber', e.target.value)}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
              />
            </Grid>

            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid container justifyContent="flex-end" spacing={2}>
                <Grid>
                  <Button variant="contained" color="error" onClick={props.handleClose}>
                    Cancel
                  </Button>
                </Grid>

                <Grid>
                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Card>
    </Container>
  );
};

export default AdditionalContacts;
