import MaterialTable, { MTableToolbar } from 'utils/SafeMaterialTable'
import React, { Component } from 'react'
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import {  filterPurchaseReportAction, searchPurchaseReportAction, searchPurchaseReportState, PurchaseReportfinalDataAction } from '../../../redux/actions/purchase_actions';
import { TextField, InputAdornment, Typography, Box , Link, IconButton, Dialog, Toolbar, Tabs, Tab, TablePagination} from '@mui/material';
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from '@mui/icons-material/Clear';
import { connect } from 'react-redux';
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import FilterPurchaseReport from './FilterPurchase';
import moment from 'moment';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { listVendorAction } from 'redux/actions/vendor_actions';
import { FilterAction } from 'redux/actions/customer_actions';
import apiCalls from 'utils/apiCalls';
import * as XLSX from "xlsx-js-style";
import { cellStyle, headerStyle, maxBodyHeight, pageSize } from 'utils/pageSize';
import DataGridTemp from 'components/dataGridTemp';
import {Helmet} from "react-helmet-async";
import { commonDateFormat } from 'utils/getTimeFormat';
import { Width } from 'utils/pageSize';
import { titleURL } from 'http-common';
import CommonSchedule from 'pages/sales/salesReport/CommonSchedule';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareReport from 'pages/sales/salesReport/ShareReport';
import ShareIcon from '@mui/icons-material/Share';
import CommonSearch from 'utils/commonSearch';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import withRouter from '../../../utils/custWithRouter';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { getStickyTableOptions, stickyTableComponents } from 'utils/stickyTableLayout';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';



