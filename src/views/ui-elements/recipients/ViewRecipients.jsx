// src/pages/.../ViewRecipient.jsx
import * as React from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Tooltip,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Button from "../../../components/Button";
import { IoBag } from "react-icons/io5";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useNavigate } from "react-router-dom";
import { useRecipients } from "../../../hooks/recipients/useRecipients";
import { useDeleteRecipient } from "../../../hooks/recipients/useRecipientMutation";

/* ---------- pretty pill helper + chip ---------- */
const pill = (bg, fg, border) => ({
  bgcolor: bg,
  color: fg,
  border: `1px solid ${border}`,
  fontWeight: 700,
  height: 26,
  borderRadius: 999,
  "& .MuiChip-icon": { fontSize: 16, mr: 0.5, color: fg },
  "& .MuiChip-label": { px: 0.75, fontSize: 12, letterSpacing: 0.2 },
});

const ActiveChip = ({ value }) =>
  value ? (
    <Chip
      size="small"
      icon={<CheckCircleIcon />}
      label="Active"
      sx={pill("rgba(16,185,129,0.18)", "#86efac", "rgba(16,185,129,0.45)")}
    />
  ) : (
    <Chip
      size="small"
      icon={<CancelIcon />}
      label="Inactive"
      sx={pill("rgba(239,68,68,0.18)", "#fca5a5", "rgba(239,68,68,0.45)")}
    />
  );

export default function ViewRecipient() {
  const navigate = useNavigate();

  const [confirm, setConfirm] = React.useState({
    open: false,
    id: null,
    name: "",
  });

  const { data, isLoading } = useRecipients();
  const { mutateAsync: deleteRecipient, isPending: deleteRecipientPending } =
    useDeleteRecipient();

  const openConfirm = (row) =>
    setConfirm({ open: true, id: row.id ?? row._id, name: row.name });
  const closeConfirm = () => setConfirm({ open: false, id: null, name: "" });

  const handleConfirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await deleteRecipient(confirm.id);
    } finally {
      closeConfirm();
    }
  };

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.value}
          alt=""
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
          sx={{ width: 42, height: 42, borderRadius: 1, objectFit: "cover" }}
        />
      ),
    },
    { field: "name", headerName: "Name", width: 250 },
    { field: "ar_name", headerName: "Ar Name", width: 200 },
    { field: "slug", headerName: "Slug", width: 250 },

    // ---- Active/Inactive badge ----
    {
      field: "isActive",
      headerName: "Active",
      flex: 1,
      minWidth: 220,
      sortable: true,
      renderCell: (params) => <ActiveChip value={params.value} />,
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: 0.5,
          }}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() =>
                navigate(`/recipients/edit/${params.row.id ?? params.row._id}`)
              }
            >
              <EditIcon fontSize="small" sx={{ color: "#fff" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => openConfirm(params.row)}
              disabled={deleteRecipientPending}
            >
              <DeleteIcon fontSize="small" sx={{ color: "red" }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h4
          style={{
            color: "#fff",
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "1rem",
          }}
        >
          Recipients
        </h4>
        <Button
          isLink
          to="/recipients/add"
          isStartIcon
          startIcon={<IoBag />}
          variant="contained"
          color="primary"
        >
          Add Recipient
        </Button>
      </div>

      <DataGrid
        rows={data?.rows || []}
        getRowId={(row) => row.id ?? row._id}
        columns={columns}
        loading={isLoading}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirm.open}
        onClose={deleteRecipientPending ? undefined : closeConfirm}
      >
        <DialogTitle>Delete Recipient?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete <strong>{confirm.name}</strong>? This
          action cannot be undone.
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={closeConfirm} disabled={deleteRecipientPending}>
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteRecipientPending}
          >
            {deleteRecipientPending ? "Deleting..." : "Delete"}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
