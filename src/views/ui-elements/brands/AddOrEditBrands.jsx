import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Grid } from '@mui/material';
import { TextField } from '@mui/material';
import { Stack, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Save } from '@mui/icons-material';
import Btn from '../../../components/Button';

import { useAddBrand, useUpdateBrand } from '../../../hooks/brands/useBrandsMutation';
import { useQuery } from '@tanstack/react-query';
import { getBrandById } from '../../../api/brands';

const AddOrEditBrands = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: '',
    ar_name: '',
    countryCode: '',
    logoFile: null, // File object (new upload)
    logoPreview: '' // URL for preview (blob: OR http(s) from server)
  });

  const { id } = useParams(); // /brands/:id/edit
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ----- detail (edit) -----
  const { data: detail } = useQuery({
    queryKey: ['brand', id],
    queryFn: () => getBrandById(id), // should return the doc object
    enabled: isEdit && !!id,
    select: (doc) => doc || {},
    // prevent background refills overwriting the form
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000
  });

  // one-time hydration guard per id
  const hydratedRef = React.useRef(false);
  React.useEffect(() => {
    hydratedRef.current = false; // new id => allow hydration again
  }, [id]);

  // Revoke blob URLs safely
  const revokeIfBlob = (url) => {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  // Prefill ONCE from server on first data arrival
  React.useEffect(() => {
    if (!isEdit || !detail || hydratedRef.current) return;

    setForm((p) => ({
      ...p,
      name: detail?.name || '',
      ar_name: detail?.ar_name || '',
      countryCode: detail?.countryCode || '',
      logoFile: null,
      logoPreview: detail?.logo || detail?.logoUrl || ''
    }));

    hydratedRef.current = true;
  }, [isEdit, detail]);

  // Cleanup blob on unmount
  React.useEffect(() => {
    return () => revokeIfBlob(form.logoPreview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    // Revoke old blob preview if any
    revokeIfBlob(form.logoPreview);

    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: URL.createObjectURL(file)
    }));
  };

  const clearLogo = () => {
    revokeIfBlob(form.logoPreview);
    setForm((prev) => ({ ...prev, logoFile: null, logoPreview: '' }));
  };

  const { mutateAsync: addMutation, isPending: addPending } = useAddBrand();
  const { mutateAsync: updateMutation, isPending: updatePending } = useUpdateBrand();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('ar_name', form.ar_name.trim());
    fd.append('countryCode', form.countryCode || '');
    if (form.logoFile) fd.append('logo', form.logoFile);

    try {
      if (isEdit) {
        await updateMutation({ id, formData: fd });
      } else {
        await addMutation(fd);
        // reset for add
        revokeIfBlob(form.logoPreview);
        setForm({ name: '', countryCode: '', logoFile: null, logoPreview: '' });
      }
      navigate('/brands', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const disabled = addPending || updatePending;
  const title = isEdit ? 'Edit Brand' : 'Add Brand';
  const btnLabel = isEdit ? 'Save Changes' : 'Add Brand';

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ py: '2rem' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1, md: 2 } }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {title}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} style={{ width: '100%' }}>
              {/* BASICS */}
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
                        onChange={(e) => setField('name', e.target.value)}
                      />
                    </Grid>
                    <Grid sx={{ width: '49%' }} item xs={12} md={6}>
                      <TextField
                        label="Name (Arabic) *"
                        fullWidth
                        required
                        value={form.ar_name}
                        disabled={disabled}
                        onChange={(e) => setField('ar_name', e.target.value)}
                      />
                    </Grid>

                    <Grid sx={{ width: '49%' }} item xs={12} md={6}>
                      <TextField
                        label="Country Code *"
                        fullWidth
                        required
                        value={form.countryCode}
                        disabled={disabled}
                        onChange={(e) => setField('countryCode', e.target.value)}
                        placeholder="e.g., US, PK, AE"
                      />
                    </Grid>

                    {/* Logo upload */}
                    <Grid item xs={12}>
                      <Stack spacing={1.2}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Logo *
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button variant="outlined" startIcon={<CloudUploadIcon />} component="label" disabled={disabled}>
                            Upload Logo
                            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                          </Button>

                          {(form.logoFile || form.logoPreview) && (
                            <IconButton aria-label="clear logo" onClick={clearLogo} disabled={disabled}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        </Stack>

                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {form.logoFile ? form.logoFile.name : form.logoPreview ? 'Using existing logo' : 'No file selected'}
                        </Typography>

                        {/* Preview: works for blob: and http(s): */}
                        {form.logoPreview ? (
                          <Box
                            sx={{
                              mt: 1,
                              width: 140,
                              height: 140,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px dashed rgba(255,255,255,0.2)'
                            }}
                          >
                            <img
                              src={form.logoPreview}
                              alt="Logo preview"
                              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                            />
                          </Box>
                        ) : null}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Stack direction="row" spacing={1.5}>
                {/* Ensure your <Btn /> forwards the "type" prop */}
                <Btn type="submit" isStartIcon startIcon={<Save />} variant="contained" color="primary" disabled={disabled}>
                  {btnLabel}
                </Btn>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default AddOrEditBrands;