class PurchaseReport extends Component {
	static contextType = CreateNewButtonContext;
	storage = getsessionStorage();
	constructor(props) {
		super(props);
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
		from: firstDay,
		to: lastDay,
		dateRange: null,
		location: 'null',
		customer: '',
		filterOpen: false,
		exportAlertOpen: false,
		exportAlertMessage: "",
		tabValue: 'lotWise',
		exportAlertType: "warning",
		filtedValue: {
			location_id: 'null',
			supplier: 'null',
		}, 
		shareOpen : false,
		title: 'Purchase Reports',
		columnData: [
			{
			headerName: 'Vendor Name',
			field: 'company_name',
			width: 200
			},
			{
			headerName: 'Product Name',
			field: 'product_name',
			width: 400
			},
			{headerName: 'Brand',  align : 'left',field: 'brand', width: Width('brand')},
			{ headerName: 'Category', field: 'category', width: 200 },
			{
			headerName: 'Invoice Date',
			field: 'invoice_date',
			renderCell: (params) => (
				moment(params.value).format('DD/MM/YYYY')
			),
			align : 'center',
			width:Width('date')
			},
			{headerName: 'Invoice Number', align : 'right',field: 'invoice_number', width: 130},
			{
			headerName: 'Billed On',
			field: 'billed_on',
			renderCell: (params) => (
				moment(params.value).format('DD/MM/YYYY hh:mm A')
			),width: 140
			},
			{headerName: 'Bill Number', align : 'center',field: 'bill_number', width: 110},
			{headerName: 'Receiving Qty', align : 'right',field: 'delivered_qty',width: 110},
			{headerName: 'Comment', field: 'comment', width: 200},
			{headerName: 'Created By', align : 'center',field: 'created_by', width: 150},
			{headerName: 'Due Amount',align : 'center', field: 'due_amount',width: 130},
			{headerName: 'Due Days', align : 'right',field: 'due_days',width: 130},
			{headerName: 'Location Name', field: 'location_name', width: Width('location name')},
			{headerName: 'Ordered Qty', align : 'right',field: 'ordered_qty',width: Width('quantity')},
			{headerName: 'Paid Amount', field: 'paid_amount',width:110, align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px', headerAlign: 'right' }},
			{headerName: 'Payment Type', field: 'paymentName',width: Width('payment mode')},
			{headerName: 'PO Date', field: 'po_date',width: Width('date')},
			{headerName: 'PO Number', align : 'center',field: 'original_po_number', width: 110},
			{headerName: 'Shipping Address', field: 'shipping_address', width: 200},
			{headerName: 'Status', field: 'bill_status',width: 130},
			{headerName: 'Total', field: 'total', align: 'right', cellStyle: { textAlign: 'right', paddingRight: '10px', headerAlign: 'right' }},
			{
			headerName: 'Updated At',
			width: Width('date'),
			field: 'updated_at',
			renderCell: (params) => {
			return params.value === null ? '' : moment(params.value).format('DD/MM/YYYY')
			},
			minWidth: 150
			}
		],
		isApiFinished: false,
		scheduleOpen  : false,
		Schedulecolumns  :  [
			{ name: "Vendor Name", key: "company_name" },
			{ name: "Product Name", key: "product_name" },
			{ name: "Brand", key: "brand" },
			{ name: "Category", key: "category" },
			{ name: "Invoice Date", key: "invoice_date" },
			{ name: "Invoice Number", key: "invoice_number" },
			{ name: "Receiving Qty", key: "delivered_qty" },
			{ name: "Due Amount", key: "due_amount" },
			{ name: "Due Days", key: "due_days" },
			{ name: "Location Name", key: "location_name" },
			{ name: "Ordered Qty", key: "ordered_qty" },
			{ name: "Paid Amount", key: "paid_amount" },
			{ name: "PO Date", key: "po_date" },
			{ name: "PO Number", key: "po_number" },
			{ name: "Status", key: "status" },
			{ name: "Total", key: "total" }
		]
		};

		this.purchaseWiseColums = [
			{
				title: 'Vendor',
				field: 'company_name'
			},
			{
				title: 'Location',
				field: 'location_name'
			},
			{
				title: 'Product',
				field: 'product_name'
			},
			{
				title: 'Brand',
				field: 'brand'
			},
			{
				title: 'Category',
				field: 'category'
			},
			{
				title: 'Invoice Date',
				field: 'invoice_date',
				render: (rowData) => (
				moment(rowData.invoice_date).format('DD/MM/YYYY')
				)
			},
			{
				title: 'Invoice Number',
				field: 'invoice_number'
			},
			{
				title: 'Billed On',
				field: 'billed_on',
				render: (rowData) => (
				moment(rowData.billed_on).format('DD/MM/YYYY')
				)
			},
			{
				title: 'Bill Number',
				field: 'bill_number'
			},
			{
				title: 'Receiving Qty',
				field: 'delivered_qty'
			},
			{
				title: 'Created By',
				field: 'created_by'
			},
			{
				title: 'Due Amount',
				field: 'due_amount'
			},
			{
				title: 'Due Days',
				field: 'due_days'
			},
			{
				title: 'Paid Amount',
				field: 'paid_amount'
			},
			{
				title: 'Payment Type',
				field: 'paymentName'
			},
			{
				title: 'PO Date',
				field: 'po_date'
			},
			{
				title: 'PO Number',
				field: 'original_po_number'
			},
			{
				title: 'Status',
				field: 'bill_status'
			},
			{
				title: 'Total',
				field: 'total'
			},
		]

		this.lotWiseColums = [
			{
				title: 'Vendor',
				field: 'company_name'
			},
			{
				title: 'Location',
				field: 'location_name'
			},
			{
				title: 'Product',
				field: 'product_name'
			},
			{
				title: 'Serial No',
				field: 'lot_number'
			},
			{
				title: 'Brand',
				field: 'brand'
			},
			{
				title: 'Category',
				field: 'category'
			},
			{
				title: 'Invoice Date',
				field: 'invoice_date',
				render: (rowData) => (
				moment(rowData.invoice_date).format('DD/MM/YYYY')
				)
			},
			{
				title: 'Invoice Number',
				field: 'invoice_number'
			},
			{
				title: 'Bill Number',
				field: 'bill_number'
			},
			{
				title: 'Created By',	
				field: 'created_by'
			},
			{
				title: 'Qty',
				field: 'quantity'
			},
			{
				title: 'Amount',
				field: 'item_cost_price'
			},
			{
				title: 'Tax %',
				field: 'tax_percentage'
			},
			{
				title: 'Tax Amount',
				field: 'tax_amount'
			},
			{
				title: 'Total',
				field: 'price_with_tax'
			},
		]
	}


	async componentDidMount() {
		const selectedRole = this.storage?.role_name;
		this.props.searchPurchaseReportState([])
		const context = this.context;
		
		const data = {
			from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD',),
			to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
			employeeId:context.commoncookie,
			location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
			supplierId:[],
			pageCount: 0,
			numPerPage:  this.state.pageSize,
			searchString: '',
			pageType: this.state.tabValue
		}
		// apiCalls(
		// 	context.setModalTypeHandler,
		// 	context.setLoaderStatusHandler,
		// 	this.props.PurchaseReportfinalDataAction(data)
		// ).finally(() => this.setState({isApiFinished: true}))
	}

