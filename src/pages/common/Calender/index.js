import AppsContainer from '@crema/core/AppsContainer'
import { Dialog, Grid, IconButton, List, ListItemIcon, ListItemText, MenuItem, Tooltip, Typography } from '@mui/material'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { titleURL } from 'http-common'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet-async'
import { connect } from 'react-redux'
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined'
import TaskIcon from '@mui/icons-material/Task';
import { font14_500 } from 'utils/pageSize'
import PayrollCalender from './PayrollCalender'
import PayrollTask from './PayrollTask'
import { getsessionStorage } from 'pages/common/login/cookies'
import PosCalender from './PosCalendar'
import ReceivablesCalender from './ReceivablesCalendar'
import AddIcon from '@mui/icons-material/Add';
import ReminderForm from './ReminderForm'
import RemindersCalender from './RemindersCalender'
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import LoanDueCalendar from './LoanDueCalendar';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PayableCalender from './PosCalendar'
import CompanyLoanDueCalendar from './companyLoanDueCalendar'
import LeadsTasks from './LeadsTask'
import AssetsRenewals from './assetsRenewal'
import ReportSchedule from './reportSchedule'
import ScheduleIcon from '@mui/icons-material/Schedule';
import StactCalendar from './stactCalendar'
class CalenderSubMenus extends Component  {
    
    static contextType = CreateNewButtonContext

    constructor (props) {
        super(props)

        this.state = {
            listId: this.storage.company_type === 2 ? 3  : this.storage.company_type === 3 ? 7 :  this.storage.company_type === 10  ? 13 :  this.storage.company_type === 12 ? 16 : this.storage.company_type === 9 ? 17 : 1 ,
            toolbarHeight : document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70,
            windowHeight : window.innerHeight,
            open : false
        }

        this.handleCreate = this.handleCreate.bind(this);
    }

    storage = getsessionStorage()

    list = [
      ...(this.storage.company_type === 5 ? [
        { id: 1, name: 'Payroll' },
        { id: 11, name: 'Loan Dues'}
    ] : []),
        ...(this.storage.company_type === 11 ? [
            { id: 2, name: 'Task' }
        ] : []),
        ...(this.storage.company_type === 2 ? [
            { id: 3, name: 'Payables' },
            { id: 4, name: 'Receivables' },
            { id: 5, name: 'Manual Reminders' },
            { id: 6, name: 'Company Loan Dues'},
        ] : []),
        ...(this.storage.company_type === 3 ? [
            { id: 7, name: 'Payables' },
            { id: 8, name: 'Receivables' },
            { id: 9, name: 'Manual Reminders' },
            { id: 10, name: 'Company Loan Dues'},
            { id: 15, name: 'Report Schedule'}
        ] : []),
        ...(this.storage.company_type === 10 ? [
            { id: 13, name: 'Events' },
            { id: 14, name: 'Lead Task' }
        ] : []),
           ...(this.storage.company_type === 9 ? [
            { id: 17, name: 'Insurance' },
            { id: 18, name: 'Warranty' },
            { id: 19, name: 'Subscription' },
            { id: 20, name: 'Service Due' },
            { id: 21, name: 'Filings' },
            { id: 22, name: 'Audit' },
        ] : []),
    ];
    handleClick = (id) => {
        this.setState({listId : id})
    }

    getIconByName = (name) => {
        switch (name) {
            case 'Payroll' :
                return <ReceiptOutlinedIcon />
            
            case 'Task' :
                return <TaskIcon />

            case 'Payables' : 
                return <ScheduleSendIcon />

            case 'Receivables' : 
                return <CallReceivedIcon />

            case 'Manual Reminders' : 
                return <AccessAlarmsIcon />
            
            case 'Loan Dues' : 
                return <CreditScoreIcon />

            case 'Company Loan Dues' : 
                return <CreditScoreIcon />

                case 'Events' : 
                return <CreditScoreIcon />

            case 'Lead Task' : 
                return <CreditScoreIcon />

              case 'Report Schedule':
                return <ScheduleIcon />

              case 'Reminder':
                return <AccessAlarmsIcon />
            
        }
    }

