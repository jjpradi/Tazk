import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Typography, Box, IconButton, Chip, Snackbar, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { returnCnReportAction } from '../../../redux/actions/cndn_report_actions';
import DataGridTemp from 'components/dataGridTemp';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';
import withRouter from '../../../utils/custWithRouter';
import FilterCnDn from './FilterCnDn';
import { UserRightsAuthorization } from '../../../@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';

const CN_WISE_COLUMNS = [
  { headerName: 'CN Number', field: 'cn_number', width: 160 },
  { headerName: 'CN Date', field: 'cn_date', width: 120 },
  { headerName: 'Customer Name', field: 'customer_name', width: 220 },
  { headerName: 'Invoice Numbers', field: 'invoice_numbers', width: 180 },
  { headerName: 'Items', field: 'items_description', width: 250 },
  { headerName: 'GST Amount', field: 'gst_amount', width: 120, align: 'right' },
  { headerName: 'CN Amount', field: 'cn_amount', width: 130, align: 'right' },
  { headerName: 'Location', field: 'location_name', width: 150 },
  { headerName: 'Created At', field: 'created_at', width: 170 },
];

const LOT_WISE_COLUMNS = [
  { headerName: 'CN Number', field: 'cn_number', width: 160 },
  { headerName: 'CN Date', field: 'cn_date', width: 120 },
  { headerName: 'Customer Name', field: 'customer_name', width: 200 },
  { headerName: 'Invoice Number', field: 'invoice_number', width: 150 },
  { headerName: 'Product Name', field: 'product_name', width: 220 },
  { headerName: 'SKU', field: 'sku', width: 120 },
  { headerName: 'Lot Number', field: 'lot_number', width: 140 },
  { headerName: 'Serial Number', field: 'serial_number', width: 140 },
  { headerName: 'Return Qty', field: 'return_qty', width: 100, align: 'right' },
  { headerName: 'Unit Price', field: 'unit_price', width: 110, align: 'right' },
  { headerName: 'Item Total', field: 'item_total', width: 120, align: 'right' },
  { headerName: 'Location', field: 'location_name', width: 150 },
  { headerName: 'Created At', field: 'created_at', width: 170 },
];

class ReturnCreditNotesReport extends Component {
  storage = getsessionStorage();
  static contextType = CreateNewButtonContext;

  constructor(props) {
    super(props);
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state = {
      page: 0,
      pageSize: 20,
      from: firstDay,
      to: lastDay,
      searchVal: '',
      filterOpen: false,
      viewMode: 'cn', // 'cn' or 'lot'
      isApiFinished: false,
      button: '4',
      exportAlertOpen: false,
      exportAlertMessage: '',
      exportAlertType: 'warning',
    };
  }

  componentDidMount() {
    // Data loads on componentDidUpdate when headerLocationId is available
  }

  componentDidUpdate(prevProps, prevState) {
    const context = this.context;
    let headerLocationId = context.headerLocationId;
    if (headerLocationId !== this.headerupdate) {
      this.headerupdate = headerLocationId;
      this.loadData();
    }
  }

  loadData = () => {
    const context = this.context;
    const data = {
      from: moment(this.state.from).format('YYYY-MM-DD'),
      to: moment(this.state.to).format('YYYY-MM-DD'),
      pageCount: this.state.page,
      numPerPage: this.state.pageSize,
      viewMode: this.state.viewMode,
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.returnCnReportAction(data)
    ).finally(() => this.setState({ isApiFinished: true }));
  };

  handlePageChange = (page) => {
    this.setState({ page }, this.loadData);
  };

  handlePageSizeChange = (size) => {
    this.setState({ pageSize: size, page: 0 }, this.loadData);
  };

  handleViewModeChange = (mode) => {
    this.setState({ viewMode: mode, page: 0 }, this.loadData);
  };

  handlePreviousMonthClick = (monthStr) => {
    const parts = monthStr.trim().split(' ');
    const monthIndex = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(parts[0]);
    const year = parseInt(parts[1]);
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    this.setState({ from: firstDay, to: lastDay, page: 0 }, this.loadData);
  };

  handleChange = (data) => {
    const val = data.target.value._d || data.target.value;
    this.setState({ [data.target.name]: val });
  };

  handleFilter = (data) => this.setState({ filterOpen: data });

  ApplyButton = () => {
    const daysDiff = Math.ceil((new Date(this.state.to) - new Date(this.state.from)) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      this.setState({ exportAlertOpen: true, exportAlertMessage: 'Date range cannot exceed 90 days', exportAlertType: 'warning' });
      return;
    }
    this.setState({ page: 0, filterOpen: false }, this.loadData);
  };

  clearButton = () => {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.setState({ from: firstDay, to: lastDay, page: 0, filterOpen: false }, this.loadData);
  };

  requestSearch = (e) => {
    const value = typeof e === 'string' ? e : e.target?.value || '';
    this.setState({ searchVal: value });
  };

  cancelSearch = () => {
    this.setState({ searchVal: '' });
  };