	async componentDidUpdate(prevProps, prevState) {
		const context = this.context;
		let headerLocationId = context.headerLocationId;
		const { location_id, supplier } = this.state.filtedValue
		if(headerLocationId !== this.headerupdate) {
			this.headerupdate = headerLocationId;
			this.setState({
				filtedValue: {
					...this.state.filtedValue,
					location_id: context.headerLocationId
				}
			})
			const data = {
				from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
				to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
				employeeId:context.commoncookie,
				location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
				supplierId:[],
				pageCount: 0,
				numPerPage: this.state.pageSize,
				searchString: this.state.searchVal,
				pageType: this.state.tabValue
			}
			apiCalls(
				context.setModalTypeHandler,
				context.setLoaderStatusHandler,
				this.props.PurchaseReportfinalDataAction(data)
			).finally(() => this.setState({ isApiFinished: true }))
		}

		if(prevState.pageSize !== this.state.pageSize) {
			const data = {
				from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
				to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
				employeeId:context.commoncookie,
				location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
				supplierId:[],
				pageCount: 0,
				numPerPage: this.state.pageSize,
				searchString: this.state.searchVal,
				pageType: this.state.tabValue
			}
			apiCalls(
				context.setModalTypeHandler,
				context.setLoaderStatusHandler,
				this.props.PurchaseReportfinalDataAction(data)
			)
		}

		if(prevState.page !== this.state.page) {
			const data = {
				from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
				to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
				employeeId:context.commoncookie,
				location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
				supplierId:[],
				pageCount: this.state.page,
				numPerPage: this.state.pageSize,
				searchString: this.state.searchVal,
				pageType: this.state.tabValue
			}
			apiCalls(
				context.setModalTypeHandler,
				context.setLoaderStatusHandler,
				this.props.PurchaseReportfinalDataAction(data)
			)
		}

		if(prevState.tabValue !== this.state.tabValue) {
			var date = new Date()
			var firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

			this.setState({
				from: firstDay,
				to: lastDay,
				filtedValue: {
					location_id: 'null',
					supplier: 'null'
				}
			})
			const data = {
				from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
				to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
				employeeId:context.commoncookie,
				location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
				supplierId:[],
				pageCount: this.state.page,
				numPerPage: this.state.pageSize,
				searchString: this.state.searchVal,
				pageType: this.state.tabValue
			}
			apiCalls(
				context.setModalTypeHandler,
				context.setLoaderStatusHandler,
				this.props.PurchaseReportfinalDataAction(data)
			)
		}
	}


	handlePageSizeChange = async (size) => {
		this.setState({ pageSize: size, page: 0 })
	}


	handlePageChange = async (page) => {
		this.setState({ page: page })
	}

	escapeRegExp = (value) => {
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
	}

	requestSearch = (e) => {
		const value = typeof e === 'string' ? e : e.target?.value || '';
		this.setState({ searchVal: value });
		if(value.length >= 3 || value.length === 0) {
			this.props.searchPurchaseReportState([]);
		}
		const context = this.context;

		const data = {
			from: moment(this.state.from).format('YYYY-MM-DD'),
			to: moment(this.state.to).format('YYYY-MM-DD'),
			employeeId: context.commoncookie,
			location_id: context.headerLocationId === 'null' ? 'null' : [context.headerLocationId],
			supplierId: [],
			pageCount: 0,
			numPerPage: this.state.pageSize,
			searchString: value,
			pageType: this.state.tabValue
		}
		apiCalls(
			context.setModalTypeHandler,
			context.setLoaderStatusHandler,
			this.props.searchPurchaseReportAction(data)
		)
	}


	cancelSearch = (e) => {
		this.setState({searchVal: '',page:0});
		this.props.searchPurchaseReportState([])
		const context = this.context;
		const data = {
			from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
			to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
			employeeId:context.commoncookie,
			location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
			supplierId:[],
			pageCount: 0,
			numPerPage:  this.state.pageSize,
			searchString: '',
			pageType: this.state.tabValue
		};
		apiCalls(
			context.setModalTypeHandler,
			context.setLoaderStatusHandler,
			this.props.PurchaseReportfinalDataAction(data)
		)
	}

