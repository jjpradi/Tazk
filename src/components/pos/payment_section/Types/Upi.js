import React, {useState} from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export const Upi = () => {
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
      <div
        item
        style={{
          display: 'flex',
          paddingBottom: '10px',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <TextField
          size='small'
          style={{width: 300}}
          error={error.accountNo}
          onBlur={handleBlur}
          id='standard-basic'
          name='accountNo'
          variant='outlined'
          onChange={handleChange}
          value={data.accountNo}
          label='Enter your UPI ID'
        />
        <div>
          <Button
            style={{marginTop: 'auto', marginLeft: 20, height: 40}}
            variant='contained'
            color='warning'
          >
            Verify
          </Button>
        </div>
      </div>
    </>
  );
};
