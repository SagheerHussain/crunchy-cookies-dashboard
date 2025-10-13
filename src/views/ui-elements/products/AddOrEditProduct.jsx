import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Grid, Card, CardContent, CardHeader, TextField, MenuItem,
  FormControlLabel, Switch, Typography, Chip, IconButton, Divider, Autocomplete,
  InputAdornment, Tooltip, LinearProgress, Stack, Button as MuiButton
} from '@mui/material';
import { Delete, Save, AutoFixHigh, Calculate } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../../../components/Button';

import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getProductById } from '../../../api/products';
import { useAddProduct, useUpdateProduct } from '../../../hooks/products/useProductMutation';
import { useQuery } from '@tanstack/react-query';

/* ------- dynamic hooks ------- */
import { useBrands } from '../../../hooks/brands/useBrands';
import { useProductNames } from '../../../hooks/products/useProducts';
import { useCategoryTypes } from '../../../hooks/categoryTypes/useCategoryTypes';
import { useSubCategories } from '../../../hooks/subCategories/useSubCategories';
import { useOccasions } from '../../../hooks/occasions/useOccasions';
import { useRecipients } from '../../../hooks/recipients/useRecipients';
import { useColors } from '../../../hooks/colors/useColors';
import { usePackaging } from '../../../hooks/packaging/usePackaging';

/* ================== Enums ================== */
const AVAILABILITY = ['in_stock', 'low_stock', 'out_of_stock'];
const CURRENCIES = ['QAR', 'USD'];
const CONDITIONS = ['new', 'used'];

/* ================== Helpers ================== */
const idOf = (x) => (x && typeof x === 'object' ? x._id : x ?? null);
const getLabel = (o) => o?.name || o?.title || o?.label || '';
const toOptions = (rows = []) => rows.map((r) => ({ _id: r.id ?? r._id, name: r.name ?? r.title ?? '' }));
const optionById = (opts, id) => opts.find((o) => o._id === id) || null;
const optionsByIds = (opts, ids = []) => opts.filter((o) => ids?.includes?.(o._id));

/* ================== Default Form ================== */
const defaultForm = {
  title: '',
  sku: '',
  description: '',
  qualities: [],

  price: '',
  discount: 0,
  currency: 'QAR',
  totalStocks: '',
  remainingStocks: '',
  totalPieceSold: 0,
  stockStatus: 'in_stock',

  brand: null,
  categories: [],
  type: null,
  occasions: [],
  recipients: [],
  colors: [],
  packagingOption: null,
  condition: 'new',

  featuredImage: '',
  featuredImageFile: null,
  images: [], // [{url, file?}]

  suggestedProducts: [],

  isActive: true,
  isFeatured: false,

  dimensions: { width: '', height: '' },
};

