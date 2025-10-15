import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Grid } from '@mui/material';
import { TextField, MenuItem } from '@mui/material';
import { Stack } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Save } from '@mui/icons-material';
import Btn from '../../../components/Button';

import { useAddColor, useUpdateColor } from '../../../hooks/colors/useColorMutation';
import { useQuery } from '@tanstack/react-query';
import { getColorsById } from '../../../api/colors';

const MODE_OPTIONS = ['hex', 'rgb'];

const AddOrEditColors = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: '',
    ar_name: '',
    value: '',
    mode: 'hex',
  });

  const { id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');

  // ----- detail (edit) -----
  const { data: detail } = useQuery({
    queryKey: ['color', id],
    queryFn: () => getColorsById(id),
    enabled: isEdit && !!id,
    select: (doc) => doc || {},
    refetchOnWindowFocus: false,
  });

  // hydrate once on edit
  const hydratedRef = React.useRef(false);
  React.useEffect(() => { hydratedRef.current = false; }, [id]);

  React.useEffect(() => {
    if (!isEdit || !detail || hydratedRef.current) return;
    setForm((p) => ({
      ...p,
      name: detail?.name || '',
      ar_name: detail?.ar_name || '',
      value: detail?.value || '',
      mode: (detail?.mode || 'hex').toLowerCase(),
    }));
    hydratedRef.current = true;
  }, [isEdit, detail]);

  const { mutateAsync: addMutation, isPending: addPending } = useAddColor();
  const { mutateAsync: updateMutation, isPending: updatePending } = useUpdateColor();

  const disabled = addPending || updatePending;
  const title = isEdit ? 'Edit Color' : 'Add Color';
  const btnLabel = isEdit ? 'Save Changes' : 'Add Color';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // ✅ send JSON (server expects JSON)
    const body = {
      name: form.name.trim(),
      ar_name: form.ar_name.trim(),
      value: form.value.trim(),
      mode: (form.mode || 'hex').toLowerCase(),
    };

    try {
      if (isEdit) {
        await updateMutation({ id, payload: body });
      } else {
        await addMutation(body);
        setForm({ name: '', value: '', mode: 'hex' });
      }
      navigate('/colors', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ py: '2rem' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, md: 2 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>{title}</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} style={{ width: '100%' }}>
            <Card
              variant="outlined"
              sx={{ mb: 2, borderRadius: 3, opacity: disabled ? 0.7 : 1, backgroundColor: '#111' }}
            >
              <CardHeader title="Basics" sx={{ pb: 0 }} />
              <CardContent>
                <Grid container spacing={2} alignItems="stretch">
                  <Grid sx={{ width: '32%' }} item xs={12} md={6}>
                    <TextField
                      label="Name *"
                      fullWidth
                      required
                      value={form.name}
                      disabled={disabled}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </Grid>

                  <Grid sx={{ width: '32%' }} item xs={12} md={6}>
                    <TextField
                      label="Name (Arabic) *"
                      fullWidth
                      required
                      value={form.ar_name}
                      disabled={disabled}
                      onChange={(e) => setForm((p) => ({ ...p, ar_name: e.target.value }))}
                    />
                  </Grid>

                  {/* Mode as SELECT */}
                  <Grid sx={{ width: '32%' }} item xs={12} md={6}>
                    <TextField
                      label="Mode *"
                      fullWidth
                      required
                      select
                      value={form.mode || 'hex'}
                      disabled={disabled}
                      onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
                    >
                      {MODE_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt.toUpperCase()}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid sx={{ width: '32%' }} item xs={12} md={6}>
                    <TextField
                      label="Value *"
                      fullWidth
                      required
                      placeholder={form.mode === 'rgb' ? 'e.g. rgb(255, 0, 0)' : 'e.g. #ff0000'}
                      value={form.value}
                      disabled={disabled}
                      onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={1.5}>
              <Btn type="submit" isStartIcon startIcon={<Save />} variant="contained" color="primary" disabled={disabled}>
                {btnLabel}
              </Btn>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AddOrEditColors;
