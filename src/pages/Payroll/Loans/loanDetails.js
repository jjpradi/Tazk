import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  Typography,
  Divider,
  DialogContent,
  DialogContentText,
  TextField,
  Dialog,
  DialogActions,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Loanpayments from './Loanpayments';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import CommonDialog from '../../../components/commonDialog';
import MaterialTable from 'utils/SafeMaterialTable';
import { headerStyle, cellStyle } from '../../../utils/pageSize';
import { useDispatch, useSelector } from 'react-redux';
import apiCalls from 'utils/apiCalls';
import context from '../../../../src/context/CreateNewButtonContext';
import {
  listLoanLedgerDetails,
  searchLoanAction,
  writeOffLoanAction,
} from 'redux/actions/loan_actions';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import { yyyymmdd_ddmmyyyy } from 'utils/getTimeFormat';
import { getsessionStorage } from 'pages/common/login/cookies';
import { GET_LOAN_LEDGER_DETAILS } from 'redux/actionTypes';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import ButtonGroup from '@mui/material/ButtonGroup';
import { blue } from '@mui/material/colors';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

function LoanDetails({ handleClose, clickedLoanId, filteredValue}) {
  let storage = getsessionStorage();
  const dispatch = useDispatch();
  const anchorRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [witeOffOpen, setWriteOffOpen] = useState(false);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [writeOffReason, setWriteOffReason] = useState({
    value: '',
    error: null,
  });
  const {
    LoanReducer: { loanLedgerDetails, searchloandata },
  } = useSelector((state) => state);

  const [currentLoanIndex, setCurrentLoanIndex] = useState(
    searchloandata.data.findIndex((loan) => loan.id === clickedLoanId)
  );
  const [rowData, setRowData] = useState(searchloandata.data.find((i) => i.id === clickedLoanId));
  const [timelineData, setTimelineData] = useState([]);

  useEffect(()=>{
    setRowData(searchloandata.data[currentLoanIndex])
  },[currentLoanIndex,searchloandata.data])

  useEffect(() => {
    if (loanLedgerDetails?.length) {
      setTimelineData(loanLedgerDetails);
    }
  }, [loanLedgerDetails]);

  console.log("timelineData",timelineData);
  //const rowData = searchloandata.data.find((i) => i.id === currentLoanIndex ? currentLoanIndex : clickedLoanId);
  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler } = useContext(context);

  const isLoanWrittenOff = !!rowData?.write_off_date;
  const isLoanApproved = rowData.status === 'Approved';
  const isLoanClosed = rowData.outStanding === 0;
  const loanDetails = useMemo(() => {
    return generateDetails(rowData);
  }, [rowData]);

  useEffect(() => {
    fetchTransaction();

    return () => {
      dispatch({
        type: GET_LOAN_LEDGER_DETAILS,
        payload: [],
      });
    };
  }, [currentLoanIndex]);

  function fetchTransaction() {
    let data = {
      entity: rowData.loan_number,
    };
    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(listLoanLedgerDetails(data, setModalTypeHandler, setLoaderStatusHandler))
    );
  }

  const handleWriteOff = () => {
    if (writeOffReason.value.length === 0) {
      setWriteOffReason({ value: '', error: 'Reason is Required!' });
      return;
    }

    const body = {
      loan_id: rowData.id,
      outstanding: rowData.outStanding,
      writeOffReason: writeOffReason.value,
      write_off_by:
        storage?.first_name + (storage?.last_name ? ' ' + storage.last_name : ''),
    };

    apiCalls(
      setModalTypeHandler,
      setLoaderStatusHandler,
      dispatch(
        writeOffLoanAction(body, () => {
          setWriteOffOpen(false);
          setWriteOffReason('');
          setReasonDialogOpen(false);
          dispatch(
            searchLoanAction(filteredValue, setModalTypeHandler, setLoaderStatusHandler)
          );
        })
      )
    );
  };

    const handleMenuItemClick = (event, index) => {
      if (index === 0) {
        setWriteOffOpen(true);
      } else if (index === 1) {
        setOpenPayment(true);
      }
      setOpen(false);
    };
  
    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };
  
    const handleCloseMenu = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const previousClick = () => {
      if (currentLoanIndex > 0) {
        setCurrentLoanIndex((prevIndex) => prevIndex - 1);
      }
    };
  
    const nextClick = () => {
      if (currentLoanIndex < searchloandata.data.length - 1) {
        setCurrentLoanIndex((prevIndex) => prevIndex +1);
      }
    };
    
  return (
    <>
      {!openPayment &&
        <Grid container>
          <Grid
            display='flex'
            justifyContent='flex-end'
            mb='10px'
            size={{
              xs: 12,
              lg: 12,
              sm: 12,
              md: 12
            }}>
            <div style={{ marginLeft: 'auto' }}>
              <Grid container spacing={2}>
                <Grid>
                  <Button
                    variant='contained'
                    onClick={() => {
                      handleClose(false)
                    }}
                    sx={{}}
                    color='inherit'
                  >
                    Back
                  </Button>
                </Grid>
                <Grid>
                  <ButtonGroup
                    variant='contained'
                    ref={anchorRef}
                    aria-label='split button'
                  >
                    <Button
                      style={{ color: 'white', backgroundColor: blue[800] }}
                      onClick={handleToggle}>
                      Action
                    </Button>
                    <Button
                      size='small'
                      aria-controls={open ? 'split-button-menu' : undefined}
                      aria-expanded={open ? 'true' : undefined}
                      aria-label='select merge strategy'
                      aria-haspopup='menu'
                      onClick={handleToggle}
                    >
                      <ArrowDropDownIcon />
                    </Button>
                  </ButtonGroup>
                  <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin:
                            placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={handleCloseMenu}>
                            <MenuList id="loans-split-button-menu">
                              {['Write Off', 'Make Payment'].map((option, index) => (
                                <MenuItem
                                  key={option}
                                  disabled={
                                    (index === 0 && (isLoanWrittenOff || isLoanClosed)) ||
                                    (index === 1 && (isLoanApproved && isLoanClosed) || isLoanWrittenOff)
                                  }
                                  onClick={(event) => handleMenuItemClick(event, index)}
                                >
                                  {option}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </Grid>
                <Grid>
                  <Tooltip title='Previous'>
                    <IconButton
                      color='primary'
                      component='span'
                      disabled={currentLoanIndex === 0}
                    onClick={() => previousClick()}
                    >
                      <ArrowBackIosIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title='Next'>
                    <IconButton
                      color='primary'
                      disabled={currentLoanIndex === searchloandata.data.length - 1} 
                      component='span'
                    onClick={() => nextClick() }
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </div>

          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 4
            }}>
            <Card sx={{ padding: '20px', marginBottom: '20px', height: '100%' }}>
              <Grid container spacing={2}>
              <Grid
                display='flex'
                justifyContent={'flex-end'}
                pb={10}
                visibility='hidden'
                size={12}>
              </Grid>
                <Grid size={12}>
                  {/* <Typography variant='h2' style={{ paddingBottom: '30px',fontSize:'13px'}}>
                    Loan ID: {rowData.id}
                  </Typography> */}
                  <Typography variant='h2' style={{ paddingBottom: '30px',fontSize : '13px' }}>
                    Rs. {rowData.Required_Amount}
                  </Typography>
                  <Grid container spacing={3}>
                    {loanDetails.map((data) => (
                      <React.Fragment key={data.order}>
                        <Grid size={4}>
                          <Box
                            sx={{
                              color: 'text.secondary',
                              fontSize:'12px',
                            }}
                          >
                            {data.title}
                          </Box>
                        </Grid>
                        <Grid size={8}>
                          <Box
                            sx={{
                              fontSize: '12px',
                            }}
                          >
                            {data.value}
                          </Box>
                        </Grid>
                      </React.Fragment>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 8
            }}>
            <Box sx={{ maxHeight: 'calc(100vh - 80px)', overflow: 'auto' }}>
            <Card sx={{ padding: '20px', height: '100%' }}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    lg: 3,
                    md: 4,
                    sm: 4
                  }}>
                  <Box>
                    <Card
                      variant='outlined'
                      sx={{ padding: '10px', width: '100%', borderRadius: 2, }}
                    >
                      <Typography className='loanheader'component='div' align='center' sx={{ color: 'black !important' }}>
                        Total Loan Amount
                      </Typography>

                      <Typography  className='loancontent' align='center' sx={{ color: 'black' }}>
                        {rowData.Required_Amount}
                      </Typography>
                    </Card>
                  </Box>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    lg: 3,
                    md: 4,
                    sm: 4
                  }}>
                  <Box>
                    <Card

                      variant='outlined'
                      sx={{ padding: '10px', width: '100%', borderRadius: 2, }}
                    >
                      <Typography className='loanheader' component='div' align='center' sx={{ color: 'black !important' }}>
                        EMI Amount
                      </Typography>

                      <Typography  className='loancontent'  align='center' sx={{ color: 'black' }}>
                        {rowData.amount_per_month}
                      </Typography>
                    </Card>
                  </Box>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    lg: 3,
                    md: 4,
                    sm: 4
                  }}>
                  <Box>
                    <Card

                      variant='outlined'
                      sx={{ padding: '10px', width: '100%', borderRadius: 2,}}
                    >
                      <Typography className='loanheader' component='div' align='center' sx={{ color: 'black !important' }}>
                        Tenure
                      </Typography>

                      <Typography className='loancontent' align='center' sx={{ color: 'black' }}>
                        {rowData.tenure}
                      </Typography>
                    </Card>
                  </Box>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    lg: 3,
                    md: 4,
                    sm: 4
                  }}>
                  <Box>
                    <Card

                      variant='outlined'
                      sx={{ padding: '10px', width: '100%', borderRadius: 2, }}
                    >
                      <Typography className='loanheader' component='div' align='center' sx={{ color: 'black !important' }}>
                        Due
                      </Typography>

                      <Typography  className='loancontent'  align='center' sx={{ color: 'black' }}>
                        {rowData.outStanding}
                      </Typography>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
              <Grid
                display='flex'
                justifyContent={'flex-end'}
                pb={10}
                visibility='hidden'
                size={12}>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          <MaterialTable
                            options={{
                              headerStyle,
                              maxBodyHeight: '500px',
                              minBodyHeight: '400px',
                              cellStyle,
                              paging: false,
                              search: false,
                            }}
                            columns={[
                              { title: 'Date', field: 'transactionDate' },
                              { title: 'Amount', field: 'amount' },
                              { title: 'Location Name', field: 'location_name' },
                              {
                                title: 'Payment Type',
                                render: (rowData) => {
                                  const descriptionParts = rowData.description.split('-');
                                  const paymentType = descriptionParts[1].trim();
                                  return paymentType;
                                },
                              },
                            ]}
                            data={loanLedgerDetails}
                            title='Transactions'
                          />
                        </Grid>
                        <Grid size={12}>
                          <Divider style={{ padding: '20px' }} />
                          <Typography>Loan Timeline</Typography>
                          <LoanTimeLine rowData={rowData} timelineData={timelineData} />
                        </Grid>
                      </Grid>
                    </Grid>
                    </Grid>
                    </Grid>
                    <Divider style={{ padding: '20px' }} />
                
        
                <CommonDialog
                  cancel_buttonName={'No'}
                  ok_buttonName={'Yes'}
                  dialogTitle={'Write off this loan'}
                  dialogContent={`Do you want write off this loan? It has Rs : ${rowData.outStanding} as outstanding amount.`}
                  cancel_fun={() => {
                    setWriteOffOpen(false);
                  }}
                  ok_fun={() => {
                    setReasonDialogOpen(true);
                    setWriteOffOpen(false);
                  }}
                  open={witeOffOpen}
                  handleClose={() => setWriteOffOpen(false)}
                />

                {reasonDialogOpen === true && (
                  <Dialog
                    maxWidth='sm'
                    open={reasonDialogOpen}
                    onClose={() => setReasonDialogOpen(false)}
                    fullWidth
                    maxHeight='sm'
                  >
                    <DialogContent>
                      <DialogContentText
                        sx={{ fontWeight: headerStyle.fontWeight }}
                        id='alert-dialog-description'
                      >
                        Reason is required to write off a loan!
                      </DialogContentText>
                      <Grid sx={{ padding: '20px 0px 0px 0px' }}>
                        <TextField
                          onChange={(e) => {
                            const { value } = e.target;
                            setWriteOffReason({ value, error: null });
                          }}
                          name='reason'
                          required
                          fullWidth={true}
                          multiline={true}
                          placeholder='Reason'
                          label='Reason'
                          value={writeOffReason.value}
                          error={writeOffReason.error}
                          helperText={writeOffReason.error}
                        ></TextField>
                      </Grid>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        color='warning'
                        variant='contained'
                        onClick={() => {
                          setReasonDialogOpen(false);
                          setWriteOffReason({ value: '', error: null });
                        }}
                      >
                        Close
                      </Button>
                      <Button variant='contained' onClick={handleWriteOff} autoFocus>
                        Submit
                      </Button>
                    </DialogActions>
                  </Dialog>
                )}
              </Grid>
            </Card>
            </Box>
          </Grid>
        </Grid>
      }
      <Grid>
        {openPayment && (
        <Grid style={{ padding: '30px 0px 0px 100px' }}>
          <Loanpayments
            rowdata={rowData}
            close={() => {
              setOpenPayment(false);
              fetchTransaction();
            }}
            filteredValue={filteredValue}
          />
        </Grid>
      ) }
      </Grid>
    </>
  );
}


