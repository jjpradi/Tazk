import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import { Divider } from '@mui/material';


function Row(props) {
  const {row} = props;
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      {/* <TableRow sx={{'& > *': {borderBottom: 'unset'}}}>
        <TableCell />
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell> */}
      {/* <TableBody> */}
      {typeof row.Category !== 'undefined' ? (
        row.Category.map((f) => (
          <TableRow
            key={row.product_id}
            sx={{
              '& > *': {
                padding: '6px 12px', // 🛠 Match padding from ProductList
                borderBottom: '1px solid #ddd', // 🛠 Add border for consistency
                height: '40px', // 🛠 Ensure uniform row height
              },
            }}
          >
            <TableCell />
            <TableCell component='th' scope='row'>
              {f.name}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow sx={{
          '& > *': {
            padding: '6px 12px', // 🛠 Match padding from ProductList
            borderBottom: '1px solid #ddd', // 🛠 Add border for consistency
            height: '40px', // 🛠 Ensure uniform row height
          },
        }}>
          <TableCell />
          <TableCell component='th' scope='row'>
            {row.name}
          </TableCell>
          <TableCell component='th' scope='row'>
            {row.brand}
          </TableCell>
          <TableCell component='th' scope='row'>
            {row.category}
          </TableCell>
        </TableRow>
      )}
      {/* </TableBody> */}
      {/* </TableRow> */}
      {/* <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Product</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                { typeof row.Category !== 'undefined' ? row.Category.map((f) => (
                    <TableRow key={row.product_id}>
                        <TableCell />
                      <TableCell component="th" scope="row">
                        {f.name}
                      </TableCell>
                        
                    </TableRow>
                 )) : ''}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow> */}
    </React.Fragment>
  );
}

const rows = [
  {
    name: 'Frozen yoghurt',
    calories: 159,
    fat: 6.0,
    date: '2020-01-05',
    customerId: 11091700,
    amount: 3,
  },
  {
    name: 'Ice cream sandwich',
    calories: 237,
    fat: 9.0,
    date: '2020-01-05',
    customerId: 11091700,
    amount: 3,
  },
  {
    name: 'Eclair',
    calories: 262,
    fat: 16.0,
    date: '2020-01-05',
    customerId: 11091700,
    amount: 3,
  },
  {
    name: 'Cupcake',
    calories: 305,
    fat: 3.7,
    date: '2020-01-05',
    customerId: 11091700,
    amount: 3,
  },
  {
    name: 'Gingerbread',
    calories: 356,
    fat: 16.0,
    date: '2020-01-05',
    customerId: 11091700,
    amount: 3,
  },
];

export default function ProductListMapping(props) {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <>
      {/* <Paper sx={{width: '100%', overflow: 'hidden'}}> */}
      <TableContainer
        // component={Paper}
        sx={{
          minHeight: '70vh',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <Table aria-label='collapsible table'>
          <TableHead >
            <TableRow>
              <TableCell />
              <TableCell>Product</TableCell>
              {props.statusId === 1 && (
                <>
                  <TableCell style={{fontWeight: 'bold'}}>Brand</TableCell>
                  <TableCell style={{fontWeight: 'bold'}}>Category</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.filterProduct.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <Row key={row.name} row={row} statusId={props.statusId} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={props.filterProduct.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    {/* </Paper> */}
    </>
  );
}
