import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const rootSx = {
  padding: (theme) => theme.spacing(0.5, 0.5, 0),
  justifyContent: 'space-between',
  display: 'flex',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const textFieldSx = {
  margin: (theme) => theme.spacing(1, 0.5, 1.5),
  '& .MuiSvgIcon-root': {
    marginRight: (theme) => theme.spacing(0.5),
  },
  '& .MuiInput-underline:before': {
    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
  },
};

export default function QuickSearchToolbar(props) {
  return (
    <div style={{ padding: '4px 4px 0', justifyContent: 'space-between', display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div>
        <Button
          onClick={(e) => {
            props.setnewCust();
          }}
          startIcon={<PersonAddAlt1Icon/>}
        >
          add customer
        </Button>
      </div>
      <TextField
        variant='standard'
        value={props.value}
        onChange={props.onChange}
        placeholder='Search…'
        sx={textFieldSx}
        InputProps={{
          startAdornment: <SearchIcon fontSize='small' />,
          endAdornment: (
            <IconButton
              title='Clear'
              aria-label='Clear'
              size='small'
              style={{visibility: props.value ? 'visible' : 'hidden'}}
              onClick={props.clearSearch}
            >
              <ClearIcon fontSize='small' />
            </IconButton>
          ),
        }}
      />
    </div>
  );
}
