import React from 'react';
import {Grid, Button, Typography, Divider} from '@mui/material';
import {useSelector} from 'react-redux';

export default function OutOfStockDialog(props) {
  // const [open, setOpen] = React.useState(true);
  const {
    productListReducer: {
      out_of_stock: {productItems, orderItems},
    },
  } = useSelector((s) => s);
  const {setModalStatusHandler} = props;


  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <div>
      <Typography variant='h5' align='center' gutterBottom>
        Out of Stock...!
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
          {orderItems?.map((i) => {
            const matchingProduct = productItems.find((f) => f.item_id === i.item_id);
            return (
              <>
                <li key={i}>{`Product Name = ${i.name}   Order Qty = ${
                  i.quantity
                }   Available Qty = ${
                  matchingProduct ? matchingProduct.received_quantity : 0
                } `}</li>
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
