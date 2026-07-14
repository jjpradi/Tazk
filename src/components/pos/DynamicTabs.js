import React, {Component} from 'react';
import {Tabs, Tab, Grid, Button, Chip, Typography, Badge, ButtonGroup, Box, Avatar} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import _ from 'lodash';
import {
  ChangeTab,
  CreateTab,
  DeleteTab,
  enablePreOrder,
} from '../../redux/actions/pos_product_list';
import {Add, Remove, Sync} from '@mui/icons-material';
import ListAltIcon from '@mui/icons-material/ListAlt';
// import { withRouter } from "react-router-dom";
import withRouter from '../../utils/custWithRouter';
import CreateNewButtonContext from '../../context/CreateNewButtonContext';
import {FailLoad, ListLoad} from '../../redux/actions/load';
// import MuiAppBar from '@mui/material/AppBar';
import {PosLastSyncUpdate} from '../../redux/actions/pos_session';
import {createSalesPaymentAction} from '../../redux/actions/sales_actions';
import {ListPaymentModesAction} from '../../redux/actions/pos_session';
import {listCustomerAction} from '../../redux/actions/customer_actions';
import {toInteger} from 'lodash';
import SalesPlayLogo from '../../assets/user/Salesplay.png';
import TazkLogo from '../../assets/user/Tazk-logo-horizontal.svg';
import {hostURL} from '../../http-common';

import apiCalls from 'utils/apiCalls';


let time;

class CustomTabs extends Component {
  static contextType = CreateNewButtonContext;

  _isMounted = false;

  constructor(props) {
    super(props);

    // var today = new Date(),
    // time = today.getHours() + ':' + today.getMinutes() + ':' + + today.getSeconds();
    this.state = {
      value: 0,
      tabList: [
        {
          key: 0,
          id: 0,
          time: new Date().getHours() + ':' + new Date().getMinutes(),
        },
      ],
      name: 'Close',
      arrow: false,
      chips: false,
      didUpdate: true,
      posName: '',
      enablePreOrderTab: false,
    };
  }

  getTime = (time) => {
    var hourEnd = time.indexOf(':');
    var H = +time.substr(0, hourEnd);
    var h = H % 12 || 12;
    var ampm = H < 12 ? ' AM' : ' PM';
    time = h + time.substr(hourEnd, 3) + ampm;
    // document.write(time);
    return time;

    //  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    // if (time.length > 1) { // If time format correct
    //   time = time.slice(1); // Remove full string match value
    //   time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    //   time[0] = +time[0] % 12 || 12; // Adjust hours

    //  }
    //  return time.join(''); // return adjusted time or original string
  };

  addTab = async (newTab = '') => {
    await this.props.dispatch(enablePreOrder(false));
    await this.setState({enablePreOrderTab: false, arrow: true});
    this.setState((state, props) => {
      let tabList = _.cloneDeep(state.tabList);
      let id = tabList[tabList.length - 1].id + 1;

      tabList.push({
        key: id,
        id: id,
        time: new Date().getHours() + ':' + new Date().getMinutes(),
      });
      this.props.dispatch(
        CreateTab({id, tab_lists: tabList}, this.props.posId),
      );
      this.setState({value: id});
      return {
        tabList,
      };
    });
    if (newTab === 'NewTab') {
      this.props.setNewTabStatusForPreOrder(true);
    }
    this.setState({arrow: true});
    this.props.PreOrderListOpen(false)
  };

  addPreOrderTab = async () => {
    //createPreOrderTab

    if (this.props.pre_order_status === false) {
      await this.props.dispatch(enablePreOrder(true));
      await this.setState({
        value: 'PreOrder',
        enablePreOrderTab: true,
        arrow: true,
      });
    } else {
      await this.props.dispatch(enablePreOrder(false));
      await this.setState({enablePreOrderTab: false, arrow: true});
      await this.handleTabChange(
        'e',
        parseInt(this.props.tab_count.split('').pop()),
      );
    }
    this.props.PreOrderListOpen(false)
  };

