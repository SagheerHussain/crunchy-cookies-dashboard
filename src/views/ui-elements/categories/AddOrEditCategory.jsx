import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Stack,
  IconButton,
  Button as MuiButton,
  Snackbar,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Save } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Btn from '../../../components/Button'; // your wrapper button
import { getCategoryById } from '../../../api/categories';
import { useAddCategory, useUpdateCategory } from '../../../hooks/categories/useCategoryMutation';

const AddOrEditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useLocation().pathname.includes('/edit');

  const [form, setForm] = React.useState({
    name: '',
    ar_name: '',
    image: null, // File object if newly picked
    imagePreview: '' // blob: or http(s) URL
  });

  // toast
  const [toast, setToast] = React.useState({ open: false, type: 'success', msg: '' });
  const showToast = (msg, type = 'success') => setToast({ open: true, type, msg });

  // Detail (only in edit)
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
    enabled: isEdit && !!id,
    select: (doc) => doc || {} // because API now returns the doc itself
  });

  React.useEffect(() => {
    if (!isEdit || !detail || loadingDetail) return;
    setForm((prev) => ({
      ...prev,
      name: detail.name || '',
      ar_name: detail.ar_name || '',
      image: null, // new file none
      imagePreview: detail.image || detail.imageUrl || ''
    }));
  }, [isEdit, detail, loadingDetail]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // blob management
  const lastBlobRef = React.useRef(null);
  const revokeIfBlob = (url) => {
    if (url?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'error');
      return;
    }
    if (lastBlobRef.current) revokeIfBlob(lastBlobRef.current);
    const blob = URL.createObjectURL(file);
    lastBlobRef.current = blob;
    setForm((p) => ({ ...p, image: file, imagePreview: blob }));
  };

  const clearImage = () => {
    if (form.imagePreview?.startsWith('blob:')) revokeIfBlob(form.imagePreview);
    lastBlobRef.current = null;
    setForm((p) => ({ ...p, image: null, imagePreview: '' }));
  };

  // Mutations
  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();

  const saving = addMutation.isPending || updateMutation.isPending;
  const disabled = saving || loadingDetail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Name is required.', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('ar_name', form.ar_name.trim());
    if (form.image) fd.append('image', form.image); // only send if new file picked

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, formData: fd });
        showToast('Category updated successfully.');
      } else {
        await addMutation.mutateAsync(fd);
        showToast('Category created successfully.');
        // reset after add
        if (lastBlobRef.current) revokeIfBlob(lastBlobRef.current);
        lastBlobRef.current = null;
        setForm({ name: '', image: null, imagePreview: '' });
      }

      setTimeout(() => navigate('/categories'), 350);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to save category.';
      showToast(msg, 'error');
    }
  };

  const title = isEdit ? 'Edit Category' : 'Add Category';
  const btnLabel = isEdit ? 'Save Changes' : 'Add Category';

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ py: '2rem' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1, md: 2 } }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {title}
          </Typography>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: disabled ? 0.7 : 1, backgroundColor: '#111' }}>
              <CardHeader title="Basics" sx={{ pb: 0 }} />
              <CardContent>
                <div container spacing={2}>
                  <div className="d-flex" style={{ gap: 10 }}>
                    <div className="text_field" style={{ width: '50%' }}>
                      <TextField
                        label="Name *"
                        fullWidth
                        required
                        value={form.name}
                        disabled={disabled}
                        onChange={(e) => setField('name', e.target.value)}
                      />
                    </div>
                    <div className="text_field" style={{ width: '50%' }}>
                      <TextField
                        label="Name (Arabic) *"
                        fullWidth
                        required
                        value={form.ar_name}
                        disabled={disabled}
                        onChange={(e) => setField('ar_name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Stack spacing={1.2}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Image *
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <MuiButton variant="outlined" startIcon={<CloudUploadIcon />} component="label" disabled={disabled}>
                          Upload Image
                          <input type="file" accept="image/*" hidden onChange={onFileChange} />
                        </MuiButton>

                        {(form.image || form.imagePreview) && (
                          <IconButton aria-label="clear image" onClick={clearImage} disabled={disabled}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        )}
                      </Stack>

                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {form.image ? form.image.name : form.imagePreview ? 'Using existing image' : 'No file selected'}
                      </Typography>

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
                            alt="preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                          />
                        </Box>
                      ) : null}
                    </Stack>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={1.5}>
              <Btn type="submit" isStartIcon startIcon={<Save />} variant="contained" color="primary" disabled={disabled}>
                {btnLabel}
              </Btn>
              <MuiButton variant="outlined" disabled={disabled} onClick={() => navigate('/categories')}>
                Cancel
              </MuiButton>
            </Stack>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.type === 'error' ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddOrEditCategory;
