import {Box, Dialog, Slide} from '@mui/material';
import {forwardRef} from 'react';
const SlideUp = forwardRef((props, ref) => (
  <Slide direction='up' ref={ref} {...props} />
));

const ImageViewDialog = (props) => {
  const {open, handleClose, img} = props;

  return (
    <Dialog
      open={open}
      TransitionComponent={SlideUp}
      sx={{
        p: 0,
        '& .MuiPaper-root': {
          backgroundColor: '#ecf6fc',
        },
      }}
      onClose={() => handleClose()}
    >
      <Box
        component='img'
        src={img}
        sx={{
          height: 500,
          // width: 400,
          objectFit: 'contain',
          cursor: 'pointer',
        }}
      />
    </Dialog>
  );
};

export default ImageViewDialog;
