import * as React from 'react';
import Popover from '@mui/material/Popover';
import PaymentTable from './PaymentTable';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

export default function BasicPopover({params: {sales_payment}}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const getNames = () => {
    let names = '';
    sales_payment.forEach((data, i) => {
      names +=
        data.payment_type.split(' ')[0] +
        `${sales_payment.length - 1 !== i ? ', ' : ''}`;
    });
    return names;
  };

  return (
    <div>
      {sales_payment.length > 1 ? (
        <>
          <Link href='#' aria-describedby={id} onClick={handleClick}>
            {getNames()}
          </Link>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <PaymentTable sales_payment={sales_payment} />
          </Popover>
        </>
      ) : (
        <Typography variant='body2' component='div'>
          {getNames()}
        </Typography>
      )}
    </div>
  );
}
