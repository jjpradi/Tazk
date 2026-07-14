import React, {Component, createRef} from 'react';
import {connect} from 'react-redux';
import MaterialTable, { MTableBody, MTableToolbar } from 'utils/SafeMaterialTable';
import Cookies from 'universal-cookie';
import {
  listroleAction,
  listmoduleAction,
  createRoleAction,
  getPosPages,
  deleteRoleAction,
  getbyidRoleAction,
  updateRoleAction,
} from '../../../redux/actions/role_actions';
import {
  Autocomplete,
  TextField,
  Checkbox,
  Typography,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  DialogContentText,
  Grid,
  DialogTitle,
  IconButton,
  AppBar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  MenuItem,
  FormControlLabel,
  FormControl,
  Switch,
  DialogActions,
} from '@mui/material';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import HouseboatIcon from '@mui/icons-material/Houseboat';
import {
  getAllMailConfigurationAction,
  getByIdMailRoleConfigurationAction,
  updateMailRoleConfigurationAction,
  getAllSmsConfigurationAction,
  getByIdSmsRoleConfigurationAction,
  updateSmsRoleConfigurationAction,
  deleteSmsRoleConfigurationAction,
  searchMailState,
  setSearchSmsAction,
  searchMailAction,
  getSearchSmsAction,
  deleteMailRoleConfigurationAction
} from '../../../redux/actions/configuration_actions';
import { styled } from '@mui/material/styles';

// import Checkbox from '@mui/material/Checkbox';

import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {Modal, Box} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import _ from 'lodash';
import EditMailConfig from './editMailConfig';
import {
  getAppConfigDataAction,
  getAppConfigWithCompanyInfoAction
} from 'redux/actions/app_config_actions';
import SmsConfig from './smsConfig';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import { getsessionStorage } from 'pages/common/login/cookies';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle, font14_500 } from 'utils/pageSize';
import CommonSearch from 'utils/commonSearch';
import { mail_send } from 'utils/content';
import AppsContainer from '@crema/core/AppsContainer';
import SmsIcon from '@mui/icons-material/Sms';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CommonToolTip from 'components/ToolTip';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

import MapsUgcOutlinedIcon from '@mui/icons-material/MapsUgcOutlined';
import { titleURL } from 'http-common';
import TempList from 'components/whatsapp/tempList';
import {WhatsApp } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete'
import WhatsAppComponent from 'components/whatsapp';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PayRoll from './payroll';
import GeneralInfo from './genral';
import ViewAttPolicy from './viewAttPolicy';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import DisplaySettingsOutlinedIcon from '@mui/icons-material/DisplaySettingsOutlined';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import AddIcon from '@mui/icons-material/Add';
import { allListStockLocation } from 'redux/actions/stock_Location_actions';
import { CreateDepartment, department, ListDepartmentById, deleteDepartment, updateDepartment, setSearchDepartmentState } from 'redux/actions/departmentHead';

import StoreIcon from '@mui/icons-material/Store';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import DepartmentHead from 'pages/common/DepartmentHead';
import AssetWarranty from 'pages/assets/Assets/AssetWarranty';
import AssetConfig from 'pages/assets/Assets/AssetConfig';
import AssetTypeTable from 'pages/assets/Assets/AssetTypeTable';
import RequestConfig from 'pages/Payroll/requestConfig';
import LeavePolicy from './leavePolicy';
import ViewLeavePolicy from './viewLeavePolicy';
import DynamicProperty from 'pages/assets/DynamicProperties/index';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import Holidays from 'pages/Payroll/holiday/index';
import SpecialPermissions from 'pages/Payroll/SpecialPermission/index'
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import BiometricAttendance from './BiometricAttendance';
import GeneralInventory from './GeneralInventory';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ReminderConfiguration from './ReminderConfiguration';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import StatutorySettings from './StatutorySettings';
import ESISettings from './ESISettings';
import PTSettings from './PTSettings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import  "../../../index.css";
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout';
import DiscountChargesPreferencesDialog from '../../../components/DiscountChargesPreferencesDialog';
import RadarIcon from '@mui/icons-material/Radar';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import FraudLogsReport from 'pages/Payroll/FraudLogsReport/FraudLogsreport';
import DeviceRegisterReport from 'pages/Payroll/DeviceRegisterReport/DeviceRegisterReport';
import { findMenuByKey } from 'utils/menuTreeUtils';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';

// Component maps — imported from central registry
import { configMenuKeyToListId, listIdToConfigMenuKey, holidaysComponentMap } from 'utils/menuComponentRegistry';
import SalaryPercent from './SalaryPercent';

const RedditTextField = styled((props) => (
  <TextField slotProps={{ input: { disableUnderline: true, readOnly: true } }} {...props} />
))(({ theme }) => ({
  '& .MuiFilledInput-root': {
    border: '1px solid #e2e2e1',
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&.Mui-focused': {
      backgroundColor: 'transparent',
      boxShadow: `${theme.palette.primary.main} 0 0 0 2px`,
      borderColor: theme.palette.primary.main,
    },
  },
}));
class SmsMailConfiguration extends Component {
  static contextType = CreateNewButtonContext;
  
  storage = getsessionStorage()

hasConfigPermission = (menuKey, action) => {
  const selectedRole = this.storage?.role_name;
  const companyType = this.storage?.company_type;

  const allowedCompanyTypes = [2, 3, 9];

  if (!allowedCompanyTypes.includes(companyType)) return true;

  return UserRightsAuthorization(
    this.props.menuAccess?.[selectedRole],
    menuKey,
    action
  );
};


shouldShowMenu = (menuKey, restrictKey) => {
  const companyType = this.storage?.company_type;
  const rbacCompanyTypes = [2, 3, 9];

  if (rbacCompanyTypes.includes(companyType)) {
    return this.hasConfigPermission(menuKey, 'can_view');
  }

  return this.props.restrictUserLocationCreation?.[restrictKey] === "enable";
};

getConfigPermissions = (listId) => {
  const menuKey = listIdToConfigMenuKey[listId];
  if (!menuKey) return { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true };
  return {
    canView: this.hasConfigPermission(menuKey, 'can_view'),
    canCreate: this.hasConfigPermission(menuKey, 'can_create'),
    canEdit: this.hasConfigPermission(menuKey, 'can_edit'),
    canDelete: this.hasConfigPermission(menuKey, 'can_delete'),
    canExport: this.hasConfigPermission(menuKey, 'can_export'),
  };
};

