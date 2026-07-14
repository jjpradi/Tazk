import { Box, Button, ButtonGroup, Card, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ArrowDropDownIcon } from '@mui/x-date-pickers';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { blue } from '@mui/material/colors';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MaterialTable from 'utils/SafeMaterialTable';
import { headerStyle, cellStyle, maxBodyHeight } from '../../../utils/pageSize';
import ClaimPayments from './ClaimPayments';
import { getClaimtimelineAction, getClaimtransactionAction } from 'redux/actions/allLoans_actions';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import { object } from 'prop-types';

const ClaimsDetailPage = (props) => {

    const dispatch = useDispatch()
    const anchorRef = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const [paymentOpen, setPaymentOpen] = React.useState(false);
    const [index, setIndex] = useState(0)

      const {
            AllLoansReducer: { getClaimtransaction,getClaimtimeline }
        } = useSelector((state) => state);

        

    

    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
    };

    const handleCloseMenu = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    const handleMenuItemClick = (event, index) => {
      if (index === 0) {
        setPaymentOpen(true);
      } 
      setOpen(false);
    };

    const claimDetails = [
      {id : 1 ,title : 'Approval Date', value : moment(props.rowData.approvalDate, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')},
      {id : 2 ,title : 'Remarks', value :  props.rowData.remarks},
      {id : 3 ,title : 'Billed Amount', value :  props.rowData.bill_amount},
      {id : 4 ,title : 'Claim Amount', value :  props.rowData.claim_amount},
      {id : 5 ,title : 'Billed Date', value :   moment(props.rowData.bill_date, 'YYYY-MM-DD').format('DD/MM/YYYY')},
      {id : 6 ,title : 'Category', value :  props.rowData.category},
      {id : 7 ,title : 'requested Date', value :  moment(props.rowData.creationDate, 'YYYY-MM-DD').format('DD/MM/YYYY')},
      {id : 8 ,title : 'Status', value :  props.rowData.status}
    ]

    useEffect(()=>{ (async () => {
     await dispatch(getClaimtransactionAction({claim_id : props.rowData.claim_id}))
     await dispatch(getClaimtimelineAction({claim_id : props.rowData.claim_id}))
    })();
},[props.rowData.claim_id])

    useEffect(()=>{

    const index = props.data.findIndex(item => item.claim_id === props.rowData.claim_id);
    setIndex(index)
    props.setIndex(index)
  
    },[props.data.length])

    console.log(index,'dszfdsfsdfdsf')

    
    const previousClick = () => {
      if (index > 0) {
        setIndex((prevIndex) => {
          const newIndex = prevIndex - 1;
          props.setIndex(newIndex);  // âœ… use the updated index
          return newIndex;
        });
      }
    };
  
    const nextClick = () => {
      if (index < props.data.length - 1) {
        setIndex((prevIndex) => {
          const newIndex = prevIndex + 1;
          props.setIndex(newIndex);  // âœ… use the updated index
          return newIndex;
        });
      }

    };

    useEffect(()=>{ (async () => {
     await dispatch(getClaimtransactionAction({claim_id : props.rowData.claim_id}))
     await dispatch(getClaimtimelineAction({claim_id : props.rowData.claim_id}))
    })();
},[props.rowData.claim_id,index])


  return (
    <div>
      { !paymentOpen &&
      <Grid container>
              <Grid
                display='flex'
                justifyContent='flex-end'
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
                    props.handleClose(false)
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
                <Popper sx={{zIndex:1}} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
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
                          <MenuList id="claims-split-button-menu">
                            {['Make Payment'].map((option, index) => (
                              <MenuItem
                                key={option}
                                onClick={(event) => handleMenuItemClick(event, index)}
                                disabled = {props.rowData.outstanding <= 0 || getClaimtimeline.loan_status === "Closed" }
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
                    disabled = {index === 0 ? true : false}
                  onClick={() => previousClick()}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title='Next'>
                  <IconButton
                    color='primary'
                    component='span'
                     disabled={index === props.data.length - 1} 
                  onClick={() => nextClick() }
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </div>
</Grid>

<Card sx={{minHeight: 'calc(100vh - 125px)'}} >

  <Grid container>

<Grid
  size={{
    xs: 12,
    md: 5
  }}>
          <Box sx={{ padding: '20px' }}>
            <Grid container spacing={2}>
            <Grid
              display='flex'
              justifyContent={'flex-end'}
              pb={10}
              visibility='hidden'
              size={12}>
            </Grid>
              <Grid size={12}>
                <Typography variant='h2' style={{ paddingBottom: '30px',fontSize:'13px'}}>
                  Claim Number  {props.rowData.claim_number}
                </Typography>
                <Typography variant='h2' style={{ paddingBottom: '30px',fontSize : '13px' }}>
                  Rs.  {props.rowData.bill_amount}
                </Typography>
                <Grid container spacing={3}>
                  {claimDetails.map((data) => (
                    <React.Fragment key={data.id} >
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
          </Box>
        </Grid>
                  
         <Grid
           size={{
             xs: 12,
             md: 7
           }}>
        <Card sx={{ padding: '20px', minHeight: 'calc(100vh - 125px)' }}>
                     <Grid container spacing={2}>
                                  <Grid size={12}>
                                  <Box sx={{ maxHeight: 520, overflowY: 'auto', overflowX: 'hidden'}}>
                                    <Grid container spacing={2}>
                                      <Grid size={12}>
                                        <Grid container spacing={2}>
                                          <Grid size={12}>
                                            <MaterialTable
                                              options={{
                                                headerStyle,
                                                maxBodyHeight: '300px',
                                                minBodyHeight: '400px',
                                                cellStyle,
                                                paging: false,
                                                search: false,
                                              }}
                                              columns={[
                                                { title: 'Date', 
                                                  render: (rowData) => {
                                                    return moment(rowData.date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY');
                                                  }
                                                },
                                                { title: 'Amount', field: 'amount' },
                                                { title: 'Location Name', 
                                                   render: (rowData) => {
                                                    return 'Main';
                                                  },
                                                 },
                                                {
                                                  title: 'Payment Type',
                                                  render: (rowData) => {
                                                    return 'Manual';
                                                  },
                                                },
                                              ]}
                                              data={getClaimtransaction}
                                              title='Transactions'
                                            />
                                          </Grid>
                                          <Grid size={12}>
                                            <Divider style={{ padding: '20px' }} />
                                            <Box mt={2}><Typography >Claims Timeline</Typography></Box>
                                           {Object.keys(getClaimtimeline).length  > 0 && <ClaimTimeline rowData={getClaimtimeline}/> }
                                          </Grid>
                                        </Grid>
                                      </Grid>
                                          </Grid>
                                      <Divider style={{ padding: '20px' }} />
                                    </Box>
                          
                                  </Grid>
                                 
                   </Grid>
                  </Card>
         </Grid>

         </Grid>
         </Card>


</Grid>
}
      <Grid>
               {paymentOpen && (
               <Grid style={{ padding: '30px 0px 0px 30px' }}>
                 <ClaimPayments
                   handleClose = {()=> {setPaymentOpen(false)}}
                   setPaymentOpen = {setPaymentOpen}
                   rowData = {props.rowData}
                 />
               </Grid>
             ) }
             </Grid>
    </div>
  );
}

function ClaimTimeline({rowData}) {
  console.log(rowData,'timelnsdataasa')
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
      title: 'Claim Requested',
      date: rowData.claimRequested,
    },
    {
      title: 'Claim Approved',
      date: rowData.claimApproved,
    }
  ];

  const data2 = rowData?.loanEntries?.map((transaction) => ({
    title: 'Claim Entry',
    date: transaction.loanEntry,
    isTransaction: true,
  }));

  const data3 = [
    {
      title: 'Claim Closed',
      date: rowData.closedDate,
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

export default ClaimsDetailPage
