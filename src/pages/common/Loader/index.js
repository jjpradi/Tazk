import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

function SimpleBackdrop(props) {
  // const {loader , setLoader}=props
  return (
    <div>
      <Backdrop
        sx={{color: '#fff', zIndex: 9999999}}
        open={props.loader}
        // onClick={handleClose}
      >
        <CircularProgress color='primary' />
      </Backdrop>
    </div>
  );
}
export default SimpleBackdrop;
