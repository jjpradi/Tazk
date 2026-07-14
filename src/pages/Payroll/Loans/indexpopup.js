import React, { useContext, useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid';
import { Autocomplete, Button, Card, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loanSequenceAction, payrollPaymentModeActions, updateLoanDetailsAction, updateLoanSequenceAction } from 'redux/actions/loan_actions';
import { Box } from '@mui/system';
import { emailValidation, phoneValidation } from 'components/regexFunction';
import CreateNewButtonContext from 'context/CreateNewButtonContext';

const LoanPopup = (props) => {
  const dispatch = useDispatch()
  const { LoanReducer:{loanSequence} } = useSelector((state) => state);
  
  const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
} = useContext(CreateNewButtonContext);
  const [regex] = useState({});
  const [formValues, setFormValues] = useState({
    emp_name: null,
    emp_id: null,
    Reason: null,
    Required_Amount: null,
    Repayment_method: null,
    tenure: null,
    status: null,
    date: null,
    email:null,
    Phone_number:null
  })

  const [formErrors, setFormErrors] = useState({
    emp_name: null,
    emp_id: null,
    Reason: null,
    Required_Amount: null,
    Repayment_method: null,
    tenure: null,
    status: null,
    date: null,
    email:null,
    Phone_number:null
  });

  const [requiredFields] = useState([

    'emp_name',
    'emp_id',
    'Reason',
    'Required_Amount',
    'Repayment_method',
    'tenure',
    'Phone_number',
    'email'

  ]);

  const [validRegex ] = useState([
    'Phone_number',
    'email'
  ]);

  const options = [
    { value: "AUTO_DEDUCTION_FROM_SALARY", label: "Auto Deduction From Salary" },
    { value: "MANUAL_REPAYMENT", label: "Manual Repayment" }
  ];

  useEffect(() => {
    dispatch(loanSequenceAction(setModalTypeHandler, setLoaderStatusHandler))
  }, [])

  const validationHandler = (name, value) => {
    let formObj = {...formErrors};
    if (!Object.keys(formErrors).includes(name)) return;
    if (
      requiredFields.includes(name) &&
      (value === null ||
        value === 'null' ||
        value === '' ||
        value === false ||
        (Object.keys(value) && value.value === null))
    ) {
      setFormErrors({
        ...formErrors,
        [name]: capitalize(name) + ' is Required!',
      });
    } else if (regex[name]) {
      if (!regex[name].test(value)) {
        setFormErrors({
          ...formErrors,
          [name]: capitalize(name) + ' is Invalid!',
        });
      }
    } else {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
    if(validRegex.includes(name)){
      if(name === 'Phone_number'){
        if(!phoneValidation(value)){
          setFormErrors({
            ...formObj,
            [name]: ' is invalid!',
          });
        
        }
      }
    }
    if(validRegex.includes(name)){
      if(name === 'email'){
        if(!emailValidation(value)){
          setFormErrors({
            ...formObj,
            [name]: ' is invalid!',
          });
          
        }
      }
    }
   
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const setStateHandler = async (name, value) => {
    let formObj = {};
    formObj = {
      ...formValues,
      [name]: value === '' ? null : value,
    };
    await setFormValues(formObj);
    validationHandler(name, value);
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    setStateHandler(name, value);
};

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    let isValid = true;
    let formErrorsObj = { ...formErrors };
    await Object.keys(formValues).map((key, s) => {
      if (
        requiredFields.includes(key) &&
        (formValues[key] === null || formValues[key] === '' )
      ) {
        isValid = false;
        formErrorsObj[key] = capitalize(key) + ' is Required!';
      } else if (regex[key]) {
        if (!regex[key].test(formValues[key])) {
          isValid = false;
          formErrorsObj[key] = capitalize(key) + ' is Invalid!';
        }
      }
      if(validRegex.includes(key)){
        if(key === 'Phone_number'){
          if(!phoneValidation(formValues[key])){
            isValid = false;
            setFormErrors({
              ...formErrorsObj,
              [key]: ' is invalid!',
            });
          
          }
        }
      }
      if(validRegex.includes(key)){
        if(key === 'email'){
          if(!emailValidation(formValues[key])){
            isValid = false;
            setFormErrors({
              ...formErrorsObj,
              [key]: ' is invalid!',
            });
            
          }
        }
      }

      return null;
    });
    await setFormErrors(formErrorsObj);
    if (isValid) {
      const data = formValues;
      data.request_type=5
      data.loan_number = loanNumber
      const updateData =  loanSequence[0]?.current_seq +1
      updateData.seen=0
      dispatch(updateLoanDetailsAction(data))
        .then(
          dispatch(updateLoanSequenceAction(updateData))
        );
      props.Onclose()
    }
  };
  const loanNumber = `EL/${headerLocationId}/${loanSequence[0]?.current_seq +1}`
  return (
    <Card >
      <Typography variant='h6' style={{ padding: '10px 0px 5px 15px' }}>Loan Request - <span>{loanNumber}</span></Typography>
      <Grid container spacing={5} padding='15px 15px 10px 15px'>
        
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            required
            fullWidth={true}
            placeholder='Employee Id'
            label='Employee Id'
            name='emp_id'
            regex=''
            variant='outlined'
            value={formValues.emp_id === null ? '' : formValues.emp_id}
            error={formErrors.emp_id === null ? false : true}
            helperText={formErrors.emp_id === null ? '' : 'emp_id is Required!'}
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
            onChange={handleChange}
            fullWidth={true}
            required
            placeholder='Employee Name'
            label='Employee Name'
            name='emp_name'
            regex=''
            variant='outlined'
            value={formValues.emp_name === null ? '' : formValues.emp_name}
            error={formErrors.emp_name === null ? false : true}
            helperText={formErrors.emp_name === null ? '' : 'emp_name is Required!'}
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
            onChange={handleChange}
            //  onBlur={handleChange}
            required
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='Phone Number'
            label='Phone Number'
            name='Phone_number'
            type='number'
            regex=''
            variant='outlined'
            value={formValues.Phone_number === null ? '' : formValues.Phone_number}
            error={formErrors.Phone_number === null ? false : true}
            helperText={formErrors.Phone_number === null ? '' : formErrors.Phone_number}
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
            onChange={handleChange}
            required
            fullWidth={true}
            placeholder='Email'
            label='Email'
            name='email'
            regex=''
            variant='outlined'
            value={formValues.email === null ? '' : formValues.email}
            error={formErrors.email === null ? false : true}
            helperText={formErrors.email === null ? '' : formErrors.email}
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
            onChange={handleChange}
            required
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='Required Amount'
            label='Required Amount'
            name='Required_Amount'
            type='number'
            regex=''
            variant='outlined'
            value={formValues.Required_Amount === null ? '' : formValues.Required_Amount}
            error={formErrors.Required_Amount === null ? false : true}
            helperText={formErrors.Required_Amount === null ? '' : 'Required_Amount is Required!'}
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
          options={options}
          freeSolo
         onChange={(e, val) =>
         { 
            val !== null
              ? setFormValues({
                  ...formValues,
                  Repayment_method: val.value,
                })
              : ''
          }}
          value = {formValues.Repayment_method === null ? '' : formValues.Repayment_method}
          renderInput={(params) => ( 
          <TextField
            {...params}
            onChange={handleChange}
            required
            fullWidth={true}
            placeholder='Repayment Method'
            label='Repayment Method'
            name='Repayment_method'
            regex=''
            variant='outlined'
            error={formErrors.Repayment_method === null ? false : formValues.Repayment_method !== null ? '' : true}
            helperText={formErrors.Repayment_method === null ? '' : formValues.Repayment_method !== null ? '' : 'Repayment_method is Required!'}
          />
          )}
          />
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
          <TextField
            onChange={handleChange}
            required
            fullWidth={true}
            placeholder='Tenure in months'
            label='Tenure'
            name='tenure'
            regex=''
            type='number'
            variant='outlined'
            value={formValues.tenure === null ? '' : formValues.tenure}
            // error={formValues.tenure <= 60 || null ? false : true}
            error={formValues.tenure === null ? false : true}
            // helperText={formValues.tenure > 60 ? 'tenure limit exceeded' : ''}
            helperText={formValues.tenure === null ? '' : 'Tenure is Required'}
          />
        </Grid> */}
        <Grid
          size={{
            lg: 4,
            md: 4,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            required
            fullWidth={true}
            onWheel={ (e) => e.target.blur()}
            placeholder='Tenure in months'
            label='Tenure'
            name='tenure'
            type='number'
            regex=''
            variant='outlined'
            value={formValues.tenure === null ? '' : formValues.tenure}

            error={formErrors.tenure === null ? formValues.tenure <= 60 ? false : true : true}

            helperText={formErrors.tenure === null ? formValues.tenure > 60 ? 'tenure limit exceeded' : '' :  'tenure is Required!'}
          />
        </Grid>
        <Grid
          size={{
            lg: 8,
            md: 8,
            sm: 6,
            xs: 12
          }}>
          <TextField
            onChange={handleChange}
            required
            fullWidth={true}
            multiline={true}
            placeholder='Reason'
            label='Reason'
            name='Reason'
            regex=''
            minRows={1}
            variant='outlined'
            value={formValues.Reason === null ? '' : formValues.Reason}
            error={formErrors.Reason === null ? false : true}
            helperText={formErrors.Reason === null ? '' : 'Reason is Required!'}
          />
        </Grid>
      </Grid>
      {formValues.tenure > 0 && <Grid container padding='15px 15px 10px 15px' display='flex' justifyContent='center'>
         <Grid
           size={{
             lg: 8,
             md: 8,
             sm: 10,
             xs: 12
           }}>
         <Box  sx={{ border: '1px dashed gray' }} padding={2}>
         <Typography variant='h9' display='flex' >
         Note
       </Typography>
        <Typography  display='flex' justifyContent='center' alignItems='center' color='text.secondary'>
         *Use full names (as they appear in identity proofs such as PAN/voter I-cards) and mention the date and place clearly.
          </Typography>
         </Box>
         </Grid>
         </Grid>}
      <Grid container gap={5} style={{ display: 'flex', justifyContent: 'flex-end' }} padding='10px 15px 10px 10px'>
        <Grid>
          <Button variant='contained' color='secondary' onClick={props.Onclose}>Close</Button>
        </Grid>
        <Grid>
          <Button variant='contained' color='primary' onClick={handleSubmit}>Submit</Button>
        </Grid>
      </Grid>
    </Card>
  );
}

export default LoanPopup