	clearButton = () => {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		const context = this.context;

		this.setState({
			from: firstDay,
			to: lastDay,
			filtedValue: {
				location_id: 'null',
				supplier: 'null',
			},
		})
		const data = {
			from: moment(firstDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
			to: moment(lastDay, 'year', 'month', 'day').format('yyyy-MM-DD'),
			employeeId:context.commoncookie,
			location_id: context.headerLocationId === 'null'? 'null':[context.headerLocationId],
			supplierId:[],
			pageCount: 0,
			numPerPage:  this.state.pageSize,
			searchString: this.state.searchVal,
			pageType: this.state.tabValue
		};

		this.setState({page: 0})

		apiCalls(
			context.setModalTypeHandler,
			context.setLoaderStatusHandler,
			this.props.PurchaseReportfinalDataAction(data)
		)
		this.setState({filterOpen: false})
		
	};

	ApplyButton = async (formValue) => {
		this.setState({ filtedValue: formValue });
		const { location_id, supplier } = formValue;
		const context = this.context;
		const data = {
			from: moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD'),
			to: moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD'),
			employeeId:context.commoncookie,
			location_id: this.commonFilterMapping(location_id, 'location_id'),
			supplierId:this.commonFilterMapping(supplier, 'supplier_id'),
			pageCount: 0,
			numPerPage:  this.state.pageSize,
			searchString: this.state.searchVal,
			pageType: this.state.tabValue
		}

		this.setState({page: 0})

		apiCalls(
			context.setModalTypeHandler,
			context.setLoaderStatusHandler,
			this.props.PurchaseReportfinalDataAction(data)
		);
		this.setState({ filterOpen: false });
	}

	handleExportExcel = async () => {
		const context = this.context;

		const data = {
			from: moment(this.state.from).format('YYYY-MM-DD'),
			to: moment(this.state.to).format('YYYY-MM-DD'),
			employeeId: context.commoncookie,
			location_id: context.headerLocationId === 'null' ? 'null' : [context.headerLocationId],
			supplierId: this.commonFilterMapping(this.state.filtedValue.supplier, 'supplier_id'),
			pageCount: 0,           
			numPerPage: this.props.searchPurchaseReportCount,          
			searchString: this.state.searchVal,
			export: true,
			pageType: this.state.tabValue
		};

		const response = await apiCalls(
			context.setModalTypeHandler,
			context.setLoaderStatusHandler,
			this.props.searchPurchaseReportAction(data)
		);

		const exportData = response?.data || this.props.searchPurchaseReportData;

		if (!exportData?.length) {
			this.setState({
				exportAlertOpen: true,
				exportAlertMessage: "No data found for export.",
				exportAlertType: "warning"
			});
			return;
		}

		this.generateExcel(exportData)
	}

    formatDateTime = (value) => {
		if (!value) return "";

		const m = moment(value, [
			"DD-MM-YYYY hh.mm.ss A",
			"YYYY-MM-DD HH:mm:ss",
			moment.ISO_8601
		]);

      	return m.isValid() ? m.format("DD-MM-YYYY hh:mm:ss A") : value;
    }

   	generateExcel = (rows) => {

      const dateFields = [
        "invoice_date",
        "billed_on",
        "updated_at"
      ];

      const exportColumns = this.state.tabValue === 'lotWise' ? this.lotWiseColums : this.purchaseWiseColums
        .filter(col => col.title && col.field)
        .map(col => ({ field: col.field, title: col.title }));


      const formattedData = rows.map(row =>
        Object.fromEntries(
          exportColumns.map(col => {
            let value = row[col.field];

            if (dateFields.includes(col.field)) {
              value = this.formatDateTime(value);
            }

            return [col.title, value];
          })
        )
      );

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Report");
      XLSX.writeFile(workbook, "Purchase_Report.xlsx");
    }

	commonFilterMapping = (array, columnName) => {
		if (typeof array === 'object') {
			let Data = array.map((a) => a[columnName]);
			return Data;
		} 
		else {
			return array;
		}
	}

  	handleFilter = (data) => this.setState({filterOpen: data});

	handleChange = async (data) => {
		if(data.target.name === 'dateRange') {
			var date_val = data.target.value;
			var date_val1 = data.target.value1;
			var date_val2 = data.target.value2;
			await this.setState({['from']: date_val});
			await this.setState({['to']: date_val1});
			await this.setState({['dateRange']: date_val2});
		}
		else {
			var date_val = data.target.value._d;
			await this.setState({[data.target.name]: date_val});
		}
		if(moment(this.state.from, 'year') <= moment(this.state.to, 'year')) {
			if (moment(this.state.from, 'month') <= moment(this.state.to, 'month')) {
				if(moment(this.state.from, 'day') <= moment(this.state.to, 'day')) {
					this.setState({errormsg: {from: '', to: ''}});
				} 
				else {
					this.setState({
						errormsg: {
						...this.state.errormsg,
						[data.target.name]: 'Invalid Date 1',
						},
					});
				}
			} 
			else {
				this.setState({
					errormsg: {
						...this.state.errormsg,
						[data.target.name]: 'Invalid Date 2',
					},
				});
			}
		} 
		else {
			this.setState({
				errormsg: {
					...this.state.errormsg,
					[data.target.name]: 'Invalid Date 3',
				},
			});
		}
	};

  	handleClose = () => this.setState({scheduleOpen: false});

  	handleShareClose =()=> this.setState({shareOpen : false})

	render() {
		const { menuAccess = {} } = this.props;
		const selectedRole = this.storage?.role_name;
		const purchaseReportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__transactions__purchase', 'can_export');
		return (
			<>
				<Helmet>
					<meta charSet="utf-8" />
					<title> {titleURL} | Purchase Report </title>
				</Helmet>

				<Snackbar
					open={this.state.exportAlertOpen}
					autoHideDuration={3000}
					onClose={() => this.setState({ exportAlertOpen: false })}
					anchorOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<Alert
						severity={this.state.exportAlertType || "warning"}
						variant="filled"
						onClose={() => this.setState({ exportAlertOpen: false })}
						sx={{ width: "100%", borderRadius: "6px" }}
					>
						{this.state.exportAlertMessage}
					</Alert>
				</Snackbar>


				<CreateNewButtonContext.Consumer>
					{({
						drawerOpen,
						commoncookie,
						headerLocationId,
						setModalTypeHandler,
						setLoaderStatusHandler,
					}) => (
						<React.Fragment>
							<div>
								<Tabs value={this.state.tabValue} onChange={(event, newValue) => this.setState({tabValue: newValue})} sx={{mt:-4}}>
									<Tab value='lotWise' label='Lot Wise' sx={{fontSize:"13px"}} />
									<Tab value='purchaseWise' label='Purchase Wise' sx={{fontSize:"13px"}} />
								</Tabs>

								<MaterialTable 
									style={{height: 'calc(100vh - 110px)', overflow: "hidden"}}
									totalcount={this.props.searchPurchaseReportCount}
									// page={this.state.page}
									columns={this.state.tabValue === 'lotWise' ? this.lotWiseColums : this.purchaseWiseColums}
									data={this.props.searchPurchaseReportData}
									// onPageChange={(page) => this.handlePageChange(page)}
									// onRowsPerPageChange={(size) => this.handlePageSizeChange(size)}
									options={getStickyTableOptions({
										bodyOffset: 215,
										headerStyle,
										options: {
											showEmptyDataSourceMessage: this.state.isApiFinished,
											cellStyle,
											search: false,
											exportButton: purchaseReportExport ? true : false,
											filtering: false,
											pagination: true,
											pageSize: this.state.pageSize,
											pageSizeOptions: [20, 50, 100],
											totalCount: this.props.searchSalesReportCount || 0,
											actionsColumnIndex: -1,
											tableLayout: "auto",
                                            toolbar: true,
										}
									})}
									components={{
										...stickyTableComponents,
										Pagination: (props) => (
                                          <TablePagination
                                           {...props}
										   component="div"
                                           count={Number(this.props.searchPurchaseReportCount ?? 0)}
										   rowsPerPageOptions={[20, 50, 100]}
                                           labelRowsPerPage="Rows per Page:" 
                                           page={this.state.page || 0}
										   rowsPerPage={this.state.pageSize || 20}
                                           onPageChange={(event, page) => this.handlePageChange(page)}
                                           onRowsPerPageChange={(event) => this.handlePageSizeChange(parseInt(event.target.value, 10))}
                                         />
                                ),
										Toolbar: (props) => (
											<>
												<div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
													<Box sx={{ width: '100%', '& button[aria-label="Export"]': { mt: '10px' } }}>
														<MTableToolbar {...props} />
													</Box>
													<div>
														<CommonSearch 
															searchVal={this.state.searchVal}
															cancelSearch={this.cancelSearch}
															requestSearch={this.requestSearch}
														/>
													</div>
												</div>
											</>
										)
									}}
									actions={[
										{
											icon: () => <FilterAltIcon />,
											tooltip: 'Filter',
											isFreeAction: true,
											onClick: () => this.setState({ filterOpen: true })
										},
										{
											icon: () => (
												<div style={{display:'flex'}}>
												<IconButton onClick={()=> this.setState({scheduleOpen:true})}>
													<ScheduleIcon/>
												</IconButton>
												<Dialog open={this.state.scheduleOpen}>
													<CommonSchedule
													report_name={'Purchase Report'}
													handleClose={this.handleClose}
													open={this.state.scheduleOpen}
													columns={this.state.Schedulecolumns}
													/>
												</Dialog>
												</div>
											),
											tooltip: 'Schedule',
											isFreeAction: true
										},
										{
											icon: () => (
												<div style={{display:'flex'}}>
												<IconButton onClick={()=> this.setState({shareOpen:true})}>
													<ShareIcon />
												</IconButton>
												<Dialog open={this.state.shareOpen}>
													<ShareReport
													report_name={'Purchase Report'}
													handleClose={this.handleShareClose}
													open={this.state.shareOpen}
													columns={this.state.Schedulecolumns}
													data={this.props.searchPurchaseReportData}
													fromDate={moment(this.state.from, 'year', 'month', 'day').format('yyyy-MM-DD')}
													toDate={moment(this.state.to, 'year', 'month', 'day').format('yyyy-MM-DD')}
													/>
												</Dialog>
												</div>
											),
											tooltip: 'Share',
											isFreeAction: true
										},
										purchaseReportExport && {
											icon: () => (
												<div style={{display:'flex'}}>
												<IconButton onClick={this.handleExportExcel}>
													<FileDownloadIcon />
												</IconButton>
												</div>
											),
											tooltip: 'export',
											isFreeAction: true
										},
									]}
									title={
										<Typography variant='h6' align='left' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
										<Box style={{ display: 'flex' }}>
											<Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => this.props.history('/report')}>Home</Box>
											&nbsp;/&nbsp;Purchase Reports
										</Box>
										</Typography>
									}
								/>
								{
									this.state.filterOpen && 
									<FilterPurchaseReport
										fromTo={true}
										catabrand={false}
										from={this.state.from}
										locat={false}
										to={this.state.to}
										dateRange={this.state.dateRange}
										// count={this.state.count}
										// product={this.props.product}
										// category={this.state.category}
										// brand={this.state.brand}
										// list_payment_type={this.props.list_payment_type}
										stocklocation={this.props.stocklocation}
										filtedValue={this.state.filtedValue}
										// setFilter={this.setFilter}
										// brandSearch={this.brandSearch}
										supplier={this.props.vendor}
										handleChange={this.handleChange}
										handleClose={this.handleFilter}
										open={this.state.filterOpen}
										ApplyButton={this.ApplyButton}
										clearButton={this.clearButton}
									/>
								}
							</div>
						</React.Fragment>
					)}
				</CreateNewButtonContext.Consumer>
			</>
		);
  }
}

