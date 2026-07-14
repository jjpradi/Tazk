import React, { Component } from 'react';
//import NewCustomer from '../../components/Customer';
import { connect } from 'react-redux';
import MaterialTable from 'utils/SafeMaterialTable';
import NewSalary from './newsalary';
import NewTemplate from './newTemplate';
import MapSalary from './mapSalary';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  ListSalaryAction,
  CreateSalary,
  salaryPaginationAction,
  getALlSalaryStructureAction,
  getMappedDetailsAction,
  createSalaryStructureAction,
  searchSalaryStructureAction,
  bulkUploadSalaryStructureAction,
  getAllSalaryTemplateAction,
  createTemplateStructureAction,
  getSearchSalaryTemplateAction,
  deleteTemplateStructureAction
} from '../../../redux/actions/salary_actions'

import {
  Listholidays, CreateHolidays, getbyidholidaysAction, updateHolidays, deleteHolidays
} from '../../../redux/actions/holidays_actions';

import {
  listUserCreationAction
} from '../../../redux/actions/userCreation_actions';
import AlertDialog from '../../common/Dialog';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import Cookies from 'universal-cookie';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputAdornment, Tab, Tabs, TextField, Typography ,alpha, TablePagination} from '@mui/material';
import apiCalls from 'utils/apiCalls';
import { Helmet } from "react-helmet-async";
import { maxBodyHeight, maxHeight, pageSize, headerStyle, cellStyle, font14_500 } from 'utils/pageSize';
import { MTableToolbar } from 'utils/SafeMaterialTable';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getSearchSalaryAction, setSearchSalaryState, deleteSalaryStructureAction } from '../../../redux/actions/salary_actions'
import CommonSearch from 'utils/commonSearch';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { commonDateFormat } from 'utils/getTimeFormat';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import { titleURL } from 'http-common';
import { getAppConfigDataAction } from 'redux/actions/app_config_actions';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
// import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton';
import { styled} from '@mui/material/styles';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import SampleTemplateLink from '@crema/services/db/Contact/ContactListing/ContactHeader/template';
import excelicon from 'assets/icon/excelicon.svg';
import * as XLSX from "xlsx-js-style";
import { OpenalertActions } from 'redux/actions/alert_actions';
import {
  getStickyTableOptions,
  stickyTableComponents,
} from 'utils/stickyTableLayout';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

import { getsessionStorage } from 'pages/common/login/cookies';

const commonCellStyle = {
  fontFamily: "poppins",
  fontSize: "11px",
  fontWeight: "400",
  color: 'rgba(0, 0, 0, 0.7)',
};

