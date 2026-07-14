import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const rootSx = (theme) => ({
  padding: theme.spacing(0.5, 0.5, 0),
  justifyContent: 'space-between',
  display: 'flex',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
});

const textFieldSx = (theme) => ({
  [theme.breakpoints.down('xs')]: {
    width: '100%',
  },
  margin: theme.spacing(1, 0.5, 1.5),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(0.5),
  },
  '& .MuiInput-underline:before': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
});

export default function QuickSearchToolbar(props) {
  return (
    <Box sx={rootSx}>
      <div>
        <Button
          onClick={(e) => {
            props.setnewCust();
          }}
        >
          <PersonAddAlt1Icon style={{marginRight: 10}} />
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
    </Box>
  );
}
