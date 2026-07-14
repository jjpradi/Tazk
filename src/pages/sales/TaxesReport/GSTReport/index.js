import { Box, Grid, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import DataGridTemp from "components/dataGridTemp";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGSTReportAction, getSearchGstReportAction, GSTReportExportAction, setSearchGstReportAction } from "redux/actions/tax_actions";
import GSTReportFilter from "./GSTReportFilter";
import context from '../../../../context/CreateNewButtonContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { getsessionStorage } from "pages/common/login/cookies";
import { getBillingcompany } from "redux/actions/sales_actions";
import { useNavigate } from "react-router-dom";
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
function GSTReport(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { taxReducer: { gstReport: { data, numRows } }, salesReducer: { getbillingcompanydetails }, rbacReducer: {menuAccess = []} } = useSelector(state => state)
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(context);
  const storage = getsessionStorage();
  const subcompany = storage?.subcompany

  const [from, setFrom] = useState(moment().startOf('month'));
  const [to, setTo] = useState(moment().endOf('month'));
  const [dateRange, setDateRange] = useState('This Month')
  const [filterOpen, setFilterOpen] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null);
  const [subcompanyId, setSubcompanyId] = useState('All')

  const [pagination, setPagination] = useState({ pageCount: 0, numPerPage: 20, searchString: "" })

  useEffect(() => { subcompany > 0 && dispatch(getBillingcompany()) }, [subcompany])

  useEffect(() => { (async () => {
    await dispatch(getGSTReportAction({ fromDate: from, toDate: to, numPerPage: pagination.numPerPage, pageCount: pagination.pageCount, searchString: pagination.searchString, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
  })(); }, [pagination.pageCount, pagination.numPerPage])

  const handlePageChange = (page) => setPagination((prev) => ({ ...prev, pageCount: page }))
  const handlePageSizeChange = (size) => setPagination((prev) => ({ ...prev, numPerPage: size }))

  const requestSearch = (event) => {
    const val = event.target.value
    setPagination((prev) => ({ ...prev, searchString: val }))
    if(val.length >= 3 || val.length === 0) dispatch(setSearchGstReportAction({ data: [], numRows: 0 }))
    dispatch(getSearchGstReportAction({ pageCount: 0, numPerPage: pagination.numPerPage, searchString: val, fromDate: from, toDate: to }))
  }

  const cancelSearch = () => {
    setPagination((prev) => ({ ...prev, searchString: '' }))
    dispatch(setSearchGstReportAction({ data: [], numRows: 0 }))
    dispatch(getSearchGstReportAction({ pageCount: 0, numPerPage: pagination.numPerPage, searchString: '', fromDate: from, toDate: to }))
  }

  const ExportCsv = async () => {
    if (!reportExport) return;
    let rowData = []
    await dispatch(GSTReportExportAction({ fromDate: from, toDate: to, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler, (response) => { rowData = Array.isArray(response) ? response : [] }))
    if (!rowData.length) return;
    const headers = ['Tax Rate', 'Invoice Count', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax'];
    const csvRows = [headers.join(","), ...rowData.map(r => [r.tax_rate_name || r.tax_rate, r.invoice_count, r.taxable_value, r.cgst, r.sgst, r.igst, r.total_tax].map(v => `"${v ?? 0}"`).join(","))];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "GST_Report.csv";
    link.click();
  }

  const columns = [
    { headerName: 'Tax Rate', field: 'tax_rate_name', flex: 1 },
    { headerName: 'Tax %', field: 'tax_rate', flex: 0.5, align: 'center' },
    { headerName: 'Invoice Count', field: 'invoice_count', flex: 1, align: 'right', headerAlign: 'right' },
    { headerName: 'Taxable Value', field: 'taxable_value', flex: 1, align: 'right', headerAlign: 'right', valueGetter: (value) => parseFloat(value || 0).toFixed(2) },
    { headerName: 'CGST', field: 'cgst', flex: 1, align: 'right', headerAlign: 'right', valueGetter: (value) => parseFloat(value || 0).toFixed(2) },
    { headerName: 'SGST', field: 'sgst', flex: 1, align: 'right', headerAlign: 'right', valueGetter: (value) => parseFloat(value || 0).toFixed(2) },
    { headerName: 'IGST', field: 'igst', flex: 1, align: 'right', headerAlign: 'right', valueGetter: (value) => parseFloat(value || 0).toFixed(2) },
    { headerName: 'Total Tax', field: 'total_tax', flex: 1, align: 'right', headerAlign: 'right', valueGetter: (value) => parseFloat(value || 0).toFixed(2) },
  ]

  const handleChange = async (data) => {
    if(data.target.name === 'dateRange'){ await setFrom(data.target.value); await setTo(data.target.value1); await setDateRange(data.target.value2); }
    else if(data.target.name === 'subcompanyId'){ setSubcompanyId(data.target.value.sub_company_id) }
    else { let date_val = data.target.value.startOf('day').format('YYYY-MM-DD'); if(data.target.name === 'from') await setFrom(date_val); if(data.target.name === 'to') await setTo(date_val); }
  }

  const clearButton = async () => {
    setFrom(moment().startOf('month')); setTo(moment().endOf('month')); setDateRange(null); setSubcompanyId('All')
    await dispatch(getGSTReportAction({ fromDate: moment().startOf('month'), toDate: moment().endOf('month'), numPerPage: pagination.numPerPage, pageCount: pagination.pageCount, searchString: '', sub_company_id: 'All' }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const ApplyButton = async () => {
    await dispatch(getGSTReportAction({ fromDate: from, toDate: to, numPerPage: pagination.numPerPage, pageCount: pagination.pageCount, searchString: '', sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole], 'reports__taxes__gst_report', 'can_export')
  return(
    <>
      <Helmet><meta charSet="utf-8" /><title>{titleURL} | GST Report</title></Helmet>
      <DataGridTemp
        pageSize={pagination.numPerPage} page={pagination.pageCount} pageType='task'
        title={<Typography component='div' variant='h6' style={{ paddingTop: '10px', paddingBottom: '10px' }}><Box style={{ display: 'flex' }}><Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>&nbsp;/&nbsp;GST Report</Box></Typography>}
        gstr={true}
        gstrExport={reportExport ? (<><Tooltip title="Export"><IconButton onClick={(event) => setAnchorEl(event.currentTarget)}><FileDownloadIcon /></IconButton></Tooltip><Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}><MenuItem onClick={() => ExportCsv()}>Export CSV</MenuItem></Menu></> ) : null }
        data={data} columns={columns}
        onPageChange={(page) => handlePageChange(page)} onPageSizeChange={(size) => handlePageSizeChange(size)}
        rowCount={numRows} requestSearch={(event) => requestSearch(event)} cancelSearch={cancelSearch} searchVal={pagination.searchString}
        type='latestPayrollReport'
        filter={<div style={{display: 'flex', alignItems: 'center'}}><GSTReportFilter fromTo={true} from={from} to={to} subcompanyId={subcompanyId} dateRange={dateRange} handleChange={handleChange} handleClose={() => setFilterOpen(false)} handleOpen={() => setFilterOpen(true)} open={filterOpen} ApplyButton={ApplyButton} clearButton={clearButton} /></div>}
        isApiFinished={true}
      />
    </>
  )
}

export default GSTReport
