import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
import { Grid } from '@mui/material';
import { TextField } from '@mui/material';
import { Stack, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useParams, useLocation } from 'react-router-dom';
import { Save } from '@mui/icons-material';
import Btn from '../../../components/Button';

import { useAddRecipient, useUpdateRecipient } from '../../../hooks/recipients/useRecipientMutation';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRecipientById } from '../../../api/recipients';

const AddOrEditRecipient = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: '',
    ar_name: '',
    imageFile: null, // File object (new upload)
    imagePreview: '' // URL for preview (blob: OR http(s) from server)
  });

  const { id } = useParams(); // /brands/:id/edit
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');

  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(isEdit); // load only in edit mode

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ----- detail (edit) -----
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['recipient', id],
    queryFn: () => getRecipientById(id), // should return the doc object
    enabled: isEdit && !!id,
    select: (doc) => doc || {}
  });

  const lastBlobRef = React.useRef(null);
  const revokeIfBlob = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    // Revoke old blob preview if any
    revokeIfBlob(form.imagePreview);

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file)
    }));
  };

  const clearImage = () => {
    revokeIfBlob(form.imagePreview);
    setForm((prev) => ({ ...prev, imageFile: null, imagePreview: '' }));
  };

  // 👉 Prefill defaults in EDIT mode
  React.useEffect(() => {
    if (!isEdit || !detail) return;
    setForm((p) => ({
      ...p,
      name: detail?.name || '',
      ar_name: detail?.ar_name || '',
      imageFile: null,
      imagePreview: detail?.image || detail?.imageUrl || ''
    }));
  }, [isEdit, detail]);

  const { mutateAsync: addMutation, isPending: addPending } = useAddRecipient();
  const { mutateAsync: updateMutation, isPending: updatePending } = useUpdateRecipient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.ar_name.trim()) return;
  
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('ar_name', form.ar_name.trim());
    if (form.imageFile) fd.append('image', form.imageFile);
  
    try {
      if (isEdit) {
        await updateMutation({ id, formData: fd });
      } else {
        await addMutation(fd);
        // reset for add
        revokeIfBlob(form.imagePreview);
        setForm({ name: '', ar_name: '', imageFile: null, imagePreview: '' });
      }
      // IMPORTANT
      navigate("/recipients", { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  const disabled = addPending || updatePending;
  const title = isEdit ? 'Edit Recipient' : 'Add Recipient';
  const btnLabel = isEdit ? 'Save Changes' : 'Add Recipient';

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
                    <Grid item style={{ width: '49%' }}>
                      <TextField
                        label="Name *"
                        fullWidth
                        required
                        value={form.name}
                        disabled={disabled}
                        onChange={(e) => setField('name', e.target.value)}
                      />
                    </Grid>

                    <Grid item style={{ width: '49%' }}>
                      <TextField
                        label="Name (Arabic) *"
                        fullWidth
                        required
                        value={form.ar_name}
                        disabled={disabled}
                        onChange={(e) => setField('ar_name', e.target.value)}
                      />
                    </Grid>

                    {/* Logo upload */}
                    <Grid item style={{ width: '100%' }}>
                      <Stack spacing={1.2}>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Image *
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button variant="outlined" startIcon={<CloudUploadIcon />} component="label" disabled={disabled}>
                            Upload Image
                            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                          </Button>

                          {(form.imageFile || form.imagePreview) && (
                            <IconButton aria-label="clear Image" onClick={clearImage} disabled={disabled}>
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        </Stack>

                        {/* Selected file name OR existing image note */}
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {form.imageFile ? form.imageFile.name : form.imagePreview ? 'Using existing image' : 'No file selected'}
                        </Typography>

                        {/* Preview: works for blob: and http(s): */}
                        {form.imagePreview ? (
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
                              src={form.imagePreview}
                              alt="Image preview"
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
                {/* Make sure your <Btn /> forwards the "type" prop to the underlying button */}
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

export default AddOrEditRecipient;
