import {Box} from '@mui/material';

const ZoomInBox = ({children, height, ...props}) => (
  <Box
    {...props}
    sx={{
      height: {lg: 150, md: 130, sm: 170, xs: 150},
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      '& img': {
        transition: 'all 0.7s',
        width: '100%',
        objectFit: 'cover',
      },
      '&:hover img': {
        transform: 'scale(1.2)',
      },
      '&::after': {
        top: 0,
        opacity: 0.5,
        width: '100%',
        content: '""',
        height: '100%',
        position: 'absolute',
        transition: 'background-color 0.2s',
      },
    }}
  >
    {children}
  </Box>
);

export default ZoomInBox;
