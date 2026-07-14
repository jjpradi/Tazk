import { Autocomplete, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { getsessionStorage } from 'pages/common/login/cookies';
import React, { useEffect, useState } from 'react';

function AdvanceReq(props) {
    const storage = getsessionStorage()
    let rolename = storage?.role_name || '';
    let emp_id = storage?.employee_id || '';
    let approvedPerson = storage?.first_name;
    useEffect(() => {
        props.setRequiredFieldReqHandler([
            'Reason',
            'Required_Amount',
            'tenure',
            'Repayment_method','deduction']),
            props.handleValidation({
                emp_name: approvedPerson,
                emp_id: emp_id,
                Reason: null,
                Required_Amount: null,
                Repayment_method: null,
                tenure: null,
                status: null,
                date: null,
                email: null,
                Phone_number: null,
                outStanding: null,
                deduction:null,
                shiftId: null
            },{
                emp_name: null,
                emp_id: null,
                Reason: null,
                Required_Amount: null,
                Repayment_method: null,
                tenure: null,
                status: null,
                date: null,
                email:null,
                Phone_number:null,
                deduction:null,
                shiftId: null
              })
    }, [])

console.log("v222",props.formValues)
    return (
      <div>
        <Grid container spacing={2}>
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <TextField
              required
              name='Reason'
              fullWidth
              // id="advancereq-textarea-60"
              label='Reason'
              variant='filled'
              //multiline
              //rows={2}
              placeholder='Reason'
              onChange={props.handleChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
              }}
              has
              context
              menu
              error={props.formErrors['Reason'] !== null ? true : false}
              helperText={
                props.formErrors['Reason'] !== null ? 'Reason is required' : ''
              }
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
              type='number'
              required
              variant='filled'
              name='Required_Amount'
              value={props.formValues?.Required_Amount || ''}
              fullWidth
              label='Request Amount'
              placeholder='Amount'
              onChange={(e) => {
                const {name, value} = e.target;
                if (value === '') {
                  props.handleChange(e);

                  props.setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'Amount is required',
                  }));
                  return;
                }
                const numericValue = parseFloat(value);

                // Validate the amount
                if (numericValue <= 0 || isNaN(numericValue)) {
                  props.setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: 'Amount must be greater than zero',
                  }));
                } else {
                  props.setFormErrors((prevErrors) => ({
                    ...prevErrors,
                    [name]: null,
                  }));
                  props.handleChange(e);
                }
              }}
              error={props.formErrors['Required_Amount'] !== null ? true : false}
              helperText={
                props.formErrors['Required_Amount'] !== null ? 'Amount is required' : ''
              }
              InputProps={{inputProps: {min: 1}}}
            />
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} spacing={5}>
                    <Button variant="outlined" color="primary" onClick={()=>props.handleAmount(500 + parseInt(props.formValues?.Required_Amount || 0))}>
                        +500
                    </Button>
                    <Button variant="outlined" color="primary" onClick={()=>props.handleAmount(1000 + parseInt(props.formValues?.Required_Amount || 0))}>
                        +1000
                    </Button>
                    <Button variant="outlined" color="primary" onClick={()=>props.handleAmount(2000 + parseInt(props.formValues?.Required_Amount || 0))}>
                        +2000
                    </Button>
                    <Button variant="outlined" color="primary" onClick={()=>props.handleAmount(5000 + parseInt(props.formValues?.Required_Amount || 0))}>
                        +5000
                    </Button>
                </Grid> */}
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            {/* <FormControl
                required
                fullWidth
                error={
                  props.formErrors['tenure'] !== null && !props.formValues.tenure
                }
                variant="filled"
              > */}
              {/* <InputLabel id="tenure-label">Tenure</InputLabel> */}
              <Autocomplete
                options={props.tenureMonths.map((i) => i.tenure_month.toString())}
                value={props.formValues.tenure || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    name="tenure"
                    label="Tenure"
                    type={props.isNumberInput ? "number" : "text"}
                    variant="filled"
                    error={
                      props.formErrors['tenure'] !== null &&
                      !props.formValues.tenure
                    }
                    helperText={
                      props.formErrors['tenure'] !== null
                        ? 'Tenure is required'
                        : ''
                    }
                  />
                )}
                onChange={(event, newValue) => {
                  props.handleChange({
                    target: { name: 'tenure', value: newValue || '' },
                  });
                }}
                onInputChange={(event, newInputValue) => {
                  if (newInputValue === '') {
                    props.handleChange({
                      target: { name: 'tenure', value: '' },
                    });
                  } 
                  else {
                    props.handleChange({
                      target: { name: 'tenure', value: newInputValue },
                    });
                  }
                }}
              />
              {/* {props.formErrors['tenure'] !== null &&
                !props.formValues.tenure && (
                  <FormHelperText>Tenure is required</FormHelperText>
                )} */}
                {/* </FormControl> */}
          </Grid>


          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <FormControl
              required
              fullWidth
              error={
                props.formErrors['deduction'] !== null &&
                props.formValues.deduction === null
                  ? true
                  : false
              }
              variant='filled'
            >
              <InputLabel id='demo-simple-select-label'>Deduction</InputLabel>
              <Select
                name='Deduction'
                labelId='demo-simple-select-label'
                id='demo-simple-select'
                label='Deduction'
                onChange={(event) => {
                  const value = event.target.value;
                  props.handleChange({
                    target: {name: 'deduction', value},
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    fullWidth={true}
                    {...params}
                    error={
                      props.formErrors['deduction'] !== null
                        ? true
                        : props.formValues.deduction !== null
                        ? true
                        : false
                    }
                    helperText={
                      props.formErrors['deduction'] !== null
                        ? 'Deduction is required'
                        : ''
                    }
                  />
                )}
              >
                <MenuItem value='CURRENT_MONTH_ONWARDS'>
                  Current Month Onwards
                </MenuItem>
                <MenuItem value='NEXT_MONTH_ONWARDS'>
                  Next Month Onwards
                </MenuItem>
              </Select>
              {props.formErrors['deduction'] &&
                props.formValues.deduction === null && (
                  <FormHelperText>Deduction is required</FormHelperText>
                )}
            </FormControl>
          </Grid>
          <Grid container padding='5px'>
            <Grid
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Typography>
                <h3> Payment Mode </h3>
              </Typography>
            </Grid>
            <Grid
              container
              size={{
                lg: 12,
                md: 12,
                sm: 12,
                xs: 12
              }}>
              <Grid size={{
                lg: 6
              }}>
                <input
                  type='checkBox'
                  value='AUTO_DEDUCTION_FROM_SALARY'
                  name='Repayment_method'
                  required
                  checked={
                    props.formValues['Repayment_method'] ===
                      'AUTO_DEDUCTION_FROM_SALARY' &&
                    props.formValues['Repayment_method'] !== 'MANUAL_REPAYMENT'
                  }
                  onClick={props.handleChange}
                />
                Auto Debit From Salary
              </Grid>
              <Grid size={{
                lg: 6
              }}>
                <input
                  type='checkBox'
                  value='MANUAL_REPAYMENT'
                  name='Repayment_method'
                  required
                  checked={
                    props.formValues['Repayment_method'] ===
                      'MANUAL_REPAYMENT' &&
                    props.formValues['Repayment_method'] !==
                      'AUTO_DEDUCTION_FROM_SALARY'
                  }
                  onClick={props.handleChange}
                />{' '}
                Manual Payment By Cash
              </Grid>
              {props.formErrors['Repayment_method'] !== null && (
                <Typography style={{color: 'red'}}>
                  * please select Repayment Method
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
}

export default AdvanceReq