  handleClose = () => {
    const context = this.context;
    this.setState({
      name: 'Confirm...',
    });
    setTimeout(() => {
      this.setState({
        name: 'Close',
      });
    }, 3000);

    if (this.state.name === 'Confirm...') {
      ListLoad(context.setModalTypeHandler, context.setLoaderStatusHandler);
      // this.setState({Load:'true'})
      this.autoClose();
      FailLoad(context.setModalTypeHandler, context.setLoaderStatusHandler);
      //this.setState({Load:'false'})
    }

    return () => {
      this.setState({name: ' '});
    };
  };

  autoClose = () => {
    this.props.history('/pointofsale/session');
  };

  deleteTab = (e) => {
    e.stopPropagation();
    this.setState({arrow: false});
    if (this.state.tabList.length === 1) {
      return;
    }
    if (this.state.value === 'PreOrder') {
      let loadPeak = this.state.tabList.reduce(
        (maxPeak, peak) => (!maxPeak || maxPeak.id < peak.id ? peak : maxPeak),
        0,
      );
      this.handleTabChange('e', loadPeak.id);
      this.props.dispatch(enablePreOrder(false));
      this.setState({enablePreOrderTab: false, arrow: true});
      return;
    }
    // let tabID = parseInt(e.target.id);
    // this.setState({removeId:this.state.tabList[value].id})
    let tabID = this.state.value;

    let tabIDIndex = 0;

    let tabList = this.state.tabList.filter((value, index) => {
      if (value.id === tabID) {
        tabIDIndex = index;
      }
      return value.id !== tabID;
    });

    this.setState(
      (state, props) => {
        let curValue = parseInt(state.value);
        if (curValue === tabID) {
          // Case 3:
          if (tabIDIndex === 0) {
            curValue = state.tabList[tabIDIndex + 1].id;
          }
          // Case 2:
          else {
            curValue = state.tabList[tabIDIndex - 1].id;
          }
        }
        this.props.dispatch(
          DeleteTab(
            {id: tabID, tab_lists: tabList, current_tab: curValue},
            this.props.posId,
          ),
        );
        // this.props.dispatch(ChangeTab(curValue))
        return {
          value: curValue,
        };
      },
      () => {
        this.setState({
          tabList: tabList,
        });
      },
    );
    this.props.PreOrderListOpen(false)
  };

  handleTabChange = (event, value) => {
    this.props.dispatch(ChangeTab(value, this.props.posId));
    this.setState({value});
    this.props.PreOrderListOpen(false)
  };

  getTab = [];
  changeTabList = (boo) => {
    if (
      JSON.stringify(this.getTab) !== JSON.stringify(this.props.tab_lists) &&
      this.state.didUpdate
    ) {
      const getVal = Number(this.props.tab_count.replace(/[^0-9]/g, ''));
      this.setState({
        tabList: [...this.props.tab_lists],
        value: getVal,
        didUpdate: boo,
      });
      this.getTab = [...this.props.tab_lists];
    }
  };

  componentDidUpdate(preProps, PreState) {
    this.changeTabList(false);

    //PreOrderConvertNewTab

    if (
      typeof preProps.PreOrderConvertData !== 'undefined' &&
      preProps.PreOrderConvertData !== this.props.PreOrderConvertData &&
      Object.keys(this.props.PreOrderConvertData).length > 0
    ) {
      this.addTab('NewTab');
    }

    return () => {
      this.changeTabList();
    };
  }

  resetTimer = () => {
    clearTimeout(time);
    time = setTimeout(this.autoClose, 3600000);
    // 1000 milliseconds = 1 second
  };

  componentDidMount() {
    this._isMounted = true;
    this.changeTabList(true);
    window.addEventListener('load', this.resetTimer);
    document.addEventListener('mousemove', this.resetTimer);
    document.addEventListener('keydown', this.resetTimer);
    const posName = this.props.pos_session.filter(
      (f) => f.posId === this.props.posId,
    );
    if (posName.length > 0) {
      this.setState({posName: posName[0].posName});
    }

    if (this.props.pre_order_status) {
      this.setState({value: 'PreOrder', enablePreOrderTab: true, arrow: true});
    }

    return () => {
      window.addEventListener('load', this.resetTimer);
      document.addEventListener('mousemove', this.resetTimer);
      document.addEventListener('keydown', this.resetTimer);
    };
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('load', this.resetTimer);
    document.removeEventListener('mousemove', this.resetTimer);
    document.removeEventListener('keydown', this.resetTimer);

    return () => {
      window.removeEventListener('load', this.resetTimer);
      document.removeEventListener('mousemove', this.resetTimer);
      document.removeEventListener('keydown', this.resetTimer);
    };
  }