  constructor(props) {
   
    super(props);
    this.addActionRef = createRef();
    this.cancelActionRef = createRef();
    
    
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      deleteType: '',
      disableData: ['Purchase Order', 'Sale Order'],
      id: '',
      row_id: {id: '', data: ''},
      add_click: false,
      setting: false,
      organizationdata: [],
      checkerror: {role_name: false},
      editModalOpen: false,
      selected_data: [],
      updated_notification: [],
      update_row_id: '',
      selData: [],
      editEmailOpen: false,
      editMailDialogOpen: false,
      editMailData: null,
      appConfigEmail: '',
      editSmsOpen: false,
      editSmsDialogOpen: false,
      editSmsData: null,
      editDepartment: false,
      searchValMail: '',
      searchPageDataMail: [],
      pageMail: 0,
      pageSizeMail: 5,
      searchDataMail: [],
      data: [],
      searchValSms: '',
      searchPageDataSms: [],
      pageSms: 0,
      pageSizeSms: 20,
      searchDataSms: [],
      isApiFinished: false,
      single: 'type:1',
      listId: 1,
      tabValue: '1',
      formValues: {
        company_privilegeLeave: '',
        company_privilegeLeaveCarryForward: 'false',
        company_privilegeLeaveMaxLimit: '',
        extra_pay_for_holiday: 'false',
        gps_attendance: '',
        company_enableLiveLocation: '',
        extra_pay_for_week_off: '',
        qr_attendance: '',
        wifi_attendance: '',
        selfie_attendance: '',
      },
      formErrors: {
        company_privilegeLeave: '',
        company_privilegeLeaveMaxLimit: '',
      },
      department_id: null,
      department_name: '',
      searchString: '',
      pageDepartment: 0,
      pageSizeDepartment: 5,
    };
    this.cookies = new Cookies();
  }

  

  async componentDidMount() {
    this.props.setSearchSmsAction([])
    const context = this.context;
    const roleName = this.storage?.role_name;

    // this.props.listroleAction(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // );
    // this.props.listmoduleAction();
    // this.props.listStockLocationAction();
    // this.props.getPosPages();
    let payloadMail = {pageCount: this.state.pageMail || 0, numPerPage:  this.state.pageSizeMail,searchStringValMail: ''} 

    let payloadSms = {pageCount: this.state.pageSms || 0, numPerPage:  this.state.pageSizeSms,searchStringValSms: ''}

     
    let dataDepartment = {pageCount: this.state.pageDepartment || 0, numPerPage:  this.state.pageSizeDepartment,searchString: '' }

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      await this.props.restrictNewCreationBasedOnPlanAction(),
      await this.props.getMenuAccessAction(roleName),
      await this.props.getAllMailConfigurationAction(context.setModalTypeHandler,context.setLoaderStatusHandler).finally(() => this.setState({isApiFinished: true})),
      await this.props.getAllSmsConfigurationAction(context.setModalTypeHandler,context.setLoaderStatusHandler),

      await this.props.getByIdMailRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler,payloadMail),
      await this.props.getByIdSmsRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler,payloadSms),
      // this.props.getAppConfigDataAction(context.setModalTypeHandler,context.setLoaderStatusHandler),

      await this.props.allListStockLocation(context.setModalTypeHandler,context.setLoaderStatusHandler),


      await this.props.department(context.setModalTypeHandler,context.setLoaderStatusHandler,dataDepartment),
    );
  }

  async componentDidUpdate(prevProps, prevState) {
    const context = this.context;

    // page size mail
    if (prevState.pageSizeMail !== this.state.pageSizeMail || prevState.pageMail !== this.state.pageMail) {

      const data = {pageCount: this.state.pageMail || 0, numPerPage: this.state.pageSizeMail, searchStringValMail: this.state.searchValMail}

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,

        this.props.getByIdMailRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler, data),
      );

    }

    // page size sms
    if (prevState.pageSizeSms !== this.state.pageSizeSms) {

      const data = {pageCount: this.state.pageSms || 0, numPerPage: this.state.pageSizeSms, searchStringValSms: this.state.searchValSms}

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getByIdSmsRoleConfigurationAction(context.setModalTypeHandler,context.setLoaderStatusHandler, data),
      );

    }

    //page mail
    // if (prevState.pageMail !== this.state.pageMail) {
      
    //   const data = {pageCount: this.state.pageMail || 0, numPerPage: this.state.pageSizeMail, searchStringValMail: this.state.searchValMail }

    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.getByIdMailRoleConfigurationAction(this.storage?.employee_id, context.setModalTypeHandler,context.setLoaderStatusHandler, data),
    //   );
    // }

    //page sms
    if (prevState.pageSms !== this.state.pageSms) {

      const data = {pageCount: this.state.pageSms || 0, numPerPage: this.state.pageSizeSms, searchStringValSms: this.state.searchValSms};

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getByIdSmsRoleConfigurationAction(context.setModalTypeHandler,context.setLoaderStatusHandler, data),
      );
    }


    //department


    if (prevState.pageDepartment !== this.state.pageDepartment) {

      let dataDepartment = {pageCount: this.state.pageDepartment || 0, numPerPage:  this.state.pageSizeDepartment,searchString: this.state.searchValDepartment}

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.department(context.setModalTypeHandler,context.setLoaderStatusHandler,dataDepartment)
      );
    }


  }

  handlePageChange = async (page, name) => {
    if(name === 'mail'){
      this.setState({pageMail: page});
    }

    else if(name === 'department')
      {
        this.setState({pageDepartment: page});      
      }
    else
    {
      this.setState({pageSms: page});
    }
  }

  handlePageSizeChange = async (size, name) => {
    if(name === 'mail'){
      this.setState({pageSizeMail: size});      
    }

    else if(name === 'department')
      {
        this.setState({pageSizeDepartment: size});      
      }
    else
    {
      this.setState({pageSizeSms: size});      
    }
  };

  // async UNSAFE_componentWillUpdate() {
  //   const context = this.context;
  
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.getAppConfigDataAction(context.setModalTypeHandler,context.setLoaderStatusHandler),
  //   );
  // }

  handleEdit = async (id) => {
    this.setState({
      open: true,
      row_id: {id: id.tableData.id, data: id},
      status: 'edit',
    });
  };
  handleCreate = async ({rowData, onRowDataChange}) => {
    this.setState({
      open: true,
      row_id: {data: rowData, onRowDataChange, id: rowData.tableData?.id},
      status: 'create',
    });
  };
  handleDelete = async () => {
    const context = this.context;
    const {id, pageSms, pageSizeSms, searchValSms} = this.state;

    if (!id) {
      this.setState({delete: false});
      return;
    }

    await this.props.deleteSmsRoleConfigurationAction(
      id,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );

    const payloadSms = {
      pageCount: pageSms || 0,
      numPerPage: pageSizeSms,
      searchStringValSms: searchValSms || '',
    };

    await this.props.getByIdSmsRoleConfigurationAction(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      payloadSms,
    );

    this.setState({delete: false, id: '', deleteType: ''});
  };
  handledialog = (id, type) => {
    this.setState({delete: true, id: id, deleteType: type});
  };

  handleDeleteClose = () => {
    this.setState({delete: false, id: '', deleteType: ''});
  };

  responseDialog = (res, resSeverity) => {
    this.setState({
      ...this.state.dialog,
      dialog: {msg: res, severity: resSeverity, open: true},
    });
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleOpen = (d) => {
    this.setState({selected_data: d.notifications});
    this.setState({open: true});
  };

  // sample = (value)=>{
  //   this.setState({open:value})
  // }
  //handleSubmit = async (data) => {
    // const values = data
    // for (let val in values) {
    //     if (values[val] === true) {
    //         values[val] = 'Y'
    //     }
    //     if (values[val] === false) {
    //         values[val] = 'N'
    //     }
    // }
    // if (data.id) {
    //   this.props.updateCustomerAction(data.id, data)
    //   await this.setState({ open: false })
    // } else {
    //   this.props.createCustomerAction(data)
    //   await this.setState({ open: false })
    // }
  //};

  checkboxonchange = (e) => {
    let {name, checked} = e.target;
    this.setState({setting: checked});
  };

  //handleChange = (e) => {
    // const { name, value } = e.target
    // this.setState({ tableProduct: { ...this.state.tableProduct, [name]: value } })
  //};

  handleEditModal = (d) => {
    // this.setState({update_row_id: d.row_id})
    this.setState({editModalOpen: true});
  };

  updatedNotifications = () => {
  };

  NotifyData = (data) => {
    let arr = [];
    const Filtering = !_.isEmpty(this.props.notification_role)
      ? this.props.notification_role.map((p) => {
          return arr.push(data.find((f) => f.notification_id === p.id));
        })
      : [];
    return arr;
  };

  handleEmailForm = () =>{
    this.setState({editEmailOpen: true}); 
    
 }
 handleSmsForm=()=>{
  this.setState({editSmsOpen: true}); 
  
}



handleEmailFormClose = () =>{
  const context = this.context;
  let payloadMail = {pageCount: this.state.pageMail || 0, numPerPage:  this.state.pageSizeMail,searchStringValMail: ''} 

  
  this.setState({editEmailOpen: false}); 
  this.props.getByIdMailRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler,payloadMail)
}

