import { Box, Chip, Grid, IconButton, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import DataGridTemp from "components/dataGridTemp";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGST2ReportAction, getSearchGst2ReportAction, GST2ExportAction, setSearchGst2ReportAction } from "redux/actions/tax_actions";
import GSTR2Filter from "./GSTR2Filter";
import context from '../../../../context/CreateNewButtonContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from "jspdf";
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { getsessionStorage } from "pages/common/login/cookies";
import { getBillingcompany } from "redux/actions/sales_actions";
import { useNavigate } from "react-router-dom";
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function GST2Report(){
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    taxReducer: { gst2Report: { data, numRows } },
    salesReducer:{ getbillingcompanydetails},
     rbacReducer: { menuAccess = {} }
  } = useSelector(state => state)

  const { commoncookie, setModalTypeHandler, setLoaderStatusHandler, headerLocationId } = useContext(context);
  const storage = getsessionStorage();
  const subcompany = storage?.subcompany

  const [from, setFrom] = useState(moment().startOf('month'));
  const [to, setTo] = useState(moment().endOf('month'));
  const [dateRange,setDateRange] = useState('This Month')
  const [filterOpen,setFilterOpen] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState('Purchase');
  const [subcompanyId, setSubcompanyId] = useState('All')

  const handleExportClose = () => setAnchorEl(null);

  const prepareExportData = (data) => {
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    if (!rows.length) return [];
    return rows.map((row) => ({
      "GSTIN": row.gst || "",
      "GST Category": row.gst_type || "Un Registered",
      [value === 'Purchase' ? 'Supplier Name' : value === 'Sales Return' ? 'Customer Name' : 'Vendor Name']: row.company_name || "",
      "State Code": row.state_code || "",
      "State": row.state || "",
      "Invoice Number": row.invoice_number || "",
      "Invoice Date": row.invoice_date ? moment(row.invoice_date).format("DD/MM/YYYY") : "",
      "Invoice Value": parseFloat(row.total || 0).toFixed(2),
      "Taxable Value": parseFloat(row.taxable_value || 0).toFixed(2),
      CGST: row.cgst_amount || 0,
      SGST: row.sgst_amount || 0,
      IGST: row.igst_amount || 0,
      'Total Tax': row.tax_amount || 0
    })).filter(Boolean);
  };
  const selectedRole = storage?.role_name;
  const reportExport = UserRightsAuthorization(menuAccess[selectedRole],'reports__taxes__gstr_2','can_export');
  const ExportCsv = async() => {
    if (!reportExport) return;
    let rowData = []
    const payload = { fromDate: from, toDate: to, type: value, sub_company_id: subcompanyId }
    await dispatch(GST2ExportAction(payload, setModalTypeHandler, setLoaderStatusHandler, (response) => {
      rowData = Array.isArray(response) ? response : [];
    }))
    const exportData = prepareExportData(rowData);
    if (!exportData.length) return;
    const headers = Object.keys(exportData[0]);
    const csvRows = [headers.join(","), ...exportData.map(row => headers.map(k => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "GSTR2.csv";
    link.click();
  };

  const [pagination, setPagination] = useState({ pageCount: 0, numPerPage: 20, searchString: "" })

  useEffect(() => { subcompany > 0 && dispatch(getBillingcompany()) }, [subcompany])

  useEffect(() => { (async () => {
    const data = { fromDate: from, toDate: to, numPerPage: pagination.numPerPage, pageCount: pagination.pageCount, searchString: pagination.searchString, type: value, sub_company_id: subcompanyId }
    await dispatch(getGST2ReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
  })(); }, [pagination.pageCount, pagination.numPerPage, value])

  const handlePageChange = (page) => setPagination((prev) => ({ ...prev, pageCount: page }))
  const handlePageSizeChange = (size) => setPagination((prev) => ({ ...prev, numPerPage: size }))

  const requestSearch = (event) => {
    const val = event.target.value
    setPagination((prev) => ({ ...prev, searchString: val }))
    if(val.length >= 3 || val.length === 0) dispatch(setSearchGst2ReportAction({ data: [], numRows: 0 }))
    dispatch(getSearchGst2ReportAction({ pageCount: 0, numPerPage: pagination.numPerPage, searchString: val, fromDate: from, toDate: to, type: value }))
  }

  const cancelSearch = () => {
    setPagination((prev) => ({ ...prev, searchString: '' }))
    dispatch(setSearchGst2ReportAction({ data: [], numRows: 0 }))
    dispatch(getSearchGst2ReportAction({ pageCount: 0, numPerPage: pagination.numPerPage, searchString: '', fromDate: from, toDate: to, type: value }))
  }

  const columns = [
    { headerName: 'GSTIN', field: 'gst', flex: 1 },
    { headerName: 'GST Category', field: 'gst_type', valueGetter: (params, row) => { const r = row || params?.row || {}; return r.gst_type == null ? 'Un Registered' : r.gst_type; }, flex: 1 },
    { headerName: value === 'Purchase' ? 'Supplier Name' : value === 'Sales Return' ? 'Customer Name' : 'Vendor Name', field: 'company_name', flex: 1 },
    { headerName: 'State Code', field: 'state_code', align: 'center', flex: 1 },
    { headerName: 'State Name', field: 'state', align: 'center', flex: 1 },
    { headerName: 'Invoice Number', field: 'invoice_number', flex: 1 },
    { headerName: 'Invoice Date', field: 'invoice_date', valueGetter: (params) => params?.row?.invoice_date ? moment(params.row.invoice_date).format('DD/MM/YYYY') : '', align: 'right', flex: 1 },
    { headerName: 'Invoice Value', field: 'total', flex: 1, align: 'right', headerAlign: 'right' },
    { headerName: 'Taxable Value', field: 'taxable_value', flex: 1, valueGetter: (value, row) => value ?? row?.total ?? 0, align: 'right', headerAlign: 'right' },
    { headerName: 'CGST', field: 'cgst_amount', valueGetter: (value) => value ?? 0, align: 'right', headerAlign: 'right', flex: 1 },
    { headerName: 'SGST', field: 'sgst_amount', valueGetter: (value) => value ?? 0, align: 'right', headerAlign: 'right', flex: 1 },
    { headerName: 'IGST', field: 'igst_amount', valueGetter: (value) => value ?? 0, align: 'right', headerAlign: 'right', flex: 1 },
    { headerName: 'Total Tax', field: 'tax_amount', flex: 1, valueGetter: (value) => value ?? 0, headerAlign: 'right', align: 'right' }
  ]

  const handleChange = async (data) => {
    if(data.target.name === 'dateRange'){ await setFrom(data.target.value); await setTo(data.target.value1); await setDateRange(data.target.value2); }
    else if(data.target.name === 'subcompanyId'){ setSubcompanyId(data.target.value.sub_company_id) }
    else { let date_val = data.target.value.startOf('day').format('YYYY-MM-DD'); if(data.target.name === 'from') await setFrom(date_val); if(data.target.name === 'to') await setTo(date_val); }
  }

  const clearButton = async () => {
    setFrom(moment().startOf('month')); setTo(moment().endOf('month')); setDateRange(null); setSubcompanyId('All')
    await dispatch(getGST2ReportAction({ fromDate: moment().startOf('month'), toDate: moment().endOf('month'), numPerPage: pagination.numPerPage, pageCount: pagination.pageCount, searchString: '', type: value, sub_company_id: 'All' }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  const ApplyButton = async () => {
    await dispatch(getGST2ReportAction({ fromDate: from, toDate: to, numPerPage: pagination.numPerPage, pageCount: pagination.pageCount, searchString: '', type: value, sub_company_id: subcompanyId }, setModalTypeHandler, setLoaderStatusHandler))
    setFilterOpen(false)
  }

  return(
    <>
      <Helmet><meta charSet="utf-8" /><title>{titleURL} | GSTR 2</title></Helmet>
      <DataGridTemp
        pageSize={pagination.numPerPage} page={pagination.pageCount} pageType='task'
        title={
          <Grid container display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography component='div' variant='h6' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
              <Box style={{ display: 'flex' }}>
                <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
                &nbsp;/&nbsp;GSTR 2
              </Box>
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label="Purchase" onClick={() => setValue('Purchase')} color={value === 'Purchase' ? 'primary' : 'default'} variant={value === 'Purchase' ? 'filled' : 'outlined'} sx={{ fontWeight: 'normal' }} />
              <Chip label="Sales Return/ Credit" onClick={() => setValue('Sales Return')} color={value === 'Sales Return' ? 'primary' : 'default'} variant={value === 'Sales Return' ? 'filled' : 'outlined'} sx={{ fontWeight: 'normal' }} />
              <Chip label="Purchase Return/ Debit" onClick={() => setValue('Purchase Return')} color={value === 'Purchase Return' ? 'primary' : 'default'} variant={value === 'Purchase Return' ? 'filled' : 'outlined'} sx={{ fontWeight: 'normal' }} />
            </Stack>
          </Grid>
        }
        gstr={true}
        gstrExport={reportExport ? (<><Tooltip title="Export"><IconButton onClick={(event) => setAnchorEl(event.currentTarget)}><FileDownloadIcon /></IconButton></Tooltip><Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleExportClose}><MenuItem onClick={() => { ExportCsv(); }}>Export CSV</MenuItem></Menu></>) : null}
        data={data} columns={columns}
        onPageChange={(page) => handlePageChange(page)} onPageSizeChange={(size) => handlePageSizeChange(size)}
        rowCount={numRows} requestSearch={(event) => requestSearch(event)} cancelSearch={cancelSearch} searchVal={pagination.searchString}
        type='latestPayrollReport'
        filter={<div style={{display: 'flex', alignItems: 'center'}}><GSTR2Filter fromTo={true} from={from} to={to} subcompanyId={subcompanyId} dateRange={dateRange} handleChange={handleChange} handleClose={() => setFilterOpen(false)} handleOpen={() => setFilterOpen(true)} open={filterOpen} ApplyButton={ApplyButton} clearButton={clearButton} /></div>}
        isApiFinished={true}
      />
    </>
  )
}

export default GST2Report