const IconBtn = styled(IconButton)(({theme}) => {
  return {
    color: theme.palette.text.disabled,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    padding: 8,
    '&:hover, &:focus': {
      color: theme.palette.primary.main,
    },
    '&.active': {
      color: theme.palette.primary.main,
    },
  };
});
class SalaryStructure extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      stock_location_data: [],
      open: false,
      edit_id_data: [],
      dialog: { open: false, msg: '', severity: '' },
      status: '',
      delete: false,
      id: '',
      searchVal: '',
      searchPageData: [],
      page: 0,
      pageSize: pageSize,
      searchData: [],
      isApiFinished: false,
      edit_data: {},
      mapOpen: false,
      copyOpen: false,
      allowanceAmounts_data: null,
      deductionAmounts_data: null,
      deleteOpen: false,
      formValues: [],
      formErrors: {
        name: null,
        code: null,
      },
      filePreviews:[],
      FileEvents:{},
      rowData : {},
      ot: false,
      OpenDialog:false,
      value: 0,
      columns: [
        // {
        //   field: 'id',
        //   title: 'Id',
        // },
        {
          field: 'name',
          title: 'Name',
        },
       
        {
          field: 'BASIC',
          title: 'Basic',
          render: rowData => {
            const {BASIC = 0 } = rowData
            return BASIC
          }
        },
        {
          field: 'HRA',
          title: 'Hra'
        },
        {
          field: 'SA',
          title: 'Special Allowance'
        },
        {
          field: 'CONV',
          title: 'Conveyance Allowance'
        },
        {
          field: 'IT',
          title: 'Incentive Allowance'
        },
        {
          field: 'grossAmount',
          title: 'Gross Salary'
        },
        {
          title: 'Total Deductions',
          render: rowData => {
            const {EPF = 0, ESI = 0, PT = 0 } = rowData
            return EPF + ESI + PT
          }
        },
        {
          title: 'Net Pay',
          field: 'net_pay'
        },
        {
          title: 'Employer PF',
          field: 'EPF'
        },
        {
          title: 'Monthly CTC',
          field: 'monthly_ctc'
        },
        {
          title: 'Yearly CTC',
          field: 'ctc'
        },
        // {
        //   field: 'allowance_amount',
        //   title: 'Allowance Amount',
        // },
        // {
        //   field: 'allowance_name',
        //   title: 'Allowance Name',
        // },
        // {
        //   field: 'deduction_name',
        //   title: 'Deduction Name',
        // },

        // {
        //   field: 'ot',
        //   title: 'Overtime',
        // },
        // {
        //   field: 'tds_detail',
        //   title: 'TDS',
        //   render: (rowData) => (
        //     <div>{rowData.tds_detail ? rowData.tds_detail : '0'}</div>
        //   )
        // },
        // {
        //   field: 'pf_detail',
        //   title: 'PF',
        //   render: (rowData) => (
        //     <div>{rowData.pf_detail ? rowData.pf_detail : '0'}</div>
        //   )
        // },
      ],
      TempColumns: [
        {
          field: 'name',
          title: 'Name',
        },
        {
          field: 'basics',
          title: 'Basic',
        },
        {
          field: 'allowance_codes',
          title: 'Earnings',
        },
        {
          field: 'deduction_codes',
          title: 'Deductions',
        }
        // {
        //   field: 'HRA',
        //   title: 'HRA',
        // },
        // {
        //   field: 'DA',
        //   title: 'DA',
        // },
        // {
        //   field: 'IA',
        //   title: 'IA',
        // },
        // {
        //   field: 'CONV',
        //   title: 'CONV',
        // },
        // {
        //   field: 'BASIC',
        //   title: 'BASIC',
        // },
        // {
        //   field: 'SA',
        //   title: 'SA',
        // },
        // {
        //   field: 'EPF',
        //   title: 'EPF',
        // },
        // {
        //   field: 'ESI',
        //   title: 'ESI',
        // },
      ]
    };
    this.cookies = new Cookies();
  }
  
    storage = getsessionStorage()

  async componentDidMount() {
    this.props.setSearchSalaryState([]);
    const context = this.context;
    const body = {
      pageCount: 0,
      numPerPage: pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    const selectedRole = this.storage?.role_name;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      // this.props.listUserCreationAction(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      // ),
      // this.props.getALlSalaryStructureAction(
      //   body,
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler),
      this.props.getAllSalaryTemplateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler),
      // this.props.salaryPaginationAction(
      //   body,
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler)
      // this.props.getAppConfigDataAction(
      //   context.setModalStatusHandler, 
      //   context.setLoaderStatusHandler
        // (response) => {
        //   response.map((res) => {
        //     if(res.key_name === 'company.overtimeAllowance' && res.value === 'true'){
        //       console.log("company.overtime", res.value)
        //       this.setState({ot: true, columns: [...this.state.columns, {
        //         title: 'OT Type',
        //         render: rowData => {
                  
        //           if(rowData.OT_amount_type === 'FLAT'){
        //             if(rowData.OT === 0){
        //               return ''
        //             }else{
        //               return 'Flat'
        //             }
        //           }
      
        //           if(rowData.OT_amount_type === 'FROM_BASIC'){
        //             return 'From Basic'
        //           }
      
        //           return ''
                    
        //         }
        //       },
        //       {
        //         title: 'OT Amount',
        //         render: rowData => {
        //           if(rowData.OT_amount_type === 'FLAT'){
        //             if(rowData.OT === 0){
        //               return ''
        //             }else{
        //               return rowData.OT
        //             }
        //           }else{
        //             return ''
        //           }
        //         }
        //       }]})
        //     }
        //   })
        // }
      // ),
      // this.props.getUserRightsByRoleIdAction()
      this.props.getMenuAccessAction(selectedRole)
    ).finally(() => this.setState({ isApiFinished: true }))

    if (this.props.setModalStatusHandler) this.setState({ open: true });
  }

  async componentDidUpdate (prevProps, prevState) {
    const context = this.context;
    const body = {
      pageCount: 0,
      numPerPage: pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }

    if(prevState.value !== this.state.value && this.state.value === 0) {
      this.setState({
        page: 0,
        pageSize: pageSize,
        searchVal: ''
      })
      this.props.getAllSalaryTemplateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    }

    if(prevState.value !== this.state.value && this.state.value === 1) {
      this.setState({
        page: 0,
        pageSize: pageSize,
        searchVal: ''
      })
      this.props.getALlSalaryStructureAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    }
    
    if(prevState.page !== this.state.page) {
      this.props.setSearchSalaryState([])
      body.pageCount = this.state.page
      if(this.state.value === 0) {
        this.props.getAllSalaryTemplateAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      }
      else {
        this.props.getALlSalaryStructureAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      }
    }
    
    if(prevState.pageSize !== this.state.pageSize) {
      this.props.setSearchSalaryState([])
      body.numPerPage = this.state.pageSize
      if(this.state.value === 0) {
        this.props.getAllSalaryTemplateAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      }
      else {
        this.props.getALlSalaryStructureAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler
        )
      }
    }
  }

  handlePageSizeChange = async (size) => {
    this.setState({pageSize: size}) 
  };

  handlePageChange = async (page) => {
    this.setState({page: page});
  };


  handleEdit = async (rowData) => {
    const context = this.context;

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getbyidholidaysAction(
    //     id,
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //   )
    //  );
    this.setState({ open: true, status: 'edit', edit_data: rowData });
  };
  handleDelete = async (id) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteHolidays(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
      )
    );

    this.setState({ delete: false });
  };
  handledialog = (id) => {
    this.setState({ delete: true, id: id });
  };
  handleClose = (id) => {
    const context = this.context;
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', false);
    }
    this.setState({ open: false, dialog: false, delete: false, mapOpen: false });
    const body = {
      pageCount: 0,
      numPerPage: pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }

    if(this.state.value === 0) {
      this.props.getAllSalaryTemplateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    }

    if(this.state.value === 1) {
      this.props.getALlSalaryStructureAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    }
  };

  handleCloseCopy = () => {
    const context = this.context;
    this.setState({ copyOpen: false, formValues: [],  allowanceAmounts_data: null, deductionAmounts_data: null, formErrors: { name: null } });
    const body = {
      pageCount: 0,
      numPerPage: pageSize,
      searchString: this.state.searchVal,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }

    if(this.state.value === 0) {
      this.props.getAllSalaryTemplateAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    }
  }
  handleSubmitCopy = async () => {
    const { formValues, allowanceAmounts_data, deductionAmounts_data } = this.state;
  
    let isValid = true;
    let formErrorsObj = { ...this.state.formErrors };
  
    if (!formValues.name) {
      isValid = false;
      formErrorsObj.name = 'Name is Required!';
    } else {
      formErrorsObj.name = null;
    }

    const allTemplates =
      (this.props.salaryTemplateList?.data || this.props.salaryTemplateList || [])
        .map((item) => item.name?.trim().toLowerCase()) || [];
    const normalizedName = formValues.name?.trim().toLowerCase();
    if (normalizedName && allTemplates.includes(normalizedName)) {
      isValid = false;
      formErrorsObj.name = 'Template Name already exists!';
    }
  
    // if (!formValues.code) {
    //   isValid = false;
    //   formErrorsObj.code = 'Code is Required!';
    // } else {
    //   formErrorsObj.code = null;
    // }
  
    await this.setState({
      formErrors: formErrorsObj,
    });
  
    if (!isValid) {
      return;
    }
    const payload = {
      name: formValues.name,
      code: formValues.code,
      allowanceAmounts: allowanceAmounts_data,
      deductionAmounts: deductionAmounts_data,
    };
    if (this.state.value == '1') {
      this.props.createTemplateStructureAction(payload);
    } else {
      const allowanceItems = allowanceAmounts_data || [];
      const deductionItems = deductionAmounts_data || [];
      const uniqueAllowances = allowanceItems.filter(
        (item, index, arr) =>
          arr.findIndex((v) => v.allowance_code === item.allowance_code) === index,
      );
      const uniqueDeductions = deductionItems.filter(
        (item, index, arr) =>
          arr.findIndex((v) => v.deduction_code === item.deduction_code) === index,
      );

      const payloadTemplate = {
        name: formValues.name,
        allowanceAmounts: uniqueAllowances,
        deductionAmounts: uniqueDeductions,
      };
      await this.props.createTemplateStructureAction(payloadTemplate, async (response) => {
        const res = await response;
        if (res.data.status !== 'Template Name already exists!' && res.status === 200) {
          this.setState({ copyOpen: false });
          this.handleCloseCopy();
        }
      });
    }
  };
  
  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stockLocation', true);
    }
    await this.setState({
      ...this.state.dialog,
      dialog: { msg: res, severity: resSeverity, open: true },
    });
  };

  sample = async (value) => {
    const context = this.context;
    await this.setState({ open: value });

    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('stocklocation', true);
    }
  };


  handleChange = (event, value, type) => {
    this.setState((prevState) => ({
      formValues: {
        ...prevState.formValues,
        [type]: value,
      },
    }));
    this.validationHandler(type, value);
  };

  validationHandler = (name, value) => {
    const { formErrors } = this.state;

    if (['name', 'code'].includes(name) && value.trim() !== '') {
      this.setState({
        formErrors: {
          ...formErrors,
          [name]: null,
        },
      });
    } else {

      this.setState({
        formErrors: {
          ...formErrors,
          [name]: 'Please enter a valid ' + name,
        },
      });
    }
  };


  // capitalize = (str) => {
  //   // Implement your capitalize function here
  //   // Assuming requiredFields is available in your component
  //   return str.charAt(0).toUpperCase() + str.slice(1);
  // };
  // cancelSearch = (e) => {
  //   this.setState({ searchVal: ''});
  //    this.props.setSearchSalaryState([])
  // };
  // handlePageSizeChange = async (size) => {
  //   this.setState({ pageSize: size })
  //   const context = this.context;

  //   const body = {
  //     pageCount: this.state.page,
  //     numPerPage: size,
  //     searchString: this.state.searchVal,
  //     employeeId: context.commoncookie,
  //     headerLocationId: context.headerLocationId
  //   }
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.salaryPaginationAction(body)
  //   )
  // }
  // handlePageChange = async (page) => {
  //   const context = this.context;
  //   this.setState({ page: page })

  //   const body = {
  //     pageCount: page,
  //     numPerPage: this.state.pageSize,
  //     searchString: this.state.searchVal,
  //     employeeId: context.commoncookie,
  //     headerLocationId: context.headerLocationId
  //   }
  //   apiCalls(
  //     context.setModalTypeHandler,
  //     context.setLoaderStatusHandler,
  //     this.props.salaryPaginationAction(body)
  //   )
  // }
  cancelSearch = (e) => {

    const context = this.context;
    this.setState({ searchPageData: [], page: 0, searchVal: '' });
    // this.props.set_searchChartofAccountAction({ data: [], numRows: 0 })
    const body = {
      pageCount: this.state.page,
      numPerPage: pageSize,
      searchString: '',
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    
    if(this.state.value === 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getAllSalaryTemplateAction(body)
      )
    }
    else {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getALlSalaryStructureAction(body)
      )
    }
  };

  // requestSearch = (e) => {
  //   const context = this.context;
  //   let val = e.target.value;
  //   this.setState({searchVal: val});

  //   // if(val.trim() !== ''){
  //     this.props.setSearchSalaryState([])
  //   // }
  //   const body = {
  //     searchString : val
  //   }
  //   this.props.getSearchSalaryAction(
  //       body,
  //       context.setModalTypeHandler,
  //       context.setLoaderStatusHandler
  //     )
  // };
  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({ searchVal: val, page: 0 });
    const body = {
      pageCount: this.state.page,
      numPerPage: pageSize,
      searchString: val,
      employeeId: context.commoncookie,
      headerLocationId: context.headerLocationId
    }
    if(this.state.value === 0) {
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.getSearchSalaryTemplateAction(
          body,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
        )
      )
    }
    else {
      this.props.searchSalaryStructureAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    }
  };

  handleOpen = (rowData) => {
    this.setState({ open: true, status: 'view', edit_data: rowData });
  };

  handleTemplateCopy = (rowData) => {
    this.setState({ copyOpen: true, edit_data: rowData })
  }

  handleCopy = (rowData) => {
    this.setState({ copyOpen: true, edit_data: rowData });
    console.log("roess",rowData);
    const allowanceAmounts = [
      {
        "id": rowData.BASIC_id,
        "amount": rowData.BASIC,
        "allowance_code": "BASIC"
      },
      {
        "id": rowData.DA_id,
        "amount": rowData.DA,
        "allowance_code": "DA"
      },
      {
        "id": rowData.HRA_id,
        "amount": rowData.HRA,
        "allowance_code": "HRA"
      },
      {
        "id": rowData.CONV_id,
        "amount": rowData.CONV,
        "allowance_code": "CONV"
      },
      {
        "id": rowData.INC_id,
        "amount": rowData.INC,
        "allowance_code": "INC"
      },
      {
        "id": rowData.OT_id,
        "amount": rowData.OT,
        "allowance_code": "OT",
        "amount_type": rowData.OT_amount_type
      }
    ];

    const deductionAmounts = [
      {
        "id": rowData.EPF_id,
        "amount": rowData.EPF,
        "deduction_code": "EPF"
      },
      {
        "id": rowData.ESI_id,
        "amount": rowData.ESI,
        "deduction_code": "ESI"
      }
    ];
    console.log(allowanceAmounts.filter((v) => v.amount > 0), 'allowanceAmounts');
    this.setState({
      allowanceAmounts_data: allowanceAmounts.filter((v) => v.amount > 0),
      deductionAmounts_data: deductionAmounts.filter((v) => v.amount > 0)
    });
    //this.props.getParticularSalaryStructureDetail(rowData.id)
  };

  handleClick = (rowData) => {
    this.setState({ mapOpen: true, edit_data: rowData });
    this.props.getMappedDetailsAction(rowData.id)
  };
   handleOpenDeleteDialog = (rowData)=>{
     this.setState({deleteOpen: true , rowData : rowData})
     console.log(rowData,'POOPOPPOPOP')

}
  handleDeleteSalaryStructure = () =>{
    if(this.state.value === 0) {
      this.props.deleteTemplateStructureAction(this.state.rowData.id)
    }
    else {
      this.props.deleteSalaryStructureAction(this.state.rowData.id,(response)=>{
        // console.log("response",response)
        if(response.affectedRows === 1){
          const context = this.context;
  
          const body = {
            pageCount: this.state.page,
            numPerPage: pageSize,
            searchString: '',
            employeeId: context.commoncookie,
            headerLocationId: context.headerLocationId
          }
          this.props.getALlSalaryStructureAction(
            body,
            context.setModalTypeHandler,
            context.setLoaderStatusHandler)
        }
      })
    }
    this.setState({deleteOpen:false})
  }
  handleCloseDelete=()=>{
    this.setState({deleteOpen: false})
  }

