import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Chip,
  IconButton,
  Autocomplete,
  InputAdornment,
  Tooltip,
  LinearProgress,
  Divider,
  Button as MuiButton
} from '@mui/material';
import { Delete, Save, AutoFixHigh, Calculate } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from '../../../components/Button';
import './addOrEditProduct.css';

import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getProductById } from '../../../api/products';
import { useAddProduct, useUpdateProduct } from '../../../hooks/products/useProductMutation';
import { useQuery } from '@tanstack/react-query';

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

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

/* ================== Helpers ================== */
const idOf = (x) => (x && typeof x === 'object' ? x._id : x ?? null);
const getLabel = (o) => o?.name || o?.title || o?.label || '';
const toOptions = (rows = []) =>
  rows?.map((r) => ({ _id: r.id ?? r._id, name: r.name ?? r.title ?? '' })) || [];
const optionById = (opts, id) => opts.find((o) => o._id === id) || null;
const optionsByIds = (opts, ids = []) =>
  opts.filter((o) => ids?.includes?.(o._id));

/* ================== Default Form ================== */
const defaultForm = {
  title: '',
  ar_title: '',
  sku: '',
  description: '',
  ar_description: '',
  qualities: [],
  ar_qualities: [],

  price: '',
  discount: 0,
  currency: 'QAR',
  totalStocks: '',
  remainingStocks: '',
  totalPieceSold: 0,
  stockStatus: 'in_stock',

  brand: null,
  categories: [],
  type: [],
  // NEW: per-type pieces recipe
  typePieces: [],
  totalPieceCarry: 0,
  occasions: [],
  recipients: [],
  colors: [],
  packagingOption: null,
  condition: 'new',

  featuredImage: '',
  featuredImageFile: null,
  images: [],

  suggestedProducts: [],

  isActive: true,
  isFeatured: false,

  dimensions: { width: '', height: '' }
};

