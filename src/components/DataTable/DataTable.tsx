import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { MagnifyingGlass, ArrowsClockwise } from '@phosphor-icons/react';
import { DataGrid, type GridColDef, type GridRowsProp } from '@mui/x-data-grid';
import { useThemeStore } from '@/store/themeStore';

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
  const { config } = useThemeStore();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Box>
      {/* Title above table */}
      {title && (
        <Typography
          variant="overline"
          sx={{
            color: config.colors.textSecondary,
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            display: 'block',
            mb: 1.5,
          }}
        >
          {title}
        </Typography>
      )}
      {/* Search and actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 2,
          gap: 1,
        }}
      >
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
                  <MagnifyingGlass size={18} color={config.colors.textSecondary} />
                </InputAdornment>
              ),
            }}
          />
        )}
        {showRefresh && (
          <Button
            variant="outlined"
            startIcon={<ArrowsClockwise size={16} />}
            onClick={onRefresh}
            size="small"
          >
            Refresh
          </Button>
        )}
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
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: config.colors.bgSecondary,
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: config.colors.textSecondary,
          },
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: onRowClick ? 'pointer' : 'default',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          },
        }}
      />
    </Box>
  );
}
