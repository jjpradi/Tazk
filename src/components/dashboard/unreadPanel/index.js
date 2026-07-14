import React, { Component } from 'react';
import { Grid, CardContent, Typography, Card, Button, List, Divider, Modal, Select, Switch } from '@mui/material';
import { connect } from 'react-redux';
import moment from 'moment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Box, ListItem } from '@mui/material';
import { Fonts } from '../../../shared/constants/AppEnums';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { listNotificationAction, updateNotificationAction, listunreadNtfyAction } from '../../../redux/actions/notification_actions'
import { getInboxAction, sendMsgAction, updateReadmsgAction, listUnreadAction } from '../../../redux/actions/message_actions';
import CreateNewButtonContext from 'context/CreateNewButtonContext';
import NoRecordFound from 'components/Layout/NoRecordFound';


class unread extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state = {
      from: firstDay,
      to: lastDay,
    };
    this.state = {
      open: false,
      update: true,
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      id: '',
      dialogId: '',
      page: 0,
      pageSize: 20,
      openDialog: false,
      closeDialog: '',
      invoiceData: {
        invoice: '',
        reason: '',
        status: '',
      }
    }
  }

  async componentDidMount() {
    const context = this.context;
    this.props.listunreadNtfyAction()
    this.props.listUnreadAction()
    // await this.props.getInboxAction(context.headerLocationId)
  }

  handleSubmit = async (id) => {
    const context = this.context;

    let data = { "active": "0" }
    await this.props.updateNotificationAction(id, data);
    this.props.listunreadNtfyAction()
  };

  handleClick = async (inbox_id) => {
    let data = { "active": "0" }
    await this.props.updateReadmsgAction(inbox_id, data)
    this.props.listUnreadAction()
  }


  handleClose = (id) => {
    this.setState({ open: false, dialog: false, delete: false });
  };

  render() {

    return (
      <Grid container spacing={5} style={{ display: 'flex', flexDirection: "row", height: '500%' }}>
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>

          {/* 
                            <Switch 
        open={this.state.open}
        onClose={() => this.handleClose(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        align='right'
      > */}
          <Card style={{ height: "20%" }}>
            <Grid container display={"flex"} flexDirection="row" alignItems={"center"} spacing={2} padding="5px">
              <Grid>
                <NotificationsActiveIcon
                  style={{}}
                  color='primary'
                />
              </Grid>
              <Grid>
                <Typography style={{ fontWeight: "bold", color: 'textSecondary' }}>
                  Unread Notifications
                </Typography>

              </Grid>
            </Grid>
            {this.props.unReaddata.length === 0 ?
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  padding: '220px 0px',
                  color: 'gray',
                }}
              >

                No Notifications Found

              </div>
              :
              <>
                {this.props.unReaddata.map(d =>


                  <CardContent>
                    <Grid container display={"flex"} flexDirection="row" justifyContent={"center"} >
                      <Grid
                        size={{
                          lg: 2
                        }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                          }}
                          alt='Sales'
                        //   src={item.image}
                        />
                      </Grid>

                      <Grid
                        size={{
                          lg: 9
                        }}>
                        <Box
                          sx={{
                            fontSize: 14,
                            color: (theme) => theme.palette.text.secondary,
                          }}
                        >

                          <Typography >

                            <Box
                              component='span'
                              sx={{
                                fontSize: 14,
                                fontWeight: Fonts.MEDIUM,
                                mb: 0.5,
                                color: (theme) => theme.palette.text.primary,
                                mr: 1,
                                display: 'inline-block',
                              }}
                            >


                              <Grid>

                                Title :  {d.title}
                              </Grid>
                              <Grid  >

                                Details :  {d.content_body}
                              </Grid>


                              <Grid>

                                Time :  {d.time}
                              </Grid>




                            </Box>

                          </Typography>
                        </Box>

                      </Grid>
                      <Grid
                        justifyContent="flex-end"
                        display={"flex"}
                        size={{
                          lg: 12
                        }}>
                        <Button
                          onClick={() => { this.handleSubmit(d.id) }}
                        >Mark as read</Button>
                      </Grid>
                    </Grid>
                    <Divider />

                  </CardContent>

                )}
              </>
            }
          </Card>
          {/* </Switch> */}
        </Grid>
        {/* //Unread message */}
        <Grid
          size={{
            lg: 6,
            md: 6,
            sm: 6,
            xs: 12
          }}>
          <Card style={{ height: "20%" }}>
            <Grid container display={"flex"} flexDirection="row" alignItems={"center"} spacing={2} padding="5px">
              <Grid>

                <MarkUnreadChatAltIcon
                  style={{}}
                  color='primary'
                />
              </Grid>
              <Grid>
                <Typography style={{ fontWeight: "bold", color: 'textSecondary' }}>
                  Unread Messages
                </Typography>
              </Grid>

            </Grid>

            {this.props.seenRead.length === 0 ?
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  padding: '220px 0px',
                  color: 'gray',
                }}
              >

                No Messages Found

              </div>
              :
              <>
                {this.props.seenRead.map(d =>


                  <CardContent>
                    <Grid container display={"flex"} flexDirection="row" justifyContent={"flex"} >
                      <Grid
                        size={{
                          lg: 2
                        }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                          }}
                          alt='Sales'
                        //   src={item.image}
                        />
                      </Grid>

                      <Grid
                        size={{
                          lg: 9
                        }}>
                        <Box
                          sx={{
                            fontSize: 14,
                            color: (theme) => theme.palette.text.secondary,
                          }}
                        >

                          <Typography >

                            <Box
                              component='span'
                              sx={{
                                fontSize: 14,
                                fontWeight: Fonts.MEDIUM,
                                mb: 0.5,
                                color: (theme) => theme.palette.text.primary,
                                mr: 1,
                                display: 'inline-block',
                              }}
                            >

                              {/* <Grid>
                                                                    Sender : {d.idsChattedWith_Name}
                                                                </Grid> */}
                              <Grid>

                                Message :  {d.latest_message}
                              </Grid>

                              <Grid>

                                Time :  {d.latest_message_timestamp}
                              </Grid>
                            </Box>

                          </Typography>
                        </Box>

                      </Grid>
                      <Grid
                        justifyContent="flex-end"
                        display={"flex"}
                        size={{
                          lg: 12
                        }}>
                        <Button
                          onClick={() => { this.handleClick(d.inbox_id) }}
                        >Mark as read</Button>
                      </Grid>
                    </Grid>
                    <Divider />

                  </CardContent>

                )}
              </>
            }
          </Card>
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    // paymentReceiptMonth: state.paymentReceiptReducer.paymentReceiptMonth || [],
    // paymentReceipTotalAmount:
    //   state.paymentReceiptReducer.paymentReceipTotalAmount || [],
    getnotificationdata: state.NotificationReducer.getnotificationdata || [],
    editntfydata: state.NotificationReducer.editntfydata || [],
    unReaddata: state.NotificationReducer.unReaddata || [],
    inboxList: state.messageReducer.inboxList || [],
    seenRead: state.messageReducer.seenRead || [],
    UnseenMsg: state.messageReducer.UnseenMsg || []
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // getPaymentReceiptMonthDataAction: (from, to) => {
    //   dispatch(getPaymentReceiptMonthDataAction(from, to));
    // },

    // getPaymentReceiptTotalAmountAction: () => {
    //   dispatch(getPaymentReceiptTotalAmountAction());
    // },
    listNotificationAction: () => {
      dispatch(listNotificationAction());
    },
    listunreadNtfyAction: () => {
      dispatch(listunreadNtfyAction());
    },
    updateNotificationAction: (id, data) => {
      dispatch(updateNotificationAction(id, data));
    },
    getInboxAction: (headerLocationId) => {
      dispatch(getInboxAction(headerLocationId));
    },
    updateReadmsgAction: (inbox_id, data) => {
      dispatch(updateReadmsgAction(inbox_id, data));
    },
    listUnreadAction: (data) => {
      dispatch(listUnreadAction(data));
    },


  };
};
export default connect(mapStateToProps, mapDispatchToProps)(unread);
