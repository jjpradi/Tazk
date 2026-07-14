import {createTheme} from '@mui/material/styles';

export const formLabelsTheme = createTheme({
  MuiFormLabel: {
    styleOverrides: {
      asterisk: {
        color: '#db3131',
        '&$error': {
          color: '#db3131',
        },
      },
    },
  },
});
