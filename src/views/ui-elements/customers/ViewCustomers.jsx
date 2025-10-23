import * as React from "react";
import {
  Box,
  Chip,
  Tooltip,
  IconButton,
  LinearProgress,
  Typography,
  Button as MuiButton,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../../hooks/users/useUsers";

/* ---------- Small helpers ---------- */
const formatDOB = (v) => (typeof v === "string" ? v.split("T")[0] : v ?? "-");
const statusChip = (row) => {
  const active = (row.isActive ?? row.status) === "active";
  return (
    <Chip
      size="small"
      label={active ? "Active" : "Blocked"}
      color={active ? "success" : "error"}
      variant={active ? "filled" : "outlined"}
    />
  );
};

function EmailCell({ value }) {
  if (!value) return "-";
  return (
    <Tooltip title={value}>
      <Typography
        variant="body2"
        sx={{
          maxWidth: 180,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "#e5e7eb",
        }}
      >
        {value}
      </Typography>
    </Tooltip>
  );
}

function PhoneCell({ value }) {
  if (!value) return "-";
  return (
    <MuiButton
      size="small"
      sx={{ textTransform: "none", px: 0 }}
      href={`tel:${value}`}
    >
      {value}
    </MuiButton>
  );
}

/* ---------- Custom toolbar ---------- */
function UsersToolbar({ onRefresh }) {
  return (
    <GridToolbarContainer sx={{ p: 1, gap: 1, justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport csvOptions={{ fileName: "users" }} />
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <GridToolbarQuickFilter
        quickFilterParser={(v) => v.split(" ").filter(Boolean)}
        debounceMs={300}
        sx={{
          "& .MuiInputBase-root": { color: "#e5e7eb" },
          "& .MuiInputBase-input::placeholder": { color: "#9ca3af" },
        }}
      />
    </GridToolbarContainer>
  );
}

/* ---------- Overlays ---------- */
function LoadingOverlay() {
  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgress />
    </Box>
  );
}

function NoRows() {
  return (
    <Box sx={{ py: 4, textAlign: "center", color: "#9ca3af" }}>
      <Typography variant="body1">No users found</Typography>
      <Typography variant="caption">Try adjusting filters or refresh.</Typography>
    </Box>
  );
}

function ErrorOverlay({ error }) {
  return (
    <Box sx={{ py: 4, textAlign: "center", color: "#fca5a5" }}>
      <Typography variant="body1">Failed to load users</Typography>
      <Typography variant="caption">{String(error ?? "")}</Typography>
    </Box>
  );
}

/* ---------- Main component ---------- */
export default function ViewCustomers() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(12);

  // Keep your existing hook call; refresh via key bump
  const { data, isLoading, isError, error, refetch } = useUsers(refreshKey);

  const rows = React.useMemo(() => data?.rows ?? [], [data]);

  const columns = React.useMemo(
    () => [
      { field: "firstName", headerName: "First Name", width: 150 },
      { field: "lastName", headerName: "Last Name", width: 150 },
      { field: "ar_firstName", headerName: "First Name (ar)", width: 160 },
      { field: "ar_lastName", headerName: "Last Name (ar)", width: 160 },
      {
        field: "email",
        headerName: "Email",
        width: 220,
        renderCell: (params) => <EmailCell value={params.value} />,
      },
      {
        field: "phone",
        headerName: "Phone",
        width: 160,
        renderCell: (params) => <PhoneCell value={params.value} />,
      },
      {
        field: "role",
        headerName: "Role",
        width: 140,
        renderCell: (p) => (
          <Chip
            size="small"
            label={String(p.value ?? "-")}
            sx={{ bgcolor: "rgba(79,70,229,0.12)", color: "#93c5fd" }}
          />
        ),
      },
      { field: "gender", headerName: "Gender", width: 120 },
      {
        field: "dob",
        headerName: "DOB",
        width: 140,
        valueGetter: (p) => p.value,
        renderCell: (p) => formatDOB(p.value),
        sortComparator: (a, b) => String(a ?? "").localeCompare(String(b ?? "")),
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        sortable: false,
        filterable: false,
        renderCell: (p) => statusChip(p.row),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 110,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        headerAlign: "center",
        align: "center",
        pinnable: true,
        renderCell: (params) => (
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
        ),
      },
    ],
    [navigate]
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          component="h4"
          sx={{ color: "#fff", fontSize: 24, fontWeight: 600 }}
        >
          Users
        </Typography>
      </Box>

      <DataGrid
        rows={rows}
        getRowId={(row) => row.id ?? row._id}
        columns={columns}
        loading={isLoading}
        disableRowSelectionOnClick
        checkboxSelection
        autoHeight
        pagination
        pageSizeOptions={[10, 12, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize } },
          columns: { columnVisibilityModel: { ar_firstName: false, ar_lastName: false } },
          density: "comfortable",
          pinnedColumns: { right: ["actions"] },
        }}
        onPaginationModelChange={(m) => setPageSize(m.pageSize)}
        // Toolbar & overlays
        slots={{
          toolbar: UsersToolbar,
          loadingOverlay: LoadingOverlay,
          noRowsOverlay: NoRows,
        }}
        slotProps={{
          toolbar: {
            onRefresh: () => {
              // prefer refetch if your hook supports it; fallback to key bump
              if (typeof refetch === "function") refetch();
              else setRefreshKey((k) => k + 1);
            },
          },
        }}
        // Styling & UX
        sx={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(17, 24, 39, 0.5)",
          "--DataGrid-containerBackground": "transparent",
          "--DataGrid-rowBorderColor": "rgba(255,255,255,0.06)",
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
        }}
        getRowClassName={(params) =>
          ((params.row.isActive ?? params.row.status) === "active"
            ? ""
            : "blocked") 
        }
      />

      {/* Error state under grid, if any */}
      {isError && (
        <ErrorOverlay error={error?.message || "Unknown error"} />
      )}
    </Box>
  );
}