  lastSyncUpdate = () => {
    // const newData = {lastSync: new Date().toTimeString().slice(0,8)}
    // const res = this.props.offlineData[`offline_${this.props.posId}`]?.data
    // if (res && window.navigator.onLine) {
    //     const newRes = res.filter(d=> !d.sync)
    //     this.props.dispatch(createSalesPaymentAction(res, this.context.setModalTypeHandler, this.context.setLoaderStatusHandler, this.props.posId, newRes, (isVal)=>{
    //         if(isVal){
    //             this.props.dispatch(PosLastSyncUpdate(this.props.s_id, newData,this.context.commoncookie,this.context.headerLocationId, this.context.setModalTypeHandler, this.context.setLoaderStatusHandler, (isVal, data)=>{
    //                 if(isVal){
    //                     var db = new DB('pos_session');
    //                     const obj = {...this.props.offlineData}
    //                     obj[`offline_${this.props.posId}`].data = data
    //                     this.props.setofflineData(obj)
    //                     db.deleteOfflineApi(this.props.posId, data)
    //                 }}))
    //         }}))

    this.props.lastSyncUpdate(this.props.posId, this.props.s_id);

    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.dispatch(
        ListPaymentModesAction(
          this.props.paymentRedirect,
          this.props.posId,
          true,
          this.context.setLoaderStatusHandler,
        ),
      ),
      this.props.dispatch(
        listCustomerAction(true, this.context.setLoaderStatusHandler),
      )
	  );

