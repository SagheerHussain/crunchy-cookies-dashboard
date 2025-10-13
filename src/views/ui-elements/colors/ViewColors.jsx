import React from 'react';
import { Row, Col } from 'react-bootstrap';
import MainCard from '../../../components/Card/MainCard';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { IoBag } from 'react-icons/io5';

// MUI (just for dialog + tiny action squares)
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MUIButton } from '@mui/material';

import { useColors } from '../../../hooks/colors/useColors'; // your hook file path
import { useDeleteColor } from '../../../hooks/colors/useColorMutation';

function getContrastColor(hex) {
  // fallback
  if (!hex || typeof hex !== 'string') return '#111';
  const h = hex.replace('#', '');
  const bigint = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  // YIQ
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#111' : '#fff';
}

export default function ViewColors() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useColors();
  const { mutateAsync: deleteColor, isPending: deleting } = useDeleteColor();

  const [confirm, setConfirm] = React.useState({
    open: false,
    id: null,
    name: ''
  });

  const openConfirm = (row) => setConfirm({ open: true, id: row.id ?? row._id, name: row.name || '' });
  const closeConfirm = () => setConfirm({ open: false, id: null, name: '' });

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteColor(confirm.id);
    } finally {
      closeConfirm();
    }
  };

  const rows = data?.rows || [];

  return (
    <Row>
      <Col sm={12}>
        <MainCard
          title="Colors"
          isOption={false}
          // simple header action: float a button to the right
          // If MainCard supports a "secondary" prop, you can move this there.
        >
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: -83, right: 0 }}>
              <Button isLink to="/colors/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
                Add Color
              </Button>
            </div>
          </div>

          {isLoading && <div className="py-4 px-3 text-muted">Loading colors…</div>}
          {isError && <div className="py-4 px-3 text-danger">Failed to load colors. Please retry.</div>}

          {!isLoading && rows.length === 0 && <div className="py-4 px-3 text-muted">No colors found.</div>}

          {!isLoading && rows.length > 0 && (
            <Row className="gy-4">
              {/* Left column with the stacked color blocks (like your screenshot) */}
              {rows.map((c) => {
                const bg = c.value || '#222';
                const fg = getContrastColor(bg);
                return (
                  <Col md={4}>
                    <div
                      key={c.id}
                      className="p-3 color-block"
                      style={{
                        background: bg,
                        color: fg,
                        borderRadius: 8,
                        marginBottom: 12,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {/* label like bg-blue-100 → we’ll show name; fallback to slug/value */}
                        {c.name || c.slug || c.value}
                        {c.mode ? ` (${c.value})` : ''}
                      </div>

                      {/* tiny action squares on the right (magenta = edit, green = delete) */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* EDIT square */}
                        <EditIcon onClick={() => navigate(`/colors/edit/${c.id}`)} fontSize="medium" style={{ cursor: 'pointer' }} />
                        {/* DELETE square */}
                        <DeleteIcon onClick={() => openConfirm(c)} fontSize="medium" color="error" style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* Confirm Delete */}
          <Dialog open={confirm.open} onClose={deleting ? undefined : closeConfirm}>
            <DialogTitle>Delete Color?</DialogTitle>
            <DialogContent>
              Are you sure you want to delete <strong>{confirm.name}</strong>? This action cannot be undone.
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
        </MainCard>
      </Col>
    </Row>
  );
}
