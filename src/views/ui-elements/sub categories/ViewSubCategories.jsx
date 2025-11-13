// src/pages/.../CategoriesTable.jsx
import * as React from 'react';
import {
  Box,
  Alert,
  Chip,
  Tooltip,
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
import { useSubCategories } from '../../../hooks/subCategories/useSubCategories';
import { useDeleteSubCategory } from '../../../hooks/subCategories/useSubCategoryMutation';
import TablePagination from '../../../components/TablePagination';

/* ---------- pretty pill helper + chip ---------- */
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

const ActiveChip = ({ value }) =>
  value ? (
    <Chip size="small" icon={<CheckCircleIcon />} label="Active" sx={pill('rgba(16,185,129,0.18)', '#86efac', 'rgba(16,185,129,0.45)')} />
  ) : (
    <Chip size="small" icon={<CancelIcon />} label="Inactive" sx={pill('rgba(239,68,68,0.18)', '#fca5a5', 'rgba(239,68,68,0.45)')} />
  );

export default function ViewSubCategories() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSubCategories();

  // delete hook
  const { mutateAsync: deleteSubCategory, isPending } = useDeleteSubCategory();

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
      await deleteSubCategory(confirm.id);
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
      { field: 'ar_name', headerName: 'Ar Name', flex: 1, width: 220 },
      { field: 'slug', headerName: 'Slug', flex: 1, width: 220 },

      // --------- Active/Inactive pretty badge ----------
      {
        field: 'isActive',
        headerName: 'Active',
        flex: 1,
        minWidth: 220,
        sortable: true,
        renderCell: (params) => <ActiveChip value={params.value} />
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
              <IconButton size="small" onClick={() => navigate(`/subCategories/edit/${params.row.id}`)}>
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
        <h4 style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: '1rem' }}>Sub Categories</h4>
        <Button isLink to="/subCategories/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
          Add Sub Category
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
        pagination
        pageSizeOptions={[12]}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
        loading={isLoading}
        // 🔹 Custom teal pagination
        slots={{ pagination: TablePagination }}
        sx={{
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e5e7eb",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#cbd5e1",
          },
          "& .MuiDataGrid-cell": { borderColor: "rgba(255,255,255,0.06)" },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "rgba(255,255,255,0.02)",
          },
          "& .MuiDataGrid-row--borderBottom": {
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          },
          "& .MuiDataGrid-row.blocked": {
            background:
              "linear-gradient(90deg, rgba(239,68,68,0.06), rgba(239,68,68,0.0))",
          },
          "& .MuiDataGrid-virtualScroller": { overflowX: "hidden" },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            bgcolor: 'transparent',
            minHeight: 64
          }
        }}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirm.open} onClose={isPending ? undefined : closeConfirm}>
        <DialogTitle>Delete Sub Category?</DialogTitle>
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
