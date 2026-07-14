const fs = require('fs');
const path = require('path');

const reports = [
  {
    file: 'BillProfitNew.js', component: 'BillProfitNew', title: 'Bill Wise Profit Report',
    service: 'getBillProfit', defaultRange: 'month',
    kpis: [
      { label: 'Invoices', field: 'totalInvoices', color: '#2E3A59' },
      { label: 'Revenue', field: 'totalRevenue', color: '#2E7D32', fmt: true },
      { label: 'Cost', field: 'totalCost', color: '#E65100', fmt: true },
      { label: 'Profit', field: 'totalProfit', color: '#1565C0', fmt: true },
      { label: 'Profit %', field: 'profitPct', color: '#7B1FA2', suffix: '%' },
    ],
    columns: [
      { f: 'invoice_number', h: 'Invoice #', w: 100 },
      { f: 'sale_date', h: 'Date', w: 85 },
      { f: 'customer_name', h: 'Customer', w: 130 },
      { f: 'location_name', h: 'Location', w: 85 },
      { f: 'buying_cost', h: 'Buying Cost', w: 90, r: true },
      { f: 'selling_price', h: 'Selling Price', w: 90, r: true },
      { f: 'profit', h: 'Profit', w: 85, r: true, color: true },
      { f: 'profit_pct', h: 'Profit %', w: 65, r: true, pct: true },
    ],
    rowId: 'id',
  },
  {
    file: 'CategoryMarginNew.js', component: 'CategoryMarginNew', title: 'Category wise Margin',
    service: 'getCategoryMargin', defaultRange: 'year',
    kpis: [
      { label: 'Categories', field: 'totalCategories', color: '#2E3A59' },
      { label: 'Revenue', field: 'totalRevenue', color: '#2E7D32', fmt: true },
      { label: 'Cost', field: 'totalCost', color: '#E65100', fmt: true },
      { label: 'Margin', field: 'totalMargin', color: '#1565C0', fmt: true },
      { label: 'ROI', field: 'overallRoi', color: '#7B1FA2', suffix: '%' },
    ],
    columns: [
      { f: 'category', h: 'Category', w: 120 },
      { f: 'total_orders', h: 'Orders', w: 60, r: true },
      { f: 'qty_sold', h: 'Qty Sold', w: 65, r: true },
      { f: 'cost_value', h: 'Cost Value', w: 95, r: true, rupee: true },
      { f: 'revenue', h: 'Revenue', w: 95, r: true, rupee: true },
      { f: 'gross_margin', h: 'Margin', w: 90, r: true, color: true },
      { f: 'margin_pct', h: 'Margin %', w: 65, r: true, pct: true },
      { f: 'roi_pct', h: 'ROI %', w: 60, r: true, pct: true },
      { f: 'avg_selling_price', h: 'Avg Price', w: 85, r: true, rupee: true },
      { f: 'avg_cost_price', h: 'Avg Cost', w: 85, r: true, rupee: true },
    ],
    rowId: 'category',
  },
  {
    file: 'SalesmanPerfNew.js', component: 'SalesmanPerfNew', title: 'Salesman Performance',
    service: 'getSalesmanPerf', defaultRange: 'month',
    kpis: [
      { label: 'Salesmen', field: 'totalSalesmen', color: '#2E3A59' },
      { label: 'Revenue', field: 'totalRevenue', color: '#2E7D32', fmt: true },
      { label: 'Orders', field: 'totalOrders', color: '#1565C0' },
      { label: 'Collected', field: 'totalCollected', color: '#00695C', fmt: true },
    ],
    columns: [
      { f: 'salesman_name', h: 'Salesman', w: 140 },
      { f: 'orders', h: 'Orders', w: 60, r: true },
      { f: 'qty_sold', h: 'Qty', w: 50, r: true },
      { f: 'revenue', h: 'Revenue', w: 95, r: true, rupee: true },
      { f: 'cost_value', h: 'Cost', w: 90, r: true, rupee: true },
      { f: 'profit', h: 'Profit', w: 85, r: true, color: true },
      { f: 'margin_pct', h: 'Margin %', w: 65, r: true, pct: true },
      { f: 'collected', h: 'Collected', w: 90, r: true, rupee: true },
      { f: 'outstanding', h: 'Outstanding', w: 90, r: true, rupee: true },
      { f: 'avg_ticket', h: 'Avg Ticket', w: 85, r: true, rupee: true },
    ],
    rowId: 'salesman_id',
  },
  {
    file: 'LocationPLNew.js', component: 'LocationPLNew', title: 'Location wise P&L',
    service: 'getLocationPL', defaultRange: 'month',
    kpis: [
      { label: 'Locations', field: 'totalLocations', color: '#2E3A59' },
      { label: 'Total Revenue', field: 'totalRevenue', color: '#2E7D32', fmt: true },
    ],
    columns: [
      { f: 'location_name', h: 'Location', w: 130 },
      { f: 'sales_count', h: 'Sales', w: 60, r: true },
      { f: 'sales_revenue', h: 'Revenue', w: 100, r: true, rupee: true },
      { f: 'cost_of_goods', h: 'COGS', w: 95, r: true, rupee: true },
      { f: 'gross_profit', h: 'Gross Profit', w: 95, r: true, color: true },
      { f: 'purchases', h: 'Purchases', w: 95, r: true, rupee: true },
      { f: 'expenses', h: 'Expenses', w: 85, r: true, rupee: true },
      { f: 'net_profit', h: 'Net Profit', w: 95, r: true, color: true },
    ],
    rowId: 'location_id',
  },
  {
    file: 'CustomerRevenueNew.js', component: 'CustomerRevenueNew', title: 'Customer wise Revenue',
    service: 'getCustomerRevenue', defaultRange: 'year',
    kpis: [
      { label: 'Customers', field: 'totalCustomers', color: '#2E3A59' },
      { label: 'Revenue', field: 'totalRevenue', color: '#2E7D32', fmt: true },
      { label: 'Outstanding', field: 'totalOutstanding', color: '#C62828', fmt: true },
    ],
    columns: [
      { f: 'customer_name', h: 'Customer', w: 150 },
      { f: 'orders', h: 'Orders', w: 60, r: true },
      { f: 'qty', h: 'Qty', w: 50, r: true },
      { f: 'revenue', h: 'Revenue', w: 100, r: true, rupee: true },
      { f: 'received', h: 'Received', w: 90, r: true, rupee: true },
      { f: 'outstanding', h: 'Outstanding', w: 95, r: true, rupee: true },
      { f: 'avg_order', h: 'Avg Order', w: 85, r: true, rupee: true },
      { f: 'last_purchase', h: 'Last Purchase', w: 100 },
    ],
    rowId: 'customer_id',
  },
  {
    file: 'SupplierPurchaseNew.js', component: 'SupplierPurchaseNew', title: 'Supplier wise Purchase',
    service: 'getSupplierPurchase', defaultRange: 'year',
    kpis: [
      { label: 'Suppliers', field: 'totalSuppliers', color: '#2E3A59' },
      { label: 'Purchased', field: 'totalPurchased', color: '#1565C0', fmt: true },
      { label: 'Outstanding', field: 'totalOutstanding', color: '#C62828', fmt: true },
    ],
    columns: [
      { f: 'supplier_name', h: 'Supplier', w: 150 },
      { f: 'bills', h: 'Bills', w: 55, r: true },
      { f: 'purchased', h: 'Purchased', w: 100, r: true, rupee: true },
      { f: 'paid', h: 'Paid', w: 90, r: true, rupee: true },
      { f: 'outstanding', h: 'Outstanding', w: 95, r: true, rupee: true },
      { f: 'avg_bill', h: 'Avg Bill', w: 85, r: true, rupee: true },
    ],
    rowId: 'supplier_id',
  },
  {
    file: 'DailySalesSummaryNew.js', component: 'DailySalesSummaryNew', title: 'Daily Sales Summary',
    service: 'getDailySalesSummary', defaultRange: 'month', pageSize: 50,
    kpis: [],
    columns: [
      { f: 'date', h: 'Date', w: 100 },
      { f: 'orders', h: 'Orders', w: 60, r: true },
      { f: 'qty_sold', h: 'Qty', w: 55, r: true },
      { f: 'cost', h: 'Cost', w: 90, r: true, rupee: true },
      { f: 'revenue', h: 'Revenue', w: 95, r: true, rupee: true },
      { f: 'margin', h: 'Margin', w: 90, r: true, color: true },
      { f: 'margin_pct', h: 'Margin %', w: 65, r: true, pct: true },
      { f: 'avg_ticket', h: 'Avg Ticket', w: 85, r: true, rupee: true },
    ],
    rowId: 'date',
  },
  {
    file: 'MonthlyComparisonNew.js', component: 'MonthlyComparisonNew', title: 'Monthly Comparison',
    service: 'getMonthlyComparison', defaultRange: 'year', noPagination: true,
    kpis: [],
    columns: [
      { f: 'month', h: 'Month', w: 100 },
      { f: 'orders', h: 'Orders', w: 60, r: true },
      { f: 'qty', h: 'Qty', w: 55, r: true },
      { f: 'revenue', h: 'Revenue', w: 100, r: true, rupee: true },
      { f: 'cost', h: 'Cost', w: 90, r: true, rupee: true },
      { f: 'margin', h: 'Margin', w: 90, r: true, color: true },
      { f: 'margin_pct', h: 'Margin %', w: 65, r: true, pct: true },
      { f: 'purchases', h: 'Purchases', w: 95, r: true, rupee: true },
      { f: 'expenses', h: 'Expenses', w: 85, r: true, rupee: true },
      { f: 'growth_pct', h: 'Growth %', w: 70, r: true, pct: true },
    ],
    rowId: 'sort_key',
  },
  {
    file: 'PaymentModeNew.js', component: 'PaymentModeNew', title: 'Payment Mode Analysis',
    service: 'getPaymentMode', defaultRange: 'month', noPagination: true,
    kpis: [],
    columns: [
      { f: 'mode', h: 'Payment Mode', w: 200 },
      { f: 'txn_count', h: 'Transactions', w: 100, r: true },
      { f: 'total_amount', h: 'Amount', w: 120, r: true, rupee: true },
      { f: 'pct', h: 'Share %', w: 80, r: true, pct: true },
    ],
    rowId: 'mode',
  },
  {
    file: 'InventoryTurnoverNew.js', component: 'InventoryTurnoverNew', title: 'Inventory Turnover',
    service: 'getInventoryTurnover', defaultRange: 'year',
    kpis: [
      { label: 'Products', field: 'totalProducts', color: '#2E3A59' },
      { label: 'Stock Value', field: 'totalStockValue', color: '#1565C0', fmt: true },
    ],
    columns: [
      { f: 'product_name', h: 'Product', w: 160 },
      { f: 'brand', h: 'Brand', w: 80 },
      { f: 'category', h: 'Category', w: 80 },
      { f: 'stock_qty', h: 'Stock Qty', w: 65, r: true },
      { f: 'stock_value', h: 'Stock Value', w: 95, r: true, rupee: true },
      { f: 'qty_sold', h: 'Qty Sold', w: 65, r: true },
      { f: 'cogs', h: 'COGS', w: 85, r: true, rupee: true },
      { f: 'turnover_ratio', h: 'Turnover', w: 70, r: true },
      { f: 'days_to_sell', h: 'Days to Sell', w: 80, r: true },
    ],
    rowId: 'item_id',
  },
  {
    file: 'TaxSummaryNew.js', component: 'TaxSummaryNew', title: 'Tax Summary (GST)',
    service: 'getTaxSummary', defaultRange: 'month', noPagination: true,
    kpis: [],
    columns: [
      { f: 'sales_taxable', h: 'Sales Taxable', w: 130, r: true, rupee: true },
      { f: 'sales_tax_collected', h: 'Tax Collected (Sales)', w: 150, r: true, rupee: true },
      { f: 'purchase_taxable', h: 'Purchase Taxable', w: 140, r: true, rupee: true },
      { f: 'purchase_tax_paid', h: 'Tax Paid (Purchase)', w: 150, r: true, rupee: true },
      { f: 'net_tax_liability', h: 'Net Tax Liability', w: 140, r: true, color: true },
    ],
    rowId: null, // single row
  },
];

