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
import { useSubCategories } from '../../../hooks/subCategories/useSubCategories';
import { useAddCategoryType, useUpdateCategoryType } from '../../../hooks/categoryTypes/useCategoryTypesMutation';
import { getCategoryTypeById } from '../../../api/categoryTypes';

const AddOrEditCategoryType = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useLocation().pathname.includes('/edit');

  const [form, setForm] = React.useState({
    name: '',
    ar_name: '',
    totalStocks: 0,
    totalPieceUsed: 0,
    parent: '', // stores PARENT CATEGORY id (from categories.rows)
  });

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ----- detail (edit) -----
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['categoryType', id],
    queryFn: () => getCategoryTypeById(id), // should return the doc object
    enabled: isEdit && !!id,
    select: (doc) => doc || {}
  });

  React.useEffect(() => {
    if (!isEdit || !detail) return;
    setForm((p) => ({
      ...p,
      name: detail?.name || '',
      ar_name: detail?.ar_name || '',
      totalStocks: detail?.totalStocks || 0,
      totalPieceUsed: detail?.totalPieceUsed || 0,
      parent: detail?.parent?._id || detail?.parent?.id || detail?.parent || '',
    }));
  }, [isEdit, detail]);

  // ----- parent options from categories -----
  const { data: cats, isLoading: catsLoading } = useSubCategories(); // { rows:[{id,name,image}], ... }
  const options = cats?.rows ?? [];

  // map selected id -> option object
  const selectedParent = React.useMemo(() => options.find((o) => o.id === form.parent) || null, [options, form.parent]);

  // ----- mutations -----
  const addMutation = useAddCategoryType();
  const updateMutation = useUpdateCategoryType();
  const saving = addMutation.isPending || updateMutation.isPending;
  const disabled = saving || loadingDetail;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('ar_name', form.ar_name.trim());
    fd.append('parent', form.parent || ''); // must be the category id
    fd.append('totalStock', form.totalStocks || 0);
    fd.append('totalPieceUsed', form.totalPieceUsed || 0);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, formData: fd });
      } else {
        await addMutation.mutateAsync(fd);
        // reset for add
        setForm({ name: '', ar_name: '', parent: '' });
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ width: '100%' }}>
                    <TextField
                      label="Name *"
                      fullWidth
                      required
                      value={form.name}
                      disabled={disabled}
                      onChange={(e) => setField('name', e.target.value)}
                    />
                  </div>
                  
                  <div style={{ width: '100%' }}>
                    <TextField
                      label="Name (Arabic) *"
                      fullWidth
                      required
                      value={form.ar_name}
                      disabled={disabled}
                      onChange={(e) => setField('ar_name', e.target.value)}
                    />
                  </div>

                  <div style={{ width: '100%' }}>
                    <TextField
                      label="Total Stocks *"
                      fullWidth
                      required
                      value={form.totalStocks}
                      disabled={disabled}
                      onChange={(e) => setField('totalStocks', e.target.value)}
                    />
                  </div>

                  <div style={{ width: '100%' }}>
                    <TextField
                      label="Total Piece Used *"
                      fullWidth
                      required
                      value={form.totalPieceUsed}
                      disabled={disabled}
                      onChange={(e) => setField('totalPieceUsed', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={1.5}>
              <Btn type="submit" isStartIcon startIcon={<Save />} variant="contained" color="primary" disabled={disabled}>
                {isEdit ? 'Save Changes' : 'Add Recipe'}
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

export default AddOrEditCategoryType;
