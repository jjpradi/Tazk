import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Dialog,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material"
import OptionButton from 'components/erpDesign/actionButton'
	import { useContext, useEffect, useState } from "react"
	import { useLocation, useNavigate } from "react-router-dom"
	import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
	import LeadStatusCard from "./LeadDetailCards/LeadStatusCard"
	import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useDispatch, useSelector } from "react-redux"
import { additionalContactsAction, getAllLeadsAction, getLeadsmeetingAction, updateLeadStatusAction } from "redux/actions/leadManagement_actions"
import PropTypes from "prop-types"
	import TaskCreation from "pages/crm/LeadTask/TaskCreation"
	import MeetingsForm from "pages/crm/Meetings/MeetingsForm"
	import CallsForm from "pages/crm/Calls/CallsForm"
	import TemplatePickerDialog from "../templates/TemplatePickerDialog"
	import LeadStatusHistoryCard from "./LeadDetailCards/LeadStatusHistoryCard"
	import LeadForm from "./leadForm"
import ContactPerson from "./ContactPerson";
import LeadInfo from "./LeadInfo";
import LeadCard from "./LeadCard";
import { TimelineComposer, TimelineFeed } from "../timeline";
import { TimelineComposer as TimelineComposerMock, TimelineFeed as TimelineFeedMock } from "../timelineMock";
	import ProposalCard from "./LeadDetailCards/proposal"
	import CreateNewButtonContext from 'context/CreateNewButtonContext'
	import timelineApi from "../timeline/timelineApi"
	import whatsappServices from "services/whatsapp_services"
	import emailServices from "services/email_services"
	import callsServices from "services/calls_services"
	import leadsTaskServices from "services/leads_task_services"
	import meetingsServices from "services/meetings_services"
import leadHubApi from "./leadHubApi";
import LeadDealSummaryCard from "./LeadDealSummaryCard";
import LeadQuotationsTab from "./LeadQuotationsTab";
	//ContactPerson.js
	//LeadCard.js
	//LeadInfo.js

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.ERROR ||
  error?.message ||
  fallbackMessage

