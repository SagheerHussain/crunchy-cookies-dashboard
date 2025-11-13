// src/views/orders/ViewOrders.jsx
import * as React from 'react';
import { Box, Tooltip, IconButton, Popover, Menu, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import ErrorIcon from '@mui/icons-material/Error';
import ReplayIcon from '@mui/icons-material/Replay';
import PaymentsIcon from '@mui/icons-material/Payments';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../../hooks/orders/useOrders';
import { useUpdateOrder } from '../../../hooks/orders/useOrderMutation';
import { ClipLoader } from 'react-spinners';
import TablePagination from '../../../components/TablePagination';

const ORDER_STATUS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];
const PAYMENT_STATUS = ['pending', 'paid', 'failed', 'refunded', 'partial'];

/* =========================
   Pretty pill badge helpers
   ========================= */
const pill = (bg, fg, border) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '2px 10px',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 12,
  lineHeight: 1.6,
  background: bg,
  color: fg,
  border: `1px solid ${border}`,
  textTransform: 'capitalize'
});

const STATUS_STYLE = {
  pending: { bg: 'rgba(245,158,11,0.16)', fg: '#fbbf24', br: 'rgba(245,158,11,0.35)', Icon: ScheduleIcon },
  confirmed: { bg: 'rgba(59,130,246,0.16)', fg: '#93c5fd', br: 'rgba(59,130,246,0.35)', Icon: TaskAltIcon },
  shipped: { bg: 'rgba(99,102,241,0.16)', fg: '#a5b4fc', br: 'rgba(99,102,241,0.35)', Icon: LocalShippingIcon },
  delivered: { bg: 'rgba(16,185,129,0.16)', fg: '#86efac', br: 'rgba(16,185,129,0.45)', Icon: CheckCircleIcon },
  cancelled: { bg: 'rgba(239,68,68,0.16)', fg: '#fca5a5', br: 'rgba(239,68,68,0.42)', Icon: CancelIcon },
  returned: { bg: 'rgba(244,114,182,0.16)', fg: '#f9a8d4', br: 'rgba(244,114,182,0.42)', Icon: UTurnLeftIcon },
  default: { bg: 'rgba(148,163,184,0.16)', fg: '#cbd5e1', br: 'rgba(148,163,184,0.35)', Icon: ScheduleIcon }
};

const PAYMENT_STYLE = {
  pending: { bg: 'rgba(245,158,11,0.16)', fg: '#fbbf24', br: 'rgba(245,158,11,0.35)', Icon: ScheduleIcon },
  paid: { bg: 'rgba(16,185,129,0.16)', fg: '#86efac', br: 'rgba(16,185,129,0.45)', Icon: PaymentsIcon },
  failed: { bg: 'rgba(239,68,68,0.16)', fg: '#fca5a5', br: 'rgba(239,68,68,0.42)', Icon: ErrorIcon },
  refunded: { bg: 'rgba(56,189,248,0.16)', fg: '#7dd3fc', br: 'rgba(56,189,248,0.42)', Icon: ReplayIcon },
  partial: { bg: 'rgba(99,102,241,0.16)', fg: '#a5b4fc', br: 'rgba(99,102,241,0.35)', Icon: DonutLargeIcon },
  default: { bg: 'rgba(148,163,184,0.16)', fg: '#cbd5e1', br: 'rgba(148,163,184,0.35)', Icon: ScheduleIcon }
};

function StatusBadge({ value }) {
  const k = String(value || '').toLowerCase();
  const { bg, fg, br, Icon } = STATUS_STYLE[k] || STATUS_STYLE.default;
  const label = ORDER_STATUS.includes(k) ? k : 'pending';
  return (
    <span style={pill(bg, fg, br)}>
      <Icon sx={{ fontSize: 16, color: fg }} />
      {label}
    </span>
  );
}

function PaymentBadge({ value }) {
  const k = String(value || '').toLowerCase();
  const { bg, fg, br, Icon } = PAYMENT_STYLE[k] || PAYMENT_STYLE.default;
  const label = PAYMENT_STATUS.includes(k) ? k : 'pending';
  return (
    <span style={pill(bg, fg, br)}>
      <Icon sx={{ fontSize: 16, color: fg }} />
      {label}
    </span>
  );
}