handleMailEditOpen = (rowData) => {
  this.setState({editMailDialogOpen: true, editMailData: rowData});
}

handleMailEditClose = () => {
  this.setState({editMailDialogOpen: false, editMailData: null});
}
handleSmsFormClose = ()=>{
  const context = this.context;
  let payloadSms = {pageCount: this.state.pageSms || 0, numPerPage:  this.state.pageSizeSms,searchStringValSms: ''}
  this.setState({editSmsOpen: false}); 
  this.props.getByIdSmsRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler,payloadSms)
}

handleSmsEditOpen = (rowData) => {
  this.setState({editSmsDialogOpen: true, editSmsData: rowData});
}

handleSmsEditClose = () => {
  this.setState({editSmsDialogOpen: false, editSmsData: null});
}

handleSmsEditSubmit = async (data) => {
  const context = this.context;
  const {editSmsData, pageSms, pageSizeSms, searchValSms} = this.state;

  if (!editSmsData?.id) return;

  await this.props.updateSmsRoleConfigurationAction(
    editSmsData.id,
    data,
    context.setModalTypeHandler,
    context.setLoaderStatusHandler,
    true
  );

  const payloadSms = {
    pageCount: pageSms || 0,
    numPerPage: pageSizeSms,
    searchStringValSms: searchValSms || ''
  };

  await this.props.getByIdSmsRoleConfigurationAction(
    context.setModalTypeHandler,
    context.setLoaderStatusHandler,
    payloadSms
  );
}
  
  cancelSearchMail = (e) => {
    this.setState({ searchValMail: '', pageMail : 0});
    this.props.searchMailState([])
    const context = this.context

      const data = {pageCount: this.state.pageMail || 0, numPerPage: this.state.pageSizeMail, searchStringValMail: '' }; 

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,

        this.props.getByIdMailRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler, data),
      );
  };

  requestSearchMail = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchValMail: val,pageMail: 0});

    // if(val.trim() !== ''){
      this.props.searchMailState([])
    // }
    const body = {
      searchStringValMail : val,
      pageCount: 0, 
      numPerPage:  this.state.pageSizeMail
    }
    this.props.searchMailAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        body
      )
  };




  

  cancelSearchSms = (e) => {
    this.setState({ searchValSms: '', pageSms : 0});
    this.props.setSearchSmsAction([])
    const context = this.context

      const data = {pageCount: this.state.pageSms || 0, numPerPage: this.state.pageSizeSms, searchStringValSms: ''};

      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,

        this.props.getByIdSmsRoleConfigurationAction( context.setModalTypeHandler,context.setLoaderStatusHandler, data),
      );
      // this.props.getAllSmsConfigurationAction(context.setModalTypeHandler,context.setLoaderStatusHandler)
      // this.props.getAppConfigDataAction(context.setModalTypeHandler,context.setLoaderStatusHandler)
  };

  requestSearchSms = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchValSms: val, pageSms: 0});

    // if(val.trim() !== ''){
      this.props.setSearchSmsAction([])
    // }
    const body = {
      searchStringValSms : val,
      pageCount: 0, 
      numPerPage:  this.state.pageSizeSms
    }
    this.props.getSearchSmsAction(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        body
      )
  };

   a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  typeMapping = {
                    '0': 'type:1',
                    '1': 'type:2',
                  }

  
  Change = (e) => {
  let value = e.target.value
    this.setState({single:value})
  }

  

  

  handleClick = (id) => {
    console.log("listId",id)
    this.setState({listId: id})

  }

  handleTabChange =(event, newValue) =>{
    this.setState({tabValue: newValue})

  }

  handleMailDelete = async() => {
    const context = this.context;
    const {id, pageMail, pageSizeMail, searchValMail} = this.state;

    if(!id) {
      this.setState({delete: false, deleteType: ''});
      return;
    }

    const payloadMail = {
      pageCount: pageMail || 0,
      numPerPage: pageSizeMail,
      searchStringValMail: searchValMail || '',
    };

    await this.props.deleteMailRoleConfigurationAction(
      id,
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
    );
    await this.props.getByIdMailRoleConfigurationAction(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      payloadMail,
    );

    this.setState({delete: false, id: '', deleteType: ''});
  }
  
 getIconByName = (name) => {
    switch (name) {
      case 'General':
        return <DisplaySettingsOutlinedIcon/>;
      case 'Payroll':
        return <ReceiptOutlinedIcon/>;
      case 'Attendance Policy':
        return <PlaylistAddCircleIcon/>;
      case 'Leave Policy':
        return <ViewTimelineIcon/>;
        case 'Holidays & Special Permissions':
        return <HouseboatIcon/>;
      case 'Approvals':
        return <RequestPageIcon/>;
      case 'Sms':
        return <SmsOutlinedIcon/>;
      case 'Mail':
        return <EmailOutlinedIcon/>;
      case 'Whatsapp':
        return <MapsUgcOutlinedIcon/>;
      case 'Custom Fields':
        return <DynamicFormIcon />            
      case 'Device  Attendance':
        return <FingerprintIcon />            
      case 'Reminder Settings':
        return <NotificationsActiveIcon />
      case 'Preferences':
        return <SettingsIcon />
      case 'EPF Settings':
        return <GavelIcon />
      case 'ESI Settings':
        return <HealthAndSafetyIcon />
      case 'PT Settings':
        return <AccountBalanceIcon />
      case 'Fraud Logs':
        return <RadarIcon />
      case 'Device Register Logs':
        return <AppRegistrationIcon />
      case 'Salary Structure Percentage':
        return <PriceCheckIcon />
    }
  };

  onGetMainComponent = () => {
    const { listId } = this.state;
    const perms = this.getConfigPermissions(listId);

    const smsCreate = this.hasConfigPermission('config__sms', 'can_create');
    const smsEdit = this.hasConfigPermission('config__sms', 'can_edit');
    const smsDelete = this.hasConfigPermission('config__sms', 'can_delete');

    const mailCreate = this.hasConfigPermission('config__mail', 'can_create');
    const mailEdit = this.hasConfigPermission('config__mail', 'can_edit');
    const mailDelete = this.hasConfigPermission('config__mail', 'can_delete');


    if (listId === 1 && this.storage.company_type === 2) {
      return (
        <GeneralInventory canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
      );
    } else if (listId === 1) {
      return (
        <>
          <PayRoll canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
        </>
      );
    } else if (listId === 2) {
      return (
        <>
          <GeneralInfo canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
        </>
      );
    }
    else if(listId === 13){
      return <StatutorySettings canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if(listId === 14){
      return <ESISettings canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if(listId === 16){
      return <PTSettings canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if(listId === 19 && this.storage.company_type === 5){
      return <SalaryPercent canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if(listId === 17){
      return <FraudLogsReport canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if(listId === 18){
      return <DeviceRegisterReport canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if(listId === 3){
      return <ViewAttPolicy canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }else if(listId === 4){

      return <ViewLeavePolicy canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else if (listId === 6) {
      // console.log(this.props.sms_role_config_count,this.state.pageSms, "page1" )
      return (
         <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 80px)',
            overflow:"auto",
            // '& .MuiPaper-root': {
            //   display: 'flex',
            //   flexDirection: 'column',
            //   flex: 1,
            //   boxShadow: 'none',
            //   border: 'none',
            // },
            // '& .MuiTableContainer-root': {
            //   flex: 1,
            //   display: 'flex',
            //   flexDirection: 'column',
            // },
            // '& .MuiTable-root': {
            //   display: 'flex',
            //   flexDirection: 'column',
            //   flex: 1,
            // },
            // '& .MuiTableBody-root': {
            //   flex: 1,
            //   '&.no-data-table .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root': {
            //     textAlign: 'center',
            //     padding: '48px 16px',
            //     fontSize: '16px',
            //     color: '#777',
            //   },

            // },
            // '& .MuiTablePagination-root': {
            //   borderTop: 'none',
            //   marginTop: 'auto',
            // },
            // '& .MuiToolbar-root': {
            //   borderBottom: 'none',
            // },
            // '& .MuiTableCell-root': {
            //   borderBottom: 'none',
            // },
            // '& .MuiTableRow-root:last-child .MuiTableCell-root': {
            //   borderBottom: 'none',
            // },
          }}
        >
        <MaterialTable
            className={
              this.props.sms_role_config?.length === 0 ? 'no-data-table' : ''
            }
           style={{ height: 'calc(100vh - 80px)',overflow:'hidden' }}  //overflow:'hidden'
          totalCount={this.props.sms_role_config_count}
          components={{
            ...stickyTableComponents,
            Body: (props) =>
              props.renderData && props.renderData.length > 0 ? (
                <MTableBody {...props} />
              ) : (
          <tbody>
           <tr>
           <td colSpan={props.columns.length}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "400px", 
                width: "100%",
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
              >
                No records to display
              </Typography>
            </Box>
          </td>
        </tr>
      </tbody>
          ),
            Toolbar: (props) => (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center',padding:'10px' }}>
                <div style={{ width: '100%' }}>
                  <MTableToolbar {...props} />
                </div>
                <div>
                  <CommonSearch
                    searchVal={this.state.searchValSms}
                    cancelSearch={this.cancelSearchSms}
                    requestSearch={this.requestSearchSms}
                  />
                 
                </div>
                {smsCreate && (
                <CommonToolTip title={'Edit'}>
                    <IconButton onClick={this.handleSmsForm}>
                      <AddIcon/>
                    </IconButton>
                  </CommonToolTip>
                  )}
              </div>
            ),
          }}
          options={getStickyTableOptions({
             headerStyle: this.state.headerStyle,
            cellStyle: this.state.cellStyle,
            bodyOffset: 200,
            options:{
              showEmptyDataSourceMessage: this.state.isApiFinished,
            search: false,
            paging: true,
            pageSize: this.state.pageSizeSms,
            pageSizeOptions : [20, 50, 100],
            actionsColumnIndex: -1,
            maxBodyHeight:maxBodyHeight,
            minBodyHeight:maxBodyHeight,
            emptyRowsWhenPaging: false,
            tableLayout: "auto",
            toolbar: true,
            }
          })}
          actions={[
          ...(smsEdit ? [rowData => ({
            icon: () => <EditIcon />,
            tooltip: 'Edit',
            onClick: (event, rowData) => {
              this.handleSmsEditOpen(rowData);
            }
           })] : []),
          ...(smsDelete ? [rowData => ({
            icon: () => <DeleteIcon />,
            tooltip: 'Delete',
            onClick: (event, rowData) => {
              this.handledialog(rowData.id, 'sms');

              // setNew
            }
           })] : []),
          ]}
          page={this.state.pageSms}
          onPageChange={(page) => this.handlePageChange(page, 'sms')}
          onRowsPerPageChange={(size) => this.handlePageSizeChange(size, 'sms')}
          columns={[
            {
              title: 'Url',
              field: 'url',
            },
            {
              title: 'Header',
              field: 'header',
            },
            {
              title: 'Token',
              field: 'token',
            },
            {
              title: 'Location',
              field: 'location_name',
            }
          ]}
          data={this.props.sms_role_config}
          title={
            <Typography className='page-title'>
              SMS Configuration
              
              <SmsConfig
                SmsOpen={this.state.editSmsOpen}
                handleClose={this.handleSmsFormClose}
                app_config_data={this.props.app_config_data}
                pageSizeSms={this.state.pageSizeSms} 
                onSubmitSuccess={this.handleSmsFormClose} 
              />
              <SmsConfig
                SmsOpen={this.state.editSmsDialogOpen}
                handleClose={this.handleSmsEditClose}
                app_config_data={this.props.app_config_data}
                pageSizeSms={this.state.pageSizeSms}
                mode='edit'
                initialValues={{
                  url: this.state.editSmsData?.url,
                  header: this.state.editSmsData?.header,
                  token: this.state.editSmsData?.token,
                  location_id: this.state.editSmsData?.location_id,
                  location_name: this.state.editSmsData?.location_name,
                }}
                onSubmit={this.handleSmsEditSubmit}
                onSubmitSuccess={this.handleSmsEditClose}
                submitLabel='Update'
              />
            </Typography>
          }
        />
        </Box>
      );
    } 
    else if (listId === 7) {
      // console.log(this.props.mail_role_config_count,this.state.pageMail, "page")
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 100px)',
            overflow:'auto',
            // '& .MuiPaper-root': {
            //   display: 'flex',
            //   flexDirection: 'column',
            //   flex: 1,
            //   boxShadow: 'none',
            //   border: 'none',
            // },
            // '& .MuiTable-root': {
            //   flex: 1,
            //   display: 'flex',
            //   flexDirection: 'column',
            // },
            // '& .MuiTableBody-root': {
            //   flex: 1,
            // },
            // '& .MuiTablePagination-root': {
            //   borderTop: 'none',
            //   marginTop: 'auto',
            // },
            // '& .MuiToolbar-root': {
            //   borderBottom: 'none',
            // },
            // '& .MuiTableCell-root': {
            //   borderBottom: 'none',
            // },
            // '& .MuiTableRow-root:last-child .MuiTableCell-root': {
            //   borderBottom: 'none', 
            // },
          }}
        >
        <MaterialTable
         style={{height: 'calc(100vh - 80px)',overflow:'hidden'}} 
          totalCount={this.props.mail_role_config_count}

          components={{
            ...stickyTableComponents,
            Body: (props) =>
              props.renderData && props.renderData.length > 0 ? (
                <MTableBody {...props} />
              ) : (
          <tbody>
           <tr>
           <td colSpan={props.columns.length}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "400px", 
                width: "100%",
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
              >
                No records to display
              </Typography>
            </Box>
          </td>
        </tr>
      </tbody>
      ),
            Toolbar: (props) => (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center'}}> 
                <div style={{ width: '100%' }}>
                  <MTableToolbar {...props} />
                </div>
                <div>
                  <CommonSearch
                    searchVal={this.state.searchValMail}
                    cancelSearch={this.cancelSearchMail}
                    requestSearch={this.requestSearchMail}
                  />
                </div>
                {mailCreate && (
                <CommonToolTip title={'Edit'}>
                  <IconButton onClick={this.handleEmailForm}>
                  <AddIcon/>
                  </IconButton>
                </CommonToolTip>
                )}
                <EditMailConfig
                  setAppConfigEmail={(e) => this.setState({ appConfigEmail: e })}
                  open={this.state.editEmailOpen}
                  handleClose={this.handleEmailFormClose}
                  app_config_data={this.props.app_config_data}
                />
                <EditMailConfig
                  open={this.state.editMailDialogOpen}
                  handleClose={this.handleMailEditClose}
                  app_config_data={this.props.app_config_data}
                  mode='edit'
                  initialValues={{
                    id: this.state.editMailData?.id,
                    host: this.state.editMailData?.host,
                    port: this.state.editMailData?.port,
                    fromMail: this.state.editMailData?.fromMail,
                    fromname: this.state.editMailData?.fromname,
                    fromPassword: this.state.editMailData?.fromPassword,
                    frombcc: this.state.editMailData?.backgroundColorcc,
                    secure: this.state.editMailData?.secure,
                    location_id: this.state.editMailData?.location_id,
                    location_name: this.state.editMailData?.location_name,
                  }}
                  onSubmitSuccess={this.handleMailEditClose}
                  submitLabel='Update'
                />
              </div>
            ),
          }}
      // editable={{
      //         onRowUpdate: (newData, oldData) => {
      //           return this.props
      //             .updateMailRoleConfigurationAction(
      //               oldData.id,
      //               newData,
      //               this.context.setModalTypeHandler,
      //               this.context.setLoaderStatusHandler
      //             )
      //             .then(() => {
      //               const payloadMail = {
      //                 pageCount: this.state.pageMail || 0,
      //                 numPerPage: this.state.pageSizeMail,
      //                 searchStringValMail: this.state.searchValMail || ''
      //               };

      //               return this.props.getByIdMailRoleConfigurationAction(
      //                 this.context.setModalTypeHandler,
      //                 this.context.setLoaderStatusHandler,
      //                 payloadMail
      //               );
      //             });
      //         }
      //       }}
          options={getStickyTableOptions({
             headerStyle: this.state.headerStyle,
              bodyOffset: 200,
            cellStyle: this.state.cellStyle,
            options:{
               showEmptyDataSourceMessage: this.state.isApiFinished,
            search: false,
            paging: true,
            pageSize: 20,
            actionsColumnIndex: -1,
            tableLayout: 'auto',
            emptyRowsWhenPaging: false,
            maxBodyHeight:maxBodyHeight,
            minBodyHeight:maxBodyHeight,
            // tableLayout: "auto",
            toolbar: true,
           }
          })}
          actions={[
             ...(mailEdit  ? [rowData => ({
              icon: () => <EditIcon />,
              tooltip: 'Edit',
              onClick: (event, rowData) => {
                this.handleMailEditOpen(rowData);
              },
            })] : []),

           ...(mailDelete  ? [rowData => ({
            icon: () => <DeleteIcon />,
            tooltip: 'Delete',
            onClick: (event, rowData) => {
              this.handledialog(rowData.id, 'mail');

              // setNew
            },
           })] : []),
          ]}
          page={this.state.pageMail}
          onPageChange={(page) => this.handlePageChange(page, 'mail')}
          onRowsPerPageChange={(size) => this.handlePageSizeChange(size, 'mail')}
          columns={[
            {
              title: 'Host',
              field: 'host',
              
            },
            {
              title: 'Port',
              field: 'port',
              
            },
            {
              title: 'FromMail',
              field: 'fromMail',
              
            },
            {
              title: 'Fromname',
              field: 'fromname',
              
            },
            {
              title: 'FromPassword',
              field: 'fromPassword',
              
            },
            {
              title: 'Bcc',
              field: 'bcc',
              
            },
            {
              title: 'LocationName',
              field: 'location_name',

              }

           
          ]}
          data={this.props.mail_role_config}
          title={
            <Typography className='page-title'>
              {`Mail Configuration${this.state.appConfigEmail ? ` - ${this.state.appConfigEmail}` : ''}`}
              
            </Typography>
          }
        />
        </Box>
      );
    } 

    else if(listId === 9){
      return (
        <BiometricAttendance canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
      )
    }


   else if (listId === 5) {

      return (
        <RequestConfig canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
      )

    }

  else if(listId === 10){

    return <DynamicProperty canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
  }

  else if(listId === 15){

    return <ReminderConfiguration canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
  }
  else if(listId === 11){
    // DB-driven tabs from menu tree (holidays__list, holidays__special_permissions)
    const holidaysMenu = findMenuByKey(this.props.navigationMenus, 'config__holidays');
    const holidayTabs = holidaysMenu?.children?.filter(c => holidaysComponentMap[c.id]) || [];
    const activeHolidayTab = holidayTabs[parseInt(this.state.tabValue) - 1] || holidayTabs[0];
    const ActiveHolidayComponent = activeHolidayTab ? holidaysComponentMap[activeHolidayTab.id] : null;

    return (
      <TabContext value={this.state.tabValue}>
        {holidayTabs.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={this.handleTabChange}>
              {holidayTabs.map((tab, idx) => (
                <Tab key={tab.id} label={tab.messageId} value={String(idx + 1)} />
              ))}
            </TabList>
          </Box>
        )}
        {holidayTabs.map((tab, idx) => {
          const Comp = holidaysComponentMap[tab.id];
          return Comp ? <TabPanel key={tab.id} value={String(idx + 1)}><Comp canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} /></TabPanel> : null;
        })}
      </TabContext>
    )
  }
    else if(listId === 12){
      return <DiscountChargesPreferencesDialog canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />
    }
    else {
      return <WhatsAppComponent canCreate={perms.canCreate} canEdit={perms.canEdit} canDelete={perms.canDelete} canExport={perms.canExport} />;
    }
  };

  
  render() {

   // DB-driven: build sidebar list from bootstrap menu tree children
   // Children arrive pre-sorted by sort_order from the bootstrap API
const list = [
    (this.shouldShowMenu('config__general', 'general') &&
      { id: 1, name: 'General' }
    ),
    (this.shouldShowMenu('config__preferences', 'preferences') &&
      { id: 12, name: 'Preferences' }
    ),
    (this.shouldShowMenu('config__payroll', 'payroll') &&
      { id: 2, name: 'Payroll' }
    ),
    (this.shouldShowMenu('config__epf', 'payroll') &&
      { id: 13, name: 'EPF Settings' }
    ),
    (this.shouldShowMenu('config__esi', 'payroll') &&
      { id: 14, name: 'ESI Settings' }
    ),
    (this.shouldShowMenu('config__pt', 'payroll') &&
      { id: 16, name: 'PT Settings' }
    ),
    (this.shouldShowMenu('config__salary_structure_percentage', 'payroll') && this.storage.company_type === 5 &&
      { id: 19, name: 'Salary Structure Percentage' }
    ),
    (this.shouldShowMenu('config__attendance_policy', 'attendancePolicy') &&
      { id: 3, name: 'Attendance Policy' }
    ),
    (this.shouldShowMenu('config__leave_policy', 'leavePolicy') &&
      { id: 4, name: 'Leave Policy' }
    ),
    (this.shouldShowMenu('config__holidays', 'holidayAndPermission') &&
      { id: 11, name: 'Holidays & Special Permissions' }
    ),
    (this.shouldShowMenu('config__approvals', 'approvals') ?
      { id: 5, name: 'Approvals' } : null
    ),
    (this.shouldShowMenu('config__fraud_logs', 'fraudlogs') &&
      { id: 17, name: 'Fraud Logs' }
    ),
    (this.shouldShowMenu('config__device_register', 'deviceregisterreport') &&
      { id: 18, name: 'Device Register Logs' }
    ),
    (this.shouldShowMenu('config__custom_fields', 'customFields') &&
      { id: 10, name: 'Custom Fields' }
    ),
    (this.shouldShowMenu('config__sms', 'smsIntegration') ?
      { id: 6, name: 'Sms' } : null
    ),
    (this.shouldShowMenu('config__mail', 'emailIntegration') &&
      { id: 7, name: 'Mail' }
    ),
    (this.shouldShowMenu('config__whatsapp', 'whatsappIntegration') &&
      { id: 8, name: 'Whatsapp' }
    ),
    (this.shouldShowMenu('config__reminder', 'reminderSettings') &&
      { id: 15, name: 'Reminder Settings' }
    ),
    (this.shouldShowMenu('config__device_attendance', 'deviceAttendance') &&
      { id: 9, name: 'Device  Attendance' }
    ),
    ]

    // console.log(this.state.tabValue,'listtttt',this.state.listId)
    console.log(this.props.restrictUserLocationCreation,'restrictUserLocationCreation')
    // console.log("listlist",this.list);
    
    // console.log(this.storage.subscription_type === 4,'restrictUserLocationCreation')
    
    return (
      <Grid>
        <Helmet>
        <meta charSet='utf-8' />
        <title>{titleURL} | Preferences </title>
      </Helmet>
        <AppsContainer
          title='AppCofighg'
          sxStyle={{height: "100%"}} 
          cardStyle={{height: 'calc(100vh - 80px)'}}
          sidebarStyle={{height: 'calc(100vh - 80px)'}}
          sidebarContent={
            <Grid style={{marginTop:'40px', maxHeight: '60vh', overflow: 'auto'}}>
               <List>
               {list
  // Filter out falsy entries
  .filter(l => l).filter(l => {
    if (this.props.pageType === 'detailpage') {
      return ['general', 'payroll', 'attendance policy', 'leave policy'].includes(l.name.toLowerCase());
    }
    return true;
  })
  // Map over the filtered array
  .map((l) => (
    <MenuItem key={l.id} onClick={() => this.handleClick(l.id)} style={{ height: '40px', backgroundColor: this.state.listId === l.id ? '#E6F4FB':''}} value={l.name}>
      <ListItemIcon color={this.state.listId === l.id ? 'red':'#000000'}>
        {this.getIconByName(l.name)}
      </ListItemIcon>
      <ListItemText sx={{ color: this.state.listId === l.id ? '#0A8FDC' : '' }} primary={<Typography sx={{ fontWeight: this.state.listId === l.id ? '700' : '500' , fontSize: '13px' }}>
        {l.name}
      </Typography>} />
    </MenuItem>
  ))}
            </List>
           </Grid>
          }
          // eslint-disable-next-line react/no-children-prop
          children={this.onGetMainComponent()}
        >



        </AppsContainer>
        <Dialog open={this.state.delete} onClose={this.handleDeleteClose}>
          <DialogTitle>
            {this.state.deleteType === 'mail'
              ? 'Delete Mail Configuration'
              : 'Delete SMS Configuration'}
          </DialogTitle>
          <DialogContent sx={{width: 500}}>
            <DialogContentText>
              Are you sure you want to delete this configuration?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' color='inherit' onClick={this.handleDeleteClose}>
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={
                this.state.deleteType === 'mail'
                  ? this.handleMailDelete
                  : this.handleDelete
              }
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
     </Grid>
    
    );
  }
}

