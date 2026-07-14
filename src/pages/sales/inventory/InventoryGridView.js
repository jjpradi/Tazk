import React from 'react';
import { Box, Card, Chip, Skeleton, Typography, TablePagination } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import LabelIcon from '@mui/icons-material/LabelOutlined';

const cardSx = {
  borderRadius: 1.5,
  border: '1px solid #E8EDF5',
  cursor: 'pointer',
  overflow: 'hidden',
  height: '100%',
  transition: 'all 0.15s ease',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(10,143,220,0.12)',
    borderColor: '#0A8FDC',
  },
};

const qtyBadgeSx = (qty) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 22,
  height: 18,
  px: 0.5,
  borderRadius: 10,
  fontSize: 10,
  fontWeight: 700,
  bgcolor: qty > 0 ? '#D9F5E5' : '#FDECEA',
  color: qty > 0 ? '#11C15B' : '#d32f2f',
});

// Product card for "All" and "stockByLotWise" views
function ProductCard({ row, imgUrl, onCardClick }) {
  const qty = row.available_qty || 0;
  return (
    <Card sx={cardSx} elevation={0} onClick={() => onCardClick && onCardClick(row)}>
      <Box sx={{ display: 'flex', height: '100%' }}>
        <Box sx={{ width: 64, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F7FE', flexShrink: 0, borderRight: '1px solid #E8EDF5' }}>
          {imgUrl ? (
            <img src={imgUrl} alt="" style={{ maxWidth: 56, maxHeight: 56, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <InventoryIcon sx={{ fontSize: 26, color: '#C4CDD5' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, p: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#2E3A59', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.25 }} title={row.product_name}>
            {row.product_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.3, mb: 0.5, flexWrap: 'nowrap', overflow: 'hidden' }}>
            {row.brand && <Chip label={row.brand} size="small" sx={{ fontSize: 9, height: 16, maxWidth: 70, bgcolor: '#E3F2FD', color: '#0A8FDC', '& .MuiChip-label': { px: 0.5 } }} />}
            {row.category && <Chip label={row.category} size="small" sx={{ fontSize: 9, height: 16, maxWidth: 70, bgcolor: '#FFF3E0', color: '#E65100', '& .MuiChip-label': { px: 0.5 } }} />}
          </Box>
          {row.lot_number && <Typography sx={{ fontSize: 9, color: '#7C4DFF', mb: 0.25 }}>Lot: {row.lot_number}</Typography>}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0A8FDC' }}>{'\u20B9'}{row.total?.toFixed(0) || '0'}</Typography>
            <Box sx={qtyBadgeSx(qty)}>{qty}</Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

// Summary card for Vendor, Brand, Category views
function SummaryCard({ row, chipType, onCardClick }) {
  const qty = row.available_qty || 0;
  const total = row.total || 0;
  const isVendor = chipType === 'stockByVendor';
  const isBrand = chipType === 'stockByBrand';
  const isModel = chipType === 'stockByModel';

  const name = isVendor ? row.supplier_name : isBrand ? row.brand : isModel ? (row.model || 'No Model') : row.category;
  const icon = isVendor ? <StorefrontIcon sx={{ fontSize: 22, color: '#0A8FDC' }} />
    : isBrand ? <LabelIcon sx={{ fontSize: 22, color: '#7C4DFF' }} />
    : isModel ? <LabelIcon sx={{ fontSize: 22, color: '#2E7D32' }} />
    : <CategoryIcon sx={{ fontSize: 22, color: '#E65100' }} />;
  const iconBg = isVendor ? '#E3F2FD' : isBrand ? '#EDE7F6' : isModel ? '#E8F5E9' : '#FFF3E0';

  return (
    <Card sx={cardSx} elevation={0} onClick={() => onCardClick && onCardClick(row)}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#2E3A59', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.25 }} title={name}>
            {name || '(Unknown)'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0A8FDC' }}>{'\u20B9'}{Number(total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography>
            <Box sx={qtyBadgeSx(qty)}>{qty}</Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

function InventoryGridView({
  data = [],
  products = [],
  chipType = 'All',
  onCardClick,
  isApiFinished,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) {
  const isSummary = chipType === 'stockByVendor' || chipType === 'stockByBrand' || chipType === 'stockByCategory' || chipType === 'stockByModel';
  const minCardWidth = isSummary ? '240px' : '220px';

  const getProductImage = (row) => {
    if (row.imageUrl && row.imageUrl.length > 0) return row.imageUrl[0];
    const match = products.find((p) => p.name === row.product_name || p.item_id === row.item_id);
    if (match && match.imageUrl && match.imageUrl.length > 0) return match.imageUrl[0];
    return null;
  };

  if (!isApiFinished) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`, gap: 1.5, p: 0.5 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={isSummary ? 70 : 90} sx={{ borderRadius: 1.5 }} />
        ))}
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#8C8C8C' }}>
        <Typography variant="body2">No data found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'auto', px: 0.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`, gap: 1.5, pb: 1 }}>
          {data.map((row, index) => {
            const key = isSummary
              ? `${chipType}_${row.supplier_id || row.brand || row.category}_${index}`
              : row.trans_items || `${row.product_name}_${row.location}_${index}`;

            if (isSummary) {
              return <SummaryCard key={key} row={row} chipType={chipType} onCardClick={onCardClick} />;
            }
            return <ProductCard key={key} row={row} imgUrl={getProductImage(row)} onCardClick={onCardClick} />;
          })}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E8EDF5', pt: 0.5 }}>
        <TablePagination
          component="div" count={totalCount || 0} page={page} rowsPerPage={pageSize}
          onPageChange={(e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onPageSizeChange(Number(e.target.value))}
          rowsPerPageOptions={[20, 50, 100]}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 36 } }}
        />
      </Box>
    </Box>
  );
}

export default InventoryGridView;
