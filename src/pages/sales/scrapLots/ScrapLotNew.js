import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Card, IconButton, Tooltip, Typography } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import CommonSearch from 'utils/commonSearch';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import ReportsService from '../../../services/reports_services';
import { titleURL } from 'http-common';
import { ExportCsv } from '@material-table/exporters';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getsessionStorage } from 'pages/common/login/cookies';
import { UserRightsAuthorization } from '@crema/utility/helper/UserRightsHelper';

function KpiCard({ label, value, color }) {
  return (
    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
      <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
    </Box>
  );
}

export default function ScrapLotNew() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storage = getsessionStorage();
  const selectedRole = storage?.role_name;

  const {
    rbacReducer: { menuAccess = {} },
  } = useSelector((state) => state);

  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [rowCount, setRowCount] = useState(0);
  const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');

  const fetchData = async (p = 0, ps = 20) => {
    setLoading(true);
    try {
      const res = await ReportsService.getScrapLot2({ pageCount: p, numPerPage: ps });
      setData(res.data?.data || []);
      setRowCount(res.data?.numRows || 0);
      setKpis(res.data || {});
    } catch (err) { setData([]); setRowCount(0); }
    setLoading(false);
  };

  useEffect(() => { fetchData(page, pageSize); }, [page, pageSize]);

  const columns = [
    { field: 'product_name', headerName: 'Product Name', flex: 1, minWidth: 150 },
    { field: 'category', headerName: 'Category', flex: 0.5, minWidth: 80 },
    { field: 'brand', headerName: 'Brand', flex: 0.5, minWidth: 80 },
    { field: 'model', headerName: 'Model', flex: 0.5, minWidth: 80 },
    { field: 'lot_number', headerName: 'Lot #', flex: 0.6, minWidth: 100 },
    { field: 'qty', headerName: 'Qty', flex: 0.3, minWidth: 50, align: 'right', headerAlign: 'right' },
    { field: 'cost_price', headerName: 'Cost', flex: 0.4, minWidth: 70, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.cost_price ? `\u20B9${Number(p.row.cost_price).toLocaleString('en-IN')}` : '-' },
    { field: 'value', headerName: 'Value', flex: 0.4, minWidth: 80, align: 'right', headerAlign: 'right',
      renderCell: (p) => p.row?.value ? `\u20B9${Number(p.row.value).toLocaleString('en-IN')}` : '-' },
    { field: 'scrap_date', headerName: 'Scrap Date', flex: 0.4, minWidth: 85 },
    { field: 'age_days', headerName: 'Age', flex: 0.3, minWidth: 55,
      renderCell: (p) => { const d = p.row?.age_days; if (!d) return '-'; return d < 31 ? `${d}d` : d < 365 ? `${Math.floor(d/30)}m` : `${Math.floor(d/365)}y`; }
    },
  ];
  const isExportRights = UserRightsAuthorization(menuAccess[selectedRole],'reports__inventory__scrap_lot','can_export');

  return (
    <>
      <Helmet><title>{titleURL} | Scrap Lot</title></Helmet>
      <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1.5, minHeight: 48 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 1 }}>Scrap Lot</Typography>
          <Box sx={{ flex: 1 }} />
          <KpiCard label="Total Scrap" value={rowCount} color="#d32f2f" />
          <KpiCard label="Total Qty" value={Number(kpis.totalQty || 0).toLocaleString('en-IN')} color="#E65100" />
          <KpiCard label="Scrap Value" value={`\u20B9${Number(kpis.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} color="#7C4DFF" />
          <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
          {isExportRights && (
            <>
          <Tooltip title="Export CSV"><IconButton onClick={async () => {
            try { const r = await ReportsService.getScrapLot2({ pageCount: 0, numPerPage: 10000 });
              ExportCsv(columns.map(c => ({ title: c.headerName, field: c.field })), r.data?.data || [], 'Scrap_Lot'); } catch(e) {}
          }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
          <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
            </>
          )}
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <DataGrid rows={data} columns={columns} rowCount={rowCount} getRowId={(row) => `${row.lot_id}`}
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
