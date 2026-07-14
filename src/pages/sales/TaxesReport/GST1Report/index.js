import { Box, Chip, Grid, IconButton, Link, Menu, MenuItem, Stack, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import DataGridTemp from "components/dataGridTemp";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGST1ReportAction, getSearchGst1ReportAction, GSTRExportAction, setSearchGst1ReportAction } from "redux/actions/tax_actions";
import GSTR1Filter from "./GSTR1Filter";
import context from '../../../../context/CreateNewButtonContext';
import { ExportPdf } from "@material-table/exporters";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from "jspdf";
import { Helmet } from "react-helmet-async";
import { titleURL } from 'http-common';
import { getsessionStorage } from "pages/common/login/cookies";
import apiCalls from "utils/apiCalls";
import { getBillingcompany } from "redux/actions/sales_actions";
import { useNavigate } from "react-router-dom";
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function GST1Report(){

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    taxReducer: { gst1Report:  { data, numRows } },
    salesReducer:{ getbillingcompanydetails},
    rbacReducer: { menuAccess = {} }
  } = useSelector(state => state)
  
 const {
    commoncookie,
    setModalTypeHandler,
    setLoaderStatusHandler,
    headerLocationId,
  } = useContext(context);

   const storage = getsessionStorage();

  const subcompany = storage?.subcompany

  const [from, setFrom] = useState(moment().startOf('month'));
  const [to, setTo] = useState(moment().endOf('month'));
  const [dateRange,setDateRange] = useState('This Month')
  const [filterOpen,setFilterOpen] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null); 
  const [value, setValue] = useState('Sales'); 
 const [subcompanyId, setSubcompanyId] = useState('All')

   const handleExportClose = () => {
    setAnchorEl(null);
  };

  const prepareExportData = (data, pageType) => {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
  
    if (!rows.length) {
      console.warn("No valid rows to export:", data);
      return [];
    }

   
  
    const mapped = rows.map((row, i) => {
  try {
    return {
      "GSTIN": row.gst || "",
      "GST Category": row.gst_type || "Un Registered",
      [ value ===  'Purchase Return'?'Vendor Name' :' Customer Name']: row.company_name || "",
      "State Code": row.state_code || "",
      "State": row.state || "",
      [value ===  'Sales'? "Invoice Number" : value === 'Sales Return' ? 'CN No' : "DN NO"]: row.invoice_number === "" ? row.sequence_number : row.invoice_number|| "",
      [value ===  'Sales'? "Invoice Date" : value === 'Sales Return' ? 'Credit Date' : "Debit Date"]: row.sale_time
        ? moment(row.sale_time).format("DD/MM/YYYY")
        : "",
      [value ===  'Sales'? "Invoice Value" : value === 'Sales Return' ? 'Credit Value' : "Debit Value"]: parseFloat(row.total || 0).toFixed(2),
      "Total Tax (%)": row.tax_percent ?? 0,
      "Taxable Value": parseFloat(row.taxable_value || 0).toFixed(2),
      'Customer State': row.state || "",
      // For fields CGST, SGST, IGST, CEES, and Total Tax, since in your columns you use valueGetter,
      // you might omit these here or set them as raw data for calculation in table:
      // But if you want precomputed in mapped, you can add:

      CGST: row.cgst_amount || 0,
      SGST: row.sgst_amount || 0,
      IGST: row.igst_amount || 0, 
      CEES: "0.00", // Static zero as in your columns
      'Total Tax': row.tax_amount || 0
    };
  } catch (err) {
    console.error(`Error mapping row ${i}:`, err, row);
    return null;
  }
}).filter(Boolean);

  
    console.log("Mapped export data:", mapped);
    return mapped;
  };

 const handleExportPDF = async() => {
  if (!reportExport) return;

  let rowData = []

  const payload = {
      fromDate : from,
      toDate : to,
      type : value,
      sub_company_id : subcompanyId
    }

   await dispatch(GSTRExportAction(payload, setModalTypeHandler, setLoaderStatusHandler,(response)=>{
      const combined = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response
        : [];
      rowData = combined
   }))

   const exportData =prepareExportData(rowData);
   const doc = new jsPDF();
 
   if (!exportData.length) {
     console.log("No export data available after processing:", exportData);
     doc.text("No data to export.", 10, 10);
     doc.save("GSTR1.pdf");
     return;
   }
 
   const headers = Object.keys(exportData[0]);
   const rows = exportData.map(row => headers.map(h => row[h]));
 
    doc.autoTable({
    startY: 20,
    head: [headers],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] } // blue header
  })
 
   doc.save("GSTR1.pdf");
 };
 const selectedRole = storage?.role_name;
 const reportExport = UserRightsAuthorization( menuAccess[selectedRole],'reports__taxes__gstr_2','can_export');
 const ExportCsv = async() => {
  if (!reportExport) return;

    let rowData = []

  const payload = {
      fromDate : from,
      toDate : to,
      type : value,
      sub_company_id : subcompanyId
    }

   await dispatch(GSTRExportAction(payload, setModalTypeHandler, setLoaderStatusHandler,(response)=>{
      const combined = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response
        : [];
      rowData = combined
   }))

  const exportData = prepareExportData(rowData);

  if (!exportData.length) {
    return;
  }

  const headers = Object.keys(exportData[0]);
  const csvRows = [
    headers.join(","), // headers
    ...exportData.map(row =>
      headers.map(k => `"${(row[k] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "GSTR1.csv";
  link.click();
};

  const [pagination, setPagination] = useState({
    pageCount: 0,
    numPerPage: 20,
    searchString: ""
  })

     useEffect(()=>{
      subcompany > 0 && dispatch(getBillingcompany())
    },[subcompany])

  useEffect(() => { (async () => {
     const data = {
        fromDate : from,
        toDate : to,
        numPerPage : pagination.numPerPage,
        pageCount : pagination.pageCount,
        searchString : pagination.searchString,
        type : value,
        sub_company_id : subcompanyId
      }
    await dispatch(getGST1ReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
  })();
}, [pagination.pageCount, pagination.numPerPage,value])

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, pageCount: page }))
  }

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({ ...prev, numPerPage: size }))
  }

  const requestSearch = (event) => {
    const val = event.target.value
    setPagination((prev) => ({ ...prev, searchString: val }))
    if(val.length >= 3 || val.length === 0) {
      dispatch(setSearchGst1ReportAction({ data: [], numRows: 0 }))
    }
    const payload = {
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: val,
      fromDate : from,
      toDate : to,
      type : value
    }
    dispatch(getSearchGst1ReportAction(payload))
  }

  const cancelSearch = (event) => {
    setPagination((prev) => ({ ...prev, searchString: '' }))
    
    dispatch(setSearchGst1ReportAction({ data: [], numRows: 0 }))
    const payload = {
      pageCount: 0,
      numPerPage: pagination.numPerPage,
      searchString: '',
      fromDate : from,
      toDate : to,
      type : value
    }
    dispatch(getSearchGst1ReportAction(payload))
  }

  const columns =  [
        {
          headerName: 'GSTIN',
          field: 'gst',
          flex: 1,
        },
        {
          headerName: 'GST Category',
          field: 'gst_type',
          valueGetter: (params, row) => {
          const r = row || params?.row || {};
          return r.gst_type == null ? 'Un Registered' : r.gst_type;
          },
          flex: 1,
        },
        {
          headerName: value ===  'Purchase Return'?'Vendor Name' :' Customer Name',
          field: 'company_name',
          flex: 1,
        },
        {
          headerName: ' State Code',
          field: 'state_code',  
          align:'center',
          flex: 1,
        },
        {
          headerName: 'State Name',
          field: 'state',
          align :'center',
          flex: 1,
        },
        {
          headerName: value === 'Sales' ?  'Invoice Number' : value === 'Sales Return' ? 'CN No' : 'DN No',
          field: 'invoice_number',
          valueGetter: (params, row) => {
          const r = row || params?.row || {};
          return r.invoice_number === '' ? r.sequence_number : r.invoice_number;
          },

           flex: 1,
         },
         {
            headerName: value === 'Sales'
             ? 'Invoice Date'
             : value === 'Sales Return'
             ? 'Credit Date'
             : 'Debit Date',

             field: 'sale_time',

              renderCell: (params) => {
               const date = params?.row?.sale_time
                return date ? moment(date).format('DD/MM/YYYY') : ''
                },

               flex: 1,
           },
        {
          headerName: value === 'Sales' ?  'Invoice Value' : value === 'Sales Return' ? 'Credit Value' : 'Debit Value',
          field: 'total',
          flex: 1,
          align: 'right', 
          headerAlign: 'right', // <-- this aligns the header text to the right
          cellClassName: 'text-right',
          cellStyle: { textAlign: 'right', paddingRight: '10px' },
        },
        {
          headerName: 'Total Tax(%)',
          field: 'tax_percent',
          valueGetter: (params, row) =>
          params?.row?.tax_percent ?? 0,
          flex: 1,
          align :'center',
        },
        {
          headerName: 'Taxable Value',
          field: 'taxable_value',
          flex: 1,
          valueGetter: (value, row) => value ?? row?.total ?? 0,
          align: 'right', 
          headerAlign: 'right', // <-- this aligns the header text to the right
          cellClassName: 'text-right',
          cellStyle: { textAlign: 'right', paddingRight: '10px' },
        },
       {
        headerName: 'CGST',
        field: 'cgst_amount',
        valueGetter: (value) => value ?? 0,
        align: 'right',
        headerAlign: 'right', // <-- this aligns the header text to the right
        cellClassName: 'text-right',
        cellStyle: { textAlign: 'right', paddingRight: '10px' },
        flex: 1,
      },
{
  headerName: 'SGST',
  field: 'sgst_amount',
 valueGetter: (value) => value ?? 0,
  align: 'right',
 headerAlign: 'right', // <-- this aligns the header text to the right
  cellClassName: 'text-right',
  cellStyle: { textAlign: 'right', paddingRight: '10px' },
  flex: 1,
},
{
  headerName: 'IGST',
  field: 'igst_amount',
  valueGetter: (value) => value ?? 0,
  align: 'right',
  headerAlign: 'right', // <-- this aligns the header text to the right
  cellClassName: 'text-right',
  cellStyle: { textAlign: 'right', paddingRight: '10px' },
  flex: 1,
},
{
  headerName: 'CEES',
  field: 'CEES',
  valueGetter: () => 0, // or whatever logic you want
   headerAlign: 'right', // <-- this aligns the header text to the right
  cellClassName: 'text-right',
  align: 'right',
  cellStyle: { textAlign: 'right', paddingRight: '10px' },
  flex: 1,
},
{
  headerName: 'Total Tax',
  field: 'tax_amount',
  flex: 1,
  valueGetter: (value) => value ?? 0,
   headerAlign: 'right', // <-- this aligns the header text to the right
  cellClassName: 'text-right',
  align: 'right',
  cellStyle: { textAlign: 'right', paddingRight: '10px' },
}
      ]

  const  handleChange = async (data,name) => {

  
       if(data.target.name === 'dateRange'){
        let date_val = data.target.value;
        let date_val1 = data.target.value1;
        let date_val2 = data.target.value2;
        console.log(date_val,'date_val1',date_val1)
        await setFrom(date_val)
        await setTo(date_val1)
        await setDateRange(date_val2)
  
      }
       else if(data.target.name === 'subcompanyId'){
        setSubcompanyId(data.target.value.sub_company_id)
      }
      else{
        let date_val = data.target.value.startOf('day').format('YYYY-MM-DD');
        if(data.target.name === 'from'){
          await setFrom(date_val)
        }
        if(data.target.name === 'to'){
          await setTo(date_val)
        }
      }
    }

    console.log(filterOpen,'filterOpen')

    const clearButton  = async()=>{
      setFrom(moment().startOf('month'))
      setTo(moment().endOf('month'))
      setDateRange(null);
      setSubcompanyId('All')

       const data = {
        fromDate : moment().startOf('month'),
        toDate : moment().endOf('month'),
        numPerPage : pagination.numPerPage,
        pageCount : pagination.pageCount,
        searchString: '',
        type : value,
        sub_company_id : subcompanyId
      }

     await dispatch(getGST1ReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
      setFilterOpen(false)
    }

    const ApplyButton =async()=>{
      const data = {
        fromDate : from,
        toDate : to,
        numPerPage : pagination.numPerPage,
        pageCount : pagination.pageCount,
        searchString: '',
        type : value,
        sub_company_id : subcompanyId      
      }

     await dispatch(getGST1ReportAction(data, setModalTypeHandler, setLoaderStatusHandler))
      setFilterOpen(false)
    }

  const handleClick = (newValue) => {
    setValue(newValue);
  };
 console.log(from,'fromaees')
  console.log(value)

  return(
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title> {titleURL} | GSTR 1 </title>
      </Helmet>
      <DataGridTemp
        pageSize = {pagination.numPerPage}
        page = {pagination.pageCount}
        pageType = 'task'
        title = {
          <Grid container display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography component='div' variant = 'h6' style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            {/* <Link href = '/report' underline = 'hover'>Home</Link>
            {' / GSTR 1'} */}
            <Box style={{ display: 'flex' }}>
              <Box sx={{ color: '#0A8FDC', cursor: 'pointer', fontSize: '12px', fontWeight: 400, '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/report')}>Home</Box>
              &nbsp;/&nbsp;GSTR 1
            </Box>
          </Typography>
           <Stack direction="row"  spacing={1}>
                      <Chip
                        label="Sales"
                        onClick={() => handleClick('Sales')}
                        color={value === 'Sales' ? 'primary' : 'default'}
                        variant={value === 'Sales' ? 'filled' : 'outlined'}
                         sx={{ fontWeight: 'normal' }}
                      />
                      <Chip
                        label="Sales Return/ Credit"
                        onClick={() => handleClick('Sales Return')}
                        color={value === 'Sales Return' ? 'primary' : 'default'}
                        variant={value === 'Sales Return' ? 'filled' : 'outlined'}
                         sx={{ fontWeight: 'normal' }}
                      />
                      <Chip
                        label="Purchase Return/ Debit"
                        onClick={() => handleClick('Purchase Return')}
                        color={value === 'Purchase Return' ? 'primary' : 'default'}
                        variant={value === 'Purchase Return' ? 'filled' : 'outlined'}
                         sx={{ fontWeight: 'normal' }}
                      />
                    </Stack>
          </Grid>
        }
        gstr = {true}
        gstrExport ={
          reportExport ? (
          <>
          <Tooltip title="Export">
            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleExportClose}>
            {/* <MenuItem onClick={() => { handleExportPDF(); }}>Export PDF</MenuItem> */}
            <MenuItem onClick={() => { ExportCsv(); }}>Export CSV</MenuItem>
          </Menu>
          </>
          ) : null
        }

        handleExport = {reportExport ? () => handleExportPDF() : undefined}
        data = {data}
        columns = {columns}
        onPageChange = {(page) => handlePageChange(page)}
        onPageSizeChange = {(size) => handlePageSizeChange(size)}
        rowCount = {numRows}
        requestSearch = {(event) => requestSearch(event)}
        cancelSearch = {cancelSearch}
        searchVal = {pagination.searchString}
        type = 'latestPayrollReport'
        filter = {
          <div style={{display: 'flex', alignItems: 'center'}}>
            <GSTR1Filter
              fromTo={true}
              from={from}
              to={to}
              subcompanyId = {subcompanyId}
              dateRange = {dateRange}
              handleChange={handleChange}
              handleClose={()=> setFilterOpen(false)}
              handleOpen={()=> setFilterOpen(true)}
              open={filterOpen}
              ApplyButton={ApplyButton}
              clearButton={clearButton}
            /> 
          </div>
        }
        isApiFinished = {true}
      />
    </>
  )

}

export default GST1Report