const mapStateToProps = state => {
  return {
    purchases: state.purchasesReducer.purchases || [],
    stocklocation: state.stockLocationReducer.stocklocation || [],
    vendor: state.customerReducer.customer_filter || [],
    searchPurchaseReportData: state.purchasesReducer.searchPurchaseReportData || [],
    searchPurchaseReportCount: state.purchasesReducer.searchPurchaseReportCount || 0,
	menuAccess: state.rbacReducer.menuAccess || [],
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    filterPurchaseReportAction: (setModalTypeHandler, setLoaderStatusHandler, exportCallBack) => {
      return dispatch(filterPurchaseReportAction(setModalTypeHandler, setLoaderStatusHandler, exportCallBack))
    },
    listStockLocationAction: (
      commoncookie,
      headerLocationId,
      setModalTypeHandler,
      setLoaderStatusHandler,
    ) => {
      return dispatch(
        listStockLocationAction(
          commoncookie,
          headerLocationId,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    },
    FilterAction: (
      type,
      type_details,
      setModalTypeHandler,
      setLoaderStatusHandler,
      exportCallBack,
      
    ) => {
      return dispatch(
        FilterAction(
          type,
          type_details,
          setModalTypeHandler,
          setLoaderStatusHandler,
          exportCallBack,
        ),
      );
    },
    searchPurchaseReportState: (val ) => { return dispatch(searchPurchaseReportState(val))
    },
    searchPurchaseReportAction: (
      val,
      setModalTypeHandler,
      setLoaderStatusHandler,
      ) => { 
      return dispatch(
        searchPurchaseReportAction(
          val,
          setModalTypeHandler,
          setLoaderStatusHandler,
          )
        );
    },
    PurchaseReportfinalDataAction: (data) => { 
      return dispatch(PurchaseReportfinalDataAction(data));
    },
      }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PurchaseReport));