function genColumn(c) {
  let def = `{ field: '${c.f}', headerName: '${c.h}', flex: 0.3, minWidth: ${c.w}`;
  if (c.r) def += `, align: 'right', headerAlign: 'right'`;
  if (c.rupee) def += `, ...rc('${c.f}')`;
  if (c.color) def += `, renderCell: (p) => { const v = p.row?.${c.f}; if (v == null) return '-'; const c2 = Number(v) >= 0 ? '#2E7D32' : '#C62828'; return React.createElement(Typography, { sx: { fontSize: 12, fontWeight: 600, color: c2 } }, fmt(v)); }`;
  if (c.pct) def += `, renderCell: (p) => p.row?.${c.f} != null ? p.row.${c.f} + '%' : '-'`;
  def += ' }';
  return def;
}

function genKpi(k) {
  if (k.fmt) return `<KpiCard label="${k.label}" value={fmt(kpis.${k.field})} color="${k.color}" />`;
  if (k.suffix) return `<KpiCard label="${k.label}" value={(kpis.${k.field} || 0) + '${k.suffix}'} color="${k.color}" />`;
  return `<KpiCard label="${k.label}" value={kpis.${k.field} || 0} color="${k.color}" />`;
}

for (const r of reports) {
  const fromDate = r.defaultRange === 'year' ? "moment().subtract(1, 'year').startOf('month').format('YYYY-MM-DD')" : "moment().startOf('month').format('YYYY-MM-DD')";
  const ps = r.pageSize || 20;
  const content = `import React, { useState, useEffect, useContext } from 'react';
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
import moment from 'moment';
import FilterCreditNotes from '../returnCreditNotesReport/FilterCreditNotes';

function KpiCard({ label, value, color }) {
  return (<Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', textAlign: 'center', minWidth: 70 }}>
    <Typography sx={{ fontSize: 9, color: '#8C8C8C', fontWeight: 500, lineHeight: 1.2 }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 700, color, lineHeight: 1.3 }}>{value}</Typography>
  </Box>);
}
const fmt = (v) => '\\u20B9' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const rfmt = (v) => v != null && v !== '' && Number(v) !== 0 ? '\\u20B9' + Number(v).toLocaleString('en-IN') : '-';
const rc = (f) => ({ renderCell: (p) => rfmt(p.row?.[f]) });

const COLUMNS = [${r.columns.map(genColumn).join(',\n  ')}];

export default function ${r.component}() {
  const navigate = useNavigate();
  const { headerLocationId } = useContext(CreateNewButtonContext);
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(${ps});
  const [rowCount, setRowCount] = useState(0); const [kpis, setKpis] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [fromDate, setFromDate] = useState(${fromDate});
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState([]);

  const fetchData = async (p = 0, ps2 = ${ps}) => {
    if (!headerLocationId) return; setLoading(true);
    try { const res = await ReportsService.${r.service}({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : headerLocationId, pageCount: p, numPerPage: ps2, fromDate, toDate });
      setData(res.data?.data || []); setRowCount(res.data?.numRows || 0); setKpis(res.data || {}); } catch (err) { setData([]); setRowCount(0); } setLoading(false);
  };
  useEffect(() => { if (headerLocationId) fetchData(page, pageSize); }, [page, pageSize, headerLocationId, fromDate, toDate, locationFilter]);
  const handleFilterApply = ({ from, to, locationIds }) => { if (from) setFromDate(from); if (to) setToDate(to); setLocationFilter(locationIds ? locationIds.map(id => ({ location_id: id })) : []); setPage(0); };
  const handleFilterClear = () => { setFromDate(${fromDate}); setToDate(moment().format('YYYY-MM-DD')); setLocationFilter([]); setPage(0); };

  return (<><Helmet><title>{titleURL} | ${r.title}</title></Helmet>
    <Card sx={{ p: 2, width: '100%', height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1, minHeight: 42, flexWrap: 'nowrap' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', mr: 0.5, whiteSpace: 'nowrap' }}>${r.title}</Typography>
        <Box sx={{ flex: 1 }} />
        ${r.kpis.map(genKpi).join('\n        ')}
        <CommonSearch searchVal={searchVal} cancelSearch={() => setSearchVal('')} requestSearch={(e) => setSearchVal(e.target.value)} />
        <FilterCreditNotes open={filterOpen} handleClose={setFilterOpen} from={fromDate} to={toDate} locationFilter={locationFilter} onApply={handleFilterApply} onClear={handleFilterClear} count={locationFilter.length > 0 ? 1 : 0} />
        <Tooltip title="Export CSV"><IconButton onClick={async () => { try { const res = await ReportsService.${r.service}({ location_id: locationFilter.length ? locationFilter.map(l => l.location_id) : headerLocationId, pageCount: 0, numPerPage: 10000, fromDate, toDate }); ExportCsv(COLUMNS.map(c => ({ title: c.headerName, field: c.field })), res.data?.data || [], '${r.title.replace(/ /g, '_')}'); } catch(e) {} }}><FileDownloadIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
        <Tooltip title="Close"><IconButton onClick={() => navigate('/report')}><CloseIcon sx={{ fontSize: 22 }} /></IconButton></Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <DataGrid rows={data} columns={COLUMNS} rowCount={rowCount} getRowId={(row) => ${r.rowId ? `row.${r.rowId} || Math.random()` : 'Math.random()'}}
          ${r.noPagination ? '' : 'paginationMode="server" paginationModel={{ page, pageSize }} onPaginationModelChange={(m) => { if (m.page !== page) setPage(m.page); if (m.pageSize !== pageSize) setPageSize(m.pageSize); }}'}
          pageSizeOptions={[20, 50, 100]} density="compact" disableRowSelectionOnClick loading={loading}
          sx={{ border: 'none', height: '100%', '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F4F7FE', fontSize: 12, fontWeight: 700 }, '& .MuiDataGrid-cell': { fontSize: 12 }, '& .MuiDataGrid-row:hover': { backgroundColor: '#F8FAFF' }, '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #E8EDF5' } }} />
      </Box>
    </Card></>);
}
`;
  fs.writeFileSync(path.join(__dirname, r.file), content);
  console.log(`Created ${r.file}`);
}
console.log('All MIS pages generated');
