import * as React from 'react';
import Popover from '@mui/material/Popover';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
import InvoiceTable from './InvoiceTable';
import Link from '@mui/material/Link';

export default function BasicPopover({params: {sales_items, invoice_number}}) {
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

  return (
    <div>
      <Link href='#' aria-describedby={id} onClick={handleClick}>
        {invoice_number}
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
        <div style={{width: 400}}>
          <InvoiceTable sales_items={sales_items} />
        </div>
      </Popover>
    </div>
  );
}
