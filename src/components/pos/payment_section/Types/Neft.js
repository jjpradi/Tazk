import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

export const Neft = () => {
  const [data, setdata] = useState({});
  const [error, seterror] = useState({});

  const handleChange = (e) => {
    const {name, value} = e.target;
    setdata((p) => ({...p, [name]: value}));
    if (!value) {
      seterror((p) => ({...p, [name]: true}));
    } else {
      seterror((p) => ({...p, [name]: false}));
    }
  };

  const handleBlur = (e) => {
    const {name, value} = e.target;
    if (!value) {
      seterror((p) => ({...p, [name]: true}));
    } else {
      seterror((p) => ({...p, [name]: false}));
    }
  };
  return (
    <>
      <Grid container spacing={2} style={{paddingBottom: '10px'}}>
        <Grid size={6}>
          <TextField
            fullWidth
            error={error.accountNo}
            onBlur={handleBlur}
            id='standard-basic'
            name='accountNo'
            variant='outlined'
            size='small'
            onChange={handleChange}
            value={data.accountNo}
            label='Enter Bank Account Number'
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            id='standard-basic'
            onBlur={handleBlur}
            error={error.accountVal}
            name='accountVal'
            variant='outlined'
            size='small'
            onChange={handleChange}
            value={data.accountVal}
            label='Re-enter Account Number'
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            error={error.ifsc}
            onBlur={handleBlur}
            id='standard-basic'
            name='ifsc'
            variant='outlined'
            size='small'
            onChange={handleChange}
            value={data.ifsc}
            label='IFSC Code'
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            error={error.custName}
            onBlur={handleBlur}
            id='standard-basic'
            name='custName'
            variant='outlined'
            size='small'
            onChange={handleChange}
            value={data.custName}
            label="Account Holder's Name"
          />
        </Grid>
      </Grid>
    </>
  );
};
