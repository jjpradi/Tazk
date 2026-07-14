import React, { useEffect, useState, useContext } from 'react';
import {
  Modal,
  Card,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Grid,
  Badge,
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import context from '../../../context/CreateNewButtonContext';
import { useDispatch } from 'react-redux';
import { accountNoValidation, bankAccountValidation, ifscValidation } from 'components/regexFunction';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  bgcolor: 'background.paper',
  boxShadow: 25,
  p: 4,
  borderRadius: 5,
};

function BankDetailPopup(props) {
  const dispatch = useDispatch();
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context);
  const { bankValues, setBankValues, status, handleEdit, setStatus } = props;

  const [formValue, setFormValue] = useState({});
  const [errors, setErrors] = useState({

  });

  useEffect(() => {
    setFormValue(props.filtedValue);
  }, [props.filtedValue]);

  const handleChange = (event) => {
    const { value, name } = event.target;
      if (name === 'acc_number') {
          const bankAccValidation = accountNoValidation(value)

          if(!bankAccValidation){
             setErrors((prevErrors) => ({
              ...prevErrors,
              acc_number: 'Enter the valid Acc No',
            }));
          }
          else{
             setErrors((prevErrors) => ({
              ...prevErrors,
              acc_number: null,
            }));
          }
        }
        if (name === 'ifsc_code') {
          const ifscNoValidation = ifscValidation(value)

          if(!ifscNoValidation){
             setErrors((prevErrors) => ({
              ...prevErrors,
              ifsc_code: 'Enter the valid IFSC Code No',
            }));
          }
          else{
             setErrors((prevErrors) => ({
              ...prevErrors,
              ifsc_code: null,
            }));
          }
        }
    setBankValues({ ...bankValues, [name]: value });
    //   if (errors[name]) {
    //   setErrors({ ...errors, [name]: '' });
    // }
  };

  const radioChange = (e) => {
    const { value } = e.target;
    setBankValues({ ...bankValues, IsPrimary: value === 'true' ? 'primary' : '' });
  };

  const validateFields = () => {
    const newErrors = {};
    const bankAccValidation = accountNoValidation(bankValues.acc_number)
    const ifscCodeValidation = ifscValidation(bankValues.ifsc_code)
    if(!bankAccValidation)  newErrors.acc_number = 'Enter the valid Acc No';
    if(!ifscCodeValidation)  newErrors.ifsc_code = 'Enter the valid IFSC Code No';
    if (!bankValues.acc_number) newErrors.acc_number = 'Account Number is Required!';
    if (!bankValues.bank_name) newErrors.bank_name = 'Bank Name is Required!';
    if (!bankValues.branch) newErrors.branch = 'Branch is Required!';
    if (!bankValues.ifsc_code) newErrors.ifsc_code = 'IFSC Code is Required!';
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      status === 'create' ? props.ApplyButton(bankValues) : handleEdit(bankValues);
    }
  };

  return (
    <>
      <Badge color='secondary' badgeContent={props.count}>
        <AddCircleOutlineIcon onClick={() => { props.handleClose(true); setStatus('create'); }} />
      </Badge>
      <Modal
        open={props.open}
        onClose={() => props.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Card sx={style} style={{ overflow: 'auto', maxHeight: "38pc", minWidth: '50%' }}>
          <div >
            <IconButton aria-label="close" onClick={() => props.handleClose(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <Grid container spacing={1.5} direction={'row'}>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                fullWidth
                placeholder='Account Number'
                label='Account Number'
                name='acc_number'
                required = {true}
                value={bankValues.acc_number || ''}
                color='primary'
                variant='filled'
                error={!!errors.acc_number}
                helperText={errors.acc_number}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                fullWidth
                placeholder='Bank Name'
                label='Bank Name'
                name='bank_name'
                required = {true}
                value={bankValues.bank_name || ''}
                color='primary'
                variant='filled'
                error={!!errors.bank_name}
                helperText={errors.bank_name}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                fullWidth
                placeholder='Branch'
                label='Branch'
                name='branch'
                required = {true}
                value={bankValues.branch || ''}
                color='primary'
                variant='filled'
                error={!!errors.branch}
                helperText={errors.branch}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <TextField
                onChange={handleChange}
                fullWidth
                placeholder='IFSC'
                label='IFSC'
                name='ifsc_code'
                required = {true}
                value={bankValues.ifsc_code || ''}
                color='primary'
                variant='filled'
                error={!!errors.ifsc_code}
                helperText={errors.ifsc_code}
              />
            </Grid>
            <Grid
              size={{
                lg: 4,
                md: 6,
                sm: 6,
                xs: 6
              }}>
              <FormControl>
                <FormLabel id='demo-radio-buttons-group-label'>Primary</FormLabel>
                <RadioGroup
                  row
                  aria-label='customer'
                  value={bankValues.IsPrimary === 'primary' ? 'true' : 'false'}
                  name='IsPrimary'
                  onChange={radioChange}
                >
                  <FormControlLabel
                    value='true'
                    label='Yes'
                    control={<Radio />}
                  />
                  <FormControlLabel
                    value='false'
                    label='No'
                    control={<Radio />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={7} display='flex' justifyContent='center' alignItems='center' p='20px 0px 5px 0px'>
            <Grid>
              <Button onClick={handleSubmit} variant='contained'>
                Submit
              </Button>
            </Grid>
          </Grid>

        </Card>
      </Modal>
    </>
  );
}

export default BankDetailPopup;
