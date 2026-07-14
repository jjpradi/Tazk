import React, {Component} from 'react';
import {connect} from 'react-redux';
import ProductForm from '../../../components/NewProduct';
import MaterialTable, {MTablePagination, MTableToolbar} from 'utils/SafeMaterialTable';
import {
  listProductAction,
  updateProductAction,
  getlimitdatafromproduct,
  getbyidProductAction,
  deleteProductAction,
  createProductAction,
  GetProductHsnDetails,
  GetAllProductBrand,
  GetAllProductCategory,
  set_searchProductAction,
  get_searchProductAction,
  getCheckProductAction,
  productPaginationAction,
  productBulkUploadAction,
} from '../../../redux/actions/product_actions';
import AlertDialog from '../../common/Dialog';
import {listCustomerAction} from '../../../redux/actions/customer_actions';
import {listTaxCategoryAction} from '../../../redux/actions/tax_Category_actions';
import {listVendorAction} from '../../../redux/actions/vendor_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
// import TopOrder from '../../../components/erpDesign';
import TopOrder from './ProductLandingPage';
import {ExportCsv, ExportPdf} from '@material-table/exporters';
import {TextField, InputAdornment, Typography, Box, Dialog, Grid, Link, Button, IconButton, DialogTitle, DialogContent, TableCell, DialogActions, TableRow, TablePagination} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { maxBodyHeight, maxHeight, pageSize,headerStyle,cellStyle,font14_500 } from 'utils/pageSize';
import apiCalls from 'utils/apiCalls';
import {Helmet} from "react-helmet-async";
import CommonSearch from 'utils/commonSearch';
import { titleURL } from 'http-common';
import { restrictNewCreationBasedOnPlanAction } from 'redux/actions/subscription_action';
import { getRoleAuthorization } from '@crema/utility/helper/RoleAuthHelper';
import { getUserRightsByRoleIdAction } from 'redux/actions/role_actions';
import { getsessionStorage } from 'pages/common/login/cookies';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AttachmentField from 'pages/common/Timesheet/Attachment';
import excelicon from 'assets/icon/excelicon.svg';
import addInventory from '../../../assets/dashboardIcons/add-inventory.png';
import { read, utils } from 'xlsx-js-style';
import { OpenalertActions } from 'redux/actions/alert_actions';
import {
    getStickyTableOptions,
    stickyTableComponents,
  } from '../../../utils/stickyTableLayout'; 
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