    onGetMainComponent = () => {
        const { listId } = this.state

        console.log(listId,'listId')

        if(listId === 1) {
            return (
                <PayrollCalender />
            )
        }
        if(listId === 3 || listId === 7){
            return (
                <PayableCalender/>
            )
        }
        if(listId === 4 || listId === 8){
            return (
                <ReceivablesCalender/>
            )
        }
        if(listId === 5 || listId === 9){
            return (
                <RemindersCalender/>
            )
        }
        if(listId === 6 || listId === 10){
          return (
              <CompanyLoanDueCalendar/>
          )
      }
        if(listId === 11){
          return (
              <LoanDueCalendar/>
          )
      }
      if(listId === 13){
        return (
            <PayrollCalender/>
        )
    }
    if(listId === 14){
      return (
          <LeadsTasks/>
      )
  }
    if(listId  === 15){
      return (
        <ReportSchedule/>
      )
    }


    if(listId  === 16){
      return (
        <StactCalendar/>
      )
    }

  if(listId === 17 || listId === 18 || listId === 19 || listId === 20 || listId === 21 || listId === 22){
      return (
          <AssetsRenewals 
            type = {listId === 17 ? 'Insurance' : listId === 18 ? 'Warranty' : listId === 19 ? 'Subscription' : listId === 20 ? 'ServiceDue' : listId === 21 ? 'Filings' : 'Audit'}
          />
      )
  }
        else {
            return <PayrollTask />
        }
    }

    resizeWindow = () => {
        const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        this.setState({ toolbarHeight : dynamicToolbarHeight_val, windowHeight : window.innerHeight })
    } 

    componentDidMount() {
        this.resizeWindow()
        window.addEventListener("resize", this.resizeWindow)
        return () => window.removeEventListener("resize", this.resizeWindow)
    }

    handleCreate() {
        this.setState({ open: true });
    }

  render () {
    const session = getsessionStorage();
    console.log("session", session.subscription_type);
    console.log(this.state.listId,'opennnnn',this.list)
    return (
      <Grid>
        <Helmet>
          <meta charSet='utf-8' />
          <title>{titleURL} | Calender</title>
        </Helmet>



        <AppsContainer
          title='CalenderConfig'
          handleCreate ={this.handleCreate}
          reminder = {this.storage.company_type === 2 ? true : false}
          sxStyle={{
            height:
              parseInt(this.state.windowHeight) -
              parseInt(this.state.toolbarHeight),
          }}
          cardStyle={{
            height:
              parseInt(this.state.windowHeight) -
              parseInt(this.state.toolbarHeight) - 15,
          }}
          sidebarStyle={{
            height:
              parseInt(this.state.windowHeight) -
              parseInt(this.state.toolbarHeight) - 15,
          }}
          sidebarContent={
            this.list?.length > 1 && <Grid
              style={{marginTop: '40px', maxHeight: '60vh', overflow: 'auto'}}
            >
              <List>
                {this.list
                  .map((cal) => (
                    
                    <MenuItem
                      key={cal.id}
                      onClick={() => this.handleClick(cal.id)}
                      style={{
                        height: '40px',
                        backgroundColor:
                          this.state.listId === cal.id ? '#E6F4FB' : '',
                      }}
                      value={cal.name}
                    >
                      <ListItemIcon
                        color={this.state.listId === cal.id ? 'red' : '#000000'}
                      >
                        {this.getIconByName(cal.name)}
                      </ListItemIcon>
                      <ListItemText
                        sx={{
                          color: this.state.listId === cal.id ? '#0A8FDC' : '',
                        }}
                        primary={
                          <Typography
                            sx={{
                              fontWeight:
                                this.state.listId === cal.id ? '700' : '500',
                              fontSize: font14_500.fontSize,
                            }}
                          >
                            {cal.name}
                          </Typography>
                        }
                      />
                    </MenuItem>
                  ))}
              </List>
            </Grid>
          }
          children={this.onGetMainComponent()}
        ></AppsContainer>

        <Dialog open={this.state.open}>
          <ReminderForm handleClose={() => this.setState({open: false})} />
        </Dialog>
      </Grid>
    );
  }
}

export default connect()(CalenderSubMenus)