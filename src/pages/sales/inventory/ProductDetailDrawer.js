import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Button, Card, Chip, Grid, IconButton, Skeleton, Slide,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarehouseIcon from '@mui/icons-material/WarehouseOutlined';
import SellIcon from '@mui/icons-material/SellOutlined';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import BarChartIcon from '@mui/icons-material/BarChart';
import { getProductTimelineAction } from '../../../redux/actions/product_actions';
import Productservice from '../../../services/product_services';
import Inventoryservice from '../../../services/inventory_services';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import moment from 'moment';

// --- Type config for timeline ---
const getTypeConfig = (row) => {
  if (row.sale_id && row.invoice_number) return { label: 'Sale', color: '#11C15B', icon: <ShoppingCartIcon sx={{ fontSize: 14 }} /> };
  if (row.receiving_id && (row.po_number || row.bill_number)) return { label: 'Purchase', color: '#0A8FDC', icon: <LocalShippingIcon sx={{ fontSize: 14 }} /> };
  if (row.dc_number) return { label: 'DC', color: '#FF8B3E', icon: <ReceiptIcon sx={{ fontSize: 14 }} /> };
  if (row.so_number) return { label: 'SO', color: '#7C4DFF', icon: <ReceiptIcon sx={{ fontSize: 14 }} /> };
  return { label: 'Movement', color: '#8C8C8C', icon: <SwapHorizIcon sx={{ fontSize: 14 }} /> };
};

// --- Stock status ---
const getStockStatus = (qty, reorderLevel) => {
  if (qty <= 0) return { label: 'Out of Stock', color: '#d32f2f', bg: '#FDECEA' };
  if (reorderLevel && qty <= reorderLevel) return { label: 'Low Stock', color: '#E65100', bg: '#FFF3E0' };
  return { label: 'In Stock', color: '#11C15B', bg: '#D9F5E5' };
};

// --- KPI Card ---
function KpiCard({ label, value, sub, icon, color = '#0A8FDC' }) {
  return (
    <Card elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E8EDF5', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography sx={{ fontSize: 10, color: '#8C8C8C', fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#2E3A59', lineHeight: 1.2 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: 10, color: '#AFAFAF', mt: 0.25 }}>{sub}</Typography>}
    </Card>
  );
}

// Compute monthly stock in/out from timeline data
function buildChartData(timeline) {
  const monthMap = {};
  timeline.forEach(row => {
    if (!row.updated_at) return;
    const key = moment(row.updated_at).format('MMM YY');
    if (!monthMap[key]) monthMap[key] = { month: key, stockIn: 0, stockOut: 0 };
    const qty = Math.abs(row.quantity || 0);
    if (row.receiving_id || row.po_number || row.bill_number) {
      monthMap[key].stockIn += qty;
    } else if (row.sale_id && row.invoice_number) {
      monthMap[key].stockOut += qty;
    }
  });
  return Object.values(monthMap).reverse().slice(-6);
}

function StockChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', mb: 2 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <BarChartIcon sx={{ fontSize: 16, color: '#7C4DFF' }} /> Stock In vs Out (Last 6 months)
      </Typography>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8C8C8C' }} />
          <YAxis tick={{ fontSize: 10, fill: '#8C8C8C' }} />
          <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E8EDF5' }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="stockIn" name="Stock In" fill="#0A8FDC" radius={[3, 3, 0, 0]} barSize={16} />
          <Bar dataKey="stockOut" name="Stock Out" fill="#11C15B" radius={[3, 3, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function ProductDetailDrawer({ open, product, onClose, products = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [locations, setLocations] = useState([]);
  const [kpis, setKpis] = useState({ tillSold: null, monthSold: null, totalPurchased: null });
  const [loading, setLoading] = useState(false);

  const getProductImage = () => {
    if (product?.imageUrl?.length > 0) return product.imageUrl[0];
    const match = products.find(p => p.name === product?.product_name || p.item_id === product?.item_id);
    return match?.imageUrl?.[0] || null;
  };

  useEffect(() => {
    if (!open || !product?.item_id) {
      setTimeline([]); setLocations([]); setKpis({ tillSold: null, monthSold: null, totalPurchased: null });
      return;
    }
    setLoading(true);

    // Parallel fetch all data
    Promise.allSettled([
      dispatch(getProductTimelineAction(product.item_id)),
      Productservice.getTill(product.item_id),
      Productservice.getMonth(product.item_id),
      Productservice.getTotalPurchasedQty(product.item_id),
      Inventoryservice.getStockByLocation(product.item_id),
    ]).then(([tlRes, tillRes, monthRes, purchRes, locRes]) => {
      const tlData = tlRes.status === 'fulfilled' ? (tlRes.value?.data || tlRes.value || []) : [];
      setTimeline(Array.isArray(tlData) ? tlData : []);
      setKpis({
        tillSold: tillRes.status === 'fulfilled' ? (tillRes.value?.data?.tillSold ?? tillRes.value?.data?.[0]?.tillSold ?? null) : null,
        monthSold: monthRes.status === 'fulfilled' ? (monthRes.value?.data?.monthSold ?? monthRes.value?.data?.[0]?.monthSold ?? null) : null,
        totalPurchased: purchRes.status === 'fulfilled'
          ? (purchRes.value?.data?.totalPurchasedQty
            ?? purchRes.value?.data?.[0]?.totalPurchasedQty
            ?? purchRes.value?.data?.total_purchase
            ?? purchRes.value?.data?.[0]?.total_purchase
            ?? null)
          : null,
      });
      setLocations(locRes.status === 'fulfilled' ? (locRes.value?.data || []) : []);
    }).finally(() => setLoading(false));
  }, [open, product?.item_id]);

  if (!open || !product) return null;

  const imgUrl = getProductImage();
  const qty = product.available_qty || 0;
  const costPrice = product.trans_items_cost_price || 0;
  const taxRate = product.tax_rate || 0;
  const price = costPrice + (costPrice * taxRate / 100);
  const total = price * qty;
  const stockStatus = getStockStatus(qty, product.reorder_level);
  const lotData = product.lots || [];
  const purchases = timeline.filter(t => t.receiving_id || t.po_number || t.bill_number);
  const sales = timeline.filter(t => t.sale_id && t.invoice_number);
  const handleCreatePurchase = () => {
    onClose();
    navigate('/sales/bills', {
      state: {
        openCreatePurchase: true,
        returnTo: '/sales/inventory',
        initialPurchaseProduct: {
          item_id: product?.item_id ?? '',
          product_name: product?.product_name ?? '',
        },
      },
    });
  };
  const handleAddOpeningStock = () => {
    onClose();
    navigate('/sales/inventory', {
      state: {
        openUploadPopup: true,
      },
    });
  };

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ===== HEADER ===== */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, borderBottom: '1px solid #E8EDF5', bgcolor: '#fff' }}>
          <IconButton onClick={onClose} size="small"><ArrowBackIcon fontSize="small" /></IconButton>

          {/* Product image */}
          <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: '#F4F7FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #E8EDF5' }}>
            {imgUrl ? <img src={imgUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              : <InventoryIcon sx={{ fontSize: 24, color: '#C4CDD5' }} />}
          </Box>

          {/* Product info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#2E3A59', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.product_name}
              </Typography>
              <Chip label={stockStatus.label} size="small" sx={{ fontSize: 10, height: 20, bgcolor: stockStatus.bg, color: stockStatus.color, fontWeight: 600 }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              {product.brand && <Chip label={product.brand} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#E3F2FD', color: '#0A8FDC' }} />}
              {product.category && <Chip label={product.category} size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#FFF3E0', color: '#E65100' }} />}
              {product.trans_is_serialized === 'Serialized' && <Chip label="Serialized" size="small" sx={{ fontSize: 9, height: 18, bgcolor: '#EDE7F6', color: '#7C4DFF' }} />}
              {product.sku && <Typography sx={{ fontSize: 10, color: '#8C8C8C' }}>SKU: <b>{product.sku}</b></Typography>}
              {product.hsn_code && <Typography sx={{ fontSize: 10, color: '#8C8C8C' }}>HSN: <b>{product.hsn_code}</b></Typography>}
              {timeline.length > 0 && <Typography sx={{ fontSize: 10, color: '#AFAFAF' }}>Last: {moment(timeline[0]?.updated_at).format('DD MMM YY')}</Typography>}
            </Box>
          </Box>

          {/* Quick actions */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Transfer Stock"><IconButton size="small" sx={{ bgcolor: '#F4F7FE' }} onClick={() => { onClose(); navigate('/sales/stocktransfer'); }}><CompareArrowsIcon sx={{ fontSize: 18, color: '#0A8FDC' }} /></IconButton></Tooltip>
            <Tooltip title="Create Sale"><IconButton size="small" sx={{ bgcolor: '#D9F5E5' }} onClick={() => { onClose(); navigate('/sales/pos'); }}><PointOfSaleIcon sx={{ fontSize: 18, color: '#11C15B' }} /></IconButton></Tooltip>
            <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
          </Box>
        </Box>

        {/* ===== SCROLLABLE CONTENT ===== */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>

          {/* KPI Cards */}
          <Grid container spacing={1.5} mb={2}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Available Qty" value={qty} icon={<InventoryIcon sx={{ fontSize: 16 }} />} color={qty > 0 ? '#11C15B' : '#d32f2f'} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Stock Value" value={`\u20B9${Number(total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={<SellIcon sx={{ fontSize: 16 }} />} color="#0A8FDC" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Sold (All Time)" value={kpis.tillSold !== null ? Number(kpis.tillSold).toLocaleString('en-IN') : loading ? '...' : '-'} icon={<ShoppingCartIcon sx={{ fontSize: 16 }} />} color="#11C15B" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Sold (This Month)" value={kpis.monthSold !== null ? kpis.monthSold : loading ? '...' : '-'} icon={<BarChartIcon sx={{ fontSize: 16 }} />} color="#7C4DFF" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Total Purchased" value={kpis.totalPurchased !== null ? Number(kpis.totalPurchased).toLocaleString('en-IN') : loading ? '...' : '-'} icon={<LocalShippingIcon sx={{ fontSize: 16 }} />} color="#FF8B3E" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <KpiCard label="Cost / Price" value={`\u20B9${costPrice.toFixed(0)}`} sub={`+${taxRate}% = \u20B9${price.toFixed(0)}`} icon={<SellIcon sx={{ fontSize: 16 }} />} color="#2E3A59" />
            </Grid>
          </Grid>

          {/* Stock In/Out Chart */}
          <StockChart data={buildChartData(timeline)} />

          {/* Main content: 70/30 split */}
          <Grid container spacing={2}>

            {/* LEFT 70%: Movement History */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#0A8FDC' }} /> Recent Transactions
                </Typography>
                {loading ? (
                  <Box>{[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 0.75, borderRadius: 1 }} />)}</Box>
                ) : timeline.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ fontSize: 13, color: '#8C8C8C', mb: 2 }}>No stock movement yet</Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddOpeningStock}>Add Opening Stock</Button>
                      <Button size="small" variant="outlined" startIcon={<LocalShippingIcon />} onClick={handleCreatePurchase}>Create Purchase</Button>
                    </Box>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Date</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Type</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Document</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Party</TableCell>
                          <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }} align="right">Qty</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {timeline.slice(0, 20).map((row, idx) => {
                          const tc = getTypeConfig(row);
                          const doc = row.invoice_number || row.po_number || row.bill_number || row.dc_number || row.so_number || row.quotation_number || '';
                          return (
                            <TableRow key={row.timeline_id || idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                              <TableCell sx={{ fontSize: 10, py: 0.5 }}>{row.updated_at ? moment(row.updated_at).format('DD MMM YY') : '-'}</TableCell>
                              <TableCell sx={{ py: 0.5 }}>
                                <Chip label={tc.label} size="small" icon={tc.icon}
                                  sx={{ fontSize: 9, height: 20, bgcolor: `${tc.color}15`, color: tc.color, fontWeight: 600, '& .MuiChip-icon': { color: tc.color, ml: 0.5 } }} />
                              </TableCell>
                              <TableCell sx={{ fontSize: 10, py: 0.5, color: '#2E3A59', fontWeight: 500 }}>{doc ? `#${doc}` : '-'}</TableCell>
                              <TableCell sx={{ fontSize: 10, py: 0.5, color: '#8C8C8C', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {row.customer_name || row.vendor_name || '-'}
                              </TableCell>
                              <TableCell sx={{ fontSize: 10, py: 0.5, fontWeight: 600, color: tc.color }} align="right">{row.quantity ?? '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            </Grid>

            {/* RIGHT 30%: Location + Quick Actions */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Location Split */}
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', mb: 2 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <WarehouseIcon sx={{ fontSize: 16, color: '#FF8B3E' }} /> Stock by Location
                </Typography>
                {loading ? (
                  <Box>{[1,2,3].map(i => <Skeleton key={i} height={32} sx={{ mb: 0.5 }} />)}</Box>
                ) : locations.length === 0 ? (
                  <Typography sx={{ fontSize: 11, color: '#AFAFAF', textAlign: 'center', py: 2 }}>No location data</Typography>
                ) : (
                  <Box>
                    {locations.map((loc, idx) => {
                      const locQty = loc.available_qty || 0;
                      const locStatus = getStockStatus(locQty, product.reorder_level);
                      return (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: idx < locations.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#2E3A59', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {loc.location_name}
                            </Typography>
                            <Typography sx={{ fontSize: 9, color: '#AFAFAF' }}>{loc.lot_count} lot{loc.lot_count !== 1 ? 's' : ''}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#2E3A59' }}>{locQty}</Typography>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: locStatus.color }} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Card>

              {/* Quick Actions */}
              <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <Button size="small" variant="outlined" fullWidth startIcon={<AddIcon />}
                    onClick={handleAddOpeningStock}
                    sx={{ justifyContent: 'flex-start', fontSize: 11, textTransform: 'none', color: '#2E3A59', borderColor: '#E8EDF5' }}>
                    Add Stock
                  </Button>
                  <Button size="small" variant="outlined" fullWidth startIcon={<CompareArrowsIcon />}
                    onClick={() => { onClose(); navigate('/sales/stocktransfer'); }}
                    sx={{ justifyContent: 'flex-start', fontSize: 11, textTransform: 'none', color: '#2E3A59', borderColor: '#E8EDF5' }}>
                    Transfer Stock
                  </Button>
                  <Button size="small" variant="outlined" fullWidth startIcon={<PointOfSaleIcon />}
                    onClick={() => { onClose(); navigate('/sales/pos'); }}
                    sx={{ justifyContent: 'flex-start', fontSize: 11, textTransform: 'none', color: '#2E3A59', borderColor: '#E8EDF5' }}>
                    Create Sale
                  </Button>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Serialized Items / Lot Details - Full Width */}
          {Array.isArray(lotData) && lotData.length > 0 && (
            <Card elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E8EDF5', bgcolor: '#fff', mt: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#2E3A59', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <InventoryIcon sx={{ fontSize: 16, color: '#7C4DFF' }} />
                {product.trans_is_serialized === 'Serialized' ? 'Serial / IMEI Tracking' : 'Lot Details'} ({lotData.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 250 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>
                        {product.trans_is_serialized === 'Serialized' ? 'Serial / IMEI' : 'Lot Number'}
                      </TableCell>
                      <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }}>Status</TableCell>
                      <TableCell sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#F8FAFC', py: 0.5 }} align="right">Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lotData.map((lot, idx) => (
                      <TableRow key={lot.lot_id || idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell sx={{ fontSize: 10, py: 0.4, fontFamily: 'monospace', color: '#2E3A59' }}>{lot.lot_number || '-'}</TableCell>
                        <TableCell sx={{ py: 0.4 }}>
                          <Chip label={lot.status === 'A' ? 'Available' : lot.status === 'S' ? 'Sold' : lot.status || 'Active'} size="small"
                            sx={{ fontSize: 9, height: 18, bgcolor: lot.status === 'S' ? '#FDECEA' : '#D9F5E5', color: lot.status === 'S' ? '#d32f2f' : '#11C15B' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 10, py: 0.4 }} align="right">
                          {lot.trans_items_cost_price ? `\u20B9${Number(lot.trans_items_cost_price).toLocaleString('en-IN')}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Box>
      </Box>
    </Slide>
  );
}

export default ProductDetailDrawer;
