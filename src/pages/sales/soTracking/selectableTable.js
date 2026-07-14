import * as React from 'react';
import PropTypes from 'prop-types';
import {alpha} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Switch from '@mui/material/Switch';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import FilterListIcon from '@mui/icons-material/FilterList';
import {visuallyHidden} from '@mui/utils';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
// import {Sale_Status} from '../sales/sale_status_list';
import Pagination from '../../../../src/components/pos/product_section/ProductGrid/Pagination';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
 Card,
 FormHelperText
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {getSalesStatusListAction} from '../../../redux/actions/sales_actions';
import { Fonts } from 'shared/constants/AppEnums';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array?.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'company_name',
    numeric: false,
    disablePadding: true,
    label: 'Customer',
  },
  {
    id: 'location_name',
    numeric: false,
    disablePadding: true,
    label: 'Location',
  },
  {
    id: 'invoice_number',
    numeric: false,
    disablePadding: true,
    label: 'Invoice',
  },
  {
    id: 'picked_by',
    numeric: false,
    disablePadding: true,
    label: 'Picked By',
  },
  {
    id: 'sale_status',
    numeric: false,
    disablePadding: true,
    label: 'Status',
  },
  {
    id: 'note',
    numeric: false,
    disablePadding: true,
    label: 'Remarks',
  },
  {
    id: 'date',
    numeric: false,
    disablePadding: true,
    label: 'Billing Date',
  },
  //   {
  //     id: 'protein',
  //     numeric: true,
  //     disablePadding: false,
  //     label: 'Protein(g)',
  //   },
];

function EnhancedTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell
          padding='checkbox'
          sx={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 2,
          }}
        >
          <Checkbox
            color='primary'
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event) => onSelectAllClick(event)}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 2,
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component='span' sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// EnhancedTableHead.propTypes = {
//   numSelected: PropTypes.number.isRequired,
//   onRequestSort: PropTypes.func.isRequired,
//   // onSelectAllClick: PropTypes.func.isRequired,
//   order: PropTypes.oneOf(['asc', 'desc']).isRequired,
//   orderBy: PropTypes.string.isRequired,
//   rowCount: PropTypes.number.isRequired,
// };