class Product extends Component {
  static contextType = CreateNewButtonContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      update: true,
      dialog: {open: false, msg: '', severity: ''},
      status: '',
      delete: false,
      id: '',
      erp_id: '',
      count: 0,
      page: 0,
      pageSize: 20,
      edit_id_data: [],
      rowPopup: {open: false, rowIndex: '', item_id: ''},
      searchData: [],
      searchVal: '',
      searchPageData: [],
      lotNumberSearchData: [],
      isApiFinished: false,
      uploadOpen: false,
      uploadConfirmation: false,
      uploadDone: false,
      filePreviews: [],
      openProgress: false,
      existingProduct: [],
      existingProductOpen: false
    };
  }
  storage = getsessionStorage()
  async componentDidMount() {
        const selectedRole = this.storage?.role_name;
    this.props.set_searchProductAction({data:[], numRows:0})
    const context = this.context;

    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getlimitdatafromproduct(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     {pageCount: 0, numPerPage:  pageSize},
    //   ),
    //   // this.props.listProductAction(()=>{},()=>{}), //paginated api used instead of this
	  // );

    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:'',
    }
    
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.productPaginationAction(body),
      this.props.restrictNewCreationBasedOnPlanAction(),
      this.props.getUserRightsByRoleIdAction(),
        this.props.getMenuAccessAction(selectedRole)
    ).finally((res) => this.setState({isApiFinished: true}))

      
    
    
    // await this.props.listProductAction(context.setModalTypeHandler,context.setLoaderStatusHandler, {numPerPage:20,pageCount:5})
    // this.props.listCustomerAction(); // data not used
    // this.props.listTaxCategoryAction();
    // await this.props.listProductCategoryAction()
    // await this.props.listVendorAction()
    // this.props.GetProductHsnDetails();
    // this.props.GetAllProductBrand(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // );
    // this.props.GetAllProductCategory(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    // );
    if (this.props.setModalStatusHandler) this.setState({open: true});
  }

  componentDidUpdate(preProps, preState) {
    if (preProps.product_id_data !== this.props.product_id_data) {
     const editedData =  this.props.product_id_data.filter((e)=> e.item_id === this.state.rowPopup.item_id)
    //  console.log(editedData,'editedData')
      this.setState({
        edit_id_data: editedData,
        open: true,
        status: 'edit',
        rowPopup: {...this.state.rowPopup, open: false},
      });
    }


    const context = this.context;
    if(preState.pageSize !== this.state.pageSize){
      const body = {
        pageCount:this.state.page,
        numPerPage: this.state.pageSize,
        searchString:this.state.searchVal,
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.productPaginationAction(body),
        this.props.restrictNewCreationBasedOnPlanAction(),
      )
    }

    if(preState.page !== this.state.page){
      const body = {
        pageCount:this.state.page,
        numPerPage: this.state.pageSize,
        searchString:this.state.searchVal,
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.productPaginationAction(body),
        this.props.restrictNewCreationBasedOnPlanAction(),
      )
    }

    if(preState.existingProductOpen !== this.state.existingProductOpen && this.state.existingProductOpen === false){
      const body = {
        pageCount:this.state.page,
        numPerPage: this.state.pageSize,
        searchString:this.state.searchVal,
      }
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.productPaginationAction(body),
        this.props.restrictNewCreationBasedOnPlanAction(),
      )
    }

    // if(preProps.productByPagination !== this.props.productByPagination){
    // }

    // if(preProps.product !== this.props.product){
    //   let tempArr=[];
    //   this.props.product.map((item, index) => {
    //     let tempObj = {};
    //     return Object.keys(item).map(key => {
    //       if(key === 'lots'){
    //         let lot = item[key];
    //         let l3A = lot.map(l3 => {
    //           return l3.lot_number
    //         })
    //         tempObj.lotNumbers = l3A.toString().toLowerCase();
    //         tempObj.item_id = item.item_id;
    //         tempArr.push(tempObj);
    //       }
    //   })
    //   });
    //   this.setState({lotNumberSearchData:tempArr})
    // }
  }

  handlePageSizeChange = async (size) => {

    this.setState({pageSize: size})
    this.setState({page:0})
    // const context = this.context;
    // if (this.state.searchVal) {
    //   this.setState({pageSize: size});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 + size) * this.state.page,
    //     size * (this.state.page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    // this.setState({pageSize: size}, async () => {
    //   const context = this.context;
    //   apiCalls(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     this.props.getlimitdatafromproduct(
    //       context.setModalTypeHandler,
    //       context.setLoaderStatusHandler,
    //       {pageCount: this.state.page || 0, numPerPage: size},
    //     )
    //   );
    // });

    
   
  };

  handlePageChange = async (page) => {

    // const context = this.context;
    this.setState({ page: page })
    // if (this.state.searchVal) {
    //   this.setState({page: page});
    //   let pageChangeData = this.state.searchPageData?.slice(
    //     (0 +  pageSize) * page,
    //      pageSize * (page + 1),
    //   );
    //   return this.setState({searchData: pageChangeData});
    // }

    // this.setState({page: page});
    // const context = this.context;
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.getlimitdatafromproduct(
    //     context.setModalTypeHandler,
    //     context.setLoaderStatusHandler,
    //     {pageCount: page || 0, numPerPage:  pageSize},
    //   )
	  // );

    // const body = {
    //   pageCount:page,
    //   numPerPage: this.state.pageSize,
    //   searchString:this.state.searchVal,
    // }
    // apiCalls(
    //   context.setModalTypeHandler,
    //   context.setLoaderStatusHandler,
    //   this.props.productPaginationAction(body)
    // )
  };

  handleEdit = async (id, editIndex) => {
    const context = this.context;
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.getbyidProductAction(id),
      // this.props.getCheckProductAction(id)
	  );
    this.setState({
      open: true,
      status: 'edit',
      rowPopup: {...this.state.rowPopup, open: false, rowIndex: editIndex, item_id: id},
    });
  };
  handleDelete = async (id) => {
    const context = this.context;

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.deleteProductAction(
        id,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        // this.sample,
        ()=>{
          const body = {
            pageCount:this.state.page,
            numPerPage: this.state.pageSize,
            searchString:this.state.searchVal,
          }
          apiCalls(
            context.setModalTypeHandler,
            context.setLoaderStatusHandler,
            this.props.productPaginationAction(body)
          )
        }
      )
	  );
    this.setState({delete: false, rowPopup: {open: false, rowIndex: ''}});
  };
  handledialog = (id) => {
    this.setState({delete: true, id: id});
  };

  responseDialog = async (res, resSeverity) => {
    if (this.props.setModalStatusHandler && res === 'Created SuccessFully') {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('product', true);
    }
    await this.setState({
      dialog: {msg: res, severity: resSeverity, open: true},
      open: false,
    });
  };

  handleClose = () => {
    if (this.props.setModalStatusHandler) {
      this.props.setModalStatusHandler(false);
      this.props.setselectData('product', false);
    }
    setTimeout(() => {
      this.setState({
        open: false,
        dialog: false,
        delete: false,
        rowPopup: {...this.state.rowPopup, open: false},
        edit_id_data : []
      });
    }, 0);
  };

  sample = async (value,insertID="") => {
    this.setState({open: value, page : 0});
    const context = this.context;
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:'',
    }
    this.props.productPaginationAction(
        body,
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
      // this.props.getlimitdatafromproduct(
      //   context.setModalTypeHandler,
      //   context.setLoaderStatusHandler,
      //   {pageCount: 0, numPerPage:  pageSize},
      // ),

      // this.props.listProductAction()
      // (!this.props.product ? this.props.listProductAction() : <></>)
	 
      if (this.state.status === 'create') {
        this.setState({
          open: false,
          dialog: false,
          delete: false,
          rowPopup: {...this.state.rowPopup, open: false},
        });
      } 
      
      // else if(this.state.status === 'edit'){
      //   this.setState({
      //     open: false,
      //     dialog: false,
      //     delete: false,
      //     rowPopup: {...this.state.rowPopup, open: true},
      //   });
      // }
      else {
        this.setState({
          open: false,
          dialog: false,
          delete: false,
          rowPopup: {...this.state.rowPopup, open: true,item_id: insertID},
        });
      }
    if (!value) {
         if (this.props.setModalStatusHandler) {
        this.props.setModalStatusHandler(false);
        this.props.setselectData('product', true);
      }
    }

    
   
  };

  handleSubmit = async (data, setDisable) => {
    const context = this.context;
    const values = data;
    for (let val in values) {
      if (val === 'is_serialized') {
        values[val] = values[val] ? 1 : 0;
      }
    }
    // const {company_name,agency_name,account_number,supplier_tax_id,supplier_category,...record} = values

    if (data.item_id) {
      // console.log('updateProductCssIIIIII',this.state.status)
     await apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateProductAction(
          data.item_id,
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          ()=>{

          },
          (response)=>{
           if(response=== 'updated'){
            if(this.state.status === 'edit'){
              const body = {
                pageCount:this.state.page,
                numPerPage: this.state.pageSize,
                searchString:this.state.searchVal,
              }
              apiCalls(
                context.setModalTypeHandler,
                context.setLoaderStatusHandler,
                this.props.productPaginationAction(body)
              )
                this.setState({
                  open: false,
                  dialog: false,
                  delete: false,
                  rowPopup: {...this.state.rowPopup, open: false},
                });
              }
           }
        
            
          }
          // this.sample,
        ),
        this.props.restrictNewCreationBasedOnPlanAction(),
       // this.props.listProductAction()
      );
      // await this.setState({ open: false })
    } else {
      // await this.props.createProductAction(values, this.responseDialog)
      // await this.setState({ open: false })
      // if(this.props.setModalStatusHandler)
      // this.props.setModalStatusHandler(false)
      // await this.props.createProductAction(values, this.responseDialog)
      // await this.setState({ open: false })
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.createProductAction(
          data,
          context.setModalTypeHandler,
          context.setLoaderStatusHandler,
          this.sample,
          setDisable,
        ),
        this.props.restrictNewCreationBasedOnPlanAction(),
      );

    }

    // if (this.state.status === 'create') {
    //   this.setState({
    //     open: false,
    //     dialog: false,
    //     delete: false,
    //     rowPopup: {...this.state.rowPopup, open: false},
    //   });
    // } else {
    //   this.setState({
    //     open: false,
    //     dialog: false,
    //     delete: false,
    //     rowPopup: {...this.state.rowPopup, open: true},
    //   });
    // }
  };
  handleDeactive = async (data, status) => {
    const context = this.context;
    const active = {is_active: status};
    if (data.id) {
      const context = this.context;
      apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.updateProductAction(data.id, active)
      );
      await this.setState({open: false});
    }
  };

  handleTopOrder = async (id) => {
    if (id) {
      await this.setState({open: false});
      await this.setState({erp_id: id});
    }
  };

  rowPopupClose = () => {
    this.setState({rowPopup: {open: false, rowIndex: ''}});
  };

  escapeRegExp = (value) => {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  };


  requestSearch = (e) => {
    const context = this.context;
    let val = e.target.value;
    this.setState({searchVal: val});

    // if(val.trim() !== ''){
    if(val.length >= 3 || val.length === 0) {
      this.props.set_searchProductAction({data:[], numRows:0})
    }
    // }

    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      searchString:val,
    }

    this.props.get_searchProductAction(
      body, 
        context.setModalTypeHandler,
        context.setLoaderStatusHandler
      )
    //  this.setState({searchData: val});

    // const searchRegex = new RegExp(this.escapeRegExp(val), 'i');
    // const filteredRows = await this.props.product.filter((row) => {
    //   return Object.keys(row).some((field) => {
    //     return searchRegex.test(row[field]);
    //   });
    // });
    // // -------------

    // // const list = this.state.lotNumberSearchData.filter(item => {
    // //   if(item.lotNumbers.includes(val.toLowerCase())){
    // //     if(item.item_id !== undefined){
    // //       return item.item_id;
    // //     }
    // //   }

    // // })
    
    // // const list1 = list.map(i => i.item_id);
    // // let filterBasedOnLot = this.props.product.filter(obj => list1.includes(obj.item_id));

      
    //   const filterBasedOnLot = this.props.product.filter((item) => {
    //     return Object.keys(item).some(key => {
    //       if(key === 'lots'){
    //         let lot = item[key];
    //         let l3A = lot.filter(l3 => {
    //           return l3.lot_number.toString().toLowerCase().includes(val);
    //         })
    //         if(l3A.length > 0){
    //           return true
    //         }
    //       }
    //   })
    //   });

    //   let temp = [...filteredRows, ...filterBasedOnLot]
    //   const unique = [...new Map(temp.map(item => [item['item_id'], item])).values()];

    //   // -------------
    // this.setState({searchData: unique, searchPageData: unique});
    // this.setState({page: 0});
  };

  cancelSearch = (e) => {
    const context = this.context;
    this.setState({searchData: [], searchPageData: [], page: 0, searchVal: ''});
    // this.props.set_searchProductAction({data:[], numRows:0})
    const body = {
      pageCount:0,
      numPerPage: this.state.pageSize,
      
      searchString:'',
    
    }
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.productPaginationAction(body)
    )
  };

  handleFileUpload = async () => {
  const context = this.context;
  const body = {
    pageCount: this.state.page,     
    numPerPage: this.state.pageSize, 
    searchString: this.state.searchVal || '',
  };

  try {
    await this.encodeBase64ExcelFile(this.state.filePreviews[0]);

    this.setState({ 
      uploadDone: true, 
      uploadConfirmation: false, 
      uploadOpen: false,
      filePreviews : []
    });

    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.productPaginationAction(body),
      this.props.restrictNewCreationBasedOnPlanAction()
    );

  } catch (error) {
    console.error("File upload failed:", error);
  }
}
  encodeBase64ExcelFile = async (base64String) => {
    const location_id = this.context.headerLocationId;
    const binaryString = atob(base64String.split(",")[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wb = read(bytes, { type: "array", bookVBA: true });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    const rawData = utils.sheet_to_json(ws);

    // Clean and normalize data
    const cleanedData = rawData.map((row) => {
      const cleanedRow = {};
      for (let key in row) {
        let val = row[key];
        if (typeof val === "string") {
          val = val.replace(/(\r\n|\n|\r)/gm, "").trim();
        }
        cleanedRow[key] = val ?? row[key];
      }

      // Normalize is_serialized to 1/0
      cleanedRow.is_serialized =
        cleanedRow.is_serialized?.toString().toLowerCase() === "yes" ||
        cleanedRow.is_serialized === 1
          ? 1
          : 0;

      return cleanedRow;
    });

    // Helper: Map tax_percentage to tax_category_id
    const getTaxCategoryId = (tax_percentage) => {
      const tax = this.props.taxcategory.find(
        (t) => t.tax_group_sequence == tax_percentage
      );
      return tax ? tax.tax_category_id : null;
    };

    // Create the payload
    const dataApi = []
    for (const d of cleanedData){
      if(dataApi.some(data => data.name === d.name)){
        this.props.OpenalertActions({
          msg: `${d.name} already exist in excel`,
          severity: 'warning',
        })
        break
      }
      else if (!d.name || typeof d.name !== "string" || d.name === "null" || d.name.length > 100) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'name'",
          severity: 'warning',
        })
        break
      }
      else if (!d.category || typeof d.category !== "string" || d.category === "null" || d.category.length > 100) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'category'",
          severity: 'warning',
        })
        break
      }
      else if (!d.brand || typeof d.brand !== "string" || d.brand === "null" || d.brand.length > 100) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'brand'",
          severity: 'warning',
        })
        break
      }
      else if (d.unit_price == null || isNaN(d.unit_price)) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'unit price'",
          severity: 'warning',
        })
        break
      }
      else if (d.qty_per_pack == null || isNaN(d.qty_per_pack)) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'qty per pack'",
          severity: 'warning',
        })
        break
      }
      else if (d.tax_percentage == null || isNaN(d.tax_percentage)) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'tax percentage'",
          severity: 'warning',
        })
        break
      }
      else if (!d.hsn_code || d.tax_percentage == null) {
        this.props.OpenalertActions({
          msg: "Missing or invalid 'hsn code'",
          severity: 'warning',
        })
        break
      }
      else{
        let data = {
          name: d.name || "",
          sku: d.SKU || null,
          description: d.description || null,
          brand: d.brand || null,
          category: d.category || null,
          model: d.model || null,
          cost_price: +(Number(d.cost_price) || 0).toFixed(2),
          unit_price: +(Number(d.unit_price) || 0).toFixed(2),
          max_price: +(Number(d.max_price) || 0).toFixed(2),
          reorder_level: 0,
          automatic_reorder_level: false,
          is_serialized: d.is_serialized,
          stock_type: 1,
          qty_per_pack: +d.qty_per_pack || 1,
          pack_name: d.pack_name || null,
          hsn_code: d.hsn_code ? d.hsn_code.toString() : "",
          is_expiry: false,
          expiry_date: null,
          gst_preference: d.tax_percentage ? "Taxable" : 'Non-Taxable',
          tax_category_id: d.tax_percentage ? getTaxCategoryId(d.tax_percentage) : null,
          variant: null,
          lifecycle_months: null,
          warranty_months: null,
          limit: null,
          imageKeys: [],
          cost_price_includes_gst: 0,
          unit_price_includes_gst: 0,
        }
        dataApi.push(data)
      }
    };
    // console.log("dataApi",dataApi)
    // Proceed to API push or further logic
    if (dataApi.length > 0) {
      // this.setState({
      //   mp_open: true,
      //   dataApi,
      //   xl_data: cleanedData,
      // });
      apiCalls(
        this.context.setModalTypeHandler,
        this.context.setLoaderStatusHandler,
        await this.props.productBulkUploadAction(
          {
            data_items: dataApi,
            employee_id: this.context.commoncookie
          },
          async(response) => {
            const product = await response
            this.setState({ existingProduct: product, existingProductOpen: true })
          }
        )
      )
    } else {
      this.setState({ openAlert: true });
    }
  };


  render() {
        // let storage = getsessionStorage()
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;


    // const { user_rights } = this.props;
    const createProduct = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__product_master', 'can_create') 
    const exportProduct = UserRightsAuthorization(menuAccess[selectedRole], 'inventory__product_master', 'can_export') 
    return (
      <>
        <Helmet>
                 <meta charSet="utf-8" />
                 <title> {titleURL} | Product </title>
       </Helmet>
        <CreateNewButtonContext.Consumer>
          {({
            setLoaderStatusHandler,
            setModalTypeHandler,
            setModalStatusHandler,
            drawerOpen,
          }) => (
            <div
            // style={
            //   !this.props.isWidth
            //     ? {
            //         width: drawerOpen
            //           ? 'calc(100vw - 330px)'
            //           : 'calc(100vw - 143px)',
            //       }
            //     : {}
            // }
            >
              <AlertDialog
                delete={this.state.delete}
                handleClose={this.handleClose}
                handleDelete={this.handleDelete}
                id={this.state.id}
                checkproduct = {true}
              ></AlertDialog>
              {this.state.open === false && this.state.rowPopup.open === false && (
                <MaterialTable
                  // style={{height: 'calc(100vh - 80px)'}}
                  // totalCount={
                  //   this.state.searchVal
                  //     ? this.state.searchProductCount
                  //     : this.props.paginationCount
                  // }
                  totalCount={this.props.searchProductCount || 0}
                  components={{
                    ...stickyTableComponents,
                     Pagination: (props) => (
                                        <div
                                        style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        alignItems: "center",
                                         padding: "8px 16px",
                                         }}>
                                          <TablePagination
                                          {...props}
                                           count={this.props.searchProductCount} 
                                           page={this.state.page}
                                           rowsPerPage={this.state.pageSize}
                                           onPageChange={(event, page) => this.handlePageChange(page)}
                                           onRowsPerPageChange={(event) => this.handlePageSizeChange(Number(event.target.value))}/>
                                            </div>),
                    Toolbar: (props) => (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            width: '100%',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{width: '100%'}}>
                            <MTableToolbar {...props} />
                          </div>
                          <div>
                            <CommonSearch
                              searchVal={this.state.searchVal}
                              cancelSearch={this.cancelSearch}
                              requestSearch={this.requestSearch}
                            />
                            {/* <TextField
                              autoFocus={this.state.searchVal ? true : false}
                              sx={{
                                borderRadius: '8px',
                                pr: '10px',
                                '& .MuiOutlinedInput-root': {
                                  height: '42px',
                                },
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position='start'>
                                    <SearchIcon />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position='end'>
                                    <ClearIcon
                                      onClick={this.cancelSearch}
                                      sx={{cursor: 'pointer'}}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              placeholder='Search'
                              value={this.state.searchVal}
                              onChange={this.requestSearch}
                            /> */}
                          </div>
                        </div>
                      </>
                    ),
                  }}
                    actions={[
                      this.props.restrictUserLocationCreation.create_product === "enable" &&
                        createProduct
                        ? {
                          icon: 'add',
                          tooltip: 'add',
                          isFreeAction: true,
                          onClick: (event, rowData) =>
                            this.setState({
                              open: true,
                              status: 'create',
                              edit_id_data: [],
                            }),
                        }
                        : null,
                        createProduct
                        ? {
                          icon: () => <UploadFileIcon />,
                          tooltip: 'Upload',
                          isFreeAction: true,
                          onClick: () => {
                            this.setState({
                              uploadOpen: true
                            })
                          }
                        } : null
                    ]}

                  onPageChange={(page) => this.handlePageChange(page)}
                  onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
                  onRowClick={(evt, rowData) => {
                    
                    this.props.getCheckProductAction(rowData.item_id);
                  
                    this.setState({
                      rowPopup: {
                        open: true,
                        rowIndex: rowData.tableData.id,
                        item_id: rowData.item_id,
                      },
                    });
                  }}
                    options={getStickyTableOptions({
                      headerStyle,
                       bodyOffset: 190,
                      cellStyle,
                      options:{
                         showEmptyDataSourceMessage: this.state.isApiFinished,
                    exportButton: exportProduct ? true : false,
                    search: false,
                    filtering: false,
                    pagination: true,
                     tableLayout: "auto",
                     toolbar: true,
                    // maxBodyHeight: maxBodyHeight,
                    // minBodyHeight: maxBodyHeight,
                    pageSize: this.state.pageSize,
                    pageSizeOptions: [20, 50, 100],
                    totalCount: this.props.searchProductCount,
                    actionsColumnIndex: -1,
                    exportMenu: exportProduct ? [
                      {
                        label: 'Export PDF',
                        exportFunc: (cols, datas) =>

                        apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          this.props.listProductAction(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            (exportData) => {
                              ExportPdf(cols, exportData, 'ProductData');
                            },
                          )
                        )
                      },
                      {
                        label: 'Export CSV',
                        exportFunc: (cols, datas) =>
                        apiCalls(
                          setModalTypeHandler,
                          setLoaderStatusHandler,
                          this.props.listProductAction(
                            setModalTypeHandler,
                            setLoaderStatusHandler,
                            (exportData) => {
                              ExportCsv(cols, exportData, 'ProductData');
                            },
                          )
                        )
                      },
                    ] : [] ,
                      },
                    })}
                  page={this.state.page}
                  columns={[
                    {
                      field: 'name',
                      title: 'Product Name',
                      
                    },
                    {
                      field: 'category',
                      title: 'Category',
                    },
                    {
                      field: 'brand',
                      title: 'Brand',
                    },
                    {
                      field: 'description',
                      title: 'Description',
                    },
                    {
                      field: 'unit_price',
                      title: 'Unit Price',
                      // align: 'right', 
                      // cellStyle:{fontSize:cellStyle.fontSize,fontWeight:cellStyle.fontWeight},
                      render: (rowData) => (
                        <div
                          style={{
                            textAlign: 'right',
                            minWidth: '60px',
                            maxWidth: '80px',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rowData.unit_price.toFixed(2)}
                        </div>
                      )
                    },
                    {
                      field: 'tax_category',
                      title: 'Tax Category',
                    },
                  ]}
                  // data={
                  //   this.state.searchVal
                  //     ? this.state.searchData
                  //     : this.props.productByPagination
                  //     ? this.props.productByPagination.map((r, i) => {
                  //         const {tableData, ...record} = r;

                  //         return {i, ...record};
                  //       })
                  //     : []
                  // }

                  // data={
                  //   this.props.productByPagination.map((r, i) => {
                  //         const {tableData, ...record} = r;

                  //         return {i, ...record};
                  //       })
                  // }

                  // data={this.props.searchProductData?.length > 0 || this.state.searchVal.length > 0 ? this.props.searchProductData : this.props.productByPagination}

                  data = {this.props.searchProductData}


                  title={
                    <Typography variant='h6' align='left'  style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    Product</Typography>}
                />
              )}
              {this.state.open === true && (
                <ProductForm
                  edit_id_data={this.state.edit_id_data}
                  setParentEditIdData={(data) => this.setState({ edit_id_data: data })}
                  status={this.state.status}
                  type='product'
                  handleClose={this.handleClose}
                  handleSubmit={this.handleSubmit}
                  handleDeactive={this.handleDeactive}
                  {...this.props}
                  setModalStatusHandler={setModalStatusHandler}
                  setModalTypeHandler={setModalTypeHandler}
                />
              )}
              {this.state.rowPopup.open && (
                <TopOrder
                  searchData = {this.props.searchProductData} 
                  searchVal={this.state.searchVal} 
                  // productByPagination={this.props.productByPagination} 
                  rowPopupClose={this.rowPopupClose}
                  item_id={this.state.rowPopup.item_id}
                  rowIndex={this.state.rowPopup.rowIndex}
                  handleEdit={this.handleEdit}
                  handleDelete={this.handledialog}
                  type={'product'}
                  user_rights={menuAccess}
                />
              )}

              {this.state.uploadOpen && 
                <Dialog
                  open={this.state.uploadOpen}
                  fullWidth
                  PaperProps={{
                    style: { minWidth: '700px', padding: '30px' }
                  }}
                >
                  <Grid container flexDirection={'column'} justifyContent={'center'} spacing={5}>

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
                            type={'excel'}
                            previews={this.state.filePreviews}
                            setPreviews={(newPreviews) => {
                              this.setState((prevState) => ({
                                filePreviews:
                                  typeof newPreviews === 'function'
                                    ? newPreviews(prevState.filePreviews)
                                    : newPreviews,
                              }));
                            }}
                            style={{ width: '100%' }}
                            contactUpload={false}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid>
                      <Grid container alignItems="center" justifyContent="space-between">
                        {/* Sample Template Link */}
                        <Link
                          href={`${import.meta.env.BASE_URL}ProductUploadTemplate.xlsx`}
                          download="ProductUploadTemplate.xlsx"
                          underline="hover"
                          sx={{ display: "flex", alignItems: "center", cursor: "pointer", color: "primary.main" }}
                        >
                          <img src={excelicon} alt="ProductUploadTemplate.xlsx" style={{ height: 28, width: 24, marginRight: 8 }} />
                          Sample Template
                        </Link>

                        {/* Action Buttons */}
                        <Grid>
                          <Button onClick={() => this.setState({ uploadOpen: false, filePreviews: [] })} variant='contained' color='error' sx={{ marginRight: 2 }}>
                            Cancel
                          </Button>
                          <Button variant='contained' color='primary' disabled={this.state.filePreviews.length > 0 ? false : true}
                            onClick={() => {
                              this.props.listTaxCategoryAction()
                              this.setState({ uploadConfirmation: true, uploadOpen: false })
                            }}>
                            Upload
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                  </Grid>
                </Dialog>
              }

              {this.state.uploadConfirmation &&
                <Dialog
                  open={this.state.uploadConfirmation}
                  fullWidth
                  PaperProps={{
                    style: { minWidth: '700px',maxWidth:'auto', padding: '30px' }
                  }}
                >
                  <Grid container>
                    <Grid>
                      <Grid container justifyContent={'center'} alignItems={'center'}>
                        <IconButton>
                        <img src={addInventory} width={50} />
                        </IconButton>
                      </Grid>
                        <Typography>
                          Are you sure you want to proceed? New items will be added, and existing ones will remain unchanged.
                        </Typography>
                    </Grid>
                    <Grid container justifyContent="flex-end" spacing={3}>
                      <Grid>
                        <Button variant="contained" color="error" onClick={() => this.setState({ uploadConfirmation: false, filePreviews: [] })}>
                          Cancel
                        </Button>
                      </Grid>
                      <Grid>
                        <Button variant="contained" color="primary" onClick={()=> this.handleFileUpload()}>
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Dialog>
              }

              {
                this.state.existingProductOpen &&
                <Dialog open={this.state.existingProductOpen}>
                  <DialogTitle>
                    Alert
                  </DialogTitle>
                  <DialogContent>
                    <Typography>Some products already exist</Typography>
                    
                    {
                      this.state.existingProduct.map((d, index) => (
                        <TableRow key={index}>
                          <TableCell>{d}</TableCell>
                        </TableRow>
                      ))
                    }
                  </DialogContent>
                  <DialogActions>
                    <Grid container display='flex' justifyContent='flex-end'>
                      <Grid>
                        <Button onClick={() => this.setState({existingProduct: [], existingProductOpen: false})}>OK</Button>
                      </Grid>
                    </Grid>
                  </DialogActions>
                </Dialog>
              }
            </div>
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    product: state.productReducer.product,
    product_count: state.productReducer.product_count,
    product_id_data: state.productReducer.product_id_data,
    customer: state.customerReducer.customer,
    productcategory: state.productCategoryReducer.productcategory,
    taxcategory: state.taxCategoryReducer.taxcategory,
    vendor: state.vendorReducer.vendor,
    // hsn_details: state.productReducer.hsn_details,
    product_all_brand: state.productReducer.product_all_brand,
    product_all_category: state.productReducer.product_all_category,
    productByPagination: state.productReducer.productByPagination,
    paginationCount:state.productReducer.productByPaginationCount,
    // searchProduct: state.productReducer.searchProduct,
    searchProductData: state.productReducer.searchProduct,
    searchProductCount : state.productReducer.searchProductCount,
    check_product : state.productReducer.check_product,
    restrictUserLocationCreation: state.SubscriptionReducer.restrictUserLocationCreation || [],
    // user_rights : state.roleReducer.user_rights || []
     menuAccess: state.rbacReducer.menuAccess || []
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    listProductAction: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack,
    ) => {
      return dispatch(
        listProductAction(
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack,
        ),
      );
    },
    get_searchProductAction: (
      val, 
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        get_searchProductAction(
          val, 
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    set_searchProductAction: (val ) => { 
      return dispatch(set_searchProductAction(val));
    },
    productPaginationAction: (data) => { 
      return dispatch(productPaginationAction(data));
    },
    listVendorAction: () => {
      dispatch(listVendorAction());
    },
    createProductAction: (
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      setDisable,
    ) => {
      return dispatch(
        createProductAction(
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          setDisable,
        ),
      );
    },
    getbyidProductAction: (id) => {
      return dispatch(getbyidProductAction(id));
    },
    getCheckProductAction : (id) =>{
      return dispatch(getCheckProductAction(id))
    },
    getlimitdatafromproduct: (
      setModalTypeHandler,
      setLoaderStatusHandler,
      data,
    ) => {
      return dispatch(
        getlimitdatafromproduct(
          setModalTypeHandler,
          setLoaderStatusHandler,
          data,
        ),
      );
    },
    updateProductAction: (
      id,
      data,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
      response
    ) => {
      return dispatch(
        updateProductAction(
          id,
          data,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
          response
        ),
      );
    },
    deleteProductAction: (
      id,
      setModalTypeHandler,
      setLoaderStatusHandler,
      sample,
    ) => {
      return dispatch(
        deleteProductAction(
          id,
          setModalTypeHandler,
          setLoaderStatusHandler,
          sample,
        ),
      );
    },
    // listProductCategoryAction: () => {
    //   dispatch(listProductCategoryAction())
    // },
    listCustomerAction: () => {
      return dispatch(listCustomerAction());
    },
    restrictNewCreationBasedOnPlanAction : () =>{
      return dispatch(restrictNewCreationBasedOnPlanAction());
     },
    getUserRightsByRoleIdAction : () =>{
      return dispatch(getUserRightsByRoleIdAction());
     },
    productBulkUploadAction: (data, response) => {
      return dispatch(productBulkUploadAction(data, response))
    },
    listTaxCategoryAction: () => {
      return dispatch(listTaxCategoryAction());
    },
    OpenalertActions: (data) => {
      return dispatch(OpenalertActions(data))
    },
      getMenuAccessAction: (data) => {
      return dispatch(getMenuAccessAction(data))
    },
    // GetProductHsnDetails: () => {
    //   return dispatch(GetProductHsnDetails());
    // },
    // GetAllProductBrand: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(GetAllProductBrand(setModalTypeHandler, setLoaderStatusHandler));
    // },
    // GetAllProductCategory: (setModalTypeHandler, setLoaderStatusHandler) => {
    //   return dispatch(
    //     GetAllProductCategory(setModalTypeHandler, setLoaderStatusHandler),
    //   );
    // },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Product);

