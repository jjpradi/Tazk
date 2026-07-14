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

export default function ExcessLotNew() {
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
  const [searchVal, setSearchVal] = useState('');

  const fetchData = async (p = 0, ps = 20) => {
    if (!headerLocationId) return;
    setLoading(true);
    try {
      const res = await ReportsService.getExcessLot2({ location_id: 'null', pageCount: p, numPerPage: ps });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
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

   const excessLotExport =UserRightsAuthorization(menuAccess[selectedRole], 'reports__inventory__expiry_date_report', 'can_export') 


  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 80 },
    { field: 'brand', headerName: 'Brand', flex: 0.5, minWidth: 80 },
    { field: 'location', headerName: 'Location', flex: 0.5, minWidth: 80 },
    { field: 'lot_number', headerName: 'Lot #', flex: 0.6, minWidth: 100 },
    { field: 'reason', headerName: 'Reason', flex: 0.5, minWidth: 80 },
    { field: 'action', headerName: 'Action', flex: 0.5, minWidth: 90,
      renderCell: (p) => p.row?.action ? <Chip label={p.row.action} size="small" sx={{ fontSize: 9, height: 20, bgcolor: '#E3F2FD', color: '#0A8FDC', fontWeight: 600 }} /> : '-' },
    { field: 'reconciliate_status', headerName: 'Status', flex: 0.4, minWidth: 80,
      renderCell: (p) => {
        const s = p.row?.reconciliate_status;
        const color = s === 'Completed' ? '#11C15B' : '#FF8B3E';
        return <Chip label={s || '-'} size="small" sx={{ fontSize: 9, height: 20, bgcolor: `${color}15`, color, fontWeight: 600 }} />;
      }
    },
    { field: 'date', headerName: 'Date', flex: 0.4, minWidth: 85 },
  ];

  return (
    <>
      <Helmet><title>{titleURL} | Excess Lots</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 1 }}>Excess Lots</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Total Excess" value={rowCount} color="#E65100" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
        {
          excessLotExport && 
           <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const r = await ReportsService.getExcessLot2({ location_id: 'null', pageCount: 0, numPerPage: 10000 });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), r.data?.data || [], 'Excess_Lots'); } catch(e) {}
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        }  
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount} getRowId={(row) => `${row.excess_id}`}
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