  handleExportExcel = async () => {
    const daysDiff = Math.ceil((new Date(this.state.to) - new Date(this.state.from)) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      this.setState({ exportAlertOpen: true, exportAlertMessage: 'Export limited to 90 days. Please narrow the date range.', exportAlertType: 'warning' });
      return;
    }
    const context = this.context;
    const data = {
      from: moment(this.state.from).format('YYYY-MM-DD'),
      to: moment(this.state.to).format('YYYY-MM-DD'),
      pageCount: 0,
      numPerPage: 10000,
      viewMode: this.state.viewMode,
    };
    try {
      const res = await apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.returnCnReportAction(data)
      );
      const exportData = this.props.reportData;
      if (!exportData?.length) {
        this.setState({ exportAlertOpen: true, exportAlertMessage: 'No data found for export.', exportAlertType: 'warning' });
        return;
      }
      const columns = this.state.viewMode === 'lot' ? LOT_WISE_COLUMNS : CN_WISE_COLUMNS;
      const formatted = exportData.map(row =>
        Object.fromEntries(columns.map(col => [col.headerName, row[col.field]]))
      );
      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Return Credit Notes');
      XLSX.writeFile(wb, `Return_Credit_Notes_${this.state.viewMode === 'lot' ? 'LotWise' : 'CNWise'}.xlsx`);
    } catch (err) {
      console.error(err);
    }
  };

  getFilteredData = () => {
    const { searchVal } = this.state;
    const data = this.props.reportData || [];
    if (!searchVal) return data;
    const q = searchVal.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => v && String(v).toLowerCase().includes(q))
    );
  };

  render() {
    const { menuAccess = {} } = this.props;
    const selectedRole = this.storage?.role_name;
    const ReportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__transactions__sales_return_credit_notes', 'can_export');
    const columns = this.state.viewMode === 'lot' ? LOT_WISE_COLUMNS : CN_WISE_COLUMNS;
    const filteredData = this.getFilteredData();

    return (
      <>
        <Helmet>
          <title>{titleURL} | Sales Return Credit Notes Report</title>
        </Helmet>
        <Snackbar
          open={this.state.exportAlertOpen}
          autoHideDuration={3000}
          onClose={() => this.setState({ exportAlertOpen: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert severity={this.state.exportAlertType} variant="filled" onClose={() => this.setState({ exportAlertOpen: false })} sx={{ width: '100%', borderRadius: '6px' }}>
            {this.state.exportAlertMessage}
          </Alert>
        </Snackbar>

        <CreateNewButtonContext.Consumer>
          {({ setModalTypeHandler, setLoaderStatusHandler }) => (
            <DataGridTemp
              pageSize={this.state.pageSize}
              page={this.state.page}
              showCurrentMonthChip={true}
              title={
                <Typography variant="h6" align="left" sx={{ pt: '10px', pb: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => this.props.history('/report')}>Home</Box>
                    &nbsp;/&nbsp;Sales Return Credit Notes
                    <Chip
                      label="CN Wise"
                      size="small"
                      color={this.state.viewMode === 'cn' ? 'primary' : 'default'}
                      variant={this.state.viewMode === 'cn' ? 'filled' : 'outlined'}
                      onClick={() => this.handleViewModeChange('cn')}
                      sx={{ ml: 1 }}
                    />
                    <Chip
                      label="Lot Wise"
                      size="small"
                      color={this.state.viewMode === 'lot' ? 'primary' : 'default'}
                      variant={this.state.viewMode === 'lot' ? 'filled' : 'outlined'}
                      onClick={() => this.handleViewModeChange('lot')}
                    />
                  </Box>
                </Typography>
              }
              pageType="task"
              data={filteredData}
              columns={columns}
              handlePreviousMonthClick={(month, btn) => { this.setState({ button: btn }); this.handlePreviousMonthClick(month); }}
              button={this.state.button}
              setButton={(btn) => this.setState({ button: btn })}
              filter={
                <FilterCnDn
                  from={this.state.from}
                  to={this.state.to}
                  open={this.state.filterOpen}
                  handleClose={this.handleFilter}
                  handleChange={this.handleChange}
                  ApplyButton={this.ApplyButton}
                  clearButton={this.clearButton}
                />
              }
              exportReport={
                <div style={{ display: 'flex' }}>
                  {ReportExport && (
                  <IconButton onClick={this.handleExportExcel}>
                    <FileDownloadIcon />
                  </IconButton>
                  )}
                </div>
              }
              search={
                <CommonSearch
                  searchVal={this.state.searchVal}
                  cancelSearch={this.cancelSearch}
                  requestSearch={this.requestSearch}
                  style={{ width: '200px' }}
                />
              }
              onPageChange={(page) => this.handlePageChange(page)}
              onPageSizeChange={(size) => this.handlePageSizeChange(size)}
              rowCount={this.props.reportCount}
              type="filter"
              isApiFinished={this.state.isApiFinished}
            />
          )}
        </CreateNewButtonContext.Consumer>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  reportData: state.cndnReportReducer.returnCnData || [],
  reportCount: state.cndnReportReducer.returnCnCount || 0,
  grandTotal: state.cndnReportReducer.returnCnGrandTotal || 0,
  monthlySummary: state.cndnReportReducer.returnCnMonthlySummary || [],
  menuAccess: state.rbacReducer.menuAccess || [],
});

const mapDispatchToProps = (dispatch) => ({
  returnCnReportAction: (data) => dispatch(returnCnReportAction(data)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ReturnCreditNotesReport));
