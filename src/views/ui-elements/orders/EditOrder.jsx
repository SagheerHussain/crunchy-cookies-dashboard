// src/views/orders/EditOrder.jsx
import React from 'react';
import { Box, Paper, Grid, TextField, MenuItem, Button, Typography, Stack, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail } from '../../../hooks/orders/useOrders';
import { useUpdateOrder } from '../../../hooks/orders/useOrderMutation';

const ORDER_STATUS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];

// helpers: Date <-> input
const toLocalInput = (v) => {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toISOorNull = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString();
};
const numOrNull = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  // fetch detail
  const { data: order, isLoading } = useOrderDetail(id);
  const updateMutation = useUpdateOrder();

  // local form state (no react-hook-form)
  const [form, setForm] = React.useState({
    code: '',
    user: '', // ObjectId as string
    items: '', // OrderItem ObjectId as string
    totalItems: '',
    totalAmount: '',
    appliedCoupon: '',
    shippingAddress: '', // Address ObjectId as string
    deliveryInstructions: '',
    cardMessage: '',
    cardImage: '',
    taxAmount: '',
    status: 'pending',
    confirmedAt: '',
    deliveredAt: '',
    cancelReason: ''
  });

  // hydrate defaults
  React.useEffect(() => {
    if (!order?._id) return;
    setForm({
      code: order.code || '',
      user: order.user?._id || order.user || '',
      items: order.items?._id || order.items || '',
      totalItems: order.totalItems ?? '',
      totalAmount: order.totalAmount ?? '',
      appliedCoupon: order.appliedCoupon || '',
      shippingAddress: order.shippingAddress?._id || order.shippingAddress || '',
      deliveryInstructions: order.deliveryInstructions || '',
      cardMessage: order.cardMessage || '',
      cardImage: order.cardImage || '',
      taxAmount: order.taxAmount ?? '',
      status: order.status || 'pending',
      confirmedAt: toLocalInput(order.confirmedAt),
      deliveredAt: toLocalInput(order.deliveredAt),
      cancelReason: order.cancelReason || ''
    });
  }, [order]);

  // toast
  const [toast, setToast] = React.useState({ open: false, msg: '', sev: 'success' });
  const showToast = (msg, sev = 'success') => setToast({ open: true, msg, sev });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  // changes
  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // basic validation example
    if (!form.status) {
      showToast('Status is required.', 'error');
      return;
    }
    if (form.status === 'cancelled' && !form.cancelReason.trim()) {
      showToast('Cancel reason is required when status is Cancelled.', 'error');
      return;
    }

    // build payload using controller fields only
    const payload = {
      code: form.code || undefined,
      user: form.user || undefined,
      items: form.items || undefined,
      totalItems: numOrNull(form.totalItems),
      totalAmount: numOrNull(form.totalAmount),
      appliedCoupon: form.appliedCoupon || undefined,
      shippingAddress: form.shippingAddress || undefined,
      deliveryInstructions: form.deliveryInstructions || undefined,
      cardMessage: form.cardMessage || undefined,
      cardImage: form.cardImage || undefined,
      taxAmount: numOrNull(form.taxAmount),
      status: form.status || undefined,
      confirmedAt: toISOorNull(form.confirmedAt),
      deliveredAt: toISOorNull(form.deliveredAt),
      cancelReason: form.cancelReason?.trim() || (form.status === 'cancelled' ? '' : undefined)
    };

    try {
      await updateMutation.mutateAsync({ id, formData: payload });
      showToast('Order updated successfully.');
      setTimeout(() => navigate('/orders'), 500);
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.message || 'Update failed';
      showToast(msg, 'error');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order?._id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Order not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
        Edit Order
      </Typography>

      {/* quick context */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#e5e7eb'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<span style={{ opacity: 0.2 }}>|</span>}>
          <div>
            <strong>Order ID:</strong> {order.code || '__'}
          </div>
          <div>
            <strong>User:</strong> {order.user?.email || order.user?._id || '__'}
          </div>
          <div>
            <strong>Placed:</strong> {order.placedAt ? new Date(order.placedAt).toLocaleString() : '__'}
          </div>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#e5e7eb'
        }}
      >
        <form onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            {/* IDs & meta */}
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Code"
                size="small"
                fullWidth
                value={form.code}
                onChange={onChange('code')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="User Id"
                size="small"
                fullWidth
                value={form.user}
                onChange={onChange('user')}
                placeholder="Mongo ObjectId"
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="OrderItem Id"
                size="small"
                fullWidth
                value={form.items}
                onChange={onChange('items')}
                placeholder="OrderItem ObjectId"
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Shipping Address Id"
                size="small"
                fullWidth
                value={form.shippingAddress}
                onChange={onChange('shippingAddress')}
                placeholder="Address ObjectId"
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>

            {/* amounts */}
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Total Items"
                type="number"
                size="small"
                fullWidth
                value={form.totalItems}
                onChange={onChange('totalItems')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Total Amount"
                type="number"
                size="small"
                fullWidth
                value={form.totalAmount}
                onChange={onChange('totalAmount')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Tax Amount"
                type="number"
                size="small"
                fullWidth
                value={form.taxAmount}
                onChange={onChange('taxAmount')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>

            {/* coupon + misc */}
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Applied Coupon"
                size="small"
                fullWidth
                value={form.appliedCoupon}
                onChange={onChange('appliedCoupon')}
                placeholder="Coupon code or ID"
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Card Message"
                size="small"
                fullWidth
                multiline
                value={form.cardMessage}
                onChange={onChange('cardMessage')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="Delivery Instructions"
                size="small"
                fullWidth
                multiline
                value={form.deliveryInstructions}
                onChange={onChange('deliveryInstructions')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>

            {/* status + dates */}
            <Grid item sx={{ width: '24%' }}>
              <TextField
                select
                label="Status"
                size="small"
                fullWidth
                value={form.status}
                onChange={onChange('status')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              >
                {ORDER_STATUS.map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                    {s.replaceAll('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* actions */}
            <Grid item sx={{ width: '100%' }}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#e5e7eb' }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={18} color="inherit" />
                      <span>Saving…</span>
                    </Stack>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.sev} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
