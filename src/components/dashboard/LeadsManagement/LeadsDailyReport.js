import React, { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogContent, Grid, IconButton, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { LeadsDailyReportAction } from 'redux/actions/leadManagement_actions'
import { headerStyle, cellStyle, maxBodyHeight } from 'utils/pageSize'
import MaterialTable from 'utils/SafeMaterialTable'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { ExportCsv, ExportPdf } from '@material-table/exporters'
import CloseIcon from '@mui/icons-material/Close'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import {AdapterMoment as DateAdapter} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import toMomentOrNull from 'utils/DateFixer'

const LeadsDailyReport = (props) => {

    const dispatch = useDispatch()
    const currentDate = new Date().toISOString().split('T')[0]

    const [filterOpen, setFilterOpen] = useState(false)
    const [date, setDate] = useState(currentDate)
    const [showDate, setShowDate] = useState(currentDate)
    const [open, setOpen] = useState(true)
    const [page, setPage] = useState('initial')


    const {
        leadManagementReducers : { getLeadsDailyReport }
    } = useSelector((state) => state)

    // useEffect(() => {
    //     const payload = {
    //         date : currentDate
    //     }
    //     dispatch(LeadsDailyReportAction(payload))
    // }, [])

    const handleFilterOpen = () => {
        setFilterOpen(true)
    }

    const handleFilterClose = () => {
        setFilterOpen(false)
    }

    const handleDateChange = (selectedDate) => {
        const formattedDate = moment(selectedDate).format('YYYY-MM-DD')
        setDate(formattedDate)
    }

    const handleCancel = () => {
        setDate(currentDate)
        setShowDate(currentDate)
        setFilterOpen(false)
        const payload = {
            date : currentDate
        }
        dispatch(LeadsDailyReportAction(payload))
        setPage('initial')
    }

    const handleApply = (event) => {
        event.preventDefault()
        setShowDate(date)
        const payload = {
            date : date
        }
        dispatch(LeadsDailyReportAction(payload))
        setPage('filter')
        setFilterOpen(false)
    }

    useEffect(() => {
        if(props.mode === 'edit') {
            setOpen(false)
        }
        else {
            setOpen(true)
        }
    }, [props.mode])

    const columnDailyReports = [
        {
            field : 'createdAt',
            title : 'Date',
            render: (rowData) => moment(rowData.createdAt).format('DD-MM-YYYY'),
        },
        {
            field : 'leadOwner',
            title : 'Lead Owner',
        },
        {
            field : 'leads',
            title : 'Leads',
        },
        {
            field : 'openNotContactedLeads',
            title : 'Open'
        },
        {
            field : 'workingContactedLeads',
            title : 'Contacted'
        },
        {
            field : 'proposalSentLeads',
            title : 'Proposal Sent'
        },
        {
            field : 'quotationSentLeads',
            title : 'Quote Sent'
        },
        {
            field : 'negotiationLeads',
            title : 'Negotiation'
        },
        {
            field : 'closedConvertedLeads',
            title : 'Converted',
        },
        {
            field : 'closedNotConvertedLeads',
            title : 'Not Converted'
        },
    ]

  return (
      <>
          <style>
              {`
                  ::-webkit-scrollbar-button {
                      display : none
                  }
                  ::-webkit-scrollbar {
                      width : 10px
                  }
                  ::-webkit-scrollbar-thumb {
                      background-color : #888
                      border-radius : 10px
                  }
                  ::-webkit-scrollbar-thumb:hover {
                      background-color : #555
                  }
              `}
        </style>
          <MaterialTable
                  title = {
                      <Typography
                          variant = 'h6'
                          style = {{
                              padding : '5px',
                              paddingBottom : props.mode === 'edit' ? '23px' : '20px'
                          }}
                      >
                          {`Daily Report - ${moment(showDate).format('DD/MM/YYYY')}`}
                      </Typography>
                  }
                  columns = {columnDailyReports}
                  data = {page === 'initial' ? (props?.data || []) : getLeadsDailyReport}
                  options = {{
                      filtering : false,
                      actionsColumnIndex : -1,
                      paging : false,
                      search : false,
                      maxBodyHeight : '325px',
                      minBodyHeight : '325px',
                      headerStyle : headerStyle,
                      cellStyle : cellStyle,
                      exportButton : true,
                      exportMenu : [
                          {
                              label : 'Export CSV',
                              exportFunc : (cols, datas) => 
                                  ExportCsv(cols, datas, 'Leads Daily Report')
                          },
                          {
                              label : 'Export PDF',
                              exportFunc : (cols, datas) => 
                                  ExportPdf(cols, datas, 'Leads Daily Report')
                          }
                      ]
                  }}
                  actions = {[
                      {
                          icon : () => <FilterAltIcon />,
                          tooltip : 'Filter',
                          isFreeAction : true,
                          onClick : handleFilterOpen
                      },
                      {
                          icon : () => props.isEnabled ? <VisibilityOffIcon /> : <VisibilityIcon />,
                          isFreeAction : true,
                          hidden : open,
                          onClick : () => props.setCardClose()
                      }
                  ]}
              >
              </MaterialTable>
          {
              filterOpen && 
              <Dialog open = {filterOpen}>
                  <DialogContent sx={{ p : 5, width : '400px' }}>
                      
                      <Box sx={{ display : 'flex', justifyContent : 'flex-end' }}>
                          <IconButton onClick={() => handleFilterClose()}>
                              <CloseIcon />
                          </IconButton>
                      </Box>

                      <Grid
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <LocalizationProvider dateAdapter={DateAdapter}>
                              <DatePicker 
                                  label = 'Date'
                                  disableFuture = {true}
                                  value = {toMomentOrNull(date)}
                                  format='DD/MM/YYYY'
                                  onChange = {handleDateChange}
                                  slotProps={{ textField: { fullWidth: true, variant: 'filled', error: false } }}
                              />
                          </LocalizationProvider>
                      </Grid>

                      <Grid
                          sx={{ marginTop : '10px' }}
                          size={{
                              lg: 12,
                              md: 12,
                              sm: 12,
                              xs: 12
                          }}>
                          <Grid
                              container
                              spacing = {5}
                              display = 'flex'
                              justifyContent = 'center'
                          >
                              <Grid>
                                  <Button
                                      variant = 'contained'
                                      color = 'error'
                                      onClick = {handleCancel}
                                  >
                                      Clear
                                  </Button>
                              </Grid>

                              <Grid>
                                  <Button
                                      variant = 'contained'
                                      onClick = {handleApply}
                                      disabled = {date === ''}
                                  >
                                      Apply
                                  </Button>
                              </Grid>
                          </Grid>
                      </Grid>
                  </DialogContent>
              </Dialog>
          }
      </>
  );
}

export default LeadsDailyReport