const formatDateTime = (value) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleString()
}

	function LeadDetails(props){

		    const dispatch = useDispatch()
		    const location = useLocation()
		    const navigate = useNavigate()
		    const isLeadsV2 = location.pathname.startsWith('/crm/leads-v2')

	    const[optionIndex, setOptionIndex] = useState(null)
		    const [tab, setTab] = useState(0)
		    const [templatesOpen, setTemplatesOpen] = useState(false)
		    const [whatsappOpen, setWhatsappOpen] = useState(false)
		    const [emailOpen, setEmailOpen] = useState(false)
	    const [timelineEvents, setTimelineEvents] = useState([])
	    const [timelineEventsV2, setTimelineEventsV2] = useState([])
	    const[index, setIndex] = useState(null)
	    const[rowData, setRowData] = useState([])
    const [dealSummaryState, setDealSummaryState] = useState({
      loading: false,
      error: '',
      data: null,
    })
    const [activityState, setActivityState] = useState({
      loading: false,
      error: '',
      calls: [],
      tasks: [],
      meetings: [],
    })

    const {
        leadManagementReducers : { allLeads }
    } = useSelector(state => state)
 const {
        setModalTypeHandler,
        setLoaderStatusHandler,
    } = useContext(CreateNewButtonContext)
    // useEffect(() => {
    //     setIndex(props.index)
    // }, [props.index])

    useEffect(() => { (async () => {
      if (props?.page) {
        const payload = {
          pageCount: 0,
          numPerPage: 10,
          searchString: '',
          fromDate: '',
          toDate: '',
          meeting: '1',
        };
        dispatch(
          getLeadsmeetingAction(payload, setModalTypeHandler, setLoaderStatusHandler),
        );
      } else {
        dispatch(getAllLeadsAction());
      }
      await dispatch(additionalContactsAction(props.index));
    })();
}, []);

    useEffect(() => {
        if(allLeads.length > 0) {
            const leadIndex = allLeads.findIndex((e) => e.lead_id === props.index)
            setIndex(leadIndex)
        }
    }, [allLeads])

    useEffect(() => { (async () => {
        if(index !== null && allLeads.length > 0 && index !== -1) {
            const leadData = allLeads[index]
            await setRowData(leadData)
        }
    })();
}, [index, allLeads])

    const handleLeadOptionChange = (option) => {
        if (option === 4) {
            handleNewQuotation()
            return
        }
        setOptionIndex(option)
    }

	    const handleTabChange = (_, nextTab) => {
	        setTab(nextTab)
	    }

	    const loadTimelineEvents = async (leadId) => {
	        if (!leadId) return
	        try {
	            const res = await timelineApi.list('lead', leadId, 100)
	            setTimelineEvents(res?.data?.items || [])
	        } catch (e) {
	            // keep existing UI behavior on failures
	        }
	    }

      const loadLeadActivities = async (leadId) => {
        if (!leadId) {
          setActivityState({
            loading: false,
            error: '',
            calls: [],
            tasks: [],
            meetings: [],
          })
          return
        }

        setActivityState((prev) => ({
          ...prev,
          loading: true,
          error: '',
        }))

        const listPayload = {
          searchString: '',
          pageCount: 0,
          numPerPage: 100,
          lead_id: leadId,
          fetchAll: true,
        }

        try {
          const [callsRes, tasksRes, meetingsRes] = await Promise.all([
            callsServices.getCallsAll(listPayload),
            leadsTaskServices.getTask(listPayload),
            meetingsServices.getMeetingsAll(listPayload),
          ])

          setActivityState({
            loading: false,
            error: '',
            calls: callsRes?.data?.data || [],
            tasks: tasksRes?.data?.data || [],
            meetings: meetingsRes?.data?.data || [],
          })
        } catch (error) {
          setActivityState({
            loading: false,
            error: getErrorMessage(error, 'Unable to load lead activity'),
            calls: [],
            tasks: [],
            meetings: [],
          })
        }
      }

	    const handlePrev = () => {
	        if(index >= 1){
	            setIndex(prevIndex => prevIndex - 1)
	        }
    }

    const handleNext = () => {
        setIndex(prevIndex => prevIndex + 1)
    }

    const updateLeadStatus = (data) => {
        dispatch(updateLeadStatusAction(data))
    }

    const loadLeadDealSummary = async (leadId) => {
      if (!leadId) {
        setDealSummaryState({
          loading: false,
          error: '',
          data: null,
        })
        return null
      }

      setDealSummaryState((prev) => ({
        ...prev,
        loading: true,
        error: '',
      }))

      try {
        const response = await leadHubApi.getLeadDealSummary(leadId)
        const summary = response?.data || null
        setDealSummaryState({
          loading: false,
          error: '',
          data: summary,
        })
        return summary
      } catch (error) {
        if (error?.response?.status === 404) {
          setDealSummaryState({
            loading: false,
            error: '',
            data: null,
          })
          return null
        }

        setDealSummaryState({
          loading: false,
          error: getErrorMessage(error, 'Unable to load deal summary'),
          data: null,
        })
        return null
      }
    }

    const openDealPage = (dealId) => {
      if (dealId) {
        navigate(`/crm/deals/${encodeURIComponent(String(dealId))}`)
        return
      }
      navigate('/crm/deals')
    }

    const openQuotationCreatePage = (dealId, leadId, customerId) => {
      const query = new URLSearchParams()

      if (dealId) query.set('deal_id', String(dealId))
      if (leadId) query.set('lead_id', String(leadId))
      if (customerId) query.set('customer_id', String(customerId))

      const queryString = query.toString()
      navigate(`/crm/quotation/new${queryString ? `?${queryString}` : ''}`)
    }

    const getConvertRoute = (leadId, nextPath) => {
      const query = new URLSearchParams()
      if (nextPath) query.set('next', nextPath)

      const queryString = query.toString()
      return `/crm/leads/${encodeURIComponent(String(leadId))}/convert${queryString ? `?${queryString}` : ''}`
    }

    const handleClose = async () => {
	        setOptionIndex(null)
        if (!rowData?.lead_id) return
        await Promise.all([
          loadTimelineEvents(rowData.lead_id),
          loadLeadActivities(rowData.lead_id),
        ])
	    }

    const convertedDealId = dealSummaryState?.data?.converted_deal_id
    const hasConvertedDeal = Boolean(dealSummaryState?.data?.converted && convertedDealId)

    const handleConvertToDeal = async () => {
      if (!rowData?.lead_id) return

      if (hasConvertedDeal) {
        openDealPage(convertedDealId)
        return
      }

      navigate(getConvertRoute(rowData.lead_id, '/crm/deals'))
    }

    const handleNewQuotation = async () => {
      if (!rowData?.lead_id) return

      if (hasConvertedDeal) {
        openQuotationCreatePage(convertedDealId, rowData.lead_id, rowData.customer_id)
        return
      }

      navigate(getConvertRoute(rowData.lead_id, '/crm/quotation/new'))
    }

		    const handleCreateTimelineEvent = async (event) => {
		        try {
		            await timelineApi.create(event)
		            await loadTimelineEvents(rowData?.lead_id)
		        } catch (e) {
		            setTimelineEvents((prev) => [event, ...prev])
		        }
		    }

		    const handleSendWhatsAppFromTemplate = async ({message, template, leadVars}) => {
		        const leadId = rowData?.lead_id
		        if (!leadId || !message) return

		        try {
		            await whatsappServices.send({
		                entityType: 'lead',
		                entityId: leadId,
		                to: leadVars?.phone,
		                message,
		                templateId: template?.template_id,
		                metadata: {templateName: template?.name},
		            })

		            setWhatsappOpen(false)
		            setTab(1)
		            await loadTimelineEvents(leadId)
		        } catch (e) {
		            // keep dialog open on failures
		        }
		    }

		    const handleSendEmailFromTemplate = async ({message, template, leadVars}) => {
		        const leadId = rowData?.lead_id
		        if (!leadId || !message) return

		        const subject = template?.name || `Follow up: ${leadVars?.leadName || ''}`.trim() || 'Follow up'

		        try {
		            await emailServices.send({
		                entityType: 'lead',
		                entityId: leadId,
		                to: leadVars?.email,
		                subject,
		                body: message,
		                templateId: template?.template_id,
		                metadata: {templateName: template?.name},
		            })

		            setEmailOpen(false)
		            setTab(1)
		            await loadTimelineEvents(leadId)
		        } catch (e) {
		            // keep dialog open on failures
		        }
		    }

    useEffect(() => {
      if (!rowData?.lead_id) {
        setDealSummaryState({
          loading: false,
          error: '',
          data: null,
        })
        return
      }

      loadLeadDealSummary(rowData.lead_id)
    }, [rowData?.lead_id])

    useEffect(() => {
      if (!rowData?.lead_id) {
        setActivityState({
          loading: false,
          error: '',
          calls: [],
          tasks: [],
          meetings: [],
        })
        return
      }

      loadLeadActivities(rowData.lead_id)
    }, [rowData?.lead_id])

		    useEffect(() => {
		        if (isLeadsV2) return
		        if (rowData?.lead_id) loadTimelineEvents(rowData.lead_id)
		    }, [rowData?.lead_id])

		    useEffect(() => {
		        if (!isLeadsV2) return
		        if (!rowData?.lead_id) return

		        const now = Date.now()
		        setTimelineEventsV2([
		            {
		                id: `mock-${rowData.lead_id}-status`,
		                type: 'status',
		                occurredAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
		                payload: { status: rowData?.['Lead Stage'] || rowData?.['Lead Status'] || 'Open' },
		            },
		            {
		                id: `mock-${rowData.lead_id}-call`,
		                type: 'call',
		                occurredAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
		                payload: { summary: 'Call logged (mock)' },
		            },
		            {
		                id: `mock-${rowData.lead_id}-meeting`,
		                type: 'meeting',
		                occurredAt: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
		                payload: { summary: 'Meeting scheduled (mock)' },
		            },
		            {
		                id: `mock-${rowData.lead_id}-quote`,
		                type: 'quote',
		                occurredAt: new Date(now - 1000 * 60 * 30).toISOString(),
		                payload: { summary: 'Quotation created (mock)' },
		            },
		            {
		                id: `mock-${rowData.lead_id}-note`,
		                type: 'note',
		                occurredAt: new Date(now - 1000 * 60 * 10).toISOString(),
		                payload: { note: 'Timeline foundation (mock) — add notes below.' },
		            },
		        ])
		    }, [isLeadsV2, rowData?.lead_id])

		    const handleAddNoteV2 = (note) => {
		        const leadId = rowData?.lead_id
		        if (!leadId) return
		        setTimelineEventsV2((prev) => [
		            {
		                id: `local-${leadId}-${Date.now()}`,
		                type: 'note',
		                occurredAt: new Date().toISOString(),
		                payload: { note },
		            },
		            ...prev,
		        ])
		    }

	
	    return(
	        <>
	        {
            optionIndex === null &&
            <>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
                    <Button onClick={() => props.handleClose()} variant="contained" color="inherit">
                        Back
                    </Button>
                    <Typography sx={{fontWeight: 600}}>Lead Hub</Typography>
                </Box>

	                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
	                    <Button variant="contained" onClick={() => handleLeadOptionChange(1)}>
	                        Create Task
	                    </Button>
                    <Button variant="contained" onClick={() => handleLeadOptionChange(2)}>
                        Log Call
                    </Button>
	                    <Button variant="contained" onClick={() => handleLeadOptionChange(3)}>
	                        Schedule Meeting
	                    </Button>
	                    <Button variant="contained" onClick={handleNewQuotation} disabled={!rowData?.lead_id}>
	                        New Quotation
	                    </Button>
	                    <Button variant="outlined" disabled={!rowData?.lead_id} onClick={handleConvertToDeal}>
	                        {hasConvertedDeal ? 'Open Deal' : 'Convert to Deal'}
	                    </Button>
	                    <Button variant="outlined" onClick={() => setTemplatesOpen(true)}>
	                        Templates
	                    </Button>
	                    <Button variant="contained" onClick={() => setWhatsappOpen(true)}>
	                        Send WhatsApp
	                    </Button>
	                    <Button variant="contained" onClick={() => setEmailOpen(true)}>
	                        Send Email
	                    </Button>
	
	                    <OptionButton
	                        checkType='Leads'
	                        handleLeadOptionChange={handleLeadOptionChange}
                    />

                    <Tooltip title='Previous'>
                        <span>
                            <IconButton color="primary" disabled={index === 0} onClick={handlePrev}>
                                <ArrowBackIosNewIcon />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title='Next'>
                        <span>
                            <IconButton color="primary" disabled={allLeads?.length === index + 1} onClick={handleNext}>
                                <ArrowForwardIosIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{mt: 2}}>
                <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                    <Tab label="Overview" />
                    <Tab label="Timeline" />
                    <Tab label="Tasks" />
                    <Tab label="Calls" />
                    <Tab label="Meetings" />
                    <Tab label="Quotations" />
                </Tabs>

                <TabPanel value={tab} index={0}>
                    <LeadStatusCard data={rowData} updateLeadStatus={updateLeadStatus} />
                    {dealSummaryState.loading ? (
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Loading deal summary...
                      </Typography>
                    ) : null}
                    {dealSummaryState.error ? (
                      <Typography color="error" sx={{ mb: 2 }}>
                        {dealSummaryState.error}
                      </Typography>
                    ) : null}
                    <LeadDealSummaryCard dealSummary={dealSummaryState.data} />
                    <LeadInfo data={rowData} />
                    <ContactPerson data={rowData} />
                    <LeadCard data={rowData} />
                    <ProposalCard data={rowData} />
                    <LeadStatusHistoryCard data={rowData} />
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {isLeadsV2 ? (
                            <>
                                <TimelineComposerMock onAddNote={handleAddNoteV2} />
                                <TimelineFeedMock events={timelineEventsV2} />
                            </>
                        ) : (
                            <>
                                <TimelineComposer
                                    entityType='lead'
                                    entityId={rowData?.lead_id}
                                    onCreate={handleCreateTimelineEvent}
                                />
                                <TimelineFeed events={timelineEvents} />
                            </>
                        )}
                    </Box>
                </TabPanel>

                <TabPanel value={tab} index={2}>
                    <ActivityList
                      loading={activityState.loading}
                      error={activityState.error}
                      emptyMessage='No tasks logged for this lead yet.'
                      rows={activityState.tasks}
                      renderTitle={(item) => item.subject || 'Task'}
                      renderMeta={(item) =>
                        `Due: ${formatDateTime(item.due_date)} | Status: ${item.status || '-'} | Priority: ${item.priority || '-'}`
                      }
                      renderBody={(item) => item.description || '-'}
                    />
                </TabPanel>

                <TabPanel value={tab} index={3}>
                    <ActivityList
                      loading={activityState.loading}
                      error={activityState.error}
                      emptyMessage='No calls logged for this lead yet.'
                      rows={activityState.calls}
                      renderTitle={(item) => item.subject || 'Call'}
                      renderMeta={(item) =>
                        `Start: ${formatDateTime(item.call_startTime)} | Type: ${item.call_type || '-'} | Status: ${item.call_status || '-'}`
                      }
                      renderBody={(item) => item.remarks || item.description || '-'}
                    />
                </TabPanel>

                <TabPanel value={tab} index={4}>
                    <ActivityList
                      loading={activityState.loading}
                      error={activityState.error}
                      emptyMessage='No meetings scheduled for this lead yet.'
                      rows={activityState.meetings}
                      renderTitle={(item) => item.name || 'Meeting'}
                      renderMeta={(item) =>
                        `From: ${formatDateTime(item.from_dateTime)} | To: ${formatDateTime(item.to_dateTime)}`
                      }
                      renderBody={(item) => item.description || '-'}
                    />
                </TabPanel>

                <TabPanel value={tab} index={5}>
                    <LeadQuotationsTab
                      dealSummary={dealSummaryState.data}
                      leadId={rowData?.lead_id}
                      onCreateQuotation={handleNewQuotation}
                    />
                </TabPanel>
            </Box>

        </>
        }
        
        <Dialog open={optionIndex === 1}>
            <TaskCreation type='details' data={rowData} handleClose={handleClose}/>
        </Dialog>
        <Dialog open={optionIndex === 2} >
            <CallsForm  type='details' data={rowData} handleClose={handleClose}/>
        </Dialog>
        <Dialog open={optionIndex === 3} fullWidth maxWidth='lg'>
            <MeetingsForm  type = 'edit' data={rowData} handleClose={handleClose}/>
        </Dialog>
	        <TemplatePickerDialog
	            open={templatesOpen}
	            onClose={() => setTemplatesOpen(false)}
	            leadRowData={rowData}
	        />
	        <TemplatePickerDialog
	            open={whatsappOpen}
	            onClose={() => setWhatsappOpen(false)}
	            leadRowData={rowData}
	            lockedChannel="whatsapp"
	            primaryActionLabel="Send WhatsApp"
	            onPrimaryAction={handleSendWhatsAppFromTemplate}
	        />
	        <TemplatePickerDialog
	            open={emailOpen}
	            onClose={() => setEmailOpen(false)}
	            leadRowData={rowData}
	            lockedChannel="email"
	            primaryActionLabel="Send Email"
	            onPrimaryAction={handleSendEmailFromTemplate}
	        />
	        
	        { optionIndex === 0 && <LeadForm type='edit' handleClose={() => props.handleClose()} data={rowData} leadId = {index} /> }
	        </>
	    )

}

