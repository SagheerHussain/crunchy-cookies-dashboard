// src/pages/.../ViewColors.jsx
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import MainCard from '../../../components/Card/MainCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { IoBag } from 'react-icons/io5';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MUIButton,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';

import { useColors } from '../../../hooks/colors/useColors';
import { useDeleteColor } from '../../../hooks/colors/useColorMutation';

/* ---------- helpers ---------- */
function getContrastColor(hex) {
  if (!hex || typeof hex !== 'string') return '#111';
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const bigint = parseInt(full, 16);
  if (Number.isNaN(bigint)) return '#111';
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#0f172a' : '#fff';
}

const softPill = (bg, fg, br) => ({
  background: bg,
  color: fg,
  border: `1px solid ${br}`,
  fontWeight: 700,
  borderRadius: 999,
  height: 24,
  '& .MuiChip-label': { px: 1 }
});

/* ---------- Color Card component ---------- */
function ColorCard({ color, onEdit, onDelete, onCopied }) {
  const bg = color.value || '#222';
  const fg = getContrastColor(bg);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bg);
      onCopied?.();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div
      className="color-card"
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(2,6,23,0.5), rgba(2,6,23,0.2))',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
      }}
    >
      {/* Swatch */}
      <div
        style={{
          height: 120,
          background: bg,
          position: 'relative',
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          padding: 12
        }}
      >
        <Chip
          size="small"
          icon={<PaletteIcon sx={{ color: fg }} />}
          label={color.name || color.slug || 'Unnamed'}
          sx={{
            background: 'rgba(0,0,0,0.22)',
            color: fg,
            border: `1px solid rgba(255,255,255,0.25)`,
            '& .MuiChip-icon': { color: fg },
            fontWeight: 700
          }}
        />
        <Chip
          size="small"
          label={bg}
          sx={{
            background: 'rgba(255,255,255,0.18)',
            color: fg,
            border: `1px solid rgba(255,255,255,0.35)`,
            fontWeight: 700
          }}
        />
      </div>

      {/* Meta + actions */}
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {color.name || color.slug || color.value}
          </div>
          {(color.slug || color.mode) && (
            <div style={{ color: '#a3a3a3', fontSize: 12 }}>
              {color.slug && <span>/{color.slug}</span>} {color.slug && color.mode ? ' • ' : ''} {color.mode && <span>{color.mode}</span>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Tooltip title="Copy color">
            <IconButton size="small" onClick={copy}>
              <ContentCopyIcon fontSize="small" sx={{ color: '#d1d5db' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={onEdit}>
              <EditIcon fontSize="small" sx={{ color: '#d1d5db' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function ViewColors() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useColors();
  const { mutateAsync: deleteColor, isPending: deleting } = useDeleteColor();

  const [confirm, setConfirm] = React.useState({ open: false, id: null, name: '' });
  const [toast, setToast] = React.useState({ open: false, msg: '', sev: 'success' });
  const [query, setQuery] = React.useState('');
  const [sortAnchor, setSortAnchor] = React.useState(null);
  const [sortKey, setSortKey] = React.useState('name_asc');

  const rows = React.useMemo(() => data?.rows ?? [], [data]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((c) => {
      if (!q) return true;
      const hay = `${c.name ?? ''} ${c.slug ?? ''} ${c.value ?? ''}`.toLowerCase();
      return hay.includes(q);
    });

    switch (sortKey) {
      case 'name_desc':
        list = list.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
        break;
      case 'hex_asc':
        list = list.sort((a, b) => String(a.value || '').localeCompare(String(b.value || '')));
        break;
      case 'hex_desc':
        list = list.sort((a, b) => String(b.value || '').localeCompare(String(a.value || '')));
        break;
      case 'name_asc':
      default:
        list = list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }
    return list;
  }, [rows, query, sortKey]);

  const openConfirm = (row) => setConfirm({ open: true, id: row.id ?? row._id, name: row.name || '' });
  const closeConfirm = () => setConfirm({ open: false, id: null, name: '' });

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteColor(confirm.id);
      setToast({ open: true, msg: 'Color deleted', sev: 'success' });
    } catch (e) {
      setToast({ open: true, msg: e?.message || 'Delete failed', sev: 'error' });
    } finally {
      closeConfirm();
    }
  };

  const handleCopied = () => setToast({ open: true, msg: 'Color copied', sev: 'success' });

  return (
    <Row>
      <Col sm={12}>
        <MainCard title="Colors" isOption={false}>
          {/* Header bar */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 360px' }}>
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  minWidth: 260,
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: 'rgba(2,6,23,0.5)'
                }}
              >
                <SearchIcon
                  fontSize="small"
                  style={{ position: 'absolute', left: 10, top: 10, color: '#a3a3a3' }}
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search colors by name, slug, or hex…"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    color: '#e5e7eb',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </div>

              <Tooltip title="Sort">
                <IconButton size="small" onClick={(e) => setSortAnchor(e.currentTarget)}>
                  <SortIcon sx={{ color: '#e5e7eb' }} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={sortAnchor}
                open={Boolean(sortAnchor)}
                onClose={() => setSortAnchor(null)}
                keepMounted
              >
                <MenuItem onClick={() => { setSortKey('name_asc'); setSortAnchor(null); }}>Name (A–Z)</MenuItem>
                <MenuItem onClick={() => { setSortKey('name_desc'); setSortAnchor(null); }}>Name (Z–A)</MenuItem>
                <MenuItem onClick={() => { setSortKey('hex_asc'); setSortAnchor(null); }}>Hex (A–Z)</MenuItem>
                <MenuItem onClick={() => { setSortKey('hex_desc'); setSortAnchor(null); }}>Hex (Z–A)</MenuItem>
              </Menu>
            </div>

            <div style={{ display: 'flex', alignItems: "center", gap: 8 }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${filtered.length} ${filtered.length === 1 ? 'color' : 'colors'}`}
                sx={softPill('rgba(34,197,94,0.15)', '#86efac', 'rgba(34,197,94,0.35)')}
              />
              <Button isLink to="/colors/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
                Add Color
              </Button>
            </div>
          </div>

          {/* States */}
          {isLoading && (
            <div className="py-2">
              <Row className="gy-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Col key={i} md={4} lg={3}>
                    <Skeleton
                      variant="rounded"
                      height={180}
                      sx={{ bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2 }}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {isError && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <MUIButton size="small" onClick={() => refetch()}>
                  Retry
                </MUIButton>
              }
            >
              Failed to load colors.
            </Alert>
          )}

          {!isLoading && filtered.length === 0 && !isError && (
            <div
              style={{
                padding: '28px 16px',
                border: '1px dashed rgba(255,255,255,0.12)',
                borderRadius: 12,
                color: '#9ca3af',
                textAlign: 'center'
              }}
            >
              No colors found. Try adjusting your search.
            </div>
          )}

          {/* Grid */}
          {!isLoading && filtered.length > 0 && (
            <Row className="gy-4">
              {filtered.map((c) => (
                <Col key={c.id ?? c._id} md={4} lg={3}>
                  <ColorCard
                    color={c}
                    onCopied={handleCopied}
                    onEdit={() => navigate(`/colors/edit/${c.id ?? c._id}`)}
                    onDelete={() => setConfirm({ open: true, id: c.id ?? c._id, name: c.name || '' })}
                  />
                </Col>
              ))}
            </Row>
          )}

          {/* Confirm Delete */}
          <Dialog open={confirm.open} onClose={deleting ? undefined : closeConfirm}>
            <DialogTitle>Delete Color?</DialogTitle>
            <DialogContent>
              Are you sure you want to delete <strong>{confirm.name || 'this color'}</strong>? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <MUIButton onClick={closeConfirm} disabled={deleting}>
                Cancel
              </MUIButton>
              <MUIButton color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </MUIButton>
            </DialogActions>
          </Dialog>

          {/* Toast */}
          <Snackbar
            open={toast.open}
            autoHideDuration={2200}
            onClose={() => setToast((t) => ({ ...t, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setToast((t) => ({ ...t, open: false }))}
              severity={toast.sev}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {toast.msg}
            </Alert>
          </Snackbar>
        </MainCard>
      </Col>
    </Row>
  );
}