const EnhancedTableToolbar = (props) => {
  const {numSelected, data, Sale_Status} = props;
  const saleStatusUpdateOnTable = (value) => {
    let getOption = Sale_Status.filter((f) => f.status_id === value);
    return getOption.length > 0 ? getOption[0].status : value;
  };
  let Data = data.filter(
    (f) =>
      saleStatusUpdateOnTable(f.sale_status) === 'Ready To Ship' ||
      //saleStatusUpdateOnTable(f.sale_status) === 'In Transit' ||
      saleStatusUpdateOnTable(f.sale_status) === 'On Hold',
  );
  return (
    <Toolbar
      sx={{
        pl: {sm: 2},
        pr: {xs: 1, sm: 1},
        ...(numSelected > 0 && {
          backgroundColor: '#a6d0f7',
        }),
      }}
    >
      {numSelected > 0 && (
        <Grid container>
          <Grid
            pl='25px'
            size={{
              lg: 6,
              md: 3,
              sm: 3,
              xs: 12
            }}>
            <Typography
              sx={{flex: '1 1 100%'}}
              color='inherit'
              variant='subtitle1'
              component='div'
            >
              {numSelected} selected
            </Typography>
          </Grid>
          <Grid
            container
            display='flex'
            justifyContent='flex-end'
            spacing={1}
            size={{
              lg: 6,
              md: 9,
              sm: 9,
              xs: 12
            }}>
            <>
              <Grid
                display={'flex'}
                justifyContent={'flex-end'}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 3,
                  xs: 12
                }}>
                <Button
                  variant='contained'
                  startIcon={<TransferWithinAStationIcon />}
                  disabled={Data.length > 0 ? false : true}
                  onClick={() => props.transferClick('pickup')}
                  sx={{
                    flex: '100%',
                    color: 'black',
                    backgroundColor: '#d4d4d4',
                    //justifyContent:'flex-end'
                  }}
                  // fullWidth
                >
                  <Typography
                    //  sx={{flex: '100%'}}
                    color='inherit'
                    variant='subtitle1'
                    //  component='div'
                    //  style={{textAlign:'right'}}
                    // value="pickup"
                  >
                    Pick Up
                  </Typography>
                </Button>
              </Grid>
              <Grid
                display={'flex'}
                justifyContent={'flex-end'}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 3,
                  xs: 12
                }}>
                <Button
                  variant='contained'
                  startIcon={<PauseCircleFilledIcon />}
                  disabled={Data.length > 0 ? false : true}
                  onClick={() => props.transferClick('hold')}
                  sx={{
                    flex: '100%',
                    color: 'black',
                    backgroundColor: '#d4d4d4',
                  }}
                  //fullWidth
                >
                  <Typography
                    //  sx={{flex: '100%'}}
                    color='inherit'
                    variant='subtitle1'
                    //  component='div'
                    //  style={{textAlign:'right'}}
                    //  value="hold"
                  >
                    On Hold
                  </Typography>
                </Button>
              </Grid>
              <Grid
                display={'flex'}
                justifyContent={'flex-end'}
                size={{
                  lg: 3,
                  md: 3,
                  sm: 3,
                  xs: 12
                }}>
                <Button
                  variant='contained'
                  startIcon={<TransferWithinAStationIcon />}
                  disabled={Data.length > 0 ? false : true}
                  onClick={() => props.transferClick('delivered')}
                  sx={{
                    flex: '100%',
                    color: 'black',
                    backgroundColor: '#d4d4d4',
                  }}
                  //fullWidth
                >
                  <Typography
                    //  sx={{flex: '100%'}}
                    color='inherit'
                    variant='subtitle1'
                    //  component='div'
                    //  style={{textAlign:'right'}}
                    //  value="delivered"
                  >
                    Delivered
                  </Typography>
                </Button>
              </Grid>
            </>
          </Grid>
        </Grid>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function EnhancedTable(props) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [dense] = React.useState(false); //, setDense
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setdialogOpen] = React.useState(false);
  const [remark, setRemark] = React.useState('');
  const [receivedBy, setreceivedBy] = React.useState('');
  const [status, setstatus] = React.useState('');
  const [selectedEmployee, setSelectedEmployee] = React.useState();
  const [pickupfail, setpickupfail] = React.useState();
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // console.log("props",props)

  const dispatch = useDispatch();
  const {
    salesReducer: {Sale_Status},
    soTrackingReducer: {allemp},
  } = useSelector((state) => state);

  React.useEffect(() => {
    !Sale_Status.length && dispatch(getSalesStatusListAction());
  }, []);

const handleSelectAllClick = (event) => {
  if (event.target.checked) {
    const newSelecteds = sortedOrders.map((n) => ({
      sale_id: n.sale_id,
      record_kind: n.record_kind,
    }));
    setSelected(newSelecteds);
  } else {
    setSelected([]);
  }
};


const handleClick = (event, sale_id, record_kind) => {
  const selectedIndex = selected.findIndex(item => item.sale_id === sale_id);
  let newSelected = [];

  if (selectedIndex === -1) {
    newSelected = [...selected, { sale_id, record_kind }];
  } else {
    newSelected = selected.filter(item => item.sale_id !== sale_id);
  }

  setSelected(newSelected);
};

  // const handleChangeDense = (event) => {
  //   setDense(event.target.checked);
  // };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last props.page with empty rows.
  const emptyRows =
    props.page > 0
      ? Math.max(0, (1 + props.page) * props.rowsPerPage - props.billedOrders.length)
      : 0;

  const transferClick = (value) => {
    setstatus(value);
    if (value == 'pickup') {
      const filteredOrders = props.billedOrders.filter(
        (order) => selected.includes(order.sale_id) && order.sale_status === 5,
      );
      if (filteredOrders?.length) {
        setpickupfail(true);
      }
      setdialogOpen(true);
    } else {
      setOpen(true);
    }
    //setSelected([]);
  };
  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const saleStatusUpdateOnTable = (value) => {
    let getOption = Sale_Status.filter((f) => f.status_id === value);
    return getOption.length > 0 ? getOption[0].status : value;
  };

  const rows = [
    {id: 1, row: 20},
    {id: 2, row: 40},
    {id: 3, row: 100},
  ];
  console.log(selected,props.billedOrders,'dhgtt');

