import { Box, Button, Card, Divider, Grid, IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import React, { useEffect, useState } from 'react';
import ListContacts from './ListContacts';
import LeadManagement from 'pages/crm/leadManagement';
import AccountsTimeline from './AccountsTimeline';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getLeadstaskCreationAction } from 'redux/actions/leads_task_actions';
import PropTypes from 'prop-types'
import { ActiveTotalLeadsAction } from 'redux/actions/leadManagement_actions';
import { TimelineComposer, TimelineFeed } from '../timeline';



	const AccountsDetail = (props) => {

    const [index,setIndex]=useState(null)
	    const[rowData, setRowData] = useState([])
	    const [customerId, setCustomerId] = useState(0)
	    const [tab, setTab] = useState(0)
	    const [timelineEvents, setTimelineEvents] = useState([
	      {
	        id: 'mock-1',
	        type: 'note',
	        entityType: 'account',
	        entityId: props?.rowData?.customer_id,
	        occurredAt: new Date().toISOString(),
	        payload: { note: 'Timeline foundation (mock) – add account notes here.' },
	      },
	    ])
    
    const dispatch = useDispatch()
    
    
    const {
      LeadsTaskReducer: {getTaskLeads},
      leadManagementReducers : {getAllAccounts, getActiveLeads}
    } = useSelector(state => state)

    useEffect(() => {
      if(getAllAccounts.length > 0) {
        const custIndex = getAllAccounts.findIndex((e) => e.customer_id === props.rowData.customer_id)
        setIndex(custIndex)
      }
    }, [props.rowData, getAllAccounts])

    const handlePrev =()=>{
      if(index >=1){
        setIndex(prev => prev - 1)
      }
    }
    
    const handleNext=()=>{
      setIndex(next => next + 1)
    }


	    useEffect(() => {
	      if(index !== null && getAllAccounts.length > 0) {
	        const accountData = getAllAccounts[index]
	        setRowData(accountData)
	        setCustomerId(accountData?.customer_id)
        const payload = {
          customerId : accountData?.customer_id
        }
        dispatch(ActiveTotalLeadsAction(payload))
	      }
	  }, [index, getAllAccounts])

	  const handleTabChange = (_, nextTab) => {
	    setTab(nextTab)
	  }

	  const handleCreateTimelineEvent = (event) => {
	    setTimelineEvents((prev) => [event, ...prev])
	  }

  return (
    <div >
      {/* <div style={{ display: 'flex' }}>
        <div style={{ marginLeft: 'auto' }}>
          <Grid container>
            <Grid>
              <Button
                onClick={() => props.handleClose()}
                variant="contained"
                color="inherit"
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </div>
      </div> */}
      <Grid container spacing={2} display='flex' justifyContent='flex-end'>
                  <Grid>
                      <Button onClick={() => props.handleClose()} variant="contained" color="inherit">
                          Back
                      </Button>
                  </Grid>
      
                  <Grid>
                      <Tooltip title='Previous'>
                          <IconButton color="primary"
                            disabled={index === 0} onClick={handlePrev}
                          >
                              <ArrowBackIosNewIcon />
                          </IconButton>
                      </Tooltip>
                  </Grid>
      
                  <Grid>
                  <Tooltip title='Next'>
                          <IconButton color="primary" 
                            disabled={getAllAccounts?.length === index + 1}
                            onClick={handleNext}
                          >
                              <ArrowForwardIosIcon />
                          </IconButton>
                      </Tooltip>
                      </Grid>
                  </Grid>
      <Box sx={{mt: 2}}>
        <Tabs value={tab} onChange={handleTabChange} variant='scrollable' scrollButtons='auto'>
          <Tab label='Overview' />
          <Tab label='Timeline' />
        </Tabs>

        <TabPanel value={tab} index={0}>
      <Card style={{padding: '30px', width: '100%', margin: '20px auto' }}>
	        <Grid container direction="column" spacing={2}>
	          <Typography variant="h5" fontWeight={'bold'} mb={'10px'}>Account Information</Typography>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Account Owner</Typography>
            <Typography>{rowData?.last_name ? `${rowData?.first_name} ${rowData?.last_name}` : rowData?.first_name}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>{'Industry'}</Typography>
            <Typography>{rowData?.company_industry ? rowData?.company_industry : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Employess</Typography>
            <Typography>{rowData?.no_of_employees ? rowData?.no_of_employees : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Phone </Typography>
            <Typography>{rowData?.company_phone_number ? rowData.company_phone_number : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Contact Name</Typography>
            <Typography>{rowData?.last_name ? `${rowData?.first_name} ${rowData?.last_name}` : rowData?.first_name}</Typography>
          </Grid>
	          </Grid>
	        </Card>

     
        <Card style={{ padding: '30px', width: '100%', margin: '20px auto', display: 'flex', justifyContent: 'space-between' }}>
          <Grid
            container
            direction="column"
            spacing={2}
            width={'350px'}
            size={{
              lg: 6,
              md: 6,
              sm: 6,
              xs: 12
            }}>
            <Typography variant="h5" fontWeight={'bold'} mb={'10px'}>Active Leads</Typography>
            {
                getActiveLeads.length > 0 ? 
                    getActiveLeads.map((e) => {
                        return (
                          <>
                            <Grid container justifyContent="space-between">
                                <Typography>{e.lead_Name || ''}</Typography>
                            </Grid>
                            <Grid container justifyContent="space-between">
                                <Typography >{e['Lead Stage'] || e['Lead Status'] || ''}</Typography>
                                <Typography>{moment(e.updatedAt).format('DD/MM/YYYY hh:mm A')}</Typography>
                            </Grid>
                          </>
                        );
                    })

                : (
                    <Grid display='flex' justifyContent='center'>
                        <Typography sx={{ color : 'grey' }}>
                            No Active Leads
                        </Typography>
                    </Grid>
                  )
            }
            
          </Grid>




          
          <Divider orientation="vertical" flexItem style={{ margin: '0 20px', width: '2px', backgroundColor: 'gray' }} />

          <Grid container width={'300px'} spacing={2} style={{ display: 'flex', alignItems: 'center' }}>
            <Grid color={"textSecondary"}>
              <AccountCircleIcon style={{ fontSize: '40px', color: 'grey' }} />
            </Grid>

            <Grid>
                <Grid mb={'10px'}>
            <Typography variant="h5" fontWeight={'bold'}>Contact Person</Typography>
          </Grid>
              <Box mt={1}>
                <Typography>{'Contact'}</Typography>
              </Box>
              <Box mt={1}>
                <Typography>at {rowData?.last_name ? `${rowData?.first_name} ${rowData?.last_name}` : rowData?.first_name}</Typography>
              </Box>
              <Box mt={1}>
                <Typography>
                  <PhoneIcon style={{ verticalAlign: 'middle', fontSize: '20px' }} /> {rowData?.phone_number}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
   

      <Card style={{ padding: '30px', width: '100%', margin: '20px auto', display: 'flex', justifyContent: 'space-between' }}>
        <Grid
          container
          direction="column"
          spacing={2}
          width={'350px'}
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Typography variant="h5" fontWeight={'bold'} mb={'10px'}>Account Information</Typography>
          {/* <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Name</Typography>
            <Typography>{rowData?.last_name ? `${rowData.first_name} ${rowData.last_name}` : rowData?.first_name}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>title</Typography>
            <Typography>{rowData?.salutation ? rowData?.salutation : '-'}</Typography>
          </Grid> */}
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Phone</Typography>
            <Typography>{rowData?.phone_number ? rowData.phone_number : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Email</Typography>
            <Typography>{rowData?.email ? rowData?.email : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Company Name</Typography>
            <Typography>{rowData?.company_name}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Company Website</Typography>
            <Typography>{rowData?.company_website ? rowData?.company_website : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Company Industry</Typography>
            <Typography>{rowData?.company_industry ? rowData?.company_industry : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Company Phone number</Typography>
            <Typography>{rowData?.company_phone_number ? rowData.company_phone_number : '-'}</Typography>
          </Grid>
        </Grid>

        <Grid
          container
          direction="column"
          spacing={2}
          width={'350px'}
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Typography variant="h5" fontWeight={'bold'} mb={'10px'}>Address Information</Typography>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Address</Typography>
            <Typography>{rowData?.address ? rowData.address : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>State</Typography>
            <Typography>{rowData?.state ? rowData.state : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>City</Typography>
            <Typography>{rowData?.city ? rowData.city : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Pin Code</Typography>
            <Typography>{rowData?.zip ? rowData.zip : '-'}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography color={"textSecondary"}>Country</Typography>
            <Typography>{rowData?.country}</Typography>
          </Grid>
        </Grid>
      </Card>

	    <div style={{ margin: '20px auto'}}>
	        <LeadManagement data={rowData?.customer_id} type = 'accoountDetails'/>
	    </div>
	      <div style={{ margin: '20px auto'}}>
	        <ListContacts data={rowData} rowData={props?.rowData} customer_id={rowData?.customer_id}type='list'/>
	      </div>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mt: 2}}>
            <TimelineComposer
              entityType='account'
              entityId={rowData?.customer_id}
              onCreate={handleCreateTimelineEvent}
            />
            <TimelineFeed events={timelineEvents} />
            <AccountsTimeline data={rowData?.customer_id} />
          </Box>
        </TabPanel>
      </Box>
    </div>
  );
	};

function TabPanel(props) {
  const { children, value, index } = props;
  if (value !== index) return null;
  return <Box sx={{pt: 2}}>{children}</Box>;
}

AccountsDetail.propTypes = {
  handleClose : PropTypes.func,
  data : PropTypes.object,
  index : PropTypes.number,
  length:PropTypes.number
}



export default AccountsDetail;
