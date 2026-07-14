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
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import { Divider } from '@mui/material';
import { maxBodyHeight } from 'utils/pageSize';

function Row({ row, handleProductData, filterProduct, statusId }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow
        sx={{
          height: '50px', // 🛠 Fixed row height for consistency
          '& > *': { padding: '6px 12px', borderBottom: '1px solid #ddd' },
        }}
      >
        <TableCell padding="checkbox" sx={{ width: '50px' }}> {/* 🛠 Ensured fixed width for checkbox */}
          <Checkbox
            color="primary"
            checked={filterProduct.some((d) => d.product_id === row.product_id)} // 🛠 Simplified condition to check selected state
            onChange={(e) => handleProductData(e.target.checked, row, 'Single')}
          />
        </TableCell>

        {statusId === 2 || statusId === 3 ? (
          <TableCell sx={{ width: '50px' }}> {/* 🛠 Ensured fixed width for expand/collapse button */}
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        ) : (
          <TableCell sx={{ width: '50px' }} /> 
        )}

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '250px', // 🛠 Ensured proper text clipping
          }}
        >
          {row.name}
        </TableCell>
        <TableCell>{row.brand}</TableCell>
        <TableCell>{row.category}</TableCell>
      </TableRow>
      {open && ( // 🛠 Wrapped Collapsible Row properly
        (<TableRow>
          <TableCell colSpan={5} sx={{ paddingBottom: 0, paddingTop: 0 }}> {/* 🛠 Corrected colspan for proper alignment */}
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.Category?.map((f, index) => ( // 🛠 Ensured unique key with index
                      (<TableRow key={index} sx={{ height: '40px' }}> {/* 🛠 Fixed row height in collapsed section */}
                        <TableCell>{f.name}</TableCell>
                      </TableRow>)
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>)
      )}
    </>
  );
}

export default function ProductList({ product_list, handleProductData, filterProduct, statusId,setPage,page }) {
  const [rowsPerPage, setRowsPerPage] = React.useState(20);


  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  console.log(product_list,'filterProduct')

  return (
    <>
      <TableContainer
        sx={{
          minHeight: 'calc(100vh - 285px)',
          maxHeight: 'calc(100vh - 285px)',
        }}
      >
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '50px' }} /> {/* 🛠 Ensured fixed width for alignment */}
              <TableCell sx={{ width: '50px' }} />
              <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Product</TableCell> {/* 🛠 Set consistent width */}
              <TableCell sx={{ fontWeight: 'bold' }}>Brand</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {product_list
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <Row
                  key={row.product_id}
                  row={row}
                  statusId={statusId}
                  handleProductData={handleProductData}
                  filterProduct={filterProduct}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      <TablePagination
        rowsPerPageOptions={[20, 50, 100]}
        component="div"
        count={product_list.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}
