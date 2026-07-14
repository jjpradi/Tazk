import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Button, Card, Chip, Divider, FormControl, Grid, IconButton, MenuItem, Select, Skeleton,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography, useTheme,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarehouseIcon from '@mui/icons-material/WarehouseOutlined';
import SellIcon from '@mui/icons-material/SellOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OptionButton from '../../../components/erpDesign/actionButton';
import { getProductErpDetails } from '../../../redux/actions/erpDetails_actions';
import {
  getCheckProductAction, getProductDateAction, getProductTillAction,
  getProductTimelineAction, getTotalPurchasedQtyAction,
} from '../../../redux/actions/product_actions';
import { listPosSalesPaymentsAction } from 'redux/actions/posSalesPayments_actions';
import { getbyidPurchaseTableAction } from 'redux/actions/purchaseTable_actions';
import { getProductPurchaseHistoryAction } from 'redux/actions/purchase_actions';
import { getAllProductSalesHistoryAction } from 'redux/actions/sales_actions';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';
import Inventoryservice from '../../../services/inventory_services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import blankprofile from '../../../assets/icon/emptyimg.png';
// Timeline built inline with modern design
import moment from 'moment';

const getTypeConfig = (row) => {
  if (row.sale_id && row.invoice_number) return { label: 'Sale', color: '#11C15B', icon: <ShoppingCartIcon sx={{ fontSize: 14 }} /> };
  if (row.receiving_id && (row.po_number || row.bill_number)) return { label: 'Purchase', color: '#0A8FDC', icon: <LocalShippingIcon sx={{ fontSize: 14 }} /> };
  if (row.dc_number) return { label: 'DC', color: '#FF8B3E', icon: <ReceiptIcon sx={{ fontSize: 14 }} /> };
  if (row.so_number) return { label: 'SO', color: '#7C4DFF', icon: <ReceiptIcon sx={{ fontSize: 14 }} /> };
  return { label: 'Movement', color: '#8C8C8C', icon: <SwapHorizIcon sx={{ fontSize: 14 }} /> };
};

function KpiCard({ label, value, sub, icon, color = '#0A8FDC' }) {
  return (
    <Card elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontSize: 12, color: '#5A6478', fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1A2138', lineHeight: 1.2 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: 12, color: '#6B7280', mt: 0.25 }}>{sub}</Typography>}
    </Card>
  );
}

function buildChartData(timeline) {
  const monthMap = {};
  timeline.forEach(row => {
    if (!row.updated_at) return;
    const key = moment(row.updated_at).format('MMM YY');
    if (!monthMap[key]) monthMap[key] = { month: key, stockIn: 0, stockOut: 0 };
    const qty = Math.abs(row.quantity || 0);
    if (row.receiving_id || row.po_number || row.bill_number) monthMap[key].stockIn += qty;
    else if (row.sale_id && row.invoice_number) monthMap[key].stockOut += qty;
  });
  return Object.values(monthMap).reverse().slice(-6);
}

