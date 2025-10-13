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
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../../hooks/users/useUsers";

export default function ViewCustomers() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useUsers();

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      width: 150,
      sortable: false,
      filterable: false,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 150,
      sortable: false,
      filterable: false,
    },
    {
      field: "email",
      headerName: "Email",
      width: 150,
      sortable: false,
      filterable: false,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 150,
      sortable: false,
      filterable: false,
    },
    {
      field: "role",
      headerName: "Role",
      width: 150,
      sortable: false,
      filterable: false,
    },
    {
      field: "gender",
      headerName: "Gender",
      width: 120,
      sortable: false,
      filterable: false,
    },
    {
      field: "dob",
      headerName: "DOB",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => params.value?.split("T")[0],
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      sortable: false,
      filterable: false,
    },
    {
      field: "isActive",
      headerName: "Active",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive === "active" ? "Active" : "Blocked"}
          color={params.row.isActive === "active" ? "success" : "error"}
        />
      ),
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
                navigate(`/customers/edit/${params.row.id ?? params.row._id}`)
              }
            >
              <EditIcon fontSize="small" sx={{ color: "#fff" }} />
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
          Users
        </h4>
      </div>

      <DataGrid
        rows={data?.rows || []}
        getRowId={(row) => row.id ?? row._id}  // <- handles id/_id
        columns={columns}
        loading={isLoading}
        initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
        pageSizeOptions={[12]}
        checkboxSelection
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
}
