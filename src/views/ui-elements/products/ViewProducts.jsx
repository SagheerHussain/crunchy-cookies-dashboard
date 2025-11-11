// src/views/ui-elements/products/ProductsTable.jsx
import * as React from 'react';
import {
  Box,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Typography,
  Snackbar,
  Alert,
  Popover
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Button from '../../../components/Button';
import { IoBag } from 'react-icons/io5';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../../hooks/products/useProducts';
import { useDeleteProduct } from '../../../hooks/products/useProductMutation';
import { ClipLoader } from 'react-spinners';

const SOFT = {
  success: { color: '#34ff82', bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.28)' },
  warning: { color: '#fc9801', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.28)' },
  danger: { color: '#fb2626', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.28)' },
  info: { color: '#1bdffe', bg: 'rgba(15,180,187,0.18)', border: 'rgba(15,180,187,0.28)' },
  primary: { color: '#5953fc', bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.28)' },
  secondary: { color: '#95bffb', bg: 'rgba(100,116,139,0.18)', border: 'rgba(100,116,139,0.28)' }
};

// date helpers (YYYY-MM-DD local)
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayRange = () => {
  const t = new Date();
  const s = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return { from: ymd(s), to: ymd(s) };
};
const thisMonthRange = () => {
  const n = new Date();
  return { from: ymd(new Date(n.getFullYear(), n.getMonth(), 1)), to: ymd(new Date(n.getFullYear(), n.getMonth() + 1, 0)) };
};
const thisYearRange = () => {
  const n = new Date();
  return { from: ymd(new Date(n.getFullYear(), 0, 1)), to: ymd(new Date(n.getFullYear(), 11, 31)) };
};
const prevYearRange = () => {
  const y = new Date().getFullYear() - 1;
  return { from: ymd(new Date(y, 0, 1)), to: ymd(new Date(y, 11, 31)) };
};

export default function ProductsTable() {
  const htmlToText = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').trim();
  };
  const truncate = (s, n = 120) => (s?.length > n ? s.slice(0, n - 1) + '…' : s || '');
  const navigate = useNavigate();

  // ---- tabs (All + availability) ----
  const TABS = ['all', 'in_stock', 'low_stock', 'out_of_stock'];
  const [stockStatus, setStockStatus] = React.useState('all');

  // ---- date filter state (floating button) ----
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const openFilter = (e) => setAnchorEl(e.currentTarget);
  const closeFilter = () => setAnchorEl(null);

  // query params for hook
  const params = React.useMemo(() => {
    const p = {};
    if (stockStatus !== 'all') p.stockStatus = stockStatus;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [stockStatus, from, to]);

  const { data: products, isLoading, isFetching } = useProducts(params);
  const delMutation = useDeleteProduct();
  const isDeleting = delMutation.isPending;

  // confirm dialog
  const [confirm, setConfirm] = React.useState({ open: false, id: null, title: '' });
  const openConfirm = (id, title) => setConfirm({ open: true, id, title });
  const closeConfirm = () => setConfirm({ open: false, id: null, title: '' });

  // toast
  const [toast, setToast] = React.useState({ open: false, msg: '', sev: 'success' });
  const showToast = (msg, sev = 'success') => setToast({ open: true, msg, sev });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const handleConfirmDelete = async () => {
    try {
      await delMutation.mutateAsync(confirm.id);
      showToast('Product deleted.');
    } catch (e) {
      showToast(e?.response?.data?.error || e?.message || 'Delete failed', 'error');
    } finally {
      closeConfirm();
    }
  };

  const columns = [
    {
      field: 'featuredImage',
      headerName: 'Image',
      width: 120,
      renderCell: (p) => (
        <img
          src={p.value}
          style={{ padding: '.2rem', objectFit: 'cover', objectPosition: 'center', width: 'auto', height: '100%' }}
          alt=""
        />
      )
    },
    { field: 'title', headerName: 'Title', width: 180 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 150,
      renderCell: (p) => {
        const txt = truncate(htmlToText(p.value || ''), 120);
        return <span title={txt}>{txt}</span>;
      }
    },
    { field: 'sku', headerName: 'SKU', width: 140 },
    { field: 'price', headerName: 'Price', type: 'number', width: 120, valueFormatter: (p) => `QAR ${Number(p).toFixed(2)}` },
    { field: 'remainingStocks', headerName: 'Remaining', type: 'number', width: 120 },
    {
      field: 'stockStatus',
      headerName: 'Status',
      width: 130,
      renderCell: (p) => {
        const v = p.value;
        const tone = v === 'in_stock' ? 'success' : v === 'low_stock' ? 'warning' : 'danger';
        const t = SOFT[tone];
        const label = v === 'in_stock' ? 'In stock' : v === 'low_stock' ? 'Low' : 'Out';
        return (
          <Chip
            size="small"
            label={label}
            variant="outlined"
            sx={{ color: t.color, bgcolor: t.bg, borderColor: t.border, fontWeight: 600 }}
          />
        );
      }
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      valueGetter: (p) => new Date(p.value),
      valueFormatter: (p) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(p.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <a
              className="flex items-start h-full"
              href={`https://crunchy-cookies.skynetsilicon.com/gift-detail/${p.row.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconButton size="small">
                <RemoveRedEyeIcon fontSize="small" sx={{ color: '#fff' }} />
              </IconButton>
            </a>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/products/edit/${p.row.id}`)}>
              <EditIcon fontSize="small" sx={{ color: '#fff' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => openConfirm(p.row.id, p.row.title)} disabled={isDeleting}>
              <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const LoadingOverlay = () => (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ClipLoader color="#fff" loading />
    </Box>
  );

  return (
    // position relative so the FAB can be positioned absolutely inside this page area
    <Box sx={{ width: '100%', position: 'relative', pb: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: '1rem' }}>Products</h4>
        <Button isLink to="/products/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
          Add Product
        </Button>
      </div>

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          {['all', 'in_stock', 'low_stock', 'out_of_stock'].map((t) => {
            const active = t === stockStatus;
            const label = t === 'all' ? 'All' : t === 'in_stock' ? 'In Stock' : t === 'low_stock' ? 'Low Stock' : 'Out Of Stock';
            return (
              <button
                key={t}
                onClick={() => setStockStatus(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: active ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.18)',
                  background: active ? 'rgba(34,197,94,0.15)' : 'rgba(31,41,55,0.6)',
                  color: '#e5e7eb',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div>
          {/* FLOATING FILTER BUTTON (bottom-right) */}
          <Tooltip title="Filter by Date">
            <IconButton
              onClick={openFilter}
              sx={{
                position: 'static', // stick to viewport bottom-right
                // right: { xs: 16, md: 28 },
                // bottom:{ xs: 16, md: 28 },
                zIndex: 1300
                // bgcolor:'rgba(31,41,55,0.9)',
                // border:'1px solid rgba(255,255,255,0.18)',
                // boxShadow:'0 6px 24px rgba(0,0,0,0.35)',
                // '&:hover': { bgcolor:'rgba(51,65,85,0.95)' }
              }}
              size="large"
            >
              <FilterListIcon sx={{ color: '#e5e7eb' }} />
            </IconButton>
          </Tooltip>

          {/* Date Filter Popover (anchors to floating button) */}
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={closeFilter}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                p: 2,
                background: 'rgba(0,0,0,0.95)',
                color: '#e5e7eb',
                border: '1px solid rgba(255,255,255,0.12)',
                minWidth: 320
              }
            }}
          >
            {/* Preset chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                { label: 'Today', get: todayRange },
                { label: 'This Month', get: thisMonthRange },
                { label: 'This Year', get: thisYearRange },
                { label: 'Previous Year', get: prevYearRange }
              ].map(({ label, get }) => (
                <button
                  key={label}
                  onClick={() => {
                    const r = get();
                    setFrom(r.from);
                    setTo(r.to);
                    closeFilter();
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(55,65,81,0.6)',
                    color: '#e5e7eb',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Custom range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>From</div>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(17,24,39,0.6)',
                    color: '#e5e7eb'
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>To</div>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(17,24,39,0.6)',
                    color: '#e5e7eb'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button
                onClick={() => {
                  setFrom('');
                  setTo('');
                  closeFilter();
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: '#e5e7eb',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
              <button
                onClick={closeFilter}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(34,197,94,0.4)',
                  background: 'rgba(34,197,94,0.15)',
                  color: '#d1fae5',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Apply
              </button>
            </div>
          </Popover>
        </div>
      </div>

      {/* DataGrid */}
      <DataGrid
        rows={products?.rows?.reverse() || []}
        columns={columns}
        loading={isLoading || isFetching}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
        localeText={{ noRowsLabel: 'No items found' }}
        
        slots={{ loadingOverlay: LoadingOverlay }}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirm.open} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{confirm.title || 'this product'}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MuiButton onClick={closeConfirm} disabled={isDeleting}>
            Cancel
          </MuiButton>
          <MuiButton onClick={handleConfirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={2500} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.sev} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
