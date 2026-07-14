import * as React from 'react';
import {styled} from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const CssTextField = styled(TextField)(({theme}) => ({
  '& label.Mui-focused': {
    color: theme.palette.primary.main,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: theme.palette.common.searchField,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.common.searchField,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

export default CssTextField;
