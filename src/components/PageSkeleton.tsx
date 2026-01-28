import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface PageSkeletonProps {
  variant?: 'home' | 'list' | 'grid' | 'detail';
}

export function PageSkeleton({ variant = 'list' }: PageSkeletonProps) {
  if (variant === 'home') {
    return (
      <Box>
        {/* Header skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={280} height={36} />
          <Skeleton variant="text" width={200} height={20} sx={{ mt: 0.5 }} />
        </Box>

        {/* Stats row skeleton */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width={80} height={14} />
                      <Skeleton variant="text" width={60} height={28} sx={{ mt: 0.5 }} />
                      <Skeleton variant="text" width={50} height={14} sx={{ mt: 0.5 }} />
                    </Box>
                    <Skeleton variant="rounded" width={36} height={36} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Content cards skeleton */}
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Skeleton variant="text" width={140} height={24} />
                  <Skeleton variant="rounded" width={120} height={32} />
                </Box>
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                    <Skeleton variant="rounded" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="30%" height={14} />
                    </Box>
                    <Skeleton variant="rounded" width={60} height={22} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
                {[1, 2, 3].map((i) => (
                  <Box key={i} sx={{ py: 1 }}>
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="50%" height={14} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (variant === 'grid') {
    return (
      <Box>
        {/* Header skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Skeleton variant="text" width={180} height={36} />
          <Skeleton variant="rounded" width={140} height={36} />
        </Box>

        {/* Filters skeleton */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" width={240} height={36} />
          <Skeleton variant="rounded" width={200} height={36} />
        </Box>

        {/* Grid skeleton */}
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={120} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={14} sx={{ mt: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={14} sx={{ mt: 0.5 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (variant === 'detail') {
    return (
      <Box>
        {/* Header skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={36} />
          <Skeleton variant="text" width={180} height={20} sx={{ mt: 0.5 }} />
        </Box>

        {/* Content skeleton */}
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
            <Skeleton variant="text" width="95%" height={20} />
            <Skeleton variant="text" width="70%" height={20} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Default: list variant
  return (
    <Box>
      {/* Header skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Skeleton variant="text" width={180} height={36} />
        <Skeleton variant="rounded" width={140} height={36} />
      </Box>

      {/* List skeleton */}
      <Card>
        <CardContent>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                borderBottom: i < 5 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="rounded" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="25%" height={14} />
              </Box>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="circular" width={28} height={28} />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
}

// Card skeleton for individual use
export function CardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={120} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="60%" height={14} sx={{ mt: 0.5 }} />
      </CardContent>
    </Card>
  );
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={80} height={14} />
            <Skeleton variant="text" width={60} height={28} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rounded" width={36} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === 0 ? '30%' : `${60 / (columns - 1)}%`}
          height={20}
        />
      ))}
    </Box>
  );
}
