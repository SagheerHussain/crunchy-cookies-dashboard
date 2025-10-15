import * as React from 'react';
import { Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton, Tooltip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Button from '../../../components/Button';
import { IoBag } from 'react-icons/io5';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { usePackaging } from '../../../hooks/packaging/usePackaging';
import { useDeletePackaging } from '../../../hooks/packaging/usePackagingMutation';

export default function ViewPackaging() {
  const navigate = useNavigate();

  const [confirm, setConfirm] = React.useState({
    open: false,
    id: null,
    name: ''
  });

  const { data, isLoading, isError } = usePackaging();
  const { mutateAsync: deletePackaging, isPending: deletePackagingPending } = useDeletePackaging();

  const openConfirm = (row) => setConfirm({ open: true, id: row.id ?? row._id, name: row.name });
  const closeConfirm = () => setConfirm({ open: false, id: null, name: '' });

  const handleConfirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await deletePackaging(confirm.id);
      // no manual refetch needed (optimistic + invalidate handles it)
    } finally {
      closeConfirm();
    }
  };

  console.log("data", data)

  const columns = [
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'ar_name', headerName: 'Name (Arabic)', width: 250 },
    { field: 'slug', headerName: 'Slug', width: 250 },
    { field: 'materials', headerName: 'Materials', width: 250, renderCell: (params) => params?.row?.materials?.map((m) => m).join(', ') },
    { field: 'ar_materials', headerName: 'Materials (Arabic)', width: 250, renderCell: (params) => params?.row?.ar_materials?.map((m) => m).join(', ') },
    {
      field: 'isActive',
      headerName: 'Active',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => <Chip label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'error'} />
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 0.5
          }}
        >
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/packaging/edit/${params.row.id ?? params.row._id}`)}>
              <EditIcon fontSize="small" sx={{ color: '#fff' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => openConfirm(params.row)} disabled={deletePackagingPending}>
              <DeleteIcon fontSize="small" sx={{ color: 'red' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <h4
          style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '1rem'
          }}
        >
          Packaging
        </h4>
        <Button isLink to="/packaging/add" isStartIcon startIcon={<IoBag />} variant="contained" color="primary">
          Add Packaging
        </Button>
      </div>

      <DataGrid
        rows={data?.rows || []}
        getRowId={(row) => row.id ?? row._id} // <- handles id/_id
        columns={columns}
        loading={isLoading}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirm.open} onClose={deletePackagingPending ? undefined : closeConfirm}>
        <DialogTitle>Delete Packaging?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{confirm.name}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeConfirm} disabled={deletePackagingPending}>
            Cancel
          </MuiButton>
          <MuiButton onClick={handleConfirmDelete} color="error" variant="contained" disabled={deletePackagingPending}>
            {deletePackagingPending ? 'Deleting...' : 'Delete'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
