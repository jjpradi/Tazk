import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Typography, Box, IconButton, Snackbar, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import moment from 'moment';
import * as XLSX from 'xlsx-js-style';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import { manualCnReportAction } from '../../../redux/actions/cndn_report_actions';
import DataGridTemp from 'components/dataGridTemp';
import { Helmet } from 'react-helmet-async';
import { titleURL } from 'http-common';
import CommonSearch from 'utils/commonSearch';
import apiCalls from 'utils/apiCalls';
import withRouter from '../../../utils/custWithRouter';
import FilterCnDn from '../returnCreditNotesReport/FilterCnDn';
import { UserRightsAuthorization } from '../../../@crema/utility/helper/UserRightsHelper';
import { getsessionStorage } from 'pages/common/login/cookies';
const COLUMNS = [
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

class ManualCreditNotesReport extends Component {
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
      isApiFinished: false,
      button: '4',
      exportAlertOpen: false,
      exportAlertMessage: '',
      exportAlertType: 'warning',
    };
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
    };
    apiCalls(
      context.setModalTypeHandler,
      context.setLoaderStatusHandler,
      this.props.manualCnReportAction(data)
    ).finally(() => this.setState({ isApiFinished: true }));
  };

  handlePageChange = (page) => {
    this.setState({ page }, this.loadData);
  };

  handlePageSizeChange = (size) => {
    this.setState({ pageSize: size, page: 0 }, this.loadData);
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
    };
    try {
      await apiCalls(
        context.setModalTypeHandler,
        context.setLoaderStatusHandler,
        this.props.manualCnReportAction(data)
      );
      const exportData = this.props.reportData;
      if (!exportData?.length) {
        this.setState({ exportAlertOpen: true, exportAlertMessage: 'No data found for export.', exportAlertType: 'warning' });
        return;
      }
      const formatted = exportData.map(row =>
        Object.fromEntries(COLUMNS.map(col => [col.headerName, row[col.field]]))
      );
      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Manual Credit Notes');
      XLSX.writeFile(wb, 'Manual_Credit_Notes.xlsx');
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
const manualCnExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__transactions__manual_credit_notes', 'can_export');
    const filteredData = this.getFilteredData();

    return (
      <>
        <Helmet>
          <title>{titleURL} | Manual Credit Notes Report</title>
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
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => this.props.history('/report')}>Home</Box>
                    &nbsp;/&nbsp;Manual Credit Notes
                  </Box>
                </Typography>
              }
              pageType="task"
              data={filteredData}
              columns={COLUMNS}
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
                  {manualCnExport && (
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
  reportData: state.cndnReportReducer.manualCnData || [],
  reportCount: state.cndnReportReducer.manualCnCount || 0,
  grandTotal: state.cndnReportReducer.manualCnGrandTotal || 0,
  monthlySummary: state.cndnReportReducer.manualCnMonthlySummary || [],
  menuAccess: state.rbacReducer.menuAccess || [],
});

const mapDispatchToProps = (dispatch) => ({
  manualCnReportAction: (data) => dispatch(manualCnReportAction(data)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManualCreditNotesReport));