upload = async () => {
  try {
    const { filePreviews } = this.state;
 
    if (!filePreviews) {
      
        this.props.OpenalertActions({
          msg: "Please upload a valid Excel file",
          severity: "warning",
        })
     
      return;
    }

    // ðŸ”¹ Handle base64 data URL directly
    const base64 = filePreviews[0].split(",")[1] || filePreviews;
    
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Parse workbook
    const workbook = XLSX.read(bytes, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Read as 2D array
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", header: 1 });

    if (rows.length < 2) {
      
        this.props.OpenalertActions({
          msg: "Excel sheet is empty or invalid",
          severity: "warning",
        })
      
      return;
    }

    // First row = headers
    const headers = Array.isArray(rows[0]) ? rows[0] : [];
    const dataRows = rows.slice(1);
    
    // Build JSON
    const jsonData = dataRows.map((row) => {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = row[idx] ?? "";
      });
      return obj;
    });

    // Transform into payload
    const payload = jsonData.map((row) => {
      const allowanceAmounts = [];
      const deductionAmounts = [];

      Object.keys(row).forEach((key) => {
        if (key.startsWith("Earning_") && row[key] !== "") {
          allowanceAmounts.push({
            id: null,
            allowance_code: key.replace("Earning_", "").replace("_Amount", ""),
            amount: String(row[key]),
            amount_type: null,
          });
        }
        if (key.startsWith("Deduction_") && row[key] !== "") {
          deductionAmounts.push({
            id: null,
            deduction_name: key.replace("Deduction_", "").replace("_Amount", ""),
            deduction_code: key.replace("Deduction_", "").replace("_Amount", ""),
            amount: String(row[key]),
          });
        }
      });

      return {
        code: null,
        name: row["Salary Structure Name"] || "",
        fromDate: row["From Date"] || null,
        toDate: row["To Date"] || null,
        allowanceAmounts,
        deductionAmounts,
      };
    });


    if (payload.length === 0) {
     
        this.props.OpenalertActions({
          msg: "No valid data found in Excel",
          severity: "warning",
        })
      
      return;
    }

    // Store first row in formValues and send full payload to API
    this.setState({ formValues: payload[0] }, () => {
      this.handleSubmit(payload);
    });
  } catch (error) {

      this.props.OpenalertActions({
        msg: "Invalid file format!",
        severity: "error",
      })
    
  }
};


  handleSubmit=(payload)=>{
      this.props.bulkUploadSalaryStructureAction(payload)
      this.setState({ OpenDialog: false })
  }

  handleChange1 = (event, newValue) => {
    this.setState({ value: newValue, open: false, searchVal: '' })
  };

  render() {

    const { menuAccess = {} } = this.props;
        const selectedRole = this.storage?.role_name;
       const storage = this.storage;
    
      const salaryStructureCreate =
        storage.company_type === 5
          ? UserRightsAuthorization(menuAccess[selectedRole], 'salary__salary_structure', 'can_create')
          : true;
    
      const salaryStructureEdit =
        storage.company_type === 5
          ? UserRightsAuthorization(menuAccess[selectedRole], 'salary__salary_structure', 'can_edit')
          : true;
    
      const salaryStructureDelete =
        storage.company_type === 5
          ? UserRightsAuthorization(menuAccess[selectedRole], 'salary__salary_structure', 'can_delete')
          : true;

    console.log(this.props.salaryStructureCount, 'particularDetail');
    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title> {titleURL} | Salary </title>
        </Helmet>
        <CreateNewButtonContext.Consumer>
          {({ setModalStatusHandler, setModalTypeHandler, drawerOpen, commoncookie,
            headerLocationId,
            setLoaderStatusHandler, }) => (
            <div
            // style={{
            //   width: drawerOpen
            //     ? 'calc(100vw - 325px)'
            //     : 'calc(100vw - 143px)',
            // }}
            >
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
              />
              <Tabs value={this.state.value} onChange={this.handleChange1} aria-label='tabs example'>
                <Tab label='Template' value={0} />
                <Tab label='Salary Structure' value={1} />
              </Tabs>
              {this.state.open === false && this.state.mapOpen === false && this.state.value == '1' && (
                <MaterialTable
                  totalCount={this.props.salaryStructureCount || 0}

  localization={{
    pagination: {
      labelRowsPerPage: "Rows per page:",
    },
  }}
                  components={{
                    ...stickyTableComponents,
                    Toolbar: (props) => (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                    
                          <div style={{ width: '100%' }}>
                            <MTableToolbar {...props} />
                          </div>
                          {/* <div> */}
                           <div style={{ display: 'flex', alignItems: 'center',paddingRight: '10px' }}>
                             <IconBtn size='large' onClick={() => this.setState({ OpenDialog: true })}>
                             <UploadFileIcon />
                             </IconBtn>
                           </div>
                          <CommonSearch
                            searchVal={this.state.searchVal}
                            cancelSearch={this.cancelSearch}
                            requestSearch={this.requestSearch}
                          />
                          
                        </div>
                      </div>
                    ),
                    Pagination: (props) => (
                      <div
                        style={{
                          // display: "flex",
                          // justifyContent: "flex-end",
                          // alignItems: "center",
                          // padding: "8px 16px",
                          width:"100%"
                        }}
                      >
                        <TablePagination
                          {...props}
                          component="div"
                          count={this.props.salaryStructureCount || 0}
                          page={this.state.page || 0}
                          rowsPerPageOptions={[20, 50, 100]}
                          rowsPerPage={this.state.pageSize || 20}
                          labelRowsPerPage="Rows per page:"
                          onPageChange={(event, page) =>
                            this.handlePageChange(page)
                          }
                          onRowsPerPageChange={(event) =>
                            this.handlePageSizeChange(
                              parseInt(event.target.value, 10)
                            )
                          }
                        />
                      </div>
                    ),
                  }}
                  actions={[
                   ...(salaryStructureEdit ? [{
                      icon: 'edit',
                      tooltip: 'Edit',
                      position: 'row',
                      onClick: (event, rowData) =>
                        this.handleEdit(rowData),
                    }] : []),
                    // (rowData) => ({
                    //   icon: () => (
                    //     <ContentCopyIcon
                    //       fontSize='small'
                    //     />
                    //   ),
                    //   tooltip: 'copy',
                    //   onClick: (event, rowData) => { this.handleCopy(rowData) },
                    // }),
                    ...(salaryStructureDelete
                      ? [
                        (rowData) => ({
                          icon: () => <DeleteIcon fontSize="small" />,
                          tooltip: 'Delete',
                          onClick: () => this.handleOpenDeleteDialog(rowData),
                        }),
                      ]
                      : []),
                   
                  ...(salaryStructureCreate ? [{
                      icon: 'add',
                      tooltip: 'Add',
                      isFreeAction: true,
                      onClick: () => 
                        this.setState({
                          edit_id_data: [],
                          open: true,
                          status: 'create',
                        }),
                    }] : [])
                  ]}

                  
                  options={getStickyTableOptions({
                    bodyOffset: 250,
                    headerStyle,
                    options: {
                      showEmptyDataSourceMessage: this.state.isApiFinished,
                      cellStyle,
                      exportButton: true,
                      filtering: false,
                      actionsColumnIndex: -1,
                      paging: true,
                      page: this.state.page,
                      pageSize: this.state.pageSize,
                      pageSizeOptions: [20, 50, 100],
                      search: false,
                      toolbar: true,
                      tableLayout: 'auto',
                      searchFieldStyle: {
                        border: '1px solid #ccc',
                        borderRadius: '15px',
                        backgroundColor: '#fff',
                        padding: '8px',
                        width: '250px',
                      },
                    },
                  })}

                  columns={this.state.columns}
                  data={this.props.salarystructurelist?.data?.length ? this.props.salarystructurelist?.data : this.props.salarystructurelist}
                  title={
                    <Typography className='page-title'>
                      Salary Structure</Typography>}
                />
              )}
              {this.state.open === false && this.state.mapOpen === false && this.state.value == '0' && (
                <MaterialTable
                  totalCount={this.props.salaryTemplateCount}
                  components={{
                    ...stickyTableComponents,
                    Pagination: (props) => (
                      <TablePagination
                        {...props}
										    component="div"
                        count={this.props.salaryTemplateCount || 0}
										    rowsPerPageOptions={[20, 50, 100]}
                        labelRowsPerPage="Rows per Page:" 
                        page={this.state.page || 0}
										    rowsPerPage={this.state.pageSize || 20}
                        onPageChange={(event, page) => this.handlePageChange(page)}
                        onRowsPerPageChange={(event) => this.handlePageSizeChange(parseInt(event.target.value, 10))}
                      />
                    ),
                    Toolbar: (props) => (
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >

                          <div style={{ width: '100%' }}>
                            <MTableToolbar {...props} />
                          </div>

                          <div style={{ display: 'flex' }}>
                            <CommonSearch
                              searchVal={this.state.searchVal}
                              cancelSearch={this.cancelSearch}
                              requestSearch={this.requestSearch}
                            />
                          </div>

                        </div>
                      </div>
                    ),
                  }}
                  actions={[
                    (rowData) => ({
                      icon: () => (
                        <ContentCopyIcon
                          fontSize='small'
                        />
                      ),
                      tooltip: 'Copy',
                      onClick: (event, rowData) => { this.handleTemplateCopy(rowData) }
                    }),
                    ...(salaryStructureEdit
                      ? [
                        (rowData) => ({
                          icon: 'edit',
                          tooltip: 'Edit',
                          position: 'row',
                          disabled: rowData.salary_structure_id !== null,
                          onClick: (event, rowData) =>
                            this.handleEdit(rowData),
                        }),
                      ]
                      : []),
                     ...(salaryStructureDelete
                      ? [
                        (rowData) => ({
                      icon: 'delete',
                      tooltip: 'Delete',
                      disabled: (rowData.salary_structure_id !== null),
                      onClick: (event, rowData) =>
                        this.handleOpenDeleteDialog(rowData)
                       }),
                      ]
                      : []),
                   
                   ...(salaryStructureCreate ? [{
                      icon: 'add',
                      tooltip: 'Add',
                      isFreeAction: true,
                      onClick: () =>
                        this.setState({
                          edit_id_data: [],
                          open: true,
                          status: 'create',
                        }),
                    }] : [])
                  ]}

                  // page={this.state.page}
                  // onPageChange={(page) => this.handlePageChange(page)}
                  // onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}

                  options={getStickyTableOptions({
                    bodyOffset: 250,
                    headerStyle,
                    options: {
                      showEmptyDataSourceMessage: this.state.isApiFinished,
                      cellStyle,
                      exportButton: true,
                      filtering: false,
                      actionsColumnIndex: -1,
                      paging: true,
                      pageSize: pageSize,
                      pageSizeOptions: [20, 50, 100],
                      search: false,
                      toolbar: true,
                      tableLayout: 'auto',
                      searchFieldStyle: {
                        border: '1px solid #ccc',
                        borderRadius: '15px',
                        backgroundColor: '#fff',
                        padding: '8px',
                        width: '250px',
                      },
                    },
                  })}
                  columns={this.state.TempColumns}
                  data={this.props.salaryTemplateList?.data?.length ? this.props.salaryTemplateList?.data : this.props.salaryTemplateList}
                  title={
                    <Typography className='page-title'>
                      Template Page</Typography>}
                />
              )}
              {this.state.open && this.state.value == '1' && (
                <NewSalary
                  status={this.state.status}
                  handleClose={this.handleClose}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  edit_data={this.state.edit_data}
                  ot={this.state.ot}
                  searchVal={this.state.searchVal}
                  setSearchString={(val) => this.setState({ searchVal: val })}
                />
              )}
              {this.state.open && this.state.value == '0' && (
                <NewTemplate
                  status={this.state.status}
                  handleClose={this.handleClose}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                  edit_data={this.state.edit_data}
                  ot={this.state.ot}
                  searchVal={this.state.searchVal}
                  setSearchString={(val) => this.setState({ searchVal: val })}
                />
              )}

              {this.state.mapOpen && (
                <MapSalary rowData={this.state.edit_data}
                  handleClose={this.handleClose}
                />
              )}


              {this.state.copyOpen && <Dialog
                open={this.state.copyOpen}
                onClose={this.handleCloseCopy}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
                maxWidth='sm'
                fullWidth
              >
                <DialogTitle id='alert-dialog-title'>
                  {this.state.value === 0 ? 'Copy Salary Template' : 'Copy Salary Structure'}
                </DialogTitle>
                <DialogContent sx={{pb: 0}}>
                  <DialogContentText sx={{mb: 2}}>
                    Create a new {this.state.value === 0 ? 'template' : 'salary structure'} using the selected one as the starting point.
                  </DialogContentText>
                  <Box
                    sx={{
                      mb: 1,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography sx={{fontSize: 12, color: '#64748b', mb: 0.5}}>
                      Selected {this.state.value === 0 ? 'template' : 'structure'}
                    </Typography>
                    <Typography sx={{fontWeight: 600, color: '#0f172a'}}>
                      {this.state.edit_data?.name || '-'}
                    </Typography>
                  </Box>
                </DialogContent>
                <Grid container spacing={3} padding={5}>
                  <Grid
                    size={{
                      lg: 12,
                      md: 12
                    }}>
                    <TextField
                      fullWidth={true}
                      id='outlined-name'
                      label={this.state.value === 0 ? 'Salary Template Name' : 'Salary Structure Name'}
                      name='name'
                      type={'text'}
                      variant='filled'
                      required
                      placeholder={this.state.value === 0 ? '' : 'eg: EXECUTIVE-2024'}
                      value={this.state.formValues?.name || ''}
                      onChange={(event, value) => this.handleChange(event, event.target.value, 'name')}
                      error={!!this.state.formErrors.name}
                      helperText={this.state.formErrors.name}

                    />
                  </Grid>
                  {/* <Grid size={{ md: 6, lg: 6 }}>
                    <TextField
                      fullWidth={true}
                      id='outlined-name'
                      label='Salary Structure Code'
                      name='ageing'
                      type={'text'}
                      required
                      variant='filled'
                      placeholder='eg: EXE-24'
                      onChange={(event, value) => this.handleChange(event, event.target.value, 'code')}
                      error={!!this.state.formErrors.code}
                      helperText={this.state.formErrors.code}
                    />

                  </Grid> */}
                </Grid>

                <DialogActions>
                  <Button onClick={() => this.handleCloseCopy()} color='secondary' variant='outlined'>
                    Close
                  </Button>
                  <Button
                    onClick={() => this.handleSubmitCopy()}
                    color='primary'
                    variant='contained'
                    autoFocus
                  >
                    Create Copy
                  </Button>
                </DialogActions>
              </Dialog>}

              
                 <Dialog
                 open={this.state.deleteOpen}
                 onClose={this.handleCloseDelete}
                 aria-labelledby="alert-dialog-title"
                 aria-describedby="alert-dialog-description"
                 maxWidth='xs'
                 fullWidth
               >
                 <DialogTitle id="salarystructure-dialog-title">
                   Delete {this.state.value === 0 ? 'Template' : 'Salary Structure'}
                 </DialogTitle>
                 <DialogContent>
                   <DialogContentText id="salarystructure-dialog-description" sx={{mb: 2}}>
                    You are about to permanently delete this {this.state.value === 0 ? 'template' : 'salary structure'}.
                   </DialogContentText>
                   <Box
                     sx={{
                       px: 2,
                       py: 1.5,
                       borderRadius: 2,
                       backgroundColor: '#fff7ed',
                       border: '1px solid #fed7aa',
                     }}
                   >
                     <Typography sx={{fontSize: 12, color: '#9a3412', mb: 0.5}}>
                       Selected item
                     </Typography>
                     <Typography sx={{fontWeight: 600, color: '#7c2d12'}}>
                       {this.state.rowData?.name || '-'}
                     </Typography>
                   </Box>
                   <DialogContentText sx={{mt: 2}}>
                    This action cannot be undone.
                   </DialogContentText>
                 </DialogContent>
                 <DialogActions>
                   <Button onClick={this.handleCloseDelete} autoFocus variant='outlined'>
                     Cancel
                   </Button>
                   <Button onClick={this.handleDeleteSalaryStructure} color='error' variant='contained'>
                     Delete
                   </Button>
                 </DialogActions>
               </Dialog>
              

      <Dialog
  open={this.state.OpenDialog}
  fullWidth
  PaperProps={{ style: { minWidth: '50px', padding: '30px' } }}
>
  <Grid
    container
    flexDirection="column"
    justifyContent="center"
    spacing={5}
  >
    <Grid size="grow">
      <Grid container justifyContent="center">
        <Grid
          size={{
            lg: 12,
            md: 12,
            sm: 12,
            xs: 12
          }}>
          <AttachmentField
            type="excel"
            previews={this.state.filePreviews}
            setPreviews={(previews) =>
              this.setState({ filePreviews: previews })
            }
            style={{ width: '100%' }}
            contactUpload={true}
            handleChange={(e) => {
              this.setState({ fileEvents: e.target.files[0] });
            }}
          />
        </Grid>
      </Grid>
    </Grid>

    <Grid>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Sample Template Link */}
        <SampleTemplateLink
          type={6}
          excelicon={excelicon}
        />

        {/* Action Buttons */}
        <Grid>
          <Button
            onClick={() => {
              this.setState({ OpenDialog: false, filePreviews: [] });
            }}
            variant="contained"
            color="error"
            sx={{ marginRight: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={this.state.filePreviews.length === 0}
            onClick={this.upload} // class method
          >
            Upload
          </Button>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
</Dialog>


              
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {

    holidaygetbyid: state.HolidaysReducers.holidaygetbyid || [],
    holidaylist: state.HolidaysReducers.holidaylist || [],
    userCreation: state.UserCreationReducer.createUser || [],
    salarylist: state.SalaryReducers.salarylist || [],
    searchSalaryData: state.SalaryReducers.searchSalaryData || [],
    searchSalaryData_count: state.SalaryReducers.searchSalaryData_count || 0,
    salarystructurelist: state.SalaryReducers.salarystructurelist || [],
    salaryTemplateList: state.SalaryReducers.salaryTemplateList || [],
    salaryTemplateCount: state.SalaryReducers.salaryTemplateCount || 0,
    salaryStructureCount: state.SalaryReducers.salaryStructureCount || [],
    //particularDetail: state.SalaryReducers.particularDetail || []
    // searchSalaryData: state.SalaryReducers.searchSalaryData ||  []
    // user_rights: state.roleReducer.user_rights || []
     menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {

    listUserCreationAction: (setModalTypeHandler, setLoaderStatusHandler) => {

      return dispatch(
        listUserCreationAction(setModalTypeHandler, setLoaderStatusHandler),
      );
    },
    deleteSalaryStructureAction: (id,response) => { return dispatch(deleteSalaryStructureAction(id,response))
    },

    ListSalaryAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,

    ) => {
      return dispatch(
        ListSalaryAction(
          setModalTypeHandler,
          setLoaderStatusHandler,

        ),
      );
    },
    CreateSalary: (
      data, setModalTypeHandler,
      setLoaderStatusHandler,
      sample

    ) => {
      return dispatch(
        CreateSalary(
          data, setModalTypeHandler,
          setLoaderStatusHandler,
          sample

        ),
      );
    },

    getbyidholidaysAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getbyidholidaysAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    updateHolidays: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        updateHolidays(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    deleteHolidays: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        deleteHolidays(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    setSearchSalaryState: (val) => {
      return dispatch(setSearchSalaryState(val))
    },
    getSearchSalaryAction: (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        getSearchSalaryAction(
          val,
          setModalTypeHandler,
          setLoaderStatusHandler,
        )
      );
    },
    salaryPaginationAction: (data) => {
      return dispatch(salaryPaginationAction(data));
    },
    getALlSalaryStructureAction: (data) => {
      return dispatch(getALlSalaryStructureAction(data));
    },
    getAllSalaryTemplateAction: (data) => {
      return dispatch(getAllSalaryTemplateAction(data));
    },
    getMappedDetailsAction: (id) => {
      return dispatch(getMappedDetailsAction(id));
    },
    createSalaryStructureAction: (data) => {
      return dispatch(createSalaryStructureAction(data));
    },
    createTemplateStructureAction: (data, response) => {
      return dispatch(createTemplateStructureAction(data, response));
    },
    bulkUploadSalaryStructureAction: (data)=>{
      return dispatch(bulkUploadSalaryStructureAction(data))
    },
    searchSalaryStructureAction: (data) => {
      return dispatch(searchSalaryStructureAction(data));
    },
    getSearchSalaryTemplateAction: (data, setModalTypeHandler, setLoaderStatusHandler) => {
      return dispatch(getSearchSalaryTemplateAction(data, setModalTypeHandler, setLoaderStatusHandler));
    },
    getAppConfigDataAction: (setModalTypeHandler, setLoaderStatusHandler, response) => {
      return dispatch(getAppConfigDataAction(setModalTypeHandler, setLoaderStatusHandler, response))
    },
    getUserRightsByRoleIdAction:()=>{
      return dispatch(getUserRightsByRoleIdAction())
    },
    OpenalertActions:(data)=>{
      return dispatch(OpenalertActions(data))
    },
    deleteTemplateStructureAction:(id)=>{
      return dispatch(deleteTemplateStructureAction(id))
    },
     getMenuAccessAction: (data) => {
            return dispatch(getMenuAccessAction(data))
        },
  };
};



export default connect(mapStateToProps, mapDispatchToProps)(SalaryStructure);

