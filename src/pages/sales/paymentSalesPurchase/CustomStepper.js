// CustomStepperStyles.js
import { styled } from '@mui/system';
import { Stepper } from '@mui/material';

const CustomStepper = styled(Stepper)(({ theme }) => ({
  width: '100%',
  background: '#f4f4f4',
  borderRadius: '8px',
  padding: theme.spacing(2),
  '& .MuiStep-root': {
    flex: 1,
    position: 'relative',
    '&:not(:last-child)::after': {
      content: '""',
      position: 'absolute',
      top: '12px',
      right: '-50%',
      width: '100%',
      height: '4px',
      backgroundColor: '#ccc',
      zIndex: 1,
    },
    '&.Mui-completed:not(:last-child)::after': {
      backgroundColor: 'green',
    },
    '&.Mui-active:not(:last-child)::after': {
      backgroundColor: '#1a73e8',
    },
  },
  '& .MuiStepLabel-label': {
    fontWeight: 500,
    textAlign: 'center',
  },
  '& .MuiStepIcon-root': {
    zIndex: 2,
  },
}));

export default CustomStepper;