export default function AddOrEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id) || location.pathname.includes('/edit');
  const isCreate = !isEdit;

  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const { data: detail, isFetching: isLoadingDetail } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: isEdit && !!id,
    select: (doc) => doc || {},
    refetchOnWindowFocus: false
  });

  const { mutateAsync: addProduct, isPending: isAdding } = useAddProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const { data: brandsQ } = useBrands();
  const { data: typesQ } = useCategoryTypes();
  const { data: subsQ } = useSubCategories();
  const { data: occsQ } = useOccasions();
  const { data: recsQ } = useRecipients();
  const { data: colsQ } = useColors();
  const { data: packsQ } = usePackaging();
  const { data: namesQ } = useProductNames();

  const namesOpts = toOptions(namesQ?.rows);
  const brandOpts = toOptions(brandsQ?.rows);
  const typeOpts = toOptions(typesQ?.rows);
  const subcategoryOpts = toOptions(subsQ?.rows);
  const occasionOpts = toOptions(occsQ?.rows);
  const recipientOpts = toOptions(recsQ?.rows);
  const colorOpts = toOptions(colsQ?.rows);
  const packagingOpts = toOptions(packsQ?.rows);

  /* hydrate edit */
  useEffect(() => {
    if (!isEdit || !detail) return;
    const p = detail;

    const hydratedTypePieces = Array.isArray(p.typePieces)
      ? p.typePieces.map((row) => ({
          type: idOf(row.type),
          pieces: row.pieces ?? 0
        }))
      : [];

    const totalFromTypePieces = hydratedTypePieces.reduce(
      (sum, row) => sum + (Number(row.pieces) || 0),
      0
    );

    const next = {
      title: p.title ?? '',
      ar_title: p.ar_title ?? '',
      sku: p.sku ?? '',
      description: p.description ?? '',
      ar_description: p.ar_description ?? '',
      qualities: Array.isArray(p.qualities) ? p.qualities : [],
      ar_qualities: Array.isArray(p.ar_qualities) ? p.ar_qualities : [],
      price: p.price ?? '',
      discount: p.discount ?? 0,
      currency: p.currency || 'QAR',
      totalStocks: p.totalStocks ?? '',
      remainingStocks: p.remainingStocks ?? '',
      totalPieceSold: p.totalPieceSold ?? 0,
      stockStatus: p.stockStatus || 'in_stock',

      brand: idOf(p.brand),
      categories: (p.categories || []).map(idOf),
      type: (p.type || []).map(idOf),

      // NEW: recipe + total
      typePieces: hydratedTypePieces,
      totalPieceCarry:
        p.totalPieceCarry != null ? p.totalPieceCarry : totalFromTypePieces,

      occasions: (p.occasions || []).map(idOf),
      recipients: (p.recipients || []).map(idOf),
      colors: (p.colors || []).map(idOf),
      packagingOption: idOf(p.packagingOption),
      condition: p.condition || 'new',

      featuredImage: p.featuredImage || '',
      featuredImageFile: null,
      images:
        (p.images || [])
          .map((i) => {
            const url = i?.url ?? i;
            return url ? { url } : null;
          })
          .filter(Boolean) || [],

      suggestedProducts: (p.suggestedProducts || []).map(idOf),

      isActive: !!p.isActive,
      isFeatured: !!p.isFeatured,
      dimensions: {
        width: p.dimensions?.width ?? '',
        height: p.dimensions?.height ?? ''
      }
    };

    setForm(next);
  }, [isEdit, detail]);

  /* setters */
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setNumber = (k) => (e) =>
    setField(k, e.target.value === '' ? '' : Number(e.target.value));

  const removeImageRow = (idx) =>
    setField(
      'images',
      (form.images || []).filter((_, i) => i !== idx)
    );

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

  /* computed */
  const discountedPrice = useMemo(() => {
    const base = Number(form.price || 0);
    const disc = Number(form.discount || 0);
    const v = base - (base * disc) / 100;
    return Number.isFinite(v) ? Math.max(v, 0) : 0;
  }, [form.price, form.discount]);

  const stockRatio = useMemo(() => {
    const tot = Number(form.totalStocks || 0);
    const sold = Number(form.totalPieceSold || 0);
    if (tot <= 0) return 0;
    const rem = Math.max(tot - sold, 0);
    return Math.max(0, Math.min(rem / tot, 1)) * 100;
  }, [form.totalStocks, form.totalPieceSold]);

  const autoCalcStockStatus = () => {
    const tot = Number(form.totalStocks || 0);
    const sold = Number(form.totalPieceSold || 0);
    if (tot <= 0) return setField('stockStatus', 'out_of_stock');
    const rem = Math.max(tot - sold, 0);
    const ratio = rem / tot;
    if (rem <= 0) return setField('stockStatus', 'out_of_stock');
    if (ratio <= 0.15) return setField('stockStatus', 'low_stock');
    return setField('stockStatus', 'in_stock');
  };

  // NEW: sum of pieces from recipe
  const typePiecesTotal = useMemo(
    () =>
      (form.typePieces || []).reduce(
        (sum, row) => sum + (Number(row.pieces) || 0),
        0
      ),
    [form.typePieces]
  );

  // helper: FormData me ObjectId array append karne ke liye
  const appendIdArray = (fd, key, arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((id) => {
      if (id) fd.append(key, id);
    });
  };

  // Validate Form Data
  const validateForm = () => {
    const errs = {};

    if (isCreate) {
      // basics
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.ar_title.trim()) errs.ar_title = 'Arabic title is required';
      if (!form.sku.trim()) errs.sku = 'SKU is required';

      // descriptions (strip HTML)
      if (!stripHtml(form.description)) {
        errs.description = 'Description (English) is required';
      }
      if (!stripHtml(form.ar_description)) {
        errs.ar_description = 'Description (Arabic) is required';
      }

      // pricing
      if (!form.price || Number(form.price) <= 0) {
        errs.price = 'Price is required';
      }
      if (!form.totalStocks || Number(form.totalStocks) <= 0) {
        errs.totalStocks = 'Total stocks is required';
      }

      // media
      const hasFeatured = !!form.featuredImageFile || !!form.featuredImage;
      if (!hasFeatured) {
        errs.featuredImage = 'Featured image is required';
      }
      const galleryCount = (form.images || []).filter(
        (i) => i?.file || i?.url
      ).length;
      if (galleryCount === 0) {
        errs.images = 'At least one gallery image is required';
      }

      // classification
      if (!form.brand) errs.brand = 'Brand is required';
      if (!Array.isArray(form.categories) || form.categories.length === 0) {
        errs.categories = 'Select at least one category';
      }
      if (!Array.isArray(form.type) || form.type.length === 0) {
        errs.type = 'Select at least one type';
      }
      if (!Array.isArray(form.occasions) || form.occasions.length === 0) {
        errs.occasions = 'Select at least one occasion';
      }
      if (!Array.isArray(form.recipients) || form.recipients.length === 0) {
        errs.recipients = 'Select at least one recipient';
      }
      if (!Array.isArray(form.colors) || form.colors.length === 0) {
        errs.colors = 'Select at least one color';
      }

      // total piece carry / recipe
      if ((form.typePieces || []).length) {
        if (!typePiecesTotal || typePiecesTotal <= 0) {
          errs.totalPieceCarry = 'Enter pieces for each selected type';
        }
      } else if (form.totalPieceCarry === '' || form.totalPieceCarry == null) {
        errs.totalPieceCarry = 'Total piece carry is required';
      }
    }

    return errs;
  };

  /* FormData */
  const buildFormData = () => {
    const fd = new FormData();

    fd.append('title', (form.title || '').trim());
    fd.append('ar_title', (form.ar_title || '').trim());
    fd.append('sku', (form.sku || '').trim());
    fd.append('description', form.description || '');
    fd.append('ar_description', form.ar_description || '');
    fd.append(
      'price',
      form.price === '' || form.price == null ? '' : String(form.price)
    );
    fd.append(
      'discount',
      form.discount === '' || form.discount == null
        ? '0'
        : String(form.discount)
    );
    fd.append('currency', form.currency || 'QAR');
    fd.append(
      'totalStocks',
      form.totalStocks === '' || form.totalStocks == null
        ? ''
        : String(form.totalStocks)
    );
    fd.append(
      'remainingStocks',
      form.remainingStocks === '' || form.remainingStocks == null
        ? ''
        : String(form.remainingStocks)
    );
    fd.append(
      'totalPieceSold',
      form.totalPieceSold === '' || form.totalPieceSold == null
        ? '0'
        : String(form.totalPieceSold)
    );

    // CLEAN recipe rows
    const typePiecesClean = (form.typePieces || [])
      .filter((row) => row && row.type && row.pieces !== '' && row.pieces != null)
      .map((row) => ({
        type: row.type,
        pieces: Number(row.pieces) || 0
      }));

    const totalFromTypes = typePiecesClean.reduce(
      (sum, row) => sum + (row.pieces || 0),
      0
    );
    const totalPieceCarryValue =
      typePiecesClean.length ? totalFromTypes : form.totalPieceCarry || 0;

    fd.append(
      'totalPieceCarry',
      totalPieceCarryValue === '' || totalPieceCarryValue == null
        ? '0'
        : String(totalPieceCarryValue)
    );

    // send recipe only if we have at least one row
    if (typePiecesClean.length) {
      fd.append('typePieces', JSON.stringify(typePiecesClean));
    }

    fd.append('stockStatus', form.stockStatus || 'in_stock');
    fd.append('condition', form.condition || 'new');
    fd.append('isActive', String(!!form.isActive));
    fd.append('isFeatured', String(!!form.isFeatured));

    fd.append('qualities', JSON.stringify(form.qualities || []));
    fd.append('ar_qualities', JSON.stringify(form.ar_qualities || []));

    // ObjectId arrays (no JSON.stringify)
    appendIdArray(fd, 'categories', form.categories);
    appendIdArray(fd, 'occasions', form.occasions);
    appendIdArray(fd, 'recipients', form.recipients);
    appendIdArray(fd, 'colors', form.colors);
    appendIdArray(fd, 'suggestedProducts', form.suggestedProducts);
    appendIdArray(fd, 'type', form.type);

    fd.append(
      'dimensions',
      JSON.stringify({
        width:
          form.dimensions?.width === ''
            ? undefined
            : Number(form.dimensions?.width),
        height:
          form.dimensions?.height === ''
            ? undefined
            : Number(form.dimensions?.height)
      })
    );

    if (form.brand) fd.append('brand', form.brand);
    if (form.packagingOption) fd.append('packagingOption', form.packagingOption);

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

  /* submit */
  const loading = isLoadingDetail || isAdding || isUpdating;
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please fill all required fields.');
      return;
    }

    try {
      setSaving(true);
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

  /* UI */
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate className="pf-root">
      <Container maxWidth="xl" className="pf-container">
        <div className="pf-header">
          <Typography variant="h5" className="pf-title">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </Typography>
        </div>

        {(loading || saving) && <LinearProgress className="pf-loading" />}
        {error && (
          <Typography color="error" className="pf-error">
            {error}
          </Typography>
        )}

        <div className="pf-main-grid">
          {/* LEFT */}
          <div className="pf-left-col">
            {/* BASICS */}
            <section className="pf-section">
              <Typography variant="subtitle1" className="pf-section-title">
                Basics
              </Typography>

              <div className="pf-grid pf-grid-basics">
                <TextField
                  label="Title *"
                  placeholder="Red Roses"
                  fullWidth
                  value={form.title}
                  disabled={saving}
                  onChange={(e) => setField('title', e.target.value)}
                  error={!!fieldErrors.title}
                  helperText={fieldErrors.title}
                />

                <TextField
                  label="العنوان (عربي) *"
                  placeholder="الورد الحمراء"
                  fullWidth
                  value={form.ar_title}
                  disabled={saving}
                  onChange={(e) => setField('ar_title', e.target.value)}
                  inputProps={{ style: { direction: 'rtl', textAlign: 'right' } }}
                  error={!!fieldErrors.ar_title}
                  helperText={fieldErrors.ar_title}
                />

                <TextField
                  label="SKU *"
                  placeholder="123"
                  fullWidth
                  value={form.sku}
                  disabled={saving}
                  onChange={(e) => setField('sku', e.target.value)}
                  error={!!fieldErrors.sku}
                  helperText={fieldErrors.sku}
                />
              </div>

              <div className="pf-desc-block">
                <Typography variant="subtitle2" className="pf-label">
                  Description
                </Typography>
                <ReactQuill
                  className="pf-quill"
                  theme="snow"
                  value={form.description}
                  onChange={(html) => setField('description', html)}
                  readOnly={saving}
                  placeholder="Write a rich description..."
                />
                {fieldErrors.description && (
                  <Typography variant="caption" color="error">
                    {fieldErrors.description}
                  </Typography>
                )}
              </div>

              <div className="pf-desc-block">
                <Typography variant="subtitle2" className="pf-label">
                  الوصف (عربي)
                </Typography>
                <div dir="rtl">
                  <ReactQuill
                    className="pf-quill"
                    theme="snow"
                    value={form.ar_description}
                    onChange={(html) => setField('ar_description', html)}
                    readOnly={saving}
                    placeholder="...اكتب وصفاً جذاباً للمنتج"
                  />
                </div>
                {fieldErrors.ar_description && (
                  <Typography variant="caption" color="error">
                    {fieldErrors.ar_description}
                  </Typography>
                )}
              </div>
            </section>

            {/* MEDIA */}
            <section className="pf-section">
              <Typography variant="subtitle1" className="pf-section-title">
                Media
              </Typography>

              <div className="pf-grid pf-grid-media">
                {/* Featured */}
                <div className="pf-media-block">
                  <input
                    id="featured-input"
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={onFeaturedSelect}
                  />
                  <MuiButton
                    component="label"
                    htmlFor="featured-input"
                    variant="outlined"
                    disabled={saving}
                  >
                    Upload Featured Image
                  </MuiButton>

                  {form.featuredImage && (
                    <div className="pf-featured-preview">
                      <img src={form.featuredImage} alt="featured" />
                    </div>
                  )}

                  {fieldErrors.featuredImage && (
                    <Typography variant="caption" color="error">
                      {fieldErrors.featuredImage}
                    </Typography>
                  )}
                </div>

                {/* Gallery */}
                <div className="pf-media-block">
                  <input
                    id="gallery-input"
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={onAdditionalSelect}
                  />
                  <MuiButton
                    component="label"
                    htmlFor="gallery-input"
                    variant="outlined"
                    disabled={saving}
                  >
                    Upload Images
                  </MuiButton>

                  <div className="pf-thumbs">
                    {(form.images || [])
                      .filter((i) => i.url)
                      .map((i, k) => (
                        <div key={k} className="pf-thumb">
                          <img src={i.url} alt={`img-${k}`} />
                          <IconButton
                            size="small"
                            color="error"
                            disabled={saving}
                            onClick={() => removeImageRow(k)}
                            className="pf-thumb-delete"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </div>
                      ))}
                  </div>

                  {fieldErrors.images && (
                    <Typography variant="caption" color="error">
                      {fieldErrors.images}
                    </Typography>
                  )}
                </div>
              </div>
            </section>

            {/* CLASSIFICATION */}
            <section className="pf-section">
              <Typography variant="subtitle1" className="pf-section-title">
                Classification
              </Typography>

              <div className="pf-grid pf-grid-classification">
                <Autocomplete
                  options={brandOpts}
                  getOptionLabel={getLabel}
                  value={optionById(brandOpts, form.brand)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!brandOpts?.length}
                  onChange={(_, v) => setField('brand', v?._id || null)}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Brand *"
                      disabled={saving}
                      error={!!fieldErrors.brand}
                      helperText={fieldErrors.brand}
                    />
                  )}
                />

                <Autocomplete
                  multiple
                  options={typeOpts}
                  getOptionLabel={getLabel}
                  value={optionsByIds(typeOpts, form.type)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!typeOpts?.length}
                  onChange={(_, v) =>
                    setForm((prev) => {
                      const newTypeIds = v.map((x) => x._id);
                      const prevMap = new Map(
                        (prev.typePieces || []).map((tp) => [tp.type, tp.pieces])
                      );
                      const newTypePieces = newTypeIds.map((id) => ({
                        type: id,
                        pieces: prevMap.get(id) ?? 0
                      }));
                      return {
                        ...prev,
                        type: newTypeIds,
                        typePieces: newTypePieces
                      };
                    })
                  }
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Type *"
                      disabled={saving}
                      error={!!fieldErrors.type}
                      helperText={fieldErrors.type}
                    />
                  )}
                />

                {/* NEW: recipe per type */}
                {form.type?.length > 0 && (
                  <Box className="pf-typepieces">
                    <div className="pf-typepieces-header">
                      <span>Pieces per Type (Recipe)</span>
                      <span>{typePiecesTotal} pcs total</span>
                    </div>
                    <div className="pf-grid-typepieces">
                      {form.type.map((typeId) => {
                        const opt = optionById(typeOpts, typeId);
                        const row =
                          (form.typePieces || []).find((tp) => tp.type === typeId) ||
                          { pieces: 0 };

                        return (
                          <TextField
                            key={typeId}
                            type="number"
                            fullWidth
                            label={`${opt?.name || 'Type'} pcs`}
                            disabled={saving}
                            value={row.pieces}
                            onChange={(e) => {
                              const val =
                                e.target.value === '' ? '' : Number(e.target.value);
                              setForm((prev) => {
                                const copy = [...(prev.typePieces || [])];
                                const idx = copy.findIndex(
                                  (tp) => tp.type === typeId
                                );
                                if (idx >= 0) {
                                  copy[idx] = { ...copy[idx], pieces: val };
                                } else {
                                  copy.push({ type: typeId, pieces: val || 0 });
                                }
                                return { ...prev, typePieces: copy };
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                    {fieldErrors.totalPieceCarry && (
                      <Typography
                        variant="caption"
                        color="error"
                        className="pf-typepieces-error"
                      >
                        {fieldErrors.totalPieceCarry}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* <TextField
                  label="Total Piece Carry *"
                  fullWidth
                  disabled={saving || (form.typePieces || []).length > 0}
                  // auto-ledger from recipe if present, else manual value
                  value={
                    (form.typePieces || []).length ? typePiecesTotal : form.totalPieceCarry
                  }
                  onChange={setNumber('totalPieceCarry')}
                  error={!!fieldErrors.totalPieceCarry && !(form.typePieces || []).length}
                  helperText={
                    (form.typePieces || []).length
                      ? 'Auto-calculated from pieces per type'
                      : fieldErrors.totalPieceCarry
                  }
                /> */}

                <TextField
                  select
                  label="Condition"
                  fullWidth
                  disabled={saving}
                  value={form.condition}
                  onChange={(e) => setField('condition', e.target.value)}
                >
                  {CONDITIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>

                <Autocomplete
                  multiple
                  options={occasionOpts}
                  getOptionLabel={getLabel}
                  value={optionsByIds(occasionOpts, form.occasions)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!occasionOpts?.length}
                  onChange={(_, v) =>
                    setField(
                      'occasions',
                      v.map((x) => x._id)
                    )
                  }
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Occas. *"
                      disabled={saving}
                      error={!!fieldErrors.occasions}
                      helperText={fieldErrors.occasions}
                    />
                  )}
                />

                <Autocomplete
                  multiple
                  options={recipientOpts}
                  getOptionLabel={getLabel}
                  value={optionsByIds(recipientOpts, form.recipients)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!recipientOpts?.length}
                  onChange={(_, v) =>
                    setField(
                      'recipients',
                      v.map((x) => x._id)
                    )
                  }
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Recip. *"
                      disabled={saving}
                      error={!!fieldErrors.recipients}
                      helperText={fieldErrors.recipients}
                    />
                  )}
                />

                <Autocomplete
                  multiple
                  options={colorOpts}
                  getOptionLabel={getLabel}
                  value={optionsByIds(colorOpts, form.colors)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!colorOpts?.length}
                  onChange={(_, v) =>
                    setField(
                      'colors',
                      v.map((x) => x._id)
                    )
                  }
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Colors *"
                      disabled={saving}
                      error={!!fieldErrors.colors}
                      helperText={fieldErrors.colors}
                    />
                  )}
                />

                <Autocomplete
                  options={packagingOpts}
                  getOptionLabel={getLabel}
                  value={optionById(packagingOpts, form.packagingOption)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!packagingOpts?.length}
                  onChange={(_, v) => setField('packagingOption', v?._id || null)}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Packaging Option"
                      disabled={saving}
                    />
                  )}
                />

                <Autocomplete
                  multiple
                  options={subcategoryOpts}
                  getOptionLabel={getLabel}
                  value={optionsByIds(subcategoryOpts, form.categories)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!subcategoryOpts?.length}
                  onChange={(_, v) =>
                    setField(
                      'categories',
                      v.map((x) => x._id)
                    )
                  }
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Select Categories *"
                      placeholder="Select one or more"
                      disabled={saving}
                      error={!!fieldErrors.categories}
                      helperText={fieldErrors.categories}
                    />
                  )}
                />

                <Autocomplete
                  multiple
                  options={namesOpts}
                  getOptionLabel={getLabel}
                  value={optionsByIds(namesOpts, form.suggestedProducts)}
                  isOptionEqualToValue={(o, v) => o._id === v._id}
                  loading={!namesOpts?.length}
                  onChange={(_, v) =>
                    setField(
                      'suggestedProducts',
                      v.map((x) => x._id)
                    )
                  }
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Suggested Products"
                      placeholder="Select one or more"
                      disabled={saving}
                    />
                  )}
                />
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="pf-right-col">
            {/* Pricing */}
            <section className="pf-section">
              <div className="pf-section-header-row">
                <Typography variant="subtitle1" className="pf-section-title">
                  Pricing &amp; Inventory
                </Typography>
                <Tooltip title="Auto-calc stock status from totals">
                  <IconButton
                    onClick={autoCalcStockStatus}
                    size="small"
                    disabled={saving}
                  >
                    <AutoFixHigh fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>

              <div className="pf-grid pf-grid-pricing">
                <TextField
                  type="number"
                  label="Price *"
                  fullWidth
                  disabled={saving}
                  value={form.price}
                  onChange={setNumber('price')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {form.currency}
                      </InputAdornment>
                    )
                  }}
                  error={!!fieldErrors.price}
                  helperText={fieldErrors.price}
                />

                <TextField
                  select
                  label="Currency"
                  fullWidth
                  disabled={saving}
                  value={form.currency}
                  onChange={(e) => setField('currency', e.target.value)}
                >
                  {CURRENCIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  type="number"
                  label="Discount (%)"
                  fullWidth
                  disabled={saving}
                  value={form.discount}
                  onChange={setNumber('discount')}
                />

                <div className="pf-final-price">
                  <Calculate fontSize="small" />
                  <span>Final:</span>
                  <Chip
                    label={`${form.currency} ${discountedPrice.toFixed(2)}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </div>

                <TextField
                  type="number"
                  label="Total Stocks *"
                  fullWidth
                  disabled={saving}
                  value={form.totalStocks}
                  onChange={setNumber('totalStocks')}
                  error={!!fieldErrors.totalStocks}
                  helperText={fieldErrors.totalStocks}
                />

                <TextField
                  type="number"
                  label="Pieces Sold"
                  fullWidth
                  disabled={saving}
                  value={form.totalPieceSold}
                  onChange={setNumber('totalPieceSold')}
                />

                <TextField
                  select
                  label="Stock Status"
                  fullWidth
                  disabled={saving}
                  value={form.stockStatus}
                  onChange={(e) => setField('stockStatus', e.target.value)}
                >
                  {AVAILABILITY.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>

                <div className="pf-stock-fill">
                  <div className="pf-stock-fill-label">
                    <span>Stock fill</span>
                    <span>{Math.round(stockRatio)}%</span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={stockRatio}
                    className="pf-stock-progress"
                  />
                </div>
              </div>
            </section>

            {/* Visibility */}
            <section className="pf-section">
              <Typography variant="subtitle1" className="pf-section-title">
                Visibility &amp; Dimensions
              </Typography>

              <div className="pf-switch-row">
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isActive}
                      onChange={(e) => setField('isActive', e.target.checked)}
                      disabled={saving}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setField('isFeatured', e.target.checked)
                      }
                      disabled={saving}
                    />
                  }
                  label="Featured"
                />
              </div>

              <div className="pf-grid pf-grid-dimensions">
                <TextField
                  type="number"
                  label="Width"
                  fullWidth
                  disabled={saving}
                  value={form.dimensions.width}
                  onChange={(e) =>
                    setField('dimensions', {
                      ...form.dimensions,
                      width:
                        e.target.value === '' ? '' : Number(e.target.value)
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">cm</InputAdornment>
                    )
                  }}
                />
                <TextField
                  type="number"
                  label="Height"
                  fullWidth
                  disabled={saving}
                  value={form.dimensions.height}
                  onChange={(e) =>
                    setField('dimensions', {
                      ...form.dimensions,
                      height:
                        e.target.value === '' ? '' : Number(e.target.value)
                    })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">cm</InputAdornment>
                    )
                  }}
                />
              </div>

              <Divider className="pf-divider" />

              <div className="pf-actions">
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
              </div>
            </section>
          </div>
        </div>
      </Container>
    </Box>
  );
}