// src/views/users/EditUser.jsx  (rename path to users/)
import React from 'react';
import {
  Box, Paper, Grid, TextField, MenuItem, Button, Typography, Stack,
  CircularProgress, Snackbar, Alert, FormControlLabel, Switch
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetail } from '../../../hooks/users/useUsers';
import { useUpdateUser } from '../../../hooks/users/useUserMutation';

// helpers
const toLocalInput = (v) => {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (isNaN(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toISOorNull = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d.toISOString();
};

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUserDetail(id); // ⬅️ now user is the plain object
  const updateMutation = useUpdateUser();

  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    gender: '',
    dob: '',
    status: '',
    isActive: false,
  });

  React.useEffect(() => {
    if (!user?._id) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      gender: user.gender || '',
      dob: toLocalInput(user.dob),
      status: user.status || 'active',
      isActive: !!user.isActive,
    });
  }, [user]);

  const [toast, setToast] = React.useState({ open: false, msg: '', sev: 'success' });
  const showToast = (msg, sev = 'success') => setToast({ open: true, msg, sev });
  const closeToast = () => setToast((t) => ({ ...t, open: false }));

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const onToggle = (key) => (_e, checked) => setForm((f) => ({ ...f, [key]: checked }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.status) {
      showToast('Status is required.', 'error');
      return;
    }
    const payload = {
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      role: form.role || undefined,
      gender: form.gender || undefined,
      dob: toISOorNull(form.dob),
      status: form.status || undefined,
      isActive: !!form.isActive,
    };
    try {
      await updateMutation.mutateAsync({ id, formData: payload });
      showToast('User updated successfully.');
      setTimeout(() => navigate('/customers'), 500);
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.message || 'Update failed';
      showToast(msg, 'error');
    }
  };

  if (isLoading) {
    return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  if (!user?._id) {
    return <Box sx={{ p: 3 }}><Alert severity="warning">User not found.</Alert></Box>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
        Edit User
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 2, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<span style={{ opacity: 0.2 }}>|</span>}>
          <div><strong>User ID:</strong> {user._id}</div>
          <div><strong>User:</strong> {(user.firstName || '') + ' ' + (user.lastName || '')}</div>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb' }}>
        <form onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item sx={{ width: '24%' }}>
              <TextField label="First Name" size="small" fullWidth value={form.firstName} onChange={onChange('firstName')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }} />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField label="Last Name" size="small" fullWidth value={form.lastName} onChange={onChange('lastName')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }} />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField label="Email" size="small" fullWidth value={form.email} onChange={onChange('email')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }} />
            </Grid>
            <Grid item sx={{ width: '24%' }}>
              <TextField label="Phone" size="small" fullWidth value={form.phone} onChange={onChange('phone')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }} />
            </Grid>

            <Grid item sx={{ width: '24%' }}>
              <TextField select label="Gender" size="small" fullWidth value={form.gender} onChange={onChange('gender')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}>
                {['male', 'female', 'other'].map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item sx={{ width: '24%' }}>
              <TextField label="Role" size="small" fullWidth value={form.role} onChange={onChange('role')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }} />
            </Grid>

            <Grid item sx={{ width: '24%' }}>
              <TextField
                label="DOB"
                type="datetime-local"  // ⬅️ matches toLocalInput format
                size="small"
                fullWidth
                value={form.dob}
                onChange={onChange('dob')}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}
              />
            </Grid>

            <Grid item sx={{ width: '24%' }}>
              <TextField select label="Status" size="small" fullWidth value={form.status} onChange={onChange('status')}
                sx={{ '& .MuiInputBase-input': { color: '#e5e7eb' }, '& .MuiFormLabel-root': { color: '#cbd5e1' } }}>
                {['active', 'blocked'].map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item sx={{ width: '100%' }}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button type="button" variant="outlined" onClick={() => navigate(-1)}
                  sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#e5e7eb' }}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CircularProgress size={18} color="inherit" />
                      <span>Saving…</span>
                    </Stack>
                  ) : ('Save Changes')}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar open={toast.open} autoHideDuration={2500} onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.sev} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