    // }
  };

  checkOfflines = () => {
    let valid = false;
    this.props.offlineData[`offline_${this.props.posId}`]?.data.forEach((d) => {
      if (!d.sync) {
        valid = true;
      }
    });
    return valid;
  };

  handlePreOrderList = async() => {
    if(this.props.preOrderListOpen){
      this.props.PreOrderListOpen(false)
      await this.props.dispatch(enablePreOrder(false));
      // this.props.dispatch(ChangeTab(this.state.value, this.props.posId));
      await this.handleTabChange(
        'e',
        parseInt(this.props.tab_count.split('').pop()),
      );
    }
    else{
      this.props.PreOrderListOpen(true)
      await this.props.dispatch(enablePreOrder(false));
      // this.props.dispatch(ChangeTab(this.state.value, this.props.posId));
      await this.setState({
        value: 'PreOrder',
        enablePreOrderTab: true,
        arrow: true,
      });
    }
  }

  render() {
    // const { classes } = this.props;
    const {value, posName, tabList} = this.state;
    // const {pos_session , posId} = this.props

    // const mapStateToProps = state => {
    //     pos_session = state.posSessionReducer
    // }

    const { theme } = this.props

    return (
      <>
        {/* <div>{this.state.count}</div> */}
        <Grid container alignItems='center' flex-start='center'>
          <Grid
            style={{display: 'flex', width: '100%'}}
            size={{
              xl: 12,
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <div style={{width: this.props.isTabSize ? 350 : 600, display: 'flex'}}>
              <img
                src={hostURL === 'erp.tazk.in' ? TazkLogo : TazkLogo}
                style={{
                  width: '35%',
                  height: '45px',
                  paddingLeft: '20px',
                  paddingTop: '5px',
                }}
                alt=''
              />

              <Box component='div' display='flex' alignItems='center' sx={{marginLeft: 'auto', marginRight: 10}}>
                <Avatar
                  sx={{
                    height: 30,
                    width: 30,
                  }}
                />
                <Typography
                variant='h9'
                  style={{
                    textColor: 'white',
                    marginLeft: 10,
                    fontSize: '13px'
                  }}
                >
                  {`${posName}`}
                </Typography>
              </Box>
            </div>

            <Tabs
              style={{width: 'calc(100% - 875px)', height: 50}}
              value={value}
              onChange={this.handleTabChange}
              indicatorColor='primary'
              textColor='inherit'
              variant='scrollable'
              scrollButtons={this.state.arrow === true ? 'auto' : false}
            >
              {this.state.tabList.map((tab, i) => (
                <Tab
                  style={
                    tab.id === value
                      ? {minWidth: '110px', borderRight: '1px solid white'}
                      : {minWidth: '40px', borderRight: '1px solid white'}
                  }
                  key={tab.key.toString()}
                  value={tab.id}
                  label={
                    <Badge
                      badgeContent={
                        tab.id === value
                          ? this.props.pre_order_tab
                            ? 0
                            : tab.id + 1
                          : tab.id + 1
                      }
                      color='primary'
                    >
                      {tab.id === value ? (
                        <Chip
                          style={{height: '20px', backgroundColor: '#e0e0e0'}}
                          label={
                            this.props.pre_order_tab
                              ? `P${tab.id + 1}`
                              : this.getTime(tab.time)
                          }
                        />
                      ) : (
                        ''
                      )}
                    </Badge>
                  }
                  // className='mytab'
                />
              ))}
              {/* {this.state.enablePreOrderTab && (
                <Tab
                  value={'PreOrder'}
                  label={
                    <Chip
                      style={{height: '20px', backgroundColor: '#e0e0e0'}}
                      label={'PreOrder'}
                    />
                  }
                />
              )} */}
              {/* <Button onClick = {this.addTab} variant="outlined" value="tabProperties" style={{background: 'green',color:'white',height:'50px', minWidth:40,width:50,borderRadius:'5px 0 0 5px'}}><Add/></Button> */}
            </Tabs>

            <ButtonGroup variant="text" color='primary'>
              <Button
                onClick={this.addTab}
                // variant='outlined'
                value='tabProperties'
                sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                
              >
                <Add />
              </Button>

              <Button
                onClick={this.deleteTab}
                // variant='outlined'
                value='tabProperties'
                
              >
                <Remove />
              </Button>
              
              {this.props.preOrderButtonEnable === 1 && (
                  <Button
                    onClick={this.addPreOrderTab}
                    variant={this.props.pre_order_status ? 'contained' : ''}
                    value='tabProperties'
                    sx={{fontSize: '13px'}}
                  >
                    PREORDER
                  </Button>
              )}

              {this.props.preOrderButtonEnable === 1 && (
                  <Button
                    onClick={this.handlePreOrderList}
                    variant={this.props.preOrderListOpen ? 'contained' : ''}
                    value='tabProperties'
                    sx={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    
                  >
                    <ListAltIcon />
                  </Button>
              )}
            </ButtonGroup>


            <div
              style={{
                margin: 'auto 0 auto auto',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography sx={{fontSize: '13px'}}>
                {this.props.lastSync
                  ? `Last Synced: ${this.props.lastSync}`
                  : ''}
              </Typography>
              <Badge
                variant={this.checkOfflines() ? 'dot' : 'standard'}
                color='primary'
              >
                <Sync
                  onClick={() => this.lastSyncUpdate()}
                  sx={{cursor: 'pointer'}}
                  color='action'
                />
              </Badge>

              <Button
                onClick={this.handleClose}
                variant='contained'
                value='tabProperties'
                style={{
                  marginLeft: 10,
                  color: 'white',
                  height: '40px',
                  width: 100,
                  backgroundColor: this.state.name === 'Confirm...' ? 'green' : 'red',
                  marginRight: 10,
                  boxShadow: 'none'
                }}
              >
                {this.state.name}{' '}
              </Button>
            </div>
          </Grid>

          {/* <Grid size={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1 }} style={{ paddingRight: '50px' }}
                    item
                >
                    
                </Grid> */}
        </Grid>
      </>
    );
  }
}

function CustomTabsWithTheme(props) {
  const theme = useTheme();
  return <CustomTabs {...props} theme={theme} />;
}

export default withRouter(CustomTabsWithTheme);
