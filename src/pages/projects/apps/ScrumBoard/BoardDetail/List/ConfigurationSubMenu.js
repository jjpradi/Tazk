import AppsContainer from '@crema/core/AppsContainer'
import { Button, Dialog, Grid, IconButton, List, ListItemIcon, ListItemText, MenuItem, Tooltip, Typography } from '@mui/material'
import CreateNewButtonContext from 'context/CreateNewButtonContext'
import { titleURL } from 'http-common'
import React, { Component } from 'react'
import { Helmet } from 'react-helmet-async'
import { connect } from 'react-redux'
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined'
import TaskIcon from '@mui/icons-material/Task';
import { font14_500 } from 'utils/pageSize'
// import PayrollCalender from './PayrollCalender'
// import PayrollTask from './PayrollTask'
import { getsessionStorage } from 'pages/common/login/cookies'
// import PosCalender from './PosCalendar'
// import ReceivablesCalender from './ReceivablesCalendar'
// import AddIcon from '@mui/icons-material/Add';
// import ReminderForm from './ReminderForm'
// import RemindersCalender from './RemindersCalender'
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import BoardConfiguration from './CardDetail/BoardConfiguration'
class ConfigurationSubMenu extends Component  {
    
    static contextType = CreateNewButtonContext

    constructor (props) {
        super(props)

        this.state = {
            listId: this.storage.company_type === 2 ? 3 : 1,
            toolbarHeight : document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70,
            windowHeight : window.innerHeight,
            open : false
        }

        this.handleCreate = this.handleCreate.bind(this);
    }

    storage = getsessionStorage()

    list = [
      { id: 1, name: 'General' }
      // { id: 2, name: 'Columns' }
    ];
    handleClick = (id) => {
        this.setState({listId : id})
    }

    getIconByName = (name) => {
        switch (name) {
            case 'General' :
                return <ReceiptOutlinedIcon />
            
            case 'Columns' :
                return <TaskIcon />
        }
    }

    onGetMainComponent = () => {
        const { listId } = this.state

        if(listId === 1) {
            return (
              <>
                <BoardConfiguration id= {this.props.id}/>
              </>
            )
        }

    }

    resizeWindow = () => {
        const dynamicToolbarHeight_val = document.getElementsByClassName('MuiToolbar-root')[0]?.clientHeight || 70
        this.setState({ toolbarHeight : dynamicToolbarHeight_val, windowHeight : window.innerHeight })
    } 

    componentDidMount() {
        this.resizeWindow()
        window.addEventListener("resize", this.resizeWindow)
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeWindow)
    }

    handleCreate() {
        this.setState({ open: true });
    }

  render () {
    const session = getsessionStorage();
    return (
      <Grid>
        <Helmet>
          <meta charSet='utf-8' />
          <title>{titleURL} | Board Configuration</title>
        </Helmet>
        <Grid container  justifyContent="flex-end" mt={2}>
            <Grid>
                <Button variant='contained' onClick={()=> this.props.handleClose()}>Close</Button>
            </Grid>
        </Grid>
        <AppsContainer
          title='Board Configuration'
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
              parseInt(this.state.toolbarHeight),
          }}
          sidebarStyle={{
            height:
              parseInt(this.state.windowHeight) -
              parseInt(this.state.toolbarHeight),
          }}
          sidebarContent={
            <Grid
              style={{marginTop: '40px', maxHeight: '60vh', overflow: 'auto'}}
            >
              <List>
                {this.list
                  .filter(
                    (cal) =>
                      session.subscription_type === 4 || cal.name !== 'Task',
                  )
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
      </Grid>
    );
  }
}

export default connect()(ConfigurationSubMenu)