export default function ProductLandingPage({
  rowIndex, type, handleEdit, handleDelete, rowPopupClose,
  item_id, searchData, searchVal, user_rights,
}) {
  const ref1 = useRef(null);
  const { setModalTypeHandler, setLoaderStatusHandler } = useContext(CreateNewButtonContext);
  const dispatch = useDispatch();
  const {
    productReducer: { product = [], check_product, productTimeline = [], product_id_data_till, product_id_data_month, product_id_data_date, totalPurchasedQty },
    erpDetailsReducer: { product_erp_details = [] },
    purchaseTableReducer: { purchase_table_id_data = [] },
    purchasesReducer: { productPurchaseHistory = [] },
    salesReducer: { allProductSalesHistory = [] },
  } = useSelector((state) => state);

  const [index, setIndex] = useState(rowIndex);
  const [productData, setProduct] = useState('');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineCount, setTimelineCount] = useState(10);
  const [activeImg, setActiveImg] = useState(0);
  const [salesMonth, setSalesMonth] = useState(new Date().getMonth());

  const fetchData = () => {
    if (index === '' || !searchData[index]) return;
    const id = searchData[index].item_id;
    setLoading(true);

    Promise.allSettled([
      dispatch(getProductErpDetails(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getCheckProductAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getProductDateAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(listPosSalesPaymentsAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getProductTillAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getTotalPurchasedQtyAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getbyidPurchaseTableAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getProductPurchaseHistoryAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getAllProductSalesHistoryAction({ item_id: id }, setModalTypeHandler, setLoaderStatusHandler)),
      dispatch(getProductTimelineAction(id, setModalTypeHandler, setLoaderStatusHandler)),
      Inventoryservice.getStockByLocation(id).then(res => setLocations(res.data || [])).catch(() => setLocations([])),
    ]).finally(() => setLoading(false));

    setProduct(searchData[index]);
  };

  ref1.current = fetchData;
  useEffect(() => { ref1.current(); }, [index]);
  useEffect(() => { if (index !== '') setProduct(searchData[index]); }, [product, productData]);

  const handleProductChange = (option) => {
    const data = searchData[index];
    if (option === 0) handleEdit(data.item_id, index);
    else if (option === 1) {
      if (check_product?.[0]?.total === 0) handleDelete(data.item_id);
      else alert('Cannot Delete This Product - Already Used');
    }
  };

  if (!productData) return null;

  const imgUrl = productData.imageUrl?.[0] || null;
  const erpData = product_erp_details?.[0] || {};
  const stockData = erpData.stock_in_hand?.[0];
  const stockQty = stockData ? (stockData.is_serialized === 1 ? stockData.serializedStock_in_hand : stockData.quantity) : 0;
  const toBeReceived = erpData.to_be_received?.[0]?.to_be_received || 0;
  const tillSold = product_id_data_till?.[0]?.tillSold || product_id_data_till?.tillSold || 0;
  const monthSold = product_id_data_month?.[0]?.monthSold || product_id_data_month?.monthSold || 0;
  const totalPurchased =
    totalPurchasedQty?.[0]?.totalPurchasedQty ??
    totalPurchasedQty?.[0]?.total_purchase ??
    totalPurchasedQty?.totalPurchasedQty ??
    totalPurchasedQty?.total_purchase ??
    0;
  const costPrice = productData.cost_price || 0;
  const unitPrice = productData.unit_price || 0;
  const timeline = productTimeline || [];
  const chartData = buildChartData(timeline);

  const getStockStatus = () => {
    if (stockQty <= 0) return { label: 'Out of Stock', color: '#d32f2f', bg: '#FDECEA' };
    if (productData.reorder_level && stockQty <= productData.reorder_level) return { label: 'Low Stock', color: '#E65100', bg: '#FFF3E0' };
    return { label: 'In Stock', color: '#11C15B', bg: '#D9F5E5' };
  };
  const status = getStockStatus();

  const theme = useTheme();

  return (
    <Card sx={{ height: 'calc(100vh - 90px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1,
        borderBottom: `2px solid ${theme.palette.primary.main}`,
        bgcolor: `${theme.palette.primary.main}08`,
        flexShrink: 0,
      }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #E8EDF5' }}>
          {imgUrl ? <img src={imgUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            : <InventoryIcon sx={{ fontSize: 20, color: '#C4CDD5' }} />}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: theme.palette.primary.main, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {productData.name}
            </Typography>
            <Chip label={status.label} size="small" sx={{ fontSize: 10, height: 20, bgcolor: status.bg, color: status.color, fontWeight: 600 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {productData.brand && <Chip label={productData.brand} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#E3F2FD', color: '#0A8FDC' }} />}
            {productData.category && <Chip label={productData.category} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#FFF3E0', color: '#E65100' }} />}
            {productData.is_serialized === 1 && <Chip label="Serialized" size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#EDE7F6', color: '#7C4DFF' }} />}
            {productData.sku && <Typography sx={{ fontSize: 10, color: '#8C8C8C' }}>SKU: <b>{productData.sku}</b></Typography>}
            {productData.hsn_code && <Typography sx={{ fontSize: 10, color: '#8C8C8C' }}>HSN: <b>{productData.hsn_code}</b></Typography>}
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <OptionButton handleProductChange={handleProductChange} type={type} user_rights={user_rights} />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Previous"><span><IconButton size="small" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowBackIosNewIcon sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
          <Tooltip title="Next"><span><IconButton size="small" disabled={searchData.length - 1 === index} onClick={() => setIndex(index + 1)}><ArrowForwardIosIcon sx={{ fontSize: 16 }} /></IconButton></span></Tooltip>
          <Tooltip title="Close"><IconButton size="small" onClick={() => { setLoaderStatusHandler(true); rowPopupClose(); setLoaderStatusHandler(false); }}><CloseIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#F8FAFC' }}>
        {/* KPI Cards */}
        <Grid container spacing={1.5} mb={2}>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard label="Stock In Hand" value={stockQty} icon={<InventoryIcon sx={{ fontSize: 16 }} />} color={stockQty > 0 ? '#11C15B' : '#d32f2f'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard label="To Be Received" value={toBeReceived} icon={<LocalShippingIcon sx={{ fontSize: 16 }} />} color="#FF8B3E" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard label="Sold (All Time)" value={Number(tillSold).toLocaleString('en-IN')} icon={<ShoppingCartIcon sx={{ fontSize: 16 }} />} color="#11C15B" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard label="Sold (Month)" value={monthSold} icon={<BarChartIcon sx={{ fontSize: 16 }} />} color="#7C4DFF" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard label="Total Purchased" value={Number(totalPurchased).toLocaleString('en-IN')} icon={<LocalShippingIcon sx={{ fontSize: 16 }} />} color="#0A8FDC" />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <KpiCard label="Cost / Unit Price" value={`\u20B9${Number(costPrice).toLocaleString('en-IN')}`} sub={`MRP \u20B9${Number(unitPrice).toLocaleString('en-IN')}`} icon={<SellIcon sx={{ fontSize: 16 }} />} color="#2E3A59" />
          </Grid>
        </Grid>

        {/* Image Gallery + Sales Chart */}
        <Grid container spacing={2} mb={2}>
          {/* Image Gallery */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', height: '100%' }}>
              <Box sx={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F7FE', borderRadius: 1.5, mb: 1, overflow: 'hidden' }}>
                {productData.imageUrl?.length > 0 ? (
                  <img src={productData.imageUrl[activeImg] || productData.imageUrl[0]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <InventoryIcon sx={{ fontSize: 64, color: '#C4CDD5' }} />
                )}
              </Box>
              {productData.imageUrl?.length > 1 && (
                <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
                  {productData.imageUrl.map((url, i) => (
                    <Box key={i} onClick={() => setActiveImg(i)}
                      sx={{ width: 40, height: 40, borderRadius: 1, border: activeImg === i ? '2px solid #0A8FDC' : '1px solid #E8EDF5', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
                      <img src={url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>

          {/* Sales Chart with month selector */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <BarChartIcon sx={{ fontSize: 16, color: '#7C4DFF' }} /> Sales Graph
                </Typography>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                  <Select value={salesMonth} onChange={(e) => setSalesMonth(e.target.value)} sx={{ fontSize: 12, height: 32 }}>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                      <MenuItem key={i} value={i} sx={{ fontSize: 12 }}>{m}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {(() => {
                const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][salesMonth];
                const year = new Date().getFullYear();
                const daysInMonth = new Date(year, salesMonth + 1, 0).getDate();
                const salesRowsFromHistory = Array.isArray(allProductSalesHistory) ? allProductSalesHistory : [];
                const historyHasQty = salesRowsFromHistory.some((row) => Number(row.quantity ?? row.qty ?? row.sold_qty ?? 0) > 0);
                const salesRows = historyHasQty
                  ? salesRowsFromHistory
                  : timeline.filter((row) => row.sale_id || row.invoice_number);
                const salesData = [];
                for (let d = 1; d <= daysInMonth; d++) {
                  const dayStr = String(d).padStart(2, '0');
                  const dateKey = `${year}-${String(salesMonth + 1).padStart(2, '0')}-${dayStr}`;
                  const daySales = salesRows.filter((s) => {
                    const saleDate = s.sale_time || s.invoice_date || s.updated_at || s.createdAt || s.created_at;
                    return saleDate && moment(saleDate).format('YYYY-MM-DD') === dateKey;
                  });
                  const qty = daySales.reduce((sum, s) => {
                    const rowQty = s.quantity ?? s.qty ?? s.sold_qty ?? 0;
                    return sum + (Number(rowQty) || 0);
                  }, 0);
                  salesData.push({ day: d, qty });
                }
                const hasData = salesData.some(d => d.qty > 0);
                return (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={salesData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#8C8C8C' }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: '#8C8C8C' }} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => [`${v} Qty`, 'Sold']} labelFormatter={(d) => `${d} ${monthName}`} />
                      <Bar dataKey="qty" name="Sold" fill="#11C15B" radius={[3, 3, 0, 0]} barSize={10} />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Card>
          </Grid>
        </Grid>

        {/* 70/30 Split: Product Details + Location */}
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Product Details Card */}
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', mb: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5 }}>Product Details</Typography>
              {[
                { label: 'Description', value: productData.description },
                { label: 'Model', value: productData.model },
                { label: 'Variant', value: productData.variant },
                { label: 'MRP', value: productData.max_price ? `\u20B9${Number(productData.max_price).toLocaleString('en-IN')}` : null },
                { label: 'Stockable', value: productData.stock_type === 0 ? 'Service' : 'Goods' },
                { label: 'Serialized', value: productData.is_serialized === 1 ? 'Yes' : 'No' },
                { label: 'Reorder Level', value: productData.reorder_level || 'Not Set' },
                { label: 'Auto Reorder', value: productData.automatic_reorder_level ? 'Yes' : 'No' },
                { label: 'Tax Category', value: productData.tax_category },
                { label: 'HSN Code', value: productData.hsn_code },
                { label: 'Launch Date', value: productData.creationDate ? moment(productData.creationDate).format('DD/MM/YYYY') : null },
              ].filter(d => d.value && d.value !== '-').map((d, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #F5F5F5' }}>
                  <Typography sx={{ fontSize: 11, color: '#6B7280' }}>{d.label}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#2E3A59' }}>{d.value}</Typography>
                </Box>
              ))}
            </Card>

            {/* Purchase History */}
            {productPurchaseHistory.length > 0 && (
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <LocalShippingIcon sx={{ fontSize: 16, color: '#0A8FDC' }} /> Purchase History
                </Typography>
                <TableContainer sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Date</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Bill #</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Vendor</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }} align="right">Qty</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }} align="right">Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productPurchaseHistory.slice(0, 15).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }}>{row.receiving_date ? moment(row.receiving_date).format('DD MMM YY') : '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }}>{row.bill_number || row.po_number || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }}>{row.supplier_name || row.company_name || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }} align="right">{row.received_quantity || row.quantity || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }} align="right">{row.item_cost_price ? `\u20B9${row.item_cost_price}` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* Sales History */}
            {allProductSalesHistory.length > 0 && (
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', mt: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ShoppingCartIcon sx={{ fontSize: 16, color: '#11C15B' }} /> Sales History
                </Typography>
                <TableContainer sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Date</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Invoice #</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Customer</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }} align="right">Qty</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }} align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allProductSalesHistory.slice(0, 15).map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }}>{row.sale_time ? moment(row.sale_time).format('DD MMM YY') : '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }}>{row.invoice_number || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }}>{row.customer_name || row.first_name || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }} align="right">{row.quantity || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 10, py: 0.4 }} align="right">{row.item_unit_price ? `\u20B9${row.item_unit_price}` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            {/* Location Split */}
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <WarehouseIcon sx={{ fontSize: 16, color: '#FF8B3E' }} /> Stock by Location
              </Typography>
              {locations.length === 0 ? (
                <Typography sx={{ fontSize: 11, color: '#AFAFAF', textAlign: 'center', py: 2 }}>No location data</Typography>
              ) : locations.map((loc, idx) => {
                const q = loc.available_qty || 0;
                return (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: idx < locations.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#2E3A59' }}>{loc.location_name}</Typography>
                      <Typography sx={{ fontSize: 9, color: '#AFAFAF' }}>{loc.lot_count} lot{loc.lot_count !== 1 ? 's' : ''}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{q}</Typography>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: q > 0 ? '#11C15B' : '#d32f2f' }} />
                    </Box>
                  </Box>
                );
              })}
            </Card>
          </Grid>
        </Grid>

        {/* Timeline - Full Width Table at Bottom */}
        <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: '#0A8FDC' }} /> Timeline
          </Typography>
          {timeline.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: '#8C8C8C', textAlign: 'center', py: 4 }}>No activity yet</Typography>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.75 }}>Date</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.75 }}>Type</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.75 }}>Document #</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.75 }} align="right">Qty</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.75 }}>Party</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeline.slice(0, timelineCount).map((m, idx) => {
                      const tc = getTypeConfig(m);
                      const label = m.status === 'sales' ? 'Invoice' : m.status === 'salesOrder' ? 'Sales Order' : m.status === 'purchase' ? 'Bills' : m.status === 'purchase - po' ? 'PO' : m.status === 'quotation' ? 'Quotation' : m.status === 'purchase return' ?  'Return' : m.status === 'salesreturn' ? 'Sales Return' : m.status === 'dcreturn' ? 'DC Return' : 'DC';
                      const doc = m.invoice_number || m.bill_number || m.po_number || m.dc_number || m.so_number || m.quotation_number || '';
                      const party = m.customer_name || m.vendor_name || '';
                      return (
                        <TableRow key={m.timeline_id || idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ fontSize: 11, py: 0.6, color: '#6B7280', whiteSpace: 'nowrap' }}>{m.updated_at ? moment(m.updated_at).format('DD MMM YY, hh:mm A') : '-'}</TableCell>
                          <TableCell sx={{ py: 0.6 }}>
                            <Chip label={label} size="small" sx={{ fontSize: 10, height: 20, bgcolor: `${tc.color}15`, color: tc.color, fontWeight: 600 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: 11, py: 0.6, fontWeight: 500, color: '#2E3A59' }}>{doc || '-'}</TableCell>
                          <TableCell sx={{ fontSize: 11, py: 0.6, fontWeight: 600, color: tc.color }} align="right">{m.quantity ?? '-'}</TableCell>
                          <TableCell sx={{ fontSize: 11, py: 0.6, color: '#6B7280', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{party || '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              {timelineCount < timeline.length && (
                <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                  <Button size="small" variant="outlined" onClick={() => setTimelineCount(prev => prev + 10)}>Show More</Button>
                </Box>
              )}
            </>
          )}
        </Card>
      </Box>
    </Card>
  );
}
