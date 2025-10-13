// src/pages/.../AddOrEditSubCategories.jsx
import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button as MuiButton,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Stack,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Save } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import Btn from '../../../components/Button';
import { useCategories } from '../../../hooks/categories/useCategories';
import { useAddSubCategory, useUpdateSubCategory } from '../../../hooks/subCategories/useSubCategoryMutation';
import { getSubCategoryById } from '../../../api/subCategories';

const AddOrEditSubCategories = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useLocation().pathname.includes('/edit');

  const [form, setForm] = React.useState({
    name: '',
    parent: '', // stores PARENT CATEGORY id (from categories.rows)
    image: null, // File
    imagePreview: '' // blob: or http(s)
  });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ----- detail (edit) -----
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['subCategory', id],
    queryFn: () => getSubCategoryById(id), // should return the doc object
    enabled: isEdit && !!id,
    select: (doc) => doc || {}
  });

  React.useEffect(() => {
    if (!isEdit || !detail) return;
    setForm((p) => ({
      ...p,
      name: detail?.name || '',
      // normalize parent id whether backend sends object or id
      parent: detail?.parent?._id || detail?.parent?.id || detail?.parent || '',
      image: null,
      imagePreview: detail?.image || detail?.imageUrl || ''
    }));
  }, [isEdit, detail]);

  // ----- parent options from categories -----
  const { data: cats, isLoading: catsLoading } = useCategories(); // { rows:[{id,name,image}], ... }
  const options = cats?.rows ?? [];

  // map selected id -> option object
  const selectedParent = React.useMemo(() => options.find((o) => o.id === form.parent) || null, [options, form.parent]);

  // ----- image preview helpers -----
  const lastBlobRef = React.useRef(null);
  const revokeIfBlob = (url) => {
    try {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    } catch {}
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    if (lastBlobRef.current) revokeIfBlob(lastBlobRef.current);
    const blob = URL.createObjectURL(f);
    lastBlobRef.current = blob;
    setForm((p) => ({ ...p, image: f, imagePreview: blob }));
  };

  const clearImage = () => {
    if (form.imagePreview?.startsWith('blob:')) revokeIfBlob(form.imagePreview);
    lastBlobRef.current = null;
    setForm((p) => ({ ...p, image: null, imagePreview: '' }));
  };

  // ----- mutations -----
  const addMutation = useAddSubCategory();
  const updateMutation = useUpdateSubCategory();
  const saving = addMutation.isPending || updateMutation.isPending;
  const disabled = saving || loadingDetail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('parent', form.parent || ''); // must be the category id
    if (form.image) fd.append('image', form.image);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, formData: fd });
      } else {
        await addMutation.mutateAsync(fd);
        // reset for add
        if (lastBlobRef.current) revokeIfBlob(lastBlobRef.current);
        lastBlobRef.current = null;
        setForm({ name: '', parent: '', image: null, imagePreview: '' });
      }
      // go back to list; adjust route if needed
      navigate(-1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ py: '2rem' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, md: 2 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {isEdit ? 'Edit Sub Category' : 'Add Sub Category'}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} style={{ width: '100%' }}>
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: disabled ? 0.7 : 1, backgroundColor: '#111' }}>
              <CardHeader title="Basics" sx={{ pb: 0 }} />
              <CardContent>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '50%' }}>
                    <TextField
                      label="Name *"
                      fullWidth
                      required
                      value={form.name}
                      disabled={disabled}
                      onChange={(e) => setField('name', e.target.value)}
                    />
                  </div>

                  <div style={{ width: '50%' }}>
                    <Autocomplete
                      options={options}
                      loading={catsLoading}
                      value={selectedParent}
                      onChange={(_, v) => setField('parent', v?.id ?? '')}
                      getOptionLabel={(o) => (o?.name ? o.name : '')}
                      isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Parent Category"
                          disabled={disabled}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {catsLoading ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className='mt-4'>
                  <Stack spacing={1.2}>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Image *
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <MuiButton variant="outlined" startIcon={<CloudUploadIcon />} component="label" disabled={disabled}>
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                      </MuiButton>

                      {(form.image || form.imagePreview) && (
                        <IconButton aria-label="clear image" color="error" onClick={clearImage} disabled={disabled}>
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
                          alt="Image preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                        />
                      </Box>
                    ) : null}
                  </Stack>
                </div>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={1.5}>
              <Btn type="submit" isStartIcon startIcon={<Save />} variant="contained" color="primary" disabled={disabled}>
                {isEdit ? 'Save Changes' : 'Add Sub Category'}
              </Btn>
              <MuiButton variant="outlined" onClick={() => navigate(-1)} disabled={disabled}>
                Cancel
              </MuiButton>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AddOrEditSubCategories;