function generateDetails(rowData) {
  console.log('rowData in generateDetails:', rowData);
  const dateKeys = ['approvalDate', 'date', 'write_off_date'];
  const loanType = {
    AUTO_DEDUCTION_FROM_SALARY: 'Auto Deduction From Salary',
    MANUAL_REPAYMENT: 'Manual Payment',
  };
  
  const data = {
    // id: { title: 'ID', order: 1 },
    approvedBy: { title: 'Approved By', order: 1 },
    approvalDate: { title: 'Approval Date', order: 3 },
    Reason: { title: 'Reason', order: 4 },
    Required_Amount: { title: 'Requested Amount', order: 5 },
    amount_per_month: { title: 'Monthly Repayment Amount', order: 6 },
    Repayment_method: { title: 'Repayment Method', order: 7 },
    date: { title: 'Requested Date', order: 8 },
    interest_rate: { title: 'Interest Rate', order: 9 },
    loan_number: { title: 'Loan Number', order: 10 },
    newStatus: { title: 'Status', order: 11 },
    otp: { title: 'OTP', order: 12 },
    pay: { title: 'Payment', order: 13 },
    role_name: { title: 'Role', order: 14 },
    status: { title: 'Workflow Status', order: 15 },
    total_deu: { title: 'Total Deu', order: 16 },
    type: { title: 'Type', order: 17 },
    write_off_date: { title: 'Write Off Date', order: 18 },
    write_off_by: { title: 'Write Off By', order: 19 },
    data_type: { title: 'Data Type', order: 20 },
  };

  const formatDate = (dateString, isTransaction) => {
    if (!dateString) return '';
    const [datePart, timePart] = dateString.replace('T', ' ').split(' ');
    const [year, month, day] = datePart.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    if (timePart) {
      let [hours, minutes,] = timePart.split(':');
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
   return `${formattedDate} ${hours}:${minutes} ${ampm}`;  
    }
    return formattedDate;
  };

  return Object.keys(data)
    .filter((key) => !!rowData[key])
    .sort((a, b) => data[a].order - data[b].order)
    .map((key) => {
      let value = rowData[key];
      if (dateKeys.includes(key)) {
        value = formatDate(value);
      }
      if (key === 'Repayment_method') {
        value = loanType[value];
      }
      return { title: data[key].title, value, key };
    });
}
// console.log("TimelineData",timelineData);
function LoanTimeLine({ rowData, timelineData }) {
  const dateKeys = ['approvalDate', 'date', 'write_off_date'];
  const formatDate = (dateString, isTransaction) => {
    if (!dateString) return '';
    
    if (isTransaction) {
      return dateString; 
    }
    
    // For other dates, convert to a Date object and format
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const formattedHours = String(hours).padStart(2, '0')
    
    return `${formattedHours}:${minutes} ${ampm} ${day}/${month}/${year}`;
  };

  const data1 = [
    {
      title: 'Loan Requested',
      date: rowData.date,
    },
    {
      title: 'Loan Approved',
      date: rowData.approvalDate,
    },
    {
      title: 'Loan Write Off',
      date: rowData.write_off_date,
    }
  ];

  const data2 = timelineData.map((transaction) => ({
    title: 'Loan Entry',
    date: transaction.transactionDate,
    isTransaction: true,
  }));

  const data3 = [
    {
      title: 'Loan Closed',
      date: rowData.closing_date,
    },
  ];

  const combinedData = [...data1, ...data2, ...data3];

  return (
    <Timeline position='alternate'>
      {combinedData
        .filter((entry) => entry.date)
        .map((entry, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              className={timelineOppositeContentClasses.alignRight}
            >
              <Typography variant='body2' color='text.secondary'>
              {formatDate(entry.date, entry.isTransaction)}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant='h6' component='span'>
                {entry.title}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
    </Timeline>
  );
}

export default LoanDetails;