const sortedOrders = React.useMemo(
  () => stableSort(props.billedOrders, getComparator(order, orderBy)),
  [props.billedOrders, order, orderBy]
);
  const hasOrders = sortedOrders.length > 0;
  
  const statusFour = hasOrders && sortedOrders.some(order => order.sale_status === 4);
  const statusFive = hasOrders && sortedOrders.some(order => order.sale_status === 5);
  
const hasSelectedOrders = selected.length > 0;

const selectedOrders = props.billedOrders.filter(order =>
  selected.some(sel => sel.sale_id === order.sale_id)
);

const hasStatusFour = selectedOrders.every(order => order.sale_status === 4);
const hasStatusFive = selectedOrders.some(order => order.sale_status === 5);

const isPickUpDisabled = !hasSelectedOrders || (!hasStatusFour);
const isOnHoldDisabled = !hasSelectedOrders || (!hasStatusFour && !hasStatusFive);
const isDeliveredDisabled = !hasSelectedOrders && (!hasStatusFour || !hasStatusFive);


const companies = selectedOrders.map(item => item.company_name);
const uniqueCompanies = new Set(companies);
const result = uniqueCompanies.size > 1 ? 1 : 0;

  


  return (
    <>
      {/* <Card sx={{ mt: 3,mb: 1 }}> */}
      <Box
  display="flex"
  alignItems="center"
  justifyContent="space-between"
  sx={{
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px 24px', 
  }}
>
  <Box display="flex" alignItems="center" gap={4}>
    <Typography
      variant="h6"
      sx={{
        fontWeight: Fonts.SEMI_BOLD,
        fontSize: '16px',
        color: '#333',
      }}
    >
      Billed Orders
    </Typography>

    {props.billedOrders?.length > 0 && (
      <Typography
        variant="subtitle1"
        sx={{ fontSize: '14px', color: 'text.secondary' }}
      >
        {selected.length} selected
      </Typography>
    )}
  </Box>

  <Box display="flex" gap={1}>
    <Button
      variant="contained"
      size="small"
      startIcon={<TransferWithinAStationIcon />}
      disabled={isPickUpDisabled}
      onClick={() => transferClick('pickup')}
      sx={{
        textTransform: 'none',
        backgroundColor: '#e0e0e0',
        color: 'rgba(0, 0, 0, 0.87)',
        '&:hover': { backgroundColor: '#d5d5d5' },
        boxShadow: 'none',
        fontWeight: 600
      }}
    >
      Pick Up
    </Button>

    <Button
      variant="contained"
      size="small"
      startIcon={<PauseCircleFilledIcon />}
      disabled={isOnHoldDisabled}
      onClick={() => transferClick('hold')}
      sx={{
        textTransform: 'none',
        backgroundColor: '#e0e0e0',
        color: 'rgba(0, 0, 0, 0.87)',
        '&:hover': { backgroundColor: '#d5d5d5' },
        boxShadow: 'none',
        fontWeight: 600
      }}
    >
      On Hold
    </Button>

    <Button
      variant="contained"
      size="small"
      startIcon={<TransferWithinAStationIcon />}
      disabled={isDeliveredDisabled}
      onClick={() => transferClick('delivered')}
      sx={{
        textTransform: 'none',
        backgroundColor: '#e0e0e0',
        color: 'rgba(0, 0, 0, 0.87)',
        '&:hover': { backgroundColor: '#d5d5d5' },
        boxShadow: 'none',
        fontWeight: 600
      }}
    >
      Delivered
    </Button>
  </Box>
</Box>
      {/* </Card> */}
      {/* <Box sx={{ overflowX: 'auto', backgroundColor: 'white'}}> */}
      {props.billedOrders?.length ? (
      /* <Paper elevation={0}> */
        /* {selected.length > 0 && (
          <EnhancedTableToolbar
            numSelected={selected.length}
            transferClick={transferClick}
            data={stableSort(props.billedOrders, getComparator(order, orderBy))}
            Sale_Status={Sale_Status}
          />
        )} */
       (<>
         <Box
           display="flex"
           flexDirection="column"
           height={`calc(100vh - 170px)`}
         >
           <TableContainer  sx={{
    height: "calc(100vh - 200px)",         
    overflow: "auto",
  }}>
         <Table stickyHeader>
           <EnhancedTableHead
             numSelected={selected.length}
             // order={order}
             // orderBy={orderBy}
             onSelectAllClick={handleSelectAllClick}
             onRequestSort={handleRequestSort}
             rowCount={props.billedOrders.length}
           />
           <TableBody>
             {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                props.billedOrders.slice().sort(getComparator(order, orderBy)) */}
             {sortedOrders
               .map((row, index) => {
                const isItemSelected = selected.some(item => item.sale_id === row.sale_id);
                const labelId = `enhanced-table-checkbox-${index}`;
                 return (
                   <TableRow
                     hover
                     onClick={(event) => handleClick(event, row.sale_id,row.record_kind)}
                     role='checkbox'
                     aria-checked={isItemSelected}
                     tabIndex={-1}
                     key={row.sale_id}
                     selected={isItemSelected}
                   >
                     <TableCell padding='checkbox'>
                       <Checkbox
                         color='primary'
                         checked={isItemSelected}
                         inputProps={{
                           'aria-labelledby': labelId,
                         }}
                         //disabled={row.sale_status === 4 || row.sale_status === 8 ? false : true }
                       />
                     </TableCell>
                     <TableCell
                       component='th'
                       id={labelId}
                       scope='row'
                       padding='none'
                     >
                       {row.company_name}
                     </TableCell>
                     <TableCell align='right'>{row.location_name}</TableCell>
                     <TableCell align='right'>{row.invoice_number}</TableCell>
                     <TableCell align='right'>
                       {allemp?.find((v) => v.employee_id === row.picked_by)
                         ?.full_name || '-'}
                     </TableCell>
                     <TableCell align='right'>
                       {saleStatusUpdateOnTable(row.sale_status)}
                     </TableCell>
                     <TableCell align='right'>{row.note || '-'}</TableCell>
                     <TableCell align='right'>{row.date}</TableCell>
                     {/* <TableCell align="right">{row.protein}</TableCell> */}
                   </TableRow>
                 );
               })}
             {/* {emptyRows > 0 && (
               <TableRow
                 style={{
                   height: (dense ? 33 : 53) * emptyRows,
                 }}
               >
                 <TableCell colSpan={6} />
               </TableRow>
             )} */}
             
           </TableBody>
         </Table>
       </TableContainer>
         <Box display="flex" justifyContent="right" >
           {/* <Pagination
             rowsPerPageOptions={[20, 40, 100]}
             component='div'
             shape="rounded"
             count={props.billedOrders.length}
             rowsPerPage={rowsPerPage}
             page={props.page}
             onPageChange={handleChangePage}
             setRowsPerPage={setRowsPerPage}
             rows={rows}
             setPage={props.setPage}
             onRowsPerPageChange={handleChangeRowsPerPage}
           /> */}
           <TablePagination
             rowsPerPageOptions={[20, 50, 100]}
             component='div'
             count={props.billedOrdersFilterCount}
             rowsPerPage={props.rowsPerPage}
             page={props.page}
             onPageChange={props.handleChangePage}
             onRowsPerPageChange={props.handleChangeRowsPerPage}
           />
         </Box> 
         </Box>
       </>)
        /* <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          shape="rounded"
          count={props.billedOrders.length}
          rowsPerPage={rowsPerPage}
          props.page={props.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */
      /* </Paper> */
   ) : (
<Box
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p="5px 0px"
      >
        <Typography fontSize="11px">No records Today</Typography>
      </Box>
   )}
      {/* </Box> */}
      {open && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth='sm'
        >
          <DialogTitle>Are you sure you want to proceed {status}?</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label='Remarks'
              value={remark}
              required = {status === 'hold' && receivedBy?.trim() === ''}
              onChange={(e) => {
                setRemark(e.target.value);
                if (submitAttempted) setSubmitAttempted(false); // reset error if user corrects input
              }}
              multiline
              rows={1}
              margin='normal'
              sx={{maxWidth: '400px'}}
              error={
                  status === 'hold' && remark.trim() === ''
              }
              helperText={
                status === 'hold' && remark.trim() === ''
                  ? 'Remarks is required'
                  : ''
              }
            />
            { result === 0 && status === 'delivered' &&
            <TextField
              fullWidth
              label='Received By'
              value={receivedBy}
              onChange={(e) => {
                setreceivedBy(e.target.value);
                if (submitAttempted) setSubmitAttempted(false); // reset error if user corrects input
              }}
              rows={1}
              margin='normal'
              sx={{maxWidth: '400px'}}
              error={
                submitAttempted && status === 'hold' && receivedBy?.trim() === ''
              }
              helperText={
                submitAttempted && status === 'hold' && receivedBy?.trim() === ''
                  ? 'Received By is required'
                  : '' 
              }
            />
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {setOpen(false), setRemark(''),setreceivedBy('')}} color='secondary'>
              No
            </Button>
            <Button
              onClick={() => {
                if (status === 'hold' && (remark.trim() === '' || receivedBy.trim() === '')) {
                  setSubmitAttempted(true);
                  // return;
                }
                props.handleStatusChange({
                  selected,
                  type: status,
                  Remarks: remark,
                  receivedBy : receivedBy,
                  pickedUpby: selectedEmployee || '',
                });
                setOpen(false);
                setdialogOpen(false);
                setSelectedEmployee(null);
                setRemark('');
                setreceivedBy('')
                setSelected([])
              }}
              color='primary'
              variant='contained'
              disabled = {status === 'hold' && remark.trim() === '' }
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          onClose={() => setdialogOpen(false)}
          fullWidth
          maxWidth='sm'
        >
          {pickupfail && (
            <>
              <DialogTitle>please Remove items already InTransit</DialogTitle>
              <DialogActions>
                <Button
                  onClick={() => {
                    setpickupfail(false);
                    setdialogOpen(false);
                  }}
                  color='primary'
                  variant='contained'
                >
                  Ok
                </Button>
              </DialogActions>
            </>
          )}

          {!pickupfail && (
            <>
              <DialogTitle>please select delivery person</DialogTitle>
              <DialogContent>
                <div style={{padding: 5}}>
                  <FormControl fullWidth>
                    <InputLabel id='employee-select-label'>
                      Select Employee
                    </InputLabel>
                    <Select
                      labelId='employee-select-label'
                      id='employee-select'
                      value={selectedEmployee}
                      label='Select Employee'
                      required
                      onChange={handleEmployeeChange}
                      MenuProps={{
                        getContentAnchorEl: null,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        PaperProps: {
                          style: {
                            maxHeight: 250,
                            overflowY: 'auto',
                            zIndex: 1300,
                          },
                        },
                      }}
                    >
                      {/* <MenuItem value=''>
                        <em>None</em>
                      </MenuItem> */}
                      {allemp.map((employee) => (
                        <MenuItem
                          key={employee.employee_id}
                          value={employee.employee_id}
                        >
                          {employee.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                     {!selectedEmployee ? (
                      <FormHelperText>Please select an employee</FormHelperText>
                    ) : (
                      (<FormHelperText>&nbsp;</FormHelperText>) // keeps spacing consistent
                    )}
                  </FormControl>
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setdialogOpen(false)} color='secondary'>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setOpen(true);
                  }}
                  color='primary'
                  variant='contained'
                  disabled = {!selectedEmployee}
                >
                  Proceed
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      )}
    </>
  );
}
