import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';

export interface DataTableProps {
  title?: string;
  columns: GridColDef[];
  rows: GridRowsProp;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  showSearch?: boolean;
  showRefresh?: boolean;
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (params: { row: unknown }) => void;
}

export function DataTable({
  title,
  columns,
  rows,
  searchPlaceholder = 'Search...',
  onSearch,
  onRefresh,
  showSearch = true,
  showRefresh = true,
  loading = false,
  pageSize = 10,
  onRowClick,
}: DataTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    pageSize,
    page: 0,
  });

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        {title && (
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {showSearch && (
            <TextField
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {showRefresh && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
        </Box>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50, 100]}
        onRowClick={onRowClick}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
          },
        }}
      />
    </Box>
  );
}
