import * as React from 'react';
import {Grid, Button, Typography, Divider} from '@mui/material';

export default function BarcodeDialog(props) {
  // const [open, setOpen] = React.useState(true);
  const {
    selectData: {inActiveBarcode, soldBarcode},
    setModalStatusHandler,
  } = props;


  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <div>
      <Typography variant='h5' align='center' gutterBottom>
        SoldOutBarcode And InActiveBarcode
      </Typography>
      <Divider />
      <Grid container>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12
          }}>
          {inActiveBarcode?.map((i) => {
            return (
              <>
                <li key={i}>{`InActiveBarcode  ${i}`}</li>
              </>
            );
          })}
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12
          }}>
          {soldBarcode?.map((i) => {
            return (
              <>
                <li key={i}>{`SoldBarcode  ${i}`}</li>
              </>
            );
          })}
        </Grid>
        <Grid
          align={'Right'}
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: 12
          }}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => setModalStatusHandler(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
