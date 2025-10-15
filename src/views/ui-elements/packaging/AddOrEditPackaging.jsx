import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Grid } from '@mui/material';
import { TextField } from '@mui/material';
import { Stack } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Save } from '@mui/icons-material';
import Btn from '../../../components/Button';

import { useAddPackaging, useUpdatePackaging } from '../../../hooks/packaging/usePackagingMutation';
import { useQuery } from '@tanstack/react-query';
import { getPackagingById } from '../../../api/packaging';

const AddOrEditPackaging = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: '',
    ar_name: '',
    materials: [], // array of strings
    ar_materials: [], // array of strings
  });

  const { id } = useParams();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');

  // ----- detail (edit) -----
  const { data: detail } = useQuery({
    queryKey: ['packaging', id],
    queryFn: () => getPackagingById(id),
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
      materials: Array.isArray(detail?.materials) ? detail.materials : [],
      ar_materials: Array.isArray(detail?.ar_materials) ? detail.ar_materials : [],
    }));
    hydratedRef.current = true;
  }, [isEdit, detail]);

  const { mutateAsync: addMutation, isPending: addPending } = useAddPackaging();
  const { mutateAsync: updateMutation, isPending: updatePending } = useUpdatePackaging();

  const disabled = addPending || updatePending;
  const title = isEdit ? 'Edit Packaging' : 'Add Packaging';
  const btnLabel = isEdit ? 'Save Changes' : 'Add Packaging';

  // helpers for tags
  const sanitize = (s) => s?.trim();
  const dedupe = (arr) => {
    const seen = new Set();
    const out = [];
    for (const s of arr) {
      const key = s.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push(s); }
    }
    return out;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('ar_name', form.ar_name.trim());
    // ✅ send as array — prefer this if your backend accepts "materials[]" repeated
    for (const m of form.materials.map(sanitize).filter(Boolean)) {
      fd.append('materials[]', m);
    }
    for (const m of form.ar_materials.map(sanitize).filter(Boolean)) {
      fd.append('ar_materials[]', m);
    }
    // OR: if your backend expects JSON: fd.append('materials', JSON.stringify(form.materials));

    try {
      if (isEdit) {
        await updateMutation({ id, formData: fd });
      } else {
        await addMutation(fd);
        setForm({ name: '', materials: [] });
      }
      navigate('/packaging', { replace: true });
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
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: disabled ? 0.7 : 1, backgroundColor: '#111' }}>
              <CardHeader title="Basics" sx={{ pb: 0 }} />
              <CardContent>
                <Grid container spacing={2} alignItems="stretch">
                  <Grid sx={{ width: '49%' }} item xs={12} md={6}>
                    <TextField
                      label="Name *"
                      fullWidth
                      required
                      value={form.name}
                      disabled={disabled}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </Grid>
                  <Grid sx={{ width: '49%' }} item xs={12} md={6}>
                    <TextField
                      label="Name (Arabic) *"
                      fullWidth
                      required
                      value={form.ar_name}
                      disabled={disabled}
                      onChange={(e) => setForm((p) => ({ ...p, ar_name: e.target.value }))}
                    />
                  </Grid>

                  {/* Materials as chips (tags) */}
                  <Grid sx={{ width: '49%' }} item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}                 // no predefined options
                      value={form.materials}
                      onChange={(_, values) => {
                        // values can include strings or objects; keep strings only
                        const cleaned = dedupe(
                          (values || [])
                            .map((v) => (typeof v === 'string' ? v : String(v?.label ?? v?.value ?? '')))
                            .map(sanitize)
                            .filter(Boolean)
                        );
                        setForm((p) => ({ ...p, materials: cleaned }));
                      }}
                      filterSelectedOptions
                      disableCloseOnSelect
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Materials * (press Enter to add)"
                          placeholder="e.g., Plastic, Paper, Glass"
                          disabled={disabled}
                          onKeyDown={(e) => {
                            // also allow comma to commit a tag
                            if (e.key === ',' && e.currentTarget.value) {
                              e.preventDefault();
                              const next = dedupe([...form.materials, sanitize(e.currentTarget.value)].filter(Boolean));
                              setForm((p) => ({ ...p, materials: next }));
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid sx={{ width: '49%' }} item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}                 // no predefined options
                      value={form.ar_materials}
                      onChange={(_, values) => {
                        // values can include strings or objects; keep strings only
                        const cleaned = dedupe(
                          (values || [])
                            .map((v) => (typeof v === 'string' ? v : String(v?.label ?? v?.value ?? '')))
                            .map(sanitize)
                            .filter(Boolean)
                        );
                        setForm((p) => ({ ...p, ar_materials: cleaned }));
                      }}
                      filterSelectedOptions
                      disableCloseOnSelect
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Materials (Arabic) * (press Enter to add)"
                          placeholder="e.g., Plastic, Paper, Glass"
                          disabled={disabled}
                          onKeyDown={(e) => {
                            // also allow comma to commit a tag
                            if (e.key === ',' && e.currentTarget.value) {
                              e.preventDefault();
                              const next = dedupe([...form.ar_materials, sanitize(e.currentTarget.value)].filter(Boolean));
                              setForm((p) => ({ ...p, ar_materials: next }));
                            }
                          }}
                        />
                      )}
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

export default AddOrEditPackaging;