function ActivityList({loading, error, emptyMessage, rows, renderTitle, renderMeta, renderBody}) {
    if (loading) {
        return (
            <Card variant='outlined' sx={{p: 2}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <CircularProgress size={18} />
                    <Typography color='text.secondary'>Loading...</Typography>
                </Box>
            </Card>
        )
    }

    if (error) {
        return (
            <Card variant='outlined' sx={{p: 2}}>
                <Typography color='error'>{error}</Typography>
            </Card>
        )
    }

    if (!Array.isArray(rows) || rows.length === 0) {
        return (
            <Card variant='outlined' sx={{p: 2}}>
                <Typography color='text.secondary'>{emptyMessage}</Typography>
            </Card>
        )
    }

    return (
        <Card variant='outlined' sx={{p: 2}}>
            <Stack spacing={1.5} divider={<Divider flexItem />}>
                {rows.map((item, idx) => (
                    <Box key={item?.id || item?.calls_id || item?.meetings_id || item?.task_id || item?.timeline_id || idx}>
                        <Typography sx={{fontWeight: 600}}>
                            {renderTitle?.(item)}
                        </Typography>
                        <Typography color='text.secondary' sx={{fontSize: 13, mt: 0.5}}>
                            {renderMeta?.(item)}
                        </Typography>
                        <Typography sx={{mt: 0.5}}>
                            {renderBody?.(item)}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Card>
    )
}

ActivityList.propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.string,
    emptyMessage: PropTypes.string,
    rows: PropTypes.array,
    renderTitle: PropTypes.func,
    renderMeta: PropTypes.func,
    renderBody: PropTypes.func,
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    if (value !== index) return null;

    return (
        <Box sx={{pt: 2}} role="tabpanel" {...other}>
            {children}
        </Box>
    );
}

LeadDetails.propTypes = {
    data: PropTypes.object,
    handleClose: PropTypes.func,
    index: PropTypes.number
}

export default LeadDetails
