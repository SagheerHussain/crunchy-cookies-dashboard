// src/pages/.../CategoriesTable.jsx
import * as React from 'react';
import {
  Box,
  Alert,
  Tooltip,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Button from '../../../components/Button';
import { IoBag } from 'react-icons/io5';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../../../hooks/categories/useCategories';
import { useDeleteCategory } from '../../../hooks/categories/useCategoryMutation';

/* ---------- pretty pill helper ---------- */
const pill = (bg, fg, border) => ({
  bgcolor: bg,
  color: fg,
  border: `1px solid ${border}`,
  fontWeight: 700,
  height: 26,
  borderRadius: 999,
  '& .MuiChip-icon': { fontSize: 16, mr: 0.5, color: fg },
  '& .MuiChip-label': { px: 0.75, fontSize: 12, letterSpacing: 0.2 }
});

export default function CategoriesTable() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useCategories();

  // delete hook
  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();

  // confirm dialog state
  const [confirm, setConfirm] = React.useState({
    open: false,
    id: null,
    name: ''
  });

  const openConfirm = (row) => setConfirm({ open: true, id: row.id, name: row.name });

  const closeConfirm = () => setConfirm({ open: false, id: null, name: '' });

  const handleConfirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteCategory(confirm.id);
    } finally {
      closeConfirm();
    }
  };

  const columns = React.useMemo(
    () => [
      {
        field: 'image',
        headerName: 'Image',
        width: 110,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box
            component="img"
            src={params.value}
            alt=""
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png';
            }}
            sx={{ width: 42, height: 42, borderRadius: 1, objectFit: 'cover' }}
          />
        )
      },
      { field: 'name', headerName: 'Name', flex: 1, width: 220 },
      { field: 'ar_name', headerName: 'Name (Arabic)', flex: 1, width: 220 },
      { field: 'slug', headerName: 'Slug', flex: 1, width: 220 },

      // --------- Active/Inactive pretty badge ----------
      {
        field: 'isActive',
        headerName: 'Active',
        flex: 1,
        minWidth: 250,
        sortable: true,
        renderCell: (params) => {
          const active = Boolean(params.value);
          return active ? (
            <Chip
              size="small"
              icon={<CheckCircleIcon />}
              label="Active"
              sx={pill('rgba(16,185,129,0.18)', '#86efac', 'rgba(16,185,129,0.45)')}
            />
          ) : (
            <Chip
              size="small"
              icon={<CancelIcon />}
              label="Inactive"
              sx={pill('rgba(239,68,68,0.18)', '#fca5a5', 'rgba(239,68,68,0.45)')}
            />
          );
        }
      },

      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, width: '100%' }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => navigate(`/categories/edit/${params.row.id}`)}>
                <EditIcon fontSize="small" sx={{ color: '#fff' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" disabled={isPending} onClick={() => openConfirm(params.row)}>
                <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    [navigate, isPending]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: '1rem' }}>Categories</h4>
        <Button isLink to="/categories/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
          Add Category
        </Button>
      </div>

      {(isError || data?.success === false) && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {data?.message || 'Failed to load categories.'}
        </Alert>
      )}

      <DataGrid
        rows={data?.rows ?? []}
        columns={columns}
        getRowId={(r) => r.id}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
        loading={isLoading}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirm.open} onClose={isPending ? undefined : closeConfirm}>
        <DialogTitle>Delete category?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{confirm.name}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeConfirm} disabled={isPending}>
            Cancel
          </MuiButton>
          <MuiButton onClick={handleConfirmDelete} color="error" variant="contained" disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
