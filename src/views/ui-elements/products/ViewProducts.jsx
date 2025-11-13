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
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../../hooks/products/useProducts';
import { useDeleteProduct } from '../../../hooks/products/useProductMutation';
import { ClipLoader } from 'react-spinners';
import TablePagination from '../../../components/TablePagination';

const SOFT = {
  success: { color: '#34ff82', bg: 'rgba(34,197,94,0.18)', border: 'rgba(34,197,94,0.28)' },
  warning: { color: '#fc9801', bg: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.28)' },
  danger: { color: '#fb2626', bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.28)' },
  info: { color: '#1bdffe', bg: 'rgba(15,180,187,0.18)', border: 'rgba(15,180,187,0.28)' },
  primary: { color: '#5953fc', bg: 'rgba(99,102,241,0.18)', border: 'rgba(99,102,241,0.28)' },
  secondary: { color: '#95bffb', bg: 'rgba(100,116,139,0.18)', border: 'rgba(100,116,139,0.28)' }
};

// date helpers (YYYY-MM-DD local)
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayRange = () => {
  const t = new Date();
  const s = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return { from: ymd(s), to: ymd(s) };
};
const thisMonthRange = () => {
  const n = new Date();
  return {
    from: ymd(new Date(n.getFullYear(), n.getMonth(), 1)),
    to: ymd(new Date(n.getFullYear(), n.getMonth() + 1, 0))
  };
};
const thisYearRange = () => {
  const n = new Date();
  return { from: ymd(new Date(n.getFullYear(), 0, 1)), to: ymd(new Date(n.getFullYear(), 11, 31)) };
};
const prevYearRange = () => {
  const y = new Date().getFullYear() - 1;
  return { from: ymd(new Date(y, 0, 1)), to: ymd(new Date(y, 11, 31)) };
};

/* ===== Better stock badge ===== */
const pill = (bg, fg, border) => ({
  bgcolor: bg,
  color: fg,
  border: `1px solid ${border}`,
  fontWeight: 700,
  height: 26,
  borderRadius: 999,
  '& .MuiChip-icon': { fontSize: 16, mr: 0.5, color: fg },
  '& .MuiChip-label': { px: 0.75, fontSize: 12, letterSpacing: 0.2 }
});

function stockChip(value) {
  const v = String(value || '').toLowerCase(); // in_stock | low_stock | out_of_stock
  if (v === 'in_stock') {
    return (
      <Chip
        size="small"
        icon={<CheckCircleIcon />}
        label="In stock"
        sx={pill('rgba(16,185,129,0.18)', '#86efac', 'rgba(16,185,129,0.45)')}
      />
    );
  }
  if (v === 'low_stock') {
    return (
      <Chip
        size="small"
        icon={<ReportProblemIcon />}
        label="Low stock"
        sx={pill('rgba(245,158,11,0.18)', '#fbbf24', 'rgba(245,158,11,0.45)')}
      />
    );
  }
  // out_of_stock (default)
  return (
    <Chip
      size="small"
      icon={<CancelIcon />}
      label="Out of stock"
      sx={pill('rgba(239,68,68,0.18)', '#fca5a5', 'rgba(239,68,68,0.45)')}
    />
  );
}

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

  // 🔍 search state + debounce (goes to backend as `q`)
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400); // 400ms debounce
    return () => clearTimeout(id);
  }, [search]);

  // query params for hook
  const params = React.useMemo(() => {
    const p = {};
    if (stockStatus !== 'all') p.stockStatus = stockStatus;
    if (from) p.from = from;
    if (to) p.to = to;
    if (debouncedSearch) p.q = debouncedSearch; // 👈 backend search param
    return p;
  }, [stockStatus, from, to, debouncedSearch]);

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
    {
      field: 'price',
      headerName: 'Price',
      type: 'number',
      width: 120,
      valueFormatter: (p) => `QAR ${Number(p).toFixed(2)}`
    },
    { field: 'remainingStocks', headerName: 'Remaining', type: 'number', width: 120 },

    // nicer stock badge
    {
      field: 'stockStatus',
      headerName: 'Status',
      width: 150,
      sortable: true,
      renderCell: (p) => stockChip(p.value)
    },

    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      valueGetter: (p) => new Date(p.value),
      valueFormatter: (p) =>
        new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(p.value)
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
    <Box sx={{ width: '100%', position: 'relative', pb: 8 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <h4 style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: '1rem' }}>Products</h4>
        <Button isLink to="/products/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
          Add Product
        </Button>
      </div>

      {/* Status Tabs + Search + Filter */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginBottom: 12 }}>
        {/* tabs */}
        <div>
          {TABS.map((t) => {
            const active = t === stockStatus;
            const label =
              t === 'all' ? 'All' : t === 'in_stock' ? 'In Stock' : t === 'low_stock' ? 'Low Stock' : 'Out Of Stock';
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

        {/* search + filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* 🔍 Search pill */}
          <div
            style={{
              position: 'relative',
              minWidth: 260
            }}
          >
            <SearchIcon
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 20,
                color: 'rgba(148,163,184,0.9)'
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, SKU, description…"
              style={{
                width: '100%',
                padding: '8px 32px 8px 34px',
                borderRadius: 999,
                border: '1px solid #ffffff2f',
                background: '#222',
                color: '#e5e7eb',
                fontSize: 13,
                outline: 'none',
                boxShadow: '0 0 0 1px rgba(15,23,42,0.9)'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'rgba(148,163,184,0.18)',
                  color: '#e5e7eb',
                  width: 20,
                  height: 20,
                  fontSize: 12,
                  cursor: 'pointer',
                  lineHeight: '20px'
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Filter button */}
          <Tooltip title="Filter by Date">
            <IconButton onClick={openFilter} sx={{ position: 'static', zIndex: 1300 }} size="large">
              <FilterListIcon sx={{ color: '#e5e7eb' }} />
            </IconButton>
          </Tooltip>
        </div>

        {/* Date Filter Popover */}
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

      {/* DataGrid */}
      <DataGrid
        rows={products?.rows?.slice().reverse() || []}
        columns={columns}
        loading={isLoading || isFetching}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
        localeText={{ noRowsLabel: 'No items found' }}
        slots={{ pagination: TablePagination, loadingOverlay: LoadingOverlay }}
        sx={{
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#e5e7eb',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#cbd5e1'
          },
          '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' },
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: 'rgba(255,255,255,0.02)'
          },
          '& .MuiDataGrid-row--borderBottom': {
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          },
          '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            bgcolor: 'transparent',
            minHeight: 64
          }
        }}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirm.open} onClose={closeConfirm} maxWidth="xs" fullWidth>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{confirm.title || 'this product'}</strong>? This action cannot be
            undone.
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
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeToast} severity={toast.sev} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}