/* =========================
          Component
   ========================= */
export default function ViewOrders() {
  const navigate = useNavigate();
  const updateMutation = useUpdateOrder();

  // ---------- Tabs (with All) ----------
  const TABS = ['all', ...ORDER_STATUS];
  const [status, setStatus] = React.useState('all');

  // ---------- Date filter state ----------
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const openFilter = (e) => setAnchorEl(e.currentTarget);
  const closeFilter = () => setAnchorEl(null);

  // ---------- Date helpers ----------
  const ymd = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
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
    const n = new Date();
    const y = n.getFullYear() - 1;
    return { from: ymd(new Date(y, 0, 1)), to: ymd(new Date(y, 11, 31)) };
  };

  // ---------- Build params for hook ----------
  const params = React.useMemo(() => {
    const p = {};
    if (status !== 'all') p.status = status;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [status, from, to]);

  const { data, isLoading, isFetching } = useOrders(params);

  // ---------- helpers ----------
  const safe = (v, f = '__') => (v === null || v === undefined || v === '' ? f : v);
  const toCurrency = (n) => (Number.isFinite(Number(n)) ? `QAR ${Number(n).toLocaleString()}` : '__');
  const toDate = (d) => {
    const dt = d ? new Date(d) : null;
    return dt && !isNaN(dt) ? dt.toLocaleDateString() : '__';
  };

  // --------- Row menus (status/payment) + field-scoped spinner ----------
  const [statusMenu, setStatusMenu] = React.useState({ anchor: null, row: null });
  const [paymentMenu, setPaymentMenu] = React.useState({ anchor: null, row: null });

  const [updating, setUpdating] = React.useState({ id: null, field: null });
  const isBusy = (rowId, field) => updating.id === rowId && updating.field === field;

  const openStatusMenu = (e, row) => setStatusMenu({ anchor: e.currentTarget, row });
  const closeStatusMenu = () => setStatusMenu({ anchor: null, row: null });

  const openPaymentMenu = (e, row) => setPaymentMenu({ anchor: e.currentTarget, row });
  const closePaymentMenu = () => setPaymentMenu({ anchor: null, row: null });

  const changeStatus = async (newStatus) => {
    if (!statusMenu.row) return;
    const id = statusMenu.row.id ?? statusMenu.row._id;
    closeStatusMenu();
    setUpdating({ id, field: 'status' });
    try {
      await updateMutation.mutateAsync({ id, formData: { status: newStatus } });
    } finally {
      setUpdating({ id: null, field: null });
    }
  };

  const changePayment = async (newPayment) => {
    if (!paymentMenu.row) return;
    const id = paymentMenu.row.id ?? paymentMenu.row._id;
    closePaymentMenu();
    setUpdating({ id, field: 'payment' });
    try {
      await updateMutation.mutateAsync({ id, formData: { payment: newPayment } });
    } finally {
      setUpdating({ id: null, field: null });
    }
  };

  // ---------- columns ----------
  const columns = [
    { field: 'code', headerName: 'Order ID', width: 180, renderCell: (p) => <span style={{ fontWeight: 600 }}>{safe(p.row.code)}</span> },

    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      renderCell: (p) => {
        const rowId = p.row.id ?? p.row._id;
        const busy = isBusy(rowId, 'status');
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StatusBadge value={p.row.status} />
            <Tooltip title={busy ? 'Updating…' : 'Change status'}>
              <span>
                {busy ? (
                  <ClipLoader color="#fff" size={12} />
                ) : (
                  <IconButton size="small" onClick={(e) => openStatusMenu(e, p.row)}>
                    <MoreVertIcon sx={{ color: '#e5e7eb' }} fontSize="small" />
                  </IconButton>
                )}
              </span>
            </Tooltip>
          </Box>
        );
      }
    },

    { field: 'user', headerName: 'Username', width: 160, renderCell: (p) => <span>{safe(p.row.user?.name || p.row.user)}</span> },

    {
      field: 'totalItems',
      headerName: 'No of Items',
      width: 140,
      renderCell: (p) => {
        const count = p.row.totalItems ?? p.row.items?.length ?? p.row.materials?.length;
        return <span>{safe(Number.isFinite(Number(count)) ? count : undefined)}</span>;
      }
    },

    { field: 'tax', headerName: 'Delivery Charges', width: 150, renderCell: (p) => <span>{toCurrency(p.row.tax)}</span> },
    { field: 'amount', headerName: 'Grand Total', width: 150, renderCell: (p) => <span>{toCurrency(p.row.amount)}</span> },

    {
      field: 'payment',
      headerName: 'Payment',
      width: 200,
      renderCell: (p) => {
        const rowId = p.row.id ?? p.row._id;
        const busy = isBusy(rowId, 'payment');
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentBadge value={p.row.payment} />
            <Tooltip title={busy ? 'Updating…' : 'Change payment'}>
              <span>
                {busy ? (
                  <ClipLoader color="#fff" size={12} />
                ) : (
                  <IconButton size="small" onClick={(e) => openPaymentMenu(e, p.row)}>
                    <MoreVertIcon sx={{ color: '#e5e7eb' }} fontSize="small" />
                  </IconButton>
                )}
              </span>
            </Tooltip>
          </Box>
        );
      }
    },

    { field: 'placedAt', headerName: 'Place Date', width: 170, renderCell: (p) => <span>{toDate(p.row.placedAt)}</span> },
    { field: 'deliveredAt', headerName: 'Delivery Date', width: 170, renderCell: (p) => <span>{toDate(p.row.deliveredAt)}</span> },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', gap: 6, marginTop: 6 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/order-detail/${params.row.id ?? params.row._id}`)}>
              <RemoveRedEyeIcon fontSize="small" sx={{ color: '#fff' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Custom loading overlay
  const LoadingOverlay = () => (
    <Box style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ClipLoader color="#fff" loading />
    </Box>
  );

  return (
    <Box style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 24px 0', color: '#fff' }}>Orders</h3>

      {/* Tabs + Filter button */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 12px 0' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((t) => {
            const active = t === status;
            return (
              <button
                key={t}
                onClick={() => setStatus(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: active ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.18)',
                  background: active ? 'rgba(34,197,94,0.15)' : 'rgba(31,41,55,0.6)',
                  color: '#e5e7eb',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>

        <Tooltip title="Filter by Date">
          <IconButton size="small" onClick={openFilter}>
            <FilterListIcon sx={{ color: '#e5e7eb' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Date Filter Popover with Presets */}
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

      <DataGrid
        rows={data?.rows || []}
        getRowId={(row) => row.id ?? row._id}
        columns={columns}
        loading={isLoading || isFetching}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pagination
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
        localeText={{ noRowsLabel: 'No items found' }}
        slots={{ pagination: TablePagination }}
        sx={{
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e5e7eb",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#cbd5e1",
          },
          "& .MuiDataGrid-cell": { borderColor: "rgba(255,255,255,0.06)" },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "rgba(255,255,255,0.02)",
          },
          "& .MuiDataGrid-row--borderBottom": {
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          },
          "& .MuiDataGrid-row.blocked": {
            background:
              "linear-gradient(90deg, rgba(239,68,68,0.06), rgba(239,68,68,0.0))",
          },
          "& .MuiDataGrid-virtualScroller": { overflowX: "hidden" },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            bgcolor: 'transparent',
            minHeight: 64
          }
        }}
        // slots={{ loadingOverlay: LoadingOverlay }}
      />

      {/* STATUS MENU */}
      <Menu anchorEl={statusMenu.anchor} open={Boolean(statusMenu.anchor)} onClose={closeStatusMenu} keepMounted>
        {ORDER_STATUS.map((s) => (
          <MenuItem key={s} onClick={() => changeStatus(s)} sx={{ textTransform: 'capitalize' }}>
            {s}
          </MenuItem>
        ))}
      </Menu>

      {/* PAYMENT MENU */}
      <Menu anchorEl={paymentMenu.anchor} open={Boolean(paymentMenu.anchor)} onClose={closePaymentMenu} keepMounted>
        {['pending', 'paid'].map((s) => (
          <MenuItem key={s} onClick={() => changePayment(s)} sx={{ textTransform: 'capitalize' }}>
            {s}
          </MenuItem>
        ))}
        {/* For the full set, use: PAYMENT_STATUS.map(...) */}
      </Menu>
    </Box>
  );
}