export default function AddOrEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) || location.pathname.includes('/edit');

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // detail
  const { data: detail, isFetching: isLoadingDetail } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: isEdit && !!id,
    select: (doc) => doc || {},
    refetchOnWindowFocus: false,
  });

  // mutations
  const { mutateAsync: addProduct, isPending: isAdding } = useAddProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();

  /* ------- dynamic lists ------- */
  const { data: brandsQ } = useBrands();
  const { data: typesQ } = useCategoryTypes();
  const { data: subsQ } = useSubCategories();
  const { data: occsQ } = useOccasions();
  const { data: recsQ } = useRecipients();
  const { data: colsQ } = useColors();
  const { data: packsQ } = usePackaging();
  const { data: namesQ } = useProductNames();
  const namesOpts = toOptions(namesQ?.rows);

  console.log("suggestedProducts", namesQ);

  const brandOpts = toOptions(brandsQ?.rows);
  const typeOpts = toOptions(typesQ?.rows);
  const subcategoryOpts = toOptions(subsQ?.rows);
  const occasionOpts = toOptions(occsQ?.rows);
  const recipientOpts = toOptions(recsQ?.rows);
  const colorOpts = toOptions(colsQ?.rows);
  const packagingOpts = toOptions(packsQ?.rows);

  /* ----- hydrate edit ----- */
  useEffect(() => {
    if (!isEdit || !detail) return;

    const p = detail;
    const next = {
      title: p.title ?? '',
      sku: p.sku ?? '',
      description: p.description ?? '',
      qualities: Array.isArray(p.qualities) ? p.qualities : [],

      price: p.price ?? '',
      discount: p.discount ?? 0,
      currency: p.currency || 'QAR',
      totalStocks: p.totalStocks ?? '',
      remainingStocks: p.remainingStocks ?? '',
      totalPieceSold: p.totalPieceSold ?? 0,
      stockStatus: p.stockStatus || 'in_stock',

      brand: idOf(p.brand),
      categories: (p.categories || []).map(idOf),
      type: idOf(p.type),
      occasions: (p.occasions || []).map(idOf),
      recipients: (p.recipients || []).map(idOf),
      colors: (p.colors || []).map(idOf),
      packagingOption: idOf(p.packagingOption),
      condition: p.condition || 'new',

      featuredImage: p.featuredImage || '',
      featuredImageFile: null,
      images: (p.images || [])
        .map((i) => {
          const url = i?.url ?? i;
          return url ? { url } : null;
        })
        .filter(Boolean),

      suggestedProducts: (p.suggestedProducts || []).map(idOf),

      isActive: !!p.isActive,
      isFeatured: !!p.isFeatured,
      dimensions: {
        width: p.dimensions?.width ?? '',
        height: p.dimensions?.height ?? '',
      },
    };

    setForm(next);
  }, [isEdit, detail]);

  /* ----- setters ----- */
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setNumber = (k) => (e) => setField(k, e.target.value === '' ? '' : Number(e.target.value));
  const removeImageRow = (idx) => setField('images', form.images.filter((_, i) => i !== idx));

  // file pickers (fixed)
  const onFeaturedSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setField('featuredImage', URL.createObjectURL(file));
    setField('featuredImageFile', file);
  };
  const onAdditionalSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const rows = files.map((f) => ({ url: URL.createObjectURL(f), file: f }));
    setField('images', [...(form.images || []), ...rows]);
  };

  /* ----- computed ----- */
  const discountedPrice = useMemo(() => {
    const v = Number(form.price || 0) * (1 - Number(form.discount || 0) / 100);
    return isFinite(v) ? Math.max(v, 0) : 0;
  }, [form.price, form.discount]);

  const stockRatio = useMemo(() => {
    const tot = Number(form.totalStocks || 0);
    const rem = Number(form.remainingStocks || 0);
    if (tot <= 0) return 0;
    return Math.max(0, Math.min(rem / tot, 1)) * 100;
  }, [form.totalStocks, form.remainingStocks]);

  const autoCalcStockStatus = () => {
    const tot = Number(form.totalStocks || 0);
    const rem = Number(form.remainingStocks || 0);
    if (tot <= 0 || rem <= 0) return setField('stockStatus', 'out_of_stock');
    const ratio = rem / tot;
    if (ratio <= 0.15) return setField('stockStatus', 'low_stock');
    return setField('stockStatus', 'in_stock');
  };

  /* ----- FormData builder (unchanged logic, with unset flags) ----- */
  const buildFormData = () => {
    const fd = new FormData();

    // primitives
    fd.append('title', (form.title || '').trim());
    fd.append('sku', (form.sku || '').trim());
    fd.append('description', form.description || '');
    fd.append('price', form.price === '' || form.price == null ? '' : String(form.price));
    fd.append('discount', form.discount === '' || form.discount == null ? '0' : String(form.discount));
    fd.append('currency', form.currency || 'QAR');
    fd.append('totalStocks', form.totalStocks === '' || form.totalStocks == null ? '' : String(form.totalStocks));
    fd.append('remainingStocks', form.remainingStocks === '' || form.remainingStocks == null ? '' : String(form.remainingStocks));
    fd.append('totalPieceSold', form.totalPieceSold === '' || form.totalPieceSold == null ? '0' : String(form.totalPieceSold));
    fd.append('stockStatus', form.stockStatus || 'in_stock');
    fd.append('condition', form.condition || 'new');
    fd.append('isActive', String(!!form.isActive));
    fd.append('isFeatured', String(!!form.isFeatured));

    // arrays / objects (JSON)
    fd.append('qualities', JSON.stringify(form.qualities || []));
    fd.append('categories', JSON.stringify(form.categories || []));
    fd.append('occasions', JSON.stringify(form.occasions || []));
    fd.append('recipients', JSON.stringify(form.recipients || []));
    fd.append('colors', JSON.stringify(form.colors || []));
    fd.append('suggestedProducts', JSON.stringify(form.suggestedProducts || []));
    fd.append(
      'dimensions',
      JSON.stringify({
        width: form.dimensions?.width === '' ? undefined : Number(form.dimensions?.width),
        height: form.dimensions?.height === '' ? undefined : Number(form.dimensions?.height),
      })
    );

    // single refs — append only if truthy; otherwise send an unset flag
    if (form.brand) fd.append('brand', form.brand); else fd.append('unset_brand', '1');
    if (form.type) fd.append('type', form.type); else fd.append('unset_type', '1');
    if (form.packagingOption) fd.append('packagingOption', form.packagingOption);
    else fd.append('unset_packagingOption', '1');

    // media
    if (form.featuredImageFile) {
      fd.append('featuredImage', form.featuredImageFile);
    } else if (form.featuredImage) {
      fd.append('featuredImage', form.featuredImage);
    }
    const existingUrls = [];
    (form.images || []).forEach((row) => {
      if (row.file) fd.append('images', row.file);
      else if (row.url) existingUrls.push(row.url);
    });
    fd.append('existingImageUrls', JSON.stringify(existingUrls));

    return fd;
  };

  /* ----- submit ----- */
  const loading = isLoadingDetail || isAdding || isUpdating;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const formData = buildFormData();

      if (isEdit) await updateProduct({ id, formData });
      else await addProduct(formData);

      navigate('/products');
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ================== UI ================== */
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ py: '2rem' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, md: 2 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Typography>
        {(loading || saving) && <LinearProgress sx={{ mb: 2 }} />}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          {/* LEFT */}
          <Grid item xs={12} sx={{ width: '100%' }}>
            {/* BASICS */}
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: saving ? 0.7 : 1, backgroundColor: '#111' }}>
              <CardHeader title="Basics" sx={{ pb: 0 }} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item style={{ width: '32%' }}>
                    <TextField
                      label="Title *"
                      fullWidth
                      value={form.title}
                      disabled={saving}
                      onChange={(e) => setField('title', e.target.value)}
                    />
                  </Grid>
                  <Grid item style={{ width: '32%' }}>
                    <TextField
                      label="SKU *"
                      fullWidth
                      value={form.sku}
                      disabled={saving}
                      onChange={(e) => setField('sku', e.target.value)}
                    />
                  </Grid>
                  <Grid item style={{ width: '33.5%' }}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={form.qualities}
                      onChange={(_, v) => setField('qualities', v)}
                      renderTags={(value, getTagProps) =>
                        value.map((opt, i) => <Chip key={opt + i} variant="outlined" label={opt} {...getTagProps({ index: i })} />)
                      }
                      renderInput={(p) => <TextField {...p} label="Qualities (press Enter to add)" disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <ReactQuill
                      style={{ height: '100px', marginBottom: '2rem' }}
                      theme="snow"
                      value={form.description}
                      onChange={(html) => setField('description', html)}
                      readOnly={saving}
                      placeholder="Write a rich description..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* MEDIA */}
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: saving ? 0.7 : 1, backgroundColor: '#111' }}>
              <CardHeader title="Media" sx={{ pb: 0 }} />
              <CardContent>
                <Grid container spacing={2}>
                  {/* FEATURED */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1.25}>
                      {/* Use native label + input so file dialog always opens */}
                      <input id="featured-input" hidden accept="image/*" type="file" onChange={onFeaturedSelect} />
                      <label htmlFor="featured-input">
                        <MuiButton component="span" variant="outlined" disabled={saving}>
                          Upload Featured Image
                        </MuiButton>
                      </label>

                      {form.featuredImage ? (
                        <Box
                          sx={{
                            mt: 0.5, borderRadius: 2, overflow: 'hidden',
                            border: (t) => `1px solid ${t.palette.divider}`, width: '100%', maxWidth: 380
                          }}
                        >
                          <img src={form.featuredImage} alt="featured" style={{ display: 'block', width: '100%', height: 200, objectFit: 'cover' }} />
                        </Box>
                      ) : null}
                    </Stack>
                  </Grid>

                  {/* ADDITIONAL */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <input id="gallery-input" hidden accept="image/*" multiple type="file" onChange={onAdditionalSelect} />
                      <label htmlFor="gallery-input">
                        <MuiButton component="span" variant="outlined" disabled={saving}>
                          Upload Images
                        </MuiButton>
                      </label>

                      {/* thumbnails */}
                      <Grid container spacing={1}>
                        {(form.images || [])
                          .filter((i) => i.url)
                          .map((i, k) => (
                            <Grid key={k} item xs={4}>
                              <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: (t) => `1px solid ${t.palette.divider}` }}>
                                <img src={i.url} alt={`img-${k}`} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                                <IconButton
                                  size="small" color="error" disabled={saving}
                                  onClick={() => removeImageRow(k)}
                                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'background.paper' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                      </Grid>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* CLASSIFICATION (dynamic) */}
            <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: saving ? 0.7 : 1, backgroundColor: '#111' }}>
              <CardHeader title="Classification" sx={{ pb: 0 }} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      options={brandOpts}
                      getOptionLabel={getLabel}
                      value={optionById(brandOpts, form.brand)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!brandOpts?.length}
                      onChange={(_, v) => setField('brand', v?._id || null)}
                      renderInput={(p) => <TextField {...p} label="Brand" disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      options={typeOpts}
                      getOptionLabel={getLabel}
                      value={optionById(typeOpts, form.type)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!typeOpts?.length}
                      onChange={(_, v) => setField('type', v?._id || null)}
                      renderInput={(p) => <TextField {...p} label="Categ. Type" disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <TextField
                      select label="Condition" fullWidth disabled={saving}
                      value={form.condition} onChange={(e) => setField('condition', e.target.value)}
                    >
                      {CONDITIONS.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
                    </TextField>
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      multiple options={occasionOpts} getOptionLabel={getLabel}
                      value={optionsByIds(occasionOpts, form.occasions)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!occasionOpts?.length}
                      onChange={(_, v) => setField('occasions', v.map((x) => x._id))}
                      renderInput={(p) => <TextField {...p} label="Occas." disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      multiple options={recipientOpts} getOptionLabel={getLabel}
                      value={optionsByIds(recipientOpts, form.recipients)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!recipientOpts?.length}
                      onChange={(_, v) => setField('recipients', v.map((x) => x._id))}
                      renderInput={(p) => <TextField {...p} label="Recip." disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      multiple options={colorOpts} getOptionLabel={getLabel}
                      value={optionsByIds(colorOpts, form.colors)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!colorOpts?.length}
                      onChange={(_, v) => setField('colors', v.map((x) => x._id))}
                      renderInput={(p) => <TextField {...p} label="Colors" disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      options={packagingOpts} getOptionLabel={getLabel}
                      value={optionById(packagingOpts, form.packagingOption)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!packagingOpts?.length}
                      onChange={(_, v) => setField('packagingOption', v?._id || null)}
                      renderInput={(p) => <TextField {...p} label="Packaging Option" disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      multiple options={subcategoryOpts} getOptionLabel={getLabel}
                      value={optionsByIds(subcategoryOpts, form.categories)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!subcategoryOpts?.length}
                      onChange={(_, v) => setField('categories', v.map((x) => x._id))}
                      renderInput={(p) => <TextField {...p} label="Sub-Categories" placeholder="Select one or more" disabled={saving} />}
                    />
                  </Grid>

                  <Grid item style={{ width: '24%' }}>
                    <Autocomplete
                      multiple
                      options={namesOpts}
                      getOptionLabel={getLabel}
                      value={optionsByIds(namesOpts, form.suggestedProducts)}
                      isOptionEqualToValue={(o, v) => o._id === v._id}
                      loading={!namesOpts?.length}
                      onChange={(_, v) => setField('suggestedProducts', v.map((x) => x._id))}
                      renderInput={(p) => (
                        <TextField {...p} label="Suggested Products" placeholder="Select one or more" disabled={saving} />
                      )}
                    />
                  </Grid>

                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 }, height: 'fit-content' }}>
              <Card variant="outlined" sx={{ mb: 2, borderRadius: 3, opacity: saving ? 0.7 : 1, backgroundColor: '#111' }}>
                <CardHeader
                  title="Pricing & Inventory"
                  action={
                    <Tooltip title="Auto-calc stock status from totals">
                      <IconButton onClick={autoCalcStockStatus} size="small" disabled={saving}>
                        <AutoFixHigh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{ pb: 0 }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item style={{ width: '24%' }}>
                      <TextField
                        type="number" label="Price *" fullWidth disabled={saving}
                        value={form.price} onChange={setNumber('price')}
                        InputProps={{ startAdornment: <InputAdornment position="start">{form.currency}</InputAdornment> }}
                      />
                    </Grid>
                    <Grid item style={{ width: '24%' }}>
                      <TextField
                        select label="Currency" fullWidth disabled={saving}
                        value={form.currency} onChange={(e) => setField('currency', e.target.value)}
                      >
                        {CURRENCIES.map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
                      </TextField>
                    </Grid>
                    <Grid item style={{ width: '24%' }}>
                      <TextField type="number" label="Discount (%)" fullWidth disabled={saving}
                        value={form.discount} onChange={setNumber('discount')}
                      />
                    </Grid>
                    <Grid item style={{ width: '24%' }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                        <Calculate fontSize="small" />
                        <Typography variant="body2">Final price:</Typography>
                        <Chip label={`${form.currency} ${discountedPrice.toFixed(2)}`} size="small" />
                      </Stack>
                    </Grid>

                    <Grid item style={{ width: '24%' }}>
                      <TextField type="number" label="Total Stocks *" fullWidth disabled={saving}
                        value={form.totalStocks} onChange={setNumber('totalStocks')}
                      />
                    </Grid>
                    <Grid item style={{ width: '24%' }}>
                      <TextField type="number" label="Remaining Stocks *" fullWidth disabled={saving}
                        value={form.remainingStocks} onChange={setNumber('remainingStocks')}
                      />
                    </Grid>

                    <Grid item style={{ width: '24%' }}>
                      <TextField select label="Stock Status" fullWidth disabled={saving}
                        value={form.stockStatus} onChange={(e) => setField('stockStatus', e.target.value)}
                      >
                        {AVAILABILITY.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                      </TextField>
                    </Grid>

                    <Grid item style={{ width: '24%' }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Stock fill</Typography>
                        <Typography variant="caption">{Math.round(stockRatio)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={stockRatio} sx={{ borderRadius: 1 }} />
                    </Grid>

                    <Grid item style={{ width: '24%' }}>
                      <TextField type="number" label="Pieces Sold" fullWidth disabled={saving}
                        value={form.totalPieceSold} onChange={setNumber('totalPieceSold')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3, opacity: saving ? 0.7 : 1, backgroundColor: '#111' }}>
                <CardHeader title="Visibility & Dimensions" sx={{ pb: 0 }} />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item style={{ width: '32%' }}>
                      <Stack direction="row" spacing={3}>
                        <FormControlLabel
                          control={<Switch checked={form.isActive} onChange={(e) => setField('isActive', e.target.checked)} disabled={saving} />}
                          label="Active"
                        />
                        <FormControlLabel
                          control={<Switch checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} disabled={saving} />}
                          label="Featured"
                        />
                      </Stack>
                    </Grid>
                    <Grid item style={{ width: '32%' }}>
                      <TextField
                        type="number" label="Width" fullWidth disabled={saving}
                        value={form.dimensions.width}
                        onChange={(e) =>
                          setField('dimensions', { ...form.dimensions, width: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                        InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                      />
                    </Grid>
                    <Grid item style={{ width: '32%' }}>
                      <TextField
                        type="number" label="Height" fullWidth disabled={saving}
                        value={form.dimensions.height}
                        onChange={(e) =>
                          setField('dimensions', { ...form.dimensions, height: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                        InputProps={{ endAdornment: <InputAdornment position="end">cm</InputAdornment> }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button
                          isStartIcon
                          startIcon={<Save />}
                          variant="contained"
                          color="primary"
                          type="submit"
                          disabled={saving || loading}
                        >
                          {isEdit ? 'Save Changes' : 'Add Product'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