const mapStateToProps = (state) => {
  return {
    // list: state.roleReducer.listrole || [],
    // module: state.roleReducer.listmodule || [],
    list_mail_config: state.ConfigurationReducer.list_mail_config || [],
    mail_role_config: state.ConfigurationReducer.mail_role_config || [],
    mail_role_config_count: state.ConfigurationReducer.mail_role_config_count,
    list_sms_config: state.ConfigurationReducer.list_sms_config || [],
    sms_role_config: state.ConfigurationReducer.sms_role_config || [],
    sms_role_config_count: state.ConfigurationReducer.sms_role_config_count,
    app_config_data:state.appConfigReducer.app_config_data || [],
    searchMailData: state.ConfigurationReducer.searchMailData || [],
    searchMailDataCount: state.ConfigurationReducer.searchMailDataCount,
    searchSmsData: state.ConfigurationReducer.searchSmsData || [],
    searchSmsDataCount: state.ConfigurationReducer.searchSmsDataCount,
    departmentList: state.DepartmentHeadReducer.departmentList || [],
    getDepartmentCount: state.DepartmentHeadReducer.getDepartmentCount || 0,
    getDepartmentSearch:state.DepartmentHeadReducer.getDepartmentSearch || [],
    departmentgetbyid: state.DepartmentHeadReducer.departmentgetbyid|| [],
    appConfigWithCompanyInfo : state.appConfigReducer.appConfigWithCompanyInfo || [],
    restrictUserLocationCreation: state.SubscriptionReducer.restrictUserLocationCreation || [],
    menuAccess: state.rbacReducer.menuAccess || [],
    navigationMenus: state.NavigationReducer.menus || [],
    // stocklocation: state.stockLocationReducer.stocklocation || [],
  };
};
const mapDispatchToProps = (dispatch) => {
  
  return { 
    getAllMailConfigurationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getAllMailConfigurationAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    getAppConfigDataAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    getAllSmsConfigurationAction: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getAllSmsConfigurationAction(setModalTypeHandler, setLoaderStatusHandler));
    },
    getByIdMailRoleConfigurationAction: ( setModalTypeHandler, setLoaderStatusHandler, data) => {
      return dispatch(getByIdMailRoleConfigurationAction( setModalTypeHandler, setLoaderStatusHandler, data));
    },
    getByIdSmsRoleConfigurationAction: ( setModalTypeHandler, setLoaderStatusHandler, data) => {
      return dispatch(getByIdSmsRoleConfigurationAction( setModalTypeHandler, setLoaderStatusHandler, data));
    },
    ListDepartmentById: (id,response) => {
      return dispatch(ListDepartmentById(id,response));
    },
    department: (setModalTypeHandler, setLoaderStatusHandler,data) => {
      return dispatch(department(setModalTypeHandler, setLoaderStatusHandler,data));
    },
    CreateDepartment: ( data,response) => {
      return dispatch(CreateDepartment( data,response));
    },

    updateDepartment: (id,data,response) => {
      return dispatch(updateDepartment(id,data,response));
    },

    deleteDepartment: (id) => {
      return dispatch(deleteDepartment(id));
    },
    getMenuAccessAction: (roleName) => {
      return dispatch(getMenuAccessAction(roleName));
     },
    // getAppConfigWithCompanyInfoAction: () => {
    //   return dispatch(getAppConfigWithCompanyInfoAction);
    // },

    // listmoduleAction: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   dispatch(listmoduleAction(setModalTypeHandler, setLoaderStatusHandler));
    // },
    // createRoleAction: (
    //   data,
    //   setModalTypeHandler,
    //   setLoaderStatusHandler,
    //   setModalStatusHandler,
    // ) => {
    //   dispatch(
    //     createRoleAction(
    //       data,
    //       setModalTypeHandler,
    //       setLoaderStatusHandler,
    //       setModalStatusHandler,
    //     ),
    //   );
    // },
    // deleteRoleAction: (id, setModalTypeHandler, setLoaderStatusHandler) => {
    //   dispatch(
    //     deleteRoleAction(id, setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
    // getbyidRoleAction: (id) => {
    //   dispatch(getbyidRoleAction(id));
    // },
    updateMailRoleConfigurationAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        updateMailRoleConfigurationAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler
        ),
      );
    },
    updateSmsRoleConfigurationAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      silent,
    ) => {
      return dispatch(
        updateSmsRoleConfigurationAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          silent,
        ),
      );
    },
    deleteSmsRoleConfigurationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteSmsRoleConfigurationAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    deleteMailRoleConfigurationAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteMailRoleConfigurationAction(id, setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    searchMailState: (val ) => { return dispatch(searchMailState(val))
    },
    setSearchDepartmentState: (val ) => { return dispatch(setSearchDepartmentState(val))
    },
    searchMailAction: ( 
      setModalTypeHandler,
      setLoaderStatusHandler,
      val
      ) => { 
      return dispatch(
        searchMailAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          val
          )
        );
    },
    setSearchSmsAction: (val) => {
      return dispatch(setSearchSmsAction(val))
    },
    getSearchSmsAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      val
    ) => {
      return dispatch(
        getSearchSmsAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          val
        )
      );
    },
    allListStockLocation: (setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(allListStockLocation(setModalTypeHandler, setLoaderStatusHandler));
    },
    restrictNewCreationBasedOnPlanAction : () =>{
      return dispatch(restrictNewCreationBasedOnPlanAction());
     },
    // listStockLocationAction: (commoncookie, headerLocationId) => {
    //   dispatch(listStockLocationAction(commoncookie, headerLocationId));
    // },
    // getPosPages: () => {
    //   dispatch(getPosPages());
    // },
    // listStockLocationAction: () => {
    //   dispatch(listStockLocationAction())
    // },
  };
};

export default connect( mapStateToProps, mapDispatchToProps )(SmsMailConfiguration);

