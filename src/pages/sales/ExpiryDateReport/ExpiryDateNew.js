import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { useNavigate } from 'react-router-dom';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';
import apiCalls from 'utils/apiCalls';
import { getsessionStorage } from 'pages/common/login/cookies';
import { getMenuAccessAction } from 'redux/actions/rbac_actions';
import { useDispatch, useSelector } from 'react-redux';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function ExpiryDateNew() {
   const dispatch = useDispatch();
  const storage = getsessionStorage();
  const navigate = useNavigate();
  const { headerLocationId ,setModalTypeHandler, setLoaderStatusHandler} = useContext(CreateNewButtonContext);
  const {
           rbacReducer: { menuAccess } 
        } = useSelector((state) => state);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');

  const fetchData = async (p = 0, ps = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getExpiryDate({ location_id: 'null', pageCount: p, numPerPage: ps });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId]);


  const selectedRole = storage?.role_name
        useEffect(() => {
          if (!selectedRole) return;
          apiCalls(
            setModalTypeHandler,
            setLoaderStatusHandler, dispatch(getMenuAccessAction(selectedRole)));
        }, [selectedRole, dispatch]);

  const expiryDateExport =UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__expiry_date_report', 'can_export') 



  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 80 },
    { field: 'brand', headerName: 'Brand', flex: 0.5, minWidth: 80 },
    { field: 'sku', headerName: 'SKU', flex: 0.4, minWidth: 70 },
    { field: 'available_qty', headerName: 'Qty', flex: 0.3, minWidth: 50, align: 'right', headerAlign: 'right' },
    { field: 'expiry_date_display', headerName: 'Expiry Date', flex: 0.5, minWidth: 90 },
    { field: 'days_to_expiry', headerName: 'Days Left', flex: 0.3, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => {
        const d = p.row?.days_to_expiry;
        if (d == null) return '-';
        const color = d < 0 ? '#d32f2f' : d <= 30 ? '#E65100' : d <= 90 ? '#FF8B3E' : '#11C15B';
        return <Typography sx={{ fontSize: 12, fontWeight: 600, color }}>{d < 0 ? `${Math.abs(d)}d ago` : `${d}d`}</Typography>;
      }
    },
    { field: 'expiry_status', headerName: 'Status', flex: 0.4, minWidth: 90,
      renderCell: (p) => {
        const s = p.row?.expiry_status;
        const color = s === 'Expired' ? '#d32f2f' : s === 'Expiring Soon' ? '#E65100' : s === 'Warning' ? '#FF8B3E' : '#11C15B';
        return <Chip label={s || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: `${color}15`, color, fontWeight: 600 }} />;
      }
    },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Expiry Date Report</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 1 }}>Expiry Date Report</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Total Items" value={rowCount} color="#2E3A59" />
          <KpiCard label="Expired" value={kpis.expiredCount || 0} color="#d32f2f" />
          <KpiCard label="Expiring Soon" value={kpis.expiringSoonCount || 0} color="#E65100" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          {

            expiryDateExport && 
            <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const r = await ReportsService.getExpiryDate({ location_id: 'null', pageCount: 0, numPerPage: 10000 });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), r.data?.data || [], 'Expiry_Date_Report'); } catch(e) {}
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
            }
            
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount} getRowId={(row) => `${row.item_id}`}
            paginationMode="server" paginationModel={{ page, pageSize }}
            onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}
            pageSizeOptions={[20, 50, 100]} density="compact" disableRowSelectionOnClick loading={loading}
            sx={{ border: 'none', height: '100%',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 },
              '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' },
              '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
        </Box>
      </Card>
    </>
  );
}
