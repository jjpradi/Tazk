import React, {useState} from 'react';
import TextField from '@mui/material/TextField';

export const Remarks = () => {
  const [data, setdata] = useState({});

  const handleChange = (e) => {
    const {name, value} = e.target;
    setdata((p) => ({...p, [name]: value}));
  };

  return (
    <>
      <TextField
        // sx={{marginTop: '30px'}}
        fullWidth
        id='standard-basic'
        name='accountNo'
        variant='outlined'
        size='small'
        onChange={handleChange}
        value={data.accountNo}
        label='Remarks'
        multiline
      />
    </>
  );
};
