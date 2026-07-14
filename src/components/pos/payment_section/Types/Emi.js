import React, {useState} from 'react';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CardPage from './Card';

export const Emi = () => {
  const [data, setdata] = useState({});
  const [error, seterror] = useState({});
  const [hideSelect, sethideSelect] = useState(true);

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
        {hideSelect ? (
          <FormControl size='small' style={{width: 300}}>
            <InputLabel id='demo-simple-select-label'>
              Select EMI options
            </InputLabel>
            <Select
              name='emi_card'
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={data.emi_card}
              label='Select EMI options'
              onChange={handleChange}
            >
              <MenuItem value={10}>card1</MenuItem>
              <MenuItem value={20}>card2</MenuItem>
              <Button sx={{ml: 1}} onClick={() => sethideSelect(false)}>
                Add a new card
              </Button>
            </Select>
          </FormControl>
        ) : (
          <>
            <CardPage newCard={true} />
            <div style={{margin: 'auto 0 11px 20px'}}>
              <Button
                color='secondary'
                style={{height: 40}}
                variant='contained'
                onClick={() => sethideSelect(true)}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
